---
name: replace-emoji-with-icons
description: 将Vue组件中的emoji图标替换为实际的PNG/SVG图片文件
source: auto-skill
extracted_at: '2026-06-11T17:06:23.516Z'
---

# 替换emoji图标为实际图片

## 场景
当需要将Vue项目中的emoji图标替换为自定义的PNG/SVG图片时使用此技能。

## 步骤

### 1. 准备图片文件
- 将图片文件放在`src/assets/`目录下
- 确保文件名有意义，如`记事本.png`、`待办.png`、`设置.png`

### 2. 识别需要替换的位置
- 搜索项目中的emoji字符（📝、✅、⚙️等）
- 检查底部导航栏、空状态提示、按钮图标等位置

### 3. 修改Vue组件

#### 3.1 导入图片
在`<script setup>`中导入图片文件：
```javascript
import notesIcon from '@/assets/记事本.png'
```

#### 3.2 修改数据结构
将图标从字符串改为导入的变量：
```javascript
const tabs = [
  { id: 'notes', label: '记事', icon: notesIcon },
  // ...
]
```

#### 3.3 更新模板
将文本图标替换为img标签：
```html
<div class="tab-icon">
  <img :src="tab.icon" :alt="tab.label" />
</div>
```

### 4. 调整CSS样式

#### 4.1 移除文本相关样式
删除`font-size`等文本样式属性。

#### 4.2 添加图片样式
```css
.tab-icon img {
  width: 24px;
  height: 24px;
  object-fit: contain;
}
```

### 5. 测试与验证
- 运行`npm run lint`检查代码质量
- 启动开发服务器`npm run dev`验证显示效果
- 检查不同屏幕尺寸下的显示效果

## 注意事项
- 使用`@/`别名导入资源，确保路径正确
- 设置合适的图片尺寸（导航栏图标通常24-32px，空状态图标64px左右）
- 使用`object-fit: contain`保持图片比例
- 添加`alt`属性提高可访问性

## 示例
```vue
<script setup>
import notesIcon from '@/assets/记事本.png'
import todosIcon from '@/assets/待办.png'
</script>

<template>
  <div class="tab-bar">
    <div v-for="tab in tabs" :key="tab.id" class="tab-item">
      <div class="tab-icon">
        <img :src="tab.icon" :alt="tab.label" />
      </div>
      <div class="tab-label">{{ tab.label }}</div>
    </div>
  </div>
</template>

<style scoped>
.tab-icon img {
  width: 24px;
  height: 24px;
  object-fit: contain;
}
</style>
```