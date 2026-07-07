export interface User {
  id: number;
  name: string;
  email: string;
  role: "user" | "admin";
  is_verified?: boolean;
  created_at: string;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  created_at: string;
}

export interface ProductImage {
  id: number;
  product_id: number;
  image_url: string;
  sort_order: number;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: number;
  stock_quantity: number;
  category_id: number;
  category_name?: string;
  image_url: string;
  model_variant: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  images?: ProductImage[];
  avg_rating?: number;
  review_count?: number;
  total_sold?: number;
}

export interface CartItem {
  id: number;
  cart_id: number;
  product_id: number;
  product_name?: string;
  product_image?: string;
  quantity: number;
  unit_price_snapshot: number;
}

export interface Cart {
  id: number;
  user_id: number;
  items: CartItem[];
}

export interface Address {
  id: number;
  user_id: number;
  full_name: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  is_default: boolean;
}

export type OrderStatus = "pending" | "paid" | "shipped" | "delivered" | "cancelled";

export interface OrderItem {
  id: number;
  order_id: number;
  product_id: number;
  product_name_snapshot: string;
  quantity: number;
  unit_price_snapshot: number;
  subtotal: number;
  product_image?: string;
  can_review?: boolean;
  has_reviewed?: boolean;
}

export interface Order {
  id: number;
  user_id: number;
  user_order_number: number;
  status: OrderStatus;
  total_amount: number;
  shipping_address: string;
  payment_status: "unpaid" | "paid" | "failed";
  stripe_payment_intent_id?: string;
  customer_name?: string;
  customer_email?: string;
  items?: OrderItem[];
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: number;
  product_id: number;
  user_id: number;
  user_name?: string;
  rating: number;
  comment: string;
  created_at: string;
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: {
    total?: number;
    page?: number;
    page_size?: number;
    pages?: number;
    [key: string]: unknown;
  };
}
