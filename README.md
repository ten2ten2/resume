# GitHub Pages + Playwright PDF 自动生成

仓库需要包含：

- `index.html`
- `scripts/generate-pdf.mjs`
- `.github/workflows/pages.yml`

工作流每次 push 到 `main` 时会：

1. 安装 Noto CJK 中文字体和 Chromium。
2. 用 Playwright 按 `index.html` 的 `@media print` 样式生成 `Pang_Tianyu_Resume.pdf`。
3. 校验 PDF 必须恰好 1 页且为 A4，否则构建失败，不会发布排版错误的 PDF。
4. 将 HTML + PDF 一起部署到 GitHub Pages。

## GitHub 设置

在仓库 `Settings -> Pages` 中，将 **Build and deployment / Source** 改为 **GitHub Actions**。

Custom domain 继续使用：

`www.tenten.moe`

现有 Name.com DNS 无需修改。

## 微信行为

- 微信内置浏览器：按钮显示 `查看 PDF`，直接打开构建好的 `Pang_Tianyu_Resume.pdf`。
- Chrome / Safari / Edge：按钮保持 `生成 / 保存 PDF`，调用浏览器原生打印。
