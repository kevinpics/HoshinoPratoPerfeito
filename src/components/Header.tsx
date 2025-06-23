import { ShoppingCart, User, Bell, Settings, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  onCartClick: () => void;
}

const Header = ({ onCartClick }: HeaderProps) => {
  const { itemCount } = useCart();
  const { user, signOut } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminRole = async () => {
      if (!user) {
        setIsAdmin(false);
        return;
      }

      try {
        console.log("Verificando admin no header para usuário:", user.id);

        // Usar a função SQL para verificar se é admin
        const { data, error } = await supabase.rpc("is_admin", {
          user_id: user.id,
        });

        if (error) {
          console.error("Erro ao verificar admin no header:", error);
          setIsAdmin(false);
          return;
        }

        console.log("Admin status no header:", data);
        setIsAdmin(data === true);
      } catch (error) {
        console.error("Erro ao verificar admin no header:", error);
        setIsAdmin(false);
      }
    };

    checkAdminRole();
  }, [user]);

  return (
    <header className="bg-white/95 backdrop-blur-sm shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <div>
              <img
                src="https://awicytvarfwydeebjivk.supabase.co/storage/v1/object/public/hoshino/Site/LogoPreta.png"
                alt="Logo"
                className="w-16 h-16 rounded-full"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Hoshino</h1>
              <p className="text-sm text-orange-600 font-medium">
                Prato Perfeito
              </p>
            </div>
          </Link>

          <nav className="hidden md:flex space-x-6">
            <a
              href="/#cardapio"
              className="text-gray-700 hover:text-orange-600 transition-colors"
            >
              Cardápio
            </a>
            <Link
              to="/about"
              className="text-gray-700 hover:text-orange-600 transition-colors"
            >
              Sobre
            </Link>
            <Link
              to="/contact"
              className="text-gray-700 hover:text-orange-600 transition-colors"
            >
              Contato
            </Link>
          </nav>

          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
            </Button>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      <span>Perfil</span>
                    </Link>
                  </DropdownMenuItem>
                  {isAdmin && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="flex items-center">
                          <Settings className="mr-2 h-4 w-4" />
                          <span>Painel Admin</span>
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sair</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth">
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </Link>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="relative"
              onClick={onCartClick}
            >
              <ShoppingCart className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
