// CSV / JSON / XLSX transforms. Pure: strings and bytes in, strings and bytes out.
import Papa from 'papaparse';

export type Row = Record<string, unknown>;

export interface CsvOptions {
  header?: boolean; // first row is column names (default true)
  delimiter?: string; // '' = auto-detect
  typed?: boolean; // turn "42" into 42 and "true" into true (default true)
}

export interface Parsed {
  rows: unknown[]; // objects when header, arrays otherwise
  fields: string[];
  delimiter: string;
  warnings: string[];
}

const NUM = /^-?(0|[1-9]\d*)(\.\d+)?([eE][+-]?\d+)?$/;

/** "42" → 42, "true" → true. Leaves values alone that would change if made numbers:
 *  leading zeros (zip codes), and integers too long to store exactly (IDs, card numbers). */
export function typeValue(v: string): unknown {
  const t = v.trim();
  if (t === 'true' || t === 'TRUE') return true;
  if (t === 'false' || t === 'FALSE') return false;
  if (!NUM.test(t)) return v;
  const n = Number(t);
  if (!Number.isFinite(n)) return v;
  if (/^-?\d+$/.test(t) && !Number.isSafeInteger(n)) return v;
  if (t.replace(/^-/, '').replace('.', '').replace(/e.*/i, '').length > 15) return v;
  return n;
}

/** True when typeValue would keep a number-looking value as text (leading zero, too long to be exact). */
export function mustStayText(v: string): boolean {
  const t = v.trim();
  return /^-?\d/.test(t) && typeof typeValue(t) === 'string' && /^-?[\d.]+$/.test(t);
}

export function parseCsv(text: string, o: CsvOptions = {}): Parsed {
  const header = o.header ?? true;
  const typed = o.typed ?? true;
  const res = Papa.parse(text.replace(/^﻿/, ''), {
    header,
    delimiter: o.delimiter || '',
    skipEmptyLines: 'greedy',
    transformHeader: (h, i) => h.trim() || `column_${i + 1}`,
  });
  // Type values column by column: if any value in a column must stay text (a zip code like 02134),
  // the whole column stays text, so one column never mixes "02134" and 10001.
  if (typed) {
    const rows = res.data as (Record<string, string> | string[])[];
    const keys = new Set<string | number>();
    for (const r of rows) for (const [k, v] of Object.entries(r)) if (typeof v === 'string' && mustStayText(v)) keys.add(Array.isArray(r) ? +k : k);
    for (const r of rows) {
      for (const [k, v] of Object.entries(r)) {
        if (typeof v !== 'string' || keys.has(Array.isArray(r) ? +k : k)) continue;
        (r as Record<string, unknown>)[k] = typeValue(v);
      }
    }
  }
  const warnings = res.errors
    .filter((e) => e.code !== 'UndetectableDelimiter')
    .slice(0, 5)
    .map((e) => (e.row != null ? `Row ${e.row + 2}: ${e.message}` : e.message));
  return {
    rows: res.data as unknown[],
    fields: header ? res.meta.fields ?? [] : [],
    delimiter: res.meta.delimiter,
    warnings,
  };
}

/** Pipes in cells are escaped, in-cell line breaks become <br>, and a header line plus an
 *  alignment row are written around the body. Numeric columns pass right=true and get ---: */
function renderMarkdownTable(head: string[], rows: string[][], right: boolean[]): string {
  const esc = (v: string) => v.replace(/\|/g, '\\|').replace(/\r?\n/g, '<br>');
  const line = (cells: string[]) => `| ${cells.map(esc).join(' | ')} |`;
  const sep = `| ${right.map((r) => (r ? '---:' : '---')).join(' | ')} |`;
  return [line(head), sep, ...rows.map(line)].join('\n') + '\n';
}
const numericCols = (rows: string[][], width: number): boolean[] =>
  Array.from({ length: width }, (_, i) => {
    const vals = rows.map((r) => r[i].trim()).filter(Boolean);
    return vals.length > 0 && vals.every((v) => NUM.test(v));
  });

/** CSV text → a GitHub-flavored Markdown table. Pipes in cells are escaped, line breaks
 *  become <br>, and columns that hold only numbers are right-aligned. */
export function csvToMarkdown(text: string, o: CsvOptions = {}): string {
  const header = o.header ?? true;
  const p = parseCsv(text, { ...o, typed: false });
  const body: unknown[][] = header
    ? (p.rows as Record<string, unknown>[]).map((r) => p.fields.map((f) => r[f]))
    : (p.rows as unknown[][]);
  const width = header ? p.fields.length : body.reduce((m, r) => Math.max(m, r.length), 0);
  if (!width || !body.length) throw new Error('No rows found in the file.');
  const head = header ? p.fields : Array.from({ length: width }, (_, i) => `Column ${i + 1}`);
  const rows = body.map((r) => Array.from({ length: width }, (_, i) => String(r[i] ?? '')));
  return renderMarkdownTable(head, rows, numericCols(rows, width));
}

/** CSV text → TSV text, quoting cells that contain tabs or quotes as needed. */
export function csvToTsv(text: string, o: CsvOptions = {}): string {
  const p = parseCsv(text, { delimiter: o.delimiter ?? '', header: false, typed: false });
  return Papa.unparse(p.rows as unknown[][], { delimiter: '\t', newline: '\r\n' });
}

