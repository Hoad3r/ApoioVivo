"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ITENS = [
  { href: "/", label: "Início", icon: "🏠" },
  { href: "/lembretes", label: "Lembretes", icon: "🔔" },
  { href: "/historico", label: "Histórico", icon: "🕐" },
  { href: "/cuidador/painel", label: "Alertas", icon: "📢" },
];

/** Barra de navegação inferior acessível (tab bar). */
export function NavInferior() {
  const path = usePathname();
  return (
    <nav
      aria-label="Navegação principal"
      className="fixed inset-x-0 bottom-0 z-10 border-t border-zinc-200 bg-white"
    >
      <ul className="mx-auto flex max-w-md">
        {ITENS.map((it) => {
          const ativo =
            it.href === "/" ? path === "/" : path.startsWith(it.href);
          return (
            <li key={it.href} className="flex-1">
              <Link
                href={it.href}
                aria-current={ativo ? "page" : undefined}
                className={`flex flex-col items-center gap-1 py-3 text-sm font-medium ${
                  ativo ? "text-blue-700" : "text-zinc-500"
                }`}
              >
                <span aria-hidden className="text-2xl">
                  {it.icon}
                </span>
                {it.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
