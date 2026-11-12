import React from 'react';
import { MapPin, Navigation, ExternalLink, Clock, Phone, Building2 } from 'lucide-react';
import { useStoreSettings } from '../../context/StoreSettingsContext';

interface GoogleMapsSectionProps {
  compact?: boolean;
}

export const GoogleMapsSection: React.FC<GoogleMapsSectionProps> = ({ compact = false }) => {
  const { settings } = useStoreSettings();

  const googleMapsSearchUrl = settings.googleMapsQueryUrl || 
    'https://www.google.com/maps/search/?api=1&query=ZN+Jewelers+Shop+47+Aman+Tower+Korangi+Crossing+Karachi+Pakistan';
  
  const getDirectionsUrl = `https://www.google.com/maps/dir/?api=1&destination=Aman+Tower+Korangi+Crossing+Karachi+Pakistan`;

  return (
    <div className={`w-full rounded-2xl overflow-hidden border border-[#2d2417] bg-[#0c0a07] shadow-2xl ${compact ? 'p-4' : 'p-6 sm:p-8'}`}>
      
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#231d14]">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-[#D6B16D] font-medium">
            <MapPin className="w-3.5 h-3.5" />
            <span>Physical Flagship Store</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-serif text-white">
            {settings.businessName} – Karachi Store
          </h3>
          <p className="text-xs sm:text-sm text-neutral-300 font-light flex items-center gap-1.5 mt-0.5">
            <Building2 className="w-3.5 h-3.5 text-[#D6B16D] shrink-0" />
            <span>{settings.storeAddress}</span>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <a
            href={getDirectionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-lg bg-[#D6B16D] text-black hover:bg-[#F4E0A5] text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Get Directions</span>
          </a>

          <a
            href={googleMapsSearchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-lg bg-[#14100a] text-neutral-200 hover:text-[#D6B16D] border border-[#382b18] hover:border-[#D6B16D] text-xs font-medium uppercase tracking-wider transition-all flex items-center gap-2"
          >
            <span>View on Google Maps</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Map Embed and Store Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-6 items-stretch">
        
        {/* Interactive Responsive Map Frame */}
        <div className="lg:col-span-8 relative aspect-[16/10] sm:aspect-[16/9] lg:aspect-auto min-h-[300px] lg:min-h-[380px] rounded-xl overflow-hidden border border-[#3b2f1b] shadow-inner bg-[#14110a]">
          <iframe
            title="ZN Jewelers Store Location - Aman Tower, Korangi Crossing, Karachi"
            src="https://maps.google.com/maps?q=Aman%20Tower%2C%20Korangi%20Crossing%2C%20Karachi%2C%20Pakistan&t=&z=15&ie=UTF8&iwloc=&output=embed"
            className="w-full h-full border-0 filter contrast-[1.05] brightness-[0.95]"
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
          />

          {/* Floating Luxury Overlay Tag */}
          <div className="absolute top-3 left-3 px-3 py-1.5 rounded-lg bg-black/85 backdrop-blur-md border border-[#3d311c] text-white text-xs flex items-center gap-2 shadow-xl pointer-events-none">
            <span className="w-2 h-2 rounded-full bg-[#D6B16D] animate-ping" />
            <span className="font-serif font-medium">Shop #47, Aman Tower</span>
          </div>
        </div>

        {/* Store Visiting Details */}
        <div className="lg:col-span-4 flex flex-col justify-between p-5 rounded-xl bg-[#110e09] border border-[#261f14] space-y-4">
          <div className="space-y-4">
            <h4 className="text-xs uppercase tracking-[0.2em] text-[#D6B16D] font-semibold border-b border-[#241c12] pb-2">
              Store Timings & Concierge
            </h4>

            <div className="space-y-3 text-xs text-neutral-300">
              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-[#D6B16D] shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium text-white block">Monday – Saturday</span>
                  <span className="text-neutral-400">12:00 PM – 10:00 PM (PKT)</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-[#D6B16D] shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium text-white block">Sunday</span>
                  <span className="text-neutral-400">03:00 PM – 10:00 PM (PKT)</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5 pt-2 border-t border-[#1f1910]">
                <Phone className="w-4 h-4 text-[#D6B16D] shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium text-white block">Call / WhatsApp Store</span>
                  <a href={`tel:${settings.phone}`} className="text-neutral-400 hover:text-[#D6B16D] transition-colors">
                    {settings.phone}
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-[#18130a] border border-[#352915] text-[11px] text-neutral-300 space-y-1">
            <span className="text-[#D6B16D] font-medium block">Walking Directions:</span>
            <p className="text-neutral-400 leading-relaxed">
              Located on the Ground Floor inside Aman Tower shopping gallery at Korangi Crossing junction. Ask for Shop No. 47 for fashion jewellery & watches.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};
