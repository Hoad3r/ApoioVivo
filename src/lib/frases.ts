/**
 * Variedade de frases para o assistente não soar repetitivo.
 * O núcleo (`escolherIndice`) é puro e testável; `frase` guarda a última
 * escolha por grupo para evitar repetir a mesma frase em sequência.
 */

/** Escolhe um índice em [0, qtd), evitando repetir `anterior`. Puro. */
export function escolherIndice(
  qtd: number,
  anterior: number | undefined,
  sorteio: number,
): number {
  if (qtd <= 1) return 0;
  let i = Math.floor(sorteio * qtd);
  if (i >= qtd) i = qtd - 1;
  if (i === anterior) i = (i + 1) % qtd;
  return i;
}

const ultimaPorGrupo = new Map<string, number>();

/** Sorteia uma frase do grupo, sem repetir a última usada naquele grupo. */
export function frase(grupo: string, opcoes: string[]): string {
  if (opcoes.length === 0) return "";
  const i = escolherIndice(opcoes.length, ultimaPorGrupo.get(grupo), Math.random());
  ultimaPorGrupo.set(grupo, i);
  return opcoes[i];
}

export type Periodo = "manhã" | "tarde" | "noite";

/** Período do dia a partir da hora (0-23). Puro. */
export function periodoDoDia(hora: number): Periodo {
  if (hora < 12) return "manhã";
  if (hora < 18) return "tarde";
  return "noite";
}

/** Conjunto de saudações variadas conforme o horário. Puro. */
export function saudacoes(nome: string, hora: number): string[] {
  const p = periodoDoDia(hora);
  const ola = p === "manhã" ? "Bom dia" : p === "tarde" ? "Boa tarde" : "Boa noite";
  return [
    `${ola}, ${nome}! Que bom te ver.`,
    `${ola}, ${nome}! Como você está hoje?`,
    `Oi, ${nome}! ${ola}. Estou aqui com você.`,
    `${ola}, ${nome}! Espero que esteja tudo bem com você.`,
  ];
}
