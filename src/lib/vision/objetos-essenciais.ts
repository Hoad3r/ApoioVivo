/**
 * Proxies de objetos essenciais (RF02): o modelo COCO-SSD não reconhece "chave"
 * nem "remédio" como tais, então mapeamos o que ele já vê para o significado
 * útil ao idoso. Ao reconhecer um objeto importante, o sistema fala uma
 * mensagem contextual em vez de apenas nomeá-lo. Offline, sem novo modelo.
 */
const INFO_ESSENCIAL: Record<string, string> = {
  bottle:
    "Seu remédio ou sua água costuma ficar aqui. Se for o remédio da pressão, o horário é às 8 horas.",
  cup: "Mantenha-se hidratado. Que tal beber um pouco de água agora?",
  "wine glass": "Um copo. Lembre-se de beber água com frequência.",
  "cell phone":
    "Seu celular está aqui. Para falar com a família, use o botão de Emergência.",
  handbag: "Aqui costumam ficar suas chaves e sua carteira.",
  backpack: "Aqui costumam ficar suas chaves e seus pertences.",
  remote: "O controle remoto da televisão.",
  clock: "Um relógio. Fique atento aos horários dos seus lembretes.",
  book: "Um livro. Ler é um ótimo exercício para a memória.",
};

/** Retorna a mensagem personalizada do objeto, ou null se não for essencial. */
export function infoObjetoEssencial(classe: string): string | null {
  return INFO_ESSENCIAL[classe] ?? null;
}
