"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import type { ChatMessage, Garment } from "@/lib/types";

interface ChatPanelProps {
  garments: Garment[];
}

export default function ChatPanel({ garments }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setInput("");
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages,
          garments: garments.map((g) => ({
            type: g.type,
            pattern: g.pattern,
            colors: g.colors.map((c) => ({
              pantoneCode: c.pantone.code,
              pantoneName: c.pantone.name,
              hex: c.pantone.hex,
              familyIt: c.familyIt,
            })),
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error ?? "Errore sconosciuto");
      }
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Errore di rete. Riprova.");
      // Ripristina l'input così l'utente non riscrive tutto
      setMessages(messages);
      setInput(text);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="chat-panel" aria-label="Chat con lo stilista AI">
      <h2 className="section-title">Chiedi allo stilista</h2>
      <p className="section-hint">
        I capi campionati vengono condivisi automaticamente. Chiedi ad esempio: “Cosa
        abbino a questi colori?” oppure “Questi capi stanno bene insieme?”
      </p>

      <div className="chat-messages" ref={listRef}>
        {messages.length === 0 && (
          <p className="chat-empty">Nessun messaggio. Scrivi la tua prima richiesta.</p>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`chat-bubble chat-${m.role}`}>
            {m.content}
          </div>
        ))}
        {loading && <div className="chat-bubble chat-assistant chat-typing">Sto pensando…</div>}
      </div>

      {error && (
        <p role="alert" className="chat-error">
          {error}
        </p>
      )}

      <form className="chat-form" onSubmit={handleSubmit}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Es: con cosa abbino questa maglietta?"
          aria-label="Messaggio per lo stilista"
          disabled={loading}
        />
        <button type="submit" className="btn btn-primary" disabled={loading || !input.trim()}>
          Invia
        </button>
      </form>
    </section>
  );
}
