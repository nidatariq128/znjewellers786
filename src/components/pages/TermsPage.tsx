import React from 'react';
import { Scale, FileCheck, AlertTriangle, HelpCircle, ShieldAlert, CheckCircle } from 'lucide-react';
import { useStoreSettings } from '../../context/StoreSettingsContext';

export const TermsPage: React.FC = () => {
  const { settings } = useStoreSettings();

  return (
    <div className="min-h-screen bg-[#080808] text-white pt-24 pb-20">
      {/* Hero Header */}
      <div className="relative overflow-hidden border-b border-[#222] bg-gradient-to-b from-[#141414] to-[#080808]">
        <div className="absolute inset-0 bg-[radial-gradient(#D6B16D_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#D6B16D]/30 bg-[#D6B16D]/10 text-[#D6B16D] text-xs font-semibold tracking-wider uppercase mb-4">
            <Scale className="w-3.5 h-3.5" />
            Terms of Service
          </div>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-white tracking-tight mb-4">
            Terms & Conditions
          </h1>
          <p className="text-neutral-400 text-sm sm:text-base max-w-2xl mx-auto">
            Please read these terms carefully before accessing or purchasing from {settings.businessName}. By placing an order, you agree to be bound by these policies.
          </p>
          <p className="text-xs text-neutral-500 mt-4">
            Governing Law: Karachi Jurisdiction, Sindh, Pakistan • Valid for online and in-store purchases at {settings.storeAddress}.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        
        {/* Critical Business Disclaimer */}
        <div className="bg-[#14120c] border border-[#D6B16D]/40 rounded-xl p-5 text-sm text-neutral-300 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-[#D6B16D] shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-[#D6B16D] block mb-1">Fashion Accessories Scope & Clarification</span>
            <p className="text-xs text-neutral-400 leading-relaxed">
              {settings.businessName} specializes exclusively in high-end fashion jewellery, premium 316L stainless steel pieces with 18K PVD coatings, precision chronometers, bridal bangles, and vegan leather handbags. We explicitly do NOT manufacture, sell, or certify precious gold bullion, gold coins, or natural earth-mined diamonds.
            </p>
          </div>
        </div>

        {/* Section 1: Acceptance & Website Usage */}
        <section className="bg-[#111] border border-[#222] rounded-2xl p-6 sm:p-8 space-y-4">
          <h2 className="text-xl font-serif font-bold text-white flex items-center gap-2">
            <span className="text-[#D6B16D]">1.</span> Website Usage & Customer Eligibility
          </h2>
          <p className="text-sm text-neutral-300 leading-relaxed">
            By visiting our website or purchasing products from {settings.businessName}, you represent that you are at least 18 years of age or accessing under the supervision of a parent or guardian. You agree to use this site for lawful personal shopping purposes only, and agree not to reproduce, duplicate, copy, or resell any portion of the service or product catalog.
          </p>
        </section>

        {/* Section 2: Product Descriptions, Specifications & Pricing */}
        <section className="bg-[#111] border border-[#222] rounded-2xl p-6 sm:p-8 space-y-4">
          <h2 className="text-xl font-serif font-bold text-white flex items-center gap-2">
            <span className="text-[#D6B16D]">2.</span> Product Descriptions & Pricing
          </h2>
          <p className="text-sm text-neutral-300 leading-relaxed">
            All prices are listed in Pakistani Rupees (PKR) and include standard applicable sales taxes. While we take meticulous care to accurately represent gemstone cuts, metal coatings, dimensions, and handbag tones in our photography, minor natural lighting variations between monitor screens may occur.
          </p>
          <p className="text-sm text-neutral-400 leading-relaxed">
            We reserve the right to modify prices, discontinue products, or correct typographical pricing errors without prior notice. In the event an item is mistakenly listed at an incorrect price, we will notify you before dispatch to confirm the correct price or cancel your order with zero penalty.
          </p>
        </section>

        {/* Section 3: Orders, Payments & Verification */}
        <section className="bg-[#111] border border-[#222] rounded-2xl p-6 sm:p-8 space-y-4">
          <h2 className="text-xl font-serif font-bold text-white flex items-center gap-2">
            <span className="text-[#D6B16D]">3.</span> Orders & Payment Terms
          </h2>
          <p className="text-sm text-neutral-300 leading-relaxed">
            Orders placed via the website are subject to availability and order confirmation. We accept:
          </p>
          <ul className="space-y-2 text-sm text-neutral-400 pl-4 list-disc">
            <li><strong className="text-neutral-200">Cash on Delivery (COD):</strong> Available across all serviced postal codes in Karachi and Pakistan. Payment must be made in full to the courier upon delivery before opening parcel seals.</li>
            <li><strong className="text-neutral-200">Direct Bank Transfer / Digital Wallets:</strong> Proof of payment (bank transfer screenshot or transaction ID) must be sent via WhatsApp to our concierge ({settings.phone}) within 24 hours of order placement.</li>
          </ul>
        </section>

        {/* Section 4: Order Cancellation */}
        <section className="bg-[#111] border border-[#222] rounded-2xl p-6 sm:p-8 space-y-4">
          <h2 className="text-xl font-serif font-bold text-white flex items-center gap-2">
            <span className="text-[#D6B16D]">4.</span> Order Cancellation Rights
          </h2>
          <p className="text-sm text-neutral-300 leading-relaxed">
            Customers may cancel standard non-custom orders free of charge by contacting customer service before the consignment has been handed over to the courier (typically within 6–12 hours of placing the order). Once an order has been dispatched with a generated tracking ID, it cannot be canceled mid-transit and must be received and processed via our standard Return & Exchange policy.
          </p>
        </section>

        {/* Section 5: Intellectual Property */}
        <section className="bg-[#111] border border-[#222] rounded-2xl p-6 sm:p-8 space-y-4">
          <h2 className="text-xl font-serif font-bold text-white flex items-center gap-2">
            <span className="text-[#D6B16D]">5.</span> Intellectual Property & Copyrights
          </h2>
          <p className="text-sm text-neutral-300 leading-relaxed">
            The {settings.businessName} trade name, boutique logos, visual graphics, custom product styling, curated photography, and website content are the exclusive intellectual property of {settings.businessName}. Any unauthorized commercial reproduction, brand impersonation, or hotlinking of our creative media is strictly prohibited under Pakistani copyright laws.
          </p>
        </section>

        {/* Section 6: Limitation of Liability & Dispute Resolution */}
        <section className="bg-[#111] border border-[#222] rounded-2xl p-6 sm:p-8 space-y-4">
          <h2 className="text-xl font-serif font-bold text-white flex items-center gap-2">
            <span className="text-[#D6B16D]">6.</span> Limitation of Liability & Disputes
          </h2>
          <p className="text-sm text-neutral-300 leading-relaxed">
            To the fullest extent permitted by law, {settings.businessName} will not be liable for indirect, incidental, or consequential damages resulting from the use or inability to use our website or products. Any legal disputes arising out of transactions shall be resolved primarily through amicable conciliation or under the jurisdiction of competent courts in Karachi, Pakistan.
          </p>
        </section>

        {/* Contact Help */}
        <div className="bg-[#111] border border-[#222] rounded-xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-semibold text-white">Questions regarding these terms?</h4>
            <p className="text-xs text-neutral-400 mt-1">Our customer concierge is available Monday to Saturday (12:00 PM – 10:00 PM PKT).</p>
          </div>
          <a
            href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-lg bg-[#D6B16D]/10 border border-[#D6B16D]/30 text-[#D6B16D] text-xs font-semibold hover:bg-[#D6B16D]/20 transition-colors shrink-0"
          >
            Chat on WhatsApp
          </a>
        </div>

      </div>
    </div>
  );
};
