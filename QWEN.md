# QWEN.md — 柚子便签 (Yuzu Notebook)

## 项目概述

**柚子便签** 是一款温暖亲切的记事本/待办事项应用，使用 Vue 3 Composition API 开发，可通过 HBuilderX 打包为安卓 APK。应用采用温暖的橙色系手绘风格，模拟真实便签本质感，完全离线可用（IndexedDB 本地存储）。

### 核心功能

- **记事**：创建、编辑、删除记事，支持图片附件，批量删除
- **待办事项**：创建待办，设置截止时间
- **设置**：自定义用户名、头像，深色模式支持
- **离线存储**：IndexedDB（Dexie.js），无需网络

---

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端框架 | Vue 3 + Composition API (`<script setup>`) |
| 构建工具 | Vite 8 |
| 路由 | Vue Router 5（Hash 模式） |
| 状态管理 | Pinia 3 |
| 本地存储 | Dexie.js 4（IndexedDB） |
| 样式 | CSS 变量 + Scoped CSS |
| Linter | ESLint + OxLint（双引擎） |
| 打包部署 | HBuilderX 云打包（Android APK） |

---

## 构建与运行

```bash
# 安装依赖
npm install

# 启动开发服务器（端口 5173）
npm run dev

# 构建生产版本（输出到 dist/）
npm run build

# 预览生产构建（端口 4173）
npm run preview

# Lint 检查并自动修复（依次运行 oxlint 和 eslint）
npm run lint
```

### 打包 Android APK

1. 安装 HBuilderX，注册 DCloud 账号
2. 在 HBuilderX 中导入项目根目录
3. 在 `manifest.json` 中配置应用信息（appid 等）
4. 执行 `npm run build` 构建生产版本
5. 选择「发行」→「原生App-云打包」→ 选择 Android 平台
6. 配置签名证书（可用默认测试证书），点击打包
7. 等待完成，下载 APK

---

## 项目结构

```
notebook/
├── index.html                # 入口 HTML
├── package.json              # 项目依赖与脚本
├── vite.config.js            # Vite 构建配置（@ → src 别名）
├── manifest.json             # HBuilderX 项目配置（appid、打包信息）
├── uni.scss                  # 全局 SCSS 变量
├── eslint.config.js          # ESLint 配置（flat config）
├── .oxlintrc.json            # OxLint 配置
├── .impeccable.md            # 设计上下文文档
├── public/                   # 静态资源（不经过构建处理）
├── src/
│   ├── main.js               # 入口文件（创建 App、挂载 Pinia + Router）
│   ├── App.vue               # 根组件（路由视图 + TabBar）
│   ├── components/
│   │   └── TabBar.vue        # 底部导航栏（记事/待办/设置）
│   ├── pages/
│   │   ├── Notes.vue         # 记事列表页
│   │   ├── NewNote.vue       # 新建记事
│   │   ├── EditNote.vue      # 编辑记事
│   │   ├── Todos.vue         # 待办列表页
│   │   ├── NewTodo.vue       # 新建待办
│   │   └── Settings.vue      # 设置页
│   ├── router/
│   │   └── index.js          # 路由定义（Hash 模式）
│   ├── db/
│   │   └── index.js          # Dexie.js 数据库（notes/todos/settings 表）
│   ├── stores/               # Pinia 状态管理
│   └── styles/
│       └── global.css        # 全局样式 + CSS 变量
```

---

## 开发规范

### 代码风格

- **Vue 组件**：统一使用 `<script setup>` 语法，单文件组件（SFC）
- **JavaScript**：ES Module（`"type": "module"`），不使用 TypeScript
- **CSS**：组件级使用 `<style scoped>`，全局变量定义在 `global.css` 的 `:root` 中
- **路径别名**：`@` 指向 `src/` 目录

### Lint 双引擎

项目同时使用 **OxLint**（Rust 实现，快速）和 **ESLint**（规则更全），通过 `npm-run-all2` 依次执行：

- `npm run lint:oxlint` → OxLint 快速检查
- `npm run lint:eslint` → ESLint 深度检查（含 Vue 插件）

### 数据库设计

Dexie.js 管理三个 IndexedDB 表：

| 表名 | 索引字段 | 说明 |
|------|----------|------|
| `notes` | `++id, title, content, createdAt, updatedAt` | 记事 |
| `todos` | `++id, text, dueDate, completed, createdAt` | 待办 |
| `settings` | `id, username, avatar` | 用户设置（单记录） |

数据库名称：`YuzuNotebook`，当前版本：v2。

### 路由设计

- 使用 **Hash 模式**（`createWebHashHistory`），兼容 HBuilderX 打包
- 根路径 `/` 重定向至 `/notes`
- 新建/编辑页面不显示底部 TabBar（在 `App.vue` 中通过路径判断控制）

### 样式约定

- 主色调：橙色系 `#ff9a56`，通过 CSS 变量 `--primary-color` 引用
- 卡片圆角：`12px`，阴影使用分层变量（`--shadow-sm/md/lg`）
- 字体栈：系统字体优先（`-apple-system, BlinkMacSystemFont, 'Segoe UI', ...`）
- 滚动条样式已全局自定义（WebKit）

### 平台兼容

- `manifest.json` 配置了 Android 权限（INTERNET、存储读写）
- Vite 构建使用相对路径 `base: './'`，确保 HBuilderX 兼容
- 生产构建启用 Terser 压缩，移除 `console` 和 `debugger`
- 目标 Node 版本：`^20.19.0 || >=22.12.0`

---

## 设计理念

应用采用温暖亲切的手绘风格，模拟真实便签本质感：

- 柔和橙色系主色调，暖色背景（`#fffbf7`）
- 圆角卡片设计，悬浮微交互
- 简洁交互逻辑，减少认知负担
- 底部三栏导航：📝 记事 / ✅ 待办 / ⚙️ 设置
