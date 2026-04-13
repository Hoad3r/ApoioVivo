import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Apoio Vivo",
  description:
    "Aplicação assistiva com visão computacional para apoio a idosos com comprometimento cognitivo leve.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#1e40af",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body className="min-h-dvh bg-zinc-200 antialiased">{children}</body>
    </html>
  );
}
