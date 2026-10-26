/**
 * Advanced Security Utilities for Ultra-Luminexs
 * - Username & Password Authentication
 * - New Mobile / Device Detection & Fingerprinting
 * - Security Audit Logging (Login History)
 * - Brute-Force Rate Limiting & Lockout
 * - WhatsApp Security Alerts
 */

const LOCKOUT_KEY = 'ultra_luminexs_admin_lockout';
const RECOGNIZED_DEVICES_KEY = 'ultra_luminexs_recognized_devices_v1';
const SECURITY_LOGS_KEY = 'ultra_luminexs_security_logs_v1';

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes lockout

export interface DeviceInfo {
  deviceId: string;
  deviceType: 'Mobile' | 'Tablet' | 'Desktop';
  os: string;
  browser: string;
  displayName: string;
  firstSeen: string;
  lastSeen: string;
}

export interface SecurityLogEntry {
  id: string;
  timestamp: string;
  event: 'LOGIN_SUCCESS' | 'LOGIN_FAILED' | 'NEW_DEVICE_DETECTED' | 'PASSWORD_CHANGED' | 'SESSIONS_REVOKED';
  device: string;
  details: string;
  severity: 'low' | 'medium' | 'high';
}

export interface LockoutStatus {
  isLocked: boolean;
  remainingMinutes: number;
  remainingAttempts: number;
}

// 1. Sanitize text inputs (prevent XSS, HTML injection, dangerous scripts)
export function sanitizeInput(input: string): string {
  if (!input) return '';
  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim();
}

// 2. Sanitize Phone Numbers
export function sanitizePhone(phone: string): string {
  if (!phone) return '';
  return phone.replace(/[^0-9+]/g, '').trim();
}

// 3. Device Detection & Fingerprinting
export function detectCurrentDevice(): DeviceInfo {
  const ua = navigator.userAgent;
  let deviceType: 'Mobile' | 'Tablet' | 'Desktop' = 'Desktop';
  let os = 'Unknown OS';
  let browser = 'Unknown Browser';

  // Device Type
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    deviceType = 'Tablet';
  } else if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/i.test(ua)) {
    deviceType = 'Mobile';
  }

  // Operating System
  if (/Windows/i.test(ua)) os = 'Windows PC';
  else if (/iPhone/i.test(ua)) os = 'Apple iPhone';
  else if (/iPad/i.test(ua)) os = 'Apple iPad';
  else if (/Macintosh|Mac OS X/i.test(ua)) os = 'macOS';
  else if (/Android/i.test(ua)) os = 'Android Mobile';
  else if (/Linux/i.test(ua)) os = 'Linux';

  // Browser
  if (/Chrome/i.test(ua) && !/Chromium|Edge|Edg|OPR/i.test(ua)) browser = 'Chrome';
  else if (/Safari/i.test(ua) && !/Chrome|Chromium|Edge|Edg|OPR/i.test(ua)) browser = 'Safari';
  else if (/Firefox/i.test(ua)) browser = 'Firefox';
  else if (/Edge|Edg/i.test(ua)) browser = 'Edge';
  else if (/OPR|Opera/i.test(ua)) browser = 'Opera';

  // Stable pseudo-fingerprint using screen, userAgent and language
  const rawId = `${os}-${browser}-${deviceType}-${window.screen.width}x${window.screen.height}`;
  let hash = 0;
  for (let i = 0; i < rawId.length; i++) {
    hash = (hash << 5) - hash + rawId.charCodeAt(i);
    hash |= 0;
  }
  const deviceId = `dev-${Math.abs(hash).toString(16)}`;

  return {
    deviceId,
    deviceType,
    os,
    browser,
    displayName: `${deviceType === 'Mobile' ? '📱' : '💻'} ${os} (${browser})`,
    firstSeen: new Date().toISOString(),
    lastSeen: new Date().toISOString(),
  };
}

// 4. Check if current device is unrecognized / new mobile
export function checkDeviceRegistration(currentDevice: DeviceInfo): { isNewDevice: boolean; isFirstTimeDevice: boolean } {
  try {
    const raw = localStorage.getItem(RECOGNIZED_DEVICES_KEY);
    if (!raw) {
      // First time setting up
      localStorage.setItem(RECOGNIZED_DEVICES_KEY, JSON.stringify([currentDevice]));
      return { isNewDevice: false, isFirstTimeDevice: true };
    }

    const devices: DeviceInfo[] = JSON.parse(raw);
    const existing = devices.find((d) => d.deviceId === currentDevice.deviceId);

    if (existing) {
      // Update last seen
      const updated = devices.map((d) =>
        d.deviceId === currentDevice.deviceId ? { ...d, lastSeen: new Date().toISOString() } : d
      );
      localStorage.setItem(RECOGNIZED_DEVICES_KEY, JSON.stringify(updated));
      return { isNewDevice: false, isFirstTimeDevice: false };
    }

    // New device detected!
    devices.push(currentDevice);
    localStorage.setItem(RECOGNIZED_DEVICES_KEY, JSON.stringify(devices));
    return { isNewDevice: true, isFirstTimeDevice: false };
  } catch {
    return { isNewDevice: false, isFirstTimeDevice: false };
  }
}

