import React from 'react';
import { Shield, Lock, Eye, FileText, CheckCircle2, UserCheck, Mail, Database } from 'lucide-react';
import { useStoreSettings } from '../../context/StoreSettingsContext';

export const PrivacyPolicyPage: React.FC = () => {
  const { settings } = useStoreSettings();

  return (
    <div className="min-h-screen bg-[#080808] text-white pt-24 pb-20">
      {/* Hero Header */}
      <div className="relative overflow-hidden border-b border-[#222] bg-gradient-to-b from-[#141414] to-[#080808]">
        <div className="absolute inset-0 bg-[radial-gradient(#D6B16D_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#D6B16D]/30 bg-[#D6B16D]/10 text-[#D6B16D] text-xs font-semibold tracking-wider uppercase mb-4">
            <Shield className="w-3.5 h-3.5" />
            Legal & Trust
          </div>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-white tracking-tight mb-4">
            Privacy Policy
          </h1>
          <p className="text-neutral-400 text-sm sm:text-base max-w-2xl mx-auto">
            Your trust is our paramount commitment. Learn how {settings.businessName} collects, protects, and respects your personal information.
          </p>
          <p className="text-xs text-neutral-500 mt-4">
            Last Updated: February 2026 • Effective for all orders placed at {settings.storeAddress} and online.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        {/* Key Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-[#111] border border-[#222] p-5 rounded-xl">
            <Lock className="w-6 h-6 text-[#D6B16D] mb-3" />
            <h3 className="text-sm font-semibold text-white mb-1">Encrypted Security</h3>
            <p className="text-xs text-neutral-400">All customer credentials and order transmissions are secured via end-to-end SSL protocols.</p>
          </div>
          <div className="bg-[#111] border border-[#222] p-5 rounded-xl">
            <Eye className="w-6 h-6 text-[#D6B16D] mb-3" />
            <h3 className="text-sm font-semibold text-white mb-1">Zero Third-Party Selling</h3>
            <p className="text-xs text-neutral-400">We never rent, trade, or monetize your contact details with external advertising brokers.</p>
          </div>
          <div className="bg-[#111] border border-[#222] p-5 rounded-xl">
            <UserCheck className="w-6 h-6 text-[#D6B16D] mb-3" />
            <h3 className="text-sm font-semibold text-white mb-1">Total Data Control</h3>
            <p className="text-xs text-neutral-400">Request complete deletion, modification, or an export of your order history anytime.</p>
          </div>
        </div>

        {/* Section 1: Customer Information Collection */}
        <section className="bg-[#111] border border-[#222] rounded-2xl p-6 sm:p-8 space-y-4">
          <h2 className="text-xl font-serif font-bold text-white flex items-center gap-2">
            <span className="text-[#D6B16D]">1.</span> Customer Information We Collect
          </h2>
          <p className="text-sm text-neutral-300 leading-relaxed">
            When you browse our online boutique, place an order for fashion accessories, or contact our concierge, we collect information necessary to fulfill your request:
          </p>
          <ul className="space-y-2 text-sm text-neutral-400 pl-4 list-disc">
            <li><strong className="text-neutral-200">Contact Details:</strong> Your full name, delivery address across Pakistan, email address, and active mobile/WhatsApp contact number.</li>
            <li><strong className="text-neutral-200">Order Transactions:</strong> Products purchased (stainless steel jewellery, watches, bangles, handbags), invoice totals in Pakistani Rupees (PKR), and order status.</li>
            <li><strong className="text-neutral-200">Direct Inquiries:</strong> Messages, customer care queries, and custom requests submitted through our contact form, direct email, or official WhatsApp concierge.</li>
            <li><strong className="text-neutral-200">Device & Usage Analytics:</strong> IP address, device type, browser environment, and anonymized interaction data to optimize website performance.</li>
          </ul>
        </section>

        {/* Section 2: Personal Data Protection & Purpose */}
        <section className="bg-[#111] border border-[#222] rounded-2xl p-6 sm:p-8 space-y-4">
          <h2 className="text-xl font-serif font-bold text-white flex items-center gap-2">
            <span className="text-[#D6B16D]">2.</span> How We Use Your Data
          </h2>
          <p className="text-sm text-neutral-300 leading-relaxed">
            We collect and process your personal data solely for legitimate boutique operational purposes:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-neutral-400">
            <div className="flex items-start gap-2 bg-[#0c0c0c] p-3 rounded-lg border border-[#1f1f1f]">
              <CheckCircle2 className="w-4 h-4 text-[#D6B16D] shrink-0 mt-0.5" />
              <span>Packaging & dispatching orders to your doorstep via recognized couriers (TCS, Leopards, Trax).</span>
            </div>
            <div className="flex items-start gap-2 bg-[#0c0c0c] p-3 rounded-lg border border-[#1f1f1f]">
              <CheckCircle2 className="w-4 h-4 text-[#D6B16D] shrink-0 mt-0.5" />
              <span>Sending SMS and WhatsApp shipping updates, tracking consignment codes, and delivery confirmation.</span>
            </div>
            <div className="flex items-start gap-2 bg-[#0c0c0c] p-3 rounded-lg border border-[#1f1f1f]">
              <CheckCircle2 className="w-4 h-4 text-[#D6B16D] shrink-0 mt-0.5" />
              <span>Facilitating size exchanges, warranty claims, and prompt customer concierge support.</span>
            </div>
            <div className="flex items-start gap-2 bg-[#0c0c0c] p-3 rounded-lg border border-[#1f1f1f]">
              <CheckCircle2 className="w-4 h-4 text-[#D6B16D] shrink-0 mt-0.5" />
              <span>Protecting our store and customers against fraudulent purchases or unauthorized chargebacks.</span>
            </div>
          </div>
        </section>

        {/* Section 3: Payment Information Privacy */}
        <section className="bg-[#111] border border-[#222] rounded-2xl p-6 sm:p-8 space-y-4">
          <h2 className="text-xl font-serif font-bold text-white flex items-center gap-2">
            <span className="text-[#D6B16D]">3.</span> Payment Information Privacy
          </h2>
          <p className="text-sm text-neutral-300 leading-relaxed">
            For Cash on Delivery (COD) transactions, no banking or financial card details are requested or stored online. You pay the authorized courier executive upon physical receipt of your parcel.
          </p>
          <p className="text-sm text-neutral-400 leading-relaxed">
            For direct bank transfer payments, transaction receipts or reference numbers provided by customers are audited solely for payment verification and archived in secure, restricted-access billing records. {settings.businessName} never stores customer debit/credit card numbers or CVV codes on our servers.
          </p>
        </section>

        {/* Section 4: Cookies & Tracking Technologies */}
        <section className="bg-[#111] border border-[#222] rounded-2xl p-6 sm:p-8 space-y-4">
          <h2 className="text-xl font-serif font-bold text-white flex items-center gap-2">
            <span className="text-[#D6B16D]">4.</span> Cookies and Tracking
          </h2>
          <p className="text-sm text-neutral-300 leading-relaxed">
            We utilize essential session cookies and local storage to remember your shopping cart items, selected currency preferences, and wishlisted pieces during your visit. You may disable cookies in your browser settings; however, certain essential shopping features, such as preserving your shopping bag between pages, may be impaired.
          </p>
        </section>

        {/* Section 5: Third-Party Service Providers */}
        <section className="bg-[#111] border border-[#222] rounded-2xl p-6 sm:p-8 space-y-4">
          <h2 className="text-xl font-serif font-bold text-white flex items-center gap-2">
            <span className="text-[#D6B16D]">5.</span> Trusted Third-Party Services
          </h2>
          <p className="text-sm text-neutral-300 leading-relaxed">
            We only share strictly required shipping information (recipient name, telephone, delivery address, order value for COD) with authorized logistics partners:
          </p>
          <ul className="space-y-1.5 text-sm text-neutral-400 pl-4 list-disc">
            <li>Domestic courier services (TCS Express, Leopards Courier, Trax Logistics) for reliable Pakistan-wide deliveries.</li>
            <li>Google Cloud / Firebase database infrastructure for encrypted, resilient cloud hosting.</li>
            <li>Google Maps Platform for displaying our verified store location at Aman Tower, Korangi Crossing, Karachi.</li>
          </ul>
        </section>

        {/* Section 6: Data Storage, Security & Rights */}
        <section className="bg-[#111] border border-[#222] rounded-2xl p-6 sm:p-8 space-y-4">
          <h2 className="text-xl font-serif font-bold text-white flex items-center gap-2">
            <span className="text-[#D6B16D]">6.</span> Customer Data Rights & Retention
          </h2>
          <p className="text-sm text-neutral-300 leading-relaxed">
            Under applicable digital privacy principles, you hold the right to:
          </p>
          <ul className="space-y-2 text-sm text-neutral-400 pl-4 list-disc">
            <li>Request a copy of the personal information we hold in our customer records.</li>
            <li>Update or correct inaccurate shipping addresses and phone numbers.</li>
            <li>Request permanent removal of your contact information from our marketing or inquiry lists.</li>
          </ul>
        </section>

        {/* Section 7: Contact Our Privacy Officer */}
        <section className="bg-gradient-to-r from-[#17140e] to-[#111] border border-[#D6B16D]/30 rounded-2xl p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-serif font-bold text-white mb-1">Have a Privacy Question?</h3>
              <p className="text-xs text-neutral-400 max-w-md">
                Reach out directly to our compliance officer at {settings.email} or visit our retail store at {settings.storeAddress}.
              </p>
            </div>
            <a
              href={`mailto:${settings.email}?subject=Privacy%20Inquiry%20-%20ZN%20Jewelers`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#D6B16D] text-black font-semibold text-xs tracking-wider uppercase hover:bg-[#e4c485] transition-colors shrink-0"
            >
              <Mail className="w-4 h-4" />
              Contact Privacy Desk
            </a>
          </div>
        </section>
      </div>
    </div>
  );
};
