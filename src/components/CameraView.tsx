"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { RGB } from "@/lib/types";
import { dominantColor } from "@/lib/color";

interface CameraViewProps {
  /** Colore campionato via JS dai pixel centrali del video */
  onSample: (rgb: RGB) => void;
  /** Frame JPEG (data URL) da inviare al modello vision */
  onAiCapture: (dataUrl: string) => void;
  /** Mostra il pulsante AI solo dopo ripetuti rifiuti */
  showAiButton: boolean;
  aiLoading: boolean;
}

/** Lato (in px sorgente) della regione centrale campionata. */
const SAMPLE_SIZE = 96;
/** Larghezza massima del frame inviato al modello vision. */
const AI_FRAME_MAX_WIDTH = 640;

export default function CameraView({
  onSample,
  onAiCapture,
  showAiButton,
  aiLoading,
}: CameraViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState(false);

  const startCamera = useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setActive(true);
    } catch {
      setError(
        "Impossibile accedere alla fotocamera. Verifica i permessi del browser (serve HTTPS o localhost)."
      );
    }
  }, []);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const handleSample = () => {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0) return;

    const canvas = document.createElement("canvas");
    canvas.width = SAMPLE_SIZE;
    canvas.height = SAMPLE_SIZE;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    const sx = (video.videoWidth - SAMPLE_SIZE) / 2;
    const sy = (video.videoHeight - SAMPLE_SIZE) / 2;
    ctx.drawImage(video, sx, sy, SAMPLE_SIZE, SAMPLE_SIZE, 0, 0, SAMPLE_SIZE, SAMPLE_SIZE);
    const imageData = ctx.getImageData(0, 0, SAMPLE_SIZE, SAMPLE_SIZE);
    onSample(dominantColor(imageData.data));
  };

  const handleAiCapture = () => {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0) return;

    const scale = Math.min(1, AI_FRAME_MAX_WIDTH / video.videoWidth);
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(video.videoWidth * scale);
    canvas.height = Math.round(video.videoHeight * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    onAiCapture(canvas.toDataURL("image/jpeg", 0.8));
  };

  return (
    <div className="camera-wrap">
      <div className="camera-frame">
        {/* playsInline è indispensabile su iOS: senza, il video va a schermo intero */}
        <video ref={videoRef} playsInline muted className="camera-video" />
        {active && <div className="reticle" aria-hidden="true" />}
        {!active && (
          <div className="camera-placeholder">
            {error ? (
              <p role="alert" className="camera-error">{error}</p>
            ) : (
              <p>Inquadra il vestito e campiona il colore al centro del mirino.</p>
            )}
            <button type="button" className="btn btn-primary" onClick={startCamera}>
              Apri fotocamera
            </button>
          </div>
        )}
      </div>

      {active && (
        <div className="camera-actions">
          <button type="button" className="btn btn-primary btn-lg" onClick={handleSample}>
            Campiona colore
          </button>
          {showAiButton && (
            <button
              type="button"
              className="btn btn-ai"
              onClick={handleAiCapture}
              disabled={aiLoading}
            >
              {aiLoading ? "Analisi in corso…" : "Analizza con AI"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
