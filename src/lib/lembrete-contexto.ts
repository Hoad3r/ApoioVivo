import type { Lembrete } from "@/lib/types";
import { mensagemLembrete } from "./lembrete-regras";

/** Converte "HH:MM" em minutos desde a meia-noite. */
export function horaParaMinutos(hora: string): number {
  const [h, m] = hora.split(":").map(Number);
  return h * 60 + m;
}

/**
 * Próximo lembrete a partir do horário atual (o mais próximo à frente).
 * Se todos já passaram hoje, retorna o primeiro do dia seguinte.
 */
export function proximoLembrete(
  lembretes: Lembrete[],
  agora: Date = new Date(),
): Lembrete | null {
  if (lembretes.length === 0) return null;
  const minAgora = agora.getHours() * 60 + agora.getMinutes();
  const ordenados = [...lembretes].sort(
    (a, b) => horaParaMinutos(a.hora) - horaParaMinutos(b.hora),
  );
  return ordenados.find((l) => horaParaMinutos(l.hora) >= minAgora) ?? ordenados[0];
}

/** Mensagem contextual falada para um lembrete (RF03). Delegada às regras. */
export function mensagemContextual(nome: string, lembrete: Lembrete): string {
  return mensagemLembrete(nome, lembrete, []);
}
