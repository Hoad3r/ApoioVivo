/** Tradução das classes do COCO-SSD (inglês) para português, para a saída em voz/texto. */
export const TRADUCAO_OBJETOS: Record<string, string> = {
  person: "pessoa",
  cup: "copo",
  bottle: "garrafa",
  "wine glass": "taça",
  bowl: "tigela",
  spoon: "colher",
  fork: "garfo",
  knife: "faca",
  "cell phone": "celular",
  remote: "controle remoto",
  clock: "relógio",
  book: "livro",
  laptop: "notebook",
  keyboard: "teclado",
  mouse: "mouse",
  tv: "televisão",
  chair: "cadeira",
  couch: "sofá",
  bed: "cama",
  "dining table": "mesa",
  "potted plant": "planta",
  "teddy bear": "urso de pelúcia",
  toothbrush: "escova de dentes",
  handbag: "bolsa",
  backpack: "mochila",
  umbrella: "guarda-chuva",
  banana: "banana",
  apple: "maçã",
  orange: "laranja",
  scissors: "tesoura",
  vase: "vaso",
};

export function traduzir(classe: string): string {
  return TRADUCAO_OBJETOS[classe] ?? classe;
}
