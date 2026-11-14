// Painted shadow-board outline for each tool page: the shape its file leaves on the wall.
// Fill is currentColor (the paint); .cut lines are routed back to the board color.
// Kept free of the component so tests can check coverage for every page.

const sheet = (x: number, y: number, w: number, h: number) => {
  const f = Math.round(w * 0.3);
  return `M${x} ${y}h${w - f}l${f} ${f}v${h - f}h${-w}z`;
};
const fold = (x: number, y: number, w: number) => {
  const f = Math.round(w * 0.3);
  return `M${x + w - f} ${y}v${f}h${f}`;
};
const lines = (x: number, y: number, w: number, n: number, gap = 7) =>
  Array.from({ length: n }, (_, i) => `M${x} ${y + i * gap}h${i === n - 1 ? w * 0.6 : w}`).join('');
const photo = (x: number, y: number, w: number, h: number) => `M${x} ${y}h${w}v${h}h${-w}z`;
const hills = (x: number, y: number, w: number, h: number) =>
  `M${x + 4} ${y + h - 5}l${w * 0.3} ${-h * 0.42}l${w * 0.18} ${h * 0.22}l${w * 0.16} ${-h * 0.16}l${w * 0.26} ${h * 0.36}`;
const sun = (x: number, y: number, w: number, h: number) => ({ cx: x + w * 0.72, cy: y + h * 0.3, r: Math.max(3, h * 0.1) });
const grid = (x: number, y: number, w: number, h: number, cols = 3, rows = 4) =>
  [
    ...Array.from({ length: cols - 1 }, (_, i) => `M${x + ((i + 1) * w) / cols} ${y}v${h}`),
    ...Array.from({ length: rows - 1 }, (_, i) => `M${x} ${y + ((i + 1) * h) / rows}h${w}`),
  ].join('');

export interface Shape {
  fill: string[];
  cut: string[];
  ink?: string[];
  dots?: { cx: number; cy: number; r: number }[];
  tilt?: { d: string; rot: number; cx: number; cy: number }[];
}
const P = (x: number, y: number, w: number, h: number): Shape => ({ fill: [photo(x, y, w, h)], cut: [hills(x, y, w, h)], dots: [sun(x, y, w, h)] });
// Layers paint back to front, so a front shape covers the routed lines of the one behind it.
const merge = (...s: Shape[]): Shape[] => s;
export const S = (x: number, y: number, w: number, h: number, n = 4): Shape => ({ fill: [sheet(x, y, w, h)], cut: [fold(x, y, w), ...(n > 0 ? [lines(x + 8, y + h * 0.38, w - 16, n)] : [])] });
const G = (x: number, y: number, w: number, h: number, head = false): Shape => ({
  fill: [photo(x, y, w, h)],
  cut: [grid(x, y, w, h, 3, 5), ...(head ? [`M${x} ${y + h / 5 - 2}h${w}`] : [])],
});
const tag = (x: number, y: number): Shape => ({ fill: [`M${x} ${y}h16l6 7l-6 7h-16z`], cut: [`M${x - 10} ${y - 8}L${x + 3} ${y + 7}`], dots: [] });

