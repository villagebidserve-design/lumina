import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { createQuickInquiryLink } from '../utils/whatsapp';
import { 
  X, 
  Star, 
  ShieldCheck, 
  Truck, 
  Wrench, 
  RefreshCw, 
  CheckCircle2, 
  MessageCircle, 
  ShoppingCart,
  Check
} from 'lucide-react';

export const ProductModal: React.FC = () => {
  const { selectedProduct, setSelectedProduct, addToCart, language, settings } = useStore();
  const [withExchange, setWithExchange] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isAddedAnimation, setIsAddedAnimation] = useState(false);

  // Reset to first image when a product is opened or primary image changes
  React.useEffect(() => {
    setActiveImageIndex(0);
  }, [selectedProduct?.id, selectedProduct?.image]);

  if (!selectedProduct) return null;

  // Primary image is ALWAYS first, followed by additional unique images
  const images = [
    selectedProduct.image,
    ...(selectedProduct.additionalImages || [])
  ].filter((img, idx, arr) => Boolean(img) && arr.indexOf(img) === idx);

  const currentPrice = withExchange ? selectedProduct.withOldBatteryPrice : selectedProduct.price;
  const discountPercent = Math.round(((selectedProduct.mrp - currentPrice) / selectedProduct.mrp) * 100);
  const totalSavings = selectedProduct.mrp - currentPrice;

  const handleAddToCart = () => {
    addToCart(selectedProduct, withExchange);
    setIsAddedAnimation(true);
    setTimeout(() => setIsAddedAnimation(false), 1200);
  };

  const handleWhatsAppOrder = () => {
    const url = createQuickInquiryLink(selectedProduct, settings, language);
    window.open(url, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-fade-in">
      <div 
        className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl relative border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={() => setSelectedProduct(null)}
          className="absolute top-3 right-3 z-20 p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 sm:p-8">
          {/* Left Column: Image Gallery & Badges */}
          <div className="space-y-4">
            {/* Main Featured Image */}
            <div className="bg-gray-50 rounded-2xl p-6 flex items-center justify-center border border-gray-100 h-64 sm:h-80 relative overflow-hidden">
              <img
                src={images[activeImageIndex] || selectedProduct.image}
                alt={selectedProduct.name}
                className="max-h-full max-w-full object-contain filter drop-shadow-lg"
              />
              <div className="absolute top-3 left-3 bg-luminexs-blue text-white px-2.5 py-1 rounded-md text-xs font-black flex items-center gap-1.5 shadow">
                <ShieldCheck className="w-4 h-4 text-yellow-400" />
                <span>ULTRA-LUMINEXS ASSURED</span>
              </div>
            </div>

            {/* Thumbnail Pickers */}
            {images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-16 h-16 rounded-xl border-2 p-1 bg-white overflow-hidden flex-shrink-0 transition ${
                      activeImageIndex === idx ? 'border-luminexs-blue shadow-md' : 'border-gray-200 opacity-60'
                    }`}
                  >
                    <img src={img} alt="Thumb" className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            )}

            {/* Key Service Highlights */}
            <div className="grid grid-cols-2 gap-2 text-xs pt-2">
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 font-semibold">
                <Truck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>
                  {language === 'ta' ? 'இலவச 30 நிமிடம் டெலிவரி' : 'Free Express 30-Min Delivery'}
                </span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 font-semibold">
                <Wrench className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span>
                  {language === 'ta' ? 'இலவச தொழில்முறை ஃபிட்டிங்' : 'Free Installation by Expert'}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Title, Pricing & Specs */}
          <div className="space-y-4 flex flex-col justify-between">
            <div>
              {/* Brand and Ratings */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase text-luminexs-blue bg-blue-50 px-2.5 py-1 rounded-md tracking-wider">
                  {selectedProduct.brand}
                </span>
                <div className="flex items-center gap-1 bg-emerald-700 text-white px-2 py-0.5 rounded text-xs font-bold">
                  <span>{selectedProduct.rating}</span>
                  <Star className="w-3 h-3 fill-white" />
                </div>
                <span className="text-xs text-gray-500">
                  ({selectedProduct.reviewsCount} {language === 'ta' ? 'வாடிக்கையாளர் மதிப்புரைகள்' : 'Verified Reviews'})
                </span>
              </div>

              {/* Title */}
              <h2 className="text-lg sm:text-2xl font-black text-gray-950 mt-2 leading-tight">
                {selectedProduct.name}
              </h2>

              {/* Description */}
              <p className="text-xs sm:text-sm text-gray-600 mt-2 leading-relaxed">
                {language === 'ta' ? selectedProduct.descriptionTa : selectedProduct.descriptionEn}
              </p>

              {/* Pricing Box */}
              <div className="mt-4 p-4 rounded-2xl bg-gray-50 border border-gray-200/90 space-y-2">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl sm:text-3xl font-black text-gray-950">
                    ₹{currentPrice.toLocaleString('en-IN')}
                  </span>
                  <span className="text-sm text-gray-400 line-through">
                    ₹{selectedProduct.mrp.toLocaleString('en-IN')}
                  </span>
                  <span className="text-xs font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                    {discountPercent}% OFF
                  </span>
                </div>

                <p className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  {language === 'ta'
                    ? `மொத்தம் ரூ. ${totalSavings.toLocaleString('en-IN')} சேமிக்கிறீர்கள்!`
                    : `Total Savings: ₹${totalSavings.toLocaleString('en-IN')} off MRP!`}
                </p>

                {/* Old Battery Exchange Selector */}
                <div 
                  onClick={() => setWithExchange(!withExchange)}
                  className="mt-3 p-3 rounded-xl bg-white border border-emerald-300 hover:border-emerald-400 transition cursor-pointer flex items-center justify-between shadow-sm select-none"
                >
                  <div className="flex items-center gap-2">
                    <RefreshCw className={`w-4 h-4 ${withExchange ? 'text-emerald-600' : 'text-gray-400'}`} />
                    <div>
                      <p className="text-xs font-extrabold text-gray-900">
                        {language === 'ta' ? 'பழைய பேட்டரி எக்ஸ்சேஞ்ச் செய்கிறீர்களா?' : 'With Old Battery Return?'}
                      </p>
                      <p className="text-[11px] text-gray-500">
                        {language === 'ta'
                          ? `(உடனடி தள்ளுபடி: ரூ. ${(selectedProduct.price - selectedProduct.withOldBatteryPrice).toLocaleString('en-IN')})`
                          : `Instant scrap discount: ₹${(selectedProduct.price - selectedProduct.withOldBatteryPrice).toLocaleString('en-IN')}`}
                      </p>
                    </div>
                  </div>
                  <div className={`w-10 h-6 flex items-center rounded-full p-1 transition-colors ${withExchange ? 'bg-emerald-600' : 'bg-gray-300'}`}>
                    <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${withExchange ? 'translate-x-4' : 'translate-x-0'}`}></div>
                  </div>
                </div>
              </div>

              {/* Warranty Details Box */}
              <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-200/80 text-xs text-amber-900 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-extrabold">
                    {language === 'ta' ? 'வாரண்டி உத்தரவாதம்:' : 'Warranty Guarantee:'}
                  </span>{' '}
                  <span className="font-medium">{selectedProduct.warrantyDetails}</span>
                </div>
              </div>

              {/* Specifications Table (Amazon / Flipkart Style) */}
              <div className="mt-4">
                <h4 className="text-xs font-black uppercase text-gray-900 tracking-wider mb-2">
                  {language === 'ta' ? 'தொழில்நுட்ப விவரங்கள் (Specifications):' : 'Technical Specifications:'}
                </h4>
                <div className="rounded-xl border border-gray-200 overflow-hidden text-xs">
                  <table className="w-full text-left">
                    <tbody className="divide-y divide-gray-200">
                      <tr className="bg-gray-50">
                        <td className="py-2 px-3 font-semibold text-gray-600 w-1/3">Capacity / Ah</td>
                        <td className="py-2 px-3 font-bold text-gray-950">{selectedProduct.capacityAh} Ah (12V)</td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 font-semibold text-gray-600">Battery Type</td>
                        <td className="py-2 px-3 font-medium text-gray-900">{selectedProduct.specs.batteryType}</td>
                      </tr>
                      {selectedProduct.specs.terminalLayout && (
                        <tr className="bg-gray-50">
                          <td className="py-2 px-3 font-semibold text-gray-600">Terminal Layout</td>
                          <td className="py-2 px-3 font-medium text-gray-900">{selectedProduct.specs.terminalLayout}</td>
                        </tr>
                      )}
                      <tr>
                        <td className="py-2 px-3 font-semibold text-gray-600">Maintenance</td>
                        <td className="py-2 px-3 font-medium text-gray-900">{selectedProduct.specs.maintenance}</td>
                      </tr>
                      {selectedProduct.specs.dimensions && (
                        <tr className="bg-gray-50">
                          <td className="py-2 px-3 font-semibold text-gray-600">Dimensions</td>
                          <td className="py-2 px-3 font-medium text-gray-900">{selectedProduct.specs.dimensions}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Vehicle / Compatibility List */}
              {selectedProduct.compatibleVehicles && selectedProduct.compatibleVehicles.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-xs font-black uppercase text-gray-900 tracking-wider mb-2">
                    {language === 'ta' ? 'பொருந்தும் வாகனங்கள் / உபகரணங்கள்:' : 'Suitable For:'}
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedProduct.compatibleVehicles.map((veh, i) => (
                      <span
                        key={i}
                        className="bg-gray-100 text-gray-800 text-[11px] font-semibold px-2.5 py-1 rounded-md border border-gray-200"
                      >
                        ✓ {veh}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Modal Actions */}
            <div className="pt-4 border-t border-gray-200 grid grid-cols-2 gap-3">
              <button
                onClick={handleAddToCart}
                disabled={!selectedProduct.inStock}
                className={`py-3 px-4 rounded-xl font-extrabold text-sm transition-all flex items-center justify-center gap-2 shadow-md ${
                  selectedProduct.inStock
                    ? 'bg-yellow-400 hover:bg-yellow-500 text-gray-950 active:scale-95'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isAddedAnimation ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-800" />
                    <span>{language === 'ta' ? 'கார்ட்டில் உள்ளது!' : 'Added to Cart!'}</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" />
                    <span>{language === 'ta' ? 'கார்ட்டில் சேர்க்க' : 'Add to Cart'}</span>
                  </>
                )}
              </button>

              <button
                onClick={handleWhatsAppOrder}
                className="py-3 px-4 rounded-xl font-extrabold text-sm bg-emerald-600 hover:bg-emerald-700 text-white transition-all flex items-center justify-center gap-2 shadow-md active:scale-95"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>{language === 'ta' ? 'வாட்ஸ்அப் ஆர்டர்' : 'WhatsApp Order'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
