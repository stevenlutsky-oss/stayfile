import { describe, test, expect } from 'vitest';
import { kindOf, suggestTools, describeDrop, nextTools, mergedName, savedLine, splitButtons } from '../src/lib/route';
import { PAGES } from '../src/site';

const f = (name: string, type = '') => ({ name, type });
const slugs = (r: { slug: string }[]) => r.map((x) => x.slug);

describe('kindOf', () => {
  test('reads the type first and falls back to the extension', () => {
    expect(kindOf(f('a.pdf'))).toBe('pdf');
    expect(kindOf(f('scan', 'application/pdf'))).toBe('pdf');
    expect(kindOf(f('IMG_4021.HEIC'))).toBe('heic');
    expect(kindOf(f('x', 'image/heif'))).toBe('heic');
    expect(kindOf(f('photo.JPG'))).toBe('image');
    expect(kindOf(f('pic', 'image/webp'))).toBe('image');
    expect(kindOf(f('sales.csv'))).toBe('csv');
    expect(kindOf(f('rows.ndjson'))).toBe('json');
    expect(kindOf(f('notes.txt'))).toBe('text');
    expect(kindOf(f('notes', 'text/plain'))).toBe('text');
    expect(kindOf(f('config.yaml'))).toBe('yaml');
    expect(kindOf(f('config.yml', 'application/x-yaml'))).toBe('yaml');
    expect(kindOf(f('README.md'))).toBe('text');
    expect(kindOf(f('notes.docx'))).toBe('other');
  });
});

describe('suggestTools', () => {
  test('several PDFs go straight to merge', () => {
    expect(slugs(suggestTools([f('a.pdf'), f('b.pdf'), f('c.pdf')]))).toEqual(['merge-pdf']);
    expect(suggestTools([f('a.pdf'), f('b.pdf')])[0].label).toBe('Merge 2 PDFs into one');
  });
  test('one PDF offers split, extract, rotate and text', () => {
    expect(slugs(suggestTools([f('a.pdf')]))).toEqual(['split-pdf', 'extract-pages-from-pdf', 'rotate-pdf', 'pdf-to-text']);
  });
  test('iPhone photos lead with HEIC to JPG', () => {
    expect(slugs(suggestTools([f('IMG_1.heic'), f('IMG_2.heic')]))).toEqual(['heic-to-jpg', 'jpg-to-pdf']);
    expect(suggestTools([f('IMG_1.heic'), f('b.jpg')])[0].slug).toBe('heic-to-jpg');
  });
  test('images lead with making them smaller', () => {
    expect(slugs(suggestTools([f('a.jpg')]))).toEqual(['compress-image', 'convert-image', 'resize-image', 'jpg-to-pdf']);
    expect(suggestTools([f('a.jpg'), f('b.png')]).at(-1)!.label).toBe('Put them in one PDF');
  });
  test('one CSV or JSON file maps to its converters', () => {
    expect(slugs(suggestTools([f('sales.csv')]))).toEqual(['csv-to-excel', 'csv-to-json', 'csv-to-markdown']);
    expect(slugs(suggestTools([f('rows.json')]))).toEqual(['json-to-csv', 'json-to-excel', 'json-to-markdown']);
  });
  test('one Excel file maps to the Excel converters', () => {
    expect(slugs(suggestTools([f('budget.xlsx')]))).toEqual(['excel-to-csv', 'excel-to-json']);
    expect(kindOf(f('budget.xlsx'))).toBe('xlsx');
  });
  test('one YAML file suggests the YAML to JSON page', () => {
    expect(slugs(suggestTools([f('config.yaml')]))).toEqual(['yaml-to-json']);
    expect(describeDrop([f('config.yaml')])).toBe('config.yaml. What should happen to it?');
  });
  test('one text file suggests text-to-pdf', () => {
    expect(slugs(suggestTools([f('notes.txt')]))).toEqual(['text-to-pdf']);
    expect(suggestTools([f('notes.txt')])[0].label).toBe('Turn it into a PDF');
    expect(suggestTools([f('notes.txt'), f('log.md')])).toEqual([]);
  });
  test('mixed or unknown sets get no suggestion', () => {
    expect(suggestTools([])).toEqual([]);
    expect(suggestTools([f('a.pdf'), f('b.jpg')])).toEqual([]);
    expect(suggestTools([f('a.csv'), f('b.csv')])).toEqual([]);
    expect(suggestTools([f('a.docx')])).toEqual([]);
  });
});

