
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, Phone } from 'lucide-react';

const OrderHistory = () => {
  const { user } = useAuth();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['user-orders', user?.id],
    queryFn: async () => {
      if (!user) return [];

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
        .eq('customer_email', user.email)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user
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

  if (!user) {
    return (
      <div className="text-center py-8">
        <p>Faça login para ver seu histórico de pedidos.</p>
      </div>
    );
  }

  if (isLoading) {
    return <div className="text-center py-8">Carregando histórico...</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Histórico de Pedidos</h2>
      
      {orders.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">Você ainda não fez nenhum pedido.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">
                    Pedido #{order.id.slice(-8)}
                  </CardTitle>
                  <Badge className={getStatusColor(order.status)}>
                    {getStatusLabel(order.status)}
                  </Badge>
                </div>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{new Date(order.created_at).toLocaleString('pt-BR')}</span>
                  </div>
                  {order.customer_address && (
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4" />
                      <span>Delivery</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-1">
                    <Phone className="h-4 w-4" />
                    <span>{order.customer_phone}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  {order.order_items?.map((item: any) => (
                    <div key={item.id} className="flex justify-between">
                      <span>{item.quantity}x {item.product_name}</span>
                      <span>R$ {(item.product_price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                
                <div className="border-t pt-2">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total:</span>
                    <span className="font-semibold text-orange-600">
                      R$ {Number(order.total_amount).toFixed(2)}
                    </span>
                  </div>
                  
                  {order.discount_amount > 0 && (
                    <div className="flex justify-between items-center text-green-600">
                      <span>Desconto ({order.coupon_code}):</span>
                      <span>- R$ {Number(order.discount_amount).toFixed(2)}</span>
                    </div>
                  )}
                  
                  {order.delivery_fee > 0 && (
                    <div className="flex justify-between items-center text-gray-600">
                      <span>Taxa de entrega:</span>
                      <span>R$ {Number(order.delivery_fee).toFixed(2)}</span>
                    </div>
                  )}
                </div>

                {order.notes && (
                  <div className="mt-4 p-2 bg-gray-50 rounded">
                    <p className="text-sm text-gray-700">
                      <strong>Observações:</strong> {order.notes}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
