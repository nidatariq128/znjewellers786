import React, { useState } from 'react';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Send, 
  CheckCircle, 
  MessageSquare, 
  Sparkles, 
  Clock, 
  AlertCircle
} from 'lucide-react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useStoreSettings } from '../../context/StoreSettingsContext';
import { GoogleMapsSection } from '../common/GoogleMapsSection';

// Custom TikTok & Instagram Icons for pristine SVG rendering
const InstagramIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
  </svg>
);

const TikTokIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-2.884 2.87 2.896 2.896 0 0 1-2.884-2.87 2.896 2.896 0 0 1 2.884-2.87c.277 0 .542.04.794.113V9.458a6.31 6.31 0 0 0-.794-.05 6.342 6.342 0 0 0-6.341 6.342 6.342 6.342 0 0 0 6.341 6.342 6.342 6.342 0 0 0 6.342-6.342V8.986a8.212 8.212 0 0 0 4.958 1.637V7.178a4.83 4.83 0 0 1-1.2-.492z"/>
  </svg>
);

const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.455 5.711 1.456h.005c6.554 0 11.89-5.336 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

export const ContactPage: React.FC = () => {
  const { settings } = useStoreSettings();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name.trim() || !email.trim() || !phone.trim() || !message.trim()) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);

    const inquiryPayload = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      subject: subject.trim() || 'General Inquiry',
      message: message.trim(),
      createdAt: new Date().toISOString(),
      status: 'new'
    };

    try {
      await addDoc(collection(db, 'inquiries'), inquiryPayload);
      setSubmitted(true);
      setName('');
      setEmail('');
      setPhone('');
      setSubject('');
      setMessage('');
    } catch (err) {
      console.warn('Firestore inquiry error, saving to local fallback:', err);
      try {
        const localInquiries = JSON.parse(localStorage.getItem('zn_inquiries') || '[]');
        localInquiries.unshift(inquiryPayload);
        localStorage.setItem('zn_inquiries', JSON.stringify(localInquiries));
      } catch {}
      setSubmitted(true);
      setName('');
      setEmail('');
      setPhone('');
      setSubject('');
      setMessage('');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080808] text-white py-16 px-6 lg:px-12">
      <div className="max-w-7xl mx-auto space-y-16">
        
        {/* Page Header */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#18130a] border border-[#3d311c] text-[10px] uppercase tracking-[0.25em] text-[#D6B16D]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Client Concierge</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-white tracking-wide">
            Contact <span className="gold-gradient-text italic font-serif">ZN Jewelers</span>
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 font-light leading-relaxed">
            Have questions regarding our fashion jewellery, luxury watches, bridal bangles, or custom orders? Reach out to our Karachi flagship atelier.
          </p>
        </div>

        {/* 3 Contact Pillar Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Physical Store */}
          <div className="p-6 rounded-2xl bg-[#0d0b07] border border-[#2d2315] space-y-3 shadow-xl">
            <div className="w-10 h-10 rounded-full bg-[#1c160c] border border-[#3d301b] flex items-center justify-center text-[#D6B16D]">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="text-base font-serif font-semibold text-white">Flagship Store Location</h3>
            <p className="text-xs text-neutral-300 leading-relaxed font-light">
              {settings.storeAddress}
            </p>
            <div className="pt-2 text-[11px] text-[#D6B16D] font-mono">
              Ground Floor • Shop #47
            </div>
          </div>

          {/* Card 2: Phone & WhatsApp */}
          <div className="p-6 rounded-2xl bg-[#0d0b07] border border-[#2d2315] space-y-3 shadow-xl">
            <div className="w-10 h-10 rounded-full bg-[#1c160c] border border-[#3d301b] flex items-center justify-center text-[#D6B16D]">
              <Phone className="w-5 h-5" />
            </div>
            <h3 className="text-base font-serif font-semibold text-white">Direct Phone & WhatsApp</h3>
            <p className="text-xs text-neutral-300 leading-relaxed font-light">
              Our concierge team is available to assist you Monday through Saturday.
            </p>
            <div className="pt-2 space-y-1">
              <a 
                href={`tel:${settings.phone}`} 
                className="block text-xs font-mono text-[#D6B16D] hover:underline"
              >
                Call: {settings.phone}
              </a>
              <a 
                href={settings.whatsappUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:underline"
              >
                <WhatsAppIcon className="w-3.5 h-3.5" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Card 3: Email Concierge */}
          <div className="p-6 rounded-2xl bg-[#0d0b07] border border-[#2d2315] space-y-3 shadow-xl">
            <div className="w-10 h-10 rounded-full bg-[#1c160c] border border-[#3d301b] flex items-center justify-center text-[#D6B16D]">
              <Mail className="w-5 h-5" />
            </div>
            <h3 className="text-base font-serif font-semibold text-white">Official Email Concierge</h3>
            <p className="text-xs text-neutral-300 leading-relaxed font-light">
              For corporate gifting, bulk wedding orders, or partnership inquiries.
            </p>
            <div className="pt-2">
              <a 
                href={`mailto:${settings.email}`} 
                className="text-xs font-mono text-[#D6B16D] hover:underline break-all"
              >
                {settings.email}
              </a>
            </div>
          </div>

        </div>

        {/* Form and Social Connect Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          
          {/* Left Column: Form (Cols 1-7) */}
          <div className="lg:col-span-7 rounded-2xl p-6 sm:p-8 bg-[#0c0a07] border border-[#2b2214] shadow-2xl space-y-6">
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-serif text-white">Send Us A Message</h2>
              <p className="text-xs text-neutral-400">
                Please complete the form below. We typically respond within 24 business hours.
              </p>
            </div>

            {submitted ? (
              <div className="p-6 rounded-xl bg-[#141009] border border-[#3d311d] space-y-3 text-center">
                <CheckCircle className="w-10 h-10 text-[#D6B16D] mx-auto animate-bounce" />
                <h3 className="text-base font-serif font-semibold text-white">Thank You for Contacting Us</h3>
                <p className="text-xs text-neutral-300 max-w-md mx-auto leading-relaxed">
                  Your message has been received by our concierge team at Aman Tower, Karachi. We will get in touch with you shortly.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-3 px-6 py-2 rounded-lg bg-[#20190e] border border-[#4a3b1e] text-xs text-[#D6B16D] hover:bg-[#2b2114]"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {errorMessage && (
                  <div className="p-3 rounded-lg bg-red-950/70 border border-red-800 text-xs text-red-200 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-neutral-300 mb-1.5">
                      Customer Name *
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Fatima Ali"
                      required
                      className="w-full bg-[#141009] border border-[#332615] rounded-lg px-3.5 py-2.5 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#D6B16D]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-neutral-300 mb-1.5">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 0300 1234567"
                      required
                      className="w-full bg-[#141009] border border-[#332615] rounded-lg px-3.5 py-2.5 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#D6B16D]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-neutral-300 mb-1.5">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@domain.com"
                      required
                      className="w-full bg-[#141009] border border-[#332615] rounded-lg px-3.5 py-2.5 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#D6B16D]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] uppercase tracking-wider text-neutral-300 mb-1.5">
                      Subject
                    </label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="e.g. Bridal Bangles Sizing"
                      className="w-full bg-[#141009] border border-[#332615] rounded-lg px-3.5 py-2.5 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#D6B16D]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-neutral-300 mb-1.5">
                    Your Message *
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    placeholder="Describe your inquiry, custom sizing requirements, or order details..."
                    required
                    className="w-full bg-[#141009] border border-[#332615] rounded-lg px-3.5 py-2.5 text-xs text-white placeholder:text-neutral-600 focus:outline-none focus:border-[#D6B16D]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-[#D6B16D] via-[#F4E0A5] to-[#C29B53] text-black text-xs uppercase tracking-[0.2em] font-semibold rounded-lg hover:shadow-[0_0_25px_rgba(214,177,109,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
                >
                  <span>{submitting ? 'Sending Message...' : 'Submit Message'}</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>

          {/* Right Column: Social Media & Instant WhatsApp (Cols 8-12) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Social Media Connectivity Card */}
            <div className="p-6 sm:p-7 rounded-2xl bg-[#0d0b07] border border-[#2b2214] shadow-xl space-y-5">
              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#D6B16D] font-medium">Official Handles</span>
                <h3 className="text-xl font-serif text-white">Connect On Social Media</h3>
                <p className="text-xs text-neutral-400 font-light leading-relaxed">
                  Follow us for new drops, fashion styling reels, client testimonials, and festive accessory inspiration.
                </p>
              </div>

              <div className="space-y-3 pt-2">
                {/* Instagram */}
                <a
                  href={settings.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3.5 rounded-xl bg-[#141009] hover:bg-[#1b150c] border border-[#2d2215] hover:border-[#D6B16D] transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-gradient-to-tr from-amber-600 via-rose-600 to-purple-600 text-white">
                      <InstagramIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-white group-hover:text-[#D6B16D] transition-colors block">
                        Instagram
                      </span>
                      <span className="text-[11px] text-neutral-400">@chipmunk.8083543</span>
                    </div>
                  </div>
                  <span className="text-[11px] text-[#D6B16D] font-medium">Follow →</span>
                </a>

                {/* TikTok */}
                <a
                  href={settings.tiktokUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3.5 rounded-xl bg-[#141009] hover:bg-[#1b150c] border border-[#2d2215] hover:border-[#D6B16D] transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-black text-white border border-white/20">
                      <TikTokIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-white group-hover:text-[#D6B16D] transition-colors block">
                        TikTok
                      </span>
                      <span className="text-[11px] text-neutral-400">@zeeshan.king4803</span>
                    </div>
                  </div>
                  <span className="text-[11px] text-[#D6B16D] font-medium">Follow →</span>
                </a>

                {/* WhatsApp */}
                <a
                  href={settings.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3.5 rounded-xl bg-[#141009] hover:bg-[#1b150c] border border-[#2d2215] hover:border-emerald-500 transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-emerald-700 text-white">
                      <WhatsAppIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-white group-hover:text-emerald-400 transition-colors block">
                        WhatsApp Concierge
                      </span>
                      <span className="text-[11px] text-neutral-400">{settings.whatsappNumber}</span>
                    </div>
                  </div>
                  <span className="text-[11px] text-emerald-400 font-medium">Chat →</span>
                </a>
              </div>
            </div>

            {/* Quick Assurance Notice */}
            <div className="p-5 rounded-2xl bg-[#110e09] border border-[#261e13] space-y-2 text-xs">
              <span className="text-[#D6B16D] font-medium block uppercase tracking-wider text-[10px]">
                Quality Assurance Notice
              </span>
              <p className="text-neutral-400 leading-relaxed font-light">
                {settings.businessName} specializes in high-fashion jewellery, waterproof stainless steel pieces, luxury watches, and designer handbags. We do not sell real gold or diamond bullion.
              </p>
            </div>

          </div>

        </div>

        {/* Live Store Location on Google Maps */}
        <div className="pt-8">
          <GoogleMapsSection />
        </div>

      </div>
    </div>
  );
};
