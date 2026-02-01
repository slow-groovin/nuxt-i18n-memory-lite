import i18nMessages from './i18n.config'
export default defineNuxtConfig({
  modules: ['nuxt-i18n-within-code'],
  devtools: { enabled: true },
  compatibilityDate: 'latest',
  i18nWithinCode:{
    defaultLocale: 'zh',
    locales: ['zh',
      'en','ja',
    ],
    messages: i18nMessages
  }
})
