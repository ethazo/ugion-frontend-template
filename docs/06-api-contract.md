# 数据层与接口约定

对接的是真实后端,**不使用 mock 数据**。

## 后端基础信息

| 项           | 值                                                 |
| ------------ | -------------------------------------------------- |
| 接口前缀     | `/api`                                             |
| 开发环境后端 | `http://main.uniplt.tclocal.ugion.com`             |
| 认证方式     | httpOnly cookie,前端不持有也不读取凭证             |
| 响应包装     | `{ code, message, data, success }`                 |
| 角色取值     | `ADMIN` / `TEACHER` / `STUDENT`(单角色,大写字符串) |

## 请求层

HTTP 客户端用 axios,统一封装在 `shared/api/`。业务代码不直接调 axios,也不用 `fetch`。

选 axios 而不是 `fetch` 的原因:401 收口写成响应拦截器就够,不必让每个调用点都记得判断;上传进度 `fetch` 拿不到,自己包一层 XHR 只是重写一遍 axios。

封装承担五件事:

1. 拼接 `/api` 前缀(生产同域,相对路径,支持子路径部署)
2. 带上凭证 —— 实例配 `withCredentials: true`
3. 解开响应包装 —— 校验 `success`,把 `data` 交给上层
4. 统一错误转换 —— 一律转成 `ApiError`,带上 `status` 与后端 `code`
5. 超时 —— 全局 15s,上传单独放宽

### 响应解包

后端所有接口都用同一层包装,`code: 0` 且 `success: true` 表示成功:

```
{ code, message, data, success }  →  请求层校验  →  data
```

业务代码只见到 `data`,不感知包装层。因此 Zod schema 只描述 `data` 的形状,包装层由请求层统一用一个 schema 处理。

### 错误模型

只有一个错误类型 `ApiError`,携带两个事实,不携带分类:

| 字段     | 含义                                                            |
| -------- | --------------------------------------------------------------- |
| `status` | HTTP 状态码;`null` 表示没拿到响应(网络中断、超时、Zod 校验失败) |
| `code`   | 后端包装里的 `code`;`null` 表示这次响应不是包装结构             |

不存 `kind` 之类的预判分类,也不存 `isRetryable`:分类是各处自己的策略,让传输层提前替它们决定,会导致「重试函数假装在判断、其实只是读一个被塞进来的标记」。三个判断点各自从事实推:

| 判断     | 依据                          | 实现                      |
| -------- | ----------------------------- | ------------------------- |
| 认证失效 | `status === 401`              | `isAuthError(error)`      |
| 该重试   | `status === null \|\| >= 500` | `retryApiError`,最多 1 次 |
| 展示文案 | 见下                          | `errorMessage(error)`     |

**展示文案的规则是「message 是否来自后端包装,且不是服务端故障」**,即 `code !== null && !(status === null || status >= 500)`:

- 后端**任何**状态码都可能带包装。实测登录失败是 `HTTP 400` + `{"code":1,"message":"用户名或密码错误","success":false}`,未登录是 `HTTP 401` + 同样的结构。所以只在 200 分支拆包装会把后端认真写的提示全部丢掉,用户看到的是无意义的通用文案。
- 4xx 是「请求得不对,我告诉你哪不对」,`message` 是写给用户的,直接展示。
- 5xx 和无响应是「后端坏了」,`message` 常常是 `NullPointerException` 或 SQL 片段,一律换通用文案。
- 非包装响应(网关错误页、Zod 校验失败)`code` 为 `null`,同样走通用文案。

Zod 校验失败刻意归到 `status === null`:它天然不重试(重试一百次结果一样),也天然不会把后端那句「操作成功」当成错误文案展示。开发环境会打出 `z.treeifyError` 的字段差异——真实后端、无 mock,接口变动是开发期最高频的失败。

也不要只看状态码判断成败:`success: false` 也可能出现在 HTTP 200 上,拦截器两个分支都校验包装,业务代码不必关心这次失败走的是哪条路。

### 请求体格式

后端的登录类接口同时接受 `application/json` 和表单编码。前端**统一用 JSON**,不用表单编码——一种格式少一处分歧,且 Zod 的输入形状能直接对应。

