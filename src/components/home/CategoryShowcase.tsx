import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useProducts } from '../../context/ProductContext';
import { ProductCategory } from '../../types';

interface CategoryShowcaseProps {
  onSelectCategory: (category: ProductCategory) => void;
}

export const CategoryShowcase: React.FC<CategoryShowcaseProps> = ({ onSelectCategory }) => {
  const { categories } = useProducts();

  return (
    <section className="py-20 px-6 lg:px-12 bg-[#080808]">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Section Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-[#D6B16D] font-medium">
            <Sparkles className="w-3 h-3" />
            <span>Curated Collections</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif text-white tracking-wide">
            Shop By <span className="italic font-serif gold-gradient-text">Category</span>
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 font-light">
            Explore our signature collections: Stainless Steel Jewellery, Bridal Jewellery Sets, Rings, Earrings, Luxury Watches, Traditional Bangles & Kadas, and Handbags.
          </p>
        </div>

        {/* Curated Category Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <div
              key={cat.name}
              onClick={() => onSelectCategory(cat.name as ProductCategory)}
              className="group relative h-80 sm:h-96 rounded-2xl overflow-hidden border border-[#2e2416] ring-1 ring-inset ring-[#D6B16D]/20 hover:border-[#D6B16D] hover:ring-[#D6B16D]/50 transition-all duration-500 cursor-pointer bg-[#080808] shadow-xl hover:shadow-[0_20px_50px_rgba(214,177,109,0.18),0_0_40px_rgba(0,0,0,0.95)] flex flex-col justify-end p-6 select-none"
            >
              {/* Background Photography with Theme-Matched Studio Lighting */}
              <img
                src={cat.image}
                alt={cat.name}
                className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-108 transition-transform duration-700 brightness-[0.88] contrast-[1.05] group-hover:brightness-100"
              />

              {/* Seamless Edge Blending: 4-Way Gradient Scrims & Deep Radial Vignette */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-[#080808]/60 to-[#080808]/40 group-hover:via-[#080808]/40 transition-all duration-500 pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-b from-[#080808]/50 via-transparent to-[#080808] pointer-events-none" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,#080808_95%)] opacity-80 pointer-events-none" />

              {/* Atelier Gold Corner Filigree Accents */}
              <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-[#D6B16D] opacity-40 group-hover:opacity-100 transition-opacity pointer-events-none" />
              <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-[#D6B16D] opacity-40 group-hover:opacity-100 transition-opacity pointer-events-none" />

              {/* Content Overlay */}
              <div className="relative z-10 space-y-2 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/70 backdrop-blur-md border border-[#3b301c] w-fit">
                  <span className="text-[9px] uppercase tracking-[0.25em] text-[#D6B16D] font-medium">
                    {cat.tagline || 'Curated Collection'}
                  </span>
                </div>
                <h3 className="text-2xl font-serif font-medium text-white group-hover:text-[#D6B16D] transition-colors drop-shadow-md">
                  {cat.name}
                </h3>
                <p className="text-xs text-neutral-300 font-light line-clamp-2 leading-relaxed">
                  {cat.description}
                </p>

                <div className="pt-2 flex items-center gap-2 text-xs font-semibold text-[#D6B16D] uppercase tracking-wider group-hover:text-[#F4E0A5]">
                  <span>Discover Pieces</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
