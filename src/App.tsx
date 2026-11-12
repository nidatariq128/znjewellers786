import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ProductProvider, useProducts } from './context/ProductContext';
import { StoreSettingsProvider } from './context/StoreSettingsContext';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { Hero } from './components/home/Hero';
import { CategoryShowcase } from './components/home/CategoryShowcase';
import { FeaturedCollection } from './components/home/FeaturedCollection';
import { NewArrivals } from './components/home/NewArrivals';
import { BrandStory } from './components/home/BrandStory';
import { PromotionalBanner } from './components/home/PromotionalBanner';
import { CustomerTestimonials } from './components/home/CustomerTestimonials';
import { SocialShowcase } from './components/home/SocialShowcase';
import { ShopPage } from './components/shop/ShopPage';
import { ProductDetailModal } from './components/shop/ProductDetailModal';
import { CartDrawer } from './components/cart/CartDrawer';
import { CheckoutModal } from './components/checkout/CheckoutModal';
import { OrderTrackingView } from './components/tracking/OrderTrackingView';
import { SearchModal } from './components/search/SearchModal';
import { AccountModal } from './components/account/AccountModal';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { ContactPage } from './components/pages/ContactPage';
import { AboutPage } from './components/pages/AboutPage';
import { FaqPage } from './components/pages/FaqPage';
import { ProductQualityPage } from './components/pages/ProductQualityPage';
import { PrivacyPolicyPage } from './components/pages/PrivacyPolicyPage';
import { TermsPage } from './components/pages/TermsPage';
import { ShippingPolicyPage } from './components/pages/ShippingPolicyPage';
import { ReturnsPolicyPage } from './components/pages/ReturnsPolicyPage';
import { ProductCarePage } from './components/pages/ProductCarePage';
import { WarrantyPolicyPage } from './components/pages/WarrantyPolicyPage';
import { Product, ProductCategory } from './types';
import { useCart } from './context/CartContext';

export type AppView = 
  | 'home' 
  | 'shop' 
  | 'tracking' 
  | 'contact' 
  | 'about' 
  | 'faqs' 
  | 'product-quality' 
  | 'privacy-policy' 
  | 'terms-conditions' 
  | 'shipping-delivery' 
  | 'returns-refunds' 
  | 'product-care' 
  | 'warranty-policy';

