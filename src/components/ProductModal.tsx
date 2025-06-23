import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Minus, Star, ShoppingCart, Heart, Share2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useCart } from "../contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import ProductReviews from "./ProductReviews";

interface ProductModalProps {
  product: any;
  isOpen: boolean;
  onClose: () => void;
}

const ProductModal = ({ product, isOpen, onClose }: ProductModalProps) => {
  const [quantity, setQuantity] = useState(1);
  const [selectedExtras, setSelectedExtras] = useState<any[]>([]);
  const { addToCart } = useCart();
  const { toast } = useToast();

  const { data: productRating } = useQuery({
    queryKey: ["product-rating", product?.id],
    queryFn: async () => {
      if (!product?.id) return null;

      const { data, error } = await supabase.rpc("get_product_rating", {
        product_id: product.id,
      });

      if (error) throw error;
      return data[0];
    },
    enabled: !!product?.id,
  });

  useEffect(() => {
    if (isOpen) {
      setQuantity(1);
      setSelectedExtras([]);
    }
  }, [isOpen]);

  if (!product) return null;

  const handleExtraChange = (extra: any, checked: boolean) => {
    if (checked) {
      setSelectedExtras((prev) => [...prev, extra]);
    } else {
      setSelectedExtras((prev) => prev.filter((e) => e.id !== extra.id));
    }
  };

  const totalPrice =
    product.price + selectedExtras.reduce((sum, extra) => sum + extra.price, 0);

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity,
      extras: selectedExtras,
    });

    toast({
      title: "Produto adicionado!",
      description: `${quantity}x ${product.name} foi adicionado ao carrinho.`,
    });

    onClose();
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 transition-colors ${
          i < Math.round(rating)
            ? "text-yellow-400 fill-current"
            : "text-gray-300"
        }`}
      />
    ));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto p-0 bg-gradient-to-br from-white via-orange-50/30 to-yellow-50/30">
        <div id="product-description">
          <DialogHeader className="p-6 pb-4 border-b bg-white/80 backdrop-blur-sm sticky top-0 z-10">
            <div className="flex items-start justify-between">
              <div>
                <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text text-transparent">
                  {product.name}
                </DialogTitle>
                <DialogDescription className="text-base mt-1">
                  Detalhes do produto e opções adicionais.
                </DialogDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" className="hover:bg-red-50">
                  <Heart className="h-5 w-5 text-gray-400 hover:text-red-500 transition-colors" />
                </Button>
                <Button variant="ghost" size="sm" className="hover:bg-blue-50">
                  <Share2 className="h-5 w-5 text-gray-400 hover:text-blue-500 transition-colors" />
                </Button>
              </div>
            </div>
          </DialogHeader>

          <div className="p-6 space-y-8">
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="relative group">
                  <img
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    className="w-full h-80 object-cover rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300"
                  />
                  {product.is_highlight && (
                    <div className="absolute top-4 left-4">
                      <Badge className="bg-gradient-to-r from-orange-500 to-yellow-500 text-white shadow-lg">
                        ⭐ Destaque
                      </Badge>
                    </div>
                  )}
                  {product.is_available === false && (
                    <div className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center">
                      <Badge
                        variant="destructive"
                        className="text-lg px-4 py-2"
                      >
                        Indisponível
                      </Badge>
                    </div>
                  )}
                </div>

                {productRating && productRating.total_reviews > 0 && (
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-orange-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex">
                          {renderStars(productRating.average_rating || 0)}
                        </div>
                        <span className="text-sm font-semibold text-gray-700">
                          {productRating.average_rating}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">
                        ({productRating.total_reviews} avaliações)
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-6">
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant="outline"
                    className="text-base px-3 py-1 border-orange-200 text-orange-700"
                  >
                    {product.category}
                  </Badge>
                </div>

                <div className="bg-white p-5 rounded-xl shadow-sm border border-orange-100">
                  <p className="text-gray-700 leading-relaxed text-base">
                    {product.description || "Descrição não disponível."}
                  </p>
                </div>

                <div className="bg-gradient-to-r from-orange-500 to-yellow-500 p-6 rounded-xl text-white shadow-lg">
                  <div className="flex items-baseline space-x-3">
                    <span className="text-3xl font-bold">
                      R$ {product.price.toFixed(2)}
                    </span>
                    {product.original_price && (
                      <span className="text-xl text-white/70 line-through">
                        R$ {product.original_price.toFixed(2)}
                      </span>
                    )}
                  </div>
                  <p className="text-white/90 mt-1 text-sm">
                    Preço por unidade
                  </p>
                </div>

                {product.extras && product.extras.length > 0 && (
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-orange-100 space-y-4">
                    <h4 className="font-bold text-lg text-gray-800 border-b border-orange-100 pb-2">
                      🍽️ Acompanhamentos:
                    </h4>
                    <div className="space-y-3">
                      {product.extras.map((extra: any) => (
                        <div
                          key={extra.id}
                          className="flex items-center space-x-4 p-3 rounded-lg hover:bg-orange-50 transition-colors border border-transparent hover:border-orange-200"
                        >
                          <Checkbox
                            id={extra.id}
                            checked={selectedExtras.some(
                              (e) => e.id === extra.id
                            )}
                            onCheckedChange={(checked) =>
                              handleExtraChange(extra, checked as boolean)
                            }
                            className="data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                          />
                          <label
                            htmlFor={extra.id}
                            className="flex-1 flex justify-between cursor-pointer"
                          >
                            <span className="font-medium text-gray-700">
                              {extra.name}
                            </span>
                            <span className="font-bold text-orange-600">
                              + R$ {Number(extra.price).toFixed(2)}
                            </span>
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-white p-6 rounded-xl shadow-sm border border-orange-100">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-lg text-gray-800">
                      Quantidade:
                    </span>
                    <div className="flex items-center space-x-3">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1}
                        className="h-10 w-10 p-0 rounded-full hover:bg-orange-50 hover:border-orange-300 border-orange-200"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="w-12 text-center font-bold text-xl bg-orange-50 py-2 px-3 rounded-lg border border-orange-200">
                        {quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setQuantity(quantity + 1)}
                        className="h-10 w-10 p-0 rounded-full hover:bg-orange-50 hover:border-orange-300 border-orange-200"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-white/95 backdrop-blur-sm border-t-2 border-orange-200 p-6 rounded-t-2xl shadow-lg">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-center sm:text-left">
                  <span className="text-lg font-semibold text-gray-600 block">
                    Total:
                  </span>
                  <span className="text-3xl font-bold bg-gradient-to-r from-orange-600 to-yellow-600 bg-clip-text text-transparent">
                    R$ {(totalPrice * quantity).toFixed(2)}
                  </span>
                </div>

                <Button
                  onClick={handleAddToCart}
                  className="w-full sm:w-auto bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                  disabled={product.is_available === false}
                  size="lg"
                >
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  {product.is_available === false
                    ? "Indisponível"
                    : "Adicionar ao Carrinho"}
                </Button>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-orange-100 p-6">
              <ProductReviews productId={product.id} />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductModal;
