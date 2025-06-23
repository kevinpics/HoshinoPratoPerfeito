
-- Criar tabela de produtos
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  image TEXT,
  category TEXT NOT NULL,
  is_highlight BOOLEAN DEFAULT false,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de extras dos produtos
CREATE TABLE public.product_extras (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de pedidos
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT NOT NULL,
  customer_address TEXT,
  total_amount DECIMAL(10,2) NOT NULL,
  payment_method TEXT NOT NULL,
  delivery_type TEXT NOT NULL, -- 'delivery' ou 'pickup'
  status TEXT NOT NULL DEFAULT 'received', -- 'received', 'preparing', 'ready', 'delivered', 'cancelled'
  order_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de itens do pedido
CREATE TABLE public.order_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  product_name TEXT NOT NULL,
  product_price DECIMAL(10,2) NOT NULL,
  quantity INTEGER NOT NULL,
  extras JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Inserir produtos iniciais
INSERT INTO public.products (name, description, price, original_price, image, category, is_highlight) VALUES
('Frango Assado Tradicional', 'Frango inteiro temperado com nossos temperos especiais, assado lentamente até ficar dourado e suculento.', 35.90, 42.90, 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400&h=300&fit=crop', 'frangos', true),
('Frango Caipira', 'Frango caipira criado livre, com sabor mais intenso e textura especial.', 45.90, null, 'https://images.unsplash.com/photo-1594221708779-94832f4320d1?w=400&h=300&fit=crop', 'frangos', false),
('Meio Frango Assado', 'Metade do nosso delicioso frango assado, perfeito para uma pessoa.', 22.90, null, 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400&h=300&fit=crop', 'frangos', false),
('Batata Portuguesa', 'Batatas assadas com alecrim e temperos especiais, douradas no forno.', 15.90, null, 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&h=300&fit=crop', 'acompanhamentos', false),
('Arroz Temperado', 'Arroz branco temperado com cenoura, ervilha e temperos da casa.', 12.90, null, 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=300&fit=crop', 'acompanhamentos', false),
('Pudim de Leite Condensado', 'Pudim caseiro cremoso feito com leite condensado e calda de açúcar.', 8.90, null, 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400&h=300&fit=crop', 'sobremesas', true),
('Refrigerante Lata', 'Coca-Cola, Guaraná, Fanta Laranja ou Fanta Uva gelados.', 4.50, null, 'https://images.unsplash.com/photo-1581006852262-e4307cf6283a?w=400&h=300&fit=crop', 'bebidas', false);

-- Inserir extras para alguns produtos
INSERT INTO public.product_extras (product_id, name, price) 
SELECT p.id, 'Farofa Especial', 8.00 FROM public.products p WHERE p.name = 'Frango Assado Tradicional';

INSERT INTO public.product_extras (product_id, name, price) 
SELECT p.id, 'Maionese da Casa', 5.00 FROM public.products p WHERE p.name = 'Frango Assado Tradicional';

INSERT INTO public.product_extras (product_id, name, price) 
SELECT p.id, 'Vinagrete', 4.00 FROM public.products p WHERE p.name = 'Frango Assado Tradicional';

-- Habilitar Row Level Security
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_extras ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Políticas para acesso público aos produtos (somente leitura para clientes)
CREATE POLICY "Anyone can view products" ON public.products FOR SELECT USING (true);
CREATE POLICY "Anyone can view product extras" ON public.product_extras FOR SELECT USING (true);

-- Políticas para pedidos (qualquer um pode criar pedidos)
CREATE POLICY "Anyone can create orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can create order items" ON public.order_items FOR INSERT WITH CHECK (true);

-- Políticas temporárias para admin (depois implementaremos autenticação)
CREATE POLICY "Allow all for admin" ON public.products FOR ALL USING (true);
CREATE POLICY "Allow all for admin extras" ON public.product_extras FOR ALL USING (true);
CREATE POLICY "Allow all for admin orders" ON public.orders FOR ALL USING (true);
CREATE POLICY "Allow all for admin order items" ON public.order_items FOR ALL USING (true);
