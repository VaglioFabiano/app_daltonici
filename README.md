# Color Match — Assistente colori per daltonici

App web (Next.js + TypeScript) pensata per persone daltoniche: inquadri un vestito con la
fotocamera, l'app riconosce il colore dominante, lo traduce in un riferimento **Pantone
con nome** e una **famiglia colore in italiano**, e uno **stilista AI** suggerisce gli
abbinamenti.

## Funzionalità

- **Camera live** con mirino centrale: il colore viene campionato dai pixel al centro
  dell'inquadratura (colore dominante calcolato in JavaScript, nessuna chiamata AI).
- **Chip Pantone in basso** con codice, nome e famiglia colore in italiano; l'utente
  **accetta o rifiuta** ogni campione.
- **Fallback AI**: dopo 3 rifiuti consecutivi nella stessa sessione di campionamento
  compare il pulsante "Analizza con AI", che invia un frame al modello vision più
  economico di Groq (`meta-llama/llama-4-scout-17b-16e-instruct`).
- **Più capi, più colori**: per ogni capo si indica il tipo (t-shirt, pantaloni…) e la
  fantasia (tinta unita, righe, quadretti, pois, floreale, multicolore) e si possono
  assegnare più colori campionati.
- **Chat con lo stilista AI** (`openai/gpt-oss-120b` su Groq): suggerisce capi e colori
  da abbinare e dice se i capi campionati stanno bene insieme. Il system prompt è in
  inglese ma la risposta è sempre nella lingua del primo messaggio dell'utente.

## Sviluppo locale

```bash
npm install
cp .env.local.example .env.local   # inserisci la tua chiave Groq
npm run dev
```

Apri http://localhost:3000. La fotocamera funziona su `localhost` e in HTTPS.

## Deploy su Vercel

1. Pusha il progetto su un repository Git (GitHub/GitLab).
2. Su Vercel: **Add New Project** → importa il repository (framework rilevato: Next.js,
   nessuna configurazione necessaria).
3. In **Settings → Environment Variables** aggiungi:
   - Name: `GROQ_KEY`
   - Value: la tua chiave API Groq (`gsk_…`)
4. Deploy. Le route `/api/chat` e `/api/vision` girano come serverless functions: la
   chiave non è mai esposta al browser.

## Architettura

```
src/
├── app/
│   ├── page.tsx            # Stato principale: campioni, capi, fallback AI
│   ├── layout.tsx
│   ├── globals.css
│   └── api/
│       ├── chat/route.ts   # Stilista AI (openai/gpt-oss-120b)
│       └── vision/route.ts # Riconoscimento colore via AI (llama-4-scout)
├── components/
│   ├── CameraView.tsx      # getUserMedia + campionamento canvas
│   ├── PantoneChip.tsx     # Chip stile cartella Pantone con pulsante di rimozione
│   ├── GarmentCard.tsx     # Tipo capo, fantasia, colori assegnati
│   └── ChatPanel.tsx       # Chat con lo stilista
└── lib/
    ├── color.ts            # Colore dominante, RGB→Lab, Delta E, famiglie IT
    ├── pantone.ts          # Dataset Pantone TCX + match percettivo
    └── types.ts
```

### Note tecniche

- Il riconoscimento colore è **sempre prima in JavaScript** (istogramma quantizzato sui
  pixel del mirino, più robusto della media aritmetica su fantasie). L'AI vision è solo
  l'ultima spiaggia dopo ripetuti rifiuti.
- Il match Pantone usa la distanza **Delta E in spazio CIELAB** (percettiva), non RGB.
- I valori hex dei Pantone sono trasposizioni sRGB indicative, non riferimenti
  certificati Pantone.
