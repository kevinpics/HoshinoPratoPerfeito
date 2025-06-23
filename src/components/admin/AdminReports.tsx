
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Calendar, TrendingUp, Package, DollarSign } from 'lucide-react';

const AdminReports = () => {
  const [dateRange, setDateRange] = useState('7');
  
  const { data: salesData } = useQuery({
    queryKey: ['sales-report', dateRange],
    queryFn: async () => {
      const days = parseInt(dateRange);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const { data, error } = await supabase
        .from('orders')
        .select('order_date, total_amount, status')
        .gte('order_date', startDate.toISOString().split('T')[0])
        .eq('status', 'delivered');

      if (error) throw error;

      // Agrupar por data
      const groupedData = data.reduce((acc: any, order) => {
        const date = order.order_date;
        if (!acc[date]) {
          acc[date] = { date, revenue: 0, orders: 0 };
        }
        acc[date].revenue += Number(order.total_amount);
        acc[date].orders += 1;
        return acc;
      }, {});

      return Object.values(groupedData).sort((a: any, b: any) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
    }
  });

  const { data: productStats } = useQuery({
    queryKey: ['product-stats', dateRange],
    queryFn: async () => {
      const days = parseInt(dateRange);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const { data, error } = await supabase
        .from('order_items')
        .select(`
          product_name,
          quantity,
          order_id,
          orders!inner(order_date, status)
        `)
        .gte('orders.order_date', startDate.toISOString().split('T')[0])
        .eq('orders.status', 'delivered');

      if (error) throw error;

      // Agrupar por produto
      const productData = data.reduce((acc: any, item) => {
        const productName = item.product_name;
        if (!acc[productName]) {
          acc[productName] = { name: productName, quantity: 0, orders: 0 };
        }
        acc[productName].quantity += item.quantity;
        acc[productName].orders += 1;
        return acc;
      }, {});

      return Object.values(productData)
        .sort((a: any, b: any) => b.quantity - a.quantity)
        .slice(0, 10);
    }
  });

  const { data: overview } = useQuery({
    queryKey: ['overview-stats', dateRange],
    queryFn: async () => {
      const days = parseInt(dateRange);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const { data: orders } = await supabase
        .from('orders')
        .select('total_amount, status, order_date')
        .gte('order_date', startDate.toISOString().split('T')[0]);

      const totalRevenue = orders
        ?.filter(o => o.status === 'delivered')
        .reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;

      const totalOrders = orders?.length || 0;
      const completedOrders = orders?.filter(o => o.status === 'delivered').length || 0;
      const averageOrderValue = completedOrders > 0 ? totalRevenue / completedOrders : 0;

      return {
        totalRevenue,
        totalOrders,
        completedOrders,
        averageOrderValue
      };
    }
  });

  const COLORS = ['#F97316', '#EAB308', '#22C55E', '#3B82F6', '#8B5CF6'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Relatórios</h2>
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Últimos 7 dias</SelectItem>
            <SelectItem value="30">Últimos 30 dias</SelectItem>
            <SelectItem value="90">Últimos 90 dias</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Cards de Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receita Total</CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {overview?.totalRevenue.toFixed(2) || '0,00'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Pedidos</CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview?.totalOrders || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pedidos Concluídos</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview?.completedOrders || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
            <Calendar className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {overview?.averageOrderValue.toFixed(2) || '0,00'}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="sales" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sales">Vendas por Dia</TabsTrigger>
          <TabsTrigger value="products">Produtos Mais Vendidos</TabsTrigger>
        </TabsList>

        <TabsContent value="sales" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Vendas Diárias</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`R$ ${Number(value).toFixed(2)}`, 'Receita']} />
                  <Bar dataKey="revenue" fill="#F97316" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Produtos Mais Vendidos</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={productStats}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="quantity"
                    >
                      {productStats?.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ranking de Produtos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {productStats?.map((product: any, index) => (
                    <div key={product.name} className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="font-medium">{product.name}</span>
                      </div>
                      <span className="text-sm text-gray-600">
                        {product.quantity} vendidos
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminReports;
