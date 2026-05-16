/**
 * Interpreta um comando de voz para CRIAR um lembrete, ex.:
 *  - "definir um lembrete para daqui a 5 minutos"
 *  - "me lembre de tomar remédio em 10 minutos"
 *  - "criar lembrete para beber água daqui a 15 minutos"
 *  - "lembrete daqui a uma hora"
 * Lógica pura e testável.
 */

export interface ComandoLembrete {
  titulo: string;
  minutosAFrente: number;
}

const NUMEROS: Record<string, number> = {
  um: 1,
  uma: 1,
  dois: 2,
  duas: 2,
  tres: 3,
  quatro: 4,
  cinco: 5,
  seis: 6,
  sete: 7,
  oito: 8,
  nove: 9,
  dez: 10,
  onze: 11,
  doze: 12,
  quinze: 15,
  vinte: 20,
  trinta: 30,
  quarenta: 40,
  cinquenta: 50,
  sessenta: 60,
  meia: 30,
};

const PALAVRAS_NUM = Object.keys(NUMEROS).join("|");

function semAcento(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(new RegExp("[\\u0300-\\u036f]", "g"), "");
}

function capitalizar(s: string): string {
  const t = s.trim();
  return t ? t[0].toUpperCase() + t.slice(1) : t;
}

/** Extrai o título do lembrete do texto original (preserva acentos). */
function extrairTitulo(original: string): string {
  const t = original.toLowerCase();
  // "de/para/pra <titulo>" que NÃO seja "daqui", até a expressão de tempo.
  const m = t.match(
    new RegExp(
      `\\b(?:de|para|pra)\\s+(?!daqui)(.+?)\\s+(?:daqui|em|dentro|\\d|${PALAVRAS_NUM}|minuto|hora)`,
    ),
  );
  if (m && m[1] && !/^daqui/.test(m[1].trim())) {
    return capitalizar(m[1]);
  }
  return "Lembrete";
}

/** Extrai "X minutos/horas" do texto e devolve os minutos à frente, ou null. */
export function extrairMinutosAFrente(texto: string): number | null {
  const t = semAcento(texto);
  const m = t.match(
    new RegExp(`(\\d+|${PALAVRAS_NUM})\\s*(horas?|minutos?|min)\\b`),
  );
  if (!m) return null;
  const valor = /^\d+$/.test(m[1]) ? parseInt(m[1], 10) : NUMEROS[m[1]];
  if (!valor || valor <= 0) return null;
  return /^hora/.test(m[2]) ? valor * 60 : valor;
}

export function interpretarComandoLembrete(
  texto: string,
): ComandoLembrete | null {
  const t = semAcento(texto);
  if (!/\blembr/.test(t)) return null; // precisa falar "lembrete/lembrar/lembre"
  const minutosAFrente = extrairMinutosAFrente(texto);
  if (minutosAFrente == null) return null;
  return { titulo: extrairTitulo(texto), minutosAFrente };
}

/**
 * True quando a fala é uma intenção de CRIAR um lembrete (e não de abrir a tela
 * de lembretes). Ex.: "me lembre de…", "criar um lembrete…", "marcar lembrete…".
 */
export function querCriarLembrete(texto: string): boolean {
  const t = semAcento(texto);
  // "me lembre de…", "lembrar de…", "lembra…" — formas verbais.
  if (/\b(me\s+)?lembr(e|ar|a)\b/.test(t)) return true;
  // "lembrete" + um verbo de criação.
  if (
    /\blembrete/.test(t) &&
    /\b(criar|cria|crie|nov[oa]|marcar|marca|marque|agendar|agenda|adicionar|adiciona|colocar|coloca|botar|bota|definir|define)\b/.test(
      t,
    )
  ) {
    return true;
  }
  return false;
}

/** Título do lembrete a partir da fala (best-effort), ou "Lembrete". */
export function tituloLembrete(texto: string): string {
  const m = texto.match(
    new RegExp(
      "\\b(?:lembrete|lembrar|lembre|lembra)\\b\\s*(?:de|do|da|para|pra)?\\s*(.+)$",
      "i",
    ),
  );
  let alvo = (m?.[1] ?? "").trim();
  // Remove a expressão de tempo no fim ("daqui a 10 minutos", "em uma hora").
  alvo = alvo
    .replace(new RegExp("\\b(daqui|em|dentro de)\\b.*$", "i"), "")
    .replace(
      new RegExp(`\\b(\\d+|${PALAVRAS_NUM})\\s*(horas?|minutos?|min)\\b.*$`, "i"),
      "",
    )
    .trim();
  alvo = alvo.replace(/^(um|uma|o|a)\s+/i, "").trim();
  return alvo.length >= 2 ? capitalizar(alvo) : "Lembrete";
}
