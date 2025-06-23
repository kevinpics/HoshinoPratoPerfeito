
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AdminRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

const AdminRoute = ({ children, redirectTo = '/' }: AdminRouteProps) => {
  const { user, loading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAdminRole = async () => {
      if (!user) {
        setIsAdmin(false);
        return;
      }

      try {
        console.log('Verificando admin para usuário:', user.id);
        
        // Usar a função SQL para verificar se é admin
        const { data, error } = await supabase.rpc('is_admin', {
          user_id: user.id
        });

        if (error) {
          console.error('Erro ao verificar role de admin:', error);
          setIsAdmin(false);
          return;
        }

        console.log('Resultado da verificação de admin:', data);
        setIsAdmin(data === true);
      } catch (error) {
        console.error('Erro ao verificar permissões:', error);
        setIsAdmin(false);
      }
    };

    checkAdminRole();
  }, [user]);

  if (loading || isAdmin === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-yellow-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">H</span>
          </div>
          <p className="text-gray-600">Verificando permissões...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!isAdmin) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};

export default AdminRoute;
