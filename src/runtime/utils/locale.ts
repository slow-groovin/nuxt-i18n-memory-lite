// runtime/utils/locale.ts

import type { I18nRuntimeConfig } from '../../types'

/**
 * 从路径中解析语言
 * @param path - 当前路径
 * @param locales - 支持的语言列表
 * @returns 解析出的语言代码或 null
 */
export function parseLocaleFromPath(path: string, locales?: string[]): string | null {
  const supportedLocales = locales || ['en', 'zh']
  
  for (const loc of supportedLocales) {
    if (path === `/${loc}` || path.startsWith(`/${loc}/`)) {
      return loc
    }
  }
  return null
}

/**
 * 检测用户语言偏好
 * @param acceptLang - Accept-Language header
 * @param config - i18n 运行时配置
 * @returns 检测到的语言代码
 */
export function detectLocale(acceptLang: string | undefined, config: I18nRuntimeConfig): string {
  const locales = config.locales || ['en']
  const defaultLocale = config.defaultLocale || 'en'
  
  if (!acceptLang) return defaultLocale
  
  const lang = acceptLang.split(',')[0]?.split('-')[0]?.trim()
  return (lang && locales.includes(lang)) ? lang : defaultLocale
}
