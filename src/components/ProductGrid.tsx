import ProductCard from "./ProductCard";
import { Product } from "../types/database";

interface ProductGridProps {
  products: (Product & { product_extras: any[] })[];
  isLoading: boolean;
}

const ProductGrid = ({ products, isLoading }: ProductGridProps) => {
  if (isLoading) {
    return (
      <div className="container mx-auto px-4">
        <div className="text-center">Carregando produtos...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={{
              id: product.id,
              name: product.name,
              description: product.description || "",
              price: product.price,
              originalPrice: product.original_price || undefined,
              image: product.image || "",
              category: product.category,
              isHighlight: product.is_highlight,
              extras:
                product.product_extras?.map((extra) => ({
                  id: extra.id,
                  name: extra.name,
                  price: extra.price,
                })) || [],
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default ProductGrid;
