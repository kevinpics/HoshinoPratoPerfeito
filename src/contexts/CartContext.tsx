
import React, { createContext, useContext, useState, useEffect } from 'react';

interface CartItem {
  id: string;
  name: string;
  price: number;
  image?: string;
  quantity: number;
  extras: Array<{
    id: string;
    name: string;
    price: number;
  }>;
}

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  total: number;
  addToCart: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  removeFromCart: (itemId: string, extras: any[]) => void;
  updateQuantity: (itemId: string, extras: any[], quantity: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const addToCart = (newItem: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
    const quantity = newItem.quantity || 1;
    const itemKey = `${newItem.id}-${newItem.extras.map(e => e.id).sort().join('-')}`;
    
    setItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(item => 
        item.id === newItem.id && 
        JSON.stringify(item.extras.sort((a, b) => a.id.localeCompare(b.id))) === 
        JSON.stringify(newItem.extras.sort((a, b) => a.id.localeCompare(b.id)))
      );

      if (existingItemIndex > -1) {
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + quantity
        };
        return updatedItems;
      } else {
        return [...prevItems, { ...newItem, quantity }];
      }
    });
  };

  const removeFromCart = (itemId: string, extras: any[]) => {
    setItems(prevItems => 
      prevItems.filter(item => 
        !(item.id === itemId && 
          JSON.stringify(item.extras.sort((a, b) => a.id.localeCompare(b.id))) === 
          JSON.stringify(extras.sort((a, b) => a.id.localeCompare(b.id))))
      )
    );
  };

  const updateQuantity = (itemId: string, extras: any[], quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId, extras);
      return;
    }

    setItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId && 
        JSON.stringify(item.extras.sort((a, b) => a.id.localeCompare(b.id))) === 
        JSON.stringify(extras.sort((a, b) => a.id.localeCompare(b.id)))
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  
  const total = items.reduce((sum, item) => {
    const itemTotal = item.price + item.extras.reduce((extraSum, extra) => extraSum + extra.price, 0);
    return sum + (itemTotal * item.quantity);
  }, 0);

  return (
    <CartContext.Provider 
      value={{ 
        items, 
        itemCount, 
        total, 
        addToCart, 
        removeFromCart, 
        updateQuantity,
        clearCart 
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
