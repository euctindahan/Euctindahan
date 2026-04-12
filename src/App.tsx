/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import * as React from 'react';
import { useState, useEffect, useMemo, useCallback, ReactNode } from 'react';
import { 
  ShoppingCart, 
  User, 
  Home, 
  ClipboardList, 
  ChevronLeft, 
  Plus, 
  Trash2, 
  Edit, 
  Star, 
  Package, 
  Truck, 
  CheckCircle,
  CheckCircle2,
  Calendar,
  Eye,
  EyeOff,
  Camera,
  Settings,
  Image,
  MapPin,
  Search,
  X,
  ArrowUpDown,
  MessageSquare,
  Send,
  TrendingUp,
  DollarSign,
  BarChart3,
  Heart,
  Bell,
  Moon,
  Sun,
  Filter,
  ArrowRight,
  Info,
  Clock,
  LogOut,
  ShieldCheck,
  CreditCard,
  Database,
  LayoutGrid,
  ChevronRight,
  ShoppingBag,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { Toaster, toast } from 'sonner';
import { 
  auth, 
  db, 
  googleProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  Timestamp,
  serverTimestamp,
  addDoc,
  limit,
  or,
  handleFirestoreError,
  OperationType,
  FirebaseUser
} from './firebase';

import { 
  View, 
  Notification, 
  Message, 
  Chat, 
  Review, 
  Product, 
  CartItem, 
  Order, 
  AppSettings,
  UserProfile 
} from './types';
import { CATEGORIES, PRODUCTS, ADMIN_EMAILS } from './constants';
import { ErrorBoundary, LoadingOverlay, StarRating } from './components/Common';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { InfoView } from './components/InfoView';

// --- Error Boundary ---
// Moved to components/Common.tsx

// --- Loading Overlay ---
// Moved to components/Common.tsx

// --- Components ---
// Moved to components/Common.tsx

const BottomNav = ({ navigateTo, currentView, cart, chats, userRole, userProfile, currentUser }: any) => {
  const navItems = [
    { id: 'landing', icon: Home, label: 'Home' },
    { id: 'shop', icon: ShoppingBag, label: 'Shop' },
    { id: 'cart', icon: ShoppingCart, label: 'Cart', badge: cart.length },
    { id: 'messages', icon: MessageSquare, label: 'Chat', dot: chats.some((c: any) => c.messages.some((m: any) => m.sender !== userRole)) },
    { id: 'orders', icon: ClipboardList, label: 'Orders' },
    { id: 'profile', icon: User, label: 'Profile' }
  ];

  if (userProfile?.role === 'admin' && ADMIN_EMAILS.includes(currentUser?.email)) {
    navItems.push({ id: 'admin-dashboard', icon: ShieldCheck, label: 'Admin' });
  }

  return (
    <nav className="fixed bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-fit px-2 md:px-6">
      <div className="bg-black/80 dark:bg-black/90 backdrop-blur-3xl rounded-[1.5rem] md:rounded-[2.5rem] p-1 md:p-2 flex items-center gap-0.5 md:gap-1 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id || (item.id === 'landing' && currentView === 'landing') || (item.id === 'shop' && currentView === 'product-details') || (item.id === 'messages' && currentView === 'chat');
          
          return (
            <motion.button 
              key={item.id}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => navigateTo(item.id)}
              className={`relative flex flex-col items-center justify-center w-11 h-11 md:w-14 md:h-14 rounded-xl md:rounded-2xl transition-all duration-500 ${
                isActive 
                  ? 'bg-maroon text-white shadow-[0_10px_20px_rgba(128,0,0,0.4)]' 
                  : 'text-gray-500 hover:text-white'
              }`}
            >
              <Icon size={16} md:size={18} strokeWidth={isActive ? 3 : 2} />
              {item.badge > 0 && (
                <span className="absolute -top-1 -right-1 bg-white text-maroon text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-maroon">
                  {item.badge}
                </span>
              )}
              {item.dot && (
                <span className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full border border-black animate-pulse"></span>
              )}
              <span className={`text-[7px] font-black uppercase tracking-widest mt-1 ${isActive ? 'opacity-100' : 'opacity-0'}`}>
                {item.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
};

const ShopView = React.memo(({ 
  allProducts, 
  searchQuery, 
  setSearchQuery, 
  selectedCategory, 
  setSelectedCategory, 
  sortBy, 
  setSortBy, 
  reviews, 
  setSelectedProduct, 
  navigateTo,
  addToCart,
  headerProps,
  bottomNavProps
}: any) => {
  const [localSearch, setLocalSearch] = useState(searchQuery);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(localSearch);
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearch, setSearchQuery]);

  // Sync local search if global search is cleared
  useEffect(() => {
    if (searchQuery === '') {
      setLocalSearch('');
    }
  }, [searchQuery]);

  const filteredProducts = useMemo(() => {
    return allProducts
      .filter((p: any) => {
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             p.description?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = !selectedCategory || p.category === selectedCategory;
        return matchesSearch && matchesCategory;
      })
      .sort((a: any, b: any) => {
        if (sortBy === 'price-low') return a.price - b.price;
        if (sortBy === 'price-high') return b.price - a.price;
        if (sortBy === 'name-asc') return a.name.localeCompare(b.name);
        return 0;
      });
  }, [allProducts, searchQuery, selectedCategory, sortBy]);

  return (
    <div className="pb-40 bg-surface dark:bg-[#050505] min-h-screen relative">
      <div className="noise-overlay"></div>
      <Header {...headerProps} />
      
      <div className="p-4 md:p-12 lg:p-20 max-w-[1600px] mx-auto space-y-12 md:space-y-20">
        {/* Page Header - Editorial Style */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 md:gap-12 border-b border-gray-100 dark:border-white/5 pb-10 md:pb-16">
          <div className="space-y-4 md:space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 md:w-16 h-px bg-maroon"></div>
              <span className="text-maroon font-black text-[8px] md:text-[10px] uppercase tracking-[0.6em]">Premium Marketplace</span>
            </div>
            <h2 className="text-[clamp(2.5rem,8vw,6rem)] font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-[0.75]">
              The <br /><span className="text-maroon italic">Collection</span>
            </h2>
          </div>
          <div className="flex flex-col md:flex-row items-center gap-6 w-full lg:w-auto">
            <div className="flex items-center gap-2 bg-white dark:bg-[#0a0a0a] p-2 rounded-2xl shadow-premium border border-gray-100 dark:border-white/5 w-full md:w-auto">
              <div className="flex items-center gap-3 text-gray-400 px-4">
                <Filter size={16} />
                <span className="text-[10px] font-black uppercase tracking-widest">Sort By</span>
              </div>
              <div className="flex gap-1">
                {[
                  { id: 'default', label: 'Latest' },
                  { id: 'price-low', label: 'Price: Low' },
                  { id: 'price-high', label: 'Price: High' }
                ].map(opt => (
                  <button 
                    key={opt.id}
                    onClick={() => setSortBy(opt.id as any)}
                    className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all duration-500 ${sortBy === opt.id ? 'bg-maroon text-white shadow-xl' : 'text-gray-400 hover:text-maroon hover:bg-maroon/5'}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

          {/* Search & Categories - Refined */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-4 space-y-8 md:space-y-12 lg:sticky lg:top-32">
              <div className="relative group">
                <Search className="absolute left-6 md:left-8 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-maroon transition-all duration-500" size={20} md:size={28} />
                <input 
                  type="text" 
                  placeholder="Search unique creations..." 
                  className="w-full bg-white dark:bg-[#0a0a0a] border-2 border-transparent rounded-2xl md:rounded-[2.5rem] py-5 md:py-8 pl-16 md:pl-20 pr-10 md:pr-12 text-sm md:text-lg font-bold focus:border-maroon/20 focus:ring-0 outline-none dark:text-white shadow-premium transition-all duration-500"
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                />
                {localSearch && (
                  <button 
                    onClick={() => { setLocalSearch(''); setSearchQuery(''); }}
                    className="absolute right-8 top-1/2 -translate-y-1/2 text-gray-300 hover:text-maroon transition-colors"
                  >
                    <X size={24} />
                  </button>
                )}
              </div>

              <div className="space-y-6">
                <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-400 px-4">Categories</h4>
                <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-4 lg:pb-0 no-scrollbar px-2 lg:px-0">
                  <button 
                    onClick={() => setSelectedCategory(null)}
                    className={`flex items-center justify-between px-6 lg:px-8 py-4 lg:py-5 rounded-[1.5rem] lg:rounded-[2rem] text-[10px] lg:text-xs font-black uppercase tracking-[0.2em] transition-all duration-500 whitespace-nowrap ${!selectedCategory ? 'bg-maroon text-white shadow-2xl lg:translate-x-4' : 'text-gray-500 bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-white/5 hover:bg-maroon/5'}`}
                  >
                    All Collections
                    {!selectedCategory && <ArrowRight size={16} className="hidden lg:block" />}
                  </button>
                  {CATEGORIES.map(cat => (
                    <button 
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`flex items-center justify-between px-6 lg:px-8 py-4 lg:py-5 rounded-[1.5rem] lg:rounded-[2rem] text-[10px] lg:text-xs font-black uppercase tracking-[0.2em] transition-all duration-500 whitespace-nowrap ${selectedCategory === cat.id ? 'bg-maroon text-white shadow-2xl lg:translate-x-4' : 'text-gray-500 bg-white dark:bg-[#0a0a0a] border border-gray-100 dark:border-white/5 hover:bg-maroon/5'}`}
                    >
                      <div className="flex items-center gap-3 lg:gap-4">
                        <span className="text-lg">{cat.icon}</span>
                        {cat.name}
                      </div>
                      {selectedCategory === cat.id && <ArrowRight size={16} className="hidden lg:block" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-8">
              {filteredProducts.length === 0 ? (
              <div className="text-center py-40 space-y-10 bg-white dark:bg-[#0a0a0a] rounded-[4rem] shadow-premium border border-gray-100 dark:border-white/5">
                <div className="w-32 h-32 bg-maroon/5 rounded-full flex items-center justify-center mx-auto animate-pulse">
                  <Search size={56} className="text-maroon/20" />
                </div>
                <div className="space-y-4">
                  <p className="font-black text-gray-900 dark:text-white uppercase tracking-tighter text-4xl">No matches found</p>
                  <p className="text-gray-400 text-lg font-medium tracking-tight">Try adjusting your filters or search terms.</p>
                  <button 
                    onClick={() => { setLocalSearch(''); setSearchQuery(''); setSelectedCategory(null); }} 
                    className="mt-8 bg-maroon text-white px-12 py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-black transition-all shadow-premium"
                  >
                    Reset All Filters
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-12">
            {filteredProducts.map((product: any, idx: number) => {
              const productReviews = reviews.filter((r: any) => r.productId === product.id);
              const avgRating = productReviews.length > 0 
                ? productReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / productReviews.length 
                : 0;

                    return (
                      <motion.div 
                        layout
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        whileHover={{ y: -20 }}
                        key={product.id} 
                        className="bg-white dark:bg-[#0a0a0a] rounded-[4rem] shadow-premium hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] border border-gray-100 dark:border-white/5 overflow-hidden flex flex-col cursor-pointer transition-all duration-700 group" 
                        onClick={() => { setSelectedProduct(product); navigateTo('product-details'); }}
                      >
                        <div className="relative aspect-[3/4] overflow-hidden">
                          <img src={product.images[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2000ms] ease-out" alt={product.name} />
                          
                          <div className="absolute top-10 left-10 flex flex-col gap-4">
                            <div className="bg-white/10 backdrop-blur-2xl px-6 py-3 rounded-full text-white text-[9px] font-black uppercase tracking-[0.3em] border border-white/20 shadow-2xl">
                              {product.category}
                            </div>
                            {product.stock <= 0 ? (
                              <div className="bg-red-500 text-white px-6 py-3 rounded-full text-[9px] font-black uppercase tracking-[0.3em] shadow-2xl">
                                Sold Out
                              </div>
                            ) : product.stock <= 5 && (
                              <div className="bg-orange-500 text-white px-6 py-3 rounded-full text-[9px] font-black uppercase tracking-[0.3em] shadow-2xl animate-pulse">
                                Limited: {product.stock} Left
                              </div>
                            )}
                          </div>

                          <div className="absolute bottom-0 left-0 right-0 p-10 bg-gradient-to-t from-black via-black/20 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-700">
                            <motion.button 
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              disabled={product.stock <= 0}
                              onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                              className={`w-full py-6 rounded-2xl font-black uppercase text-[10px] tracking-[0.3em] flex items-center justify-center gap-4 transition-all shadow-2xl ${product.stock <= 0 ? 'bg-gray-800 text-white/30 cursor-not-allowed' : 'bg-white text-maroon hover:bg-maroon hover:text-white'}`}
                            >
                              <ShoppingCart size={20} />
                              {product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
                            </motion.button>
                          </div>
                        </div>

                  <div className="p-10 space-y-6 flex-1 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start gap-4">
                        <h3 className="font-black text-2xl uppercase tracking-tighter text-gray-900 dark:text-white leading-none truncate flex-1">{product.name}</h3>
                        <p className="font-black text-maroon text-2xl leading-none tracking-tighter">₱{product.price.toLocaleString()}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="bg-yellow-400/10 px-2 py-1 rounded-lg">
                          <StarRating rating={avgRating} size={12} />
                        </div>
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">({productReviews.length} Reviews)</span>
                      </div>
                    </div>

                    <div className="pt-6 border-t border-gray-50 dark:border-white/5 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-maroon/10 rounded-full flex items-center justify-center text-maroon">
                          <User size={12} />
                        </div>
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{product.sellerName || 'Student Seller'}</span>
                      </div>
                      <div className="w-10 h-10 bg-gray-50 dark:bg-white/5 rounded-xl flex items-center justify-center text-gray-400 group-hover:bg-maroon group-hover:text-white transition-all duration-500">
                        <ArrowRight size={20} />
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
            </div>
          )}
        </div>
      </div>
    </div>
    <BottomNav {...bottomNavProps} />
  </div>
);
});

const MessageInput = ({ onSend, isSending, selectedChatImage, handleImageUpload }: any) => {
  const [localMessage, setLocalMessage] = useState('');

  const handleSend = () => {
    if ((!localMessage.trim() && !selectedChatImage) || isSending) return;
    onSend(localMessage);
    setLocalMessage('');
  };

  return (
    <div className="flex gap-4 items-center">
      <label className="cursor-pointer w-14 h-14 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center text-gray-400 hover:text-maroon transition-all hover:bg-maroon/5">
        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
        <Camera size={24} />
      </label>
      <div className="flex-1 relative">
        <input 
          type="text" 
          placeholder="Type a message..." 
          className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-[2rem] py-5 px-8 text-sm font-bold focus:ring-2 focus:ring-maroon outline-none dark:text-white shadow-inner transition-all"
          value={localMessage}
          onChange={(e) => setLocalMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
      </div>
      <motion.button 
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleSend}
        disabled={(!localMessage.trim() && !selectedChatImage) || isSending}
        className="bg-maroon text-white p-5 rounded-[1.5rem] shadow-2xl disabled:opacity-50 disabled:shadow-none transition-all hover:bg-black"
      >
        {isSending ? (
          <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        ) : (
          <Send size={24} />
        )}
      </motion.button>
    </div>
  );
};

const TaxRateSettings = ({ initialRate, onSave }: { initialRate: number, onSave: (rate: number) => void }) => {
  const [inputValue, setInputValue] = useState(((initialRate || 0) * 100).toString());

  useEffect(() => {
    setInputValue(((initialRate || 0) * 100).toString());
  }, [initialRate]);

  return (
    <div className="flex flex-col gap-4 p-6 bg-gray-50 dark:bg-white/5 rounded-[2rem]">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-black dark:text-white uppercase tracking-tight">Listing Tax Rate (%)</p>
          <p className="text-[10px] text-gray-400 font-medium">Commission percentage per sale</p>
        </div>
        <div className="flex items-center gap-4">
          <input 
            type="text" 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="w-20 bg-white dark:bg-gray-800 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2 text-xs font-black text-maroon text-center outline-none focus:ring-2 focus:ring-maroon"
          />
          <span className="text-xs font-black text-gray-400">%</span>
        </div>
      </div>
      <button 
        onClick={() => {
          const rate = parseFloat(inputValue);
          if (!isNaN(rate)) {
            onSave(rate / 100);
          } else {
            toast.error('Please enter a valid number');
          }
        }}
        className="w-full bg-maroon text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:scale-[1.02] transition-all"
      >
        Save Tax Rate
      </button>
    </div>
  );
};

export default function App() {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [currentView, setCurrentView] = useState<View>(() => {
    const saved = localStorage.getItem('currentView');
    return (saved as View) || 'landing';
  });
  const [previousView, setPreviousView] = useState<View>('landing');
  const [userRole, setUserRole] = useState<'customer' | 'seller'>('customer');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [reviewingProduct, setReviewingProduct] = useState<Product | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'price-low' | 'price-high' | 'name-asc' | 'default'>('default');
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [selectedChatImage, setSelectedChatImage] = useState<string | null>(null);
  const chatEndRef = React.useRef<HTMLDivElement>(null);
  const [isSending, setIsSending] = useState(false);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [appSettings, setAppSettings] = useState<AppSettings | null>(null);
  const [confirmAction, setConfirmAction] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
    confirmText: string;
    type: 'danger' | 'primary';
  } | null>(null);

  const [showPasscodeModal, setShowPasscodeModal] = useState(false);
  const [passcodeAction, setPasscodeAction] = useState<'admin-dashboard' | 'restrict-user' | null>(null);
  const [pendingRestrictUser, setPendingRestrictUser] = useState<{ userId: string, currentStatus: boolean } | null>(null);
  const [passcodeInput, setPasscodeInput] = useState('');
  const [isPasscodeError, setIsPasscodeError] = useState(false);

  const handlePasscodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcodeInput === '071106') {
      const action = passcodeAction;
      setShowPasscodeModal(false);
      setPasscodeInput('');
      setIsPasscodeError(false);
      setPasscodeAction(null);

      if (action === 'admin-dashboard') {
        navigateTo('admin-dashboard', true);
      } else if (action === 'restrict-user' && pendingRestrictUser) {
        executeToggleUserBlock(pendingRestrictUser.userId, pendingRestrictUser.currentStatus);
        setPendingRestrictUser(null);
      }
    } else {
      setIsPasscodeError(true);
      toast.error('Incorrect Passcode');
    }
  };

  const sendPasscodeChangeRequest = async () => {
    if (!currentUser?.email) return;
    
    toast.promise(
      fetch('/api/send-admin-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminEmail: ADMIN_EMAILS[0],
          userEmail: currentUser.email,
          requestType: 'Change Admin Passcode',
          timestamp: new Date().toLocaleString()
        })
      }),
      {
        loading: 'Sending request to admin...',
        success: 'Request sent! Please wait for the admin to contact you.',
        error: 'Failed to send request. Please try again later.'
      }
    );
  };

  // --- Admin Stats Sync ---
  useEffect(() => {
    if (userProfile?.role !== 'admin') return;

    const syncStats = async () => {
      const sellersCount = allUsers.filter(u => u.role === 'seller').length;
      const productsCount = allProducts.length;
      const ordersCount = allOrders.length;
      const avgRating = reviews.length > 0 
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length 
        : 4.9;

      // Only update if values have changed significantly to avoid infinite loops
      if (
        appSettings && (
          appSettings.activeSellers !== sellersCount ||
          appSettings.uniqueProducts !== productsCount ||
          appSettings.studentOrders !== ordersCount ||
          Math.abs((appSettings.communityRating || 0) - avgRating) > 0.05
        )
      ) {
        try {
          await updateDoc(doc(db, 'settings', 'global'), {
            activeSellers: sellersCount,
            uniqueProducts: productsCount,
            studentOrders: ordersCount,
            communityRating: avgRating,
            updatedAt: new Date().toISOString()
          });
        } catch (error) {
          console.error("Error syncing admin stats:", error);
        }
      }
    };

    const timer = setTimeout(syncStats, 2000); // Debounce sync
    return () => clearTimeout(timer);
  }, [allUsers, allProducts, allOrders, reviews, userProfile, appSettings]);

  useEffect(() => {
    if (isAuthReady && currentUser && (currentView === 'login' || currentView === 'signup')) {
      navigateTo('shop');
    }
  }, [isAuthReady, currentUser, currentView]);

  // --- Navigation ---
  const navigateTo = (view: View, bypassSecurity = false) => {
    if (view === currentView) return;

    if (view === 'admin-dashboard' && !bypassSecurity) {
      if (userProfile?.role !== 'admin' || !ADMIN_EMAILS.includes(currentUser?.email)) {
        toast.error('Access Denied: Admin privileges required.');
        return;
      }
      setPasscodeAction('admin-dashboard');
      setShowPasscodeModal(true);
      return;
    }
    setPreviousView(currentView);
    setCurrentView(view);
    localStorage.setItem('currentView', view);
    window.scrollTo(0, 0);
  };

  // --- Cart Actions ---
  const addToCart = (product: Product) => {
    if (product.stock <= 0) {
      toast.error('This item is currently out of stock.');
      return;
    }
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          toast.error(`Only ${product.stock} units available in stock.`);
          return prev;
        }
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    toast.success(`${product.name} added to cart!`);
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.id !== productId));
  };

  const updateCartQuantity = (productId: string, delta: number) => {
    setCart(prev => {
      const item = prev.find(i => i.id === productId);
      if (!item) return prev;
      
      const newQuantity = item.quantity + delta;
      
      if (newQuantity <= 0) {
        return prev.filter(i => i.id !== productId);
      }
      
      if (newQuantity > item.stock) {
        toast.error(`Only ${item.stock} units available in stock.`);
        return prev;
      }
      
      return prev.map(i => i.id === productId ? { ...i, quantity: newQuantity } : i);
    });
  };

  const toggleWishlist = (productId: string) => {
    setWishlist(prev => {
      if (prev.includes(productId)) {
        toast.info('Removed from wishlist');
        return prev.filter(id => id !== productId);
      }
      toast.success('Added to wishlist!');
      return [...prev, productId];
    });
  };

  const markAsRead = async (notifId: string) => {
    try {
      setIsLoading(true);
      await updateDoc(doc(db, 'notifications', notifId), { isRead: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `notifications/${notifId}`);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Firebase Auth ---

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        // Fetch user role from Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            if (userData.isBlocked) {
              await auth.signOut();
              toast.error('Your account has been blocked by an administrator.');
              return;
            }
            // Check if user should be admin based on email
            if (ADMIN_EMAILS.includes(user.email || '') && userData.role !== 'admin') {
              await updateDoc(doc(db, 'users', user.uid), { role: 'admin' });
              userData.role = 'admin';
            }
            setUserRole(userData.role);
            setUserProfile(userData);
          } else {
            // New user via Google, check for admin email
            const role = ADMIN_EMAILS.includes(user.email || '') ? 'admin' : 'customer';
            const newProfile = {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName,
              role: role,
              photoURL: user.photoURL,
              createdAt: Timestamp.now(),
              studentId: '' // Initialize with empty student ID
            };
            await setDoc(doc(db, 'users', user.uid), newProfile);
            setUserRole(role);
            setUserProfile(newProfile);
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
        }
      }
      setIsAuthReady(true);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // --- Firestore Listeners ---

  // 1. Global Data Listeners (Products, Reviews)
  useEffect(() => {
    if (!isAuthReady) return;

    const qProducts = query(collection(db, 'products'), orderBy('createdAt', 'desc'), limit(100));
    const unsubProducts = onSnapshot(qProducts, (snapshot) => {
      const prods = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      setAllProducts(prods);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'products'));

    const qReviews = query(collection(db, 'reviews'), orderBy('date', 'desc'), limit(200));
    const unsubReviews = onSnapshot(qReviews, (snapshot) => {
      const revs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Review));
      setReviews(revs);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'reviews'));

    return () => {
      unsubProducts();
      unsubReviews();
    };
  }, [isAuthReady]);

  // 2. User Specific Data Listeners (Orders, Chats, Notifications, Settings)
  useEffect(() => {
    if (!isAuthReady || !currentUser) return;

    // Orders Listener - Listen for both customer and seller roles for the user
    const qOrders = query(
      collection(db, 'orders'), 
      or(
        where('customerId', '==', currentUser.uid),
        where('sellerId', '==', currentUser.uid)
      ),
      orderBy('date', 'desc')
    );
    const unsubOrders = onSnapshot(qOrders, (snapshot) => {
      const ords = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
      setOrders(ords);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'orders'));

    // Chats Listener
    const qChats = query(
      collection(db, 'chats'),
      or(
        where('customerId', '==', currentUser.uid),
        where('sellerId', '==', currentUser.uid)
      ),
      orderBy('updatedAt', 'desc')
    );
    const unsubChats = onSnapshot(qChats, (snapshot) => {
      const cts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Chat));
      setChats(cts);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'chats'));

    // Notifications Listener
    const qNotifs = query(
      collection(db, 'notifications'),
      where('userId', '==', currentUser.uid),
      orderBy('date', 'desc')
    );
    const unsubNotifs = onSnapshot(qNotifs, (snapshot) => {
      const nots = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Notification));
      setNotifications(nots);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'notifications'));

    // Settings Listener
    const unsubSettings = onSnapshot(doc(db, 'settings', 'global'), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as AppSettings;
        setAppSettings({ id: snapshot.id, ...data } as AppSettings);
        
        // Migration: If tax rate is below 5%, update it (Admin only)
        if (data.listingTaxRate < 0.05 && (userRole === 'admin' || ADMIN_EMAILS.includes(currentUser?.email || ''))) {
          updateDoc(doc(db, 'settings', 'global'), { 
            listingTaxRate: 0.05,
            updatedAt: new Date().toISOString()
          }).catch(e => console.error("Error migrating tax rate:", e));
        }
      } else {
        const defaultSettings: AppSettings = {
          id: 'global',
          heroImageUrl: 'https://picsum.photos/seed/university/1920/1080',
          listingTaxRate: 0.05,
          updatedAt: new Date().toISOString()
        };
        // Only attempt to initialize if the user is an admin to avoid permission errors
        if (userRole === 'admin' || ADMIN_EMAILS.includes(currentUser.email || '')) {
          setDoc(doc(db, 'settings', 'global'), defaultSettings).catch(e => console.error("Error initializing settings:", e));
        }
        setAppSettings(defaultSettings);
      }
    }, (error) => {
      // If it's just a permission error on read, we can still use default settings in memory
      console.warn("Settings read permission issue or not found, using defaults");
      setAppSettings({
        id: 'global',
        heroImageUrl: 'https://picsum.photos/seed/university/1920/1080',
        updatedAt: new Date().toISOString()
      });
    });

    return () => {
      unsubOrders();
      unsubChats();
      unsubNotifs();
      unsubSettings();
    };
  }, [isAuthReady, currentUser]);

  // 3. Admin Specific Data Listeners (Users, All Orders)
  useEffect(() => {
    if (!isAuthReady || !currentUser || userProfile?.role !== 'admin') return;

    const unsubAllUsers = onSnapshot(query(collection(db, 'users'), limit(500)), (snapshot) => {
      setAllUsers(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'users'));

    const unsubAllOrders = onSnapshot(query(collection(db, 'orders'), orderBy('date', 'desc'), limit(500)), (snapshot) => {
      setAllOrders(snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Order[]);
    }, (error) => handleFirestoreError(error, OperationType.LIST, 'orders'));

    return () => {
      unsubAllUsers();
      unsubAllOrders();
    };
  }, [isAuthReady, currentUser, userProfile]);

  const toggleUserBlock = (userId: string, currentStatus: boolean) => {
    if (!currentStatus) {
      // If we are about to block (restrict) the user, ask for passcode
      setPendingRestrictUser({ userId, currentStatus });
      setPasscodeAction('restrict-user');
      setShowPasscodeModal(true);
    } else {
      // If we are unblocking, just do it
      executeToggleUserBlock(userId, currentStatus);
    }
  };

  const executeToggleUserBlock = async (userId: string, currentStatus: boolean) => {
    try {
      setIsLoading(true);
      await updateDoc(doc(db, 'users', userId), {
        isBlocked: !currentStatus,
        updatedAt: new Date().toISOString()
      });
      toast.success(`User ${!currentStatus ? 'blocked' : 'unblocked'} successfully.`);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${userId}`);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Auth Actions ---

  const handleGoogleLogin = async (forceSelect = false) => {
    try {
      setIsLoading(true);
      if (forceSelect) {
        googleProvider.setCustomParameters({ prompt: 'select_account' });
      } else {
        googleProvider.setCustomParameters({});
      }
      await signInWithPopup(auth, googleProvider);
      toast.success('Successfully logged in with Google!');
      navigateTo('shop');
    } catch (error: any) {
      if (error?.code === 'auth/popup-closed-by-user') {
        return;
      }
      if (error?.code === 'auth/popup-blocked') {
        toast.error('Login popup was blocked by your browser. Please allow popups for this site.');
        return;
      }
      console.error('Login error:', error);
      toast.error('Failed to login with Google.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      await signOut(auth);
      toast.success('Logged out successfully.');
      navigateTo('landing');
    } catch (error) {
      toast.error('Failed to logout.');
    } finally {
      setIsLoading(false);
    }
  };

  // --- Firestore Actions ---

  useEffect(() => {
    if (activeChat) {
      const updatedChat = chats.find(c => c.id === activeChat.id);
      if (updatedChat) {
        setActiveChat(updatedChat);
      }
    }
  }, [chats]);

  const startChat = async (product: Product, otherUserId?: string, otherUserName?: string) => {
    if (!currentUser) {
      toast.error('Please login to chat.');
      navigateTo('login');
      return;
    }

    let customerId: string;
    let sellerId: string;
    let customerName: string;
    let sellerName: string;

    if (otherUserId) {
      if (userRole === 'seller') {
        sellerId = currentUser.uid;
        sellerName = currentUser.displayName || 'Seller';
        customerId = otherUserId;
        customerName = otherUserName || 'Customer';
      } else {
        customerId = currentUser.uid;
        customerName = currentUser.displayName || 'Student User';
        sellerId = otherUserId;
        sellerName = otherUserName || 'Seller';
      }
    } else {
      customerId = currentUser.uid;
      customerName = currentUser.displayName || 'Student User';
      sellerId = product.sellerId || 'system';
      sellerName = product.sellerName || 'Seller';
    }

    const chatId = [customerId, sellerId].sort().join('_');
    const chatRef = doc(db, 'chats', chatId);
    
    try {
      const chatSnap = await getDoc(chatRef);

      if (!chatSnap.exists()) {
        const newChat: Chat = {
          id: chatId,
          productId: product.id,
          productName: product.name,
          customerId: customerId,
          customerName: customerName,
          sellerId: sellerId,
          sellerName: sellerName,
          messages: [],
          lastMessage: '',
          updatedAt: new Date().toISOString()
        };
        await setDoc(chatRef, newChat);
        setActiveChat(newChat);
      } else {
        // Update product context to the one just clicked
        const existingData = chatSnap.data() as Chat;
        const updatedChat = { 
          ...existingData, 
          id: chatSnap.id, 
          productId: product.id, 
          productName: product.name,
          updatedAt: new Date().toISOString()
        };
        await updateDoc(chatRef, {
          productId: product.id,
          productName: product.name,
          updatedAt: new Date().toISOString()
        });
        setActiveChat(updatedChat);
      }
      navigateTo('chat');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `chats/${chatId}`);
    }
  };

  const contactAdmin = async () => {
    if (!currentUser) {
      toast.error('Please login to contact us.');
      navigateTo('login');
      return;
    }

    try {
      setIsLoading(true);
      const q = query(
        collection(db, 'users'), 
        where('role', '==', 'admin'),
        where('email', '==', ADMIN_EMAILS[0]), 
        limit(1)
      );
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        toast.error('Admin account not found.');
        return;
      }

      const adminData = querySnapshot.docs[0].data();
      const adminId = querySnapshot.docs[0].id;

      // Use a dummy product for admin contact
      const supportProduct: Product = {
        id: 'support_contact',
        name: 'Support & Inquiry',
        price: 0,
        category: 'Support',
        sellerId: adminId,
        sellerName: adminData.displayName || 'Administrator',
        images: ['https://picsum.photos/seed/support/400/400'],
        createdAt: new Date().toISOString(),
        stock: 1
      };

      await startChat(supportProduct, adminId, adminData.displayName || 'Administrator');
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, 'users');
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (messageText: string = newMessage) => {
    if ((!messageText.trim() && !selectedChatImage) || !activeChat || !currentUser || isSending) return;

    const msgId = Date.now().toString();
    const senderRole = currentUser.uid === activeChat.customerId ? 'customer' : 'seller';
    
    const msg: Message = {
      id: msgId,
      sender: senderRole,
      text: messageText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    if (selectedChatImage) {
      msg.image = selectedChatImage;
    }

    try {
      setIsSending(true);
      const chatRef = doc(db, 'chats', activeChat.id);
      await updateDoc(chatRef, {
        messages: [...activeChat.messages, msg],
        lastMessage: selectedChatImage ? '📷 Image' : messageText,
        updatedAt: new Date().toISOString()
      });
      setNewMessage('');
      setSelectedChatImage(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `chats/${activeChat.id}`);
    } finally {
      setIsSending(false);
    }
  };

  const deleteMessage = async (messageId: string) => {
    if (!activeChat || !currentUser) return;

    try {
      const chatRef = doc(db, 'chats', activeChat.id);
      const updatedMessages = activeChat.messages.filter(m => m.id !== messageId);
      
      await updateDoc(chatRef, {
        messages: updatedMessages,
        lastMessage: updatedMessages.length > 0 
          ? (updatedMessages[updatedMessages.length - 1].image ? '📷 Image' : updatedMessages[updatedMessages.length - 1].text)
          : 'No messages yet',
        updatedAt: new Date().toISOString()
      });
      
      toast.success('Message deleted');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `chats/${activeChat.id}`);
    }
  };

  const deleteChat = async (chatId: string) => {
    try {
      await deleteDoc(doc(db, 'chats', chatId));
      toast.success('Conversation deleted');
      if (activeChat?.id === chatId) {
        setActiveChat(null);
        navigateTo('messages');
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `chats/${chatId}`);
    }
  };

  const checkout = async (paymentMethod: 'GCASH' | 'COD', studentName: string, studentId: string) => {
    if (!currentUser) {
      toast.error('Please login to complete your purchase.');
      navigateTo('login');
      return;
    }

    try {
      setIsLoading(true);
      
      // Group cart items by sellerId
      const itemsBySeller = cart.reduce((acc, item) => {
        const sellerId = item.sellerId || 'system';
        if (!acc[sellerId]) {
          acc[sellerId] = [];
        }
        acc[sellerId].push(item);
        return acc;
      }, {} as Record<string, CartItem[]>);

      const orderPromises = (Object.entries(itemsBySeller) as [string, CartItem[]][]).map(async ([sellerId, items]) => {
        const orderId = 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase();
        const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const taxRate = Math.max(appSettings?.listingTaxRate || 0, 0.05);
        const taxAmount = Number((total * taxRate).toFixed(2));
        
        const newOrder: Order = {
          id: orderId,
          customerId: currentUser.uid,
          customerName: studentName || currentUser.displayName || 'Student User',
          customerStudentId: studentId || userProfile?.studentId || '',
          sellerId: sellerId,
          items: items.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            images: item.images,
            category: item.category,
            sellerId: item.sellerId,
            sellerName: item.sellerName,
            stock: item.stock,
            quantity: item.quantity
          })),
          status: 'PREPARING',
          date: new Date().toISOString(),
          total: total,
          taxAmount: taxAmount,
          taxPaidToAdmin: false,
          paymentMethod: paymentMethod
        };
        
        await setDoc(doc(db, 'orders', orderId), newOrder);

        // Create notification for customer
        await addDoc(collection(db, 'notifications'), {
          userId: currentUser.uid,
          title: 'Order Confirmed',
          message: `Your order ${orderId} has been placed successfully.`,
          type: 'order',
          date: new Date().toISOString(),
          isRead: false
        });

        // Create notification for seller
        if (sellerId !== 'system') {
          await addDoc(collection(db, 'notifications'), {
            userId: sellerId,
            title: 'New Order Received',
            message: `You have a new order ${orderId} for ${items.length} item(s).`,
            type: 'order',
            date: new Date().toISOString(),
            isRead: false
          });
        }

        return { orderId, total, items };
      });

      const results = await Promise.all(orderPromises);

      setCart([]);
      toast.success(`Successfully placed ${results.length} order(s)!`);
      navigateTo('orders');

      // Send confirmation emails via backend for each order
      if (currentUser.email) {
        results.forEach(res => {
          fetch(`${window.location.origin}/api/send-confirmation`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: currentUser.email,
              orderId: res.orderId,
              items: res.items,
              total: res.total
            })
          })
          .then(async response => {
            const contentType = response.headers.get('content-type');
            if (!response.ok) {
              let errorMsg = `Server error: ${response.status}`;
              if (contentType && contentType.includes('application/json')) {
                const err = await response.json();
                errorMsg = err.error || errorMsg;
              } else {
                const text = await response.text();
                errorMsg = text.slice(0, 100) || errorMsg;
              }
              throw new Error(errorMsg);
            }
            if (contentType && contentType.includes('application/json')) {
              return response.json();
            }
            return { success: true, message: 'Email sent' };
          })
          .then(data => console.log('Email sent:', data))
          .catch(e => {
            console.error('Email error:', e);
            toast.error(`Failed to send confirmation email for ${res.orderId}: ${e.message}`);
          });
        });
      } else {
        console.warn('User email not available, skipping confirmation email.');
      }

    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'orders');
    } finally {
      setIsLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      setIsLoading(true);
      const orderRef = doc(db, 'orders', orderId);
      
      // If status is changing to SHIPPED, decrease stock
      if (newStatus === 'SHIPPED') {
        const orderSnap = await getDoc(orderRef);
        if (orderSnap.exists()) {
          const orderData = orderSnap.data() as Order;
          // Check if it was already shipped/delivered to prevent double reduction
          if (orderData.status !== 'SHIPPED' && orderData.status !== 'DELIVERED') {
            const stockPromises = orderData.items.map(async (item) => {
              const prodRef = doc(db, 'products', item.id);
              const prodDoc = await getDoc(prodRef);
              if (prodDoc.exists()) {
                const currentStock = prodDoc.data().stock || 0;
                await updateDoc(prodRef, { stock: Math.max(0, currentStock - item.quantity) });
              }
            });
            await Promise.all(stockPromises);
          }
        }
      }

      const updates: any = { 
        status: newStatus,
        updatedAt: new Date().toISOString()
      };

      if (newStatus === 'DELIVERED') {
        updates.taxPaidToAdmin = true;
      }

      await updateDoc(orderRef, updates);
      toast.success(`Order status updated to ${newStatus}`);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `orders/${orderId}`);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUserProfile = async (data: { displayName?: string, photoURL?: string, bio?: string, role?: 'customer' | 'seller', studentId?: string }) => {
    if (!currentUser) return;
    try {
      setIsLoading(true);
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, data);
      if (data.role) setUserRole(data.role);
      setUserProfile((prev: any) => ({ ...prev, ...data }));
      toast.success('Profile updated successfully!');
      navigateTo('profile');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${currentUser.uid}`);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProduct = async (updatedProduct: Product) => {
    try {
      setIsLoading(true);
      const prodRef = doc(db, 'products', updatedProduct.id);
      await setDoc(prodRef, { 
        ...updatedProduct,
        createdAt: updatedProduct.createdAt || Timestamp.now()
      }, { merge: true });
      toast.success('Product saved successfully.');
      setEditingProduct(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `products/${updatedProduct.id}`);
    } finally {
      setIsLoading(false);
    }
  };

  const seedInitialProducts = async () => {
    try {
      setIsLoading(true);
      const promises = PRODUCTS.map(async (product) => {
        const prodRef = doc(db, 'products', product.id);
        const prodSnap = await getDoc(prodRef);
        if (!prodSnap.exists()) {
          return setDoc(prodRef, {
            ...product,
            createdAt: serverTimestamp()
          });
        }
      });
      await Promise.all(promises);
      toast.success('Initial products seeded successfully!');
    } catch (error) {
      console.error("Error seeding products:", error);
      toast.error('Failed to seed products.');
    } finally {
      setIsLoading(false);
    }
  };

  const updateAppSettings = async (updates: Partial<AppSettings>) => {
    try {
      setIsLoading(true);
      const finalUpdates = { ...updates };
      if (finalUpdates.listingTaxRate !== undefined) {
        finalUpdates.listingTaxRate = Math.max(finalUpdates.listingTaxRate, 0.05);
      }
      const settingsRef = doc(db, 'settings', 'global');
      await setDoc(settingsRef, {
        ...finalUpdates,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      toast.success('System settings updated successfully!');
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'settings/global');
    } finally {
      setIsLoading(false);
    }
  };

  const handleHeroImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 800000) {
        toast.error('Image is too large. Please select a smaller file (under 800KB).');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setAppSettings(prev => prev ? { ...prev, heroImageUrl: base64String } : null);
      };
      reader.readAsDataURL(file);
    }
  };

  const addReview = async (rating: number, comment: string) => {
    if (!reviewingProduct || !currentUser) return;
    try {
      setIsLoading(true);
      const reviewId = 'REV-' + Date.now();
      const newReview: Review = {
        id: reviewId,
        productId: reviewingProduct.id,
        userName: currentUser.displayName || 'Anonymous',
        rating,
        comment,
        date: new Date().toISOString().split('T')[0]
      };
      await setDoc(doc(db, 'reviews', reviewId), newReview);
      toast.success('Review submitted! Thank you.');
      setReviewingProduct(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'reviews');
    } finally {
      setIsLoading(false);
    }
  };

  // --- Views ---

  const headerProps = { navigateTo, isDarkMode, setIsDarkMode, currentUser, userProfile, notifications, wishlist, cart, handleGoogleLogin, isAuthReady };
  const bottomNavProps = { navigateTo, currentView, cart, chats, userRole, userProfile, currentUser };
  const footerProps = { contactAdmin, navigateTo };

  const ReviewModal = () => {
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState('');

    if (!reviewingProduct) return null;

    return (
      <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white w-full max-w-sm rounded-xl overflow-hidden shadow-2xl"
        >
          <div className="bg-maroon text-white p-4 flex justify-between items-center">
            <h3 className="font-bold uppercase text-sm">Write a Review</h3>
            <button onClick={() => setReviewingProduct(null)}><Trash2 size={18} /></button>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-4">
              <img src={reviewingProduct.images[0]} className="w-16 h-16 rounded object-cover" alt="" />
              <div>
                <p className="font-bold text-sm">{reviewingProduct.name}</p>
                <p className="text-xs text-gray-500">Rate this product</p>
              </div>
            </div>
            
            <div className="flex justify-center py-2">
              <StarRating rating={rating} onRate={setRating} size={32} />
            </div>

            <textarea
              className="w-full border border-gray-200 rounded-lg p-3 text-sm focus:border-maroon outline-none h-32 resize-none"
              placeholder="Share your experience with this product..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />

            <button
              onClick={() => addReview(rating, comment)}
              className="w-full bg-maroon text-white py-3 rounded-full font-bold uppercase text-sm shadow-lg"
            >
              Submit Review
            </button>
          </div>
        </motion.div>
      </div>
    );
  };

  const ProductEditModal = () => {
    const [name, setName] = useState(editingProduct?.name || '');
    const [price, setPrice] = useState<string | number>(editingProduct?.price === 0 ? '' : (editingProduct?.price || ''));
    const [stock, setStock] = useState<string | number>(editingProduct?.stock === 0 ? '' : (editingProduct?.stock || ''));
    const [category, setCategory] = useState(editingProduct?.category || 'accessories');
    const [images, setImages] = useState<string[]>(editingProduct?.images || []);
    const [newImageUrl, setNewImageUrl] = useState('');
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    if (!editingProduct) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        if (file.size > 800000) { // ~800KB limit to stay safe with Firestore 1MB limit
          toast.error('Image is too large. Please select a smaller file (under 800KB).');
          return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result as string;
          setImages([...images, base64String]);
        };
        reader.readAsDataURL(file);
      }
    };

    const handleAddImage = () => {
      fileInputRef.current?.click();
    };

    const handleRemoveImage = (index: number) => {
      setImages(images.filter((_, i) => i !== index));
    };

    const handleSetPrimary = (index: number) => {
      const newImages = [...images];
      const [primary] = newImages.splice(index, 1);
      setImages([primary, ...newImages]);
    };

    return (
      <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ scale: 0.95, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          className="bg-white dark:bg-[#0d0d0d] w-full max-w-xl rounded-[3rem] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] flex flex-col max-h-[90vh] border border-white/5"
        >
          <div className="bg-gradient-to-br from-maroon to-[#600000] text-white p-10 flex justify-between items-center shrink-0 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
            <div className="relative z-10 space-y-1">
              <span className="text-white/50 font-black text-[10px] uppercase tracking-[0.4em]">Product Editor</span>
              <h3 className="font-black text-3xl uppercase tracking-tighter leading-none">Products</h3>
            </div>
            <button 
              onClick={() => setEditingProduct(null)} 
              className="relative z-10 w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center hover:bg-white/20 transition-all hover:scale-110 active:scale-95"
            >
              <X size={24} />
            </button>
          </div>
          
          <div className="p-10 space-y-10 overflow-y-auto custom-scrollbar">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Product Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Premium Tote Bag"
                  className="w-full bg-gray-50 dark:bg-white/5 border border-transparent dark:border-white/5 rounded-2xl px-6 py-5 focus:border-maroon focus:ring-4 ring-maroon/10 outline-none font-bold text-gray-900 dark:text-white transition-all placeholder:text-gray-300 dark:placeholder:text-gray-600"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Category</label>
                <div className="relative">
                  <select 
                    className="w-full bg-gray-50 dark:bg-white/5 border border-transparent dark:border-white/5 rounded-2xl px-6 py-5 focus:border-maroon focus:ring-4 ring-maroon/10 outline-none font-bold text-gray-900 dark:text-white transition-all cursor-pointer appearance-none"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                    <ChevronRight size={18} className="rotate-90" />
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Price (PHP)</label>
                <div className="relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 font-black text-maroon">₱</span>
                  <input 
                    type="number" 
                    placeholder="0.00"
                    className="w-full bg-gray-50 dark:bg-white/5 border border-transparent dark:border-white/5 rounded-2xl pl-12 pr-6 py-5 focus:border-maroon focus:ring-4 ring-maroon/10 outline-none font-bold text-gray-900 dark:text-white transition-all placeholder:text-gray-300 dark:placeholder:text-gray-600"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>
                {price && Number(price) > 0 && (
                  <div className="mt-2 p-4 bg-maroon/5 rounded-xl space-y-1">
                    <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                      <span className="text-gray-400">Listing Tax ({(appSettings?.listingTaxRate || 0.05) * 100}%)</span>
                      <span className="text-maroon">₱{(Number(price) * (appSettings?.listingTaxRate || 0.05)).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest border-t border-maroon/10 pt-1">
                      <span className="text-gray-500">Your Earnings</span>
                      <span className="text-green-600">₱{(Number(price) * (1 - (appSettings?.listingTaxRate || 0.05))).toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Stock Quantity</label>
                <input 
                  type="number" 
                  placeholder="0"
                  className="w-full bg-gray-50 dark:bg-white/5 border border-transparent dark:border-white/5 rounded-2xl px-6 py-5 focus:border-maroon focus:ring-4 ring-maroon/10 outline-none font-bold text-gray-900 dark:text-white transition-all placeholder:text-gray-300 dark:placeholder:text-gray-600"
                  value={stock}
                  onChange={(e) => setStock(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex justify-between items-end px-1">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Visual Assets</label>
                  <p className="text-[9px] text-gray-500 font-medium uppercase tracking-widest">First image will be the primary display</p>
                </div>
                <span className="text-[10px] font-black text-maroon uppercase tracking-widest bg-maroon/5 px-4 py-1.5 rounded-full">{images.length} Images</span>
              </div>
              
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                {images.map((img, idx) => (
                  <motion.div 
                    layout
                    key={idx} 
                    className={`relative group rounded-[1.5rem] overflow-hidden border-2 transition-all duration-500 ${idx === 0 ? 'border-maroon shadow-lg shadow-maroon/20' : 'border-transparent dark:border-white/5'}`}
                  >
                    <img src={img} className="w-full aspect-square object-cover" alt="" />
                    {idx === 0 && (
                      <div className="absolute top-0 left-0 bg-maroon text-white text-[8px] px-3 py-1 rounded-br-xl font-black uppercase tracking-widest">Primary</div>
                    )}
                    <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-2 backdrop-blur-sm">
                      {idx !== 0 && (
                        <button 
                          onClick={() => handleSetPrimary(idx)}
                          className="w-10 h-10 rounded-xl bg-white text-maroon flex items-center justify-center hover:scale-110 transition-transform shadow-xl"
                          title="Set as Primary"
                        >
                          <Star size={18} fill="currentColor" />
                        </button>
                      )}
                      <button 
                        onClick={() => handleRemoveImage(idx)}
                        className="w-10 h-10 rounded-xl bg-red-500 text-white flex items-center justify-center hover:scale-110 transition-transform shadow-xl"
                        title="Remove Image"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </motion.div>
                ))}
                
                <button 
                  onClick={handleAddImage}
                  className="aspect-square rounded-[1.5rem] border-2 border-dashed border-gray-200 dark:border-white/10 flex flex-col items-center justify-center gap-2 hover:border-maroon hover:bg-maroon/5 transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-400 group-hover:bg-maroon group-hover:text-white transition-all">
                    <Plus size={24} />
                  </div>
                  <span className="text-[8px] font-black uppercase tracking-widest text-gray-400 group-hover:text-maroon">Upload</span>
                </button>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/*" 
              />
            </div>
          </div>

          <div className="p-10 bg-gray-50 dark:bg-white/5 shrink-0 border-t border-gray-100 dark:border-white/5 flex flex-col gap-4">
            <button 
              onClick={async () => {
                if (!name || !price || !category) {
                  toast.error('Please fill in all required fields');
                  return;
                }
                const isNew = !editingProduct.createdAt;
                try {
                  setIsLoading(true);
                  const productData = {
                    ...editingProduct,
                    name,
                    price: Number(price),
                    stock: Number(stock),
                    category,
                    images,
                    updatedAt: new Date().toISOString(),
                    ...(isNew ? { createdAt: new Date().toISOString() } : {})
                  };
                  await setDoc(doc(db, 'products', editingProduct.id), productData, { merge: true });
                  toast.success(isNew ? 'Product added successfully' : 'Product updated successfully');
                  setEditingProduct(null);
                } catch (error) {
                  handleFirestoreError(error, isNew ? OperationType.CREATE : OperationType.UPDATE, `products/${editingProduct.id}`);
                } finally {
                  setIsLoading(false);
                }
              }}
              className="w-full bg-maroon text-white py-6 rounded-2xl font-black uppercase text-sm tracking-[0.2em] shadow-2xl shadow-maroon/30 hover:bg-black transition-all active:scale-[0.98]"
            >
              Publish Changes
            </button>
            <p className="text-center text-[9px] font-bold text-gray-400 uppercase tracking-widest">Your changes will be live immediately across the platform</p>
          </div>
        </motion.div>
      </div>
    );
  };

  const DeleteConfirmModal = () => {
    if (!productToDelete) return null;

    const handleDelete = async () => {
      try {
        setIsLoading(true);
        await deleteDoc(doc(db, 'products', productToDelete.id));
        toast.success('Product removed from inventory.');
        setProductToDelete(null);
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `products/${productToDelete.id}`);
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-[2.5rem] overflow-hidden shadow-2xl p-8 text-center space-y-6"
        >
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto text-red-500">
            <Trash2 size={40} />
          </div>
          <div className="space-y-2">
            <h3 className="font-black text-2xl uppercase tracking-tighter dark:text-white">Confirm Deletion</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Are you sure you want to remove <span className="text-maroon font-black">{productToDelete.name}</span>? This action cannot be undone.</p>
          </div>
          <div className="flex flex-col gap-3 pt-4">
            <button 
              onClick={handleDelete}
              className="w-full bg-red-500 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-red-600 transition-colors shadow-lg"
            >
              Yes, Delete Product
            </button>
            <button 
              onClick={() => setProductToDelete(null)}
              className="w-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      </div>
    );
  };

  const ConfirmActionModal = () => {
    if (!confirmAction) return null;
    
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-[2.5rem] overflow-hidden shadow-2xl p-8 text-center space-y-6"
        >
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto ${confirmAction.type === 'danger' ? 'bg-red-100 dark:bg-red-900/30 text-red-500' : 'bg-maroon/10 text-maroon'}`}>
            {confirmAction.type === 'danger' ? <Trash2 size={40} /> : <CheckCircle size={40} />}
          </div>
          <div className="space-y-2">
            <h3 className="font-black text-2xl uppercase tracking-tighter dark:text-white">{confirmAction.title}</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">{confirmAction.message}</p>
          </div>
          <div className="flex flex-col gap-3 pt-4">
            <button 
              onClick={() => {
                confirmAction.onConfirm();
                setConfirmAction(null);
              }}
              className={`w-full py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-colors shadow-lg text-white ${confirmAction.type === 'danger' ? 'bg-red-500 hover:bg-red-600' : 'bg-maroon hover:bg-black'}`}
            >
              {confirmAction.confirmText}
            </button>
            <button 
              onClick={() => setConfirmAction(null)}
              className="w-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      </div>
    );
  };

  const LandingView = () => (
    <div className="flex flex-col min-h-screen bg-surface dark:bg-[#050505]">
      <Header {...headerProps} />
      {/* Hero Section - Editorial Recipe Refined */}
      <section className="relative h-screen flex flex-col items-center justify-center overflow-hidden">
        <motion.div 
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
          className="absolute inset-0"
        >
          <img 
            src={appSettings?.heroImageUrl || "https://picsum.photos/seed/enverga/1920/1080"} 
            className="w-full h-full object-cover" 
            alt="Enverga University Building" 
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-surface dark:to-[#050505]"></div>
        </motion.div>
        
        <div className="relative z-10 text-center px-6 max-w-7xl mx-auto">
          <motion.div
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="space-y-8"
          >
            <div className="inline-flex items-center gap-3 bg-white/5 backdrop-blur-2xl border border-white/10 px-6 py-2.5 rounded-full mb-4 shadow-2xl">
              <span className="w-2 h-2 bg-maroon rounded-full animate-pulse shadow-[0_0_10px_rgba(128,0,0,0.8)]"></span>
              <span className="text-white font-black text-[10px] uppercase tracking-[0.5em]">The Official Student Marketplace</span>
            </div>
            
            <div className="relative">
              <motion.h2 
                initial={{ letterSpacing: '0.2em', opacity: 0 }}
                animate={{ letterSpacing: '-0.05em', opacity: 1 }}
                transition={{ delay: 0.8, duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                className="text-white text-[clamp(2.5rem,10vw,8rem)] font-black uppercase tracking-tighter leading-[0.75] mb-2 drop-shadow-2xl"
              >
                Tindahang
              </motion.h2>
              <motion.h2 
                initial={{ x: -100, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 1.2, duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                className="text-gradient italic text-[clamp(2.5rem,10vw,8rem)] font-black uppercase tracking-tighter leading-[0.75] ml-[2vw] md:ml-[15vw]"
              >
                Envergista
              </motion.h2>
            </div>
            
            <p className="text-white/70 text-base md:text-2xl font-medium max-w-3xl mx-auto mb-10 md:mb-16 tracking-tight leading-relaxed px-4">
              A premium digital stage for the exceptional craftsmanship and <span className="text-white font-bold italic underline decoration-maroon underline-offset-8">entrepreneurial spirit</span> of Manuel S. Enverga University Foundation students.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8 pt-8">
              <motion.button 
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigateTo('shop')}
                className="group relative w-full sm:w-auto overflow-hidden bg-maroon text-white px-16 py-6 rounded-2xl font-black uppercase text-xs tracking-[0.3em] shadow-[0_20px_50px_rgba(128,0,0,0.3)] transition-all duration-500"
              >
                <span className="relative z-10">{currentUser ? 'Go to Shop' : 'Explore Collection'}</span>
                <div className="absolute inset-0 bg-black translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
              </motion.button>
              <motion.button 
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => { 
                  if (currentUser) {
                    if (userProfile?.role === 'seller') {
                      navigateTo('seller-dashboard');
                    } else if (userProfile?.role === 'admin' && ADMIN_EMAILS.includes(currentUser?.email)) {
                      navigateTo('admin-dashboard');
                    } else {
                      navigateTo('profile');
                    }
                  } else {
                    setUserRole('seller'); 
                    navigateTo('signup'); 
                  }
                }}
                className="w-full sm:w-auto bg-white/5 backdrop-blur-2xl text-white border border-white/20 px-16 py-6 rounded-2xl font-black uppercase text-xs tracking-[0.3em] hover:bg-white hover:text-maroon transition-all duration-500 shadow-2xl"
              >
                {currentUser ? (userProfile?.role === 'seller' ? 'Seller Dashboard' : 'My Profile') : 'Become a Seller'}
              </motion.button>
            </div>
          </motion.div>
        </div>

        {/* Marquee Background Text */}
        <div className="absolute bottom-[20%] left-0 w-full overflow-hidden pointer-events-none opacity-5 select-none">
          <div className="flex whitespace-nowrap animate-marquee">
            {[...Array(4)].map((_, i) => (
              <span key={i} className="text-[clamp(4rem,12vh,10rem)] font-black uppercase text-white mr-20">
                MSEUF STUDENT MARKETPLACE • EXCELLENCE • SERVICE • CHARACTER • 
              </span>
            ))}
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4"
        >
          <span className="text-white/40 text-[10px] font-black uppercase tracking-[0.5em] [writing-mode:vertical-lr]">Scroll</span>
          <motion.div 
            animate={{ y: [0, 15, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-px h-20 bg-gradient-to-b from-maroon via-white to-transparent"
          ></motion.div>
        </motion.div>
      </section>

      {/* Stats Section - Hardware Recipe Inspired */}
      <section className="relative z-20 -mt-16 md:-mt-24 px-4 md:px-6 max-w-7xl mx-auto">
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="bg-[#0a0a0a] dark:bg-[#0a0a0a] rounded-[2rem] md:rounded-[3rem] p-8 md:p-16 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 border border-white/10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)]"
        >
          {[
            { label: 'Active Sellers', value: `${appSettings ? (appSettings.activeSellers || 0) : 50}+`, icon: User, color: 'text-red-500' },
            { label: 'Unique Products', value: `${allProducts.length || (appSettings ? (appSettings.uniqueProducts || 0) : 200)}+`, icon: Package, color: 'text-maroon' },
            { label: 'Student Orders', value: appSettings ? (appSettings.studentOrders >= 1000 ? `${(appSettings.studentOrders / 1000).toFixed(1)}k` : (appSettings.studentOrders || 0)) : '1.2k', icon: ShoppingCart, color: 'text-white' },
            { label: 'Community Rating', value: `${(reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) : (appSettings?.communityRating || 4.9)).toFixed(1)}/5`, icon: Star, color: 'text-yellow-500' }
          ].map((stat, i) => (
            <div key={i} className="flex flex-col gap-6 group">
              <div className="flex items-center justify-between">
                <div className={`w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center ${stat.color} group-hover:scale-110 transition-transform duration-500`}>
                  <stat.icon size={24} />
                </div>
                <span className="text-white/10 font-mono text-xs">0{i+1}</span>
              </div>
              <div className="space-y-1">
                <p className="text-white text-4xl md:text-5xl font-black tracking-tighter leading-none group-hover:text-maroon transition-colors duration-500">{stat.value}</p>
                <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em] mt-2">{stat.label}</p>
              </div>
              <div className="w-full h-px bg-white/10 overflow-hidden">
                <motion.div 
                  initial={{ x: '-100%' }}
                  whileInView={{ x: '0%' }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 + (i * 0.1), duration: 1 }}
                  className="w-full h-full bg-maroon"
                ></motion.div>
              </div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Categories Grid - Brutalist Inspired */}
      <section className="py-20 md:py-32 px-4 md:px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 md:mb-24 gap-8 md:gap-12">
          <div className="space-y-4 md:space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-8 md:w-12 h-px bg-maroon"></div>
              <span className="text-maroon font-black text-[8px] md:text-[10px] uppercase tracking-[0.5em]">Curated Collections</span>
            </div>
            <h3 className="text-5xl md:text-9xl font-black uppercase tracking-tighter dark:text-white leading-[0.8]">
              Shop by <br /><span className="text-maroon italic">Category</span>
            </h3>
          </div>
          <div className="max-w-sm space-y-4 md:space-y-6">
            <p className="text-gray-500 dark:text-gray-400 text-base md:text-lg font-medium leading-relaxed">
              Discover a wide range of student-made products across various creative disciplines. Each item tells a unique story of academic excellence.
            </p>
            <div className="h-px w-full bg-gray-200 dark:bg-white/10"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {CATEGORIES.map((cat, idx) => (
            <motion.div 
              key={cat.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: idx * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -20 }}
              onClick={() => { setSelectedCategory(cat.id); navigateTo('shop'); }}
              className={`group relative h-[500px] rounded-[3rem] overflow-hidden cursor-pointer shadow-premium transition-all duration-700 ${idx % 2 === 0 ? 'bg-maroon text-white' : 'bg-white dark:bg-[#0a0a0a] text-maroon border border-gray-100 dark:border-white/5'}`}
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-all duration-700">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/60"></div>
              </div>
              
              <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center space-y-8">
                <motion.span 
                  animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
                  transition={{ duration: 4, repeat: Infinity, delay: idx * 0.5 }}
                  className="text-8xl transform group-hover:scale-125 transition-transform duration-1000 group-hover:rotate-12"
                >
                  {cat.icon}
                </motion.span>
                <div className="space-y-4">
                  <h4 className="text-lg font-black uppercase tracking-[0.3em]">{cat.name}</h4>
                  <div className={`w-16 h-1.5 mx-auto rounded-full transition-all duration-700 group-hover:w-32 ${idx % 2 === 0 ? 'bg-white/30 group-hover:bg-white' : 'bg-maroon/20 group-hover:bg-maroon'}`}></div>
                </div>
              </div>

              <div className="absolute bottom-12 left-0 right-0 flex justify-center opacity-0 group-hover:opacity-100 transition-all duration-700 transform translate-y-8 group-hover:translate-y-0">
                <span className={`text-[10px] font-black uppercase tracking-[0.3em] flex items-center gap-3 px-8 py-4 rounded-full border shadow-2xl ${idx % 2 === 0 ? 'bg-white text-maroon border-white' : 'bg-maroon text-white border-maroon'}`}>
                  View Collection <ArrowRight size={16} />
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Featured Bento Grid - Luxury Recipe Inspired */}
      <section className="py-32 px-6 bg-gray-50 dark:bg-[#030303] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-maroon/5 blur-[150px] pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-center mb-24 gap-12">
            <div className="space-y-6 text-center md:text-left">
              <div className="flex items-center gap-4 justify-center md:justify-start">
                <span className="text-maroon font-black text-[10px] uppercase tracking-[0.5em]">Handpicked for You</span>
                <div className="w-12 h-px bg-maroon/30"></div>
              </div>
              <h3 className="text-6xl md:text-9xl font-black uppercase tracking-tighter dark:text-white leading-[0.8]">
                Featured <br /><span className="text-maroon italic">Handcrafts</span>
              </h3>
            </div>
            <motion.button 
              whileHover={{ scale: 1.05, x: 10 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigateTo('shop')} 
              className="group bg-black dark:bg-white text-white dark:text-black px-12 py-6 rounded-2xl font-black text-xs uppercase tracking-[0.3em] flex items-center gap-4 hover:bg-maroon hover:text-white transition-all shadow-2xl"
            >
              Explore All <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
            </motion.button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-10 h-auto md:min-h-[900px]">
            {allProducts.length > 0 ? (
              <>
                {/* Main Featured Item */}
                <motion.div 
                  whileHover={{ scale: 0.98 }}
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                  className={`${allProducts.length === 1 ? 'md:col-span-4' : 'md:col-span-2'} md:row-span-2 relative rounded-[4rem] overflow-hidden group cursor-pointer shadow-premium border border-white/5`}
                  onClick={() => { setSelectedProduct(allProducts[0]); navigateTo('product-details'); }}
                >
                  <img src={allProducts[0].images[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2000ms] ease-out" alt={allProducts[0].name} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent p-16 flex flex-col justify-end">
                    <div className="flex items-center gap-4 mb-8">
                      <span className="bg-maroon text-white text-[10px] font-black px-8 py-3 rounded-full uppercase tracking-[0.3em] shadow-2xl">Featured</span>
                      <div className="bg-white/10 backdrop-blur-2xl px-6 py-3 rounded-full border border-white/10"><StarRating rating={5} size={14} /></div>
                    </div>
                    <h4 className="text-white font-black text-6xl md:text-8xl uppercase tracking-tighter leading-[0.8] mb-8 group-hover:text-maroon transition-colors duration-500">{allProducts[0].name}</h4>
                    <div className="flex items-center justify-between overflow-hidden">
                      <p className="text-white/90 font-black text-4xl tracking-tighter">₱{allProducts[0].price.toLocaleString()}</p>
                      <motion.div 
                        whileHover={{ scale: 1.2, rotate: 45 }}
                        className="w-20 h-20 rounded-3xl bg-white flex items-center justify-center text-maroon transform translate-x-24 group-hover:translate-x-0 transition-transform duration-700 shadow-2xl"
                      >
                        <ArrowRight size={36} />
                      </motion.div>
                    </div>
                  </div>
                </motion.div>

                {/* Secondary Items */}
                {allProducts.length > 1 && (
                  <div className={`${allProducts.length === 2 ? 'md:col-span-2 md:row-span-2' : 'md:col-span-2 md:row-span-2 grid grid-rows-2 gap-10'}`}>
                    {allProducts.slice(1, 3).map((p, i) => (
                      <motion.div 
                        key={p.id}
                        whileHover={{ scale: 0.98 }}
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 + (i * 0.2), duration: 1, ease: [0.16, 1, 0.3, 1] }}
                        className={`relative rounded-[4rem] overflow-hidden group cursor-pointer shadow-premium border border-white/5 ${allProducts.length === 2 ? 'h-full' : ''}`}
                        onClick={() => { setSelectedProduct(p); navigateTo('product-details'); }}
                      >
                        <img src={p.images[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2000ms] ease-out" alt={p.name} />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent p-12 flex flex-col justify-end">
                          <h4 className="text-white font-black text-4xl uppercase tracking-tighter mb-6 group-hover:text-maroon transition-colors duration-500">{p.name}</h4>
                          <div className="flex items-center justify-between">
                            <p className="text-white/80 font-black text-2xl tracking-tighter">₱{p.price.toLocaleString()}</p>
                            <span className="bg-white/10 backdrop-blur-2xl text-white text-[10px] font-black uppercase tracking-[0.3em] px-8 py-4 rounded-full border border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-700 transform translate-y-4 group-hover:translate-y-0">View Details</span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="col-span-4 row-span-2 flex items-center justify-center bg-white dark:bg-[#0a0a0a] rounded-[4rem] border border-gray-100 dark:border-white/5 shadow-premium py-32">
                <div className="flex flex-col items-center gap-8 text-center px-6">
                  <div className="w-24 h-24 bg-maroon/5 rounded-[2rem] flex items-center justify-center text-maroon animate-pulse">
                    <Package size={48} />
                  </div>
                  <div className="space-y-4">
                    <p className="text-gray-900 dark:text-white font-black uppercase tracking-[0.5em] text-sm">Curating Collection...</p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm max-w-xs mx-auto">Our students are currently crafting new masterpieces. Check back soon or become a seller to showcase your own work!</p>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigateTo('signup')}
                    className="bg-maroon text-white px-10 py-4 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-2xl"
                  >
                    Start Selling
                  </motion.button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Newsletter Section - Atmospheric Recipe Inspired */}
      <section className="py-40 px-6 relative overflow-hidden bg-[#050505]">
        <div className="absolute inset-0 opacity-40 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(128,0,0,0.3),transparent_70%)]"></div>
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
              x: [0, 50, 0],
              y: [0, -50, 0]
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-48 -right-48 w-[600px] h-[600px] bg-maroon rounded-full blur-[150px]"
          ></motion.div>
          <motion.div 
            animate={{ 
              scale: [1.2, 1, 1.2],
              opacity: [0.2, 0.4, 0.2],
              x: [0, -50, 0],
              y: [0, 50, 0]
            }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-48 -left-48 w-[600px] h-[600px] bg-red-900 rounded-full blur-[150px]"
          ></motion.div>
        </div>
        
        <div className="relative z-10 max-w-5xl mx-auto text-center space-y-16">
          <div className="space-y-6">
            <motion.span 
              initial={{ letterSpacing: '1em', opacity: 0 }}
              whileInView={{ letterSpacing: '0.5em', opacity: 1 }}
              viewport={{ once: true }}
              className="text-white/40 font-black text-[10px] uppercase tracking-[0.5em]"
            >
              Stay Connected
            </motion.span>
            <h3 className="text-white text-7xl md:text-[10vw] font-black uppercase tracking-tighter leading-[0.8] drop-shadow-2xl">
              Join the <br /><span className="italic text-gradient">Community</span>
            </h3>
          </div>
          
          <p className="text-white/60 text-xl md:text-3xl font-medium max-w-3xl mx-auto tracking-tight leading-relaxed">
            Be the first to know about new student drops, exclusive university offers, and inspiring entrepreneurial stories.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 max-w-3xl mx-auto bg-white/5 backdrop-blur-3xl p-3 rounded-[3rem] border border-white/10 shadow-2xl">
            <input 
              type="email" 
              id="newsletter-email"
              placeholder="Enter your student email" 
              className="flex-1 bg-transparent px-10 py-6 text-white placeholder:text-white/20 outline-none font-bold text-lg"
            />
            <motion.button 
              whileHover={{ scale: 1.02, backgroundColor: '#800000', color: '#ffffff' }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                const email = (document.getElementById('newsletter-email') as HTMLInputElement)?.value;
                if (email && email.includes('@')) {
                  toast.success('Welcome to the community! Check your email for updates.');
                  (document.getElementById('newsletter-email') as HTMLInputElement).value = '';
                } else {
                  toast.error('Please enter a valid student email.');
                }
              }}
              className="bg-white text-maroon px-16 py-6 rounded-[2.5rem] font-black uppercase text-xs tracking-[0.3em] shadow-2xl transition-all duration-700"
            >
              Subscribe Now
            </motion.button>
          </div>
        </div>
      </section>

      <Footer {...footerProps} />
      <BottomNav {...bottomNavProps} />
    </div>
  );

  const SignupView = () => (
    <div className="min-h-screen bg-surface dark:bg-black flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Back Button */}
      <motion.button 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => navigateTo('landing')} 
        className="absolute top-8 left-8 w-12 h-12 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center text-gray-400 hover:text-maroon transition-all shadow-soft border border-gray-100 dark:border-white/10 group z-50"
      >
        <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
      </motion.button>

      {/* Decorative Background */}
      <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-maroon rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-maroon rounded-full blur-[120px]"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-12 text-center relative z-10"
      >
        <div className="space-y-6">
          <div 
            className="w-20 h-20 bg-maroon rounded-3xl flex items-center justify-center text-white shadow-premium mx-auto transform -rotate-6 cursor-pointer hover:rotate-0 transition-transform duration-500"
            onClick={() => navigateTo('landing')}
          >
            <Package size={40} />
          </div>
          <div className="space-y-2">
            <h2 className="text-5xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none">
              Join the <span className="text-maroon italic">Movement</span>
            </h2>
            <p className="text-gray-400 text-sm font-medium tracking-tight">Create your account to start trading within the Enverga community.</p>
          </div>
        </div>

        <div className="glass rounded-[3rem] p-10 shadow-premium border border-white/20 space-y-8">
          <div className="flex p-1.5 bg-gray-100/50 dark:bg-white/5 rounded-2xl">
            <button 
              onClick={() => setUserRole('buyer')}
              className={`flex-1 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${userRole === 'buyer' ? 'bg-white dark:bg-gray-800 text-maroon shadow-soft' : 'text-gray-400 hover:text-gray-600'}`}
            >
              I want to Buy
            </button>
            <button 
              onClick={() => setUserRole('seller')}
              className={`flex-1 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${userRole === 'seller' ? 'bg-white dark:bg-gray-800 text-maroon shadow-soft' : 'text-gray-400 hover:text-gray-600'}`}
            >
              I want to Sell
            </button>
          </div>

          <div className="space-y-4">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleGoogleLogin()}
              className="w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-100 dark:border-white/10 px-8 py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-soft flex items-center justify-center gap-4 hover:border-maroon transition-all"
            >
              <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
              Continue with Google
            </motion.button>
          </div>
        </div>

        <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">
          Already have an account? <button onClick={() => navigateTo('login')} className="text-maroon hover:underline">Sign In</button>
        </p>
      </motion.div>
    </div>
  );

  const LoginView = () => (
    <div className="min-h-screen bg-surface dark:bg-black flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Back Button */}
      <motion.button 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => navigateTo('landing')} 
        className="absolute top-8 left-8 w-12 h-12 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center text-gray-400 hover:text-maroon transition-all shadow-soft border border-gray-100 dark:border-white/10 group z-50"
      >
        <ChevronLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
      </motion.button>

      {/* Decorative Background */}
      <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-maroon rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-maroon rounded-full blur-[120px]"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-12 text-center relative z-10"
      >
        <div className="space-y-6">
          <div 
            className="w-20 h-20 bg-maroon rounded-3xl flex items-center justify-center text-white shadow-premium mx-auto transform rotate-6 cursor-pointer hover:rotate-0 transition-transform duration-500"
            onClick={() => navigateTo('landing')}
          >
            <Package size={40} />
          </div>
          <div className="space-y-2">
            <h2 className="text-5xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none">
              Welcome <span className="text-maroon italic">Back</span>
            </h2>
            <p className="text-gray-400 text-sm font-medium tracking-tight">Sign in to access your student marketplace account.</p>
          </div>
        </div>

        <div className="glass rounded-[3rem] p-10 shadow-premium border border-white/20 space-y-8">
          <div className="space-y-4">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleGoogleLogin()}
              className="w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-100 dark:border-white/10 px-8 py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-soft flex items-center justify-center gap-4 hover:border-maroon transition-all"
            >
              <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
              Sign in with Google
            </motion.button>
          </div>
        </div>

        <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest">
          Don't have an account? <button onClick={() => navigateTo('signup')} className="text-maroon hover:underline">Sign Up</button>
        </p>
      </motion.div>
    </div>
  );

  const ProductDetailsView = () => {
    if (!selectedProduct) return null;
    const [activeImage, setActiveImage] = useState(selectedProduct.images[0]);

    useEffect(() => {
      setActiveImage(selectedProduct.images[0]);
    }, [selectedProduct]);

    const productReviews = reviews.filter(r => r.productId === selectedProduct.id);
    const avgRating = productReviews.reduce((acc, r) => acc + r.rating, 0) / (productReviews.length || 1);

    return (
      <div className="pb-40 bg-surface dark:bg-[#050505] min-h-screen relative">
        <div className="noise-overlay"></div>
        <Header {...headerProps} />
        
        <div className="max-w-[1400px] mx-auto px-4 md:px-6 py-10 md:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-24 items-start">
            {/* Image Gallery - Luxury Style */}
            <div className="space-y-6 md:space-y-10">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="relative aspect-[4/5] rounded-[2rem] md:rounded-[4rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.2)] bg-white dark:bg-[#0a0a0a] border border-white/5"
              >
                <img 
                  src={activeImage} 
                  className="w-full h-full object-cover" 
                  alt={selectedProduct.name} 
                />
                <motion.button 
                  whileHover={{ scale: 1.1, x: -5 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => navigateTo('shop')}
                  className="absolute top-6 left-6 md:top-10 md:left-10 w-10 h-10 md:w-14 md:h-14 bg-white/10 backdrop-blur-3xl rounded-xl md:rounded-2xl flex items-center justify-center text-white hover:bg-maroon transition-all z-20 border border-white/20 shadow-2xl"
                >
                  <ChevronLeft size={20} md:size={28} />
                </motion.button>
              </motion.div>
              
              <div className="flex gap-4 md:gap-6 overflow-x-auto pb-4 no-scrollbar px-2">
                {selectedProduct.images.map((img, i) => (
                  <motion.button 
                    key={i}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setActiveImage(img)}
                    className={`relative w-20 h-20 md:w-28 md:h-28 rounded-2xl md:rounded-[2rem] overflow-hidden flex-shrink-0 transition-all duration-500 border-2 ${activeImage === img ? 'border-maroon scale-95 shadow-2xl' : 'border-transparent opacity-40 hover:opacity-100'}`}
                  >
                    <img src={img} className="w-full h-full object-cover" alt="" />
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Product Info - Editorial Style */}
            <div className="flex flex-col justify-center space-y-16 py-10">
              <div className="space-y-10">
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-3 bg-maroon/5 px-6 py-2.5 rounded-full border border-maroon/10">
                    <span className="w-2 h-2 bg-maroon rounded-full animate-pulse"></span>
                    <span className="text-maroon text-[10px] font-black uppercase tracking-[0.4em]">
                      {selectedProduct.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 bg-yellow-400/5 px-5 py-2.5 rounded-full border border-yellow-400/10">
                    <StarRating rating={avgRating} size={16} />
                    <span className="text-[10px] font-black text-yellow-700 uppercase tracking-[0.2em]">({productReviews.length} Reviews)</span>
                  </div>
                </div>

                <motion.h2 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.8 }}
                  className="text-[clamp(2.5rem,8vw,7rem)] font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-[0.8]"
                >
                  {selectedProduct.name}
                </motion.h2>

                <div className="flex items-center justify-between border-y border-gray-100 dark:border-white/5 py-10">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.5em]">Investment</p>
                    <p className="text-6xl font-black text-maroon tracking-tighter leading-none">₱{selectedProduct.price.toLocaleString()}</p>
                  </div>
                  <div className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] shadow-premium ${selectedProduct.stock > 0 ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                    {selectedProduct.stock > 0 ? `${selectedProduct.stock} Units In Stock` : 'Currently Unavailable'}
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.5em]">The Story</h4>
                  <p className="text-gray-500 dark:text-gray-400 text-xl font-medium leading-relaxed tracking-tight max-w-xl">
                    {selectedProduct.description}
                  </p>
                </div>
              </div>

              <div className="space-y-10">
                <div className="flex flex-col sm:flex-row gap-6">
                  <motion.button 
                    whileHover={{ scale: 1.02, y: -5 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={selectedProduct.stock <= 0}
                    onClick={() => addToCart(selectedProduct)}
                    className={`flex-1 py-8 rounded-3xl font-black uppercase text-xs tracking-[0.4em] flex items-center justify-center gap-6 shadow-premium transition-all duration-500 ${selectedProduct.stock <= 0 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-maroon text-white hover:bg-black'}`}
                  >
                    <ShoppingCart size={24} />
                    {selectedProduct.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
                  </motion.button>
                  <motion.button 
                    whileHover={{ scale: 1.02, y: -5 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => startChat(selectedProduct)}
                    className="px-12 py-8 rounded-3xl bg-white dark:bg-[#0a0a0a] text-maroon border-2 border-maroon/20 font-black uppercase text-xs tracking-[0.4em] flex items-center justify-center gap-6 shadow-premium hover:bg-maroon hover:text-white transition-all duration-500"
                  >
                    <MessageSquare size={24} />
                    Inquire
                  </motion.button>
                </div>

                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="p-8 bg-white dark:bg-[#0a0a0a] rounded-[3rem] border border-gray-100 dark:border-white/5 shadow-premium flex items-center justify-between group cursor-pointer"
                  onClick={() => navigateTo('profile')}
                >
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 bg-maroon rounded-[1.5rem] flex items-center justify-center text-white shadow-2xl transform group-hover:rotate-6 transition-transform duration-500">
                      <User size={40} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.5em] mb-1">Crafted By</p>
                      <p className="text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight group-hover:text-maroon transition-colors">{selectedProduct.sellerName || 'Student Seller'}</p>
                    </div>
                  </div>
                  <div className="w-12 h-12 rounded-full border border-maroon/20 flex items-center justify-center text-maroon group-hover:bg-maroon group-hover:text-white transition-all duration-500">
                    <ArrowRight size={20} />
                  </div>
                </motion.div>
              </div>
            </div>
          </div>

          {/* Reviews Section - Refined */}
          <div className="mt-48 space-y-20">
            <div className="flex flex-col md:flex-row justify-between items-end gap-12 border-b border-gray-100 dark:border-white/5 pb-16">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-px bg-maroon"></div>
                  <span className="text-maroon font-black text-[10px] uppercase tracking-[0.5em]">Community Feedback</span>
                </div>
                <h3 className="text-[clamp(3rem,8vw,6rem)] font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-[0.8]">
                  Customer <br /><span className="text-maroon italic">Reviews</span>
                </h3>
              </div>
              <motion.button 
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setReviewingProduct(selectedProduct)}
                className="bg-maroon text-white px-12 py-6 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] shadow-premium hover:bg-black transition-all duration-500"
              >
                Write a Review
              </motion.button>
            </div>

            {productReviews.length === 0 ? (
              <div className="py-40 text-center bg-white dark:bg-[#0a0a0a] rounded-[4rem] border border-gray-100 dark:border-white/5 shadow-premium">
                <div className="w-24 h-24 bg-maroon/5 rounded-full flex items-center justify-center mx-auto mb-8">
                  <MessageSquare size={40} className="text-maroon/20" />
                </div>
                <p className="text-gray-400 font-black uppercase tracking-[0.5em] text-sm">No reviews yet. Be the first to share your experience.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {productReviews.map((review: any) => (
                  <motion.div 
                    key={review.id} 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="bg-white dark:bg-[#0a0a0a] p-12 rounded-[4rem] shadow-premium border border-gray-100 dark:border-white/5 space-y-8 group hover:-translate-y-2 transition-all duration-500"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-gray-100 dark:bg-white/5 rounded-2xl flex items-center justify-center text-maroon group-hover:bg-maroon group-hover:text-white transition-all duration-500 shadow-lg">
                          <User size={28} />
                        </div>
                        <div>
                          <p className="font-black text-2xl text-gray-900 dark:text-white uppercase tracking-tight">{review.userName}</p>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mt-1">{new Date(review.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="bg-yellow-400/10 px-4 py-2 rounded-xl">
                        <StarRating rating={review.rating} size={16} />
                      </div>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-xl font-medium leading-relaxed tracking-tight italic">"{review.comment}"</p>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
        <BottomNav {...bottomNavProps} />
      </div>
    );
  };

  const MessagesView = () => (
    <div className="pb-24 min-h-screen bg-gray-50 dark:bg-[#0a0a0a]">
      <Header {...headerProps} />
      <div className="p-8 max-w-4xl mx-auto space-y-8">
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigateTo('landing')}
          className="flex items-center gap-3 text-gray-500 hover:text-maroon transition-colors group mb-4"
        >
          <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/5 flex items-center justify-center group-hover:bg-maroon group-hover:text-white transition-all">
            <ChevronLeft size={20} />
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">Back to Home</span>
        </motion.button>

        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-8">
          <div className="space-y-1">
            <h2 className="text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none">
              Messages <span className="text-maroon">Inbox</span>
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-[10px] font-black uppercase tracking-widest">Connect with your community</p>
          </div>
          <div className="w-14 h-14 bg-maroon/5 dark:bg-maroon/20 rounded-2xl flex items-center justify-center text-maroon dark:text-red-400">
            <MessageSquare size={28} />
          </div>
        </div>

        {chats.length === 0 ? (
          <div className="text-center py-32 space-y-6 bg-white dark:bg-gray-900 rounded-[3rem] shadow-sm border border-gray-100 dark:border-gray-800">
            <div className="w-24 h-24 bg-gray-50 dark:bg-black rounded-full flex items-center justify-center mx-auto">
              <MessageSquare size={40} className="text-gray-300" />
            </div>
            <div className="space-y-2">
              <p className="font-black text-gray-900 dark:text-white uppercase tracking-tighter text-2xl">No messages yet</p>
              <p className="text-gray-500 text-sm font-medium">Start a conversation from any product page!</p>
              <button 
                onClick={() => navigateTo('shop')}
                className="mt-4 bg-maroon text-white px-8 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-black transition-all shadow-xl"
              >
                Explore Shop
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {chats.map(chat => {
              const isCustomer = currentUser?.uid === chat.customerId;
              const otherName = isCustomer ? chat.sellerName : chat.customerName;
              
              return (
                <motion.div 
                  layout
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  key={chat.id} 
                  onClick={() => { setActiveChat(chat); navigateTo('chat'); }}
                  className="bg-white dark:bg-gray-900 p-6 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800 flex items-center gap-6 cursor-pointer hover:shadow-2xl hover:border-maroon/20 transition-all duration-500 group"
                >
                  <div className="relative">
                    <div className="w-16 h-16 bg-maroon text-white rounded-2xl flex items-center justify-center font-black text-2xl uppercase shadow-xl group-hover:rotate-6 transition-transform">
                      {otherName[0]}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 border-4 border-white dark:border-gray-900 rounded-full"></div>
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex justify-between items-start">
                      <h3 className="font-black text-lg uppercase tracking-tight text-gray-900 dark:text-white truncate">
                        {otherName}
                      </h3>
                      <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">
                        {chat.messages.length > 0 ? chat.messages[chat.messages.length - 1].timestamp : ''}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-black uppercase tracking-widest bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-gray-500">Product</span>
                      <p className="text-[10px] font-bold text-maroon truncate uppercase tracking-tight">
                        {chat.productName}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-2 font-medium italic">
                      {chat.messages.length > 0 ? chat.messages[chat.messages.length - 1].text : 'No messages yet'}
                    </p>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirmAction({
                          title: 'Delete Conversation',
                          message: 'Are you sure you want to delete this entire conversation? This action cannot be undone.',
                          confirmText: 'Delete',
                          type: 'danger',
                          onConfirm: () => deleteChat(chat.id)
                        });
                      }}
                      className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={18} />
                    </button>
                    <ChevronRight size={20} className="text-gray-200 group-hover:text-maroon transition-colors" />
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
      <BottomNav {...bottomNavProps} />
    </div>
  );

  const ChatView = () => {
    if (!activeChat) return null;

    useEffect(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [activeChat.messages]);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setSelectedChatImage(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    };

    const myRoleInThisChat = currentUser?.uid === activeChat.customerId ? 'customer' : 'seller';

    return (
      <div className="flex flex-col h-screen bg-gray-50 dark:bg-[#0a0a0a]">
        <div className="bg-maroon text-white p-6 pt-12 flex items-center gap-6 shadow-2xl relative overflow-hidden rounded-b-[3rem]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          <button 
            onClick={() => navigateTo('messages')}
            className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center hover:bg-white/20 transition-all relative z-10"
          >
            <ChevronLeft size={24} />
          </button>
          <div className="flex-1 relative z-10">
            <h2 className="font-black text-xl uppercase tracking-tight">
              {currentUser?.uid === activeChat.customerId ? activeChat.sellerName : activeChat.customerName}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
              <p className="text-[9px] font-black uppercase tracking-widest text-white/60 truncate">
                Re: {activeChat.productName}
              </p>
            </div>
          </div>
          <button 
            onClick={() => setConfirmAction({
              title: 'Delete Conversation',
              message: 'Are you sure you want to delete this entire conversation? This action cannot be undone.',
              confirmText: 'Delete',
              type: 'danger',
              onConfirm: () => deleteChat(activeChat.id)
            })}
            className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center hover:bg-red-500 transition-all relative z-10"
          >
            <Trash2 size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-6 no-scrollbar">
          {activeChat.messages.length === 0 ? (
            <div className="text-center py-20 space-y-4">
              <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto text-gray-300">
                <MessageSquare size={32} />
              </div>
              <p className="text-gray-400 font-black uppercase text-[10px] tracking-widest italic">
                Start your conversation about "{activeChat.productName}"
              </p>
            </div>
          ) : (
            activeChat.messages.map(msg => (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                key={msg.id} 
                className={`flex ${msg.sender === myRoleInThisChat ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] p-5 rounded-[2rem] text-sm shadow-xl relative group/msg ${
                  msg.sender === myRoleInThisChat 
                    ? 'bg-maroon text-white rounded-tr-none' 
                    : 'bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 rounded-tl-none border border-gray-100 dark:border-gray-800'
                }`}>
                  {msg.sender === myRoleInThisChat && (
                    <button 
                      onClick={() => setConfirmAction({
                        title: 'Delete Message',
                        message: 'Are you sure you want to delete this message? This action cannot be undone.',
                        confirmText: 'Delete',
                        type: 'danger',
                        onConfirm: () => deleteMessage(msg.id)
                      })}
                      className="absolute -left-10 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-red-500 opacity-0 group-hover/msg:opacity-100 transition-all bg-white dark:bg-gray-800 rounded-full shadow-md border border-gray-100 dark:border-gray-700"
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                  {msg.image && (
                    <div className="mb-3 rounded-2xl overflow-hidden shadow-lg border border-white/10">
                      <img src={msg.image} alt="Sent" className="w-full h-auto max-h-64 object-cover" referrerPolicy="no-referrer" />
                    </div>
                  )}
                  {msg.text && <p className="font-medium leading-relaxed">{msg.text}</p>}
                  <p className={`text-[8px] font-black uppercase tracking-widest mt-3 ${msg.sender === myRoleInThisChat ? 'text-white/40 text-right' : 'text-gray-400'}`}>
                    {msg.timestamp}
                  </p>
                </div>
              </motion.div>
            ))
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="p-6 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 rounded-t-[3rem] shadow-2xl space-y-4">
          {selectedChatImage && (
            <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-4 border-maroon shadow-xl group">
              <img src={selectedChatImage} alt="Preview" className="w-full h-full object-cover" />
              <button 
                onClick={() => setSelectedChatImage(null)}
                className="absolute top-1 right-1 bg-black/50 text-white p-1 rounded-full hover:bg-black transition-colors"
              >
                <X size={12} />
              </button>
            </div>
          )}
          
          <MessageInput 
            onSend={sendMessage}
            isSending={isSending}
            selectedChatImage={selectedChatImage}
            handleImageUpload={handleImageUpload}
          />
        </div>
      </div>
    );
  };

  const CartView = () => (
    <div className="pb-32 bg-gray-50 dark:bg-black min-h-screen">
      <Header {...headerProps} />
      <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-6 md:space-y-8">
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-6">
          <div className="space-y-1">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none">
              Shopping <span className="text-maroon">Bag</span>
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-[9px] md:text-[10px] font-black uppercase tracking-widest">{cart.length} Items Selected</p>
          </div>
          <div className="w-12 h-12 md:w-14 md:h-14 bg-maroon/5 dark:bg-maroon/20 rounded-xl md:rounded-2xl flex items-center justify-center text-maroon dark:text-red-400">
            <ShoppingCart size={24} md:size={28} />
          </div>
        </div>
        
        {cart.length === 0 ? (
          <div className="text-center py-32 space-y-6">
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto">
              <ShoppingCart size={40} className="text-gray-300" />
            </div>
            <div className="space-y-2">
              <p className="font-black text-gray-900 dark:text-white uppercase tracking-tighter text-2xl">Your bag is empty</p>
              <p className="text-gray-500 text-sm font-medium">Looks like you haven't added anything yet.</p>
            </div>
            <button 
              onClick={() => navigateTo('shop')} 
              className="bg-maroon text-white px-10 py-4 rounded-full font-black uppercase text-xs tracking-widest shadow-xl hover:bg-black transition-all"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-4">
              {cart.map(item => (
                <motion.div 
                  layout
                  key={item.id} 
                  className="bg-white dark:bg-gray-900 rounded-3xl p-4 flex gap-6 shadow-sm border border-gray-50 dark:border-gray-800 group"
                >
                  <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0">
                    <img src={item.images[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={item.name} />
                  </div>
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div className="flex justify-between items-start">
                      <div className="space-y-0.5">
                        <h3 className="font-black text-lg uppercase tracking-tight text-gray-900 dark:text-white leading-tight">{item.name}</h3>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Quantity: {item.quantity}</p>
                      </div>
                      <button 
                        onClick={() => removeFromCart(item.id)} 
                        className="text-gray-300 hover:text-red-500 transition-colors p-1"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                    <div className="flex justify-between items-end">
                      <p className="font-black text-maroon text-xl">₱{(item.price * item.quantity).toLocaleString()}</p>
                      <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-800 rounded-xl px-3 py-1.5">
                        <button 
                          onClick={() => updateCartQuantity(item.id, -1)}
                          className="text-gray-400 hover:text-maroon font-black transition-colors w-6 h-6 flex items-center justify-center"
                        >
                          -
                        </button>
                        <span className="text-xs font-black dark:text-white w-4 text-center">{item.quantity}</span>
                        <button 
                          onClick={() => updateCartQuantity(item.id, 1)}
                          className="text-gray-400 hover:text-maroon font-black transition-colors w-6 h-6 flex items-center justify-center"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            
            <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 shadow-2xl border border-gray-50 dark:border-gray-800 space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-gray-400">
                  <span>Subtotal</span>
                  <span>₱{cart.reduce((sum, item) => sum + (item.price * item.quantity), 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs font-bold uppercase tracking-widest text-gray-400">
                  <span>Shipping</span>
                  <span className="text-green-500">Free</span>
                </div>
                <div className="pt-4 border-t border-gray-50 dark:border-gray-800 flex justify-between items-center">
                  <span className="font-black text-xl uppercase tracking-tighter text-gray-900 dark:text-white">Total Amount</span>
                  <span className="font-black text-3xl text-maroon">
                    ₱{cart.reduce((sum, item) => sum + (item.price * item.quantity), 0).toLocaleString()}
                  </span>
                </div>
              </div>
              
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigateTo('checkout')}
                className="w-full bg-maroon text-white py-6 rounded-[2rem] font-black uppercase text-sm tracking-[0.2em] shadow-xl hover:bg-black transition-all transform"
              >
                Proceed to Checkout
              </motion.button>
              
              <button 
                onClick={() => navigateTo('shop')} 
                className="w-full flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-maroon transition-colors"
              >
                <ChevronLeft size={14} />
                Continue Shopping
              </button>
            </div>
          </div>
        )}
      </div>
      <BottomNav {...bottomNavProps} />
    </div>
  );

  const CheckoutView = () => {
    const [paymentMethod, setPaymentMethod] = useState<'GCASH' | 'COD'>('GCASH');
    const [studentName, setStudentName] = useState(currentUser?.displayName || '');
    const [studentId, setStudentId] = useState('');

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return (
      <div className="pb-32 bg-gray-50 dark:bg-black min-h-screen">
        <Header {...headerProps} />
        <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6 md:space-y-8">
          <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-6">
            <div className="space-y-1">
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none">
                Final <span className="text-maroon">Checkout</span>
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-[9px] md:text-[10px] font-black uppercase tracking-widest">Secure Payment Processing</p>
            </div>
            <div className="w-12 h-12 md:w-14 md:h-14 bg-maroon/5 dark:bg-maroon/20 rounded-xl md:rounded-2xl flex items-center justify-center text-maroon dark:text-red-400">
              <ShieldCheck size={24} md:size={28} />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-8">
              <div className="space-y-6">
                <h3 className="font-black text-xl uppercase tracking-tighter text-gray-900 dark:text-white">Student Details</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Full Name</label>
                    <input 
                      type="text" 
                      className="w-full bg-white dark:bg-gray-900 border-none rounded-2xl px-5 py-4 focus:ring-2 ring-maroon outline-none font-bold text-gray-900 dark:text-white shadow-sm transition-all" 
                      value={studentName}
                      onChange={(e) => setStudentName(e.target.value)}
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Student ID Number</label>
                    <input 
                      type="text" 
                      className="w-full bg-white dark:bg-gray-900 border-none rounded-2xl px-5 py-4 focus:ring-2 ring-maroon outline-none font-bold text-gray-900 dark:text-white shadow-sm transition-all" 
                      value={studentId}
                      onChange={(e) => setStudentId(e.target.value)}
                      placeholder="e.g. A24-1234"
                      required 
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="font-black text-xl uppercase tracking-tighter text-gray-900 dark:text-white">Payment Method</h3>
                <div className="grid grid-cols-1 gap-4">
                  <button 
                    onClick={() => setPaymentMethod('GCASH')}
                    className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all ${paymentMethod === 'GCASH' ? 'border-maroon bg-maroon/5 dark:bg-maroon/20' : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900'}`}
                  >
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'GCASH' ? 'border-maroon' : 'border-gray-300'}`}>
                      {paymentMethod === 'GCASH' && <div className="w-3 h-3 bg-maroon rounded-full"></div>}
                    </div>
                    <div className="text-left">
                      <p className="font-black text-sm uppercase tracking-widest text-gray-900 dark:text-white">G-Cash</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">Fast & Secure Digital Payment</p>
                    </div>
                  </button>
                  <button 
                    onClick={() => setPaymentMethod('COD')}
                    className={`flex items-center gap-4 p-5 rounded-2xl border-2 transition-all ${paymentMethod === 'COD' ? 'border-maroon bg-maroon/5 dark:bg-maroon/20' : 'border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900'}`}
                  >
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'COD' ? 'border-maroon' : 'border-gray-300'}`}>
                      {paymentMethod === 'COD' && <div className="w-3 h-3 bg-maroon rounded-full"></div>}
                    </div>
                    <div className="text-left">
                      <p className="font-black text-sm uppercase tracking-widest text-gray-900 dark:text-white">Cash on Delivery</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">Pay upon receiving your items</p>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 shadow-2xl border border-gray-50 dark:border-gray-800 space-y-6">
                <h3 className="font-black text-xl uppercase tracking-tighter text-gray-900 dark:text-white">Order Summary</h3>
                <div className="space-y-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                  {cart.map(item => (
                    <div key={item.id} className="flex justify-between items-center text-xs font-bold uppercase tracking-widest">
                      <span className="text-gray-500 truncate max-w-[120px]">{item.name} <span className="text-maroon">x{item.quantity}</span></span>
                      <span className="text-gray-900 dark:text-white">₱{(item.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-6 border-t border-gray-50 dark:border-gray-800 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-black text-lg uppercase tracking-tighter text-gray-900 dark:text-white">Total Amount</span>
                    <span className="font-black text-2xl text-maroon">₱{total.toLocaleString()}</span>
                  </div>
                  <motion.button 
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => checkout(paymentMethod, studentName, studentId)}
                    className="w-full bg-maroon text-white py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl hover:bg-black transition-all transform"
                  >
                    Confirm Order
                  </motion.button>
                </div>
              </div>
              
              <button 
                onClick={() => navigateTo('cart')} 
                className="w-full flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-maroon transition-colors"
              >
                <ChevronLeft size={14} />
                Back to Bag
              </button>
            </div>
          </div>
        </div>
        <BottomNav {...bottomNavProps} />
      </div>
    );
  };

  const ManageOrdersView = () => {
    const [filterStatus, setFilterStatus] = useState<Order['status'] | 'ALL'>('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    
    const sellerOrders = orders.filter(order => order.sellerId === currentUser?.uid);
    
    const filteredOrders = sellerOrders.filter(order => {
      const matchesStatus = filterStatus === 'ALL' ? true : order.status === filterStatus;
      const matchesSearch = order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           order.id.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });

    const stats = {
      pending: sellerOrders.filter(o => o.status === 'PREPARING').length,
      shipped: sellerOrders.filter(o => o.status === 'SHIPPED').length,
      delivered: sellerOrders.filter(o => o.status === 'DELIVERED').length,
      revenue: sellerOrders.filter(o => o.status === 'DELIVERED').reduce((acc, curr) => acc + curr.total, 0)
    };

    return (
      <div className="pb-24 bg-gray-50 dark:bg-[#050505] min-h-screen">
        <Header {...headerProps} />
        <div className="p-6 max-w-5xl mx-auto space-y-10">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-maroon rounded-xl flex items-center justify-center text-white shadow-premium">
                  <ClipboardList size={20} />
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none">
                  Order <span className="text-maroon italic">Management</span>
                </h2>
              </div>
              <div className="flex items-center gap-2 ml-13">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <p className="text-gray-500 dark:text-gray-400 text-[10px] font-black uppercase tracking-[0.3em]">Live Updates Active • Fulfill Student Requests</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 bg-white dark:bg-gray-900 p-2 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 w-full md:w-auto">
              <div className="flex items-center gap-3 px-4 flex-1 md:w-64">
                <Search size={18} className="text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search by name or ID..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent border-none outline-none text-xs font-bold uppercase tracking-widest w-full text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { label: 'Pending', value: stats.pending, icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
              { label: 'In Transit', value: stats.shipped, icon: Truck, color: 'text-blue-500', bg: 'bg-blue-500/10' },
              { label: 'Delivered', value: stats.delivered, icon: CheckCircle2, color: 'text-green-500', bg: 'bg-green-500/10' },
              { label: 'Total Revenue', value: `₱${stats.revenue.toLocaleString()}`, icon: TrendingUp, color: 'text-maroon', bg: 'bg-maroon/10' }
            ].map((stat, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                key={i} 
                className="bg-white dark:bg-gray-900 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl transition-all group"
              >
                <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <stat.icon size={20} />
                </div>
                <p className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter">{stat.value}</p>
                <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Filters */}
          <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
            {(['ALL', 'PREPARING', 'SHIPPED', 'DELIVERED', 'REJECTED', 'CANCELLED'] as const).map(status => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all border-2 whitespace-nowrap ${filterStatus === status ? 'bg-maroon border-maroon text-white shadow-lg scale-105' : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 text-gray-500 hover:border-maroon'}`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Orders List */}
          {filteredOrders.length === 0 ? (
            <div className="text-center py-32 space-y-6 bg-white dark:bg-gray-900 rounded-[3rem] shadow-sm border border-gray-100 dark:border-gray-800">
              <div className="w-24 h-24 bg-gray-50 dark:bg-black rounded-full flex items-center justify-center mx-auto">
                <ClipboardList size={40} className="text-gray-200" />
              </div>
              <div className="space-y-2">
                <p className="font-black text-gray-900 dark:text-white uppercase tracking-tighter text-2xl">No matching orders</p>
                <p className="text-gray-500 text-sm font-medium">Try adjusting your filters or search query.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {filteredOrders.map((order, idx) => (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  layout
                  key={order.id} 
                  className="bg-white dark:bg-gray-900 rounded-[3rem] p-10 shadow-sm border border-gray-50 dark:border-gray-800 space-y-10 group hover:shadow-2xl transition-all duration-500 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-64 h-64 bg-maroon/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none"></div>
                  
                  <div className="flex flex-col lg:flex-row justify-between items-start gap-8 relative z-10">
                    <div className="space-y-6 flex-1">
                      <div className="flex flex-wrap items-center gap-4">
                        <div className="bg-gray-50 dark:bg-black px-6 py-2 rounded-full border border-gray-100 dark:border-gray-800">
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Order ID</span>
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-maroon ml-2">#{order.id.slice(-8)}</span>
                        </div>
                        <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-6 py-2 rounded-full shadow-sm ${
                          order.status === 'DELIVERED' ? 'bg-green-500 text-white' : 
                          order.status === 'SHIPPED' ? 'bg-blue-500 text-white' : 
                          order.status === 'REJECTED' ? 'bg-red-500 text-white' :
                          order.status === 'CANCELLED' ? 'bg-gray-500 text-white' :
                          'bg-yellow-500 text-white'
                        }`}>
                          {order.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gray-50 dark:bg-black rounded-2xl flex items-center justify-center text-maroon">
                              <User size={20} />
                            </div>
                            <div>
                              <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Customer</p>
                              <p className="text-sm font-black uppercase tracking-tight text-gray-900 dark:text-white">{order.customerName}</p>
                            </div>
                          </div>
                          {order.customerStudentId && (
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-gray-50 dark:bg-black rounded-2xl flex items-center justify-center text-blue-500">
                                <ShieldCheck size={20} />
                              </div>
                              <div>
                                <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Student ID</p>
                                <p className="text-sm font-black uppercase tracking-tight text-gray-900 dark:text-white">{order.customerStudentId}</p>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="space-y-4">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gray-50 dark:bg-black rounded-2xl flex items-center justify-center text-green-500">
                              <CreditCard size={20} />
                            </div>
                            <div>
                              <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Payment Method</p>
                              <p className="text-sm font-black uppercase tracking-tight text-gray-900 dark:text-white">{order.paymentMethod}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gray-50 dark:bg-black rounded-2xl flex items-center justify-center text-gray-400">
                              <Calendar size={20} />
                            </div>
                            <div>
                              <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Order Date</p>
                              <p className="text-sm font-black uppercase tracking-tight text-gray-900 dark:text-white">{new Date(order.date).toLocaleDateString()} at {new Date(order.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-maroon/5 dark:bg-maroon/20 p-8 rounded-[2.5rem] border border-maroon/10 text-right min-w-[200px]">
                      <p className="text-[10px] font-black text-maroon uppercase tracking-[0.3em] mb-2">Total Revenue</p>
                      <p className="font-black text-4xl text-maroon tracking-tighter">₱{order.total.toLocaleString()}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-400 ml-2">Order Items ({order.items.length})</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-6 bg-gray-50 dark:bg-gray-800/30 p-5 rounded-[2rem] border border-transparent hover:border-maroon/20 transition-all group/item">
                          <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 shadow-lg">
                            <img src={item.images[0]} className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-700" alt="" />
                          </div>
                          <div className="flex-1 space-y-1">
                            <p className="text-xs font-black uppercase tracking-tight text-gray-900 dark:text-white leading-tight">{item.name}</p>
                            <div className="flex items-center gap-3">
                              <span className="text-[10px] font-bold text-maroon bg-maroon/10 px-2 py-0.5 rounded-md">Qty: {item.quantity}</span>
                              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">₱{item.price.toLocaleString()} ea</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-10 border-t border-gray-100 dark:border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-8 relative z-10">
                    <div className="flex flex-wrap gap-4 w-full sm:w-auto">
                      {order.status === 'PREPARING' && (
                        <>
                          <motion.button 
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => updateOrderStatus(order.id, 'SHIPPED')}
                            className="flex-1 sm:flex-none bg-maroon text-white px-10 py-5 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-premium hover:bg-black transition-all flex items-center justify-center gap-3"
                          >
                            <Truck size={16} />
                            Ship Order
                          </motion.button>
                          <motion.button 
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setConfirmAction({
                              title: 'Reject Order',
                              message: 'Are you sure you want to reject this order? This action cannot be undone.',
                              onConfirm: () => updateOrderStatus(order.id, 'REJECTED'),
                              confirmText: 'Yes, Reject Order',
                              type: 'danger'
                            })}
                            className="flex-1 sm:flex-none bg-white dark:bg-gray-800 border-2 border-red-100 dark:border-red-900/30 text-red-600 px-10 py-5 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-red-600 hover:text-white transition-all"
                          >
                            Reject
                          </motion.button>
                        </>
                      )}
                      {order.status === 'SHIPPED' && (
                        <motion.button 
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => updateOrderStatus(order.id, 'DELIVERED')}
                          className="flex-1 sm:flex-none bg-green-600 text-white px-10 py-5 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-premium hover:bg-black transition-all flex items-center justify-center gap-3"
                        >
                          <CheckCircle2 size={16} />
                          Mark Delivered
                        </motion.button>
                      )}
                      <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => startChat(order.items[0], order.customerId, order.customerName)}
                        className="flex-1 sm:flex-none bg-white dark:bg-gray-800 border-2 border-gray-100 dark:border-gray-700 text-gray-900 dark:text-white px-10 py-5 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] hover:border-maroon hover:text-maroon transition-all flex items-center justify-center gap-3"
                      >
                        <MessageSquare size={16} />
                        Chat with Buyer
                      </motion.button>
                    </div>
                    <div className="flex items-center gap-3 bg-green-50 dark:bg-green-900/10 px-6 py-3 rounded-full border border-green-100 dark:border-green-900/20">
                      <ShieldCheck size={16} className="text-green-500" />
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-green-600">Verified MSEUF Transaction</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
        <BottomNav {...bottomNavProps} />
      </div>
    );
  };

  const OrdersView = () => {
    const myOrders = orders.filter(o => o.customerId === currentUser?.uid);
    const totalSpent = myOrders.filter(o => o.status === 'DELIVERED').reduce((acc, curr) => acc + curr.total, 0);

    return (
      <div className="pb-24 bg-gray-50 dark:bg-[#050505] min-h-screen">
        <Header {...headerProps} />
        <div className="p-6 max-w-4xl mx-auto space-y-10">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-maroon rounded-xl flex items-center justify-center text-white shadow-premium">
                  <Package size={20} />
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white uppercase tracking-tighter leading-none">
                  My <span className="text-maroon italic">Orders</span>
                </h2>
              </div>
              <p className="text-gray-500 dark:text-gray-400 text-[10px] font-black uppercase tracking-[0.3em] ml-13">Track Your Student Marketplace Finds</p>
            </div>
            <div className="bg-white dark:bg-gray-900 px-6 py-4 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm">
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-1">Total Investment</p>
              <p className="text-xl font-black text-maroon tracking-tighter">₱{totalSpent.toLocaleString()}</p>
            </div>
          </div>

          {myOrders.length === 0 ? (
            <div className="text-center py-32 space-y-8 bg-white dark:bg-gray-900 rounded-[3rem] shadow-sm border border-gray-100 dark:border-gray-800">
              <div className="w-24 h-24 bg-gray-50 dark:bg-black rounded-full flex items-center justify-center mx-auto">
                <ShoppingBag size={40} className="text-gray-200" />
              </div>
              <div className="space-y-3">
                <p className="font-black text-gray-900 dark:text-white uppercase tracking-tighter text-3xl">No orders yet</p>
                <p className="text-gray-500 text-sm font-medium max-w-xs mx-auto">Your shopping bag is waiting for its first student-made treasure!</p>
                <button 
                  onClick={() => navigateTo('shop')}
                  className="mt-6 bg-maroon text-white px-10 py-5 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-black transition-all shadow-premium"
                >
                  Start Shopping
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-10">
              {myOrders.map((order, idx) => (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  layout
                  key={order.id} 
                  className="bg-white dark:bg-gray-900 rounded-[3rem] p-10 shadow-sm border border-gray-50 dark:border-gray-800 space-y-10 group hover:shadow-2xl transition-all duration-500 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-64 h-64 bg-maroon/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none"></div>

                  <div className="flex flex-col md:flex-row justify-between items-start gap-6 relative z-10">
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="bg-gray-50 dark:bg-black px-6 py-2 rounded-full border border-gray-100 dark:border-gray-800">
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Order</span>
                          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-maroon ml-2">#{order.id.slice(-8)}</span>
                        </div>
                        <span className={`text-[10px] font-black uppercase tracking-[0.2em] px-6 py-2 rounded-full shadow-sm ${
                          order.status === 'DELIVERED' ? 'bg-green-500 text-white' : 
                          order.status === 'SHIPPED' ? 'bg-blue-500 text-white' : 
                          order.status === 'REJECTED' ? 'bg-red-500 text-white' :
                          order.status === 'CANCELLED' ? 'bg-gray-500 text-white' :
                          'bg-yellow-500 text-white'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-400">
                        <Calendar size={14} />
                        <p className="text-[10px] font-black uppercase tracking-widest">{new Date(order.date).toLocaleDateString()} at {new Date(order.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6 w-full md:w-auto">
                      <div className="text-right flex-1 md:flex-none">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-1">Total Amount</p>
                        <p className="font-black text-4xl text-maroon tracking-tighter">₱{order.total.toLocaleString()}</p>
                      </div>
                      <button 
                        onClick={() => {
                          setSelectedOrder(order);
                          navigateTo('order-details');
                        }}
                        className="w-14 h-14 bg-gray-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center hover:bg-maroon hover:text-white transition-all shadow-sm group/btn"
                      >
                        <ChevronRight size={24} className="group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>

                  {/* Status Tracker */}
                  {['REJECTED', 'CANCELLED'].includes(order.status) ? (
                    <div className="py-10 px-8 bg-red-50 dark:bg-red-900/10 rounded-[2.5rem] border border-red-100 dark:border-red-900/20 flex items-center justify-center gap-4">
                      <div className="w-12 h-12 bg-red-500 text-white rounded-2xl flex items-center justify-center">
                        <X size={24} />
                      </div>
                      <div className="text-center">
                        <p className="font-black uppercase tracking-[0.3em] text-red-600 leading-none">Order {order.status}</p>
                        <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest mt-2">Please contact the seller for more details.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="py-12 px-10 bg-gray-50 dark:bg-gray-800/30 rounded-[3rem] border border-gray-100 dark:border-gray-800/50">
                      <div className="flex justify-between relative">
                        <div className="absolute top-6 left-0 w-full h-1 bg-gray-200 dark:bg-gray-700 z-0 rounded-full"></div>
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: order.status === 'PREPARING' ? '0%' : order.status === 'SHIPPED' ? '50%' : '100%' }}
                          className="absolute top-6 left-0 h-1 bg-maroon z-0 rounded-full transition-all duration-1000 shadow-[0_0_15px_rgba(128,0,0,0.5)]"
                        ></motion.div>
                        
                        {[
                          { label: 'PREPARING', icon: Package, desc: 'Seller is packing' },
                          { label: 'SHIPPED', icon: Truck, desc: 'On the way' },
                          { label: 'DELIVERED', icon: CheckCircle2, desc: 'Received' }
                        ].map((step, i) => {
                          const isCompleted = (order.status === 'SHIPPED' && step.label === 'PREPARING') || (order.status === 'DELIVERED');
                          const isCurrent = order.status === step.label;
                          const Icon = step.icon;
                          
                          return (
                            <div key={step.label} className="relative z-10 flex flex-col items-center gap-4">
                              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 transition-all duration-700 ${isCompleted || isCurrent ? 'bg-maroon border-maroon text-white shadow-premium scale-110' : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-300'}`}>
                                <Icon size={24} />
                              </div>
                              <div className="text-center">
                                <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${isCompleted || isCurrent ? 'text-maroon' : 'text-gray-400'}`}>{step.label}</p>
                                <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest mt-1 hidden sm:block">{step.desc}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-4 mt-6">
                    {order.status === 'PREPARING' && (
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setConfirmAction({
                          title: 'Cancel Order',
                          message: 'Are you sure you want to cancel this order?',
                          onConfirm: () => updateOrderStatus(order.id, 'CANCELLED'),
                          confirmText: 'Yes, Cancel Order',
                          type: 'danger'
                        })}
                        className="bg-red-50 dark:bg-red-900/20 text-red-600 px-6 py-3 rounded-xl font-black uppercase text-[9px] tracking-widest hover:bg-red-600 hover:text-white transition-all border border-red-100 dark:border-red-900/30"
                      >
                        Cancel Order
                      </motion.button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {order.items.slice(0, 2).map((item, idx) => (
                      <div key={idx} className="flex items-center gap-6 bg-gray-50 dark:bg-gray-800/30 p-5 rounded-[2rem] border border-transparent group/item">
                        <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0 shadow-lg">
                          <img src={item.images[0]} className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-700" alt="" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-xs font-black uppercase tracking-tight text-gray-900 dark:text-white leading-tight">{item.name}</p>
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-bold text-maroon bg-maroon/10 px-2 py-0.5 rounded-md">Qty: {item.quantity}</span>
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">₱{item.price.toLocaleString()} ea</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {order.items.length > 2 && (
                      <div className="flex items-center justify-center bg-gray-50 dark:bg-gray-800/30 p-5 rounded-[2rem] border border-dashed border-gray-200 dark:border-gray-700">
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">+{order.items.length - 2} more items</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
        <BottomNav {...bottomNavProps} />
      </div>
    );
  };
  const ProfileView = () => (
    <div className="pb-24 bg-gray-50 dark:bg-[#0a0a0a] min-h-screen">
      <Header {...headerProps} />
      <div className="bg-maroon text-white p-8 pt-16 rounded-b-[4rem] shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/20 rounded-full -ml-32 -mb-32 blur-2xl"></div>
        
        <div className="relative z-10 flex flex-col items-center">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-white/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-500"></div>
            <img 
              src={currentUser?.photoURL || `https://ui-avatars.com/api/?name=${currentUser?.displayName}&background=random`} 
              className="w-36 h-36 rounded-full object-cover border-4 border-white/30 shadow-2xl relative z-10 group-hover:scale-105 transition-transform duration-500" 
              alt="Profile" 
            />
            <button 
              onClick={() => navigateTo('edit-profile')}
              className="absolute bottom-2 right-2 bg-white p-3 rounded-2xl text-maroon shadow-2xl hover:scale-110 transition-transform z-20"
            >
              <Camera size={20} />
            </button>
          </motion.div>
          
          <div className="text-center mt-8 space-y-3">
            <motion.h3 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="font-black text-4xl uppercase tracking-tighter leading-none"
            >
              {currentUser?.displayName || 'Student User'}
            </motion.h3>
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="flex items-center justify-center gap-3"
            >
              <button 
                onClick={() => setUserRole(userRole === 'customer' ? 'seller' : 'customer')}
                className="bg-white/20 backdrop-blur-md px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/10 hover:bg-white/30 transition-all"
              >
                Switch to {userRole === 'customer' ? 'Seller' : 'Customer'}
              </button>
              <span className="bg-white/20 backdrop-blur-md px-5 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/10">
                {userRole}
              </span>
              {userRole === 'seller' && (
                <div className="bg-blue-500/20 backdrop-blur-md px-4 py-2 rounded-2xl flex items-center gap-2 border border-blue-400/20">
                  <ShieldCheck size={14} className="text-blue-300" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-blue-100">Verified Seller</span>
                </div>
              )}
            </motion.div>
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-white/60 text-[10px] font-bold uppercase tracking-widest"
            >
              {currentUser?.email}
            </motion.p>
            {userProfile?.studentId && (
              <motion.p 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.35 }}
                className="text-white/40 text-[9px] font-black uppercase tracking-[0.2em] bg-white/5 px-4 py-1.5 rounded-full inline-block mt-2"
              >
                Student ID: {userProfile.studentId}
              </motion.p>
            )}
            {userProfile?.role === 'admin' && ADMIN_EMAILS.includes(currentUser?.email) && (
              <motion.button 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                onClick={() => setShowPasscodeModal(true)}
                className="mt-6 w-full bg-white text-maroon font-black uppercase text-[10px] tracking-widest py-4 rounded-3xl shadow-2xl hover:scale-105 transition-all flex items-center justify-center gap-3"
              >
                <ShieldCheck size={16} />
                Admin Dashboard
              </motion.button>
            )}
          </div>
        </div>
      </div>
      
      <div className="p-6 -mt-12 relative z-20 max-w-2xl mx-auto">
        <motion.div 
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-900 rounded-[3rem] shadow-2xl p-10 grid grid-cols-2 gap-10 border border-gray-100 dark:border-gray-800"
        >
          {userRole === 'customer' ? (
            <>
              <button onClick={() => navigateTo('cart')} className="flex flex-col items-center gap-4 group">
                <div className="w-20 h-20 bg-maroon/5 dark:bg-maroon/20 rounded-[2rem] flex items-center justify-center text-maroon dark:text-red-400 group-hover:bg-maroon group-hover:text-white transition-all duration-500 shadow-sm group-hover:shadow-xl group-hover:-translate-y-2">
                  <ShoppingCart size={32} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-900 dark:text-gray-300">My Cart</span>
              </button>
              <button onClick={() => navigateTo('orders')} className="flex flex-col items-center gap-4 group">
                <div className="w-20 h-20 bg-maroon/5 dark:bg-maroon/20 rounded-[2rem] flex items-center justify-center text-maroon dark:text-red-400 group-hover:bg-maroon group-hover:text-white transition-all duration-500 shadow-sm group-hover:shadow-xl group-hover:-translate-y-2">
                  <ClipboardList size={32} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-900 dark:text-gray-300">My Orders</span>
              </button>
              <button onClick={() => navigateTo('wishlist')} className="flex flex-col items-center gap-4 group">
                <div className="w-20 h-20 bg-maroon/5 dark:bg-maroon/20 rounded-[2rem] flex items-center justify-center text-maroon dark:text-red-400 group-hover:bg-maroon group-hover:text-white transition-all duration-500 shadow-sm group-hover:shadow-xl group-hover:-translate-y-2">
                  <Heart size={32} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-900 dark:text-gray-300">Wishlist</span>
              </button>
              <button onClick={() => navigateTo('messages')} className="flex flex-col items-center gap-4 group">
                <div className="w-20 h-20 bg-maroon/5 dark:bg-maroon/20 rounded-[2rem] flex items-center justify-center text-maroon dark:text-red-400 group-hover:bg-maroon group-hover:text-white transition-all duration-500 shadow-sm group-hover:shadow-xl group-hover:-translate-y-2">
                  <MessageSquare size={32} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-900 dark:text-gray-300">Messages</span>
              </button>
              <button 
                onClick={() => {
                  if (appSettings?.sellerRegistrationEnabled === false) {
                    toast.error('Seller registration is currently disabled by administrator.');
                    return;
                  }
                  updateUserProfile({ role: 'seller' });
                }}
                disabled={appSettings?.sellerRegistrationEnabled === false}
                className={`col-span-2 mt-4 py-5 rounded-3xl font-black uppercase text-[10px] tracking-widest transition-all shadow-xl flex items-center justify-center gap-3 hover:-translate-y-1 ${appSettings?.sellerRegistrationEnabled === false ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-maroon text-white hover:bg-black'}`}
              >
                <TrendingUp size={20} />
                Become a Seller
              </button>
            </>
          ) : (
            <>
              <button onClick={() => navigateTo('seller-dashboard')} className="flex flex-col items-center gap-4 group">
                <div className="w-20 h-20 bg-maroon/5 dark:bg-maroon/20 rounded-[2rem] flex items-center justify-center text-maroon dark:text-red-400 group-hover:bg-maroon group-hover:text-white transition-all duration-500 shadow-sm group-hover:shadow-xl group-hover:-translate-y-2">
                  <BarChart3 size={32} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-900 dark:text-gray-300">Dashboard</span>
              </button>
              <button onClick={() => navigateTo('manage-orders')} className="flex flex-col items-center gap-4 group">
                <div className="w-20 h-20 bg-maroon/5 dark:bg-maroon/20 rounded-[2rem] flex items-center justify-center text-maroon dark:text-red-400 group-hover:bg-maroon group-hover:text-white transition-all duration-500 shadow-sm group-hover:shadow-xl group-hover:-translate-y-2">
                  <ClipboardList size={32} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-900 dark:text-gray-300 text-center leading-tight">Manage Orders</span>
              </button>
              <button onClick={() => navigateTo('manage-products')} className="flex flex-col items-center gap-4 group">
                <div className="w-20 h-20 bg-maroon/5 dark:bg-maroon/20 rounded-[2rem] flex items-center justify-center text-maroon dark:text-red-400 group-hover:bg-maroon group-hover:text-white transition-all duration-500 shadow-sm group-hover:shadow-xl group-hover:-translate-y-2">
                  <Package size={32} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-900 dark:text-gray-300">My Products</span>
              </button>
              <button onClick={() => navigateTo('messages')} className="flex flex-col items-center gap-4 group">
                <div className="w-20 h-20 bg-maroon/5 dark:bg-maroon/20 rounded-[2rem] flex items-center justify-center text-maroon dark:text-red-400 group-hover:bg-maroon group-hover:text-white transition-all duration-500 shadow-sm group-hover:shadow-xl group-hover:-translate-y-2">
                  <MessageSquare size={32} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-900 dark:text-gray-300">Messages</span>
              </button>
              <button 
                onClick={() => updateUserProfile({ role: 'customer' })}
                className="col-span-2 mt-4 border-2 border-maroon text-maroon py-5 rounded-3xl font-black uppercase text-[10px] tracking-widest hover:bg-maroon hover:text-white transition-all flex items-center justify-center gap-3 hover:-translate-y-1"
              >
                <User size={20} />
                Switch to Customer
              </button>
            </>
          )}

          <div className="col-span-2 pt-8 border-t border-gray-50 dark:border-gray-800 space-y-4">
            <button 
              onClick={() => navigateTo('edit-profile')}
              className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 group-hover:text-maroon transition-colors">
                  <Settings size={20} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-900 dark:text-white">Account Settings</span>
              </div>
              <ChevronRight size={16} className="text-gray-300" />
            </button>
            
            <button 
              onClick={handleLogout} 
              className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-500">
                  <LogOut size={20} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-red-500">Sign Out</span>
              </div>
              <ChevronRight size={16} className="text-red-200" />
            </button>
          </div>
        </motion.div>
      </div>
      <BottomNav {...bottomNavProps} />
    </div>
  );

  const EditProfileView = () => {
    const [editName, setEditName] = useState(currentUser?.displayName || '');
    const [editBio, setEditBio] = useState(userProfile?.bio || '');
    const [editPhoto, setEditPhoto] = useState(currentUser?.photoURL || '');
    const [editStudentId, setEditStudentId] = useState(userProfile?.studentId || '');
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
      setIsSaving(true);
      try {
        await updateUserProfile({
          displayName: editName,
          photoURL: editPhoto,
          bio: editBio,
          studentId: editStudentId
        });
        toast.success('Profile updated successfully!');
      } catch (error) {
        toast.error('Failed to update profile');
      } finally {
        setIsSaving(false);
      }
    };

    return (
      <div className="pb-24 bg-gray-50 dark:bg-[#0a0a0a] min-h-screen">
        <Header {...headerProps} />
        <div className="bg-maroon text-white p-8 pt-16 rounded-b-[4rem] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          <div className="flex items-center gap-6 relative z-10">
            <button onClick={() => navigateTo('profile')} className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center hover:bg-white/20 transition-all">
              <ChevronLeft size={24} />
            </button>
            <h2 className="font-black text-3xl uppercase tracking-tighter">Edit Profile</h2>
          </div>
        </div>
        
        <div className="p-8 flex flex-col items-center -mt-16 relative z-20">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative group"
          >
            <div className="absolute inset-0 bg-maroon/20 rounded-full blur-2xl group-hover:blur-3xl transition-all"></div>
            <img 
              src={editPhoto || `https://ui-avatars.com/api/?name=${editName}&background=random`} 
              className="w-44 h-44 rounded-full object-cover border-4 border-white dark:border-gray-900 shadow-2xl relative z-10 transition-transform group-hover:scale-105" 
              alt="Profile" 
            />
            <button className="absolute bottom-2 right-2 bg-maroon text-white p-4 rounded-2xl shadow-2xl hover:scale-110 transition-transform z-20 border-4 border-white dark:border-gray-900">
              <Camera size={24} />
            </button>
          </motion.div>
        </div>

        <div className="px-8 space-y-8 max-w-2xl mx-auto">
          <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-10 shadow-xl space-y-8 border border-gray-100 dark:border-gray-800">
            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Display Name</label>
              <div className="relative">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                <input 
                  type="text" 
                  className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl pl-14 pr-6 py-5 focus:ring-2 ring-maroon outline-none font-bold text-gray-900 dark:text-white shadow-inner transition-all" 
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Your full name"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Student ID</label>
              <div className="relative">
                <ShieldCheck className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                <input 
                  type="text" 
                  className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl pl-14 pr-6 py-5 focus:ring-2 ring-maroon outline-none font-bold text-gray-900 dark:text-white shadow-inner transition-all" 
                  value={editStudentId}
                  onChange={(e) => setEditStudentId(e.target.value)}
                  placeholder="e.g. A24-1234"
                />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Bio / About</label>
              <textarea 
                className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl px-6 py-5 focus:ring-2 ring-maroon outline-none font-bold text-gray-900 dark:text-white shadow-inner transition-all h-40 resize-none" 
                value={editBio}
                onChange={(e) => setEditBio(e.target.value)}
                placeholder="Tell us about yourself..."
              />
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Profile Photo URL</label>
              <div className="relative">
                <Camera className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                <input 
                  type="text" 
                  className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl pl-14 pr-6 py-5 focus:ring-2 ring-maroon outline-none font-bold text-gray-900 dark:text-white shadow-inner transition-all" 
                  value={editPhoto}
                  onChange={(e) => setEditPhoto(e.target.value)}
                  placeholder="https://..."
                />
              </div>
            </div>

            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="w-full bg-maroon text-white py-6 rounded-3xl font-black uppercase text-xs tracking-[0.2em] hover:bg-black transition-all shadow-2xl flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed hover:-translate-y-1"
            >
              {isSaving ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <ShieldCheck size={20} />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
        <BottomNav {...bottomNavProps} />
      </div>
    );
  };

  const SellerDashboardView = () => {
    const myOrders = orders.filter(o => o.sellerId === currentUser?.uid);
    const validOrders = myOrders.filter(o => o.status !== 'CANCELLED' && o.status !== 'REJECTED');
    const completedOrders = validOrders.filter(o => o.status === 'DELIVERED');
    const totalSales = validOrders.reduce((sum, order) => sum + order.total, 0);
    const totalOrders = validOrders.length;
    const pendingOrders = myOrders.filter(o => o.status === 'PREPARING' || o.status === 'SHIPPED').length;
    const totalTaxOwed = completedOrders.reduce((sum, order) => sum + (order.taxAmount || 0), 0);
    const pendingTax = validOrders.filter(o => o.status !== 'DELIVERED').reduce((sum, order) => sum + (order.taxAmount || 0), 0);
    
    // Accurate data for charts
    const revenueByDay = validOrders.reduce((acc: any, order) => {
      const day = new Date(order.date).toLocaleDateString('en-US', { weekday: 'short' });
      acc[day] = (acc[day] || 0) + order.total;
      return acc;
    }, {});

    const salesData = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => ({
      name: day,
      sales: revenueByDay[day] || 0
    }));

    const productSales = validOrders.reduce((acc: any, order) => {
      order.items.forEach(item => {
        acc[item.name] = (acc[item.name] || 0) + item.quantity;
      });
      return acc;
    }, {});

    const productPerformance = Object.entries(productSales)
      .map(([name, sales]) => ({ name, sales: sales as number }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);

    const myProducts = allProducts.filter(p => p.sellerId === currentUser?.uid);

    return (
      <div className="pb-24 bg-[#f8f9fa] dark:bg-[#0a0a0a] min-h-screen">
        <Header {...headerProps} />
        <div className="p-6 max-w-5xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-maroon/20 pb-6">
            <div className="space-y-1">
              <span className="text-maroon font-black text-[10px] uppercase tracking-[0.4em]">Business Overview</span>
              <h2 className="font-black text-4xl text-maroon dark:text-white uppercase tracking-tighter">Seller Dashboard</h2>
            </div>
            <div className="flex items-center gap-2 bg-maroon/5 dark:bg-maroon/10 px-4 py-2 rounded-full border border-maroon/10">
              <BarChart3 className="text-maroon" size={18} />
              <span className="text-[10px] font-bold text-maroon uppercase tracking-widest">Real-time Analytics</span>
            </div>
          </div>

          {/* Stats Grid - Hardware Recipe Influence */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-800 flex items-center gap-6 group hover:shadow-xl transition-all duration-300">
              <div className="bg-green-500 w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-green-500/20 group-hover:scale-110 transition-transform">
                <DollarSign size={32} />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Total Revenue</p>
                <p className="text-sm font-black text-gray-400 uppercase mb-1">PHP</p>
                <p className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">{totalSales.toLocaleString()}</p>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-800 flex items-center gap-6 group hover:shadow-xl transition-all duration-300">
              <div className="bg-maroon w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-maroon/20 group-hover:scale-110 transition-transform">
                <ShieldCheck size={32} />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Tax Owed (Completed)</p>
                <p className="text-sm font-black text-gray-400 uppercase mb-1">PHP</p>
                <p className="text-3xl font-black text-maroon tracking-tighter">{totalTaxOwed.toLocaleString()}</p>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-800 flex items-center gap-6 group hover:shadow-xl transition-all duration-300">
              <div className="bg-gray-500 w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-gray-500/20 group-hover:scale-110 transition-transform">
                <Clock size={32} />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Tax Pending</p>
                <p className="text-sm font-black text-gray-400 uppercase mb-1">PHP</p>
                <p className="text-3xl font-black text-gray-500 tracking-tighter">{pendingTax.toLocaleString()}</p>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-800 flex items-center gap-6 group hover:shadow-xl transition-all duration-300">
              <div className="bg-blue-500 w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                <Package size={32} />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Total Orders</p>
                <p className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">{totalOrders}</p>
              </div>
            </div>
            <div className="bg-white dark:bg-gray-900 p-8 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-800 flex items-center gap-6 group hover:shadow-xl transition-all duration-300">
              <div className="bg-orange-500 w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-orange-500/20 group-hover:scale-110 transition-transform">
                <TrendingUp size={32} />
              </div>
              <div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Pending Orders</p>
                <p className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">{pendingOrders}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Sales Chart */}
            <div className="bg-white dark:bg-gray-900 p-8 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800">
              <div className="flex justify-between items-center mb-8">
                <h3 className="font-black text-sm text-gray-900 dark:text-white uppercase tracking-widest">Weekly Revenue</h3>
                <select className="bg-gray-50 dark:bg-gray-800 border-none text-[10px] font-bold uppercase tracking-widest rounded-full px-4 py-2 outline-none">
                  <option>Last 7 Days</option>
                  <option>Last 30 Days</option>
                </select>
              </div>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={salesData}>
                    <defs>
                      <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#800000" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#800000" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600 }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600 }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', padding: '12px' }}
                      itemStyle={{ fontWeight: 800, fontSize: '12px' }}
                    />
                    <Area type="monotone" dataKey="sales" stroke="#800000" strokeWidth={4} fillOpacity={1} fill="url(#colorSales)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Product Performance */}
            <div className="bg-white dark:bg-gray-900 p-8 rounded-[2rem] shadow-sm border border-gray-100 dark:border-gray-800">
              <h3 className="font-black text-sm text-gray-900 dark:text-white uppercase tracking-widest mb-8">Top Products</h3>
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={productPerformance} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600 }} width={120} />
                    <Tooltip 
                      cursor={{ fill: '#f9f9f9' }}
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', padding: '12px' }}
                    />
                    <Bar dataKey="sales" fill="#800000" radius={[0, 10, 10, 0]} barSize={20}>
                      {productPerformance.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? '#800000' : '#a00000'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <button 
              onClick={() => navigateTo('manage-orders')}
              className="group relative bg-maroon text-white p-8 rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] shadow-2xl overflow-hidden transition-all hover:scale-[1.02]"
            >
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-125 transition-transform">
                <ClipboardList size={80} />
              </div>
              <div className="relative z-10 flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                  <ClipboardList size={24} />
                </div>
                <div className="text-left">
                  <p className="text-lg">Manage Orders</p>
                  <p className="text-[10px] text-white/60 normal-case font-medium">Process and track student purchases</p>
                </div>
              </div>
            </button>
            <button 
              onClick={() => navigateTo('manage-products')}
              className="group relative bg-white dark:bg-gray-900 text-maroon border-2 border-maroon/20 p-8 rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] shadow-xl overflow-hidden transition-all hover:scale-[1.02]"
            >
              <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:scale-125 transition-transform">
                <Package size={80} />
              </div>
              <div className="relative z-10 flex items-center gap-4">
                <div className="w-12 h-12 bg-maroon/10 rounded-2xl flex items-center justify-center">
                  <Package size={24} />
                </div>
                <div className="text-left">
                  <p className="text-lg">Manage Products</p>
                  <p className="text-[10px] text-maroon/60 normal-case font-medium">Update inventory and add new items</p>
                </div>
              </div>
            </button>
          </div>
        </div>
        <BottomNav {...bottomNavProps} />
      </div>
    );
  };

  const WishlistView = () => {
    const wishlistItems = allProducts.filter(p => wishlist.includes(p.id));

    return (
      <div className="pb-24 bg-gray-50 dark:bg-[#0a0a0a] min-h-screen">
        <Header {...headerProps} />
        <div className="p-4 max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <button onClick={() => navigateTo('shop')} className="p-2 bg-white dark:bg-gray-900 rounded-full shadow-sm">
              <ChevronLeft size={20} className="text-maroon" />
            </button>
            <h2 className="font-black text-2xl text-maroon dark:text-white uppercase tracking-tighter">My Wishlist</h2>
          </div>

          {wishlistItems.length === 0 ? (
            <div className="text-center py-32 space-y-4">
              <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto text-gray-300">
                <Heart size={48} />
              </div>
              <p className="font-bold text-gray-400 uppercase tracking-widest text-sm">Your wishlist is empty</p>
              <button onClick={() => navigateTo('shop')} className="bg-maroon text-white px-8 py-3 rounded-full font-bold uppercase text-xs tracking-widest shadow-lg">Start Shopping</button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {wishlistItems.map(product => (
                <motion.div 
                  layout
                  key={product.id} 
                  className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800 group"
                  onClick={() => { setSelectedProduct(product); navigateTo('product-details'); }}
                >
                  <div className="aspect-square relative">
                    <img src={product.images[0]} className="w-full h-full object-cover" alt={product.name} />
                    <button 
                      onClick={(e) => { e.stopPropagation(); toggleWishlist(product.id); }}
                      className="absolute top-3 right-3 w-8 h-8 bg-white/90 dark:bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg"
                    >
                      <Heart size={16} className="fill-red-500 text-red-500" />
                    </button>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-sm line-clamp-1 dark:text-white">{product.name}</h3>
                    <p className="font-black text-maroon dark:text-red-400 mt-1">PHP {product.price}</p>
                    <button 
                      onClick={(e) => { 
                        e.stopPropagation(); 
                        addToCart(product);
                      }}
                      className="w-full mt-3 bg-maroon text-white py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest shadow-md hover:scale-105 transition-transform"
                    >
                      Add to Cart
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
        <BottomNav {...bottomNavProps} />
      </div>
    );
  };

  const NotificationsView = () => (
    <div className="pb-24 bg-gray-50 dark:bg-[#0a0a0a] min-h-screen">
      <Header {...headerProps} />
      <div className="p-4 max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigateTo('shop')} className="p-2 bg-white dark:bg-gray-900 rounded-full shadow-sm">
            <ChevronLeft size={20} className="text-maroon" />
          </button>
          <h2 className="font-black text-2xl text-maroon dark:text-white uppercase tracking-tighter">Notifications</h2>
        </div>

        <div className="space-y-3">
          {notifications.map(n => (
            <div 
              key={n.id} 
              onClick={() => markAsRead(n.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${n.isRead ? 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 opacity-60' : 'bg-white dark:bg-gray-900 border-maroon/20 shadow-md scale-[1.02]'}`}
            >
              <div className="flex gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                  n.type === 'order' ? 'bg-blue-100 text-blue-600' : 
                  n.type === 'message' ? 'bg-green-100 text-green-600' : 
                  'bg-purple-100 text-purple-600'
                }`}>
                  {n.type === 'order' ? <Package size={24} /> : n.type === 'message' ? <MessageSquare size={24} /> : <TrendingUp size={24} />}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-bold text-sm dark:text-white">{n.title}</h4>
                    <span className="text-[10px] font-bold text-gray-400 uppercase">{n.date}</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{n.message}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <BottomNav {...bottomNavProps} />
    </div>
  );

  const ManageProductsView = () => {
    const myProducts = allProducts.filter(p => p.sellerId === currentUser?.uid);

    return (
      <div className="pb-24 bg-[#f8f9fa] dark:bg-[#0a0a0a] min-h-screen">
        <Header {...headerProps} />
        <div className="p-6 max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-maroon/20 pb-8">
            <div className="space-y-2">
              <div className="flex items-center gap-3 mb-2">
                <button onClick={() => navigateTo('seller-dashboard')} className="p-2 bg-white dark:bg-gray-900 rounded-full shadow-sm hover:scale-110 transition-transform">
                  <ChevronLeft size={20} className="text-maroon" />
                </button>
                <span className="text-maroon font-black text-[10px] uppercase tracking-[0.4em]">Inventory Control</span>
              </div>
              <h2 className="font-black text-5xl text-maroon dark:text-white uppercase tracking-tighter">My Products</h2>
            </div>
            
            <motion.button 
              whileHover={{ scale: 1.05, backgroundColor: '#000' }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                const newProd: Product = {
                  id: 'PROD-' + Date.now(),
                  name: '',
                  price: 0,
                  stock: 0,
                  images: [],
                  category: 'accessories',
                  sellerId: currentUser?.uid || 'system',
                  sellerName: currentUser?.displayName || 'Seller'
                };
                setEditingProduct(newProd);
              }}
              className="group bg-maroon text-white px-8 py-4 rounded-full font-black uppercase text-xs tracking-widest shadow-2xl flex items-center gap-3 transition-all duration-300 transform"
            >
              <Plus size={20} className="group-hover:rotate-90 transition-transform duration-300" />
              Add New Product
            </motion.button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {myProducts.length === 0 ? (
              <div className="col-span-full text-center py-32 space-y-6 bg-white dark:bg-gray-900 rounded-[3rem] border-2 border-dashed border-gray-200 dark:border-gray-800">
                <div className="w-24 h-24 bg-gray-50 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto text-gray-300">
                  <Package size={48} />
                </div>
                <div className="space-y-2">
                  <p className="font-black text-gray-900 dark:text-white uppercase tracking-widest">No products listed</p>
                  <p className="text-sm text-gray-400 max-w-xs mx-auto">Start showcasing your craftsmanship to the Envergista community today.</p>
                </div>
                <button 
                  onClick={() => setEditingProduct({ id: 'PROD-'+Date.now(), name: '', price: 0, stock: 0, images: [], category: 'accessories', sellerId: currentUser?.uid || 'system', sellerName: currentUser?.displayName || 'Seller' })}
                  className="text-maroon font-black uppercase text-xs tracking-widest underline underline-offset-8"
                >
                  Create your first listing
                </button>
              </div>
            ) : (
              myProducts.map(product => (
                <motion.div 
                  layout
                  key={product.id} 
                  className="bg-white dark:bg-gray-900 rounded-[2.5rem] overflow-hidden flex shadow-sm border border-gray-100 dark:border-gray-800 group hover:shadow-2xl transition-all duration-500"
                >
                  <div className="w-40 h-40 shrink-0 relative overflow-hidden">
                    <img src={product.images[0] || 'https://picsum.photos/seed/placeholder/300/300'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={product.name} />
                    <div className="absolute top-3 left-3 bg-white/90 dark:bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest text-maroon dark:text-white">
                      {product.category}
                    </div>
                  </div>
                  <div className="flex-1 p-6 flex flex-col justify-between">
                    <div className="flex justify-between items-end">
                      <div>
                        <h3 className="font-black text-xl leading-none tracking-tighter mb-1 dark:text-white">{product.name || 'Untitled Product'}</h3>
                        <p className="text-maroon font-black text-lg">PHP {product.price.toLocaleString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Stock</p>
                        <p className={`text-xs font-black uppercase tracking-tighter ${product.stock <= 0 ? 'text-red-500' : product.stock <= 5 ? 'text-orange-500' : 'text-green-500'}`}>
                          {product.stock <= 0 ? 'Out of Stock' : `${product.stock} Units`}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex justify-end gap-3">
                      <button 
                        onClick={() => setEditingProduct(product)}
                        className="w-10 h-10 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-maroon hover:text-white transition-all duration-300"
                      >
                        <Edit size={18} />
                      </button>
                      <button 
                        onClick={() => setProductToDelete(product)}
                        className="w-10 h-10 rounded-full bg-gray-50 dark:bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-red-500 hover:text-white transition-all duration-300"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
        <BottomNav {...bottomNavProps} />
      </div>
    );
  };

  const OrderDetailsView = () => {
    if (!selectedOrder) return null;

    return (
      <div className="pb-24 bg-gray-50 dark:bg-black min-h-screen">
        <Header {...headerProps} />
        <div className="p-6 max-w-2xl mx-auto space-y-8">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigateTo(userProfile?.role === 'admin' && ADMIN_EMAILS.includes(currentUser?.email) ? 'admin-dashboard' : 'orders')} 
              className="p-2 bg-white dark:bg-gray-900 rounded-full shadow-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
            >
              <ChevronLeft size={20} className="dark:text-white" />
            </button>
            <h2 className="text-3xl font-black text-gray-900 dark:text-white uppercase tracking-tighter">Order <span className="text-maroon">Details</span></h2>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] p-8 shadow-xl border border-gray-100 dark:border-gray-800 space-y-8">
            <div className="flex justify-between items-start">
              <div className="space-y-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Order Reference</p>
                <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">#{selectedOrder.id.slice(-8)}</h3>
                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">{new Date(selectedOrder.date).toLocaleString()}</p>
              </div>
              <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                selectedOrder.status === 'DELIVERED' ? 'bg-green-100 text-green-600' : 
                selectedOrder.status === 'SHIPPED' ? 'bg-blue-100 text-blue-600' : 
                'bg-yellow-100 text-yellow-600'
              }`}>
                {selectedOrder.status}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-8 border-y border-gray-50 dark:border-gray-800">
              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-maroon">Customer Information</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <User size={16} className="text-gray-400" />
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{selectedOrder.customerName}</p>
                  </div>
                  {selectedOrder.customerStudentId && (
                    <div className="flex items-center gap-3">
                      <ShieldCheck size={16} className="text-gray-400" />
                      <p className="text-sm font-bold text-gray-900 dark:text-white">ID: {selectedOrder.customerStudentId}</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-maroon">Payment Details</h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <CreditCard size={16} className="text-gray-400" />
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{selectedOrder.paymentMethod}</p>
                  </div>
                  <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">Transaction Verified</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-maroon">Order Items</h4>
              <div className="space-y-4">
                {selectedOrder.items.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-3xl">
                    <div className="w-20 h-20 rounded-2xl overflow-hidden shrink-0">
                      <img src={item.images[0]} className="w-full h-full object-cover" alt="" />
                    </div>
                    <div className="flex-1">
                      <h5 className="text-sm font-black uppercase tracking-tight text-gray-900 dark:text-white">{item.name}</h5>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Qty: {item.quantity} × ₱{item.price.toLocaleString()}</p>
                    </div>
                    <p className="font-black text-gray-900 dark:text-white">₱{(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-8 border-t border-gray-50 dark:border-gray-800 flex justify-between items-center">
              <span className="text-xl font-black uppercase tracking-tighter text-gray-900 dark:text-white">Total Amount</span>
              <span className="text-3xl font-black text-maroon">₱{selectedOrder.total.toLocaleString()}</span>
            </div>
          </div>
        </div>
        <BottomNav {...bottomNavProps} />
      </div>
    );
  };

  const AdminDashboardView = () => {
    const [activeTab, setActiveTab] = useState<'users' | 'orders' | 'reports' | 'tax' | 'settings'>('users');
    const [roleFilter, setRoleFilter] = useState<'all' | 'customer' | 'seller' | 'admin'>('all');

    if (userProfile?.role !== 'admin' || !ADMIN_EMAILS.includes(currentUser?.email)) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <ShieldCheck size={64} className="text-maroon animate-pulse" />
          <h2 className="text-2xl font-black uppercase tracking-tighter">Access Denied</h2>
          <p className="text-gray-500 text-sm">You do not have permission to view this dashboard.</p>
          <button onClick={() => navigateTo('landing')} className="bg-maroon text-white px-8 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest">Return Home</button>
        </div>
      );
    }

    const validOrders = allOrders.filter(o => o.status !== 'CANCELLED' && o.status !== 'REJECTED');

    const stats = {
      totalUsers: allUsers.length,
      totalSellers: allUsers.filter(u => u.role === 'seller').length,
      totalCustomers: allUsers.filter(u => u.role === 'customer').length,
      totalOrders: validOrders.length,
      totalRevenue: validOrders.reduce((acc, curr) => acc + curr.total, 0),
      totalTaxCollected: allOrders.filter(o => o.status === 'DELIVERED').reduce((acc, curr) => acc + (curr.taxAmount || 0), 0),
      blockedUsers: allUsers.filter(u => u.isBlocked).length,
      pendingOrders: allOrders.filter(o => o.status === 'PREPARING').length
    };

    const filteredUsers = allUsers.filter(user => {
      if (roleFilter === 'all') return true;
      return user.role === roleFilter;
    });

    // Report Data
    const revenueByDay = validOrders.reduce((acc: any, order) => {
      const day = new Date(order.date).toLocaleDateString('en-US', { weekday: 'short' });
      acc[day] = (acc[day] || 0) + order.total;
      return acc;
    }, {});

    const chartData = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => ({
      name: day,
      revenue: revenueByDay[day] || 0
    }));

    const productSales = validOrders.reduce((acc: any, order) => {
      order.items.forEach(item => {
        acc[item.name] = (acc[item.name] || 0) + item.quantity;
      });
      return acc;
    }, {});

    const topProductsData = Object.entries(productSales)
      .map(([name, sales]) => ({ name, sales: sales as number }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);

    const sellerPerformance = allUsers
      .filter(u => u.role === 'seller')
      .map(seller => {
        const sellerOrders = validOrders.filter(o => o.sellerId === seller.uid);
        return {
          id: seller.uid,
          name: seller.displayName || seller.email,
          sales: sellerOrders.reduce((sum, o) => sum + o.total, 0),
          taxPaid: sellerOrders.filter(o => o.status === 'DELIVERED').reduce((sum, o) => sum + (o.taxAmount || 0), 0),
          count: sellerOrders.length
        };
      })
      .sort((a, b) => b.sales - a.sales);

    return (
      <div className="pb-24 bg-[#fcfcfc] dark:bg-[#050505] min-h-screen font-sans">
        <Header {...headerProps} />
        
        {/* Hero Section */}
        <div className="relative pt-20 pb-32 px-6 overflow-hidden">
          <div className="absolute inset-0 bg-maroon">
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_50%_120%,rgba(255,255,255,0.4),transparent)]"></div>
            <div className="absolute top-0 right-0 w-[50vw] h-[50vw] bg-white/5 rounded-full -mr-[25vw] -mt-[25vw] blur-3xl"></div>
          </div>
          
          <div className="relative z-10 max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
              <div className="space-y-4">
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-3"
                >
                  <button onClick={() => navigateTo('profile')} className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center hover:bg-white/20 transition-all border border-white/10">
                    <ChevronLeft size={20} className="text-white" />
                  </button>
                  <span className="text-white/60 font-black text-[10px] uppercase tracking-[0.5em]">System Administrator</span>
                </motion.div>
                <motion.h2 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-none"
                >
                  Control <br /> <span className="text-white/40 italic">Center</span>
                </motion.h2>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full md:w-auto">
                <div className="bg-white/10 backdrop-blur-xl p-6 rounded-[2rem] border border-white/10 shadow-2xl">
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Total Revenue</p>
                  <p className="text-2xl font-black text-white tracking-tighter">₱{stats.totalRevenue.toLocaleString()}</p>
                  <div className="mt-2 flex items-center gap-1 text-[10px] font-bold text-green-400">
                    <TrendingUp size={12} />
                    <span>+12.5%</span>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-xl p-6 rounded-[2rem] border border-white/10 shadow-2xl">
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Tax Collected</p>
                  <p className="text-2xl font-black text-white tracking-tighter">₱{stats.totalTaxCollected.toLocaleString()}</p>
                  <div className="mt-2 flex items-center gap-1 text-[10px] font-bold text-blue-400">
                    <ShieldCheck size={12} />
                    <span>Verified</span>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-xl p-6 rounded-[2rem] border border-white/10 shadow-2xl">
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Total Orders</p>
                  <p className="text-2xl font-black text-white tracking-tighter">{stats.totalOrders}</p>
                  <div className="mt-2 flex items-center gap-1 text-[10px] font-bold text-blue-400">
                    <Package size={12} />
                    <span>Active System</span>
                  </div>
                </div>
                <div className="hidden md:block bg-white/10 backdrop-blur-xl p-6 rounded-[2rem] border border-white/10 shadow-2xl">
                  <p className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-2">Active Users</p>
                  <p className="text-2xl font-black text-white tracking-tighter">{stats.totalUsers}</p>
                  <div className="mt-2 flex items-center gap-1 text-[10px] font-bold text-orange-400">
                    <User size={12} />
                    <span>Verified</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="max-w-7xl mx-auto px-6 -mt-16 relative z-20">
          <div className="bg-white dark:bg-[#0a0a0a] rounded-[3rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.1)] overflow-hidden border border-gray-100 dark:border-white/5">
            {/* Tab Navigation */}
            <div className="flex border-b border-gray-100 dark:border-white/5 overflow-x-auto no-scrollbar bg-gray-50/50 dark:bg-white/5">
              {[
                { id: 'users', label: 'Users', icon: <User size={16} /> },
                { id: 'orders', label: 'Orders', icon: <ClipboardList size={16} /> },
                { id: 'reports', label: 'Reports', icon: <BarChart3 size={16} /> },
                { id: 'tax', label: 'Listing Tax', icon: <DollarSign size={16} /> },
                { id: 'settings', label: 'Settings', icon: <Settings size={16} /> }
              ].map(tab => (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 min-w-[140px] py-8 flex flex-col items-center gap-2 transition-all duration-500 relative ${activeTab === tab.id ? 'text-maroon' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}`}
                >
                  <div className={`p-2 rounded-xl transition-all duration-500 ${activeTab === tab.id ? 'bg-maroon/10 scale-110' : 'bg-transparent'}`}>
                    {tab.icon}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em]">{tab.label}</span>
                  {activeTab === tab.id && (
                    <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-maroon rounded-t-full" />
                  )}
                </button>
              ))}
            </div>

            <div className="p-8 md:p-12">
              <AnimatePresence mode="wait">
                {activeTab === 'users' && (
                  <motion.div 
                    key="users"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-10"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="space-y-1">
                        <h3 className="text-2xl font-black uppercase tracking-tighter dark:text-white">User Management</h3>
                        <p className="text-xs text-gray-400 font-medium">Control access and roles for the Envergista community</p>
                      </div>
                      <div className="flex gap-2 p-1 bg-gray-100 dark:bg-white/5 rounded-2xl">
                        {(['all', 'customer', 'seller', 'admin'] as const).map(role => (
                          <button
                            key={role}
                            onClick={() => setRoleFilter(role)}
                            className={`px-6 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${roleFilter === role ? 'bg-white dark:bg-gray-800 text-maroon shadow-sm' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}`}
                          >
                            {role}s
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      {filteredUsers.map((user: any) => (
                        <div key={user.id} className="group flex flex-col md:flex-row md:items-center justify-between p-6 bg-white dark:bg-[#0d0d0d] rounded-[2rem] border border-gray-100 dark:border-white/5 hover:border-maroon/20 hover:shadow-2xl hover:shadow-maroon/5 transition-all duration-500">
                          <div className="flex items-center gap-6">
                            <div className="relative">
                              <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName}`} className="w-16 h-16 rounded-2xl object-cover shadow-lg group-hover:scale-105 transition-transform duration-500" alt="" />
                              <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-[#0d0d0d] ${user.isBlocked ? 'bg-red-500' : 'bg-green-500'}`}></div>
                            </div>
                            <div>
                              <h4 className="font-black text-lg tracking-tight dark:text-white leading-none mb-1">{user.displayName || 'Unnamed User'}</h4>
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{user.email}</p>
                              <div className="flex gap-2 mt-3">
                                <span className={`text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-lg ${
                                  user.role === 'seller' ? 'bg-blue-500/10 text-blue-500' : 
                                  user.role === 'admin' ? 'bg-purple-500/10 text-purple-500' : 
                                  'bg-gray-500/10 text-gray-500'
                                }`}>
                                  {user.role}
                                </span>
                                {user.isBlocked && (
                                  <span className="text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-lg bg-red-500/10 text-red-500">
                                    Account Restricted
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 mt-6 md:mt-0">
                            <button 
                              onClick={() => startChat({ id: 'admin_contact', name: 'System Message', price: 0, category: 'Admin', sellerId: user.id, sellerName: user.displayName, images: [], createdAt: '', stock: 1 }, user.id, user.displayName)}
                              className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-white/5 flex items-center justify-center text-gray-400 hover:bg-maroon/10 hover:text-maroon transition-all"
                            >
                              <MessageSquare size={20} />
                            </button>
                            <button 
                              onClick={() => toggleUserBlock(user.id, user.isBlocked || false)}
                              className={`flex-1 md:flex-none px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${user.isBlocked ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' : 'bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white'}`}
                            >
                              {user.isBlocked ? 'Unrestrict Access' : 'Restrict User'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {activeTab === 'orders' && (
                  <motion.div 
                    key="orders"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-10"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <h3 className="text-2xl font-black uppercase tracking-tighter dark:text-white">Order History</h3>
                        <p className="text-xs text-gray-400 font-medium">Global transaction log across all sellers and customers</p>
                      </div>
                      <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 rounded-xl border border-green-500/20">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-green-500">Live Monitoring Active</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      {allOrders.length === 0 ? (
                        <div className="text-center py-32 bg-gray-50 dark:bg-white/5 rounded-[3rem] border-2 border-dashed border-gray-100 dark:border-white/5">
                          <Package size={48} className="mx-auto text-gray-300 mb-4" />
                          <p className="text-xs font-black uppercase tracking-widest text-gray-400">No transactions recorded</p>
                        </div>
                      ) : (
                        allOrders.map((order: Order) => (
                          <div key={order.id} className="group p-8 bg-white dark:bg-[#0d0d0d] rounded-[2.5rem] border border-gray-100 dark:border-white/5 hover:border-maroon/20 transition-all duration-500">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                              <div className="flex items-center gap-6">
                                <div className="w-16 h-16 rounded-2xl bg-maroon/5 flex items-center justify-center text-maroon">
                                  <ShoppingBag size={32} />
                                </div>
                                <div>
                                  <div className="flex items-center gap-3 mb-1">
                                    <h4 className="font-black text-xl tracking-tight dark:text-white uppercase leading-none">₱{order.total.toLocaleString()}</h4>
                                    <span className={`text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-lg ${
                                      order.status === 'DELIVERED' ? 'bg-green-500/10 text-green-500' : 
                                      order.status === 'SHIPPED' ? 'bg-blue-500/10 text-blue-500' : 
                                      'bg-orange-500/10 text-orange-500'
                                    }`}>
                                      {order.status}
                                    </span>
                                  </div>
                                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Ref: {order.id.slice(-8)} • {new Date(order.date).toLocaleDateString()}</p>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-8 w-full md:w-auto border-t md:border-t-0 pt-6 md:pt-0 border-gray-100 dark:border-white/5">
                                <div className="flex-1 md:flex-none">
                                  <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest mb-1">Customer</p>
                                  <p className="text-xs font-bold dark:text-gray-200">{order.customerName}</p>
                                </div>
                                <button 
                                  onClick={() => {
                                    setSelectedOrder(order);
                                    navigateTo('order-details');
                                  }}
                                  className="w-12 h-12 rounded-2xl bg-maroon text-white flex items-center justify-center shadow-lg shadow-maroon/20 hover:scale-110 transition-all"
                                >
                                  <ChevronRight size={20} />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}

                {activeTab === 'tax' && (
                  <motion.div 
                    key="tax"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="space-y-12"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="space-y-1">
                        <h3 className="text-2xl font-black uppercase tracking-tighter dark:text-white">Tax Management</h3>
                        <p className="text-xs text-gray-400 font-medium">Monitor and manage seller commission fees</p>
                      </div>
                      <div className="bg-maroon/5 border border-maroon/10 px-6 py-4 rounded-2xl">
                        <p className="text-[10px] font-black text-maroon uppercase tracking-widest mb-1">Current Tax Rate</p>
                        <p className="text-2xl font-black text-maroon">{(appSettings?.listingTaxRate || 0) * 100}%</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                      <div className="bg-white dark:bg-[#0d0d0d] p-10 rounded-[3rem] border border-gray-100 dark:border-white/5 shadow-xl overflow-hidden">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left">
                            <thead>
                              <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 border-b border-gray-100 dark:border-white/5">
                                <th className="pb-6">Seller</th>
                                <th className="pb-6">Total Sales</th>
                                <th className="pb-6">Orders</th>
                                <th className="pb-6 text-right">Tax Owed to Admin</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                              {sellerPerformance.map((seller, idx) => (
                                <tr key={idx} className="group">
                                  <td className="py-6">
                                    <div className="flex items-center gap-4">
                                      <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/5 flex items-center justify-center text-maroon">
                                        <User size={18} />
                                      </div>
                                      <span className="text-sm font-bold dark:text-white">{seller.name}</span>
                                    </div>
                                  </td>
                                  <td className="py-6">
                                    <span className="text-xs font-black dark:text-gray-400">₱{seller.sales.toLocaleString()}</span>
                                  </td>
                                  <td className="py-6">
                                    <span className="text-xs font-black dark:text-gray-400">{seller.count}</span>
                                  </td>
                                  <td className="py-6 text-right">
                                    <div className="inline-flex flex-col items-end">
                                      <span className="text-lg font-black text-maroon">₱{seller.taxPaid.toLocaleString()}</span>
                                      <span className="text-[8px] font-black uppercase tracking-widest text-gray-400">{(appSettings?.listingTaxRate || 0) * 100}% Commission</span>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

              {activeTab === 'reports' && (
                <motion.div 
                  key="reports"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-12"
                >
                  <div className="space-y-1">
                    <h3 className="text-2xl font-black uppercase tracking-tighter dark:text-white">Activity Reports</h3>
                    <p className="text-xs text-gray-400 font-medium">Visualized data and performance metrics</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Revenue Chart */}
                    <div className="bg-white dark:bg-[#0d0d0d] p-10 rounded-[3rem] border border-gray-100 dark:border-white/5 shadow-xl">
                      <div className="flex justify-between items-center mb-10">
                        <div>
                          <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-1">Revenue Stream</h4>
                          <p className="text-sm font-black dark:text-white">Weekly Performance</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-maroon/5 flex items-center justify-center text-maroon">
                          <TrendingUp size={20} />
                        </div>
                      </div>
                      <div className="h-72 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={chartData}>
                            <defs>
                              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#800000" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#800000" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" opacity={0.1} />
                            <XAxis 
                              dataKey="name" 
                              axisLine={false} 
                              tickLine={false} 
                              tick={{ fontSize: 10, fontWeight: 800, fill: '#9ca3af' }} 
                            />
                            <YAxis 
                              axisLine={false} 
                              tickLine={false} 
                              tick={{ fontSize: 10, fontWeight: 800, fill: '#9ca3af' }}
                              tickFormatter={(value) => `₱${value >= 1000 ? (value/1000).toFixed(1) + 'k' : value}`}
                            />
                            <Tooltip 
                              contentStyle={{ backgroundColor: '#000', border: 'none', borderRadius: '16px', color: '#fff' }}
                              itemStyle={{ color: '#fff', fontWeight: 800, fontSize: '12px' }}
                            />
                            <Area type="monotone" dataKey="revenue" stroke="#800000" strokeWidth={4} fillOpacity={1} fill="url(#colorRevenue)" />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Top Products */}
                    <div className="bg-white dark:bg-[#0d0d0d] p-10 rounded-[3rem] border border-gray-100 dark:border-white/5 shadow-xl">
                      <div className="flex justify-between items-center mb-10">
                        <div>
                          <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-1">Market Demand</h4>
                          <p className="text-sm font-black dark:text-white">Top Selling Items</p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-blue-500/5 flex items-center justify-center text-blue-500">
                          <ShoppingBag size={20} />
                        </div>
                      </div>
                      <div className="space-y-6">
                        {topProductsData.map((item, idx) => (
                          <div key={idx} className="space-y-2">
                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                              <span className="dark:text-white">{item.name}</span>
                              <span className="text-maroon">{item.sales} Sales</span>
                            </div>
                            <div className="h-2 bg-gray-100 dark:bg-white/5 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${(item.sales / (topProductsData[0]?.sales || 1)) * 100}%` }}
                                transition={{ duration: 1, delay: idx * 0.1 }}
                                className="h-full bg-maroon rounded-full"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Seller Performance Table */}
                  <div className="bg-white dark:bg-[#0d0d0d] p-10 rounded-[3rem] border border-gray-100 dark:border-white/5 shadow-xl overflow-hidden">
                    <div className="flex justify-between items-center mb-10">
                      <div>
                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 mb-1">Merchant Insights</h4>
                        <p className="text-sm font-black dark:text-white">Seller Performance Ranking</p>
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 border-b border-gray-100 dark:border-white/5">
                            <th className="pb-6">Merchant</th>
                            <th className="pb-6">Orders</th>
                            <th className="pb-6 text-right">Total Revenue</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-white/5">
                          {sellerPerformance.map((seller, idx) => (
                            <tr key={idx} className="group">
                              <td className="py-6">
                                <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 rounded-xl bg-maroon text-white flex items-center justify-center font-black text-xs">
                                    {idx + 1}
                                  </div>
                                  <span className="text-sm font-bold dark:text-white group-hover:text-maroon transition-colors">{seller.name}</span>
                                </div>
                              </td>
                              <td className="py-6">
                                <span className="text-xs font-black dark:text-gray-400">{seller.count}</span>
                              </td>
                              <td className="py-6 text-right">
                                <span className="text-sm font-black text-maroon">₱{seller.sales.toLocaleString()}</span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'settings' && (
                <motion.div 
                  key="settings"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-12"
                >
                  <div className="space-y-1">
                    <h3 className="text-2xl font-black uppercase tracking-tighter dark:text-white">App Configuration</h3>
                    <p className="text-xs text-gray-400 font-medium">Global system settings and visual customization</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-white dark:bg-[#0d0d0d] p-10 rounded-[3rem] border border-gray-100 dark:border-white/5 shadow-xl space-y-8">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-maroon/5 flex items-center justify-center text-maroon">
                          <Image size={24} />
                        </div>
                        <div>
                          <h4 className="text-sm font-black uppercase tracking-tight dark:text-white">Visual Identity</h4>
                          <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">Hero & Branding</p>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400">Hero Image</label>
                        <div className="flex flex-col gap-4">
                          <div className="relative">
                            <input 
                              type="text" 
                              value={appSettings?.heroImageUrl || ''}
                              onChange={(e) => setAppSettings(prev => prev ? { ...prev, heroImageUrl: e.target.value } : null)}
                              className="w-full bg-gray-50 dark:bg-white/5 border-none rounded-2xl px-6 py-4 text-xs font-bold dark:text-white focus:ring-2 focus:ring-maroon transition-all"
                              placeholder="https://..."
                            />
                          </div>
                          <div className="flex gap-4">
                            <input 
                              type="file" 
                              accept="image/*"
                              onChange={handleHeroImageUpload}
                              className="hidden"
                              id="hero-upload"
                            />
                            <label 
                              htmlFor="hero-upload"
                              className="flex-1 bg-gray-100 dark:bg-white/5 text-gray-900 dark:text-white py-4 rounded-xl text-[10px] font-black uppercase tracking-widest text-center cursor-pointer hover:bg-gray-200 dark:hover:bg-white/10 transition-all"
                            >
                              Upload Image
                            </label>
                            <button 
                              onClick={() => updateAppSettings({ heroImageUrl: appSettings?.heroImageUrl })}
                              className="flex-1 bg-maroon text-white py-4 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:scale-105 transition-all"
                            >
                              Save Changes
                            </button>
                          </div>
                        </div>
                        <div className="aspect-video rounded-2xl overflow-hidden border border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/5">
                          {appSettings?.heroImageUrl ? (
                            <img src={appSettings.heroImageUrl} className="w-full h-full object-cover" alt="Preview" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                              <Image size={48} />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-[#0d0d0d] p-10 rounded-[3rem] border border-gray-100 dark:border-white/5 shadow-xl space-y-8">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-500/5 flex items-center justify-center text-blue-500">
                          <ShieldCheck size={24} />
                        </div>
                        <div>
                          <h4 className="text-sm font-black uppercase tracking-tight dark:text-white">System Security</h4>
                          <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">Access Control</p>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <TaxRateSettings 
                          initialRate={appSettings?.listingTaxRate || 0} 
                          onSave={(rate) => updateAppSettings({ listingTaxRate: rate })} 
                        />
                        <div className="flex items-center justify-between p-6 bg-gray-50 dark:bg-white/5 rounded-[2rem]">
                          <div>
                            <p className="text-xs font-black dark:text-white uppercase tracking-tight">Seller Registration</p>
                            <p className="text-[10px] text-gray-400 font-medium">Allow new student sellers</p>
                          </div>
                          <button 
                            onClick={() => updateAppSettings({ sellerRegistrationEnabled: !appSettings?.sellerRegistrationEnabled })}
                            className={`w-14 h-8 rounded-full relative transition-all ${appSettings?.sellerRegistrationEnabled ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-800'}`}
                          >
                            <motion.div 
                              animate={{ x: appSettings?.sellerRegistrationEnabled ? 24 : 4 }}
                              className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-sm"
                            />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Database Management Section */}
                    <div className="bg-white dark:bg-[#0d0d0d] p-10 rounded-[3rem] border border-gray-100 dark:border-white/5 shadow-xl space-y-8">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-orange-500/5 flex items-center justify-center text-orange-500">
                          <Database size={24} />
                        </div>
                        <div>
                          <h4 className="text-sm font-black uppercase tracking-tight dark:text-white">Database Management</h4>
                          <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">System Maintenance</p>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="p-8 bg-orange-50/50 dark:bg-orange-500/5 rounded-[2.5rem] border border-orange-100 dark:border-orange-500/10">
                          <h5 className="text-xs font-black uppercase tracking-tight mb-2 dark:text-white">Seed Initial Products</h5>
                          <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
                            If your marketplace is empty after deployment, use this to populate the database with the initial set of student-made products.
                          </p>
                          <button 
                            onClick={() => {
                              setConfirmAction({
                                title: 'Seed Products?',
                                message: 'This will add the initial 6 products to your database if they don\'t already exist. Continue?',
                                onConfirm: seedInitialProducts,
                                confirmText: 'Seed Database',
                                type: 'primary'
                              });
                            }}
                            className="w-full bg-orange-500 text-white py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-orange-500/20 hover:bg-orange-600 transition-all"
                          >
                            Seed Initial Data
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
        <BottomNav {...bottomNavProps} />
      </div>
    );
  };

  return (
    <ErrorBoundary>
      <AnimatePresence>
        {isLoading && <LoadingOverlay />}
      </AnimatePresence>
      <div className={`min-h-screen flex flex-col font-sans transition-colors duration-500 ${isDarkMode ? 'dark bg-[#050505]' : 'bg-surface'}`}>
        <Toaster position="top-center" richColors />
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            className="flex-1 flex flex-col"
          >
            {currentView === 'landing' && <LandingView />}
            {currentView === 'login' && <LoginView />}
            {currentView === 'signup' && <SignupView />}
            {currentView === 'shop' && (
              <ShopView 
                allProducts={allProducts}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                sortBy={sortBy}
                setSortBy={setSortBy}
                reviews={reviews}
                setSelectedProduct={setSelectedProduct}
                navigateTo={navigateTo}
                addToCart={addToCart}
                headerProps={headerProps}
                bottomNavProps={bottomNavProps}
              />
            )}
                {currentView === 'cart' && <CartView />}
                {currentView === 'checkout' && <CheckoutView />}
                {currentView === 'orders' && <OrdersView />}
                {currentView === 'product-details' && <ProductDetailsView />}
                {currentView === 'profile' && <ProfileView />}
                {currentView === 'edit-profile' && <EditProfileView />}
                {currentView === 'seller-dashboard' && <SellerDashboardView />}
                {currentView === 'manage-orders' && <ManageOrdersView />}
                {currentView === 'manage-products' && <ManageProductsView />}
                {currentView === 'messages' && <MessagesView />}
                {currentView === 'chat' && <ChatView />}
                {currentView === 'wishlist' && <WishlistView />}
                {currentView === 'notifications' && <NotificationsView />}
                {currentView === 'admin-dashboard' && <AdminDashboardView />}
                {currentView === 'order-details' && <OrderDetailsView />}
                {['about', 'success-stories', 'help', 'safety', 'privacy'].includes(currentView) && <InfoView view={currentView} contactAdmin={contactAdmin} navigateTo={navigateTo} />}
          </motion.div>
        </AnimatePresence>
        <ReviewModal />
        <ProductEditModal />
        <DeleteConfirmModal />
        <ConfirmActionModal />
        <AnimatePresence>
          {showPasscodeModal && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            >
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/10"
              >
                <div className="p-8">
                  <div className="flex justify-between items-center mb-8">
                    <div className="w-12 h-12 bg-maroon/10 rounded-2xl flex items-center justify-center text-maroon">
                      <ShieldCheck size={24} />
                    </div>
                    <button 
                      onClick={() => {
                        setShowPasscodeModal(false);
                        setPasscodeInput('');
                        setIsPasscodeError(false);
                      }}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors"
                    >
                      <X size={20} className="text-gray-400" />
                    </button>
                  </div>

                  <h3 className="text-2xl font-black uppercase tracking-tighter text-gray-900 dark:text-white mb-2">
                    {passcodeAction === 'restrict-user' ? 'Confirm Restriction' : 'Admin Access'}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-widest mb-8">
                    {passcodeAction === 'restrict-user' ? 'Enter passcode to restrict user' : 'Enter passcode to continue'}
                  </p>

                  <form onSubmit={handlePasscodeSubmit} className="space-y-6">
                    <div className="relative">
                      <input 
                        type="password"
                        value={passcodeInput}
                        onChange={(e) => {
                          setPasscodeInput(e.target.value);
                          setIsPasscodeError(false);
                        }}
                        placeholder="••••••"
                        autoFocus
                        className={`w-full bg-gray-50 dark:bg-white/5 border-2 ${isPasscodeError ? 'border-red-500' : 'border-transparent focus:border-maroon'} rounded-2xl px-6 py-4 text-center text-2xl tracking-[0.5em] font-black transition-all outline-none text-gray-900 dark:text-white`}
                      />
                    </div>

                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      className="w-full bg-maroon text-white py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-maroon/20 hover:bg-black transition-all"
                    >
                      {passcodeAction === 'restrict-user' ? 'Confirm Restriction' : 'Unlock Dashboard'}
                    </motion.button>
                  </form>

                  <div className="mt-8 pt-8 border-t border-gray-100 dark:border-white/5">
                    <button 
                      onClick={sendPasscodeChangeRequest}
                      className="w-full text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-maroon transition-colors flex items-center justify-center gap-2"
                    >
                      <MessageSquare size={14} />
                      Forgot or Change Passcode?
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </ErrorBoundary>
  );
}
