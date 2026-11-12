import React from 'react';
import { Award, ShieldCheck, HeartHandshake, Sparkles } from 'lucide-react';

export const BrandStory: React.FC = () => {
  return (
    <section className="py-24 px-6 lg:px-12 bg-[#0a0907] relative overflow-hidden border-t border-[#1c1811]">
      
      {/* Background Gold Ambient */}
      <div className="absolute top-1/2 right-10 -translate-y-1/2 w-80 h-80 bg-[#D6B16D]/5 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        
        {/* Left Editorial Visual with Gold Vitrine Framing */}
        <div className="lg:col-span-5 relative">
          <div className="absolute -inset-2 bg-gradient-to-r from-[#D6B16D]/15 via-transparent to-[#D6B16D]/10 rounded-3xl blur-xl pointer-events-none" />
          <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-[#3d321d] ring-1 ring-inset ring-[#D6B16D]/20 shadow-2xl bg-[#080808]">
            <img
              src="/hero-watches.jpg"
              alt="Artisanal Timepiece & Accessory Craftsmanship at ZN JEWELLERS"
              className="w-full h-full object-cover object-center filter brightness-[0.92] contrast-[1.05] hover:scale-105 transition-transform duration-700"
            />
            {/* Seamless Vignette & Edge Blend */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-[#080808]/50 to-transparent opacity-95 pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,#080808_95%)] opacity-70 pointer-events-none" />

            {/* Corner Filigrees */}
            <div className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-[#D6B16D] opacity-70 pointer-events-none" />
            <div className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-[#D6B16D] opacity-70 pointer-events-none" />
            
            <div className="absolute bottom-6 left-6 right-6 p-4 rounded-xl bg-[#080808]/90 backdrop-blur-md border border-[#3b311e] space-y-1 shadow-xl">
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#D6B16D] font-medium">Bespoke Dedication</span>
              <p className="text-xs text-neutral-300 italic font-serif">
                "Every ceremonial detail and crafted accessory is an expression of celebration, beauty, and lasting elegance."
              </p>
            </div>
          </div>
        </div>

        {/* Right Story Content */}
        <div className="lg:col-span-7 space-y-8">
          
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-[#D6B16D] font-medium">
              <Sparkles className="w-3.5 h-3.5 text-[#D6B16D]" />
              <span>Bespoke Artistry & Celebration</span>
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-white tracking-tight leading-tight">
              The Art of <span className="italic font-serif gold-gradient-text">Cherished Moments</span>.
            </h2>
          </div>

          <div className="space-y-4 text-neutral-300 text-sm sm:text-base font-light leading-relaxed">
            <p>
              At <span className="text-white font-medium">ZN JEWELLERS</span>, we celebrate life's most momentous milestones with exquisite handcrafted artistry and refined luxury.
            </p>
            <p>
              We specialize in heirloom bridal jewellery sets, statement rings, traditional jhumka earrings, luxury watches, Pakistani bridal bangles & kadas, designer handbags, and premium waterproof jewellery designed for effortless everyday elegance.
            </p>
            <p>
              Each piece is selected for lasting durability, comfort, and timeless sophistication, ensuring your celebrations and daily style reflect pure perfection.
            </p>
          </div>

          {/* Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-[#241e14]">
            <div className="space-y-1.5">
              <Sparkles className="w-5 h-5 text-[#D6B16D]" />
              <h4 className="text-sm font-serif font-semibold text-white">Luxury Watches</h4>
              <p className="text-xs text-neutral-400">Precision chronometers, date dials & mesh watches.</p>
            </div>
            <div className="space-y-1.5">
              <ShieldCheck className="w-5 h-5 text-[#D6B16D]" />
              <h4 className="text-sm font-serif font-semibold text-white">Watches & Bangles</h4>
              <p className="text-xs text-neutral-400">Curated timepieces, velvet choodiyan & bridal kadas.</p>
            </div>
            <div className="space-y-1.5">
              <HeartHandshake className="w-5 h-5 text-[#D6B16D]" />
              <h4 className="text-sm font-serif font-semibold text-white">Waterproof Steel</h4>
              <p className="text-xs text-neutral-400">Anti-tarnish, non-fading 18K PVD coated pieces.</p>
            </div>
          </div>

        </div>

      </div>

    </section>
  );
};
