import React from 'react';
import { Star, Sparkles, CheckCircle2 } from 'lucide-react';

export const CustomerTestimonials: React.FC = () => {
  const testimonials = [
    {
      name: 'Amina Al-Mansoor',
      location: 'Karachi, Clifton',
      role: 'Bridal Client',
      stars: 5,
      date: 'February 2026',
      title: 'The Royal Bridal Bangles set was simply breathtaking',
      comment:
        'The 24-piece velvet bangles set with heavy Kundan centerpiece kadas was the talk of my wedding. The antique gold polish and velvet finish felt so luxurious and royal.'
    },
    {
      name: 'Dr. Shahzad Qureshi',
      location: 'Lahore, DHA Phase 5',
      role: 'Verified Buyer',
      stars: 5,
      date: 'January 2026',
      title: 'Exquisite chronograph watch and designer handbag',
      comment:
        'Purchased the gold chronograph and the quilted handbag for my anniversary. The finish, anti-tarnish stainless steel construction, and luxury velvet packaging were exceptional.'
    },
    {
      name: 'Fatima Z. Bukhari',
      location: 'Islamabad, F-7/2',
      role: 'Regular Patron',
      stars: 5,
      date: 'February 2026',
      title: 'Bridal Bangles & Waterproof Stainless Steel Jewellery',
      comment:
        'The kundan bangles were magnificent for the wedding, and the everyday stainless steel clover necklace hasn’t tarnished at all even after weeks of continuous wear. 10/10 service!'
    }
  ];

  return (
    <section className="py-24 px-6 lg:px-12 bg-[#060606] border-t border-[#1a160e]">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header */}
        <div className="text-center space-y-3 max-w-xl mx-auto">
          <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-[#D6B16D] font-medium">
            <Sparkles className="w-3 h-3" />
            <span>Patron Testimonials</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif text-white tracking-wide">
            Words From Our <span className="italic font-serif gold-gradient-text">Patrons</span>
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 font-light">
            Reflections of trust, timeless elegance, and joy from our distinguished clientele worldwide.
          </p>
        </div>

        {/* 3 Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, index) => (
            <div
              key={index}
              className="p-8 rounded-xl bg-[#0d0c09] border border-[#2b2417] relative flex flex-col justify-between hover:border-[#D6B16D]/60 transition-all duration-300 shadow-xl"
            >
              <div className="space-y-4">
                {/* 5 Stars */}
                <div className="flex items-center gap-1 text-[#D6B16D]">
                  {[...Array(t.stars)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-[#D6B16D]" />
                  ))}
                </div>

                <h4 className="text-base font-serif font-medium text-white leading-snug">
                  "{t.title}"
                </h4>

                <p className="text-xs text-neutral-300 font-light leading-relaxed">
                  {t.comment}
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-[#1f1911] flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-semibold text-white tracking-wide">{t.name}</h5>
                  <span className="text-[11px] text-neutral-400">{t.location}</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Verified Patron</span>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};
