"use client";

import { useEffect, useRef, useState } from "react";
import type { Lembrete } from "@/lib/types";
import { getDataStore } from "@/lib/data";
import {
  horaParaMinutos,
  mensagemContextual,
  proximoLembrete,
} from "@/lib/lembrete-contexto";
import { falar } from "@/lib/voice";

/** Mostra o próximo lembrete e dispara avisos contextuais por voz no horário. */
export function ProximoLembrete() {
  const [proximo, setProximo] = useState<Lembrete | null>(null);
  const [contextual, setContextual] = useState<string | null>(null);
  const jaFalado = useRef<Set<string>>(new Set());

  useEffect(() => {
    const store = getDataStore();

    function checar() {
      const lembretes = store.listLembretes();
      const agora = new Date();
      setProximo(proximoLembrete(lembretes, agora));

      const minAgora = agora.getHours() * 60 + agora.getMinutes();
      const nome = store.getUsuario().nome;
      for (const l of lembretes) {
        const chave = `${l.id}:${agora.toDateString()}:${l.hora}`;
        if (horaParaMinutos(l.hora) === minAgora && !jaFalado.current.has(chave)) {
          jaFalado.current.add(chave);
          const msg = mensagemContextual(nome, l);
          setContextual(msg);
          falar(msg);
        }
      }
    }

    checar();
    const id = setInterval(checar, 30000);
    return () => clearInterval(id);
  }, []);

  function testarContextual() {
    if (!proximo) return;
    const nome = getDataStore().getUsuario().nome;
    const msg = mensagemContextual(nome, proximo);
    setContextual(msg);
    falar(msg);
  }

  return (
    <>
      {contextual && (
        <div
          role="status"
          aria-live="polite"
          className="rounded-2xl bg-blue-50 px-5 py-4 text-blue-900"
        >
          <span aria-hidden>🔔</span> {contextual}
        </div>
      )}

      <div className="rounded-2xl bg-zinc-100 px-5 py-4 text-center">
        {proximo ? (
          <>
            <p className="text-zinc-600">
              Próximo lembrete às{" "}
              <strong className="text-zinc-900">{proximo.hora}</strong>
            </p>
            <p className="text-zinc-600">{proximo.titulo}</p>
            <button
              type="button"
              onClick={testarContextual}
              className="mt-3 rounded-full bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800"
            >
              <span aria-hidden>▶</span> Ouvir aviso
            </button>
          </>
        ) : (
          <p className="text-zinc-600">Nenhum lembrete cadastrado</p>
        )}
      </div>
    </>
  );
}
