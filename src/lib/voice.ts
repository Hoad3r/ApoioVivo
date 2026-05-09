/**
 * Saída de voz via Web Speech API (RF05: mensagens em áudio).
 * No-op silencioso quando a API não está disponível.
 *
 * Por padrão a fala NÃO interrompe outra em andamento — assim o idoso ouve
 * cada frase inteira, sem cortes. Mensagens urgentes (ex.: queda) usam
 * `{ urgente: true }` para interromper e serem ouvidas na hora.
 */
export function falar(
  texto: string,
  opcoes?: { urgente?: boolean; aoTerminar?: () => void },
): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    opcoes?.aoTerminar?.();
    return;
  }
  const synth = window.speechSynthesis;

  if (opcoes?.urgente) {
    synth.cancel(); // urgência interrompe o que estiver falando
  } else if (synth.speaking || synth.pending) {
    return; // já há fala em andamento: não atropela, ignora esta
  }

  const fala = new SpeechSynthesisUtterance(texto);
  fala.lang = "pt-BR";
  fala.rate = 0.9; // um pouco mais devagar: mais claro para o idoso
  if (opcoes?.aoTerminar) {
    fala.onend = () => opcoes.aoTerminar?.();
    fala.onerror = () => opcoes.aoTerminar?.();
  }
  synth.speak(fala);
}
