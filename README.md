# Mercury - Markdown to PDF

基于 Cloudflare Workers 的 Markdown 渲染和 PDF 导出工具。

## 功能特性

- 实时 Markdown 渲染预览
- 一键 PDF 导出（浏览器原生打印）
- 响应式设计，支持移动端
- 客户端 PDF 生成，无需服务器资源
- 安全的 XSS 防护（服务器 + 客户端双重过滤）
- 速率限制（100 次/分钟/IP）

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 本地开发

```bash
npm run dev
```

访问 http://localhost:8787

### 3. 部署到 Cloudflare

```bash
npm run deploy
```

## 使用方法

1. 访问 Worker URL
2. 在左侧编辑器输入 Markdown
3. 右侧实时预览渲染效果
4. 点击"Export PDF"按钮
5. 在打印对话框中选择"另存为 PDF"

## API 接口

### 渲染 Markdown

```bash
POST /api/render
Content-Type: application/json

{
  "markdown": "# Hello World"
}
```

响应:

```json
{
  "html": "<h1>Hello World</h1>",
  "success": true,
  "renderTime": "23ms"
}
```

### 健康检查

```bash
GET /api/health
```

### 使用统计

```bash
GET /api/metrics
```

### 分享预览

```
/view/{base64_encoded_markdown}
```

## 技术栈

- Cloudflare Workers
- TypeScript
- marked.js（Markdown 渲染）
- DOMPurify（XSS 防护）
- 浏览器原生打印 API（PDF 生成）

## PDF 导出说明

使用浏览器原生打印功能，无需第三方库:
- 点击"Export PDF"打开新窗口
- 新窗口包含白底黑字的纯净 HTML
- 浏览器打印对话框中选择"另存为 PDF"
- 支持 A4/Letter 等纸张大小设置
