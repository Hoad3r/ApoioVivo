/**
 * Memória leve do último local onde objetos essenciais foram vistos pela câmera.
 * Permite que o assistente mãos livres responda "cadê meu celular?" com o
 * ambiente e há quanto tempo. Puro na consulta; o registro é em memória.
 */
export interface VistoEm {
  classe: string; // classe COCO (ex.: "cell phone", "bottle")
  ambiente: string | null;
  quando: string; // ISO 8601
}

function semAcento(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(new RegExp("[\\u0300-\\u036f]", "g"), "");
}

// Termo falado pelo idoso -> classe COCO correspondente (proxy) + nome falado.
const ALVO_PARA_CLASSE: { termos: RegExp; classe: string; nome: string }[] = [
  { termos: /celular|telefone/, classe: "cell phone", nome: "celular" },
  { termos: /rem[eé]dio|garrafa|[aá]gua/, classe: "bottle", nome: "remédio" },
  {
    termos: /chave|carteira|bolsa/,
    classe: "handbag",
    nome: "bolsa com as chaves",
  },
  { termos: /controle/, classe: "remote", nome: "controle remoto" },
  { termos: /[oó]culos|livro/, classe: "book", nome: "livro" },
];

function haQuanto(quando: string, agora: Date): string {
  const min = Math.max(
    0,
    Math.round((agora.getTime() - new Date(quando).getTime()) / 60000),
  );
  if (min < 1) return "agora há pouco";
  if (min === 1) return "há 1 minuto";
  if (min < 60) return `há ${min} minutos`;
  return "há mais de uma hora";
}

/** Responde "cadê meu X?" a partir da memória, ou null se não for essa consulta. */
export function responderOndeEsta(
  consulta: string,
  memoria: VistoEm[],
  agora: Date = new Date(),
): string | null {
  const t = semAcento(consulta);
  if (!/(cade|onde|achar|encontr)/.test(t)) return null;
  const alvo = ALVO_PARA_CLASSE.find((a) => a.termos.test(t));
  if (!alvo) return null;
  const visto = [...memoria].reverse().find((m) => m.classe === alvo.classe);
  if (!visto) return `Não vi o seu ${alvo.nome} por aqui ainda.`;
  const local = visto.ambiente ? `na ${visto.ambiente}` : "por perto";
  return `Vi o seu ${alvo.nome} ${haQuanto(visto.quando, agora)}, ${local}.`;
}

// --- Registro em memória (preenchido pelo loop da câmera) ---
const MEMORIA: VistoEm[] = [];

export function registrarVisto(classe: string, ambiente: string | null): void {
  MEMORIA.push({ classe, ambiente, quando: new Date().toISOString() });
  if (MEMORIA.length > 30) MEMORIA.shift();
}

export function lerMemoria(): VistoEm[] {
  return [...MEMORIA];
}
