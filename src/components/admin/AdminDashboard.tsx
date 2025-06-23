
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Package, ShoppingCart, Users } from 'lucide-react';

const AdminDashboard = () => {
  const { data: stats } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      
      // Vendas de hoje
      const { data: todayOrders } = await supabase
        .from('orders')
        .select('total_amount')
        .eq('order_date', today);

      // Total de produtos
      const { data: products } = await supabase
        .from('products')
        .select('id', { count: 'exact' });

      // Pedidos pendentes
      const { data: pendingOrders } = await supabase
        .from('orders')
        .select('id', { count: 'exact' })
        .in('status', ['received', 'preparing']);

      // Total de pedidos hoje
      const { data: todayOrdersCount } = await supabase
        .from('orders')
        .select('id', { count: 'exact' })
        .eq('order_date', today);

      const todayRevenue = todayOrders?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;

      return {
        todayRevenue,
        totalProducts: products?.length || 0,
        pendingOrders: pendingOrders?.length || 0,
        todayOrders: todayOrdersCount?.length || 0
      };
    }
  });

  const statCards = [
    {
      title: 'Vendas Hoje',
      value: `R$ ${stats?.todayRevenue.toFixed(2) || '0,00'}`,
      icon: DollarSign,
      color: 'text-green-600'
    },
    {
      title: 'Produtos Cadastrados',
      value: stats?.totalProducts || 0,
      icon: Package,
      color: 'text-blue-600'
    },
    {
      title: 'Pedidos Pendentes',
      value: stats?.pendingOrders || 0,
      icon: ShoppingCart,
      color: 'text-orange-600'
    },
    {
      title: 'Pedidos Hoje',
      value: stats?.todayOrders || 0,
      icon: Users,
      color: 'text-purple-600'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Visão Geral</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <p className="mb-4">🍗 Bem-vindo ao painel administrativo do Hoshino!</p>
            <p>Use as abas acima para gerenciar produtos e pedidos.</p>
            <p className="mt-2 text-sm">
              💡 Lembre-se: Atendemos apenas aos domingos. Pedidos durante a semana são reservas.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
