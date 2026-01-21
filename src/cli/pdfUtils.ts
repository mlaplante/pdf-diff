import * as fs from 'fs';
import * as path from 'path';

// Dynamic import for pdfjs-dist (use legacy build for Node.js compatibility)
let pdfjsLib: typeof import('pdfjs-dist/legacy/build/pdf.mjs') | null = null;

async function getPdfjs() {
  if (!pdfjsLib) {
    pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
  }
  return pdfjsLib;
}

export interface PDFPage {
  pageNumber: number;
  text: string;
}

export interface PDFDocument {
  name: string;
  pages: PDFPage[];
  totalPages: number;
}

export async function extractTextFromPDFFile(filePath: string): Promise<PDFDocument> {
  const pdfjs = await getPdfjs();
  const absolutePath = path.resolve(filePath);
  
  // Security: Validate the path
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`File not found: ${absolutePath}`);
  }
  
  // Security: Get real path to prevent symlink attacks
  const realPath = fs.realpathSync(absolutePath);
  
  // Security: Verify it's actually a file, not a directory or special file
  const stats = fs.statSync(realPath);
  if (!stats.isFile()) {
    throw new Error(`Path is not a regular file: ${realPath}`);
  }
  
  // Security: Check file extension
  if (!realPath.toLowerCase().endsWith('.pdf')) {
    throw new Error(`File must have .pdf extension: ${realPath}`);
  }
  
  // Security: Check file size (500MB limit)
  const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB
  if (stats.size > MAX_FILE_SIZE) {
    const sizeMB = Math.round(stats.size / 1024 / 1024);
    throw new Error(`File size (${sizeMB}MB) exceeds maximum allowed size of 500MB`);
  }
  
  const data = new Uint8Array(fs.readFileSync(realPath));
  
  // Security: Verify PDF magic bytes
  if (data.length < 4 || 
      data[0] !== 0x25 || data[1] !== 0x50 || 
      data[2] !== 0x44 || data[3] !== 0x46) { // %PDF
    throw new Error('File does not appear to be a valid PDF (invalid header)');
  }
  
  // Configure PDF.js for Node.js text extraction
  const pdf = await pdfjs.getDocument({
    data,
    useSystemFonts: true,
    disableFontFace: true,
  }).promise;
  
  const pages: PDFPage[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    
    // Preserve line breaks by checking Y positions
    let lastY = -1;
    const text = textContent.items
      .map((item, index) => {
        if (!('str' in item)) return '';
        
        const currentY = item.transform[5];
        const needsNewline = lastY !== -1 && Math.abs(currentY - lastY) > 5;
        lastY = currentY;
        
        const nextItem = textContent.items[index + 1];
        const needsSpace = nextItem && 'str' in nextItem && 
          nextItem.transform[4] - (item.transform[4] + item.width) > 2;
        
        return (needsNewline ? '\n' : '') + item.str + (needsSpace ? ' ' : '');
      })
      .join('');
    
    pages.push({ pageNumber: i, text });
  }

  return {
    name: path.basename(filePath),
    pages,
    totalPages: pdf.numPages,
  };
}

export function parsePageSpec(spec: string, maxPages: number): number[] {
  const pages: Set<number> = new Set();
  const parts = spec.split(',');
  
  for (const part of parts) {
    const trimmed = part.trim();
    if (trimmed.includes('-')) {
      const [start, end] = trimmed.split('-').map(n => parseInt(n.trim(), 10));
      for (let i = start; i <= Math.min(end, maxPages); i++) {
        if (i >= 1) pages.add(i);
      }
    } else {
      const num = parseInt(trimmed, 10);
      if (num >= 1 && num <= maxPages) {
        pages.add(num);
      }
    }
  }
  
  return Array.from(pages).sort((a, b) => a - b);
}
