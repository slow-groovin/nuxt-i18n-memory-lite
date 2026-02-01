import { addImportsDir, addPlugin, createResolver, defineNuxtModule } from '@nuxt/kit'
import { defu } from 'defu'
import type { NuxtPage } from 'nuxt/schema'
import type { I18nRuntimeConfig, Locale, ModuleOptions } from './types'

export type { MessagesByLocale } from './types'

function getLocaleCode(locale: Locale): string {
  return typeof locale === 'string' ? locale : locale.code
}

function getLocaleCodes(locales?: Locale[]): string[] {
  if (!locales) return []
  return locales.map(getLocaleCode)
}

/**
 * Nuxt I18n Code 模块主定义
 */
export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'nuxt-i18n-memory-lite',
    configKey: 'i18nMemoryLite',
    compatibility: {
      nuxt: '>=3.0.0',
    },
  },

  defaults: {
    defaultLocale: 'en',
    locales: [],
    debug: false,
    // strategy: 'prefix',
    // detectBrowserLanguage: {
    //   useCookie: false,
    //   cookieKey: 'i18n_redirected',
    //   redirectOn: 'root',
    // },
  },

  async setup(_options, nuxt) {
    const { resolve } = createResolver(import.meta.url)

    // Debug log prefix
    const DEBUG_PREFIX = '[nuxt-i18n-memory-lite][setup]'
    const debug = _options.debug || false

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

    // ==================== Module Loading Process Start ====================
    logDebug('========== Module Loading Start ==========')
    logDebug(`Module Name: nuxt-i18n-memory-lite`)
    logDebug(`Debug Mode: user setting: ${_options.debug},  final: ${debug}`)

    // Register composables directory
    addImportsDir(resolve('./runtime/composables'))
    logDebug('Composables directory registered')

    // Register runtime plugin
    addPlugin({
      src: resolve('./runtime/plugin/i18n-plugin'),
      mode: 'all',
    })
    logDebug('Runtime plugin registered: i18n-plugin')

    // Initialize translation message object
    const messages = _options.messages || {}

    // Create merged translation messages for each locale
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mergedMessages: Record<string, any> = {}
    const resolvedMessages = typeof messages === 'function' ? messages() : messages
    const locales = _options.locales || []
    const localeCodes = getLocaleCodes(locales)

    // Output locale configuration info
    logDebug(`Configured locales array: [${localeCodes.join(', ')}]`)
    logDebug(`Default locale: ${_options.defaultLocale || 'en'}`)

    // Count message numbers
    let totalMessageCount = 0
    for (const locale of locales) {
      const localeCode = getLocaleCode(locale)
      mergedMessages[localeCode] = defu({}, resolvedMessages[localeCode] || {})
      const localeMessageCount = Object.keys(mergedMessages[localeCode]).length
      totalMessageCount += localeMessageCount
      logDebug(`  - ${localeCode}: ${localeMessageCount} top-level messages`)
    }
    logDebug(`Total ${totalMessageCount} top-level translation messages loaded`)

    // Build runtime config object
    const runtimeConfig: I18nRuntimeConfig = {
      ..._options,
      messages: mergedMessages,
    }

    // Inject runtime config into Nuxt's public runtime config
    nuxt.options.runtimeConfig = nuxt.options.runtimeConfig || { public: {} }
    nuxt.options.runtimeConfig.public = nuxt.options.runtimeConfig.public || {}
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    nuxt.options.runtimeConfig.public.i18n = runtimeConfig as any

    logDebug('Runtime config injected into public.i18n')

    // Extend routes to support i18n prefixes
    nuxt.hook('pages:extend', (pages: NuxtPage[]) => {
      logDebug('========== Route Extension Start ==========')
      const prefixedPages: NuxtPage[] = []
      const locales = _options.locales || []
      const localeCodes = getLocaleCodes(locales)

      let totalGeneratedRoutes = 0

      for (const page of pages) {
        logDebug(`Processing original route: ${page.path} (name: ${page.name || 'unnamed'})`)
        for (const localeCode of localeCodes) {
          const newPath = page.path === '/' ? `/${localeCode}` : `/${localeCode}${page.path}`

          prefixedPages.push({
            ...page,
            path: newPath,
            name: page.name ? `${localeCode}___${page.name}` : undefined,
          })
          totalGeneratedRoutes++
        }
      }

      pages.push(...prefixedPages)
      logDebug(`Generated ${totalGeneratedRoutes} i18n routes from ${pages.length - prefixedPages.length} original routes`)
      logDebug(`Current total route count: ${pages.length}`)
      logDebug('========== Route Extension End ==========')
      logDebug('========== Module Loading End ==========')
    })
  },

})
