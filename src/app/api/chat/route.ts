import { NextRequest, NextResponse } from "next/server";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const TEXT_MODEL = "openai/gpt-oss-120b";

const SYSTEM_PROMPT = `You are an expert professional fashion stylist. Your mission is to support people with color blindness (color vision deficiency) in choosing and matching clothes.

You will receive a structured description of the garments the user has scanned with their camera: for each garment you get its type, its pattern (solid, stripes, checks, polka dots, floral, multicolor) and its sampled colors expressed as Pantone references (code, name, hex) plus a plain-language color family.

Your tasks:
- Suggest garments and colors that pair well with the scanned items, always naming colors explicitly (e.g. "navy blue", "burgundy") — never rely on the user being able to see or distinguish the colors themselves.
- When the user asks whether two or more garments match, give an honest, clear verdict (yes / no / it depends) followed by a short explanation based on color theory (complementary, analogous, neutral pairing, contrast, saturation balance) and concrete alternatives if the combination does not work.
- Take patterns into account: mixing two bold patterns is risky; a patterned piece usually pairs best with a solid piece picking up one of its colors.
- Be practical, warm and encouraging.
- Remember the user may be color blind: describe colors with unambiguous names and everyday references (e.g. "verde bosco, un verde scuro come gli aghi di pino"), and never say "as you can see".

CONCISENESS RULE (critical): keep every reply SHORT — at most 4-6 bullet points or 2 brief paragraphs, around 80 words total. Get straight to the point: verdict or suggestion first, one line of reasoning after. Never write long essays or exhaustive lists. Expand only if the user explicitly asks for more detail.

FORMATTING RULE: use only simple Markdown: **bold** for garment and color names, "-" for bullet lists. Never use tables, headings (#), code blocks or nested lists.

LANGUAGE RULE (critical): detect the language of the user's FIRST message in the conversation and ALWAYS reply in that language for the entire conversation, regardless of the language of this prompt or of the garment data.`;

interface GarmentPayload {
  type: string;
  pattern: string;
  colors: {
    pantoneCode: string;
    pantoneName: string;
    hex: string;
    familyIt: string;
  }[];
}

interface ChatRequestBody {
  messages: { role: "user" | "assistant"; content: string }[];
  garments: GarmentPayload[];
}

function garmentsToContext(garments: GarmentPayload[]): string {
  if (garments.length === 0) {
    return "The user has not scanned any garment yet.";
  }
  const lines = garments.map((g, i) => {
    const colors =
      g.colors.length > 0
        ? g.colors
            .map(
              (c) =>
                `Pantone ${c.pantoneCode} "${c.pantoneName}" (${c.hex}, family: ${c.familyIt})`
            )
            .join("; ")
        : "no colors sampled";
    return `${i + 1}. ${g.type} — pattern: ${g.pattern} — colors: ${colors}`;
  });
  return `Garments scanned by the user:\n${lines.join("\n")}`;
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.GROQ_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Variabile d'ambiente GROQ_KEY non configurata." },
      { status: 500 }
    );
  }

  let body: ChatRequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Richiesta non valida." }, { status: 400 });
  }

  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return NextResponse.json({ error: "Nessun messaggio fornito." }, { status: 400 });
  }

  const groqMessages = [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "system", content: garmentsToContext(body.garments ?? []) },
    ...body.messages.map((m) => ({ role: m.role, content: m.content })),
  ];

  try {
    const res = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: TEXT_MODEL,
        messages: groqMessages,
        temperature: 0.7,
        max_tokens: 400,
      }),
    });

    if (!res.ok) {
      const detail = await res.text();
      console.error("Groq chat error:", res.status, detail);
      return NextResponse.json(
        { error: "Errore dal servizio AI. Riprova tra poco." },
        { status: 502 }
      );
    }

    const data = await res.json();
    const reply: string | undefined = data.choices?.[0]?.message?.content;
    if (!reply) {
      return NextResponse.json(
        { error: "Risposta AI vuota. Riprova." },
        { status: 502 }
      );
    }

    return NextResponse.json({ reply });
  } catch (err) {
    console.error("Groq chat fetch failed:", err);
    return NextResponse.json(
      { error: "Impossibile contattare il servizio AI." },
      { status: 502 }
    );
  }
}