describe('describeDrop', () => {
  test('names one file and counts several', () => {
    expect(describeDrop([f('a.pdf')])).toBe('a.pdf. What should happen to it?');
    expect(describeDrop([f('a.pdf'), f('b.pdf')])).toBe('2 PDFs. What should happen to them?');
    expect(describeDrop([f('a.heic'), f('b.jpg')])).toBe('2 images. What should happen to them?');
  });
});

describe('nextTools', () => {
  test('never offers the tool you are on', () => {
    for (const p of PAGES) expect(slugs(nextTools(p.slug))).not.toContain(p.slug);
  });
  test('PDF results go to PDF tools, image results to image tools, data results to data tools', () => {
    expect(slugs(nextTools('merge-pdf'))).toEqual(['rotate-pdf', 'extract-pages-from-pdf']);
    expect(slugs(nextTools('heic-to-jpg'))).toEqual(['compress-image', 'resize-image', 'jpg-to-pdf']);
    expect(slugs(nextTools('csv-to-json'))).toEqual(['json-to-excel', 'json-to-csv']);
    expect(slugs(nextTools('csv-to-markdown'))).toEqual(['text-to-pdf']);
    expect(slugs(nextTools('jsonl-to-csv'))).toEqual(['csv-to-excel']);
    expect(slugs(nextTools('pdf-to-jpg'))).toEqual(['compress-image', 'resize-image']);
    expect(slugs(nextTools('pdf-to-png'))).toEqual(['compress-image', 'resize-image']);
    expect(slugs(nextTools('text-to-pdf'))).toEqual(['merge-pdf']);
    expect(slugs(nextTools('markdown-to-pdf'))).toEqual(['merge-pdf']);
  });
  test('every slug offered anywhere is a real page', () => {
    const real = new Set(PAGES.map((p) => p.slug));
    const all = [
      ...PAGES.flatMap((p) => nextTools(p.slug)),
      ...suggestTools([f('a.pdf')]), ...suggestTools([f('a.pdf'), f('b.pdf')]), ...suggestTools([f('a.jpg')]),
      ...suggestTools([f('a.heic')]), ...suggestTools([f('a.csv')]), ...suggestTools([f('a.json')]), ...suggestTools([f('notes.txt')]),
    ];
    for (const r of all) expect(real.has(r.slug)).toBe(true);
  });
});

describe('names and lines', () => {
  test('merged files are named after the first one', () => {
    expect(mergedName('report-part1.pdf')).toBe('report-part1-merged.pdf');
    expect(mergedName('.pdf')).toBe('merged.pdf');
  });
  test('saved line counts what is inside a zip', () => {
    expect(savedLine('a.pdf')).toBe('Saved a.pdf.');
    expect(savedLine('images.zip', 3)).toBe('Saved images.zip with 3 files inside.');
  });
  test('copy has no em or en dashes', () => {
    const text = [describeDrop([f('a.pdf')]), ...PAGES.flatMap((p) => nextTools(p.slug).map((r) => r.label)), ...suggestTools([f('a.jpg')]).map((r) => r.label)];
    for (const t of text) expect(t).not.toMatch(/[–—]/);
  });
});

describe('splitButtons', () => {
  test('gives one save button per split mode, with the page preset first', () => {
    expect(splitButtons('ranges').map((b) => b.v)).toEqual(['ranges', 'extract', 'every']);
    expect(splitButtons('extract').map((b) => b.v)).toEqual(['extract', 'ranges', 'every']);
    expect(splitButtons('every')[0].v).toBe('every');
    expect(splitButtons('nonsense')[0].v).toBe('ranges');
  });
  test('the remove preset gives one Remove button only', () => {
    expect(splitButtons('remove').map((b) => b.v)).toEqual(['remove']);
  });
  test('labels each button with what it saves, so no confirm step is needed', () => {
    for (const b of splitButtons('ranges')) expect(b.l).toMatch(/^Save /);
  });
});

describe('site copy', () => {
  const allText = PAGES.flatMap((p) => [
    p.card, p.blurb, p.title, p.h1, p.lede, p.description,
    ...p.steps,
    ...p.faq.flatMap((f) => [f.q, f.a]),
  ]);
  test('no em or en dashes anywhere', () => {
    for (const t of allText) expect(t).not.toMatch(/[–—]/);
  });
  test('no sales words', () => {
    const banned = /\b(seamless|effortless|powerful|robust|vibrant|ultimate)\b/i;
    for (const t of allText) expect(t).not.toMatch(banned);
  });
});
