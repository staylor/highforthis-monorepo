import { PDFDocument } from 'pdf-lib';
import * as fs from 'fs/promises';
import path from 'path';
import pdfs from './real.json';

const ICLOUD_DIR = '/Users/scott/Documents/Scores/Lead Sheets/Grateful Dead';

async function mergePDFs(pdfPaths: string[], outputPath: string) {
  const mergedPdf = await PDFDocument.create();

  for (const pdfPath of pdfPaths) {
    const file = path.resolve(ICLOUD_DIR, pdfPath);
    const pdfBytes = await fs.readFile(file);
    const pdf = await PDFDocument.load(pdfBytes);
    const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    copiedPages.forEach((page) => mergedPdf.addPage(page));
  }

  const mergedPdfBytes = await mergedPdf.save();
  await fs.writeFile(outputPath, mergedPdfBytes);

  console.log(`Merged PDF saved to ${outputPath}`);
}

const outputPDF = path.resolve(ICLOUD_DIR, 'real-book.pdf');

await mergePDFs(pdfs, outputPDF);

process.exit(0);
