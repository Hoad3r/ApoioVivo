/**
 * Acesso mínimo à Web Speech API de reconhecimento (não tipada na lib DOM).
 */
interface SpeechResultEvent {
  results: ArrayLike<ArrayLike<{ transcript: string }>>;
}

export interface ReconhecimentoVoz {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  onresult: ((e: SpeechResultEvent) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
}

type Ctor = new () => ReconhecimentoVoz;

/** Cria um reconhecedor pt-BR pronto para uso, ou null se não suportado. */
export function criarReconhecimento(): ReconhecimentoVoz | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: Ctor;
    webkitSpeechRecognition?: Ctor;
  };
  const R = w.SpeechRecognition ?? w.webkitSpeechRecognition;
  if (!R) return null;
  const reco = new R();
  reco.lang = "pt-BR";
  reco.interimResults = false;
  reco.maxAlternatives = 1;
  return reco;
}

/** Extrai a transcrição (minúscula) do evento de resultado. */
export function transcricao(e: SpeechResultEvent): string {
  return (e.results[0]?.[0]?.transcript ?? "").toLowerCase();
}
