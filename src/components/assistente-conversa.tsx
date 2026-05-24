"use client";

import { useRef, useState } from "react";
import { falar } from "@/lib/voice";
import { frase } from "@/lib/frases";
import { interpretar, responder } from "@/lib/dialogo";
import { criarReconhecimento, transcricao } from "@/lib/speech";
import { notificarCuidador } from "@/lib/notificacao";
import { enviarAlertaEmail } from "@/lib/alertar";
import { getDataStore } from "@/lib/data";
import { nomeDaPessoa } from "@/lib/pessoa";

type Estado = "parado" | "falando" | "ouvindo";

export function AssistenteConversa() {
  const [estado, setEstado] = useState<Estado>("parado");
  const [legenda, setLegenda] = useState<string | null>(null);
  const tentativas = useRef(0);

  function dizer(texto: string, aoTerminar?: () => void) {
    setEstado("falando");
    setLegenda(`🔊 ${texto}`);
    falar(texto, { urgente: true, aoTerminar });
  }

  function pedirAjuda() {
    getDataStore().addEvento({
      tipo: "emergencia",
      descricao: "Pedido de ajuda por voz do assistente",
      urgente: true,
    });
    notificarCuidador(
      "Apoio Vivo — Pedido de ajuda",
      "A pessoa pediu ajuda pela conversa por voz.",
    );
    enviarAlertaEmail(
      "Pedido de ajuda",
      "A pessoa pediu ajuda durante a conversa por voz do assistente.",
    );
  }

  function ouvir(confirmacao: boolean) {
    const reco = criarReconhecimento();
    if (!reco) {
      dizer("Seu aparelho não permite ouvir a sua resposta por aqui.", () =>
        encerrar(),
      );
      return;
    }
    setEstado("ouvindo");
    setLegenda("🎤 Estou ouvindo você…");
    reco.onresult = (e) => tratar(transcricao(e), confirmacao);
    reco.onerror = () =>
      dizer("Não consegui ouvir. Vamos tentar de novo depois.", () =>
        encerrar(),
      );
    reco.onend = () => {
      // Se terminou sem resultado e ainda estamos "ouvindo", encerra suave.
      setEstado((atual) => (atual === "ouvindo" ? "parado" : atual));
    };
    reco.start();
  }

  function tratar(texto: string, confirmacao: boolean) {
    setLegenda(`💬 Você disse: "${texto}"`);
    const intencao = interpretar(texto);

    // Estamos confirmando se deve chamar o cuidador.
    if (confirmacao) {
      if (intencao === "positivo" || intencao === "ajuda") {
        pedirAjuda();
        dizer("Pronto, já avisei um cuidador. Logo alguém vem te ver.", () =>
          encerrar(),
        );
      } else {
        dizer("Tudo bem. Fico aqui com você, é só me chamar.", () =>
          encerrar(),
        );
      }
      return;
    }

    if (intencao === "ajuda") {
      pedirAjuda();
      dizer(responder("ajuda"), () => encerrar());
      return;
    }
    if (intencao === "positivo") {
      dizer(responder("positivo"), () => encerrar());
      return;
    }
    if (intencao === "negativo") {
      // Pergunta de confirmação e escuta a resposta.
      dizer(responder("negativo"), () => ouvir(true));
      return;
    }

    // Não entendeu: tenta uma vez mais, depois encerra.
    if (tentativas.current < 1) {
      tentativas.current += 1;
      dizer(responder("indefinido"), () => ouvir(false));
    } else {
      dizer("Tudo bem, podemos conversar mais tarde.", () => encerrar());
    }
  }

  function encerrar() {
    tentativas.current = 0;
    setEstado("parado");
  }

  function conversar() {
    tentativas.current = 0;
    const nome = nomeDaPessoa();
    const pergunta = frase("pergunta", [
      `${nome}, como você está se sentindo agora?`,
      `${nome}, está tudo bem com você?`,
      `Me conta, ${nome}: como você está hoje?`,
    ]);
    dizer(pergunta, () => ouvir(false));
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={conversar}
        disabled={estado !== "parado"}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-teal-700 py-4 text-lg font-bold text-white hover:bg-teal-800 disabled:opacity-70"
      >
        <span aria-hidden>💬</span>{" "}
        {estado === "parado"
          ? "Conversar com o assistente"
          : estado === "falando"
            ? "Falando…"
            : "Ouvindo você…"}
      </button>
      {legenda && (
        <p
          role="status"
          aria-live="polite"
          className="text-center text-sm text-zinc-600"
        >
          {legenda}
        </p>
      )}
    </div>
  );
}
