import * as pdfjsLib from "pdfjs-dist";
import mammoth from "mammoth";
import JSZip from "jszip";

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

function normalizeWhitespace(s: string): string {
  return s.replace(/\u00a0/g, " ").replace(/\r\n/g, "\n").replace(/[ \t]+/g, " ").trim();
}

function meaningfulLen(s: string): number {
  return normalizeWhitespace(s).length;
}

function decodeXmlEntities(s: string): string {
  return s
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

function htmlToPlainText(html: string): string {
  if (typeof document !== "undefined") {
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent || div.innerText || "";
  }
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function getPdfItemText(item: unknown): string {
  if (typeof item !== "object" || item === null || !("str" in item)) {
    return "";
  }

  const text = (item as { str: unknown }).str;
  return typeof text === "string" ? text : "";
}

/** Pull text runs from WordprocessingML when mammoth returns little or nothing. */
async function extractDocxFromWordXml(buffer: ArrayBuffer): Promise<string> {
  const zip = await JSZip.loadAsync(buffer);
  const docFile = zip.file("word/document.xml");
  if (!docFile) return "";
  const xml = await docFile.async("string");
  const parts: string[] = [];
  const re = /<w:t[^>]*>([^<]*)<\/w:t>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml)) !== null) {
    parts.push(decodeXmlEntities(m[1]));
  }
  return parts.join(" ");
}

async function extractDocxText(buffer: ArrayBuffer): Promise<string> {
  const candidates: string[] = [];

  try {
    const raw = await mammoth.extractRawText({ arrayBuffer: buffer });
    if (raw.value) candidates.push(raw.value);
  } catch (e) {
    console.warn("mammoth.extractRawText:", e);
  }

  try {
    const html = await mammoth.convertToHtml({ arrayBuffer: buffer });
    if (html.value) {
      const plain = htmlToPlainText(html.value);
      if (plain) candidates.push(plain);
    }
  } catch (e) {
    console.warn("mammoth.convertToHtml:", e);
  }

  try {
    const xmlText = await extractDocxFromWordXml(buffer);
    if (xmlText) candidates.push(xmlText);
  } catch (e) {
    console.warn("docx word/document.xml fallback:", e);
  }

  let best = "";
  for (const c of candidates) {
    if (meaningfulLen(c) > meaningfulLen(best)) best = c;
  }

  return best;
}

export async function extractTextFromFile(file: File): Promise<string> {
  const name = file.name.toLowerCase();
  const buffer = await file.arrayBuffer();

  if (name.endsWith(".pdf")) {
    return extractPdfText(buffer);
  }
  if (name.endsWith(".docx")) {
    return extractDocxText(buffer);
  }
  if (name.endsWith(".doc")) {
    const decoder = new TextDecoder("utf-8", { fatal: false });
    return decoder.decode(buffer);
  }
  const decoder = new TextDecoder("utf-8", { fatal: false });
  return decoder.decode(buffer);
}

async function extractPdfText(buffer: ArrayBuffer): Promise<string> {
  const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(buffer) }).promise;
  const pages: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const text = content.items
      .map(getPdfItemText)
      .join(" ");
    pages.push(text);
  }

  return pages.join("\n");
}
