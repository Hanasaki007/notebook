import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  publicPath: './',
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  // HBuilderX兼容性配置
  build: {
    // 设置为相对路径，便于HBuilderX打包
    base: './',
    // 输出目录
    outDir: 'dist',
    // 资源文件输出目录
    assetsDir: 'assets',
    // 启用CSS代码分割
    cssCodeSplit: true,
    // 生成source map
    sourcemap: false,
    // 压缩配置
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },
  // 开发服务器配置
  server: {
    port: 5173,
    host: true
  },
  // 预览服务器配置
  preview: {
    port: 4173,
    host: true
  }
})
