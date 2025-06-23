import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import {
  Search,
  User,
  Phone,
  MapPin,
  Crown,
  Star,
  Users,
  TrendingUp,
  Calendar,
  Filter,
  ArrowUpDown,
} from "lucide-react";

const AdminCustomers = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [sortBy, setSortBy] = useState("totalSpent");

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ["admin-customers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select(
          `
          customer_name,
          customer_email,
          customer_phone,
          customer_address,
          total_amount,
          status,
          order_date,
          created_at
        `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Agrupar por cliente
      const customerMap = new Map();

      data.forEach((order) => {
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
            deliveredOrders: 0,
            firstOrder: order.order_date,
          });
        }

        const customer = customerMap.get(key);
        customer.totalOrders += 1;
        customer.totalSpent += Number(order.total_amount);

        if (order.status === "delivered") {
          customer.deliveredOrders += 1;
        }

        if (new Date(order.order_date) > new Date(customer.lastOrder)) {
          customer.lastOrder = order.order_date;
        }

        if (new Date(order.order_date) < new Date(customer.firstOrder)) {
          customer.firstOrder = order.order_date;
        }
      });

      return Array.from(customerMap.values()).sort(
        (a, b) => b.totalSpent - a.totalSpent
      );
    },
  });

  const getCustomerType = (totalSpent) => {
    if (totalSpent >= 500)
      return {
        label: "VIP",
        color: "bg-gradient-to-r from-purple-500 to-purple-600 text-white",
        icon: Crown,
      };
    if (totalSpent >= 200)
      return {
        label: "Fiel",
        color: "bg-gradient-to-r from-amber-500 to-yellow-500 text-white",
        icon: Star,
      };
    if (totalSpent >= 100)
      return {
        label: "Regular",
        color: "bg-gradient-to-r from-blue-500 to-blue-600 text-white",
        icon: User,
      };
    return {
      label: "Novo",
      color: "bg-gradient-to-r from-slate-500 to-slate-600 text-white",
      icon: User,
    };
  };

  const filteredAndSortedCustomers = customers
    .filter((customer) => {
      const matchesSearch =
        customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone.includes(searchTerm) ||
        (customer.email &&
          customer.email.toLowerCase().includes(searchTerm.toLowerCase()));

      if (filterType === "all") return matchesSearch;

      const customerType = getCustomerType(customer.totalSpent);
      return matchesSearch && customerType.label.toLowerCase() === filterType;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "totalOrders":
          return b.totalOrders - a.totalOrders;
        case "lastOrder":
          return (
            new Date(b.lastOrder).getTime() - new Date(a.lastOrder).getTime()
          );
        default:
          return b.totalSpent - a.totalSpent;
      }
    });

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    });
  };

  const getCustomerStats = () => {
    const total = customers.length;
    const vip = customers.filter((c) => c.totalSpent >= 500).length;
    const averageTicket =
      total > 0
        ? customers.reduce((sum, c) => sum + c.totalSpent, 0) /
          customers.reduce((sum, c) => sum + c.totalOrders, 0)
        : 0;
    const retention =
      total > 0
        ? (customers.filter((c) => c.totalOrders > 1).length / total) * 100
        : 0;

    return { total, vip, averageTicket, retention };
  };

  const stats = getCustomerStats();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Carregando clientes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Gestão de Clientes
            </h1>
            <p className="text-slate-600">
              Acompanhe e gerencie sua base de clientes
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Buscar cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full sm:w-64 bg-white border-slate-200 shadow-sm"
              />
            </div>

            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-40 bg-white border-slate-200 shadow-sm">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="vip">VIP</SelectItem>
                <SelectItem value="fiel">Fiéis</SelectItem>
                <SelectItem value="regular">Regulares</SelectItem>
                <SelectItem value="novo">Novos</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full sm:w-40 bg-white border-slate-200 shadow-sm">
                <ArrowUpDown className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="totalSpent">Valor Gasto</SelectItem>
                <SelectItem value="totalOrders">Nº Pedidos</SelectItem>
                <SelectItem value="name">Nome</SelectItem>
                <SelectItem value="lastOrder">Último Pedido</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Estatísticas dos Clientes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-700">
                Total de Clientes
              </CardTitle>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">
                {stats.total}
              </div>
              <p className="text-xs text-blue-600 mt-1">
                Base de clientes ativa
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-700">
                Clientes VIP
              </CardTitle>
              <div className="p-2 bg-purple-100 rounded-lg">
                <Crown className="h-5 w-5 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900">
                {stats.vip}
              </div>
              <p className="text-xs text-purple-600 mt-1">
                {stats.total > 0
                  ? ((stats.vip / stats.total) * 100).toFixed(1)
                  : 0}
                % da base
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-700">
                Ticket Médio
              </CardTitle>
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900">
                {formatCurrency(stats.averageTicket)}
              </div>
              <p className="text-xs text-green-600 mt-1">
                Por pedido realizado
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-700">
                Taxa de Fidelização
              </CardTitle>
              <div className="p-2 bg-orange-100 rounded-lg">
                <Star className="h-5 w-5 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-900">
                {stats.retention.toFixed(1)}%
              </div>
              <p className="text-xs text-orange-600 mt-1">
                Clientes recorrentes
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Clientes */}
        <Card className="shadow-lg border-slate-200">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl text-slate-800 flex items-center gap-2">
                <Users className="h-5 w-5 text-slate-600" />
                Lista de Clientes ({filteredAndSortedCustomers.length})
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="font-semibold text-slate-700">
                      Cliente
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700">
                      Contato
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700">
                      Endereço
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700">
                      Pedidos
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700">
                      Total Gasto
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700">
                      Última Compra
                    </TableHead>
                    <TableHead className="font-semibold text-slate-700">
                      Classificação
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedCustomers.map((customer, index) => {
                    const customerType = getCustomerType(customer.totalSpent);
                    const IconComponent = customerType.icon;

                    return (
                      <TableRow
                        key={index}
                        className="hover:bg-slate-50 transition-colors duration-200 border-b border-slate-100"
                      >
                        <TableCell className="py-4">
                          <div className="space-y-1">
                            <div className="font-semibold text-slate-800">
                              {customer.name}
                            </div>
                            {customer.email && (
                              <div className="text-sm text-slate-500">
                                {customer.email}
                              </div>
                            )}
                          </div>
                        </TableCell>

                        <TableCell className="py-4">
                          <div className="flex items-center gap-2 text-slate-700">
                            <Phone className="h-4 w-4 text-slate-500" />
                            <span className="font-medium">
                              {customer.phone}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell className="py-4 max-w-xs">
                          {customer.address ? (
                            <div className="flex items-start gap-2">
                              <MapPin className="h-4 w-4 text-slate-500 mt-0.5 flex-shrink-0" />
                              <span className="text-sm text-slate-700 break-words">
                                {customer.address}
                              </span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-orange-400 rounded-full" />
                              <span className="text-sm text-slate-500 italic">
                                Retirada no local
                              </span>
                            </div>
                          )}
                        </TableCell>

                        <TableCell className="py-4">
                          <div className="space-y-1">
                            <div className="font-semibold text-slate-800">
                              {customer.totalOrders}
                            </div>
                            <div className="text-xs text-slate-500">
                              {customer.deliveredOrders} entregues
                            </div>
                          </div>
                        </TableCell>

                        <TableCell className="py-4">
                          <div className="font-bold text-green-700">
                            {formatCurrency(customer.totalSpent)}
                          </div>
                          <div className="text-xs text-slate-500">
                            Média:{" "}
                            {formatCurrency(
                              customer.totalSpent / customer.totalOrders
                            )}
                          </div>
                        </TableCell>

                        <TableCell className="py-4">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-slate-500" />
                            <span className="text-sm font-medium text-slate-700">
                              {formatDate(customer.lastOrder)}
                            </span>
                          </div>
                        </TableCell>

                        <TableCell className="py-4">
                          <Badge
                            className={`${customerType.color} border-0 shadow-sm`}
                          >
                            <IconComponent className="h-3 w-3 mr-1" />
                            {customerType.label}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {filteredAndSortedCustomers.length === 0 && (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500 text-lg">
                    Nenhum cliente encontrado
                  </p>
                  <p className="text-slate-400 text-sm">
                    Tente ajustar os filtros de busca
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminCustomers;
