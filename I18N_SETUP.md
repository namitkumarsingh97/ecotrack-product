# Internationalization (i18n) Setup

## Overview

The application now supports **English** and **Hindi** languages with a complete i18n infrastructure.

## Structure

```
frontend/
├── messages/
│   ├── en.json          # English translations
│   └── hi.json          # Hindi translations
├── i18n/
│   ├── config.ts        # i18n configuration
│   ├── request.ts       # Request configuration
│   └── routing.ts       # Routing configuration
├── lib/
│   └── i18n.ts          # Core i18n utilities
├── hooks/
│   └── useTranslation.ts # React hook for translations
├── utils/
│   └── i18n.ts          # Utility functions
├── services/
│   └── i18nService.ts   # i18n service layer
└── components/
    └── LanguageSwitcher.tsx # Language switcher component
```

## Usage

### 1. Using Translations in Components

```tsx
import { useTranslation } from '@/hooks/useTranslation';

export default function MyComponent() {
  const { t, locale, changeLocale } = useTranslation();

  return (
    <div>
      <h1>{t('common.welcome')}</h1>
      <p>{t('dashboard.title')}</p>
      <button onClick={() => changeLocale('hi')}>
        Switch to Hindi
      </button>
    </div>
  );
}
```

### 2. Translation Keys

Translation keys use dot notation:
- `common.welcome` → "Welcome" / "स्वागत है"
- `dashboard.title` → "Dashboard" / "डैशबोर्ड"
- `auth.loginTitle` → "Welcome Back" / "वापसी पर स्वागत है"

### 3. Parameters in Translations

```tsx
// In messages/en.json
{
  "footer": {
    "copyright": "© {year} EcoTrack India. All rights reserved."
  }
}

// In component
{t('footer.copyright', { year: '2024' })}
```

### 4. Language Switcher Component

The `LanguageSwitcher` component is already integrated into the AppBar:

```tsx
import LanguageSwitcher from '@/components/LanguageSwitcher';

<LanguageSwitcher />
```

## Available Locales

- **en** - English
- **hi** - Hindi (हिंदी)

## Translation Files

### Structure

Translation files are organized by feature/module:

```json
{
  "common": { ... },
  "auth": { ... },
  "dashboard": { ... },
  "company": { ... },
  "environment": { ... },
  "social": { ... },
  "governance": { ... },
  "reports": { ... },
  "admin": { ... },
  "settings": { ... },
  "navbar": { ... },
  "footer": { ... },
  "sidebar": { ... }
}
```

## Adding New Translations

1. Add the key-value pair to both `messages/en.json` and `messages/hi.json`
2. Use the key in your component with `t('key.path')`

Example:
```json
// messages/en.json
{
  "myModule": {
    "myKey": "My English Text"
  }
}

// messages/hi.json
{
  "myModule": {
    "myKey": "मेरा हिंदी पाठ"
  }
}
```

## Utilities

### Format Date
```tsx
import { formatDate } from '@/lib/i18n';
const formatted = formatDate(new Date(), locale);
```

### Format Number
```tsx
import { formatNumber } from '@/lib/i18n';
const formatted = formatNumber(1234567, locale);
```

## Service Layer

For advanced usage, use the i18n service:

```tsx
import { i18nService } from '@/services/i18nService';

await i18nService.loadLocale('hi');
i18nService.setCurrentLocale('hi');
const translation = i18nService.translate('common.welcome');
```

## Current Implementation Status

✅ **Completed:**
- Locale files (en, hi)
- useTranslation hook
- Language switcher component
- AppBar translations
- Sidebar translations
- Footer translations
- i18n utilities
- i18n service layer

🔄 **In Progress:**
- Updating all page components to use translations

## Next Steps

To complete i18n implementation:

1. Update all page components to use `useTranslation()` hook
2. Replace all hardcoded strings with translation keys
3. Test language switching across all pages
4. Add more translations as needed

## Notes

- Locale preference is stored in `localStorage`
- Default locale is English (`en`)
- Browser language detection is supported
- HTML `lang` attribute is automatically updated

