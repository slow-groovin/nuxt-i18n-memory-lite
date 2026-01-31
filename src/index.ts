/**
 * ============================================================
 * Nuxt I18n Code - 模块入口文件
 * ============================================================
 *
 * 这是模块的入口文件，导出所有公共 API。
 * 使用者可以通过这个文件导入类型和工具函数。
 *
 * @example
 * ```typescript
 * // 导入模块
 * import { defineNuxtConfig } from 'nuxt'
 * import NuxtI18nCode from 'nuxt-i18n-code'
 *
 * export default defineNuxtConfig({
 *   modules: [NuxtI18nCode],
 *   i18nCode: {
 *     defaultLocale: 'en',
 *     locales: ['en', 'zh']
 *   }
 * })
 * ```
 */

// ============================================
// 1. 导出模块定义（默认导出）
// ============================================

export { default } from './module'
export { default as NuxtI18nCodeModule } from './module'

// ============================================
// 2. 导出类型定义
// ============================================

export type {
  // 核心类型
  ModuleOptions,
  I18nRuntimeConfig,
  I18nMessages,
  MessagesByLocale,
  DetectBrowserLanguageOptions,

  // 别名（向后兼容）
  ModuleOptions as I18nModuleOptions,
  I18nRuntimeConfig as RuntimeConfig,
  DetectBrowserLanguageOptions as DetectBrowserLanguageConfig,
} from './types'

// ============================================
// 3. 导出工具函数
// ============================================

export {
  // 深度合并
  deepMerge,
  deepMergeAll,

  // 配置创建
  createI18nConfig,

  // 默认配置
  defaultI18nConfig,

  // 别名
  deepMerge as merge,
} from './utils'

// ============================================
// 4. 辅助函数：defineI18nMessages
// ============================================

import type { MessagesByLocale } from './types'

/**
 * 定义 i18n 消息
 *
 * 这是一个辅助函数，用于在配置文件中定义翻译消息。
 * 它提供类型检查和自动补全支持。
 *
 * @param messages - 按语言分组的翻译消息
 * @returns 相同的翻译消息对象
 *
 * @example
 * ```typescript
 * // i18n.config.ts
 * export default defineI18nMessages({
 *   en: {
 *     hello: 'Hello',
 *     welcome: 'Welcome to {appName}'
 *   },
 *   zh: {
 *     hello: '你好',
 *     welcome: '欢迎来到 {appName}'
 *   }
 * })
 * ```
 */
export function defineI18nMessages(messages: MessagesByLocale): MessagesByLocale {
  return messages
}

// 默认导出模块
export { default as module } from './module'
