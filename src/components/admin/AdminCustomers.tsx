
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { Search, User, Phone, MapPin } from 'lucide-react';

const AdminCustomers = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ['admin-customers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          customer_name,
          customer_email,
          customer_phone,
          customer_address,
          total_amount,
          status,
          order_date,
          created_at
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Agrupar por cliente
      const customerMap = new Map();
      
      data.forEach(order => {
        const key = `${order.customer_name}_${order.customer_phone}`;
        
        if (!customerMap.has(key)) {
          customerMap.set(key, {
            name: order.customer_name,
            email: order.customer_email,
            phone: order.customer_phone,
            address: order.customer_address,
            totalOrders: 0,
            totalSpent: 0,
            lastOrder: order.order_date,
            deliveredOrders: 0
          });
        }
        
        const customer = customerMap.get(key);
        customer.totalOrders += 1;
        customer.totalSpent += Number(order.total_amount);
        
        if (order.status === 'delivered') {
          customer.deliveredOrders += 1;
        }
        
        if (new Date(order.order_date) > new Date(customer.lastOrder)) {
          customer.lastOrder = order.order_date;
        }
      });

      return Array.from(customerMap.values())
        .sort((a, b) => b.totalSpent - a.totalSpent);
    }
  });

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm) ||
    (customer.email && customer.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getCustomerType = (totalSpent: number) => {
    if (totalSpent >= 500) return { label: 'VIP', color: 'bg-purple-500' };
    if (totalSpent >= 200) return { label: 'Fiel', color: 'bg-gold-500' };
    if (totalSpent >= 100) return { label: 'Regular', color: 'bg-blue-500' };
    return { label: 'Novo', color: 'bg-gray-500' };
  };

  if (isLoading) {
    return <div className="text-center py-8">Carregando clientes...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Cadastro de Clientes</h2>
        <div className="relative w-64">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Estatísticas dos Clientes */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
            <User className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customers.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes VIP</CardTitle>
            <User className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {customers.filter(c => c.totalSpent >= 500).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
            <User className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {customers.length > 0 ? 
                (customers.reduce((sum, c) => sum + c.totalSpent, 0) / customers.reduce((sum, c) => sum + c.totalOrders, 0)).toFixed(2) 
                : '0,00'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fidelização</CardTitle>
            <User className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {customers.length > 0 ? 
                Math.round((customers.filter(c => c.totalOrders > 1).length / customers.length) * 100) 
                : 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Clientes</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Endereço</TableHead>
                <TableHead>Pedidos</TableHead>
                <TableHead>Total Gasto</TableHead>
                <TableHead>Último Pedido</TableHead>
                <TableHead>Tipo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((customer, index) => {
                const customerType = getCustomerType(customer.totalSpent);
                return (
                  <TableRow key={index}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{customer.name}</div>
                        {customer.email && (
                          <div className="text-sm text-gray-500">{customer.email}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        {customer.phone}
                      </div>
                    </TableCell>
                    <TableCell>
                      {customer.address ? (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span className="text-sm">{customer.address}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">Retirada</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{customer.totalOrders}</div>
                        <div className="text-sm text-gray-500">
                          {customer.deliveredOrders} entregues
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold">
                        R$ {customer.totalSpent.toFixed(2)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {new Date(customer.lastOrder).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      <Badge className={customerType.color}>
                        {customerType.label}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCustomers;