文件上传是唯一例外,用 `FormData`,走 `api.upload`。它和 `api.post` 的唯一区别是关掉超时——axios 认出 `FormData` 会原样发送,`Content-Type` 与 boundary 交给浏览器,不需要手动设置。表单字段名属于接口细节,在 feature 的 `api.ts` 里拼,不进 `shared/`。

## 命名与领域模型

**不照搬后端的类型名与字段名。** 后端文档里的命名带着传输层和框架的痕迹(`ApiResultXxx`、`Result`、`Request`、`Simple` 前缀),这些概念不该进入前端的领域模型。前端自己定义一套命名,在边界处做映射。

### 类型命名

| 规则                                   | 说明                                                 |
| -------------------------------------- | ---------------------------------------------------- |
| 领域类型用领域名词                     | `CurrentUser`,不是 `SimpleUserInfo`                  |
| 不用传输层后缀                         | 禁止 `Result` / `VO` / `DTO` / `Response` / `Entity` |
| 请求入参用 `Input` 后缀                | `PasswordLoginInput`、`SendCodeInput`                |
| 不用 `Simple` / `Basic` 这类模糊限定词 | 确实存在两种粒度时用 `XxxSummary` 与 `Xxx`           |
| 包装层只有一个泛型类型                 | `ApiEnvelope<T>`,只在请求层出现,业务代码不引用       |

### 函数命名

按**做什么**命名,不按 URL 结构命名:

```
fetchCurrentUser()      不是 getAuthMe()
loginWithPassword()     不是 postAuthLogin()
loginWithSms()
requestSmsCode()        不是 postSendCode()
logout()
```

读取用 `fetch` 前缀,写入用动词原形。函数名里不出现 HTTP 方法。这里的 `fetch` 是命名约定,和 HTTP 客户端选型无关。

### 字段命名

多数字段直接沿用后端的 camelCase 名字。**只在后端名字有误导性时重命名**,并且必须在 schema 的转换里完成:

| 后端             | 前端            | 理由                                  |
| ---------------- | --------------- | ------------------------------------- |
| `avatar`(fileId) | `avatarFileId`  | 原名暗示是图片地址,实际是 ID,极易误用 |
| `realName`       | `fullName`      | 与 `username` 的区别更清楚            |
| `role`: `ADMIN`  | `role`: `admin` | 见下                                  |

不为了风格统一而重命名。改一个字段名的代价是排查问题时没法在前后端之间直接搜同一个词,只有当原名会导致误用时才值得付这个代价。

### 枚举取值

后端用大写(`ADMIN`、`LOGIN`),前端统一转小写:

- 角色标识会进路由路径(`/admin`、`/teacher`、`/student`)和注册表 key,小写更自然
- 避免同一概念在代码里出现两种大小写形式

转换双向进行:响应解析时转小写,请求发送时转回大写。这两个方向都写在同一个 schema 文件里,不散落。

### 映射位置

所有映射集中在 feature 的 `api.ts`,用 Zod 的 `transform` 一次完成:

```
wire schema(描述后端实际形状) → transform → 领域类型
```

出了这个文件,代码里不应该再出现后端的原始字段名。这样后端改字段时只有一处要动。

## 边界校验

**所有接口响应在进入应用前用 Zod 校验。** 理由不是不信任后端,而是前后端各一个人、接口会持续变化,校验失败时能立刻定位到是哪个字段变了,而不是在某个组件里报 `undefined`。

```
接口响应 → Zod parse → 类型安全的数据 → Query 缓存 → 组件
```

schema 定义在 feature 的 `api.ts` 里,类型用 `z.infer` 从 schema 推导,不手写第二份。

校验失败按系统错误处理,并在开发环境打印详细差异。

## TanStack Query

### 职责边界

所有服务端数据走 Query,不用 `useEffect` 拉数据,不把响应存进 `useState`。

### query key 约定

按 feature 分组,层级从粗到细:

```ts
;[
  'courses',
] // 该 feature 全部
[
  ('courses', 'list', filters)
] // 列表 + 筛选条件
[('courses', 'detail', id)] // 单条
```

每个 feature 在 `api.ts` 里导出自己的 key 工厂函数,不在组件里手拼数组字符串。

### 缓存策略

`staleTime` 按数据变化频率分档,在 Provider 里设默认值,各 query 按需覆盖:

