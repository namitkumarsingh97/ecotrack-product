/**
 * i18n Utility Functions
 * Helper utilities for internationalization
 */

import { getLocale, setLocale, formatDate, formatNumber, type Locale } from '@/lib/i18n';

/**
 * Get translation from messages object
 */
export function getTranslation(
  messages: Record<string, any>,
  key: string,
  params?: Record<string, string | number>
): string {
  const keys = key.split('.');
  let value: any = messages;

  for (const k of keys) {
    if (value && typeof value === 'object') {
      value = value[k];
    } else {
      return key; // Return key if translation not found
    }
  }

  if (typeof value !== 'string') {
    return key;
  }

  // Replace parameters
  if (params) {
    return value.replace(/\{(\w+)\}/g, (match, paramKey) => {
      return params[paramKey]?.toString() || match;
    });
  }

  return value;
}

/**
 * Initialize locale on app load
 */
export function initLocale(): Locale {
  if (typeof window === 'undefined') return 'en';
  
  const locale = getLocale();
  document.documentElement.lang = locale;
  return locale;
}

/**
 * Change locale and persist
 */
export function changeLocale(newLocale: Locale): void {
  setLocale(newLocale);
  if (typeof window !== 'undefined') {
    document.documentElement.lang = newLocale;
    // Dispatch event for components to react
    window.dispatchEvent(new CustomEvent('localechange', { detail: { locale: newLocale } }));
  }
}

export { getLocale, setLocale, formatDate, formatNumber, type Locale };

