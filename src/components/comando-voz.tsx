"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { falar } from "@/lib/voice";
import { interpretarComandoLembrete } from "@/lib/comando-lembrete";
import { querCadastrarCuidador } from "@/lib/comando-cuidador";
import { minutosBrasilia, minutosParaHHMM } from "@/lib/hora";
import { getDataStore } from "@/lib/data";

const COMANDOS: { palavras: string[]; rota: string; nome: string }[] = [
  { palavras: ["lembrete", "lembretes"], rota: "/lembretes", nome: "Lembretes" },
  {
    palavras: ["emergência", "emergencia", "ajuda", "socorro"],
    rota: "/emergencia",
    nome: "Emergência",
  },
  {
    palavras: ["monitor", "câmera", "camera", "monitoramento"],
    rota: "/monitoramento",
    nome: "Monitoramento",
  },
  { palavras: ["histórico", "historico"], rota: "/historico", nome: "Histórico" },
  { palavras: ["início", "inicio", "casa"], rota: "/", nome: "Início" },
];

// Tipagem mínima da Web Speech API (não incluída na lib DOM padrão).
interface SpeechResultEvent {
  results: ArrayLike<ArrayLike<{ transcript: string }>>;
}
interface SpeechRecognitionLike {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((e: SpeechResultEvent) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start(): void;
}
type RecognitionCtor = new () => SpeechRecognitionLike;

export function ComandoVoz() {
  const router = useRouter();
  const [ouvindo, setOuvindo] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  function ouvir() {
    const w = window as unknown as {
      SpeechRecognition?: RecognitionCtor;
      webkitSpeechRecognition?: RecognitionCtor;
    };
    const Reconhecimento = w.SpeechRecognition ?? w.webkitSpeechRecognition;
    if (!Reconhecimento) {
      setFeedback("Comando de voz não é suportado neste navegador.");
      return;
    }

    const reco = new Reconhecimento();
    reco.lang = "pt-BR";
    reco.interimResults = false;
    reco.maxAlternatives = 1;
    setOuvindo(true);
    setFeedback(
      'Ouvindo… diga "lembrete para daqui a 5 minutos", ou: lembretes, câmera, emergência…',
    );

    reco.onresult = (e) => {
      const original = e.results[0][0].transcript || "";
      const texto = original.toLowerCase();

      // 1) Criar lembrete por voz ("lembrete para daqui a 5 minutos").
      const lembrete = interpretarComandoLembrete(original);
      if (lembrete) {
        const hora = minutosParaHHMM(minutosBrasilia() + lembrete.minutosAFrente);
        getDataStore().addLembrete({
          titulo: lembrete.titulo,
          hora,
          recorrencia: "unico",
        });
        const msg = `Combinado! Vou te lembrar de ${lembrete.titulo.toLowerCase()} às ${hora}.`;
        setFeedback(`✅ ${msg}`);
        falar(msg);
        return;
      }

      // 2) Cadastrar um cuidador por voz.
      if (querCadastrarCuidador(original)) {
        setFeedback("Vamos cadastrar um cuidador…");
        falar("Vamos cadastrar um cuidador");
        router.push("/cuidadores?voz=1");
        return;
      }

      // 3) Navegação por voz.
      const cmd = COMANDOS.find((c) => c.palavras.some((p) => texto.includes(p)));
      if (cmd) {
        setFeedback(`Abrindo: ${cmd.nome}`);
        falar(`Abrindo ${cmd.nome}`);
        router.push(cmd.rota);
      } else {
        setFeedback(`Não entendi: "${texto}". Tente novamente.`);
      }
    };
    reco.onerror = () => {
      setFeedback("Não consegui ouvir. Tente novamente.");
      setOuvindo(false);
    };
    reco.onend = () => setOuvindo(false);
    reco.start();
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={ouvir}
        disabled={ouvindo}
        className="flex w-full items-center justify-center gap-2 rounded-2xl border border-teal-200 bg-white py-4 text-lg font-bold text-teal-700 hover:bg-teal-50 disabled:opacity-60"
      >
        <span aria-hidden>🎤</span> {ouvindo ? "Ouvindo…" : "Comando de voz"}
      </button>
      {feedback && (
        <p
          role="status"
          aria-live="polite"
          className="text-center text-sm text-zinc-600"
        >
          {feedback}
        </p>
      )}
    </div>
  );
}
