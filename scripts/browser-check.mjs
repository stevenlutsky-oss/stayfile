// Headless browser check for the tool pages. Not part of the build.
// Serves dist/ on a scratch port, opens each page in chromium, uploads fixture
// files, runs the action and reports console errors and the result line.
// Usage: node scripts/browser-check.mjs [slug ...]   (no args = all checks)
import { createServer } from 'node:http';
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, extname, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const scratch = join(root, '.scratch');
const fixtures = join(scratch, 'fixtures');
const dl = join(scratch, 'dl');

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.css': 'text/css', '.wasm': 'application/wasm', '.svg': 'image/svg+xml', '.json': 'application/json',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif',
  '.gif': 'image/gif', '.ico': 'image/x-icon', '.xml': 'text/xml', '.txt': 'text/plain', '.woff2': 'font/woff2',
};

const server = createServer(async (req, res) => {
  try {
    let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    let file = join(dist, p);
    if (p.endsWith('/')) file = join(file, 'index.html');
    else if (!extname(p) && existsSync(file + '.html')) file = file + '.html';
    const body = await readFile(file);
    res.writeHead(200, { 'content-type': MIME[extname(file)] ?? 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404); res.end('not found');
  }
});

await new Promise((r) => server.listen(0, '127.0.0.1', r));
const port = server.address().port;
const base = `http://127.0.0.1:${port}`;

// ---- Fixtures -------------------------------------------------------------
await mkdir(fixtures, { recursive: true });
await mkdir(dl, { recursive: true });

const { PDFDocument, StandardFonts } = await import('@cantoo/pdf-lib');
const pdf = await PDFDocument.create();
const font = await pdf.embedFont(StandardFonts.Helvetica);
for (const line of ['Page one', 'Page two', 'Page three']) {
  const page = pdf.addPage([300, 400]);
  page.drawText(line, { x: 40, y: 340, size: 24, font });
}
await writeFile(join(fixtures, 'sample.pdf'), await pdf.save());
await writeFile(join(fixtures, 'sample.txt'), 'Buy milk\nBuy eggs\nEmail the landlord about the lease\n');

const XLSX = (await import('xlsx')).default ?? (await import('xlsx'));
const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([['name', 'zip'], ['Ada', '02134'], ['Bob', '07030']]), 'Orders');
XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([['note'], ['second tab']]), 'Notes');
await writeFile(join(fixtures, 'sample.xlsx'), XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }));

await writeFile(join(fixtures, 'sample.csv'), 'name,zip\nAda,02134\nBob,07030\n');
await writeFile(join(fixtures, 'sample.json'), JSON.stringify([{ name: 'Ada', zip: '02134' }, { name: 'Bob', zip: '07030' }]));
await writeFile(join(fixtures, 'sample.yaml'), 'name: Ada\nzip: \'02134\'\n---\nname: Bob\nzip: \'07030\'\n');
// 1x1 transparent GIF
await writeFile(join(fixtures, 'sample.gif'), Buffer.from('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7', 'base64'));

// Raster images via a canvas in headless chromium.
const browser = await puppeteer.launch({
  executablePath: process.env.CHROMIUM || '/usr/bin/chromium',
  headless: 'new',
  args: ['--no-sandbox', '--disable-dev-shm-usage'],
});
{
  const page = await browser.newPage();
  await page.goto(await (async () => base)(), { waitUntil: 'domcontentloaded' }).catch(() => {});
  for (const [name, mime, quality] of [['sample.png', 'image/png'], ['sample.jpg', 'image/jpeg', 0.92], ['sample.webp', 'image/webp', 0.92], ['sample.avif', 'image/avif', 0.7]]) {
    const dataUrl = await page.evaluate(async (m, q) => {
      const c = document.createElement('canvas');
      c.width = 96; c.height = 72;
      const ctx = c.getContext('2d');
      const grad = ctx.createLinearGradient(0, 0, 96, 72);
      grad.addColorStop(0, '#2266aa'); grad.addColorStop(1, '#ee8833');
      ctx.fillStyle = grad; ctx.fillRect(0, 0, 96, 72);
      ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(48, 36, 18, 0, 7); ctx.fill();
      return c.toDataURL(m, q);
    }, mime, quality);
    const b64 = dataUrl.split(',')[1];
    if (!b64 || b64.length < 100) { console.log(`fixture ${name}: encoder did not produce output, skipping it`); continue; }
    await writeFile(join(fixtures, name), Buffer.from(b64, 'base64'));
  }
  await page.close();
}

