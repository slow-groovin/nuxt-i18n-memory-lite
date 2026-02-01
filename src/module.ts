import { defineNuxtModule, addPlugin, createResolver, addImportsDir, addTemplate } from '@nuxt/kit'
import { defu } from 'defu'
import type { NuxtPage } from 'nuxt/schema'
import type { I18nRuntimeConfig, ModuleOptions, MessagesByLocale } from './types'
export type { MessagesByLocale } from './types'

/**
 * Nuxt I18n Code 模块主定义
 */
export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-i18n-within-code',
    configKey: 'i18nWithinCode',
    compatibility: {
      nuxt: '>=3.0.0',
    },
  },

  defaults: {
    defaultLocale: 'en',
    locales: [],
    // strategy: 'prefix',
    // detectBrowserLanguage: {
    //   useCookie: false,
    //   cookieKey: 'i18n_redirected',
    //   redirectOn: 'root',
    // },
  },

  async setup(_options, nuxt) {
    const { resolve } = createResolver(import.meta.url)
    // 注册运行时插件
    addPlugin({
      src: resolve('./runtime/plugin/i18n-plugin'),
      mode: 'all',
    })

    // 注册 composables 目录
    addImportsDir(resolve('./runtime/composables'))

    // 初始化翻译消息对象
    let messages = _options.messages || {}

    // 为每个语言创建合并后的翻译消息
    const mergedMessages: Record<string, any> = {}
    const resolvedMessages = typeof messages === 'function' ? messages() : messages
    for (const locale of _options.locales || []) {
      mergedMessages[locale] = defu({}, resolvedMessages[locale] || {})
    }

    

    // 构建运行时配置对象
    const runtimeConfig: I18nRuntimeConfig = {
      ..._options,
      messages: mergedMessages,
    }

    // 将运行时配置注入到 Nuxt 的 public 运行时配置中
    nuxt.options.runtimeConfig = nuxt.options.runtimeConfig || { public: {} }
    nuxt.options.runtimeConfig.public = nuxt.options.runtimeConfig.public || {}
    nuxt.options.runtimeConfig.public.i18n = runtimeConfig as any

    // 扩展路由以支持多语言前缀
    nuxt.hook('pages:extend', (pages: NuxtPage[]) => {
      const prefixedPages: NuxtPage[] = []
      const locales = _options.locales || ['en']

      for (const page of pages) {
        for (const locale of locales) {
          const newPath = page.path === '/' ? `/${locale}` : `/${locale}${page.path}`

          prefixedPages.push({
            ...page,
            path: newPath,
            name: page.name ? `${locale}___${page.name}` : undefined,
          })
        }
      }

      pages.push(...prefixedPages)
    })
  },

})