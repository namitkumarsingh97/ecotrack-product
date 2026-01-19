/**
 * i18n Utilities
 * Helper functions for internationalization
 */

export type Locale = 'en' | 'hi';

export const locales: Locale[] = ['en', 'hi'];
export const defaultLocale: Locale = 'en';

/**
 * Get locale from localStorage or browser
 */
export function getLocale(): Locale {
  if (typeof window === 'undefined') return defaultLocale;
  
  const saved = localStorage.getItem('locale') as Locale | null;
  if (saved && locales.includes(saved)) {
    return saved;
  }
  
  // Try to detect from browser
  const browserLang = navigator.language.split('-')[0];
  if (browserLang === 'hi') return 'hi';
  
  return defaultLocale;
}

/**
 * Set locale in localStorage
 */
export function setLocale(locale: Locale): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem('locale', locale);
  // Update HTML lang attribute
  document.documentElement.lang = locale;
}

/**
 * Get locale name
 */
export function getLocaleName(locale: Locale): string {
  const names: Record<Locale, string> = {
    en: 'English',
    hi: 'हिंदी'
  };
  return names[locale];
}

/**
 * Format date according to locale
 */
export function formatDate(date: Date, locale: Locale): string {
  return new Intl.DateTimeFormat(locale === 'hi' ? 'hi-IN' : 'en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}

/**
 * Format number according to locale
 */
export function formatNumber(value: number, locale: Locale): string {
  return new Intl.NumberFormat(locale === 'hi' ? 'hi-IN' : 'en-IN').format(value);
}

