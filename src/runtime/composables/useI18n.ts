// runtime/composables/useI18n.ts
import { computed, type Ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18nLocale } from '../state'
import { useRuntimeConfig } from '#app'

/**
 * i18n 翻译函数类型
 */
export type TranslateFunction = (key: string, params?: Record<string, string>) => string

/**
 * useI18n Composable 返回类型
 */
export interface UseI18nReturn {
  /** 当前语言代码 */
  locale: Ref<string>
  /** 翻译函数 */
  t: TranslateFunction
  /** 设置语言并跳转 */
  setLocale: (locale: string) => Promise<void>
  /** 生成本地化路径 */
  localePath: (path: string) => string
  /** 获取切换语言的路径 */
  switchLocalePath: (targetLocale: string) => string
  /** 可用语言列表 */
  availableLocales: {code:string, name:string}[]
}

/**
 * 获取翻译消息
 * @param localeCode - 语言代码
 * @param messages - 所有翻译消息
 * @returns 指定语言的翻译消息
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function getMessages(localeCode: string, messages: Record<string, any>): Record<string, any> {
  return messages[localeCode] || messages['en'] || {}
}

/**
 * 使用 i18n
 *
 * 提供完整的国际化功能，包括翻译、语言切换、路径生成等
 *
 * @returns {UseI18nReturn} i18n 功能对象
 *
 * @example
 * ```vue
 * <script setup>
 * const { t, locale, setLocale, localePath } = useI18n()
 *
 * // 翻译
 * console.log(t('hello')) // 'Hello'
 * console.log(t('welcome', { name: 'World' })) // 'Welcome World'
 *
 * // 切换语言
 * await setLocale('zh')
 *
 * // 生成本地化路径
 * const path = localePath('/about') // '/en/about'
 * </script>
 * ```
 */
export function useI18n(): UseI18nReturn {
  //locale 还是 code string
  const locale = useI18nLocale()
  const config = useRuntimeConfig().public.i18n
  const route = useRoute()
  const router = useRouter()

  // 可用语言列表
  const availableLocales = computed(() => config.locales as {code:string, name:string}[])

  /**
   * 翻译函数
   * @param key - 翻译键，支持嵌套路径（如 'home.title'）
   * @param params - 插值参数（如 { name: 'World' }）
   * @returns 翻译后的字符串
   */
  function t(key: string, params?: Record<string, string>): string {
    const msgs = getMessages(locale.value, config.messages || {})
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const val = key.split('.').reduce<unknown>((acc, k) => (acc as any)?.[k], msgs)
    let msg = typeof val === 'string' ? val : key
    if (params) {
      msg = msg.replace(/\{(\w+)\}/g, (_, k) => params[k] ?? '')
    }
    return msg
  }

  /**
   * 设置语言并跳转到对应路径
   * @param newLocaleCode - 目标语言代码
   */
  async function setLocale(newLocaleCode: string): Promise<void> {
    const locales = availableLocales.value
    if (!locales.find(l=>l.code===newLocaleCode)) {
      console.warn(`[useI18n] Locale "${newLocaleCode}" is not in available locales:`, locales)
      return
    }

    locale.value = newLocaleCode
    const newPath = switchLocalePath(newLocaleCode)
    if (newPath && newPath !== route.fullPath) {
      await router.push(newPath)
    }
  }

  /**
   * 生成本地化路径
   * @param path - 原始路径
   * @returns 带语言前缀的路径
   */
  function localePath(path: string): string {
    const loc = locale.value
    const prefix = `/${loc}`
    return path.startsWith('/') ? `${prefix}${path}` : `${prefix}/${path}`
  }

  /**
   * 获取切换语言的路径
   * @param targetLocaleCode - 目标语言代码
   * @returns 切换到目标语言的路径
   */
  function switchLocalePath(targetLocaleCode: string): string {
    const currentPath = route.path
    const locales = availableLocales.value

    // 去掉当前 locale prefix
    let stripped = currentPath
    for (const loc of locales) {
      if (stripped.startsWith(`/${loc.code}`)) {
        stripped = stripped.slice(`/${loc.code}`.length) || '/'
        break
      }
    }

    return `/${targetLocaleCode}${stripped.startsWith('/') ? stripped : '/' + stripped}`
  }

  return {
    t,
    locale,
    setLocale,
    localePath,
    switchLocalePath,
    availableLocales: availableLocales.value,
  }
}

// 独立 composable 版本，和 nuxt/i18n API 对齐
/**
 * 使用本地化路径生成函数
 * @returns localePath 函数
 */
export function useLocalePath() {
  const { localePath } = useI18n()
  return localePath
}

/**
 * 使用语言切换路径生成函数
 * @returns switchLocalePath 函数
 */
export function useSwitchLocalePath() {
  const { switchLocalePath } = useI18n()
  return switchLocalePath
}
