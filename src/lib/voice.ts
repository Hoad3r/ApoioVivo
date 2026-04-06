/**
 * Saída de voz via Web Speech API (RF05: mensagens em áudio).
 * No-op silencioso quando a API não está disponível.
 */
export function falar(texto: string): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  const fala = new SpeechSynthesisUtterance(texto);
  fala.lang = "pt-BR";
  fala.rate = 0.95;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(fala);
}
