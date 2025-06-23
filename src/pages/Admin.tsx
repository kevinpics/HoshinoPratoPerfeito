import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b bg-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Painel Administrativo - Hoshino
              </h1>
              <p className="text-gray-600">
                Gerencie produtos, pedidos e relatórios
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate("/")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar ao Site
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="realtime">Tempo Real</TabsTrigger>
            <TabsTrigger value="products">Produtos</TabsTrigger>
            <TabsTrigger value="orders">Pedidos</TabsTrigger>
            <TabsTrigger value="coupons">Cupons</TabsTrigger>
            <TabsTrigger value="reports">Relatórios</TabsTrigger>
            <TabsTrigger value="customers">Clientes</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-6">
            <AdminDashboard />
          </TabsContent>

          <TabsContent value="realtime" className="mt-6">
            <RealtimeOrders />
          </TabsContent>

          <TabsContent value="products" className="mt-6">
            <AdminProducts />
          </TabsContent>

          <TabsContent value="orders" className="mt-6">
            <AdminOrders />
          </TabsContent>

          <TabsContent value="coupons" className="mt-6">
            <AdminCoupons />
          </TabsContent>

          <TabsContent value="reports" className="mt-6">
            <AdminReports />
          </TabsContent>

          <TabsContent value="customers" className="mt-6">
            <AdminCustomers />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;
