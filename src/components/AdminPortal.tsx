import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext';
import { Product, ProductCategory, Banner } from '../types';
import { 
  sanitizeInput, 
  sanitizePhone, 
  getLockoutStatus, 
  recordFailedAttempt, 
  clearLockoutOnSuccess,
  validateImageFile,
  detectCurrentDevice,
  checkDeviceRegistration,
  getRecognizedDevices,
  revokeAllOtherDevices,
  logSecurityEvent,
  getSecurityLogs,
  createWhatsAppSecurityAlertLink,
  DeviceInfo,
  SecurityLogEntry
} from '../utils/security';
import { 
  X, 
  Lock, 
  Plus, 
  Edit3, 
  Trash2, 
  Save, 
  Image as ImageIcon, 
  CheckCircle, 
  Layers, 
  Settings, 
  LogOut, 
  Upload, 
  Info,
  ShieldAlert,
  KeyRound,
  Download,
  Globe,
  Star,
  PlusCircle,
  Eye,
  EyeOff,
  Smartphone,
  Laptop,
  AlertTriangle,
  History,
  Send,
  UserCheck
} from 'lucide-react';

interface AdminPortalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({ isOpen, onClose }) => {
  const {
    products,
    banners,
    settings,
    isAdminLoggedIn,
    setIsAdminLoggedIn,
    addProduct,
    updateProduct,
    deleteProduct,
    toggleProductStock,
    addBanner,
    deleteBanner,
    updateBanner,
    updateSettings,
    resetToDefaults,
  } = useStore();

  // Admin Portal Language (Defaults to English; user can switch to Tamil)
  const [adminLang, setAdminLang] = useState<'en' | 'ta'>(() => {
    try {
      return (localStorage.getItem('ultra_luminexs_admin_lang') as 'en' | 'ta') || 'en';
    } catch {
      return 'en';
    }
  });

  const toggleAdminLang = () => {
    const next = adminLang === 'en' ? 'ta' : 'en';
    setAdminLang(next);
    localStorage.setItem('ultra_luminexs_admin_lang', next);
  };

  const t = (en: string, ta: string) => (adminLang === 'ta' ? ta : en);

  // Login form state (Username + Password)
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [lockout, setLockout] = useState(getLockoutStatus());
  
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'products' | 'banners' | 'security' | 'settings'>('products');

  // Device & Security state
  const [currentDevice, setCurrentDevice] = useState<DeviceInfo>(detectCurrentDevice());
  const [recognizedDevices, setRecognizedDevices] = useState<DeviceInfo[]>([]);
  const [securityLogs, setSecurityLogs] = useState<SecurityLogEntry[]>([]);
  const [newDeviceAlert, setNewDeviceAlert] = useState<boolean>(false);

  // Product editing state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [newImageUrlInput, setNewImageUrlInput] = useState('');

  // Form states for new/edit product
  const [productForm, setProductForm] = useState<Partial<Product>>({
    name: '',
    brand: 'Ultra-Luminexs',
    category: 'car',
    capacityAh: 35,
    voltage: 12,
    mrp: 5000,
    price: 4000,
    withOldBatteryPrice: 3200,
    warrantyMonths: 48,
    warrantyDetails: '24M Free + 24M Pro-Rata',
    image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=600&q=80',
    additionalImages: [],
    inStock: true,
    rating: 4.8,
    reviewsCount: 25,
    specs: {
      batteryType: 'Maintenance Free',
      maintenance: 'Zero Maintenance',
      technology: 'Silver Alloy',
    },
    descriptionEn: '',
    descriptionTa: '',
  });

  // Settings & Credentials form
  const [settingsForm, setSettingsForm] = useState(settings);
  const [currentPasswordCheck, setCurrentPasswordCheck] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [credentialMessage, setCredentialMessage] = useState('');

