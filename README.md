# 柚子便签 YuzuNotebook

一款简洁大方的离线笔记与待办应用，数据完全存储在浏览器本地，无需后端服务。

## 功能特性

- **笔记管理** — 创建、编辑、删除笔记，支持标题和内容编辑
- **图片附件** — 为笔记添加图片，自动压缩存储，支持预览
- **待办事项** — 创建待办，设置截止日期，标记完成状态
- **批量操作** — 支持多选批量删除笔记和待办
- **个性化设置** — 自定义用户名和头像
- **离线优先** — 所有数据存储在 IndexedDB，无需网络连接
- **响应式设计** — 适配移动端和桌面端浏览器

## 技术栈

- **前端框架** — Vue 3 + Composition API
- **构建工具** — Vite 8
- **路由管理** — Vue Router 5
- **状态管理** — Pinia 3
- **本地存储** — Dexie.js（IndexedDB 封装）
- **代码检查** — ESLint + oxlint

## 快速开始

### 环境要求

- Node.js ^20.19.0 或 >=22.12.0
- npm 或 pnpm

### 安装依赖

```bash
npm install
```

### 开发运行

```bash
npm run dev
```

访问 http://localhost:5173

### 构建生产版本

```bash
npm run build
```

构建产物输出到 `dist/` 目录。

### 预览构建结果

```bash
npm run preview
```

访问 http://localhost:4173

### 代码检查

```bash
npm run lint
```

## 项目结构

```
notebook/
├── src/
│   ├── main.js              # 应用入口
│   ├── App.vue              # 根组件
│   ├── db/index.js          # 数据库配置
│   ├── router/index.js      # 路由配置
│   ├── pages/               # 页面组件
│   │   ├── Notes.vue        # 笔记列表
│   │   ├── NewNote.vue      # 新建笔记
│   │   ├── EditNote.vue     # 编辑笔记
│   │   ├── Todos.vue        # 待办列表
│   │   ├── NewTodo.vue      # 新建待办
│   │   ├── EditTodo.vue     # 编辑待办
│   │   └── Settings.vue     # 设置页面
│   ├── components/          # 公共组件
│   │   └── TabBar.vue       # 底部导航栏
│   ├── styles/              # 样式文件
│   └── assets/              # 静态资源
├── public/                  # 公共静态资源
├── package.json
├── vite.config.js
└── manifest.json            # uni-app 配置（可选）
```

## 数据存储

应用使用浏览器 IndexedDB 存储数据，包含三张表：

- **notes** — 笔记数据（标题、内容、图片、时间戳）
- **todos** — 待办事项（文本、截止日期、完成状态）
- **settings** — 用户设置（用户名、头像）

数据完全在本地处理，不会上传到任何服务器。
