# CODEBUDDY.md This file provides guidance to CodeBuddy when working with code in this repository.

## 常用命令

- `npm run dev` — 启动 Vite 开发服务器（端口 5173），支持热更新。
- `npm run build` — 使用 Vite 构建生产版本，输出到 `dist/` 目录，使用 Terser 压缩并移除 console/debugger。
- `npm run preview` — 预览构建产物（端口 4173）。
- `npm run lint` — 运行 oxlint + ESLint 并自动修复（通过 `run-s lint:oxlint lint:eslint` 串行执行）。
- `npm run lint:oxlint` — 仅运行 oxlint 检查并修复。
- `npm run lint:eslint` — 仅运行 ESLint 检查并修复（带缓存）。

## 项目架构

**柚子便签**（YuzuNotebook）是一款基于 Vue 3 的离线笔记与待办应用，数据完全存储在浏览器 IndexedDB 中，无需后端服务。

### 技术栈

- **Vue 3** + Composition API（`<script setup>` 语法）
- **Vue Router 5** — Hash 模式路由
- **Pinia 3** — 状态管理（目前仅含占位 store）
- **Dexie.js 4** — IndexedDB 封装，用于本地数据持久化
- **Vite 8** + `@vitejs/plugin-vue` + `vite-plugin-vue-devtools`
- **ESLint 10** + `eslint-plugin-vue` + oxlint 进行代码检查

### 目录结构

```
src/
├── main.js              # 应用入口，挂载 Vue + Pinia + Router
├── App.vue              # 根组件，包含 TabBar 和 router-view 动画切换
├── db/index.js          # Dexie 数据库定义（表：notes, todos, settings）
├── router/index.js      # 路由配置（7 个路由，含 4 个详情/编辑子路由）
├── stores/counter.js    # Pinia 示例 store（占位）
├── pages/               # 页面组件
│   ├── Notes.vue        # 笔记列表（含批量选择删除）
│   ├── NewNote.vue      # 新建笔记（含图片压缩上传）
│   ├── EditNote.vue     # 编辑笔记
│   ├── Todos.vue        # 待办列表（含完成切换与批量删除）
│   ├── NewTodo.vue      # 新建待办
│   ├── EditTodo.vue     # 编辑待办
│   └── Settings.vue     # 设置（用户名、头像、关于信息）
├── components/
│   └── TabBar.vue       # 底部导航栏（记事/待办/设置三个标签）
├── styles/global.css    # 全局 CSS 变量与样式
├── assets/              # 图标资源（PNG 格式）
└── uni.scss             # uni-app 样式兼容（如需跨端编译）
```

### 数据层（Dexie）

数据库名 `YuzuNotebook`，当前版本 2，包含三张表：

- **notes** — `++id, title, content, createdAt, updatedAt`（内容与图片以 base64 存储）
- **todos** — `++id, text, dueDate, completed, createdAt`
- **settings** — `id=1` 单记录，存 `username` 和 `avatar`（base64）

所有页面组件直接通过 `import { db } from '../db'` 调用 Dexie API 进行 CRUD，未封装 service 层。图片在前端压缩至 800×600 以内后以 base64 存入 IndexedDB。

### 路由设计

路由使用 `createWebHashHistory`，根路径 `/` 重定向到 `/notes`。编辑/新建路由通过 `meta.hideTabBar: true` 隐藏底部导航栏，路由组件均为懒加载。参数化路由 `/:id` 用于编辑页面。

### UI 模式

页面组件采用统一的布局模式：顶部 header（标题 + 操作按钮）→ 内容区 → 底部 batch-actions（批量操作时显示）。TabBar 组件通过 `watch(route.path)` 判断当前激活标签。CSS 使用全局变量（`--bg-primary`, `--primary-color`, `--border-color` 等）定义在 `global.css` 中，支持主题化。页面切换使用 `<transition name="fade">` 动画。

### 构建配置

Vite 配置中 `base: './'` 使用相对路径，便于 HBuilderX 打包。构建启用 CSS 代码分割、Terser 压缩（移除 console/debugger）、关闭 source map。`@` 别名指向 `src/` 目录。

### Node 版本要求

`package.json` engines 字段要求 Node `^20.19.0 || >=22.12.0`。
