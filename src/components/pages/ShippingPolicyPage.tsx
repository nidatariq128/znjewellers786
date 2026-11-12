import React from 'react';
import { Truck, MapPin, Clock, ShieldCheck, PackageCheck, AlertCircle, HelpCircle } from 'lucide-react';
import { useStoreSettings } from '../../context/StoreSettingsContext';

export const ShippingPolicyPage: React.FC = () => {
  const { settings } = useStoreSettings();

  return (
    <div className="min-h-screen bg-[#080808] text-white pt-24 pb-20">
      {/* Hero Header */}
      <div className="relative overflow-hidden border-b border-[#222] bg-gradient-to-b from-[#141414] to-[#080808]">
        <div className="absolute inset-0 bg-[radial-gradient(#D6B16D_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#D6B16D]/30 bg-[#D6B16D]/10 text-[#D6B16D] text-xs font-semibold tracking-wider uppercase mb-4">
            <Truck className="w-3.5 h-3.5" />
            Reliable Logistics
          </div>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-white tracking-tight mb-4">
            Shipping & Delivery Policy
          </h1>
          <p className="text-neutral-400 text-sm sm:text-base max-w-2xl mx-auto">
            Fast, secure, and insured doorstep delivery across Karachi and every city in Pakistan. Every parcel is safely bubble-wrapped in our luxury signature boxing.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        
        {/* Shipping Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Karachi Delivery */}
          <div className="bg-[#111] border border-[#222] hover:border-[#D6B16D]/50 transition-colors p-6 rounded-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#D6B16D]/5 rounded-bl-full pointer-events-none" />
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#D6B16D]/10 border border-[#D6B16D]/20 flex items-center justify-center text-[#D6B16D]">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-white text-lg">Karachi Metropolitan Delivery</h3>
                <p className="text-xs text-[#D6B16D]">Direct from Aman Tower Store</p>
              </div>
            </div>
            <ul className="space-y-2 text-sm text-neutral-300">
              <li className="flex items-center justify-between py-1.5 border-b border-[#1f1f1f]">
                <span className="text-neutral-400">Delivery Time:</span>
                <span className="font-semibold text-white">1 – 2 Business Days</span>
              </li>
              <li className="flex items-center justify-between py-1.5 border-b border-[#1f1f1f]">
                <span className="text-neutral-400">Standard Delivery Fee:</span>
                <span className="font-semibold text-white">PKR {settings.shippingRateKarachi.toLocaleString()}</span>
              </li>
              <li className="flex items-center justify-between py-1.5 border-b border-[#1f1f1f]">
                <span className="text-neutral-400">Free Shipping Threshold:</span>
                <span className="font-semibold text-[#D6B16D]">Orders over PKR {settings.freeShippingThreshold.toLocaleString()}</span>
              </li>
              <li className="flex items-center justify-between py-1.5">
                <span className="text-neutral-400">Payment Methods:</span>
                <span className="text-neutral-200">Cash on Delivery & Bank Transfer</span>
              </li>
            </ul>
          </div>

          {/* Nationwide Delivery */}
          <div className="bg-[#111] border border-[#222] hover:border-[#D6B16D]/50 transition-colors p-6 rounded-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#D6B16D]/5 rounded-bl-full pointer-events-none" />
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#D6B16D]/10 border border-[#D6B16D]/20 flex items-center justify-center text-[#D6B16D]">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-white text-lg">Nationwide Pakistan Delivery</h3>
                <p className="text-xs text-[#D6B16D]">Lahore, Islamabad, Rawalpindi, Peshawar, Quetta & All Cities</p>
              </div>
            </div>
            <ul className="space-y-2 text-sm text-neutral-300">
              <li className="flex items-center justify-between py-1.5 border-b border-[#1f1f1f]">
                <span className="text-neutral-400">Delivery Time:</span>
                <span className="font-semibold text-white">3 – 5 Business Days</span>
              </li>
              <li className="flex items-center justify-between py-1.5 border-b border-[#1f1f1f]">
                <span className="text-neutral-400">Standard Delivery Fee:</span>
                <span className="font-semibold text-white">PKR {settings.shippingRateNationwide.toLocaleString()}</span>
              </li>
              <li className="flex items-center justify-between py-1.5 border-b border-[#1f1f1f]">
                <span className="text-neutral-400">Free Shipping Threshold:</span>
                <span className="font-semibold text-[#D6B16D]">Orders over PKR {settings.freeShippingThreshold.toLocaleString()}</span>
              </li>
              <li className="flex items-center justify-between py-1.5">
                <span className="text-neutral-400">Courier Partners:</span>
                <span className="text-neutral-200">TCS Express, Leopards, Trax</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Order Processing Protocol */}
        <section className="bg-[#111] border border-[#222] rounded-2xl p-6 sm:p-8 space-y-4">
          <h2 className="text-xl font-serif font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-[#D6B16D]" />
            Order Processing & Verification
          </h2>
          <p className="text-sm text-neutral-300 leading-relaxed">
            All orders placed on our website undergo an automated validation and manual quality check before leaving our flagship boutique at {settings.storeAddress}:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="bg-[#0c0c0c] border border-[#1f1f1f] p-4 rounded-xl">
              <span className="text-xs font-bold text-[#D6B16D] block mb-1">Step 1: Confirmation</span>
              <p className="text-xs text-neutral-400">For new Cash on Delivery orders, our concierge will contact you via WhatsApp or phone call to verify address details.</p>
            </div>
            <div className="bg-[#0c0c0c] border border-[#1f1f1f] p-4 rounded-xl">
              <span className="text-xs font-bold text-[#D6B16D] block mb-1">Step 2: Quality Inspection</span>
              <p className="text-xs text-neutral-400">Every piece of stainless steel jewellery, watch clasp, and handbag zipper is physically tested under studio light.</p>
            </div>
            <div className="bg-[#0c0c0c] border border-[#1f1f1f] p-4 rounded-xl">
              <span className="text-xs font-bold text-[#D6B16D] block mb-1">Step 3: Tracking Generated</span>
              <p className="text-xs text-neutral-400">As soon as the parcel is booked, you receive your courier tracking consignment number via SMS / WhatsApp.</p>
            </div>
          </div>
        </section>

        {/* Tracking Your Parcel */}
        <section className="bg-[#111] border border-[#222] rounded-2xl p-6 sm:p-8 space-y-4">
          <h2 className="text-xl font-serif font-bold text-white flex items-center gap-2">
            <PackageCheck className="w-5 h-5 text-[#D6B16D]" />
            Live Shipment Tracking
          </h2>
          <p className="text-sm text-neutral-300 leading-relaxed">
            You will receive real-time dispatch updates. You can track your consignment directly through the official portals of our courier partners using your Consignment Tracking Number:
          </p>
          <div className="flex flex-wrap gap-3 pt-1">
            <span className="px-3 py-1.5 bg-[#171717] border border-[#2a2a2a] rounded-lg text-xs font-medium text-neutral-300">TCS Express Tracking</span>
            <span className="px-3 py-1.5 bg-[#171717] border border-[#2a2a2a] rounded-lg text-xs font-medium text-neutral-300">Leopards Courier Tracking</span>
            <span className="px-3 py-1.5 bg-[#171717] border border-[#2a2a2a] rounded-lg text-xs font-medium text-neutral-300">Trax Logistics Tracking</span>
          </div>
        </section>

        {/* Delayed, Damaged or Lost Shipments */}
        <section className="bg-[#111] border border-[#222] rounded-2xl p-6 sm:p-8 space-y-4">
          <h2 className="text-xl font-serif font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#D6B16D]" />
            Transit Insurance & Lost Shipments
          </h2>
          <p className="text-sm text-neutral-300 leading-relaxed">
            All shipments booked by {settings.businessName} are fully protected against loss or transit damage. If a courier fails to deliver within 7 business days or confirms a lost consignment, our dispatch department will immediately ship a replacement piece free of charge or issue a 100% refund.
          </p>
        </section>

        {/* International Shipping Inquiry */}
        <section className="bg-gradient-to-r from-[#17140e] to-[#111] border border-[#D6B16D]/30 rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-serif font-bold text-white text-lg mb-1">International Shipping Assistance</h3>
            <p className="text-xs text-neutral-400 max-w-lg">
              We ship worldwide to the UAE, UK, USA, Canada, and Saudi Arabia upon request. International shipping rates are calculated based on destination weight and DHL/FedEx courier tariff.
            </p>
          </div>
          <a
            href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}?text=Hello%20ZN%20Jewelers,%20I%20would%20like%20to%20inquire%20about%20international%20shipping.`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 rounded-lg bg-[#D6B16D] text-black font-semibold text-xs tracking-wider uppercase hover:bg-[#e4c485] transition-colors shrink-0"
          >
            Inquire Overseas
          </a>
        </section>

      </div>
    </div>
  );
};
