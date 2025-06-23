
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import Header from '../components/Header';
import Hero from '../components/Hero';
import Categories from '../components/Categories';
import ProductGrid from '../components/ProductGrid';
import Footer from '../components/Footer';
import Cart from '../components/Cart';
import WhatsAppButton from '../components/WhatsAppButton';

const Index = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Todos');

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_extras (
            id,
            name,
            price
          )
        `)
        .eq('is_available', true)
        .order('is_highlight', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  const categories = ['Todos', ...new Set(products.map(product => product.category))];
  
  const filteredProducts = selectedCategory === 'Todos' 
    ? products 
    : products.filter(product => product.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-yellow-50">
      <Header onCartClick={() => setIsCartOpen(true)} />
      <Hero />
      
      <section id="cardapio" className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-gray-800 mb-12">
            Nosso Cardápio
          </h2>
          
          <Categories 
            categories={categories}
            selectedCategory={selectedCategory}
            onCategorySelect={setSelectedCategory}
          />
          
          <ProductGrid products={filteredProducts} isLoading={isLoading} />
        </div>
      </section>

      <Footer />
      
      <Cart isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
      <WhatsAppButton />
    </div>
  );
};

export default Index;
