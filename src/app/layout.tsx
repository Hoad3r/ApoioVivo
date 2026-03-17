import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Apoio Vivo",
  description:
    "Aplicação assistiva com visão computacional para apoio a idosos com comprometimento cognitivo leve.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body className="min-h-dvh antialiased">{children}</body>
    </html>
  );
}
