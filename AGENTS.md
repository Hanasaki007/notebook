# AGENTS.md — 柚子便签 YuzuNotebook

> AI 编码代理协作指南。**通用信息（功能、依赖列表、API）见 [README.md](README.md)；本文档只记录本项目的特殊约定与坑。**

## 当前版本

`v2.3.0`（来源：同步更新 [src/pages/Settings.vue](src/pages/Settings.vue) 的「关于」段落与 [manifest.json](manifest.json) 的 `versionName` / `versionCode`）

## 快速命令

| 命令 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器 (http://localhost:5173) |
| `npm run build` | 构建生产版本到 `dist/` |
| `npm run lint` | 运行 oxlint + eslint 修复（`run-s lint:*`） |
| `npm run preview` | 预览构建结果 (http://localhost:4173) |

## 技术栈要点

- **Vue 3** + Composition API（所有组件使用 `<script setup>`，无 Options API）
- **Vite 8** 构建，路径别名 `@` → `src/`
- **Vue Router 5**（`createWebHashHistory`）
- **Pinia 3**（`stores/counter.js` 仅模板占位，未被使用）
- **Dexie.js** 封装 IndexedDB，数据库定义见 [src/db/index.js](src/db/index.js)

## 主题系统（v2.3 新增）

深色 / 浅色两套主题，通过 `<html data-theme="light|dark">` 切换。

- **存储位置**：`localStorage.theme`（值 `dark` | `light`），**不在 IndexedDB**——为了首屏立即读取避免闪烁
- **应用时机**：[src/main.js](src/main.js) 在 `app.mount()` **之前**读取并设置 `data-theme`，避免 FOUC
- **Design Tokens**：[src/styles/global.css](src/styles/global.css) 的 `:root` 为深色默认；`html[data-theme="light"]` 块覆写所有语义色 token
- **主题专属变量**：`--bg-gradient` 与 `--ambient-overlay` 也参与主题切换，控制 `body` 与 `body::before` 的渐变与氛围光
- **过渡**：`body` / `body::before` 带 `transition: background var(--dur-slow)`，切换有淡入淡出效果

### ⚠️ 已知坑：硬编码深色玻璃色

很多组件的 `<style scoped>` 中**直接写死**了 `rgba(50, 50, 55, 0.72)`、`rgba(40, 40, 50, 0.72)` 等深色玻璃值（如 `.card` / `.pill` / `.tabbar` / `.editor-body` / `.ed-hd__back` / `.field__input` 等）。这些值**不响应 token 变化**，必须在 global.css 的 `html[data-theme="light"]` 块里用更高特异性的选择器覆写（`html[data-theme="light"] .card { ... !important }`）。

> 覆写块集中在 [src/styles/global.css](src/styles/global.css) 末尾的「浅色主题 — 玻璃态类覆盖」段。新增任何带深色玻璃背景的组件类时，**必须**同步在该段添加浅色覆写，否则在浅色模式下会显示为黑底白字（深色玻璃）。

## 代码约定

### 组件

- **页面组件**放在 `src/pages/`，PascalCase 命名（`EditNote.vue`）
- **公共组件**放在 `src/components/`
- 路由 `meta: { hideTabBar: true }` 用于编辑/新建页面（隐藏底部导航）
- 图标全部内联 SVG，**不引入图标库**

### 样式

- **Design Tokens**（颜色、间距、圆角、阴影、动效曲线）集中在 [src/styles/global.css](src/styles/global.css) 的 `:root`
- 间距用 `--sp-*`（8 倍数），圆角用 `--r-*`
- 组件样式用 `<style scoped>`，BEM 命名（`block__element--modifier`）

### 数据层

- 通过 `import { db } from '../db'` 直接操作 Dexie，**不经过 Pinia store**
- 当前 Dexie 版本 v2；修改 schema 必须递增 `db.version(N)`
- 图片以 base64 dataURL 存储在 notes 中
- 主题（localStorage）与用户设置（IndexedDB `settings` 表）**分开存储**——前者用于 UI 状态同步

### 路由

- Hash 模式，根 `/` 重定向 `/notes`
- 编辑路由带参数：`/notes/edit/:id`、`/todos/edit/:id`

### Linting

- ESLint + oxlint 双重检查
- `vue/multi-word-component-names` 已关闭
- 只检查 `*.{vue,js,mjs,jsx}` 文件

## 常用入口文件

- [src/main.js](src/main.js) — 应用入口（注意主题预应用）
- [src/db/index.js](src/db/index.js) — Dexie 数据库与 schema 版本
- [src/router/index.js](src/router/index.js) — 路由表（懒加载）
- [src/styles/global.css](src/styles/global.css) — Design Tokens + 浅色覆写
- [src/pages/Settings.vue](src/pages/Settings.vue) — 主题切换 UI（用户可见的版本号在此）
