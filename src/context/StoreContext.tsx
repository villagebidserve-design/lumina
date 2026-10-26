import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, Banner, StoreSettings, CartItem, Category, Language } from '../types';
import { DEFAULT_PRODUCTS, DEFAULT_BANNERS, DEFAULT_SETTINGS } from '../data/defaultProducts';

interface StoreContextType {
  products: Product[];
  banners: Banner[];
  settings: StoreSettings;
  cart: CartItem[];
  cartCount: number;
  cartTotal: number;
  cartSavings: number;
  language: Language;
  selectedCategory: Category;
  searchQuery: string;
  selectedProduct: Product | null;
  isCartOpen: boolean;
  isAdminLoggedIn: boolean;
  customerPincode: string;
  
  // Actions
  setLanguage: (lang: Language) => void;
  setSelectedCategory: (cat: Category) => void;
  setSearchQuery: (query: string) => void;
  setSelectedProduct: (prod: Product | null) => void;
  setIsCartOpen: (open: boolean) => void;
  setIsAdminLoggedIn: (logged: boolean) => void;
  setCustomerPincode: (pincode: string) => void;
  
  // Cart Actions
  addToCart: (product: Product, withOldBattery?: boolean) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  toggleCartItemExchange: (productId: string) => void;
  clearCart: () => void;
  
