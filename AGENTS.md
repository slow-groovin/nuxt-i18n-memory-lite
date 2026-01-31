## 原有项目内代码实现了一个i18n, 现在实现这个nuxt module 复用
### 文件变动:

```txt
commit 2a92efb4d2ca87e5ff5303f58ea80b99cc2096fe
Author: any <any@any.any>
Date:   Sat Jan 31 21:36:45 2026 +0800

    del old nuxtjs/i18b config files

 blog/i18n/locales/en.json | 9 ---------
 blog/i18n/locales/zh.json | 9 ---------
 2 files changed, 18 deletions(-)
commit acb49e84fc55de377c421cff4688b97eda958c46
Author: any <any@any.any>
Date:   Sat Jan 31 21:35:21 2026 +0800

    feat: impl i18n

 blog/app/components/blog/BlogHead.vue        |  1 -
 blog/app/components/blog/BlogList.vue        |  1 -
 blog/app/components/nav/LangSwitchButton.vue |  1 -
 blog/app/composables/useI18n.ts              | 70 ++++++++++++++++++++++++++++
 blog/app/middleware/locale.global.ts         | 27 +++++++++++
 blog/app/pages/debug/i18n.vue                |  4 +-
 blog/app/pages/{Search.vue => search.vue}    |  5 +-
 blog/app/plugins/i18n.ts                     | 61 ++++++++++++++++++++++++
 blog/app/plugins/i18n/config.ts              | 27 +++++++++++
 blog/app/plugins/i18n/messages.ts            | 30 ++++++++++++
 blog/app/plugins/i18n/state.ts               | 14 ++++++
 blog/i18n/locales/en.json                    |  7 ++-
 blog/i18n/locales/zh.json                    |  7 ++-
 blog/nuxt.config.ts                          | 44 +++++++++++------
 14 files changed, 276 insertions(+), 23 deletions(-)

```

