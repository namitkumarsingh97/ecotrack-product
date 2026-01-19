/**
 * i18n Service
 * Service layer for internationalization
 */

import type { Locale } from '@/lib/i18n';

export interface TranslationMessages {
  [key: string]: any;
}

class I18nService {
  private messages: Map<Locale, TranslationMessages> = new Map();
  private currentLocale: Locale = 'en';

  /**
   * Load translations for a locale
   */
  async loadLocale(locale: Locale): Promise<TranslationMessages> {
    if (this.messages.has(locale)) {
      return this.messages.get(locale)!;
    }

    try {
      const messages = await import(`@/messages/${locale}.json`);
      this.messages.set(locale, messages.default);
      return messages.default;
    } catch (error) {
      console.error(`Failed to load locale ${locale}:`, error);
      // Fallback to English
      if (locale !== 'en') {
        return this.loadLocale('en');
      }
      return {};
    }
  }

  /**
   * Get current locale
   */
  getCurrentLocale(): Locale {
    return this.currentLocale;
  }

  /**
   * Set current locale
   */
  setCurrentLocale(locale: Locale): void {
    this.currentLocale = locale;
  }

  /**
   * Get translation
   */
  translate(key: string, params?: Record<string, string | number>): string {
    const messages = this.messages.get(this.currentLocale);
    if (!messages) {
      return key;
    }

    const keys = key.split('.');
    let value: any = messages;

    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        return key;
      }
    }

    if (typeof value !== 'string') {
      return key;
    }

    if (params) {
      return value.replace(/\{(\w+)\}/g, (match, paramKey) => {
        return params[paramKey]?.toString() || match;
      });
    }

    return value;
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.messages.clear();
  }
}

export const i18nService = new I18nService();

