/**
 * Notificação discreta ao cuidador via Web Notifications API (RF04).
 * Aparece fora do app (mesmo com a aba em segundo plano). Degrada em silêncio
 * quando a API não está disponível ou a permissão não foi concedida.
 */
export async function pedirPermissaoNotificacao(): Promise<boolean> {
  if (typeof window === "undefined" || !("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const resposta = await Notification.requestPermission();
  return resposta === "granted";
}

export function notificarCuidador(titulo: string, corpo: string): void {
  if (typeof window === "undefined" || !("Notification" in window)) return;
  if (Notification.permission !== "granted") return;
  try {
    new Notification(titulo, { body: corpo, icon: "/icon.svg" });
  } catch {
    /* alguns navegadores exigem service worker; ignora silenciosamente */
  }
}