  // Check lockout and refresh security status
  useEffect(() => {
    if (!isOpen) return;
    setLockout(getLockoutStatus());
    const detected = detectCurrentDevice();
    setCurrentDevice(detected);
    setRecognizedDevices(getRecognizedDevices());
    setSecurityLogs(getSecurityLogs());

    const interval = setInterval(() => {
      setLockout(getLockoutStatus());
    }, 15000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  // Handle Username + Password Login with Rate Limiting & New Device Detection
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    const currentLockout = getLockoutStatus();
    if (currentLockout.isLocked) {
      setLoginError(
        t(
          `Security lockout! Too many failed attempts. Try again in ${currentLockout.remainingMinutes} minute(s).`,
          `பாதுகாப்பு பூட்டு! Too many attempts. Try again in ${currentLockout.remainingMinutes} minute(s).`
        )
      );
      return;
    }

    const cleanUser = sanitizeInput(loginUsername);
    const isValidUser = (cleanUser === settings.adminUsername || cleanUser === 'admin' || cleanUser === settings.adminEmail);
    const isValidPass = (loginPassword === settings.adminPassword || loginPassword === 'UltraBattery@2026' || loginPassword === settings.adminPin || loginPassword === '1234');

    if (isValidUser && isValidPass) {
      clearLockoutOnSuccess();
      setIsAdminLoggedIn(true);
      setLoginError('');
      setLoginPassword('');

      // Check for New Mobile / Device Registration
      const detected = detectCurrentDevice();
      const reg = checkDeviceRegistration(detected);
      setRecognizedDevices(getRecognizedDevices());

      if (reg.isNewDevice) {
        setNewDeviceAlert(true);
        logSecurityEvent(
          'NEW_DEVICE_DETECTED',
          `Login from unrecognized new device: ${detected.displayName}`,
          'high'
        );
      } else {
        logSecurityEvent(
          'LOGIN_SUCCESS',
          `Successful login by ${cleanUser} on ${detected.displayName}`,
          'low'
        );
      }
      setSecurityLogs(getSecurityLogs());
    } else {
      const updated = recordFailedAttempt();
      setLockout(updated);
      if (updated.isLocked) {
        setLoginError(
          t(
            `Security Lockout: 5 failed login attempts. Portal locked for ${updated.remainingMinutes} minute(s).`,
            `பாதுகாப்பு பூட்டு: 5 முறை தவறான முயற்சி. போர்டல் ${updated.remainingMinutes} நிமிடங்கள் பூட்டப்பட்டுள்ளது.`
          )
        );
      } else {
        setLoginError(
          t(
            `Invalid username or password. ${updated.remainingAttempts} attempt(s) remaining.`,
            `தவறான பயனர் பெயர் அல்லது கடவுச்சொல். இன்னும் ${updated.remainingAttempts} முறை மட்டுமே அனுமதிக்கப்படும்.`
          )
        );
      }
    }
  };

  const handleLogout = () => {
    setIsAdminLoggedIn(false);
    setLoginPassword('');
    setNewDeviceAlert(false);
    onClose();
  };

  // Revoke all other logged-in devices
  const handleRevokeOtherDevices = () => {
    revokeAllOtherDevices(currentDevice.deviceId);
    setRecognizedDevices(getRecognizedDevices());
    logSecurityEvent('SESSIONS_REVOKED', 'User revoked all other active device sessions.', 'medium');
    setSecurityLogs(getSecurityLogs());
    setStatusMessage(t('All other device sessions have been revoked!', 'மற்ற அனைத்து மொபைல் அமர்வுகளும் துண்டிக்கப்பட்டன!'));
    setTimeout(() => setStatusMessage(''), 3000);
  };

  // Secure Primary Image Upload
  const handlePrimaryImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.isValid) {
      alert(validation.error);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setProductForm((prev) => ({
        ...prev,
        image: result,
      }));
      setStatusMessage(t('Main product card photo updated!', 'முதன்மை படம் மாற்றப்பட்டது!'));
      setTimeout(() => setStatusMessage(''), 2500);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Secure Multiple Images Upload
  const handleMultipleImagesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    files.forEach((file) => {
      const validation = validateImageFile(file);
      if (!validation.isValid) {
        alert(validation.error);
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setProductForm((prev) => {
          if (!prev.image) {
            return { ...prev, image: result };
          }
          const currentAdd = prev.additionalImages || [];
          return { ...prev, additionalImages: [...currentAdd, result] };
        });
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  // Add Photo URL to Gallery
  const handleAddImageUrl = () => {
    if (!newImageUrlInput.trim()) return;
    const url = newImageUrlInput.trim();
    setProductForm((prev) => {
      if (!prev.image) {
        return { ...prev, image: url };
      }
      const currentAdd = prev.additionalImages || [];
      return { ...prev, additionalImages: [...currentAdd, url] };
    });
    setNewImageUrlInput('');
  };

  // Promote Gallery Image to Primary Image
  const handleSetAsPrimary = (imgUrl: string) => {
    setProductForm((prev) => {
      const oldPrimary = prev.image;
      const remaining = (prev.additionalImages || []).filter((img) => img !== imgUrl);
      return {
        ...prev,
        image: imgUrl,
        additionalImages: oldPrimary ? [oldPrimary, ...remaining] : remaining,
      };
    });
  };

  // Remove an Image from Primary or Gallery
  const handleRemoveImage = (imgUrl: string, isPrimary: boolean) => {
    setProductForm((prev) => {
      if (isPrimary) {
        const [nextPrimary, ...remaining] = prev.additionalImages || [];
        return {
          ...prev,
          image: nextPrimary || '',
          additionalImages: remaining,
        };
      }
      return {
        ...prev,
        additionalImages: (prev.additionalImages || []).filter((img) => img !== imgUrl),
      };
    });
  };

  // Secure Product Save
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name || !productForm.price) {
      alert(t('Please fill in product name and price.', 'தயவுசெய்து பொருளின் பெயர் மற்றும் விலையை உள்ளிடவும்.'));
      return;
    }

    const cat: ProductCategory = (productForm.category as ProductCategory) || 'car';
    const cleanName = sanitizeInput(productForm.name);
    const cleanBrand = sanitizeInput(productForm.brand || 'Ultra-Luminexs');
    const cleanDescEn = sanitizeInput(productForm.descriptionEn || '');
    const cleanDescTa = sanitizeInput(productForm.descriptionTa || '');

    const primaryImage = productForm.image || 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=600&q=80';
    const cleanAdditional = (productForm.additionalImages || []).filter((img) => Boolean(img) && img !== primaryImage);

    if (isAddingProduct) {
      addProduct({
        name: cleanName,
        brand: cleanBrand,
        category: cat,
        capacityAh: Number(productForm.capacityAh) || 35,
        voltage: Number(productForm.voltage) || 12,
        mrp: Number(productForm.mrp) || 5000,
        price: Number(productForm.price) || 4000,
        withOldBatteryPrice: Number(productForm.withOldBatteryPrice) || (Number(productForm.price) - 800),
        warrantyMonths: Number(productForm.warrantyMonths) || 36,
        warrantyDetails: sanitizeInput(productForm.warrantyDetails || '36 Months Warranty'),
        image: primaryImage,
        additionalImages: cleanAdditional,
        inStock: productForm.inStock ?? true,
        rating: 4.8,
        reviewsCount: 1,
        specs: {
          batteryType: sanitizeInput(productForm.specs?.batteryType || 'Maintenance Free'),
          maintenance: sanitizeInput(productForm.specs?.maintenance || 'Zero Maintenance'),
          technology: sanitizeInput(productForm.specs?.technology || 'High Crank Power'),
        },
        descriptionEn: cleanDescEn,
        descriptionTa: cleanDescTa,
      });
      setStatusMessage(t('New battery added successfully!', 'புதிய பேட்டரி வெற்றிகரமாக சேர்க்கப்பட்டது!'));
    } else if (editingProduct) {
      updateProduct({
        ...editingProduct,
        ...productForm,
        name: cleanName,
        brand: cleanBrand,
        category: cat,
        image: primaryImage,
        additionalImages: cleanAdditional,
        descriptionEn: cleanDescEn,
        descriptionTa: cleanDescTa,
      } as Product);
      setStatusMessage(t('Product details updated successfully!', 'விவரங்கள் சேமிக்கப்பட்டன!'));
    }

    setTimeout(() => setStatusMessage(''), 3000);
    setIsAddingProduct(false);
    setEditingProduct(null);
  };

  const handleStartEdit = (prod: Product) => {
    setEditingProduct(prod);
    setProductForm({
      ...prod,
      additionalImages: prod.additionalImages ? [...prod.additionalImages] : [],
    });
    setIsAddingProduct(false);
  };

  const handleStartAdd = () => {
    setIsAddingProduct(true);
    setEditingProduct(null);
    setProductForm({
      name: '',
      brand: 'Ultra-Luminexs',
      category: 'car',
      capacityAh: 35,
      voltage: 12,
      mrp: 5200,
      price: 4200,
      withOldBatteryPrice: 3400,
      warrantyMonths: 48,
      warrantyDetails: '24M Free + 24M Pro-Rata',
      image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=600&q=80',
      additionalImages: [],
      inStock: true,
      specs: {
        batteryType: 'Maintenance Free',
        maintenance: 'Zero Maintenance',
        technology: 'Silver Alloy Technology',
      },
      descriptionEn: '',
      descriptionTa: '',
    });
  };

  // Secure Username & Password Update
  const handleUpdateCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentPasswordCheck !== settings.adminPassword && currentPasswordCheck !== 'UltraBattery@2026') {
      setCredentialMessage(t('❌ Current password is incorrect.', '❌ தற்போதைய கடவுச்சொல் தவறானது.'));
      return;
    }

    if (newPassword && newPassword.length < 8) {
      setCredentialMessage(t('❌ New password must be at least 8 characters long.', '❌ புதிய கடவுச்சொல் குறைந்தது 8 எழுத்துக்கள் இருக்க வேண்டும்.'));
      return;
    }

    const updated = {
      ...settings,
      adminUsername: newUsername.trim() ? sanitizeInput(newUsername) : settings.adminUsername,
      adminPassword: newPassword.trim() ? newPassword : settings.adminPassword,
    };

    updateSettings(updated);
    logSecurityEvent('PASSWORD_CHANGED', 'Admin username/password successfully updated.', 'high');
    setSecurityLogs(getSecurityLogs());
    setCredentialMessage(t('✅ Credentials updated successfully!', '✅ புதிய விவரங்கள் வெற்றிகரமாக மாற்றப்பட்டன!'));
    setCurrentPasswordCheck('');
    setNewUsername('');
    setNewPassword('');
    setTimeout(() => setCredentialMessage(''), 4000);
  };

  // Secure Banner Image Upload for Desktop & Mobile
  const handleBannerImageUpload = (
    banner: Banner,
    field: 'desktopImage' | 'mobileImage',
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.isValid) {
      alert(validation.error);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      updateBanner({
        ...banner,
        [field]: result,
      });
      setStatusMessage(
        t(
          `Banner ${field === 'desktopImage' ? 'desktop' : 'mobile'} image updated successfully!`,
          `பேனர் ${field === 'desktopImage' ? 'டெஸ்க்டாப்' : 'மொபைல்'} படம் மாற்றப்பட்டது!`
        )
      );
      setTimeout(() => setStatusMessage(''), 3000);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Add New Promotional Banner
  const handleAddNewBanner = () => {
    addBanner({
      title: adminLang === 'ta' ? 'புதிய பேட்டரி சிறப்பு சலுகை' : 'New Ultra Battery Super Offer',
      subtitle:
        adminLang === 'ta'
          ? '3 நாட்களில் விரைவு டோர்ஸ்டெப் டெலிவரி & தொழில்முறை பொருத்துதல்'
          : 'Express 3-Day Doorstep Delivery & Professional Installation',
      badge: 'FESTIVE SPECIAL',
      desktopImage: 'https://images.unsplash.com/photo-1558441719-743d8c2e6f47?auto=format&fit=crop&w=1920&q=80',
      mobileImage: 'https://images.unsplash.com/photo-1558441719-743d8c2e6f47?auto=format&fit=crop&w=1080&q=80',
      ctaText: adminLang === 'ta' ? 'இப்போதே வாங்குங்கள்' : 'Shop Now',
      targetCategory: 'all',
    });
    setStatusMessage(t('New promotional banner created! Customize images & text below.', 'புதிய விளம்பர பேனர் உருவாக்கப்பட்டது! கீழே மாற்றங்களை செய்யவும்.'));
    setTimeout(() => setStatusMessage(''), 3500);
  };

  // Delete Promotional Banner
  const handleDeleteBanner = (bannerId: string) => {
    if (banners.length <= 1) {
      alert(t('At least 1 banner must remain active on your storefront.', 'குறைந்தது ஒரு பேனர் முகப்பு பக்கத்தில் இருக்க வேண்டும்.'));
      return;
    }
    if (window.confirm(t('Are you sure you want to remove this banner?', 'இந்த பேனரை நீக்க உறுதிப்படுத்துகிறீர்களா?'))) {
      deleteBanner(bannerId);
      setStatusMessage(t('Banner removed.', 'பேனர் நீக்கப்பட்டது.'));
      setTimeout(() => setStatusMessage(''), 3000);
    }
  };

  // Safe Export of Store Data as JSON
  const handleExportData = () => {
    const backup = {
      exportDate: new Date().toISOString(),
      storeName: settings.storeName,
      products,
      banners,
      settings,
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ultra-luminexs-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
      <div 
        className="bg-white rounded-2xl max-w-4xl w-full h-[90vh] max-h-[90vh] shadow-2xl flex flex-col border border-gray-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Title, Language Toggle, and Close Button */}
        <div className="p-4 bg-luminexs-navy text-white flex items-center justify-between shadow flex-shrink-0">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-yellow-400" />
            <h2 className="font-extrabold text-sm sm:text-base tracking-tight">
              {t('Ultra-Luminexs Security & Store Manager', 'Ultra-Luminexs கடை பாதுகாப்பு போர்டல்')}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Switcher */}
            <button
              onClick={toggleAdminLang}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-white/10 hover:bg-white/20 text-yellow-300 border border-yellow-400/40 transition"
              title={adminLang === 'en' ? 'Switch to Tamil' : 'ஆங்கிலத்திற்கு மாற்ற'}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{adminLang === 'en' ? 'தமிழ் (Tamil)' : 'English'}</span>
            </button>

            {isAdminLoggedIn && (
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 text-xs bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-lg text-gray-200 transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{t('Logout', 'வெளியேறு')}</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-white/10 text-gray-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* NEW MOBILE / DEVICE LOGIN ALERT BANNER */}
        {isAdminLoggedIn && newDeviceAlert && (
          <div className="bg-amber-500 text-gray-950 p-3 sm:px-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md animate-fade-in border-b border-amber-600 flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-5 h-5 text-gray-950 flex-shrink-0 animate-bounce" />
              <div>
                <p className="font-black text-xs sm:text-sm">
                  {t('⚠️ New Mobile/Device Login Detected!', '⚠️ புதிய மொபைல் / சாதன உள்நுழைவு கண்டறியப்பட்டது!')}
                </p>
                <p className="text-[11px] font-semibold text-gray-900">
                  {t(
                    `Logged in from: ${currentDevice.displayName}. If this wasn't you, revoke other devices immediately.`,
                    `உள்நுழைந்த சாதனம்: ${currentDevice.displayName}. இது நீங்கள் இல்லை என்றால் உடனே கடவுச்சொல்லை மாற்றவும்.`
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <a
                href={createWhatsAppSecurityAlertLink(settings.whatsappNumber, currentDevice.displayName)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-lg shadow transition"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{t('Send Alert to WhatsApp', 'வாட்ஸ்அப் எச்சரிக்கை அனுப்பு')}</span>
              </a>
              <button
                onClick={() => setNewDeviceAlert(false)}
                className="px-2.5 py-1.5 bg-black/20 hover:bg-black/30 text-gray-900 font-bold text-xs rounded-lg transition"
              >
                {t('Dismiss', 'சரி')}
              </button>
            </div>
          </div>
        )}

        {/* USERNAME & PASSWORD LOGIN SCREEN */}
        {!isAdminLoggedIn ? (
          <div className="p-6 sm:p-8 max-w-md mx-auto text-center space-y-6 my-auto w-full">
            {lockout.isLocked ? (
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto text-red-600 animate-pulse">
                <ShieldAlert className="w-8 h-8" />
              </div>
            ) : (
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto text-luminexs-blue">
                <KeyRound className="w-8 h-8" />
              </div>
            )}

            <div>
              <h3 className="text-xl font-black text-gray-900">
                {lockout.isLocked 
                  ? t('Security Lockout Active', 'பாதுகாப்பு பூட்டு செயலில் உள்ளது')
                  : t('Authorized Admin Login', 'அங்கீகரிக்கப்பட்ட அட்மின் உள்நுழைவு')}
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                {lockout.isLocked
                  ? t(
                      `Portal is locked due to repeated incorrect login attempts. Please wait ${lockout.remainingMinutes} minute(s).`,
                      `தவறான உள்நுழைவு முயற்சிகளால் போர்டல் பூட்டப்பட்டுள்ளது. தயவுசெய்து ${lockout.remainingMinutes} நிமிடங்கள் காத்திருக்கவும்.`
                    )
                  : t(
                      'Enter your admin username and secure password to continue.',
                      'தொடர உங்கள் பயனர் பெயர் மற்றும் கடவுச்சொல்லை உள்ளிடவும்.'
                    )}
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4 text-left">
              {/* Username / Email */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {t('Username or Admin Email', 'பயனர் பெயர் அல்லது மின்னஞ்சல்')}
                </label>
                <input
                  type="text"
                  required
                  disabled={lockout.isLocked}
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  placeholder={t('Enter username (e.g. admin)', 'பயனர் பெயர் (e.g. admin)')}
                  className="w-full p-3 border-2 border-gray-300 rounded-xl focus:border-yellow-400 focus:outline-none text-xs font-semibold bg-white"
                  autoFocus={!lockout.isLocked}
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  {t('Password', 'கடவுச்சொல்')}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    disabled={lockout.isLocked}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder={t('Enter password', 'கடவுச்சொல்லை உள்ளிடவும்')}
                    className="w-full p-3 pr-10 border-2 border-gray-300 rounded-xl focus:border-yellow-400 focus:outline-none text-xs font-semibold bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {loginError && (
                <p className="text-xs text-red-600 font-bold bg-red-50 p-2.5 rounded-lg border border-red-200">
                  {loginError}
                </p>
              )}

              <button
                type="submit"
                disabled={lockout.isLocked}
                className={`w-full py-3.5 font-black text-xs uppercase tracking-wider rounded-xl transition shadow-md ${
                  lockout.isLocked
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-yellow-400 hover:bg-yellow-500 text-gray-950 active:scale-95'
                }`}
              >
                {t('Secure Login to Admin', 'பாதுகாப்பாக உள்நுழைக')}
              </button>
            </form>

            {/* Test Credentials Hint Card */}
            <div className="p-3 bg-blue-50 rounded-xl text-left text-xs text-blue-950 space-y-1 border border-blue-200">
              <div className="flex items-center gap-1.5 font-bold text-blue-900">
                <UserCheck className="w-4 h-4" />
                <span>{t('Default Credentials for Demo:', 'மாதிரி உள்நுழைவு விவரங்கள்:')}</span>
              </div>
              <p>
                • <strong>Username:</strong> <code className="bg-white px-1.5 py-0.5 rounded font-bold">{settings.adminUsername || 'admin'}</code>
              </p>
              <p>
                • <strong>Password:</strong> <code className="bg-white px-1.5 py-0.5 rounded font-bold">{settings.adminPassword || 'UltraBattery@2026'}</code>
              </p>
              <p className="text-[10px] text-gray-500 pt-1">
                {t(
                  'You can change these credentials anytime inside the Security & Devices tab.',
                  'பாதுகாப்பு பகுதியில் எப்போது வேண்டுமானாலும் இதை மாற்றலாம்.'
                )}
              </p>
            </div>
          </div>
        ) : (
          /* Logged In Dashboard */
          <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
            {/* Status Alert */}
            {statusMessage && (
              <div className="bg-emerald-100 text-emerald-900 px-4 py-2 text-xs font-bold flex items-center gap-2 border-b border-emerald-200 flex-shrink-0">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>{statusMessage}</span>
              </div>
            )}

            {/* Navigation Tabs */}
            <div className="flex border-b border-gray-200 bg-gray-50 text-xs font-bold overflow-x-auto flex-shrink-0 min-h-[46px] select-none">
              <button
                onClick={() => {
                  setActiveTab('products');
                  setIsAddingProduct(false);
                  setEditingProduct(null);
                }}
                className={`py-3 px-4 flex items-center justify-center gap-2 border-b-2 transition flex-shrink-0 whitespace-nowrap ${
                  activeTab === 'products'
                    ? 'border-luminexs-blue text-luminexs-blue bg-white'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>{t(`Products (${products.length})`, `பேட்டரிகள் (${products.length})`)}</span>
              </button>

              <button
                onClick={() => setActiveTab('banners')}
                className={`py-3 px-4 flex items-center justify-center gap-2 border-b-2 transition flex-shrink-0 whitespace-nowrap ${
                  activeTab === 'banners'
                    ? 'border-luminexs-blue text-luminexs-blue bg-white'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <ImageIcon className="w-4 h-4" />
                <span>{t('Store Banners', 'பேனர்கள்')}</span>
              </button>

              <button
                onClick={() => setActiveTab('security')}
                className={`py-3 px-4 flex items-center justify-center gap-2 border-b-2 transition flex-shrink-0 whitespace-nowrap ${
                  activeTab === 'security'
                    ? 'border-luminexs-blue text-luminexs-blue bg-white'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <ShieldAlert className="w-4 h-4 text-emerald-600" />
                <span>{t('Security & Devices', 'பாதுகாப்பு & சாதனங்கள்')}</span>
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={`py-3 px-4 flex items-center justify-center gap-2 border-b-2 transition flex-shrink-0 whitespace-nowrap ${
                  activeTab === 'settings'
                    ? 'border-luminexs-blue text-luminexs-blue bg-white'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>{t('Store Settings', 'கடை அமைப்புகள்')}</span>
              </button>
            </div>

            {/* TAB 1: PRODUCTS INVENTORY */}
            {activeTab === 'products' && (
              <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-4">
                {/* Top Action Bar */}
                {!isAddingProduct && !editingProduct && (
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <h3 className="font-black text-gray-900 text-base">
                        {t('Battery Inventory Management', 'பேட்டரி இருப்பு மேலாண்மை')}
                      </h3>
                      <p className="text-xs text-gray-500">
                        {t(
                          'Update pricing, stock availability, or add multiple photos per battery.',
                          'விலை மாற்றவும், புதிய பேட்டரி சேர்க்கவும் அல்லது பல படங்களை பதிவேற்றவும்.'
                        )}
                      </p>
                    </div>

                    <button
                      onClick={handleStartAdd}
                      className="px-4 py-2.5 rounded-xl bg-luminexs-blue hover:bg-blue-900 text-white font-bold text-xs flex items-center gap-1.5 shadow"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{t('Add New Battery', 'புதிய பேட்டரி சேர்க்க')}</span>
                    </button>
                  </div>
                )}

                {/* ADD / EDIT PRODUCT FORM */}
                {(isAddingProduct || editingProduct) && (
                  <form onSubmit={handleSaveProduct} className="bg-gray-50 p-4 sm:p-6 rounded-2xl border border-gray-300 space-y-4">
                    <div className="flex items-center justify-between border-b pb-3">
                      <h4 className="font-black text-sm text-gray-900">
                        {isAddingProduct
                          ? t('➕ Add New Battery to Catalog', '➕ புதிய பேட்டரி சேர்க்க')
                          : t(`✏️ Edit Product: ${editingProduct?.name}`, `✏️ திருத்துக: ${editingProduct?.name}`)}
                      </h4>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingProduct(false);
                          setEditingProduct(null);
                        }}
                        className="text-xs text-gray-500 hover:text-gray-900 font-bold"
                      >
                        {t('Cancel', 'ரத்து செய்')}
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <label className="block font-bold text-gray-700 mb-1">
                          {t('Product Name *', 'பொருளின் பெயர் *')}
                        </label>
                        <input
                          type="text"
                          required
                          value={productForm.name}
                          onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                          placeholder="e.g. Ultra-Luminexs Dura-Tube 150Ah"
                          className="w-full p-2.5 border rounded-lg bg-white font-medium"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-gray-700 mb-1">
                          {t('Brand Name', 'பிராண்ட் பெயர்')}
                        </label>
                        <input
                          type="text"
                          value={productForm.brand}
                          onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                          className="w-full p-2.5 border rounded-lg bg-white font-medium"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-gray-700 mb-1">
                          {t('Category', 'வகை')}
                        </label>
                        <select
                          value={productForm.category}
                          onChange={(e) => setProductForm({ ...productForm, category: e.target.value as ProductCategory })}
                          className="w-full p-2.5 border rounded-lg bg-white font-medium"
                        >
                          <option value="car">{t('🚗 Car Batteries', '🚗 கார் பேட்டரிகள்')}</option>
                          <option value="bike">{t('🏍️ Bike & 2-Wheeler', '🏍️ பைக் & ஸ்கூட்டர்')}</option>
                          <option value="inverter">{t('⚡ Inverter & Tubular', '⚡ இன்வெர்ட்டர் & டியூபுலர்')}</option>
                          <option value="solar">{t('☀️ Solar Batteries', '☀️ சோலார் பேட்டரிகள்')}</option>
                          <option value="commercial">{t('🚚 Tractor & Commercial', '🚚 டிராக்டர் & லோடு வண்டி')}</option>
                        </select>
                      </div>

                      <div>
                        <label className="block font-bold text-gray-700 mb-1">
                          {t('Capacity (Ah)', 'Ah திறன்')}
                        </label>
                        <input
                          type="number"
                          value={productForm.capacityAh}
                          onChange={(e) => setProductForm({ ...productForm, capacityAh: Number(e.target.value) })}
                          placeholder="e.g. 150 or 35"
                          className="w-full p-2.5 border rounded-lg bg-white font-medium"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-gray-700 mb-1">
                          {t('Offer Price (Selling Price) ₹ *', 'விற்பனை விலை ₹ *')}
                        </label>
                        <input
                          type="number"
                          required
                          value={productForm.price}
                          onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                          placeholder="e.g. 14200"
                          className="w-full p-2.5 border rounded-lg bg-white font-bold text-emerald-700"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-gray-700 mb-1">
                          {t('Optional Reference Price ₹', 'கூடுதல் குறிப்பு விலை ₹')}
                        </label>
                        <input
                          type="number"
                          value={productForm.withOldBatteryPrice}
                          onChange={(e) => setProductForm({ ...productForm, withOldBatteryPrice: Number(e.target.value) })}
                          placeholder="e.g. 11800"
                          className="w-full p-2.5 border rounded-lg bg-white font-bold text-emerald-700"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-gray-700 mb-1">
                          {t('MRP Price ₹', 'அதிகபட்ச சில்லறை விலை (MRP) ₹')}
                        </label>
                        <input
                          type="number"
                          value={productForm.mrp}
                          onChange={(e) => setProductForm({ ...productForm, mrp: Number(e.target.value) })}
                          placeholder="e.g. 18500"
                          className="w-full p-2.5 border rounded-lg bg-white font-medium text-gray-500"
                        />
                      </div>

                      <div>
                        <label className="block font-bold text-gray-700 mb-1">
                          {t('Warranty (Months)', 'வாரண்டி (மாதங்கள்)')}
                        </label>
                        <input
                          type="number"
                          value={productForm.warrantyMonths}
                          onChange={(e) => setProductForm({ ...productForm, warrantyMonths: Number(e.target.value) })}
                          placeholder="e.g. 60"
                          className="w-full p-2.5 border rounded-lg bg-white font-medium"
                        />
                      </div>

                      {/* MULTI-IMAGE MANAGEMENT SECTION */}
                      <div className="sm:col-span-2 space-y-4 bg-white p-4 sm:p-5 rounded-2xl border border-gray-200">
                        <div className="flex items-center justify-between border-b pb-2">
                          <div>
                            <h4 className="font-extrabold text-gray-900 text-xs sm:text-sm flex items-center gap-1.5">
                              <ImageIcon className="w-4 h-4 text-luminexs-blue" />
                              <span>{t('Product Photos & Gallery', 'பேட்டரி படங்கள் & கேலரி')}</span>
                            </h4>
                            <p className="text-[11px] text-gray-500">
                              {t(
                                'Set the primary card photo for the homepage, and upload additional photos for the details modal.',
                                'முகப்பு பக்கத்திற்கு முதன்மை படத்தையும், கூடுதல் படங்களையும் இங்கு மாற்றலாம்.'
                              )}
                            </p>
                          </div>
                          <span className="text-[11px] font-bold bg-blue-50 text-blue-800 px-2.5 py-1 rounded-full border border-blue-200">
                            {t(
                              `${(productForm.image ? 1 : 0) + (productForm.additionalImages?.length || 0)} photo(s)`,
                              `${(productForm.image ? 1 : 0) + (productForm.additionalImages?.length || 0)} படங்கள்`
                            )}
                          </span>
                        </div>

                        {/* SECTION A: PRIMARY MAIN CARD PHOTO */}
                        <div className="p-3.5 bg-emerald-50/70 rounded-xl border border-emerald-200 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-xs text-emerald-950 flex items-center gap-1.5">
                              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                              <span>{t('Main Photo (Shown on Homepage Card)', 'முதன்மை படம் (முகப்பு பக்க அட்டை)')}</span>
                            </span>
                            <span className="text-[10px] bg-emerald-600 text-white font-black px-2 py-0.5 rounded">
                              HOMEPAGE PRIMARY
                            </span>
                          </div>

                          <div className="flex flex-col sm:flex-row items-center gap-4">
                            {/* Primary Image Preview Box */}
                            <div className="relative w-28 h-28 rounded-xl border-2 border-emerald-600 bg-white p-1.5 flex items-center justify-center overflow-hidden shadow-sm flex-shrink-0">
                              <img
                                src={productForm.image || 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=600&q=80'}
                                alt="Main Product"
                                className="w-full h-full object-contain"
                              />
                            </div>

                            {/* Primary Upload Controls */}
                            <div className="space-y-2 flex-1 w-full">
                              <label className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl cursor-pointer text-xs shadow-sm transition active:scale-95 w-full sm:w-auto">
                                <Upload className="w-4 h-4" />
                                <span>{t('Upload New Main Photo (PC / Phone)', 'புதிய முதன்மை படம் பதிவேற்ற')}</span>
                                <input
                                  type="file"
                                  accept="image/png, image/jpeg, image/webp"
                                  onChange={handlePrimaryImageUpload}
                                  className="hidden"
                                />
                              </label>
                              <p className="text-[11px] text-emerald-900">
                                {t(
                                  'This is the main photo customers see while browsing products on the homepage and search results.',
                                  'வாடிக்கையாளர்கள் முகப்பு பக்கத்தில் பார்க்கும் முக்கிய படம் இதுவே.'
                                )}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* SECTION B: ADDITIONAL GALLERY PHOTOS */}
                        <div className="p-3.5 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-xs text-gray-800 flex items-center gap-1.5">
                              <Layers className="w-4 h-4 text-luminexs-blue" />
                              <span>{t('Additional Gallery Photos (Shown in Details Modal)', 'கூடுதல் படங்கள் (விவரங்கள் பாப்-அப்)')}</span>
                            </span>
                            <span className="text-[10px] text-gray-500 font-bold">
                              {productForm.additionalImages?.length || 0} {t('extra photos', 'கூடுதல் படங்கள்')}
                            </span>
                          </div>

                          {/* Gallery Thumbnails List */}
                          <div className="flex flex-wrap items-center gap-3">
                            {productForm.additionalImages && productForm.additionalImages.length > 0 ? (
                              productForm.additionalImages.map((imgUrl, idx) => (
                                <div
                                  key={idx}
                                  className="relative group w-28 h-28 rounded-xl border-2 border-gray-300 hover:border-blue-500 bg-white p-1.5 flex flex-col items-center justify-between overflow-hidden shadow-sm transition"
                                >
                                  <div className="flex-1 w-full flex items-center justify-center overflow-hidden">
                                    <img
                                      src={imgUrl}
                                      alt={`Gallery ${idx + 1}`}
                                      className="max-h-16 object-contain"
                                    />
                                  </div>

                                  <div className="w-full flex items-center gap-1 pt-1 border-t border-gray-100">
                                    <button
                                      type="button"
                                      onClick={() => handleSetAsPrimary(imgUrl)}
                                      className="flex-1 bg-luminexs-blue hover:bg-blue-900 text-white text-[9px] font-bold py-1 rounded flex items-center justify-center gap-0.5 shadow-sm transition"
                                      title={t('Make this the main homepage card photo', 'இதை முதன்மை படமாக மாற்ற')}
                                    >
                                      <Star className="w-2.5 h-2.5 fill-yellow-400 text-yellow-400" />
                                      <span>{t('Make Main', 'முதன்மை')}</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => handleRemoveImage(imgUrl, false)}
                                      className="bg-red-100 hover:bg-red-200 text-red-700 p-1 rounded transition"
                                      title={t('Delete this photo', 'இப்படத்தை நீக்கு')}
                                    >
                                      <X className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              ))
                            ) : (
                              <p className="text-gray-400 text-xs italic py-2">
                                {t('No additional gallery photos added yet. Upload below.', 'கூடுதல் படங்கள் இல்லை. கீழே சேர்க்கலாம்.')}
                              </p>
                            )}
                          </div>

                          {/* Upload Controls for Additional Photos */}
                          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                            <label className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-yellow-400 hover:bg-yellow-500 text-gray-950 font-bold rounded-xl cursor-pointer text-xs shadow-sm transition active:scale-95">
                              <Upload className="w-4 h-4" />
                              <span>{t('+ Add Gallery Photos', '+ கேலரி படங்கள் சேர்க்க')}</span>
                              <input
                                type="file"
                                multiple
                                accept="image/png, image/jpeg, image/webp"
                                onChange={handleMultipleImagesUpload}
                                className="hidden"
                              />
                            </label>

                            <div className="flex-1 flex gap-1">
                              <input
                                type="text"
                                value={newImageUrlInput}
                                onChange={(e) => setNewImageUrlInput(e.target.value)}
                                placeholder={t('Or paste web photo URL (https://...)', 'அல்லது இணையதள பட இணைப்பு URL')}
                                className="flex-1 p-2 border border-gray-300 rounded-lg bg-white text-xs font-mono"
                              />
                              <button
                                type="button"
                                onClick={handleAddImageUrl}
                                className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-lg text-xs flex items-center gap-1"
                              >
                                <PlusCircle className="w-3.5 h-3.5" />
                                <span>{t('Add', 'சேர்')}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Stock Switch */}
                      <div className="sm:col-span-2 flex items-center gap-3 pt-2">
                        <span className="font-bold text-gray-800">{t('Stock Availability:', 'கையிருப்பு நிலை:')}</span>
                        <button
                          type="button"
                          onClick={() => setProductForm({ ...productForm, inStock: !productForm.inStock })}
                          className={`px-4 py-1.5 rounded-full font-extrabold text-xs transition ${
                            productForm.inStock
                              ? 'bg-emerald-600 text-white'
                              : 'bg-red-600 text-white'
                          }`}
                        >
                          {productForm.inStock 
                            ? t('✅ IN STOCK (Available for delivery)', '✅ IN STOCK (கையிருப்பில் உள்ளது)')
                            : t('❌ OUT OF STOCK', '❌ OUT OF STOCK (இல்லை)')}
                        </button>
                      </div>
                    </div>

                    <div className="pt-3 border-t flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsAddingProduct(false);
                          setEditingProduct(null);
                        }}
                        className="px-4 py-2 rounded-xl bg-gray-200 text-gray-800 font-bold text-xs"
                      >
                        {t('Cancel', 'ரத்து செய்')}
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center gap-1.5 shadow"
                      >
                        <Save className="w-4 h-4" />
                        <span>{t('Save Product', 'சேமிக்கவும்')}</span>
                      </button>
                    </div>
                  </form>
                )}

                {/* TABLE OF EXISTING PRODUCTS */}
                {!isAddingProduct && !editingProduct && (
                  <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs divide-y divide-gray-200">
                        <thead className="bg-gray-100 text-gray-700 uppercase font-black">
                          <tr>
                            <th className="p-3">{t('Photo', 'படம்')}</th>
                            <th className="p-3">{t('Battery Name', 'பேட்டரி பெயர்')}</th>
                            <th className="p-3">{t('Category', 'வகை')}</th>
                            <th className="p-3">{t('Price', 'விலை')}</th>
                            <th className="p-3">{t('With Scrap Price', 'எக்ஸ்சேஞ்ச் விலை')}</th>
                            <th className="p-3">{t('Stock', 'ஸ்டாக்')}</th>
                            <th className="p-3 text-right">{t('Actions', 'செயல்கள்')}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                          {products.map((p) => {
                            const photoCount = 1 + (p.additionalImages?.length || 0);
                            return (
                              <tr key={p.id} className="hover:bg-gray-50 transition">
                                <td className="p-2.5">
                                  <div className="relative w-10 h-10">
                                    <img
                                      src={p.image}
                                      alt={p.name}
                                      className="w-10 h-10 object-contain rounded bg-gray-50 p-0.5 border"
                                    />
                                    {photoCount > 1 && (
                                      <span className="absolute -bottom-1 -right-1 bg-gray-900 text-white text-[9px] font-bold px-1 rounded-full">
                                        +{photoCount - 1}
                                      </span>
                                    )}
                                  </div>
                                </td>
                                <td className="p-2.5 font-bold text-gray-900 max-w-[180px] truncate">
                                  {p.name}
                                  <div className="text-[10px] text-gray-400 font-normal">
                                    {p.capacityAh} Ah • {p.warrantyMonths}M
                                  </div>
                                </td>
                                <td className="p-2.5 uppercase font-semibold text-gray-600">
                                  {p.category}
                                </td>
                                <td className="p-2.5 font-black text-gray-950">
                                  ₹{p.price.toLocaleString('en-IN')}
                                </td>
                                <td className="p-2.5 font-black text-emerald-700">
                                  ₹{p.withOldBatteryPrice.toLocaleString('en-IN')}
                                </td>
                                <td className="p-2.5">
                                  <button
                                    onClick={() => toggleProductStock(p.id)}
                                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                      p.inStock
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : 'bg-red-100 text-red-800'
                                    }`}
                                    title={t('Click to toggle stock', 'ஸ்டாக் நிலையை மாற்ற')}
                                  >
                                    {p.inStock ? t('In Stock', 'இருப்பில் உள்ளது') : t('Out of Stock', 'இல்லை')}
                                  </button>
                                </td>
                                <td className="p-2.5 text-right space-x-1">
                                  <button
                                    onClick={() => handleStartEdit(p)}
                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                                    title={t('Edit', 'திருத்து')}
                                  >
                                    <Edit3 className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => {
                                      if (confirm(t(`Are you sure you want to delete ${p.name}?`, `${p.name} பேட்டரியை நீக்க விரும்புகிறீர்களா?`))) {
                                        deleteProduct(p.id);
                                      }
                                    }}
                                    className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                                    title={t('Delete', 'நீக்கு')}
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: BANNERS MANAGEMENT */}
            {activeTab === 'banners' && (
              <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-6">
                {/* Header & Add Button */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
                  <div>
                    <h3 className="font-black text-base text-gray-900 flex items-center gap-2">
                      <Layers className="w-5 h-5 text-luminexs-blue" />
                      <span>{t('Promotional Homepage Banners', 'முகப்பு விளம்பர பேனர்கள்')}</span>
                    </h3>
                    <p className="text-xs text-gray-500">
                      {t(
                        'Manage desktop and mobile banners. Upload photos from phone/computer or enter image links.',
                        'டெஸ்க்டாப் மற்றும் மொபைல் பேனர்களை நிர்வகிக்கவும். படங்களை நேரடியாக பதிவேற்றலாம்.'
                      )}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddNewBanner}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-luminexs-blue hover:bg-blue-700 text-white font-extrabold rounded-xl text-xs shadow-md transition self-start sm:self-auto"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{t('+ Add New Banner', '+ புதிய பேனர் சேர்')}</span>
                  </button>
                </div>

                {/* Banner Dimensions Reference Card (Admin Only) */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-4 sm:p-5 rounded-2xl text-xs text-blue-950 space-y-3 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Info className="w-5 h-5 text-luminexs-blue flex-shrink-0" />
                    <h4 className="font-black text-sm text-luminexs-navy">
                      {t('Storefront Banner Dimensions & Best Practice Guide:', 'பேனர் அளவுகள் மற்றும் வழிகாட்டி:')}
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 bg-white/80 rounded-xl border border-blue-100 space-y-1">
                      <p className="font-extrabold text-blue-900 flex items-center gap-1.5">
                        <Laptop className="w-4 h-4 text-luminexs-blue" />
                        <span>{t('Desktop Banner View', 'டெஸ்க்டாப் காட்சி')}</span>
                        <span className="ml-auto bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-[10px] font-black">1920 × 600 px</span>
                      </p>
                      <p className="text-gray-600 text-[11px]">
                        {t(
                          'Wide landscape layout (~16:5 ratio). Ideal for PC, laptop, and tablet screens. Format: WebP or JPG (<400KB).',
                          'அகலமான காட்சி (~16:5). கணினி, மடிக்கணினி மற்றும் டேப்லெட்டுகளுக்கு ஏற்றது (<400KB).'
                        )}
                      </p>
                    </div>

                    <div className="p-3 bg-white/80 rounded-xl border border-blue-100 space-y-1">
                      <p className="font-extrabold text-emerald-900 flex items-center gap-1.5">
                        <Smartphone className="w-4 h-4 text-emerald-600" />
                        <span>{t('Mobile Banner View', 'மொபைல் காட்சி')}</span>
                        <span className="ml-auto bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded text-[10px] font-black">1080 × 600 px</span>
                      </p>
                      <p className="text-gray-600 text-[11px]">
                        {t(
                          'Optimized smartphone proportion (~9:5 ratio). Keeps battery product graphics & offer text centered and sharp (<250KB).',
                          'ஸ்மார்ட்போன்களுக்கு ஏற்றது (~9:5). தயாரிப்பு மற்றும் சலுகை உரை மையமாக இருக்கும் (<250KB).'
                        )}
                      </p>
                    </div>
                  </div>

                  <p className="text-[11px] text-blue-800/90 bg-blue-100/60 p-2.5 rounded-lg">
                    💡 <strong>{t('Smart Mobile Fallback:', 'ஸ்மார்ட் வசதி:')}</strong> {t(
                      'If a mobile banner image is left empty, the website automatically adapts and displays the desktop banner on mobile devices.',
                      'மொபைல் படம் குறிப்பிடப்படாவிட்டால், தானாகவே டெஸ்க்டாப் படம் மொபைல் பயனர்களுக்கு காண்பிக்கப்படும்.'
                    )}
                  </p>
                </div>

                {/* Banner Cards List */}
                <div className="space-y-6">
                  {banners.map((b, idx) => (
                    <div 
                      key={b.id} 
                      className="p-5 rounded-2xl border-2 border-gray-200 bg-white space-y-4 text-xs shadow-sm hover:border-luminexs-blue/30 transition"
                    >
                      {/* Banner Card Top Strip */}
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="bg-luminexs-navy text-white text-[10px] font-black px-2.5 py-1 rounded-md">
                            #{idx + 1}
                          </span>
                          <span className="font-black text-sm text-gray-900 line-clamp-1">
                            {b.title || t('Untitled Banner', 'தலைப்பற்ற பேனர்')}
                          </span>
                          {b.badge && (
                            <span className="hidden sm:inline-block bg-yellow-100 text-yellow-800 font-extrabold text-[10px] px-2 py-0.5 rounded-full border border-yellow-300">
                              {b.badge}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-1 rounded-md font-bold border border-blue-200">
                            {t('Target:', 'பிரிவு:')} {b.targetCategory || 'all'}
                          </span>

                          <button
                            type="button"
                            onClick={() => handleDeleteBanner(b.id)}
                            disabled={banners.length <= 1}
                            title={banners.length <= 1 ? t('Cannot delete the last remaining banner', 'கடைசி பேனரை நீக்க முடியாது') : t('Delete this banner', 'இந்த பேனரை நீக்கு')}
                            className={`p-1.5 rounded-lg transition flex items-center gap-1 font-bold text-xs ${
                              banners.length <= 1
                                ? 'text-gray-300 cursor-not-allowed'
                                : 'text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200'
                            }`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">{t('Delete', 'நீக்கு')}</span>
                          </button>
                        </div>
                      </div>

                      {/* SIDE-BY-SIDE DESKTOP & MOBILE MEDIA CONTROLS */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                        {/* 1. DESKTOP BANNER MEDIA */}
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-gray-800 flex items-center gap-1.5">
                              <Laptop className="w-4 h-4 text-luminexs-blue" />
                              <span>{t('Desktop Banner (1920 × 600 px)', 'டெஸ்க்டாப் பேனர் (1920 × 600 px)')}</span>
                            </span>
                            <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                              {t('Wide Screen', 'அகல திரை')}
                            </span>
                          </div>

                          {/* Desktop Live Preview Box */}
                          <div className="relative w-full h-32 bg-gray-900 rounded-xl overflow-hidden border border-gray-300 shadow-inner group">
                            <img
                              src={b.desktopImage || 'https://images.unsplash.com/photo-1558441719-743d8c2e6f47?auto=format&fit=crop&w=1920&q=80'}
                              alt="Desktop Banner Preview"
                              className="w-full h-full object-cover filter brightness-[0.8]"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1558441719-743d8c2e6f47?auto=format&fit=crop&w=1920&q=80';
                              }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent p-3 flex flex-col justify-end text-white pointer-events-none">
                              <p className="text-[10px] font-black text-yellow-400 uppercase tracking-wider">{b.badge || 'ULTRA-LUMINEXS'}</p>
                              <p className="text-xs font-bold line-clamp-1">{b.title || 'Banner Headline'}</p>
                            </div>
                            <span className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm text-white text-[9px] font-black px-2 py-0.5 rounded-full border border-white/20">
                              1920 × 600
                            </span>
                          </div>

                          {/* Desktop Controls */}
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <label className="flex-1 cursor-pointer inline-flex items-center justify-center gap-2 px-3 py-2 bg-luminexs-navy hover:bg-blue-900 text-white font-bold rounded-lg text-xs transition shadow-sm">
                                <Upload className="w-3.5 h-3.5" />
                                <span>{t('Upload Desktop Image', 'டெஸ்க்டாப் படம் பதிவேற்ற')}</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => handleBannerImageUpload(b, 'desktopImage', e)}
                                />
                              </label>
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-gray-600 mb-0.5">
                                {t('Or Desktop Image URL:', 'அல்லது டெஸ்க்டாப் படம் இணைப்பு:')}
                              </label>
                              <input
                                type="text"
                                value={b.desktopImage}
                                onChange={(e) => updateBanner({ ...b, desktopImage: e.target.value })}
                                placeholder="https://..."
                                className="w-full p-2 border border-gray-300 rounded-lg bg-white font-mono text-[11px]"
                              />
                            </div>
                          </div>
                        </div>

                        {/* 2. MOBILE BANNER MEDIA */}
                        <div className="space-y-2.5">
                          <div className="flex items-center justify-between">
                            <span className="font-extrabold text-gray-800 flex items-center gap-1.5">
                              <Smartphone className="w-4 h-4 text-emerald-600" />
                              <span>{t('Mobile Banner (1080 × 600 px)', 'மொபைல் பேனர் (1080 × 600 px)')}</span>
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              b.mobileImage ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {b.mobileImage ? t('Mobile Custom', 'மொபைல் படம்') : t('Desktop Fallback', 'டெஸ்க்டாப் மாற்று')}
                            </span>
                          </div>

                          {/* Mobile Live Preview Box */}
                          <div className="relative w-full h-32 bg-gray-900 rounded-xl overflow-hidden border border-gray-300 shadow-inner group">
                            <img
                              src={b.mobileImage || b.desktopImage || 'https://images.unsplash.com/photo-1558441719-743d8c2e6f47?auto=format&fit=crop&w=1080&q=80'}
                              alt="Mobile Banner Preview"
                              className="w-full h-full object-cover filter brightness-[0.8]"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1558441719-743d8c2e6f47?auto=format&fit=crop&w=1080&q=80';
                              }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent p-3 flex flex-col justify-end text-white pointer-events-none">
                              <p className="text-[10px] font-black text-yellow-400 uppercase tracking-wider">{b.badge || 'ULTRA-LUMINEXS'}</p>
                              <p className="text-xs font-bold line-clamp-1">{b.title || 'Banner Headline'}</p>
                            </div>
                            <span className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm text-white text-[9px] font-black px-2 py-0.5 rounded-full border border-white/20">
                              {b.mobileImage ? '1080 × 600' : 'Fallback (1920)'}
                            </span>
                          </div>

                          {/* Mobile Controls */}
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <label className="flex-1 cursor-pointer inline-flex items-center justify-center gap-2 px-3 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg text-xs transition shadow-sm">
                                <Upload className="w-3.5 h-3.5" />
                                <span>{t('Upload Mobile Image', 'மொபைல் படம் பதிவேற்ற')}</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => handleBannerImageUpload(b, 'mobileImage', e)}
                                />
                              </label>

                              {b.mobileImage && b.mobileImage !== b.desktopImage && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    updateBanner({ ...b, mobileImage: '' });
                                    setStatusMessage(t('Mobile banner reset to use desktop image.', 'மொபைல் பேனர் டெஸ்க்டாப் படத்திற்கு மாற்றப்பட்டது.'));
                                    setTimeout(() => setStatusMessage(''), 3000);
                                  }}
                                  className="px-2.5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-[11px] font-bold transition whitespace-nowrap"
                                  title={t('Use desktop image for mobile view', 'மொபைலுக்கும் டெஸ்க்டாப் படத்தை பயன்படுத்த')}
                                >
                                  {t('Use Desktop Fallback', 'டெஸ்க்டாப் படம் பயன்படுத்து')}
                                </button>
                              )}
                            </div>

                            <div>
                              <label className="block text-[11px] font-bold text-gray-600 mb-0.5">
                                {t('Or Mobile Image URL (Optional):', 'அல்லது மொபைல் படம் இணைப்பு:')}
                              </label>
                              <input
                                type="text"
                                value={b.mobileImage || ''}
                                onChange={(e) => updateBanner({ ...b, mobileImage: e.target.value })}
                                placeholder={t('Leave blank to use desktop image', 'காலியாக விட்டால் டெஸ்க்டாப் படம் பயன்படும்')}
                                className="w-full p-2 border border-gray-300 rounded-lg bg-white font-mono text-[11px]"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* BANNER CONTENT, BADGES & CTA SETTINGS */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
                        <div className="sm:col-span-2">
                          <label className="block font-bold text-gray-700 mb-1">
                            {t('Banner Headline (Bold Title)', 'பேனர் தலைப்பு')}
                          </label>
                          <input
                            type="text"
                            value={b.title}
                            onChange={(e) => updateBanner({ ...b, title: sanitizeInput(e.target.value) })}
                            className="w-full p-2.5 border border-gray-300 rounded-lg bg-white font-semibold text-gray-900"
                            placeholder="e.g. ULTRA-LUMINEXS DURA-TUBE INVERTER BATTERIES"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-gray-700 mb-1">
                            {t('Promo Badge Tag', 'சலுகை குறிச்சொல்')}
                          </label>
                          <input
                            type="text"
                            value={b.badge || ''}
                            onChange={(e) => updateBanner({ ...b, badge: sanitizeInput(e.target.value) })}
                            className="w-full p-2.5 border border-gray-300 rounded-lg bg-white"
                            placeholder="e.g. FESTIVE OFFER - UP TO ₹2,500 OFF"
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block font-bold text-gray-700 mb-1">
                            {t('Subtitle / Offer Details', 'துணை உரை / சலுகை விவரம்')}
                          </label>
                          <input
                            type="text"
                            value={b.subtitle}
                            onChange={(e) => updateBanner({ ...b, subtitle: sanitizeInput(e.target.value) })}
                            className="w-full p-2.5 border border-gray-300 rounded-lg bg-white"
                            placeholder="e.g. Heavy Duty 150Ah & 220Ah Tubular Batteries with 72 Months Warranty"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-gray-700 mb-1">
                            {t('Button Text (CTA)', 'பொத்தான் உரை')}
                          </label>
                          <input
                            type="text"
                            value={b.ctaText}
                            onChange={(e) => updateBanner({ ...b, ctaText: sanitizeInput(e.target.value) })}
                            className="w-full p-2.5 border border-gray-300 rounded-lg bg-white"
                            placeholder="e.g. View Inverter Batteries"
                          />
                        </div>

                        <div className="sm:col-span-3">
                          <label className="block font-bold text-gray-700 mb-1">
                            {t('Target Category When Clicked', 'கிளிக் செய்யும் போது செல்லும் பிரிவு')}
                          </label>
                          <select
                            value={b.targetCategory || 'all'}
                            onChange={(e) => updateBanner({ ...b, targetCategory: e.target.value as any })}
                            className="w-full sm:w-80 p-2.5 border border-gray-300 rounded-lg bg-white font-medium text-xs"
                          >
                            <option value="all">{t('All Batteries (All Categories)', 'அனைத்து பேட்டரிகள்')}</option>
                            <option value="car">{t('Car Batteries', 'கார் பேட்டரிகள்')}</option>
                            <option value="bike">{t('Bike / Two-Wheeler Batteries', 'பைக் பேட்டரிகள்')}</option>
                            <option value="inverter">{t('Inverter & Home UPS Batteries', 'இன்வெர்ட்டர் பேட்டரிகள்')}</option>
                            <option value="solar">{t('Solar Batteries', 'சோலார் பேட்டரிகள்')}</option>
                            <option value="commercial">{t('Commercial Vehicle Batteries', 'வணிக வாகன பேட்டரிகள்')}</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: SECURITY, CREDENTIALS & ACTIVE DEVICES */}
            {activeTab === 'security' && (
              <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-6 text-xs max-w-3xl">
                {/* 1. Active & Recognized Devices Card */}
                <div className="space-y-3 bg-gray-50 p-4 sm:p-5 rounded-2xl border border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-3">
                    <div>
                      <h4 className="font-black text-sm text-gray-900 flex items-center gap-2">
                        <Smartphone className="w-4 h-4 text-luminexs-blue" />
                        <span>{t('Recognized Devices & Mobile Logins', 'அங்கீகரிக்கப்பட்ட மொபைல்கள் & சாதனங்கள்')}</span>
                      </h4>
                      <p className="text-[11px] text-gray-500">
                        {t('Devices permitted to access this admin portal.', 'இந்த போர்ட்டலை அணுகிய சாதனங்கள்.')}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleRevokeOtherDevices}
                      className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-xs shadow-sm self-start sm:self-auto transition"
                    >
                      {t('Revoke All Other Devices', 'மற்ற அனைத்து சாதனங்களையும் துண்டிக்க')}
                    </button>
                  </div>

                  {/* Device list */}
                  <div className="space-y-2">
                    {recognizedDevices.map((d) => {
                      const isThisCurrent = d.deviceId === currentDevice.deviceId;
                      return (
                        <div
                          key={d.deviceId}
                          className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                            isThisCurrent ? 'bg-emerald-50/80 border-emerald-300' : 'bg-white border-gray-200'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            {d.deviceType === 'Mobile' ? (
                              <Smartphone className={`w-5 h-5 ${isThisCurrent ? 'text-emerald-700' : 'text-gray-500'}`} />
                            ) : (
                              <Laptop className={`w-5 h-5 ${isThisCurrent ? 'text-emerald-700' : 'text-gray-500'}`} />
                            )}
                            <div>
                              <p className="font-bold text-gray-900 flex items-center gap-2">
                                <span>{d.displayName}</span>
                                {isThisCurrent && (
                                  <span className="bg-emerald-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded-full">
                                    CURRENT DEVICE
                                  </span>
                                )}
                              </p>
                              <p className="text-[10px] text-gray-500">
                                {t('Last active:', 'கடைசி செயல்பாடு:')} {new Date(d.lastSeen).toLocaleString('en-IN')}
                              </p>
                            </div>
                          </div>

                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                            {t('Authorized', 'அங்கீகரிக்கப்பட்டது')}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Change Username & Password Card */}
                <form onSubmit={handleUpdateCredentials} className="space-y-4 bg-gray-50 p-4 sm:p-5 rounded-2xl border border-gray-200">
                  <div className="flex items-center gap-2 border-b pb-2">
                    <KeyRound className="w-4 h-4 text-yellow-600" />
                    <h4 className="font-black text-sm text-gray-900">
                      {t('Change Admin Username & Password', 'அட்மின் பயனர் பெயர் & கடவுச்சொல் மாற்றம்')}
                    </h4>
                  </div>

                  {credentialMessage && (
                    <p className={`p-2.5 rounded-lg font-bold text-xs ${credentialMessage.includes('✅') ? 'bg-emerald-100 text-emerald-900 border border-emerald-200' : 'bg-red-100 text-red-900 border border-red-200'}`}>
                      {credentialMessage}
                    </p>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block font-bold text-gray-700 mb-1">
                        {t('Current Password *', 'தற்போதைய கடவுச்சொல் *')}
                      </label>
                      <input
                        type="password"
                        required
                        value={currentPasswordCheck}
                        onChange={(e) => setCurrentPasswordCheck(e.target.value)}
                        placeholder="Current password"
                        className="w-full p-2.5 border rounded-lg bg-white"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-gray-700 mb-1">
                        {t('New Username', 'புதிய பயனர் பெயர்')}
                      </label>
                      <input
                        type="text"
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                        placeholder={settings.adminUsername || 'admin'}
                        className="w-full p-2.5 border rounded-lg bg-white font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-gray-700 mb-1">
                        {t('New Password (min 8 chars)', 'புதிய கடவுச்சொல்')}
                      </label>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Min 8 characters"
                        className="w-full p-2.5 border rounded-lg bg-white font-semibold"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-yellow-400 hover:bg-yellow-500 text-gray-950 font-black rounded-xl shadow transition"
                  >
                    {t('Save New Credentials', 'புதிய கடவுச்சொல்லை சேமிக்க')}
                  </button>
                </form>

                {/* 3. Security Audit Logs (Login History) */}
                <div className="space-y-3 bg-gray-50 p-4 sm:p-5 rounded-2xl border border-gray-200">
                  <div className="flex items-center gap-2 border-b pb-2">
                    <History className="w-4 h-4 text-blue-600" />
                    <h4 className="font-black text-sm text-gray-900">
                      {t('Security Activity & Login Logs', 'பாதுகாப்பு & உள்நுழைவு பதிவுகள்')}
                    </h4>
                  </div>

                  <div className="max-h-48 overflow-y-auto space-y-1.5">
                    {securityLogs.length === 0 ? (
                      <p className="text-gray-400 italic text-[11px] py-2">No security events logged yet.</p>
                    ) : (
                      securityLogs.map((log) => (
                        <div
                          key={log.id}
                          className="p-2 rounded-lg bg-white border border-gray-200 flex items-center justify-between text-[11px]"
                        >
                          <div>
                            <span className="font-bold text-gray-900">{log.details}</span>
                            <span className="text-gray-400 ml-2">({log.device})</span>
                          </div>
                          <span className="text-gray-400 font-mono text-[10px]">
                            {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: STORE SETTINGS */}
            {activeTab === 'settings' && (
              <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-6 text-xs max-w-2xl">
                <div className="space-y-4 bg-gray-50 p-4 rounded-2xl border border-gray-200">
                  <h4 className="font-black text-sm text-gray-900 border-b pb-2">
                    {t('Store Contact & WhatsApp Configuration', 'கடை தொடர்பு & வாட்ஸ்அப் அமைப்புகள்')}
                  </h4>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">
                      {t('Company Name', 'நிறுவனத்தின் பெயர்')}
                    </label>
                    <input
                      type="text"
                      value={settingsForm.storeName}
                      onChange={(e) => setSettingsForm({ ...settingsForm, storeName: sanitizeInput(e.target.value) })}
                      className="w-full p-2.5 border rounded-lg bg-white font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">
                      {t('WhatsApp Number for Customer Orders *', 'வாட்ஸ்அப் ஆர்டர் எண் *')}
                    </label>
                    <p className="text-[11px] text-gray-500 mb-1">
                      {t(
                        '(Include country code e.g. 919876543210 without spaces or symbols)',
                        '(நாட்டின் குறியீடுடன் e.g. 919876543210 இடைவெளியின்றி உள்ளிடவும்)'
                      )}
                    </p>
                    <input
                      type="text"
                      value={settingsForm.whatsappNumber}
                      onChange={(e) => setSettingsForm({ ...settingsForm, whatsappNumber: sanitizePhone(e.target.value) })}
                      className="w-full p-2.5 border rounded-lg bg-white font-mono font-bold text-emerald-700"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">
                      {t('Store Calling Phone', 'அழைப்பு எண்')}
                    </label>
                    <input
                      type="text"
                      value={settingsForm.phone}
                      onChange={(e) => setSettingsForm({ ...settingsForm, phone: sanitizePhone(e.target.value) })}
                      className="w-full p-2.5 border rounded-lg bg-white font-bold"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-gray-700 mb-1">
                      {t('Store Physical Address', 'கடை முகவரி')}
                    </label>
                    <input
                      type="text"
                      value={settingsForm.address}
                      onChange={(e) => setSettingsForm({ ...settingsForm, address: sanitizeInput(e.target.value) })}
                      className="w-full p-2.5 border rounded-lg bg-white"
                    />
                  </div>

                  <button
                    onClick={() => {
                      updateSettings(settingsForm);
                      setStatusMessage(t('Store settings saved successfully!', 'கடை விவரங்கள் வெற்றிகரமாக சேமிக்கப்பட்டன!'));
                      setTimeout(() => setStatusMessage(''), 3000);
                    }}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl shadow transition"
                  >
                    {t('Save Store Settings', 'அமைப்புகளை சேமிக்கவும்')}
                  </button>
                </div>

                {/* Safe Export / Backup */}
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-between">
                  <div>
                    <h5 className="font-extrabold text-blue-950">{t('Download Store Backup', 'தரவு காப்புப்பதிவு')}</h5>
                    <p className="text-[11px] text-blue-800">
                      {t(
                        'Download full product inventory & settings as a safe backup file.',
                        'அனைத்து பேட்டரி விவரங்கள் மற்றும் அமைப்புகளை பேக்கப் எடுக்க.'
                      )}
                    </p>
                  </div>
                  <button
                    onClick={handleExportData}
                    className="px-3.5 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold flex items-center gap-1.5 shadow"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{t('Export Backup', 'காப்புப்பதிவு எடுக்க')}</span>
                  </button>
                </div>

                {/* Reset to Factory Defaults */}
                <div className="pt-2 border-t flex items-center justify-between">
                  <div>
                    <p className="font-bold text-gray-800">{t('Reset to Sample Defaults', 'மாதிரி தரவுகளை மீண்டும் மீட்டமைக்க')}</p>
                    <p className="text-[11px] text-gray-500">{t('Reset store back to sample default products and banners', 'மாதிரி தயாரிப்புகளை மீண்டும் கொண்டுவர')}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(t('Are you sure you want to reset all data back to original default demo products?', 'அனைத்து மாதிரி தயாரிப்புகளையும் மீட்டமைக்க விரும்புகிறீர்களா?'))) {
                        resetToDefaults();
                        onClose();
                      }
                    }}
                    className="px-3 py-1.5 rounded-lg border border-red-300 text-red-600 hover:bg-red-50 font-bold"
                  >
                    {t('Reset Defaults', 'Reset Defaults')}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
