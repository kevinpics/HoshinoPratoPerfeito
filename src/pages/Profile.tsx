
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import OrderHistory from '@/components/OrderHistory';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Trophy, Star } from 'lucide-react';

const Profile = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);

  const { data: loyaltyPoints } = useQuery({
    queryKey: ['loyalty-points', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data, error } = await supabase
        .from('loyalty_points')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    enabled: !!user
  });

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: 'Logout realizado',
        description: 'Você foi desconectado com sucesso.'
      });
    } catch (error) {
      toast({
        title: 'Erro ao fazer logout',
        description: 'Tente novamente.',
        variant: 'destructive'
      });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50">
        <Header onCartClick={() => {}} />
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">
            Acesso negado
          </h1>
          <p className="text-gray-600 mb-6">
            Você precisa estar logado para acessar seu perfil.
          </p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50">
      <Header onCartClick={() => {}} />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Meu Perfil</h1>
            <Button onClick={handleSignOut} variant="outline">
              Sair
            </Button>
          </div>

          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile">Perfil</TabsTrigger>
              <TabsTrigger value="orders">Pedidos</TabsTrigger>
              <TabsTrigger value="loyalty">Fidelidade</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Informações Pessoais</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      value={user.email || ''}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="createdAt">Membro desde</Label>
                    <Input
                      id="createdAt"
                      value={new Date(user.created_at).toLocaleDateString('pt-BR')}
                      disabled
                      className="bg-gray-50"
                    />
                  </div>

                  <p className="text-sm text-gray-600">
                    Para alterar suas informações pessoais, entre em contato conosco.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="orders" className="mt-6">
              <OrderHistory />
            </TabsContent>

            <TabsContent value="loyalty" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    <span>Programa de Fidelidade</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loyaltyPoints ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-orange-50 rounded-lg">
                          <div className="text-2xl font-bold text-orange-600">
                            {loyaltyPoints.points}
                          </div>
                          <div className="text-sm text-gray-600">Pontos Acumulados</div>
                        </div>
                        
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">
                            {loyaltyPoints.total_orders}
                          </div>
                          <div className="text-sm text-gray-600">Pedidos Realizados</div>
                        </div>
                        
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">
                            {Math.floor(loyaltyPoints.points / 100)}
                          </div>
                          <div className="text-sm text-gray-600">Recompensas Disponíveis</div>
                        </div>
                      </div>

                      <div className="p-4 bg-yellow-50 rounded-lg">
                        <h4 className="font-semibold text-yellow-800 mb-2">
                          Como funciona:
                        </h4>
                        <ul className="text-sm text-yellow-700 space-y-1">
                          <li>• Ganhe 1 ponto para cada R$ 1,00 gasto</li>
                          <li>• A cada 100 pontos, ganhe um desconto especial</li>
                          <li>• Entre em contato para resgatar suas recompensas</li>
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500 mb-4">
                        Você ainda não possui pontos de fidelidade.
                      </p>
                      <p className="text-sm text-gray-600">
                        Faça seu primeiro pedido para começar a acumular pontos!
                      </p>
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
