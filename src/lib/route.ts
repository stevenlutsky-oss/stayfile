// Pure routing rules for the flow between tools: what a dropped set of files can become on the home page,
// what makes sense after a save, and the names files get. Kept free of the DOM and of the page copy in
// site.ts so it can be tested and so client bundles stay small.

export type Kind = 'pdf' | 'heic' | 'image' | 'csv' | 'json' | 'xlsx' | 'text' | 'other';
export type Route = { slug: string; label: string };
type Named = { name: string; type?: string };

export function kindOf(f: Named): Kind {
  const n = f.name.toLowerCase();
  const t = (f.type ?? '').toLowerCase();
  if (t === 'application/pdf' || n.endsWith('.pdf')) return 'pdf';
  if (/^image\/hei[cf]/.test(t) || /\.hei[cf]$/.test(n)) return 'heic';
  if (t.startsWith('image/') || /\.(jpe?g|png|webp|gif|avif|bmp|ico)$/.test(n)) return 'image';
  if (/\.(csv|tsv)$/.test(n) || t === 'text/csv') return 'csv';
  if (/\.(json|jsonl|ndjson)$/.test(n) || t === 'application/json') return 'json';
  if (/\.(xlsx)$/.test(n) || t === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') return 'xlsx';
  if (/\.(txt|md|markdown|log)$/.test(n) || t === 'text/plain' || t === 'text/markdown') return 'text';
  return 'other';
}

/**
 * Tools that fit everything that was dropped, best first. Empty when the files do not belong to one tool,
 * for example a PDF and a spreadsheet together.
 */
export function suggestTools(files: Named[]): Route[] {
  if (!files.length) return [];
  const kinds = new Set(files.map(kindOf));
  const n = files.length;
  if (kinds.has('other')) return [];
  if (kinds.size === 1 && kinds.has('pdf')) {
    return n > 1
      ? [{ slug: 'merge-pdf', label: `Merge ${n} PDFs into one` }]
      : [
          { slug: 'split-pdf', label: 'Split it' },
          { slug: 'extract-pages-from-pdf', label: 'Pull out some pages' },
          { slug: 'rotate-pdf', label: 'Rotate pages' },
          { slug: 'pdf-to-text', label: 'Extract the text' },
        ];
  }
  if ([...kinds].every((k) => k === 'image' || k === 'heic')) {
    const many = n > 1 ? `${n} images` : 'it';
    const out: Route[] = [];
    if (kinds.has('heic')) out.push({ slug: 'heic-to-jpg', label: `Convert ${n > 1 ? 'them' : 'it'} to JPG` });
    if (!kinds.has('heic')) {
      out.push(
        { slug: 'compress-image', label: `Make ${n > 1 ? 'them' : 'it'} smaller` },
        { slug: 'convert-image', label: 'Change the format' },
        { slug: 'resize-image', label: `Resize ${many}` },
      );
    }
    out.push({ slug: 'jpg-to-pdf', label: n > 1 ? 'Put them in one PDF' : 'Turn it into a PDF' });
    return out;
  }
  if (n > 1) return [];
  if (kinds.has('csv')) return [{ slug: 'csv-to-excel', label: 'Turn it into an Excel file' }, { slug: 'csv-to-json', label: 'Convert to JSON' }, { slug: 'csv-to-markdown', label: 'Make a Markdown table' }];
  if (kinds.has('json')) return [{ slug: 'json-to-csv', label: 'Convert to CSV' }, { slug: 'json-to-excel', label: 'Turn it into an Excel file' }, { slug: 'json-to-markdown', label: 'Make a Markdown table' }];
  if (kinds.has('xlsx')) return [{ slug: 'excel-to-csv', label: 'Convert to CSV' }, { slug: 'excel-to-json', label: 'Convert to JSON' }];
  if (kinds.size === 1 && kinds.has('text')) return [{ slug: 'text-to-pdf', label: 'Turn it into a PDF' }];
  return [];
}

/** Plain words for what was dropped, for the line above the choices. */
export function describeDrop(files: Named[]): string {
  const n = files.length;
  if (!n) return '';
  const kinds = new Set(files.map(kindOf));
  const word = kinds.size > 1 ? (([...kinds].every((k) => k === 'image' || k === 'heic')) ? 'image' : 'file')
    : ({ pdf: 'PDF', heic: 'iPhone photo', image: 'image', csv: 'CSV file', json: 'JSON file', xlsx: 'Excel file', text: 'text file', other: 'file' } as const)[[...kinds][0]];
  return n === 1 ? `${files[0].name}. What should happen to it?` : `${n} ${word}s. What should happen to them?`;
}

/** What to offer once a single file has been saved. The result is carried over, so each is one click. */
export function nextTools(slug: string): Route[] {
  const pdfNext: Record<string, Route[]> = {
    'merge-pdf': [{ slug: 'rotate-pdf', label: 'Rotate pages' }, { slug: 'extract-pages-from-pdf', label: 'Pull out pages' }],
    'split-pdf': [{ slug: 'rotate-pdf', label: 'Rotate pages' }, { slug: 'merge-pdf', label: 'Merge with other PDFs' }],
    'extract-pages-from-pdf': [{ slug: 'rotate-pdf', label: 'Rotate pages' }, { slug: 'merge-pdf', label: 'Merge with other PDFs' }],
    'rotate-pdf': [{ slug: 'merge-pdf', label: 'Merge with other PDFs' }, { slug: 'extract-pages-from-pdf', label: 'Pull out pages' }],
    'jpg-to-pdf': [{ slug: 'merge-pdf', label: 'Merge with other PDFs' }, { slug: 'rotate-pdf', label: 'Rotate pages' }],
    'png-to-pdf': [{ slug: 'merge-pdf', label: 'Merge with other PDFs' }, { slug: 'rotate-pdf', label: 'Rotate pages' }],
    'webp-to-pdf': [{ slug: 'merge-pdf', label: 'Merge with other PDFs' }, { slug: 'rotate-pdf', label: 'Rotate pages' }],
    'heic-to-pdf': [{ slug: 'merge-pdf', label: 'Merge with other PDFs' }, { slug: 'rotate-pdf', label: 'Rotate pages' }],
    'gif-to-pdf': [{ slug: 'merge-pdf', label: 'Merge with other PDFs' }, { slug: 'rotate-pdf', label: 'Rotate pages' }],
    'svg-to-pdf': [{ slug: 'merge-pdf', label: 'Merge with other PDFs' }, { slug: 'rotate-pdf', label: 'Rotate pages' }],
    'bmp-to-pdf': [{ slug: 'merge-pdf', label: 'Merge with other PDFs' }, { slug: 'rotate-pdf', label: 'Rotate pages' }],
    'avif-to-pdf': [{ slug: 'merge-pdf', label: 'Merge with other PDFs' }, { slug: 'rotate-pdf', label: 'Rotate pages' }],
  };
  if (pdfNext[slug]) return pdfNext[slug];
  // After a data tool saves a file, offer the next step in the data chain. One click carries the file over.
  const dataNext: Record<string, Route[]> = {
    'csv-to-json': [{ slug: 'json-to-excel', label: 'Open it in Excel' }, { slug: 'json-to-csv', label: 'Convert back to CSV' }],
    'tsv-to-json': [{ slug: 'json-to-excel', label: 'Open it in Excel' }],
    'tsv-to-csv': [{ slug: 'csv-to-excel', label: 'Open it in Excel' }],
    'tsv-to-excel': [{ slug: 'excel-to-json', label: 'Convert to JSON' }],
    'csv-to-tsv': [{ slug: 'tsv-to-json', label: 'Convert to JSON' }],
    'csv-to-markdown': [{ slug: 'text-to-pdf', label: 'Turn it into a PDF' }],
    'json-to-csv': [{ slug: 'csv-to-excel', label: 'Open it in Excel' }],
    'jsonl-to-csv': [{ slug: 'csv-to-excel', label: 'Open it in Excel' }],
    'csv-to-xlsx': [{ slug: 'excel-to-json', label: 'Convert to JSON' }],
    'excel-to-markdown': [{ slug: 'text-to-pdf', label: 'Turn it into a PDF' }],
    'markdown-to-csv': [{ slug: 'csv-to-excel', label: 'Open it in Excel' }],
    'markdown-to-json': [{ slug: 'json-to-excel', label: 'Open it in Excel' }, { slug: 'json-to-csv', label: 'Convert to CSV' }],
    'markdown-to-excel': [{ slug: 'excel-to-csv', label: 'Convert to CSV' }],
    'excel-to-tsv': [{ slug: 'tsv-to-json', label: 'Convert to JSON' }],
    'xlsx-to-csv': [{ slug: 'csv-to-markdown', label: 'Make a Markdown table' }],
    'xlsx-to-json': [{ slug: 'json-to-csv', label: 'Convert to CSV' }],
    'json-to-xlsx': [{ slug: 'excel-to-csv', label: 'Convert to CSV' }],
    'json-to-markdown': [{ slug: 'text-to-pdf', label: 'Turn it into a PDF' }],
  };
  if (dataNext[slug]) return dataNext[slug];
  const imgNext: Route[] = [
    { slug: 'compress-image', label: 'Make it smaller' },
    { slug: 'resize-image', label: 'Resize' },
    { slug: 'jpg-to-pdf', label: 'Turn into a PDF' },
  ];
  // A single-page PDF to JPG or PNG saves one image, so the same image next steps apply.
  const IMAGE_OUTPUT = new Set([
    'convert-image', 'compress-image', 'resize-image', 'compress-jpg', 'compress-png', 'resize-jpg', 'resize-png',
    'png-to-jpg', 'jpg-to-png', 'webp-to-jpg', 'heic-to-jpg', 'heic-to-png', 'heic-to-webp',
    'avif-to-jpg', 'avif-to-png', 'jpg-to-avif', 'svg-to-png', 'svg-to-jpg', 'svg-to-webp', 'png-to-avif', 'webp-to-avif', 'avif-to-webp',
    'gif-to-png', 'gif-to-jpg', 'webp-to-png', 'png-to-webp', 'jpg-to-webp', 'gif-to-webp',
    'ico-to-png', 'bmp-to-jpg', 'bmp-to-png', 'ico-to-jpg', 'ico-to-webp',
  ]);
  if (slug === 'pdf-to-jpg' || slug === 'pdf-to-png') {
    return [{ slug: 'compress-image', label: 'Make it smaller' }, { slug: 'resize-image', label: 'Resize' }];
  }
  if (IMAGE_OUTPUT.has(slug)) {
    return imgNext.filter((r) => r.slug !== slug);
  }
  return [];
}

/** "report-part1.pdf" + 2 more becomes "report-part1-merged.pdf", so the download is easy to find. */
export function mergedName(first: string): string {
  const base = first.replace(/\.[^./\\]+$/, '');
  return base ? `${base}-merged.pdf` : 'merged.pdf';
}

/** The sentence after a save. */
export function savedLine(name: string, count = 1): string {
  return count > 1 ? `Saved ${name} with ${count} files inside.` : `Saved ${name}.`;
}

/**
 * The split page's save buttons. Each one does the job in one click; the page's own mode comes first
 * so the extract preset leads with "one PDF" and the split preset with "each range".
 */
export function splitButtons(preset: string): { v: string; l: string }[] {
  const all = [
    { v: 'ranges', l: 'Save each range as a file' },
    { v: 'extract', l: 'Save pages as one PDF' },
    { v: 'every', l: 'Save every page as a file' },
  ];
  if (preset === 'remove') return [{ v: 'remove', l: 'Remove these pages and save the rest' }];
  const lead = all.find((b) => b.v === preset) ?? all[0];
  return [lead, ...all.filter((b) => b !== lead)];
}
