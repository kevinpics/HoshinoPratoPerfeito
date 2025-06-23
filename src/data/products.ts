
import { Product } from '../types/product';

export const products: Product[] = [
  // Frangos
  {
    id: 'frango-tradicional',
    name: 'Frango Assado Tradicional',
    description: 'Frango inteiro temperado com nossos temperos especiais, assado lentamente até ficar dourado e suculento.',
    price: 35.90,
    originalPrice: 42.90,
    image: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400&h=300&fit=crop',
    category: 'frangos',
    isHighlight: true,
    extras: [
      { id: 'farofa', name: 'Farofa Especial', price: 8.00 },
      { id: 'maionese', name: 'Maionese da Casa', price: 5.00 },
      { id: 'vinagrete', name: 'Vinagrete', price: 4.00 }
    ]
  },
  {
    id: 'frango-caipira',
    name: 'Frango Caipira',
    description: 'Frango caipira criado livre, com sabor mais intenso e textura especial.',
    price: 45.90,
    image: 'https://images.unsplash.com/photo-1594221708779-94832f4320d1?w=400&h=300&fit=crop',
    category: 'frangos',
    extras: [
      { id: 'farofa', name: 'Farofa Especial', price: 8.00 },
      { id: 'maionese', name: 'Maionese da Casa', price: 5.00 }
    ]
  },
  {
    id: 'meio-frango',
    name: 'Meio Frango Assado',
    description: 'Metade do nosso delicioso frango assado, perfeito para uma pessoa.',
    price: 22.90,
    image: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400&h=300&fit=crop',
    category: 'frangos',
    extras: [
      { id: 'farofa', name: 'Farofa Especial', price: 6.00 },
      { id: 'maionese', name: 'Maionese da Casa', price: 4.00 }
    ]
  },

  // Acompanhamentos
  {
    id: 'batata-portuguesa',
    name: 'Batata Portuguesa',
    description: 'Batatas assadas com alecrim e temperos especiais, douradas no forno.',
    price: 15.90,
    image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&h=300&fit=crop',
    category: 'acompanhamentos'
  },
  {
    id: 'arroz-temperado',
    name: 'Arroz Temperado',
    description: 'Arroz branco temperado com cenoura, ervilha e temperos da casa.',
    price: 12.90,
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=300&fit=crop',
    category: 'acompanhamentos'
  },
  {
    id: 'salada-mista',
    name: 'Salada Mista',
    description: 'Mix de folhas verdes, tomate, pepino e cenoura com molho especial.',
    price: 10.90,
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop',
    category: 'acompanhamentos'
  },
  {
    id: 'pao-alho',
    name: 'Pão de Alho',
    description: 'Pão francês tostado com manteiga de alho e ervas finas.',
    price: 8.90,
    image: 'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=400&h=300&fit=crop',
    category: 'acompanhamentos'
  },

  // Sobremesas
  {
    id: 'pudim-leite-condensado',
    name: 'Pudim de Leite Condensado',
    description: 'Pudim caseiro cremoso feito com leite condensado e calda de açúcar.',
    price: 8.90,
    image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400&h=300&fit=crop',
    category: 'sobremesas',
    isHighlight: true
  },
  {
    id: 'brigadeiro-gourmet',
    name: 'Brigadeiro Gourmet',
    description: 'Brigadeiros artesanais com chocolate belga, granulado especial.',
    price: 3.50,
    image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=300&fit=crop',
    category: 'sobremesas'
  },
  {
    id: 'mousse-maracuja',
    name: 'Mousse de Maracujá',
    description: 'Mousse cremoso de maracujá com polpa natural da fruta.',
    price: 7.90,
    image: 'https://images.unsplash.com/photo-1541599468348-e96984315921?w=400&h=300&fit=crop',
    category: 'sobremesas'
  },

  // Bebidas
  {
    id: 'refrigerante-lata',
    name: 'Refrigerante Lata',
    description: 'Coca-Cola, Guaraná, Fanta Laranja ou Fanta Uva gelados.',
    price: 4.50,
    image: 'https://images.unsplash.com/photo-1581006852262-e4307cf6283a?w=400&h=300&fit=crop',
    category: 'bebidas'
  },
  {
    id: 'suco-natural',
    name: 'Suco Natural',
    description: 'Sucos naturais de laranja, limão, maracujá ou acerola.',
    price: 6.90,
    image: 'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?w=400&h=300&fit=crop',
    category: 'bebidas'
  },
  {
    id: 'agua-mineral',
    name: 'Água Mineral',
    description: 'Água mineral gelada 500ml.',
    price: 3.00,
    image: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400&h=300&fit=crop',
    category: 'bebidas'
  }
];
