import React, { useState } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Navbar } from './components/Navbar';
import { BannerCarousel } from './components/BannerCarousel';
import { CategoryBar } from './components/CategoryBar';
import { ProductCard } from './components/ProductCard';
import { ProductModal } from './components/ProductModal';
import { CartDrawer } from './components/CartDrawer';
import { AdminPortal } from './components/AdminPortal';
import { Footer } from './components/Footer';
import { createGeneralSupportLink } from './utils/whatsapp';
import { 
  MessageCircle, 
  ShoppingCart, 
  ChevronDown,
  RotateCcw,
  Search,
  Truck,
  CreditCard,
  ShieldCheck,
  Zap
} from 'lucide-react';

const StoreContent: React.FC = () => {
  const { 
    products, 
    selectedCategory, 
    setSelectedCategory,
    searchQuery, 
    setSearchQuery,
    language,
    cartCount,
    setIsCartOpen,
    settings
  } = useStore();

  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'featured' | 'price-low' | 'price-high' | 'rating'>('featured');

  // Filter products based on search, category, and brand
  const filteredProducts = products.filter((product) => {
    // 1. Category check
    if (selectedCategory !== 'all' && product.category !== selectedCategory) {
      return false;
    }

    // 2. Brand check
    if (selectedBrand !== 'all' && product.brand.toLowerCase() !== selectedBrand.toLowerCase()) {
      return false;
    }

    // 3. Search query check
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = product.name.toLowerCase().includes(q);
      const matchBrand = product.brand.toLowerCase().includes(q);
      const matchCategory = product.category.toLowerCase().includes(q);
      const matchAh = `${product.capacityAh}ah`.includes(q) || `${product.capacityAh} ah`.includes(q) || `${product.capacityAh}` === q;
      const matchVehicles = product.compatibleVehicles?.some((v) => v.toLowerCase().includes(q));
      
      return matchName || matchBrand || matchCategory || matchAh || matchVehicles;
    }

    return true;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-low') {
      return a.price - b.price;
    }
    if (sortBy === 'price-high') {
      return b.price - a.price;
    }
    if (sortBy === 'rating') {
      return b.rating - a.rating;
    }
    // Default featured
    return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
  });

  // Get unique brands
  const brands = ['all', ...Array.from(new Set(products.map((p) => p.brand)))];

  return (
    <div className="min-h-screen flex flex-col bg-[#F1F3F6] text-gray-900 selection:bg-yellow-400 selection:text-black">
      {/* 1. Navbar */}
      <Navbar onOpenAdmin={() => setIsAdminOpen(true)} />

      {/* 2. Hero Banner Carousel */}
      <BannerCarousel />

      {/* 3. Flipkart-style Category Bar */}
      <CategoryBar />

      {/* 4. Customer Trust Bar (3-Day Delivery • No Exchange • Online Payment • 100% Luminexs) */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 w-full">
        <div className="bg-white rounded-2xl border border-gray-200/90 shadow-sm p-3 sm:p-4 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="flex items-center gap-2.5 sm:gap-3 p-1">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center flex-shrink-0 border border-amber-200/80">
              <Truck className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
            </div>
            <div>
              <h4 className="font-extrabold text-xs sm:text-sm text-gray-950">
                {language === 'ta' ? '3 நாட்களில் டெலிவரி' : 'Delivery within 3 Days'}
              </h4>
              <p className="text-[10px] sm:text-xs text-gray-500 font-medium">
                {language === 'ta' ? 'தமிழ்நாடு முழுவதும் விரைவு சேவை' : 'Express Doorstep Dispatch'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3 p-1">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center flex-shrink-0 border border-blue-200/80">
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            </div>
            <div>
              <h4 className="font-extrabold text-xs sm:text-sm text-gray-950">
                {language === 'ta' ? 'எக்ஸ்சேஞ்ச் தேவையில்லை' : 'No Exchange Needed'}
              </h4>
              <p className="text-[10px] sm:text-xs text-gray-500 font-medium">
                {language === 'ta' ? '100% புத்தம் புதிய பேட்டரி' : '100% Brand New Battery'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3 p-1">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0 border border-emerald-200/80">
              <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />
            </div>
            <div>
              <h4 className="font-extrabold text-xs sm:text-sm text-gray-950">
                {language === 'ta' ? 'ஆன்லைன் பேமெண்ட்' : 'Online Payment Accepted'}
              </h4>
              <p className="text-[10px] sm:text-xs text-gray-500 font-medium">
                {language === 'ta' ? 'UPI / GPay / கார்டுகள் / NetBanking' : 'UPI, Cards & Net Banking'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3 p-1">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center flex-shrink-0 border border-purple-200/80">
              <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
            </div>
            <div>
              <h4 className="font-extrabold text-xs sm:text-sm text-gray-950">
                {language === 'ta' ? 'Luminexs பிராண்ட் மட்டுமே' : 'Brand Luminexs Only'}
              </h4>
              <p className="text-[10px] sm:text-xs text-gray-500 font-medium">
                {language === 'ta' ? 'நேரடி தயாரிப்பாளர் வாரண்டி' : 'Direct Factory Warranty'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Main Product Listing Section */}
      <main id="products-section" className="flex-1 max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 w-full">
        {/* Section Header & Filters */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200/90 shadow-sm mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-2xl font-black text-gray-950 uppercase tracking-tight flex items-center gap-2">
                <span>
                  {selectedCategory === 'all' && (language === 'ta' ? 'அனைத்து பேட்டரிகள்' : 'All Batteries')}
                  {selectedCategory === 'car' && (language === 'ta' ? 'கார் பேட்டரிகள்' : 'Car Batteries')}
                  {selectedCategory === 'bike' && (language === 'ta' ? 'பைக் & ஸ்கூட்டர் பேட்டரிகள்' : 'Two-Wheeler Batteries')}
                  {selectedCategory === 'inverter' && (language === 'ta' ? 'இன்வெர்ட்டர் & டியூபுலர் பேட்டரிகள்' : 'Inverter & Tall Tubular Batteries')}
                  {selectedCategory === 'solar' && (language === 'ta' ? 'சோலார் பேட்டரிகள்' : 'Solar Deep Cycle Batteries')}
                  {selectedCategory === 'commercial' && (language === 'ta' ? 'டிராக்டர் & லோடு வண்டி பேட்டரிகள்' : 'Commercial & Heavy Tractor Batteries')}
                </span>
                <span className="text-xs bg-yellow-400 text-gray-950 font-black px-2 py-0.5 rounded-full">
                  {sortedProducts.length}
                </span>
              </h2>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              {language === 'ta'
                ? '100% அசல் Ultra-Luminexs தயாரிப்புகள் • 3 நாட்களில் டெலிவரி • ஆன்லைன் பேமெண்ட் வசதி'
                : '100% Genuine Ultra-Luminexs Products • Delivery within 3 Days • Online Payment Accepted'}
            </p>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Brand Filter */}
            {brands.length > 2 && (
              <div className="relative">
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="bg-gray-100 border border-gray-300 text-gray-800 text-xs font-bold rounded-xl py-2 px-3 pr-8 focus:outline-none focus:ring-1 focus:ring-yellow-400 cursor-pointer"
                >
                  <option value="all">
                    {language === 'ta' ? 'அனைத்து பிராண்டுகள்' : 'All Brands'}
                  </option>
                  {brands.filter((b) => b !== 'all').map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-gray-500 absolute right-2.5 top-3 pointer-events-none" />
              </div>
            )}

            {/* Sort Filter */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-gray-100 border border-gray-300 text-gray-800 text-xs font-bold rounded-xl py-2 px-3 pr-8 focus:outline-none focus:ring-1 focus:ring-yellow-400 cursor-pointer"
              >
                <option value="featured">{language === 'ta' ? 'சிறந்தவை (Featured)' : 'Featured'}</option>
                <option value="price-low">{language === 'ta' ? 'விலை: குறைந்தது முதல் (Price: Low to High)' : 'Price: Low to High'}</option>
                <option value="price-high">{language === 'ta' ? 'விலை: அதிகம் முதல் (Price: High to Low)' : 'Price: High to Low'}</option>
                <option value="rating">{language === 'ta' ? 'அதிக ரேட்டிங் (Customer Rating)' : 'Highest Rated'}</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-gray-500 absolute right-2.5 top-3 pointer-events-none" />
            </div>

            {/* Reset Filters button if any filter active */}
            {(selectedCategory !== 'all' || selectedBrand !== 'all' || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedBrand('all');
                  setSearchQuery('');
                }}
                className="p-2 text-gray-500 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-xl transition"
                title="Reset filters"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Product Cards Grid (Amazon / Flipkart Style) */}
        {sortedProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {sortedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          /* Empty Search State */
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-200 space-y-4 max-w-lg mx-auto my-8">
            <div className="w-16 h-16 rounded-full bg-yellow-50 text-yellow-600 flex items-center justify-center mx-auto">
              <Search className="w-8 h-8" />
            </div>
            <div>
              <h3 className="font-extrabold text-gray-900 text-lg">
                {language === 'ta' ? 'பொருட்கள் கிடைக்கவில்லை' : 'No batteries found matching your search'}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                {language === 'ta'
                  ? 'தேடல் வார்த்தையை சரிபார்க்கவும் அல்லது வாட்ஸ்அப் மூலம் உடனடியாக தொடர்பு கொள்ளவும்.'
                  : 'Try searching with different terms like "150Ah", "Swift", "Activa", or chat directly on WhatsApp.'}
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-3 pt-2">
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedBrand('all');
                  setSearchQuery('');
                }}
                className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-900 font-bold text-xs"
              >
                {language === 'ta' ? 'அனைத்து பேட்டரிகளையும் காட்டு' : 'Clear Filters'}
              </button>
              <a
                href={createGeneralSupportLink(settings, language)}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>{language === 'ta' ? 'வாட்ஸ்அப் உதவி' : 'Ask on WhatsApp'}</span>
              </a>
            </div>
          </div>
        )}
      </main>

      {/* 5. Footer */}
      <Footer onOpenAdmin={() => setIsAdminOpen(true)} />

      {/* 6. Floating Action Buttons (Mobile WhatsApp & Cart) */}
      <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-2.5">
        {/* Floating Cart Button (Mobile Only) */}
        {cartCount > 0 && (
          <button
            onClick={() => setIsCartOpen(true)}
            className="sm:hidden flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-gray-950 font-black px-4 py-3 rounded-full shadow-2xl border-2 border-white animate-bounce"
          >
            <ShoppingCart className="w-5 h-5" />
            <span className="text-xs">{cartCount} items</span>
          </button>
        )}

        {/* Floating WhatsApp Quick Support Button */}
        <a
          href={createGeneralSupportLink(settings, language)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black px-4 py-3 rounded-full shadow-2xl border-2 border-white transition transform hover:scale-105 active:scale-95"
          aria-label="Direct WhatsApp Support"
        >
          <MessageCircle className="w-6 h-6 fill-white" />
          <span className="text-xs hidden xs:inline font-bold">
            {language === 'ta' ? 'வாட்ஸ்அப் உதவி' : 'WhatsApp'}
          </span>
        </a>
      </div>

      {/* 7. Modals & Drawers */}
      <ProductModal />
      <CartDrawer />
      <AdminPortal isOpen={isAdminOpen} onClose={() => setIsAdminOpen(false)} />
    </div>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <StoreContent />
    </StoreProvider>
  );
}
