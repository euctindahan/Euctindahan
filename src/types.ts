
export type View = 'landing' | 'login' | 'signup' | 'shop' | 'cart' | 'checkout' | 'orders' | 'profile' | 'edit-profile' | 'seller-dashboard' | 'manage-products' | 'manage-orders' | 'product-details' | 'order-details' | 'messages' | 'chat' | 'wishlist' | 'notifications' | 'admin-dashboard' | 'verification-request' | 'about' | 'success-stories' | 'help' | 'safety' | 'privacy';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'order' | 'message' | 'promo';
  date: string;
  isRead: boolean;
}

export interface Message {
  id: string;
  sender: 'customer' | 'seller';
  text: string;
  image?: string;
  timestamp: string;
}

export interface Chat {
  id: string;
  productId: string;
  productName: string;
  customerId: string;
  customerName: string;
  sellerId: string;
  sellerName: string;
  messages: Message[];
  lastMessage: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  productId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
  category: string;
  sellerId: string;
  sellerName: string;
  sellerGcashNumber?: string;
  sellerGcashName?: string;
  stock: number;
  createdAt?: any;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerStudentId?: string;
  sellerId: string;
  items: CartItem[];
  status: 'PENDING' | 'PREPARING' | 'SHIPPED' | 'DELIVERED' | 'REJECTED' | 'CANCELLED';
  date: string;
  total: number;
  taxAmount?: number;
  taxPaidToAdmin?: boolean;
  paymentMethod: 'GCASH' | 'COD';
  paymentScreenshot?: string;
  paymentStatus?: 'PENDING' | 'VERIFIED' | 'FAILED';
  isCustomerVerified?: boolean;
  updatedAt?: string;
}

export interface AppSettings {
  id: string;
  heroImageUrl: string;
  maintenanceMode?: boolean;
  sellerRegistrationEnabled?: boolean;
  listingTaxRate?: number;
  activeSellers?: number;
  uniqueProducts?: number;
  studentOrders?: number;
  communityRating?: number;
  updatedAt: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role: 'customer' | 'seller' | 'admin';
  bio?: string;
  studentId?: string;
  gcashNumber?: string;
  gcashName?: string;
  isVerified?: boolean;
  verificationStatus?: 'none' | 'pending' | 'verified' | 'rejected';
  verificationData?: {
    idPhoto: string;
    additionalInfo: string;
    submittedAt: string;
  };
  isBlocked?: boolean;
  createdAt: string;
}
