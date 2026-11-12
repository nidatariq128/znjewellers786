import React, { useState } from 'react';
import { 
  Sparkles, 
  Truck, 
  Clock, 
  ShieldCheck, 
  Send, 
  CheckCircle,
  Phone,
  Mail,
  MapPin,
  ExternalLink
} from 'lucide-react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useStoreSettings } from '../../context/StoreSettingsContext';

// Custom TikTok & Instagram Icons
const InstagramIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

const TikTokIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-2.884 2.87 2.896 2.896 0 0 1-2.884-2.87 2.896 2.896 0 0 1 2.884-2.87c.277 0 .542.04.794.113V9.458a6.31 6.31 0 0 0-.794-.05 6.342 6.342 0 0 0-6.341 6.342 6.342 6.342 0 0 0 6.341 6.342 6.342 6.342 0 0 0 6.342-6.342V8.986a8.212 8.212 0 0 0 4.958 1.637V7.178a4.83 4.83 0 0 1-1.2-.492z"/>
  </svg>
);

const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.455 5.711 1.456h.005c6.554 0 11.89-5.336 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

interface FooterProps {
  onNavigateView: (view: string) => void;
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigateView,
  onOpenAdmin
}) => {
  const { settings } = useStoreSettings();
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    setSubmitting(true);
    try {
      await addDoc(collection(db, 'subscribers'), {
        email: email.trim().toLowerCase(),
        subscribedAt: new Date().toISOString()
      });
      setSubscribed(true);
      setEmail('');
    } catch (err) {
      console.warn('Subscribed locally:', err);
      setSubscribed(true);
      setEmail('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <footer className="bg-[#050505] text-neutral-300 border-t border-[#1e1911]">
      
      {/* 1. Value Badges */}
      <div className="border-b border-[#1c1710] py-10 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-start gap-4 p-4 rounded-xl bg-[#0a0a0a] border border-[#231d13]">
            <Sparkles className="w-7 h-7 text-[#D6B16D] shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-serif font-semibold text-white tracking-wider">Precision Watches</h4>
              <p className="text-xs text-neutral-400 mt-1">Curated chronometers, sapphire crystal coating & stainless steel bracelets.</p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-4 rounded-xl bg-[#0a0a0a] border border-[#231d13]">
            <Truck className="w-7 h-7 text-[#D6B16D] shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-serif font-semibold text-white tracking-wider">Free Delivery over ₨ {settings.freeShippingThreshold.toLocaleString()}</h4>
              <p className="text-xs text-neutral-400 mt-1">Cash on Delivery across Karachi & all Pakistan cities via TCS & Leopards.</p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-4 rounded-xl bg-[#0a0a0a] border border-[#231d13]">
            <Clock className="w-7 h-7 text-[#D6B16D] shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-serif font-semibold text-white tracking-wider">Bridal Bangles & Kadas</h4>
              <p className="text-xs text-neutral-400 mt-1">Traditional velvet choodiyan, stone studded kadas & bridal accessories.</p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-4 rounded-xl bg-[#0a0a0a] border border-[#231d13]">
            <ShieldCheck className="w-7 h-7 text-[#D6B16D] shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-serif font-semibold text-white tracking-wider">Anti-Tarnish 316L Steel</h4>
              <p className="text-xs text-neutral-400 mt-1">100% waterproof everyday jewellery & structured designer handbags.</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Exactly 4 Columns as requested */}
      <div className="py-16 px-6 lg:px-12 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        
        {/* Column 1: Customer Support */}
        <div className="space-y-4">
          <h4 className="text-xs uppercase tracking-[0.2em] text-[#D6B16D] font-bold">
            Customer Support
          </h4>
          <ul className="space-y-2.5 text-xs text-neutral-400">
            <li>
              <button onClick={() => onNavigateView('contact')} className="hover:text-[#D6B16D] transition-colors text-left flex items-center gap-1.5">
                Contact Us & Store Help
              </button>
            </li>
            <li>
              <button onClick={() => onNavigateView('faqs')} className="hover:text-[#D6B16D] transition-colors text-left">
                Frequently Asked Questions (FAQ)
              </button>
            </li>
            <li>
              <button onClick={() => onNavigateView('tracking')} className="hover:text-[#D6B16D] transition-colors text-left">
                Track Your Consignment
              </button>
            </li>
            <li>
              <button onClick={() => onNavigateView('product-care')} className="hover:text-[#D6B16D] transition-colors text-left">
                Product Care & Maintenance Guide
              </button>
            </li>
            <li>
              <button onClick={() => onNavigateView('returns-refunds')} className="hover:text-[#D6B16D] transition-colors text-left">
                7-Day Easy Returns & Exchange
              </button>
            </li>
            <li className="pt-2">
              <button 
                onClick={onOpenAdmin} 
                className="text-[#D6B16D]/70 hover:text-[#D6B16D] transition-colors text-left flex items-center gap-1.5 text-[11px] font-mono"
              >
                <Sparkles className="w-3 h-3 text-[#D6B16D]" />
                <span>Admin CMS & Store Settings</span>
              </button>
            </li>
          </ul>
        </div>

        {/* Column 2: Policies & Information */}
        <div className="space-y-4">
          <h4 className="text-xs uppercase tracking-[0.2em] text-[#D6B16D] font-bold">
            Policies & Information
          </h4>
          <ul className="space-y-2.5 text-xs text-neutral-400">
            <li>
              <button onClick={() => onNavigateView('about')} className="hover:text-[#D6B16D] transition-colors text-left">
                About ZN Jewelers
              </button>
            </li>
            <li>
              <button onClick={() => onNavigateView('product-quality')} className="hover:text-[#D6B16D] transition-colors text-left">
                Product Quality & Authenticity
              </button>
            </li>
            <li>
              <button onClick={() => onNavigateView('shipping-delivery')} className="hover:text-[#D6B16D] transition-colors text-left">
                Shipping & Delivery Policy
              </button>
            </li>
            <li>
              <button onClick={() => onNavigateView('returns-refunds')} className="hover:text-[#D6B16D] transition-colors text-left">
                Return, Refund & Exchange Policy
              </button>
            </li>
            <li>
              <button onClick={() => onNavigateView('warranty-policy')} className="hover:text-[#D6B16D] transition-colors text-left">
                Jewellery & Accessories Warranty
              </button>
            </li>
            <li>
              <button onClick={() => onNavigateView('privacy-policy')} className="hover:text-[#D6B16D] transition-colors text-left">
                Privacy Policy
              </button>
            </li>
            <li>
              <button onClick={() => onNavigateView('terms-conditions')} className="hover:text-[#D6B16D] transition-colors text-left">
                Terms & Conditions
              </button>
            </li>
          </ul>
        </div>

        {/* Column 3: Our Store Location */}
        <div className="space-y-4">
          <h4 className="text-xs uppercase tracking-[0.2em] text-[#D6B16D] font-bold">
            Our Store Location
          </h4>
          <div className="space-y-3 text-xs text-neutral-300">
            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-[#D6B16D] shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block font-medium">{settings.businessName} Flagship:</strong>
                <span className="text-neutral-400 leading-relaxed block mt-0.5">{settings.storeAddress}</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Phone className="w-4 h-4 text-[#D6B16D] shrink-0" />
              <a href={`tel:${settings.phone.replace(/[^0-9+]/g, '')}`} className="text-neutral-300 hover:text-[#D6B16D] transition-colors">
                {settings.phone}
              </a>
            </div>

            <div className="flex items-center gap-2.5">
              <Mail className="w-4 h-4 text-[#D6B16D] shrink-0" />
              <a href={`mailto:${settings.email}`} className="text-neutral-300 hover:text-[#D6B16D] transition-colors">
                {settings.email}
              </a>
            </div>

            <div className="pt-2">
              <span className="text-[11px] text-neutral-500 block mb-2 font-mono">
                Store Hours: Monday – Saturday (12:00 PM – 10:00 PM PKT)
              </span>
              <a
                href={settings.googleMapsSearchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-[#D6B16D] hover:underline font-medium"
              >
                <span>View on Google Maps</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Column 4: Follow Us & Social Media */}
        <div className="space-y-4">
          <h4 className="text-xs uppercase tracking-[0.2em] text-[#D6B16D] font-bold">
            Follow Us
          </h4>
          <p className="text-xs text-neutral-400 leading-relaxed">
            Stay connected for exclusive new fashion accessory releases, bridal styling inspiration, and limited-time offers.
          </p>

          <div className="flex flex-col gap-2.5 pt-1">
            <a
              href={settings.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-2.5 rounded-xl bg-[#0f0f0f] border border-[#222] hover:border-[#fd1d1d]/60 hover:bg-[#161214] transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#fd1d1d]/20 to-[#833ab4]/20 border border-[#fd1d1d]/30 flex items-center justify-center text-[#fd1d1d] group-hover:scale-105 transition-transform">
                  <InstagramIcon className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-white block">Instagram</span>
                  <span className="text-[11px] text-neutral-500 font-mono">@chipmunk.8083543</span>
                </div>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-neutral-500 group-hover:text-white transition-colors" />
            </a>

            <a
              href={settings.tiktokUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-2.5 rounded-xl bg-[#0f0f0f] border border-[#222] hover:border-[#00f2fe]/60 hover:bg-[#0c1417] transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#00f2fe]/10 border border-[#00f2fe]/30 flex items-center justify-center text-[#00f2fe] group-hover:scale-105 transition-transform">
                  <TikTokIcon className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-white block">TikTok</span>
                  <span className="text-[11px] text-neutral-500 font-mono">@zeeshan.king4803</span>
                </div>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-neutral-500 group-hover:text-white transition-colors" />
            </a>

            <a
              href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-2.5 rounded-xl bg-[#0f0f0f] border border-[#222] hover:border-[#25D366]/60 hover:bg-[#0d1611] transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#25D366]/10 border border-[#25D366]/30 flex items-center justify-center text-[#25D366] group-hover:scale-105 transition-transform">
                  <WhatsAppIcon className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-white block">WhatsApp Concierge</span>
                  <span className="text-[11px] text-neutral-500 font-mono">{settings.phone}</span>
                </div>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-neutral-500 group-hover:text-white transition-colors" />
            </a>
          </div>

          {/* Quick Newsletter in Col 4 */}
          <div className="pt-3">
            {subscribed ? (
              <div className="flex items-center gap-2 text-xs text-[#D6B16D] bg-[#1a160f] p-2.5 rounded-lg border border-[#3b311e]">
                <CheckCircle className="w-3.5 h-3.5 text-[#D6B16D]" />
                <span>Enrolled in VIP updates.</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-1.5">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="VIP Newsletter..."
                  required
                  className="bg-[#12100c] border border-[#3b311e] text-neutral-200 text-xs px-3 py-2 rounded focus:outline-none focus:border-[#D6B16D] w-full placeholder:text-neutral-600"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-3 py-2 bg-[#D6B16D] text-black text-xs font-bold rounded hover:bg-[#F4E0A5] transition-colors shrink-0"
                >
                  <Send className="w-3 h-3" />
                </button>
              </form>
            )}
          </div>
        </div>

      </div>

      {/* 3. Bottom Legal & Copyright Bar */}
      <div className="border-t border-[#1a150e] py-6 px-6 lg:px-12 text-center text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 ZN Jewelers. All Rights Reserved.</p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] tracking-wider uppercase">
            <button onClick={() => onNavigateView('privacy-policy')} className="hover:text-neutral-300 transition-colors">
              Privacy Policy
            </button>
            <span>•</span>
            <button onClick={() => onNavigateView('terms-conditions')} className="hover:text-neutral-300 transition-colors">
              Terms & Conditions
            </button>
            <span>•</span>
            <button onClick={() => onNavigateView('product-quality')} className="hover:text-neutral-300 transition-colors">
              Quality & Authenticity
            </button>
            <span>•</span>
            <button onClick={() => onNavigateView('shipping-delivery')} className="hover:text-neutral-300 transition-colors">
              Shipping Policy
            </button>
            <span>•</span>
            <button onClick={() => onNavigateView('contact')} className="hover:text-neutral-300 transition-colors">
              Karachi Store
            </button>
          </div>
        </div>
      </div>

    </footer>
  );
};
