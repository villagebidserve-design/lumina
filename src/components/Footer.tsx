import React from 'react';
import { useStore } from '../context/StoreContext';
import { BrandLogo } from './BrandLogo';
import { createGeneralSupportLink } from '../utils/whatsapp';
import { 
  Phone, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  Truck, 
  RefreshCw, 
  MessageCircle, 
  Lock 
} from 'lucide-react';

interface FooterProps {
  onOpenAdmin: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAdmin }) => {
  const { settings, language, setSelectedCategory } = useStore();

  return (
    <footer className="bg-luminexs-navy text-white mt-12 border-t border-white/10">
      {/* 4 Feature Badges Bar */}
      <div className="bg-[#0B132B] py-6 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-400/20 text-yellow-400 flex items-center justify-center flex-shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-black text-xs sm:text-sm text-white uppercase">
                {language === 'ta' ? 'இலவச டெலிவரி' : 'Express Delivery'}
              </h4>
              <p className="text-[11px] text-gray-400">
                {language === 'ta' ? '30 நிமிடங்களில் உங்கள் கதவுக்கே' : 'Within 30-45 minutes'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-400/20 text-emerald-400 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-black text-xs sm:text-sm text-white uppercase">
                {language === 'ta' ? '100% அசல் பேட்டரி' : '100% Genuine Stock'}
              </h4>
              <p className="text-[11px] text-gray-400">
                {language === 'ta' ? 'புதிய தயாரிப்பு & நிறுவன பில்' : 'Direct Manufacturer Warranty'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-400/20 text-blue-400 flex items-center justify-center flex-shrink-0">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-black text-xs sm:text-sm text-white uppercase">
                {language === 'ta' ? 'பழைய பேட்டரி தள்ளுபடி' : 'Best Scrap Value'}
              </h4>
              <p className="text-[11px] text-gray-400">
                {language === 'ta' ? 'பழைய பேட்டரிக்கு உடனடி கேஷ்' : 'Instant exchange discount'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-400/20 text-purple-400 flex items-center justify-center flex-shrink-0">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-black text-xs sm:text-sm text-white uppercase">
                {language === 'ta' ? 'நேரடி வாட்ஸ்அப் உதவி' : 'WhatsApp Support'}
              </h4>
              <p className="text-[11px] text-gray-400">
                {language === 'ta' ? 'உடனடி பதில் & ஆர்டர் உறுதி' : 'Direct chat with owner'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links & Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Brand & Mission */}
        <div className="space-y-3">
          <BrandLogo theme="dark" size="lg" />
          <p className="text-xs text-gray-300 leading-relaxed max-w-sm">
            {language === 'ta'
              ? 'Ultra-Luminexs - தமிழ்நாட்டின் நம்பகமான பேட்டரி விற்பனையகம். கார்கள், பைக்குகள், இன்வெர்ட்டர்கள் மற்றும் சோலார் பேட்டரிகள் அனைத்தும் மிகக் குறைந்த விலையில் கிடைக்கும்.'
              : 'Ultra-Luminexs - Your trusted destination for automotive, inverter, and solar energy batteries with doorstep delivery and free fitting across Tamil Nadu.'}
          </p>
          <div className="pt-2">
            <a
              href={createGeneralSupportLink(settings, language)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow transition"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>{language === 'ta' ? 'வாட்ஸ்அப்-ல் தொடர்பு கொள்ள' : 'Contact on WhatsApp'}</span>
            </a>
          </div>
        </div>

        {/* Quick Categories */}
        <div className="space-y-3">
          <h4 className="font-black text-sm uppercase tracking-wider text-yellow-400">
            {language === 'ta' ? 'பேட்டரி வகைகள்' : 'Battery Categories'}
          </h4>
          <ul className="space-y-2 text-xs text-gray-300">
            <li>
              <button 
                onClick={() => {
                  setSelectedCategory('car');
                  window.scrollTo({ top: 300, behavior: 'smooth' });
                }}
                className="hover:text-yellow-400 transition"
              >
                🚗 {language === 'ta' ? 'கார் பேட்டரிகள் (Car Batteries)' : 'Car & SUV Batteries (35Ah - 80Ah)'}
              </button>
            </li>
            <li>
              <button 
                onClick={() => {
                  setSelectedCategory('bike');
                  window.scrollTo({ top: 300, behavior: 'smooth' });
                }}
                className="hover:text-yellow-400 transition"
              >
                🏍️ {language === 'ta' ? 'பைக் & ஸ்கூட்டர் (Two-Wheeler)' : 'Two Wheeler Batteries (2.5Ah - 14Ah)'}
              </button>
            </li>
            <li>
              <button 
                onClick={() => {
                  setSelectedCategory('inverter');
                  window.scrollTo({ top: 300, behavior: 'smooth' });
                }}
                className="hover:text-yellow-400 transition"
              >
                ⚡ {language === 'ta' ? 'இன்வெர்ட்டர் பேட்டரிகள் (Inverter)' : 'Tubular Home Inverter (150Ah - 220Ah)'}
              </button>
            </li>
            <li>
              <button 
                onClick={() => {
                  setSelectedCategory('solar');
                  window.scrollTo({ top: 300, behavior: 'smooth' });
                }}
                className="hover:text-yellow-400 transition"
              >
                ☀️ {language === 'ta' ? 'சோலார் பேட்டரிகள் (Solar UPS)' : 'Solar C10 Deep Cycle Batteries'}
              </button>
            </li>
            <li>
              <button 
                onClick={() => {
                  setSelectedCategory('commercial');
                  window.scrollTo({ top: 300, behavior: 'smooth' });
                }}
                className="hover:text-yellow-400 transition"
              >
                🚚 {language === 'ta' ? 'டிராக்டர் & லோடு வண்டி (Tractor)' : 'Commercial & Heavy Tractor Batteries'}
              </button>
            </li>
          </ul>
        </div>

        {/* Contact Information */}
        <div className="space-y-3">
          <h4 className="font-black text-sm uppercase tracking-wider text-yellow-400">
            {language === 'ta' ? 'கடை முகவரி & உதவி' : 'Store Location & Timings'}
          </h4>
          <ul className="space-y-2.5 text-xs text-gray-300">
            <li className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
              <span>{settings.address}, {settings.city}</span>
            </li>
            <li className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <a href={`tel:${settings.phone}`} className="hover:text-yellow-400 font-bold">
                {settings.phone}
              </a>
            </li>
            <li className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-yellow-400 flex-shrink-0" />
              <span>{settings.workingHours}</span>
            </li>
          </ul>

          <div className="pt-2">
            <button
              onClick={onOpenAdmin}
              className="inline-flex items-center gap-1.5 text-[11px] text-gray-400 hover:text-yellow-400 font-semibold transition"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{language === 'ta' ? 'உரிமையாளர் அட்மின் லாகின் (Admin Login)' : 'Store Owner Login (/admin)'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="bg-[#080E21] py-4 px-4 text-center text-xs text-gray-400 border-t border-white/5">
        <p>
          © {new Date().getFullYear()} Ultra-Luminexs Batteries. All Rights Reserved. Crafted for Speed, Security & Easy WhatsApp Commerce.
        </p>
      </div>
    </footer>
  );
};
