// Text extraction from uploaded document bytes. Server-only.
// Supports plain text and markdown natively. Binary formats (PDF/DOCX)
// return a graceful warning until a proper extraction pipeline lands.

export type ExtractionResult = {
  text: string;
  warnings: string[];
  supported: boolean;
};

const TEXT_MIME = new Set([
  "text/plain",
  "text/markdown",
  "text/csv",
  "text/html",
  "application/json",
]);

export async function extractText(
  bytes: ArrayBuffer,
  mime: string | null,
  filename: string,
): Promise<ExtractionResult> {
  const lowerName = filename.toLowerCase();
  const isText =
    (mime && TEXT_MIME.has(mime)) ||
    /\.(txt|md|markdown|csv|json|log|html?)$/i.test(lowerName);

  if (isText) {
    const decoded = new TextDecoder("utf-8", { fatal: false }).decode(bytes);
    const cleaned = sanitizeText(decoded);
    return { text: cleaned, warnings: [], supported: true };
  }

  // Best-effort: attempt UTF-8 decode; if it looks textual, use it.
  const decoded = new TextDecoder("utf-8", { fatal: false }).decode(bytes);
  const printable = decoded.replace(/[^\x09\x0A\x0D\x20-\x7E]/g, "").length;
  const ratio = printable / Math.max(decoded.length, 1);
  if (ratio > 0.85 && decoded.length > 200) {
    return {
      text: sanitizeText(decoded),
      warnings: [`Best-effort text extraction from ${mime ?? "unknown format"}`],
      supported: true,
    };
  }

  return {
    text: "",
    warnings: [
      `Binary format ${mime ?? filename.split(".").pop() ?? "unknown"} not yet supported for on-worker extraction. Upload a .txt or .md, or paste the content directly.`,
    ],
    supported: false,
  };
}

export function sanitizeText(input: string): string {
  return input
    .replace(/\u0000/g, "")
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function chunkText(text: string, maxChars = 12_000, overlap = 400): string[] {
  if (text.length <= maxChars) return [text];
  const chunks: string[] = [];
  let start = 0;
  while (start < text.length) {
    const end = Math.min(start + maxChars, text.length);
    // Prefer breaking at paragraph boundary
    let cut = end;
    if (end < text.length) {
      const p = text.lastIndexOf("\n\n", end);
      if (p > start + maxChars * 0.5) cut = p;
    }
    chunks.push(text.slice(start, cut));
    if (cut >= text.length) break;
    start = Math.max(cut - overlap, 0);
  }
  return chunks;
}
