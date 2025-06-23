
-- Tabela para avaliações de produtos
CREATE TABLE public.product_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para cupons de desconto
CREATE TABLE public.coupons (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  description TEXT,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value NUMERIC NOT NULL,
  min_order_value NUMERIC DEFAULT 0,
  max_uses INTEGER,
  current_uses INTEGER DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para uso de cupons
CREATE TABLE public.coupon_uses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  coupon_id UUID NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  discount_amount NUMERIC NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para programa de fidelidade
CREATE TABLE public.loyalty_points (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  points INTEGER DEFAULT 0,
  total_orders INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Tabela para configurações de entrega
CREATE TABLE public.delivery_zones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  fee NUMERIC NOT NULL DEFAULT 0,
  estimated_time INTEGER NOT NULL DEFAULT 45, -- em minutos
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adicionar colunas às tabelas existentes
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS coupon_code TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS discount_amount NUMERIC DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS delivery_fee NUMERIC DEFAULT 0;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS estimated_time INTEGER DEFAULT 45;

-- Inserir zonas de entrega padrão
INSERT INTO public.delivery_zones (name, fee, estimated_time) VALUES 
('Maringá', 10.00, 45),
('Sarandi', 5.00, 30),
('Retirada no Local', 0.00, 20);

-- Políticas RLS para avaliações
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view product reviews" 
  ON public.product_reviews 
  FOR SELECT 
  USING (true);

CREATE POLICY "Authenticated users can create reviews" 
  ON public.product_reviews 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews" 
  ON public.product_reviews 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reviews" 
  ON public.product_reviews 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Políticas RLS para cupons (admin only para criar/editar)
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active coupons" 
  ON public.coupons 
  FOR SELECT 
  USING (is_active = true);

-- Políticas RLS para uso de cupons
ALTER TABLE public.coupon_uses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own coupon uses" 
  ON public.coupon_uses 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Políticas RLS para pontos de fidelidade
ALTER TABLE public.loyalty_points ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own loyalty points" 
  ON public.loyalty_points 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Políticas RLS para zonas de entrega
ALTER TABLE public.delivery_zones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active delivery zones" 
  ON public.delivery_zones 
  FOR SELECT 
  USING (is_active = true);

-- Função para calcular média de avaliações
CREATE OR REPLACE FUNCTION public.get_product_rating(product_id uuid)
RETURNS TABLE(average_rating numeric, total_reviews integer)
LANGUAGE sql
STABLE
AS $$
  SELECT 
    ROUND(AVG(rating), 1) as average_rating,
    COUNT(*)::integer as total_reviews
  FROM public.product_reviews 
  WHERE product_reviews.product_id = $1;
$$;

-- Função para atualizar pontos de fidelidade
CREATE OR REPLACE FUNCTION public.update_loyalty_points(user_id uuid, order_total numeric)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.loyalty_points (user_id, points, total_orders)
  VALUES (user_id, FLOOR(order_total), 1)
  ON CONFLICT (user_id)
  DO UPDATE SET
    points = loyalty_points.points + FLOOR(order_total),
    total_orders = loyalty_points.total_orders + 1,
    updated_at = now();
END;
$$;
