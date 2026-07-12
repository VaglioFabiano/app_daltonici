import type { PantoneColor, RGB } from "./types";
import { deltaE, hexToRgb, rgbToLab } from "./color";

/**
 * Dataset curato di riferimenti Pantone TCX (moda/tessile).
 * Copre l'intera ruota cromatica più i neutri usati nell'abbigliamento.
 * I valori hex sono le trasposizioni sRGB comunemente pubblicate: sono
 * approssimazioni a scopo indicativo, non riferimenti Pantone certificati.
 */
export const PANTONE_COLORS: PantoneColor[] = [
  // Bianchi e crema
  { code: "11-0601", name: "Bright White", hex: "#F4F5F0" },
  { code: "11-0602", name: "Snow White", hex: "#F2F0EB" },
  { code: "11-0107", name: "Papyrus", hex: "#F5EDD6" },
  { code: "12-0704", name: "White Swan", hex: "#E4D7C5" },

  // Grigi
  { code: "14-4102", name: "Glacier Gray", hex: "#C5C6C7" },
  { code: "15-4503", name: "Chateau Gray", hex: "#BBB1A6" },
  { code: "17-1501", name: "Wild Dove", hex: "#8B8C89" },
  { code: "18-4005", name: "Steel Gray", hex: "#726F70" },
  { code: "19-3906", name: "Dark Shadow", hex: "#4A4B4D" },
  { code: "19-4007", name: "Anthracite", hex: "#28282D" },

  // Neri
  { code: "19-0303", name: "Jet Black", hex: "#2D2C2F" },
  { code: "19-4008", name: "Meteorite", hex: "#2B2929" },

  // Blu navy e denim
  { code: "19-3920", name: "Peacoat", hex: "#2B2E43" },
  { code: "19-4024", name: "Dress Blues", hex: "#2A3244" },
  { code: "19-4118", name: "Dark Denim", hex: "#35465E" },
  { code: "19-4045", name: "Lapis Blue", hex: "#004B8D" },
  { code: "19-4052", name: "Classic Blue", hex: "#0F4C81" },

  // Blu e azzurri
  { code: "18-4041", name: "Star Sapphire", hex: "#386192" },
  { code: "18-4039", name: "Regatta", hex: "#487AB7" },
  { code: "17-4123", name: "Niagara", hex: "#578CA9" },
  { code: "16-4132", name: "Little Boy Blue", hex: "#6EA1D4" },
  { code: "15-3919", name: "Placid Blue", hex: "#8CADD3" },
  { code: "14-4313", name: "Serenity", hex: "#92A8D1" },
  { code: "14-4115", name: "Cashmere Blue", hex: "#A5B8D0" },

  // Turchesi e teal
  { code: "14-4811", name: "Aqua Sky", hex: "#7BC4C4" },
  { code: "15-5519", name: "Turquoise", hex: "#45B8AC" },
  { code: "15-5217", name: "Blue Turquoise", hex: "#55B4B0" },
  { code: "17-4919", name: "Teal", hex: "#478589" },
  { code: "19-4524", name: "Shaded Spruce", hex: "#00585E" },

  // Verdi
  { code: "17-5641", name: "Emerald", hex: "#009B77" },
  { code: "15-0343", name: "Greenery", hex: "#88B04B" },
  { code: "15-0146", name: "Green Flash", hex: "#79C753" },
  { code: "15-6437", name: "Grass Green", hex: "#7BB369" },
  { code: "12-0313", name: "Seafoam Green", hex: "#CBD5C0" },
  { code: "18-0135", name: "Treetop", hex: "#476A30" },
  { code: "18-0228", name: "Pesto", hex: "#595F34" },
  { code: "18-0527", name: "Olive Branch", hex: "#646A45" },
  { code: "19-0419", name: "Rifle Green", hex: "#414832" },
  { code: "19-6311", name: "Greener Pastures", hex: "#37613C" },

  // Gialli
  { code: "14-0848", name: "Mimosa", hex: "#EFC050" },
  { code: "13-0755", name: "Primrose Yellow", hex: "#EED971" },
  { code: "14-0760", name: "Cyber Yellow", hex: "#FFD400" },
  { code: "12-0721", name: "Lemonade", hex: "#F0E79D" },
  { code: "14-0957", name: "Spectra Yellow", hex: "#F7B718" },
  { code: "16-0857", name: "Old Gold", hex: "#ECA825" },

  // Arancioni e pesca
  { code: "17-1463", name: "Tangerine Tango", hex: "#DD4124" },
  { code: "16-1546", name: "Living Coral", hex: "#FF6F61" },
  { code: "15-1247", name: "Tangerine", hex: "#F88F58" },
  { code: "16-1362", name: "Vermillion Orange", hex: "#F9633B" },
  { code: "16-1448", name: "Burnt Orange", hex: "#C86733" },
  { code: "13-1023", name: "Peach Fuzz", hex: "#FFBE98" },
  { code: "12-0915", name: "Pale Peach", hex: "#FED1BD" },

  // Rossi
  { code: "19-1664", name: "True Red", hex: "#BF1932" },
  { code: "19-1763", name: "Racing Red", hex: "#BD162C" },
  { code: "18-1763", name: "High Risk Red", hex: "#C71F37" },
  { code: "18-1550", name: "Aurora Red", hex: "#B93A32" },
  { code: "19-1760", name: "Scarlet", hex: "#BC243C" },
  { code: "19-1557", name: "Chili Pepper", hex: "#9B1B30" },
  { code: "19-1617", name: "Burgundy", hex: "#64313E" },
  { code: "19-1725", name: "Tawny Port", hex: "#5C2C35" },
  { code: "18-1750", name: "Viva Magenta", hex: "#BB2649" },

  // Rosa
  { code: "13-1520", name: "Rose Quartz", hex: "#F7CAC9" },
  { code: "13-2807", name: "Ballet Slipper", hex: "#EBBED3" },
  { code: "14-3207", name: "Pink Lavender", hex: "#D9AFCA" },
  { code: "17-1928", name: "Bubblegum", hex: "#EA738D" },
  { code: "18-2120", name: "Honeysuckle", hex: "#D94F70" },
  { code: "17-2031", name: "Fuchsia Rose", hex: "#C74375" },

  // Viola
  { code: "18-3224", name: "Radiant Orchid", hex: "#B565A7" },
  { code: "18-3838", name: "Ultra Violet", hex: "#5F4B8B" },
  { code: "18-3943", name: "Blue Iris", hex: "#5A5B9F" },
  { code: "15-3817", name: "Lavender", hex: "#C6B4CE" },
  { code: "19-3220", name: "Plum", hex: "#5A315D" },
  { code: "19-3620", name: "Grape Royale", hex: "#4F2D54" },

  // Marroni e beige
  { code: "18-1438", name: "Marsala", hex: "#955251" },
  { code: "17-1230", name: "Mocha Mousse", hex: "#A47864" },
  { code: "17-1224", name: "Camel", hex: "#B0846A" },
  { code: "16-1334", name: "Tan", hex: "#B69574" },
  { code: "16-1439", name: "Caramel", hex: "#C68E3F" },
  { code: "14-1118", name: "Beige", hex: "#D5BA98" },
  { code: "13-1106", name: "Sand Dollar", hex: "#DECDBE" },
  { code: "18-1031", name: "Toffee", hex: "#755139" },
  { code: "19-1016", name: "Chicory Coffee", hex: "#4A342E" },
  { code: "19-1420", name: "Deep Mahogany", hex: "#553B39" },
];

// Precalcolo dei valori Lab una sola volta al caricamento del modulo:
// il match avviene a ogni campionamento, la conversione solo qui.
const labCache: [number, number, number][] = PANTONE_COLORS.map((p) =>
  rgbToLab(hexToRgb(p.hex))
);

/** Trova il Pantone percettivamente più vicino a un colore RGB. */
export function nearestPantone(rgb: RGB): PantoneColor {
  const lab = rgbToLab(rgb);
  let bestIndex = 0;
  let bestDistance = Infinity;
  for (let i = 0; i < labCache.length; i++) {
    const d = deltaE(lab, labCache[i]);
    if (d < bestDistance) {
      bestDistance = d;
      bestIndex = i;
    }
  }
  return PANTONE_COLORS[bestIndex];
}
