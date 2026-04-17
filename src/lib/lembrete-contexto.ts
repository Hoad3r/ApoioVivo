import type { Lembrete } from "@/lib/types";

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

/** Mensagem contextual falada para um lembrete (RF03: lembretes contextuais). */
export function mensagemContextual(nome: string, lembrete: Lembrete): string {
  const base = `Olá, ${nome}! Está na hora de ${lembrete.titulo.toLowerCase()}.`;
  if (/almo|jantar|comer/i.test(lembrete.titulo)) {
    return `${base} Lembre-se de beber água também.`;
  }
  if (/rem[eé]dio/i.test(lembrete.titulo)) {
    return `${base} É importante para a sua saúde.`;
  }
  if (/[aá]gua/i.test(lembrete.titulo)) {
    return `${base} Hidratar-se faz bem.`;
  }
  return base;
}