变动:
```txt
diff --git a/blog/app/components/blog/BlogHead.vue b/blog/app/components/blog/BlogHead.vue
index 5f65a4d..42e3481 100644
--- a/blog/app/components/blog/BlogHead.vue
+++ b/blog/app/components/blog/BlogHead.vue
@@ -1,5 +1,4 @@
 <script setup lang="ts">
-import { useLocalePath } from '#imports';
 import { Icon } from "#components";
 
 const props = defineProps<{
diff --git a/blog/app/components/blog/BlogList.vue b/blog/app/components/blog/BlogList.vue
index 8ed35b5..c216163 100644
--- a/blog/app/components/blog/BlogList.vue
+++ b/blog/app/components/blog/BlogList.vue
@@ -1,7 +1,6 @@
 <script setup lang="ts">
 import { watch, computed } from "vue";
 import { useRoute, useRouter } from "vue-router";
-import { useI18n } from "vue-i18n";
 
 import { useBlogCollectionStore } from "@/stores/blogCollectionStore";
 import { Pagination, PaginationContent, PaginationItem, PaginationPrevious, PaginationNext, PaginationEllipsis } from "@/components/ui/pagination";
diff --git a/blog/app/components/nav/LangSwitchButton.vue b/blog/app/components/nav/LangSwitchButton.vue
index a5fd158..e1f8ff4 100644
--- a/blog/app/components/nav/LangSwitchButton.vue
+++ b/blog/app/components/nav/LangSwitchButton.vue
@@ -1,5 +1,4 @@
 <script setup lang="ts">
-import { useI18n } from "vue-i18n";
 import { useSwitchLocalePath } from "#imports";
 const { availableLocales, locale, t } = useI18n();
 const switchLocalePath = useSwitchLocalePath();
diff --git a/blog/app/composables/useI18n.ts b/blog/app/composables/useI18n.ts
new file mode 100644
index 0000000..743bf7e
--- /dev/null
+++ b/blog/app/composables/useI18n.ts
@@ -0,0 +1,70 @@
+// composables/useI18n.ts
+import { computed } from 'vue'
+import { useI18nLocale } from '~/plugins/i18n/state'
+import { getMessages } from '~/plugins/i18n/messages'
+import { i18nConfig } from '~/plugins/i18n/config'
+import type { Locale } from '~/plugins/i18n/config'
+import { useRouter, useRoute } from 'vue-router'
+
+export function useI18n() {
+  const locale = useI18nLocale()
+  const route = useRoute()
+  const router = useRouter()
+
+  // t('home.title') 或 t('home.welcome', { name: 'World' })
+  function t(key: string, params?: Record<string, string>): string {
+    const msgs = getMessages(locale.value)
+    const val = key.split('.').reduce<unknown>((acc, k) => (acc as any)?.[k], msgs)
+    let msg = typeof val === 'string' ? val : key
+    if (params) {
+      msg = msg.replace(/\{(\w+)\}/g, (_, k) => params[k] ?? '')
+    }
+    return msg
+  }
+
+  // setLocale('zh') → 切换语言并更新 URL
+  async function setLocale(newLocale: Locale) {
+    locale.value = newLocale
+    const newPath = switchLocalePath(newLocale)
+    if (newPath && newPath !== route.fullPath) {
+      await router.push(newPath)
+    }
+  }
+
+  // localePath('/blog/a') → '/zh/blog/a'（基于当前 locale）
+  function localePath(path: string): string {
+    const loc = locale.value
+    if (loc === i18nConfig.defaultLocale) {
+      // defaultLocale 也加 prefix，保持一致
+      return `/${loc}${path.startsWith('/') ? path : '/' + path}`
+    }
+    return `/${loc}${path.startsWith('/') ? path : '/' + path}`
+  }
+
+  // switchLocalePath('zh') → 当前页面切换到 zh 的路径
+  function switchLocalePath(targetLocale: Locale): string {
+    const currentPath = route.path
+    // 去掉当前 locale prefix
+    let stripped = currentPath
+    for (const loc of i18nConfig.locales) {
+      if (stripped.startsWith(`/${loc}`)) {
+        stripped = stripped.slice(`/${loc}`.length) || '/'
+        break
+      }
+    }
+    return `/${targetLocale}${stripped.startsWith('/') ? stripped : '/' + stripped}`
+  }
+
+  return { t, locale, setLocale, localePath, switchLocalePath, availableLocales: ['zh', 'en'] }
+}
+
+// 独立 composable 版本，和 nuxt/i18n API 对齐
+export function useLocalePath() {
+  const { localePath } = useI18n()
+  return localePath
+}
+
+export function useSwitchLocalePath() {
+  const { switchLocalePath } = useI18n()
+  return switchLocalePath
+}
\ No newline at end of file
diff --git a/blog/app/middleware/locale.global.ts b/blog/app/middleware/locale.global.ts
new file mode 100644
index 0000000..b1bd537
--- /dev/null
+++ b/blog/app/middleware/locale.global.ts
@@ -0,0 +1,27 @@
+// middleware/locale.global.ts
+import { i18nConfig } from '~/plugins/i18n/config'
+import type { Locale } from '~/plugins/i18n/config'
+import { useI18nLocale } from '~/plugins/i18n/state'
+
+function parseLocaleFromPath(path: string): { locale: Locale; stripped: string } | null {
+  for (const loc of i18nConfig.locales) {
+    if (path === `/${loc}` || path.startsWith(`/${loc}/`)) {
+      const stripped = path.slice(`/${loc}`.length) || '/'
+      return { locale: loc, stripped }
+    }
+  }
+  return null
+}
+
+export default defineNuxtRouteMiddleware((to) => {
+//   const locale = useI18nLocale()
+//   const parsed = parseLocaleFromPath(to.path)
+
+//   if (parsed) {
+//     locale.value = parsed.locale
+//     // 路由匹配不到 /zh/search，rewrite 到实际页面路径 /search
+//     if (to.matched.length === 0) {
+//       return navigateTo(parsed.stripped, { replace: true })
+//     }
+//   }
+})
\ No newline at end of file
diff --git a/blog/app/pages/debug/i18n.vue b/blog/app/pages/debug/i18n.vue
index 23b1b11..a4441db 100644
--- a/blog/app/pages/debug/i18n.vue
+++ b/blog/app/pages/debug/i18n.vue
@@ -1,5 +1,5 @@
 <script setup>
-const { locales, setLocale } = useI18n();
+const { t } = useI18n();
 </script>
 
 <template>
@@ -7,6 +7,6 @@ const { locales, setLocale } = useI18n();
     <button v-for="locale in locales" @click="setLocale(locale.code)">
       {{ locale.name }}
     </button>
-    <h1>{{ $t("hello") }}</h1>
+    <h1>{{ t("hello") }}</h1>
   </div>
 </template>
diff --git a/blog/app/pages/Search.vue b/blog/app/pages/search.vue
similarity index 97%
rename from blog/app/pages/Search.vue
rename to blog/app/pages/search.vue
index 511fd8a..eb1f6a0 100644
--- a/blog/app/pages/Search.vue
+++ b/blog/app/pages/search.vue
@@ -4,7 +4,7 @@
     <!-- Logo/Title -->
     <div class="text-center mb-4">
       <h1 class="text-4xl font-bold text-foreground">
-        {{ $t('search.title') }}
+        {{ t('search.title') }}
         <!-- 搜索 -->
       </h1>
       <p class="mt-1 text-muted-foreground">
@@ -42,8 +42,7 @@ import { ref } from 'vue'
 import { Button } from '@/components/ui/button'
 import { SearchIcon, XIcon } from 'lucide-vue-next'
 import { useI18n } from "#imports"; // 如果是在 Nuxt 中
-
-const { t } = useI18n()
+const {t}=useI18n()
 const searchQuery = ref('')
 const searchPrefix = 'site:api2o.com'
 
diff --git a/blog/app/plugins/i18n.ts b/blog/app/plugins/i18n.ts
new file mode 100644
index 0000000..838dd0c
--- /dev/null
+++ b/blog/app/plugins/i18n.ts
@@ -0,0 +1,61 @@
+// plugins/i18n.ts
+import { defineNuxtPlugin } from '#app'
+import { i18nConfig } from './i18n/config'
+import type { Locale } from './i18n/config'
+import { useI18nLocale } from './i18n/state'
+
+const DEBUG = false
+const log = (...args: any[]) => DEBUG && console.log('[i18n]', ...args)
+
+export default defineNuxtPlugin({
+  enforce: 'pre',
+  hooks: {
+    async "app:created"(nuxtApp) {
+      const locale = useI18nLocale()
+      const router = useRouter()
+      const path = router.currentRoute.value.path
+      const parsedLocale = parseLocaleFromPath(path)
+      const acceptLanguage = useRequestHeader('accept-language')
+      if (parsedLocale) {
+        log('parsed from path:', parsedLocale)
+        locale.value = parsedLocale
+      } else {
+        // SSR: 从 request header 检测; CSR: 从 navigator 检测
+        const detected = detectLocale(acceptLanguage)
+
+        log('detected:', detected, 'path:', path)
+        locale.value = detected
+
+        const target = `/${detected}${path === '/' ? '' : path}`
+
+        // 使用 navigateTo，SSR/CSR 均可工作
+        await navigateTo(target, { replace: true })
+      }
+    }
+  }
+})
+
+function parseLocaleFromPath(path: string): Locale | null {
+  for (const loc of i18nConfig.locales) {
+    if (path === `/${loc}` || path.startsWith(`/${loc}/`)) {
+      return loc
+    }
+  }
+  return null
+}
+
+function detectLocale(acceptLang?: string): Locale {
+  if (!acceptLang) return i18nConfig.defaultLocale
+  const lang = acceptLang.split(',')[0]?.split('-')[0]?.trim()
+  return (lang && i18nConfig.locales.includes(lang as Locale))
+    ? (lang as Locale)
+    : i18nConfig.defaultLocale
+}
+
+function detectLocaleFromNavigator(): Locale {
+  if (typeof navigator === 'undefined') return i18nConfig.defaultLocale
+  const lang = navigator.language?.split('-')[0]
+  return (lang && i18nConfig.locales.includes(lang as Locale))
+    ? (lang as Locale)
+    : i18nConfig.defaultLocale
+}
\ No newline at end of file
diff --git a/blog/app/plugins/i18n/config.ts b/blog/app/plugins/i18n/config.ts
new file mode 100644
index 0000000..2a670aa
--- /dev/null
+++ b/blog/app/plugins/i18n/config.ts
@@ -0,0 +1,27 @@
+// plugins/i18n/config.ts
+
+export type Locale = 'en' | 'zh' // 按需扩展
+
+export const availableLocales: Locale[] = ['zh', 'en']
+
+export interface I18nConfig {
+    defaultLocale: Locale
+    locales: Locale[]
+    strategy: 'prefix' // 目前只支持 prefix
+    detectBrowserLanguage: {
+        useCookie: boolean
+        cookieKey: string
+        redirectOn: 'root' | 'all'
+    }
+}
+
+export const i18nConfig: I18nConfig = {
+    strategy: 'prefix',
+    defaultLocale: 'en',
+    locales: ['en', 'zh'],
+    detectBrowserLanguage: {
+        useCookie: false,
+        cookieKey: 'i18n_redirected',
+        redirectOn: 'root',
+    },
+}
diff --git a/blog/app/plugins/i18n/messages.ts b/blog/app/plugins/i18n/messages.ts
new file mode 100644
index 0000000..9087ea4
--- /dev/null
+++ b/blog/app/plugins/i18n/messages.ts
@@ -0,0 +1,30 @@
+// plugins/i18n/messages.ts
+import type { Locale } from './config'
+
+type Messages = Record<string, string | Record<string, string>>
+
+const messages: Record<Locale, Messages> = {
+    en: {
+        "hello": "hello",
+        "toc": "TOC",
+        "search": {
+            "title": "search",
+            "subtitle": "search in sites",
+            "placeholder": "search..."
+        }
+    },
+    zh: {
+        "hello": "NIN HAO",
+        "toc": "目录",
+        "search": {
+            "title": "搜索",
+            "subtitle": "搜索站点内容",
+            "placeholder": "请输入内容..."
+        }
+    }
+    ,
+}
+
+export function getMessages(locale: Locale): Messages {
+    return messages[locale] ?? messages.en
+}
\ No newline at end of file
diff --git a/blog/app/plugins/i18n/state.ts b/blog/app/plugins/i18n/state.ts
new file mode 100644
index 0000000..36f4095
--- /dev/null
+++ b/blog/app/plugins/i18n/state.ts
@@ -0,0 +1,14 @@
+// plugins/i18n/state.ts
+
+import type { Locale } from './config'
+import { i18nConfig } from './config'
+
+// 全局单例 state，SSR 时每个请求独立
+let _locale: ReturnType<typeof useState<Locale>> | null = null
+
+export function useI18nLocale() {
+  if (!_locale) {
+    _locale = useState<Locale>('i18n_locale', () => i18nConfig.defaultLocale)
+  }
+  return _locale
+}
\ No newline at end of file
diff --git a/blog/i18n/locales/en.json b/blog/i18n/locales/en.json
deleted file mode 100644
index 70835af..0000000
--- a/blog/i18n/locales/en.json
+++ /dev/null
@@ -1,4 +0,0 @@
-{
-  "hello": "hello",
-  "toc": "TOC"
-}
diff --git a/blog/i18n/locales/zh.json b/blog/i18n/locales/zh.json
deleted file mode 100644
index 1c48097..0000000
--- a/blog/i18n/locales/zh.json
+++ /dev/null
@@ -1,4 +0,0 @@
-{
-  "hello": "NIN HAO",
-  "toc": "目录"
-}
diff --git a/blog/nuxt.config.ts b/blog/nuxt.config.ts
index 063e90d..4c9e12c 100644
--- a/blog/nuxt.config.ts
+++ b/blog/nuxt.config.ts
@@ -1,5 +1,7 @@
 // https://nuxt.com/docs/api/configuration/nuxt-config
 
+import type { NuxtPage } from "nuxt/schema"
+import {i18nConfig} from './app/plugins/i18n/config'
 export default defineNuxtConfig({
   compatibilityDate: '2025-07-15',
   devtools: { enabled: true },
@@ -541,7 +543,7 @@ export default defineNuxtConfig({
     "shadcn-nuxt",
     '@pinia/nuxt',
     'pinia-plugin-persistedstate/nuxt',
-    "@nuxtjs/i18n",
+    // "@nuxtjs/i18n",
     '@nuxt/scripts',
     "@nuxt/icon"
   ],
@@ -558,19 +560,35 @@ export default defineNuxtConfig({
     componentDir: '@/app/components/ui'
   },
 
-  i18n: {
-    locales: [
-      { code: 'en', language: 'en-US', file: "en.json" },
-      { code: 'zh', language: 'zh-CN', file: "zh.json" }
-    ],
-    strategy: "prefix",
-    defaultLocale: 'en',
-    detectBrowserLanguage: {
-      useCookie: false,
-      cookieKey: "i18n_redirected",
+  //   i18n: {
+  //     locales: [
+  //       { code: 'en', language: 'en-US', file: "en.json" },
+  //       { code: 'zh', language: 'zh-CN', file: "zh.json" }
+  //     ],
+  //     strategy: "prefix",
+  //     defaultLocale: 'en',
+  //     detectBrowserLanguage: {
+  //       useCookie: false,
+  //       cookieKey: "i18n_redirected",
 
-      redirectOn: "root", // recommended,
-      // alwaysRedirect: true
+  //       redirectOn: "root", // recommended,
+  //       // alwaysRedirect: true
+  //     },
+  //   },
+  hooks: {
+    'pages:extend'(pages) {
+      const prefixed: NuxtPage[] = []
+      for (const page of pages) {
+        for (const locale of i18nConfig.locales) {
+          const newPath=page.path === '/' ? `/${locale}` : `/${locale}${page.path}`
+          prefixed.push({
+            ...page,
+            path: newPath,
+            name: page.name ? `${locale}___${page.name}` : undefined,
+          })
+        }
+      }
+      pages.push(...prefixed)
     },
   },
 

```



### improved
配置支持任意层级, 而不是仅仅两层


### 使用者角度
指定一个文件作为config file path,该file中:
```ts
export default defineI18nMessages({
    en:{

    },
    zh:{

    }
})
```