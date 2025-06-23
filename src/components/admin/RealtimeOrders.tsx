
import { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, User, MapPin, Phone } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const RealtimeOrders = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);

  const { data: activeOrders = [] } = useQuery({
    queryKey: ['realtime-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            product_name,
            quantity,
            product_price,
            extras
          )
        `)
        .in('status', ['received', 'preparing', 'ready'])
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data;
    },
    refetchInterval: 5000 // Atualiza a cada 5 segundos
  });

  useEffect(() => {
    const channel = supabase
      .channel('orders-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['realtime-orders'] });
          queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
          queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: 'Status atualizado',
        description: 'Status do pedido alterado com sucesso!'
      });
    }
  });

  const getStatusColor = (status: string) => {
    const colors = {
      received: 'bg-blue-500',
      preparing: 'bg-yellow-500',
      ready: 'bg-green-500'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-500';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      received: 'Recebido',
      preparing: 'Preparando',
      ready: 'Pronto'
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getTimeSinceOrder = (createdAt: string) => {
    const now = new Date();
    const orderTime = new Date(createdAt);
    const diffMinutes = Math.floor((now.getTime() - orderTime.getTime()) / 60000);
    
    if (diffMinutes < 60) {
      return `${diffMinutes}m`;
    } else {
      const hours = Math.floor(diffMinutes / 60);
      const minutes = diffMinutes % 60;
      return `${hours}h ${minutes}m`;
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Pedidos em Tempo Real</h3>
      
      <div className="grid gap-4">
        {activeOrders.map((order) => (
          <Card key={order.id} className="border-l-4 border-l-orange-500">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(order.status)}>
                    {getStatusLabel(order.status)}
                  </Badge>
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Clock className="h-4 w-4" />
                    {getTimeSinceOrder(order.created_at)}
                  </div>
                </div>
                <div className="text-lg font-bold">
                  R$ {Number(order.total_amount).toFixed(2)}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4" />
                <span>{order.customer_name}</span>
                <Phone className="h-4 w-4 ml-2" />
                <span>{order.customer_phone}</span>
              </div>

              {order.customer_address && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4" />
                  <span className="text-gray-600">{order.customer_address}</span>
                </div>
              )}

              <div className="space-y-1">
                <div className="text-sm font-medium">Itens:</div>
                {order.order_items?.map((item: any) => (
                  <div key={item.id} className="text-sm text-gray-600">
                    {item.quantity}x {item.product_name}
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-2">
                {order.status === 'received' && (
                  <Button
                    size="sm"
                    onClick={() => updateStatusMutation.mutate({
                      id: order.id,
                      status: 'preparing'
                    })}
                    className="bg-yellow-500 hover:bg-yellow-600"
                  >
                    Iniciar Preparo
                  </Button>
                )}
                {order.status === 'preparing' && (
                  <Button
                    size="sm"
                    onClick={() => updateStatusMutation.mutate({
                      id: order.id,
                      status: 'ready'
                    })}
                    className="bg-green-500 hover:bg-green-600"
                  >
                    Marcar como Pronto
                  </Button>
                )}
                {order.status === 'ready' && (
                  <Button
                    size="sm"
                    onClick={() => updateStatusMutation.mutate({
                      id: order.id,
                      status: 'delivered'
                    })}
                    className="bg-gray-500 hover:bg-gray-600"
                  >
                    Entregar
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        
        {activeOrders.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>Nenhum pedido ativo no momento</p>
            <p className="text-sm">🎉 Todos os pedidos foram finalizados!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RealtimeOrders;
