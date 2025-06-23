import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  Clock,
  CreditCard,
} from "lucide-react";
import { useCart } from "../contexts/CartContext";
import { useNavigate } from "react-router-dom";

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
}

const Cart = ({ isOpen, onClose }: CartProps) => {
  const { items, updateQuantity, removeFromCart, total, itemCount } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    onClose();
    navigate("/checkout");
  };

  if (itemCount === 0) {
    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="w-full sm:max-w-lg bg-gradient-to-br from-white via-orange-50/30 to-yellow-50/30">
          <SheetHeader className="border-b border-orange-100 pb-4">
            <SheetTitle className="text-2xl bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text text-transparent">
              Carrinho de Compras
            </SheetTitle>
          </SheetHeader>
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
            <div className="relative">
              <div className="text-8xl opacity-20">🛒</div>
              <div className="absolute inset-0 flex items-center justify-center"></div>
            </div>
            <div className="space-y-3">
              <h3 className="text-2xl font-bold text-gray-800">
                Seu carrinho está vazio
              </h3>
              <p className="text-gray-600 text-lg">
                Adicione alguns pratos deliciosos ao seu carrinho!
              </p>
            </div>
            <div className="bg-orange-50 p-4 rounded-xl border border-orange-200 max-w-sm">
              <p className="text-sm text-orange-700">
                💡 Explore nosso cardápio e descubra sabores incríveis!
              </p>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col bg-gradient-to-br from-white via-orange-50/20 to-yellow-50/20">
        <SheetHeader className="border-b border-orange-100 pb-4 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
          <SheetTitle className="flex items-center justify-between">
            <span className="text-2xl bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text text-transparent">
              Carrinho de Compras
            </span>
            <Badge className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white px-3 py-1">
              {itemCount} {itemCount === 1 ? "item" : "itens"}
            </Badge>
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto space-y-4 py-4">
          {items.map((item) => (
            <div
              key={`${item.id}-${item.extras.map((e) => e.id).join("-")}`}
              className="bg-white p-5 rounded-xl shadow-sm border border-orange-100 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h4 className="font-bold text-gray-800 text-lg mb-1">
                    {item.name}
                  </h4>
                  <div className="text-sm text-gray-500">
                    R$ {item.price.toFixed(2)} por unidade
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeFromCart(item.id, item.extras)}
                  className="text-red-400 hover:text-red-600 hover:bg-red-50 ml-2"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {item.extras.length > 0 && (
                <div className="bg-orange-50 p-3 rounded-lg mb-3 border border-orange-100">
                  <span className="font-semibold text-orange-700 text-sm block mb-2">
                    🍽️ Acompanhamentos:
                  </span>
                  <ul className="space-y-1">
                    {item.extras.map((extra) => (
                      <li
                        key={extra.id}
                        className="flex justify-between text-sm text-orange-600"
                      >
                        <span>• {extra.name}</span>
                        <span className="font-semibold">
                          +R$ {extra.price.toFixed(2)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center bg-orange-50 rounded-full p-1 border border-orange-200">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full hover:bg-orange-100"
                    onClick={() =>
                      updateQuantity(
                        item.id,
                        item.extras,
                        Math.max(1, item.quantity - 1)
                      )
                    }
                  >
                    <Minus className="h-3 w-3" />
                  </Button>
                  <span className="font-bold w-10 text-center text-orange-700">
                    {item.quantity}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-full hover:bg-orange-100"
                    onClick={() =>
                      updateQuantity(item.id, item.extras, item.quantity + 1)
                    }
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>

                <div className="text-right">
                  <div className="text-xl font-bold bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text text-transparent">
                    R${" "}
                    {(
                      (item.price +
                        item.extras.reduce(
                          (sum, extra) => sum + extra.price,
                          0
                        )) *
                      item.quantity
                    ).toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {item.quantity} x R${" "}
                    {(
                      item.price +
                      item.extras.reduce((sum, extra) => sum + extra.price, 0)
                    ).toFixed(2)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t-2 border-orange-200 pt-6 space-y-4 bg-white/80 backdrop-blur-sm sticky bottom-0">
          <div className="bg-gradient-to-r from-orange-500 to-yellow-500 p-4 rounded-xl text-white">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Total do Pedido:</span>
              <span className="text-2xl font-bold">R$ {total.toFixed(2)}</span>
            </div>
            <div className="text-white/80 text-sm mt-1">
              {itemCount} {itemCount === 1 ? "item" : "itens"} no carrinho
            </div>
          </div>

          <Button
            className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-bold py-4 text-lg rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            onClick={handleCheckout}
          >
            <CreditCard className="h-5 w-5 mr-2" />
            Finalizar Pedido
          </Button>

          <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
            <div className="flex items-center space-x-2 text-blue-700">
              <Clock className="h-4 w-4" />
              <p className="text-sm font-medium">
                Pedidos realizados durante a semana serão preparados no domingo
              </p>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default Cart;
