// PDF transforms. Pure functions over bytes, so they run the same in the browser and in tests.
import { PDFDocument, StandardFonts, degrees } from '@cantoo/pdf-lib';
import { textPages } from './text';

export type Bytes = Uint8Array | ArrayBuffer;

async function load(b: Bytes) {
  const doc = await PDFDocument.load(b, { ignoreEncryption: true, updateMetadata: false });
  if (doc.isEncrypted) throw new Error('This PDF is password-protected. Remove the password in your PDF reader first, then try again.');
  return doc;
}

export async function pageCount(b: Bytes): Promise<number> {
  return (await load(b)).getPageCount();
}

/** Parse "1-3, 5, 8-" into zero-based page indexes, in the order given. Throws on bad input. */
export function parseRanges(input: string, total: number): number[][] {
  const groups: number[][] = [];
  const parts = input.split(/[,;]+/).map((s) => s.trim()).filter(Boolean);
  if (!parts.length) throw new Error('Enter at least one page or range, like 1-3, 5.');
  for (const part of parts) {
    const m = part.match(/^(\d*)\s*(?:(-|–|to)\s*(\d*))?$/i);
    if (!m || (!m[1] && !m[3])) throw new Error(`"${part}" is not a page or range.`);
    const a = m[1] ? +m[1] : 1;
    const b = m[2] ? (m[3] ? +m[3] : total) : a;
    if (a < 1 || b < 1 || a > total || b > total) throw new Error(`"${part}" is outside pages 1 to ${total}.`);
    const step = a <= b ? 1 : -1;
    const g: number[] = [];
    for (let p = a; p !== b + step; p += step) g.push(p - 1);
    groups.push(g);
  }
  return groups;
}

export async function merge(files: Bytes[]): Promise<Uint8Array> {
  const out = await PDFDocument.create();
  for (const f of files) {
    const src = await load(f);
    const pages = await out.copyPages(src, src.getPageIndices());
    pages.forEach((p) => out.addPage(p));
  }
  return out.save();
}

/** Copy the given zero-based pages, in order, into a new PDF. */
/** The 0-based page indexes left after removing the given ones, in page order. */
export function pagesToKeep(remove: number[], total: number): number[] {
  const drop = new Set(remove);
  const keep: number[] = [];
  for (let p = 0; p < total; p++) if (!drop.has(p)) keep.push(p);
  return keep;
}

export async function extract(b: Bytes, pages: number[]): Promise<Uint8Array> {
  const src = await load(b);
  const out = await PDFDocument.create();
  const copied = await out.copyPages(src, pages);
  copied.forEach((p) => out.addPage(p));
  return out.save();
}

/** One PDF per group of pages. */
export async function split(b: Bytes, groups: number[][]): Promise<Uint8Array[]> {
  const out: Uint8Array[] = [];
  for (const g of groups) out.push(await extract(b, g));
  return out;
}

/** Every page as its own PDF. */
export async function burst(b: Bytes): Promise<Uint8Array[]> {
  const n = await pageCount(b);
  return split(b, Array.from({ length: n }, (_, i) => [i]));
}

export type PageNumberFormat = 'plain' | 'count' | 'of';

/** Stamp a number on every page, centred in Courier 10 pt: "3", "3 of 12" or "Page 3 of 12".
 *  `start` is the number the first page gets; the "of" denominator is that number plus the page count minus one. */
export async function addPageNumbers(b: Bytes, o: { position?: 'bottom' | 'top'; format?: PageNumberFormat; start?: number } = {}): Promise<Uint8Array> {
  const position = o.position ?? 'bottom';
  const format = o.format ?? 'of';
  const start = Math.max(1, Math.floor(o.start ?? 1));
  const doc = await load(b);
  const font = await doc.embedFont(StandardFonts.Courier);
  const total = doc.getPageCount();
  const last = start + total - 1;
  const size = 10;
  for (const [i, p] of doc.getPages().entries()) {
    const n = start + i;
    const label = format === 'plain' ? `${n}` : format === 'count' ? `${n} of ${last}` : `Page ${n} of ${last}`;
    const { width, height } = p.getSize();
    const x = Math.max(0, (width - font.widthOfTextAtSize(label, size)) / 2);
    const y = position === 'bottom' ? 22 : height - 22 - size;
    try {
      p.drawText(label, { x, y, size, font });
    } catch {
      // WinAnsi covers digits and plain ASCII; swap anything else out rather than fail the whole file.
      p.drawText(label.replace(/[^\x20-\xFF]/g, '?'), { x, y, size, font });
    }
  }
  return doc.save();
}

