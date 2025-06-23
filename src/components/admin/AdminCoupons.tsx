
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AdminCoupons = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discount_type: 'percentage',
    discount_value: '',
    min_order_value: '',
    max_uses: '',
    expires_at: ''
  });

  const { data: coupons = [], isLoading } = useQuery({
    queryKey: ['admin-coupons'],
    queryFn: async () => {
      // Use service role to bypass RLS for admin operations
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching coupons:', error);
        throw error;
      }
      return data;
    }
  });

  const createCouponMutation = useMutation({
    mutationFn: async (couponData: any) => {
      console.log('Creating coupon with data:', couponData);
      
      // Use RPC call to create coupon with admin privileges
      const { data, error } = await supabase.rpc('admin_create_coupon', {
        coupon_data: couponData
      });

      if (error) {
        console.error('Error creating coupon:', error);
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
      setShowForm(false);
      setFormData({
        code: '',
        description: '',
        discount_type: 'percentage',
        discount_value: '',
        min_order_value: '',
        max_uses: '',
        expires_at: ''
      });
      toast({
        title: 'Cupom criado!',
        description: 'Cupom de desconto criado com sucesso.'
      });
    },
    onError: (error: any) => {
      console.error('Mutation error:', error);
      toast({
        title: 'Erro ao criar cupom',
        description: error.message || 'Tente novamente mais tarde.',
        variant: 'destructive'
      });
    }
  });

  const updateCouponMutation = useMutation({
    mutationFn: async ({ id, ...updateData }: any) => {
      console.log('Updating coupon:', id, updateData);
      
      const { data, error } = await supabase.rpc('admin_update_coupon', {
        coupon_id: id,
        coupon_data: updateData
      });

      if (error) {
        console.error('Error updating coupon:', error);
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
      setEditingCoupon(null);
      setShowForm(false);
      toast({
        title: 'Cupom atualizado!',
        description: 'Cupom atualizado com sucesso.'
      });
    },
    onError: (error: any) => {
      console.error('Update mutation error:', error);
      toast({
        title: 'Erro ao atualizar cupom',
        description: error.message || 'Tente novamente mais tarde.',
        variant: 'destructive'
      });
    }
  });

  const deleteCouponMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.rpc('admin_delete_coupon', {
        coupon_id: id
      });

      if (error) {
        console.error('Error deleting coupon:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
      toast({
        title: 'Cupom excluído!',
        description: 'Cupom removido com sucesso.'
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const couponData = {
      code: formData.code.toUpperCase(),
      description: formData.description,
      discount_type: formData.discount_type,
      discount_value: parseFloat(formData.discount_value),
      min_order_value: formData.min_order_value ? parseFloat(formData.min_order_value) : 0,
      max_uses: formData.max_uses ? parseInt(formData.max_uses) : null,
      expires_at: formData.expires_at ? new Date(formData.expires_at).toISOString() : null
    };

    if (editingCoupon) {
      updateCouponMutation.mutate({ id: editingCoupon.id, ...couponData });
    } else {
      createCouponMutation.mutate(couponData);
    }
  };

  const handleEdit = (coupon: any) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      description: coupon.description || '',
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value.toString(),
      min_order_value: coupon.min_order_value?.toString() || '',
      max_uses: coupon.max_uses?.toString() || '',
      expires_at: coupon.expires_at ? new Date(coupon.expires_at).toISOString().split('T')[0] : ''
    });
    setShowForm(true);
  };

  if (isLoading) {
    return <div className="text-center py-8">Carregando cupons...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gerenciar Cupons</h2>
        <Button 
          onClick={() => {
            setShowForm(true);
            setEditingCoupon(null);
            setFormData({
              code: '',
              description: '',
              discount_type: 'percentage',
              discount_value: '',
              min_order_value: '',
              max_uses: '',
              expires_at: ''
            });
          }}
          className="bg-orange-500 hover:bg-orange-600"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Cupom
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingCoupon ? 'Editar Cupom' : 'Criar Novo Cupom'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Código do Cupom *</label>
                  <Input
                    value={formData.code}
                    onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                    placeholder="DESCONTO10"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Tipo de Desconto *</label>
                  <Select 
                    value={formData.discount_type} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, discount_type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="percentage">Porcentagem (%)</SelectItem>
                      <SelectItem value="fixed">Valor Fixo (R$)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Valor do Desconto * {formData.discount_type === 'percentage' ? '(%)' : '(R$)'}
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.discount_value}
                    onChange={(e) => setFormData(prev => ({ ...prev, discount_value: e.target.value }))}
                    placeholder={formData.discount_type === 'percentage' ? '10' : '5.00'}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Valor Mínimo do Pedido (R$)</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.min_order_value}
                    onChange={(e) => setFormData(prev => ({ ...prev, min_order_value: e.target.value }))}
                    placeholder="50.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Máximo de Usos</label>
                  <Input
                    type="number"
                    value={formData.max_uses}
                    onChange={(e) => setFormData(prev => ({ ...prev, max_uses: e.target.value }))}
                    placeholder="100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Data de Expiração</label>
                  <Input
                    type="date"
                    value={formData.expires_at}
                    onChange={(e) => setFormData(prev => ({ ...prev, expires_at: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Descrição</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Descrição do cupom..."
                />
              </div>

              <div className="flex space-x-2">
                <Button type="submit" disabled={createCouponMutation.isPending || updateCouponMutation.isPending}>
                  {(createCouponMutation.isPending || updateCouponMutation.isPending) ? 'Salvando...' : (editingCoupon ? 'Atualizar' : 'Criar')} Cupom
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Lista de Cupons</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Desconto</TableHead>
                <TableHead>Usos</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Validade</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coupons.map((coupon) => (
                <TableRow key={coupon.id}>
                  <TableCell className="font-medium">{coupon.code}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {coupon.discount_type === 'percentage' ? 'Porcentagem' : 'Valor Fixo'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {coupon.discount_type === 'percentage' 
                      ? `${coupon.discount_value}%` 
                      : `R$ ${Number(coupon.discount_value).toFixed(2)}`
                    }
                  </TableCell>
                  <TableCell>
                    {coupon.current_uses || 0}
                    {coupon.max_uses && ` / ${coupon.max_uses}`}
                  </TableCell>
                  <TableCell>
                    <Badge variant={coupon.is_active ? "default" : "secondary"}>
                      {coupon.is_active ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {coupon.expires_at 
                      ? new Date(coupon.expires_at).toLocaleDateString('pt-BR')
                      : 'Sem expiração'
                    }
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(coupon)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteCouponMutation.mutate(coupon.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminCoupons;
