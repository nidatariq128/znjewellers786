import React, { createContext, useContext, useEffect, useState } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface StoreSettings {
  businessName: string;
  storeAddress: string;
  phone: string;
  email: string;
  whatsappNumber: string;
  whatsappUrl: string;
  instagramUrl: string;
  tiktokUrl: string;
  googleMapsQueryUrl: string;
  googleMapsSearchUrl: string;
  googleMapsEmbedUrl?: string;
  shippingThreshold: number;
  freeShippingThreshold: number;
  standardShippingFee: number;
  shippingRateKarachi: number;
  shippingRateNationwide: number;
  deliveryTimeKarachi: string;
  deliveryTimeNationwide: string;
  warrantyPeriodSummary: string;
  announcementText: string;
  // Pakistani Payment Accounts
  easypaisaTitle: string;
  easypaisaNumber: string;
  easypaisaInstructions: string;
  jazzcashTitle: string;
  jazzcashNumber: string;
  jazzcashTillId: string;
  jazzcashInstructions: string;
  bankName: string;
  bankAccountTitle: string;
  bankAccountNumber: string;
  bankIban: string;
  bankBranch: string;
  bankInstructions: string;
}

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  businessName: 'ZN Jewelers',
  storeAddress: 'Shop No. 47, Aman Tower, Korangi Crossing, Karachi, Pakistan.',
  phone: '+92 317 8113817',
  email: 'znjewelaers786@gmail.com',
  whatsappNumber: '+92 317 8113817',
  whatsappUrl: 'https://wa.me/923178113817',
  instagramUrl: 'https://www.instagram.com/chipmunk.8083543?obrf=MWZkaml1aHVucWs3Yg==',
  tiktokUrl: 'https://www.tiktok.com/@zeeshan.king4803?_r=1&_t=ZS-9BJVXHbCTCf',
  googleMapsQueryUrl: 'https://www.google.com/maps/search/?api=1&query=ZN+Jewelers+Shop+47+Aman+Tower+Korangi+Crossing+Karachi+Pakistan',
  googleMapsSearchUrl: 'https://www.google.com/maps/search/?api=1&query=ZN+Jewelers+Shop+47+Aman+Tower+Korangi+Crossing+Karachi+Pakistan',
  googleMapsEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3620.767425126131!2d67.1129524!3d24.8376483!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3eb33b8a1c3e3871%3A0x7c73a7042a3f0cb!2sAman%20Tower%2C%20Korangi%20Crossing%2C%20Karachi!5e0!3m2!1sen!2spk!4v1700000000000',
  shippingThreshold: 5000,
  freeShippingThreshold: 5000,
  standardShippingFee: 250,
  shippingRateKarachi: 200,
  shippingRateNationwide: 250,
  deliveryTimeKarachi: '1 - 2 Business Days',
  deliveryTimeNationwide: '3 - 5 Business Days',
  warrantyPeriodSummary: '6 Months Repair & Plating Assistance on Timepieces & Waterproof Steel',
  announcementText: 'Complimentary Nationwide Shipping On Orders Above ₨ 5,000',
  // Pakistani Payment Accounts Defaults
  easypaisaTitle: 'ZN Jewelers',
  easypaisaNumber: '0317 8113817',
  easypaisaInstructions: 'Send payment via Easypaisa App or USSD to 0317 8113817 (ZN Jewelers) and provide your 11-digit Transaction ID (TRX).',
  jazzcashTitle: 'ZN Jewelers',
  jazzcashNumber: '0317 8113817',
  jazzcashTillId: '00289140',
  jazzcashInstructions: 'Transfer via JazzCash App to 0317 8113817 (ZN Jewelers) or Till ID 00289140 and enter your JazzCash TID below.',
  bankName: 'Meezan Bank Ltd',
  bankAccountTitle: 'ZN Jewelers',
  bankAccountNumber: '0108746201',
  bankIban: 'PK42MEZN0099320108746201',
  bankBranch: 'Korangi Crossing Branch, Karachi',
  bankInstructions: 'Transfer via Meezan Mobile App, 1Link Raast, or ATM to our IBAN or Account Number, then enter your online transfer reference ID.'
};

interface StoreSettingsContextType {
  settings: StoreSettings;
  updateSettings: (newSettings: Partial<StoreSettings>) => Promise<void>;
  loading: boolean;
}

const StoreSettingsContext = createContext<StoreSettingsContextType | undefined>(undefined);

export const StoreSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<StoreSettings>(() => {
    try {
      const saved = localStorage.getItem('zn_store_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Ensure new real links and phone override old placeholders if present
        const merged = { ...DEFAULT_STORE_SETTINGS, ...parsed };
        if (merged.tiktokUrl.includes('@znjewelers')) {
          merged.tiktokUrl = DEFAULT_STORE_SETTINGS.tiktokUrl;
        }
        if (merged.instagramUrl.includes('@znjewelers') || merged.instagramUrl.endsWith('/znjewelers')) {
          merged.instagramUrl = DEFAULT_STORE_SETTINGS.instagramUrl;
        }
        if (merged.phone.includes('0300 8294711')) {
          merged.phone = DEFAULT_STORE_SETTINGS.phone;
          merged.whatsappNumber = DEFAULT_STORE_SETTINGS.whatsappNumber;
          merged.whatsappUrl = DEFAULT_STORE_SETTINGS.whatsappUrl;
          merged.easypaisaNumber = DEFAULT_STORE_SETTINGS.easypaisaNumber;
          merged.jazzcashNumber = DEFAULT_STORE_SETTINGS.jazzcashNumber;
        }
        return merged;
      }
    } catch (e) {
      console.warn('Could not parse local store settings:', e);
    }
    return DEFAULT_STORE_SETTINGS;
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, 'settings', 'general');
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const remoteData = snap.data() as Partial<StoreSettings>;
          setSettings((prev) => {
            const merged = { ...prev, ...remoteData };
            localStorage.setItem('zn_store_settings', JSON.stringify(merged));
            return merged;
          });
        }
      } catch (err) {
        console.warn('Firestore settings fetch fallback to local:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const updateSettings = async (newSettings: Partial<StoreSettings>) => {
    const merged = { ...settings, ...newSettings };
    setSettings(merged);
    localStorage.setItem('zn_store_settings', JSON.stringify(merged));

    try {
      const docRef = doc(db, 'settings', 'general');
      await setDoc(docRef, merged, { merge: true });
    } catch (err) {
      console.warn('Error saving settings to Firestore:', err);
    }
  };

  return (
    <StoreSettingsContext.Provider value={{ settings, updateSettings, loading }}>
      {children}
    </StoreSettingsContext.Provider>
  );
};

export const useStoreSettings = () => {
  const context = useContext(StoreSettingsContext);
  if (!context) {
    throw new Error('useStoreSettings must be used within a StoreSettingsProvider');
  }
  return context;
};
