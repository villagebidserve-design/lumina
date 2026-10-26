import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { ChevronLeft, ChevronRight, Sparkles, ArrowRight } from 'lucide-react';

export const BannerCarousel: React.FC = () => {
  const { banners, setSelectedCategory, language } = useStore();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto rotate banners every 5 seconds
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const currentBanner = banners[currentIndex] || banners[0];

  const handleCtaClick = () => {
    if (currentBanner.targetCategory) {
      setSelectedCategory(currentBanner.targetCategory);
      const productSection = document.getElementById('products-section');
      if (productSection) {
        productSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="relative w-full overflow-hidden bg-gray-900 group">
      {/* Banner Container */}
      <div className="relative w-full h-[220px] xs:h-[260px] sm:h-[340px] md:h-[420px] lg:h-[480px]">
        {/* Background Image with Dark Gradient Overlay */}
        <div className="absolute inset-0">
          <picture>
            <source media="(max-width: 640px)" srcSet={currentBanner.mobileImage || currentBanner.desktopImage} />
            <img
              src={currentBanner.desktopImage}
              alt={currentBanner.title}
              className="w-full h-full object-cover object-center filter brightness-[0.78] transition-all duration-700 ease-in-out transform group-hover:scale-105"
            />
          </picture>
          {/* Gradient Overlay for high contrast text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-luminexs-navy/95 via-luminexs-navy/70 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20"></div>
        </div>

        {/* Content Box Over Banner */}
        <div className="relative z-10 max-w-7xl mx-auto h-full px-4 sm:px-8 flex flex-col justify-center items-start">
          <div className="max-w-2xl text-left space-y-2 sm:space-y-3.5">
            {/* Brand Title Pill */}
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-yellow-400 text-gray-950 font-black text-[10px] sm:text-xs uppercase tracking-wider shadow-lg">
              <Sparkles className="w-3.5 h-3.5 fill-gray-950" />
              <span>{currentBanner.badge || 'ULTRA-LUMINEXS OFFICIAL STORE'}</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-xl xs:text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight uppercase leading-tight drop-shadow-md">
              {currentBanner.title}
            </h1>

            {/* Subtitle */}
            <p className="text-xs sm:text-base text-gray-200 font-medium line-clamp-2 max-w-xl drop-shadow">
              {currentBanner.subtitle}
            </p>

            {/* Action Buttons */}
            <div className="pt-1 sm:pt-3 flex flex-wrap items-center gap-3">
              <button
                onClick={handleCtaClick}
                className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-yellow-400 hover:bg-yellow-500 text-gray-950 font-extrabold text-xs sm:text-sm rounded-lg shadow-lg hover:shadow-yellow-400/30 transition transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>{currentBanner.ctaText}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-black/40 backdrop-blur-sm px-3 py-2 rounded-lg border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>
                  {language === 'ta' 
                    ? 'இலவச ஃபிட்டிங் & பழைய பேட்டரி எக்ஸ்சேஞ்ச்' 
                    : 'Free Doorstep Fitting & Old Battery Exchange'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Carousel Navigation Arrows */}
        {banners.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              aria-label="Previous Slide"
              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-sm transition border border-white/20 hidden group-hover:flex items-center justify-center"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextSlide}
              aria-label="Next Slide"
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-sm transition border border-white/20 hidden group-hover:flex items-center justify-center"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Carousel Dots */}
        {banners.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                aria-label={`Slide ${index + 1}`}
                className={`transition-all duration-300 rounded-full ${
                  currentIndex === index
                    ? 'w-7 h-2 bg-yellow-400'
                    : 'w-2 h-2 bg-white/50 hover:bg-white'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
