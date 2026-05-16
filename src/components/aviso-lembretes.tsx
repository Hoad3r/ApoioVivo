"use client";

import { useEffect } from "react";
import { getDataStore } from "@/lib/data";
import { minutosBrasilia } from "@/lib/hora";
import { lembretesDevidos } from "@/lib/lembrete-aviso";
import { mensagemContextual } from "@/lib/lembrete-contexto";
import { lembretesAtrasados, mensagemAtraso } from "@/lib/lembrete-pendentes";
import { falar } from "@/lib/voice";
import { notificarCuidador } from "@/lib/notificacao";
import { nomeDaPessoa } from "@/lib/pessoa";

// Conjunto de ids já avisados HOJE, persistido (sobrevive a fechar o app).
function chaveDia(): string {
  return `apoio-vivo:lembretes-avisados:${new Date().toDateString()}`;
}
function carregarAvisados(): Set<string> {
  try {
    return new Set<string>(JSON.parse(localStorage.getItem(chaveDia()) ?? "[]"));
  } catch {
    return new Set<string>();
  }
}
function salvarAvisados(s: Set<string>) {
  try {
    localStorage.setItem(chaveDia(), JSON.stringify([...s]));
  } catch {
    /* sem localStorage: segue só em memória nesta sessão */
  }
}

/**
 * Headless: anuncia lembretes por voz no horário (Brasília) e, ao abrir o app,
 * relembra os que JÁ PASSARAM hoje e não foram avisados. Não renderiza nada.
 */
export function AvisoLembretes() {
  useEffect(() => {
    let ativo = true;

    // Relembra os lembretes que passaram enquanto o app estava fechado.
    function recuperarAtrasados() {
      const store = getDataStore();
      const avisados = carregarAvisados();
      const atrasados = lembretesAtrasados(
        store.listLembretes(),
        minutosBrasilia(),
        avisados,
      );
      if (atrasados.length === 0) return;
      for (const l of atrasados) avisados.add(l.id);
      salvarAvisados(avisados);
      falar(mensagemAtraso(nomeDaPessoa(), atrasados));
      store.addEvento({
        tipo: "atividade",
        descricao: `Lembretes relembrados ao abrir: ${atrasados
          .map((l) => l.titulo)
          .join(", ")}`,
        urgente: false,
      });
    }

    function checar() {
      if (!ativo) return;
      const store = getDataStore();
      const minutos = minutosBrasilia();
      const nome = nomeDaPessoa();
      const avisados = carregarAvisados();

      for (const lembrete of lembretesDevidos(store.listLembretes(), minutos)) {
        if (avisados.has(lembrete.id)) continue; // já avisado hoje
        avisados.add(lembrete.id);
        salvarAvisados(avisados);

        falar(mensagemContextual(nome, lembrete));
        store.addEvento({
          tipo: "atividade",
          descricao: `Lembrete avisado: ${lembrete.titulo}`,
          urgente: false,
        });
        notificarCuidador("Apoio Vivo — Lembrete", lembrete.titulo);
      }
    }

    recuperarAtrasados();
    checar();
    const id = setInterval(checar, 30000); // a cada 30s

    // Ao voltar para o app, relembra o que passou enquanto estava em segundo plano.
    const onVisibilidade = () => {
      if (!document.hidden) recuperarAtrasados();
    };
    document.addEventListener("visibilitychange", onVisibilidade);

    return () => {
      ativo = false;
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisibilidade);
    };
  }, []);

  return null;
}
