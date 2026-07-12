export type RGB = [number, number, number];

export interface PantoneColor {
  /** Codice Pantone TCX, es. "19-4052" */
  code: string;
  /** Nome ufficiale, es. "Classic Blue" */
  name: string;
  hex: string;
}

export interface SampledColor {
  id: string;
  /** Hex del colore campionato dalla camera */
  hex: string;
  rgb: RGB;
  /** Pantone più vicino (match percettivo Lab) */
  pantone: PantoneColor;
  /** Famiglia colore in italiano, es. "blu scuro" — aiuto per daltonici */
  familyIt: string;
  /** true se il colore arriva dall'analisi AI invece che dal campionamento JS */
  fromAi?: boolean;
}

export const GARMENT_TYPES = [
  "T-shirt",
  "Camicia",
  "Maglione",
  "Felpa",
  "Giacca",
  "Cappotto",
  "Pantaloni",
  "Jeans",
  "Gonna",
  "Vestito",
  "Scarpe",
  "Accessorio",
] as const;
export type GarmentType = (typeof GARMENT_TYPES)[number];

export const PATTERNS = [
  "Tinta unita",
  "A righe",
  "A quadretti",
  "A pois",
  "Floreale",
  "Fantasia multicolore",
] as const;
export type Pattern = (typeof PATTERNS)[number];

export interface Garment {
  id: string;
  type: GarmentType;
  pattern: Pattern;
  colors: SampledColor[];
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}
