export type ProductCategory = 
  | 'Watches'
  | 'Handbags'
  | 'Bangles'
  | 'Rings'
  | 'Earrings'
  | 'Jewellery Sets'
  | 'Jewellery'
  | 'Stainless Steel Jewellery'
  | "Men's Watches"
  | "Women's Watches"
  | (string & {});

export interface CollectionItem {
  id: string;
  name: string;
  description: string;
  image: string;
  tagline: string;
  isCustom?: boolean;
  createdAt?: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: ProductCategory;
  price: number; // in PKR
  salePrice?: number;
  images: string[];
  description: string;
  material?: string; // e.g. "316L Stainless Steel 18K PVD", "Velvet & Mirror Acrylic", "Premium Vegan Leather", "Kundan & Brass"
  goldPurity?: string; // kept optional for backwards compatibility
  waterproofGrade?: string; // e.g. "100% Waterproof & Anti-Tarnish"
  diamondDetails?: string; // kept optional for backwards compatibility
  customizationNotice?: string; // e.g. "Custom name printing available for bride & groom"
  ringSizes?: string[];
  stock: number;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  rating?: number;
  reviewsCount?: number;
  createdAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
}

export type PaymentMethod = 'cod' | 'bank_transfer' | 'jazzcash' | 'easypaisa' | 'online_card';

export type OrderStatus = 
  | 'Order Placed'
  | 'Confirmed'
  | 'Processing'
  | 'Shipped'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled';

export interface OrderItem {
  productId: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  selectedSize?: string;
  image: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  city: string;
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: 'pending' | 'paid' | 'failed';
  paymentReference?: string;
  orderStatus: OrderStatus;
  trackingNumber?: string;
  notes?: string;
  createdAt: string;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  phone?: string;
  role: 'customer' | 'admin';
  createdAt: string;
  updatedAt?: string;
  addresses?: {
    street: string;
    city: string;
    postalCode?: string;
    isDefault?: boolean;
  }[];
}

export interface Review {
  id: string;
  productId: string;
  userName: string;
  userId?: string;
  rating: number; // 1 to 5
  comment: string;
  createdAt: string;
}

export interface StoreSettings {
  freeShippingThreshold: number; // e.g. 100000 PKR
  standardShippingFee: number; // e.g. 1500 PKR
  announcement: string;
  contactPhone: string;
  contactEmail: string;
  address: string;
}
