import React from 'react';
import { ExternalLink, Heart, MessageCircle, Play } from 'lucide-react';
import { useStoreSettings } from '../../context/StoreSettingsContext';

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

interface SocialPost {
  id: string;
  type: 'instagram' | 'tiktok';
  image: string;
  tag: string;
  caption: string;
  likes: string;
  comments: string;
}

const SOCIAL_POSTS: SocialPost[] = [
  {
    id: 'sp-1',
    type: 'instagram',
    image: '/hero-watches.jpg',
    tag: '#ChronographVibe',
    caption: 'Precision horlogerie with sapphire-coated crystal & genuine leather strap.',
    likes: '1.4k',
    comments: '88'
  },
  {
    id: 'sp-2',
    type: 'tiktok',
    image: '/hero-bangles.jpg',
    tag: '#BridalAccessories',
    caption: 'Handcrafted velvet bridal bangles and royal kadas styled for Karachi brides.',
    likes: '4.8k',
    comments: '215'
  },
  {
    id: 'sp-3',
    type: 'instagram',
    image: '/hero-steel.jpg',
    tag: '#WaterproofSteel',
    caption: 'Zero tarnish, zero green skin. 316L surgical stainless steel tested daily.',
    likes: '2.1k',
    comments: '94'
  },
  {
    id: 'sp-4',
    type: 'tiktok',
    image: '/hero-handbags.jpg',
    tag: '#LuxuryTotes',
    caption: 'Structured vegan leather totes with 18K PVD coated hardware.',
    likes: '3.6k',
    comments: '142'
  }
];

export const SocialShowcase: React.FC = () => {
  const { settings } = useStoreSettings();

  return (
    <section className="py-20 bg-[#0a0a0a] border-t border-[#1a1a1a] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#D6B16D]/30 bg-[#D6B16D]/10 text-[#D6B16D] text-xs font-semibold tracking-wider uppercase mb-3">
              <InstagramIcon className="w-3.5 h-3.5" />
              Community & Style
            </div>
            <h2 className="text-2xl sm:text-4xl font-serif font-bold text-white tracking-tight">
              Follow Us on Social Media
            </h2>
            <p className="text-neutral-400 text-sm mt-2 max-w-xl">
              Tag <span className="text-[#D6B16D] font-medium">@znjewelers</span> or use <span className="text-[#D6B16D] font-medium">#ZNJewelersKarachi</span> to be featured in our boutique community showcase.
            </p>
          </div>

          {/* Social Action Buttons */}
          <div className="flex items-center gap-3">
            <a
              href={settings.instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#833ab4]/20 via-[#fd1d1d]/20 to-[#fcb045]/20 border border-[#fd1d1d]/40 text-white text-xs font-semibold hover:border-[#fd1d1d] transition-all hover:scale-105"
            >
              <InstagramIcon className="w-4 h-4 text-[#fd1d1d]" />
              Instagram
              <ExternalLink className="w-3 h-3 text-neutral-400" />
            </a>
            <a
              href={settings.tiktokUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/5 border border-white/20 text-white text-xs font-semibold hover:border-[#00f2fe] transition-all hover:scale-105"
            >
              <TikTokIcon className="w-4 h-4 text-[#00f2fe]" />
              TikTok
              <ExternalLink className="w-3 h-3 text-neutral-400" />
            </a>
          </div>
        </div>

        {/* Social Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {SOCIAL_POSTS.map((post) => (
            <div
              key={post.id}
              className="group relative rounded-2xl overflow-hidden bg-[#141414] border border-[#222] hover:border-[#D6B16D]/50 transition-all duration-300 flex flex-col"
            >
              {/* Media Container */}
              <div className="relative aspect-square w-full overflow-hidden bg-black">
                <img
                  src={post.image}
                  alt={post.caption}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-90 transition-opacity" />

                {/* Badge Top Left */}
                <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-white text-[11px] font-medium">
                  {post.type === 'instagram' ? (
                    <>
                      <InstagramIcon className="w-3 h-3 text-[#fd1d1d]" />
                      <span>Instagram</span>
                    </>
                  ) : (
                    <>
                      <TikTokIcon className="w-3 h-3 text-[#00f2fe]" />
                      <span>TikTok</span>
                    </>
                  )}
                </div>

                {/* Tag Top Right */}
                <span className="absolute top-3 right-3 text-[10px] font-mono px-2 py-0.5 rounded bg-[#D6B16D]/20 text-[#D6B16D] border border-[#D6B16D]/40 backdrop-blur-sm">
                  {post.tag}
                </span>

                {/* Hover Interaction Overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <div className="flex items-center gap-4 text-white text-xs font-semibold bg-black/70 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                    <span className="flex items-center gap-1">
                      <Heart className="w-3.5 h-3.5 fill-red-500 text-red-500" />
                      {post.likes}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-3.5 h-3.5 text-[#D6B16D]" />
                      {post.comments}
                    </span>
                  </div>
                </div>
              </div>

              {/* Caption & Profile Link */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <p className="text-xs text-neutral-300 line-clamp-2 leading-relaxed">
                  {post.caption}
                </p>
                <div className="mt-3 pt-3 border-t border-[#1f1f1f] flex items-center justify-between text-[11px]">
                  <span className="text-neutral-500 font-mono">@znjewelers</span>
                  <a
                    href={post.type === 'instagram' ? settings.instagramUrl : settings.tiktokUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#D6B16D] hover:underline flex items-center gap-1 font-medium"
                  >
                    View Post <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Store Walk-in Notice */}
        <div className="mt-12 text-center text-xs text-neutral-500">
          Capture your in-store experience at <strong className="text-neutral-300">{settings.storeAddress}</strong> and tag us to win monthly fashion accessory vouchers.
        </div>

      </div>
    </section>
  );
};
