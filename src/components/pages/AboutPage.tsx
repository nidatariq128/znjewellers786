import React from 'react';
import { Sparkles, ShieldCheck, HeartHandshake, Award, Clock, MapPin, ArrowRight } from 'lucide-react';
import { useStoreSettings } from '../../context/StoreSettingsContext';
import { GoogleMapsSection } from '../common/GoogleMapsSection';

interface AboutPageProps {
  onNavigateShop?: () => void;
  onNavigateContact?: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onNavigateShop, onNavigateContact }) => {
  const { settings } = useStoreSettings();

  return (
    <div className="min-h-screen bg-[#080808] text-white py-16 px-6 lg:px-12">
      <div className="max-w-7xl mx-auto space-y-20">
        
        {/* Hero Banner */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#18130a] border border-[#3d311c] text-[10px] uppercase tracking-[0.25em] text-[#D6B16D]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>The ZN Jewelers Story</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-white tracking-wide">
            Crafting Elegance for Life’s <span className="gold-gradient-text italic font-serif">Cherished Moments</span>
          </h1>
          <p className="text-sm sm:text-base text-neutral-300 font-light leading-relaxed">
            Founded with an enduring passion for timeless design and accessible luxury, {settings.businessName} is Karachi’s trusted destination for bespoke bridal accessories, precision timepieces, and everyday waterproof fashion jewellery.
          </p>
        </div>

        {/* Visual & Story Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-5 relative">
            <div className="absolute -inset-3 bg-gradient-to-r from-[#D6B16D]/20 via-transparent to-[#D6B16D]/10 rounded-3xl blur-2xl pointer-events-none" />
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-[#3b2f1b] ring-1 ring-inset ring-[#D6B16D]/20 shadow-2xl bg-[#0e0c08]">
              <img
                src="/hero-watches.jpg"
                alt="ZN Jewelers Craftsmanship"
                className="w-full h-full object-cover object-center filter brightness-95 contrast-[1.05]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-transparent to-[#080808]/30 opacity-90" />
              
              <div className="absolute bottom-5 inset-x-5 p-4 rounded-xl bg-black/85 backdrop-blur-md border border-[#3b301a]">
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#D6B16D] font-medium block">
                  Karachi Flagship Store
                </span>
                <p className="text-xs text-neutral-300 font-light mt-1">
                  {settings.storeAddress}
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6 text-neutral-300 text-sm sm:text-base font-light leading-relaxed">
            <h2 className="text-2xl sm:text-3xl font-serif text-white">
              Redefining Modern <span className="gold-gradient-text italic font-serif">Fashion Accessories</span>
            </h2>
            
            <p>
              At <strong className="text-white font-medium">{settings.businessName}</strong>, we believe that luxury should be felt every single day. From bridal celebrations to effortless workplace style, accessories are the ultimate reflection of individuality and grace.
            </p>

            <p>
              Our collections are thoughtfully curated across key lifestyle categories:
            </p>

            <ul className="space-y-2.5 text-xs sm:text-sm pl-4 border-l-2 border-[#D6B16D]/40 text-neutral-300">
              <li>
                <strong className="text-white">Stainless Steel Jewellery:</strong> 316L titanium steel with 18K PVD coatings designed to be 100% waterproof, sweatproof, and perfume-safe for non-fading daily wear.
              </li>
              <li>
                <strong className="text-white">Bridal Bangles & Kadas:</strong> Traditional Pakistani velvet bangles sets, antique openable kadas, and Kundan centerpieces designed for unforgettable wedding celebrations.
              </li>
              <li>
                <strong className="text-white">Luxury Watches:</strong> Precision quartz and automatic timepieces featuring functional chronographs, emerald sunburst dials, and polished stainless steel bracelets.
              </li>
              <li>
                <strong className="text-white">Designer Handbags & Clutches:</strong> Structured micro-grain vegan leather silhouettes and evening clutches finished with 18K gold turn-lock hardware.
              </li>
            </ul>

            <div className="p-4 rounded-xl bg-[#120f09] border border-[#2b2214] text-xs text-neutral-400">
              <strong className="text-[#D6B16D] block mb-1">Authenticity & Transparency Commitment:</strong>
              {settings.businessName} strictly specializes in high-fashion jewellery, watches, and accessories. We do not sell gold bullion or diamond stones, ensuring transparent pricing and honest craftsmanship without unverified claims.
            </div>

            <div className="pt-2 flex flex-wrap gap-4">
              <button
                onClick={onNavigateShop}
                className="px-6 py-3 bg-[#D6B16D] hover:bg-[#F4E0A5] text-black text-xs font-semibold uppercase tracking-wider rounded-lg transition-all flex items-center gap-2 shadow-lg"
              >
                <span>Explore Collections</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onNavigateContact}
                className="px-6 py-3 bg-[#130f09] hover:bg-[#1a140c] border border-[#3b2e1b] hover:border-[#D6B16D] text-white text-xs font-medium uppercase tracking-wider rounded-lg transition-all"
              >
                Visit Our Karachi Store
              </button>
            </div>
          </div>

        </div>

        {/* 3 Pillars: Vision, Mission & Values */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-[#221a10]">
          
          <div className="p-6 rounded-2xl bg-[#0d0b07] border border-[#2d2215] space-y-3">
            <div className="w-10 h-10 rounded-full bg-[#181208] border border-[#3d311c] flex items-center justify-center text-[#D6B16D]">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-serif font-semibold text-white">Our Vision</h3>
            <p className="text-xs text-neutral-400 leading-relaxed font-light">
              To be Pakistan’s foremost destination for fashion accessories that unite traditional cultural heritage with modern, enduring, anti-tarnish everyday luxury.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0d0b07] border border-[#2d2215] space-y-3">
            <div className="w-10 h-10 rounded-full bg-[#181208] border border-[#3d311c] flex items-center justify-center text-[#D6B16D]">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-serif font-semibold text-white">Our Mission</h3>
            <p className="text-xs text-neutral-400 leading-relaxed font-light">
              To deliver meticulously inspected, comfortable, and beautifully finished accessories at honest prices, backed by dedicated Karachi concierge customer care.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#0d0b07] border border-[#2d2215] space-y-3">
            <div className="w-10 h-10 rounded-full bg-[#181208] border border-[#3d311c] flex items-center justify-center text-[#D6B16D]">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-serif font-semibold text-white">Trust & Quality</h3>
            <p className="text-xs text-neutral-400 leading-relaxed font-light">
              Every package is handled with utmost care, velvet gift packaging, and seamless nationwide courier tracking across all Pakistan cities.
            </p>
          </div>

        </div>

        {/* Google Maps Section */}
        <div className="pt-8">
          <GoogleMapsSection />
        </div>

      </div>
    </div>
  );
};
