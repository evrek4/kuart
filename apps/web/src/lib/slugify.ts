/**
 * Türkçe karakterleri ve özel işaretleri temizleyerek URL dostu (SEO uyumlu) slug üretir.
 * Örnek: "Yılmaz Kuaför & Güzellik Salonu" -> "yilmaz-kuafor-guzellik-salonu"
 */
export function slugify(text: string): string {
  if (!text) return "";
  return text
    .toString()
    .trim()
    .replace(/Ğ/g, "g")
    .replace(/ğ/g, "g")
    .replace(/Ü/g, "u")
    .replace(/ü/g, "u")
    .replace(/Ş/g, "s")
    .replace(/ş/g, "s")
    .replace(/İ/g, "i")
    .replace(/I/g, "i")
    .replace(/ı/g, "i")
    .replace(/Ö/g, "o")
    .replace(/ö/g, "o")
    .replace(/Ç/g, "c")
    .replace(/ç/g, "c")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/--+/g, "-");
}