/** TSV text → CSV text, quoting cells that contain commas or quotes as needed. */
export function tsvToCsv(text: string): string {
  const p = parseCsv(text, { delimiter: '\t', header: false, typed: false });
  return Papa.unparse(p.rows as unknown[][], { delimiter: ',', newline: '\r\n' });
}

export function csvToJson(text: string, o: CsvOptions & { indent?: number } = {}): string {
  return JSON.stringify(parseCsv(text, o).rows, null, o.indent ?? 2);
}

/** Flatten nested objects to dotted keys: {a:{b:1}} → {"a.b":1}. Arrays become JSON text. */
export function flatten(obj: unknown, prefix = '', out: Row = {}): Row {
  if (obj === null || typeof obj !== 'object' || Array.isArray(obj)) {
    out[prefix || 'value'] = Array.isArray(obj) ? JSON.stringify(obj) : obj;
    return out;
  }
  const entries = Object.entries(obj as Row);
  if (!entries.length && prefix) out[prefix] = '';
  for (const [k, v] of entries) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v !== null && typeof v === 'object' && !Array.isArray(v)) flatten(v, key, out);
    else out[key] = Array.isArray(v) ? JSON.stringify(v) : v;
  }
  return out;
}

/** Accepts an array of objects, a single object, an object wrapping one array ({"data":[...]}), or JSON Lines. */
/** The cells of one pipe line: \| becomes |, <br> becomes a newline, cells are trimmed. */
function splitCells(line: string): string[] {
  const inner = line.trim().replace(/^\|/, '').replace(/\|$/, '');
  return inner.split(/(?<!\\)\|/).map((c) => c.trim().replace(/\\\|/g, '|').replace(/<br\s*\/?>/gi, '\n'));
}
const isAlignLine = (line: string): boolean =>
  line.trim().includes('|') && splitCells(line).every((c) => /^:?-+:?$/.test(c));

/** Parse the first GitHub-flavored Markdown table in a text into rows of cells.
 *  The table is the header line above the first alignment row (| --- | --- |) plus the pipe lines
 *  below it, so prose lines that happen to contain a pipe are skipped. Without an alignment row,
 *  every pipe line counts, which matches how the page has always read loose tables.
 *  Prose, code blocks and other tables are dropped, \| becomes |, <br> becomes a newline. */
export function markdownTableRows(text: string): string[][] {
  const lines = text.split(/\r?\n/);
  const pipe = (l: string) => l.trim().includes('|');
  const sep = lines.findIndex(isAlignLine);
  let picked: string[] | null = null;
  if (sep > 0 && pipe(lines[sep - 1]) && !isAlignLine(lines[sep - 1])) {
    picked = [lines[sep - 1]];
    for (let i = sep + 1; i < lines.length && pipe(lines[i]); i++) picked.push(lines[i]);
  }
  const source = picked ?? lines.filter(pipe);
  const rows = source.map(splitCells).filter((r) => !r.every((c) => /^:?-+:?$/.test(c)));
  if (!rows.length) throw new Error('No Markdown table found in the text.');
  return rows;
}

/** Markdown table → CSV text, the same shape the Excel path uses downstream. */
export function markdownToCsv(text: string): string {
  return Papa.unparse(markdownTableRows(text), { delimiter: ',', newline: '\r\n' });
}

/** Markdown table → JSON rows. The header row becomes the keys, cells are typed like CSV cells
 *  (numbers become numbers, leading zeros stay text). Everything before the table is dropped. */
export function markdownToJson(text: string, o: { indent?: number } = {}): string {
  return csvToJson(markdownToCsv(text), { delimiter: ',', header: true, typed: true, indent: o.indent ?? 2 });
}

export function jsonRows(text: string): Row[] {
  const t = text.replace(/^﻿/, '').trim();
  if (!t) throw new Error('The file is empty.');
  let data: unknown;
  try {
    data = JSON.parse(t);
  } catch (e) {
    const lines = t.split(/\r?\n/).filter((l) => l.trim());
    try {
      data = lines.map((l) => JSON.parse(l));
    } catch {
      throw new Error(`Not valid JSON: ${(e as Error).message}`);
    }
  }
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    const arrays = Object.values(data as Row).filter(Array.isArray);
    data = arrays.length === 1 ? arrays[0] : [data];
  }
  if (!Array.isArray(data)) data = [data];
  return (data as unknown[]).map((r) => flatten(r));
}

/** Column order: keys in order of first appearance across all rows. */
export function columns(rows: Row[]): string[] {
  const seen = new Set<string>();
  for (const r of rows) for (const k of Object.keys(r)) seen.add(k);
  return [...seen];
}

export function jsonToCsv(text: string, o: { delimiter?: string } = {}): string {
  const rows = jsonRows(text);
  const cols = columns(rows);
  return Papa.unparse({ fields: cols, data: rows.map((r) => cols.map((c) => r[c] ?? '')) }, {
    delimiter: o.delimiter || ',',
    newline: '\r\n',
  });
}

/** JSON rows → a GitHub-flavored Markdown table. Objects flatten to dotted keys, lists stay JSON text. */
export function jsonToMarkdown(text: string): string {
  const rows = jsonRows(text);
  if (!rows.length) throw new Error('No rows found in the JSON.');
  const cols = columns(rows);
  if (!cols.length) throw new Error('No keys found in the JSON.');
  const body = rows.map((r) => cols.map((c) => (r[c] == null ? '' : String(r[c]))));
  return renderMarkdownTable(cols, body, numericCols(body, cols.length));
}

