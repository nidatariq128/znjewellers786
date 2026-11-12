import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  Eye
} from 'lucide-react';
import { ProductCategory, Product } from '../../types';
import { useProducts } from '../../context/ProductContext';
import { formatPKR } from '../../lib/formatters';

interface HeroProps {
  onShopCollection: () => void;
  onExploreMore: () => void;
  onSelectCategory: (category: ProductCategory) => void;
  onQuickViewHeroProduct: () => void;
}

interface HeroSlide {
  id: string;
  productId: string;
  category: ProductCategory;
  tag: string;
  headline: string;
  highlightWord: string;
  description: string;
  price: string;
  image: string;
  accentColor: string;
}

const getCategoryTagline = (cat: ProductCategory): string => {
  if (cat === 'Watches' || cat === "Men's Watches" || cat === "Women's Watches") {
    return 'Precision Horlogerie';
  }
  if (cat === 'Handbags') {
    return 'Haute Designer Leathercraft';
  }
  if (cat === 'Bangles' || cat === 'Jewellery Sets' || cat === 'Earrings') {
    return 'Bespoke Bridal Masterwork';
  }
  return '100% Waterproof & Anti-Tarnish';
};

const DEFAULT_SLIDES: HeroSlide[] = [
  {
    id: 'slide-bangles',
    productId: 'zn-prod-005',
    category: 'Bangles',
    tag: 'Bespoke Bridal Masterwork',
    headline: 'Royal Kundan & Velvet',
    highlightWord: 'Bridal Bangles',
    description: '24-piece Pakistani bridal choodiyan set handcrafted in rich ruby velvet, antique gold-polished filigree separators, and grand Kundan centerpiece kadas.',
    price: '₨ 5,800',
    image: '/hero-bangles.jpg',
    accentColor: '#D6B16D'
  },
  {
    id: 'slide-watches',
    productId: 'zn-prod-013',
    category: 'Watches',
    tag: 'Precision Horlogerie',
    headline: 'The Sovereign Chronograph',
    highlightWord: 'Luxury Watches',
    description: 'Prestigious black & gold men’s chronometer timepiece featuring functional sub-dials, tachymeter bezel, 3ATM water resistance, and an 18K ion gold-plated oyster bracelet.',
    price: '₨ 8,500',
    image: '/hero-watches.jpg',
    accentColor: '#E6C687'
  },
  {
    id: 'slide-sets',
    productId: 'zn-prod-021',
    category: 'Jewellery Sets',
    tag: 'Bespoke Bridal Masterwork',
    headline: 'Royal Kundan & Pearl',
    highlightWord: 'Bridal Set',
    description: 'Heirloom bridal choker necklace with matching chandelier earrings, handcrafted in antique gold polish with uncut Kundan polki glass stones.',
    price: '₨ 8,800',
    image: '/hero-sets.jpg',
    accentColor: '#D6B16D'
  },
  {
    id: 'slide-steel',
    productId: 'zn-prod-017',
    category: 'Stainless Steel Jewellery',
    tag: '100% Waterproof & Anti-Tarnish',
    headline: '18K PVD Coated',
    highlightWord: 'Modern Steel',
    description: 'Guaranteed non-fading everyday luxury. Surgical grade 316L stainless steel herringbone chains, Roman numeral bangles, and lucky clover pendants resistant to perfume & water.',
    price: '₨ 3,200',
    image: '/hero-steel.jpg',
    accentColor: '#D6B16D'
  },
  {
    id: 'slide-rings',
    productId: 'zn-prod-023',
    category: 'Rings',
    tag: '100% Waterproof & Anti-Tarnish',
    headline: '18K PVD Coated',
    highlightWord: 'Statement Rings',
    description: 'Chunky French croissant dome rings and crystal solitaire bands crafted in hypoallergenic 316L titanium steel that never turn your skin green.',
    price: '₨ 2,100',
    image: '/hero-rings.jpg',
    accentColor: '#D6B16D'
  },
  {
    id: 'slide-earrings',
    productId: 'zn-prod-025',
    category: 'Earrings',
    tag: 'Bespoke Bridal Masterwork',
    headline: 'Royal Kundan Chandbali',
    highlightWord: 'Bridal Earrings',
    description: 'Grand crescent moon chandeliers with faceted Kundan settings and dense freshwater seed pearl bunch hangings.',
    price: '₨ 3,400',
    image: '/hero-earrings.jpg',
    accentColor: '#E6C687'
  },
  {
    id: 'slide-handbags',
    productId: 'zn-prod-009',
    category: 'Handbags',
    tag: 'Haute Designer Leathercraft',
    headline: 'The Aurelia Structured',
    highlightWord: 'Luxury Handbags',
    description: 'Iconic structured silhouette in premium micro-grain vegan leather with 18K champagne gold turn-lock hardware, protective studs, and detachable crossbody strap.',
    price: '₨ 7,800',
    image: '/hero-handbags.jpg',
    accentColor: '#E6C687'
  }
];

