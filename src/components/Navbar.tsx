import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { BrandLogo } from './BrandLogo';
import { createGeneralSupportLink } from '../utils/whatsapp';
import { 
  Search, 
  ShoppingCart, 
  Phone, 
  MessageCircle, 
  Globe, 
  ShieldCheck, 
  X,
  Truck,
  Zap
} from 'lucide-react';

interface NavbarProps {
  onOpenAdmin: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAdmin }) => {
  const { 
    cartCount, 
    cartTotal, 
    setIsCartOpen, 
    language, 
    setLanguage, 
    searchQuery, 
    setSearchQuery,
    setSelectedCategory,
    settings 
  } = useStore();

  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ta' : 'en');
  };

  const handleLogoClick = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 bg-luminexs-navy text-white shadow-md">
      {/* Top Notification Strip */}
      <div className="bg-[#0B132B] text-xs py-1.5 px-3 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-yellow-400 font-medium overflow-hidden text-ellipsis whitespace-nowrap">
            <span className="flex items-center gap-1 font-bold">
              <Zap className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400 animate-pulse" />
              {language === 'ta' ? 'அவசர பேட்டரி உதவி:' : 'EXPRESS DELIVERY:'}
            </span>
            <span className="text-gray-200 text-[11px] sm:text-xs">
              {language === 'ta' 
                ? '30 நிமிடங்களில் உங்கள் இருப்பிடத்திற்கே இலவச டெலிவரி & ஃபிட்டிங்!' 
                : '30-45 Mins Doorstep Delivery & Professional Installation!'}
            </span>
          </div>

          <div className="hidden md:flex items-center gap-4 text-xs text-gray-300">
            <a 
              href={`tel:${settings.phone}`} 
              className="flex items-center gap-1 hover:text-yellow-400 transition"
            >
              <Phone className="w-3 h-3 text-emerald-400" />
              <span>{settings.phone}</span>
            </a>
            <span className="text-gray-600">|</span>
            <span className="flex items-center gap-1 text-emerald-400 font-semibold">
              <Truck className="w-3.5 h-3.5" />
              {language === 'ta' ? 'அனைத்து நாட்களும் திறந்திருக்கும்' : '7 Days Open (8:30 AM - 9:30 PM)'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Brand Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3.5 flex items-center justify-between gap-3 sm:gap-6">
        {/* Brand Logo */}
        <div 
          onClick={handleLogoClick}
          className="cursor-pointer flex-shrink-0 transition-transform active:scale-95"
        >
          <BrandLogo theme="dark" size="md" />
        </div>

        {/* Desktop Search Bar (Flipkart / Amazon style) */}
        <div className="hidden md:flex flex-1 max-w-2xl relative">
          <div className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                language === 'ta'
                  ? 'கார், பைக், இன்வெர்ட்டர் அல்லது 150Ah பேட்டரிகளைத் தேடுக...'
                  : 'Search for car model (Swift, i20), bike (Splendor, Activa), or 150Ah tubular...'
              }
              className="w-full pl-10 pr-24 py-2.5 rounded-lg text-sm bg-white text-gray-900 placeholder-gray-500 shadow-inner focus:outline-none focus:ring-2 focus:ring-yellow-400 border border-transparent font-medium"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-20 top-2.5 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button 
              onClick={() => {}}
              className="absolute right-1 top-1 bottom-1 px-4 bg-yellow-400 hover:bg-yellow-500 text-gray-950 font-bold text-xs rounded-md flex items-center gap-1 transition"
            >
              <Search className="w-3.5 h-3.5" />
              <span>{language === 'ta' ? 'தேடு' : 'Search'}</span>
            </button>
          </div>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile Search Toggle */}
          <button
            onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            className="md:hidden p-2 text-gray-200 hover:text-yellow-400 hover:bg-white/10 rounded-lg"
            aria-label="Toggle Search"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Language Switcher Button (Tamil / English) */}
          <button
            onClick={toggleLanguage}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold rounded-lg border border-yellow-400/40 bg-white/5 hover:bg-yellow-400/20 text-yellow-300 transition"
            title="Change Language"
          >
            <Globe className="w-3.5 h-3.5 text-yellow-400" />
            <span className="hidden xs:inline">
              {language === 'en' ? 'தமிழ்' : 'English'}
            </span>
            <span className="xs:hidden">
              {language === 'en' ? 'த' : 'EN'}
            </span>
          </button>

          {/* Quick WhatsApp Support */}
          <a
            href={createGeneralSupportLink(settings, language)}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-sm"
          >
            <MessageCircle className="w-4 h-4 fill-white" />
            <span>{language === 'ta' ? 'வாட்ஸ்அப்' : 'WhatsApp'}</span>
          </a>

          {/* Amazon / Flipkart Style Cart Button */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative flex items-center gap-2 px-3 py-1.5 bg-yellow-400 hover:bg-yellow-500 text-gray-950 font-bold rounded-lg transition shadow-md active:scale-95"
          >
            <div className="relative">
              <ShoppingCart className="w-5 h-5 text-gray-900" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
                  {cartCount}
                </span>
              )}
            </div>
            <div className="hidden sm:flex flex-col items-start leading-tight">
              <span className="text-[10px] uppercase font-bold text-gray-800">
                {language === 'ta' ? 'கூடை' : 'Cart'}
              </span>
              <span className="text-xs font-extrabold text-gray-950">
                {cartCount > 0 ? `₹${cartTotal.toLocaleString('en-IN')}` : '₹0'}
              </span>
            </div>
          </button>

          {/* Admin Portal Key Button */}
          <button
            onClick={onOpenAdmin}
            className="p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition"
            title={language === 'ta' ? 'உரிமையாளர் நிர்வாக பக்கம் (Admin Login)' : 'Shop Owner Admin Portal'}
          >
            <ShieldCheck className="w-5 h-5 text-yellow-400" />
          </button>
        </div>
      </div>

      {/* Mobile Search Input (Expandable) */}
      {mobileSearchOpen && (
        <div className="md:hidden px-3 pb-3 pt-1 bg-luminexs-navy border-t border-white/10">
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                language === 'ta'
                  ? 'வாகன பெயர் அல்லது பேட்டரி மாடலை தேடுக...'
                  : 'Search car, bike or inverter battery...'
              }
              className="w-full pl-9 pr-8 py-2 rounded-lg text-xs bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              autoFocus
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2 text-gray-400"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
