import { describe, test, expect } from 'vitest';
import { PDFDocument, degrees } from '@cantoo/pdf-lib';
import { deflateSync } from 'node:zlib';
import { parseRanges, merge, extract, split, burst, rotate, imagesToPdf, placeImage, pageCount, pagesToKeep, textToPdf } from '../src/lib/pdf';
import { typeValue, parseCsv, csvToJson, csvToMarkdown, tsvToCsv, csvToTsv, markdownTableRows, markdownToCsv, markdownToJson, jsonToCsv, jsonRows, flatten, jsonToMarkdown } from '../src/lib/data';
import * as XLSX from 'xlsx';
import { csvToXlsx, xlsxToRows, xlsxToCsv } from '../src/lib/xlsx';
import { targetSize, renameTo, formatBytes, sizeChange, avifQuality } from '../src/lib/image';

// A PDF whose pages are 100, 200, 300... points wide, so we can tell pages apart after a transform.
async function makePdf(n: number, rotation = 0) {
  const d = await PDFDocument.create();
  for (let i = 1; i <= n; i++) d.addPage([i * 100, 500]).setRotation(degrees(rotation));
  return d.save();
}
const widths = async (b: Uint8Array) => (await PDFDocument.load(b)).getPages().map((p) => p.getWidth());

// Minimal valid 2x1 RGB PNG, built by hand so the test needs no fixtures.
function tinyPng() {
  const crcTable = Array.from({ length: 256 }, (_, n) => {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    return c >>> 0;
  });
  const crc = (buf: Buffer) => {
    let c = 0xffffffff;
    for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8);
    return (c ^ 0xffffffff) >>> 0;
  };
  const chunk = (type: string, data: Buffer) => {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const td = Buffer.concat([Buffer.from(type), data]);
    const c = Buffer.alloc(4);
    c.writeUInt32BE(crc(td));
    return Buffer.concat([len, td, c]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(2, 0);
  ihdr.writeUInt32BE(1, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // RGB
  const raw = Buffer.from([0, 255, 0, 0, 0, 0, 255]);
  return new Uint8Array(
    Buffer.concat([
      Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
      chunk('IHDR', ihdr),
      chunk('IDAT', deflateSync(raw)),
      chunk('IEND', Buffer.alloc(0)),
    ]),
  );
}

describe('pdf', () => {
  test('parseRanges handles lists, open ends and reverse ranges', () => {
    expect(parseRanges('1-3, 5', 6)).toEqual([[0, 1, 2], [4]]);
    expect(parseRanges('4-', 6)).toEqual([[3, 4, 5]]);
    expect(parseRanges('-2', 6)).toEqual([[0, 1]]);
    expect(parseRanges('3-1', 6)).toEqual([[2, 1, 0]]);
    expect(parseRanges('2 to 3', 6)).toEqual([[1, 2]]);
  });

  test('parseRanges rejects bad input', () => {
    expect(() => parseRanges('', 3)).toThrow();
    expect(() => parseRanges('7', 3)).toThrow(/outside/);
    expect(() => parseRanges('a-b', 3)).toThrow(/not a page/);
    expect(() => parseRanges('0', 3)).toThrow();
  });

  test('merge keeps every page in file order', async () => {
    const out = await merge([await makePdf(2), await makePdf(3)]);
    expect(await widths(out)).toEqual([100, 200, 100, 200, 300]);
  });

  test('pagesToKeep drops the removed pages and keeps the rest in order', () => {
    expect(pagesToKeep([3], 5)).toEqual([0, 1, 2, 4]);
    expect(pagesToKeep([4, 0, 0], 5)).toEqual([1, 2, 3]);
    expect(pagesToKeep([], 3)).toEqual([0, 1, 2]);
    expect(pagesToKeep([0, 1, 2], 3)).toEqual([]);
  });
  test('extract copies chosen pages in the given order', async () => {
    const out = await extract(await makePdf(5), [4, 0, 2]);
    expect(await widths(out)).toEqual([500, 100, 300]);
  });

  test('split makes one file per group, burst one per page', async () => {
    const src = await makePdf(4);
    const parts = await split(src, parseRanges('1-2, 3-4', 4));
    expect(parts.length).toBe(2);
    expect(await widths(parts[1])).toEqual([300, 400]);
    const pages = await burst(src);
    expect(pages.length).toBe(4);
    expect(await pageCount(pages[3])).toBe(1);
  });

  test('rotate adds to existing rotation and wraps at 360', async () => {
    const out = await rotate(await makePdf(3, 270), 180, [1]);
    const d = await PDFDocument.load(out);
    expect(d.getPages().map((p) => p.getRotation().angle)).toEqual([270, 90, 270]);
    const all = await PDFDocument.load(await rotate(await makePdf(2), -90));
    expect(all.getPages().map((p) => p.getRotation().angle)).toEqual([270, 270]);
    await expect(rotate(await makePdf(1), 45)).rejects.toThrow();
  });

  test('placeImage centres and only scales down', () => {
    expect(placeImage(100, 50, 200, 200, 0)).toEqual({ x: 50, y: 75, width: 100, height: 50 });
    const big = placeImage(1000, 500, 200, 300, 10);
    expect(big.width).toBe(180);
    expect(big.height).toBe(90);
    expect(big.x).toBe(10);
  });

  test('imagesToPdf makes one page per image', async () => {
    const png = tinyPng();
    const fit = await PDFDocument.load(await imagesToPdf([{ bytes: png, type: 'image/png' }, { bytes: png, type: 'image/png' }]));
    expect(fit.getPageCount()).toBe(2);
    expect(fit.getPage(0).getSize()).toEqual({ width: 2, height: 1 });
    // A wide image on A4 turns the page landscape.
    const a4 = await PDFDocument.load(await imagesToPdf([{ bytes: png, type: 'image/png' }], 'a4', 36));
    expect(a4.getPage(0).getWidth()).toBeGreaterThan(a4.getPage(0).getHeight());
    await expect(imagesToPdf([])).rejects.toThrow();
  });

  test('textToPdf keeps line breaks, paginates, and survives odd characters', async () => {
    const one = await PDFDocument.load(await textToPdf('one\ntwo\nthree'));
    expect(one.getPageCount()).toBe(1);
    expect(one.getPage(0).getSize()).toEqual({ width: 595, height: 842 });
    const long = await textToPdf(Array.from({ length: 200 }, (_, i) => `line ${i + 1}`).join('\n'));
    expect((await PDFDocument.load(long)).getPageCount()).toBeGreaterThan(1);
    // Latin-1 passes through; characters outside it come out as question marks, not a crash.
    const odd = await PDFDocument.load(await textToPdf('héllo 中文 wörld'));
    expect(odd.getPageCount()).toBe(1);
  });
});

describe('csv and json', () => {
  const CSV = '﻿name,age,city\r\nAda,36,"London, UK"\r\nGrace,85,"New ""York"""\r\n\r\n';

  test('parseCsv strips BOM, handles quotes and types numbers', () => {
    const p = parseCsv(CSV);
    expect(p.fields).toEqual(['name', 'age', 'city']);
    expect(p.rows).toEqual([
      { name: 'Ada', age: 36, city: 'London, UK' },
      { name: 'Grace', age: 85, city: 'New "York"' },
    ]);
  });

  test('parseCsv auto-detects semicolons and tabs', () => {
    expect(parseCsv('a;b\n1;2').rows).toEqual([{ a: 1, b: 2 }]);
    expect(parseCsv('a\tb\n1\t2').delimiter).toBe('\t');
  });

  test('typeValue keeps zip codes and long IDs as text', () => {
    expect(typeValue('42')).toBe(42);
    expect(typeValue('-3.5')).toBe(-3.5);
    expect(typeValue('1e3')).toBe(1000);
    expect(typeValue('TRUE')).toBe(true);
    expect(typeValue('02134')).toBe('02134');
    expect(typeValue('4111111111111111')).toBe('4111111111111111');
    expect(typeValue('0.5')).toBe(0.5);
    expect(typeValue('12abc')).toBe('12abc');
    expect(typeValue('')).toBe('');
  });

  test('a column with any leading-zero value stays text throughout', () => {
    expect(parseCsv('zip,n\n02134,1\n10001,2').rows).toEqual([
      { zip: '02134', n: 1 },
      { zip: '10001', n: 2 },
    ]);
    expect(parseCsv('a,b\n007,1\n8,2', { header: false }).rows).toEqual([['a', 'b'], ['007', 1], ['8', 2]]);
  });

  test('csvToJson can keep everything as text and skip headers', () => {
    expect(JSON.parse(csvToJson('zip\n02134', { typed: false }))).toEqual([{ zip: '02134' }]);
    expect(JSON.parse(csvToJson('1,2\n3,4', { header: false }))).toEqual([[1, 2], [3, 4]]);
  });

  test('flatten turns nesting into dotted keys', () => {
    expect(flatten({ a: { b: 1, c: { d: 'x' } }, tags: [1, 2] })).toEqual({ 'a.b': 1, 'a.c.d': 'x', tags: '[1,2]' });
  });

  test('jsonRows accepts arrays, wrapped arrays, single objects and JSON Lines', () => {
    expect(jsonRows('[{"a":1}]')).toEqual([{ a: 1 }]);
    expect(jsonRows('{"data":[{"a":1},{"a":2}],"page":1}')).toEqual([{ a: 1 }, { a: 2 }]);
    expect(jsonRows('{"a":1}')).toEqual([{ a: 1 }]);
    expect(jsonRows('{"a":1}\n{"a":2}\n')).toEqual([{ a: 1 }, { a: 2 }]);
    expect(() => jsonRows('{nope')).toThrow(/Not valid JSON/);
  });

  test('jsonToCsv unions columns and quotes when needed', () => {
    const csv = jsonToCsv('[{"name":"Ada","addr":{"city":"London, UK"}},{"name":"Grace","age":85}]');
    expect(csv).toBe('name,addr.city,age\r\nAda,"London, UK",\r\nGrace,,85');
  });

  test('csvToMarkdown writes a header, right-aligns number columns and escapes pipes', () => {
    expect(csvToMarkdown('name,age\nAda,36\nGrace,85')).toBe('| name | age |\n| --- | ---: |\n| Ada | 36 |\n| Grace | 85 |\n');
    expect(csvToMarkdown('a,b\n"x|y","l1\nl2"')).toBe('| a | b |\n| --- | --- |\n| x\\|y | l1<br>l2 |\n');
  });

  test('csvToMarkdown without headers generates Column cells, and keeps text columns left-aligned', () => {
    expect(csvToMarkdown('02134,x\n10001,y', { header: false })).toBe('| Column 1 | Column 2 |\n| --- | --- |\n| 02134 | x |\n| 10001 | y |\n');
    expect(() => csvToMarkdown('   \n')).toThrow(/No rows/);
  });

  test('csvToTsv round trips with tsvToCsv', () => {
    const csv = 'a,"b,1"\r\nc,d';
    expect(csvToTsv(csv)).toBe('a\tb,1\r\nc\td');
    expect(tsvToCsv(csvToTsv(csv))).toBe('a,"b,1"\r\nc,d');
  });

  test('tsvToCsv quotes commas and doubles quotes', () => {
    expect(tsvToCsv('a\tb\n1,2\t3\nhe said "hi"\tbye')).toBe('a,b\r\n"1,2",3\r\n"he said ""hi""",bye');
    expect(tsvToCsv('one\ttwo\n1\t2')).toBe('one,two\r\n1,2');
  });

  test('markdownTableRows parses a GFM table and drops prose and the alignment row', () => {
    const md = '# Title\n\nSome words here.\n\n| Name | Age | City |\n| --- | ---: | :-: |\n| Ada | 36 | London |\n| Grace | 85 | New York |\n\nAfterword.';
    expect(markdownTableRows(md)).toEqual([['Name', 'Age', 'City'], ['Ada', '36', 'London'], ['Grace', '85', 'New York']]);
    expect(() => markdownTableRows('no table here')).toThrow(/No Markdown table/);
  });

  test('markdownTableRows ignores prose lines with pipes around the table', () => {
    const md = 'See a | b for the background.\n\n| Name | Age |\n| --- | --- |\n| Ada | 36 |\n\nAfter: not | a row';
    expect(markdownTableRows(md)).toEqual([['Name', 'Age'], ['Ada', '36']]);
  });

  test('markdownTableRows reads only the first table when the file has two', () => {
    const md = '| A |\n| --- |\n| 1 |\n\nSome prose.\n\n| B |\n| --- |\n| 2 |';
    expect(markdownTableRows(md)).toEqual([['A'], ['1']]);
  });

  test('jsonToMarkdown builds a GFM table with flattened keys and right-aligned numbers', () => {
    const md = jsonToMarkdown('[{"name":"Ada","age":36,"address":{"city":"London"}},{"name":"Grace","age":85,"address":{"city":"New York"}}]');
    expect(md).toBe('| name | age | address.city |\n| --- | ---: | --- |\n| Ada | 36 | London |\n| Grace | 85 | New York |\n');
    expect(() => jsonToMarkdown('[]')).toThrow(/No rows/);
  });

  test('jsonToMarkdown escapes pipes in cells', () => {
    const md = jsonToMarkdown('[{"a":"x|y","b":"ok"}]');
    expect(md).toContain('| x\\|y | ok |');
  });

  test('markdownTableRows unescapes pipes and <br> cells', () => {
    expect(markdownToCsv('| a | b |\n| --- | --- |\n| x\\|y | l1<br>l2 |')).toBe('a,b\r\nx|y,"l1\nl2"');
    expect(markdownToCsv('| a | b |\n| --- | --- |\n| 1,000 | plain |')).toBe('a,b\r\n"1,000",plain');
  });

  test('markdownToJson types plain numbers and keeps leading zeros as text', () => {
    expect(JSON.parse(markdownToJson('| name | age | zip |\n| --- | --- | --- |\n| Ada | 36 | 02134 |'))).toEqual([
      { name: 'Ada', age: 36, zip: '02134' },
    ]);
  });

  test('markdownToJson throws when the text holds no table', () => {
    expect(() => markdownToJson('no pipes here')).toThrow('No Markdown table');
  });

  test('round trip CSV → JSON → CSV', () => {
    const csv = 'id,label\r\n1,one\r\n2,"two, too"';
    expect(jsonToCsv(csvToJson(csv))).toBe(csv);
  });

  test('csvToXlsx writes a real workbook with numbers as numbers', () => {
    const bytes = csvToXlsx(CSV);
    expect(bytes[0]).toBe(0x50); // "PK": xlsx is a zip
    expect(bytes[1]).toBe(0x4b);
    expect(xlsxToRows(bytes)).toEqual([
      ['name', 'age', 'city'],
      ['Ada', 36, 'London, UK'],
      ['Grace', 85, 'New "York"'],
    ]);
  });

  test('xlsxToCsv converts only the first sheet and lists all sheet names', () => {
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([['a', 'b'], [1, 'x, y']]), 'First');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([['z']]), 'Second');
    const bytes = new Uint8Array(XLSX.write(wb, { type: 'array', bookType: 'xlsx' }) as ArrayBuffer);
    const out = xlsxToCsv(bytes);
    expect(out.csv.trimEnd()).toBe('a,b\n1,"x, y"');
    expect(out.sheets).toEqual(['First', 'Second']);
  });

  test('xlsxToCsv writes date cells as shown in Excel and keeps the first tab even when it is not Sheet1', () => {
    const wb = XLSX.utils.book_new();
    const dates = XLSX.utils.aoa_to_sheet([['when', 'n'], [{ t: 'n', v: 46332, z: 'yyyy-mm-dd' }, 3]]);
    XLSX.utils.book_append_sheet(wb, dates, 'Orders');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([['other']]), 'Notes');
    const bytes = new Uint8Array(XLSX.write(wb, { type: 'array', bookType: 'xlsx' }) as ArrayBuffer);
    const out = xlsxToCsv(bytes);
    expect(out.csv.trimEnd()).toBe('when,n\n2026-11-06,3');
    expect(out.sheets).toEqual(['Orders', 'Notes']);
  });

  test('JSON to Excel: the keys become headings and numbers stay numbers', () => {
    const bytes = csvToXlsx(jsonToCsv('[{"name":"Ada","age":36},{"name":"Grace","age":85}]'));
    expect(xlsxToRows(bytes)).toEqual([
      ['name', 'age'],
      ['Ada', 36],
      ['Grace', 85],
    ]);
  });

  test('Excel to JSON: first row becomes the keys and plain numbers stay numbers', () => {
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([['name', 'age', 'zip'], ['Ada', 36, '02134'], ['Grace', 85, '10001']]), 'People');
    const bytes = new Uint8Array(XLSX.write(wb, { type: 'array', bookType: 'xlsx' }) as ArrayBuffer);
    const json = JSON.parse(csvToJson(xlsxToCsv(bytes).csv, { delimiter: ',', header: true, typed: true }));
    expect(json).toEqual([
      { name: 'Ada', age: 36, zip: '02134' },
      { name: 'Grace', age: 85, zip: '10001' },
    ]);
  });
});