// Wrap the generated sample.png in an .ico container (ICONDIR header plus a 96x72 PNG entry).
const pngForIco = join(fixtures, 'sample.png');
if (existsSync(pngForIco)) {
  const pngBytes = await readFile(pngForIco);
  const head = Buffer.alloc(22);
  head.writeUInt16LE(0, 0); // reserved
  head.writeUInt16LE(1, 2); // type: icon
  head.writeUInt16LE(1, 4); // one image
  head[6] = 96; head[7] = 72; // width, height (bytes, 0 would mean 256)
  head[8] = 0; head[9] = 0; // palette, reserved
  head.writeUInt16LE(1, 10); // planes
  head.writeUInt16LE(32, 12); // bits per pixel
  head.writeUInt32LE(pngBytes.length, 14);
  head.writeUInt32LE(22, 18); // payload offset
  await writeFile(join(fixtures, 'sample.ico'), Buffer.concat([head, pngBytes]));
} else {
  console.log('fixture sample.png missing, skipping sample.ico');
}

// Minimal 4x2 24-bit BMP. Rows are 12 bytes, aligned to 4 already, so no padding.
{
  const w = 4, h = 2, row = w * 3;
  const px = Buffer.alloc(row * h);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * row + x * 3;
      px[i] = 0x30; px[i + 1] = 0x60 + x * 40; px[i + 2] = 0xaa; // BGR
    }
  }
  const file = Buffer.alloc(54);
  file.write('BM', 0, 'ascii');
  file.writeUInt32LE(54 + px.length, 2);
  file.writeUInt32LE(54, 10); // pixel data offset
  file.writeUInt32LE(40, 14); // info header size
  file.writeInt32LE(w, 18);
  file.writeInt32LE(h, 22);
  file.writeUInt16LE(1, 26); // planes
  file.writeUInt16LE(24, 28); // bpp
  file.writeUInt32LE(px.length, 34);
  await writeFile(join(fixtures, 'sample.bmp'), Buffer.concat([file, px]));
}

