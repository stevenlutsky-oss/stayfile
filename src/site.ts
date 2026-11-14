export const SITE = {
  name: 'Stayfile',
  tagline: 'File tools that run on your own device',
  // Placeholder until the owner picks and buys a domain. Change here, in astro.config.mjs and public/robots.txt.
  url: 'https://stayfile.app',
};

export type Tool =
  | 'pdf-merge'
  | 'pdf-split'
  | 'pdf-rotate'
  | 'pdf-to-jpg'
  | 'pdf-to-png'
  | 'pdf-to-text'
  | 'text-to-pdf'
  | 'img-to-pdf'
  | 'img-convert'
  | 'img-compress'
  | 'img-resize'
  | 'img-ico'
  | 'csv-to-json'
  | 'csv-to-markdown'
  | 'json-to-csv'
  | 'csv-to-xlsx'
  | 'xlsx-to-csv'
  | 'xlsx-to-json'
  | 'xlsx-to-markdown'
  | 'xlsx-to-tsv'
  | 'json-to-xlsx'
  | 'json-to-markdown'
  | 'tsv-to-csv'
  | 'csv-to-tsv'
  | 'md-to-csv'
  | 'md-to-xlsx';

export type Group = 'PDF' | 'Images' | 'Spreadsheets and data';

export interface Preset {
  split?: 'extract' | 'ranges' | 'every' | 'remove';
  out?: 'image/jpeg' | 'image/png' | 'image/webp' | 'image/avif';
  accept?: string; // narrows the file picker on single-format pages
}

export interface ToolPage {
  slug: string;
  tool: Tool;
  group: Group;
  card: string; // short label for the home grid and footer
  blurb: string; // one line under the card label
  title: string;
  h1: string;
  lede: string;
  description: string;
  preset?: Preset;
  steps: string[];
  faq: { q: string; a: string }[];
}

const PRIVATE = {
  q: 'Do my files get uploaded?',
  a: 'No. The page does the work inside your browser, and your files are never sent to a server. That makes it fine to use with private documents such as contracts or bank statements.',
};

const LIMIT = {
  q: 'Is there a file size limit?',
  a: 'There is no set limit. Because the work happens on your device, the ceiling is your memory. A laptop handles files of a few hundred megabytes; an older phone may give up sooner.',
};

