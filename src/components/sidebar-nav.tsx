"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITENS = [
  { href: "/", label: "Início", icon: "🏠" },
  { href: "/lembretes", label: "Lembretes", icon: "🔔" },
  { href: "/historico", label: "Histórico", icon: "🕐" },
  { href: "/monitoramento", label: "Câmera", icon: "📷" },
  { href: "/emergencia", label: "Emergência", icon: "📞" },
];

/** Navegação lateral (desktop). No mobile usa-se a barra inferior. */
export function SidebarNav() {
  const path = usePathname();
  return (
    <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-zinc-200 bg-white px-4 py-6 lg:flex">
      <Link href="/" className="flex items-center gap-3 px-2">
        <span
          aria-hidden
          className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 text-xl text-white shadow-sm"
        >
          💙
        </span>
        <span className="text-xl font-extrabold tracking-tight text-zinc-900">
          Apoio Vivo
        </span>
      </Link>

      <nav aria-label="Navegação" className="mt-8 flex flex-col gap-1">
        {ITENS.map((it) => {
          const ativo =
            it.href === "/" ? path === "/" : path.startsWith(it.href);
          return (
            <Link
              key={it.href}
              href={it.href}
              aria-current={ativo ? "page" : undefined}
              className={`flex items-center gap-3 rounded-xl px-3 py-3 text-lg font-semibold transition-colors ${
                ativo
                  ? "bg-teal-50 text-teal-700"
                  : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
              }`}
            >
              <span aria-hidden className="text-2xl">
                {it.icon}
              </span>
              {it.label}
            </Link>
          );
        })}
      </nav>

      <Link
        href="/configurar"
        className="mt-auto flex items-center gap-3 rounded-xl px-3 py-3 text-lg font-semibold text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
      >
        <span aria-hidden className="text-2xl">
          ⚙️
        </span>
        Configurações
      </Link>
    </aside>
  );
}
