import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  ShoppingBag, 
  Heart, 
  User as UserIcon, 
  Menu, 
  X, 
  Sparkles, 
  ShieldCheck, 
  ChevronRight,
  ChevronDown,
  Watch,
  Gem,
  Package,
  Layers,
  Clock,
  Truck
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useProducts } from '../../context/ProductContext';
import { ProductCategory } from '../../types';

interface HeaderProps {
  onOpenSearch: () => void;
  onOpenAccount: () => void;
  onOpenWishlist: () => void;
  onOpenAdmin: () => void;
  onNavigateHome: () => void;
  onNavigateShop: (category?: ProductCategory | 'all' | 'new') => void;
  onNavigateAbout?: () => void;
  onNavigateTracking: () => void;
  onNavigateView?: (view: string) => void;
  currentView: string;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSearch,
  onOpenAccount,
  onOpenWishlist,
  onOpenAdmin,
  onNavigateHome,
  onNavigateShop,
  onNavigateAbout,
  onNavigateTracking,
  onNavigateView,
  currentView
}) => {
  const { totalItems, setIsCartOpen } = useCart();
  const { user, profile, isAdmin, wishlist } = useAuth();
  const { setSelectedCategory, categories } = useProducts();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [collectionsDropdownOpen, setCollectionsDropdownOpen] = useState(false);
  const [mobileCollectionsOpen, setMobileCollectionsOpen] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setCollectionsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCategoryClick = (category: ProductCategory | 'all' | 'new') => {
    setMobileMenuOpen(false);
    setCollectionsDropdownOpen(false);
    if (category === 'all') {
      setSelectedCategory(null);
      onNavigateShop('all');
    } else if (category === 'new') {
      setSelectedCategory(null);
      onNavigateShop('new');
    } else {
      setSelectedCategory(category);
      onNavigateShop(category);
    }
  };

  const handleAboutClick = () => {
    setMobileMenuOpen(false);
    setCollectionsDropdownOpen(false);
    if (onNavigateAbout) {
      onNavigateAbout();
    } else {
      onNavigateHome();
      setTimeout(() => {
        const el = document.getElementById('brand-story');
        el?.scrollIntoView({ behavior: 'smooth' });
      }, 150);
    }
  };

  // Base curated categories
  const baseCollectionCategories: {
    category: ProductCategory;
    label: string;
    description: string;
    icon: React.ReactNode;
  }[] = [
    {
      category: 'Stainless Steel Jewellery',
      label: 'Stainless Steel Jewellery',
      description: '100% Waterproof, Non-Fading & Anti-Tarnish 316L Steel',
      icon: <Sparkles className="w-4 h-4 text-[#D6B16D]" />
    },
    {
      category: 'Jewellery Sets',
      label: 'Bridal & Jewellery Sets',
      description: 'Grand Kundan Choker Sets & Festive Haars with Tikka',
      icon: <Gem className="w-4 h-4 text-[#D6B16D]" />
    },
    {
      category: 'Rings',
      label: 'Rings',
      description: 'Waterproof 18K PVD Croissant & Solitaire Rings',
      icon: <Sparkles className="w-4 h-4 text-[#D6B16D]" />
    },
    {
      category: 'Earrings',
      label: 'Earrings',
      description: 'Kundan Chandbalis, Royal Drop Earrings & Gold Huggie Hoops',
      icon: <Gem className="w-4 h-4 text-[#D6B16D]" />
    },
    {
      category: 'Watches',
      label: 'Watches',
      description: "Men's Luxury Chronographs & Women's Rose Gold Timepieces",
      icon: <Watch className="w-4 h-4 text-[#D6B16D]" />
    },
    {
      category: 'Bangles',
      label: 'Bangles & Kadas',
      description: 'Velvet Bridal Bangles, Kundan Centerpieces & Antique Kadas',
      icon: <Layers className="w-4 h-4 text-[#D6B16D]" />
    },
    {
      category: 'Handbags',
      label: 'Handbags',
      description: 'Textured Leather Totes, Monogram Crossbody & Bridal Clutches',
      icon: <Package className="w-4 h-4 text-[#D6B16D]" />
    }
  ];

  // Merge custom collections created by the admin
  const customCats = categories
    .filter((c) => c.isCustom)
    .map((c) => ({
      category: c.name as ProductCategory,
      label: c.name,
      description: c.description,
      icon: <Sparkles className="w-4 h-4 text-[#D6B16D]" />
    }));

  const collectionCategories = [...baseCollectionCategories, ...customCats];

  return (
    <header className="sticky top-0 z-40 w-full transition-all duration-300">
      {/* 1. Simple Clean Announcement Bar */}
      <div className="bg-[#0a0805] border-b border-[#241c10] text-[#D6B16D] text-[11px] sm:text-xs uppercase tracking-[0.22em] py-2 px-4 text-center font-medium flex items-center justify-center gap-2 shadow-inner">
        <Sparkles className="w-3.5 h-3.5 text-[#D6B16D] animate-pulse shrink-0" />
        <span className="font-semibold text-white">
          Complimentary Shipping on Orders Above ₨5,000
        </span>
      </div>

      {/* 2. Main Navigation Bar */}
      <div 
        className={`w-full px-4 lg:px-8 py-3 transition-all duration-300 border-b ${
          isScrolled 
            ? 'bg-[#080808]/98 backdrop-blur-md border-[#231e15] shadow-2xl shadow-black/90' 
            : 'bg-[#080808]/90 backdrop-blur-sm border-[#1c1811]'
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* LEFT: Mobile Toggle & Brand Logo */}
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-neutral-300 hover:text-[#D6B16D] transition-colors rounded-lg hover:bg-white/5"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6 text-[#D6B16D]" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Brand Logo Image */}
            <div 
              className="flex items-center cursor-pointer select-none group py-0.5" 
              onClick={onNavigateHome}
            >
              <img 
                src="/logo.png" 
                alt="ZN JEWELLERS" 
                className="h-12 sm:h-14 md:h-16 w-auto object-contain transition-transform duration-300 group-hover:scale-105 filter drop-shadow-[0_2px_12px_rgba(214,177,109,0.25)]" 
              />
            </div>
          </div>

          {/* CENTER: Desktop Navigation Menu */}
          <nav className="hidden lg:flex items-center gap-7 text-[12px] uppercase tracking-[0.16em] text-neutral-300">
            {/* Home */}
            <button
              onClick={onNavigateHome}
              className={`transition-colors hover:text-[#D6B16D] py-1 ${
                currentView === 'home' ? 'text-[#D6B16D] font-semibold' : ''
              }`}
            >
              Home
            </button>

            {/* Collections Dropdown */}
            <div 
              ref={dropdownRef}
              className="relative"
              onMouseEnter={() => setCollectionsDropdownOpen(true)}
              onMouseLeave={() => setCollectionsDropdownOpen(false)}
            >
              <button
                onClick={() => setCollectionsDropdownOpen((prev) => !prev)}
                className={`flex items-center gap-1.5 py-1 transition-colors hover:text-[#D6B16D] cursor-pointer ${
                  currentView === 'shop' || collectionsDropdownOpen ? 'text-[#D6B16D] font-semibold' : ''
                }`}
              >
                <span>Collections</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${collectionsDropdownOpen ? 'rotate-180 text-[#D6B16D]' : 'text-neutral-500'}`} />
              </button>

              {/* Luxury Dropdown Menu Card */}
              {collectionsDropdownOpen && (
                <div className="absolute left-0 top-full pt-3 z-50 w-80 animate-fadeIn">
                  <div className="rounded-xl bg-[#0d0a07] border border-[#3b2e1b] shadow-2xl shadow-black/90 p-3 space-y-1 backdrop-blur-xl">
                    <div className="px-3 py-2 border-b border-[#221a10] flex items-center justify-between">
                      <span className="text-[10px] uppercase tracking-[0.25em] text-[#D6B16D] font-bold">
                        Curated Collections
                      </span>
                      <button
                        onClick={() => handleCategoryClick('all')}
                        className="text-[10px] text-neutral-400 hover:text-white hover:underline flex items-center gap-1"
                      >
                        <span>View All</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>

                    {/* All Categories list */}
                    <div className="py-1 space-y-0.5">
                      {collectionCategories.map((item) => (
                        <button
                          key={item.category}
                          onClick={() => handleCategoryClick(item.category)}
                          className="w-full px-3 py-2.5 rounded-lg flex items-start gap-3 text-left hover:bg-[#18130a] border border-transparent hover:border-[#332615] transition-all group/item"
                        >
                          <div className="mt-0.5 p-1.5 rounded-md bg-[#130f09] border border-[#261f14] group-hover/item:border-[#D6B16D]/50 transition-colors shrink-0">
                            {item.icon}
                          </div>
                          <div className="flex-1">
                            <span className="text-xs font-serif font-medium text-white group-hover/item:text-[#D6B16D] transition-colors block">
                              {item.label}
                            </span>
                            <span className="text-[10px] text-neutral-400 group-hover/item:text-neutral-300 line-clamp-1">
                              {item.description}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>

                    {/* Special Drops */}
                    <div className="pt-2 border-t border-[#221a10] flex items-center justify-between px-2">
                      <button
                        onClick={() => handleCategoryClick('new')}
                        className="flex items-center gap-2 text-[11px] text-[#D6B16D] hover:text-[#F4E0A5] py-1 font-semibold"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>New Arrivals</span>
                      </button>
                      <button
                        onClick={() => handleCategoryClick('all')}
                        className="text-[10px] text-neutral-400 hover:text-white py-1"
                      >
                        All Masterworks
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Products (All Products Page) */}
            <button
              onClick={() => {
                setCollectionsDropdownOpen(false);
                onNavigateShop('all');
              }}
              className={`transition-colors hover:text-[#D6B16D] py-1 ${
                currentView === 'shop' ? 'text-[#D6B16D] font-semibold' : ''
              }`}
            >
              Products
            </button>

            {/* About */}
            <button
              onClick={() => {
                setCollectionsDropdownOpen(false);
                if (onNavigateView) onNavigateView('about');
                else handleAboutClick();
              }}
              className={`transition-colors hover:text-[#D6B16D] py-1 ${
                currentView === 'about' ? 'text-[#D6B16D] font-semibold' : ''
              }`}
            >
              About
            </button>
          </nav>

          {/* RIGHT: Actions (Search, Wishlist, Account, Admin, Cart) */}
          <div className="flex items-center gap-2 sm:gap-4">

            {/* Search Icon */}
            <button
              onClick={onOpenSearch}
              className="p-2 text-neutral-300 hover:text-[#D6B16D] transition-colors rounded-full hover:bg-white/5"
              title="Search Catalogue"
              aria-label="Search Catalogue"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Wishlist Icon with count */}
            <button
              onClick={onOpenWishlist}
              className="p-2 text-neutral-300 hover:text-[#D6B16D] transition-colors rounded-full hover:bg-white/5 relative"
              title="Wishlist"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlist.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-[#D6B16D] text-black text-[10px] font-bold rounded-full flex items-center justify-center">
                  {wishlist.length}
                </span>
              )}
            </button>

            {/* Account Icon */}
            <button
              onClick={onOpenAccount}
              className="p-2 text-neutral-300 hover:text-[#D6B16D] transition-colors rounded-full hover:bg-white/5 flex items-center gap-1.5"
              title={user ? profile?.displayName || user.email || 'My Account' : 'Sign In'}
              aria-label="Account"
            >
              <UserIcon className="w-5 h-5" />
              {user && (
                <span className="hidden xl:inline text-[11px] tracking-wider text-neutral-300 max-w-[85px] truncate">
                  {profile?.displayName?.split(' ')[0] || 'Client'}
                </span>
              )}
            </button>

            {/* Admin Badge/Access */}
            <button
              onClick={onOpenAdmin}
              className={`hidden sm:flex items-center gap-1 px-2.5 py-1 text-[10px] uppercase tracking-widest rounded border transition-all ${
                isAdmin 
                  ? 'bg-[#D6B16D]/20 text-[#D6B16D] border-[#D6B16D]/50 hover:bg-[#D6B16D]/30'
                  : 'bg-neutral-900 text-neutral-400 border-neutral-800 hover:text-white'
              }`}
              title="Store Management Portal"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#D6B16D]" />
              <span>Admin</span>
            </button>

            {/* Shopping Bag with live counter */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 bg-[#17140e] border border-[#3b311e] rounded-full text-[#D6B16D] hover:bg-[#252014] transition-all flex items-center justify-center"
              aria-label="Shopping Bag"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-[#D6B16D] to-[#F4E0A5] text-black text-[11px] font-bold rounded-full flex items-center justify-center shadow-lg">
                  {totalItems}
                </span>
              )}
            </button>
          </div>

        </div>
      </div>

      {/* 3. Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-[78px] z-50 bg-[#080808]/98 backdrop-blur-2xl border-t border-[#231e15] px-6 py-6 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-6">
            
            {/* Free shipping banner */}
            <div className="p-3 rounded-lg bg-[#141009] border border-[#332615] flex items-center gap-2 text-xs text-[#D6B16D]">
              <Truck className="w-4 h-4 shrink-0" />
              <span>Complimentary Shipping on Orders Above ₨5,000</span>
            </div>

            {/* Navigation Links */}
            <nav className="flex flex-col space-y-3 text-sm font-serif tracking-wider text-neutral-200">
              <button
                onClick={() => { setMobileMenuOpen(false); onNavigateHome(); }}
                className={`flex items-center justify-between text-left py-2 border-b border-[#1f1910] ${
                  currentView === 'home' ? 'text-[#D6B16D] font-bold' : 'hover:text-[#D6B16D]'
                }`}
              >
                <span>Home</span>
                <ChevronRight className="w-4 h-4 text-neutral-600" />
              </button>

              {/* Products (All Products Page) */}
              <button
                onClick={() => { setMobileMenuOpen(false); onNavigateShop('all'); }}
                className={`flex items-center justify-between text-left py-2 border-b border-[#1f1910] ${
                  currentView === 'shop' ? 'text-[#D6B16D] font-bold' : 'hover:text-[#D6B16D]'
                }`}
              >
                <span>All Products</span>
                <ChevronRight className="w-4 h-4 text-neutral-600" />
              </button>

              {/* Collections Accordion */}
              <div className="py-1 border-b border-[#1f1910]">
                <button
                  onClick={() => setMobileCollectionsOpen((prev) => !prev)}
                  className="w-full flex items-center justify-between text-left py-2 text-[#D6B16D] font-semibold"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#D6B16D]" />
                    <span>Collections</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 transition-transform ${mobileCollectionsOpen ? 'rotate-180' : ''}`} />
                </button>

                {mobileCollectionsOpen && (
                  <div className="pl-3 pr-1 py-2 space-y-2 text-xs font-sans text-neutral-300">
                    <button
                      onClick={() => handleCategoryClick('all')}
                      className="w-full flex items-center justify-between py-1.5 text-left text-[#D6B16D] hover:underline font-semibold"
                    >
                      <span>Explore All Collections</span>
                      <ChevronRight className="w-3.5 h-3.5 text-neutral-600" />
                    </button>
                    {collectionCategories.map((item) => (
                      <button
                        key={item.category}
                        onClick={() => handleCategoryClick(item.category)}
                        className="w-full flex items-center justify-between py-1.5 text-left hover:text-[#D6B16D]"
                      >
                        <span className="flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#D6B16D]/60" />
                          {item.label}
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-neutral-600" />
                      </button>
                    ))}
                    <button
                      onClick={() => handleCategoryClick('new')}
                      className="w-full flex items-center justify-between py-1.5 text-left text-[#D6B16D] font-medium"
                    >
                      <span>✨ New Arrivals</span>
                      <ChevronRight className="w-3.5 h-3.5 text-neutral-600" />
                    </button>
                  </div>
                )}
              </div>

              {/* About Us */}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onNavigateView) onNavigateView('about');
                  else handleAboutClick();
                }}
                className="flex items-center justify-between text-left py-2 border-b border-[#1f1910] hover:text-[#D6B16D]"
              >
                <span>About ZN Jewelers</span>
                <ChevronRight className="w-4 h-4 text-neutral-600" />
              </button>
            </nav>

            {/* Quick Admin & Mobile Actions */}
            <div className="pt-2 space-y-3">
              <button
                onClick={() => { setMobileMenuOpen(false); onOpenAdmin(); }}
                className="w-full p-2.5 rounded-lg bg-[#141009] border border-[#332615] text-[#D6B16D] text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-[#20180e]"
              >
                <ShieldCheck className="w-4 h-4 text-[#D6B16D]" />
                <span>Admin Management Portal</span>
              </button>
            </div>
          </div>

          <div className="pt-6 border-t border-[#1a160f] text-center text-[11px] text-neutral-500 uppercase tracking-widest">
            ZN JEWELERS • Fashion Jewellery & Accessories • Aman Tower Karachi
          </div>
        </div>
      )}
    </header>
  );
};
