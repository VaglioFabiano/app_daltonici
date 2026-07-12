"use client";

import type { Garment, GarmentType, Pattern } from "@/lib/types";
import { GARMENT_TYPES, PATTERNS } from "@/lib/types";
import PantoneChip from "./PantoneChip";

interface GarmentCardProps {
  garment: Garment;
  isActive: boolean;
  onSelect: () => void;
  onUpdate: (garment: Garment) => void;
  onDelete: () => void;
}

export default function GarmentCard({
  garment,
  isActive,
  onSelect,
  onUpdate,
  onDelete,
}: GarmentCardProps) {
  return (
    <div
      className={`garment-card ${isActive ? "garment-card-active" : ""}`}
      onClick={onSelect}
    >
      <div className="garment-header">
        <label className="garment-field">
          <span className="field-label">Capo</span>
          <select
            value={garment.type}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) =>
              onUpdate({ ...garment, type: e.target.value as GarmentType })
            }
          >
            {GARMENT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <label className="garment-field">
          <span className="field-label">Fantasia</span>
          <select
            value={garment.pattern}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) =>
              onUpdate({ ...garment, pattern: e.target.value as Pattern })
            }
          >
            {PATTERNS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className="garment-delete"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          aria-label={`Elimina ${garment.type}`}
        >
          Elimina
        </button>
      </div>

      <div className="garment-colors">
        {garment.colors.length === 0 ? (
          <p className="garment-empty">
            {isActive
              ? "Campiona un colore dalla camera: verrà aggiunto qui."
              : "Nessun colore. Tocca la scheda per renderla attiva."}
          </p>
        ) : (
          garment.colors.map((c) => (
            <PantoneChip
              key={c.id}
              color={c}
              onRemove={() =>
                onUpdate({
                  ...garment,
                  colors: garment.colors.filter((x) => x.id !== c.id),
                })
              }
            />
          ))
        )}
      </div>

      {isActive && <div className="active-badge">Campionamento attivo</div>}
    </div>
  );
}
