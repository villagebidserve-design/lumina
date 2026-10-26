import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { 
  Car, 
  Bike, 
  Truck, 
  Zap, 
  Search, 
  CheckCircle2, 
  RotateCcw, 
  MessageCircle,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import { ProductCategory } from '../types';

interface ModelRecommendation {
  model: string;
  recommendedAh: number;
  terminal: string;
  category: ProductCategory;
  searchKeyword: string;
  badge: string;
}

interface MakerData {
  maker: string;
  models: ModelRecommendation[];
}

const VEHICLE_DATABASE: Record<'car' | 'bike' | 'commercial' | 'inverter', MakerData[]> = {
  car: [
    {
      maker: 'Maruti Suzuki',
      models: [
        { model: 'Swift (Petrol)', recommendedAh: 35, terminal: 'Right (+)', category: 'car', searchKeyword: '35Ah', badge: 'Ultra-Luminexs 35Ah (ULTRA-35R)' },
        { model: 'Swift (Diesel)', recommendedAh: 45, terminal: 'Left (+)', category: 'car', searchKeyword: '45Ah', badge: 'Ultra-Luminexs 45Ah (ULTRA-45L)' },
        { model: 'Alto 800 / K10', recommendedAh: 35, terminal: 'Right (+)', category: 'car', searchKeyword: '35Ah', badge: 'Ultra-Luminexs 35Ah (ULTRA-35R)' },
        { model: 'WagonR (Petrol)', recommendedAh: 35, terminal: 'Right (+)', category: 'car', searchKeyword: '35Ah', badge: 'Ultra-Luminexs 35Ah (ULTRA-35R)' },
        { model: 'Baleno (Petrol/Diesel)', recommendedAh: 45, terminal: 'Left (+)', category: 'car', searchKeyword: '45Ah', badge: 'Ultra-Luminexs 45Ah (ULTRA-45L)' },
        { model: 'Brezza', recommendedAh: 45, terminal: 'Left (+)', category: 'car', searchKeyword: '45Ah', badge: 'Ultra-Luminexs 45Ah (ULTRA-45L)' },
        { model: 'Dzire (Petrol)', recommendedAh: 35, terminal: 'Right (+)', category: 'car', searchKeyword: '35Ah', badge: 'Ultra-Luminexs 35Ah (ULTRA-35R)' },
        { model: 'Ertiga', recommendedAh: 45, terminal: 'Left (+)', category: 'car', searchKeyword: '45Ah', badge: 'Ultra-Luminexs 45Ah (ULTRA-45L)' },
        { model: 'Celerio', recommendedAh: 35, terminal: 'Right (+)', category: 'car', searchKeyword: '35Ah', badge: 'Ultra-Luminexs 35Ah (ULTRA-35R)' }
      ]
    },
    {
      maker: 'Hyundai',
      models: [
        { model: 'i20 (Petrol/Diesel)', recommendedAh: 45, terminal: 'Left (+)', category: 'car', searchKeyword: '45Ah', badge: 'Ultra-Luminexs 45Ah (ULTRA-45L)' },
        { model: 'Creta (Petrol/Diesel)', recommendedAh: 45, terminal: 'Left (+)', category: 'car', searchKeyword: '45Ah', badge: 'Ultra-Luminexs 45Ah (ULTRA-45L)' },
        { model: 'Santro', recommendedAh: 35, terminal: 'Right (+)', category: 'car', searchKeyword: '35Ah', badge: 'Ultra-Luminexs 35Ah (ULTRA-35R)' },
        { model: 'Grand i10 / Nios', recommendedAh: 45, terminal: 'Left (+)', category: 'car', searchKeyword: '45Ah', badge: 'Ultra-Luminexs 45Ah (ULTRA-45L)' },
        { model: 'Verna', recommendedAh: 45, terminal: 'Left (+)', category: 'car', searchKeyword: '45Ah', badge: 'Ultra-Luminexs 45Ah (ULTRA-45L)' },
        { model: 'Venue', recommendedAh: 45, terminal: 'Left (+)', category: 'car', searchKeyword: '45Ah', badge: 'Ultra-Luminexs 45Ah (ULTRA-45L)' }
      ]
    },
    {
      maker: 'Tata Motors',
      models: [
        { model: 'Tiago (Petrol)', recommendedAh: 35, terminal: 'Right (+)', category: 'car', searchKeyword: '35Ah', badge: 'Ultra-Luminexs 35Ah (ULTRA-35R)' },
        { model: 'Altroz', recommendedAh: 45, terminal: 'Left (+)', category: 'car', searchKeyword: '45Ah', badge: 'Ultra-Luminexs 45Ah (ULTRA-45L)' },
        { model: 'Nexon', recommendedAh: 45, terminal: 'Left (+)', category: 'car', searchKeyword: '45Ah', badge: 'Ultra-Luminexs 45Ah (ULTRA-45L)' },
        { model: 'Punch', recommendedAh: 35, terminal: 'Right (+)', category: 'car', searchKeyword: '35Ah', badge: 'Ultra-Luminexs 35Ah (ULTRA-35R)' },
        { model: 'Tigor', recommendedAh: 35, terminal: 'Right (+)', category: 'car', searchKeyword: '35Ah', badge: 'Ultra-Luminexs 35Ah (ULTRA-35R)' }
      ]
    },
    {
      maker: 'Honda',
      models: [
        { model: 'City (All Generations)', recommendedAh: 45, terminal: 'Left (+)', category: 'car', searchKeyword: '45Ah', badge: 'Ultra-Luminexs 45Ah (ULTRA-45L)' },
        { model: 'Amaze (Petrol)', recommendedAh: 35, terminal: 'Right (+)', category: 'car', searchKeyword: '35Ah', badge: 'Ultra-Luminexs 35Ah (ULTRA-35R)' },
        { model: 'Amaze (Diesel)', recommendedAh: 45, terminal: 'Left (+)', category: 'car', searchKeyword: '45Ah', badge: 'Ultra-Luminexs 45Ah (ULTRA-45L)' },
        { model: 'WR-V / Jazz', recommendedAh: 45, terminal: 'Left (+)', category: 'car', searchKeyword: '45Ah', badge: 'Ultra-Luminexs 45Ah (ULTRA-45L)' }
      ]
    },
    {
      maker: 'Kia',
      models: [
        { model: 'Seltos', recommendedAh: 45, terminal: 'Left (+)', category: 'car', searchKeyword: '45Ah', badge: 'Ultra-Luminexs 45Ah (ULTRA-45L)' },
        { model: 'Sonet', recommendedAh: 45, terminal: 'Left (+)', category: 'car', searchKeyword: '45Ah', badge: 'Ultra-Luminexs 45Ah (ULTRA-45L)' },
        { model: 'Carens', recommendedAh: 45, terminal: 'Left (+)', category: 'car', searchKeyword: '45Ah', badge: 'Ultra-Luminexs 45Ah (ULTRA-45L)' }
      ]
    }
  ],
  bike: [
    {
      maker: 'Honda (Two-Wheelers)',
      models: [
        { model: 'Activa 3G / 4G / 5G / 6G', recommendedAh: 5, terminal: 'Standard VRLA', category: 'bike', searchKeyword: '5Ah', badge: 'Ultra-Luminexs MotoPro 5Ah' },
        { model: 'Dio / Grazia', recommendedAh: 5, terminal: 'Standard VRLA', category: 'bike', searchKeyword: '5Ah', badge: 'Ultra-Luminexs MotoPro 5Ah' },
        { model: 'Shine / SP 125', recommendedAh: 5, terminal: 'Standard VRLA', category: 'bike', searchKeyword: '5Ah', badge: 'Ultra-Luminexs MotoPro 5Ah' },
        { model: 'Unicorn 150 / 160', recommendedAh: 5, terminal: 'Standard VRLA', category: 'bike', searchKeyword: '5Ah', badge: 'Ultra-Luminexs MotoPro 5Ah' }
      ]
    },
    {
      maker: 'Hero MotoCorp',
      models: [
        { model: 'Splendor Plus (Self Start)', recommendedAh: 5, terminal: 'Standard VRLA', category: 'bike', searchKeyword: '5Ah', badge: 'Ultra-Luminexs MotoPro 5Ah' },
        { model: 'Passion Pro', recommendedAh: 5, terminal: 'Standard VRLA', category: 'bike', searchKeyword: '5Ah', badge: 'Ultra-Luminexs MotoPro 5Ah' },
        { model: 'HF Deluxe (Self Start)', recommendedAh: 5, terminal: 'Standard VRLA', category: 'bike', searchKeyword: '5Ah', badge: 'Ultra-Luminexs MotoPro 5Ah' },
        { model: 'Glamour 125', recommendedAh: 5, terminal: 'Standard VRLA', category: 'bike', searchKeyword: '5Ah', badge: 'Ultra-Luminexs MotoPro 5Ah' }
      ]
    },
    {
      maker: 'Royal Enfield',
      models: [
        { model: 'Classic 350 / 500 (Self Start)', recommendedAh: 14, terminal: 'Side Post', category: 'bike', searchKeyword: '14Ah', badge: 'Ultra-Luminexs Bullet 14Ah' },
        { model: 'Bullet Electra 350', recommendedAh: 14, terminal: 'Side Post', category: 'bike', searchKeyword: '14Ah', badge: 'Ultra-Luminexs Bullet 14Ah' },
        { model: 'Thunderbird 350 / 500', recommendedAh: 14, terminal: 'Side Post', category: 'bike', searchKeyword: '14Ah', badge: 'Ultra-Luminexs Bullet 14Ah' },
        { model: 'Hunter 350 / Meteor 350', recommendedAh: 14, terminal: 'Side Post', category: 'bike', searchKeyword: '14Ah', badge: 'Ultra-Luminexs Bullet 14Ah' }
      ]
    },
    {
      maker: 'Bajaj',
      models: [
        { model: 'Pulsar 150 / 180 / 220', recommendedAh: 5, terminal: 'Standard VRLA', category: 'bike', searchKeyword: '5Ah', badge: 'Ultra-Luminexs MotoPro 5Ah' },
        { model: 'Platina (Electric Start)', recommendedAh: 5, terminal: 'Standard VRLA', category: 'bike', searchKeyword: '5Ah', badge: 'Ultra-Luminexs MotoPro 5Ah' },
        { model: 'Avenger 160 / 220', recommendedAh: 5, terminal: 'Standard VRLA', category: 'bike', searchKeyword: '5Ah', badge: 'Ultra-Luminexs MotoPro 5Ah' }
      ]
    },
    {
      maker: 'TVS Motor',
      models: [
        { model: 'Jupiter', recommendedAh: 5, terminal: 'Standard VRLA', category: 'bike', searchKeyword: '5Ah', badge: 'Ultra-Luminexs MotoPro 5Ah' },
        { model: 'Scooty Zest / Pep+', recommendedAh: 5, terminal: 'Standard VRLA', category: 'bike', searchKeyword: '5Ah', badge: 'Ultra-Luminexs MotoPro 5Ah' },
        { model: 'Apache RTR 160 / 180 / 200', recommendedAh: 5, terminal: 'Standard VRLA', category: 'bike', searchKeyword: '5Ah', badge: 'Ultra-Luminexs MotoPro 5Ah' },
        { model: 'Raider 125', recommendedAh: 5, terminal: 'Standard VRLA', category: 'bike', searchKeyword: '5Ah', badge: 'Ultra-Luminexs MotoPro 5Ah' }
      ]
    },
    {
      maker: 'Yamaha',
      models: [
        { model: 'FZ / FZS Fi', recommendedAh: 5, terminal: 'Standard VRLA', category: 'bike', searchKeyword: '5Ah', badge: 'Ultra-Luminexs MotoPro 5Ah' },
        { model: 'Fascino 125 / RayZR', recommendedAh: 5, terminal: 'Standard VRLA', category: 'bike', searchKeyword: '5Ah', badge: 'Ultra-Luminexs MotoPro 5Ah' },
        { model: 'R15 V3 / V4', recommendedAh: 5, terminal: 'Standard VRLA', category: 'bike', searchKeyword: '5Ah', badge: 'Ultra-Luminexs MotoPro 5Ah' }
      ]
    }
  ],
  commercial: [
    {
      maker: 'Mahindra Tractors & Commercial',
      models: [
        { model: 'All Mahindra Tractors (575 DI, 275, 475)', recommendedAh: 88, terminal: 'Commercial Post', category: 'commercial', searchKeyword: '88Ah', badge: 'Ultra-Luminexs HeavyDuty 88Ah' },
        { model: 'Bolero Maxi Truck / Camper', recommendedAh: 88, terminal: 'Commercial Post', category: 'commercial', searchKeyword: '88Ah', badge: 'Ultra-Luminexs HeavyDuty 88Ah' }
      ]
    },
    {
      maker: 'Tata Commercial',
      models: [
        { model: 'Tata Ace (Chota Hathi)', recommendedAh: 88, terminal: 'Commercial Post', category: 'commercial', searchKeyword: '88Ah', badge: 'Ultra-Luminexs HeavyDuty 88Ah' },
        { model: 'Tata Intra V30 / V50', recommendedAh: 88, terminal: 'Commercial Post', category: 'commercial', searchKeyword: '88Ah', badge: 'Ultra-Luminexs HeavyDuty 88Ah' }
      ]
    },
    {
      maker: 'Ashok Leyland',
      models: [
        { model: 'Dost / Dost Strong', recommendedAh: 88, terminal: 'Commercial Post', category: 'commercial', searchKeyword: '88Ah', badge: 'Ultra-Luminexs HeavyDuty 88Ah' },
        { model: 'Bada Dost i3 / i4', recommendedAh: 88, terminal: 'Commercial Post', category: 'commercial', searchKeyword: '88Ah', badge: 'Ultra-Luminexs HeavyDuty 88Ah' }
      ]
    },
    {
      maker: 'John Deere / Sonalika / Massey',
      models: [
        { model: 'John Deere 5050D / 5105', recommendedAh: 88, terminal: 'Commercial Post', category: 'commercial', searchKeyword: '88Ah', badge: 'Ultra-Luminexs HeavyDuty 88Ah' },
        { model: 'Sonalika DI 745 / 35', recommendedAh: 88, terminal: 'Commercial Post', category: 'commercial', searchKeyword: '88Ah', badge: 'Ultra-Luminexs HeavyDuty 88Ah' },
        { model: 'Massey Ferguson 241 DI / 1035', recommendedAh: 88, terminal: 'Commercial Post', category: 'commercial', searchKeyword: '88Ah', badge: 'Ultra-Luminexs HeavyDuty 88Ah' }
      ]
    }
  ],
  inverter: [
    {
      maker: 'Home Power Backup (1 to 2 BHK)',
      models: [
        { model: 'Standard Home: 3 Fans + 4 LED Lights + TV (6-9 Hrs)', recommendedAh: 150, terminal: 'Tall Tubular L-Type', category: 'inverter', searchKeyword: '150Ah', badge: 'Ultra-Luminexs 150Ah Dura-Tube' }
      ]
    },
    {
      maker: 'Heavy Commercial / Large Home (3 to 4 BHK)',
      models: [
        { model: 'Supermarket, Clinic, Large Home: 10-14 Hrs Backup', recommendedAh: 220, terminal: 'Jumbo Terminal Post', category: 'inverter', searchKeyword: '220Ah', badge: 'Ultra-Luminexs 220Ah MaxPower' }
      ]
    },
    {
      maker: 'Solar Rooftop & Off-Grid Hybrid',
      models: [
        { model: 'Rooftop Solar 1kW - 5kW Systems (C10 Certified)', recommendedAh: 150, terminal: 'Brass Bolt C10', category: 'inverter', searchKeyword: 'Solar 150Ah', badge: 'Ultra-Luminexs Solura-X 150Ah C10' }
      ]
    }
  ]
};

export const VehicleFinder: React.FC = () => {
  const { setSelectedCategory, setSearchQuery, language, settings } = useStore();

  const [selectedType, setSelectedType] = useState<'car' | 'bike' | 'commercial' | 'inverter'>('car');
  const [selectedMaker, setSelectedMaker] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('');
  const [matchedRecommendation, setMatchedRecommendation] = useState<ModelRecommendation | null>(null);

  // Available makers for current vehicle type
  const availableMakers = VEHICLE_DATABASE[selectedType] || [];

  // Available models for current maker
  const availableModels = selectedMaker
    ? availableMakers.find((m) => m.maker === selectedMaker)?.models || []
    : [];

  const handleTypeChange = (type: 'car' | 'bike' | 'commercial' | 'inverter') => {
    setSelectedType(type);
    setSelectedMaker('');
    setSelectedModel('');
    setMatchedRecommendation(null);
  };

  const handleMakerChange = (maker: string) => {
    setSelectedMaker(maker);
    setSelectedModel('');
    setMatchedRecommendation(null);
  };

  const handleModelChange = (modelName: string) => {
    setSelectedModel(modelName);
    const found = availableModels.find((m) => m.model === modelName);
    if (found) {
      setMatchedRecommendation(found);
    } else {
      setMatchedRecommendation(null);
    }
  };

  const handleApplyFilter = () => {
    if (!matchedRecommendation) return;

    // Set category & search filter
    setSelectedCategory(matchedRecommendation.category);
    setSearchQuery(`${matchedRecommendation.recommendedAh}ah`);

    // Smooth scroll down to product catalog
    const el = document.getElementById('products-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleReset = () => {
    setSelectedMaker('');
    setSelectedModel('');
    setMatchedRecommendation(null);
    setSearchQuery('');
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 mt-4 sm:mt-6 w-full">
      <div className="bg-gradient-to-br from-luminexs-navy via-[#0d1f4d] to-[#08122c] rounded-2xl sm:rounded-3xl p-4 sm:p-7 text-white shadow-xl border border-yellow-400/20 relative overflow-hidden">
        {/* Glow Accent */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Title Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-yellow-400 text-gray-950 px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider mb-1.5 shadow">
              <Zap className="w-3.5 h-3.5 fill-gray-950" />
              <span>{language === 'ta' ? 'ஸ்மார்ட் பேட்டரி ஃபைண்டர்' : 'Smart Battery Finder'}</span>
            </div>
            <h2 className="text-lg sm:text-2xl font-black tracking-tight flex items-center gap-2">
              <span>
                {language === 'ta'
                  ? 'உங்கள் வாகனத்திற்கான சரியான பேட்டரியைக் கண்டறியுங்கள்'
                  : 'Find the 100% Guaranteed Fit Battery for Your Vehicle'}
              </span>
            </h2>
            <p className="text-xs text-gray-300">
              {language === 'ta'
                ? 'வாகன வகை, பிராண்ட் மற்றும் மாடலை தேர்வு செய்து சரியான ஆம்பியர் (Ah) அளவை பெறுங்கள்.'
                : 'Select vehicle make & model to get factory specification, terminal direction & instant doorstep fitting.'}
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-emerald-400 font-bold bg-white/5 border border-emerald-500/30 px-3 py-1.5 rounded-xl self-start md:self-auto">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>{language === 'ta' ? '100% ஃபிட்டிங் உத்தரவாதம்' : '100% Fitment Guarantee'}</span>
          </div>
        </div>

        {/* Step 1: Vehicle Category Selector Tabs */}
        <div className="pt-4 flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => handleTypeChange('car')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black transition ${
              selectedType === 'car'
                ? 'bg-yellow-400 text-gray-950 shadow-lg scale-102'
                : 'bg-white/10 text-gray-200 hover:bg-white/15'
            }`}
          >
            <Car className="w-4 h-4" />
            <span>{language === 'ta' ? 'கார்கள் & SUV' : 'Cars & SUVs'}</span>
          </button>

          <button
            type="button"
            onClick={() => handleTypeChange('bike')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black transition ${
              selectedType === 'bike'
                ? 'bg-yellow-400 text-gray-950 shadow-lg scale-102'
                : 'bg-white/10 text-gray-200 hover:bg-white/15'
            }`}
          >
            <Bike className="w-4 h-4" />
            <span>{language === 'ta' ? 'பைக் & ஸ்கூட்டர்கள்' : 'Bikes & Scooters'}</span>
          </button>

          <button
            type="button"
            onClick={() => handleTypeChange('commercial')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black transition ${
              selectedType === 'commercial'
                ? 'bg-yellow-400 text-gray-950 shadow-lg scale-102'
                : 'bg-white/10 text-gray-200 hover:bg-white/15'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>{language === 'ta' ? 'டிராக்டர் & லோடு வண்டி' : 'Tractors & Commercial'}</span>
          </button>

          <button
            type="button"
            onClick={() => handleTypeChange('inverter')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black transition ${
              selectedType === 'inverter'
                ? 'bg-yellow-400 text-gray-950 shadow-lg scale-102'
                : 'bg-white/10 text-gray-200 hover:bg-white/15'
            }`}
          >
            <Zap className="w-4 h-4 text-yellow-500" />
            <span>{language === 'ta' ? 'வீட்டு இன்வெர்ட்டர் & சோலார்' : 'Home Inverter & Solar'}</span>
          </button>
        </div>

        {/* Step 2 & 3: Dropdowns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 pt-4">
          {/* Select Maker */}
          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1">
              {language === 'ta' ? '1. நிறுவனத்தைத் தேர்ந்தெடுக்கவும் (Brand)' : '1. Select Vehicle Maker / Brand:'}
            </label>
            <select
              value={selectedMaker}
              onChange={(e) => handleMakerChange(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-white text-gray-900 font-bold text-xs focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow cursor-pointer"
            >
              <option value="">{language === 'ta' ? '-- பிராண்டைத் தேர்வு செய்க --' : '-- Choose Brand --'}</option>
              {availableMakers.map((m) => (
                <option key={m.maker} value={m.maker}>
                  {m.maker}
                </option>
              ))}
            </select>
          </div>

          {/* Select Model */}
          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1">
              {language === 'ta' ? '2. வாகன மாடலைத் தேர்ந்தெடுக்கவும்' : '2. Select Vehicle Model:'}
            </label>
            <select
              value={selectedModel}
              onChange={(e) => handleModelChange(e.target.value)}
              disabled={!selectedMaker}
              className={`w-full p-2.5 rounded-xl text-gray-900 font-bold text-xs focus:outline-none focus:ring-2 focus:ring-yellow-400 shadow cursor-pointer ${
                !selectedMaker ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-white'
              }`}
            >
              <option value="">
                {!selectedMaker
                  ? (language === 'ta' ? 'முதலில் பிராண்டைத் தேர்ந்தெடுக்கவும்' : 'Choose Brand First')
                  : (language === 'ta' ? '-- மாடலைத் தேர்வு செய்க --' : '-- Choose Model --')}
              </option>
              {availableModels.map((m) => (
                <option key={m.model} value={m.model}>
                  {m.model}
                </option>
              ))}
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex items-end gap-2">
            <button
              type="button"
              onClick={handleApplyFilter}
              disabled={!matchedRecommendation}
              className={`flex-1 p-2.5 rounded-xl font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg transition transform active:scale-95 ${
                matchedRecommendation
                  ? 'bg-yellow-400 hover:bg-yellow-500 text-gray-950 cursor-pointer animate-pulse'
                  : 'bg-white/20 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>{language === 'ta' ? 'பொருத்தமான பேட்டரியைக் காட்டு' : 'Show Matching Batteries'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {(selectedMaker || selectedModel) && (
              <button
                type="button"
                onClick={handleReset}
                className="p-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition"
                title="Reset Finder"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Live Recommendation Result Box */}
        {matchedRecommendation && (
          <div className="mt-4 p-3.5 sm:p-4 bg-emerald-500/20 border border-emerald-400/50 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/30 text-emerald-400 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-black text-white">
                  {language === 'ta' ? 'பரிந்துரைக்கப்பட்ட பேட்டரி:' : 'Recommended Battery for:'}{' '}
                  <span className="text-yellow-300 font-extrabold">{matchedRecommendation.model}</span>
                </p>
                <p className="text-[11px] text-gray-300">
                  ⚡ <strong>{matchedRecommendation.recommendedAh} Ah Capacity</strong> • {matchedRecommendation.terminal} Layout • {matchedRecommendation.badge}
                </p>
              </div>
            </div>

            <button
              onClick={handleApplyFilter}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-black rounded-xl text-xs shadow-md transition flex items-center gap-1.5 self-end sm:self-auto"
            >
              <span>{language === 'ta' ? 'விலை & ஆர்டர் விவரம்' : 'View Price & Order'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Vehicle not listed WhatsApp banner */}
        <div className="mt-3 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-[11px] text-gray-300">
          <span>
            {language === 'ta'
              ? 'உங்கள் வாகனம் பட்டியலில் இல்லையா? கவலை வேண்டாம்! நேரடியாக வாட்ஸ்அப்பில் கேளுங்கள்.'
              : 'Can’t find your car or bike model? Chat directly with our technical team for instant fitment check.'}
          </span>
          <a
            href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
              language === 'ta'
                ? 'வணக்கம் Ultra-Luminexs! எனது வாகனத்திற்கு எந்த பேட்டரி பொருந்தும் என்பதை அறிய உதவி தேவை.'
                : 'Hello Ultra-Luminexs! I need help finding the right battery model for my vehicle.'
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-yellow-400 hover:text-yellow-300 font-bold underline"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>{language === 'ta' ? 'வாட்ஸ்அப் உதவி பெற' : 'Ask on WhatsApp'}</span>
          </a>
        </div>
      </div>
    </div>
  );
};