/** Rotate pages clockwise by 90/180/270. `pages` = zero-based indexes, or all pages when omitted. */
export async function rotate(b: Bytes, by: number, pages?: number[]): Promise<Uint8Array> {
  if (by % 90 !== 0) throw new Error('Rotation must be a multiple of 90 degrees.');
  const doc = await load(b);
  const all = doc.getPages();
  const which = pages ?? all.map((_, i) => i);
  for (const i of which) {
    const p = all[i];
    const now = p.getRotation().angle;
    p.setRotation(degrees((((now + by) % 360) + 360) % 360));
  }
  return doc.save();
}

/** File name for one page of a PDF turned into images, e.g. "report-page-03.jpg". Pads to the width of the page count. */
export function pageImageName(base: string, page: number, total: number, ext: 'jpg' | 'png' = 'jpg'): string {
  const width = String(total).length;
  return `${base}-page-${String(page).padStart(Math.max(2, width), '0')}.${ext}`;
}

export const PAGE_SIZES = {
  fit: null,
  a4: [595.28, 841.89],
  letter: [612, 792],
} as const;
export type PageSize = keyof typeof PAGE_SIZES;

export interface ImageInput {
  bytes: Bytes;
  type: 'image/jpeg' | 'image/png';
}

/** Where an image of w×h sits on a page: scaled down to fit inside the margins, centred, never upscaled. */
export function placeImage(w: number, h: number, pageW: number, pageH: number, margin: number) {
  const boxW = pageW - margin * 2;
  const boxH = pageH - margin * 2;
  const s = Math.min(1, boxW / w, boxH / h);
  const dw = w * s;
  const dh = h * s;
  return { x: (pageW - dw) / 2, y: (pageH - dh) / 2, width: dw, height: dh };
}

/** Each image on its own page. "fit" makes the page the image's size; A4/Letter turn landscape for wide images. */
export async function imagesToPdf(images: ImageInput[], size: PageSize = 'fit', margin = 0): Promise<Uint8Array> {
  if (!images.length) throw new Error('Add at least one image.');
  const doc = await PDFDocument.create();
  for (const im of images) {
    const img = im.type === 'image/png' ? await doc.embedPng(im.bytes) : await doc.embedJpg(im.bytes);
    const { width: w, height: h } = img;
    let pw: number, ph: number;
    const fixed = PAGE_SIZES[size];
    if (!fixed) {
      pw = w + margin * 2;
      ph = h + margin * 2;
    } else {
      const [a, b] = fixed;
      [pw, ph] = w > h ? [b, a] : [a, b];
    }
    const page = doc.addPage([pw, ph]);
    page.drawImage(img, placeImage(w, h, pw, ph, margin));
  }
  return doc.save();
}

/** Build a one-column text PDF: Courier 10 pt on A4, 72 pt margins, hard-wrapped at the text width. */
export async function textToPdf(text: string): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Courier);
  const size = 10;
  const lineHeight = 14;
  const margin = 72;
  const pageW = 595;
  const pageH = 842;
  const maxChars = 75; // Courier 10 pt: 6 pt per character, (595 - 144) / 6 = 75
  const maxLines = Math.floor((pageH - 2 * margin) / lineHeight);
  for (const pageLines of textPages(text, maxChars, maxLines)) {
    const page = doc.addPage([pageW, pageH]);
    pageLines.forEach((line, i) => {
      const y = pageH - margin - i * lineHeight;
      try {
        page.drawText(line, { x: margin, y, size, font });
      } catch {
        // WinAnsi covers Latin-1. Swap anything outside it out rather than fail the whole file.
        page.drawText(line.replace(/[^\x20-\xFF]/g, '?'), { x: margin, y, size, font });
      }
    });
  }
  return doc.save();
}
