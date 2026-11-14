// YAML ↔ JSON. The text in and out is plain; js-yaml (MIT) does the parsing. Imported dynamically,
// never on pages that do not convert YAML.
import { loadAll, dump } from 'js-yaml';

const firstLine = (e: unknown) => ((e as Error).message ?? String(e)).split('\n')[0];

/** YAML text → JSON text. Several YAML documents (separated by ---) become a JSON array. */
export function yamlToJson(text: string, o: { indent?: number } = {}): string {
  const t = text.replace(/^﻿/, '');
  if (!t.trim()) throw new Error('The file is empty.');
  let docs: unknown[];
  try {
    docs = loadAll(t);
  } catch (e) {
    throw new Error(`Not valid YAML: ${firstLine(e)}`);
  }
  docs = docs.filter((d) => d !== undefined);
  if (!docs.length) throw new Error('The file holds no YAML documents.');
  const data = docs.length === 1 ? docs[0] : docs;
  return JSON.stringify(data, null, o.indent ?? 2);
}

/** JSON text → YAML text. Any JSON value becomes YAML; keys come out in the file's order. */
export function jsonToYaml(text: string): string {
  const t = text.replace(/^﻿/, '').trim();
  if (!t) throw new Error('The file is empty.');
  let data: unknown;
  try {
    data = JSON.parse(t);
  } catch (e) {
    throw new Error(`Not valid JSON: ${firstLine(e)}`);
  }
  return dump(data);
}