// ---- Checks ----------------------------------------------------------------
const F = (n) => join(fixtures, n);
const checks = [
  { slug: '/', name: 'home' },
  { slug: '/merge-pdf/', fixtures: [F('sample.pdf'), F('sample.pdf')], click: 'Merge PDFs', expect: 'Merged' },
  { slug: '/split-pdf/', fixtures: [F('sample.pdf')], ranges: '1, 3', click: 'Split PDF', expect: 'Made' },
  { slug: '/extract-pages-from-pdf/', fixtures: [F('sample.pdf')], ranges: '1-2', click: 'Extract pages', expect: 'Saved' },
  { slug: '/remove-pages-from-pdf/', fixtures: [F('sample.pdf')], ranges: '2', click: 'Remove pages', expect: 'Removed' },
  { slug: '/rotate-pdf/', fixtures: [F('sample.pdf')], click: 'Turn right', expect: 'Rotated' },
  { slug: '/pdf-to-jpg/', fixtures: [F('sample.pdf')], click: 'Convert to JPG', expect: 'Made' },
  { slug: '/pdf-to-png/', fixtures: [F('sample.pdf')], click: 'Convert to PNG', expect: 'Made' },
  { slug: '/png-to-pdf/', fixtures: [F('sample.png')], click: 'Make PDF', expect: 'Made' },
  { slug: '/jpg-to-pdf/', fixtures: [F('sample.jpg')], click: 'Make PDF', expect: 'Made' },
  { slug: '/webp-to-pdf/', fixtures: [F('sample.webp')], click: 'Make PDF', expect: 'Made' },
  { slug: '/excel-to-csv/', fixtures: [F('sample.xlsx')], click: 'Download', expect: '' },
  { slug: '/excel-to-json/', fixtures: [F('sample.xlsx')], click: 'Download', expect: '' },
  { slug: '/json-to-excel/', fixtures: [F('sample.json')], click: 'Download', expect: '' },
  { slug: '/csv-to-json/', fixtures: [F('sample.csv')], click: 'Download', expect: '' },
  { slug: '/json-to-csv/', fixtures: [F('sample.json')], click: 'Download', expect: '' },
  { slug: '/csv-to-excel/', fixtures: [F('sample.csv')], click: 'Download', expect: '' },
  { slug: '/excel-to-csv/', name: 'load-only repeat guard', skip: true },
  { slug: '/compress-image/', fixtures: [F('sample.jpg')], click: 'Save', expect: '' },
  { slug: '/resize-jpg/', fixtures: [F('sample.jpg')], click: 'Save', expect: '' },
  { slug: '/resize-png/', fixtures: [F('sample.png')], click: 'Save', expect: '' },
  { slug: '/resize-image/', fixtures: [F('sample.png')], click: 'Save', expect: '' },
  { slug: '/jpg-to-png/', fixtures: [F('sample.jpg')], click: 'Save', expect: '' },
  { slug: '/png-to-jpg/', fixtures: [F('sample.png')], click: 'Save', expect: '' },
  { slug: '/webp-to-png/', fixtures: [F('sample.webp')], click: 'Save', expect: '' },
  { slug: '/png-to-webp/', fixtures: [F('sample.png')], click: 'Save', expect: '' },
  { slug: '/jpg-to-webp/', fixtures: [F('sample.jpg')], click: 'Save', expect: '' },
  { slug: '/webp-to-jpg/', fixtures: [F('sample.webp')], click: 'Save', expect: '' },
  { slug: '/gif-to-png/', fixtures: [F('sample.gif')], click: 'Save', expect: '' },
  { slug: '/avif-to-jpg/', fixtures: [F('sample.avif')], click: 'Save', expect: '' },
  { slug: '/jpg-to-avif/', fixtures: [F('sample.jpg')], click: 'Save', expect: '' },
  { slug: '/png-to-avif/', fixtures: [F('sample.png')], click: 'Save', expect: '' },
  { slug: '/webp-to-avif/', fixtures: [F('sample.webp')], click: 'Save', expect: '' },
  { slug: '/avif-to-webp/', fixtures: [F('sample.avif')], click: 'Save', expect: '' },
  { slug: '/gif-to-webp/', fixtures: [F('sample.gif')], click: 'Save', expect: '' },
  { slug: '/svg-to-webp/', name: 'svg-to-webp (load only, no SVG fixture)' },
  { slug: '/gif-to-ico/', fixtures: [F('sample.gif')], click: 'Save', expect: '' },
  { slug: '/ico-to-jpg/', fixtures: [F('sample.ico')], click: 'Save', expect: '' },
  { slug: '/compress-jpg/', fixtures: [F('sample.jpg')], click: 'Save', expect: '' },
  { slug: '/avif-to-pdf/', fixtures: [F('sample.avif')], click: 'Make PDF', expect: 'Made' },
  { slug: '/webp-to-ico/', fixtures: [F('sample.webp')], click: 'Save', expect: '' },
  { slug: '/svg-to-ico/', name: 'svg-to-ico (load only, no SVG fixture)' },
  { slug: '/png-to-ico/', fixtures: [F('sample.png')], click: 'Save', expect: '' },
  { slug: '/jpg-to-ico/', fixtures: [F('sample.jpg')], click: 'Save', expect: '' },
  { slug: '/ico-to-png/', fixtures: [F('sample.ico')], click: 'Save', expect: '' },
  { slug: '/bmp-to-jpg/', fixtures: [F('sample.bmp')], click: 'Save', expect: '' },
  { slug: '/bmp-to-png/', fixtures: [F('sample.bmp')], click: 'Save', expect: '' },
  { slug: '/svg-to-png/', name: 'svg-to-png (load only, no SVG fixture)' },
  { slug: '/svg-to-jpg/', name: 'svg-to-jpg (load only, no SVG fixture)' },
  { slug: '/svg-to-pdf/', name: 'svg-to-pdf (load only, no SVG fixture)' },
  { slug: '/pdf-to-text/', fixtures: [F('sample.pdf')], click: 'Extract text', expect: 'Extracted' },
  { slug: '/text-to-pdf/', fixtures: [F('sample.txt')], click: 'Make PDF', expect: 'Made' },
  { slug: '/yaml-to-json/', fixtures: [F('sample.yaml')], click: 'Download .json', expect: '' },
  { slug: '/json-to-yaml/', fixtures: [F('sample.json')], click: 'Download .yaml', expect: '' },
  { slug: '/add-page-numbers-to-pdf/', fixtures: [F('sample.pdf')], click: 'Add page numbers', expect: 'Added' },
  { slug: '/heic-to-jpg/', name: 'heic-to-jpg (load only, no HEIC fixture)' },
  { slug: '/heic-to-png/', name: 'heic-to-png (load only, no HEIC fixture)' },
].filter((c) => !c.skip);

