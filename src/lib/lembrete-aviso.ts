import type { Lembrete } from "@/lib/types";
import { horaParaMinutos } from "./lembrete-contexto";

/**
 * Lembretes cujo horário coincide com o minuto atual — ou seja, que devem ser
 * anunciados por voz agora (remédios, refeições, alertas marcados). Puro.
 */
export function lembretesDevidos(
  lembretes: Lembrete[],
  minutosAgora: number,
): Lembrete[] {
  return lembretes.filter((l) => horaParaMinutos(l.hora) === minutosAgora);
}
