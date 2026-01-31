/**
 * ============================================================
 * useI18nConfig Composable
 * ============================================================
 *
 * 提供对 i18n 运行时配置的访问。
 * 这个 composable 从 Nuxt 运行时配置中读取 i18n 配置，
 * 并与默认值合并，确保所有必需的配置项都存在。
 */

// ============================================
// 1. 导入依赖
// ============================================

import { useRuntimeConfig } from '#app'
import type { ComputedRef } from 'vue'
import { computed } from 'vue'

// ============================================
// 2. 导入共享类型和工具
// ============================================

import type { I18nRuntimeConfig } from '../../types'
import { deepMerge, defaultI18nConfig } from '../../utils'

// 重导出类型，方便使用者导入
export type { I18nRuntimeConfig, DetectBrowserLanguageOptions, I18nMessages } from '../../types'

// ============================================
// 3. useI18nConfig Composable
// ============================================

/**
 * 使用 i18n 运行时配置
 *
 * 此 composable 返回合并了默认值后的完整 i18n 运行时配置
 * 配置值来自模块注入到运行时配置中的数据
 *
 * @returns {I18nRuntimeConfig} 完整的 i18n 运行时配置对象
 *
 * @example
 * ```ts
 * // 在组件中使用
 * const config = useI18nConfig()
 * console.log(config.defaultLocale) // 'en'
 * console.log(config.locales) // ['en', 'zh']
 * ```
 *
 * @example
 * ```ts
 * // 在插件中使用
 * export default defineNuxtPlugin((nuxtApp) => {
 *   const config = useI18nConfig()
 *   // 根据配置初始化 i18n 状态
 * })
 * ```
 */
export function useI18nConfig(): I18nRuntimeConfig {
  // 获取运行时配置
  const runtimeConfig = useRuntimeConfig()

  // 获取 public.i18n 配置，如果不存在则使用空对象
  const configFromRuntime = runtimeConfig?.public?.i18n || {}

  // 使用深度合并将默认值与运行时配置合并
  // 运行时配置的优先级高于默认值
  const mergedConfig = deepMerge(defaultI18nConfig, configFromRuntime)

  // 验证关键配置项
  // 确保 locales 数组不为空
  if (!mergedConfig.locales || mergedConfig.locales.length === 0) {
    console.warn('[useI18nConfig] No locales configured, using default ["en"]')
    mergedConfig.locales = ['en']
  }

  // 确保 defaultLocale 在 locales 列表中
  const defaultLocale = mergedConfig.defaultLocale as string
  const locales = mergedConfig.locales as string[]
  if (defaultLocale && locales && !locales.includes(defaultLocale)) {
    const firstLocale = locales[0]
    if (firstLocale) {
      console.warn(
        `[useI18nConfig] defaultLocale "${defaultLocale}" not in locales, using first locale "${firstLocale}"`,
      )
      mergedConfig.defaultLocale = firstLocale
    }
  }

  return mergedConfig as I18nRuntimeConfig
}

/**
 * 使用 i18n 配置（响应式版本）
 *
 * 与 useI18nConfig 类似，但返回一个 computed ref
 * 当运行时配置发生变化时，会自动重新计算
 *
 * @returns {ComputedRef<I18nRuntimeConfig>} 响应式的 i18n 配置
 *
 * @example
 * ```ts
 * const config = useI18nConfigReactive()
 * watch(() => config.value.defaultLocale, (newLocale) => {
 *   console.log('Default locale changed:', newLocale)
 * })
 * ```
 */
export function useI18nConfigReactive(): ComputedRef<I18nRuntimeConfig> {
  return computed(() => useI18nConfig())
}

// 默认导出，方便导入
export default useI18nConfig
