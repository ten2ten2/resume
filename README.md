# GitHub Pages 双语简历 + 自动生成 PDF

## 路由

- `https://www.tenten.moe/` - English（默认）
- `https://www.tenten.moe/zh-hans/` - 简体中文

右上角 `English / 简体中文` 直接在两个静态路由之间切换。

## PDF

每次 push 到 `main` 后自动生成：

- `Pang_Tianyu_Resume_EN.pdf` - English
- `Pang_Tianyu_Resume_ZH.pdf` - 简体中文

网页按钮直接打开/下载对应的预生成 PDF，不使用浏览器原生打印。

两份 PDF 都由工作流校验：

1. 必须恰好 1 页
2. 必须为 A4
3. 任一版本不满足条件则部署失败

## 字体与排版

- English 网页：优先 Inter / SF Pro / Segoe UI 等现代无衬线字体。
- 简体中文网页：优先 PingFang SC / Noto Sans CJK SC / Microsoft YaHei。
- PDF：GitHub Actions 安装 Inter、Noto Sans 和 Noto Sans CJK，保证生成环境字体稳定。
- PDF 保持一页 A4，但使用更舒展的字号、行距、段落和项目间距，避免早期版本过度紧凑。

## GitHub Pages

`Settings -> Pages -> Build and deployment -> Source -> GitHub Actions`

Custom domain：`www.tenten.moe`。
