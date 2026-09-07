# GitHub Pages 双语简历 + 自动生成 PDF

## 路由

- `https://www.tenten.moe/` - English（默认）
- `https://www.tenten.moe/zh-hans/` - 简体中文

右上角 `EN / 简中` 可直接在两个静态路由之间切换，不使用 `?lang=` 查询参数。

## 文件结构

- `index.html` - English 默认页面
- `zh-hans/index.html` - 简体中文页面
- `scripts/generate-pdf.mjs` - Playwright 自动生成两份 PDF
- `.github/workflows/pages.yml` - 生成、校验并部署 GitHub Pages

## PDF

每次 push 到 `main` 后自动生成：

- `Pang_Tianyu_Resume_EN.pdf` - English
- `Pang_Tianyu_Resume_ZH.pdf` - 简体中文

不再生成默认语言兼容别名，也不再使用浏览器原生 `window.print()`。

两个语言页面都直接下载对应的预生成 PDF，因此 Chrome、Safari、Edge、微信内置浏览器等使用相同的 PDF 文件和相同的排版结果。

两份 PDF 都会校验：

1. 必须恰好 1 页
2. 必须为 A4
3. 任一版本不满足条件则部署失败

## GitHub Pages

`Settings -> Pages -> Build and deployment -> Source -> GitHub Actions`

Custom domain 继续使用 `www.tenten.moe`，Name.com DNS 无需修改。
