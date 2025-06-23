
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

const AdminSetup = () => {
  const { user } = useAuth();
  const [hasRole, setHasRole] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const checkUserRole = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Erro ao verificar role:', error);
          setHasRole(false);
          return;
        }

        setHasRole(!!data);
      } catch (error) {
        console.error('Erro ao verificar role:', error);
        setHasRole(false);
      }
    };

    checkUserRole();
  }, [user]);

  const makeAdmin = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_roles')
        .insert([
          {
            user_id: user.id,
            role: 'admin'
          }
        ]);

      if (error) {
        console.error('Erro ao criar admin:', error);
        toast({
          title: 'Erro',
          description: 'Erro ao definir como admin: ' + error.message,
          variant: 'destructive'
        });
        return;
      }

      toast({
        title: 'Sucesso!',
        description: 'Você agora é administrador!'
      });

      setHasRole(true);
      
      // Recarregar a página para atualizar os estados
      window.location.reload();
    } catch (error) {
      console.error('Erro ao criar admin:', error);
      toast({
        title: 'Erro',
        description: 'Erro inesperado ao definir como admin',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (hasRole === null) {
    return (
      <div className="flex justify-center items-center p-4">
        <p>Verificando permissões...</p>
      </div>
    );
  }

  if (hasRole) {
    return (
      <div className="flex justify-center items-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-green-600">✓ Admin Configurado</CardTitle>
            <CardDescription>
              Você já possui permissões de administrador.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Configurar Administrador</CardTitle>
          <CardDescription>
            Você precisa se definir como administrador para acessar o painel admin.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={makeAdmin} 
            disabled={loading}
            className="w-full bg-orange-500 hover:bg-orange-600"
          >
            {loading ? 'Configurando...' : 'Tornar-me Admin'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSetup;
