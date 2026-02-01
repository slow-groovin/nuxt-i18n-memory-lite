export default defineNuxtConfig({
  modules: ['nuxt-i18n-within-code'],
  devtools: { enabled: true },
  compatibilityDate: 'latest',
  i18nWithinCode:{
    defaultLocale: 'zh',
    locales: ['zh',
      'en','ja',
    ],
    // strategy: 'prefix',
    detectBrowserLanguage: {
      useCookie: false,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root',
    },
    messages:{
      "en":{
        "hello":"hello"
      },
      "zh":{
        "hello":"你好"
      },
      "ja":{
        "hello":"co ni ji wa"
      },
    }
  }
})
