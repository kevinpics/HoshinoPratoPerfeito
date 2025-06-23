import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import OrderHistory from "@/components/OrderHistory";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import {
  Trophy,
  Star,
  User,
  Calendar,
  Mail,
  Gift,
  LogOut,
  ShoppingBag,
  Award,
  Info,
} from "lucide-react";

const Profile = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);

  const { data: loyaltyPoints } = useQuery({
    queryKey: ["loyalty-points", user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from("loyalty_points")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") throw error;
      return data;
    },
    enabled: !!user,
  });

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Logout realizado",
        description: "Você foi desconectado com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao fazer logout",
        description: "Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const getLoyaltyLevel = (points) => {
    if (points >= 1000)
      return {
        level: "Ouro",
        color: "text-yellow-600",
        bgColor: "bg-yellow-50",
        icon: "👑",
      };
    if (points >= 500)
      return {
        level: "Prata",
        color: "text-gray-600",
        bgColor: "bg-gray-50",
        icon: "🥈",
      };
    if (points >= 100)
      return {
        level: "Bronze",
        color: "text-orange-600",
        bgColor: "bg-orange-50",
        icon: "🥉",
      };
    return {
      level: "Iniciante",
      color: "text-green-600",
      bgColor: "bg-green-50",
      icon: "🌟",
    };
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50">
        <Header onCartClick={() => {}} />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-md mx-auto text-center">
            <div className="mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-red-400 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="h-10 w-10 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Acesso Restrito
              </h1>
              <p className="text-gray-600 text-lg">
                Você precisa estar logado para acessar seu perfil.
              </p>
            </div>
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <p className="text-gray-500 mb-4">
                Faça login para gerenciar suas informações, ver pedidos e
                acompanhar pontos de fidelidade.
              </p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const loyaltyLevel = loyaltyPoints
    ? getLoyaltyLevel(loyaltyPoints.points)
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50">
      <Header onCartClick={() => {}} />

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header do Perfil */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="flex items-center space-x-6 mb-4 md:mb-0">
                <div className="w-20 h-20 bg-gradient-to-br from-orange-400 to-red-400 rounded-full flex items-center justify-center">
                  <User className="h-10 w-10 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-800 mb-1">
                    Bem-vindo de volta!
                  </h1>
                  <p className="text-gray-600 flex items-center">
                    <Mail className="h-4 w-4 mr-2" />
                    {user.email}
                  </p>
                  <p className="text-sm text-gray-500 flex items-center mt-1">
                    <Calendar className="h-4 w-4 mr-2" />
                    Membro desde{" "}
                    {new Date(user.created_at).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                {loyaltyLevel && (
                  <Badge
                    variant="secondary"
                    className={`${loyaltyLevel.bgColor} ${loyaltyLevel.color} text-sm font-semibold px-4 py-2`}
                  >
                    {loyaltyLevel.icon} {loyaltyLevel.level}
                  </Badge>
                )}
                <Button
                  onClick={handleSignOut}
                  variant="outline"
                  className="flex items-center space-x-2 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sair</span>
                </Button>
              </div>
            </div>
          </div>

          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-white rounded-xl shadow-sm p-1 mb-8">
              <TabsTrigger
                value="profile"
                className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-400 data-[state=active]:to-red-400 data-[state=active]:text-white rounded-lg"
              >
                <User className="h-4 w-4" />
                <span>Perfil</span>
              </TabsTrigger>
              <TabsTrigger
                value="orders"
                className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-400 data-[state=active]:to-red-400 data-[state=active]:text-white rounded-lg"
              >
                <ShoppingBag className="h-4 w-4" />
                <span>Pedidos</span>
              </TabsTrigger>
              <TabsTrigger
                value="loyalty"
                className="flex items-center space-x-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-400 data-[state=active]:to-red-400 data-[state=active]:text-white rounded-lg"
              >
                <Trophy className="h-4 w-4" />
                <span>Fidelidade</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="mt-0">
              <Card className="shadow-lg border-0 rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-orange-400 to-red-400 text-white">
                  <CardTitle className="flex items-center space-x-2 text-xl">
                    <User className="h-6 w-6" />
                    <span>Informações Pessoais</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label
                        htmlFor="email"
                        className="text-sm font-semibold text-gray-700 flex items-center"
                      >
                        <Mail className="h-4 w-4 mr-2 text-orange-500" />
                        E-mail
                      </Label>
                      <Input
                        id="email"
                        value={user.email || ""}
                        disabled
                        className="bg-gray-50 border-gray-200 h-12 rounded-xl"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="createdAt"
                        className="text-sm font-semibold text-gray-700 flex items-center"
                      >
                        <Calendar className="h-4 w-4 mr-2 text-orange-500" />
                        Membro desde
                      </Label>
                      <Input
                        id="createdAt"
                        value={new Date(user.created_at).toLocaleDateString(
                          "pt-BR"
                        )}
                        disabled
                        className="bg-gray-50 border-gray-200 h-12 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start space-x-3">
                    <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-blue-800 font-medium mb-1">
                        Precisa atualizar suas informações?
                      </p>
                      <p className="text-sm text-blue-700">
                        Entre em contato conosco através do suporte para alterar
                        seus dados pessoais.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="orders" className="mt-0">
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-orange-400 to-red-400 text-white p-6">
                  <h2 className="text-xl font-bold flex items-center">
                    <ShoppingBag className="h-6 w-6 mr-2" />
                    Histórico de Pedidos
                  </h2>
                  <p className="text-orange-100 mt-1">
                    Acompanhe todos os seus pedidos
                  </p>
                </div>
                <div className="p-6">
                  <OrderHistory />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="loyalty" className="mt-0">
              <Card className="shadow-lg border-0 rounded-2xl overflow-hidden">
                <CardHeader className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white">
                  <CardTitle className="flex items-center space-x-2 text-xl">
                    <Trophy className="h-6 w-6" />
                    <span>Programa de Fidelidade</span>
                  </CardTitle>
                  <p className="text-yellow-100 mt-2">
                    Acumule pontos e ganhe recompensas incríveis!
                  </p>
                </CardHeader>
                <CardContent className="p-8">
                  {loyaltyPoints ? (
                    <div className="space-y-8">
                      {/* Status do Nível */}
                      {loyaltyLevel && (
                        <div
                          className={`${loyaltyLevel.bgColor} rounded-2xl p-6 text-center`}
                        >
                          <div className="text-4xl mb-2">
                            {loyaltyLevel.icon}
                          </div>
                          <h3
                            className={`text-2xl font-bold ${loyaltyLevel.color} mb-1`}
                          >
                            Nível {loyaltyLevel.level}
                          </h3>
                          <p className="text-gray-600">
                            Continue comprando para subir de nível!
                          </p>
                        </div>
                      )}

                      {/* Estatísticas */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 text-center border-2 border-orange-200">
                          <div className="w-12 h-12 bg-orange-400 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Star className="h-6 w-6 text-white" />
                          </div>
                          <div className="text-3xl font-bold text-orange-600 mb-1">
                            {loyaltyPoints.points}
                          </div>
                          <div className="text-sm font-medium text-orange-700">
                            Pontos Acumulados
                          </div>
                        </div>

                        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 text-center border-2 border-green-200">
                          <div className="w-12 h-12 bg-green-400 rounded-full flex items-center justify-center mx-auto mb-3">
                            <ShoppingBag className="h-6 w-6 text-white" />
                          </div>
                          <div className="text-3xl font-bold text-green-600 mb-1">
                            {loyaltyPoints.total_orders}
                          </div>
                          <div className="text-sm font-medium text-green-700">
                            Pedidos Realizados
                          </div>
                        </div>

                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 text-center border-2 border-blue-200">
                          <div className="w-12 h-12 bg-blue-400 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Gift className="h-6 w-6 text-white" />
                          </div>
                          <div className="text-3xl font-bold text-blue-600 mb-1">
                            {Math.floor(loyaltyPoints.points / 100)}
                          </div>
                          <div className="text-sm font-medium text-blue-700">
                            Recompensas Disponíveis
                          </div>
                        </div>
                      </div>

                      {/* Barra de Progresso para Próxima Recompensa */}
                      <div className="bg-gray-50 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-gray-800">
                            Próxima Recompensa
                          </h4>
                          <span className="text-sm text-gray-600">
                            {loyaltyPoints.points % 100}/100 pontos
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3">
                          <div
                            className="bg-gradient-to-r from-orange-400 to-red-400 h-3 rounded-full transition-all duration-300"
                            style={{ width: `${loyaltyPoints.points % 100}%` }}
                          ></div>
                        </div>
                        <p className="text-sm text-gray-600 mt-2">
                          Faltam {100 - (loyaltyPoints.points % 100)} pontos
                          para sua próxima recompensa!
                        </p>
                      </div>

                      {/* Como Funciona */}
                      <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-2xl p-6">
                        <h4 className="font-bold text-yellow-800 mb-4 flex items-center text-lg">
                          <Award className="h-5 w-5 mr-2" />
                          Como funciona o programa:
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div className="flex items-start space-x-3">
                            <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-white font-bold text-xs">
                                1
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-yellow-800">
                                Ganhe Pontos
                              </p>
                              <p className="text-yellow-700">
                                1 ponto para cada R$ 1,00 gasto
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start space-x-3">
                            <div className="w-8 h-8 bg-orange-400 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-white font-bold text-xs">
                                2
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-yellow-800">
                                Acumule
                              </p>
                              <p className="text-yellow-700">
                                A cada 100 pontos, ganhe uma recompensa
                              </p>
                            </div>
                          </div>
                          <div className="flex items-start space-x-3">
                            <div className="w-8 h-8 bg-red-400 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-white font-bold text-xs">
                                3
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-yellow-800">
                                Resgate
                              </p>
                              <p className="text-yellow-700">
                                Entre em contato para usar suas recompensas
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Trophy className="h-12 w-12 text-gray-400" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-600 mb-2">
                        Comece sua jornada de fidelidade!
                      </h3>
                      <p className="text-gray-500 mb-6 max-w-md mx-auto">
                        Você ainda não possui pontos de fidelidade. Faça seu
                        primeiro pedido para começar a acumular pontos e
                        desbloquear recompensas incríveis!
                      </p>
                      <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-2xl p-6 max-w-md mx-auto">
                        <p className="text-sm text-orange-700 font-medium mb-2">
                          🎯 Primeiro pedido = primeiros pontos!
                        </p>
                        <p className="text-xs text-orange-600">
                          Explore nosso cardápio e comece a colecionar pontos
                          hoje mesmo.
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;
