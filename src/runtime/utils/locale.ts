// runtime/utils/locale.ts

import type { I18nRuntimeConfig, Locale } from '../../types'

function getLocaleCode(locale: Locale): string {
  return typeof locale === 'string' ? locale : locale.code
}

function getLocaleCodes(locales?: Locale[]): string[] {
  if (!locales) return []
  return locales.map(getLocaleCode)
}

/**
 * 从路径中解析语言
 * @param path - 当前路径
 * @param locales - 支持的语言列表
 * @returns 解析出的语言代码或 null
 */
export function parseLocaleFromPath(path: string, locales?: Locale[]): string | null {
  if (!locales || locales.length === 0) {
    return null
  }
  const supportedLocales = getLocaleCodes(locales)

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
  const locales = getLocaleCodes(config.locales) || ['en']
  const defaultLocale = config.defaultLocale || 'en'

  if (!acceptLang) return defaultLocale

  const acceptLangCode = acceptLang.split(',')[0]?.trim()

  if (!acceptLangCode) return defaultLocale

  const localeVariants = generateLocaleVariants(acceptLangCode)

  for (const variant of localeVariants) {
    if (locales.includes(variant)) {
      return variant
    }
  }

  return defaultLocale
}

/**
 * 生成语言代码的所有变体
 * @param locale - 语言代码 (如 'zh-CN', 'zh', 'zh-TW')
 * @returns 从最具体到最一般的语言代码数组 (如 'zh-CN' -> ['zh-CN', 'zh'])
 */
function generateLocaleVariants(locale: string): string[] {
  const variants: string[] = []
  const parts = locale.split('-')

  for (let i = 0; i < parts.length; i++) {
    const variant = parts.slice(0, i + 1).join('-')
    variants.push(variant)
  }

  return variants
}
