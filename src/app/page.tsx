"use client";

import { useCallback, useState } from "react";
import CameraView from "@/components/CameraView";
import PantoneChip from "@/components/PantoneChip";
import GarmentCard from "@/components/GarmentCard";
import ChatPanel from "@/components/ChatPanel";
import type { Garment, RGB, SampledColor } from "@/lib/types";
import { colorFamilyIt, hexToRgb, rgbToHex } from "@/lib/color";
import { nearestPantone } from "@/lib/pantone";

/** Rifiuti consecutivi dopo i quali proponiamo l'analisi AI (vision). */
const AI_FALLBACK_THRESHOLD = 3;

function buildSample(rgb: RGB, fromAi = false): SampledColor {
  return {
    id: crypto.randomUUID(),
    hex: rgbToHex(rgb),
    rgb,
    pantone: nearestPantone(rgb),
    familyIt: colorFamilyIt(rgb),
    fromAi,
  };
}

function newGarment(): Garment {
  return {
    id: crypto.randomUUID(),
    type: "T-shirt",
    pattern: "Tinta unita",
    colors: [],
  };
}

export default function Home() {
  const [pending, setPending] = useState<SampledColor | null>(null);
  const [garments, setGarments] = useState<Garment[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  // Capo a cui assegnare il colore in attesa: id di un capo o "new"
  const [pendingTarget, setPendingTarget] = useState<string>("new");
  // Rifiuti consecutivi nella sessione di campionamento corrente:
  // si azzera quando un colore viene accettato.
  const [rejections, setRejections] = useState(0);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const handleSample = useCallback(
    (rgb: RGB) => {
      setAiError(null);
      setPending(buildSample(rgb));
      setPendingTarget(activeId ?? "new");
    },
    [activeId]
  );

  const handleAiCapture = useCallback(
    async (dataUrl: string) => {
      setAiLoading(true);
      setAiError(null);
      try {
        const res = await fetch("/api/vision", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: dataUrl }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Errore analisi AI");
        setPending(buildSample(hexToRgb(data.hex), true));
        setPendingTarget(activeId ?? "new");
      } catch (err) {
        setAiError(err instanceof Error ? err.message : "Errore analisi AI");
      } finally {
        setAiLoading(false);
      }
    },
    [activeId]
  );

  const acceptPending = () => {
    if (!pending) return;
    const targetExists = garments.some((g) => g.id === pendingTarget);
    if (!targetExists) {
      // "Nuovo capo" (o capo eliminato nel frattempo): ne creiamo uno.
      const g = { ...newGarment(), colors: [pending] };
      setGarments((prev) => [...prev, g]);
      setActiveId(g.id);
    } else {
      setGarments((prev) =>
        prev.map((g) =>
          g.id === pendingTarget ? { ...g, colors: [...g.colors, pending] } : g
        )
      );
      setActiveId(pendingTarget);
    }
    setPending(null);
    setRejections(0);
  };

  const rejectPending = () => {
    setPending(null);
    setRejections((n) => n + 1);
  };

  const addGarment = () => {
    const g = newGarment();
    setGarments((prev) => [...prev, g]);
    setActiveId(g.id);
  };

  const updateGarment = (updated: Garment) => {
    setGarments((prev) => prev.map((g) => (g.id === updated.id ? updated : g)));
  };

  const deleteGarment = (id: string) => {
    setGarments((prev) => prev.filter((g) => g.id !== id));
    setActiveId((current) => (current === id ? null : current));
  };

  return (
    <main className="app">
      <header className="app-header">
        <h1>Color Match</h1>
        <p>Assistente colori e abbinamenti per daltonici</p>
      </header>

      <CameraView
        onSample={handleSample}
        onAiCapture={handleAiCapture}
        showAiButton={rejections >= AI_FALLBACK_THRESHOLD}
        aiLoading={aiLoading}
      />

      {rejections >= AI_FALLBACK_THRESHOLD && !pending && (
        <p className="ai-hint">
          Il campionamento non ti convince? Prova “Analizza con AI”: una foto viene
          inviata al modello di visione per riconoscere il colore.
        </p>
      )}
      {aiError && (
        <p role="alert" className="chat-error">
          {aiError}
        </p>
      )}

      {/* Barra del colore in attesa di conferma: il Pantone compare in basso
          e l'utente decide se accettarlo o rifiutarlo. */}
      {pending && (
        <div className="pending-bar" role="dialog" aria-label="Conferma colore campionato">
          <PantoneChip color={pending} size="lg" onRemove={rejectPending} />
          <label className="pending-target">
            <span className="field-label">Assegna al capo</span>
            <select
              value={garments.some((g) => g.id === pendingTarget) ? pendingTarget : "new"}
              onChange={(e) => setPendingTarget(e.target.value)}
            >
              {garments.map((g, i) => (
                <option key={g.id} value={g.id}>
                  {i + 1}. {g.type} — {g.pattern}
                </option>
              ))}
              <option value="new">Nuovo capo</option>
            </select>
          </label>
          <div className="pending-actions">
            <button type="button" className="btn btn-accept" onClick={acceptPending}>
              Conferma colore
            </button>
            <button type="button" className="btn btn-reject" onClick={rejectPending}>
              Rifiuta
            </button>
          </div>
        </div>
      )}

      <section className="garments-section" aria-label="I tuoi capi">
        <div className="garments-header">
          <h2 className="section-title">I tuoi capi</h2>
          <button type="button" className="btn btn-secondary" onClick={addGarment}>
            + Aggiungi capo
          </button>
        </div>
        {garments.length === 0 ? (
          <p className="section-hint">
            Campiona un colore o aggiungi un capo. Per ogni capo puoi indicare il tipo,
            la fantasia (righe, quadretti…) e più colori campionati.
          </p>
        ) : (
          <div className="garments-list">
            {garments.map((g) => (
              <GarmentCard
                key={g.id}
                garment={g}
                isActive={g.id === activeId}
                onSelect={() => setActiveId(g.id)}
                onUpdate={updateGarment}
                onDelete={() => deleteGarment(g.id)}
              />
            ))}
          </div>
        )}
      </section>

      <ChatPanel garments={garments} />

      <footer className="app-footer">
        I riferimenti Pantone sono approssimazioni indicative. I suggerimenti AI possono
        contenere errori.
      </footer>
    </main>
  );
}
