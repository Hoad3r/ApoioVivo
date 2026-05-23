import Link from "next/link";
import type { ReactNode } from "react";

type Variante = "teal" | "emergencia" | "neutro";

interface BotaoGrandeProps {
  href: string;
  label: string;
  icon: ReactNode;
  variante?: Variante;
}

/** Card de atalho grande e acessível (alvo ≥ 96px) das telas do idoso. */
export function BotaoGrande({
  href,
  label,
  icon,
  variante = "teal",
}: BotaoGrandeProps) {
  if (variante === "emergencia") {
    return (
      <Link
        href={href}
        className="flex min-h-20 items-center justify-center gap-3 rounded-3xl bg-red-600 px-6 py-5 text-2xl font-bold text-white shadow-sm transition hover:bg-red-700 sm:text-3xl"
      >
        <span aria-hidden className="text-3xl sm:text-4xl">
          {icon}
        </span>
        {label}
      </Link>
    );
  }
  const tint =
    variante === "neutro"
      ? "bg-white border-zinc-200 text-zinc-900"
      : "bg-teal-50 border-teal-200 text-teal-800";
  const chip =
    variante === "neutro" ? "bg-zinc-200 text-zinc-700" : "bg-teal-600 text-white";
  return (
    <Link
      href={href}
      className={`group flex min-h-28 flex-col justify-between gap-4 rounded-3xl border p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${tint}`}
    >
      <span
        aria-hidden
        className={`flex h-14 w-14 items-center justify-center rounded-2xl text-3xl ${chip}`}
      >
        {icon}
      </span>
      <span className="text-xl font-bold sm:text-2xl">{label}</span>
    </Link>
  );
}