describe('image math', () => {
  test('targetSize fits a box and keeps aspect', () => {
    expect(targetSize(4000, 3000, { width: 1200 })).toEqual({ width: 1200, height: 900 });
    expect(targetSize(4000, 3000, { width: 1200, height: 600 })).toEqual({ width: 800, height: 600 });
    expect(targetSize(4000, 3000, { height: 300 })).toEqual({ width: 400, height: 300 });
  });

  test('targetSize stretches only when aspect is unlocked', () => {
    expect(targetSize(400, 300, { width: 100, height: 100, keepAspect: false })).toEqual({ width: 100, height: 100 });
  });

  test('targetSize does not upscale unless asked; percent always applies', () => {
    expect(targetSize(400, 300, { width: 800 })).toEqual({ width: 400, height: 300 });
    expect(targetSize(400, 300, { width: 800, allowUpscale: true })).toEqual({ width: 800, height: 600 });
    expect(targetSize(400, 300, { percent: 50 })).toEqual({ width: 200, height: 150 });
    expect(targetSize(400, 300, { percent: 200 })).toEqual({ width: 800, height: 600 });
    expect(targetSize(3, 3, { percent: 1 })).toEqual({ width: 1, height: 1 });
  });

  test('renameTo swaps the extension', () => {
    expect(renameTo('holiday.photo.HEIC', 'image/jpeg')).toBe('holiday.photo.jpg');
    expect(renameTo('scan', 'image/webp', '-small')).toBe('scan-small.webp');
  });

  test('avifQuality shifts the slider down and stays in range', () => {
    expect(avifQuality(0.85)).toBe(60);
    expect(avifQuality(0.1)).toBe(1);
    expect(avifQuality(1)).toBe(75);
  });

  test('size labels', () => {
    expect(formatBytes(512)).toBe('512 B');
    expect(formatBytes(2048)).toBe('2.0 KB');
    expect(formatBytes(3 * 1024 * 1024)).toBe('3.0 MB');
    expect(sizeChange(1000, 380)).toBe('−62%');
    expect(sizeChange(1000, 1000)).toBe('same size');
  });
});
