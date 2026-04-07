"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Evento, TipoEvento } from "@/lib/types";
import { getDataStore } from "@/lib/data";

const ICONE: Record<TipoEvento, string> = {
  atividade: "✅",
  "lembrete-ignorado": "⚠️",
  queda: "🚨",
  emergencia: "📞",
  objeto: "📦",
};

function formatar(criadoEm: string): string {
  return new Date(criadoEm).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function HistoricoPage() {
  const [eventos, setEventos] = useState<Evento[]>([]);

  useEffect(() => {
    setEventos(getDataStore().listEventos());
  }, []);

  return (
    <main>
      <header className="flex items-center gap-3 rounded-b-3xl bg-blue-800 px-5 pb-6 pt-6 text-white">
        <Link href="/" aria-label="Voltar para o início" className="text-2xl">
          ←
        </Link>
        <h1 className="text-2xl font-bold">Histórico</h1>
      </header>

      <ul className="space-y-3 px-5 py-6">
        {eventos.map((e) => (
          <li
            key={e.id}
            className={`rounded-2xl bg-white p-4 shadow-sm ${
              e.urgente ? "border-l-4 border-red-500" : ""
            }`}
          >
            <div className="flex items-start gap-3">
              <span aria-hidden className="text-2xl">
                {ICONE[e.tipo]}
              </span>
              <div>
                <p className="font-bold text-zinc-900">{e.descricao}</p>
                <p className="mt-0.5 text-sm text-zinc-500">
                  {formatar(e.criadoEm)}
                  {e.urgente && (
                    <span className="ml-2 rounded bg-red-100 px-2 py-0.5 text-xs font-bold text-red-700">
                      URGENTE
                    </span>
                  )}
                </p>
              </div>
            </div>
          </li>
        ))}
        {eventos.length === 0 && (
          <p className="py-10 text-center text-zinc-500">
            Nenhum evento registrado ainda.
          </p>
        )}
      </ul>
    </main>
  );
}
