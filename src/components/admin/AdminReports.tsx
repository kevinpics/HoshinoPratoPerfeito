import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import {
  Calendar,
  TrendingUp,
  Package,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
} from "lucide-react";

const AdminReports = () => {
  const [dateRange, setDateRange] = useState("7");

  const { data: salesData } = useQuery({
    queryKey: ["sales-report", dateRange],
    queryFn: async () => {
      const days = parseInt(dateRange);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from("orders")
        .select("order_date, total_amount, status")
        .gte("order_date", startDate.toISOString().split("T")[0])
        .eq("status", "delivered");

      if (error) throw error;

      // Agrupar por data
      const groupedData = data.reduce((acc, order) => {
        const date = order.order_date;
        if (!acc[date]) {
          acc[date] = { date, revenue: 0, orders: 0 };
        }
        acc[date].revenue += Number(order.total_amount);
        acc[date].orders += 1;
        return acc;
      }, {});

      return Object.values(groupedData).sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
    },
  });

  const { data: productStats } = useQuery({
    queryKey: ["product-stats", dateRange],
    queryFn: async () => {
      const days = parseInt(dateRange);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data, error } = await supabase
        .from("order_items")
        .select(
          `
          product_name,
          quantity,
          order_id,
          orders!inner(order_date, status)
        `
        )
        .gte("orders.order_date", startDate.toISOString().split("T")[0])
        .eq("orders.status", "delivered");

      if (error) throw error;

      // Agrupar por produto
      const productData = data.reduce((acc, item) => {
        const productName = item.product_name;
        if (!acc[productName]) {
          acc[productName] = { name: productName, quantity: 0, orders: 0 };
        }
        acc[productName].quantity += item.quantity;
        acc[productName].orders += 1;
        return acc;
      }, {});

      return Object.values(productData)
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 10);
    },
  });

  const { data: overview } = useQuery({
    queryKey: ["overview-stats", dateRange],
    queryFn: async () => {
      const days = parseInt(dateRange);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data: orders } = await supabase
        .from("orders")
        .select("total_amount, status, order_date")
        .gte("order_date", startDate.toISOString().split("T")[0]);

      const totalRevenue =
        orders
          ?.filter((o) => o.status === "delivered")
          .reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;

      const totalOrders = orders?.length || 0;
      const completedOrders =
        orders?.filter((o) => o.status === "delivered").length || 0;
      const averageOrderValue =
        completedOrders > 0 ? totalRevenue / completedOrders : 0;

      return {
        totalRevenue,
        totalOrders,
        completedOrders,
        averageOrderValue,
      };
    },
  });

  const COLORS = [
    "#F59E0B",
    "#EF4444",
    "#10B981",
    "#3B82F6",
    "#8B5CF6",
    "#F97316",
    "#84CC16",
    "#06B6D4",
    "#EC4899",
    "#6366F1",
  ];

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
    });
  };

  // Calcular crescimento (mock - em produção você calcularia com dados históricos)
  const mockGrowth = {
    revenue: 12.5,
    orders: 8.3,
    completed: 15.2,
    average: -2.1,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">
              Dashboard de Relatórios
            </h1>
            <p className="text-slate-600">
              Acompanhe o desempenho das suas vendas em tempo real
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Activity className="h-5 w-5 text-slate-600" />
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-48 bg-white border-slate-200 shadow-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Últimos 7 dias</SelectItem>
                <SelectItem value="30">Últimos 30 dias</SelectItem>
                <SelectItem value="90">Últimos 90 dias</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Cards de Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-700">
                Receita Total
              </CardTitle>
              <div className="p-2 bg-green-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-900">
                {formatCurrency(overview?.totalRevenue || 0)}
              </div>
              <div className="flex items-center mt-2 text-sm">
                <ArrowUpRight className="h-4 w-4 text-green-600 mr-1" />
                <span className="text-green-600 font-medium">
                  +{mockGrowth.revenue}%
                </span>
                <span className="text-slate-500 ml-2">vs período anterior</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-700">
                Total de Pedidos
              </CardTitle>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="h-5 w-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-900">
                {overview?.totalOrders || 0}
              </div>
              <div className="flex items-center mt-2 text-sm">
                <ArrowUpRight className="h-4 w-4 text-blue-600 mr-1" />
                <span className="text-blue-600 font-medium">
                  +{mockGrowth.orders}%
                </span>
                <span className="text-slate-500 ml-2">vs período anterior</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-orange-700">
                Pedidos Concluídos
              </CardTitle>
              <div className="p-2 bg-orange-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-900">
                {overview?.completedOrders || 0}
              </div>
              <div className="flex items-center mt-2 text-sm">
                <ArrowUpRight className="h-4 w-4 text-orange-600 mr-1" />
                <span className="text-orange-600 font-medium">
                  +{mockGrowth.completed}%
                </span>
                <span className="text-slate-500 ml-2">vs período anterior</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-700">
                Ticket Médio
              </CardTitle>
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-900">
                {formatCurrency(overview?.averageOrderValue || 0)}
              </div>
              <div className="flex items-center mt-2 text-sm">
                <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
                <span className="text-red-500 font-medium">
                  {mockGrowth.average}%
                </span>
                <span className="text-slate-500 ml-2">vs período anterior</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs com gráficos */}
        <Tabs defaultValue="sales" className="space-y-6">
          <TabsList className="bg-white border border-slate-200 shadow-sm p-1">
            <TabsTrigger
              value="sales"
              className="data-[state=active]:bg-blue-500 data-[state=active]:text-white transition-all duration-200"
            >
              📈 Vendas por Dia
            </TabsTrigger>
            <TabsTrigger
              value="products"
              className="data-[state=active]:bg-blue-500 data-[state=active]:text-white transition-all duration-200"
            >
              🏆 Produtos Mais Vendidos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sales" className="space-y-6">
            <Card className="shadow-lg border-slate-200">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-200">
                <CardTitle className="text-xl text-slate-800 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                  Evolução das Vendas Diárias
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart
                    data={salesData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <defs>
                      <linearGradient
                        id="barGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="0%"
                          stopColor="#3B82F6"
                          stopOpacity={0.8}
                        />
                        <stop
                          offset="100%"
                          stopColor="#1E40AF"
                          stopOpacity={0.6}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis
                      dataKey="date"
                      tickFormatter={formatDate}
                      stroke="#64748B"
                      fontSize={12}
                    />
                    <YAxis
                      tickFormatter={(value) => formatCurrency(value)}
                      stroke="#64748B"
                      fontSize={12}
                    />
                    <Tooltip
                      formatter={(value) => [
                        formatCurrency(Number(value)),
                        "Receita",
                      ]}
                      labelFormatter={(label) => `Data: ${formatDate(label)}`}
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #E2E8F0",
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                      }}
                    />
                    <Bar
                      dataKey="revenue"
                      fill="url(#barGradient)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              <Card className="shadow-lg border-slate-200">
                <CardHeader className="bg-gradient-to-r from-orange-50 to-amber-50 border-b border-slate-200">
                  <CardTitle className="text-xl text-slate-800 flex items-center gap-2">
                    <Package className="h-5 w-5 text-orange-600" />
                    Distribuição por Produto
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                      <defs>
                        {COLORS.map((color, index) => (
                          <linearGradient
                            key={index}
                            id={`pieGradient${index}`}
                            x1="0"
                            y1="0"
                            x2="1"
                            y2="1"
                          >
                            <stop
                              offset="0%"
                              stopColor={color}
                              stopOpacity={0.8}
                            />
                            <stop
                              offset="100%"
                              stopColor={color}
                              stopOpacity={0.6}
                            />
                          </linearGradient>
                        ))}
                      </defs>
                      <Pie
                        data={productStats}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) =>
                          `${name} (${(percent * 100).toFixed(0)}%)`
                        }
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="quantity"
                      >
                        {productStats?.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={`url(#pieGradient${index % COLORS.length})`}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value, name) => [
                          `${value} unidades`,
                          "Vendidos",
                        ]}
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #E2E8F0",
                          borderRadius: "8px",
                          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-slate-200">
                <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-slate-200">
                  <CardTitle className="text-xl text-slate-800 flex items-center gap-2">
                    🏆 Ranking de Produtos
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {productStats?.map((product, index) => (
                      <div
                        key={product.name}
                        className="flex justify-between items-center p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors duration-200"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white border-2 font-bold text-sm text-slate-700">
                            #{index + 1}
                          </div>
                          <div
                            className="w-4 h-4 rounded-full shadow-sm"
                            style={{
                              backgroundColor: COLORS[index % COLORS.length],
                            }}
                          />
                          <div>
                            <span className="font-semibold text-slate-800">
                              {product.name}
                            </span>
                            <div className="text-xs text-slate-500">
                              {product.orders} pedidos
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-slate-800">
                            {product.quantity}
                          </div>
                          <div className="text-xs text-slate-500">unidades</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminReports;
