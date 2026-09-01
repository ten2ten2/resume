import fs from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import { chromium } from 'playwright';
import { PDFDocument } from 'pdf-lib';

const root = process.cwd();
const pdfPath = path.join(root, 'Pang_Tianyu_Resume.pdf');

const server = http.createServer(async (req, res) => {
  try {
    const urlPath = req.url === '/' ? '/index.html' : req.url.split('?')[0];
    const requested = path.normalize(path.join(root, decodeURIComponent(urlPath)));
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

await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const address = server.address();
const url = `http://127.0.0.1:${address.port}/index.html`;

const browser = await chromium.launch({ headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1800 } });
  await page.goto(url, { waitUntil: 'load' });
  await page.evaluate(async () => {
    if (document.fonts?.ready) await document.fonts.ready;
  });
  await page.emulateMedia({ media: 'print' });

  await page.pdf({
    path: pdfPath,
    format: 'A4',
    printBackground: true,
    preferCSSPageSize: true,
    margin: { top: '0mm', right: '0mm', bottom: '0mm', left: '0mm' }
  });
} finally {
  await browser.close();
  await new Promise((resolve) => server.close(resolve));
}

const bytes = await fs.readFile(pdfPath);
const doc = await PDFDocument.load(bytes);
const pageCount = doc.getPageCount();
if (pageCount !== 1) {
  throw new Error(`PDF layout check failed: expected exactly 1 page, got ${pageCount}`);
}

const { width, height } = doc.getPage(0).getSize();
const a4 = { width: 595.28, height: 841.89 };
const tolerance = 2;
if (Math.abs(width - a4.width) > tolerance || Math.abs(height - a4.height) > tolerance) {
  throw new Error(`PDF page size check failed: got ${width.toFixed(2)} x ${height.toFixed(2)} pt`);
}

console.log(`Generated ${path.basename(pdfPath)}: 1-page A4 (${width.toFixed(2)} x ${height.toFixed(2)} pt)`);
