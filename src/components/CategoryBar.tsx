import React from 'react';
import { useStore } from '../context/StoreContext';
import { Category } from '../types';
import { 
  Car, 
  Bike, 
  Zap, 
  Sun, 
  Truck, 
  Layers 
} from 'lucide-react';

export const CategoryBar: React.FC = () => {
  const { selectedCategory, setSelectedCategory, language, products } = useStore();

  const categories: { id: Category; labelEn: string; labelTa: string; icon: React.ReactNode; count: number }[] = [
    {
      id: 'all',
      labelEn: 'All Batteries',
      labelTa: 'அனைத்து பேட்டரிகள்',
      icon: <Layers className="w-5 h-5" />,
      count: products.length,
    },
    {
      id: 'car',
      labelEn: 'Car Batteries',
      labelTa: 'கார் பேட்டரிகள்',
      icon: <Car className="w-5 h-5" />,
      count: products.filter((p) => p.category === 'car').length,
    },
    {
      id: 'bike',
      labelEn: 'Bike & 2-Wheeler',
      labelTa: 'பைக் & ஸ்கூட்டர்',
      icon: <Bike className="w-5 h-5" />,
      count: products.filter((p) => p.category === 'bike').length,
    },
    {
      id: 'inverter',
      labelEn: 'Inverter & Tubular',
      labelTa: 'இன்வெர்ட்டர் பேட்டரிகள்',
      icon: <Zap className="w-5 h-5" />,
      count: products.filter((p) => p.category === 'inverter').length,
    },
    {
      id: 'solar',
      labelEn: 'Solar & C10 UPS',
      labelTa: 'சோலார் பேட்டரிகள்',
      icon: <Sun className="w-5 h-5" />,
      count: products.filter((p) => p.category === 'solar').length,
    },
    {
      id: 'commercial',
      labelEn: 'Tractor & Commercial',
      labelTa: 'டிராக்டர் & லோடு வண்டி',
      icon: <Truck className="w-5 h-5" />,
      count: products.filter((p) => p.category === 'commercial').length,
    },
  ];

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm sticky top-[60px] sm:top-[68px] z-30">
      <div className="max-w-7xl mx-auto px-2 sm:px-6">
        <div className="flex items-center space-x-2 sm:space-x-4 overflow-x-auto py-2.5 sm:py-3 no-scrollbar scroll-smooth">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex-shrink-0 flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 ${
                  isSelected
                    ? 'bg-luminexs-blue text-white shadow-md shadow-luminexs-blue/20 ring-2 ring-yellow-400'
                    : 'bg-gray-100/90 text-gray-700 hover:bg-gray-200 hover:text-gray-900 border border-gray-200/80'
                }`}
              >
                <span className={isSelected ? 'text-yellow-400' : 'text-gray-500'}>
                  {cat.icon}
                </span>
                <span className="whitespace-nowrap">
                  {language === 'ta' ? cat.labelTa : cat.labelEn}
                </span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                    isSelected
                      ? 'bg-yellow-400 text-gray-950'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
