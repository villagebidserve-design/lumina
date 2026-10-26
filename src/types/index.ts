export type ProductCategory = 'car' | 'bike' | 'inverter' | 'solar' | 'commercial';
export type Category = 'all' | ProductCategory;

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: ProductCategory;
  capacityAh: number;
  voltage: number;
  mrp: number;
  price: number; // Without old battery exchange
  withOldBatteryPrice: number; // With old battery exchange discount
  warrantyMonths: number;
  warrantyDetails: string; // e.g. "36M Free + 24M Pro-rata"
  image: string;
  additionalImages?: string[];
  inStock: boolean;
  rating: number;
  reviewsCount: number;
  featured?: boolean;
  badge?: string; // e.g. "Bestseller", "Top Rated", "New"
  specs: {
    batteryType: string;
    terminalLayout?: string;
    dimensions?: string;
    maintenance: string;
    technology: string;
  };
  compatibleVehicles?: string[];
  descriptionEn: string;
  descriptionTa: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  badge?: string;
  desktopImage: string;
  mobileImage: string;
  ctaText: string;
  targetCategory?: Category;
  link?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  withOldBattery: boolean;
}

export type Language = 'en' | 'ta';

export interface StoreSettings {
  storeName: string;
  taglineEn: string;
  taglineTa: string;
  whatsappNumber: string; // E.g. "919876543210"
  phone: string;
  address: string;
  city: string;
  workingHours: string;
  adminUsername: string; // e.g. "admin"
  adminPassword: string; // e.g. "UltraBattery@2026"
  adminEmail: string;
  adminPin: string;
  desktopBannerNotice: string;
  mobileBannerNotice: string;
}
