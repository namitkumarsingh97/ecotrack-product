/**
 * useTranslation Hook
 * React hook for translations (composable pattern)
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { getLocale, setLocale, type Locale } from '@/lib/i18n';

export function useTranslation() {
  const [locale, setLocaleState] = useState<Locale>(() => {
    if (typeof window !== 'undefined') {
      return getLocale();
    }
    return 'en';
  });

  const [translations, setTranslations] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Load translations
    setIsLoading(true);
    import(`@/messages/${locale}.json`)
      .then((module) => {
        setTranslations(module.default);
        if (typeof window !== 'undefined') {
          document.documentElement.lang = locale;
        }
      })
      .catch((err) => {
        console.error('Failed to load translations:', err);
        // Fallback to English
        import(`@/messages/en.json`)
          .then((module) => {
            setTranslations(module.default);
          });
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [locale]);

  const changeLocale = useCallback((newLocale: Locale) => {
    setLocale(newLocale);
    setLocaleState(newLocale);
  }, []);

  const t = useCallback((key: string, params?: Record<string, string | number>): string => {
    if (isLoading || !translations || Object.keys(translations).length === 0) {
      return key; // Return key while loading
    }

    const keys = key.split('.');
    let value: any = translations;
    
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
  }, [locale, translations, isLoading]);

  return {
    t,
    locale,
    changeLocale,
    isLoading
  };
}

