/**
 * Inferência de ambiente a partir dos objetos reconhecidos pela câmera.
 * Habilita lembretes contextuais por local (ex.: "está na cozinha") — RF03.
 */
const AMBIENTES: { nome: string; objetos: string[] }[] = [
  {
    nome: "cozinha",
    objetos: ["refrigerator", "oven", "microwave", "sink", "dining table", "bowl"],
  },
  { nome: "sala", objetos: ["couch", "tv", "remote"] },
  { nome: "quarto", objetos: ["bed"] },
];

/** Retorna o ambiente inferido a partir das classes de objetos, ou null. */
export function detectarAmbiente(classes: string[]): string | null {
  for (const ambiente of AMBIENTES) {
    if (ambiente.objetos.some((o) => classes.includes(o))) {
      return ambiente.nome;
    }
  }
  return null;
}
