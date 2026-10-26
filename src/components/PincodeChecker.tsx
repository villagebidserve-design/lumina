import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { MapPin, Zap, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

export const PincodeChecker: React.FC = () => {
  const { customerPincode, setCustomerPincode, language, settings } = useStore();
  const [inputVal, setInputVal] = useState(customerPincode);
  const [feedback, setFeedback] = useState<{
    type: 'express' | 'standard' | 'invalid' | 'idle';
    messageEn: string;
    messageTa: string;
  }>(() => {
    if (customerPincode && customerPincode.length === 6) {
      if (customerPincode.startsWith('6')) {
        return {
          type: 'express',
          messageEn: `⚡ Express 30-45 Mins Delivery & Free Fitting available in ${customerPincode}!`,
          messageTa: `⚡ பின்கோடு ${customerPincode}-ல் 30-45 நிமிட இலவச டோர்ஸ்டெப் டெலிவரி & ஃபிட்டிங் வசதி உள்ளது!`
        };
      }
      return {
        type: 'standard',
        messageEn: `🚚 Standard Delivery available to Pincode ${customerPincode} (2-3 days).`,
        messageTa: `🚚 பின்கோடு ${customerPincode}-க்கு கூரியர் டெலிவரி வசதி உள்ளது (2-3 நாட்கள்).`
      };
    }
    return { type: 'idle', messageEn: '', messageTa: '' };
  });

  const checkPincode = (pin: string) => {
    const clean = pin.trim().replace(/[^0-9]/g, '');
    if (clean.length !== 6) {
      setFeedback({
        type: 'invalid',
        messageEn: 'Please enter a valid 6-digit Pincode.',
        messageTa: 'தயவுசெய்து சரியான 6 இலக்க பின்கோடை உள்ளிடவும்.'
      });
      return;
    }

    setCustomerPincode(clean);

    // Tamil Nadu & Puducherry postal codes start with 60 to 64
    if (clean.startsWith('6')) {
      setFeedback({
        type: 'express',
        messageEn: `⚡ Express 30-45 Mins Delivery & Free Fitting confirmed for ${clean}!`,
        messageTa: `⚡ பின்கோடு ${clean}-ல் 30-45 நிமிட இலவச டோர்ஸ்டெப் டெலிவரி & ஃபிட்டிங் வசதி உறுதி செய்யப்பட்டது!`
      });
    } else {
      setFeedback({
        type: 'standard',
        messageEn: `🚚 Courier Delivery available to Pincode ${clean} (2-3 business days).`,
        messageTa: `🚚 பின்கோடு ${clean}-க்கு கூரியர் டெலிவரி வசதி உள்ளது (2-3 நாட்கள்).`
      });
    }
  };

  const handleQuickCity = (pin: string) => {
    setInputVal(pin);
    checkPincode(pin);
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 my-4 w-full">
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left Side: Headline & City Quick Pills */}
        <div className="space-y-1.5 flex-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-yellow-400 text-gray-950 rounded-lg">
              <MapPin className="w-4 h-4 text-gray-950" />
            </span>
            <h3 className="font-extrabold text-sm sm:text-base text-gray-950">
              {language === 'ta'
                ? 'உங்கள் பகுதியில் 30-45 நிமிட அவசர டெலிவரி சரிபார்க்கவும்'
                : 'Check Doorstep Delivery & 45-Min Express Fitting in Your Area'}
            </h3>
          </div>
          <p className="text-xs text-gray-500">
            {language === 'ta'
              ? `${settings.city} மற்றும் தமிழ்நாடு முழுவதும் உடனடி பொருத்துதல் சேவை உள்ளது.`
              : `Express battery delivery with trained technicians for ${settings.city} & Tamil Nadu.`}
          </p>

          {/* Quick Popular Cities in Tamil Nadu */}
          <div className="pt-1 flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-[11px] font-semibold text-gray-400">{language === 'ta' ? 'முக்கிய நகரங்கள்:' : 'Quick Select:'}</span>
            <button
              type="button"
              onClick={() => handleQuickCity('600001')}
              className="px-2 py-0.5 rounded-md bg-gray-100 hover:bg-yellow-400 text-gray-700 hover:text-gray-950 font-bold text-[11px] transition"
            >
              Chennai (600001)
            </button>
            <button
              type="button"
              onClick={() => handleQuickCity('641001')}
              className="px-2 py-0.5 rounded-md bg-gray-100 hover:bg-yellow-400 text-gray-700 hover:text-gray-950 font-bold text-[11px] transition"
            >
              Coimbatore (641001)
            </button>
            <button
              type="button"
              onClick={() => handleQuickCity('625001')}
              className="px-2 py-0.5 rounded-md bg-gray-100 hover:bg-yellow-400 text-gray-700 hover:text-gray-950 font-bold text-[11px] transition"
            >
              Madurai (625001)
            </button>
            <button
              type="button"
              onClick={() => handleQuickCity('636001')}
              className="px-2 py-0.5 rounded-md bg-gray-100 hover:bg-yellow-400 text-gray-700 hover:text-gray-950 font-bold text-[11px] transition"
            >
              Salem (636001)
            </button>
            <button
              type="button"
              onClick={() => handleQuickCity('620001')}
              className="px-2 py-0.5 rounded-md bg-gray-100 hover:bg-yellow-400 text-gray-700 hover:text-gray-950 font-bold text-[11px] transition"
            >
              Trichy (620001)
            </button>
          </div>
        </div>

        {/* Right Side: Input & Verification Status */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <div className="relative">
            <input
              type="text"
              maxLength={6}
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') checkPincode(inputVal);
              }}
              placeholder={language === 'ta' ? '6-இலக்க பின்கோடு' : 'Enter 6-digit Pincode'}
              className="w-full sm:w-44 px-3.5 py-2.5 rounded-xl border border-gray-300 text-xs font-bold text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
            {customerPincode && customerPincode === inputVal && (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 absolute right-3 top-3 pointer-events-none" />
            )}
          </div>

          <button
            type="button"
            onClick={() => checkPincode(inputVal)}
            className="px-4 py-2.5 bg-luminexs-navy hover:bg-blue-900 text-white font-extrabold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5"
          >
            <Zap className="w-3.5 h-3.5 text-yellow-400" />
            <span>{language === 'ta' ? 'சரிபார்' : 'Check'}</span>
          </button>
        </div>
      </div>

      {/* Pincode Result Banner */}
      {feedback.type !== 'idle' && (
        <div
          className={`mt-2 p-2.5 px-4 rounded-xl text-xs font-bold flex items-center gap-2 animate-fade-in ${
            feedback.type === 'express'
              ? 'bg-emerald-50 text-emerald-900 border border-emerald-300'
              : feedback.type === 'standard'
              ? 'bg-blue-50 text-blue-900 border border-blue-300'
              : 'bg-red-50 text-red-900 border border-red-300'
          }`}
        >
          {feedback.type === 'express' && <Clock className="w-4 h-4 text-emerald-600 flex-shrink-0" />}
          {feedback.type === 'standard' && <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0" />}
          {feedback.type === 'invalid' && <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />}
          <span>{language === 'ta' ? feedback.messageTa : feedback.messageEn}</span>
        </div>
      )}
    </div>
  );
};