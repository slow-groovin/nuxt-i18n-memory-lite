import i18nMessages from './i18n.config'

export default defineNuxtConfig({
  modules: ['nuxt-i18n-memory-lite'],
  devtools: { enabled: true },
  compatibilityDate: 'latest',
  i18nMemoryLite: {
    defaultLocale: 'zh',
    locales: [
      { code: 'en', name: 'English' },
      { code: 'zh', name: '中文简体' },
      { code: 'zh-TW', name: '中文繁体' },
      { code: 'ja', name: '日本語' },
    ],
    messages: i18nMessages,
    debug: true,
  },
})
