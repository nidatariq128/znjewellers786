import React, { useState } from 'react';
import { 
  X, 
  ArrowLeft, 
  ArrowRight, 
  Truck, 
  CheckCircle2, 
  Building2, 
  Smartphone, 
  Copy, 
  Sparkles,
  Printer,
  MessageCircle,
  AlertCircle,
  Check,
  ShieldCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useProducts } from '../../context/ProductContext';
import { useStoreSettings } from '../../context/StoreSettingsContext';
import { PaymentMethod, Order, OrderItem } from '../../types';
import { formatPKR, generateOrderNumber } from '../../lib/formatters';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewOrderTracking: (orderNumber: string, phone: string) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  onViewOrderTracking
}) => {
  const { items, subtotal, shippingCost, discount, total, clearCart } = useCart();
  const { user, profile } = useAuth();
  const { products, updateProduct } = useProducts();
  const { settings } = useStoreSettings();

  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [submitting, setSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoiceCopied, setInvoiceCopied] = useState(false);

  // CRITICAL: Reset to Step 1 whenever checkout is opened so it NEVER skips to Step 5!
  React.useEffect(() => {
    if (isOpen) {
      setStep(1);
      setCompletedOrder(null);
      setValidationError(null);
      setShowInvoiceModal(false);
      setInvoiceCopied(false);
    }
  }, [isOpen]);

  // Form Fields
  // Step 1: Customer
  const [fullName, setFullName] = useState(profile?.displayName || user?.displayName || '');
  const [email, setEmail] = useState(profile?.email || user?.email || '');
  const [phone, setPhone] = useState(profile?.phone || '+92 300 ');

  // Step 2: Shipping
  const [country] = useState('Pakistan');
  const [city, setCity] = useState('Karachi');
  const [address, setAddress] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');

  // Step 3: Payment
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('easypaisa');
  const [paymentReference, setPaymentReference] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopyText = (text: string, fieldKey: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldKey);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handlePlaceOrder = async () => {
    if (items.length === 0) return;
    setSubmitting(true);
    setValidationError(null);

    const orderNumber = generateOrderNumber();
    const orderId = orderNumber; // Set orderId to orderNumber so direct getDoc(doc(db, 'orders', orderNumber)) succeeds

    const orderItems: OrderItem[] = items.map((i) => ({
      productId: i.product.id,
      name: i.product.name,
      sku: i.product.sku,
      price: i.product.salePrice ?? i.product.price,
      quantity: i.quantity,
      selectedSize: i.selectedSize,
      image: i.product.images[0]
    }));

    const orderPayload: Order = {
      id: orderId,
      orderNumber,
      userId: user?.uid || 'guest',
      customerName: fullName.trim(),
      customerEmail: email.trim(),
      customerPhone: phone.trim(),
      shippingAddress: `${address.trim()}, ${city}, ${country}`,
      city,
      items: orderItems,
      subtotal,
      shippingCost,
      discount,
      total,
      paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'pending' : (paymentReference ? 'paid' : 'pending'),
      paymentReference: paymentReference.trim() || undefined,
      orderStatus: 'Order Placed',
      notes: deliveryNotes.trim() || undefined,
      createdAt: new Date().toISOString()
    };

    // 1. Immediately decrement product stock across state, persistent storage, and Firestore
    for (const item of items) {
      try {
        const freshProd = products.find((p) => p.id === item.product.id) || item.product;
        const currentStock = typeof freshProd.stock === 'number' ? freshProd.stock : item.product.stock;
        const remainingStock = Math.max(0, currentStock - item.quantity);
        await updateProduct(item.product.id, { stock: remainingStock });
      } catch (stockErr) {
        console.warn('Stock decrement note for', item.product.id, stockErr);
      }
    }

    // 2. Immediately guarantee local storage persistence so order tracking ALWAYS finds it
    try {
      const existing = JSON.parse(localStorage.getItem('zn_orders') || '[]');
      const updatedList = [orderPayload, ...existing.filter((o: any) => o.orderNumber !== orderPayload.orderNumber)];
      localStorage.setItem('zn_orders', JSON.stringify(updatedList));
      localStorage.setItem('zn_last_order', JSON.stringify(orderPayload));
    } catch (e) {
      console.warn('Local storage write warning:', e);
    }

    // 3. Write order to Firestore with orderNumber as doc ID
    try {
      await setDoc(doc(db, 'orders', orderNumber), orderPayload);
    } catch (err) {
      console.warn('Firestore order sync note (order safely preserved locally):', err);
    } finally {
      setCompletedOrder(orderPayload);
      clearCart();
      setStep(5);
      setSubmitting(false);

      // Fire luxury golden confetti
      try {
        confetti({
          particleCount: 90,
          spread: 75,
          origin: { y: 0.6 },
          colors: ['#D6B16D', '#F4E0A5', '#FFF', '#9E7426']
        });
      } catch {
        // Confetti fallback
      }
    }
  };

  const handlePrintReceipt = () => {
    setShowInvoiceModal(true);
  };

  const handleCopyInvoiceText = (ord: Order) => {
    const text = `========================================\n` +
      `ZN JEWELERS - OFFICIAL FORMAL INVOICE\n` +
      `Shop No. 47, Aman Tower, Korangi Crossing, Karachi, Pakistan\n` +
      `Phone: +92 300 8294711 | WhatsApp: +92 300 8294711\n` +
      `Email: znjewelaers786@gmail.com\n` +
      `========================================\n` +
      `Invoice / Order ID : ${ord.orderNumber}\n` +
      `Order Date         : ${new Date(ord.createdAt).toLocaleDateString('en-GB')}\n` +
      `Customer Name      : ${ord.customerName}\n` +
      `Mobile Number      : ${ord.customerPhone}\n` +
      `Delivery Address   : ${ord.shippingAddress}\n` +
      `City               : ${ord.city}, Pakistan\n` +
      `----------------------------------------\n` +
      `PURCHASED PRODUCTS:\n` +
      ord.items.map((i, idx) => `[${idx + 1}] ${i.name} (Qty: ${i.quantity}) - Rs. ${(i.price * i.quantity).toLocaleString()}`).join('\n') +
      `\n----------------------------------------\n` +
      `Subtotal           : Rs. ${ord.subtotal.toLocaleString()}\n` +
      (ord.discount ? `Discount           : - Rs. ${ord.discount.toLocaleString()}\n` : '') +
      `Insured Delivery   : ${ord.shippingCost === 0 ? 'Complimentary Free' : `Rs. ${ord.shippingCost.toLocaleString()}`}\n` +
      `TOTAL PAYABLE      : Rs. ${ord.total.toLocaleString()}\n` +
      `Payment Method     : ${ord.paymentMethod.toUpperCase().replace('_', ' ')}\n` +
      (ord.paymentReference ? `Payment TRX / Ref  : ${ord.paymentReference}\n` : '') +
      `Order Status       : ${ord.orderStatus}\n` +
      `========================================\n` +
      `Thank you for shopping at ZN Jewelers!`;

    navigator.clipboard.writeText(text);
    setInvoiceCopied(true);
    setTimeout(() => setInvoiceCopied(false), 2500);
  };

  const getWhatsAppOrderConfirmationUrl = (ord: Order) => {
    const rawNumber = settings.whatsappNumber.replace(/[^0-9]/g, '') || '923008294711';
    const message = `*NEW ORDER CONFIRMATION - ZN JEWELERS*\n\n` +
      `*Order ID:* ${ord.orderNumber}\n` +
      `*Customer Name:* ${ord.customerName}\n` +
      `*Phone:* ${ord.customerPhone}\n` +
      `*Address:* ${ord.shippingAddress}\n` +
      `*Total Amount:* Rs. ${ord.total.toLocaleString()}\n` +
      `*Payment Method:* ${ord.paymentMethod.toUpperCase().replace('_', ' ')}\n` +
      (ord.paymentReference ? `*Payment Reference / TRX ID:* ${ord.paymentReference}\n` : '') +
      `\nPlease verify and dispatch my order. Thank you!`;
    return `https://wa.me/${rawNumber}?text=${encodeURIComponent(message)}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6">
      <div 
        className="relative w-full max-w-3xl bg-[#0c0a07] border border-[#3b301c] rounded-2xl shadow-2xl overflow-hidden my-6 text-white"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-[#211a10] flex items-center justify-between bg-[#110e09]">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#D6B16D] font-medium">ZN Jewelers</span>
            <span className="text-neutral-500">•</span>
            <h3 className="text-base font-serif font-semibold tracking-wide">
              {step === 5 ? 'Order Placed & Confirmed' : 'Secure Checkout'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-white rounded-full hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator (Steps 1 to 4) */}
        {step < 5 && (
          <div className="px-6 py-3 bg-[#080705] border-b border-[#1c160e] flex items-center justify-between text-xs">
            <div className={`flex items-center gap-1.5 ${step >= 1 ? 'text-[#D6B16D]' : 'text-neutral-600'}`}>
              <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px] font-bold">1</span>
              <span className="hidden sm:inline">Customer Info</span>
            </div>
            <span className="text-neutral-700">───</span>
            <div className={`flex items-center gap-1.5 ${step >= 2 ? 'text-[#D6B16D]' : 'text-neutral-600'}`}>
              <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px] font-bold">2</span>
              <span className="hidden sm:inline">Delivery Address</span>
            </div>
            <span className="text-neutral-700">───</span>
            <div className={`flex items-center gap-1.5 ${step >= 3 ? 'text-[#D6B16D]' : 'text-neutral-600'}`}>
              <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px] font-bold">3</span>
              <span className="hidden sm:inline">Payment (PKR)</span>
            </div>
            <span className="text-neutral-700">───</span>
            <div className={`flex items-center gap-1.5 ${step >= 4 ? 'text-[#D6B16D]' : 'text-neutral-600'}`}>
              <span className="w-5 h-5 rounded-full border border-current flex items-center justify-center text-[10px] font-bold">4</span>
              <span className="hidden sm:inline">Review</span>
            </div>
          </div>
        )}

        {/* Inline Error Notice */}
        {validationError && (
          <div className="mx-6 mt-4 p-3 bg-red-950/80 border border-red-500/60 text-red-200 text-xs rounded-lg flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        {/* Step Content */}
        <div className="p-5 sm:p-7 max-h-[75vh] overflow-y-auto space-y-5">

          {/* STEP 1: Customer Information */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h4 className="text-lg font-serif font-medium text-white">Customer Information</h4>
                <p className="text-xs text-neutral-400">
                  Please enter your contact details. We will send your Order ID and delivery tracking updates here.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs uppercase tracking-wider text-neutral-300 mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => {
                      setFullName(e.target.value);
                      if (validationError) setValidationError(null);
                    }}
                    required
                    placeholder="e.g. Fatima Ali / Muhammad Tariq"
                    className="w-full bg-[#130f0a] border border-[#2d2417] rounded-lg px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#D6B16D]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-neutral-300 mb-1">Email Address *</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (validationError) setValidationError(null);
                      }}
                      required
                      placeholder="customer@email.com"
                      className="w-full bg-[#130f0a] border border-[#2d2417] rounded-lg px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#D6B16D]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-neutral-300 mb-1">Mobile / WhatsApp Number *</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value);
                        if (validationError) setValidationError(null);
                      }}
                      required
                      placeholder="+92 300 8294711"
                      className="w-full bg-[#130f0a] border border-[#2d2417] rounded-lg px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#D6B16D]"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Delivery Address */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h4 className="text-lg font-serif font-medium text-white">Delivery Address</h4>
                <p className="text-xs text-neutral-400">
                  We deliver across Karachi (1-2 days) and nationwide across Pakistan (3-5 days).
                </p>
              </div>

              <div className="space-y-3 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-neutral-300 mb-1">Country</label>
                    <input
                      type="text"
                      value={country}
                      disabled
                      className="w-full bg-[#130f0a] border border-[#2d2417] rounded-lg px-4 py-2.5 text-xs text-neutral-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-neutral-300 mb-1">City *</label>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full bg-[#130f0a] border border-[#2d2417] rounded-lg px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#D6B16D]"
                    >
                      <option value="Karachi">Karachi (Same/Next Day Delivery)</option>
                      <option value="Lahore">Lahore</option>
                      <option value="Islamabad">Islamabad</option>
                      <option value="Rawalpindi">Rawalpindi</option>
                      <option value="Faisalabad">Faisalabad</option>
                      <option value="Multan">Multan</option>
                      <option value="Peshawar">Peshawar</option>
                      <option value="Quetta">Quetta</option>
                      <option value="Sialkot">Sialkot</option>
                      <option value="Hyderabad">Hyderabad</option>
                      <option value="Gujranwala">Gujranwala</option>
                      <option value="Other Pakistan City">Other Pakistan City</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-wider text-neutral-300 mb-1">Complete Street / House Address *</label>
                  <textarea
                    rows={2}
                    value={address}
                    onChange={(e) => {
                      setAddress(e.target.value);
                      if (validationError) setValidationError(null);
                    }}
                    required
                    placeholder="House/Apartment #, Street, Area/Sector, Nearby Landmark"
                    className="w-full bg-[#130f0a] border border-[#2d2417] rounded-lg px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#D6B16D]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-neutral-300 mb-1">Postal Code (Optional)</label>
                    <input
                      type="text"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder="e.g. 74900"
                      className="w-full bg-[#130f0a] border border-[#2d2417] rounded-lg px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#D6B16D]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-neutral-300 mb-1">Delivery Instructions (Optional)</label>
                    <input
                      type="text"
                      value={deliveryNotes}
                      onChange={(e) => setDeliveryNotes(e.target.value)}
                      placeholder="e.g. Call before arrival, leave with security"
                      className="w-full bg-[#130f0a] border border-[#2d2417] rounded-lg px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#D6B16D]"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Payment Method */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h4 className="text-lg font-serif font-medium text-white">Payment Method</h4>
                <p className="text-xs text-neutral-400">
                  Select your payment method. Direct Easypaisa, JazzCash, and Meezan Bank Transfer are fully supported.
                </p>
              </div>

              {/* Payment Methods Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                
                {/* 1. Easypaisa */}
                <div
                  onClick={() => setPaymentMethod('easypaisa')}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === 'easypaisa'
                      ? 'bg-[#18130a] border-[#D6B16D] shadow-md ring-1 ring-[#D6B16D]/30'
                      : 'bg-[#100d08] border-[#261e13] hover:border-[#3d311c]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold text-xs">
                      EP
                    </div>
                    <div>
                      <h5 className="text-xs font-semibold text-white">Easypaisa</h5>
                      <span className="text-[10px] text-neutral-400 font-mono">{settings.easypaisaNumber}</span>
                    </div>
                  </div>
                </div>

                {/* 2. JazzCash */}
                <div
                  onClick={() => setPaymentMethod('jazzcash')}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === 'jazzcash'
                      ? 'bg-[#18130a] border-[#D6B16D] shadow-md ring-1 ring-[#D6B16D]/30'
                      : 'bg-[#100d08] border-[#261e13] hover:border-[#3d311c]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-red-950/80 border border-red-500/40 flex items-center justify-center text-red-400 font-bold text-xs">
                      JC
                    </div>
                    <div>
                      <h5 className="text-xs font-semibold text-white">JazzCash</h5>
                      <span className="text-[10px] text-neutral-400 font-mono">{settings.jazzcashNumber}</span>
                    </div>
                  </div>
                </div>

                {/* 3. Direct Bank Transfer */}
                <div
                  onClick={() => setPaymentMethod('bank_transfer')}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === 'bank_transfer'
                      ? 'bg-[#18130a] border-[#D6B16D] shadow-md ring-1 ring-[#D6B16D]/30'
                      : 'bg-[#100d08] border-[#261e13] hover:border-[#3d311c]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#241a0d] border border-[#D6B16D]/40 flex items-center justify-center text-[#D6B16D]">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="text-xs font-semibold text-white">Bank Transfer (Meezan Bank)</h5>
                      <span className="text-[10px] text-neutral-400">{settings.bankName}</span>
                    </div>
                  </div>
                </div>

                {/* 4. Cash on Delivery (COD) */}
                <div
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === 'cod'
                      ? 'bg-[#18130a] border-[#D6B16D] shadow-md ring-1 ring-[#D6B16D]/30'
                      : 'bg-[#100d08] border-[#261e13] hover:border-[#3d311c]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#1a140d] border border-amber-600/30 flex items-center justify-center text-amber-400">
                      <Truck className="w-4 h-4" />
                    </div>
                    <div>
                      <h5 className="text-xs font-semibold text-white">Cash on Delivery (COD)</h5>
                      <span className="text-[10px] text-neutral-400">Pay cash upon delivery</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* REAL PAYMENT DETAILS & ACCOUNT INFORMATION */}
              <div className="p-4 sm:p-5 rounded-xl bg-[#141009] border border-[#2f2416] space-y-4">
                
                {/* Easypaisa Box */}
                {paymentMethod === 'easypaisa' && (
                  <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between border-b border-[#291f13] pb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs uppercase tracking-wider text-[#D6B16D] font-bold">
                          Official Easypaisa Account Details
                        </span>
                      </div>
                      <span className="text-[10px] text-neutral-400">Direct Mobile Account</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-[#0a0805] p-3 rounded-lg border border-[#231a0e]">
                      <div>
                        <span className="text-[10px] uppercase text-neutral-500 block">Account Title</span>
                        <span className="font-semibold text-white text-sm">{settings.easypaisaTitle || 'ZN Jewelers'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase text-neutral-500 block">Account Number</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-[#D6B16D] text-sm">{settings.easypaisaNumber}</span>
                          <button
                            type="button"
                            onClick={() => handleCopyText(settings.easypaisaNumber, 'ep_num')}
                            className="px-2 py-0.5 rounded bg-[#211a10] hover:bg-[#332717] text-[#D6B16D] text-[10px] font-medium flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            {copiedField === 'ep_num' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedField === 'ep_num' ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    <p className="text-[11px] text-neutral-300 leading-relaxed">
                      {settings.easypaisaInstructions || 'Open your Easypaisa app, transfer the order amount, and paste the 11-digit TRX ID below.'}
                    </p>

                    <div>
                      <label className="block text-[11px] text-neutral-300 mb-1 font-medium">
                        Easypaisa Transaction ID (TRX ID) / Sender Phone Number:
                      </label>
                      <input
                        type="text"
                        value={paymentReference}
                        onChange={(e) => setPaymentReference(e.target.value)}
                        placeholder="e.g. TRX 20491829141 or 0300-XXXXXXX"
                        className="w-full bg-[#0a0805] border border-[#2d2315] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D6B16D]"
                      />
                      <span className="text-[10px] text-neutral-500 mt-1 block">
                        If you haven't transferred yet, you can leave this blank and share the screenshot on WhatsApp after placing the order.
                      </span>
                    </div>
                  </div>
                )}

                {/* JazzCash Box */}
                {paymentMethod === 'jazzcash' && (
                  <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between border-b border-[#291f13] pb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-xs uppercase tracking-wider text-[#D6B16D] font-bold">
                          Official JazzCash Account Details
                        </span>
                      </div>
                      <span className="text-[10px] text-neutral-400">Mobile Account & Till</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#0a0805] p-3 rounded-lg border border-[#231a0e]">
                      <div>
                        <span className="text-[10px] uppercase text-neutral-500 block">Account Title</span>
                        <span className="font-semibold text-white text-sm">{settings.jazzcashTitle || 'ZN Jewelers'}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase text-neutral-500 block">Mobile Account</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-[#D6B16D] text-sm">{settings.jazzcashNumber}</span>
                          <button
                            type="button"
                            onClick={() => handleCopyText(settings.jazzcashNumber, 'jc_num')}
                            className="px-2 py-0.5 rounded bg-[#211a10] hover:bg-[#332717] text-[#D6B16D] text-[10px] font-medium flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            {copiedField === 'jc_num' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedField === 'jc_num' ? 'Copied' : 'Copy'}</span>
                          </button>
                        </div>
                      </div>
                      {settings.jazzcashTillId && (
                        <div>
                          <span className="text-[10px] uppercase text-neutral-500 block">Till ID</span>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-white text-sm">{settings.jazzcashTillId}</span>
                            <button
                              type="button"
                              onClick={() => handleCopyText(settings.jazzcashTillId, 'jc_till')}
                              className="px-2 py-0.5 rounded bg-[#211a10] hover:bg-[#332717] text-[#D6B16D] text-[10px] font-medium flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              {copiedField === 'jc_till' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                              <span>{copiedField === 'jc_till' ? 'Copied' : 'Copy'}</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    <p className="text-[11px] text-neutral-300 leading-relaxed">
                      {settings.jazzcashInstructions || 'Transfer via JazzCash App to our Mobile Number or Till ID, and paste the JazzCash TID below.'}
                    </p>

                    <div>
                      <label className="block text-[11px] text-neutral-300 mb-1 font-medium">
                        JazzCash Transaction ID (TID) / Sender Phone Number:
                      </label>
                      <input
                        type="text"
                        value={paymentReference}
                        onChange={(e) => setPaymentReference(e.target.value)}
                        placeholder="e.g. TID 984021481 or 0300-XXXXXXX"
                        className="w-full bg-[#0a0805] border border-[#2d2315] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D6B16D]"
                      />
                    </div>
                  </div>
                )}

                {/* Bank Transfer Box */}
                {paymentMethod === 'bank_transfer' && (
                  <div className="space-y-3 text-xs">
                    <div className="flex items-center justify-between border-b border-[#291f13] pb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                        <span className="text-xs uppercase tracking-wider text-[#D6B16D] font-bold">
                          Official Bank Account Details
                        </span>
                      </div>
                      <span className="text-[10px] text-neutral-400">1Link & Raast Instant Transfer</span>
                    </div>

                    <div className="space-y-2 bg-[#0a0805] p-3.5 rounded-lg border border-[#231a0e]">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <span className="text-[10px] uppercase text-neutral-500 block">Bank Name</span>
                          <span className="font-semibold text-white">{settings.bankName}</span>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase text-neutral-500 block">Account Title</span>
                          <span className="font-semibold text-white">{settings.bankAccountTitle}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-[#1a140b]">
                        <div>
                          <span className="text-[10px] uppercase text-neutral-500 block">Account Number</span>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-[#D6B16D]">{settings.bankAccountNumber}</span>
                            <button
                              type="button"
                              onClick={() => handleCopyText(settings.bankAccountNumber, 'bank_acc')}
                              className="px-2 py-0.5 rounded bg-[#211a10] hover:bg-[#332717] text-[#D6B16D] text-[10px] font-medium flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              {copiedField === 'bank_acc' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                              <span>{copiedField === 'bank_acc' ? 'Copied' : 'Copy'}</span>
                            </button>
                          </div>
                        </div>

                        <div>
                          <span className="text-[10px] uppercase text-neutral-500 block">IBAN (Raast / All Banks)</span>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-white text-[11px] truncate">{settings.bankIban}</span>
                            <button
                              type="button"
                              onClick={() => handleCopyText(settings.bankIban, 'bank_iban')}
                              className="px-2 py-0.5 rounded bg-[#211a10] hover:bg-[#332717] text-[#D6B16D] text-[10px] font-medium flex items-center gap-1 cursor-pointer transition-colors shrink-0"
                            >
                              {copiedField === 'bank_iban' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                              <span>{copiedField === 'bank_iban' ? 'Copied' : 'Copy IBAN'}</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      {settings.bankBranch && (
                        <div className="pt-1 text-[11px] text-neutral-400">
                          <span>Branch: {settings.bankBranch}</span>
                        </div>
                      )}
                    </div>

                    <p className="text-[11px] text-neutral-300 leading-relaxed">
                      {settings.bankInstructions}
                    </p>

                    <div>
                      <label className="block text-[11px] text-neutral-300 mb-1 font-medium">
                        Online Banking Reference / Deposit Slip Number:
                      </label>
                      <input
                        type="text"
                        value={paymentReference}
                        onChange={(e) => setPaymentReference(e.target.value)}
                        placeholder="e.g. FT26042109485 / Raast Ref"
                        className="w-full bg-[#0a0805] border border-[#2d2315] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D6B16D]"
                      />
                    </div>
                  </div>
                )}

                {/* COD Box */}
                {paymentMethod === 'cod' && (
                  <div className="space-y-2 text-xs text-neutral-300">
                    <span className="text-[11px] uppercase tracking-wider text-[#D6B16D] font-bold block">
                      Cash on Delivery (COD) Guidelines:
                    </span>
                    <p className="leading-relaxed">
                      • Your parcel will be securely delivered to your address in a tamper-evident ZN Jewelers package.
                    </p>
                    <p className="leading-relaxed">
                      • Please keep the exact amount ready in cash (Rs. {total.toLocaleString()}).
                    </p>
                    <p className="leading-relaxed">
                      • Our support desk will place a quick confirmation phone call before dispatching the rider.
                    </p>
                  </div>
                )}

              </div>

            </div>
          )}

          {/* STEP 4: Order Review */}
          {step === 4 && (
            <div className="space-y-4">
              <div className="space-y-1">
                <h4 className="text-lg font-serif font-medium text-white">Review Your Order</h4>
                <p className="text-xs text-neutral-400">Please review your item list, delivery address, and payment method.</p>
              </div>

              {/* Items Summary */}
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-[#110e09] border border-[#211a10]">
                    <div className="flex items-center gap-3">
                      <img src={item.product.images[0]} alt={item.product.name} className="w-11 h-11 object-cover rounded" />
                      <div>
                        <h5 className="text-xs font-serif font-semibold text-white">{item.product.name}</h5>
                        <div className="text-[10px] text-neutral-400 flex items-center gap-2 mt-0.5">
                          <span>Qty: {item.quantity}</span>
                          {item.selectedSize && <span>• Size: {item.selectedSize}</span>}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-semibold text-[#D6B16D]">
                      {formatPKR((item.product.salePrice ?? item.product.price) * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Client & Shipping Review Box */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-lg bg-[#110e09] border border-[#211a10] space-y-1">
                  <span className="text-[10px] uppercase text-[#D6B16D] font-bold block">Customer & Contact</span>
                  <p className="text-white font-medium">{fullName}</p>
                  <p className="text-neutral-300 font-mono">{phone}</p>
                  <p className="text-neutral-400">{email}</p>
                </div>
                <div className="p-3.5 rounded-lg bg-[#110e09] border border-[#211a10] space-y-1">
                  <span className="text-[10px] uppercase text-[#D6B16D] font-bold block">Delivery & Payment</span>
                  <p className="text-white">{address}, {city}</p>
                  <p className="text-[#D6B16D] capitalize font-medium">Payment: {paymentMethod.replace('_', ' ')}</p>
                  {paymentReference && (
                    <p className="text-neutral-400 font-mono text-[11px]">Ref: {paymentReference}</p>
                  )}
                </div>
              </div>

              {/* Cost Totals */}
              <div className="p-4 rounded-xl bg-[#141009] border border-[#2a2012] space-y-2 text-xs">
                <div className="flex justify-between text-neutral-300">
                  <span>Subtotal</span>
                  <span className="font-mono text-white">{formatPKR(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-emerald-400 font-medium">
                    <span>Discount</span>
                    <span className="font-mono">- {formatPKR(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-neutral-300">
                  <span>Shipping & Delivery</span>
                  <span className="font-mono text-white">
                    {shippingCost === 0 ? 'Free Shipping' : formatPKR(shippingCost)}
                  </span>
                </div>
                <div className="flex justify-between text-base font-serif font-semibold text-white pt-2 border-t border-[#231a0f]">
                  <span>Total Payable</span>
                  <span className="font-mono text-[#D6B16D]">{formatPKR(total)}</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: Order Confirmation & Receipt */}
          {step === 5 && completedOrder && (
            <div className="text-center space-y-6 py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-950/80 border border-emerald-500 text-emerald-400 flex items-center justify-center mx-auto shadow-xl">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div className="space-y-2">
                <span className="text-[10px] uppercase tracking-[0.3em] text-[#D6B16D] font-semibold">
                  Alhamdulillah • Order Confirmed
                </span>
                <h3 className="text-2xl sm:text-3xl font-serif text-white">
                  Thank You, {completedOrder.customerName}
                </h3>
                <p className="text-xs text-neutral-400 max-w-md mx-auto">
                  Your order has been recorded successfully. Please save your Order ID below to track your delivery at any time.
                </p>
              </div>

              {/* PROMINENT ORDER ID CARD */}
              <div className="max-w-md mx-auto p-5 rounded-2xl bg-gradient-to-b from-[#18130a] to-[#0e0c08] border-2 border-[#D6B16D] text-left space-y-4 shadow-2xl">
                <div className="flex items-center justify-between pb-3 border-b border-[#2d2315]">
                  <div>
                    <span className="text-[10px] uppercase text-neutral-400 tracking-wider block">Your Unique Order ID</span>
                    <span className="text-xl sm:text-2xl font-mono font-bold text-[#D6B16D] tracking-wider">
                      {completedOrder.orderNumber}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopyText(completedOrder.orderNumber, 'order_id')}
                    className="px-3 py-1.5 rounded-lg bg-[#D6B16D] text-black font-semibold text-xs flex items-center gap-1.5 hover:bg-[#F4E0A5] transition-all cursor-pointer shadow-md"
                  >
                    {copiedField === 'order_id' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedField === 'order_id' ? 'Copied!' : 'Copy ID'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-neutral-500 text-[10px] uppercase block">Order Status</span>
                    <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 text-[10px] uppercase font-bold inline-block mt-0.5">
                      {completedOrder.orderStatus}
                    </span>
                  </div>
                  <div>
                    <span className="text-neutral-500 text-[10px] uppercase block">Payment Method</span>
                    <span className="text-white capitalize font-medium">{completedOrder.paymentMethod.replace('_', ' ')}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 text-[10px] uppercase block">Total Amount</span>
                    <span className="text-sm font-mono font-bold text-white">{formatPKR(completedOrder.total)}</span>
                  </div>
                  <div>
                    <span className="text-neutral-500 text-[10px] uppercase block">Contact Phone</span>
                    <span className="text-white font-mono">{completedOrder.customerPhone}</span>
                  </div>
                </div>

                {completedOrder.paymentReference && (
                  <div className="p-2.5 rounded bg-[#0a0805] border border-[#241c10] text-xs">
                    <span className="text-neutral-400 text-[10px] uppercase block">Your Payment Reference</span>
                    <span className="font-mono text-[#D6B16D] font-medium">{completedOrder.paymentReference}</span>
                  </div>
                )}
              </div>

              {/* Ordered Items with Product Images */}
              <div className="max-w-md mx-auto p-4 rounded-xl bg-[#110e08] border border-[#2b2114] text-left space-y-3">
                <span className="text-[11px] uppercase tracking-wider text-[#D6B16D] font-bold block">
                  Ordered Products ({completedOrder.items.length})
                </span>
                <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                  {completedOrder.items.map((it, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-3 p-2 rounded-lg bg-[#18130b] border border-[#261d12]">
                      <div className="flex items-center gap-3 min-w-0">
                        <img 
                          src={it.image || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=400&q=80'} 
                          alt={it.name} 
                          className="w-12 h-12 object-cover rounded-md border border-[#3b2e1b] shrink-0" 
                        />
                        <div className="min-w-0">
                          <p className="text-xs font-serif font-medium text-white truncate">{it.name}</p>
                          <p className="text-[10px] text-neutral-400 mt-0.5">
                            Qty: <strong className="text-neutral-200">{it.quantity}</strong>
                            {it.selectedSize ? ` • Size: ${it.selectedSize}` : ''}
                            {it.sku ? ` • SKU: ${it.sku}` : ''}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-bold text-[#D6B16D] shrink-0">
                        ₨ {(it.price * it.quantity).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 max-w-lg mx-auto">
                {/* 1. Track Order Now */}
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onViewOrderTracking(completedOrder.orderNumber, completedOrder.customerPhone);
                  }}
                  className="w-full sm:w-auto px-6 py-3 bg-[#D6B16D] text-black text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-[#F4E0A5] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#D6B16D]/20"
                >
                  <Truck className="w-4 h-4" />
                  <span>Track This Order</span>
                </button>

                {/* 2. Send Proof / WhatsApp Confirmation */}
                <a
                  href={getWhatsAppOrderConfirmationUrl(completedOrder)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Send Proof on WhatsApp</span>
                </a>

                {/* 3. Print Invoice */}
                <button
                  type="button"
                  onClick={handlePrintReceipt}
                  className="w-full sm:w-auto px-4 py-3 bg-[#17130a] border border-[#3b301c] text-neutral-300 text-xs font-medium uppercase tracking-wider rounded-lg hover:text-white hover:border-[#D6B16D] transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-[#D6B16D]" />
                  <span>Print Invoice</span>
                </button>
              </div>

              <div>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-neutral-400 hover:text-white text-xs uppercase tracking-wider underline cursor-pointer"
                >
                  Continue Shopping
                </button>
              </div>

            </div>
          )}

        </div>

        {/* Footer Navigation Buttons (Steps 1 to 4) */}
        {step < 5 && (
          <div className="p-4 sm:p-5 border-t border-[#211a10] bg-[#110e09] flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => {
                  setValidationError(null);
                  setStep((s) => (s - 1) as any);
                }}
                className="px-5 py-2.5 bg-[#17130a] border border-[#2b2214] text-neutral-300 text-xs font-medium rounded hover:text-white flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : <div />}

            {step < 4 ? (
              <button
                type="button"
                onClick={() => {
                  setValidationError(null);
                  if (step === 1) {
                    if (!fullName.trim()) {
                      setValidationError('Please enter your full name.');
                      return;
                    }
                    if (!email.trim() || !email.includes('@')) {
                      setValidationError('Please enter a valid email address.');
                      return;
                    }
                    if (!phone.trim() || phone.trim().length < 8) {
                      setValidationError('Please enter your mobile/WhatsApp number.');
                      return;
                    }
                  }
                  if (step === 2) {
                    if (!address.trim() || address.trim().length < 5) {
                      setValidationError('Please enter your complete delivery street address.');
                      return;
                    }
                  }
                  setStep((s) => (s + 1) as any);
                }}
                className="px-6 py-2.5 bg-[#D6B16D] text-black text-xs font-semibold uppercase tracking-wider rounded hover:bg-[#F4E0A5] transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handlePlaceOrder}
                disabled={submitting}
                className="px-8 py-3 bg-gradient-to-r from-[#D6B16D] via-[#F4E0A5] to-[#C29B53] text-black text-xs font-bold uppercase tracking-[0.15em] rounded hover:shadow-[0_0_25px_rgba(214,177,109,0.35)] transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4 fill-black" />
                <span>{submitting ? 'Placing Order...' : 'Confirm & Place Order'}</span>
              </button>
            )}
          </div>
        )}

      </div>

      {/* FORMAL PRINTABLE DIGITAL INVOICE MODAL */}
      {showInvoiceModal && completedOrder && (
        <div className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div 
            className="relative w-full max-w-2xl bg-[#fcfbf9] text-neutral-900 rounded-2xl shadow-2xl border border-[#d6b16d]/50 overflow-hidden my-6 animate-fadeIn"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Invoice Top Action Bar */}
            <div className="p-4 bg-[#141009] text-white flex items-center justify-between border-b border-[#2d2315]">
              <div className="flex items-center gap-2">
                <Printer className="w-4 h-4 text-[#D6B16D]" />
                <span className="text-xs font-serif font-bold uppercase tracking-wider text-[#D6B16D]">
                  Official Formal Invoice
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleCopyInvoiceText(completedOrder)}
                  className="px-3 py-1.5 rounded bg-[#241c10] hover:bg-[#382b18] text-[#D6B16D] text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  {invoiceCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{invoiceCopied ? 'Copied!' : 'Copy Text'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    try {
                      window.print();
                    } catch {
                      // fallback
                    }
                  }}
                  className="px-3 py-1.5 rounded bg-[#D6B16D] text-black text-xs font-bold uppercase tracking-wider hover:bg-[#F4E0A5] transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Slip</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowInvoiceModal(false)}
                  className="p-1.5 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Printable Invoice Sheet */}
            <div className="p-6 sm:p-8 space-y-6 text-neutral-800 text-xs font-sans print:p-0">
              
              {/* Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-neutral-300 pb-5">
                <div>
                  <h2 className="text-2xl font-serif font-bold text-neutral-900 tracking-wider">
                    ZN JEWELERS
                  </h2>
                  <p className="text-[11px] text-neutral-600 font-medium mt-0.5">
                    Fashion Jewellery & Luxury Accessories
                  </p>
                  <p className="text-[11px] text-neutral-500 mt-1 max-w-xs">
                    Shop No. 47, Aman Tower, Korangi Crossing, Karachi, Pakistan.
                  </p>
                  <p className="text-[11px] text-neutral-500">
                    Phone / WhatsApp: +92 300 8294711
                  </p>
                </div>

                <div className="text-left sm:text-right space-y-1">
                  <span className="px-2.5 py-0.5 rounded bg-amber-100 text-amber-900 font-bold uppercase text-[10px] tracking-wider border border-amber-300 inline-block">
                    {completedOrder.orderStatus}
                  </span>
                  <div className="text-sm font-mono font-bold text-neutral-900">
                    Invoice: <span className="text-[#a47a28]">{completedOrder.orderNumber}</span>
                  </div>
                  <div className="text-[11px] text-neutral-500">
                    Date: {new Date(completedOrder.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                </div>
              </div>

              {/* Customer & Delivery Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-neutral-100/70 p-4 rounded-xl border border-neutral-200">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider block">
                    Billed & Dispatched To:
                  </span>
                  <p className="font-bold text-neutral-900 text-sm">{completedOrder.customerName}</p>
                  <p className="text-neutral-700 font-mono text-[11px]">{completedOrder.customerPhone}</p>
                  <p className="text-neutral-600 text-[11px]">{completedOrder.customerEmail}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider block">
                    Delivery Destination:
                  </span>
                  <p className="text-neutral-800 font-medium">{completedOrder.shippingAddress}</p>
                  <p className="text-neutral-600 text-[11px]">City: {completedOrder.city}, Pakistan</p>
                  <p className="text-neutral-600 text-[11px] capitalize">
                    Payment Method: <strong>{completedOrder.paymentMethod.replace('_', ' ')}</strong>
                  </p>
                  {completedOrder.paymentReference && (
                    <p className="text-neutral-700 font-mono text-[11px]">
                      TRX / Ref ID: <strong>{completedOrder.paymentReference}</strong>
                    </p>
                  )}
                </div>
              </div>

              {/* Itemized Table */}
              <div className="overflow-x-auto">
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
                    {completedOrder.items.map((item, idx) => (
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

              {/* Calculation Totals */}
              <div className="pt-3 border-t-2 border-neutral-300 flex justify-end">
                <div className="w-full sm:w-64 space-y-1.5 text-xs">
                  <div className="flex justify-between text-neutral-600">
                    <span>Subtotal</span>
                    <span className="font-mono">₨ {completedOrder.subtotal.toLocaleString()}</span>
                  </div>
                  {completedOrder.discount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-medium">
                      <span>Discount</span>
                      <span className="font-mono">- ₨ {completedOrder.discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-neutral-600">
                    <span>Insured Courier</span>
                    <span className="font-mono">
                      {completedOrder.shippingCost === 0 ? 'Complimentary (Free)' : `₨ ${completedOrder.shippingCost.toLocaleString()}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-neutral-900 pt-2 border-t border-neutral-300">
                    <span>Grand Total</span>
                    <span className="font-mono text-[#91691c]">
                      ₨ {completedOrder.total.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer Terms & Stamp */}
              <div className="pt-4 border-t border-neutral-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-[10px] text-neutral-500">
                <div className="space-y-0.5">
                  <p className="font-semibold text-neutral-700">ZN Jewelers Quality Assurance:</p>
                  <p>• Premium Stainless Steel & Fashion Accessories • Anti-Tarnish & Waterproof Quality</p>
                  <p>• For inquiries, contact: +92 300 8294711 | znjewelaers786@gmail.com</p>
                </div>
                <div className="p-2 border border-dashed border-amber-600/60 rounded text-center">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-amber-800 block">
                    ZN ATELIER
                  </span>
                  <span className="text-[8px] text-amber-700">Official Computerized Invoice</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};
