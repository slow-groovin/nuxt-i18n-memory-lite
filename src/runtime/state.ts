// runtime/state.ts

import { useRuntimeConfig, useState } from '#app'
import type { I18nRuntimeConfig } from '../types'

// 全局单例 state，SSR 时每个请求独立
let _locale: ReturnType<typeof useState<string>> | null = null

export function useI18nLocale() {
  if (!_locale) {
    // 从运行时配置获取默认语言
    const runtimeConfig = useRuntimeConfig()
    const i18nConfig = runtimeConfig.public.i18n as I18nRuntimeConfig
    const defaultLocale = i18nConfig?.defaultLocale || 'en'

    _locale = useState<string>('i18n_locale', () => defaultLocale)
  }
  return _locale
}
