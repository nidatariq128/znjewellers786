import React, { useState } from 'react';
import { 
  X, 
  Trash2, 
  ShoppingBag, 
  ArrowRight, 
  Truck, 
  Sparkles, 
  Tag, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { formatPKR } from '../../lib/formatters';

interface CartDrawerProps {
  onProceedToCheckout: () => void;
  onExploreProducts: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  onProceedToCheckout,
  onExploreProducts
}) => {
  const {
    items,
    removeFromCart,
    updateQuantity,
    subtotal,
    shippingCost,
    freeShippingThreshold,
    discount,
    appliedPromo,
    applyPromoCode,
    removePromoCode,
    total,
    isCartOpen,
    setIsCartOpen
  } = useCart();

  const [promoInput, setPromoInput] = useState('');
  const [promoMessage, setPromoMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isCartOpen) return null;

  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const freeShippingProgress = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;
    const res = applyPromoCode(promoInput);
    if (res.success) {
      setPromoMessage({ type: 'success', text: res.message });
      setPromoInput('');
    } else {
      setPromoMessage({ type: 'error', text: res.message });
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/80 backdrop-blur-sm transition-opacity">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#0a0805] border-l border-[#2e2417] flex flex-col justify-between shadow-2xl text-white">
          
          {/* Header */}
          <div className="p-5 border-b border-[#211a10] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#D6B16D]" />
              <h3 className="text-base font-serif font-medium tracking-wide">
                Your Shopping Bag ({items.reduce((s, i) => s + i.quantity, 0)})
              </h3>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 text-neutral-400 hover:text-white rounded-full hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Complimentary Shipping Progress Banner */}
          <div className="bg-[#120e08] border-b border-[#211a10] px-5 py-3 space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-neutral-300">
                <Truck className="w-3.5 h-3.5 text-[#D6B16D]" />
                {remainingForFreeShipping > 0 ? (
                  <span>
                    Add <strong className="text-[#D6B16D] font-mono">{formatPKR(remainingForFreeShipping)}</strong> for Complimentary Insured Delivery
                  </span>
                ) : (
                  <span className="text-emerald-400 font-medium">
                    Complimentary Insured Courier Unlocked!
                  </span>
                )}
              </span>
            </div>
            <div className="w-full bg-[#20180d] h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-[#D6B16D] to-[#F4E0A5] h-full rounded-full transition-all duration-500"
                style={{ width: `${freeShippingProgress}%` }}
              />
            </div>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12">
                <div className="w-16 h-16 rounded-full bg-[#18130a] border border-[#3b2e1b] flex items-center justify-center text-[#D6B16D]">
                  <ShoppingBag className="w-8 h-8 opacity-60" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-base font-serif font-medium text-white">Your bag is empty</h4>
                  <p className="text-xs text-neutral-400 max-w-xs">
                    Explore our luxury watches, bridal bangles, designer handbags, and waterproof steel jewellery to discover treasures.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsCartOpen(false);
                    onExploreProducts();
                  }}
                  className="px-6 py-2.5 bg-[#D6B16D] text-black text-xs font-semibold uppercase tracking-wider rounded hover:bg-[#F4E0A5] transition-colors"
                >
                  Discover Collections
                </button>
              </div>
            ) : (
              items.map((item, index) => (
                <div
                  key={`${item.product.id}-${item.selectedSize || index}`}
                  className="p-3.5 rounded-xl bg-[#100d08] border border-[#241c11] flex gap-3.5 relative group"
                >
                  {/* Thumbnail */}
                  <img
                    src={item.product.images[0]}
                    alt={item.product.name}
                    className="w-20 h-20 object-cover rounded-lg bg-[#18130a] border border-[#2b2114] shrink-0"
                  />

                  {/* Info */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-serif font-semibold text-white truncate">
                        {item.product.name}
                      </h4>
                      <button
                        onClick={() => removeFromCart(item.product.id, item.selectedSize)}
                        className="text-neutral-500 hover:text-red-400 transition-colors p-1"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-neutral-400">
                      <span>{item.product.category}</span>
                      {item.selectedSize && (
                        <span>• Size: <strong className="text-neutral-200">{item.selectedSize}</strong></span>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      {/* Quantity Stepper */}
                      <div className="flex items-center rounded bg-[#18130a] border border-[#2b2114]">
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.selectedSize)}
                          className="px-2 py-0.5 text-xs text-neutral-400 hover:text-white"
                        >
                          -
                        </button>
                        <span className="px-2 text-xs font-mono font-medium text-white">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.selectedSize)}
                          disabled={item.quantity >= item.product.stock}
                          className="px-2 py-0.5 text-xs text-neutral-400 hover:text-white disabled:opacity-30"
                        >
                          +
                        </button>
                      </div>

                      {/* Price */}
                      <span className="text-xs font-mono font-semibold text-[#D6B16D]">
                        {formatPKR((item.product.salePrice ?? item.product.price) * item.quantity)}
                      </span>
                    </div>

                    {item.quantity >= item.product.stock && (
                      <span className="text-[10px] text-amber-400 block pt-0.5">
                        Max available stock reached
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Checkout Area */}
          {items.length > 0 && (
            <div className="p-5 border-t border-[#211a10] bg-[#0c0906] space-y-4">
              
              {/* Voucher Code Form */}
              <div className="space-y-1.5">
                {appliedPromo ? (
                  <div className="flex items-center justify-between p-2 rounded bg-emerald-950/60 border border-emerald-800 text-xs text-emerald-300">
                    <div className="flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5" />
                      <span>Code <strong>{appliedPromo}</strong> applied</span>
                    </div>
                    <button
                      onClick={removePromoCode}
                      className="text-neutral-400 hover:text-white text-[11px] underline"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyPromo} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Promo Code (e.g. ZNLUXURY10)"
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value)}
                      className="flex-1 bg-[#141009] border border-[#2d2315] text-xs px-3 py-2 rounded text-white focus:outline-none focus:border-[#D6B16D] placeholder:text-neutral-500 uppercase"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#1f190f] border border-[#3d311c] text-[#D6B16D] text-xs font-medium rounded hover:bg-[#D6B16D] hover:text-black transition-colors"
                    >
                      Apply
                    </button>
                  </form>
                )}
                {promoMessage && (
                  <div className={`text-[11px] flex items-center gap-1 ${
                    promoMessage.type === 'success' ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {promoMessage.type === 'success' ? (
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                    ) : (
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    )}
                    <span>{promoMessage.text}</span>
                  </div>
                )}
              </div>

              {/* Price Calculations */}
              <div className="space-y-2 text-xs border-t border-[#1d160e] pt-3">
                <div className="flex justify-between text-neutral-300">
                  <span>Subtotal</span>
                  <span className="font-mono text-white">{formatPKR(subtotal)}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-emerald-400 font-medium">
                    <span>Privilege Voucher</span>
                    <span className="font-mono">- {formatPKR(discount)}</span>
                  </div>
                )}

                <div className="flex justify-between text-neutral-300">
                  <span>Insured Armored Courier</span>
                  <span className="font-mono text-white">
                    {shippingCost === 0 ? 'Complimentary' : formatPKR(shippingCost)}
                  </span>
                </div>

                <div className="flex justify-between text-base font-serif font-semibold text-white pt-2 border-t border-[#261d12]">
                  <span>Total Payable</span>
                  <span className="font-mono text-[#D6B16D]">{formatPKR(total)}</span>
                </div>
              </div>

              {/* Checkout Trigger */}
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  onProceedToCheckout();
                }}
                className="w-full py-3.5 bg-gradient-to-r from-[#D6B16D] via-[#F4E0A5] to-[#C29B53] text-black font-semibold text-xs uppercase tracking-[0.2em] rounded hover:shadow-[0_0_25px_rgba(214,177,109,0.35)] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Proceed To Secure Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
