/**
 * Dispara o envio de e-mail de alerta aos cuidadores (via API route).
 * Fire-and-forget: a notificação local já aconteceu; se o backend não estiver
 * configurado, a API responde sem enviar e ignoramos silenciosamente.
 */
export async function enviarAlertaEmail(
  tipo: string,
  descricao: string,
): Promise<void> {
  try {
    await fetch("/api/alertar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tipo, descricao }),
    });
  } catch {
    /* sem rede / backend: ignora (a notificação local já ocorreu) */
  }
}
