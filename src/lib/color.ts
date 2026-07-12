import type { RGB } from "./types";

export function rgbToHex([r, g, b]: RGB): string {
  const to2 = (n: number) => n.toString(16).padStart(2, "0");
  return `#${to2(r)}${to2(g)}${to2(b)}`.toUpperCase();
}

export function hexToRgb(hex: string): RGB {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

/**
 * Colore dominante di una regione di pixel.
 * Invece della media aritmetica pura (che su fantasie multicolore produce
 * colori inesistenti), quantizza ogni canale in bucket da 32 livelli,
 * trova il bucket più frequente e restituisce la media dei soli pixel
 * appartenenti a quel bucket.
 */
export function dominantColor(data: Uint8ClampedArray): RGB {
  const BUCKET = 32;
  const counts = new Map<number, { n: number; r: number; g: number; b: number }>();

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const key =
      Math.floor(r / BUCKET) * 64 + Math.floor(g / BUCKET) * 8 + Math.floor(b / BUCKET);
    const entry = counts.get(key) ?? { n: 0, r: 0, g: 0, b: 0 };
    entry.n++;
    entry.r += r;
    entry.g += g;
    entry.b += b;
    counts.set(key, entry);
  }

  let best: { n: number; r: number; g: number; b: number } | null = null;
  for (const entry of counts.values()) {
    if (!best || entry.n > best.n) best = entry;
  }
  if (!best) return [0, 0, 0];
  return [
    Math.round(best.r / best.n),
    Math.round(best.g / best.n),
    Math.round(best.b / best.n),
  ];
}

/** Conversione sRGB -> CIELAB (illuminante D65) per confronti percettivi. */
export function rgbToLab([r, g, b]: RGB): [number, number, number] {
  const srgb = [r / 255, g / 255, b / 255].map((v) =>
    v > 0.04045 ? Math.pow((v + 0.055) / 1.055, 2.4) : v / 12.92
  );
  const [lr, lg, lb] = srgb;

  // sRGB -> XYZ
  let x = (lr * 0.4124 + lg * 0.3576 + lb * 0.1805) / 0.95047;
  let y = lr * 0.2126 + lg * 0.7152 + lb * 0.0722;
  let z = (lr * 0.0193 + lg * 0.1192 + lb * 0.9505) / 1.08883;

  const f = (t: number) =>
    t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116;
  x = f(x);
  y = f(y);
  z = f(z);

  return [116 * y - 16, 500 * (x - y), 200 * (y - z)];
}

/** Delta E CIE76: distanza percettiva tra due colori Lab. */
export function deltaE(lab1: [number, number, number], lab2: [number, number, number]): number {
  return Math.sqrt(
    (lab1[0] - lab2[0]) ** 2 + (lab1[1] - lab2[1]) ** 2 + (lab1[2] - lab2[2]) ** 2
  );
}

/**
 * Famiglia colore in italiano derivata da HSL.
 * Per un utente daltonico il nome Pantone inglese ("Marsala") da solo non
 * basta: "rosso-marrone" comunica subito la zona cromatica.
 */
export function colorFamilyIt([r, g, b]: RGB): string {
  const rn = r / 255,
    gn = g / 255,
    bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  const d = max - min;
  const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));

  let h = 0;
  if (d !== 0) {
    if (max === rn) h = 60 * (((gn - bn) / d) % 6);
    else if (max === gn) h = 60 * ((bn - rn) / d + 2);
    else h = 60 * ((rn - gn) / d + 4);
  }
  if (h < 0) h += 360;

  // Acromatici
  if (l >= 0.93 && s < 0.18) return "bianco";
  if (l <= 0.1) return "nero";
  if (s < 0.12) {
    if (l > 0.75) return "grigio chiaro";
    if (l < 0.3) return "grigio scuro";
    return "grigio";
  }

  // Beige e marroni (toni caldi desaturati o scuri)
  if (h >= 15 && h <= 60 && s < 0.4 && l > 0.65) return "beige";
  if (h >= 10 && h <= 50 && l < 0.42) return "marrone";

  const suffix = l < 0.3 ? " scuro" : l > 0.72 ? " chiaro" : "";
  if (h < 15 || h >= 345) return (l > 0.7 && s < 0.6 ? "rosa" : "rosso") + suffix;
  if (h < 45) return "arancione" + suffix;
  if (h < 70) return "giallo" + suffix;
  if (h < 165) return "verde" + suffix;
  if (h < 200) return "turchese" + suffix;
  if (h < 255) return (l > 0.6 ? "azzurro" : "blu") + suffix;
  if (h < 290) return "viola" + suffix;
  return (l > 0.6 ? "rosa" : "magenta") + suffix;
}