function MainApp() {
  const { products, selectedProductForModal, setSelectedProductForModal } = useProducts();
  const { addToCart } = useCart();

  // Navigation views
  const [currentView, setCurrentView] = useState<AppView>('home');
  const [shopCategory, setShopCategory] = useState<ProductCategory | null>(null);
  const [shopFilter, setShopFilter] = useState<'new' | 'all' | null>(null);

  // Modals & Drawers state
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Tracking state passed from checkout or direct
  const [trackingOrderNumber, setTrackingOrderNumber] = useState('');
  const [trackingPhone, setTrackingPhone] = useState('');

  // Handle URL hash changes for deep linking (e.g. #contact, #faqs, #about)
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '').toLowerCase();
      const validViews: Record<string, AppView> = {
        'contact': 'contact',
        'about': 'about',
        'faqs': 'faqs',
        'faq': 'faqs',
        'quality': 'product-quality',
        'product-quality': 'product-quality',
        'privacy': 'privacy-policy',
        'privacy-policy': 'privacy-policy',
        'terms': 'terms-conditions',
        'terms-conditions': 'terms-conditions',
        'shipping': 'shipping-delivery',
        'shipping-delivery': 'shipping-delivery',
        'returns': 'returns-refunds',
        'returns-refunds': 'returns-refunds',
        'care': 'product-care',
        'product-care': 'product-care',
        'warranty': 'warranty-policy',
        'warranty-policy': 'warranty-policy',
        'tracking': 'tracking',
        'shop': 'shop',
        'home': 'home'
      };

      if (hash && validViews[hash]) {
        setCurrentView(validViews[hash]);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Generic navigation handler
  const handleNavigateView = (view: string) => {
    const validView = view as AppView;
    setCurrentView(validView);
    window.location.hash = validView === 'home' ? '' : validView;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateHome = () => {
    setCurrentView('home');
    window.location.hash = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateShop = (category?: ProductCategory | 'all' | 'new') => {
    if (category === 'new') {
      setShopCategory(null);
      setShopFilter('new');
    } else if (category && category !== 'all') {
      setShopCategory(category);
      setShopFilter(null);
    } else {
      setShopCategory(null);
      setShopFilter(null);
    }
    setCurrentView('shop');
    window.location.hash = 'shop';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateTracking = (orderNum?: string, phoneNum?: string) => {
    if (orderNum) setTrackingOrderNumber(orderNum);
    if (phoneNum) setTrackingPhone(phoneNum);
    setCurrentView('tracking');
    window.location.hash = 'tracking';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateAbout = () => {
    handleNavigateView('about');
  };

  // Instant Buy Now: adds to cart & opens checkout immediately
  const handleInstantBuyNow = (product: Product, quantity: number, selectedSize?: string) => {
    addToCart(product, quantity, selectedSize);
    setIsCheckoutOpen(true);
  };

  // Signature hero piece
  const heroProduct = products.find((p) => p.id === 'zn-prod-005') || products[0];

  return (
    <div className="min-h-screen bg-[#080808] text-white flex flex-col font-sans selection:bg-[#D6B16D] selection:text-black">
      
      {/* 1. Sticky Luxury Navigation */}
      <Header
        currentView={currentView}
        onNavigateHome={handleNavigateHome}
        onNavigateShop={handleNavigateShop}
        onNavigateAbout={handleNavigateAbout}
        onNavigateTracking={() => handleNavigateTracking()}
        onNavigateView={handleNavigateView}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenAccount={() => setIsAccountOpen(true)}
        onOpenWishlist={() => setIsAccountOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      {/* 2. Main View Content */}
      <main className="flex-1">
        {/* VIEW 1: HOME */}
        {currentView === 'home' && (
          <>
            <Hero
              onShopCollection={() => handleNavigateShop('all')}
              onExploreMore={() => {
                const el = document.getElementById('brand-story');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              onSelectCategory={handleNavigateShop}
              onQuickViewHeroProduct={() => setSelectedProductForModal(heroProduct)}
            />

            <CategoryShowcase
              onSelectCategory={(cat) => handleNavigateShop(cat)}
            />

            <FeaturedCollection
              onQuickView={(p) => setSelectedProductForModal(p)}
              onNavigateShop={handleNavigateShop}
            />

            <div id="brand-story">
              <BrandStory />
            </div>

            <NewArrivals
              onQuickView={(p) => setSelectedProductForModal(p)}
              onNavigateShop={() => handleNavigateShop('new')}
            />

            <PromotionalBanner
              onNavigateShop={(cat) => handleNavigateShop(cat)}
            />

            {/* Social Media Showcase */}
            <SocialShowcase />

            <CustomerTestimonials />
          </>
        )}

        {/* VIEW 2: SHOP */}
        {currentView === 'shop' && (
          <ShopPage
            initialCategory={shopCategory}
            initialFilter={shopFilter}
            onQuickView={(p) => setSelectedProductForModal(p)}
          />
        )}

        {/* VIEW 3: ORDER TRACKING */}
        {currentView === 'tracking' && (
          <OrderTrackingView
            initialOrderNumber={trackingOrderNumber}
            initialPhone={trackingPhone}
            onExploreCollections={() => handleNavigateShop('all')}
          />
        )}

        {/* VIEW 4: CONTACT US */}
        {currentView === 'contact' && <ContactPage />}

        {/* VIEW 5: ABOUT US */}
        {currentView === 'about' && (
          <AboutPage
            onNavigateShop={() => handleNavigateShop('all')}
            onNavigateContact={() => handleNavigateView('contact')}
          />
        )}

        {/* VIEW 6: FAQS */}
        {currentView === 'faqs' && (
          <FaqPage
            onNavigateContact={() => handleNavigateView('contact')}
            onNavigateTracking={() => handleNavigateTracking()}
          />
        )}

        {/* VIEW 7: PRODUCT QUALITY & AUTHENTICITY */}
        {currentView === 'product-quality' && <ProductQualityPage />}

        {/* VIEW 8: PRIVACY POLICY */}
        {currentView === 'privacy-policy' && <PrivacyPolicyPage />}

        {/* VIEW 9: TERMS & CONDITIONS */}
        {currentView === 'terms-conditions' && <TermsPage />}

        {/* VIEW 10: SHIPPING & DELIVERY */}
        {currentView === 'shipping-delivery' && <ShippingPolicyPage />}

        {/* VIEW 11: RETURNS & EXCHANGES */}
        {currentView === 'returns-refunds' && <ReturnsPolicyPage />}

        {/* VIEW 12: PRODUCT CARE & MAINTENANCE */}
        {currentView === 'product-care' && <ProductCarePage />}

        {/* VIEW 13: WARRANTY POLICY */}
        {currentView === 'warranty-policy' && <WarrantyPolicyPage />}
      </main>

      {/* 3. Luxury 4-Column Footer */}
      <Footer
        onNavigateView={handleNavigateView}
        onOpenAdmin={() => setIsAdminOpen(true)}
      />

      {/* 4. Modals, Drawers & Portals */}
      <CartDrawer
        onProceedToCheckout={() => setIsCheckoutOpen(true)}
        onExploreProducts={() => handleNavigateShop('all')}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onViewOrderTracking={(orderNum, phone) => {
          setIsCheckoutOpen(false);
          handleNavigateTracking(orderNum, phone);
        }}
      />

      <ProductDetailModal
        product={selectedProductForModal}
        onClose={() => setSelectedProductForModal(null)}
        onInstantBuyNow={handleInstantBuyNow}
        onSelectRelatedProduct={(rel) => setSelectedProductForModal(rel)}
      />

      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onSelectProduct={(p) => setSelectedProductForModal(p)}
        onSelectCategory={(cat) => handleNavigateShop(cat as ProductCategory)}
      />

      <AccountModal
        isOpen={isAccountOpen}
        onClose={() => setIsAccountOpen(false)}
        onTrackOrder={(orderNum, phone) => {
          setIsAccountOpen(false);
          handleNavigateTracking(orderNum, phone);
        }}
        onQuickViewProduct={(p) => setSelectedProductForModal(p)}
      />

      <AdminDashboard
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
      />

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <StoreSettingsProvider>
        <CartProvider>
          <ProductProvider>
            <MainApp />
          </ProductProvider>
        </CartProvider>
      </StoreSettingsProvider>
    </AuthProvider>
  );
}
