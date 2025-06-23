
import { useState, useEffect } from 'react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
    name: '',
    description: '',
    price: '',
    original_price: '',
    image: '',
    category: '',
    is_highlight: false,
    is_available: true
  });

  const [extras, setExtras] = useState<ProductExtra[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar extras existentes do produto
  const { data: existingExtras } = useQuery({
    queryKey: ['product-extras', product?.id],
    queryFn: async () => {
      if (!product?.id) return [];
      const { data, error } = await supabase
        .from('product_extras')
        .select('*')
        .eq('product_id', product.id);
      
      if (error) throw error;
      return data;
    },
    enabled: !!product?.id
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || '',
        description: product.description || '',
        price: product.price?.toString() || '',
        original_price: product.original_price?.toString() || '',
        image: product.image || '',
        category: product.category || '',
        is_highlight: product.is_highlight || false,
        is_available: product.is_available !== false
      });
    } else {
      setFormData({
        name: '',
        description: '',
        price: '',
        original_price: '',
        image: '',
        category: '',
        is_highlight: false,
        is_available: true
      });
    }

    // Definir extras
    if (existingExtras && existingExtras.length > 0) {
      setExtras(existingExtras.map(extra => ({
        id: extra.id,
        name: extra.name,
        price: extra.price.toString()
      })));
    } else {
      setExtras([]);
    }
  }, [product, existingExtras]);

  const addExtra = () => {
    setExtras([...extras, { name: '', price: '' }]);
  };

  const removeExtra = (index: number) => {
    setExtras(extras.filter((_, i) => i !== index));
  };

  const updateExtra = (index: number, field: 'name' | 'price', value: string) => {
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
        original_price: data.original_price ? parseFloat(data.original_price) : null,
        image: data.image || null,
        category: data.category,
        is_highlight: data.is_highlight,
        is_available: data.is_available,
        updated_at: new Date().toISOString()
      };

      let productId = product?.id;

      if (product) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', product.id);
        if (error) throw error;
      } else {
        const { data: newProduct, error } = await supabase
          .from('products')
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
          .from('product_extras')
          .delete()
          .eq('product_id', productId);

        // Adicionar novos extras
        const validExtras = extras.filter(extra => extra.name.trim() && extra.price.trim());
        if (validExtras.length > 0) {
          const extrasData = validExtras.map(extra => ({
            product_id: productId,
            name: extra.name.trim(),
            price: parseFloat(extra.price)
          }));

          const { error: extrasError } = await supabase
            .from('product_extras')
            .insert(extrasData);
          
          if (extrasError) throw extrasError;
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product-extras'] });
      toast({
        title: product ? 'Produto atualizado' : 'Produto criado',
        description: 'Alterações salvas com sucesso!'
      });
      onClose();
    },
    onError: (error) => {
      toast({
        title: 'Erro',
        description: 'Erro ao salvar produto. Tente novamente.',
        variant: 'destructive'
      });
      console.error('Error saving product:', error);
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {product ? 'Editar Produto' : 'Novo Produto'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Categoria *</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="frangos">Frangos</SelectItem>
                  <SelectItem value="acompanhamentos">Acompanhamentos</SelectItem>
                  <SelectItem value="sobremesas">Sobremesas</SelectItem>
                  <SelectItem value="bebidas">Bebidas</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="price">Preço *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="original_price">Preço Original</Label>
              <Input
                id="original_price"
                type="number"
                step="0.01"
                value={formData.original_price}
                onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">URL da Imagem</Label>
            <Input
              id="image"
              type="url"
              value={formData.image}
              onChange={(e) => setFormData({ ...formData, image: e.target.value })}
              placeholder="https://exemplo.com/imagem.jpg"
            />
          </div>

          {/* Seção de Acompanhamentos/Extras */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Acompanhamentos/Extras</CardTitle>
                <Button type="button" variant="outline" size="sm" onClick={addExtra}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Extra
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {extras.map((extra, index) => (
                <div key={index} className="flex gap-2 items-end">
                  <div className="flex-1">
                    <Label>Nome do Extra</Label>
                    <Input
                      value={extra.name}
                      onChange={(e) => updateExtra(index, 'name', e.target.value)}
                      placeholder="Ex: Farofa Especial"
                    />
                  </div>
                  <div className="w-32">
                    <Label>Preço</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={extra.price}
                      onChange={(e) => updateExtra(index, 'price', e.target.value)}
                      placeholder="0.00"
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeExtra(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {extras.length === 0 && (
                <p className="text-gray-500 text-center py-4">
                  Nenhum acompanhamento adicionado. Clique em "Adicionar Extra" para começar.
                </p>
              )}
            </CardContent>
          </Card>

          <div className="flex space-x-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_highlight"
                checked={formData.is_highlight}
                onCheckedChange={(checked) => setFormData({ ...formData, is_highlight: !!checked })}
              />
              <Label htmlFor="is_highlight">Produto em destaque</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_available"
                checked={formData.is_available}
                onCheckedChange={(checked) => setFormData({ ...formData, is_available: !!checked })}
              />
              <Label htmlFor="is_available">Disponível</Label>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductForm;
