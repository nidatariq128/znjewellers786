import React, { useState, useEffect } from 'react';
import { 
  X, 
  Heart, 
  ShoppingBag, 
  Zap, 
  ShieldCheck, 
  Truck, 
  Award, 
  Star, 
  Check, 
  Sparkles,
  Send,
  RotateCcw
} from 'lucide-react';
import { Product, Review } from '../../types';
import { formatPKR } from '../../lib/formatters';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useProducts } from '../../context/ProductContext';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { handleFirestoreError, OperationType } from '../../lib/firestoreErrors';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onInstantBuyNow: (product: Product, quantity: number, selectedSize?: string) => void;
  onSelectRelatedProduct: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onInstantBuyNow,
  onSelectRelatedProduct
}) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist, user, profile } = useAuth();
  const { products } = useProducts();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(undefined);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'specs' | 'reviews' | 'delivery'>('specs');
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const [addedAnimation, setAddedAnimation] = useState(false);

  // Reviews state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [reviewName, setReviewName] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (product) {
      setActiveImageIndex(0);
      setQuantity(1);
      setSelectedSize(product.ringSizes && product.ringSizes.length > 0 ? product.ringSizes[0] : undefined);
      loadReviews(product.id);
    }
  }, [product]);

  const loadReviews = async (productId: string) => {
    setReviewsLoading(true);
    try {
      const q = query(collection(db, 'reviews'), where('productId', '==', productId));
      const snap = await getDocs(q);
      const list: Review[] = [];
      snap.forEach((d) => list.push({ id: d.id, ...d.data() } as Review));
      
      // If none yet, provide initial seed reviews
      if (list.length === 0) {
        setReviews([
          {
            id: 'rev-1',
            productId,
            userName: 'Begum Salma Tariq',
            rating: 5,
            comment: 'Magnificent luster and flawless craftsmanship. The presentation packaging and custom engraving exceeded all expectations.',
            createdAt: '2026-02-14'
          },
          {
            id: 'rev-2',
            productId,
            userName: 'Usman Farooq',
            rating: 5,
            comment: 'Purchased for my fiancé. The sizing was immaculate and the velvet box presented with utmost elegance.',
            createdAt: '2026-02-02'
          }
        ]);
      } else {
        setReviews(list);
      }
    } catch (e) {
      console.warn('Reviews fetch fallback', e);
      setReviews([
        {
          id: 'rev-1',
          productId,
          userName: 'Begum Salma Tariq',
          rating: 5,
          comment: 'Magnificent luster and flawless craftsmanship. The presentation packaging and custom engraving exceeded all expectations.',
          createdAt: '2026-02-14'
        }
      ]);
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !newComment.trim()) return;
    setSubmittingReview(true);
    const author = reviewName.trim() || profile?.displayName || user?.displayName || 'Distinguished Patron';
    const reviewData: Omit<Review, 'id'> = {
      productId: product.id,
      userName: author,
      userId: user?.uid,
      rating: newRating,
      comment: newComment.trim(),
      createdAt: new Date().toISOString()
    };

    try {
      const docRef = await addDoc(collection(db, 'reviews'), reviewData);
      setReviews((prev) => [{ id: docRef.id, ...reviewData }, ...prev]);
      setNewComment('');
      setReviewName('');
    } catch (err) {
      console.warn('Error saving review to Firestore:', err);
      setReviews((prev) => [{ id: `local-${Date.now()}`, ...reviewData }, ...prev]);
      setNewComment('');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (!product) return null;

  const inWishlist = isInWishlist(product.id);
  const isSale = product.salePrice && product.salePrice < product.price;
  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 3);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomPosition({ x, y });
  };

  const handleAddToCart = () => {
    if (product.stock <= 0) return;
    addToCart(product, quantity, selectedSize);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1500);
  };

  const handleBuyNow = () => {
    if (product.stock <= 0) return;
    onInstantBuyNow(product, quantity, selectedSize);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6">
      
      {/* Modal Container */}
      <div 
        className="relative w-full max-w-5xl bg-[#0c0a07] border border-[#3d311c] rounded-2xl shadow-[0_25px_70px_rgba(0,0,0,0.95)] overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-black/70 border border-white/10 text-neutral-300 hover:text-white hover:bg-black transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 max-h-[90vh] overflow-y-auto">
          
          {/* Left Column: Image Gallery & Zoom (Cols 1-6) */}
          <div className="lg:col-span-6 p-6 sm:p-8 bg-[#090806] border-b lg:border-b-0 lg:border-r border-[#241d13] flex flex-col space-y-4">
            
            {/* Main Image with Zoom feature */}
            <div
              onMouseEnter={() => setIsZoomed(true)}
              onMouseLeave={() => setIsZoomed(false)}
              onMouseMove={handleMouseMove}
              className="relative aspect-square w-full rounded-xl overflow-hidden bg-[#0c0a07] border border-[#382b19] ring-1 ring-inset ring-[#D6B16D]/20 shadow-2xl cursor-crosshair group select-none"
            >
              <img
                src={product.images[activeImageIndex] || product.images[0]}
                alt={product.name}
                className={`w-full h-full object-cover transition-transform duration-200 ${
                  isZoomed ? 'scale-150' : 'scale-100'
                }`}
                style={
                  isZoomed
                    ? {
                        transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`
                      }
                    : undefined
                }
              />

              {/* Edge Vignette Scrim */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#090806]/60 via-transparent to-transparent pointer-events-none" />

              {/* Gold Corner Filigrees */}
              <div className="absolute top-2.5 left-2.5 w-3.5 h-3.5 border-t-2 border-l-2 border-[#D6B16D] opacity-70 pointer-events-none" />
              <div className="absolute top-2.5 right-2.5 w-3.5 h-3.5 border-t-2 border-r-2 border-[#D6B16D] opacity-70 pointer-events-none" />
              <div className="absolute bottom-2.5 left-2.5 w-3.5 h-3.5 border-b-2 border-l-2 border-[#D6B16D] opacity-70 pointer-events-none" />
              <div className="absolute bottom-2.5 right-2.5 w-3.5 h-3.5 border-b-2 border-r-2 border-[#D6B16D] opacity-70 pointer-events-none" />

              {/* Badges */}
              <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none pl-2 pt-1">
                {product.material && (
                  <span className="px-2.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-black/85 backdrop-blur-md text-[#D6B16D] border border-[#3b311e]">
                    {product.material}
                  </span>
                )}
                {product.isNewArrival && (
                  <span className="px-2.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider bg-[#D6B16D] text-black">
                    New Arrival
                  </span>
                )}
              </div>

              {/* Zoom hint */}
              <div className="absolute bottom-3 right-3 px-2 py-1 rounded bg-black/80 backdrop-blur-sm text-[10px] text-neutral-400 pointer-events-none uppercase tracking-wider border border-white/5">
                Hover to Zoom
              </div>
            </div>

            {/* Thumbnails Row */}
            {product.images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-1">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 shrink-0 transition-all ${
                      activeImageIndex === idx
                        ? 'border-[#D6B16D] shadow-md shadow-[#D6B16D]/20 scale-105'
                        : 'border-[#292013] opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`Angle ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Authenticity Guarantee Callout */}
            <div className="pt-2 grid grid-cols-2 gap-3 text-xs text-neutral-400">
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[#110e09] border border-[#231a10]">
                <Sparkles className="w-4 h-4 text-[#D6B16D] shrink-0" />
                <span>100% Quality Guaranteed</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-[#110e09] border border-[#231a10]">
                <Truck className="w-4 h-4 text-[#D6B16D] shrink-0" />
                <span>Fast Nationwide Courier</span>
              </div>
            </div>

            {/* Complementary Pieces Under Images */}
            {relatedProducts.length > 0 && (
              <div className="pt-4 border-t border-[#241d13] space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] uppercase tracking-widest text-[#D6B16D] font-semibold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#D6B16D]" />
                    <span>Complementary Pieces</span>
                  </span>
                  <span className="text-[10px] text-neutral-500 uppercase tracking-wider">Related in {product.category}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {relatedProducts.map((rel) => (
                    <button
                      key={rel.id}
                      type="button"
                      onClick={() => onSelectRelatedProduct(rel)}
                      className="group/rel flex flex-col p-2.5 rounded-xl bg-[#120f0a] border border-[#261e13] hover:border-[#D6B16D] text-left cursor-pointer transition-all shadow-md hover:shadow-black"
                    >
                      <div className="aspect-square w-full rounded-lg overflow-hidden bg-black/50 mb-2 border border-[#2d2215]">
                        <img 
                          src={rel.images[0]} 
                          alt="" 
                          className="w-full h-full object-cover group-hover/rel:scale-105 transition-transform duration-300" 
                        />
                      </div>
                      <span className="text-xs font-serif font-medium text-white line-clamp-1 group-hover/rel:text-[#D6B16D] transition-colors">
                        {rel.name}
                      </span>
                      <span className="text-xs font-mono text-[#D6B16D] font-semibold mt-0.5">
                        {formatPKR(rel.salePrice ?? rel.price)}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Right Column: Specifications & Actions (Cols 7-12) */}
          <div className="lg:col-span-6 p-6 sm:p-8 flex flex-col justify-between space-y-6">
            
            <div className="space-y-4">
              
              {/* Category & SKU */}
              <div className="flex items-center justify-between text-xs text-[#D6B16D] uppercase tracking-[0.2em]">
                <span>{product.category}</span>
                <span className="font-mono text-neutral-400">{product.sku}</span>
              </div>

              {/* Title */}
              <h2 className="text-2xl sm:text-3xl font-serif font-medium text-white leading-tight">
                {product.name}
              </h2>

              {/* Rating */}
              <div className="flex items-center gap-2">
                <div className="flex items-center text-[#D6B16D]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#D6B16D]" />
                  ))}
                </div>
                <span className="text-xs text-neutral-400">
                  {product.rating || 5.0} ({reviews.length} Verified Reviews)
                </span>
              </div>

              {/* Price in PKR */}
              <div className="pt-2 border-y border-[#241d13] py-3.5 flex items-baseline gap-3">
                {isSale ? (
                  <>
                    <span className="text-2xl sm:text-3xl font-mono font-semibold text-white">
                      {formatPKR(product.salePrice!)}
                    </span>
                    <span className="text-sm font-mono text-neutral-400 line-through">
                      {formatPKR(product.price)}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
                      Privilege Savings
                    </span>
                  </>
                ) : (
                  <span className="text-2xl sm:text-3xl font-mono font-semibold text-white">
                    {formatPKR(product.price)}
                  </span>
                )}
                <span className="text-xs text-neutral-400 ml-auto">Inclusive of all duties</span>
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed font-light">
                {product.description}
              </p>

              {/* Size Selector if ring or variant */}
              {product.ringSizes && product.ringSizes.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-300 uppercase tracking-wider font-medium">Select Ring Size:</span>
                    <span className="text-[#D6B16D] text-[11px] cursor-pointer hover:underline">Complimentary Sizing Guide</span>
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {product.ringSizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`w-10 h-10 rounded-lg text-xs font-medium border transition-all ${
                          selectedSize === size
                            ? 'bg-[#D6B16D] text-black border-[#D6B16D] font-bold shadow-md'
                            : 'bg-[#15110a] text-neutral-300 border-[#2f2416] hover:border-[#D6B16D]'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Stock Indicator */}
              <div className="flex items-center gap-2 text-xs">
                {product.stock <= 0 ? (
                  <span className="text-red-400 font-medium">Currently Sold Out — Enquire for Bespoke Casting</span>
                ) : (
                  <>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-emerald-400 font-medium">
                      In Stock ({product.stock} Hand-Finished Units Available)
                    </span>
                  </>
                )}
              </div>

              {/* Quantity Selector */}
              {product.stock > 0 && (
                <div className="flex items-center gap-4 pt-2">
                  <span className="text-xs text-neutral-300 uppercase tracking-wider font-medium">Quantity:</span>
                  <div className="flex items-center rounded-lg bg-[#14100a] border border-[#2f2416]">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="px-3 py-1.5 text-neutral-400 hover:text-white transition-colors"
                    >
                      -
                    </button>
                    <span className="px-4 py-1.5 text-xs font-mono font-medium text-white">{quantity}</span>
                    <button
                      onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                      className="px-3 py-1.5 text-neutral-400 hover:text-white transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              {/* Action Buttons: Add to Bag, Buy Now, Wishlist */}
              <div className="flex flex-col sm:flex-row items-stretch gap-3 pt-3">
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock <= 0}
                  className={`flex-1 py-3.5 px-6 rounded-lg font-semibold text-xs uppercase tracking-[0.18em] transition-all flex items-center justify-center gap-2 ${
                    product.stock <= 0
                      ? 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                      : addedAnimation
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[#1a150e] border border-[#3d311c] text-[#D6B16D] hover:bg-[#282114] hover:border-[#D6B16D]'
                  }`}
                >
                  {addedAnimation ? <Check className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
                  <span>{addedAnimation ? 'Added To Bag' : 'Add To Bag'}</span>
                </button>

                <button
                  onClick={handleBuyNow}
                  disabled={product.stock <= 0}
                  className="flex-1 py-3.5 px-6 rounded-lg bg-gradient-to-r from-[#D6B16D] via-[#F4E0A5] to-[#C29B53] text-black font-semibold text-xs uppercase tracking-[0.18em] hover:shadow-[0_0_25px_rgba(214,177,109,0.35)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  <Zap className="w-4 h-4 fill-black" />
                  <span>Instant Buy Now</span>
                </button>

                <button
                  onClick={() => toggleWishlist(product.id)}
                  className="p-3.5 rounded-lg bg-[#14100a] border border-[#2f2416] text-neutral-300 hover:text-[#D6B16D] hover:border-[#D6B16D] transition-all flex items-center justify-center shrink-0"
                  title="Save to Wishlist"
                >
                  <Heart className={`w-5 h-5 ${inWishlist ? 'fill-[#D6B16D] text-[#D6B16D]' : ''}`} />
                </button>
              </div>

            </div>

            {/* Tabs: Specifications, Reviews, Delivery */}
            <div className="border-t border-[#241d13] pt-4 space-y-4">
              <div className="flex items-center gap-6 text-xs uppercase tracking-wider border-b border-[#1c160e] pb-2">
                <button
                  onClick={() => setActiveTab('specs')}
                  className={`pb-1 transition-colors ${
                    activeTab === 'specs' ? 'text-[#D6B16D] border-b-2 border-[#D6B16D] font-semibold' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Specifications
                </button>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`pb-1 transition-colors ${
                    activeTab === 'reviews' ? 'text-[#D6B16D] border-b-2 border-[#D6B16D] font-semibold' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  Patron Reviews ({reviews.length})
                </button>
                <button
                  onClick={() => setActiveTab('delivery')}
                  className={`pb-1 transition-colors ${
                    activeTab === 'delivery' ? 'text-[#D6B16D] border-b-2 border-[#D6B16D] font-semibold' : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  VIP Delivery & Care
                </button>
              </div>

              {/* Tab 1: Specifications */}
              {activeTab === 'specs' && (
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 rounded bg-[#110e09] border border-[#231a10]">
                    <span className="text-neutral-400 block text-[10px] uppercase">Material & Finish</span>
                    <span className="text-white font-medium">{product.material || '18K PVD Anti-Tarnish / Handcrafted'}</span>
                  </div>
                  <div className="p-2.5 rounded bg-[#110e09] border border-[#231a10]">
                    <span className="text-neutral-400 block text-[10px] uppercase">Collection</span>
                    <span className="text-white font-medium">{product.category}</span>
                  </div>
                  <div className="p-2.5 rounded bg-[#110e09] border border-[#231a10] col-span-2">
                    <span className="text-neutral-400 block text-[10px] uppercase">Bespoke Customization / Details</span>
                    <span className="text-white font-medium">
                      {product.customizationNotice || 'Bespoke customization with bride and groom details available.'}
                    </span>
                  </div>
                </div>
              )}

              {/* Tab 2: Reviews */}
              {activeTab === 'reviews' && (
                <div className="space-y-4 max-h-56 overflow-y-auto pr-1">
                  {reviews.map((rev) => (
                    <div key={rev.id} className="p-3 rounded bg-[#110e09] border border-[#231a10] space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-white">{rev.userName}</span>
                        <div className="flex items-center text-[#D6B16D]">
                          {[...Array(rev.rating)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-[#D6B16D]" />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-neutral-300 font-light">{rev.comment}</p>
                    </div>
                  ))}

                  {/* Add review form */}
                  <form onSubmit={handleAddReview} className="space-y-2 pt-2 border-t border-[#231a10]">
                    <span className="text-[11px] uppercase tracking-wider text-[#D6B16D] font-medium block">
                      Write a Patron Review
                    </span>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Your Name (Optional)"
                        value={reviewName}
                        onChange={(e) => setReviewName(e.target.value)}
                        className="bg-[#15110a] border border-[#2f2416] text-xs px-3 py-1.5 rounded text-white w-1/2 focus:outline-none focus:border-[#D6B16D]"
                      />
                      <select
                        value={newRating}
                        onChange={(e) => setNewRating(Number(e.target.value))}
                        className="bg-[#15110a] border border-[#2f2416] text-xs px-3 py-1.5 rounded text-white focus:outline-none focus:border-[#D6B16D]"
                      >
                        <option value={5}>5 Stars - Supreme</option>
                        <option value={4}>4 Stars - Exquisite</option>
                        <option value={3}>3 Stars - Good</option>
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Share your experience with this jewellery piece..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        required
                        className="bg-[#15110a] border border-[#2f2416] text-xs px-3 py-1.5 rounded text-white w-full focus:outline-none focus:border-[#D6B16D]"
                      />
                      <button
                        type="submit"
                        disabled={submittingReview}
                        className="px-3 py-1.5 bg-[#D6B16D] text-black text-xs font-semibold rounded hover:bg-[#F4E0A5] transition-colors shrink-0"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Tab 3: Delivery */}
              {activeTab === 'delivery' && (
                <div className="space-y-2 text-xs text-neutral-300">
                  <p>• Complimentary armored, insured delivery via TCS/Leopard VIP services across Karachi, Lahore, Islamabad, and nationwide within 48-72 hours.</p>
                  <p>• Delivered in luxury velvet presentation packaging with official ZN JEWELLERS brand authenticity card.</p>
                  <p>• 100% satisfaction guarantee with dedicated customer support across all Pakistan.</p>
                </div>
              )}

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
