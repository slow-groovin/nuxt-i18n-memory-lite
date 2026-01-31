/**
 * ============================================================
 * Nuxt I18n Code - 共享工具函数
 * ============================================================
 *
 * 这个文件包含模块中所有共享的工具函数。
 * 抽离工具函数可以避免 module.ts 和 runtime composables 之间的重复。
 */

// ============================================
// 1. 深度合并函数
// ============================================

/**
 * 深度合并两个对象
 *
 * 递归地合并对象的属性，后面的对象属性会覆盖前面的同名属性。
 * 这个函数特别适用于合并配置对象，确保嵌套的对象结构也被正确合并。
 *
 * @template T - 目标对象类型
 * @template S - 源对象类型
 * @param target - 目标对象（基础对象）
 * @param source - 源对象（要合并的对象）
 * @returns 合并后的新对象
 *
 * @example
 * ```typescript
 * const defaultConfig = {
 *   defaultLocale: 'en',
 *   detectBrowserLanguage: {
 *     useCookie: false,
 *     cookieKey: 'locale'
 *   }
 * }
 *
 * const userConfig = {
 *   defaultLocale: 'zh',
 *   detectBrowserLanguage: {
 *     useCookie: true
 *   }
 * }
 *
 * const merged = deepMerge(defaultConfig, userConfig)
 * // 结果：
 * // {
 * //   defaultLocale: 'zh',
 * //   detectBrowserLanguage: {
 * //     useCookie: true,
 * //     cookieKey: 'locale'
 * //   }
 * // }
 * ```
 */
export function deepMerge<T extends Record<string, any>, S extends Record<string, any>>(
  target: T,
  source: S,
): T & S {
  // 如果源对象不存在，直接返回目标对象
  if (!source) return target as T & S

  // 如果目标对象不存在，直接返回源对象
  if (!target) return source as T & S

  // 如果任意一方不是对象，使用源对象覆盖
  if (typeof target !== 'object' || typeof source !== 'object') {
    return source as T & S
  }

  // 创建目标对象的浅拷贝作为结果
  const result: Record<string, any> = { ...target }

  // 遍历源对象的所有属性
  for (const key in source) {
    // 只处理对象自身的属性（排除继承的属性）
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      // 如果属性值是对象且不是数组，递归合并
      if (typeof source[key] === 'object' && !Array.isArray(source[key]) && source[key] !== null) {
        result[key] = deepMerge(result[key] || {}, source[key])
      }
      else {
        // 否则直接覆盖（包括基本类型和数组）
        result[key] = source[key]
      }
    }
  }

  return result as T & S
}

/**
 * 深度合并多个对象
 *
 * 按顺序合并所有传入的对象，后面的对象属性覆盖前面的同名属性。
 * 这是 deepMerge 的多对象版本。
 *
 * @param objects - 要合并的对象数组
 * @returns 合并后的新对象
 *
 * @example
 * ```typescript
 * const base = { a: 1, b: { c: 2 } }
 * const override1 = { b: { d: 3 } }
 * const override2 = { a: 4 }
 *
 * const result = deepMergeAll(base, override1, override2)
 * // 结果：{ a: 4, b: { c: 2, d: 3 } }
 * ```
 */
export function deepMergeAll<T extends Record<string, any>>(...objects: T[]): T {
  // 如果没有对象，返回空对象
  if (objects.length === 0) {
    return {} as T
  }

  // 如果只有一个对象，直接返回它的拷贝
  if (objects.length === 1) {
    return { ...objects[0] } as T
  }

  // 从第一个对象开始，依次合并后面的对象
  return objects.reduce((acc, obj) => deepMerge(acc, obj)) as T
}

// ============================================
// 2. 默认配置值
// ============================================

import type { I18nRuntimeConfig } from '../types'

/**
 * i18n 默认运行时配置
 *
 * 当运行时配置缺少某些属性时使用这些默认值。
 * 这些值与 ModuleOptions 中的 defaults 保持一致。
 */
export const defaultI18nConfig: I18nRuntimeConfig = {
  defaultLocale: 'en',
  locales: ['en'],
  strategy: 'prefix',
  detectBrowserLanguage: {
    useCookie: false,
    cookieKey: 'i18n_redirected',
    redirectOn: 'root',
  },
  messages: {},
}

// ============================================
// 3. 辅助函数
// ============================================

/**
 * 创建完整的 i18n 配置
 *
 * 将用户配置与默认配置深度合并，确保所有必需的配置项都存在。
 *
 * @param userConfig - 用户提供的配置
 * @returns 完整的 i18n 配置
 */
export function createI18nConfig(userConfig: Partial<I18nRuntimeConfig> = {}): I18nRuntimeConfig {
  return deepMerge(defaultI18nConfig, userConfig)
}

// ============================================
// 4. 默认导出
// ============================================

export { deepMerge as merge } from './index'
export default deepMerge