export const Hero: React.FC<HeroProps> = ({
  onShopCollection,
  onExploreMore,
  onSelectCategory,
}) => {
  const { setSelectedProductForModal, products } = useProducts();
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartXRef = useRef<number | null>(null);

  const SLIDE_DURATION = 4500; // 4.5 seconds per slide for smooth automatic transitions

  // Dynamically compute slides from best / featured store products
  const slides: HeroSlide[] = useMemo(() => {
    if (!products || products.length === 0) {
      return DEFAULT_SLIDES;
    }

    // Filter featured or highest-rated products as the best products
    const featured = products.filter((p) => p.isFeatured || (p.rating && p.rating >= 4.9));
    const bestItems = featured.length >= 3 ? featured.slice(0, 6) : products.slice(0, 6);

    return bestItems.map((p, idx) => {
      const nameParts = p.name.split(' ');
      const highlightWord = p.category;
      const headline = nameParts.slice(0, 3).join(' ');

      // Pick high quality image with fallback to studio assets
      let slideImg = p.images && p.images[0] ? p.images[0] : '';
      if (!slideImg || slideImg.includes('unsplash')) {
        if (p.category === 'Jewellery Sets') slideImg = '/hero-sets.jpg';
        else if (p.category === 'Rings') slideImg = '/hero-rings.jpg';
        else if (p.category === 'Earrings') slideImg = '/hero-earrings.jpg';
        else if (p.category === 'Bangles') slideImg = '/hero-bangles.jpg';
        else if (p.category === 'Watches' || p.category === "Men's Watches") slideImg = '/hero-watches.jpg';
        else if (p.category === 'Handbags') slideImg = '/hero-handbags.jpg';
        else slideImg = '/hero-steel.jpg';
      }

      return {
        id: p.id || `slide-${idx}`,
        productId: p.id,
        category: p.category,
        tag: getCategoryTagline(p.category),
        headline: headline || p.name,
        highlightWord: highlightWord,
        description: p.description,
        price: formatPKR(p.salePrice || p.price),
        image: slideImg,
        accentColor: '#D6B16D'
      };
    });
  }, [products]);

  // Ensure slide index stays in bounds if slides change
  const safeSlideIndex = currentSlideIndex < slides.length ? currentSlideIndex : 0;
  const currentSlide = slides[safeSlideIndex] || slides[0] || DEFAULT_SLIDES[0];

  // Auto slide navigation
  const nextSlide = useCallback(() => {
    setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
    setProgress(0);
  }, [slides.length]);

  const goToSlide = (idx: number) => {
    setCurrentSlideIndex(idx);
    setProgress(0);
  };

  // Continuous auto-sliding timer (Images automatically change)
  useEffect(() => {
    const stepMs = 50;
    const progressIncrement = (stepMs / SLIDE_DURATION) * 100;

    progressIntervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          nextSlide();
          return 0;
        }
        return prev + progressIncrement;
      });
    }, stepMs);

    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [nextSlide]);

  // Touch Swipe Handlers for Mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const diff = touchStartXRef.current - e.changedTouches[0].clientX;
    if (diff > 50) {
      nextSlide();
    } else if (diff < -50) {
      setCurrentSlideIndex((prev) => (prev - 1 + slides.length) % slides.length);
      setProgress(0);
    }
    touchStartXRef.current = null;
  };

  // Quick view current hero piece
  const handleQuickViewCurrent = () => {
    const found = products.find((p) => p.id === currentSlide.productId);
    if (found) {
      setSelectedProductForModal(found);
    } else {
      onSelectCategory(currentSlide.category);
    }
  };

  return (
    <section 
      className="relative w-full min-h-[85vh] lg:min-h-[90vh] flex items-center overflow-hidden bg-[#080808] border-b border-[#221c13]"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      
      {/* Background Ambient Lighting with Dynamic Glow */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[34rem] h-[34rem] bg-[#D6B16D]/10 rounded-full blur-[150px] pointer-events-none transition-all duration-1000" />
      <div className="absolute bottom-10 right-1/4 w-[36rem] h-[36rem] bg-[#A67C2E]/10 rounded-full blur-[160px] pointer-events-none" />

      {/* Main Hero Container */}
      <div className="max-w-7xl w-full mx-auto px-6 lg:px-12 py-12 lg:py-16 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center z-10">
        
        {/* Left Column: Dynamic Animated Editorial & Brand Copy (Columns 1-7) */}
        <div className="lg:col-span-7 space-y-7">
          
          {/* Animated Category Tag Badge */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-[#141009] border border-[#3b301c] shadow-md">
            <Sparkles className="w-3.5 h-3.5 text-[#D6B16D] animate-spin" style={{ animationDuration: '6s' }} />
            <span className="text-[11px] uppercase tracking-[0.28em] text-[#D6B16D] font-medium transition-all duration-500">
              {currentSlide.tag}
            </span>
          </div>

          {/* Dynamic Headline with Smooth Transition */}
          <div className="space-y-3 min-h-[120px] sm:min-h-[140px] flex flex-col justify-center">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-serif text-white font-normal tracking-tight leading-[1.12] transition-all duration-500">
              {currentSlide.headline},{' '}
              <span className="gold-gradient-text italic font-serif inline-block">
                {currentSlide.highlightWord}
              </span>
            </h1>
          </div>

          {/* Dynamic Brand Description */}
          <p className="text-sm sm:text-base text-neutral-300 font-light leading-relaxed max-w-xl min-h-[70px] sm:min-h-[50px] transition-opacity duration-500">
            {currentSlide.description}
          </p>

          {/* Action Buttons: Explore & Story & Quick View */}
          <div className="flex flex-wrap items-center gap-4 pt-1">
            <button
              onClick={onShopCollection}
              className="px-7 py-3.5 bg-gradient-to-r from-[#D6B16D] via-[#F4E0A5] to-[#C29B53] text-black text-xs uppercase tracking-[0.2em] font-semibold rounded hover:shadow-[0_0_30px_rgba(214,177,109,0.4)] hover:scale-[1.01] transition-all duration-300 flex items-center justify-center gap-2 group cursor-pointer shadow-lg shadow-black/80"
            >
              <span>Explore All Collections</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => onSelectCategory(currentSlide.category)}
              className="px-7 py-3.5 bg-[#120f0a] border border-[#3d321d] text-neutral-200 text-xs uppercase tracking-[0.2em] font-medium rounded hover:border-[#D6B16D] hover:text-[#D6B16D] hover:bg-[#18140c] transition-all duration-300 flex items-center justify-center cursor-pointer"
            >
              Shop {currentSlide.category}
            </button>

            <button
              onClick={handleQuickViewCurrent}
              className="px-4 py-3.5 rounded bg-[#141009]/80 border border-[#2b2114] text-neutral-300 hover:text-[#D6B16D] hover:border-[#D6B16D] text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer"
              title="Quick view this masterwork"
            >
              <Eye className="w-4 h-4" />
              <span className="hidden sm:inline">Quick View</span>
            </button>
          </div>

          {/* Slide Indicator Pills with Category Switchers & Live Auto Progress Bar */}
          <div className="pt-6 border-t border-[#1f1911]">
            <div className="text-[10px] uppercase tracking-[0.25em] text-neutral-400 font-medium mb-3 flex items-center justify-between">
              <span>Best Curated Masterpieces (Auto-Rotating):</span>
              <div className="flex items-center gap-1.5 text-neutral-400 font-mono">
                <span>{safeSlideIndex + 1}</span>
                <span>/</span>
                <span>{slides.length}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {slides.map((slide, idx) => {
                const isActive = idx === safeSlideIndex;
                return (
                  <button
                    key={slide.id}
                    onClick={() => goToSlide(idx)}
                    className={`relative p-2.5 rounded-lg border text-left transition-all overflow-hidden cursor-pointer ${
                      isActive
                        ? 'bg-[#181309] border-[#D6B16D] text-white shadow-md'
                        : 'bg-[#100d07] border-[#251e13] text-neutral-400 hover:border-[#4a391c] hover:text-neutral-200'
                    }`}
                  >
                    {/* Active Progress Bar Underlay */}
                    {isActive && (
                      <div 
                        className="absolute bottom-0 left-0 h-[2px] bg-[#D6B16D] transition-all duration-75"
                        style={{ width: `${progress}%` }}
                      />
                    )}

                    <span className="block text-[10px] font-medium tracking-wide truncate">
                      {slide.category === 'Stainless Steel Jewellery' ? 'Steel' : slide.category}
                    </span>
                    <span className="block text-[9px] font-mono text-[#D6B16D]/80 truncate">
                      {slide.price}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Column: Clean Pure Image Showcase with Museum Vitrine Framing (No overlays, No arrows) */}
        <div className="lg:col-span-5 relative flex flex-col items-center justify-center">
          
          {/* Deep Ambient Gold Aura Behind Image */}
          <div className="absolute w-96 h-96 bg-[#D6B16D]/15 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute -inset-4 bg-gradient-to-r from-[#D6B16D]/10 via-transparent to-[#D6B16D]/10 rounded-3xl blur-2xl pointer-events-none opacity-50" />

          {/* Luxury Showcase Frame: Clean, Uninhibited View of Masterwork Images */}
          <div 
            onClick={handleQuickViewCurrent}
            className="relative w-full max-w-md lg:max-w-lg aspect-[4/4.5] sm:aspect-[4/4.2] rounded-2xl overflow-hidden border border-[#3d301b] ring-1 ring-inset ring-[#D6B16D]/20 bg-[#080808] shadow-[0_30px_90px_rgba(0,0,0,0.95),0_0_50px_rgba(214,177,109,0.12)] group select-none cursor-pointer"
            title="Click to view details"
          >
            
            {/* The Image Stack with Fluid Auto Transitions */}
            {slides.map((slide, idx) => {
              const isActive = idx === safeSlideIndex;
              return (
                <div
                  key={slide.id}
                  className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
                    isActive 
                      ? 'opacity-100 scale-100 z-10' 
                      : 'opacity-0 scale-105 pointer-events-none z-0'
                  }`}
                >
                  <img
                    src={slide.image}
                    alt={`${slide.headline} - ZN JEWELLERS`}
                    className="w-full h-full object-cover object-center filter brightness-[0.98] contrast-[1.04] transition-transform duration-1000 group-hover:scale-105"
                  />
                  {/* Seamless Edge Blending Scrims: Feathering all borders into #080808 */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-transparent to-[#080808]/30 opacity-80 pointer-events-none" />
                  <div className="absolute inset-0 bg-gradient-to-b from-[#080808]/40 via-transparent to-[#080808] opacity-80 pointer-events-none" />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#080808]/50 via-transparent to-[#080808]/50 opacity-50 pointer-events-none" />
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,#080808_95%)] opacity-70 pointer-events-none" />
                </div>
              );
            })}

            {/* Atelier Gold Corner Filigree Accents */}
            <div className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-[#D6B16D] z-30 pointer-events-none opacity-80" />
            <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-[#D6B16D] z-30 pointer-events-none opacity-80" />
            <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-[#D6B16D] z-30 pointer-events-none opacity-80" />
            <div className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 border-[#D6B16D] z-30 pointer-events-none opacity-80" />

            {/* Top Floating Category Badge & Auto Indicator (Arrows and Feature Masterpiece card are removed) */}
            <div className="absolute top-4 inset-x-4 z-20 flex items-center justify-between pointer-events-none">
              <span className="px-3.5 py-1.5 rounded-full bg-black/80 backdrop-blur-md border border-[#3d311c] text-[10px] uppercase font-bold tracking-widest text-[#D6B16D] shadow-lg">
                {currentSlide.category}
              </span>

              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-neutral-300 text-[10px] font-mono tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D6B16D] animate-ping" />
                <span>AUTO</span>
              </div>
            </div>

          </div>

          {/* Minimalist Slide Progress Indicator Dots */}
          <div className="flex items-center gap-2 mt-4 z-20">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => goToSlide(idx)}
                aria-label={`Jump to slide ${idx + 1}`}
                className={`h-2 rounded-full transition-all duration-500 cursor-pointer ${
                  idx === safeSlideIndex
                    ? 'w-8 bg-[#D6B16D] shadow-[0_0_10px_rgba(214,177,109,0.5)]'
                    : 'w-2 bg-[#2d2417] hover:bg-[#524128]'
                }`}
              />
            ))}
          </div>

        </div>

      </div>

    </section>
  );
};
