import React, { useState } from 'react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';
import { createQuickInquiryLink } from '../utils/whatsapp';
import { 
  Star, 
  Shield, 
  Zap, 
  ShoppingCart, 
  MessageCircle, 
  Check, 
  RefreshCw,
  Eye
} from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart, setSelectedProduct, language, settings } = useStore();
  const [withExchange, setWithExchange] = useState(true);
  const [isAddedAnimation, setIsAddedAnimation] = useState(false);

  const displayPrice = withExchange ? product.withOldBatteryPrice : product.price;
  const discountPercent = Math.round(((product.mrp - displayPrice) / product.mrp) * 100);
  const savingsAmount = product.mrp - displayPrice;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, withExchange);
    setIsAddedAnimation(true);
    setTimeout(() => setIsAddedAnimation(false), 1200);
  };

  const handleWhatsAppBuy = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = createQuickInquiryLink(product, settings, language);
    window.open(url, '_blank');
  };

  return (
    <div
      onClick={() => setSelectedProduct(product)}
      className="bg-white rounded-2xl border border-gray-200/80 shadow-sm hover:shadow-xl transition-all duration-200 flex flex-col justify-between overflow-hidden cursor-pointer group transform hover:-translate-y-1 relative"
    >
      {/* Top Badges */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10 pointer-events-none">
        {/* Flipkart / Amazon style Assured Badge */}
        <div className="flex items-center gap-1 bg-luminexs-blue text-white px-2 py-0.5 rounded-md text-[10px] font-extrabold shadow-sm">
          <Shield className="w-3 h-3 text-yellow-400 fill-yellow-400" />
          <span>ULTRA-LUMINEXS ASSURED</span>
        </div>

        {/* Stock status */}
        {product.inStock ? (
          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-300">
            {language === 'ta' ? 'கையிருப்பில் உள்ளது' : 'In Stock'}
          </span>
        ) : (
          <span className="bg-red-100 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-red-300">
            {language === 'ta' ? 'முடிந்துவிட்டது' : 'Out of Stock'}
          </span>
        )}
      </div>

      {/* Image Showcase */}
      <div className="relative pt-8 pb-4 px-6 bg-gradient-to-b from-gray-50 to-white flex items-center justify-center overflow-hidden min-h-[190px]">
        <img
          src={product.image}
          alt={product.name}
          className="h-40 sm:h-44 object-contain transition-transform duration-300 group-hover:scale-108 filter drop-shadow-md"
          loading="lazy"
        />

        {/* Quick View Overlay on Hover */}
        <div className="absolute inset-0 bg-luminexs-navy/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
          <span className="bg-white/95 text-gray-900 text-xs font-bold px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-luminexs-blue" />
            {language === 'ta' ? 'முழு விவரங்கள் பார்க்க' : 'View Full Specs'}
          </span>
        </div>

        {/* Multi-Photo Badge */}
        {product.additionalImages && product.additionalImages.length > 0 && (
          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 backdrop-blur-sm shadow z-10 pointer-events-none">
            <span>📷 {1 + product.additionalImages.length}</span>
          </div>
        )}
      </div>

      {/* Product Details Body */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Rating & Reviews (Flipkart Green Pill) */}
          <div className="flex items-center gap-2 mb-1.5">
            <div className="flex items-center gap-1 bg-emerald-700 text-white px-1.5 py-0.5 rounded text-[11px] font-black">
              <span>{product.rating}</span>
              <Star className="w-2.5 h-2.5 fill-white" />
            </div>
            <span className="text-gray-400 text-xs">
              ({product.reviewsCount} {language === 'ta' ? 'மதிப்பீடுகள்' : 'Ratings'})
            </span>
            <span className="text-gray-300">•</span>
            <span className="text-[11px] font-bold text-luminexs-blue uppercase tracking-wide">
              {product.brand}
            </span>
          </div>

          {/* Product Title */}
          <h3 className="font-bold text-gray-900 text-sm sm:text-base leading-snug line-clamp-2 group-hover:text-luminexs-blue transition-colors">
            {product.name}
          </h3>

          {/* Key Specification Tags */}
          <div className="flex flex-wrap items-center gap-1.5 my-2.5">
            <span className="bg-blue-50 text-blue-700 font-bold text-[11px] px-2 py-0.5 rounded-md border border-blue-200/60 flex items-center gap-1">
              <Zap className="w-3 h-3 text-yellow-600" />
              {product.capacityAh} Ah Capacity
            </span>
            <span className="bg-amber-50 text-amber-800 font-bold text-[11px] px-2 py-0.5 rounded-md border border-amber-200/60">
              🛡️ {product.warrantyMonths}M Warranty
            </span>
          </div>

          {/* Old Battery Exchange Price Switcher (Crucial for Indian market) */}
          <div 
            onClick={(e) => {
              e.stopPropagation();
              setWithExchange(!withExchange);
            }}
            className="my-2 p-2 rounded-xl bg-emerald-50/70 border border-emerald-200/80 hover:bg-emerald-100/70 transition flex items-center justify-between text-xs cursor-pointer select-none"
          >
            <div className="flex items-center gap-1.5">
              <RefreshCw className={`w-3.5 h-3.5 ${withExchange ? 'text-emerald-600 animate-spin-once' : 'text-gray-400'}`} />
              <span className="font-semibold text-gray-800 text-[11px]">
                {language === 'ta' ? 'பழைய பேட்டரி எக்ஸ்சேஞ்ச்' : 'With Old Battery Return'}
              </span>
            </div>
            <div className={`w-9 h-5 flex items-center rounded-full p-0.5 transition-colors ${withExchange ? 'bg-emerald-600' : 'bg-gray-300'}`}>
              <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${withExchange ? 'translate-x-4' : 'translate-x-0'}`}></div>
            </div>
          </div>

          {/* Price Section */}
          <div className="mt-2 pt-2 border-t border-gray-100">
            <div className="flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-black text-gray-950">
                ₹{displayPrice.toLocaleString('en-IN')}
              </span>
              <span className="text-xs text-gray-400 line-through">
                ₹{product.mrp.toLocaleString('en-IN')}
              </span>
              <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                {discountPercent}% OFF
              </span>
            </div>

            <p className="text-[11px] text-emerald-700 font-semibold mt-0.5 flex items-center gap-1">
              <Check className="w-3 h-3 text-emerald-600" />
              {language === 'ta'
                ? `ரூ. ${savingsAmount.toLocaleString('en-IN')} சேமிக்கிறீர்கள் | இலவச ஃபிட்டிங்`
                : `You save ₹${savingsAmount.toLocaleString('en-IN')} | Free Doorstep Fitting`}
            </p>
          </div>
        </div>

        {/* Action Buttons: Add to Cart & Buy via WhatsApp */}
        <div className="mt-4 pt-2 grid grid-cols-2 gap-2">
          <button
            onClick={handleAddToCart}
            disabled={!product.inStock}
            className={`flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl font-bold text-xs transition-all shadow-sm ${
              product.inStock
                ? 'bg-yellow-400 hover:bg-yellow-500 text-gray-950 active:scale-95'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isAddedAnimation ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-700" />
                <span className="text-emerald-800">{language === 'ta' ? 'சேர்க்கப்பட்டது' : 'Added!'}</span>
              </>
            ) : (
              <>
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>{language === 'ta' ? 'கார்ட்டில் சேர்' : 'Add to Cart'}</span>
              </>
            )}
          </button>

          <button
            onClick={handleWhatsAppBuy}
            className="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-sm active:scale-95"
          >
            <MessageCircle className="w-3.5 h-3.5 fill-white" />
            <span>{language === 'ta' ? 'வாட்ஸ்அப்' : 'WhatsApp'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
