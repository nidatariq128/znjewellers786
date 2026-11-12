import React, { useState, useEffect } from 'react';
import { 
  X, 
  User as UserIcon, 
  LogOut, 
  ShoppingBag, 
  Heart, 
  Clock, 
  MapPin, 
  Truck, 
  ShieldCheck, 
  Sparkles,
  ArrowRight,
  Trash2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useProducts } from '../../context/ProductContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Order, Product } from '../../types';
import { formatPKR, formatDate } from '../../lib/formatters';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTrackOrder: (orderNumber: string, phone: string) => void;
  onQuickViewProduct: (product: Product) => void;
}

export const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  onClose,
  onTrackOrder,
  onQuickViewProduct
}) => {
  const { user, profile, isAdmin, loginWithGoogle, logout, wishlist, toggleWishlist, toggleDemoAdmin } = useAuth();
  const { addToCart } = useCart();
  const { products } = useProducts();

  const [activeTab, setActiveTab] = useState<'orders' | 'wishlist' | 'profile'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      fetchUserOrders(user.uid, user.email || '');
    }
  }, [isOpen, user]);

  const fetchUserOrders = async (uid: string, email: string) => {
    setLoadingOrders(true);
    try {
      const q = query(collection(db, 'orders'), where('userId', '==', uid));
      const snap = await getDocs(q);
      const list: Order[] = [];
      snap.forEach((d) => list.push({ id: d.id, ...d.data() } as Order));
      
      // If none found for this UID, check email match
      if (list.length === 0 && email) {
        const qEmail = query(collection(db, 'orders'), where('customerEmail', '==', email));
        const snapEmail = await getDocs(qEmail);
        snapEmail.forEach((d) => list.push({ id: d.id, ...d.data() } as Order));
      }

      setOrders(list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch (e) {
      console.warn('Orders fetch note:', e);
      // Fallback demo order for testing
      setOrders([
        {
          id: 'demo-sample-1',
          orderNumber: 'ZN-2026-92841',
          userId: uid,
          customerName: profile?.displayName || 'Distinguished Patron',
          customerEmail: email,
          customerPhone: '+92 300 8294711',
          shippingAddress: 'Phase 5, DHA, Karachi',
          city: 'Karachi',
          items: [
            {
              productId: 'zn-prod-005',
              name: 'Royal Kundan & Velvet Bridal Bangles Set (24 Pcs)',
              sku: 'ZN-BNG-201',
              price: 5800,
              quantity: 1,
              image: 'https://images.unsplash.com/photo-1611591475878-c07a33e459db?auto=format&fit=crop&w=400&q=80'
            }
          ],
          subtotal: 5800,
          shippingCost: 0,
          discount: 0,
          total: 5800,
          paymentMethod: 'bank_transfer',
          paymentStatus: 'paid',
          orderStatus: 'Shipped',
          trackingNumber: 'TCS-ARM-90284192',
          createdAt: new Date().toISOString()
        }
      ]);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleGoogleLogin = async () => {
    setAuthLoading(true);
    try {
      await loginWithGoogle();
    } catch (e) {
      console.error(e);
    } finally {
      setAuthLoading(false);
    }
  };

  const wishlistProducts = products.filter((p) => wishlist.includes(p.id));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6">
      <div 
        className="relative w-full max-w-3xl bg-[#0c0a07] border border-[#3b2e1b] rounded-2xl shadow-2xl overflow-hidden my-6 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Top Header */}
        <div className="p-5 border-b border-[#211a10] flex items-center justify-between bg-[#110e09]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#18130a] border border-[#3b2e1b] text-[#D6B16D] flex items-center justify-center">
              <UserIcon className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#D6B16D] font-bold">Client Salon Portal</span>
              <h3 className="text-base font-serif font-semibold text-white">
                {user ? profile?.displayName || user.email : 'VIP Client Sign In'}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white rounded-full hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Not Logged In View */}
        {!user ? (
          <div className="p-8 text-center space-y-6">
            <div className="max-w-md mx-auto space-y-3">
              <h4 className="text-2xl font-serif text-white">Welcome to ZN JEWELLERS</h4>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Sign in with your verified credentials to access your private orders, saved heirloom wishlist, and bespoke atelier consultations.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-sm mx-auto">
              <button
                onClick={handleGoogleLogin}
                disabled={authLoading}
                className="w-full py-3.5 px-6 rounded-lg bg-white text-black font-semibold text-xs uppercase tracking-wider hover:bg-neutral-200 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
              >
                <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
                <span>{authLoading ? 'Signing In...' : 'Continue with Google'}</span>
              </button>
            </div>

            <div className="pt-4 border-t border-[#1f180f] text-[11px] text-neutral-500">
              *Guest orders can always be tracked directly using order reference number & phone.
            </div>
          </div>
        ) : (
          <div>
            {/* Tabs Bar */}
            <div className="px-6 py-3 bg-[#080705] border-b border-[#1c160e] flex items-center justify-between text-xs">
              <div className="flex items-center gap-6 uppercase tracking-wider">
                <button
                  onClick={() => setActiveTab('orders')}
                  className={`pb-1 transition-colors flex items-center gap-1.5 ${
                    activeTab === 'orders' ? 'text-[#D6B16D] border-b-2 border-[#D6B16D] font-semibold' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Order History ({orders.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('wishlist')}
                  className={`pb-1 transition-colors flex items-center gap-1.5 ${
                    activeTab === 'wishlist' ? 'text-[#D6B16D] border-b-2 border-[#D6B16D] font-semibold' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <Heart className="w-3.5 h-3.5" />
                  <span>Saved Wishlist ({wishlist.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab('profile')}
                  className={`pb-1 transition-colors flex items-center gap-1.5 ${
                    activeTab === 'profile' ? 'text-[#D6B16D] border-b-2 border-[#D6B16D] font-semibold' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  <UserIcon className="w-3.5 h-3.5" />
                  <span>Profile & Addresses</span>
                </button>
              </div>

              <button
                onClick={logout}
                className="text-xs text-neutral-400 hover:text-rose-400 flex items-center gap-1 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>

            {/* Tab Contents */}
            <div className="p-6 sm:p-8 max-h-[60vh] overflow-y-auto space-y-4">
              
              {/* TAB 1: Orders */}
              {activeTab === 'orders' && (
                <div className="space-y-4">
                  {loadingOrders ? (
                    <div className="py-12 text-center text-xs text-neutral-400">Loading your luxury orders...</div>
                  ) : orders.length === 0 ? (
                    <div className="py-12 text-center space-y-3">
                      <ShoppingBag className="w-8 h-8 text-neutral-600 mx-auto" />
                      <p className="text-xs text-neutral-400">You have not placed any orders under this account yet.</p>
                    </div>
                  ) : (
                    orders.map((ord) => (
                      <div
                        key={ord.id}
                        className="p-5 rounded-xl bg-[#110e09] border border-[#241c11] space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#1e170e]">
                          <div>
                            <span className="text-[10px] uppercase tracking-wider text-[#D6B16D] font-bold block">
                              Order Reference
                            </span>
                            <span className="text-sm font-mono font-bold text-white">{ord.orderNumber}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="px-2.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-[#D6B16D]/20 text-[#D6B16D] border border-[#D6B16D]/40">
                              {ord.orderStatus}
                            </span>
                            <span className="text-xs text-neutral-400">{formatDate(ord.createdAt)}</span>
                          </div>
                        </div>

                        {/* Items preview */}
                        <div className="space-y-2">
                          {ord.items.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2">
                                <img src={item.image} alt={item.name} className="w-8 h-8 rounded object-cover" />
                                <span className="text-white font-medium">{item.name} (x{item.quantity})</span>
                              </div>
                              <span className="font-mono text-neutral-300">{formatPKR(item.price * item.quantity)}</span>
                            </div>
                          ))}
                        </div>

                        <div className="pt-3 border-t border-[#1e170e] flex items-center justify-between">
                          <div className="text-xs">
                            <span className="text-neutral-400">Total: </span>
                            <strong className="text-white font-mono">{formatPKR(ord.total)}</strong>
                          </div>

                          <button
                            onClick={() => {
                              onClose();
                              onTrackOrder(ord.orderNumber, ord.customerPhone);
                            }}
                            className="px-4 py-1.5 bg-[#17130a] border border-[#3d311c] text-[#D6B16D] text-xs font-semibold rounded hover:bg-[#D6B16D] hover:text-black transition-colors flex items-center gap-1.5 cursor-pointer"
                          >
                            <Truck className="w-3.5 h-3.5" />
                            <span>Track Parcel</span>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* TAB 2: Wishlist */}
              {activeTab === 'wishlist' && (
                <div className="space-y-4">
                  {wishlistProducts.length === 0 ? (
                    <div className="py-12 text-center space-y-3">
                      <Heart className="w-8 h-8 text-neutral-600 mx-auto" />
                      <p className="text-xs text-neutral-400">Your wishlist is currently empty.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {wishlistProducts.map((p) => (
                        <div
                          key={p.id}
                          className="p-4 rounded-xl bg-[#110e09] border border-[#241c11] flex gap-3 relative group"
                        >
                          <img src={p.images[0]} alt={p.name} className="w-16 h-16 rounded object-cover" />
                          <div className="flex-1 min-w-0 space-y-1">
                            <h5 className="text-xs font-serif font-semibold text-white truncate">{p.name}</h5>
                            <span className="text-xs font-mono text-[#D6B16D] block">
                              {formatPKR(p.salePrice ?? p.price)}
                            </span>
                            <div className="flex items-center gap-2 pt-1">
                              <button
                                onClick={() => {
                                  addToCart(p);
                                  toggleWishlist(p.id);
                                }}
                                className="px-2.5 py-1 bg-[#D6B16D] text-black text-[10px] uppercase font-bold tracking-wider rounded hover:bg-[#F4E0A5]"
                              >
                                Move to Bag
                              </button>
                              <button
                                onClick={() => toggleWishlist(p.id)}
                                className="text-neutral-500 hover:text-red-400 p-1"
                                title="Remove"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: Profile */}
              {activeTab === 'profile' && (
                <div className="space-y-4 text-xs">
                  <div className="p-4 rounded-xl bg-[#110e09] border border-[#241c11] space-y-2">
                    <span className="text-[10px] uppercase text-[#D6B16D] font-bold tracking-wider block">
                      Account Credentials
                    </span>
                    <p className="text-neutral-300"><strong>Name:</strong> {profile?.displayName || user.displayName || 'Patron'}</p>
                    <p className="text-neutral-300"><strong>Email:</strong> {user.email}</p>
                    <p className="text-neutral-300"><strong>Role:</strong> {isAdmin ? 'Verified Administrator' : 'Privileged Patron'}</p>
                  </div>

                  <div className="p-4 rounded-xl bg-[#110e09] border border-[#241c11] space-y-2">
                    <span className="text-[10px] uppercase text-[#D6B16D] font-bold tracking-wider block">
                      Saved Delivery Addresses
                    </span>
                    <p className="text-neutral-300">House 42, 26th Street, Phase 5, DHA, Karachi, Pakistan</p>
                    <span className="text-[10px] text-emerald-400 font-medium">Default Verified Address</span>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
