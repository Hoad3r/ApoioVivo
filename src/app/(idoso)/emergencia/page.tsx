"use client";

import { useState } from "react";
import Link from "next/link";
import { getDataStore } from "@/lib/data";
import { falar } from "@/lib/voice";
import { notificarCuidador } from "@/lib/notificacao";
import { enviarAlertaEmail } from "@/lib/alertar";

export default function EmergenciaPage() {
  const [acionado, setAcionado] = useState(false);

  function ligar() {
    getDataStore().addEvento({
      tipo: "emergencia",
      descricao: "Botão de emergência acionado pelo idoso",
      urgente: true,
    });
    falar("Pedido de ajuda enviado. O cuidador foi avisado e está a caminho.");
    const detalhe = "O idoso acionou o botão de emergência e precisa de ajuda.";
    notificarCuidador("Apoio Vivo — Emergência", detalhe);
    enviarAlertaEmail("Emergência", detalhe);
    setAcionado(true);
  }

  return (
    <main className="flex min-h-[78vh] flex-col bg-red-600 text-white">
      <header className="px-5 pt-6">
        <Link href="/" aria-label="Voltar para o início" className="text-2xl">
          ←
        </Link>
      </header>

      <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <h1 className="text-3xl font-bold">Precisa de Ajuda?</h1>
        <p className="mt-2 text-lg opacity-90">Pressione o botão para ligar</p>

        <button
          type="button"
          onClick={ligar}
          aria-label="Ligar para o cuidador agora"
          className="mt-10 flex h-56 w-56 flex-col items-center justify-center rounded-full bg-white text-red-600 shadow-xl transition-transform hover:scale-105 active:scale-95"
        >
          <span aria-hidden className="text-6xl">
            📞
          </span>
          <span className="mt-1 text-2xl font-extrabold">LIGAR</span>
        </button>

        <p
          role="status"
          aria-live="polite"
          className="mt-10 max-w-xs text-sm opacity-95"
        >
          {acionado
            ? "✓ O cuidador recebeu o alerta com a sua localização."
            : "O cuidador receberá uma notificação imediata com a sua localização."}
        </p>
      </div>
    </main>
  );
}
