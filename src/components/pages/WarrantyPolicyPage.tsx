import React from 'react';
import { Award, Shield, CheckCircle2, AlertOctagon, Wrench, MessageSquare } from 'lucide-react';
import { useStoreSettings } from '../../context/StoreSettingsContext';

export const WarrantyPolicyPage: React.FC = () => {
  const { settings } = useStoreSettings();

  return (
    <div className="min-h-screen bg-[#080808] text-white pt-24 pb-20">
      {/* Hero Header */}
      <div className="relative overflow-hidden border-b border-[#222] bg-gradient-to-b from-[#141414] to-[#080808]">
        <div className="absolute inset-0 bg-[radial-gradient(#D6B16D_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#D6B16D]/30 bg-[#D6B16D]/10 text-[#D6B16D] text-xs font-semibold tracking-wider uppercase mb-4">
            <Award className="w-3.5 h-3.5" />
            Quality Commitment
          </div>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-white tracking-tight mb-4">
            Warranty Policy
          </h1>
          <p className="text-neutral-400 text-sm sm:text-base max-w-2xl mx-auto">
            {settings.businessName} stands proudly behind our craftsmanship. We back our fashion jewellery, luxury watches, and leather accessories with clear, transparent warranty protection.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        
        {/* Coverage Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-[#111] border border-[#222] p-5 rounded-xl">
            <Shield className="w-6 h-6 text-[#D6B16D] mb-3" />
            <h3 className="text-sm font-semibold text-white mb-1">6-Month Anti-Tarnish</h3>
            <p className="text-xs text-neutral-400">PVD-coated 316L stainless steel jewellery is guaranteed against unnatural rusting, green skin staining, or premature peeling.</p>
          </div>
          <div className="bg-[#111] border border-[#222] p-5 rounded-xl">
            <Award className="w-6 h-6 text-[#D6B16D] mb-3" />
            <h3 className="text-sm font-semibold text-white mb-1">1-Year Watch Movement</h3>
            <p className="text-xs text-neutral-400">All precision quartz watch movements are protected against manufacturing mechanical timekeeping defects for 12 months.</p>
          </div>
          <div className="bg-[#111] border border-[#222] p-5 rounded-xl">
            <Wrench className="w-6 h-6 text-[#D6B16D] mb-3" />
            <h3 className="text-sm font-semibold text-white mb-1">Handbag Hardware</h3>
            <p className="text-xs text-neutral-400">Covered for 3 months against structural zipper breakage, magnetic clasp failure, or handle rivet detachment.</p>
          </div>
        </div>

        {/* Section 1: Detailed Coverage */}
        <section className="bg-[#111] border border-[#222] rounded-2xl p-6 sm:p-8 space-y-4">
          <h2 className="text-xl font-serif font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-[#D6B16D]" />
            What Is Covered Under Warranty
          </h2>
          <div className="space-y-2 text-sm text-neutral-300">
            <div className="p-3 bg-[#0c0c0c] rounded-lg border border-[#1f1f1f]">
              <strong className="text-white block">Stainless Steel & Fashion Jewellery:</strong>
              <span className="text-xs text-neutral-400">Discoloration, rust, or plating peeling occurring under standard everyday wear within 6 months of purchase.</span>
            </div>
            <div className="p-3 bg-[#0c0c0c] rounded-lg border border-[#1f1f1f]">
              <strong className="text-white block">Horlogerie & Watches:</strong>
              <span className="text-xs text-neutral-400">Internal quartz movement failure, hand detachment, or crown mechanism failure not caused by impact.</span>
            </div>
            <div className="p-3 bg-[#0c0c0c] rounded-lg border border-[#1f1f1f]">
              <strong className="text-white block">Handbags & Clutches:</strong>
              <span className="text-xs text-neutral-400">Defective zippers, broken metal buckles, or detached chain links resulting from manufacturing flaws.</span>
            </div>
          </div>
        </section>

        {/* Section 2: Exclusions */}
        <section className="bg-[#111] border border-[#222] rounded-2xl p-6 sm:p-8 space-y-4">
          <h2 className="text-xl font-serif font-bold text-white flex items-center gap-2">
            <AlertOctagon className="w-5 h-5 text-amber-500" />
            Warranty Exclusions
          </h2>
          <p className="text-sm text-neutral-300 leading-relaxed">
            The warranty does not cover issues resulting from:
          </p>
          <ul className="space-y-1.5 text-xs text-neutral-400 pl-4 list-disc">
            <li>Accidental dropping, scratches, impacts, or severe abrasions against rough surfaces.</li>
            <li>Direct exposure to harsh industrial chemicals, bleach, acetone, or acid cleaners.</li>
            <li>Water ingress in watches resulting from operating the crown underwater or exposure in hot steam saunas.</li>
            <li>Normal cosmetic wear, surface hairline scratches on steel, or strap leather crease marks over time.</li>
            <li>Unauthorized repair or third-party disassembly.</li>
          </ul>
        </section>

        {/* Section 3: Claim Procedure */}
        <section className="bg-[#111] border border-[#222] rounded-2xl p-6 sm:p-8 space-y-4">
          <h2 className="text-xl font-serif font-bold text-white flex items-center gap-2">
            <Wrench className="w-5 h-5 text-[#D6B16D]" />
            How to Claim Your Warranty
          </h2>
          <p className="text-sm text-neutral-300 leading-relaxed">
            To submit a claim, provide your digital invoice or order phone number. You can:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="bg-[#0c0c0c] p-4 rounded-xl border border-[#1f1f1f]">
              <h4 className="font-semibold text-white text-sm mb-1">Option A: In-Store at Karachi</h4>
              <p className="text-xs text-neutral-400">Bring your piece directly to our flagship counter at {settings.storeAddress} for instant on-site evaluation by our master craftsmen.</p>
            </div>
            <div className="bg-[#0c0c0c] p-4 rounded-xl border border-[#1f1f1f]">
              <h4 className="font-semibold text-white text-sm mb-1">Option B: Online via WhatsApp</h4>
              <p className="text-xs text-neutral-400">Message our customer desk at {settings.phone} with photos of the defect. We will issue a courier return label and dispatch your repaired or replaced piece.</p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
};
