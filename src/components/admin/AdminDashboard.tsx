import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DollarSign,
  Package,
  ShoppingCart,
  Users,
  TrendingUp,
  Clock,
  Calendar,
  Store,
} from "lucide-react";

const AdminDashboard = () => {
  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const today = new Date().toISOString().split("T")[0];

      // Vendas de hoje
      const { data: todayOrders } = await supabase
        .from("orders")
        .select("total_amount")
        .eq("order_date", today);

      // Total de produtos
      const { data: products } = await supabase
        .from("products")
        .select("id", { count: "exact" });

      // Pedidos pendentes
      const { data: pendingOrders } = await supabase
        .from("orders")
        .select("id", { count: "exact" })
        .in("status", ["received", "preparing"]);

      // Total de pedidos hoje
      const { data: todayOrdersCount } = await supabase
        .from("orders")
        .select("id", { count: "exact" })
        .eq("order_date", today);

      const todayRevenue =
        todayOrders?.reduce(
          (sum, order) => sum + Number(order.total_amount),
          0
        ) || 0;

      return {
        todayRevenue,
        totalProducts: products?.length || 0,
        pendingOrders: pendingOrders?.length || 0,
        todayOrders: todayOrdersCount?.length || 0,
      };
    },
  });

  const getCurrentDate = () => {
    return new Date().toLocaleDateString("pt-BR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const statCards = [
    {
      title: "Vendas Hoje",
      value: `R$ ${stats?.todayRevenue.toFixed(2).replace(".", ",") || "0,00"}`,
      icon: DollarSign,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
      iconBg: "bg-emerald-100",
      description: "Receita do dia atual",
      trend: "+12%",
    },
    {
      title: "Produtos Cadastrados",
      value: stats?.totalProducts || 0,
      icon: Package,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      iconBg: "bg-blue-100",
      description: "Total no cardápio",
      trend: "Estável",
    },
    {
      title: "Pedidos Pendentes",
      value: stats?.pendingOrders || 0,
      icon: ShoppingCart,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      iconBg: "bg-amber-100",
      description: "Aguardando preparo",
      trend: stats?.pendingOrders > 5 ? "Alto" : "Normal",
    },
    {
      title: "Pedidos Hoje",
      value: stats?.todayOrders || 0,
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      iconBg: "bg-purple-100",
      description: "Total de hoje",
      trend: "+8%",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      {/* Header com informações de tempo */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 mb-2">
              🍗 Dashboard Hoshino
            </h1>
            <p className="text-slate-600 text-lg">
              Bem-vindo ao painel administrativo
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 text-slate-700 mb-1">
              <Calendar className="h-4 w-4" />
              <span className="font-medium capitalize">{getCurrentDate()}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <Clock className="h-4 w-4" />
              <span>{getCurrentTime()}</span>
            </div>
          </div>
        </div>

        {/* Status do restaurante */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 rounded-xl shadow-lg">
          <div className="flex items-center gap-3">
            <Store className="h-6 w-6" />
            <div>
              <p className="font-semibold">Status: Atendimento aos Domingos</p>
              <p className="text-orange-100 text-sm">
                Pedidos durante a semana são considerados reservas para o
                próximo domingo
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Cards de estatísticas melhorados */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <Card
            key={stat.title}
            className={`${stat.bgColor} border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer`}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-sm font-medium text-slate-700 mb-1">
                  {stat.title}
                </CardTitle>
                <p className="text-xs text-slate-500">{stat.description}</p>
              </div>
              <div className={`p-3 rounded-full ${stat.iconBg}`}>
                <stat.icon className={`h-6 w-6 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <div className="text-3xl font-bold text-slate-800 mb-1">
                  {stat.value}
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-slate-500" />
                  <span className="text-xs text-slate-500">{stat.trend}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Card de visão geral melhorado */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-slate-800 to-slate-700 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Visão Geral do Negócio
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6">
              <div className="text-center">
                <div className="text-6xl mb-4">🍗</div>
                <h3 className="text-xl font-semibold text-slate-800 mb-2">
                  Painel Administrativo Hoshino
                </h3>
                <p className="text-slate-600 leading-relaxed">
                  Gerencie seus produtos e pedidos de forma eficiente. Use as
                  abas de navegação para acessar diferentes seções do sistema.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200">
                <div className="text-center p-4 bg-slate-50 rounded-lg">
                  <div className="text-2xl font-bold text-slate-800 mb-1">
                    {stats?.totalProducts || 0}
                  </div>
                  <p className="text-sm text-slate-600">Produtos Ativos</p>
                </div>
                <div className="text-center p-4 bg-slate-50 rounded-lg">
                  <div className="text-2xl font-bold text-slate-800 mb-1">
                    {stats?.pendingOrders || 0}
                  </div>
                  <p className="text-sm text-slate-600">Em Preparo</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-gradient-to-br from-orange-50 to-red-50">
          <CardHeader>
            <CardTitle className="text-slate-800 flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Lembrete Importante
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="font-semibold text-slate-800">
                  Horário de Funcionamento
                </span>
              </div>
              <p className="text-sm text-slate-600 mb-3">
                Atendemos apenas aos domingos
              </p>

              <div className="text-xs text-slate-500 space-y-1">
                <p>• Pedidos durante a semana = Reservas</p>
                <p>• Confirme sempre o status dos pedidos</p>
                <p>• Mantenha o cardápio atualizado</p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-orange-100 to-red-100 p-3 rounded-lg">
              <p className="text-sm font-medium text-slate-700 text-center">
                💡 Dica: Verifique pedidos pendentes regularmente
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
