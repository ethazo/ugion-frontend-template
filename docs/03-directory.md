# 目录约定

## 总览

```
src/
  app/            应用装配:入口、Provider 栈、角色注册表、启动引导
  routes/         路由文件,由 TanStack Router 插件扫描生成路由树
  layouts/        布局,按形态划分
  features/       业务功能,按功能垂直切分
  shared/         通用能力,不含业务概念
  styles/         全局样式与主题 token
```

`app/` 与 `routes/` 同属**装配层**,是唯一可以同时看到所有下层的地方。其余目录遵守 `02-architecture.md` 的依赖方向。

## app/

```
app/
  main.tsx          入口,挂载根节点
  providers.tsx     Provider 栈:Query、主题、Router
  roles.ts          角色注册表
  bootstrap.tsx     启动引导:请求当前用户、分发或跳登录
```

角色注册表放这里而不是单独的 `config/`,因为它同时引用布局组件和角色元信息,天然属于装配层。

## routes/

路由文件只做三件事:声明路径、挂布局、渲染 feature 导出的页面组件。**不写业务逻辑**,业务实现全在 `features/`。这样路由树保持轻薄,一眼能看清应用结构。

```
routes/
  __root.tsx              根路由
  index.tsx               访问 / 时按当前角色重定向到其落地路径
  login.tsx               登录页
  student/
    route.tsx             角色段:beforeLoad 校验角色 + 套用注册表指定的布局
    index.tsx             学生落地页
    courses.tsx
  teacher/
    route.tsx
    index.tsx
  admin/
    route.tsx
    index.tsx
    users.tsx
```

每个角色目录下的 `route.tsx` 是该角色区域的公共父级,承担两件事:`beforeLoad` 里校验角色不匹配则重定向,以及从注册表取出该角色选定的布局并渲染。三个角色的 `route.tsx` 结构几乎一致,差别只在角色标识。

`login.tsx` **不套任何布局**。布局要渲染用户区(头像、姓名、退出),而登录页此时没有当前用户。同理,它也不参与启动引导的角色分发。

`index.tsx` 只做重定向:读当前用户的角色,查注册表的 `landing` 跳过去。它自己不渲染内容。

`routeTree.gen.ts` 由插件自动生成,不手改。它需要提交进仓库(类型推导依赖它),但在 ESLint 与 Prettier 中排除。

## layouts/

```
layouts/
  top-nav/
    index.tsx
  sidebar/
    index.tsx
  user-area/            用户区:头像、信息、主题切换、退出登录
    index.tsx
```

布局接收 `nav` 与 `children`,内部不出现角色判断。`user-area/` 独立于两种布局之外,因为它被两者共用,只是摆放位置不同。

新增布局形态就在这一层加目录,与已有布局平级。

## features/

按功能垂直切分,一个 feature 自带它需要的一切:

```
features/
  courses/
    api.ts             接口调用、Zod schema、query key 工厂
    hooks.ts           基于 TanStack Query 的数据 hooks
    components/        仅本 feature 使用的组件
    pages/             页面组件,由 routes/ 引用
    index.ts           对外出口,只导出 pages 与必要类型
```

没有 `types.ts`。领域类型由 `api.ts` 里的 Zod schema 经 `z.infer` 推导,组件 props 就近定义在组件文件里——两条都在 `04-coding-standards.md` 里有规定,再放一个 `types.ts` 只会变成手写类型的第二份来源。确实出现了不属于接口响应、又被 feature 内多个文件共用的类型,再加这个文件。

两条硬规则:

- **`features/*` 之间禁止互相 import**。需要共享就下沉到 `shared/`,或者说明这两者本该是一个 feature。
- 外部只能从 feature 的 `index.ts` 引入,不能深入其内部文件。

这两条用 ESLint 的 `no-restricted-imports` 强制。

## shared/

```
shared/
  ui/                shadcn 组件源码
  api/               请求层:fetch 封装、401 拦截、错误约定
  hooks/             通用 hooks
  lib/               工具函数
  types/             跨层共用类型
```

`shared/` 里不出现任何业务概念。判断标准很简单:把这个文件放到另一个项目里能不能直接用,不能就说明它属于某个 feature。

`ui/` 是 shadcn CLI 的生成目标,组件源码可以随意改——改动不会被上游覆盖。

## styles/

```
styles/
  global.css         Tailwind 引入、@theme token 定义、暗色变量
```

Tailwind v4 的 token 写在 `@theme` 里,产出原生 CSS 变量。暗色模式是另一组变量值,通过根元素 class 切换。详见 `05-design-system.md`。

## 根目录

```
index.html              含防主题闪烁的内联脚本(见 05)
vite.config.ts          插件、路径别名、代理、base
tsconfig.json           严格度配置与 @/ 别名
components.json         shadcn CLI 配置
eslint.config.js        flat config
.prettierrc             含 Tailwind 类名排序插件
.env.example            变量清单
package.json            含 simple-git-hooks 与 lint-staged 配置
```

`@/` 别名要在 **tsconfig 和 vite.config 两处**都配,前者管类型推导,后者管实际解析,只配一处会出现编辑器不报错但构建失败(或反之)。

### components.json

shadcn CLI 默认把组件生成到 `components/ui`、工具函数放 `lib/utils.ts`,与本项目的目录约定不一致。必须在 `components.json` 里把别名指到:

```
ui       → @/shared/ui
utils    → @/shared/lib/cn
lib      → @/shared/lib
hooks    → @/shared/hooks
```

不配这一步,每次 `pnpm dlx shadcn add` 都会在 `src/components/` 下另建一套目录。

`cn()` 定义在 `shared/lib/cn.ts`,是 shadcn 组件的硬依赖,脚手架阶段就要有。

## 命名约定

- 目录用 kebab-case:`user-area/`、`top-nav/`
- 组件文件用 PascalCase:`UserArea.tsx`
- 非组件文件用 camelCase:`fileUrl.ts`、`roles.ts`
- 路由文件名由 TanStack Router 约定决定,不自行发挥

一个例外:目录的入口文件用 `index.tsx`,即使它导出的是组件。`layouts/top-nav/index.tsx`、`layouts/user-area/index.tsx` 属于这种情况——目录名已经表达了组件身份,再叫 `TopNav.tsx` 就得写 `top-nav/TopNav.tsx`,重复且引入路径更长。目录内拆出的子组件仍用 PascalCase。

## 路径别名

`@/` 指向 `src/`,所有跨目录引用都用别名,不写 `../../../`。同一目录内的相邻文件用相对路径。
