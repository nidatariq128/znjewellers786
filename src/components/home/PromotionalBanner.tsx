import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { ProductCategory } from '../../types';

interface PromotionalBannerProps {
  onNavigateShop: (category: ProductCategory) => void;
}

export const PromotionalBanner: React.FC<PromotionalBannerProps> = ({ onNavigateShop }) => {
  return (
    <section className="py-16 px-6 lg:px-12 bg-[#080808]">
      <div className="max-w-7xl mx-auto rounded-2xl overflow-hidden border border-[#3d321d] relative bg-gradient-to-r from-[#141009] via-[#0d0b07] to-[#141009] shadow-2xl">
        
        {/* Background Visual Accent with Seamless Mask */}
        <div className="absolute right-0 top-0 bottom-0 w-full lg:w-3/5 opacity-40 lg:opacity-75 overflow-hidden pointer-events-none">
          <img
            src="/hero-bangles.jpg"
            alt="Royal Bridal Bangles Suite"
            className="w-full h-full object-cover object-center filter brightness-[0.9] contrast-[1.05]"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0d0b07] via-[#0d0b07]/85 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d0b07] via-transparent to-[#0d0b07]/60" />
        </div>

        <div className="relative z-10 px-8 py-16 sm:px-16 max-w-2xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#20190e] border border-[#4a3b1e] text-[11px] uppercase tracking-[0.25em] text-[#D6B16D]">
            <Sparkles className="w-3.5 h-3.5 text-[#D6B16D]" />
            <span>The Bridal Haute Atelier</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-white tracking-tight leading-tight">
            The Royal Bridal <span className="gold-gradient-text italic font-serif">Bangles</span> Suite
          </h2>

          <p className="text-sm sm:text-base text-neutral-300 font-light leading-relaxed">
            Elevate every festive and bridal celebration with our heirloom velvet choodiyan sets, antique openable kadas, luxury timepieces, and waterproof stainless steel jewellery.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <button
              onClick={() => onNavigateShop('Bangles')}
              className="px-8 py-3.5 bg-gradient-to-r from-[#D6B16D] via-[#F4E0A5] to-[#C29B53] text-black text-xs uppercase tracking-[0.2em] font-semibold rounded hover:shadow-[0_0_25px_rgba(214,177,109,0.3)] transition-all flex items-center gap-2 group cursor-pointer"
            >
              <span>Explore Bridal Bangles</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <span className="text-xs text-neutral-400 italic">
              *Delivery across all Pakistan
            </span>
          </div>
        </div>

      </div>
    </section>
  );
};