// 5. Get List of Recognized Devices
export function getRecognizedDevices(): DeviceInfo[] {
  try {
    const raw = localStorage.getItem(RECOGNIZED_DEVICES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// 6. Revoke Other Devices
export function revokeAllOtherDevices(currentDeviceId: string): void {
  try {
    const devices = getRecognizedDevices().filter((d) => d.deviceId === currentDeviceId);
    localStorage.setItem(RECOGNIZED_DEVICES_KEY, JSON.stringify(devices));
  } catch {
    // Ignore error
  }
}

// 7. Security Audit Logging (Login History)
export function logSecurityEvent(
  event: SecurityLogEntry['event'],
  details: string,
  severity: SecurityLogEntry['severity'] = 'low'
): void {
  try {
    const device = detectCurrentDevice();
    const entry: SecurityLogEntry = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      event,
      device: device.displayName,
      details,
      severity,
    };

    const raw = localStorage.getItem(SECURITY_LOGS_KEY);
    const logs: SecurityLogEntry[] = raw ? JSON.parse(raw) : [];
    logs.unshift(entry); // Prepend new log
    // Keep last 30 logs only
    const trimmed = logs.slice(0, 30);
    localStorage.setItem(SECURITY_LOGS_KEY, JSON.stringify(trimmed));
  } catch {
    // Ignore error
  }
}

export function getSecurityLogs(): SecurityLogEntry[] {
  try {
    const raw = localStorage.getItem(SECURITY_LOGS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// 8. Generate WhatsApp Security Alert Link to Shop Owner's Phone
export function createWhatsAppSecurityAlertLink(
  whatsappNumber: string,
  deviceName: string
): string {
  const cleanNumber = sanitizePhone(whatsappNumber).replace(/[^0-9]/g, '');
  const now = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

  const message = `🚨 *ULTRA-LUMINEXS SECURITY ALERT* 🚨

⚠️ *New Device Login Detected!*
An admin logged into your shop management portal from a new device:

📱 *Device:* ${deviceName}
⏰ *Time:* ${now}
🌐 *Status:* Active Session

If this was you, you can safely ignore this alert.
❌ *If this was NOT you*, please log in to your portal immediately, change your admin password, and click "Revoke All Other Devices".`;

  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
}

// 9. Brute Force Protection & Attempt Tracker
export function getLockoutStatus(): LockoutStatus {
  try {
    const record = localStorage.getItem(LOCKOUT_KEY);
    if (!record) {
      return { isLocked: false, remainingMinutes: 0, remainingAttempts: MAX_ATTEMPTS };
    }

    const { attempts, lockedUntil } = JSON.parse(record);
    const now = Date.now();

    if (lockedUntil && now < lockedUntil) {
      const remainingMs = lockedUntil - now;
      return {
        isLocked: true,
        remainingMinutes: Math.ceil(remainingMs / (60 * 1000)),
        remainingAttempts: 0,
      };
    }

    if (lockedUntil && now >= lockedUntil) {
      localStorage.removeItem(LOCKOUT_KEY);
      return { isLocked: false, remainingMinutes: 0, remainingAttempts: MAX_ATTEMPTS };
    }

    const remaining = Math.max(0, MAX_ATTEMPTS - (attempts || 0));
    return { isLocked: false, remainingMinutes: 0, remainingAttempts: remaining };
  } catch {
    return { isLocked: false, remainingMinutes: 0, remainingAttempts: MAX_ATTEMPTS };
  }
}

export function recordFailedAttempt(): LockoutStatus {
  try {
    const record = localStorage.getItem(LOCKOUT_KEY);
    let attempts = 1;
    const now = Date.now();

    if (record) {
      const parsed = JSON.parse(record);
      attempts = (parsed.attempts || 0) + 1;
    }

    if (attempts >= MAX_ATTEMPTS) {
      const lockedUntil = now + LOCKOUT_DURATION_MS;
      localStorage.setItem(LOCKOUT_KEY, JSON.stringify({ attempts, lockedUntil }));
      logSecurityEvent('LOGIN_FAILED', 'Multiple failed login attempts. System entered 15-minute lockout.', 'high');
      return { isLocked: true, remainingMinutes: 15, remainingAttempts: 0 };
    }

    localStorage.setItem(LOCKOUT_KEY, JSON.stringify({ attempts, lockedUntil: null }));
    logSecurityEvent('LOGIN_FAILED', `Failed login attempt #${attempts}.`, 'medium');
    return {
      isLocked: false,
      remainingMinutes: 0,
      remainingAttempts: MAX_ATTEMPTS - attempts,
    };
  } catch {
    return { isLocked: false, remainingMinutes: 0, remainingAttempts: MAX_ATTEMPTS - 1 };
  }
}

export function clearLockoutOnSuccess(): void {
  try {
    localStorage.removeItem(LOCKOUT_KEY);
  } catch {
    // Ignore error
  }
}

// 10. Secure Image File Validation
export function validateImageFile(file: File): { isValid: boolean; error?: string } {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  const MAX_FILE_SIZE_BYTES = 3 * 1024 * 1024; // 3 MB max

  if (!allowedMimeTypes.includes(file.type.toLowerCase())) {
    return {
      isValid: false,
      error: 'Invalid file type. Only JPG, PNG, and WebP images are permitted for security.',
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      isValid: false,
      error: 'File size exceeds 3MB limit. Please select an optimized image.',
    };
  }

  return { isValid: true };
}
