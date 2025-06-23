import { useMemo } from "react";
import ProductCard from "./ProductCard";
import { Product } from "../types/database";
import { Loader2, ShoppingBag, Search } from "lucide-react";

interface ProductGridProps {
  products: (Product & { product_extras: any[] })[];
  isLoading: boolean;
  searchTerm?: string;
}

const ProductGrid = ({ products, isLoading, searchTerm }: ProductGridProps) => {
  // Memoiza a transformação dos produtos para evitar re-renders desnecessários
  const transformedProducts = useMemo(() => {
    return products.map((product) => ({
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
    }));
  }, [products]);

  // Loading state melhorado
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col items-center justify-center space-y-6">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-gray-200 border-t-green-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-green-500 animate-pulse" />
            </div>
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold text-gray-700">
              Carregando produtos...
            </h3>
            <p className="text-sm text-gray-500">
              Aguarde enquanto buscamos os melhores produtos para você
            </p>
          </div>
        </div>

        {/* Skeleton loading cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-12">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="bg-gray-200 rounded-lg aspect-square mb-4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Estado vazio melhorado
  if (!products || products.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col items-center justify-center space-y-6 text-center">
          <div className="relative">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
              {searchTerm ? (
                <Search className="w-10 h-10 text-gray-400" />
              ) : (
                <ShoppingBag className="w-10 h-10 text-gray-400" />
              )}
            </div>
            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-gray-500 text-sm">?</span>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-gray-700">
              {searchTerm
                ? "Nenhum produto encontrado"
                : "Nenhum produto disponível"}
            </h3>
            <p className="text-gray-500 max-w-md">
              {searchTerm
                ? `Não encontramos produtos para "${searchTerm}". Tente buscar por outros termos.`
                : "Não há produtos disponíveis no momento. Volte em breve para conferir novidades!"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header com contador de produtos */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShoppingBag className="w-5 h-5 text-gray-600" />
            <span className="text-sm text-gray-600">
              {products.length}{" "}
              {products.length === 1
                ? "produto encontrado"
                : "produtos encontrados"}
              {searchTerm && (
                <span className="ml-1">
                  para "
                  <span className="font-medium text-gray-800">
                    {searchTerm}
                  </span>
                  "
                </span>
              )}
            </span>
          </div>
        </div>
        <div className="mt-2 h-px bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"></div>
      </div>

      {/* Grid responsivo melhorado */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
        {transformedProducts.map((product, index) => (
          <div
            key={product.id}
            className="animate-in fade-in slide-in-from-bottom-4 duration-500"
            style={{
              animationDelay: `${Math.min(index * 100, 500)}ms`,
              animationFillMode: "both",
            }}
          >
            <ProductCard product={product} />
          </div>
        ))}
      </div>

      {/* Indicador de fim da lista */}
      {products.length > 0 && (
        <div className="mt-12 text-center">
          <div className="inline-flex items-center space-x-2 text-sm text-gray-500">
            <div className="h-px bg-gray-300 w-8"></div>
            <span>Fim dos produtos</span>
            <div className="h-px bg-gray-300 w-8"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductGrid;