const only = process.argv.slice(2);
const results = [];
for (const check of checks) {
  if (only.length && !only.some((s) => check.slug.includes(s))) continue;
  const name = check.name ?? check.slug;
  const page = await browser.newPage();
  const errors = [];
  page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', (e) => errors.push(String(e)));
  try {
    const client = await page.createCDPSession();
    await client.send('Page.setDownloadBehavior', { behavior: 'allow', downloadPath: dl }).catch(() => {});
    await page.goto(base + check.slug, { waitUntil: 'load', timeout: 30000 });
    await page.waitForSelector('#drop, .tool', { timeout: 10000 });
    if (check.fixtures) {
      const input = await page.$('#file');
      await input.uploadFile(...check.fixtures);
      if (check.ranges != null) {
        await page.waitForSelector('#ranges', { visible: true, timeout: 10000 });
        await page.$eval('#ranges', (el, v) => { el.value = v; el.dispatchEvent(new Event('input', { bubbles: true })); }, check.ranges);
      }
      if (check.click) {
        const clicked = await page.evaluate((label) => {
          const btns = [...document.querySelectorAll('[data-run], #go')];
          const btn = btns.find((b) => b.textContent.includes(label)) ?? btns.find((b) => b.id === 'go');
          if (!btn) return false;
          btn.click();
          return true;
        }, check.click);
        if (!clicked) errors.push(`button "${check.click}" not found`);
        else {
          await page.waitForFunction(
            () => { const d = document.getElementById('done'), e = document.getElementById('err'); return (d && !d.hidden) || (e && !e.hidden); },
            { timeout: 60000 },
          ).catch(() => errors.push('timed out waiting for a result'));
        }
      }
      const outcome = await page.evaluate(() => {
        const d = document.getElementById('done'), e = document.getElementById('err');
        if (e && !e.hidden) return 'error: ' + e.textContent;
        if (d && !d.hidden) return 'done: ' + d.textContent.trim().slice(0, 120);
        return 'no result shown';
      });
      results.push({ name, ok: errors.length === 0 && !outcome.startsWith('error') && outcome !== 'no result shown', outcome, errors });
    } else {
      results.push({ name, ok: errors.length === 0, outcome: 'loaded', errors });
    }
  } catch (e) {
    results.push({ name, ok: false, outcome: 'exception: ' + (e.message ?? e).slice(0, 140), errors });
  }
  await page.close();
}
await browser.close();
server.close();

let failed = 0;
for (const r of results) {
  if (!r.ok) failed++;
  console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.name}  ->  ${r.outcome}${r.errors.length ? '  console: ' + r.errors.join(' | ').slice(0, 300) : ''}`);
}
console.log(`\n${results.length - failed}/${results.length} checks passed`);
process.exit(failed ? 1 : 0);
