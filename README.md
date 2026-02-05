# Markdown to PDF Worker

基于 Cloudflare Workers 的 Markdown 渲染和 PDF 导出工具。

## 功能特性

- 实时 Markdown 渲染预览
- 一键 PDF 导出（使用 html2pdf.js）
- 响应式设计
- 客户端生成 PDF，无需服务器资源

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 本地开发

```bash
npm run dev
```

### 3. 部署到 Cloudflare

```bash
npm run deploy
```

## 使用方法

1. 访问 Worker URL
2. 在左侧编辑器输入 Markdown
3. 右侧实时预览渲染效果
4. 点击"下载 PDF"按钮导出

## API 接口

### 渲染 Markdown

```bash
POST /api/render
Content-Type: application/json

{
  "markdown": "# Hello World"
}
```

### 预览 Markdown

```
/view/{encoded_markdown}
```

## 技术栈

- Cloudflare Workers
- TypeScript
- marked.js（Markdown 渲染）
- html2pdf.js（PDF 生成）
