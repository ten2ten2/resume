import fs from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import { chromium } from 'playwright';
import { PDFDocument } from 'pdf-lib';

const root = process.cwd();
const outputs = [
  { route: '/', lang: 'en', file: 'Pang_Tianyu_Resume_EN.pdf' },
  { route: '/zh-hans/', lang: 'zh', file: 'Pang_Tianyu_Resume_ZH.pdf' }
];

const server = http.createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent((req.url || '/').split('?')[0]);
    let urlPath = pathname;
    if (urlPath.endsWith('/')) urlPath += 'index.html';
    if (!path.extname(urlPath)) urlPath += '/index.html';

    const requested = path.normalize(path.join(root, urlPath));
    if (!requested.startsWith(root)) {
      res.writeHead(403).end('Forbidden');
      return;
    }

    const body = await fs.readFile(requested);
    const ext = path.extname(requested).toLowerCase();
    const types = {
      '.html': 'text/html; charset=utf-8',
      '.css': 'text/css; charset=utf-8',
      '.js': 'text/javascript; charset=utf-8',
      '.pdf': 'application/pdf'
    };
    res.writeHead(200, { 'Content-Type': types[ext] || 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404).end('Not found');
  }
});

async function validatePdf(pdfPath) {
  const bytes = await fs.readFile(pdfPath);
  const doc = await PDFDocument.load(bytes);
  const pageCount = doc.getPageCount();
  if (pageCount !== 1) {
    throw new Error(`${path.basename(pdfPath)} layout check failed: expected exactly 1 page, got ${pageCount}`);
  }

  const { width, height } = doc.getPage(0).getSize();
  const a4 = { width: 595.28, height: 841.89 };
  const tolerance = 2;
  if (Math.abs(width - a4.width) > tolerance || Math.abs(height - a4.height) > tolerance) {
    throw new Error(`${path.basename(pdfPath)} page size check failed: got ${width.toFixed(2)} x ${height.toFixed(2)} pt`);
  }

  console.log(`Validated ${path.basename(pdfPath)}: 1-page A4 (${width.toFixed(2)} x ${height.toFixed(2)} pt)`);
}

await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const address = server.address();
const origin = `http://127.0.0.1:${address.port}`;

const browser = await chromium.launch({ headless: true });
try {
  for (const output of outputs) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1800 } });
    try {
      await page.goto(`${origin}${output.route}`, { waitUntil: 'load' });
      await page.waitForFunction(
        (lang) => document.documentElement.dataset.resumeLang === lang,
        output.lang
      );
      await page.evaluate(async () => {
        if (document.fonts?.ready) await document.fonts.ready;
      });
      await page.emulateMedia({ media: 'print' });

      const pdfPath = path.join(root, output.file);
      await page.pdf({
        path: pdfPath,
        format: 'A4',
        printBackground: true,
        preferCSSPageSize: true,
        margin: { top: '0mm', right: '0mm', bottom: '0mm', left: '0mm' }
      });
      await validatePdf(pdfPath);
    } finally {
      await page.close();
    }
  }

  await fs.copyFile(
    path.join(root, 'Pang_Tianyu_Resume_EN.pdf'),
    path.join(root, 'Pang_Tianyu_Resume.pdf')
  );
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}

console.log('Generated English (default) and Simplified Chinese resume PDFs successfully.');