  // Admin Data Actions (Saved instantly to localStorage)
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  toggleProductStock: (productId: string) => void;
  addBanner: (banner: Omit<Banner, 'id'>) => void;
  deleteBanner: (bannerId: string) => void;
  updateBanner: (banner: Banner) => void;
  updateSettings: (newSettings: StoreSettings) => void;
  resetToDefaults: () => void;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PRODUCTS: 'ultra_luminexs_store_products_v2',
  BANNERS: 'ultra_luminexs_store_banners_v2',
  SETTINGS: 'ultra_luminexs_store_settings_v2',
  CART: 'ultra_luminexs_store_cart_v2',
  LANG: 'ultra_luminexs_store_lang_v2',
  AUTH: 'ultra_luminexs_admin_session_v2',
  LAST_ACTIVITY: 'ultra_luminexs_admin_last_activity_v2',
};

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Products state
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      return saved ? JSON.parse(saved) : DEFAULT_PRODUCTS;
    } catch {
      return DEFAULT_PRODUCTS;
    }
  });

  // Banners state
  const [banners, setBanners] = useState<Banner[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.BANNERS);
      return saved ? JSON.parse(saved) : DEFAULT_BANNERS;
    } catch {
      return DEFAULT_BANNERS;
    }
  });

  // Settings state
  const [settings, setSettings] = useState<StoreSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...DEFAULT_SETTINGS,
          ...parsed,
          adminUsername: parsed.adminUsername || DEFAULT_SETTINGS.adminUsername,
          adminPassword: parsed.adminPassword || DEFAULT_SETTINGS.adminPassword,
          adminEmail: parsed.adminEmail || DEFAULT_SETTINGS.adminEmail,
        };
      }
      return DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  // Cart state
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CART);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // UI state
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.LANG);
      return (saved as Language) || 'en';
    } catch {
      return 'en';
    }
  });

  const [selectedCategory, setSelectedCategory] = useState<Category>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedInState] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(STORAGE_KEYS.AUTH) === 'true';
    } catch {
      return false;
    }
  });

  const [customerPincode, setCustomerPincodeState] = useState<string>(() => {
    try {
      return localStorage.getItem('ultra_luminexs_pincode') || '';
    } catch {
      return '';
    }
  });

  const setCustomerPincode = (pincode: string) => {
    setCustomerPincodeState(pincode);
    try {
      localStorage.setItem('ultra_luminexs_pincode', pincode);
    } catch {}
  };

  // Save to localStorage when modified
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BANNERS, JSON.stringify(banners));
  }, [banners]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CART, JSON.stringify(cart));
  }, [cart]);

  // Real-time server sync on startup (Cross-device sync for laptop <-> mobile)
  useEffect(() => {
    fetch('/api/store-data')
      .then((res) => {
        if (!res.ok) throw new Error('No server store data yet');
        return res.json();
      })
      .then((data) => {
        if (data.products && Array.isArray(data.products) && data.products.length > 0) {
          setProducts(data.products);
          localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(data.products));
        }
        if (data.banners && Array.isArray(data.banners) && data.banners.length > 0) {
          setBanners(data.banners);
          localStorage.setItem(STORAGE_KEYS.BANNERS, JSON.stringify(data.banners));
        }
        if (data.settings && typeof data.settings === 'object') {
          setSettings((prev) => ({ ...prev, ...data.settings }));
          localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data.settings));
        }
      })
      .catch(() => {
        // Fallback to local storage or defaults if offline
      });
  }, []);

  // Helper to persist edits to shared file / local server so all phones and PCs receive updates immediately
  const syncWithServer = (p: Product[], b: Banner[], s: StoreSettings) => {
    fetch('/api/store-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        products: p,
        banners: b,
        settings: s,
        updatedAt: new Date().toISOString(),
      }),
    }).catch(() => {
      // Offline fallback
    });
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEYS.LANG, lang);
  };

  const setIsAdminLoggedIn = (logged: boolean) => {
    setIsAdminLoggedInState(logged);
    sessionStorage.setItem(STORAGE_KEYS.AUTH, logged ? 'true' : 'false');
    if (logged) {
      sessionStorage.setItem(STORAGE_KEYS.LAST_ACTIVITY, Date.now().toString());
    } else {
      sessionStorage.removeItem(STORAGE_KEYS.LAST_ACTIVITY);
    }
  };

  // Auto session security timeout (30 minutes of inactivity)
  useEffect(() => {
    if (!isAdminLoggedIn) return;

    const checkInactivity = () => {
      const last = sessionStorage.getItem(STORAGE_KEYS.LAST_ACTIVITY);
      if (last && Date.now() - Number(last) > 30 * 60 * 1000) {
        setIsAdminLoggedIn(false);
      }
    };

    const updateActivity = () => {
      sessionStorage.setItem(STORAGE_KEYS.LAST_ACTIVITY, Date.now().toString());
    };

    window.addEventListener('click', updateActivity);
    window.addEventListener('keydown', updateActivity);
    window.addEventListener('touchstart', updateActivity);
    const interval = setInterval(checkInactivity, 30000);

    return () => {
      window.removeEventListener('click', updateActivity);
      window.removeEventListener('keydown', updateActivity);
      window.removeEventListener('touchstart', updateActivity);
      clearInterval(interval);
    };
  }, [isAdminLoggedIn]);

  // Cart helper calculations
  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  const cartTotal = cart.reduce((total, item) => {
    return total + item.product.price * item.quantity;
  }, 0);

  const cartSavings = cart.reduce((total, item) => {
    return total + (item.product.mrp - item.product.price) * item.quantity;
  }, 0);

  // Cart operations
  const addToCart = (product: Product, withOldBattery: boolean = false) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.product.id === product.id);
      if (existing) {
        return prevCart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prevCart, { product, quantity: 1, withOldBattery }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const toggleCartItemExchange = (productId: string) => {
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId
          ? { ...item, withOldBattery: !item.withOldBattery }
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  // Admin Data operations
  const addProduct = (productData: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...productData,
      id: `lum-${Date.now()}`,
    };
    setProducts((prev) => {
      const next = [newProduct, ...prev];
      syncWithServer(next, banners, settings);
      return next;
    });
  };

  const updateProduct = (updated: Product) => {
    setProducts((prev) => {
      const next = prev.map((p) => (p.id === updated.id ? updated : p));
      syncWithServer(next, banners, settings);
      return next;
    });
    setSelectedProduct((prev) => (prev?.id === updated.id ? updated : prev));
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === updated.id ? { ...item, product: updated } : item
      )
    );
  };

  const deleteProduct = (productId: string) => {
    setProducts((prev) => {
      const next = prev.filter((p) => p.id !== productId);
      syncWithServer(next, banners, settings);
      return next;
    });
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const toggleProductStock = (productId: string) => {
    setProducts((prev) => {
      const next = prev.map((p) => (p.id === productId ? { ...p, inStock: !p.inStock } : p));
      syncWithServer(next, banners, settings);
      return next;
    });
  };

  const addBanner = (newBanner: Omit<Banner, 'id'>) => {
    const banner: Banner = {
      ...newBanner,
      id: `b-${Date.now()}`,
    };
    setBanners((prev) => {
      const next = [...prev, banner];
      syncWithServer(products, next, settings);
      return next;
    });
  };

  const deleteBanner = (bannerId: string) => {
    setBanners((prev) => {
      const next = prev.filter((b) => b.id !== bannerId);
      syncWithServer(products, next, settings);
      return next;
    });
  };

  const updateBanner = (updatedBanner: Banner) => {
    setBanners((prev) => {
      const next = prev.map((b) => (b.id === updatedBanner.id ? updatedBanner : b));
      syncWithServer(products, next, settings);
      return next;
    });
  };

  const updateSettings = (newSettings: StoreSettings) => {
    setSettings(newSettings);
    syncWithServer(products, banners, newSettings);
  };

  const resetToDefaults = () => {
    setProducts(DEFAULT_PRODUCTS);
    setBanners(DEFAULT_BANNERS);
    setSettings(DEFAULT_SETTINGS);
    setCart([]);
    localStorage.removeItem(STORAGE_KEYS.PRODUCTS);
    localStorage.removeItem(STORAGE_KEYS.BANNERS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.CART);
    syncWithServer(DEFAULT_PRODUCTS, DEFAULT_BANNERS, DEFAULT_SETTINGS);
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        banners,
        settings,
        cart,
        cartCount,
        cartTotal,
        cartSavings,
        language,
        selectedCategory,
        searchQuery,
        selectedProduct,
        isCartOpen,
        isAdminLoggedIn,
        customerPincode,
        setLanguage,
        setSelectedCategory,
        setSearchQuery,
        setSelectedProduct,
        setIsCartOpen,
        setIsAdminLoggedIn,
        setCustomerPincode,
        addToCart,
        removeFromCart,
        updateQuantity,
        toggleCartItemExchange,
        clearCart,
        addProduct,
        updateProduct,
        deleteProduct,
        toggleProductStock,
        addBanner,
        deleteBanner,
        updateBanner,
        updateSettings,
        resetToDefaults,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
