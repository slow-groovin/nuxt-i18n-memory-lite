# 模块作者指南

学习如何创建 Nuxt 模块以集成、增强或扩展任何 Nuxt 应用程序。

Nuxt 的配置和钩子系统使得定制 Nuxt 的各个方面以及添加任何您可能需要的集成（Vue 插件、CMS、服务器路由、组件、日志记录等）成为可能。

**Nuxt 模块**是在使用`nuxt dev`以开发模式启动 Nuxt 或使用`nuxt build`构建生产项目时按顺序运行的函数。通过模块，您可以将自定义解决方案封装、正确测试并作为 npm 包共享，而无需向项目添加不必要的样板文件，也无需更改 Nuxt 本身。

## 快速开始

我们建议您使用我们的起始模板:

```bash
npm create nuxt -- -t module my-module
```

或使用其他包管理器:

```bash
yarn create nuxt -t module my-module
pnpm create nuxt -t module my-module
bun create nuxt -- -t module my-module
```

这将创建一个`my-module`项目，其中包含开发和发布模块所需的所有样板文件。

**下一步**

1. 在您选择的 IDE 中打开`my-module`
2. 使用您喜欢的包管理器安装依赖项
3. 使用`npm run dev:prepare`为开发准备本地文件
4. 按照此文档了解有关 Nuxt 模块的更多信息

### 使用入门模板

了解如何使用模块入门模板执行基本任务。

#### 如何开发

虽然您的模块源代码位于`src`目录中，但在大多数情况下，要开发模块，您需要一个 Nuxt 应用程序。这就是`playground`目录的作用。它是一个 Nuxt 应用程序，您可以对其进行修改，该应用程序已配置为与您的模块一起运行。

您可以像使用任何 Nuxt 应用程序一样与 playground 交互。

- 使用`npm run dev`启动其开发服务器，当您在`src`目录中更改模块时，它应该会自动重新加载。
- 使用`npm run dev:build`构建它

所有其他`nuxt`命令都可以针对`playground`目录使用（例如`nuxt <COMMAND> playground`）。您可以随意在`package.json`中声明额外的`dev:*`脚本，以便于引用它们。

#### 如何测试

模块启动器带有一个基本的测试套件

