import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useProducts } from '../../context/ProductContext';
import { ProductCard } from '../shop/ProductCard';
import { Product } from '../../types';

interface NewArrivalsProps {
  onQuickView: (product: Product) => void;
  onNavigateShop: (filter?: 'new') => void;
}

export const NewArrivals: React.FC<NewArrivalsProps> = ({ onQuickView, onNavigateShop }) => {
  const { products } = useProducts();
  const newItems = products.filter((p) => p.isNewArrival).slice(0, 4);

  return (
    <section className="py-20 px-6 lg:px-12 bg-[#080808] border-t border-[#1e1911]">
      <div className="max-w-7xl mx-auto space-y-10">
        
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-[#D6B16D] font-medium">
              <Sparkles className="w-3 h-3" />
              <span>Fresh From The Atelier</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-serif text-white tracking-wide">
              New <span className="italic font-serif gold-gradient-text">Arrivals</span>
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 font-light">
              Latest bespoke additions crafted for the upcoming celebratory season.
            </p>
          </div>

          <button
            onClick={() => onNavigateShop('new')}
            className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#D6B16D] hover:text-[#F4E0A5] transition-colors"
          >
            <span>View All New Pieces</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {newItems.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onQuickView={onQuickView}
            />
          ))}
        </div>

      </div>
    </section>
  );
};
