import Link from "next/link";
import type { ReactNode } from "react";

type Variante = "azul" | "vermelho" | "neutro";

const ESTILOS: Record<Variante, string> = {
  azul: "bg-blue-700 text-white hover:bg-blue-800",
  vermelho: "bg-red-600 text-white hover:bg-red-700",
  neutro: "bg-zinc-100 text-zinc-900 hover:bg-zinc-200",
};

interface BotaoGrandeProps {
  href: string;
  label: string;
  icon: ReactNode;
  variante?: Variante;
}

/** Botão grande e acessível (alvo ≥ 64px) usado nas telas do idoso. */
export function BotaoGrande({
  href,
  label,
  icon,
  variante = "azul",
}: BotaoGrandeProps) {
  return (
    <Link
      href={href}
      className={`flex min-h-16 items-center justify-center gap-3 rounded-2xl px-6 py-5 text-2xl font-bold shadow-sm transition-colors sm:min-h-20 sm:text-3xl ${ESTILOS[variante]}`}
    >
      <span aria-hidden className="text-3xl sm:text-4xl">
        {icon}
      </span>
      {label}
    </Link>
  );
}
