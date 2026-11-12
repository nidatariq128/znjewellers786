import React, { useState } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useProducts } from '../../context/ProductContext';
import { ProductCard } from '../shop/ProductCard';
import { Product, ProductCategory } from '../../types';

interface FeaturedCollectionProps {
  onQuickView: (product: Product) => void;
  onNavigateShop: (category?: ProductCategory | 'all') => void;
}

export const FeaturedCollection: React.FC<FeaturedCollectionProps> = ({
  onQuickView,
  onNavigateShop
}) => {
  const { products } = useProducts();
  const [activeTab, setActiveTab] = useState<'all' | 'Jewellery Sets' | 'Rings' | 'Earrings' | 'Watches' | 'Bangles' | 'Stainless Steel Jewellery' | 'Jewellery' | 'Handbags'>('all');

  const filtered = products.filter((p) => {
    if (activeTab === 'all') return p.isFeatured || p.isNewArrival;
    return p.category === activeTab;
  }).slice(0, 8);

  return (
    <section className="py-20 px-6 lg:px-12 bg-[#0a0907] border-t border-[#1d1810]">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#221c13] pb-8">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-[#D6B16D] font-medium">
              <Sparkles className="w-3 h-3" />
              <span>Timeless Craftsmanship</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif text-white tracking-wide">
              Featured <span className="italic font-serif gold-gradient-text">Masterworks</span>
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 font-light max-w-lg">
              Explore our curated selection of bridal jewellery sets, rings, earrings, luxury chronometers, bangles & kadas, and designer handbags.
            </p>
          </div>

          {/* Tab Filter */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3.5 py-1.5 rounded-full border transition-all text-[11px] uppercase tracking-wider cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-[#D6B16D] text-black border-[#D6B16D] font-semibold'
                  : 'bg-[#14110a] text-neutral-300 border-[#2f2718] hover:border-[#D6B16D]'
              }`}
            >
              All Featured
            </button>
            <button
              onClick={() => setActiveTab('Jewellery Sets')}
              className={`px-3.5 py-1.5 rounded-full border transition-all text-[11px] uppercase tracking-wider cursor-pointer ${
                activeTab === 'Jewellery Sets'
                  ? 'bg-[#D6B16D] text-black border-[#D6B16D] font-semibold'
                  : 'bg-[#14110a] text-neutral-300 border-[#2f2718] hover:border-[#D6B16D]'
              }`}
            >
              Bridal Sets
            </button>
            <button
              onClick={() => setActiveTab('Rings')}
              className={`px-3.5 py-1.5 rounded-full border transition-all text-[11px] uppercase tracking-wider cursor-pointer ${
                activeTab === 'Rings'
                  ? 'bg-[#D6B16D] text-black border-[#D6B16D] font-semibold'
                  : 'bg-[#14110a] text-neutral-300 border-[#2f2718] hover:border-[#D6B16D]'
              }`}
            >
              Rings
            </button>
            <button
              onClick={() => setActiveTab('Earrings')}
              className={`px-3.5 py-1.5 rounded-full border transition-all text-[11px] uppercase tracking-wider cursor-pointer ${
                activeTab === 'Earrings'
                  ? 'bg-[#D6B16D] text-black border-[#D6B16D] font-semibold'
                  : 'bg-[#14110a] text-neutral-300 border-[#2f2718] hover:border-[#D6B16D]'
              }`}
            >
              Earrings
            </button>
            <button
              onClick={() => setActiveTab('Watches')}
              className={`px-3.5 py-1.5 rounded-full border transition-all text-[11px] uppercase tracking-wider cursor-pointer ${
                activeTab === 'Watches'
                  ? 'bg-[#D6B16D] text-black border-[#D6B16D] font-semibold'
                  : 'bg-[#14110a] text-neutral-300 border-[#2f2718] hover:border-[#D6B16D]'
              }`}
            >
              Watches
            </button>
            <button
              onClick={() => setActiveTab('Bangles')}
              className={`px-3.5 py-1.5 rounded-full border transition-all text-[11px] uppercase tracking-wider cursor-pointer ${
                activeTab === 'Bangles'
                  ? 'bg-[#D6B16D] text-black border-[#D6B16D] font-semibold'
                  : 'bg-[#14110a] text-neutral-300 border-[#2f2718] hover:border-[#D6B16D]'
              }`}
            >
              Bangles
            </button>
            <button
              onClick={() => setActiveTab('Stainless Steel Jewellery')}
              className={`px-3.5 py-1.5 rounded-full border transition-all text-[11px] uppercase tracking-wider cursor-pointer ${
                activeTab === 'Stainless Steel Jewellery'
                  ? 'bg-[#D6B16D] text-black border-[#D6B16D] font-semibold'
                  : 'bg-[#14110a] text-neutral-300 border-[#2f2718] hover:border-[#D6B16D]'
              }`}
            >
              Stainless Steel
            </button>
            <button
              onClick={() => setActiveTab('Jewellery')}
              className={`px-3.5 py-1.5 rounded-full border transition-all text-[11px] uppercase tracking-wider cursor-pointer ${
                activeTab === 'Jewellery'
                  ? 'bg-[#D6B16D] text-black border-[#D6B16D] font-semibold'
                  : 'bg-[#14110a] text-neutral-300 border-[#2f2718] hover:border-[#D6B16D]'
              }`}
            >
              Jewellery
            </button>
            <button
              onClick={() => setActiveTab('Handbags')}
              className={`px-3.5 py-1.5 rounded-full border transition-all text-[11px] uppercase tracking-wider cursor-pointer ${
                activeTab === 'Handbags'
                  ? 'bg-[#D6B16D] text-black border-[#D6B16D] font-semibold'
                  : 'bg-[#14110a] text-neutral-300 border-[#2f2718] hover:border-[#D6B16D]'
              }`}
            >
              Handbags
            </button>
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {filtered.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onQuickView={onQuickView}
              hideDiscountBadge={true}
              hideNewBadge={true}
            />
          ))}
        </div>

        {/* View All Call to action */}
        <div className="text-center pt-8">
          <button
            onClick={() => onNavigateShop('all')}
            className="inline-flex items-center gap-3 px-8 py-3.5 bg-[#120f09] border border-[#3b301c] text-[#D6B16D] hover:bg-[#D6B16D] hover:text-black hover:border-[#D6B16D] text-xs uppercase tracking-[0.2em] font-semibold rounded transition-all duration-300"
          >
            <span>View All Curated Collections</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </section>
  );
};
