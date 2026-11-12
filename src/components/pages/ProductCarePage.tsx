import React from 'react';
import { Sparkles, Watch, Shield, Droplets, Sun, Wind, Check, AlertCircle } from 'lucide-react';
import { useStoreSettings } from '../../context/StoreSettingsContext';

export const ProductCarePage: React.FC = () => {
  const { settings } = useStoreSettings();

  return (
    <div className="min-h-screen bg-[#080808] text-white pt-24 pb-20">
      {/* Hero Header */}
      <div className="relative overflow-hidden border-b border-[#222] bg-gradient-to-b from-[#141414] to-[#080808]">
        <div className="absolute inset-0 bg-[radial-gradient(#D6B16D_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#D6B16D]/30 bg-[#D6B16D]/10 text-[#D6B16D] text-xs font-semibold tracking-wider uppercase mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Preserve Your Luxury
          </div>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-white tracking-tight mb-4">
            Product Care & Maintenance Guide
          </h1>
          <p className="text-neutral-400 text-sm sm:text-base max-w-2xl mx-auto">
            Practical care instructions to keep your {settings.businessName} stainless steel jewellery, luxury timepieces, bridal bangles, and designer handbags shining like new for years.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        
        {/* Core Golden Rule */}
        <div className="bg-[#14120c] border border-[#D6B16D]/40 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#D6B16D]/15 border border-[#D6B16D]/30 flex items-center justify-center text-[#D6B16D] shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-serif font-bold text-white text-base mb-1">The Golden Rule: "Last On, First Off"</h3>
            <p className="text-xs text-neutral-300 leading-relaxed">
              Always put on your jewellery and watches AFTER applying perfumes, colognes, hairsprays, body lotions, and cosmetics. When returning home, make your jewellery the first thing you take off and safely place into its velvet pouch.
            </p>
          </div>
        </div>

        {/* 1. Stainless Steel Jewellery Care */}
        <section className="bg-[#111] border border-[#222] rounded-2xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D6B16D]/10 border border-[#D6B16D]/20 flex items-center justify-center text-[#D6B16D]">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-serif font-bold text-white">1. Stainless Steel Jewellery & PVD Gold Care</h2>
              <p className="text-xs text-[#D6B16D]">Rings, Necklaces, Bracelets & Chains</p>
            </div>
          </div>
          <p className="text-sm text-neutral-300 leading-relaxed">
            Our stainless steel jewellery is crafted from 316L surgical steel with vacuum PVD plating. While resistant to daily moisture and rust, adhering to proper maintenance maximizes longevity:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-neutral-300">
            <div className="bg-[#0c0c0c] border border-[#1f1f1f] p-3.5 rounded-xl flex items-start gap-2">
              <Check className="w-4 h-4 text-[#D6B16D] shrink-0 mt-0.5" />
              <span><strong>Cleaning:</strong> Wipe gently after wear with a soft, lint-free microfiber cloth to remove skin oils and perspiration.</span>
            </div>
            <div className="bg-[#0c0c0c] border border-[#1f1f1f] p-3.5 rounded-xl flex items-start gap-2">
              <Check className="w-4 h-4 text-[#D6B16D] shrink-0 mt-0.5" />
              <span><strong>Deep Wash:</strong> Clean with lukewarm water and a drop of neutral dish soap. Rinse and dry thoroughly with a dry towel.</span>
            </div>
            <div className="bg-[#0c0c0c] border border-[#1f1f1f] p-3.5 rounded-xl flex items-start gap-2">
              <Check className="w-4 h-4 text-[#D6B16D] shrink-0 mt-0.5" />
              <span><strong>Avoid Chlorinated Pools:</strong> Remove pieces prior to swimming in chlorinated pools or bathing in sulfur mineral springs.</span>
            </div>
            <div className="bg-[#0c0c0c] border border-[#1f1f1f] p-3.5 rounded-xl flex items-start gap-2">
              <Check className="w-4 h-4 text-[#D6B16D] shrink-0 mt-0.5" />
              <span><strong>Storage:</strong> Store each piece individually in its anti-tarnish velvet pouch to avoid friction against other metals.</span>
            </div>
          </div>
        </section>

        {/* 2. Bracelets & Bridal Bangles Care */}
        <section className="bg-[#111] border border-[#222] rounded-2xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D6B16D]/10 border border-[#D6B16D]/20 flex items-center justify-center text-[#D6B16D]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-serif font-bold text-white">2. Bangles, Kadas & Stone-Studded Bracelets</h2>
              <p className="text-xs text-[#D6B16D]">Velvet Bangles, Polki Setting & Stone Work</p>
            </div>
          </div>
          <ul className="space-y-2 text-sm text-neutral-300 pl-4 list-disc">
            <li><strong className="text-white">Avoid Forceful Snapping:</strong> Never force bangles over your knuckles without pressing the security spring clasp if fitted.</li>
            <li><strong className="text-white">Stone Settings:</strong> For items with handset CZ or Polki stones, do not soak in water for extended periods to preserve stone prong integrity.</li>
            <li><strong className="text-white">Bridal Velvet Bangles:</strong> Keep away from water and direct moisture. Store horizontally in round bangle holders.</li>
          </ul>
        </section>

        {/* 3. Luxury Watch Maintenance */}
        <section className="bg-[#111] border border-[#222] rounded-2xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D6B16D]/10 border border-[#D6B16D]/20 flex items-center justify-center text-[#D6B16D]">
              <Watch className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-serif font-bold text-white">3. Watch Maintenance & Longevity</h2>
              <p className="text-xs text-[#D6B16D]">Chronographs, Steel Bracelets & Japanese Quartz</p>
            </div>
          </div>
          <div className="space-y-2.5 text-xs text-neutral-300">
            <p className="leading-relaxed">
              <strong>Water Resistance Note:</strong> While our luxury timepieces feature 3ATM to 5ATM splash resistance (suitable for handwashing and rain), never wear watches into hot steam showers, saunas, or deep diving. Always make sure the crown is pushed completely flush against the case before any contact with water.
            </p>
            <p className="leading-relaxed">
              <strong>Battery Replacement:</strong> If your quartz chronograph stops running, replace the battery promptly at a certified watchmaker to prevent dead battery acid leakage from harming internal gears.
            </p>
            <p className="leading-relaxed">
              <strong>Magnetic Fields:</strong> Avoid placing watches directly on top of high-magnetic appliances (such as heavy audio speakers or microwave ovens).
            </p>
          </div>
        </section>

        {/* 4. Handbag Cleaning & Storage */}
        <section className="bg-[#111] border border-[#222] rounded-2xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#D6B16D]/10 border border-[#D6B16D]/20 flex items-center justify-center text-[#D6B16D]">
              <Droplets className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-serif font-bold text-white">4. Designer Handbags & Leather Goods</h2>
              <p className="text-xs text-[#D6B16D]">Vegan Leather, Clutches & Metallic Hardware</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-neutral-300">
            <div className="bg-[#0c0c0c] border border-[#1f1f1f] p-3.5 rounded-xl">
              <strong className="text-white block mb-1">Shape Maintenance</strong>
              <p className="text-neutral-400">Stuff handbags lightly with acid-free tissue paper or bubble wrap when not in use to maintain their structural silhouette.</p>
            </div>
            <div className="bg-[#0c0c0c] border border-[#1f1f1f] p-3.5 rounded-xl">
              <strong className="text-white block mb-1">Dust Bag Protection</strong>
              <p className="text-neutral-400">Always store your handbag inside the breathable cotton dust bag provided with every purchase.</p>
            </div>
            <div className="bg-[#0c0c0c] border border-[#1f1f1f] p-3.5 rounded-xl">
              <strong className="text-white block mb-1">Stain Treatment</strong>
              <p className="text-neutral-400">Gently wipe exterior surface dirt with a slightly damp soft cloth. Never use alcohol wipes, acetone, or harsh solvents.</p>
            </div>
            <div className="bg-[#0c0c0c] border border-[#1f1f1f] p-3.5 rounded-xl">
              <strong className="text-white block mb-1">Hardware Preservation</strong>
              <p className="text-neutral-400">Keep metal chain straps and locks dry. Buff metal hardware periodically with a dry cotton microfiber cloth.</p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};
