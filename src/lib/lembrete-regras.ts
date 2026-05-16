import type { Lembrete } from "@/lib/types";

/**
 * Regras inteligentes de lembrete (RF03), 100% no aparelho.
 * Combina o tipo do lembrete com os objetos vistos pela câmera para uma
 * mensagem mais útil (e nudges quando algo essencial não está à vista).
 */
export type TipoLembrete = "remedio" | "refeicao" | "agua" | "generico";

export function tipoLembrete(l: Lembrete): TipoLembrete {
  const t = l.titulo.toLowerCase();
  if (/rem[eé]dio|comprimido|medica/.test(t)) return "remedio";
  if (/almo|jantar|caf[eé]|comer|refei/.test(t)) return "refeicao";
  if (/[aá]gua|hidrat/.test(t)) return "agua";
  return "generico";
}

/**
 * Mensagem contextual do lembrete combinando tipo + objetos vistos pela câmera.
 * `objetosVistos` são classes COCO recentes (ex.: "bottle", "cell phone").
 */
export function mensagemLembrete(
  nome: string,
  l: Lembrete,
  objetosVistos: string[],
): string {
  const base = `Olá, ${nome}! Está na hora de ${l.titulo.toLowerCase()}.`;
  const viuGarrafa = objetosVistos.includes("bottle");
  switch (tipoLembrete(l)) {
    case "remedio":
      return viuGarrafa
        ? `${base} Seu remédio está aqui, por perto.`
        : `${base} Não vi seu remédio por perto — quer pegar ele agora?`;
    case "refeicao":
      return `${base} Lembre-se de beber água também.`;
    case "agua":
      return `${base} Hidratar-se faz bem.`;
    default:
      return base;
  }
}
