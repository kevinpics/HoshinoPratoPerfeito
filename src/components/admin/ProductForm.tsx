import { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Plus,
  Trash2,
  Package,
  DollarSign,
  Image,
  Tag,
  Settings,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ProductFormProps {
  isOpen: boolean;
  onClose: () => void;
  product?: any;
}

interface ProductExtra {
  id?: string;
  name: string;
  price: string;
}

const ProductForm = ({ isOpen, onClose, product }: ProductFormProps) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    original_price: "",
    image: "",
    category: "",
    is_highlight: false,
    is_available: true,
  });

  const [extras, setExtras] = useState<ProductExtra[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar extras existentes do produto
  const { data: existingExtras } = useQuery({
    queryKey: ["product-extras", product?.id],
    queryFn: async () => {
      if (!product?.id) return [];
      const { data, error } = await supabase
        .from("product_extras")
        .select("*")
        .eq("product_id", product.id);

      if (error) throw error;
      return data;
    },
    enabled: !!product?.id,
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        description: product.description || "",
        price: product.price?.toString() || "",
        original_price: product.original_price?.toString() || "",
        image: product.image || "",
        category: product.category || "",
        is_highlight: product.is_highlight || false,
        is_available: product.is_available !== false,
      });
    } else {
      setFormData({
        name: "",
        description: "",
        price: "",
        original_price: "",
        image: "",
        category: "",
        is_highlight: false,
        is_available: true,
      });
    }

    // Definir extras
    if (existingExtras && existingExtras.length > 0) {
      setExtras(
        existingExtras.map((extra) => ({
          id: extra.id,
          name: extra.name,
          price: extra.price.toString(),
        }))
      );
    } else {
      setExtras([]);
    }
  }, [product, existingExtras]);

  const addExtra = () => {
    setExtras([...extras, { name: "", price: "" }]);
  };

  const removeExtra = (index: number) => {
    setExtras(extras.filter((_, i) => i !== index));
  };

  const updateExtra = (
    index: number,
    field: "name" | "price",
    value: string
  ) => {
    const newExtras = [...extras];
    newExtras[index][field] = value;
    setExtras(newExtras);
  };

  const saveMutation = useMutation({
    mutationFn: async (data: any) => {
      const productData = {
        name: data.name,
        description: data.description || null,
        price: parseFloat(data.price),
        original_price: data.original_price
          ? parseFloat(data.original_price)
          : null,
        image: data.image || null,
        category: data.category,
        is_highlight: data.is_highlight,
        is_available: data.is_available,
        updated_at: new Date().toISOString(),
      };

      let productId = product?.id;

      if (product) {
        const { error } = await supabase
          .from("products")
          .update(productData)
          .eq("id", product.id);
        if (error) throw error;
      } else {
        const { data: newProduct, error } = await supabase
          .from("products")
          .insert([productData])
          .select()
          .single();
        if (error) throw error;
        productId = newProduct.id;
      }

      // Gerenciar extras
      if (productId) {
        // Remover extras existentes
        await supabase
          .from("product_extras")
          .delete()
          .eq("product_id", productId);

        // Adicionar novos extras
        const validExtras = extras.filter(
          (extra) => extra.name.trim() && extra.price.trim()
        );
        if (validExtras.length > 0) {
          const extrasData = validExtras.map((extra) => ({
            product_id: productId,
            name: extra.name.trim(),
            price: parseFloat(extra.price),
          }));

          const { error: extrasError } = await supabase
            .from("product_extras")
            .insert(extrasData);

          if (extrasError) throw extrasError;
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["product-extras"] });
      toast({
        title: product ? "Produto atualizado" : "Produto criado",
        description: "Alterações salvas com sucesso!",
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao salvar produto. Tente novamente.",
        variant: "destructive",
      });
      console.error("Error saving product:", error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto bg-gradient-to-br from-slate-50 to-gray-100">
        <DialogHeader className="pb-6 border-b border-gray-200">
          <DialogTitle className="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <Package className="h-6 w-6 text-blue-600" />
            {product ? "Editar Produto" : "Novo Produto"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-8 pt-2">
          {/* Informações Básicas */}
          <Card className="shadow-sm border-gray-200 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                <Tag className="h-5 w-5 text-blue-600" />
                Informações Básicas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label
                    htmlFor="name"
                    className="text-sm font-medium text-gray-700 flex items-center gap-1"
                  >
                    Nome do Produto <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Ex: Frango Assado Especial"
                    className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>

                <div className="space-y-3">
                  <Label
                    htmlFor="category"
                    className="text-sm font-medium text-gray-700 flex items-center gap-1"
                  >
                    Categoria <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      setFormData({ ...formData, category: value })
                    }
                  >
                    <SelectTrigger className="h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="frangos">🍗 Frangos</SelectItem>
                      <SelectItem value="acompanhamentos">
                        🍚 Acompanhamentos
                      </SelectItem>
                      <SelectItem value="sobremesas">🍰 Sobremesas</SelectItem>
                      <SelectItem value="bebidas">🥤 Bebidas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                <Label
                  htmlFor="description"
                  className="text-sm font-medium text-gray-700"
                >
                  Descrição
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Descreva o produto, ingredientes e características especiais..."
                  className="min-h-[100px] border-gray-300 focus:border-blue-500 focus:ring-blue-500 resize-none"
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Preços */}
          <Card className="shadow-sm border-gray-200 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                Preços
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label
                    htmlFor="price"
                    className="text-sm font-medium text-gray-700 flex items-center gap-1"
                  >
                    Preço Atual <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                      R$
                    </span>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      placeholder="0,00"
                      className="h-11 pl-10 border-gray-300 focus:border-green-500 focus:ring-green-500"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label
                    htmlFor="original_price"
                    className="text-sm font-medium text-gray-700"
                  >
                    Preço Original
                    <span className="text-xs text-gray-500 ml-1">
                      (para promoções)
                    </span>
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                      R$
                    </span>
                    <Input
                      id="original_price"
                      type="number"
                      step="0.01"
                      value={formData.original_price}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          original_price: e.target.value,
                        })
                      }
                      placeholder="0,00"
                      className="h-11 pl-10 border-gray-300 focus:border-green-500 focus:ring-green-500"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Imagem */}
          <Card className="shadow-sm border-gray-200 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                <Image className="h-5 w-5 text-purple-600" />
                Imagem do Produto
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Label
                  htmlFor="image"
                  className="text-sm font-medium text-gray-700"
                >
                  URL da Imagem
                </Label>
                <Input
                  id="image"
                  type="url"
                  value={formData.image}
                  onChange={(e) =>
                    setFormData({ ...formData, image: e.target.value })
                  }
                  placeholder="https://exemplo.com/imagem-do-produto.jpg"
                  className="h-11 border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                />
                {formData.image && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-600 mb-2">
                      Preview da imagem:
                    </p>
                    <img
                      src={formData.image}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Acompanhamentos/Extras */}
          <Card className="shadow-sm border-gray-200 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                  <Plus className="h-5 w-5 text-orange-600" />
                  Acompanhamentos/Extras
                </CardTitle>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addExtra}
                  className="hover:bg-orange-50 hover:border-orange-300 hover:text-orange-700 transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Extra
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {extras.map((extra, index) => (
                <div
                  key={index}
                  className="flex gap-3 items-end p-4 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex-1">
                    <Label className="text-sm font-medium text-gray-700">
                      Nome do Extra
                    </Label>
                    <Input
                      value={extra.name}
                      onChange={(e) =>
                        updateExtra(index, "name", e.target.value)
                      }
                      placeholder="Ex: Farofa Especial, Molho Extra"
                      className="mt-1 h-10 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                    />
                  </div>
                  <div className="w-36">
                    <Label className="text-sm font-medium text-gray-700">
                      Preço
                    </Label>
                    <div className="relative mt-1">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                        R$
                      </span>
                      <Input
                        type="number"
                        step="0.01"
                        value={extra.price}
                        onChange={(e) =>
                          updateExtra(index, "price", e.target.value)
                        }
                        placeholder="0,00"
                        className="h-10 pl-10 border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                      />
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeExtra(index)}
                    className="h-10 text-red-500 hover:text-red-700 hover:bg-red-50 hover:border-red-300 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {extras.length === 0 && (
                <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <Plus className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">Nenhum acompanhamento adicionado</p>
                  <p className="text-xs text-gray-400">
                    Clique em "Adicionar Extra" para começar
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Configurações */}
          <Card className="shadow-sm border-gray-200 bg-white/80 backdrop-blur-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-gray-700 flex items-center gap-2">
                <Settings className="h-5 w-5 text-gray-600" />
                Configurações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="flex items-center space-x-3 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                  <Checkbox
                    id="is_highlight"
                    checked={formData.is_highlight}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, is_highlight: !!checked })
                    }
                    className="data-[state=checked]:bg-yellow-500 data-[state=checked]:border-yellow-500"
                  />
                  <div>
                    <Label
                      htmlFor="is_highlight"
                      className="text-sm font-medium text-gray-700 cursor-pointer"
                    >
                      Produto em destaque
                    </Label>
                    <p className="text-xs text-gray-500">
                      Aparecerá em posição especial no cardápio
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg border border-green-200">
                  <Checkbox
                    id="is_available"
                    checked={formData.is_available}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, is_available: !!checked })
                    }
                    className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                  />
                  <div>
                    <Label
                      htmlFor="is_available"
                      className="text-sm font-medium text-gray-700 cursor-pointer"
                    >
                      Disponível
                    </Label>
                    <p className="text-xs text-gray-500">
                      Produto visível para os clientes
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Botões de Ação */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="px-6 py-2 hover:bg-gray-50 border-gray-300"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={saveMutation.isPending}
              className="px-8 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
            >
              {saveMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Salvando...
                </>
              ) : (
                "Salvar Produto"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductForm;
