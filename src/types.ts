
// ============================================
// 1. 浏览器语言检测配置类型
// ============================================

/**
 * 浏览器语言检测配置选项
 * 用于自动检测用户的浏览器首选语言并跳转到对应语言版本
 */
export interface DetectBrowserLanguageOptions {
  /**
   * 是否使用 cookie 存储语言偏好
   * 设置为 true 时，会记住用户手动选择的语言，下次访问时优先使用
   * @default false
   */
  useCookie?: boolean

  /**
   * 存储语言偏好的 cookie 名称
   * 只有当 useCookie 为 true 时才有效
   * @default 'i18n_redirected'
   */
  cookieKey?: string

  /**
   * 何时进行自动语言重定向
   *
   * 可选值：
   * - 'root': 仅在访问根路径 / 时进行重定向
   *   适用于大部分场景，用户在首页时自动跳转到合适的语言版本
   *
   * - 'all': 访问所有路径时都进行重定向
   *   适用于需要强制使用检测到的语言的场景
   *
   * - 'no_redirect': 不进行自动重定向
   *   完全由用户手动选择语言
   *
   * @default 'root'
   */
  redirectOn?: 'root' | 'all' | 'no_redirect'
}

// ============================================
// 2. 翻译消息类型
// ============================================

/**
 * 翻译消息类型
 * 支持嵌套对象结构，如 { home: { title: 'Welcome' } }
 */
export type I18nMessages = Record<string, string | Record<string, any>>

/**
 * 按语言分组的翻译消息
 */
export type MessagesByLocale = Record<string, I18nMessages>

/**
 * 模块配置选项接口
 * 用户可以通过 nuxt.config.ts 中的 i18nCode 配置项传入这些选项
 */
export interface ModuleOptions {
  /**
   * 默认语言代码
   * @default 'en'
   */
  defaultLocale?: string

  /**
   * 支持的语言列表
   * @default ['en']
   */
  locales?: string[]

  /**
   * 翻译消息对象，可以直接内联定义或通过函数返回
   */
  messages?: MessagesByLocale | (() => MessagesByLocale)

  /**
   * URL 路由前缀策略
   * @default 'prefix'
   */
  // strategy?: 'prefix' | 'prefix_except_default' | 'no_prefix'

  /**
   * 浏览器语言检测配置
   */
  // detectBrowserLanguage?: DetectBrowserLanguageOptions

  // /**
  //  * 外部配置文件路径（相对于项目根目录）
  //  */
  // configFile?: string
}

/**
 * i18n 运行时配置接口
 * 包含所有运行时需要的 i18n 配置信息
 * 这个配置会被注入到 Nuxt 的 runtimeConfig.public.i18n 中
 */
export interface I18nRuntimeConfig extends ModuleOptions {
  messages: Record<string, I18nMessages> | undefined
}