export const PAGES: ToolPage[] = [
  // ---------- PDF ----------
  {
    slug: 'merge-pdf',
    tool: 'pdf-merge',
    group: 'PDF',
    card: 'Merge PDF',
    blurb: 'Combine several PDFs into one file',
    title: 'Merge PDF files online without uploading them',
    h1: 'Merge PDF files',
    lede: 'Put several PDFs into one file in the order you choose. The merging happens in your browser, so the documents stay on your computer.',
    description: 'Combine PDF files into one document in your browser. Drag to set the order, then download. Nothing is uploaded and there is no sign-up.',
    steps: [
      'Drop in two or more PDF files, or click to pick them.',
      'Use the arrows to put them in the order you want.',
      'Click Merge and save the combined PDF.',
    ],
    faq: [
      {
        q: 'Are links, bookmarks and form fields kept?',
        a: 'Each page is copied as it is, links included. The bookmark list from the source files is not carried over, and fillable forms may lose their fields, so fill them in before you merge.',
      },
      {
        q: 'Can I merge a password-protected PDF?',
        a: 'Not directly. Open it in your PDF reader, remove the password or print it to a new PDF, and merge that copy.',
      },
      PRIVATE,
      LIMIT,
    ],
  },
  {
    slug: 'split-pdf',
    tool: 'pdf-split',
    group: 'PDF',
    card: 'Split PDF',
    blurb: 'Break a PDF into several files',
    preset: { split: 'ranges' },
    title: 'Split a PDF into separate files online',
    h1: 'Split a PDF',
    lede: 'Cut one PDF into several smaller ones, either by page ranges you type or one file per page. You get a zip when there is more than one file.',
    description: 'Split a PDF by page ranges or into single pages, right in your browser. Your file is not uploaded. Download the parts as a zip.',
    steps: [
      'Drop in the PDF you want to split.',
      'Type the ranges you want as separate files, such as 1-3, 4-10, 11-, or choose one file per page.',
      'Click Split and save the zip.',
    ],
    faq: [
      {
        q: 'How do I write the page ranges?',
        a: 'Separate each part with a comma. 1-3 is pages one to three, 5 is page five on its own, and 8- runs from page eight to the end. Each range you type becomes its own file.',
      },
      {
        q: 'Does splitting lower the quality?',
        a: 'No. Pages are copied over exactly as they are. Nothing is re-compressed.',
      },
      PRIVATE,
      LIMIT,
    ],
  },
  {
    slug: 'extract-pages-from-pdf',
    tool: 'pdf-split',
    group: 'PDF',
    card: 'Extract PDF pages',
    blurb: 'Save only the pages you need',
    preset: { split: 'extract' },
    title: 'Extract pages from a PDF online and save them as a new PDF',
    h1: 'Extract pages from a PDF',
    lede: 'Pick the pages you need and save them as a new, smaller PDF. You can also use this to reorder or drop pages.',
    description: 'Save selected pages of a PDF as a new file. Type pages like 1, 3, 7-9 and download. Works in your browser with no upload.',
    steps: [
      'Drop in your PDF.',
      'Type the pages to keep, for example 2, 5-7. They are saved in the order you type them.',
      'Click Extract and save the new PDF.',
    ],
    faq: [
      {
        q: 'How do I delete a page from a PDF?',
        a: 'Extract every page except that one. To drop page 4 from a 10-page file, type 1-3, 5-10.',
      },
      {
        q: 'Can I change the page order?',
        a: 'Yes. The new file follows the order you type, so 3, 1, 2 puts page three first. A range written backwards, like 10-1, reverses those pages.',
      },
      PRIVATE,
    ],
  },
  {
    slug: 'remove-pages-from-pdf',
    tool: 'pdf-split',
    group: 'PDF',
    card: 'Remove PDF pages',
    blurb: 'Delete the pages you do not need',
    preset: { split: 'remove' },
    title: 'Remove pages from a PDF online and save the rest as a new PDF',
    h1: 'Remove pages from a PDF',
    lede: 'Take out the pages you do not want and save everything else as a new PDF. Your original file is not changed.',
    description: 'Delete pages from a PDF in your browser. Type the pages to remove and download the rest. Your files are never uploaded.',
    steps: ['Drop in your PDF.', 'Type the pages to remove, for example 2, 5-7.', 'Click Remove pages and save the new PDF.'],
    faq: [
      {
        q: 'Does this change my original PDF?',
        a: 'No. The new file is a copy with those pages left out. The file you dropped stays as it was.',
      },
      {
        q: 'Can I remove a range of pages?',
        a: 'Yes. Type 5-7 to remove pages 5, 6 and 7. You can list single pages and ranges together, like 2, 5-7.',
      },
      {
        q: 'What if I remove every page?',
        a: 'This page stops you, because a PDF needs at least one page. Leave one page in and save again.',
      },
      PRIVATE,
    ],
  },
  {
    slug: 'rotate-pdf',
    tool: 'pdf-rotate',
    group: 'PDF',
    card: 'Rotate PDF',
    blurb: 'Turn sideways or upside-down pages',
    title: 'Rotate PDF pages online and save the result',
    h1: 'Rotate PDF pages',
    lede: 'Turn every page, or only the ones that came out of the scanner sideways, and save the PDF that way for good.',
    description: 'Rotate all pages or selected pages of a PDF by 90, 180 or 270 degrees and save it. Runs in your browser, so the file is not uploaded.',
    steps: [
      'Drop in the PDF.',
      'Choose which way to turn it, and type page numbers if only some pages need it.',
      'Click Rotate and save the fixed PDF.',
    ],
    faq: [
      {
        q: 'My PDF reader already lets me rotate. Why use this?',
        a: 'Most readers only rotate the view, and the file opens sideways again next time. This changes the rotation stored in the file, so it opens the right way everywhere.',
      },
      {
        q: 'Is the page re-rendered?',
        a: 'No. Only the rotation setting of each page changes. Text stays selectable and image quality is untouched.',
      },
      PRIVATE,
    ],
  },
  {
    slug: 'pdf-to-jpg',
    tool: 'pdf-to-jpg',
    group: 'PDF',
    card: 'PDF to JPG',
    blurb: 'Turn each PDF page into a picture',
    title: 'PDF to JPG: turn each page into an image',
    h1: 'Convert PDF to JPG',
    lede: 'Turn each page of a PDF into a JPG picture, for sending, pasting into a form or putting in a slide. A one-page PDF gives one JPG; a longer one comes back as a zip of numbered JPGs.',
    description: 'Convert every page of a PDF to a JPG image in your browser, at 96, 150 or 300 dpi. The PDF is not uploaded.',
    steps: [
      'Drop in the PDF.',
      'Pick a resolution. 150 dpi suits most screens, and 300 dpi is better for printing.',
      'Click Convert to JPG and save the image, or the zip of images for a longer PDF.',
    ],
    faq: [
      {
        q: 'Why does each page become its own JPG?',
        a: 'A JPG holds one picture, so every page needs a file of its own. A PDF with several pages comes back as a zip file, with one JPG per page numbered in order.',
      },
      {
        q: 'Can I still read the text?',
        a: 'Yes, at 150 dpi or higher. The page is saved as a picture, though, so the text can no longer be selected or searched. Keep the original PDF if you need that.',
      },
      {
        q: 'Which resolution should I choose?',
        a: '150 dpi is plenty for reading on a screen or sending in a message. Choose 300 dpi when the pages will be printed. Higher numbers give bigger files.',
      },
      PRIVATE,
    ],
  },
  {
    slug: 'pdf-to-png',
    tool: 'pdf-to-png',
    group: 'PDF',
    card: 'PDF to PNG',
    blurb: 'Turn each PDF page into a sharp PNG image',
    title: 'PDF to PNG: turn each page into an image',
    h1: 'Convert PDF to PNG',
    lede: 'Turn each page of a PDF into a PNG picture. PNG keeps text and lines sharp, so it suits pages with small print or diagrams. A one-page PDF gives one PNG; a longer one comes back as a zip of numbered PNGs.',
    description: 'Convert every page of a PDF to a PNG image in your browser, at 96, 150 or 300 dpi. The PDF is not uploaded.',
    steps: [
      'Drop in the PDF.',
      'Pick a resolution. 150 dpi suits most screens, and 300 dpi is better for printing.',
      'Click Convert to PNG and save the image, or the zip of images for a longer PDF.',
    ],
    faq: [
      {
        q: 'Why does each page become its own PNG?',
        a: 'A PNG holds one picture, so every page needs a file of its own. A PDF with several pages comes back as a zip file, with one PNG per page numbered in order.',
      },
      {
        q: 'PNG or JPG: which should I choose?',
        a: 'PNG keeps text and lines sharp, so it is the better choice for documents and diagrams. JPG makes smaller files, which suits photos or pages you only need to send.',
      },
      {
        q: 'Why are the PNG files bigger?',
        a: 'PNG stores every pixel exactly, which is why a page of text makes a larger file than the same page as a JPG. Choose 96 or 150 dpi unless the pages will be printed.',
      },
      PRIVATE,
    ],
  },
  {
    slug: 'pdf-to-text',
    tool: 'pdf-to-text',
    group: 'PDF',
    card: 'PDF to text',
    blurb: 'Get the words out of a PDF as a .txt file',
    title: 'PDF to text: extract text from a PDF online',
    h1: 'Convert PDF to text',
    lede: 'Pull the text out of a PDF and save it as a plain .txt file you can paste into anything. It works on PDFs with real text in them, and it cannot read scanned pages.',
    description: 'Extract the text from a PDF in your browser and download it as a .txt file. Your PDF never leaves your device.',
    steps: [
      'Drop in the PDF.',
      'Click Extract text and read the result in the box.',
      'Save the .txt file and open it in any editor.',
    ],
    faq: [
      {
        q: 'Why did I get no text?',
        a: 'The PDF was probably made by scanning pages to images. A scan holds pictures, not words, so there is no text to extract. Use the PDF to JPG page and an OCR program for those files.',
      },
      {
        q: 'Does the layout come through?',
        a: 'The words come through in reading order, with the line breaks. Tables lose their columns and become lines of words. For tables, open the PDF in a spreadsheet-capable program instead.',
      },
      PRIVATE,
    ],
  },
  {
    slug: 'text-to-pdf',
    tool: 'text-to-pdf',
    group: 'PDF',
    card: 'Text to PDF',
    blurb: 'Turn a plain text file into a PDF',
    title: 'Text to PDF: convert a text or Markdown file to PDF online',
    h1: 'Convert text to PDF',
    lede: 'Make a PDF from a plain text file, such as a .txt note, a Markdown file or a log. The text keeps its line breaks, long lines are wrapped to fit the page, and the fixed-width font keeps any columns lined up.',
    description: 'Convert a plain text or Markdown file to a PDF in your browser. The file never leaves your device.',
    steps: [
      'Drop in the text file.',
      'Click Make PDF.',
      'Save the PDF and open it anywhere.',
    ],
    faq: [
      {
        q: 'Which files can I convert?',
        a: 'Plain text files, such as .txt, .md and .log. A Word .docx file is not plain text, so it will not work here. Save it as .txt first, then convert it.',
      },
      {
        q: 'How is the text laid out?',
        a: 'The PDF uses a fixed-width font at 10 points, like a typewriter, so columns in the text line up. Each line is wrapped to fit the page width. A word longer than a full line is cut in half.',
      },
      {
        q: 'What happens to unusual characters?',
        a: 'The built-in font covers basic Latin letters, digits and common punctuation. Other characters, such as Chinese or Cyrillic letters, come out as question marks.',
      },
      PRIVATE,
    ],
  },
  {
    slug: 'markdown-to-pdf',
    tool: 'text-to-pdf',
    group: 'PDF',
    card: 'Markdown to PDF',
    blurb: 'Turn a .md file into a PDF',
    preset: { accept: '.md,.markdown,text/markdown,text/plain' },
    title: 'Markdown to PDF converter online',
    h1: 'Convert Markdown to PDF',
    lede: 'Make a PDF from a Markdown file. The text keeps its line breaks, long lines are wrapped to fit the page and the fixed-width font keeps any columns lined up. The PDF holds the Markdown as plain text, not restyled formatting.',
    description: 'Convert Markdown (.md) to PDF in your browser. Fixed-width layout, line wrapping, and no upload. Good for archiving and sharing .md files.',
    steps: [
      'Drop in your .md or .markdown file.',
      'Click Make PDF.',
      'Save the PDF and open it anywhere.',
    ],
    faq: [
      {
        q: 'Does it render the Markdown?',
        a: 'No. The PDF shows the Markdown source as text, the same way it shows any other plain text file. Headings, bold and links appear as written, not as styled output. If you want rendered output, copy the Markdown into a viewer that exports to PDF.',
      },
      {
        q: 'How is the text laid out?',
        a: 'The PDF uses a fixed-width font at 10 points, like a typewriter. Long lines are wrapped to fit the page. A word longer than a full line is cut in half.',
      },
      {
        q: 'What characters come through?',
        a: 'The built-in font covers basic Latin letters, digits and common punctuation. Other characters, such as Chinese or Cyrillic letters, come out as question marks.',
      },
      PRIVATE,
    ],
  },
  {
    slug: 'jpg-to-pdf',
    tool: 'img-to-pdf',
    group: 'PDF',
    card: 'Images to PDF',
    blurb: 'Turn JPG or PNG images into a PDF',
    title: 'JPG to PDF: convert images to a PDF online',
    h1: 'Convert images to PDF',
    lede: 'Make one PDF from photos or scans, one image per page. Works with JPG, PNG, WebP and GIF, and you choose the page size.',
    description: 'Turn JPG, PNG or WebP images into a single PDF with one image per page. Pick A4, Letter or image size. Nothing is uploaded.',
    steps: [
      'Drop in your images. Phone photos and scans both work.',
      'Put them in order and pick a page size and margin.',
      'Click Make PDF and save it.',
    ],
    faq: [
      {
        q: 'Will my photos lose quality?',
        a: 'JPG and PNG files are placed in the PDF unchanged. Other formats such as WebP are converted to high-quality JPG first, because PDF cannot hold them directly.',
      },
      {
        q: 'Which page size should I choose?',
        a: 'Use "Same as image" for a PDF that looks exactly like your pictures. Use A4 or Letter if you plan to print it or a form asks for a standard page; wide images are placed on landscape pages.',
      },
      {
        q: 'Can I add iPhone HEIC photos?',
        a: 'Yes. Browsers other than Safari download a small decoder the first time a HEIC file is added, so that file takes a little longer. You can also have the iPhone save JPG instead under Settings, Camera, Formats, Most Compatible.',
      },
      PRIVATE,
    ],
  },

  {
    slug: 'png-to-pdf',
    tool: 'img-to-pdf',
    group: 'PDF',
    card: 'PNG to PDF',
    blurb: 'Put PNG screenshots or scans into one PDF',
    title: 'PNG to PDF converter: put PNG images in a PDF online',
    h1: 'Convert PNG to PDF',
    lede: 'Make one PDF from PNG images, one image per page. PNG files go into the PDF as they are, so screenshots and scanned text keep their sharp edges.',
    description: 'Convert PNG images to a PDF in your browser, one image per page. Pick A4, Letter or the image size. Your files are never uploaded.',
    steps: ['Drop in your PNG files.', 'Put them in order and pick a page size and margin.', 'Click Make PDF and save it.'],
    faq: [
      {
        q: 'Will my PNG screenshots still be sharp?',
        a: 'Yes. PNG files are placed in the PDF without being resaved as JPG, so text and lines keep their sharp edges.',
      },
      {
        q: 'Can I mix PNG and JPG files in one PDF?',
        a: 'Yes. Drop them all in at once. Each image becomes one page, in the order shown in the list.',
      },
      PRIVATE,
    ],
  },

  {
    slug: 'webp-to-pdf',
    tool: 'img-to-pdf',
    group: 'PDF',
    card: 'WebP to PDF',
    blurb: 'Put WebP images into one PDF',
    title: 'WebP to PDF converter: put WebP images in a PDF online',
    h1: 'Convert WebP to PDF',
    lede: 'Make one PDF from WebP images, one image per page. PDF cannot hold WebP directly, so each file is redrawn as a high-quality JPG before it goes in.',
    description: 'Convert WebP images to a PDF in your browser, one image per page. Pick A4, Letter or the image size. Your files are never uploaded.',
    steps: ['Drop in your WebP files.', 'Put them in order and pick a page size and margin.', 'Click Make PDF and save it.'],
    faq: [
      {
        q: 'Will the WebP images lose quality?',
        a: 'Slightly, if they have fine detail. Each WebP is redrawn as a JPG at quality 92 before it goes into the PDF. If you need the pixels exactly, save the files as PNG first and use the PNG to PDF page.',
      },
      {
        q: 'Can I mix WebP and JPG files in one PDF?',
        a: 'Yes. Drop them all in at once. Each image becomes one page, in the order shown in the list.',
      },
      PRIVATE,
    ],
  },

  {
    slug: 'heic-to-pdf',
    tool: 'img-to-pdf',
    group: 'PDF',
    card: 'HEIC to PDF',
    blurb: 'Put iPhone photos into one PDF',
    preset: { accept: 'image/heic,image/heif,.heic,.heif' },
    title: 'HEIC to PDF converter for iPhone photos',
    h1: 'Convert HEIC to PDF',
    lede: 'Turn iPhone HEIC photos into one PDF, one photo per page. Useful for applications, records and printing.',
    description: 'Convert HEIC photos from an iPhone to a PDF in your browser, one per page, in the order you choose. Your photos are never uploaded.',
    steps: ['Drop in your .heic files.', 'Put them in order and pick a page size and margin.', 'Click Make PDF and save it.'],
    faq: [
      {
        q: 'Why does the first photo take longer?',
        a: "Most browsers can't read HEIC on their own, so the page downloads a decoder the first time you convert. Safari reads HEIC itself and skips this step.",
      },
      {
        q: 'Do the photos lose quality?',
        a: 'They are redrawn as JPG inside the PDF, at high quality. For an exact copy of a photo, convert it to PNG first and use the PNG to PDF page.',
      },
      PRIVATE,
    ],
  },
  {
    slug: 'gif-to-pdf',
    tool: 'img-to-pdf',
    group: 'PDF',
    card: 'GIF to PDF',
    blurb: 'Put GIF images into one PDF',
    preset: { accept: 'image/gif,.gif' },
    title: 'GIF to PDF converter that works in your browser',
    h1: 'Convert GIF to PDF',
    lede: 'Make one PDF from GIF images, one per page. Only the first frame of an animated GIF is kept, since PDF can hold a picture but not the animation.',
    description: 'Convert GIF images to a PDF in your browser, one per page. Animated GIFs keep their first frame. Your files are never uploaded.',
    steps: ['Drop in your .gif files.', 'Put them in order and pick a page size and margin.', 'Click Make PDF and save it.'],
    faq: [
      {
        q: 'What happens to the animation?',
        a: 'It is dropped. Each GIF keeps only its first frame as a picture in the PDF. To keep the motion, use the GIF file itself.',
      },
      {
        q: 'Do the GIFs lose quality?',
        a: 'They are redrawn as JPG inside the PDF, at high quality. GIFs with few colors or flat shapes can look soft on the edges. Save them as PNG first and use the PNG to PDF page for an exact copy.',
      },
      PRIVATE,
    ],
  },
  {
    slug: 'svg-to-pdf',
    tool: 'img-to-pdf',
    group: 'PDF',
    card: 'SVG to PDF',
    blurb: 'Put vector drawings into one PDF',
    preset: { accept: 'image/svg+xml,.svg' },
    title: 'SVG to PDF converter that works in your browser',
    h1: 'Convert SVG to PDF',
    lede: 'Make one PDF from SVG drawings, one drawing per page. Each SVG is drawn and saved inside the PDF as a picture.',
    description: 'Convert SVG vector drawings to a PDF in your browser, one per page. Pick image size, A4 or Letter. Your file is never uploaded.',
    steps: ['Drop in your .svg files.', "Pick a page size and margin, or keep the SVG's own size.", 'Click Make PDF and save it.'],
    faq: [
      {
        q: 'Is the SVG still vector in the PDF?',
        a: "No. Each SVG is drawn onto a canvas and saved as a JPG picture inside the PDF. It is drawn at the SVG's own size, so a small SVG will look soft if the PDF is scaled up. Use the Resize page to enlarge the drawing first if you need a bigger one.",
      },
      {
        q: 'What happens to transparent areas?',
        a: 'They come out white, because the SVG is saved as a JPG inside the PDF. If you need transparency, save the drawing as a PNG first and use the PNG to PDF page.',
      },
      PRIVATE,
    ],
  },
  {
    slug: 'bmp-to-pdf',
    tool: 'img-to-pdf',
    group: 'PDF',
    card: 'BMP to PDF',
    blurb: 'Put BMP pictures into one PDF',
    preset: { accept: 'image/bmp,.bmp' },
    title: 'BMP to PDF converter that works in your browser',
    h1: 'Convert BMP to PDF',
    lede: 'Make one PDF from BMP pictures, one picture per page, in the order you choose. The converting happens in your browser, so the files stay on your own device.',
    description: 'Convert BMP files to a PDF in your browser, one per page, in the order you choose. Pick a page size and margin. Your files are never uploaded.',
    steps: ['Drop in your .bmp files.', 'Put them in order and pick a page size and margin.', 'Click Make PDF and save it.'],
    faq: [
      {
        q: 'Do the pictures lose quality?',
        a: 'They are redrawn as JPG inside the PDF at high quality, because PDF cannot hold a BMP as is. Flat colors and sharp edges can look soft. For an exact copy, convert each BMP to PNG first and use the PNG to PDF page.',
      },
      {
        q: 'Why is my BMP file so big?',
        a: 'BMP stores every pixel uncompressed, so even an ordinary picture can be several megabytes. The PDF keeps each page as a JPG, which is usually much smaller than the BMP it came from.',
      },
      PRIVATE,
    ],
  },
  {
    slug: 'avif-to-pdf',
    tool: 'img-to-pdf',
    group: 'PDF',
    card: 'AVIF to PDF',
    blurb: 'Put AVIF pictures into one PDF',
    preset: { accept: 'image/avif,.avif' },
    title: 'AVIF to PDF converter that works in your browser',
    h1: 'Convert AVIF to PDF',
    lede: 'Make one PDF from AVIF pictures, one picture per page, in the order you choose. The converting happens in your browser, so the files stay on your own device.',
    description: 'Convert AVIF files to a PDF in your browser, one per page, in the order you choose. Pick a page size and margin. Your files are never uploaded.',
    steps: ['Drop in your .avif files.', 'Put them in order and pick a page size and margin.', 'Click Make PDF and save it.'],
    faq: [
      {
        q: 'Do the pictures lose quality?',
        a: 'They are redrawn as JPG inside the PDF at high quality, because PDF cannot hold an AVIF as is. Fine detail can soften. For an exact copy of a picture, convert it to PNG first and use the PNG to PDF page.',
      },
      {
        q: 'Can every browser open AVIF?',
        a: 'Current Chrome, Firefox, Edge and Safari can. Older ones cannot, which is the usual reason to turn AVIFs into one PDF somebody else can open anywhere.',
      },
      PRIVATE,
    ],
  },

  // ---------- Images ----------
  {
    slug: 'convert-image',
    tool: 'img-convert',
    group: 'Images',
    card: 'Convert image',
    blurb: 'Switch between image formats',
    title: 'Image converter: JPG, PNG, GIF, WebP and AVIF online',
    h1: 'Convert images',
    lede: 'Change images between JPG, PNG, WebP and AVIF. You can drop in JPG, PNG, WebP, GIF, AVIF, SVG, BMP or ICO files. Convert one file or a whole batch, with a quality setting for the formats that use one.',
    description: 'Convert images between JPG, PNG, WebP and AVIF in your browser. GIFs, SVGs, BMPs and ICO files can be read too. Batch conversion, adjustable quality, and no uploads.',
    steps: [
      'Drop in one or more images.',
      'Pick the format you want and, for JPG, WebP or AVIF, a quality level.',
      'Click Convert, then save each file or all of them as a zip.',
    ],
    faq: [
      {
        q: 'Which format should I pick?',
        a: 'JPG works everywhere and suits photos. PNG keeps sharp edges and transparency, which is good for screenshots and logos. WebP and AVIF make much smaller files that all current browsers can show, which helps on websites.',
      },
      {
        q: 'What happens to transparent areas when I convert to JPG?',
        a: 'JPG has no transparency, so transparent areas become white.',
      },
      {
        q: 'Can I convert a GIF or an SVG?',
        a: 'Yes. Drop in a GIF, SVG, BMP or ICO and pick the format you want. Animated GIFs keep only their first frame, and an SVG is drawn onto a canvas at its own size. An ICO icon is read at the largest size it stores. HEIC photos need their own page: use HEIC to JPG or HEIC to PNG.',
      },
      {
        q: 'Why does AVIF take longer?',
        a: 'AVIF squeezes images harder than the other formats, so encoding takes more work. A large photo can take a few seconds.',
      },
      PRIVATE,
    ],
  },
  {
    slug: 'png-to-jpg',
    tool: 'img-convert',
    group: 'Images',
    card: 'PNG to JPG',
    blurb: 'Smaller files from PNG photos',
    preset: { out: 'image/jpeg', accept: 'image/png,.png' },
    title: 'PNG to JPG converter that works in your browser',
    h1: 'Convert PNG to JPG',
    lede: 'Turn PNG images into JPG files, which are usually far smaller for photos. Transparent areas are filled with white.',
    description: 'Convert PNG to JPG online, one file or many at once. Adjustable quality, white background for transparent areas. Files stay on your device.',
    steps: ['Drop in your PNG files.', 'JPG is already selected. Move the quality slider if you want smaller files.', 'Click Convert and save.'],
    faq: [
      {
        q: 'Why is my JPG so much smaller than the PNG?',
        a: 'PNG stores every pixel exactly, while JPG drops detail your eye barely notices. For photos that usually cuts the size by 70 percent or more.',
      },
      {
        q: 'Should I convert screenshots to JPG?',
        a: 'Usually not. Text and flat color can look smudgy in JPG. WebP keeps them crisp and is still small.',
      },
      PRIVATE,
    ],
  },
  {
    slug: 'jpg-to-png',
    tool: 'img-convert',
    group: 'Images',
    card: 'JPG to PNG',
    blurb: 'Lossless PNG files from JPG photos',
    preset: { out: 'image/png', accept: 'image/jpeg,.jpg,.jpeg' },
    title: 'JPG to PNG converter that works in your browser',
    h1: 'Convert JPG to PNG',
    lede: 'Turn JPG photos into PNG files. PNG stores every pixel exactly as it is, which some apps and websites ask for. It cannot bring back detail that JPG has already thrown away.',
    description: 'Convert JPG to PNG online, one file or many at once. Saves lossless PNG files. Your photos stay on your device.',
    steps: ['Drop in your JPG files.', 'PNG is already selected. Change it only if you need another format.', 'Click Save to download the PNG files.'],
    faq: [
      {
        q: 'Will the PNG look better than the JPG?',
        a: 'No. The pixels are the same, so the picture looks the way the JPG did. Converting does not add back the detail JPG removed when it was saved.',
      },
      {
        q: 'Why is the PNG so much bigger?',
        a: 'PNG stores every pixel exactly, while JPG throws away detail to save space. Photos saved as PNG are usually larger than the JPG they came from.',
      },
      PRIVATE,
    ],
  },
  {
    slug: 'webp-to-jpg',
    tool: 'img-convert',
    group: 'Images',
    card: 'WebP to JPG',
    blurb: 'Open WebP images anywhere',
    preset: { out: 'image/jpeg', accept: 'image/webp,.webp' },
    title: 'WebP to JPG converter: save WebP images as JPG',
    h1: 'Convert WebP to JPG',
    lede: 'Images saved from websites often come down as WebP, which some apps still refuse to open. Turn them into ordinary JPG files.',
    description: 'Convert WebP images to JPG so they open in any app. Batch convert in your browser with no upload and no sign-up.',
    steps: ['Drop in your .webp files.', 'JPG is already selected. Pick PNG instead if the image has a transparent background.', 'Click Convert and save.'],
    faq: [
      {
        q: 'Why do websites use WebP?',
        a: 'WebP files are smaller than JPG at the same quality, so pages load faster. The catch is that some older apps and upload forms still reject them.',
      },
      PRIVATE,
    ],
  },
  {
    slug: 'heic-to-jpg',
    tool: 'img-convert',
    group: 'Images',
    card: 'HEIC to JPG',
    blurb: 'Turn iPhone photos into JPG',
    preset: { out: 'image/jpeg', accept: 'image/heic,image/heif,.heic,.heif' },
    title: 'HEIC to JPG converter for iPhone photos',
    h1: 'Convert HEIC to JPG',
    lede: "iPhones save photos as HEIC, which many Windows apps and upload forms won't open. Turn them into ordinary JPG files, one photo or a whole batch.",
    description: 'Convert iPhone HEIC photos to JPG in your browser, one at a time or in a batch. Your photos are never uploaded.',
    steps: [
      'Drop in your .heic files.',
      'JPG is already selected. Move the quality slider if you want smaller files.',
      'Click Convert, then save each photo or all of them as a zip.',
    ],
    faq: [
      {
        q: 'Why does my iPhone save HEIC photos?',
        a: "A HEIC file is about half the size of a JPG at the same quality, so it takes less room on the phone. Many apps outside Apple's still can't open them, though.",
      },
      {
        q: 'Will the JPG look worse?',
        a: 'Slightly, as with any JPG. At the default quality of 85 the difference is hard to see. Move the slider up to 95 to keep more detail.',
      },
      {
        q: 'Does the JPG keep the location and camera details?',
        a: 'No. The JPG is drawn fresh from the pixels, so the date, location and camera details are left out.',
      },
      {
        q: 'Why does the first photo take longer?',
        a: "Most browsers can't read HEIC on their own, so the page downloads a decoder the first time you convert. Safari reads HEIC itself and skips this step.",
      },
      PRIVATE,
    ],
  },
  {
    slug: 'heic-to-png',
    tool: 'img-convert',
    group: 'Images',
    card: 'HEIC to PNG',
    blurb: 'Turn iPhone photos into PNG',
    preset: { out: 'image/png', accept: 'image/heic,image/heif,.heic,.heif' },
    title: 'HEIC to PNG converter for iPhone photos',
    h1: 'Convert HEIC to PNG',
    lede: 'Turn iPhone HEIC photos into PNG files. PNG keeps every pixel, but its files are usually larger than HEIC or JPG, so use it when an app asks for PNG or when you plan to edit the photo.',
    description: 'Convert iPhone HEIC photos to PNG in your browser, one at a time or in a batch. Your photos are never uploaded.',
    steps: ['Drop in your .heic files.', 'PNG is already selected.', 'Click Convert, then save each photo or all of them as a zip.'],
    faq: [
      {
        q: 'Is PNG better than JPG for photos?',
        a: 'It depends on the photo. PNG is exact, so it suits screenshots, text and sharp graphics. For a photo you only want to share, JPG is usually the smaller choice.',
      },
      {
        q: 'Does the PNG keep the location and camera details?',
        a: 'No. The PNG is drawn fresh from the pixels, so the date, location and camera details are left out.',
      },
      {
        q: 'Why does the first photo take longer?',
        a: "Most browsers can't read HEIC on their own, so the page downloads a decoder the first time you convert. Safari reads HEIC itself and skips this step.",
      },
      PRIVATE,
    ],
  },
  {
    slug: 'heic-to-webp',
    tool: 'img-convert',
    group: 'Images',
    card: 'HEIC to WebP',
    blurb: 'WebP files from iPhone photos',
    preset: { out: 'image/webp', accept: 'image/heic,image/heif,.heic,.heif' },
    title: 'HEIC to WebP converter for iPhone photos',
    h1: 'Convert HEIC to WebP',
    lede: 'Turn iPhone HEIC photos into WebP, which keeps files small and opens in every current browser.',
    description: 'Convert iPhone HEIC photos to WebP in your browser, one at a time or in a batch. Your photos are never uploaded.',
    steps: ['Drop in your .heic files.', 'WebP is already selected. Move the quality slider if you want smaller files.', 'Click Convert, then save each photo or all of them as a zip.'],
    faq: [
      {
        q: 'Will older apps open WebP?',
        a: 'Current browsers and newer apps can. Some older programs and upload forms still reject WebP. If one does, convert to JPG with the HEIC to JPG page instead.',
      },
      {
        q: 'Does the WebP keep the location and camera details?',
        a: 'No. The WebP is drawn fresh from the pixels, so the date, location and camera details are left out.',
      },
      {
        q: 'Why does the first photo take longer?',
        a: "Most browsers can't read HEIC on their own, so the page downloads a decoder the first time you convert. Safari reads HEIC itself and skips this step.",
      },
      PRIVATE,
    ],
  },
  {
    slug: 'avif-to-jpg',
    tool: 'img-convert',
    group: 'Images',
    card: 'AVIF to JPG',
    blurb: 'Save AVIF images as JPG',
    preset: { out: 'image/jpeg', accept: 'image/avif,.avif' },
    title: 'AVIF to JPG converter: save AVIF images as JPG online',
    h1: 'Convert AVIF to JPG',
    lede: 'Save AVIF images as JPG files, which almost every app and upload form accepts. AVIF is a newer format, and many older programs still cannot open it.',
    description: 'Convert AVIF images to JPG in your browser, one at a time or in a batch. Your images are never uploaded.',
    steps: ['Drop in your .avif files.', 'JPG is already selected. Move the quality slider if you want smaller files.', 'Click Convert, then save each image or all of them as a zip.'],
    faq: [
      {
        q: 'Why will my AVIF file not open?',
        a: 'AVIF is newer than JPG and PNG, so older photo viewers, email apps and upload forms may not read it. A JPG opens nearly everywhere.',
      },
      {
        q: 'Will the JPG look worse?',
        a: 'Slightly, as with any JPG. At the default quality of 85 the difference is hard to see. Move the slider up to 95 to keep more detail.',
      },
      {
        q: 'Does my browser need to open AVIF?',
        a: 'Yes. The page draws the image with your browser, so it works in browsers that can show AVIF files. If a file does not open, try the newest version of your browser.',
      },
      PRIVATE,
    ],
  },
  {
    slug: 'avif-to-png',
    tool: 'img-convert',
    group: 'Images',
    card: 'AVIF to PNG',
    blurb: 'Open AVIF images anywhere',
    preset: { out: 'image/png', accept: 'image/avif,.avif' },
    title: 'AVIF to PNG converter that works in your browser',
    h1: 'Convert AVIF to PNG',
    lede: 'Turn AVIF images into PNG files that open anywhere. Transparency is kept.',
    description: 'Convert AVIF images to PNG in your browser so they open in any app. Transparency is kept. Your file is never uploaded.',
    steps: ['Drop in your .avif files.', 'PNG is already selected.', 'Click Convert, then save each image or all of them as a zip.'],
    faq: [
      {
        q: 'What if the page cannot read my AVIF?',
        a: 'Your browser has to open the AVIF first. Chrome, Firefox, Edge and recent Safari can. An older browser cannot, and the page says so instead of failing quietly.',
      },
      {
        q: 'Will the PNG be bigger than the AVIF?',
        a: 'Yes, usually. AVIF compresses photos hard, and PNG keeps every pixel. Expect the PNG to be larger than the AVIF.',
      },
      PRIVATE,
    ],
  },
  {
    slug: 'jpg-to-avif',
    tool: 'img-convert',
    group: 'Images',
    card: 'JPG to AVIF',
    blurb: 'Make AVIF images from JPG photos',
    preset: { out: 'image/avif', accept: 'image/jpeg,image/png,.jpg,.jpeg,.png' },
    title: 'JPG to AVIF converter: save JPG photos as AVIF online',
    h1: 'Convert JPG to AVIF',
    lede: 'Save JPG photos as AVIF, a newer format that often makes smaller files. Check that the site or app you will upload to accepts AVIF first.',
    description: 'Convert JPG and PNG photos to AVIF in your browser, one at a time or in a batch. Your photos are never uploaded.',
    steps: ['Drop in your .jpg or .png files.', 'AVIF is already selected. Move the quality slider to change the file size.', 'Click Convert, then save each image or all of them as a zip.'],
    faq: [
      {
        q: 'Will every app open AVIF?',
        a: 'No. Many older programs and some upload forms still reject AVIF. If a site rejects the file, convert it back to JPG with the AVIF to JPG page.',
      },
      {
        q: 'What does the quality slider do?',
        a: 'Lower numbers make smaller files with more softening in fine detail. The default is set where most photos look good. Move the slider up if faces or text look soft.',
      },
      PRIVATE,
    ],
  },
  {
    slug: 'png-to-avif',
    tool: 'img-convert',
    group: 'Images',
    card: 'PNG to AVIF',
    blurb: 'Smaller AVIF files from PNG images',
    preset: { out: 'image/avif', accept: 'image/png,.png' },
    title: 'PNG to AVIF converter: save PNGs as AVIF online',
    h1: 'Convert PNG to AVIF',
    lede: 'Turn PNG images into AVIF, which often makes smaller files than PNG. Transparency is kept. Check that the site or app you will upload to accepts AVIF first.',
    description: 'Convert PNG images to AVIF in your browser, one at a time or in a batch. Transparency is kept. Your images are never uploaded.',
    steps: ['Drop in your PNG files.', 'AVIF is already selected. Move the quality slider to change the file size.', 'Click Convert, then save each image or all of them as a zip.'],
    faq: [
      {
        q: 'Will every app open AVIF?',
        a: 'No. Many older programs and some upload forms still reject AVIF. If a site rejects the file, convert it back to PNG with the AVIF to PNG page.',
      },
      {
        q: 'Does the AVIF keep the transparency?',
        a: 'Yes. AVIF stores an alpha channel, so transparent areas stay transparent.',
      },
      PRIVATE,
    ],
  },
  {
    slug: 'webp-to-avif',
    tool: 'img-convert',
    group: 'Images',
    card: 'WebP to AVIF',
    blurb: 'Save WebP images as AVIF',
    preset: { out: 'image/avif', accept: 'image/webp,.webp' },
    title: 'WebP to AVIF converter that works in your browser',
    h1: 'Convert WebP to AVIF',
    lede: 'Turn WebP images into AVIF, which often compresses photos further. Transparency is kept. Check that the place you will use the file opens AVIF first.',
    description: 'Convert WebP to AVIF online, one file or many at once. Transparency is kept. Your images stay on your device.',
    steps: ['Drop in your WebP files.', 'AVIF is already selected. Move the quality slider to change the file size.', 'Click Convert, then save each image or all of them as a zip.'],
    faq: [
      {
        q: 'Will every app open AVIF?',
        a: 'No. Many older programs and some upload forms still reject AVIF. If a site rejects the file, convert it back to WebP with the AVIF to WebP page.',
      },
      {
        q: 'Is AVIF always smaller than WebP?',
        a: 'Often a bit smaller for photos, but not always. The two formats make similar trade-offs, so compare the sizes before replacing the original.',
      },
      PRIVATE,
    ],
  },
  {
    slug: 'avif-to-webp',
    tool: 'img-convert',
    group: 'Images',
    card: 'AVIF to WebP',
    blurb: 'Save AVIF images as WebP',
    preset: { out: 'image/webp', accept: 'image/avif,.avif' },
    title: 'AVIF to WebP converter that works in your browser',
    h1: 'Convert AVIF to WebP',
    lede: 'Turn AVIF images into WebP for apps and upload forms that do not take AVIF yet. Transparency is kept.',
    description: 'Convert AVIF to WebP online, one file or many at once. Transparency is kept. Your images stay on your device.',
    steps: ['Drop in your AVIF files.', 'WebP is already selected. Move the quality slider if you want smaller files.', 'Click Convert, then save each image or all of them as a zip.'],
    faq: [
      {
        q: 'Why convert AVIF to WebP?',
        a: 'Some older programs and upload forms reject AVIF but accept WebP. Converting keeps the transparency and usually keeps the file small.',
      },
      {
        q: 'Does anything get lost?',
        a: 'Both formats are lossy at the default quality, so each conversion can soften fine detail a little. Start from the original AVIF when you can, not from a re-saved copy.',
      },
      PRIVATE,
    ],
  },
  {
    slug: 'svg-to-png',
    tool: 'img-convert',
    group: 'Images',
    card: 'SVG to PNG',
    blurb: 'Turn vector files into PNG images',
    preset: { out: 'image/png', accept: 'image/svg+xml,.svg' },
    title: 'SVG to PNG converter that works in your browser',
    h1: 'Convert SVG to PNG',
    lede: 'Turn SVG files into plain PNG images. Handy when an app or form refuses the SVG itself.',
    description: 'Convert SVG vector files to PNG in your browser. The PNG is made at the SVG\'s own size, transparency is kept. Your file is never uploaded.',
    steps: ['Drop in your .svg files.', 'PNG is already selected. Change it only if you need another format.', 'Click Convert and save.'],
    faq: [
      {
        q: 'What size is the PNG?',
        a: 'The size from the SVG\'s width and height, or its viewBox when it has none. An SVG with no size at all is drawn at 1024 by 768. Use the Resize page if you need a different size.',
      },
      {
        q: 'Why does the SVG look different here than in my editor?',
        a: 'The page draws the SVG the way a browser draws it. SVGs that rely on fonts installed on your computer, or on outside images, may show fallback text or miss pieces.',
      },
      PRIVATE,
    ],
  },
  {
    slug: 'svg-to-jpg',
    tool: 'img-convert',
    group: 'Images',
    card: 'SVG to JPG',
    blurb: 'Turn vector files into JPG images',
    preset: { out: 'image/jpeg', accept: 'image/svg+xml,.svg' },
    title: 'SVG to JPG converter that works in your browser',
    h1: 'Convert SVG to JPG',
    lede: 'Turn SVG files into JPG images. Transparent areas come out white, since JPG has no transparency.',
    description: 'Convert SVG vector files to JPG in your browser. Transparent areas are filled with white. Your file is never uploaded.',
    steps: ['Drop in your .svg files.', 'JPG is already selected. Move the quality slider if you want smaller files.', 'Click Convert and save.'],
    faq: [
      {
        q: 'What happens to transparent areas?',
        a: 'JPG cannot hold transparency, so those pixels are painted white underneath. Pick PNG instead if the image needs to stay on a transparent background.',
      },
      {
        q: 'What size is the JPG?',
        a: 'The size from the SVG\'s width and height, or its viewBox when it has none. An SVG with no size at all is drawn at 1024 by 768. Use the Resize page if you need a different size.',
      },
      PRIVATE,
    ],
  },
  {
    slug: 'svg-to-webp',
    tool: 'img-convert',
    group: 'Images',
    card: 'SVG to WebP',
    blurb: 'Turn vector files into WebP images',
    preset: { out: 'image/webp', accept: 'image/svg+xml,.svg' },
    title: 'SVG to WebP converter that works in your browser',
    h1: 'Convert SVG to WebP',
    lede: 'Turn SVG files into WebP images, with transparency kept. The WebP is made at the SVG\'s own size and is usually smaller than a PNG of the same picture.',
    description: 'Convert SVG vector files to WebP in your browser. Transparency is kept and the WebP is made at the SVG\'s own size. Your file is never uploaded.',
    steps: ['Drop in your .svg files.', 'WebP is already selected. Move the quality slider if you want smaller files.', 'Click Convert and save.'],
    faq: [
      {
        q: 'What size is the WebP?',
        a: 'The size from the SVG\'s width and height, or its viewBox when it has none. An SVG with no size at all is drawn at 1024 by 768. Use the Resize page if you need a different size.',
      },
      {
        q: 'Why does the SVG look different here than in my editor?',
        a: 'The page draws the SVG the way a browser draws it. SVGs that rely on fonts installed on your computer, or on outside images, may show fallback text or miss pieces.',
      },
      PRIVATE,
    ],
  },
  {
    slug: 'png-to-ico',
    tool: 'img-ico',
    group: 'Images',
    card: 'PNG to ICO',
    blurb: 'Make a .ico favicon file from a PNG',
    title: 'PNG to ICO converter: make a .ico favicon from a PNG',
    h1: 'Convert PNG to ICO',
    lede: 'Turn a PNG into a .ico file, the format browsers and desktops use for favicons and shortcuts. The file holds 16, 32 and 48 px versions of the image, and transparency is kept.',
    description: 'Convert a PNG to a .ico favicon file in your browser. The file holds 16, 32 and 48 px sizes. Your image stays on your device.',
    steps: ['Drop in your PNG files.', 'Nothing to set. The three sizes are made from your image.', 'Click Save to download the .ico file, or all of them as a zip.'],
    faq: [
      {
        q: 'What sizes end up in the file?',
        a: '16 by 16, 32 by 32 and 48 by 48 pixels. Each app picks the size it needs. If the PNG is not square, the image is centered on a transparent square instead of being stretched.',
      },
      {
        q: 'Where does the .ico file go on my site?',
        a: 'Save it as favicon.ico in the root folder of your site. Browsers that look for /favicon.ico will use it. A link tag that points at the file works too.',
      },
      PRIVATE,
    ],
  },
  {
    slug: 'ico-to-png',
    tool: 'img-convert',
    group: 'Images',
    card: 'ICO to PNG',
    blurb: 'Save a .ico favicon as a PNG',
    preset: { out: 'image/png', accept: 'image/x-icon,image/vnd.microsoft.icon,.ico' },
    title: 'ICO to PNG converter: save a .ico file as PNG online',
    h1: 'Convert ICO to PNG',
    lede: 'Open a .ico favicon file and save it as a PNG. An ICO can hold several sizes of the same picture; the page uses the image your browser decodes, which is usually the largest size in the file.',
    description: 'Convert a .ico favicon to a PNG image in your browser. Transparency is kept. The file never leaves your device.',
    steps: ['Drop in your .ico files.', 'PNG is already selected.', 'Click Convert, then save each image or all of them as a zip.'],
    faq: [
      {
        q: 'What happens to the other sizes in the file?',
        a: 'An ICO can hold several sizes of the same picture. The page keeps the one your browser decodes from the file, which is usually the largest. The smaller sizes are dropped.',
      },
      {
        q: 'Will transparency survive?',
        a: 'Yes. ICO files hold 32 bit color with an alpha channel, and PNG keeps it. That is the usual reason to convert a favicon this way.',
      },
      PRIVATE,
    ],
  },
  {
    slug: 'jpg-to-ico',
    tool: 'img-ico',
    group: 'Images',
    card: 'JPG to ICO',
    blurb: 'Make a .ico favicon file from a JPG',
    preset: { accept: 'image/jpeg,.jpg,.jpeg' },
    title: 'JPG to ICO converter: make a .ico favicon from a JPG',
    h1: 'Convert JPG to ICO',
    lede: 'Turn a JPG into a .ico file, the format browsers and desktops use for favicons and shortcuts. The file holds 16, 32 and 48 px versions of the image.',
    description: 'Convert a JPG to a .ico favicon file in your browser. The file holds 16, 32 and 48 px sizes. Your image stays on your device.',
    steps: ['Drop in your JPG files.', 'Nothing to set. The three sizes are made from your image.', 'Click Save to download the .ico file, or all of them as a zip.'],
    faq: [
      {
        q: 'What sizes end up in the file?',
        a: '16 by 16, 32 by 32 and 48 by 48 pixels. Each app picks the size it needs. If the JPG is not square, the image is centered on a square canvas instead of being stretched.',
      },
      {
        q: 'Where does the .ico file go on my site?',
        a: 'Save it as favicon.ico in the root folder of your site. Browsers that look for /favicon.ico will use it. A link tag that points at the file works too.',
      },
      PRIVATE,
    ],
  },
  {
    slug: 'webp-to-ico',
    tool: 'img-ico',
    group: 'Images',
    card: 'WebP to ICO',
    blurb: 'Make a .ico favicon file from a WebP',
    preset: { accept: 'image/webp,.webp' },
    title: 'WebP to ICO converter: make a .ico favicon from a WebP',
    h1: 'Convert WebP to ICO',
    lede: 'Turn a WebP into a .ico file, the format browsers and desktops use for favicons and shortcuts. The file holds 16, 32 and 48 px versions of the image.',
    description: 'Convert a WebP to a .ico favicon file in your browser. The file holds 16, 32 and 48 px sizes. Your image stays on your device.',
    steps: ['Drop in your WebP files.', 'Nothing to set. The three sizes are made from your image.', 'Click Save to download the .ico file, or all of them as a zip.'],
    faq: [
      {
        q: 'What sizes end up in the file?',
        a: '16 by 16, 32 by 32 and 48 by 48 pixels. Each app picks the size it needs. If the WebP is not square, the image is centered on a square canvas instead of being stretched.',
      },
      {
        q: 'Will the transparency survive?',
        a: 'Yes. WebP holds an alpha channel and ICO files store 32 bit color with alpha, so a transparent background stays transparent.',
      },
      PRIVATE,
    ],
  },
  {
    slug: 'svg-to-ico',
    tool: 'img-ico',
    group: 'Images',
    card: 'SVG to ICO',
    blurb: 'Make a .ico favicon file from an SVG',
    preset: { accept: 'image/svg+xml,.svg' },
    title: 'SVG to ICO converter: make a .ico favicon from an SVG',
    h1: 'Convert SVG to ICO',
    lede: 'Turn an SVG into a .ico file, the format browsers and desktops use for favicons and shortcuts. The file holds 16, 32 and 48 px versions of the image.',
    description: 'Convert an SVG to a .ico favicon file in your browser. The file holds 16, 32 and 48 px sizes. Your image stays on your device.',
    steps: ['Drop in your .svg files.', 'Nothing to set. The three sizes are made from your image.', 'Click Save to download the .ico file, or all of them as a zip.'],
    faq: [
      {
        q: 'Will the icon be sharp?',
        a: 'The SVG is drawn at its own size first, then scaled into the 16, 32 and 48 px pictures. An SVG with a large or no width and height gives the cleanest small icons. An SVG drawn at 16 px will look soft.',
      },
      {
        q: 'Why did my SVG fail to convert?',
        a: 'An SVG that references outside images or fonts can be blocked. The usual fix is an SVG with everything inside it. If the SVG has no size information, it is drawn at 1024 by 768.',
      },
      PRIVATE,
    ],
  },
  {
    slug: 'ico-to-jpg',
    tool: 'img-convert',
    group: 'Images',
    card: 'ICO to JPG',
    blurb: 'Save an ICO icon as a JPG image',
    preset: { out: 'image/jpeg', accept: '.ico,image/x-icon,image/vnd.microsoft.icon' },
    title: 'ICO to JPG converter that works in your browser',
    h1: 'Convert ICO to JPG',
    lede: 'Save an ICO icon as a JPG image. The largest size stored in the icon is used, and transparent areas are filled with white.',
    description: 'Convert ICO icons to JPG in your browser. The largest size in the file is kept. Transparent areas turn white. Your files are never uploaded.',
    steps: ['Drop in your .ico files.', 'JPG is already selected. Move the quality slider if you want a smaller file.', 'Click Convert, then save each image or all of them as a zip.'],
    faq: [
      {
        q: 'Why is the JPG so small?',
        a: 'An ICO file holds small pictures, usually 16 to 256 pixels on a side. This page uses the largest one it finds, so the JPG is never bigger than that.',
      },
      {
        q: 'What happens to the transparency?',
        a: 'JPG cannot store it, so transparent areas are filled with white. If you need the transparent background, use the ICO to PNG page instead.',
      },
      PRIVATE,
    ],
  },
  {
    slug: 'ico-to-webp',
    tool: 'img-convert',
    group: 'Images',
    card: 'ICO to WebP',
    blurb: 'Save an ICO icon as a WebP image',
    preset: { out: 'image/webp', accept: '.ico,image/x-icon,image/vnd.microsoft.icon' },
    title: 'ICO to WebP converter that works in your browser',
    h1: 'Convert ICO to WebP',
    lede: 'Save an ICO icon as a WebP image. The largest size stored in the icon is used, and transparency is kept. WebP files open in every current browser.',
    description: 'Convert ICO icons to WebP in your browser. The largest size in the file is kept, transparency is kept, and nothing leaves your device.',
    steps: ['Drop in your .ico files.', 'WebP is already selected. Move the quality slider if you want a smaller file.', 'Click Convert, then save each image or all of them as a zip.'],
    faq: [
      {
        q: 'Why is the WebP so small?',
        a: 'An ICO file holds small pictures, usually 16 to 256 pixels on a side. This page uses the largest one it finds, so the WebP is never bigger than that.',
      },
      {
        q: 'Does the WebP keep the transparent background?',
        a: 'Yes. WebP supports transparency, so the icon keeps its clear background. If you need the icon itself as an image with a transparency channel, ICO to PNG works the same way.',
      },
      PRIVATE,
    ],
  },
  {
    slug: 'bmp-to-jpg',
    tool: 'img-convert',
    group: 'Images',
    card: 'BMP to JPG',
    blurb: 'Save a BMP image as a JPG',
    preset: { out: 'image/jpeg', accept: 'image/bmp,.bmp' },
    title: 'BMP to JPG converter: save a BMP as a JPG online',
    h1: 'Convert BMP to JPG',
    lede: 'Save a BMP image as a JPG. BMP stores every pixel uncompressed, so the file is usually very large. JPG shrinks it a lot, at the cost of some fine detail.',
    description: 'Convert BMP images to JPG in your browser. JPG has no transparency, so transparent areas are filled with white. Your files are never uploaded.',
    steps: ['Drop in your .bmp files.', 'JPG is already selected.', 'Click Convert, then save each image or all of them as a zip.'],
    faq: [
      {
        q: 'What happens to transparent areas?',
        a: 'Some 32 bit BMP files carry transparency. JPG cannot hold it, so those pixels are painted white underneath. Pick PNG if the image needs to stay on a transparent background.',
      },
      {
        q: 'Why is the JPG so much smaller than the BMP?',
        a: 'BMP writes out every pixel with no compression. JPG throws away detail your eye is not likely to notice, which is why a photo that takes 10 MB as a BMP ends up under a megabyte as a JPG.',
      },
      PRIVATE,
    ],
  },
  {
    slug: 'bmp-to-png',
    tool: 'img-convert',
    group: 'Images',
    card: 'BMP to PNG',
    blurb: 'Save a BMP image as a PNG',
    preset: { out: 'image/png', accept: 'image/bmp,.bmp' },
    title: 'BMP to PNG converter: save a BMP as a PNG online',
    h1: 'Convert BMP to PNG',
    lede: 'Save a BMP image as a PNG. PNG keeps every pixel and compresses without losing anything, so the picture stays exact and the file usually shrinks.',
    description: 'Convert BMP images to PNG in your browser. The picture stays pixel for pixel and transparency is kept. Your files are never uploaded.',
    steps: ['Drop in your .bmp files.', 'PNG is already selected.', 'Click Convert, then save each image or all of them as a zip.'],
    faq: [
      {
        q: 'Is anything lost in the conversion?',
        a: 'No. PNG compresses without loss, so the picture you get is pixel for pixel the same as the BMP. The file is smaller because BMP writes every pixel uncompressed.',
      },
      {
        q: 'Will transparency survive?',
        a: 'Yes. If the BMP carries an alpha channel, PNG keeps it. PNG is the safer choice for logos and screenshots that come from a BMP source.',
      },
      PRIVATE,
    ],
  },
  {
    slug: 'gif-to-png',
    tool: 'img-convert',
    group: 'Images',
    card: 'GIF to PNG',
    blurb: 'Save a GIF as a PNG image',
    preset: { out: 'image/png', accept: 'image/gif,.gif' },
    title: 'GIF to PNG converter: save a GIF as PNG online',
    h1: 'Convert GIF to PNG',
    lede: 'Save a GIF as a PNG image. Only the first frame of an animated GIF is kept, because PNG holds a single picture.',
    description: 'Convert GIF images to PNG in your browser. Only the first frame of an animated GIF is kept. Your files are never uploaded.',
    steps: ['Drop in your .gif files.', 'PNG is already selected.', 'Click Convert, then save each image or all of them as a zip.'],
    faq: [
      {
        q: 'What happens to the animation?',
        a: 'It is dropped. The PNG is the first frame of the GIF, and PNG cannot store the other frames. To keep the animation, use the GIF file itself.',
      },
      {
        q: 'Does PNG keep the colors exactly?',
        a: 'PNG keeps every pixel of the frame exactly. A GIF has at most 256 colors, and PNG keeps those colors as they are, so the picture does not change. The file size can go either way.',
      },
      PRIVATE,
    ],
  },
  {
    slug: 'gif-to-jpg',
    tool: 'img-convert',
    group: 'Images',
    card: 'GIF to JPG',
    blurb: 'Save a GIF as a JPG image',
    preset: { out: 'image/jpeg', accept: 'image/gif,.gif' },
    title: 'GIF to JPG converter: save a GIF as JPG online',
    h1: 'Convert GIF to JPG',
    lede: 'Save a GIF as a JPG image. Only the first frame of an animated GIF is kept, and transparent areas are filled with white, since JPG holds a single opaque picture.',
    description: 'Convert GIF images to JPG in your browser. The first frame is kept and transparency is filled with white. Your files are never uploaded.',
    steps: ['Drop in your .gif files.', 'JPG is already selected. Move the quality slider if you want smaller files.', 'Click Convert, then save each image or all of them as a zip.'],
    faq: [
      {
        q: 'What happens to the animation?',
        a: 'It is dropped. The JPG is the first frame of the GIF, and JPG cannot store the other frames. To keep the animation, use the GIF file itself.',
      },
      {
        q: 'Is the JPG smaller than the GIF?',
        a: 'For photos, usually. For flat graphics with few colors the GIF can come out smaller, so check the result before you replace the original.',
      },
      PRIVATE,
    ],
  },
  {
    slug: 'gif-to-ico',
    tool: 'img-ico',
    group: 'Images',
    card: 'GIF to ICO',
    blurb: 'Make a .ico favicon file from a GIF',
    preset: { accept: 'image/gif,.gif' },
    title: 'GIF to ICO converter: make a .ico favicon from a GIF',
    h1: 'Convert GIF to ICO',
    lede: 'Turn a GIF into a .ico file, the format browsers use for favicons. The first frame of an animated GIF is kept, and the file holds 16, 32 and 48 px versions of the image.',
    description: 'Convert a GIF to a .ico favicon file in your browser. Only the first frame of an animated GIF is used. Transparency is kept. Your file is never uploaded.',
    steps: ['Drop in your GIF files.', 'Nothing to set. The three sizes are made from your image.', 'Click Save to download the .ico file, or all of them as a zip.'],
    faq: [
      {
        q: 'What happens to the animation?',
        a: 'It is dropped. A favicon is one still picture, so the .ico holds the first frame of the GIF. To keep the animation, use the GIF file itself.',
      },
      {
        q: 'What sizes end up in the file?',
        a: '16 by 16, 32 by 32 and 48 by 48 pixels. If the GIF is not square, the image is centered on a transparent square instead of being stretched.',
      },
      PRIVATE,
    ],
  },
  {
    slug: 'gif-to-webp',
    tool: 'img-convert',
    group: 'Images',
    card: 'GIF to WebP',
    blurb: 'Save a GIF as a WebP image',
    preset: { out: 'image/webp', accept: 'image/gif,.gif' },
    title: 'GIF to WebP converter: save a GIF as WebP online',
    h1: 'Convert GIF to WebP',
    lede: 'Save a GIF as a WebP image. Only the first frame of an animated GIF is kept, because WebP on this page holds a single picture. Transparency is kept.',
    description: 'Convert GIF images to WebP in your browser. The first frame is kept and transparency is kept. Your files are never uploaded.',
    steps: ['Drop in your .gif files.', 'WebP is already selected. Move the quality slider if you want smaller files.', 'Click Convert, then save each image or all of them as a zip.'],
    faq: [
      {
        q: 'What happens to the animation?',
        a: 'It is dropped. The WebP is the first frame of the GIF, since WebP stores one picture here. To keep the animation, use the GIF file itself.',
      },
      {
        q: 'Is the WebP smaller than the GIF?',
        a: 'For photos, usually. For flat graphics with few colors the GIF can come out smaller, so check the result before you replace the original.',
      },
      PRIVATE,
    ],
  },
  {
    slug: 'webp-to-png',
    tool: 'img-convert',
    group: 'Images',
    card: 'WebP to PNG',
    blurb: 'Turn WebP images into PNG files',
    preset: { out: 'image/png', accept: 'image/webp,.webp' },
    title: 'WebP to PNG converter that works in your browser',
    h1: 'Convert WebP to PNG',
    lede: 'Turn WebP images into PNG files that open in almost any program, including older ones that cannot read WebP. Transparent areas stay transparent.',
    description: 'Convert WebP to PNG online, one file or many at once. Transparency is kept. Your images stay on your device.',
    steps: ['Drop in your WebP files.', 'PNG is already selected. Change it only if you need another format.', 'Click Save to download the PNG files.'],
    faq: [
      {
        q: 'Why would I want PNG instead of WebP?',
        a: 'Some older programs and upload forms accept only PNG or JPG. If you are not sure what will open the file, PNG is the safer choice.',
      },
      {
        q: 'Does converting lose quality?',
        a: 'The pixels are copied as they are, so the picture does not change in the conversion. Detail that a lossy WebP already dropped does not come back.',
      },
      PRIVATE,
    ],
  },
  {
    slug: 'png-to-webp',
    tool: 'img-convert',
    group: 'Images',
    card: 'PNG to WebP',
    blurb: 'Smaller WebP files from PNG images',
    preset: { out: 'image/webp', accept: 'image/png,.png' },
    title: 'PNG to WebP converter that works in your browser',
    h1: 'Convert PNG to WebP',
    lede: 'Turn PNG images into WebP files, which are often smaller and still keep sharp edges. Transparency is kept.',
    description: 'Convert PNG to WebP online, one file or many at once. Adjustable quality and transparency kept. Your images stay on your device.',
    steps: ['Drop in your PNG files.', 'WebP is already selected. Move the quality slider if you want smaller files.', 'Click Save to download the WebP files.'],
    faq: [
      {
        q: 'Are WebP files smaller than PNG?',
        a: 'Often, yes, especially for photos. The quality slider sets how much detail is kept. Lower values make smaller files.',
      },
      {
        q: 'Will every program open WebP?',
        a: 'Current browsers and most modern apps can. Some older programs and upload forms cannot, so keep the PNG if you are not sure.',
      },
      PRIVATE,
    ],
  },
  {
    slug: 'jpg-to-webp',
    tool: 'img-convert',
    group: 'Images',
    card: 'JPG to WebP',
    blurb: 'Lighter images for your website',
    preset: { out: 'image/webp' },
    title: 'Convert JPG and PNG to WebP online',
    h1: 'Convert images to WebP',
    lede: 'WebP files are often a quarter to a third smaller than JPG at about the same quality, which makes web pages load faster.',
    description: 'Convert JPG and PNG images to WebP in your browser. Batch convert, set the quality, and download a zip. Nothing is uploaded.',
    steps: ['Drop in JPG or PNG images.', 'WebP is already selected. A quality of 75 to 80 looks good for most photos.', 'Click Convert and save the files.'],
    faq: [
      {
        q: 'Do all browsers show WebP?',
        a: 'Yes. Every current version of Chrome, Safari, Firefox and Edge displays WebP.',
      },
      {
        q: 'Does WebP keep transparency?',
        a: 'Yes. Transparent PNGs stay transparent when converted to WebP.',
      },
      PRIVATE,
    ],
  },
  {
    slug: 'compress-image',
    tool: 'img-compress',
    group: 'Images',
    card: 'Compress image',
    blurb: 'Shrink photos for email and upload forms',
    title: 'Compress images online: make JPG, PNG and WebP smaller',
    h1: 'Compress images',
    lede: 'Make photos small enough for an email, an upload form or a website. You see the new size before you download, and the original is never changed.',
    description: 'Reduce the file size of JPG, PNG and WebP images in your browser. Set quality and maximum width, compare sizes, and save. No upload.',
    steps: [
      'Drop in one or more images.',
      'Pick a quality level. Setting a maximum width as well saves the most space on large phone photos.',
      'Click Compress, check the new sizes, and save.',
    ],
    faq: [
      {
        q: 'How small can I get a photo without it looking worse?',
        a: 'A quality around 70 usually looks the same as the original on screen. Limiting the width to 1920 pixels shrinks a 12-megapixel phone photo from several megabytes to a few hundred kilobytes.',
      },
      {
        q: 'Why did my PNG barely shrink?',
        a: 'PNG is lossless, so there is little to remove without changing the format. Choose WebP, or JPG if the image has no transparency, for a much smaller file.',
      },
      {
        q: 'What if the compressed file comes out bigger?',
        a: 'That can happen when an image was already well compressed. If the format and size stay the same and the result would be larger, you get your original file back unchanged.',
      },
      PRIVATE,
    ],
  },
  {
    slug: 'compress-jpg',
    tool: 'img-compress',
    group: 'Images',
    card: 'Compress JPG',
    blurb: 'Shrink JPG photos for email and upload forms',
    preset: { accept: 'image/jpeg,.jpg,.jpeg' },
    title: 'Compress JPG online: make JPG files smaller in your browser',
    h1: 'Compress JPG',
    lede: 'Make JPG photos small enough for an email, an upload form or a website. You see the new size before you download, and the original is never changed.',
    description: 'Reduce JPG file size in your browser. Set quality and maximum width, compare sizes, and save. No upload, and no sign-up.',
    steps: [
      'Drop in one or more JPG files.',
      'Pick a quality level. Setting a maximum width as well saves the most space on large phone photos.',
      'Click Compress, check the new sizes, and save.',
    ],
    faq: [
      {
        q: 'What quality should I use?',
        a: 'Around 70 usually looks the same as the original on screen. Go lower, around 50, for an upload form with a strict size limit. The first thing to soften is fine detail, such as text and fabric.',
      },
      {
        q: 'Why did my JPG barely shrink?',
        a: 'It was probably already well compressed, for example a photo saved at low quality by a phone. Lower the quality slider or set a maximum width of 1920 pixels to save the most space.',
      },
      {
        q: 'What if the compressed file comes out bigger?',
        a: 'That can happen when an image was already well compressed. If the result would be larger, you get your original file back unchanged.',
      },
      PRIVATE,
    ],
  },
  {
    slug: 'compress-png',
    tool: 'img-compress',
    group: 'Images',
    card: 'Compress PNG',
    blurb: 'Shrink PNGs for the web and upload forms',
    preset: { accept: 'image/png,.png' },
    title: 'Compress PNG online: make PNG files smaller in your browser',
    h1: 'Compress PNG',
    lede: 'Make a PNG small enough for a website, a README or an upload form. Set a maximum width and quality, and see the new size before you download. For a much smaller file, save as WebP instead; the page tells you when the PNG will barely shrink.',
    description: 'Reduce PNG file size in your browser. Cap the width, compare sizes, and save. Optionally save as WebP for a much smaller file. Nothing leaves your device.',
    steps: [
      'Drop in one or more PNG files.',
      'Set a maximum width. Re-saving at 1920 pixels or less is where most of the savings come from.',
      'Click Compress, check the new sizes, and save. Switch "Save as" to WebP if you need the smallest file.',
    ],
    faq: [
      {
        q: 'Why did my PNG barely shrink?',
        a: 'PNG is a lossless format, so there is little to remove without changing it. Setting a maximum width helps on large images. For a real size drop, pick WebP in "Save as", or JPG if the image has no transparency.',
      },
      {
        q: 'Can I keep the file as a PNG and still shrink it?',
        a: 'Yes. The tool re-saves the PNG with the maximum width you set. That is lossless, and it helps most on screenshots and images saved at very large dimensions.',
      },
      {
        q: 'What if the compressed file comes out bigger?',
        a: 'That can happen when an image was already well compressed. If the format and size stay the same and the result would be larger, you get your original file back unchanged.',
      },
      PRIVATE,
    ],
  },
  {
    slug: 'resize-image',
    tool: 'img-resize',
    group: 'Images',
    card: 'Resize image',
    blurb: 'Set exact pixel sizes or a percentage',
    title: 'Resize images online by pixels or percentage',
    h1: 'Resize images',
    lede: 'Change the width and height of one image or many. Type exact pixels or a percentage, and the proportions stay locked unless you unlock them.',
    description: 'Resize JPG, PNG and WebP images to exact pixel dimensions or a percentage, in batches, right in your browser. Files are not uploaded.',
    steps: [
      'Drop in your images.',
      'Type a width, a height or a percentage. Leave one side empty to keep the proportions.',
      'Click Resize and save the files.',
    ],
    faq: [
      {
        q: 'What happens if I enter both width and height?',
        a: 'With proportions locked, the image is scaled to fit inside that box without stretching. Unlock proportions to force the exact size.',
      },
      {
        q: 'Can I make an image bigger?',
        a: 'Use a percentage above 100, or tick "Allow enlarging". Enlarging cannot add detail, so expect some softness.',
      },
      PRIVATE,
    ],
  },
  {
    slug: 'resize-jpg',
    tool: 'img-resize',
    group: 'Images',
    card: 'Resize JPG',
    blurb: 'Set exact pixel sizes on JPGs',
    preset: { accept: 'image/jpeg,.jpg,.jpeg' },
    title: 'Resize JPG online: exact pixels or a percentage',
    h1: 'Resize JPG',
    lede: 'Change the width and height of one JPG or many. Type exact pixels or a percentage, and the proportions stay locked unless you unlock them.',
    description: 'Resize JPG images to exact pixel dimensions or a percentage, in batches, right in your browser. Files are not uploaded.',
    steps: [
      'Drop in your JPG files.',
      'Type a width, a height or a percentage. Leave one side empty to keep the proportions.',
      'Click Resize and save the files.',
    ],
    faq: [
      {
        q: 'What happens if I enter both width and height?',
        a: 'With proportions locked, the image is scaled to fit inside that box without stretching. Unlock proportions to force the exact size.',
      },
      {
        q: 'Where does keeping proportions locked matter?',
        a: 'For faces and products, where a stretched image is obvious. Keep proportions locked and type only the width you want, such as 1600 pixels for a website.',
      },
      {
        q: 'Can I make a JPG bigger?',
        a: 'Use a percentage above 100, or tick "Allow enlarging". Enlarging cannot add detail, so expect some softness.',
      },
      PRIVATE,
    ],
  },
  {
    slug: 'resize-png',
    tool: 'img-resize',
    group: 'Images',
    card: 'Resize PNG',
    blurb: 'Set exact pixel sizes on PNGs',
    preset: { accept: 'image/png,.png' },
    title: 'Resize PNG online: exact pixels or a percentage',
    h1: 'Resize PNG',
    lede: 'Change the width and height of one PNG or many. Type exact pixels or a percentage, and the proportions stay locked unless you unlock them.',
    description: 'Resize PNG images to exact pixel dimensions or a percentage, in batches, right in your browser. Files are not uploaded.',
    steps: [
      'Drop in your PNG files.',
      'Type a width, a height or a percentage. Leave one side empty to keep the proportions.',
      'Click Resize and save the files.',
    ],
    faq: [
      {
        q: 'Are the pixels exactly as I set them?',
        a: 'Yes, when you unlock proportions. With proportions locked, the PNG is scaled to fit inside the box without stretching, so one side may end up smaller.',
      },
      {
        q: 'Does resizing keep transparency?',
        a: 'Yes. PNG keeps its alpha channel, so a transparent background stays transparent.',
      },
      {
        q: 'Can I make a PNG bigger?',
        a: 'Use a percentage above 100, or tick "Allow enlarging". Enlarging cannot add detail, so expect some softness.',
      },
      PRIVATE,
    ],
  },

  // ---------- Data ----------
  {
    slug: 'csv-to-json',
    tool: 'csv-to-json',
    group: 'Spreadsheets and data',
    card: 'CSV to JSON',
    blurb: 'Rows into a JSON array of objects',
    title: 'CSV to JSON converter online',
    h1: 'Convert CSV to JSON',
    lede: 'Turn a CSV file or pasted rows into JSON. The header row becomes the keys, and numbers come out as numbers unless you ask for text.',
    description: 'Convert CSV to JSON in your browser. Detects commas, semicolons and tabs, handles quoted fields, and keeps your data on your device.',
    steps: [
      'Drop in a .csv file or paste the rows.',
      'Check the options: whether the first row is a header, and whether numbers should stay as text.',
      'Copy the JSON or download it as a file.',
    ],
    faq: [
      {
        q: 'Will zip codes and IDs keep their leading zeros?',
        a: 'Yes. Values that start with a zero, like 02134, and numbers too long to store exactly, like card or order numbers, are kept as text. Tick "Keep all values as text" if you want no numbers at all.',
      },
      {
        q: 'My file uses semicolons, not commas.',
        a: 'The separator is detected automatically. If the preview still looks wrong, pick it by hand from the list.',
      },
      PRIVATE,
    ],
  },
  {
    slug: 'csv-to-markdown',
    tool: 'csv-to-markdown',
    group: 'Spreadsheets and data',
    card: 'CSV to Markdown',
    blurb: 'A Markdown table for READMEs and issues',
    title: 'CSV to Markdown table converter online',
    h1: 'Convert CSV to Markdown',
    lede: 'Turn a CSV file or pasted rows into a Markdown table you can paste into a README, an issue or a pull request. Numbers come out right-aligned, and pipes inside cells are escaped so the table keeps its shape.',
    description: 'Convert CSV to a Markdown table in your browser. Paste rows or drop a file, set the separator, and copy the table for GitHub or any Markdown editor. Nothing is uploaded.',
    steps: [
      'Drop in a .csv file or paste the rows.',
      'Check the separator and whether the first row holds the column names.',
      'Copy the Markdown or download it as a .md file.',
    ],
    faq: [
      {
        q: 'Will the table render on GitHub?',
        a: 'Yes. The output is a GitHub-flavored Markdown table. Paste it into a README, an issue or a pull request and it renders as a table. Columns that hold only numbers are right-aligned.',
      },
      {
        q: 'What if a cell contains a pipe or a line break?',
        a: 'A pipe is written as \\| so it does not split the cell, and a line break inside a cell becomes <br>. Other text is left as it is.',
      },
      {
        q: 'My CSV has no header row.',
        a: 'Untick "First row is column names". The table gets generated header cells, Column 1, Column 2 and so on, because Markdown tables need a header row to render.',
      },
      PRIVATE,
    ],
  },
  {
    slug: 'tsv-to-csv',
    tool: 'tsv-to-csv',
    group: 'Spreadsheets and data',
    card: 'TSV to CSV',
    blurb: 'Tab-separated rows into CSV',
    title: 'TSV to CSV converter online',
    h1: 'Convert TSV to CSV',
    lede: 'Turn a tab-separated file into a CSV that opens cleanly in Excel and every data tool. Cells with commas or quotes are quoted for you, and line endings are set for Windows.',
    description: 'Convert TSV to CSV in your browser. Quoting is handled for you, and the file never leaves your device.',
    steps: [
      'Drop in a .tsv file, or paste the rows.',
      'Check the preview.',
      'Download the CSV.',
    ],
    faq: [
      {
        q: 'Why not just rename the file?',
        a: 'Because the columns would not line up. The tab characters have to become commas, and any cell that holds a comma or a quote has to be wrapped in quotes with its quotes doubled. That is what this page does.',
      },
      {
        q: 'Where do TSV files come from?',
        a: 'Pasting cells from a spreadsheet gives you tab-separated text, and so do many database exports and log files. This page is the bridge between that and tools that only read CSV.',
      },
      {
        q: 'What if my file is already comma-separated?',
        a: 'Then you do not need this page. Use CSV to JSON to convert it, or open it in Excel and save it again.',
      },
      PRIVATE,
    ],
  },
  {
    slug: 'csv-to-tsv',
    tool: 'csv-to-tsv',
    group: 'Spreadsheets and data',
    card: 'CSV to TSV',
    blurb: 'Comma-separated rows into TSV',
    title: 'CSV to TSV converter online',
    h1: 'Convert CSV to TSV',
    lede: 'Turn a CSV file into a tab-separated file for tools that paste better with tabs. The separator is detected on its own, and cells are quoted when they hold a tab or a quote.',
    description: 'Convert CSV to TSV in your browser. Quoting is handled for you, and the file never leaves your device.',
    steps: [
      'Drop in a .csv file, or paste the rows.',
      'Check the preview.',
      'Download the TSV.',
    ],
    faq: [
      {
        q: 'Why switch from CSV to TSV?',
        a: 'Some tools expect tabs, and pasting tab-separated text into a spreadsheet lands one value per cell every time. TSV also lets cells hold commas without quoting.',
      },
      {
        q: 'What happens to cells that contain a tab?',
        a: 'They are wrapped in quotes, the same rule CSV uses for commas. Some strict TSV readers may not read quoted tabs back perfectly, but nothing is lost from the file itself.',
      },
      {
        q: 'Will my columns stay in order?',
        a: 'Yes. Rows and columns pass through untouched apart from the delimiter change.',
      },
      PRIVATE,
    ],
  },
  {
    slug: 'tsv-to-json',
    tool: 'csv-to-json',
    group: 'Spreadsheets and data',
    card: 'TSV to JSON',
    blurb: 'Tab-separated rows into JSON',
    preset: { accept: '.tsv,text/tab-separated-values,text/plain' },
    title: 'TSV to JSON converter online',
    h1: 'Convert TSV to JSON',
    lede: 'Turn a tab-separated file into JSON. This is the format you get from pasting cells out of a spreadsheet, and from many database exports. The tab separator is detected on its own.',
    description: 'Convert TSV to JSON in your browser. Paste rows or drop a .tsv file, keep leading zeros as text, and download the result. Nothing is uploaded.',
    steps: [
      'Drop in a .tsv file, or copy cells from a spreadsheet and paste them into the box.',
      'Check the options: header row, and whether numbers should stay as text.',
      'Copy the JSON or download it as a file.',
    ],
    faq: [
      {
        q: 'Can I paste straight from Excel or Google Sheets?',
        a: 'Yes. Copy the cells, paste them into the box, and the tabs between the columns are picked up as the separator. You will see a preview of the table before you convert.',
      },
      {
        q: 'Why not just use the CSV converter?',
        a: 'It works too. The TSV page exists so you land here from a search, and its picker is narrowed to .tsv files. The conversion, the options and the output are the same.',
      },
      {
        q: 'Will zip codes and IDs keep their leading zeros?',
        a: 'Yes. Values that start with a zero are kept as text. Tick "Keep all values as text" if you want no numbers at all.',
      },
      PRIVATE,
    ],
  },
  {
    slug: 'jsonl-to-csv',
    tool: 'json-to-csv',
    group: 'Spreadsheets and data',
    card: 'JSONL to CSV',
    blurb: 'JSON Lines into a spreadsheet',
    preset: { accept: '.jsonl,.ndjson,application/x-ndjson,text/plain' },
    title: 'JSONL to CSV converter online',
    h1: 'Convert JSONL to CSV',
    lede: 'Turn a JSON Lines file into a CSV that opens in Excel or Google Sheets. Each line of the file becomes one row, and nested fields get their own columns with dotted names like address.city.',
    description: 'Convert JSON Lines (.jsonl, .ndjson) to CSV in your browser. Nested fields become dotted columns, lists stay as JSON text. Nothing leaves your device.',
    steps: [
      'Drop in a .jsonl or .ndjson file, or paste the lines.',
      'Check the preview. Every line becomes one row.',
      'Download the CSV or copy it.',
    ],
    faq: [
      {
        q: 'What is a JSONL file?',
        a: 'A text file with one JSON object per line, also called newline-delimited JSON or NDJSON. It is the common output shape of API exports, log pipelines and LLM batch jobs.',
      },
      {
        q: 'What happens to nested objects?',
        a: 'They flatten into dotted columns, so {"address": {"city": "London"}} becomes a column called address.city. Lists are written into one cell as JSON text so nothing is lost.',
      },
      {
        q: 'Can I paste a regular JSON array instead?',
        a: 'Yes, the tool also accepts an array of objects and an object wrapping a single array, such as {"data": [...]}.',
      },
      PRIVATE,
    ],
  },
  {
    slug: 'markdown-to-csv',
    tool: 'md-to-csv',
    group: 'Spreadsheets and data',
    card: 'Markdown to CSV',
    blurb: 'A Markdown table into a CSV file',
    title: 'Markdown to CSV converter online',
    h1: 'Convert Markdown to CSV',
    lede: 'Turn a Markdown table into a CSV that opens in Excel or any data tool. The first table in the file is read, prose around it is ignored, and escaped pipes and <br> cells are unwound.',
    description: 'Convert Markdown tables to CSV in your browser. Prose lines are skipped, the alignment row is dropped, and nothing is uploaded.',
    steps: [
      'Drop in a .md file, or paste the Markdown.',
      'Check the preview of the table.',
      'Download the CSV or copy it.',
    ],
    faq: [
      {
        q: 'Which table is converted?',
        a: 'The first table in the file. Other Markdown around it, headings, paragraphs and code blocks, is skipped. If the file holds no table, you get an error that says so.',
      },
      {
        q: 'What happens to escaped pipes and line breaks in cells?',
        a: '\\| becomes | again, and <br> becomes a line break inside the cell, the reverse of what the CSV to Markdown page does.',
      },
      {
        q: 'Is the header row kept?',
        a: 'Yes. The first row of the table stays as the first line of the CSV, and the alignment row (| --- | --- |) is dropped.',
      },
      PRIVATE,
    ],
  },
  {
    slug: 'markdown-to-excel',
    tool: 'md-to-xlsx',
    group: 'Spreadsheets and data',
    card: 'Markdown to Excel',
    blurb: 'A Markdown table into an .xlsx workbook',
    title: 'Markdown to Excel converter online',
    h1: 'Convert Markdown to Excel',
    lede: 'Turn a Markdown table into an .xlsx workbook. The first table in the file is read, prose around it is ignored, and numbers come out as numbers so you can sum them in Excel.',
    description: 'Convert Markdown tables to Excel .xlsx in your browser. The first table is used, prose is skipped, and nothing is uploaded.',
    steps: [
      'Drop in a .md file, or paste the Markdown.',
      'Check the preview of the table.',
      'Download the .xlsx workbook.',
    ],
    faq: [
      {
        q: 'Which table is converted?',
        a: 'The first table in the file. Other Markdown around it is skipped. If the file holds no table, you get an error that says so.',
      },
      {
        q: 'Are numbers kept as numbers?',
        a: 'Yes, plain numbers come out as numbers, so you can sum and sort them in Excel. Leading-zero values such as zip codes stay text.',
      },
      {
        q: 'How is the sheet named?',
        a: 'After the file name, the same as every other page here that saves an Excel workbook.',
      },
      PRIVATE,
    ],
  },
  {
    slug: 'json-to-csv',
    tool: 'json-to-csv',
    group: 'Spreadsheets and data',
    card: 'JSON to CSV',
    blurb: 'Open JSON data in a spreadsheet',
    title: 'JSON to CSV converter online',
    h1: 'Convert JSON to CSV',
    lede: 'Turn a JSON array, an API response or JSON Lines into a CSV file that opens in Excel, Numbers or Google Sheets. Nested fields get their own columns.',
    description: 'Convert JSON to CSV in your browser. Flattens nested objects into columns and accepts JSON Lines. Nothing leaves your device.',
    steps: ['Drop in a .json file or paste the JSON.', 'Check the preview. Nested fields show up as columns like address.city.', 'Download the CSV or copy it.'],
    faq: [
      {
        q: 'What JSON shapes does it accept?',
        a: 'An array of objects, a single object, an object with one array inside (such as {"data": [...]}), or JSON Lines with one object per line.',
      },
      {
        q: 'What happens to lists inside a record?',
        a: 'They are written into a single cell as JSON text, for example ["red","blue"], so nothing is lost.',
      },
      PRIVATE,
    ],
  },
  {
    slug: 'csv-to-excel',
    tool: 'csv-to-xlsx',
    group: 'Spreadsheets and data',
    card: 'CSV to Excel',
    blurb: 'Save a CSV as a real .xlsx workbook',
    title: 'CSV to Excel converter: save CSV as XLSX online',
    h1: 'Convert CSV to Excel',
    lede: 'Save a CSV as a proper .xlsx workbook. Numbers are stored as numbers, so you can sum and sort them as soon as the file opens in Excel.',
    description: 'Convert CSV files to Excel .xlsx in your browser. Handles commas, semicolons and tabs and keeps numbers as numbers. No upload.',
    steps: ['Drop in a .csv file or paste the rows.', 'Check the preview and the options.', 'Click Download to save the .xlsx file.'],
    faq: [
      {
        q: 'Why not just open the CSV in Excel?',
        a: 'Excel guesses how a CSV is laid out and often guesses wrong. A file separated by semicolons can end up in a single column, and long ID numbers get rounded. Converting first avoids both problems.',
      },
      {
        q: 'Will long ID numbers be kept exactly?',
        a: 'Yes. Numbers longer than 15 digits and values with leading zeros are stored as text, so Excel will not round them or show them in scientific notation.',
      },
      PRIVATE,
    ],
  },
  {
    slug: 'excel-to-csv',
    tool: 'xlsx-to-csv',
    group: 'Spreadsheets and data',
    card: 'Excel to CSV',
    blurb: 'Save the first sheet of a workbook as CSV',
    title: 'Excel to CSV converter: save XLSX as CSV online',
    h1: 'Convert Excel to CSV',
    lede: 'Save the first sheet of an Excel workbook as a CSV file. Each cell is written the way it is shown in the sheet, so a formatted date or number comes out as you see it.',
    description: 'Convert Excel .xlsx files to CSV in your browser. Saves the first sheet as comma-separated text. Your workbook is never uploaded.',
    steps: ['Drop in an .xlsx file.', 'Check the preview. Only the first sheet is converted.', 'Download the CSV or copy it.'],
    faq: [
      {
        q: 'What happens to the other sheets?',
        a: 'Only the first sheet is converted, and the page tells you how many other sheets the workbook has. To get another sheet, drag its tab to the front in Excel, save, and drop the file here again.',
      },
      {
        q: 'Are formulas kept?',
        a: 'No. The CSV holds the value each cell shows when the workbook was last saved, not the formula behind it.',
      },
      {
        q: 'What about commas and line breaks inside a cell?',
        a: 'The cell is wrapped in quotes, which is how CSV keeps a comma or a line break inside one value.',
      },
      PRIVATE,
    ],
  },
  {
    slug: 'excel-to-json',
    tool: 'xlsx-to-json',
    group: 'Spreadsheets and data',
    card: 'Excel to JSON',
    blurb: 'First sheet of a workbook as a JSON array',
    title: 'Excel to JSON converter: XLSX to JSON online',
    h1: 'Convert Excel to JSON',
    lede: 'Turn the first sheet of an Excel workbook into a JSON array. The column headings become the keys, and each row after the heading becomes one object.',
    description: 'Convert Excel .xlsx files to JSON in your browser. Uses the first sheet and its header row as keys. Your workbook is never uploaded.',
    steps: ['Drop in an .xlsx file.', 'Check the preview. Only the first sheet is converted.', 'Download the JSON or copy it.'],
    faq: [
      {
        q: 'Do the column headings have to be in the first row?',
        a: 'Yes. The first row of the sheet is read as the keys, so the headings should sit in row one with the data underneath. If your sheet has a title above the table, delete it or cut the table into a new sheet.',
      },
      {
        q: 'How are dates and formatted numbers written?',
        a: 'Each cell is read the way Excel shows it. A date formatted as 2026-11-06 comes out as that text. Plain numbers come out as numbers.',
      },
      {
        q: 'What happens to the other sheets?',
        a: 'Only the first sheet is converted, and the page lists the other sheet names. To get another sheet, drag its tab to the front in Excel, save, and drop the file here again.',
      },
      PRIVATE,
    ],
  },
  {
    slug: 'excel-to-tsv',
    tool: 'xlsx-to-tsv',
    group: 'Spreadsheets and data',
    card: 'Excel to TSV',
    blurb: 'A sheet as a tab-separated file',
    title: 'Excel to TSV converter online',
    h1: 'Convert Excel to TSV',
    lede: 'Turn the first sheet of an .xlsx workbook into a tab-separated file that pastes or pipes into other tools. Rows and columns pass through untouched apart from the delimiter change.',
    description: 'Convert Excel .xlsx to TSV in your browser. The first sheet is read, quoting is handled for you, and nothing is uploaded.',
    steps: [
      'Drop in an .xlsx file. Its first sheet is read.',
      'Check the preview.',
      'Download the TSV.',
    ],
    faq: [
      {
        q: 'Which sheet is converted?',
        a: 'Only the first sheet. Drag the tab you want to the front in Excel, save, and drop the file here again. Other sheets are not read.',
      },
      {
        q: 'Why TSV and not CSV?',
        a: 'Tabs survive commas inside cells without quoting, and some tools and pastes expect tab-separated text. If you want CSV instead, the Excel to CSV page does the same thing with commas.',
      },
      {
        q: 'Are numbers and dates kept?',
        a: 'Cells are read the way Excel shows them. A date formatted as 2026-11-06 comes out as that text, and plain numbers come out as plain numbers.',
      },
      PRIVATE,
    ],
  },
  {
    slug: 'excel-to-markdown',
    tool: 'xlsx-to-markdown',
    group: 'Spreadsheets and data',
    card: 'Excel to Markdown',
    blurb: 'A sheet as a Markdown table',
    title: 'Excel to Markdown table converter online',
    h1: 'Convert Excel to Markdown',
    lede: 'Turn the first sheet of an .xlsx workbook into a Markdown table for a README, an issue or a pull request. Numbers in a column are right-aligned, and the table is ready to paste.',
    description: 'Convert Excel .xlsx to a Markdown table in your browser. The first sheet is used, nested content stays as text, and nothing is uploaded.',
    steps: [
      'Drop in an .xlsx file. Its first sheet is read.',
      'Check the preview of the table.',
      'Copy the Markdown or download it as a .md file.',
    ],
    faq: [
      {
        q: 'Which sheet is converted?',
        a: 'Only the first sheet. Drag the tab you want to the front in Excel, save, and drop the file here again. Other sheets are not read.',
      },
      {
        q: 'Will the table render on GitHub?',
        a: 'Yes. The output is a GitHub-flavored Markdown table, and columns that hold only numbers are right-aligned. Pipes in cells are escaped so the table keeps its shape.',
      },
      {
        q: 'How are dates and formatted numbers written?',
        a: 'Each cell is read the way Excel shows it. A date formatted as 2026-11-06 comes out as that text. Plain numbers come out right-aligned, so columns of figures line up.',
      },
      PRIVATE,
    ],
  },
  {
    slug: 'json-to-excel',
    tool: 'json-to-xlsx',
    group: 'Spreadsheets and data',
    card: 'JSON to Excel',
    blurb: 'Save JSON rows as an .xlsx workbook',
    title: 'JSON to Excel converter: save JSON as XLSX online',
    h1: 'Convert JSON to Excel',
    lede: 'Turn a JSON array or an API response into an Excel workbook. Each key becomes a column heading, and numbers stay numbers so you can sum them in Excel.',
    description: 'Convert JSON to Excel .xlsx in your browser. Nested fields become columns and numbers stay numbers. Nothing leaves your device.',
    steps: ['Drop in a .json file or paste the JSON.', 'Check the preview. Nested fields show up as columns like address.city.', 'Click Download to save the .xlsx file.'],
    faq: [
      {
        q: 'What JSON shapes does it accept?',
        a: 'An array of objects or a single object works. So does an object with one array inside, such as {"data": [...]}. JSON Lines, with one object per line, is accepted too.',
      },
      {
        q: 'Are nested fields kept?',
        a: 'They are flattened into columns like address.city, the same as on the JSON to CSV page. A list inside a record is written into one cell as JSON text.',
      },
      PRIVATE,
    ],
  },
  {
    slug: 'json-to-markdown',
    tool: 'json-to-markdown',
    group: 'Spreadsheets and data',
    card: 'JSON to Markdown',
    blurb: 'A Markdown table from JSON rows',
    title: 'JSON to Markdown table converter online',
    h1: 'Convert JSON to Markdown',
    lede: 'Turn a JSON array, an API response or JSON Lines into a GitHub-flavored Markdown table. Nested objects become dotted columns, numbers are right-aligned, and the table is ready to paste into a README or an issue.',
    description: 'Convert JSON to a Markdown table in your browser. Nested fields become dotted columns, lists stay as JSON text. Nothing is uploaded.',
    steps: ['Drop in a .json file or paste the JSON.', 'Check the preview. Nested fields show up as columns like address.city.', 'Copy the Markdown or download it as a .md file.'],
    faq: [
      {
        q: 'What JSON shapes does it accept?',
        a: 'An array of objects, a single object, an object with one array inside (such as {"data": [...]}), or JSON Lines with one object per line.',
      },
      {
        q: 'What happens to lists inside a record?',
        a: 'They are written into a single cell as JSON text, for example ["red","blue"], so nothing is lost. Pipes inside values are escaped as \\| so the table keeps its shape.',
      },
      {
        q: 'Will the table render on GitHub?',
        a: 'Yes. The output is a GitHub-flavored Markdown table, and columns that hold only numbers are right-aligned. Paste it into a README, an issue or a pull request.',
      },
      PRIVATE,
    ],
  },
];

export const GROUPS: Group[] = ['PDF', 'Images', 'Spreadsheets and data'];

// Anchor ids on the home page and short labels for the header nav.
export const GROUP_ID: Record<Group, string> = { PDF: 'pdf', Images: 'images', 'Spreadsheets and data': 'data' };
export const GROUP_SHORT: Record<Group, string> = { PDF: 'PDF', Images: 'Images', 'Spreadsheets and data': 'Data' };
