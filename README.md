## Ugion 前端模板（React + TypeScript + Vite）

一个基于 **React 19 + TypeScript + Vite 7** 的前端项目模板，内置 **路由、状态管理、请求封装、表单校验、样式体系** 以及 **完整的工程化规范**，开箱即可用于中后台 / 管理后台等项目。

### 功能特点

- **现代技术栈**
  - React 19、TypeScript
  - Vite 7 构建，`@vitejs/plugin-react-swc` + HMR
  - Tailwind CSS 4（通过 `@tailwindcss/vite`）
- **路由 & 页面组织**
  - 使用 `@tanstack/react-router`，支持路由文件自动生成（`routeTree.gen.ts`）
  - 通过 `src/routes` + `src/features/**/pages` 组织页面
  - 支持认证路由（如 `_authenticated`、`(auth)` 路由分组）
- **数据 & 状态**
  - `@tanstack/react-query` 统一管理服务端数据（含 Devtools）
  - `zustand` 管理全局业务状态（如认证状态）
  - `axios` 二次封装（`src/lib/axios.ts`）+ 统一 API 前缀代理
- **表单 & 校验**
  - `react-hook-form` + `zod` + `@hookform/resolvers`
  - 典型示例：`LoginPage` 登录表单（`src/features/auth/pages/login-page.tsx`）
- **样式体系**
  - Tailwind CSS 4
  - `tailwind-merge` 用于合并 / 去重类名
  - 全局样式与滚动条样式：`src/styles/index.css`、`src/styles/scrollbar.css`
- **工程化 / 代码质量**
  - ESLint 9 + `typescript-eslint` + `@tanstack/eslint-plugin-query` + React Hooks / Refresh 规则
  - Prettier + `prettier-plugin-tailwindcss`
  - `simple-import-sort` 统一 import 顺序
  - `husky` + `lint-staged` + `commitlint`（约束提交信息）

---

## 目录结构约定

> 仅列出与业务和架构相关的主要目录，方便快速上手。

```bash
src
├── app
│   ├── router.tsx           # 全局路由配置（@tanstack/react-router）
│   └── providers.tsx        # 应用级 Provider（React Query 等）
├── features
│   ├── auth                 # 认证相关模块
│   │   ├── api              # 接口调用（如 login.api.ts）
│   │   ├── hooks            # 业务 hooks（如 use-login.ts）
│   │   ├── pages            # 页面组件（如 login-page.tsx）
│   │   ├── schemas          # zod 校验 schema（如 login.schema.ts）
│   │   └── store            # 认证状态（如 auth.store.ts）
│   └── dashboard            # 业务模块示例（如仪表盘）
├── hooks                    # 与具体业务弱相关的通用 hooks
├── lib
│   ├── axios.ts             # axios 实例封装
│   ├── query-client.ts      # React Query 客户端
│   └── utils.ts             # 通用工具方法
├── routes                   # TanStack Router 路由文件
│   ├── __root.tsx
│   ├── (auth)/login.tsx     # 匹配认证相关路由分组
│   └── _authenticated/...   # 需登录访问的路由
├── styles                   # 全局样式
├── main.tsx                 # 应用入口（挂载 ReactRoot）
└── routeTree.gen.ts         # 路由插件自动生成的文件（勿手动修改）
```

---

## 命名规范与代码组织

- **Feature-First 组织方式**
  - 业务按功能模块划分在 `src/features/*` 下，如 `auth`、`dashboard`、`user` 等。
  - 每个模块内部再按 `api` / `hooks` / `pages` / `schemas` / `store` / `types` 分层。
- **文件 / 命名约定**
  - **页面组件**：`xxx-page.tsx`（如 `login-page.tsx`，导出 `LoginPage` 组件）。
  - **路由文件**：位于 `src/routes` 下，使用 TanStack Router 的约定式命名（如 `(auth)/login.tsx`、`_authenticated/dashboard.tsx`）。
  - **Hook**：小写 + 中划线文件名，如 `use-login.ts`，导出 `useLogin`。
  - **Zod Schema**：`xxx.schema.ts`，导出 `xxxSchema` 与类型别名 `XxxFormValues` 等。
  - **状态 Store**：`xxx.store.ts`，导出 `useXxxStore` 等。
  - **类型定义**：`types.ts` 中定义当前 feature 相关的 TypeScript 类型。
- **路径别名**
  - 通过 Vite `resolve.alias` 配置 `@`，统一以 `@/` 作为 `src` 根路径别名（如 `@/app/router`、`@/lib/axios`）。

---

## 快速开始

### 环境要求

- Node.js ≥ 18（推荐使用 `nvm` / `nvs` 管理多版本）
- 包管理工具：npm / pnpm / yarn（三选一，本仓库默认使用 npm）

### 安装依赖

```bash
npm install
```

### 本地开发

```bash
npm run dev
```

默认监听 `0.0.0.0:8848`，浏览器会自动打开；如需修改端口 / host，可在 `vite.config.ts` 中调整 `server` 配置。

### 构建生产包

```bash
npm run build
```

### 预览构建结果

```bash
npm run preview
```

### 代码检查

```bash
npm run lint
```

---

## 环境变量 & 代理配置

项目使用 Vite 环境变量和代理功能来处理后端请求：

- `VITE_API_BASE_URL`：前端请求使用的 API 前缀（例如 `/api`）
- `VITE_PROXY_URL`：开发环境下的真实后端地址（例如 `https://api.example.com`）

在 `vite.config.ts` 中，基于上述变量配置了代理：

- 所有以 `VITE_API_BASE_URL` 开头的请求，都会被代理到 `VITE_PROXY_URL`，并自动去除前缀。

请在项目根目录创建 `.env` 文件，并按需填写：

```bash
VITE_API_BASE_URL=/api
VITE_PROXY_URL=https://your-backend-domain.com
```

---

## 提交规范 & 代码风格

- **ESLint**
  - 使用官方 `@eslint/js` + `typescript-eslint` 规则
  - 配合 `@tanstack/eslint-plugin-query`、`eslint-plugin-react-hooks`、`eslint-plugin-react-refresh`、`eslint-plugin-simple-import-sort` 等插件
- **Prettier**
  - 统一代码风格，内置 `prettier-plugin-tailwindcss`，自动排序 Tailwind 类名
- **提交前检查**
  - 使用 `lint-staged` 针对暂存区文件执行：
    - `*.{js,ts,tsx}`：`eslint --fix` + `prettier --write`
    - `*.{json,md,css}`：`prettier --write`
  - `husky` 在 `prepare` 脚本中自动安装 Git hooks
- **提交信息规范**
  - 使用 `@commitlint/cli` + `@commitlint/config-conventional`
  - 推荐使用 Conventional Commits 风格，例如：
    - `feat: 新增用户管理列表`
    - `fix: 修复登录表单校验错误`
    - `chore: 更新依赖版本`

---

## 如何在此模板上扩展

- **新增业务模块**：在 `src/features` 下新增目录，并按 `api/hooks/pages/schemas/store/types` 结构组织。
- **新增页面路由**：在 `src/routes` 下新增约定式路由文件（可参考现有 `(auth)` 和 `_authenticated` 实现）。
- **统一接口封装**：在 `src/lib/axios.ts` 中配置统一拦截器、错误处理等逻辑，再在各 `features/*/api` 中按业务拆分具体请求。
