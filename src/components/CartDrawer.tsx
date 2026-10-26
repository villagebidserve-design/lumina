import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { createWhatsAppOrderLink } from '../utils/whatsapp';
import { 
  X, 
  Trash2, 
  Plus, 
  Minus, 
  RefreshCw, 
  MessageCircle, 
  ShoppingBag, 
  Truck, 
  ArrowRight
} from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const { 
    cart, 
    isCartOpen, 
    setIsCartOpen, 
    updateQuantity, 
    removeFromCart, 
    toggleCartItemExchange, 
    cartTotal, 
    cartSavings, 
    settings, 
    language,
    customerPincode
  } = useStore();

  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    address: '',
    pincode: customerPincode || '',
    notes: '',
  });

  React.useEffect(() => {
    if (customerPincode && !customerInfo.pincode) {
      setCustomerInfo((prev) => ({ ...prev, pincode: customerPincode }));
    }
  }, [customerPincode]);

  const [formError, setFormError] = useState('');

  if (!isCartOpen) return null;

  const handlePlaceOrder = () => {
    if (cart.length === 0) return;

    if (!customerInfo.name.trim() || !customerInfo.phone.trim()) {
      setFormError(
        language === 'ta'
          ? 'தயவுசெய்து உங்கள் பெயர் மற்றும் மொபைல் எண்ணை உள்ளிடவும்'
          : 'Please enter your Name and Mobile Number to place the order'
      );
      return;
    }

    setFormError('');
    const whatsappUrl = createWhatsAppOrderLink(cart, settings, customerInfo, language);
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm animate-fade-in flex justify-end">
      <div 
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-4 bg-luminexs-navy text-white flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-yellow-400" />
            <h2 className="font-extrabold text-base tracking-tight">
              {language === 'ta' ? 'உங்கள் ஆர்டர் கூடை (Cart)' : 'Your Shopping Cart'}
            </h2>
            <span className="bg-yellow-400 text-gray-950 font-black text-xs px-2 py-0.5 rounded-full">
              {cart.reduce((t, i) => t + i.quantity, 0)}
            </span>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="p-1.5 rounded-full hover:bg-white/10 text-gray-300 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 divide-y divide-gray-100">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
              <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                <ShoppingBag className="w-10 h-10" />
              </div>
              <div>
                <h3 className="font-bold text-gray-800 text-base">
                  {language === 'ta' ? 'உங்கள் கூடை காலியாக உள்ளது' : 'Your cart is empty'}
                </h3>
                <p className="text-xs text-gray-500 mt-1 max-w-xs">
                  {language === 'ta'
                    ? 'பேட்டரிகளை தேர்வு செய்து "கார்ட்டில் சேர்" என்பதை அழுத்தவும்.'
                    : 'Browse our high quality batteries and add items to place a fast WhatsApp order.'}
                </p>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="px-6 py-2.5 rounded-xl bg-luminexs-blue text-white font-bold text-xs shadow-md"
              >
                {language === 'ta' ? 'பேட்டரிகளைப் பார்க்க' : 'Start Shopping'}
              </button>
            </div>
          ) : (
            <>
              {cart.map((item) => {
                const unitPrice = item.withOldBattery ? item.product.withOldBatteryPrice : item.product.price;
                const itemTotal = unitPrice * item.quantity;

                return (
                  <div key={item.product.id} className="pt-3 first:pt-0 space-y-2">
                    <div className="flex gap-3 items-start">
                      {/* Product Thumbnail */}
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-16 h-16 object-contain rounded-lg bg-gray-50 p-1 border border-gray-200 flex-shrink-0"
                      />

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="font-bold text-xs text-gray-900 line-clamp-2 leading-tight">
                            {item.product.name}
                          </h4>
                          <button
                            onClick={() => removeFromCart(item.product.id)}
                            className="text-gray-400 hover:text-red-500 p-1 transition"
                            title="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <p className="text-[11px] text-gray-500 font-semibold mt-0.5">
                          {item.product.capacityAh} Ah • {item.product.warrantyMonths}M Warranty
                        </p>

                        {/* Price & Quantity Controls */}
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-baseline gap-1.5">
                            <span className="font-black text-sm text-gray-950">
                              ₹{itemTotal.toLocaleString('en-IN')}
                            </span>
                            {item.quantity > 1 && (
                              <span className="text-[10px] text-gray-500">
                                (₹{unitPrice.toLocaleString('en-IN')} each)
                              </span>
                            )}
                          </div>

                          {/* Stepper */}
                          <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden bg-gray-50">
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                              className="px-2 py-1 hover:bg-gray-200 text-gray-700"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-2.5 text-xs font-black text-gray-900">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                              className="px-2 py-1 hover:bg-gray-200 text-gray-700"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Old Battery Toggle for this item */}
                    <div 
                      onClick={() => toggleCartItemExchange(item.product.id)}
                      className="p-2 rounded-lg bg-emerald-50/70 border border-emerald-200/70 flex items-center justify-between text-[11px] cursor-pointer hover:bg-emerald-100/70 transition"
                    >
                      <div className="flex items-center gap-1.5 text-emerald-900">
                        <RefreshCw className={`w-3.5 h-3.5 ${item.withOldBattery ? 'text-emerald-700' : 'text-gray-400'}`} />
                        <span className="font-semibold">
                          {language === 'ta' ? 'பழைய பேட்டரி எக்ஸ்சேஞ்ச்' : 'Old Battery Exchange'}
                        </span>
                      </div>
                      <span className="font-black text-emerald-800">
                        {item.withOldBattery ? 'YES (-₹' + (item.product.price - item.product.withOldBatteryPrice).toLocaleString('en-IN') + ')' : 'NO'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>

        {/* Cart Bottom Checkout Area */}
        {cart.length > 0 && (
          <div className="p-4 bg-gray-50 border-t border-gray-200 space-y-3">
            {/* Delivery Form */}
            <div className="space-y-2 bg-white p-3 rounded-xl border border-gray-200 text-xs">
              <p className="font-bold text-gray-900 flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-emerald-600" />
                <span>
                  {language === 'ta' ? 'டெலிவரி விவரங்கள் (Delivery Info):' : 'Doorstep Delivery Info:'}
                </span>
              </p>

              {formError && (
                <p className="text-[11px] text-red-600 font-bold bg-red-50 p-1.5 rounded">
                  ⚠️ {formError}
                </p>
              )}

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder={language === 'ta' ? 'உங்கள் பெயர் *' : 'Your Name *'}
                  value={customerInfo.name}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                  className="px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-1 focus:ring-yellow-400 focus:outline-none"
                />
                <input
                  type="tel"
                  placeholder={language === 'ta' ? 'மொபைல் எண் *' : 'Phone Number *'}
                  value={customerInfo.phone}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                  className="px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-1 focus:ring-yellow-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <input
                  type="text"
                  placeholder={language === 'ta' ? 'முகவரி / பகுதி (Area) *' : 'Delivery Address *'}
                  value={customerInfo.address}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
                  className="col-span-2 px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-1 focus:ring-yellow-400 focus:outline-none"
                />
                <input
                  type="text"
                  maxLength={6}
                  placeholder={language === 'ta' ? 'பின்கோடு' : 'Pincode'}
                  value={customerInfo.pincode}
                  onChange={(e) => setCustomerInfo({ ...customerInfo, pincode: e.target.value })}
                  className="px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-1 focus:ring-yellow-400 focus:outline-none font-medium"
                />
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="space-y-1.5 text-xs text-gray-600 pt-1">
              <div className="flex justify-between">
                <span>{language === 'ta' ? 'டெலிவரி & ஃபிட்டிங் கட்டணம்:' : 'Doorstep Delivery & Installation:'}</span>
                <span className="font-extrabold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded text-[10px]">
                  FREE
                </span>
              </div>
              <div className="flex justify-between">
                <span>{language === 'ta' ? 'மொத்த சேமிப்பு (Savings):' : 'Total Discount Savings:'}</span>
                <span className="font-bold text-emerald-700">₹{cartSavings.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-base font-black text-gray-950 pt-1 border-t border-gray-200">
                <span>{language === 'ta' ? 'செலுத்த வேண்டிய மொத்தத் தொகை:' : 'Total Amount Payable:'}</span>
                <span className="text-emerald-700">₹{cartTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Place Order on WhatsApp Button */}
            <button
              onClick={handlePlaceOrder}
              className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm transition-all shadow-lg hover:shadow-emerald-600/30 flex items-center justify-center gap-2 active:scale-95"
            >
              <MessageCircle className="w-5 h-5 fill-white" />
              <span>
                {language === 'ta' ? 'வாட்ஸ்அப்-ல் ஆர்டர் செய்க (Place Order)' : 'Place Order via WhatsApp'}
              </span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
