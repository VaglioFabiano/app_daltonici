import { NextRequest, NextResponse } from "next/server";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
// Il modello vision più economico disponibile su Groq.
const VISION_MODEL = "meta-llama/llama-4-scout-17b-16e-instruct";

const VISION_PROMPT = `Look at the garment (piece of clothing) at the center of this photo. Identify its single dominant color.
Respond ONLY with a JSON object, no markdown, no explanation:
{"hex": "#RRGGBB", "name": "short English color name"}`;

export async function POST(req: NextRequest) {
  const apiKey = process.env.GROQ_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Variabile d'ambiente GROQ_KEY non configurata." },
      { status: 500 }
    );
  }

  let body: { image?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Richiesta non valida." }, { status: 400 });
  }

  if (!body.image || !body.image.startsWith("data:image/")) {
    return NextResponse.json({ error: "Nessuna immagine fornita." }, { status: 400 });
  }

  try {
    const res = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: VISION_MODEL,
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: VISION_PROMPT },
              { type: "image_url", image_url: { url: body.image } },
            ],
          },
        ],
        temperature: 0.1,
        max_tokens: 100,
      }),
    });

    if (!res.ok) {
      const detail = await res.text();
      console.error("Groq vision error:", res.status, detail);
      return NextResponse.json(
        { error: "Errore dal servizio AI di visione." },
        { status: 502 }
      );
    }

    const data = await res.json();
    const raw: string = data.choices?.[0]?.message?.content ?? "";

    // Il modello a volte avvolge il JSON in code fence: estraiamo il primo oggetto.
    const match = raw.match(/\{[\s\S]*?\}/);
    if (!match) {
      return NextResponse.json(
        { error: "Il modello non ha restituito un colore valido." },
        { status: 502 }
      );
    }

    let parsed: { hex?: string; name?: string };
    try {
      parsed = JSON.parse(match[0]);
    } catch {
      return NextResponse.json(
        { error: "Il modello non ha restituito un colore valido." },
        { status: 502 }
      );
    }

    if (!parsed.hex || !/^#[0-9a-fA-F]{6}$/.test(parsed.hex)) {
      return NextResponse.json(
        { error: "Colore non riconosciuto nell'immagine." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      hex: parsed.hex.toUpperCase(),
      name: parsed.name ?? "",
    });
  } catch (err) {
    console.error("Groq vision fetch failed:", err);
    return NextResponse.json(
      { error: "Impossibile contattare il servizio AI." },
      { status: 502 }
    );
  }
}
