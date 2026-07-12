import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Color Match — Assistente colori per daltonici",
  description:
    "Riconosci il colore dei tuoi vestiti con la fotocamera e ricevi suggerimenti di abbinamento da uno stilista AI.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  // Estende lo sfondo dietro notch e barra home di iPhone
  viewportFit: "cover",
  themeColor: "#101418",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  );
}
