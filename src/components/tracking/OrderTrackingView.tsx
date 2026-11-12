import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Truck, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  PackageCheck, 
  MapPin, 
  Phone, 
  Sparkles,
  AlertCircle,
  Copy,
  Check,
  MessageCircle,
  CreditCard,
  Smartphone,
  FileText,
  Printer,
  X,
  Building2
} from 'lucide-react';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Order, OrderStatus } from '../../types';
import { formatPKR, formatDate } from '../../lib/formatters';
import { useStoreSettings } from '../../context/StoreSettingsContext';

interface OrderTrackingViewProps {
  initialOrderNumber?: string;
  initialPhone?: string;
  onExploreCollections: () => void;
}

export const OrderTrackingView: React.FC<OrderTrackingViewProps> = ({
  initialOrderNumber = '',
  initialPhone = '',
  onExploreCollections
}) => {
  const { settings } = useStoreSettings();
  const [orderNumber, setOrderNumber] = useState(initialOrderNumber);
  const [phone, setPhone] = useState(initialPhone);
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState(false);
  const [recentLocalOrders, setRecentLocalOrders] = useState<Order[]>([]);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  // Load recent locally saved orders on mount
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('zn_orders') || '[]');
      if (Array.isArray(saved) && saved.length > 0) {
        setRecentLocalOrders(saved.slice(0, 5));
      }
    } catch (e) {
      console.warn('Could not read local orders:', e);
    }
  }, []);

  useEffect(() => {
    if (initialOrderNumber) {
      setOrderNumber(initialOrderNumber);
      handleSearch(initialOrderNumber, initialPhone);
    }
  }, [initialOrderNumber, initialPhone]);

  const handleCopyOrderId = (idToCopy: string) => {
    navigator.clipboard.writeText(idToCopy);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const normalizePhone = (ph: string) => ph.replace(/[^0-9]/g, '');

  const handleSearch = async (ordNum?: string, phNum?: string) => {
    const rawSearch = (ordNum || orderNumber).trim();
    const rawPhone = (phNum || phone).trim();

    if (!rawSearch && !rawPhone) {
      setError('Please enter your Order ID (e.g. ZN-2026-12345) or registered phone number.');
      return;
    }

    setLoading(true);
    setError(null);
    setOrder(null);

    const targetQuery = rawSearch.toUpperCase();
    const searchDigits = rawSearch.replace(/[^0-9]/g, '');
    const cleanPhone = normalizePhone(rawPhone);
    const cleanSearchPhone = normalizePhone(rawSearch);

    // 1. Check local storage orders first
    try {
      const localOrders: Order[] = JSON.parse(localStorage.getItem('zn_orders') || '[]');
      const lastOrderRaw = localStorage.getItem('zn_last_order');
      if (lastOrderRaw) {
        try {
          const lo = JSON.parse(lastOrderRaw);
          if (lo && !localOrders.some((o) => o.orderNumber === lo.orderNumber)) {
            localOrders.unshift(lo);
          }
        } catch {}
      }

      if (Array.isArray(localOrders) && localOrders.length > 0) {
        const foundLocal = localOrders.find((o) => {
          if (targetQuery && o.orderNumber.toUpperCase() === targetQuery) return true;
          if (rawSearch && o.id === rawSearch) return true;
          if (searchDigits && searchDigits.length >= 4 && o.orderNumber.includes(searchDigits)) return true;
          if (cleanPhone && cleanPhone.length >= 7 && normalizePhone(o.customerPhone).includes(cleanPhone)) return true;
          if (cleanSearchPhone && cleanSearchPhone.length >= 7 && normalizePhone(o.customerPhone).includes(cleanSearchPhone)) return true;
          if (rawSearch.includes('@') && o.customerEmail.toLowerCase() === rawSearch.toLowerCase()) return true;
          return false;
        });

        if (foundLocal) {
          setOrder(foundLocal);
          setLoading(false);
          return;
        }
      }
    } catch (e) {
      console.warn('Local storage order search error:', e);
    }

    // 2. Direct getDoc lookups in Firestore (never requires list permission!)
    let matchedOrder: Order | null = null;
    const possibleDocIds = [
      targetQuery,
      rawSearch,
      searchDigits ? `ZN-2026-${searchDigits}` : '',
      `order-${targetQuery}`,
      `order-${rawSearch}`
    ].filter(Boolean);

    for (const docId of possibleDocIds) {
      try {
        const docSnap = await getDoc(doc(db, 'orders', docId));
        if (docSnap.exists()) {
          matchedOrder = { ...docSnap.data(), id: docSnap.id } as Order;
          break;
        }
      } catch (e) {
        // Continue to next candidate
      }
    }

    // 3. Collection query lookup if direct getDoc didn't match
    if (!matchedOrder) {
      try {
        if (targetQuery) {
          const q1 = query(collection(db, 'orders'), where('orderNumber', '==', targetQuery));
          const snap1 = await getDocs(q1);
          if (!snap1.empty) {
            matchedOrder = { ...snap1.docs[0].data(), id: snap1.docs[0].id } as Order;
          }
        }

        const phoneToQuery = cleanPhone || (cleanSearchPhone.length >= 7 ? cleanSearchPhone : '');
        if (!matchedOrder && phoneToQuery) {
          const q2 = query(collection(db, 'orders'), where('customerPhone', '==', rawPhone || rawSearch));
          const snap2 = await getDocs(q2);
          if (!snap2.empty) {
            matchedOrder = { ...snap2.docs[0].data(), id: snap2.docs[0].id } as Order;
          }
        }
      } catch (err) {
        console.warn('Firestore query fallback note:', err);
      }
    }

    // 4. Broad scan fallback across all orders
    if (!matchedOrder) {
      try {
        const allSnap = await getDocs(collection(db, 'orders'));
        const list: Order[] = [];
        allSnap.forEach((d) => list.push({ ...d.data(), id: d.id } as Order));

        matchedOrder = list.find((o) => {
          if (targetQuery && o.orderNumber.toUpperCase().includes(targetQuery)) return true;
          if (searchDigits && searchDigits.length >= 4 && o.orderNumber.includes(searchDigits)) return true;
          if (cleanPhone && cleanPhone.length >= 7 && normalizePhone(o.customerPhone).includes(cleanPhone)) return true;
          if (cleanSearchPhone && cleanSearchPhone.length >= 7 && normalizePhone(o.customerPhone).includes(cleanSearchPhone)) return true;
          if (rawSearch.includes('@') && o.customerEmail.toLowerCase().includes(rawSearch.toLowerCase())) return true;
          return false;
        }) || null;
      } catch (err) {
        console.warn('Firestore broad scan fallback note:', err);
      }
    }

    if (matchedOrder) {
      setOrder(matchedOrder);
    } else {
      setError(`No order found matching "${rawSearch || rawPhone}". Please check your Order ID or contact our WhatsApp concierge directly.`);
    }

    setLoading(false);
  };

  const stages: { label: OrderStatus; desc: string }[] = [
    { label: 'Order Placed', desc: 'Order received & recorded in store system' },
    { label: 'Confirmed', desc: 'Payment verified & order approved' },
    { label: 'Processing', desc: 'Quality inspection & boutique packing' },
    { label: 'Shipped', desc: 'Handed over to courier with sealed tracking' },
    { label: 'Out for Delivery', desc: 'Rider en route to your address' },
    { label: 'Delivered', desc: 'Delivered successfully to customer' }
  ];

  const getStageIndex = (status: OrderStatus) => {
    if (status === 'Cancelled') return -1;
    const index = stages.findIndex((s) => s.label === status);
    return index >= 0 ? index : 0;
  };

  const currentStageIndex = order ? getStageIndex(order.orderStatus) : 0;

  const getWhatsAppQueryUrl = (ord?: Order | null) => {
    const rawNumber = settings.whatsappNumber.replace(/[^0-9]/g, '') || '923008294711';
    let text = `Hello ZN Jewelers! I have a question regarding an order.`;
    if (ord) {
      text = `Hello ZN Jewelers! I am inquiring about Order ID: *${ord.orderNumber}* (Customer: ${ord.customerName}, Total: Rs. ${ord.total.toLocaleString()}). Could you please update me on dispatch?`;
    }
    return `https://wa.me/${rawNumber}?text=${encodeURIComponent(text)}`;
  };

  return (
    <div className="py-12 sm:py-16 px-4 sm:px-6 lg:px-12 bg-[#080808] min-h-[85vh]">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Title */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-[#D6B16D] font-medium">
            <Sparkles className="w-3.5 h-3.5 text-[#D6B16D]" />
            <span>Real-Time Order Tracking</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif text-white tracking-wide">
            Track Your <span className="italic font-serif gold-gradient-text">ZN Jewelers</span> Order
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 font-light max-w-lg mx-auto">
            Enter your unique Order ID (e.g. ZN-2026-XXXXX) or registered mobile number to check real-time courier and delivery status.
          </p>
        </div>

        {/* Search Box */}
        <div className="p-5 sm:p-7 rounded-2xl bg-[#0e0c08] border border-[#2b2214] shadow-xl space-y-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
            className="grid grid-cols-1 sm:grid-cols-12 gap-3"
          >
            <div className="sm:col-span-6">
              <label className="block text-[11px] uppercase tracking-wider text-neutral-300 mb-1 font-medium">
                Order ID Number *
              </label>
              <input
                type="text"
                placeholder="e.g. ZN-2026-84910 or 84910"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                className="w-full bg-[#15110a] border border-[#3b2e1b] rounded-lg px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#D6B16D] uppercase"
              />
            </div>

            <div className="sm:col-span-4">
              <label className="block text-[11px] uppercase tracking-wider text-neutral-300 mb-1 font-medium">
                Mobile / Phone Number (Optional)
              </label>
              <input
                type="tel"
                placeholder="e.g. 0300 8294711"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-[#15110a] border border-[#3b2e1b] rounded-lg px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#D6B16D]"
              />
            </div>

            <div className="sm:col-span-2 flex items-end">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-[#D6B16D] text-black text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-[#F4E0A5] transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Search className="w-3.5 h-3.5" />
                <span>{loading ? 'Searching...' : 'Track'}</span>
              </button>
            </div>
          </form>

          {/* Quick Select for Recently Placed Orders */}
          {recentLocalOrders.length > 0 && (
            <div className="pt-2 border-t border-[#1c160e] flex flex-wrap items-center gap-2 text-xs">
              <span className="text-neutral-400 text-[11px]">Your Recent Orders:</span>
              {recentLocalOrders.map((ro) => (
                <button
                  key={ro.orderNumber}
                  type="button"
                  onClick={() => {
                    setOrderNumber(ro.orderNumber);
                    handleSearch(ro.orderNumber, ro.customerPhone);
                  }}
                  className="px-2.5 py-1 rounded bg-[#17130a] border border-[#332616] hover:border-[#D6B16D] text-[#D6B16D] font-mono text-xs transition-colors cursor-pointer"
                >
                  {ro.orderNumber} ({formatPKR(ro.total)})
                </button>
              ))}
            </div>
          )}

          {error && (
            <div className="p-3.5 rounded-lg bg-red-950/70 border border-red-500/50 text-xs text-red-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{error}</span>
              </div>
              <a
                href={getWhatsAppQueryUrl(null)}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 rounded bg-emerald-700 hover:bg-emerald-600 text-white text-[11px] font-semibold flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
              >
                <MessageCircle className="w-3 h-3" />
                <span>Ask Support on WhatsApp</span>
              </a>
            </div>
          )}
        </div>

        {/* Active Order Tracking Display */}
        {order && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* Top Summary Card */}
            <div className="p-6 rounded-2xl bg-gradient-to-r from-[#120e08] via-[#16110a] to-[#0e0c08] border border-[#3b2e1b] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-[0.25em] text-[#D6B16D] font-bold">Consignment Verified</span>
                  <span className="text-neutral-600">•</span>
                  <span className="text-xs text-neutral-400">Placed {formatDate(order.createdAt)}</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <h3 className="text-2xl font-serif font-bold text-white tracking-wide">
                    {order.orderNumber}
                  </h3>
                  <button
                    type="button"
                    onClick={() => handleCopyOrderId(order.orderNumber)}
                    className="p-1.5 rounded bg-[#241a0d] border border-[#3d2c16] text-[#D6B16D] hover:text-white transition-colors cursor-pointer"
                    title="Copy Order ID"
                  >
                    {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                <p className="text-xs text-neutral-300">
                  Recipient: <strong className="text-white">{order.customerName}</strong> ({order.customerPhone})
                </p>
              </div>

              <div className="flex flex-col items-start sm:items-end gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-xs uppercase font-bold tracking-wider bg-[#D6B16D]/20 text-[#D6B16D] border border-[#D6B16D]/50">
                    {order.orderStatus}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded text-[10px] uppercase font-bold border ${
                    order.paymentStatus === 'paid'
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                      : 'bg-amber-950 text-amber-300 border-amber-800'
                  }`}>
                    {order.paymentStatus === 'paid' ? 'Payment Verified' : 'Payment Pending'}
                  </span>
                </div>

                {order.trackingNumber ? (
                  <span className="text-xs font-mono text-neutral-300 bg-[#0a0805] px-3 py-1 rounded border border-[#2b2214]">
                    Courier Tracking Code: <strong className="text-[#D6B16D]">{order.trackingNumber}</strong>
                  </span>
                ) : (
                  <span className="text-[11px] text-neutral-400">
                    Courier booking in progress at Korangi hub
                  </span>
                )}
              </div>
            </div>

            {/* 6-Stage Timeline */}
            <div className="p-6 sm:p-8 rounded-2xl bg-[#0e0c08] border border-[#2b2214] space-y-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#D6B16D]">
                Order Progress & Delivery Timeline
              </h4>

              <div className="relative">
                {/* Connecting Line (Desktop) */}
                <div className="hidden md:block absolute top-4 left-6 right-6 h-0.5 bg-[#251d12]" />
                <div 
                  className="hidden md:block absolute top-4 left-6 h-0.5 bg-gradient-to-r from-[#D6B16D] to-[#F4E0A5] transition-all duration-500"
                  style={{
                    width: `${Math.max(0, (currentStageIndex / (stages.length - 1)) * 92)}%`
                  }}
                />

                <div className="grid grid-cols-1 md:grid-cols-6 gap-6 relative z-10">
                  {stages.map((stg, idx) => {
                    const isCompleted = idx <= currentStageIndex;
                    const isCurrent = idx === currentStageIndex;

                    return (
                      <div key={stg.label} className="flex md:flex-col items-center md:items-center gap-3 md:gap-2 text-left md:text-center">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 border-2 transition-all ${
                            isCompleted
                              ? 'bg-[#D6B16D] border-[#F4E0A5] text-black shadow-lg shadow-[#D6B16D]/20'
                              : 'bg-[#15110a] border-[#2c2214] text-neutral-600'
                          }`}
                        >
                          {isCompleted ? (
                            <CheckCircle2 className="w-5 h-5" />
                          ) : (
                            <span className="text-xs font-bold">{idx + 1}</span>
                          )}
                        </div>

                        <div>
                          <h5 className={`text-xs font-semibold ${isCurrent ? 'text-[#D6B16D]' : isCompleted ? 'text-white' : 'text-neutral-500'}`}>
                            {stg.label}
                          </h5>
                          <p className="text-[10px] text-neutral-400 mt-0.5 max-w-[130px] md:mx-auto">
                            {stg.desc}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Payment & Delivery Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Payment Verification Box */}
              <div className="p-5 rounded-xl bg-[#0e0c08] border border-[#2b2214] space-y-3 text-xs">
                <span className="text-[10px] uppercase text-[#D6B16D] font-bold tracking-wider block">
                  Payment Account & Reference
                </span>
                
                <div className="flex items-center gap-3 text-neutral-300">
                  {order.paymentMethod === 'easypaisa' && (
                    <div className="w-7 h-7 rounded bg-emerald-950 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-bold text-xs">
                      EP
                    </div>
                  )}
                  {order.paymentMethod === 'jazzcash' && (
                    <div className="w-7 h-7 rounded bg-red-950 border border-red-500/40 text-red-400 flex items-center justify-center font-bold text-xs">
                      JC
                    </div>
                  )}
                  {order.paymentMethod === 'bank_transfer' && (
                    <Building2 className="w-5 h-5 text-[#D6B16D]" />
                  )}
                  {order.paymentMethod === 'cod' && (
                    <Truck className="w-5 h-5 text-amber-400" />
                  )}

                  <div>
                    <span className="text-white font-medium capitalize">
                      {order.paymentMethod.replace('_', ' ')}
                    </span>
                    <span className="text-[11px] text-neutral-400 block">
                      Status: <strong className={order.paymentStatus === 'paid' ? 'text-emerald-400' : 'text-amber-400'}>
                        {order.paymentStatus === 'paid' ? 'Paid & Verified' : 'Pending Verification'}
                      </strong>
                    </span>
                  </div>
                </div>

                {order.paymentReference && (
                  <div className="p-2.5 rounded bg-[#141009] border border-[#261f13] text-neutral-300 space-y-0.5">
                    <span className="text-[10px] uppercase text-neutral-500 block">Transaction Reference / TID:</span>
                    <span className="font-mono text-white text-xs font-semibold">{order.paymentReference}</span>
                  </div>
                )}

                <div className="pt-2 border-t border-[#1e170e] flex items-center justify-between">
                  <span className="text-neutral-400">Total Order Amount:</span>
                  <span className="font-mono text-sm font-bold text-[#D6B16D]">{formatPKR(order.total)}</span>
                </div>
              </div>

              {/* Delivery Destination */}
              <div className="p-5 rounded-xl bg-[#0e0c08] border border-[#2b2214] space-y-3 text-xs">
                <span className="text-[10px] uppercase text-[#D6B16D] font-bold tracking-wider block">
                  Delivery Destination
                </span>
                <div className="flex items-start gap-2.5 text-neutral-300">
                  <MapPin className="w-4 h-4 text-[#D6B16D] shrink-0 mt-0.5" />
                  <div>
                    <p className="text-white font-medium">{order.shippingAddress}</p>
                    <p className="text-neutral-400">City: {order.city}, Pakistan</p>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 text-neutral-300 pt-2 border-t border-[#1e170e]">
                  <Phone className="w-4 h-4 text-[#D6B16D] shrink-0" />
                  <span>Phone: <strong className="text-white font-mono">{order.customerPhone}</strong></span>
                </div>
              </div>

            </div>

            {/* Order Items with High-Resolution Photos */}
            <div className="p-5 sm:p-6 rounded-xl bg-[#0e0c08] border border-[#2b2214] space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase text-[#D6B16D] font-bold tracking-wider block">
                  Ordered Products ({order.items.length})
                </span>
                <span className="text-[11px] text-neutral-400">Total: <strong className="text-[#D6B16D] font-mono">{formatPKR(order.total)}</strong></span>
              </div>
              <div className="space-y-2.5">
                {order.items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-[#110e09] border border-[#1f1910] hover:border-[#382b18] transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <img 
                        src={item.image || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=400&q=80'} 
                        alt={item.name} 
                        className="w-14 h-14 rounded-lg object-cover bg-[#1c160e] border border-[#302315] shrink-0" 
                      />
                      <div className="min-w-0">
                        <span className="text-white font-medium text-xs sm:text-sm block truncate">{item.name}</span>
                        <div className="flex flex-wrap items-center gap-2 text-[10px] text-neutral-400 mt-1">
                          <span className="bg-[#18130a] px-2 py-0.5 rounded text-neutral-300 border border-[#2d2215]">
                            Qty: <strong className="text-white">{item.quantity}</strong>
                          </span>
                          {item.selectedSize && <span>Size: {item.selectedSize}</span>}
                          {item.sku && <span className="font-mono text-[#D6B16D]">SKU: {item.sku}</span>}
                        </div>
                      </div>
                    </div>
                    <span className="font-mono text-sm text-[#D6B16D] font-bold shrink-0">{formatPKR(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Support & Invoice Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowInvoiceModal(true)}
                className="w-full sm:w-auto px-5 py-3 bg-[#18130a] border border-[#D6B16D] text-[#D6B16D] text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-[#D6B16D] hover:text-black transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <FileText className="w-4 h-4" />
                <span>View Official Invoice</span>
              </button>

              <a
                href={getWhatsAppQueryUrl(order)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Contact Store Desk on WhatsApp</span>
              </a>

              <button
                type="button"
                onClick={onExploreCollections}
                className="w-full sm:w-auto px-6 py-3 bg-[#17130a] border border-[#3b301c] text-neutral-300 text-xs font-semibold uppercase tracking-wider rounded-lg hover:text-white hover:border-[#D6B16D] transition-colors cursor-pointer"
              >
                Browse More Jewellery
              </button>
            </div>

          </div>
        )}

        {/* Printable Formal Invoice Modal */}
        {showInvoiceModal && order && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 print:p-0 print:bg-white">
            <div className="relative w-full max-w-3xl bg-white text-neutral-900 rounded-2xl shadow-2xl p-6 sm:p-10 border border-neutral-200 print:border-none print:shadow-none print:w-full print:max-w-none">
              
              {/* Controls (Hidden when printing) */}
              <div className="flex items-center justify-between pb-6 mb-6 border-b border-neutral-200 print:hidden">
                <span className="text-xs uppercase tracking-widest text-[#9E7426] font-bold">
                  Official Digital Tax Invoice
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-3.5 py-1.5 rounded-lg bg-neutral-900 text-white text-xs font-semibold flex items-center gap-1.5 hover:bg-neutral-800 transition-colors cursor-pointer shadow-sm"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Invoice</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowInvoiceModal(false)}
                    className="p-1.5 text-neutral-500 hover:text-black rounded-full hover:bg-neutral-100 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Invoice Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b-2 border-neutral-800">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-neutral-950">
                    ZN JEWELERS
                  </h2>
                  <p className="text-xs text-neutral-600 mt-1">High Fashion Accessories & Jewellery</p>
                  <p className="text-xs text-neutral-500 mt-0.5 max-w-xs leading-relaxed">
                    Shop No. 47, Aman Tower, Korangi Crossing, Karachi, Pakistan
                  </p>
                  <p className="text-xs text-neutral-500 font-mono mt-0.5">
                    Phone / WhatsApp: +92 317 8113817
                  </p>
                </div>

                <div className="text-left sm:text-right text-xs space-y-1">
                  <div className="inline-block px-3 py-1 bg-neutral-100 border border-neutral-300 rounded text-neutral-800 font-mono font-bold text-sm">
                    {order.orderNumber}
                  </div>
                  <p className="text-neutral-500">
                    Date: <strong className="text-neutral-900 font-mono">{new Date(order.createdAt).toLocaleDateString('en-GB')}</strong>
                  </p>
                  <p className="text-neutral-500">
                    Payment Method: <strong className="text-neutral-900 capitalize">{order.paymentMethod.replace('_', ' ')}</strong>
                  </p>
                  <p className="text-neutral-500">
                    Order Status: <strong className="text-emerald-700 uppercase font-bold">{order.orderStatus}</strong>
                  </p>
                </div>
              </div>

              {/* Customer Info */}
              <div className="py-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs border-b border-neutral-200">
                <div>
                  <span className="text-[10px] uppercase font-bold text-neutral-400 block tracking-wider">Billed & Shipped To:</span>
                  <p className="font-semibold text-neutral-900 text-sm mt-0.5">{order.customerName}</p>
                  <p className="text-neutral-600 mt-0.5">{order.shippingAddress}</p>
                  <p className="text-neutral-600">City: {order.city}, Pakistan</p>
                </div>
                <div className="sm:text-right">
                  <span className="text-[10px] uppercase font-bold text-neutral-400 block tracking-wider">Contact Details:</span>
                  <p className="font-mono text-neutral-900 mt-0.5">Phone: {order.customerPhone}</p>
                  <p className="text-neutral-600 font-mono">{order.customerEmail}</p>
                </div>
              </div>

              {/* Items Table with Photos */}
              <div className="overflow-x-auto py-4">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b-2 border-neutral-300 text-[11px] font-bold uppercase tracking-wider text-neutral-600">
                      <th className="py-2 pl-1 w-12">Photo</th>
                      <th className="py-2">Item Description</th>
                      <th className="py-2 text-center">SKU</th>
                      <th className="py-2 text-center">Qty</th>
                      <th className="py-2 text-right">Unit Price</th>
                      <th className="py-2 text-right pr-1">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {order.items.map((item, idx) => (
                      <tr key={idx} className="py-2">
                        <td className="py-2.5 pl-1 pr-2">
                          <img 
                            src={item.image || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=200&q=80'} 
                            alt={item.name} 
                            className="w-11 h-11 object-cover rounded border border-neutral-300 shadow-sm" 
                          />
                        </td>
                        <td className="py-2.5 pr-2 font-medium text-neutral-900">
                          {item.name}
                          {item.selectedSize && <span className="text-[10px] text-neutral-500 block">Size: {item.selectedSize}</span>}
                        </td>
                        <td className="py-2.5 px-2 text-center text-neutral-500 font-mono text-[11px]">
                          {item.sku || 'ZN-STEEL'}
                        </td>
                        <td className="py-2.5 px-2 text-center font-bold text-neutral-800">
                          {item.quantity}
                        </td>
                        <td className="py-2.5 px-2 text-right font-mono text-neutral-700">
                          ₨ {item.price.toLocaleString()}
                        </td>
                        <td className="py-2.5 pl-2 pr-1 text-right font-mono font-bold text-neutral-900">
                          ₨ {(item.price * item.quantity).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="pt-3 border-t-2 border-neutral-300 flex justify-end">
                <div className="w-full sm:w-64 space-y-1.5 text-xs">
                  <div className="flex justify-between text-neutral-600">
                    <span>Subtotal</span>
                    <span className="font-mono">₨ {order.subtotal.toLocaleString()}</span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-medium">
                      <span>Discount</span>
                      <span className="font-mono">- ₨ {order.discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-neutral-600">
                    <span>Shipping</span>
                    <span className="font-mono">
                      {order.shippingCost === 0 ? 'Free Shipping' : `₨ ${order.shippingCost.toLocaleString()}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-neutral-950 pt-2 border-t border-neutral-300">
                    <span>Total Amount</span>
                    <span className="font-mono">₨ {order.total.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Footer Stamp */}
              <div className="mt-8 pt-4 border-t border-neutral-200 flex flex-col sm:flex-row items-center justify-between text-[11px] text-neutral-500">
                <p>Thank you for choosing ZN Jewelers. High Fashion Accessories Boutique.</p>
                <p className="font-mono text-[10px] mt-1 sm:mt-0">Verified System Generated Document</p>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