- 几乎不变的(角色元信息、字典) —— 较长
- 常规业务数据 —— 中等
- 强实时性数据 —— 0

内网环境网络稳定,不需要激进的重试。重试策略按上面错误分类表的最后一列:只有 5xx 与网络类错误重试 1 次,认证失效、业务错误、其余 4xx 都不重试(重试它们只是重复失败)。

### 变更与失效

写操作用 `useMutation`,成功后按 key 前缀失效相关查询,不手动改缓存,除非有明确的体验理由做乐观更新。

## 认证与会话

### 当前用户

单一来源:启动时请求当前用户接口,结果进 Query 缓存,全应用共用同一份。

- 未登录(401)→ 跳登录页
- 已登录 → 拿到用户信息与角色,按角色注册表分发

不把用户信息复制到 Zustand 或 localStorage。cookie 认证下前端不持有凭证,用户信息也不该有第二份副本。

### 会话失效

会话可能在使用中途过期。任何请求返回 401 都由请求层统一处理:清理 Query 缓存、跳登录页。业务代码不需要各自防御。

登录成功后重新请求当前用户,拿到角色再跳转到其落地路径。

### 认证接口

| 接口                  | 方法 | 入参                                     | 返回 `data`     |
| --------------------- | ---- | ---------------------------------------- | --------------- |
| `/api/auth/login`     | POST | `username`, `password`                   | LoginResult     |
| `/api/auth/sms-login` | POST | `phone`, `code`, `sendToken?`            | LoginResult     |
| `/api/auth/send-code` | POST | `phone`, `scene`(`LOGIN` / `BIND_PHONE`) | `{ sendToken }` |
| `/api/auth/logout`    | POST | 无                                       | 无              |
| `/api/auth/me`        | GET  | 无                                       | SimpleUserInfo  |

上表右列是后端的类型名,仅用于对照文档。前端对应的领域类型:

```
CurrentUser {
  id: number
  username: string
  fullName: string             // 后端 realName
  role: Role                   // 后端大写,见下
  avatarFileId: string | null  // 后端 avatar
  phone: string
}
```

`Role` 不在这里手写成 `'admin' | 'teacher' | 'student'`,而是从 `shared/types/` 的角色标识集合推导。Zod 校验用的 enum 也建在同一个集合上,理由和位置见 `02-architecture.md` 的「角色标识放哪」。

后端 `LoginResult` 另有 `token` 与 `sessionId` 两个字段,**都不使用**——凭证由 httpOnly cookie 承载,前端不碰。登录成功后不读取 `LoginResult` 里的用户信息,而是重新请求 `/api/auth/me` 取单一来源,避免两套用户数据。

短信登录流程分两步:先 `send-code` 拿到 `sendToken`,再连同验证码提交给 `sms-login`。`sendToken` 只在这一次流程内有效,存在表单状态里,不进全局。

### 头像

`avatarFileId` 是文件 ID,不是 URL。图片地址拼 `/api/file/{avatarFileId}`。

该接口标注「公开文件无需认证」,所以头像直接用 `<img src>` 即可,不需要走请求层带凭证。拼接逻辑收在 `shared/lib/fileUrl.ts` 的 `fileUrl(fileId)` 里,不在组件里散落字符串模板。这个函数还要负责带上部署 base 路径,子路径部署时才不会 404。

该字段可能为空,用户区要有首字母占位的兜底。

一处类型上的不一致:后端 `avatar` 是字符串,而文件接口的路径参数标注为 int64。前端按字符串原样透传,不做数值转换——转换只会在遇到非数字 ID 时炸掉,而拼 URL 本来不需要知道它是不是数字。

## 分页与筛选

管理端会有列表场景,约定统一:

- 后端各列表接口的分页字段以对接时的实际接口为准,请求层做一次适配,业务代码用统一形状
- 筛选条件进 URL query,刷新和分享链接后状态不丢。TanStack Router 的 search params 有类型校验,用它而不是手动解析
- 表格用 TanStack Table,服务端分页时把分页与排序状态交给 URL,不放组件内 state

## 文件上传

医学场景可能涉及影像和媒体文件,体积较大。约定:

- 上传走独立的请求函数,不复用 JSON 请求封装
- 必须有进度反馈
- 大文件的分片与断点续传等后端支持确认后再定
