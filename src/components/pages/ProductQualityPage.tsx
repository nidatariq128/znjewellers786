import React from 'react';
import { ShieldCheck, Sparkles, CheckCircle2, Clock, Watch, ShoppingBag, Eye, Award } from 'lucide-react';
import { useStoreSettings } from '../../context/StoreSettingsContext';

export const ProductQualityPage: React.FC = () => {
  const { settings } = useStoreSettings();

  return (
    <div className="min-h-screen bg-[#080808] text-white py-16 px-6 lg:px-12">
      <div className="max-w-5xl mx-auto space-y-16">
        
        {/* Header */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#18130a] border border-[#3d311c] text-[10px] uppercase tracking-[0.25em] text-[#D6B16D]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Materials & Quality Standards</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-white tracking-wide">
            Product Quality & <span className="gold-gradient-text italic font-serif">Authenticity</span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 font-light leading-relaxed">
            At {settings.businessName}, every piece of fashion jewellery, timepiece, and accessory is selected and inspected to deliver lasting durability, elegant aesthetics, and outstanding value.
          </p>
        </div>

        {/* Clear Notice Banner */}
        <div className="p-5 rounded-xl bg-[#141009] border border-[#382b18] text-xs text-neutral-300 space-y-1.5">
          <span className="text-[#D6B16D] font-semibold uppercase tracking-wider text-[11px] block">
            Important Fashion Jewellery Specification:
          </span>
          <p className="font-light leading-relaxed text-neutral-400">
            {settings.businessName} strictly specializes in high-quality fashion accessories, waterproof stainless steel jewellery, and designer chronometers. We DO NOT sell bullion gold or diamond jewellery, nor do we issue gold hallmarking or diamond gemological certificates. Our materials are authentic to the fashion jewellery specifications stated below.
          </p>
        </div>

        {/* 4 Pillars of Craftsmanship */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Pillar 1: Stainless Steel */}
          <div className="p-7 rounded-2xl bg-[#0c0a07] border border-[#261f14] space-y-4 shadow-xl">
            <div className="w-10 h-10 rounded-full bg-[#18130a] border border-[#3b2e1a] flex items-center justify-center text-[#D6B16D]">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-serif font-semibold text-white">
              316L Surgical Stainless Steel & 18K PVD Plating
            </h3>
            <p className="text-xs text-neutral-300 font-light leading-relaxed">
              Our modern chains, Roman numeral bangles, stacking rings, and clover pendants are made from medical-grade 316L stainless steel. They undergo Physical Vapor Deposition (PVD) coating in high-vacuum chambers, creating an atomic bond with titanium nitride for a radiant golden luster that resists moisture, sweat, and tarnishing.
            </p>
            <ul className="space-y-1.5 text-xs text-neutral-400 pt-1">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#D6B16D]" />
                <span>100% Hypoallergenic — nickel-free and lead-free</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#D6B16D]" />
                <span>Will not turn skin green or black under everyday wear</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#D6B16D]" />
                <span>Waterproof performance for showers and gym workouts</span>
              </li>
            </ul>
          </div>

          {/* Pillar 2: Bridal Bangles & Kadas */}
          <div className="p-7 rounded-2xl bg-[#0c0a07] border border-[#261f14] space-y-4 shadow-xl">
            <div className="w-10 h-10 rounded-full bg-[#18130a] border border-[#3b2e1a] flex items-center justify-center text-[#D6B16D]">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-serif font-semibold text-white">
              Traditional Bridal Bangles & Kundan Kadas
            </h3>
            <p className="text-xs text-neutral-300 font-light leading-relaxed">
              Our ceremonial Pakistani choodiyan sets combine rich micro-velvet bangles, gold-polished filigree spacers, and heirloom-inspired brass kadas. Every Kundan glass stone is foil-backed and hand-set in antique brass frames with secure screw-locking mechanisms for seamless wear.
            </p>
            <ul className="space-y-1.5 text-xs text-neutral-400 pt-1">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#D6B16D]" />
                <span>Smooth inner band finishing to prevent arm irritation</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#D6B16D]" />
                <span>High-luster velvet that retains its color depth</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#D6B16D]" />
                <span>Double-plated antique gold polish with clear protective coating</span>
              </li>
            </ul>
          </div>

          {/* Pillar 3: Luxury Watches */}
          <div className="p-7 rounded-2xl bg-[#0c0a07] border border-[#261f14] space-y-4 shadow-xl">
            <div className="w-10 h-10 rounded-full bg-[#18130a] border border-[#3b2e1a] flex items-center justify-center text-[#D6B16D]">
              <Watch className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-serif font-semibold text-white">
              Precision Timepieces & Watch Engineering
            </h3>
            <p className="text-xs text-neutral-300 font-light leading-relaxed">
              ZN Jewelers watches utilize reliable quartz movements and precision sub-dial chronometers. Finished with hardened mineral crystal glass, ion-plated stainless steel oyster/jubilee bracelets, and double push-button safety deployment clasps.
            </p>
            <ul className="space-y-1.5 text-xs text-neutral-400 pt-1">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#D6B16D]" />
                <span>3ATM splash-resistant water resistance rating</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#D6B16D]" />
                <span>Scratch-resistant mineral crystal glass watch face</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#D6B16D]" />
                <span>Adjustable links for customized wrist fitting</span>
              </li>
            </ul>
          </div>

          {/* Pillar 4: Handbags */}
          <div className="p-7 rounded-2xl bg-[#0c0a07] border border-[#261f14] space-y-4 shadow-xl">
            <div className="w-10 h-10 rounded-full bg-[#18130a] border border-[#3b2e1a] flex items-center justify-center text-[#D6B16D]">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-serif font-semibold text-white">
              Structured Vegan Leather & Hardware Finish
            </h3>
            <p className="text-xs text-neutral-300 font-light leading-relaxed">
              Our designer totes, shoulder bags, and bridal clutches are constructed from scratch-resistant micro-grain vegan leather. Completed with heavy zinc-alloy turn-lock clasps, electroplated gold hardware, reinforced edge stitching, and protective base studs.
            </p>
            <ul className="space-y-1.5 text-xs text-neutral-400 pt-1">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#D6B16D]" />
                <span>Fade-resistant hardware with anti-tarnish top sealant</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#D6B16D]" />
                <span>Sturdy internal lining with zipped compartments</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#D6B16D]" />
                <span>Includes branded dust cover for protective storage</span>
              </li>
            </ul>
          </div>

        </div>

        {/* 5-Step Inspection Process */}
        <div className="p-8 rounded-2xl bg-[#0d0b07] border border-[#2b2214] space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h3 className="text-xl font-serif text-white">Our 5-Stage Pre-Dispatch Audit</h3>
            <p className="text-xs text-neutral-400">
              Before any order departs our Karachi atelier, it undergoes a meticulous quality review.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 text-center">
            <div className="p-4 rounded-xl bg-[#141009] border border-[#261f13] space-y-2">
              <span className="w-7 h-7 rounded-full bg-[#D6B16D] text-black text-xs font-bold font-mono inline-flex items-center justify-center">1</span>
              <h4 className="text-xs font-medium text-white">Surface Inspection</h4>
              <p className="text-[11px] text-neutral-400 font-light">Checking for flawless plating and stone alignment.</p>
            </div>

            <div className="p-4 rounded-xl bg-[#141009] border border-[#261f13] space-y-2">
              <span className="w-7 h-7 rounded-full bg-[#D6B16D] text-black text-xs font-bold font-mono inline-flex items-center justify-center">2</span>
              <h4 className="text-xs font-medium text-white">Clasp & Closure Test</h4>
              <p className="text-[11px] text-neutral-400 font-light">Verifying safety locks, hinges, and watch clasps.</p>
            </div>

            <div className="p-4 rounded-xl bg-[#141009] border border-[#261f13] space-y-2">
              <span className="w-7 h-7 rounded-full bg-[#D6B16D] text-black text-xs font-bold font-mono inline-flex items-center justify-center">3</span>
              <h4 className="text-xs font-medium text-white">Precision Sizing</h4>
              <p className="text-[11px] text-neutral-400 font-light">Measuring bangle and ring dimensions exactly as ordered.</p>
            </div>

            <div className="p-4 rounded-xl bg-[#141009] border border-[#261f13] space-y-2">
              <span className="w-7 h-7 rounded-full bg-[#D6B16D] text-black text-xs font-bold font-mono inline-flex items-center justify-center">4</span>
              <h4 className="text-xs font-medium text-white">Luxury Presentation</h4>
              <p className="text-[11px] text-neutral-400 font-light">Secured in cushioned velvet gift box packaging.</p>
            </div>

            <div className="p-4 rounded-xl bg-[#141009] border border-[#261f13] space-y-2">
              <span className="w-7 h-7 rounded-full bg-[#D6B16D] text-black text-xs font-bold font-mono inline-flex items-center justify-center">5</span>
              <h4 className="text-xs font-medium text-white">Sealed Logistics</h4>
              <p className="text-[11px] text-neutral-400 font-light">Double bubble-wrapped inside tamper-proof courier flyer.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
