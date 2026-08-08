# 编码规范

这份文档的目的是让不同时间写下的代码看起来像同一个人写的。有疑问时,优先服从周围既有代码的写法。

## TypeScript

### 严格度

`strict` 全开,额外启用:

- `noUncheckedIndexedAccess` — 数组和索引访问返回可能为 `undefined`,强制处理
- `noUnusedLocals` / `noUnusedParameters`
- `exactOptionalPropertyTypes`
- `verbatimModuleSyntax` — 类型导入必须显式写 `import type`

### 禁止事项

- 不用 `any`。确实未知用 `unknown`,再收窄
- 不用 `as` 强制断言绕过类型错误。断言只在你确实比编译器知道得多时用,并写一行注释说明依据
- 不用 `!` 非空断言。用早返回、可选链或显式判断代替
- 不用 `@ts-ignore`。必须绕过时用 `@ts-expect-error` 并注明原因

### 类型定义

- 对象形状用 `interface`,联合、交叉、工具类型用 `type`
- 优先从数据推导类型,而不是手写两份。Zod schema 用 `z.infer` 取类型,注册表用 `keyof typeof` 取角色标识
- 组件 props 就近定义在组件文件内,不集中放 `types.ts`。只有跨文件共用的类型才提取
- 不给能推导出的东西写显式类型标注

### 命名

- 类型与接口:PascalCase,不加 `I` 或 `T` 前缀
- 布尔值:`is` / `has` / `should` 开头
- 事件处理函数:`handleXxx`,props 上的回调:`onXxx`
- 常量:模块级不可变配置用 SCREAMING_SNAKE_CASE,其余用 camelCase

## React

### 组件

- 只用函数组件,不写 class
- 一个文件一个组件。内部拆出的子组件如果不超过 30 行且只此处使用,可以同文件,放在主组件下方
- props 解构在参数位置,带默认值直接写在解构里
- 组件超过约 150 行就该考虑拆分,超过 250 行必须拆

### hooks

- 自定义 hook 放 feature 内的 `hooks.ts`,通用的放 `shared/hooks/`
- 条件逻辑写在 hook 内部,不要条件调用 hook
- `useEffect` 只用于同步外部系统(订阅、DOM 操作、计时器)。**不用它拉数据**,那是 TanStack Query 的职责
- 依赖数组不允许省略成员来"避免重复执行"。如果需要这样做,说明逻辑该重构

### 状态

- 能从 props 或已有 state 推导出来的,不要另存一份 state
- 服务端数据不进 `useState`,统一由 Query 缓存持有
- 表单状态交给 React Hook Form,不自己用 state 拼
- Zustand 只放外壳级 UI 状态(主题、侧栏折叠)。业务数据进去就是错的

### 渲染

- 列表 `key` 用稳定唯一标识,不用数组索引
- 条件渲染用早返回或 `&&`,避免三层以上嵌套三元
- 不做没有实测依据的 `memo` / `useMemo` / `useCallback`。它们有成本,只在确认有性能问题时加

## 样式

- 一律用 Tailwind 工具类,不写 CSS 文件,不用内联 `style`(动态计算值除外)
- 颜色、间距、圆角只用 token,不写 `#3b82f6` 这类字面值
- 条件类名用 `cn()` 工具(clsx + tailwind-merge),不手拼字符串模板
- 类名顺序交给 Prettier 的 Tailwind 插件自动排,不手动整理
- 组件内不写响应式断点以外的媒体查询;容器级适配优先用容器查询

## 目录与导入

- 跨目录一律用 `@/` 别名,同目录用相对路径
- 导入顺序由 ESLint 自动整理:外部依赖 → `@/shared` → `@/layouts` → `@/features` → 相对路径
- 从 feature 引入只能走它的 `index.ts`,不深入内部文件
- `features/*` 之间不互相引用

## 异步与错误

- 全用 `async/await`,不写 `.then()` 链
- 请求错误不在组件里 `try/catch`。由请求层统一转换,组件通过 Query 的 `error` 状态处理
- 401 由请求层拦截并跳登录,业务代码不重复处理
- 每个数据展示区域都要有 loading 与 error 两种态,不允许静默失败

## 注释

注释解释**为什么**,不解释代码在做什么。

值得写的:非直观的业务规则、绕过某个库的缺陷、刻意选择的看似奇怪的写法。
不该写的:重复函数名的说明、被注释掉的旧代码、`// TODO` 之后不会做的事。

不写文件头注释块,不写 JSDoc 除非该函数供多处调用且签名不自明。

## 提交前

三条命令必须通过:

```
pnpm typecheck
pnpm lint
pnpm format
```

simple-git-hooks 负责注册 `pre-commit` 钩子,钩子里调 lint-staged,对改动文件跑 lint 与 format。两者的配置都在 `package.json`。

装完依赖需要跑一次 `pnpm simple-git-hooks` 把钩子写进 `.git/hooks`,否则 lint-staged 不会被触发。把它挂在 `prepare` 脚本上,`pnpm install` 时自动执行。

类型检查不放进钩子——它是全项目级的,跟"只检查改动文件"的模型不匹配,放进去会让每次提交都变慢。手动跑,或者交给 CI。
