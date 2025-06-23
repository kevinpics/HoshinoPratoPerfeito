
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface CouponInputProps {
  onCouponApplied: (coupon: any, discount: number) => void;
  onCouponRemoved: () => void;
  orderTotal: number;
  appliedCoupon: any;
}

const CouponInput = ({ onCouponApplied, onCouponRemoved, orderTotal, appliedCoupon }: CouponInputProps) => {
  const [couponCode, setCouponCode] = useState('');
  const { toast } = useToast();

  const validateCouponMutation = useMutation({
    mutationFn: async (code: string) => {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', code.toUpperCase())
        .eq('is_active', true)
        .single();

      if (error) throw new Error('Cupom não encontrado');

      // Verificar se o cupom não expirou
      if (data.expires_at && new Date(data.expires_at) < new Date()) {
        throw new Error('Este cupom expirou');
      }

      // Verificar se ainda há usos disponíveis
      if (data.max_uses && data.current_uses >= data.max_uses) {
        throw new Error('Este cupom atingiu o limite de usos');
      }

      // Verificar valor mínimo do pedido
      if (data.min_order_value && orderTotal < data.min_order_value) {
        throw new Error(`Valor mínimo do pedido: R$ ${Number(data.min_order_value).toFixed(2)}`);
      }

      return data;
    },
    onSuccess: (coupon) => {
      let discount = 0;
      if (coupon.discount_type === 'percentage') {
        discount = (orderTotal * coupon.discount_value) / 100;
      } else {
        discount = coupon.discount_value;
      }

      // Garantir que o desconto não seja maior que o total
      discount = Math.min(discount, orderTotal);

      onCouponApplied(coupon, discount);
      setCouponCode('');
      toast({
        title: 'Cupom aplicado!',
        description: `Desconto de R$ ${discount.toFixed(2)} aplicado.`
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Erro ao aplicar cupom',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  const handleApplyCoupon = () => {
    if (!couponCode.trim()) return;
    validateCouponMutation.mutate(couponCode);
  };

  const handleRemoveCoupon = () => {
    onCouponRemoved();
    toast({
      title: 'Cupom removido',
      description: 'O desconto foi removido do seu pedido.'
    });
  };

  if (appliedCoupon) {
    return (
      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
        <div className="flex items-center space-x-2">
          <Badge className="bg-green-500">
            {appliedCoupon.code}
          </Badge>
          <span className="text-sm text-green-700">
            Cupom aplicado!
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRemoveCoupon}
          className="text-red-500 hover:text-red-700"
        >
          Remover
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">Cupom de Desconto</label>
      <div className="flex space-x-2">
        <Input
          value={couponCode}
          onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
          placeholder="Digite o código do cupom"
        />
        <Button
          onClick={handleApplyCoupon}
          disabled={!couponCode.trim() || validateCouponMutation.isPending}
          variant="outline"
        >
          {validateCouponMutation.isPending ? 'Verificando...' : 'Aplicar'}
        </Button>
      </div>
    </div>
  );
};

export default CouponInput;
