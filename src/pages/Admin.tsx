import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  BarChart3,
  Package,
  ShoppingCart,
  Users,
  Ticket,
  FileText,
  Activity,
  Star,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import AdminProducts from "../components/admin/AdminProducts";
import AdminOrders from "../components/admin/AdminOrders";
import AdminDashboard from "../components/admin/AdminDashboard";
import RealtimeOrders from "../components/admin/RealtimeOrders";
import AdminReports from "../components/admin/AdminReports";
import AdminCustomers from "../components/admin/AdminCustomers";
import AdminCoupons from "../components/admin/AdminCoupons";

const Admin = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const navigate = useNavigate();

  const tabConfig = [
    {
      value: "dashboard",
      label: "Dashboard",
      icon: BarChart3,
      color: "from-blue-500 to-cyan-500",
    },
    {
      value: "realtime",
      label: "Tempo Real",
      icon: Activity,
      color: "from-green-500 to-emerald-500",
    },
    {
      value: "products",
      label: "Produtos",
      icon: Package,
      color: "from-purple-500 to-pink-500",
    },
    {
      value: "orders",
      label: "Pedidos",
      icon: ShoppingCart,
      color: "from-orange-500 to-red-500",
    },
    {
      value: "coupons",
      label: "Cupons",
      icon: Ticket,
      color: "from-yellow-500 to-orange-500",
    },
    {
      value: "reports",
      label: "Relatórios",
      icon: FileText,
      color: "from-indigo-500 to-purple-500",
    },
    {
      value: "customers",
      label: "Clientes",
      icon: Users,
      color: "from-teal-500 to-blue-500",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Header premium */}
      <div className="relative z-10 border-b border-orange-200 bg-white/90 backdrop-blur-xl shadow-lg">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="relative">
                  <img
                    src="https://awicytvarfwydeebjivk.supabase.co/storage/v1/object/public/hoshino/Site/LogoPreta.png"
                    alt="Logo"
                    className="w-14 h-14 rounded-2xl shadow-lg"
                  />
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-orange-300 to-amber-400 rounded-full flex items-center justify-center">
                    <Sparkles className="h-3 w-3 text-white" />
                  </div>
                </div>
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-orange-600 bg-clip-text text-transparent">
                  Painel Administrativo
                </h1>
                <p className="text-slate-600 font-medium flex items-center gap-2">
                  <span className="text-transparent bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text font-semibold">
                    Hoshino
                  </span>
                  <span className="text-slate-400">•</span>
                  <span>Gerencie produtos, pedidos e relatórios</span>
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate("/")}
              className="flex items-center gap-2 bg-white border-orange-200 text-slate-700 hover:bg-orange-50 hover:border-orange-300 transition-all duration-300 shadow-sm"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar ao Site
            </Button>
          </div>
        </div>
      </div>

      <div className="relative z-10 container mx-auto px-6 py-10">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          {/* Tabs premium com glassmorphism */}
          <div className="bg-white/5 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/10 overflow-hidden mb-10">
            <TabsList className="w-full bg-transparent p-4 h-auto">
              <div className="grid w-full grid-cols-7 gap-3">
                {tabConfig.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.value;
                  return (
                    <TabsTrigger
                      key={tab.value}
                      value={tab.value}
                      className={`
                        group flex flex-col items-center gap-3 py-4 px-3 rounded-2xl border-0 transition-all duration-300
                        ${
                          isActive
                            ? "bg-white/15 backdrop-blur-sm shadow-xl text-white border border-white/20"
                            : "hover:bg-white/10 text-slate-300 hover:text-white"
                        }
                      `}
                    >
                      <div
                        className={`
                        p-2 rounded-xl transition-all duration-300
                        ${
                          isActive
                            ? `bg-gradient-to-r ${tab.color} shadow-lg`
                            : "bg-white/10 group-hover:bg-white/15"
                        }
                      `}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className="text-sm font-medium">{tab.label}</span>
                      {isActive && (
                        <div
                          className={`w-8 h-1 rounded-full bg-gradient-to-r ${tab.color}`}
                        />
                      )}
                    </TabsTrigger>
                  );
                })}
              </div>
            </TabsList>

            {/* Conteúdo das tabs com padding premium */}
            <div className="p-8">
              <TabsContent value="dashboard" className="mt-0">
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                  <AdminDashboard />
                </div>
              </TabsContent>

              <TabsContent value="realtime" className="mt-0">
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                  <RealtimeOrders />
                </div>
              </TabsContent>

              <TabsContent value="products" className="mt-0">
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                  <AdminProducts />
                </div>
              </TabsContent>

              <TabsContent value="orders" className="mt-0">
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                  <AdminOrders />
                </div>
              </TabsContent>

              <TabsContent value="coupons" className="mt-0">
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                  <AdminCoupons />
                </div>
              </TabsContent>

              <TabsContent value="reports" className="mt-0">
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                  <AdminReports />
                </div>
              </TabsContent>

              <TabsContent value="customers" className="mt-0">
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6">
                  <AdminCustomers />
                </div>
              </TabsContent>
            </div>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
