# nuxt-i18n-memory-lite

A lightweight Nuxt module for i18n internationalization.

## ⚠️ Important Limitations

> **This module was created using vibe coding and has significant limitations:**

- **Hard-coded configuration**: Many features are hard-coded and not configurable
- **Only supports prefix-based routing**: URLs must include the language prefix (e.g., `/en/about`, `/ja/about`)
- **Header-based language detection**: When no language prefix is present in the URL, the module attempts to detect the language from HTTP headers
- **Configuration requires restart**: Messages defined in `nuxt.config.ts` can import from other files, but any changes require a full server restart to take effect

## ✨ Advantages

Despite the limitations, this module offers some unique benefits:

- **Perfect for small i18n needs**: Ideal for projects with a small amount of internationalization text
- **No file I/O operations**: Since all messages are stored in memory and configured directly in `nuxt.config.ts`, there are no file system reads for i18n files
- **Serverless-friendly**: The lack of file I/O makes this module perfect for serverless environments (AWS Lambda, Vercel, Netlify Functions, etc.) where file system access is limited or non-existent

## 📦 Installation

```bash
# npm
npm install nuxt-i18n-memory-lite

# yarn
yarn add nuxt-i18n-memory-lite

# pnpm
pnpm add nuxt-i18n-memory-lite

# bun
bun add nuxt-i18n-memory-lite
```

## 🔧 Configuration

Add the module to your `nuxt.config.ts`:

The `locales` option supports both string arrays and object arrays with `code` and `name` properties:

```typescript
import { defineNuxtConfig } from 'nuxt'
import i18nMessages from './i18n.config'

export default defineNuxtConfig({
  modules: ['nuxt-i18n-memory-lite'],
  i18nMemoryLite: {
    defaultLocale: 'en',
    locales: [
      { code: 'en', name: 'English' },
      { code: 'zh', name: '中文简体' },
      { code: 'zh-TW', name: '中文繁体' },
      { code: 'ja', name: '日本語' },
    ],
    messages: i18nMessages
  }
})
```

Or using simple strings:

```typescript
export default defineNuxtConfig({
  modules: ['nuxt-i18n-memory-lite'],
  i18nMemoryLite: {
    defaultLocale: 'en',
    locales: ['en', 'zh', 'ja'],
    messages: i18nMessages
  }
})
```

Create an `i18n.config.ts` file to define your messages.  
You can place it anywhere, as long as you import it in `nuxt.config.ts`.

```typescript
export default {
  en: {
    hello: 'Hello',
    welcome: 'Welcome to {appName}'
  },
  zh: {
    hello: '你好',
    welcome: '欢迎来到 {appName}'
  },
  'zh-TW': {
    hello: '你好',
    welcome: '歡迎來到 {appName}'
  },
  ja: {
    hello: 'こんにちは',
    welcome: '{appName}へようこそ'
  }
}
```

## 📝 Usage

### In Vue Templates

```vue
<template>
  <div>
    <h1>{{ $t('hello') }}</h1>
    <p>{{ $t('welcome', { appName: 'My App' }) }}</p>
  </div>
</template>
```

### In Composables/Setup

```vue
<script setup>
const { 
  t, 
  locale, 
  setLocale,
  availableLocales,
  localePath,
  switchLocalePath 
} = useI18n()

// Translate
console.log(t('hello'))
console.log(t('welcome', { appName: 'My App' }))

// Get current locale
console.log(locale.value)

// Get available locales
console.log(availableLocales.value) // Returns: [{ code: 'en', name: 'English' }, ...]

// Get localized path
console.log(localePath('/about')) // Returns /en/about (or current locale)

// Get path to switch locale
console.log(switchLocalePath('ja')) // Returns /ja/current-path

// Change locale
setLocale('ja')
</script>
```

### Switching Locales

The module provides automatic locale switching based on URL prefix:
- `/en/about` - English version
- `/ja/about` - Japanese version
- `/zh/about` - Chinese version

If no locale prefix is present, the module will attempt to detect the language from HTTP headers.

## 📄 License

[MIT License](./LICENSE)
