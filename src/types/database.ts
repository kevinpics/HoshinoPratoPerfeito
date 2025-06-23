export interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  original_price: number | null;
  image: string | null;
  category: string;
  is_highlight: boolean;
  is_available: boolean;
  created_at: string;
  updated_at: string;
  extras?: ProductExtra[];
}

export interface ProductExtra {
  id: string;
  product_id: string;
  name: string;
  price: number;
  created_at: string;
}

export interface Order {
  id: string;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string;
  customer_address: string | null;
  total_amount: number;
  payment_method: string;
  delivery_type: string;
  status: string;
  order_date: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  product_price: number;
  quantity: number;
  extras: any[];
  created_at: string;
}
