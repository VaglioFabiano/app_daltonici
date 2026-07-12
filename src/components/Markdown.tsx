"use client";

import React from "react";

/**
 * Mini-renderer Markdown per le risposte dello stilista.
 * Supporta solo ciò che il system prompt autorizza il modello a usare:
 * **grassetto**, *corsivo*, titoli (#) ed elenchi puntati/numerati.
 * Niente dangerouslySetInnerHTML: produce nodi React, quindi nessun
 * rischio di iniezione HTML dal testo del modello.
 */

function renderInline(text: string): React.ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      return <strong key={i}>{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("*") && part.endsWith("*") && part.length > 2) {
      return <em key={i}>{part.slice(1, -1)}</em>;
    }
    return part;
  });
}

export default function Markdown({ text }: { text: string }) {
  const blocks: React.ReactNode[] = [];
  let list: { ordered: boolean; items: string[] } | null = null;

  const flushList = () => {
    if (!list) return;
    const ListTag = list.ordered ? "ol" : "ul";
    blocks.push(
      <ListTag key={blocks.length} className="md-list">
        {list.items.map((item, i) => (
          <li key={i}>{renderInline(item)}</li>
        ))}
      </ListTag>
    );
    list = null;
  };

  for (const line of text.split("\n")) {
    const bullet = line.match(/^\s*[-*•]\s+(.*)/);
    const numbered = line.match(/^\s*\d+[.)]\s+(.*)/);
    const heading = line.match(/^\s*#{1,4}\s+(.*)/);

    if (bullet) {
      if (list && list.ordered) flushList();
      if (!list) list = { ordered: false, items: [] };
      list.items.push(bullet[1]);
    } else if (numbered) {
      if (list && !list.ordered) flushList();
      if (!list) list = { ordered: true, items: [] };
      list.items.push(numbered[1]);
    } else {
      flushList();
      if (line.trim() === "") continue;
      if (heading) {
        blocks.push(
          <p key={blocks.length} className="md-heading">
            <strong>{renderInline(heading[1])}</strong>
          </p>
        );
      } else {
        blocks.push(
          <p key={blocks.length} className="md-p">
            {renderInline(line)}
          </p>
        );
      }
    }
  }
  flushList();

  return <>{blocks}</>;
}
