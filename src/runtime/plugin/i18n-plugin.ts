import { defineNuxtPlugin, navigateTo, useRouter, useRuntimeConfig } from '#app'
import { useRequestHeader } from '#imports'
import type { I18nRuntimeConfig } from '~/src/types'
import { useI18nLocale } from '../state'
import { detectLocale, parseLocaleFromPath } from '../utils/locale'

const DEBUG_PREFIX = '[nuxt-i18n-memory-lite][plugin]'

export default defineNuxtPlugin({
  enforce: 'pre',
  hooks: {
    async 'app:created'() {
      // Get configuration from runtime config
      const runtimeConfig = useRuntimeConfig()
      const i18nConfig = runtimeConfig.public.i18n as I18nRuntimeConfig

      // Check if debug mode is enabled
      const debug = i18nConfig.debug || false

      /**
       * Helper function to output debug logs
       * @param message Log message
       * @param args Additional arguments
       */
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const logDebug = (message: string, ...args: any[]) => {
        if (debug) {
          console.log(`${DEBUG_PREFIX} ${message}`, ...args)
        }
      }

      // Return early if no locales configured
      if (i18nConfig.locales?.length === 0) {
        logDebug('No locales configured, skipping i18n initialization')
        return
      }

      // ==================== Plugin Execution Start ====================
      logDebug('========== Plugin Initialization Start ==========')

      const locale = useI18nLocale()
      const router = useRouter()
      const path = router.currentRoute.value.path

      logDebug(`Current path: ${path}`)
      logDebug(`Available locales: [${i18nConfig.locales?.join(', ')}]`)
      logDebug(`Default locale: ${i18nConfig.defaultLocale || 'en'}`)

      // Parse locale from current path
      const parsedLocale = parseLocaleFromPath(path, i18nConfig.locales)
      logDebug(`Parsed locale from path: ${parsedLocale || 'none'}`)

      // Get Accept-Language header (SSR only)
      const acceptLanguage = useRequestHeader('accept-language')
      logDebug(`Accept-Language header: ${acceptLanguage || 'none'}`)

      if (parsedLocale) {
        // Locale found in path, use it
        logDebug(`Using locale from path: ${parsedLocale}`)
        locale.value = parsedLocale
        logDebug(`Final locale set to: ${locale.value}`)
      }
      else {
        // No locale in path, detect from browser or header
        logDebug('No locale in path, detecting from browser/header...')

        // SSR: detect from request header; CSR: detect from navigator
        const detected = detectLocale(acceptLanguage, i18nConfig)
        logDebug(`Detected locale: ${detected}`)

        locale.value = detected
        logDebug(`Locale set to detected value: ${locale.value}`)

        // Calculate redirect target path
        const target = `/${detected}${path === '/' ? '' : path}`
        logDebug(`Redirect target: ${target}`)

        // Perform navigation (works in both SSR and CSR)
        logDebug('Executing navigation...')
        await navigateTo(target, { replace: true })
        logDebug('Navigation completed')
      }

      logDebug('========== Plugin Initialization End ==========')
    },
  },
})
