import type { Lembrete } from "@/lib/types";
import { horaParaMinutos } from "./lembrete-contexto";

/**
 * Lembretes cujo horário já PASSOU hoje e que ainda não foram avisados — para
 * relembrar quando o idoso abre o app depois da hora. Puro e testável.
 */
export function lembretesAtrasados(
  lembretes: Lembrete[],
  minutosAgora: number,
  jaAvisados: Set<string>,
): Lembrete[] {
  return lembretes
    .filter(
      (l) => !jaAvisados.has(l.id) && horaParaMinutos(l.hora) < minutosAgora,
    )
    .sort((a, b) => horaParaMinutos(a.hora) - horaParaMinutos(b.hora));
}

/** Mensagem falada de relembrança dos lembretes que passaram. */
export function mensagemAtraso(nome: string, lembretes: Lembrete[]): string {
  const saud = nome ? `${nome}, ` : "";
  if (lembretes.length === 1) {
    const l = lembretes[0];
    return `${saud}você tinha um lembrete: ${l.titulo.toLowerCase()} às ${l.hora}.`;
  }
  const lista = lembretes
    .map((l) => `${l.titulo.toLowerCase()} às ${l.hora}`)
    .join("; ");
  return `${saud}você teve lembretes que passaram: ${lista}.`;
}
