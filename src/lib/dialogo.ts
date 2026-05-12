/**
 * Lógica de conversa do assistente: interpreta o que o idoso respondeu e
 * decide a réplica. A interpretação é pura e testável (sem voz/DOM).
 */
import { frase } from "./frases";

export type Intencao = "positivo" | "negativo" | "ajuda" | "indefinido";

/** Remove acentos para a comparação não depender de diacríticos. */
function semAcento(texto: string): string {
  return texto
    .toLowerCase()
    .normalize("NFD")
    .replace(new RegExp("[\\u0300-\\u036f]", "g"), "");
}

/** Classifica a fala do idoso em uma intenção. Puro. */
export function interpretar(texto: string): Intencao {
  const t = semAcento(texto);

  // 1) Pedido claro de ajuda / mal-estar tem prioridade.
  if (/\b(socorro|me ajuda|passando mal|estou mal|com dor|tont|cai)\b/.test(t)) {
    return "ajuda";
  }

  // 2) Negação de bem-estar ("não estou bem", "nada bem") vem ANTES do positivo,
  // senão a palavra "bem" classificaria errado.
  const temNegacao = /\b(nao|nada)\b/.test(t);
  if (temNegacao && /\b(bem|bom|boa|legal|tranquil)/.test(t)) {
    return "negativo";
  }
  if (/\b(mal|ruim|triste|cansad|sozinh|pessim)/.test(t)) {
    return "negativo";
  }

  // 3) Confirmações e bem-estar.
  if (/\b(sim|claro|pode|por favor|isso)\b/.test(t)) return "positivo";
  if (/\b(bem|otim|bom|boa|tranquil|tudo certo|joia|maravilha|feliz)/.test(t)) {
    return "positivo";
  }

  return "indefinido";
}

/** Réplica falada para cada intenção (varia para não repetir). */
export function responder(intencao: Intencao): string {
  switch (intencao) {
    case "positivo":
      return frase("resp-positivo", [
        "Que bom ouvir isso! Fico feliz por você.",
        "Maravilha! Estou aqui sempre que precisar.",
        "Fico contente que você esteja bem.",
      ]);
    case "negativo":
      return frase("resp-negativo", [
        "Sinto muito que não esteja bem. Quer que eu avise um cuidador?",
        "Que pena. Posso chamar alguém para ficar com você?",
      ]);
    case "ajuda":
      return "Entendi. Vou avisar um cuidador agora mesmo para te ajudar.";
    default:
      return frase("resp-indefinido", [
        "Desculpe, não entendi bem. Pode repetir, por favor?",
        "Não consegui entender. Pode me dizer de novo?",
      ]);
  }
}
