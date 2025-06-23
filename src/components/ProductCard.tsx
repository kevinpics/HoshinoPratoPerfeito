import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import { useCart } from "../contexts/CartContext";
import ProductModal from "./ProductModal";
import { Product } from "../types/product";

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { addToCart } = useCart();

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();

    // Se o produto tiver extras, abra o modal
    if (product.extras && product.extras.length > 0) {
      setIsModalOpen(true);
      return;
    }

    // Caso contrário, adiciona direto
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      extras: [],
    });
  };

  return (
    <>
      <Card
        className="group cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-2 bg-white/80 backdrop-blur-sm"
        onClick={() => setIsModalOpen(true)}
      >
        <div className="relative overflow-hidden rounded-t-lg">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-48 object-cover group-hover:scale-110 transition-transform duration-300"
          />
          {product.isHighlight && (
            <Badge className="absolute top-3 left-3 bg-orange-500">
              Destaque
            </Badge>
          )}
        </div>

        <CardContent className="p-6">
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            {product.name}
          </h3>
          <p className="text-gray-600 mb-4 line-clamp-2">
            {product.description}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-orange-600">
              R$ {product.price.toFixed(2)}
            </span>
            {product.originalPrice && (
              <span className="text-lg text-gray-400 line-through">
                R$ {product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>
        </CardContent>

        <CardFooter className="p-6 pt-0">
          <Button
            className="w-full bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white font-semibold"
            onClick={handleQuickAdd}
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar ao Carrinho
          </Button>
        </CardFooter>
      </Card>

      <ProductModal
        product={product}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

export default ProductCard;
