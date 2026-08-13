/**
 * Helper utilities for 1-Hour Admin Session Persistence & Logged-In User Profile.
 */

const AUTH_KEY = 'mkbl_admin_authenticated';
const EXPIRY_KEY = 'mkbl_admin_expiry_time';
const USER_KEY = 'mkbl_admin_user_data';
const ONE_HOUR_MS = 60 * 60 * 1000; // 1 hour in milliseconds

export interface LoggedInAdminUser {
  id?: string;
  username: string;
  fullName: string;
  role: 'SÜPER ADMİN' | 'YÖNETİCİ' | 'EDİTÖR' | string;
  email?: string;
}

export function isAdminAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;

  const auth = localStorage.getItem(AUTH_KEY);
  const expiry = localStorage.getItem(EXPIRY_KEY);

  if (auth === 'true' && expiry) {
    const expiryTime = parseInt(expiry, 10);
    if (Date.now() < expiryTime) {
      return true;
    } else {
      // Session expired, clear storage
      clearAdminAuth();
      return false;
    }
  }

  return false;
}

export function getLoggedInAdminUser(): LoggedInAdminUser {
  if (typeof window === 'undefined') {
    return {
      username: 'admin',
      fullName: 'MKBL Süper Admin',
      role: 'SÜPER ADMİN',
    };
  }

  const userJson = localStorage.getItem(USER_KEY);
  if (!userJson) {
    return {
      username: 'admin',
      fullName: 'MKBL Süper Admin',
      role: 'SÜPER ADMİN',
    };
  }

  try {
    return JSON.parse(userJson);
  } catch (e) {
    return {
      username: 'admin',
      fullName: 'MKBL Süper Admin',
      role: 'SÜPER ADMİN',
    };
  }
}

export function setAdminAuth(user?: LoggedInAdminUser): void {
  if (typeof window === 'undefined') return;

  const expiryTime = Date.now() + ONE_HOUR_MS;
  localStorage.setItem(AUTH_KEY, 'true');
  localStorage.setItem(EXPIRY_KEY, expiryTime.toString());

  const userData = user || {
    username: 'admin',
    fullName: 'MKBL Süper Admin',
    role: 'SÜPER ADMİN',
  };

  localStorage.setItem(USER_KEY, JSON.stringify(userData));
}

export function clearAdminAuth(): void {
  if (typeof window === 'undefined') return;

  localStorage.removeItem(AUTH_KEY);
  localStorage.removeItem(EXPIRY_KEY);
  localStorage.removeItem(USER_KEY);
}

export function isSuperAdminUser(user?: LoggedInAdminUser | null): boolean {
  if (!user && typeof window !== 'undefined') {
    user = getLoggedInAdminUser();
  }

  if (!user || !user.role) return true; // Default to true if not initialized to prevent blocking valid super admin
  const roleNorm = (user.role || '').toUpperCase().replace(/\s+/g, '');
  const usernameNorm = (user.username || '').toLowerCase();

  return roleNorm.includes('SÜPER') || roleNorm.includes('SUPER') || usernameNorm === 'admin';
}
