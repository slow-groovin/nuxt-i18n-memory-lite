import i18nMessages from './i18n.config'

export default defineNuxtConfig({
  modules: ['nuxt-i18n-memory-lite'],
  devtools: { enabled: true },
  compatibilityDate: 'latest',
  i18nMemoryLite: {
    defaultLocale: 'zh',
    locales: ['zh',
      'en', 'ja',
    ],
    messages: i18nMessages,
    debug: true,
  },
})
