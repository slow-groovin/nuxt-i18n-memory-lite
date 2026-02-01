// plugins/i18n.ts
import { defineNuxtPlugin, navigateTo, useRouter, useRuntimeConfig } from '#app'
import { useRequestHeader } from '#imports'
import type { I18nRuntimeConfig } from '~/src/types'
import { useI18nLocale } from '../state'
import { detectLocale, parseLocaleFromPath } from '../utils/locale'

const DEBUG = import.meta.env.DEV && true
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const log = (...args: any[]) => DEBUG && console.log('[i18n]', ...args)

export default defineNuxtPlugin({
  enforce: 'pre',
  hooks: {
    async 'app:created'() {
      // 从运行时配置获取配置
      const runtimeConfig = useRuntimeConfig()
      const i18nConfig = runtimeConfig.public.i18n as I18nRuntimeConfig
      // 如果还没有配置, 直接返回
      if (i18nConfig.locales?.length === 0) {
        return
      }
      const locale = useI18nLocale()
      const router = useRouter()
      const path = router.currentRoute.value.path
      const parsedLocale = parseLocaleFromPath(path, i18nConfig.locales)
      const acceptLanguage = useRequestHeader('accept-language')

      if (parsedLocale) {
        log('parsed from path:', parsedLocale)
        locale.value = parsedLocale
      }
      else {
        // SSR: 从 request header 检测; CSR: 从 navigator 检测
        const detected = detectLocale(acceptLanguage, i18nConfig)

        log('detected:', detected, 'path:', path)
        locale.value = detected

        const target = `/${detected}${path === '/' ? '' : path}`

        // 使用 navigateTo，SSR/CSR 均可工作
        await navigateTo(target, { replace: true })
      }
    },
  },
})
