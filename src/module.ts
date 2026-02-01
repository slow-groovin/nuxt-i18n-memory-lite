/**
 * ============================================================
 * Nuxt I18n Code Module - 自定义国际化模块
 * ============================================================
 *
 * 这是一个 Nuxt 3 模块，为 Nuxt 应用提供完整的国际化(i18n)解决方案。
 * 设计目标是提供一个轻量级、零依赖（除 Nuxt 核心外）、易于配置的国际化方案。
 *
 * 核心特性：
 * - 多语言路由前缀支持（如 /en/xxx, /zh/xxx）
 * - 自动浏览器语言检测与智能跳转
 * - 支持从外部配置文件加载翻译消息
 * - 提供 Vue 3 composable 函数（useI18n, useLocalePath, useSwitchLocalePath）
 * - 支持嵌套对象格式的翻译键（如 'home.title'）
 * - 支持动态参数替换（如 {name}）
 *
 * 安装与使用：
 * 1. 在 nuxt.config.ts 中添加：
 *    modules: ['nuxt-i18n-code'],
 *    i18nCode: {
 *      defaultLocale: 'en',
 *      locales: ['en', 'zh'],
 *      configFile: './i18n.config.ts'
 *    }
 *
 * 2. 在组件中使用：
 *    const { t, locale, setLocale } = useI18n()
 *    const localePath = useLocalePath()
 *
 * 作者: any
 * 版本: 1.0.0
 * 许可证: MIT
 * ============================================================
 */

// ============================================
// 1. 导入依赖
// ============================================

/**
 * 从 @nuxt/kit 导入模块开发工具函数
 */
import { defineNuxtModule, addPlugin, createResolver, addImportsDir } from '@nuxt/kit'

/**
 * defu 是一个深度合并工具，用于合并默认配置和用户配置
 */
import { defu } from 'defu'

/**
 * 从 Nuxt schema 导入页面类型定义
 */
import type { NuxtPage } from 'nuxt/schema'

// ============================================
// 2. 导入共享类型和工具
// ============================================


import type { I18nRuntimeConfig, ModuleOptions } from './types'



// 重导出类型，保持向后兼容
// export type { ModuleOptions, I18nRuntimeConfig, I18nMessages, DetectBrowserLanguageOptions } from './types'

// ============================================
// 3. 模块定义与导出
// ============================================

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
    strategy: 'prefix',
    detectBrowserLanguage: {
      useCookie: false,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root',
    },
  },

  async setup(_options, nuxt) {
    const { resolve } = createResolver(import.meta.url)
    console.log('_options',_options)
    // 初始化翻译消息对象
    let messages = _options.messages || {}

    // 加载外部配置文件（如果指定了 configFile）
    if (_options.configFile) {
      console.log('resolve _options.configFile',_options.configFile)
      const configPath = resolve(nuxt.options.rootDir, _options.configFile)

      try {
        const configModule = await import(configPath)
        const configMessages = configModule.default || configModule
        messages = defu(messages, configMessages)
      }
      catch (error) {
        console.warn(`[nuxt-i18n-code] Failed to load config file: ${configPath}`)
      }
    }

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

    console.log('runtimeConfig',runtimeConfig)

    // 将运行时配置注入到 Nuxt 的 public 运行时配置中
    nuxt.options.runtimeConfig = nuxt.options.runtimeConfig || { public: {} }
    nuxt.options.runtimeConfig.public = nuxt.options.runtimeConfig.public || {}
    nuxt.options.runtimeConfig.public.i18n = runtimeConfig as any

    // 注册运行时插件
    addPlugin({
      src: resolve('./runtime/plugin/i18n-plugin'),
      mode: 'all',
    })

    // 注册 composables 目录
    addImportsDir(resolve('./runtime/composables'))

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