export const shapes: Record<string, Shape[]> = {
  'merge-pdf': merge(
    { fill: [], cut: [], tilt: [{ d: sheet(20, 18, 40, 54), rot: -10, cx: 40, cy: 45 }, { d: sheet(60, 18, 40, 54), rot: 10, cx: 80, cy: 45 }] },
    S(38, 26, 44, 60, 5),
  ),
  'split-pdf': merge(
    { fill: [], cut: [], tilt: [{ d: sheet(18, 14, 38, 34), rot: -8, cx: 37, cy: 31 }, { d: `M64 52h38v34h-38z`, rot: 6, cx: 83, cy: 69 }] },
    { fill: [], cut: [], ink: [`M14 50h6M28 50h6M42 50h6M56 50h6M70 50h6M84 50h6M98 50h6`] },
  ),
  'extract-pages-from-pdf': merge(S(22, 22, 44, 62, 5), S(32, 14, 44, 62, 5), { fill: [], cut: [], tilt: [{ d: sheet(70, 10, 34, 46), rot: 12, cx: 87, cy: 33 }] }),
  'rotate-pdf': merge(
    S(30, 26, 60, 44, 3),
    { fill: [], cut: [], ink: [`M20 40a40 40 0 0 1 26 -30`, `M38 8l9 2l-3 9`, `M100 56a40 40 0 0 1 -26 30`, `M82 88l-9 -2l3 -9`] },
  ),
  'jpg-to-pdf': merge(S(46, 10, 50, 72, 3), P(16, 34, 52, 40)),
  'convert-image': merge(P(14, 14, 56, 42), P(48, 40, 58, 44)),
  'png-to-jpg': merge(P(18, 18, 72, 56), tag(86, 62)),
  'webp-to-jpg': merge(P(18, 18, 72, 56), tag(86, 62)),
  'jpg-to-webp': merge(P(18, 18, 72, 56), tag(86, 62)),
  'heic-to-jpg': merge(
    { fill: ['M38 6h44a8 8 0 0 1 8 8v68a8 8 0 0 1 -8 8h-44a8 8 0 0 1 -8 -8v-68a8 8 0 0 1 8 -8z'], cut: ['M52 12h16', 'M36 20h48v54h-48z'] },
    { fill: [], cut: [hills(36, 20, 48, 54)], dots: [sun(36, 20, 48, 54)] },
  ),
  'compress-image': merge(P(36, 28, 48, 38), { fill: [], cut: [], ink: ['M14 12l16 12M106 12l-16 12M14 84l16 -12M106 84l-16 -12', 'M30 24h-9M30 24v-8M90 24h9M90 24v-8M30 72h-9M30 72v8M90 72h9M90 72v8'] }),
  'compress-jpg': merge(P(36, 28, 48, 38), { fill: [], cut: [], ink: ['M14 12l16 12M106 12l-16 12M14 84l16 -12M106 84l-16 -12', 'M30 24h-9M30 24v-8M90 24h9M90 24v-8M30 72h-9M30 72v8M90 72h9M90 72v8'] }),
  'compress-png': merge(P(36, 28, 48, 38), { fill: [], cut: [], ink: ['M14 12l16 12M106 12l-16 12M14 84l16 -12M106 84l-16 -12', 'M30 24h-9M30 24v-8M90 24h9M90 24v-8M30 72h-9M30 72v8M90 72h9M90 72v8'] }),
  'resize-image': merge(P(16, 44, 46, 38), { fill: [], cut: [], ink: ['M16 34v-22h88v70h-30', 'M66 40l28 -20', 'M94 20h-11M94 20v11'] }),
  'resize-jpg': merge(P(16, 44, 46, 38), { fill: [], cut: [], ink: ['M16 34v-22h88v70h-30', 'M66 40l28 -20', 'M94 20h-11M94 20v11'] }),
  'resize-png': merge(P(16, 44, 46, 38), { fill: [], cut: [], ink: ['M16 34v-22h88v70h-30', 'M66 40l28 -20', 'M94 20h-11M94 20v11'] }),
  'csv-to-json': merge(G(16, 16, 54, 66, true), { fill: [`M84 30q-6 0 -6 6v8q0 4 -4 4q4 0 4 4v8q0 6 6 6`, `M96 30q6 0 6 6v8q0 4 4 4q-4 0 -4 4v8q0 6 -6 6`], cut: [] }),
  'csv-to-markdown': merge(G(14, 14, 60, 68, true), { fill: [], cut: [], ink: ['M30 34h24', 'M30 47h36', 'M30 60h30'] }),
  'markdown-to-csv': merge(G(14, 12, 56, 68, true), S(78, 30, 30, 44, 3)),
  'markdown-to-excel': merge(S(78, 22, 34, 52, 3), G(14, 16, 50, 64, true)),
  'tsv-to-json': merge(G(16, 16, 54, 66, true), { fill: [`M84 30q-6 0 -6 6v8q0 4 -4 4q4 0 4 4v8q0 6 6 6`, `M96 30q6 0 6 6v8q0 4 4 4q-4 0 -4 4v8q0 6 -6 6`], cut: [] }),
  'tsv-to-csv': merge(G(14, 12, 56, 68, true), S(78, 30, 30, 44, 3)),
  'csv-to-tsv': merge(S(14, 22, 40, 54, 3), G(56, 12, 50, 70, true)),
  'jsonl-to-csv': merge(S(14, 12, 48, 70, 0), { fill: [], cut: ['M28 36q-5 0 -5 5v6q0 3 -3 3q3 0 3 3v6q0 5 5 5', 'M48 36q5 0 5 5v6q0 3 3 3q-3 0 -3 3v6q0 5 -5 5'] }, G(70, 26, 36, 52)),
  'json-to-csv': merge(S(14, 12, 48, 70, 0), { fill: [], cut: ['M28 36q-5 0 -5 5v6q0 3 -3 3q3 0 3 3v6q0 5 5 5', 'M48 36q5 0 5 5v6q0 3 3 3q-3 0 -3 3v6q0 5 -5 5'] }, G(70, 26, 36, 52)),
  'csv-to-excel': merge(G(14, 14, 60, 70, true), S(70, 34, 36, 50, 3)),
  'excel-to-csv': merge(S(62, 30, 44, 56, 3), G(12, 14, 56, 68, true)),
  'excel-to-json': merge(G(12, 14, 54, 68, true), { fill: ['M88 32q-6 0 -6 6v7q0 4 -4 4q4 0 4 4v7q0 6 6 6', 'M100 32q6 0 6 6v7q0 4 4 4q-4 0 -4 4v7q0 6 -6 6'], cut: [] }),
  'excel-to-markdown': merge(G(12, 14, 54, 68, true), { fill: [], cut: [], ink: ['M28 36h22', 'M28 48h34', 'M28 60h26'] }),
  'json-to-markdown': merge(G(12, 14, 54, 68, true), { fill: ['M74 32q-6 0 -6 6v7q0 4 -4 4q4 0 4 4v7q0 6 6 6', 'M88 32q6 0 6 6v7q0 4 4 4q-4 0 -4 4v7q0 6 -6 6'], cut: [] }),
  'excel-to-tsv': merge(G(12, 12, 56, 68, true), S(78, 28, 30, 46, 3)),
  'json-to-excel': merge(S(14, 12, 48, 70, 0), { fill: [], cut: ['M28 36q-5 0 -5 5v6q0 3 -3 3q3 0 3 3v6q0 5 5 5', 'M48 36q5 0 5 5v6q0 3 3 3q-3 0 -3 3v6q0 5 -5 5'] }, G(70, 26, 36, 52)),
  'pdf-to-jpg': merge(S(16, 12, 44, 62, 3), P(48, 36, 56, 44)),
  'pdf-to-png': merge(S(16, 12, 44, 62, 3), P(48, 36, 56, 44)),
  'remove-pages-from-pdf': merge(S(30, 12, 60, 72, 4), { fill: [], cut: [], ink: ['M42 48h36'] }),
  'png-to-pdf': merge(S(46, 10, 50, 72, 3), P(16, 34, 52, 40)),
  'webp-to-pdf': merge(S(46, 10, 50, 72, 3), P(16, 34, 52, 40)),
  'bmp-to-pdf': merge(S(46, 10, 50, 72, 3), P(16, 34, 52, 40)),
  'avif-to-pdf': merge(S(46, 10, 50, 72, 3), P(16, 34, 52, 40)),
  'svg-to-pdf': merge(S(46, 10, 50, 72, 3), P(16, 34, 52, 40)),
  'heic-to-pdf': merge(S(46, 10, 50, 72, 3), P(16, 34, 52, 40)),
  'gif-to-pdf': merge(S(46, 10, 50, 72, 3), P(16, 34, 52, 40)),
  'jpg-to-png': merge(P(18, 18, 72, 56), tag(86, 62)),
  'gif-to-jpg': merge(P(18, 18, 72, 56), tag(86, 62)),
  'gif-to-webp': merge(P(18, 18, 72, 56), tag(86, 62)),
  'webp-to-png': merge(P(18, 18, 72, 56), tag(86, 62)),
  'png-to-webp': merge(P(18, 18, 72, 56), tag(86, 62)),
  'gif-to-png': merge(P(18, 18, 72, 56), tag(86, 62)),
  'heic-to-webp': merge(
    { fill: ['M38 6h44a8 8 0 0 1 8 8v68a8 8 0 0 1 -8 8h-44a8 8 0 0 1 -8 -8v-68a8 8 0 0 1 8 -8z'], cut: ['M52 12h16', 'M36 20h48v54h-48z'] },
    { fill: [], cut: [hills(36, 20, 48, 54)], dots: [sun(36, 20, 48, 54)] },
  ),
  'avif-to-jpg': merge(P(18, 18, 72, 56), tag(86, 62)),
  'avif-to-png': merge(P(18, 18, 72, 56), tag(86, 62)),
  'jpg-to-avif': merge(P(18, 18, 72, 56), tag(86, 62)),
  'png-to-avif': merge(P(18, 18, 72, 56), tag(86, 62)),
  'webp-to-avif': merge(P(18, 18, 72, 56), tag(86, 62)),
  'avif-to-webp': merge(P(18, 18, 72, 56), tag(86, 62)),
  'svg-to-png': merge(P(14, 16, 74, 58), { fill: [], cut: [], ink: ['M20 58C40 22 62 22 82 58'], dots: [{ cx: 20, cy: 58, r: 3.2 }, { cx: 51, cy: 27, r: 3.2 }, { cx: 82, cy: 58, r: 3.2 }] }),
  'svg-to-jpg': merge(P(14, 16, 74, 58), { fill: [], cut: [], ink: ['M20 58C40 22 62 22 82 58'], dots: [{ cx: 20, cy: 58, r: 3.2 }, { cx: 51, cy: 27, r: 3.2 }, { cx: 82, cy: 58, r: 3.2 }] }),
  'svg-to-webp': merge(P(14, 16, 74, 58), { fill: [], cut: [], ink: ['M20 58C40 22 62 22 82 58'], dots: [{ cx: 20, cy: 58, r: 3.2 }, { cx: 51, cy: 27, r: 3.2 }, { cx: 82, cy: 58, r: 3.2 }] }),
  'heic-to-png': merge(
    { fill: ['M38 6h44a8 8 0 0 1 8 8v68a8 8 0 0 1 -8 8h-44a8 8 0 0 1 -8 -8v-68a8 8 0 0 1 8 -8z'], cut: ['M52 12h16', 'M36 20h48v54h-48z'] },
    { fill: [], cut: [hills(36, 20, 48, 54)], dots: [sun(36, 20, 48, 54)] },
  ),
  'png-to-ico': merge(P(14, 18, 60, 50), tag(80, 58)),
  'ico-to-png': merge(P(14, 18, 60, 50), tag(80, 58)),
  'jpg-to-ico': merge(P(14, 18, 60, 50), tag(80, 58)),
  'webp-to-ico': merge(P(14, 18, 60, 50), tag(80, 58)),
  'svg-to-ico': merge(P(14, 18, 60, 50), tag(80, 58)),
  'gif-to-ico': merge(P(14, 18, 60, 50), tag(80, 58)),
  'ico-to-jpg': merge(P(14, 18, 60, 50), tag(80, 58)),
  'ico-to-webp': merge(P(14, 18, 60, 50), tag(80, 58)),
  'bmp-to-jpg': merge(P(18, 18, 72, 56), tag(86, 62)),
  'bmp-to-png': merge(P(18, 18, 72, 56), tag(86, 62)),
  'pdf-to-text': [S(26, 12, 58, 72, 6)],
  'text-to-pdf': merge(S(8, 14, 38, 64, 4), { fill: [], cut: [], ink: ['M48 46h15', 'M60 38l9 8-9 8'] }, { fill: [sheet(76, 14, 38, 64)], cut: [fold(76, 14, 38)] }),
  'markdown-to-pdf': merge(S(8, 14, 38, 64, 4), { fill: [], cut: [], ink: ['M48 46h15', 'M60 38l9 8-9 8'] }, { fill: [sheet(76, 14, 38, 64)], cut: [fold(76, 14, 38)] }),
};
