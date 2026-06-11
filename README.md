# 柚子便签

一款温暖亲切的记事本应用，使用Vue3开发，支持HBuilderX打包成安卓APK。

## 功能特性

- **记事功能**：支持创建、编辑、删除记事，可添加图片
- **待办事项**：支持创建待办事项，设置截止时间
- **设置**：自定义用户名、头像，支持深色模式
- **离线存储**：使用IndexedDB本地存储，完全离线可用
- **响应式设计**：适配不同屏幕尺寸

## 技术栈

- **前端框架**：Vue 3 + Composition API
- **构建工具**：Vite
- **路由**：Vue Router
- **状态管理**：Pinia
- **本地存储**：Dexie.js (IndexedDB封装)
- **样式**：CSS变量 + 响应式设计

## 开发环境

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
```

## 打包成安卓APK

### 准备工作
1. 安装HBuilderX
2. 注册DCloud账号
3. 准备签名证书（可使用HBuilderX的云打包功能）

### 打包步骤
1. 打开HBuilderX
2. 选择"文件" -> "导入" -> "从本地目录导入"
3. 选择本项目目录
4. 在项目根目录找到`manifest.json`文件，配置应用信息
5. 选择"发行" -> "原生App-云打包"
6. 选择平台（Android）
7. 配置签名证书（可使用默认测试证书）
8. 点击"打包"按钮
9. 等待打包完成，下载APK文件

### 注意事项
- 首次打包可能需要较长时间
- 建议使用云打包功能，无需本地配置安卓开发环境
- 打包前请确保项目已构建（`npm run build`）

## 项目结构

```
notebook/
├── public/              # 静态资源
├── src/
│   ├── components/      # 组件
│   │   └── TabBar.vue   # 底部导航栏组件
│   ├── db/              # 数据库相关
│   │   └── index.js     # IndexedDB配置
│   ├── pages/           # 页面组件
│   │   ├── Notes.vue    # 记事页面
│   │   ├── Todos.vue    # 待办页面
│   │   ├── Settings.vue # 设置页面
│   │   ├── NewNote.vue  # 新建记事
│   │   ├── EditNote.vue # 编辑记事
│   │   └── NewTodo.vue  # 新建待办
│   ├── styles/          # 样式文件
│   │   └── global.css   # 全局样式
│   ├── router/          # 路由配置
│   │   └── index.js     # 路由定义
│   ├── stores/          # Pinia状态管理
│   ├── App.vue          # 根组件
│   └── main.js          # 入口文件
├── .impeccable.md       # 设计上下文
├── manifest.json        # HBuilderX项目配置
├── uni.scss            # 全局样式变量
├── vite.config.js       # Vite配置
└── package.json         # 项目依赖
```

## 设计理念

本应用采用温暖亲切的手绘风格，模拟真实便签本的质感：
- 柔和的橙色系主色调
- 圆角卡片设计
- 简洁的交互逻辑
- 支持深色模式

## 许可证

MIT License