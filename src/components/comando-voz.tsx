"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { falar } from "@/lib/voice";

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
  {
    palavras: ["cuidador", "alertas", "painel"],
    rota: "/painel",
    nome: "Painel do Cuidador",
  },
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
    setFeedback("Ouvindo… diga: lembretes, emergência, câmera, cuidador…");

    reco.onresult = (e) => {
      const texto = (e.results[0][0].transcript || "").toLowerCase();
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
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-700 py-4 text-lg font-bold text-white hover:bg-blue-800 disabled:opacity-60"
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