- 一个由[ESLint](https://eslint.org.cn)提供支持的 linter，使用`npm run lint`运行
- 一个由[Vitest](https://vitest.vite.org.cn)提供支持的测试运行器，使用`npm run test`或`npm run test:watch`运行

您可以随意增强此默认测试策略，以更好地满足您的需求。

#### 如何构建

Nuxt 模块附带自己的构建器，由`@nuxt/module-builder`提供。此构建器无需您进行任何配置，支持 TypeScript，并确保您的资产正确打包以便分发到其他 Nuxt 应用程序。

您可以通过运行`npm run prepack`来构建您的模块。

虽然在某些情况下构建您的模块可能很有用，但大多数情况下您不需要自己构建它：`playground`在开发时会处理它，发布脚本在发布时也会为您提供支持。

#### 如何发布

在将您的模块发布到 npm 之前，请确保您有一个[npmjs.com](https://npmjs.net.cn)帐户，并且您已使用`npm login`在本地进行身份验证。

虽然您可以通过提升模块版本并使用`npm publish`命令来发布模块，但模块启动器带有一个发布脚本，可帮助您确保将模块的有效版本发布到 npm 等。

要使用发布脚本，首先，提交所有更改（我们建议您遵循[Conventional Commits](https://www.conventionalcommits.org)以利用自动版本提升和更新日志），然后使用`npm run release`运行发布脚本。

运行发布脚本时，将发生以下情况：

- 首先，它将通过以下方式运行您的测试套件：
  - 运行 linter（`npm run lint`）
  - 运行单元、集成和 e2e 测试（`npm run test`）
  - 构建模块（`npm run prepack`）
- 然后，如果您的测试套件运行良好，它将通过以下方式发布您的模块：
  - 根据您的 Conventional Commits 提升模块版本并生成变更日志
  - 将模块发布到 npm（为此，将再次构建模块，以确保其更新的版本号在发布的工件中得到考虑）
  - 将代表新发布版本的 Git 根签推送到您的 Git 远程源

与其他脚本一样，您可以随意在`package.json`中微调默认的`release`脚本，以更好地满足您的需求。

## 开发模块

Nuxt 模块提供各种强大的 API 和模式，使其能够以几乎任何可能的方式更改 Nuxt 应用程序。本节将教您如何利用这些功能。

### 模块结构

我们可以将 Nuxt 模块分为两类

- 已发布的模块在 npm 上分发——您可以在[Nuxt 网站](https://nuxtjs.org.cn/modules)上查看一些社区模块的列表。
- "本地"模块，它们存在于 Nuxt 项目本身中，或者以内联方式在 Nuxt 配置中，或者作为[`modules`目录](https://nuxtjs.org.cn/docs/4.x/guide/directory-structure/modules)的一部分。

无论哪种情况，它们的结构都相似。

#### 模块定义

使用入门模板时，您的模块定义位于`src/module.ts`。

模块定义是模块的入口点。当您的模块在 Nuxt 配置中被引用时，Nuxt 会加载它。

在底层，Nuxt 模块定义是一个简单（可能异步）的函数，接受内联用户选项和一个`nuxt`对象以与 Nuxt 交互。

```js
export default function (inlineOptions, nuxt) {
  // You can do whatever you like here..
  console.log(inlineOptions.token) // `123`
  console.log(nuxt.options.dev) // `true` or `false`

  nuxt.hook('ready', (nuxt) => {
    console.log('Nuxt is ready')
  })
}
```

您可以使用[Nuxt Kit](https://nuxtjs.org.cn/docs/4.x/guide/going-further/kit)提供的更高级别的`defineNuxtModule`辅助函数，为该函数获取类型提示支持。

```ts
import { defineNuxtModule } from '@nuxt/kit'

export default defineNuxtModule((options, nuxt) => {
  nuxt.hook('pages:extend', (pages) => {
    console.log(`Discovered ${pages.length} pages`)
  })
})
```

然而，**我们不建议**使用这种低级函数定义。相反，为了定义模块，**我们建议**使用带有`meta`属性的对象语法来标识您的模块，尤其是在发布到 npm 时。

此辅助函数通过实现模块所需的许多常见模式，简化了 Nuxt 模块的编写，确保了未来的兼容性，并改善了模块作者和用户的体验。

```ts
import { defineNuxtModule } from '@nuxt/kit'

export default defineNuxtModule({
  meta: {
    // Usually the npm package name of your module
    name: '@nuxtjs/example',
    // The key in `nuxt.config` that holds your module options
    configKey: 'sample',
    // Compatibility constraints
    compatibility: {
      // Semver version of supported nuxt versions
      nuxt: '>=3.0.0',
    },
  },
  // Default configuration options for your module, can also be a function returning those
  defaults: {},
  // Shorthand sugar to register Nuxt hooks
  hooks: {},
  // Configuration for other modules - this does not ensure the module runs before
  // your module, but it allows you to change the other module's configuration before it runs
  moduleDependencies: {
    'some-module': {
      // You can specify a version constraint for the module. If the user has a different
      // version installed, Nuxt will throw an error on startup.
      version: '>=2',
      // By default moduleDependencies will be added to the list of modules to be installed
      // by Nuxt unless `optional` is set.
      optional: true,
      // Any configuration that should override `nuxt.options`.
      overrides: {},
      // Any configuration that should be set. It will override module defaults but
      // will not override any configuration set in `nuxt.options`.
      defaults: {},
    },
  },
  // The function holding your module logic, it can be asynchronous
  setup (moduleOptions, nuxt) {
    // ...
  },
})
```

最终，`defineNuxtModule`返回一个包装函数，该函数具有低级`(inlineOptions, nuxt)`模块签名。此包装函数在调用您的`setup`函数之前应用默认值和其他必要步骤。

- 支持`defaults`和`meta.configKey`，用于自动合并模块选项。
- 类型提示和自动化类型推断
- 为基本的 Nuxt 2 兼容性添加 shims
- 使用由`meta.name`或`meta.configKey`计算的唯一键，确保模块只安装一次
- 自动注册 Nuxt 钩子
- 根据模块元数据自动检查兼容性问题
- 暴露`getOptions`和`getMeta`供 Nuxt 内部使用
- 只要模块使用最新版本`@nuxt/kit`中的`defineNuxtModule`，就能确保向前和向后兼容性。
- 与模块构建工具集成

#### 运行时目录

使用入门模板时，运行时目录位于`src/runtime`。

模块，就像 Nuxt 配置中的所有内容一样，不包含在您的应用程序运行时中。但是，您可能希望您的模块提供或注入运行时代码到安装它的应用程序中。这就是运行时目录允许您做到的。

在运行时目录中，您可以提供与 Nuxt App 相关的任何类型的资产

- Vue 组件
- 可组合项
- Nuxt 插件

对于[服务器引擎](https://nuxtjs.org.cn/docs/4.x/guide/concepts/server-engine) Nitro

- API 路由
- 中间件
- Nitro 插件

或您想注入用户 Nuxt 应用程序的任何其他类型的资产

- 样式表
- 3D 模型
- 图片
- 等等

然后，您将能够从[您的模块定义](#模块定义)中将所有这些资产注入到应用程序中。

已发布的模块无法利用其运行时目录中资产的自动导入。相反，它们必须从`#imports`或类似路径显式导入它们。

事实上，出于性能原因，`node_modules`（已发布模块最终所在的位置）中的文件未启用自动导入。

### 工具

模块附带一套第一方工具，以帮助您进行开发。

#### `@nuxt/module-builder`

[Nuxt 模块构建器](https://github.com/nuxt/module-builder#readme)是一个零配置构建工具，负责构建和发布您的模块的所有繁重工作。它确保您的模块构建工件与 Nuxt 应用程序的适当兼容性。

#### `@nuxt/kit`

[Nuxt Kit](https://nuxtjs.org.cn/docs/4.x/guide/going-further/kit)提供了可组合的实用工具，可帮助您的模块与 Nuxt 应用程序交互。建议尽可能使用 Nuxt Kit 实用工具，而不是手动替代方案，以确保模块更好的兼容性和代码可读性。

#### `@nuxt/test-utils`

[Nuxt Test Utils](https://nuxtjs.org.cn/docs/4.x/getting-started/testing)是一组实用工具，可帮助在模块测试中设置和运行 Nuxt 应用程序。

### 秘诀

此处是编写模块时使用的常见模式。

#### 更改 Nuxt 配置

Nuxt 配置可以被模块读取和修改。这是一个启用实验性功能的模块示例。

```ts
import { defineNuxtModule } from '@nuxt/kit'

export default defineNuxtModule({
  setup (options, nuxt) {
    // We create the `experimental` object if it doesn't exist yet
    nuxt.options.experimental ||= {}
    nuxt.options.experimental.componentIslands = true
  },
})
```

当您需要处理更复杂的配置更改时，您应该考虑使用[defu](https://github.com/unjs/defu).

#### 向运行时暴露选项

因为模块不属于应用程序运行时，所以它们的选项也不属于。但是，在许多情况下，您可能需要在运行时代码中访问这些模块选项中的一些。我们建议使用 Nuxt 的[`runtimeConfig`](https://nuxtjs.org.cn/docs/4.x/api/nuxt-config#runtimeconfig)来暴露所需的配置。

```ts
import { defineNuxtModule } from '@nuxt/kit'
import { defu } from 'defu'

export default defineNuxtModule({
  setup (options, nuxt) {
    nuxt.options.runtimeConfig.public.myModule = defu(nuxt.options.runtimeConfig.public.myModule, {
      foo: options.foo,
    })
  },
})
```

请注意，我们使用[`defu`](https://github.com/unjs/defu)来扩展用户提供的公共运行时配置，而不是覆盖它。

然后，您可以在插件、组件、应用程序中像访问任何其他运行时配置一样访问您的模块选项。

```ts
import { useRuntimeConfig } from '@nuxt/kit'

const options = useRuntimeConfig().public.myModule
```

请注意不要在公共运行时配置中暴露任何敏感的模块配置，例如私有 API 密钥，因为它们最终将出现在公共包中。

#### 使用`addPlugin`注入插件

插件是模块添加运行时逻辑的常用方式。您可以使用`addPlugin`实用程序从您的模块中注册它们。

```ts
import { addPlugin, createResolver, defineNuxtModule } from '@nuxt/kit'

export default defineNuxtModule({
  setup (options, nuxt) {
    // Create resolver to resolve relative paths
    const resolver = createResolver(import.meta.url)

    addPlugin(resolver.resolve('./runtime/plugin'))
  },
})
```

#### 使用`addComponent`注入 Vue 组件

如果您的模块应该提供 Vue 组件，您可以使用`addComponent`实用程序将它们添加为 Nuxt 解析的自动导入。

```ts
import { addComponent, createResolver, defineNuxtModule, useRuntimeConfig } from '@nuxt/kit'

export default defineNuxtModule({
  setup (options, nuxt) {
    const resolver = createResolver(import.meta.url)

    // From the runtime directory
    addComponent({
      name: 'MySuperComponent', // name of the component to be used in vue templates
      export: 'MySuperComponent', // (optional) if the component is a named (rather than default) export
      filePath: resolver.resolve('runtime/components/MySuperComponent.vue'),
    })

    // From a library
    addComponent({
      name: 'MyAwesomeComponent', // name of the component to be used in vue templates
      export: 'MyAwesomeComponent', // (optional) if the component is a named (rather than default) export
      filePath: '@vue/awesome-components',
    })
  },
})
```

或者，您可以使用`addComponentsDir`添加整个目录。

```ts
import { addComponentsDir, defineNuxtModule } from '@nuxt/kit'

export default defineNuxtModule({
  setup (options, nuxt) {
    const resolver = createResolver(import.meta.url)

    addComponentsDir({
      path: resolver.resolve('runtime/components'),
    })
  },
})
```

#### 使用`addImports`和`addImportsDir`注入可组合项

如果您的模块应该提供可组合项，您可以使用`addImports`实用程序将它们添加为 Nuxt 解析的自动导入。

```ts
import { addImports, createResolver, defineNuxtModule } from '@nuxt/kit'

export default defineNuxtModule({
  setup (options, nuxt) {
    const resolver = createResolver(import.meta.url)

    addImports({
      name: 'useComposable', // name of the composable to be used
      as: 'useComposable',
      from: resolver.resolve('runtime/composables/useComposable'), // path of composable
    })
  },
})
```

或者，您可以使用`addImportsDir`添加整个目录。

```ts
import { addImportsDir, createResolver, defineNuxtModule } from '@nuxt/kit'

export default defineNuxtModule({
  setup (options, nuxt) {
    const resolver = createResolver(import.meta.url)

    addImportsDir(resolver.resolve('runtime/composables'))
  },
})
```

#### 使用`addServerHandler`注入服务器路由

```ts
import { addServerHandler, createResolver, defineNuxtModule } from '@nuxt/kit'

export default defineNuxtModule({
  setup (options, nuxt) {
    const resolver = createResolver(import.meta.url)

    addServerHandler({
      route: '/api/hello',
      handler: resolver.resolve('./runtime/server/api/hello/index.get'),
    })
  },
})
```

您还可以添加动态服务器路由

```ts
import { addServerServerHandler, createResolver, defineNuxtModule } from '@nuxt/kit'

export default defineNuxtModule({
  setup (options, nuxt) {
    const resolver = createResolver(import.meta.url)

    addServerHandler({
      route: '/api/hello/:name',
      handler: resolver.resolve('./runtime/server/api/hello/[/[name].get'),
    })
  },
})
```

#### 注入其他资产

如果您的模块应该提供其他类型的资产，它们也可以被注入。这是一个简单的模块示例，通过 Nuxt 的`css`数组注入样式表。

```ts
import { addPlugin, createResolver, defineNuxtModule } from '@nuxt/kit'

export default defineNuxtModule({
  setup (options, nuxt) {
    const resolver = createResolver(import.meta.url)

    nuxt.options.css.push(resolver.resolve('./runtime/style.css'))
  },
})
```

还有一个更高级的示例，通过 [Nitro](https://nuxtjs.org.cn/docs/4.x/guide/concepts/server-engine) 的 `publicAssets` 选项公开一个资产文件夹。

```ts
import { createResolver, defineNuxtModule } from '@nuxt/kit'

export default defineNuxtModule({
  setup (options, nuxt) {
    const resolver = createResolver(import.meta.url)

    nuxt.hook('nitro:config', (nitroConfig) => {
      nitroConfig.publicAssets ||= []
      nitroConfig.publicAssets.push({
        dir: resolver.resolve('./runtime/public'),
        maxAge: 60 * 60 * 24 * 365, // 1 year
      })
    })
  },
})
```

#### 在您的模块中使用其他模块

如果您的模块依赖于其他模块，您可以使用`moduleDependencies`选项指定它们。这提供了一种更可靠的方式来处理具有版本约束和配置合并的模块依赖项。

```ts
import { createResolver, defineNuxtModule } from '@nuxt/kit'

const resolver = createResolver(import.meta.url)

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'my-module',
  },
  moduleDependencies: {
    '@nuxtjs/tailwindcss': {
      // You can specify a version constraint for the module
      version: '>=6',
      // Any configuration that should override `nuxt.options`
      overrides: {
        exposeConfig: true,
      },
      // Any configuration that should be set. It will override module defaults but
      // will not override any configuration set in `nuxt.options`
      defaults: {
        config: {
          darkMode: 'class',
          content: {
            files: [
              resolver.resolve('./runtime/components/**/*.{vue,mjs,ts}'),
              resolver.resolve('./runtime/*.{mjs,js,ts}'),
            ],
          },
        },
      },
    },
  },
  setup (options, nuxt) {
    // We can inject our CSS file which includes Tailwind's directives
    nuxt.options.css.push(resolver.resolve('./runtime/assets/styles.css'))
  },
})
```

`moduleDependencies`选项取代了已弃用的`installModule`函数，并确保了正确的设置顺序和配置合并。

#### 使用钩子

[生命周期钩子](https://nuxtjs.org.cn/docs/4.x/guide/going-further/hooks)允许您扩展 Nuxt 的几乎所有方面。模块可以通过编程方式或通过其定义中的`hooks`映射来挂钩它们。

```ts
import { addPlugin, createResolver, defineNuxtModule } from '@nuxt/kit'

export default defineNuxtModule({
  // Hook to the `app:error` hook through the `hooks` map
  hooks: {
    'app:error': (err) => {
      console.info(`This error happened: ${err}`)
    },
  },
  setup (options, nuxt) {
    // Programmatically hook to the `pages:extend` hook
    nuxt.hook('pages:extend', (pages) => {
      console.info(`Discovered ${pages.length} pages`)
    })
  },
})
```

**模块清理**

如果您的模块打开、处理或启动了监视器，您应该在 Nuxt 生命周期结束时关闭它。`close`钩子可用于此目的。

```ts
import { defineNuxtModule } from '@nuxt/kit'

export default defineNuxtModule({
  setup (options, nuxt) {
    nuxt.hook('close', async (nuxt) => {
      // Your custom code here
    })
  },
})
```

##### 自定义钩子

模块还可以定义和调用自己的钩子，这是使您的模块可扩展的强大模式。

如果您希望其他模块能够订阅您的模块的钩子，您应该在`modules:done`钩子中调用它们。这确保了所有其他模块都有机会在自己的`setup`函数期间进行设置并向您的钩子注册它们的监听器。

```ts
// my-module/module.ts
import { defineNuxtModule } from '@nuxt/kit'

export interface ModuleHooks {
  'my-module:custom-hook': (payload: { foo: { bar: string } }) => void
}

export default defineNuxtModule({
  setup (options, nuxt) {
    // Call your hook in `modules:done`
    nuxt.hook('modules:done', async () => {
      const payload = { foo: 'bar' }
      await nuxt.callHook('my-module:custom-hook', payload)
    })
  },
})
```

#### 添加模板/虚拟文件

如果您需要添加一个可以导入到用户应用程序中的虚拟文件，您可以使用`addTemplate`实用程序。

```ts
import { addTemplate, defineNuxtModule } from '@nuxt/kit'

export default defineNuxtModule({
  setup (options, nuxt) {
    // The file is added to Nuxt's internal virtual file system and can be imported from '#build/my-module-feature.mjs'
    addTemplate({
      filename: 'my-module-feature.mjs',
      getContents: () => 'export const myModuleFeature = () => "hello world !"',
    })
  },
})
```

对于服务器，您应该改用`addServerTemplate`实用程序。

```ts
import { addServerTemplate, defineNuxtModule } from '@nuxt/kit'

export default defineNuxtModule({
  setup (options, nuxt) {
    // The file is added to Nitro's virtual file system and can be imported in the server code from 'my-server-module.mjs'
    addServerTemplate({
      filename: 'my-server-module.mjs',
      getContents: () => 'export const myServerModule = () => "hello world !"',
    })
  },
})
```

#### 添加类型声明

您可能还想向用户项目添加类型声明（例如，增强 Nuxt 接口或提供您自己的全局类型）。为此，Nuxt 提供了`addTypeTemplate`实用程序，该实用程序既可以将模板写入磁盘，又可以在生成的`nuxt.d.ts`文件中添加对它的引用。

如果您的模块需要增强 Nuxt 处理的类型，您可以使用`addTypeTemplate`来执行此操作。

```ts
import { addTemplate, addTypeTemplate, defineNuxtModule } from '@nuxt/kit'

export default defineNuxtModule({
  setup (options, nuxt) {
    addTypeTemplate({
      filename: 'types/my-module.d.ts',
      getContents: () => `// Generated by my-module
interface MyModuleNitroRules {
  myModule?: { foo: 'bar' }
}

declare module 'nitropack/types' {
  interface NitroRouteRules extends MyModuleNitroRules {}
  interface NitroRouteConfig extends MyModuleNitroRules {}
}

export {}`,
    })
  },
})
```

如果您需要更精细的控制，可以使用`prepare:types`钩子来注册一个将注入您的类型的回调。

```ts
const template = addTemplate({ /* template options */ })

nuxt.hook('prepare:types', ({ references }) => {
  references.push({ path: template.dst })
})
```

##### 更新模板

如果您需要更新您的模板/`virtual`文件，您可以像这样利用`updateTemplates`实用程序。

```ts
nuxt.hook('builder:watch', (event, path) => {
  if (path.includes('my-module-feature.config')) {
    // This will reload the template that you registered
    updateTemplates({ filter: t => t.filename === 'my-module-feature.mjs' })
  }
})
```

### 测试

测试有助于确保您的模块在各种设置下按预期工作。在本节中了解如何对模块执行各种测试。

#### 单元和集成

我们仍在讨论和探索如何简化 Nuxt 模块的单元和集成测试。

[查看此 RFC 以加入讨论](https://github.com/nuxt/nuxt/discussions/18399).

#### 端到端

[Nuxt Test Utils](https://nuxtjs.org.cn/docs/4.x/getting-started/testing)是帮助您以端到端方式测试模块的首选库。以下是采用它的工作流程：

1. 在`test/fixtures/*`中创建一个 Nuxt 应用程序作为"夹具"
2. 在您的测试文件中使用此夹具设置 Nuxt
3. 使用`@nuxt/test-utils`中的实用程序与夹具交互（例如，获取页面）
4. 对该夹具执行检查（例如，"HTML 包含..."）
5. 重复

实际上，这个夹具

```ts
// test/fixtures/ssr/nuxt.config.ts
import MyModule from '../../../src/module'

export default defineNuxtConfig({
  ssr: true,
  modules: [
    MyModule,
  ],
})
```

及其测试

```ts
import { describe, expect, it } from 'vitest'
import { fileURLToPath } from 'node:url'
import { $fetch, setup } from '@nuxt/test-utils/e2e'

describe('ssr', async () => {
  await setup({
    rootDir: fileURLToPath(new URL('./fixtures/ssr', import.meta.url)),
  })

  it('renders the index page', async () => {
    const html = await $fetch('/')
    expect(html).toContain('<div>ssr</div>')
  })
})

describe('csr', async () => {
  // ...
})
```

此类工作流程的示例可在[模块启动器](https://github.com/nuxt/starter/blob/module/test/basic.test.ts).

#### 使用 Playground 和外部进行手动 QA

在开发模块时拥有一个 playground Nuxt 应用程序来测试您的模块非常有用。模块启动器为此目的集成了一个。

您可以在本地使用其他 Nuxt 应用程序（不属于模块存储库的应用程序）测试您的模块。为此，您可以使用[`npm pack`](https://docs.npmjs.net.cn/cli/commands/npm-pack)命令，或您的包管理器等效命令，从您的模块创建 tarball。然后，在您的测试项目中，您可以将您的模块添加到`package.json`包中，如下所示：`"my-module": "file:/path/to/tarball.tgz"`。

之后，您应该能够像在任何常规项目中一样引用`my-module`。

### 最佳实践

能力越大，责任越大。虽然模块功能强大，但在编写模块时请牢记以下最佳实践，以保持应用程序高性能和卓越的开发体验。

#### 异步模块

正如我们所见，Nuxt 模块可以是异步的。例如，您可能希望开发一个需要获取一些 API 或调用异步函数的模块。

但是，请注意异步行为，因为 Nuxt 将等待您的模块设置完成后才会进入下一个模块并启动开发服务器、构建过程等。更倾向于将耗时的逻辑推迟到 Nuxt 钩子中。

如果您的模块设置时间超过**1秒**，Nuxt 将发出警告。

#### 始终为暴露的接口添加前缀

Nuxt 模块应为其暴露的任何配置、插件、API、可组合项或组件提供明确的前缀，以避免与其他模块和内部冲突。

理想情况下，您应该用您的模块名称作为前缀（例如，如果您的模块名为`nuxt-foo`，则暴露`<FooButton>`和`useFooBar()`，而**不是**`<Button>`和`useBar()`）。

#### 使用生命周期钩子进行一次性设置

当您的模块需要执行一次性设置任务（如生成配置文件、设置数据库或安装依赖项）时，请使用生命周期钩子，而不是在主`setup`函数中运行逻辑。

```ts
import { addServerHandler, defineNuxtModule } from 'nuxt/kit'
import semver from 'semver'

export default defineNuxtModule({
  meta: {
    name: 'my-database-module',
    version: '1.0.0',
  },
  async onInstall (nuxt) {
    // One-time setup: create database schema, generate config files, etc.
    await generateDatabaseConfig(nuxt.options.rootDir)
  },
  async onUpgrade (options, nuxt, previousVersion) {
    // Handle version-specific migrations
    if (semver.lt(previousVersion, '1.0.0')) {
      await migrateLegacyData()
    }
  },
  setup (options, nuxt) {
    // Regular setup logic that runs on every build
    addServerHandler({ /* ... */ })
  },
})
```

这种模式可以防止每次构建时进行不必要的工作，并提供更好的开发体验。有关更多详细信息，请参阅[生命周期钩子文档](https://nuxtjs.org.cn/docs/4.x/api/kit/modules#using-lifecycle-hooks-for-module-installation-and-upgrade)。

#### 对 TypeScript 友好

Nuxt 拥有第一流的 TypeScript 集成，以提供最佳的开发体验。

即使不直接使用 TypeScript，暴露类型和使用 TypeScript 开发模块也对用户有益。

#### 避免 CommonJS 语法

Nuxt 依赖于原生 ESM。请阅读[原生 ES 模块](https://nuxtjs.org.cn/docs/4.x/guide/concepts/esm)以获取更多信息。

#### 文档模块使用

考虑在 readme 文件中记录模块使用情况

- 为什么要使用这个模块？
- 如何使用这个模块？
- 这个模块做了什么？

链接到集成网站和文档总是一个好主意。

#### 提供 StackBlitz 演示或样板

最好用您的模块和[StackBlitz](https://nuxt.new/s/v4)您添加到模块 readme 中的内容创建一个最小的重现。

这不仅为模块的潜在用户提供了一种快速简便地试验模块的方法，还为他们提供了一种简单的方法来构建他们遇到问题时可以发送给您的最小重现。

#### 不要用特定的 Nuxt 版本进行宣传

Nuxt、Nuxt Kit 和其他新工具在设计时都考虑了向前和向后兼容性。

请使用"X for Nuxt"而不是"X for Nuxt 3"，以避免生态系统碎片化，并优先使用`meta.compatibility`设置 Nuxt 版本约束。

#### 坚持入门模板的默认设置

模块启动器带有一套默认的工具和配置（例如 ESLint 配置）。如果您打算开源您的模块，坚持这些默认设置可以确保您的模块与其他[社区模块](https://nuxtjs.org.cn/modules)保持一致的编码风格，使他人更容易贡献。

## 生态系统

[Nuxt 模块生态系统](https://nuxtjs.org.cn/modules)每月 NPM 下载量超过 1500 万，并提供扩展功能和与各种工具的集成。您可以成为这个生态系统的一部分！

### 模块类型

**官方模块**是以`@nuxt/`为前缀（范围）的模块（例如[`@nuxt/content`](https://content.nuxtjs.org.cn)）。它们由 Nuxt 团队积极开发和维护。与框架一样，我们非常欢迎社区的贡献，以帮助改进它们！

**社区模块**是带有`@nuxtjs/`前缀（范围）的模块（例如[`@nuxtjs/tailwindcss`](https://tailwindcss.nuxtjs.org)）。它们是由社区成员开发和维护的成熟模块。再次强调，欢迎任何人贡献。

**第三方和其他社区模块**是（通常）以`nuxt-`为前缀的模块。任何人都可以制作它们，使用此前缀可以使这些模块在 npm 上被发现。这是起草和尝试一个想法的最佳起点！

**私有或个人模块**是为您自己的用例或公司制作的模块。它们无需遵循任何命名规则即可与 Nuxt 配合使用，并且通常在 npm 组织下进行范围限定（例如`@my-company/nuxt-auth`）

### 列出您的社区模块

任何社区模块都欢迎列在[模块列表](https://nuxtjs.org.cn/modules)中。要列出，[在 nuxt/modules 中提出一个问题](https://github.com/nuxt/modules/issues/new?template=module_request.yml)存储库。Nuxt 团队可以帮助您在列出之前应用最佳实践。

### 加入`nuxt-modules`和`@nuxtjs/`

通过将您的模块移动到[nuxt-modules](https://github.com/nuxt-modules)，总会有人提供帮助，这样我们就可以联合起来，打造一个完美的解决方案。

如果您有一个已发布且正在运行的模块，并且希望将其转移到`nuxt-modules`，[在 nuxt/modules 中提出一个问题](https://github.com/nuxt/modules/issues/new).

通过加入`nuxt-modules`，我们可以将您的社区模块重命名为`@nuxtjs/`范围下，并为其文档提供一个子域名（例如`my-module.nuxtjs.org`）。
