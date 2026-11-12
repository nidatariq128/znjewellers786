import React from 'react';
import { RotateCcw, AlertTriangle, CheckCircle, Clock, CreditCard, ShieldAlert, Sparkles, MessageSquare } from 'lucide-react';
import { useStoreSettings } from '../../context/StoreSettingsContext';

export const ReturnsPolicyPage: React.FC = () => {
  const { settings } = useStoreSettings();

  return (
    <div className="min-h-screen bg-[#080808] text-white pt-24 pb-20">
      {/* Hero Header */}
      <div className="relative overflow-hidden border-b border-[#222] bg-gradient-to-b from-[#141414] to-[#080808]">
        <div className="absolute inset-0 bg-[radial-gradient(#D6B16D_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#D6B16D]/30 bg-[#D6B16D]/10 text-[#D6B16D] text-xs font-semibold tracking-wider uppercase mb-4">
            <RotateCcw className="w-3.5 h-3.5" />
            Customer Satisfaction
          </div>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-white tracking-tight mb-4">
            Return, Refund & Exchange Policy
          </h1>
          <p className="text-neutral-400 text-sm sm:text-base max-w-2xl mx-auto">
            We want you to love your pieces. If you are not completely satisfied with your purchase, our transparent 7-day return and exchange policy is here to help.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        
        {/* Policy Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#111] border border-[#222] p-5 rounded-xl">
            <Clock className="w-6 h-6 text-[#D6B16D] mb-3" />
            <h3 className="text-sm font-semibold text-white mb-1">7-Day Return Window</h3>
            <p className="text-xs text-neutral-400">Initiate an exchange or return claim within 7 calendar days from the parcel delivery date.</p>
          </div>
          <div className="bg-[#111] border border-[#222] p-5 rounded-xl">
            <CheckCircle className="w-6 h-6 text-[#D6B16D] mb-3" />
            <h3 className="text-sm font-semibold text-white mb-1">Seamless Exchanges</h3>
            <p className="text-xs text-neutral-400">Exchange ring sizes, bangle diameters, or swap for another luxury model hassle-free.</p>
          </div>
          <div className="bg-[#111] border border-[#222] p-5 rounded-xl">
            <CreditCard className="w-6 h-6 text-[#D6B16D] mb-3" />
            <h3 className="text-sm font-semibold text-white mb-1">Fast Digital Refunds</h3>
            <p className="text-xs text-neutral-400">Approved refunds are processed to your Bank, EasyPaisa, or JazzCash account within 3–5 business days.</p>
          </div>
        </div>

        {/* Section 1: Return & Exchange Eligibility */}
        <section className="bg-[#111] border border-[#222] rounded-2xl p-6 sm:p-8 space-y-4">
          <h2 className="text-xl font-serif font-bold text-white flex items-center gap-2">
            <span className="text-[#D6B16D]">1.</span> Return & Exchange Eligibility
          </h2>
          <p className="text-sm text-neutral-300 leading-relaxed">
            To qualify for an exchange or refund, the purchased item must satisfy the following conditions:
          </p>
          <ul className="space-y-2 text-sm text-neutral-400 pl-4 list-disc">
            <li>The item must be in completely unused, unworn condition with zero scratches, dings, or scent of perfume/lotions.</li>
            <li>All original security tags, plastic protective films, branded boxes, and authenticity care cards must be intact.</li>
            <li>The original order invoice or packing slip must accompany the return parcel.</li>
          </ul>
        </section>

        {/* Section 2: Damaged or Incorrect Products Received */}
        <section className="bg-[#111] border border-[#222] rounded-2xl p-6 sm:p-8 space-y-4">
          <h2 className="text-xl font-serif font-bold text-white flex items-center gap-2">
            <span className="text-[#D6B16D]">2.</span> Damaged or Defective Item Claims
          </h2>
          <p className="text-sm text-neutral-300 leading-relaxed">
            Every order is triple-inspected prior to sealing; however, if your parcel arrives damaged in transit or you receive an incorrect variant:
          </p>
          <div className="bg-[#0c0c0c] border border-[#1f1f1f] p-4 rounded-xl space-y-2 text-xs text-neutral-300">
            <p><strong className="text-[#D6B16D]">Timeframe:</strong> Notify our team within <strong>24 hours</strong> of receiving the parcel.</p>
            <p><strong className="text-[#D6B16D]">Evidence Required:</strong> Share clear photos or a short video showing the courier packaging and the damaged item via WhatsApp to <span className="text-white font-mono">{settings.phone}</span>.</p>
            <p><strong className="text-[#D6B16D]">Resolution:</strong> We will arrange a free replacement pickup and immediately dispatch a brand-new pristine replacement at zero cost to you.</p>
          </div>
        </section>

        {/* Section 3: Non-Returnable Items */}
        <section className="bg-[#111] border border-[#222] rounded-2xl p-6 sm:p-8 space-y-4">
          <h2 className="text-xl font-serif font-bold text-white flex items-center gap-2">
            <span className="text-[#D6B16D]">3.</span> Non-Returnable & Final Sale Items
          </h2>
          <p className="text-sm text-neutral-300 leading-relaxed">
            For hygiene and personalization reasons, the following cannot be returned or refunded unless defective upon delivery:
          </p>
          <ul className="space-y-1.5 text-sm text-neutral-400 pl-4 list-disc">
            <li>Pierced earrings (for strict hygienic reasons under consumer health guidelines).</li>
            <li>Custom engraved jewellery pieces or customized bridal accessories.</li>
            <li>Items sold during promotional clearance flash sales marked "Final Sale".</li>
          </ul>
        </section>

        {/* Section 4: Return Step-by-Step Procedure */}
        <section className="bg-[#111] border border-[#222] rounded-2xl p-6 sm:p-8 space-y-4">
          <h2 className="text-xl font-serif font-bold text-white flex items-center gap-2">
            <span className="text-[#D6B16D]">4.</span> How to Request a Return or Exchange
          </h2>
          <div className="space-y-3 pt-2">
            <div className="flex items-start gap-3 bg-[#0c0c0c] border border-[#1f1f1f] p-3.5 rounded-xl">
              <span className="w-6 h-6 rounded-full bg-[#D6B16D]/20 text-[#D6B16D] font-bold text-xs flex items-center justify-center shrink-0">1</span>
              <p className="text-xs text-neutral-300">Contact our WhatsApp concierge at <strong className="text-white">{settings.phone}</strong> with your Order Number and reason for exchange.</p>
            </div>
            <div className="flex items-start gap-3 bg-[#0c0c0c] border border-[#1f1f1f] p-3.5 rounded-xl">
              <span className="w-6 h-6 rounded-full bg-[#D6B16D]/20 text-[#D6B16D] font-bold text-xs flex items-center justify-center shrink-0">2</span>
              <p className="text-xs text-neutral-300">Our concierge approves the return and provides our boutique return address at <strong className="text-white">{settings.storeAddress}</strong>.</p>
            </div>
            <div className="flex items-start gap-3 bg-[#0c0c0c] border border-[#1f1f1f] p-3.5 rounded-xl">
              <span className="w-6 h-6 rounded-full bg-[#D6B16D]/20 text-[#D6B16D] font-bold text-xs flex items-center justify-center shrink-0">3</span>
              <p className="text-xs text-neutral-300">Ship the parcel via any tracked courier (TCS, Leopards, Trax) or drop it off in person at our Aman Tower store.</p>
            </div>
            <div className="flex items-start gap-3 bg-[#0c0c0c] border border-[#1f1f1f] p-3.5 rounded-xl">
              <span className="w-6 h-6 rounded-full bg-[#D6B16D]/20 text-[#D6B16D] font-bold text-xs flex items-center justify-center shrink-0">4</span>
              <p className="text-xs text-neutral-300">Upon receiving and inspecting the piece (within 24–48 hours), your replacement is dispatched or your refund is transferred immediately.</p>
            </div>
          </div>
        </section>

        {/* Concierge Call to Action */}
        <section className="bg-gradient-to-r from-[#17140e] to-[#111] border border-[#D6B16D]/30 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-serif font-bold text-white text-lg mb-1">Need to Exchange a Size or Model?</h3>
            <p className="text-xs text-neutral-400 max-w-md">
              Our Karachi store concierge is standing by to guide your return or coordinate an in-store swap at Aman Tower.
            </p>
          </div>
          <a
            href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}?text=Hello%20ZN%20Jewelers,%20I%20would%20like%20to%20request%20an%20exchange%20or%20return.`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 rounded-lg bg-[#D6B16D] text-black font-semibold text-xs tracking-wider uppercase hover:bg-[#e4c485] transition-colors shrink-0"
          >
            Start Return on WhatsApp
          </a>
        </section>

      </div>
    </div>
  );
};
