"use client";

import type { Lembrete } from "@/lib/types";
import { RECORRENCIA_LABEL } from "@/lib/types";
import { falar } from "@/lib/voice";

interface LembreteCardProps {
  lembrete: Lembrete;
  onEditar: () => void;
  onExcluir: () => void;
}

export function LembreteCard({ lembrete, onEditar, onExcluir }: LembreteCardProps) {
  const fala = `${lembrete.titulo}, às ${lembrete.hora}, ${RECORRENCIA_LABEL[lembrete.recorrencia]}`;

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xl font-bold text-zinc-900">{lembrete.titulo}</p>
          <p className="mt-1 text-zinc-600">
            <span aria-hidden>🕐</span> {lembrete.hora} ·{" "}
            <span aria-hidden>🔁</span> {RECORRENCIA_LABEL[lembrete.recorrencia]}
          </p>
        </div>
        <button
          type="button"
          onClick={() => falar(fala)}
          aria-label={`Ouvir lembrete: ${lembrete.titulo}`}
          className="rounded-xl bg-blue-700 p-3 text-xl text-white hover:bg-blue-800"
        >
          <span aria-hidden>🔊</span>
        </button>
      </div>

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={onEditar}
          className="flex-1 rounded-xl bg-zinc-100 py-2 font-medium text-zinc-700 hover:bg-zinc-200"
        >
          <span aria-hidden>✏️</span> Editar
        </button>
        <button
          type="button"
          onClick={onExcluir}
          className="flex-1 rounded-xl bg-red-50 py-2 font-medium text-red-600 hover:bg-red-100"
        >
          <span aria-hidden>🗑️</span> Excluir
        </button>
      </div>
    </div>
  );
}
