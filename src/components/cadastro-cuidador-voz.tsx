"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { falar } from "@/lib/voice";
import { extrairEmailFalado } from "@/lib/comando-cuidador";
import { adicionarCuidador } from "@/lib/supabase/cuidadores";

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

function obterReconhecimento(): RecognitionCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: RecognitionCtor;
    webkitSpeechRecognition?: RecognitionCtor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

/** Pede uma frase: fala o prompt e escuta uma resposta única. */
function pedir(prompt: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const Ctor = obterReconhecimento();
    if (!Ctor) {
      reject(new Error("sem-reconhecimento"));
      return;
    }
    falar(prompt, {
      urgente: true,
      aoTerminar: () => {
        const reco = new Ctor();
        reco.lang = "pt-BR";
        reco.interimResults = false;
        reco.maxAlternatives = 1;
        reco.onresult = (e) => resolve(e.results[0][0].transcript || "");
        reco.onerror = () => reject(new Error("erro-audio"));
        reco.start();
      },
    });
  });
}

export function CadastroCuidadorVoz({
  auto = false,
  onCadastrado,
}: {
  auto?: boolean;
  onCadastrado?: () => void;
}) {
  const [ativo, setAtivo] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const jaIniciou = useRef(false);

  const iniciar = useCallback(async () => {
    if (!obterReconhecimento()) {
      setFeedback("Comando de voz não é suportado neste navegador.");
      return;
    }
    setAtivo(true);
    setFeedback("Ouvindo… diga o nome do cuidador.");
    try {
      const nomeFalado = (await pedir("Qual é o nome do cuidador?")).trim();
      if (!nomeFalado) throw new Error("vazio");
      setFeedback(`Nome: ${nomeFalado}. Agora o telefone…`);

      const telBruto = await pedir(
        `Qual é o telefone de ${nomeFalado}? Diga só os números, com o DDD.`,
      );
      const telefone = telBruto.replace(/\D/g, "");
      if (telefone.length < 10) {
        setFeedback(
          `Não entendi o telefone ("${telBruto}"). Tente de novo ou use o formulário.`,
        );
        falar("Não entendi o telefone. Tente de novo ou use o formulário.");
        return;
      }
      setFeedback(`Telefone anotado. Agora o e-mail…`);

      const emailBruto = await pedir(
        `Qual é o e-mail de ${nomeFalado}? Diga, por exemplo, nome arroba gmail ponto com.`,
      );
      const email = extrairEmailFalado(emailBruto);
      if (!email.includes("@")) {
        setFeedback(
          `Não entendi o e-mail ("${emailBruto}"). Tente de novo ou use o formulário.`,
        );
        falar("Não entendi o e-mail. Tente de novo ou use o formulário.");
        return;
      }

      await adicionarCuidador({
        nome: nomeFalado,
        email,
        parentesco: null,
        telefone,
      });
      const msg = `Cuidador ${nomeFalado} cadastrado com o e-mail ${email}.`;
      setFeedback(`✅ ${msg}`);
      falar(msg, { urgente: true });
      onCadastrado?.();
    } catch {
      setFeedback("Não consegui concluir pela voz. Use o formulário abaixo.");
    } finally {
      setAtivo(false);
    }
  }, [onCadastrado]);

  // Início automático quando aberto via comando de voz (?voz=1).
  useEffect(() => {
    if (auto && !jaIniciou.current) {
      jaIniciou.current = true;
      iniciar();
    }
  }, [auto, iniciar]);

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={iniciar}
        disabled={ativo}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-700 py-4 text-lg font-bold text-white hover:bg-blue-800 disabled:opacity-60"
      >
        <span aria-hidden>🎤</span>{" "}
        {ativo ? "Ouvindo…" : "Cadastrar cuidador por voz"}
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
