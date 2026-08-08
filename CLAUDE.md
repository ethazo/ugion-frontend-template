# CLAUDE.md

前端模板项目。只解决架构与外壳层面的问题:分层、角色分发、布局、请求层、主题。业务内容由下游项目填充。

详细约定见 `docs/`。本文是可执行摘要,冲突时以 `docs/` 为准。

## 命令

```
pnpm dev          启动开发服务器
pnpm build        生产构建
pnpm preview      预览构建产物
pnpm typecheck    类型检查
pnpm lint         ESLint
pnpm format       Prettier
```

改完代码跑 `typecheck` 和 `lint`。**没有测试,也没有 CI**,不要新增测试文件或工作流配置。

## 技术栈

React + TS(strict) / Vite / pnpm / TanStack Router(文件式) / Tailwind v4 / shadcn-ui(Base UI 基座) / TanStack Table / TanStack Query / axios / Zustand / Zod / React Hook Form + zodResolver / date-fns v4 / lucide-react

不引入表格、表单、UI 库的替代品。加任何依赖前先问。

## 分层

```
app/        装配:入口、Provider、角色注册表、启动引导
routes/     路由文件,只做装配
layouts/    布局,按形态划分(top-nav / sidebar)+ user-area
features/   业务功能,垂直切分
shared/     通用能力,不含业务概念
styles/     全局样式与 token
```

依赖方向单向向下。`app/` 与 `routes/` 是唯一能看到所有下层的地方。

## 不可违反的约定

**布局按形态划分,不按角色。** 布局内部不出现任何角色判断,导航项由注册表传入。角色通过 `app/roles.ts` 选择布局。

**`features/*` 之间禁止互相 import。** 需要共享就下沉 `shared/`。外部只能从 feature 的 `index.ts` 引入,不深入内部文件。

**路由文件只做装配**:声明路径、挂布局、渲染 feature 导出的页面。业务逻辑一律在 `features/`。

**`shared/` 里不出现业务概念。** 判断标准:换个项目能否直接用。

**服务端数据只走 TanStack Query。** 不用 `useEffect` 拉数据,不存进 `useState`。Zustand 只放外壳级 UI 状态(主题、侧栏折叠)。

**接口响应必须过 Zod。** 类型用 `z.infer` 推导,不手写第二份。

**组件只引用语义 token。** 不写色值字面量,不加 `dark:` 变体(暗色靠变量覆盖)。

## TypeScript

禁止 `any`、`as` 绕错、`!` 非空断言、`@ts-ignore`。必须绕过时用 `@ts-expect-error` 并注明原因。

对象形状用 `interface`,联合与工具类型用 `type`。类型不加 `I`/`T` 前缀。组件 props 就近定义,不集中放 `types.ts`。

## React

只写函数组件。一文件一组件。超 150 行考虑拆,超 250 行必须拆。

不做没有实测依据的 `memo` / `useMemo` / `useCallback`。

列表 `key` 用稳定标识,不用索引。

依赖数组不允许省略成员来避免重复执行。

## 样式

一律 Tailwind 工具类,不写 CSS 文件,不用内联 `style`(动态计算值除外)。条件类名用 `cn()`。类名顺序交给 Prettier 插件。

## 错误处理

请求层统一处理:401 拦截跳登录、错误归三类(认证失效 / 业务错误 / 系统错误)。组件不写 `try/catch` 包请求,通过 Query 的 `error` 状态处理。

**HTTP 客户端用 axios,不用 `fetch`。** 业务代码也不直接调 axios,只走 `shared/api/` 导出的 `request` 与 `uploadFile`。

每个数据区域都要有 loading 与 error 态,不允许静默失败。用 `shared/ui/` 里的骨架屏、空态、错误态组件,不各自发挥。

## 注释

解释**为什么**,不解释代码在做什么。不写文件头注释块。不留被注释掉的旧代码。不写 JSDoc 除非签名不自明且多处调用。

## 部署约束

内网部署,无外网访问。

**不引入任何外部域名请求**——CDN、字体、埋点一律禁止。加依赖时留意它是否偷偷请求外部资源。

支持子路径部署:不写硬编码绝对路径,静态资源用 import 引入。Router basepath 与 Vite base 保持一致。

现代浏览器基线,不做 polyfill 和降级。

## 状态

脚手架与外壳层已就绪:请求层、角色分发、两种布局、主题、认证 feature、三个角色的路由骨架都能跑通。上面的命令全部可用。

各角色页面目前是占位内容,等下游项目按 `docs/08-template-usage.md` 填充。

## 后端对接

真实后端,**不用 mock**。开发地址 `http://main.uniplt.tclocal.ugion.com`,通过 Vite 代理转发 `/api`(需 `changeOrigin` 与 `cookieDomainRewrite`,否则 cookie 丢失)。

响应统一包装 `{ code, message, data, success }`。请求层解包后业务只见 `data`,Zod schema 只描述 `data`。

**业务错误走 HTTP 200 + `success: false`**,不能只看状态码。错误文案直接用 `message`,后端无错误码分段。

认证失效是 HTTP 401,请求层拦截跳登录。凭证是 httpOnly cookie,`LoginResult` 里的 `token` 与 `sessionId` 一律不用。**401 之外的 4xx 归系统错误**,和 5xx 一样走通用文案,不要因为没单独列出就漏掉分支。重试只给 5xx 与网络错误,1 次。

请求体统一 JSON(后端也收表单编码,但只用一种)。文件上传除外,用 `FormData`。

登录成功后不用 `LoginResult` 里的用户信息,重新请求 `GET /api/auth/me`——前者缺 `avatar` 和 `phone`,且两个来源会让用户数据出现两份。

**不照搬后端的类型名和字段名。** 前端自己命名,在 feature 的 `api.ts` 里用 Zod `transform` 做映射,出了这个文件不出现后端原始字段名。禁止 `Result` / `VO` / `DTO` / `Response` 后缀;入参类型用 `Input` 后缀;函数按行为命名(`fetchCurrentUser`,不是 `getAuthMe`)。后端大写枚举在前端统一转小写,发送时转回。

角色:后端 `ADMIN` / `TEACHER` / `STUDENT`,前端 `admin` / `teacher` / `student`,单角色。角色标识集合与 `Role` 类型放 `shared/types/`(请求层校验要用,不能放 `app/roles.ts`,否则 feature 向上依赖装配层);角色元信息放 `app/roles.ts`。`Role` 不手写字面量联合,从集合推导。

环境变量只有两个:`VITE_API_PROXY_TARGET`(仅开发,只被 `vite.config.ts` 读)、`VITE_BASE_PATH`(仅构建,同时喂 Vite `base` 与 Router `basepath`,只配一处会导致资源或路由其中之一 404)。生产同域,应用代码里不存在"后端地址",请求一律相对路径 `/api/...`。

头像字段后端叫 `avatar`(fileId),前端叫 `avatarFileId`,地址用 `fileUrl(fileId)` 拼 `/api/file/{fileId}`,无需认证,直接 `<img src>`。

`docs/06-api-contract.md` 有完整的认证接口清单与命名约定。业务接口以实际文档为准,不要编造接口形状。
