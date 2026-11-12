import React, { useState } from 'react';
import { ChevronDown, Sparkles, HelpCircle, MessageSquare, Phone } from 'lucide-react';
import { useStoreSettings } from '../../context/StoreSettingsContext';

interface FaqPageProps {
  onNavigateContact?: () => void;
  onNavigateTracking?: () => void;
}

interface FaqItem {
  question: string;
  answer: string | React.ReactNode;
  category: 'Orders & Payments' | 'Products & Quality' | 'Shipping & Returns' | 'Store & Social';
}

export const FaqPage: React.FC<FaqPageProps> = ({ onNavigateContact, onNavigateTracking }) => {
  const { settings } = useStoreSettings();
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('all');

  const faqs: FaqItem[] = [
    {
      category: 'Orders & Payments',
      question: '1. How can I place an order?',
      answer: 'Placing an order with ZN Jewelers is simple and seamless. Browse through our collections, select your desired piece (and preferred ring or bangle size if applicable), and click "Add to Bag" or "Instant Buy Now". Proceed to checkout, enter your shipping details, select your payment method (such as Cash on Delivery or Online Bank Transfer), and confirm your order. You will receive an instant order number and SMS/email confirmation.'
    },
    {
      category: 'Orders & Payments',
      question: '2. What payment methods are accepted?',
      answer: 'We provide multiple secure and flexible payment options across Pakistan: Cash on Delivery (COD), Online Direct Bank Transfer (Meezan, HBL, Bank Alfalah), JazzCash, and EasyPaisa mobile account transfers. All online payment transfer details are provided clearly during checkout and in your order confirmation.'
    },
    {
      category: 'Products & Quality',
      question: '3. Are your bracelets made of stainless steel?',
      answer: 'Yes! Our modern bracelets, herringbone snake chains, Roman numeral bangles, and pendants are crafted from premium surgical-grade 316L stainless steel finished with advanced 18K PVD (Physical Vapor Deposition) gold coating. This makes them 100% waterproof, sweatproof, hypoallergenic, and resistant to everyday tarnishing.'
    },
    {
      category: 'Products & Quality',
      question: '4. How can I care for my jewellery?',
      answer: 'To preserve the lasting luster of your pieces: store them in individual velvet pouches or dry compartments; avoid direct contact with harsh alcohol-based perfumes, hairsprays, or bleaching chemicals; and gently wipe with a soft lint-free microfiber cloth after wear. Traditional bridal velvet choodiyan and Kundan kadas should be kept moisture-free.'
    },
    {
      category: 'Products & Quality',
      question: '5. Are watches covered by warranty?',
      answer: 'Yes, our precision luxury watches include complimentary movement and battery support. Please inspect the watch upon delivery; any manufacturing defect reported within 7 days qualifies for immediate repair or replacement under our store warranty policy.'
    },
    {
      category: 'Shipping & Returns',
      question: '6. How long does delivery take?',
      answer: `Delivery within Karachi takes approximately ${settings.deliveryTimeKarachi}. Nationwide courier shipping across major Pakistan cities (Lahore, Islamabad, Rawalpindi, Faisalabad, Multan, Peshawar, Quetta, etc.) takes ${settings.deliveryTimeNationwide} via reputable courier partners (TCS, Leopards, CallCourier). Orders exceeding ₨ ${settings.shippingThreshold.toLocaleString()} qualify for Free Complimentary Courier Delivery.`
    },
    {
      category: 'Shipping & Returns',
      question: '7. Can I return or exchange products?',
      answer: 'Yes! We offer a hassle-free 7-day checking and exchange policy. If an item arrives damaged or you need a different bangle or ring size, contact our concierge on WhatsApp within 7 days of receiving the parcel. Products must be unworn, undamaged, with original tags and luxury velvet box packaging intact.'
    },
    {
      category: 'Shipping & Returns',
      question: '8. Do you offer international shipping?',
      answer: 'Currently, our primary courier logistics operate across all cities, towns, and villages throughout Pakistan. For special overseas Pakistani wedding and bridal orders, please contact our concierge directly via WhatsApp to arrange private international courier quotes via DHL or FedEx.'
    },
    {
      category: 'Store & Social',
      question: '9. How can I contact customer support?',
      answer: (
        <span>
          You can reach our dedicated Karachi concierge via phone/WhatsApp at{' '}
          <strong className="text-[#D6B16D]">{settings.phone}</strong> or by email at{' '}
          <strong className="text-[#D6B16D]">{settings.email}</strong>. Our team is available Monday through Saturday from 12:00 PM to 10:00 PM (PKT).
        </span>
      )
    },
    {
      category: 'Store & Social',
      question: '10. How can I find your physical store?',
      answer: (
        <span>
          Our flagship store is located at: <strong className="text-white">{settings.storeAddress}</strong>. We are on the Ground Floor inside the Aman Tower commercial complex at the Korangi Crossing junction in Karachi. You can view interactive maps and get driving directions on our Contact page.
        </span>
      )
    },
    {
      category: 'Store & Social',
      question: '11. Do you have Instagram and TikTok accounts?',
      answer: (
        <span>
          Yes! Follow our verified social channels for new collection drops, fashion styling reels, and customer unboxings. Visit our official Instagram at{' '}
          <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" className="text-[#D6B16D] underline">
            @znjewelers
          </a>{' '}
          and our TikTok account at{' '}
          <a href={settings.tiktokUrl} target="_blank" rel="noopener noreferrer" className="text-[#D6B16D] underline">
            @znjewelers
          </a>.
        </span>
      )
    },
    {
      category: 'Orders & Payments',
      question: '12. How can I track my order?',
      answer: (
        <span>
          As soon as your parcel is dispatched, you receive a courier tracking number via SMS and email. You can also visit our{' '}
          <button onClick={onNavigateTracking} className="text-[#D6B16D] underline font-medium">
            Order Tracking Portal
          </button>{' '}
          at any time and enter your Order Number (e.g., ZN-2026-XXXXX) along with your mobile number to view live courier status updates.
        </span>
      )
    }
  ];

  const filteredFaqs = activeCategoryFilter === 'all' 
    ? faqs 
    : faqs.filter(f => f.category === activeCategoryFilter);

  const toggleAccordion = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <div className="min-h-screen bg-[#080808] text-white py-16 px-6 lg:px-12">
      <div className="max-w-4xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#18130a] border border-[#3d311c] text-[10px] uppercase tracking-[0.25em] text-[#D6B16D]">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Frequently Asked Questions</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-white tracking-wide">
            Help & <span className="gold-gradient-text italic font-serif">Customer Concierge</span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 font-light max-w-xl mx-auto leading-relaxed">
            Find answers to commonly asked questions about our fashion jewellery, store location, ordering process, delivery times, and product care.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          {['all', 'Orders & Payments', 'Products & Quality', 'Shipping & Returns', 'Store & Social'].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategoryFilter(cat)}
              className={`px-4 py-2 rounded-full text-xs font-medium uppercase tracking-wider transition-all cursor-pointer ${
                activeCategoryFilter === cat
                  ? 'bg-[#D6B16D] text-black shadow-lg shadow-[#D6B16D]/20 font-semibold'
                  : 'bg-[#120f0a] text-neutral-400 border border-[#2b2214] hover:text-white hover:border-[#D6B16D]'
              }`}
            >
              {cat === 'all' ? 'All Questions' : cat}
            </button>
          ))}
        </div>

        {/* Accordions */}
        <div className="space-y-3">
          {filteredFaqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={faq.question}
                className="rounded-xl border border-[#261f13] bg-[#0c0a07] overflow-hidden transition-all duration-300"
              >
                <button
                  onClick={() => toggleAccordion(idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 hover:bg-[#120f09] transition-colors cursor-pointer"
                >
                  <span className="text-sm sm:text-base font-serif font-medium text-white">
                    {faq.question}
                  </span>
                  <div className={`p-1.5 rounded-full border border-[#3b301a] shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 bg-[#D6B16D] text-black' : 'text-[#D6B16D]'}`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-neutral-300 font-light leading-relaxed border-t border-[#1a140d]/80 animate-fadeIn">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Still Have Questions? Banner */}
        <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-[#141009] via-[#0d0b07] to-[#141009] border border-[#3b2f1b] shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
          <div className="space-y-1">
            <h3 className="text-lg font-serif font-semibold text-white">
              Still Have Questions?
            </h3>
            <p className="text-xs text-neutral-400 max-w-md">
              Our customer concierge is available at Shop No. 47, Aman Tower, Karachi to assist you via WhatsApp or phone.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={onNavigateContact}
              className="px-6 py-2.5 bg-[#D6B16D] text-black text-xs font-semibold uppercase tracking-wider rounded-lg hover:bg-[#F4E0A5] transition-all"
            >
              Contact Us
            </button>
            <a
              href={settings.whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 bg-[#17130c] border border-[#3d2f17] text-[#D6B16D] text-xs font-medium uppercase tracking-wider rounded-lg hover:border-[#D6B16D] transition-all"
            >
              WhatsApp Us
            </a>
          </div>
        </div>

      </div>
    </div>
  );
};
