export default defineNuxtConfig({
  modules: ['nuxt-i18n-within-code'],
  devtools: { enabled: true },
  compatibilityDate: 'latest',
  i18nWithinCode:{
    defaultLocale: 'ja',
    locales: ['en','ja','zh'],
    strategy: 'prefix',
    detectBrowserLanguage: {
      useCookie: false,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root',
    },
  }
})
