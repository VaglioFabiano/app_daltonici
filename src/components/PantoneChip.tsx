"use client";

import type { SampledColor } from "@/lib/types";

interface PantoneChipProps {
  color: SampledColor;
  /** Se presente, mostra il pulsante per rimuovere/rifiutare il colore */
  onRemove?: () => void;
  size?: "sm" | "lg";
}

/**
 * Chip stile cartella Pantone: swatch + codice + nome + famiglia in italiano.
 * Il nome è sempre visibile: per un utente daltonico è il nome, non lo
 * swatch, a trasmettere l'informazione.
 */
export default function PantoneChip({ color, onRemove, size = "sm" }: PantoneChipProps) {
  return (
    <div className={`pantone-chip pantone-chip-${size}`}>
      <span
        className="pantone-swatch"
        style={{ backgroundColor: color.pantone.hex }}
        aria-hidden="true"
      />
      <span className="pantone-info">
        <span className="pantone-code">
          PANTONE {color.pantone.code}
          {color.fromAi && <span className="ai-badge" title="Riconosciuto con AI">AI</span>}
        </span>
        <span className="pantone-name">{color.pantone.name}</span>
        <span className="pantone-family">{color.familyIt}</span>
      </span>
      {onRemove && (
        <button
          type="button"
          className="chip-remove"
          onClick={onRemove}
          aria-label={`Rimuovi colore ${color.pantone.name}`}
        >
          ×
        </button>
      )}
    </div>
  );
}
