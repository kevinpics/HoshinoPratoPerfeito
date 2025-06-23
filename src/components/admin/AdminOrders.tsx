
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const AdminOrders = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['admin-orders'],
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
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const { error } = await supabase
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
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
      ready: 'bg-green-500',
      delivered: 'bg-gray-500',
      cancelled: 'bg-red-500'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-500';
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      received: 'Recebido',
      preparing: 'Preparando',
      ready: 'Pronto',
      delivered: 'Entregue',
      cancelled: 'Cancelado'
    };
    return labels[status as keyof typeof labels] || status;
  };

  if (isLoading) {
    return <div className="text-center py-8">Carregando pedidos...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Gerenciar Pedidos</h2>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Pedidos</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Itens</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Entrega</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">
                        {new Date(order.order_date).toLocaleDateString('pt-BR')}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(order.created_at).toLocaleTimeString('pt-BR')}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{order.customer_name}</div>
                      <div className="text-sm text-gray-500">{order.customer_phone}</div>
                      {order.customer_email && (
                        <div className="text-sm text-gray-500">{order.customer_email}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {order.order_items?.map((item: any, index: number) => (
                        <div key={item.id}>
                          {item.quantity}x {item.product_name}
                          {index < order.order_items.length - 1 && ', '}
                        </div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold">
                      R$ {Number(order.total_amount).toFixed(2)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {order.delivery_type === 'delivery' ? 'Entrega' : 'Retirada'}
                    </Badge>
                    {order.customer_address && (
                      <div className="text-sm text-gray-500 mt-1">
                        {order.customer_address}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(order.status)}>
                      {getStatusLabel(order.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={order.status}
                      onValueChange={(status) => updateStatusMutation.mutate({
                        id: order.id,
                        status
                      })}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="received">Recebido</SelectItem>
                        <SelectItem value="preparing">Preparando</SelectItem>
                        <SelectItem value="ready">Pronto</SelectItem>
                        <SelectItem value="delivered">Entregue</SelectItem>
                        <SelectItem value="cancelled">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminOrders;
