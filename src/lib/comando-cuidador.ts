/**
 * Interpretação de voz para CADASTRAR um cuidador/contato, ex.:
 *  - "adicionar cuidador"
 *  - "cadastrar um cuidador chamado João"
 *  - "novo contato familiar"
 * e normalização de e-mail ditado ("joão arroba gmail ponto com").
 * Lógica pura e testável.
 */

function semAcento(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(new RegExp("[\\u0300-\\u036f]", "g"), "");
}

const VERBOS = "adicionar|cadastrar|registrar|criar|novo|nova";
const ALVO = "cuidador|cuidadora|contato|familiar|responsavel";

/** True quando a fala pede para cadastrar um cuidador/contato. */
export function querCadastrarCuidador(texto: string): boolean {
  const t = semAcento(texto);
  const reVerboAlvo = new RegExp(`(${VERBOS})\\b.*\\b(${ALVO})`);
  const reAlvoVerbo = new RegExp(`(${ALVO})\\b.*\\b(${VERBOS})`);
  return reVerboAlvo.test(t) || reAlvoVerbo.test(t);
}

/** Extrai um nome dito junto ao comando (ex.: "cuidador chamado João" → "João"). */
export function extrairNomeCuidador(texto: string): string | null {
  const m = texto.match(
    new RegExp(
      `(?:${ALVO})\\s+(?:chamad[oa]\\s+|de\\s+nome\\s+|que\\s+e\\s+|é\\s+)?(.+)$`,
      "i",
    ),
  );
  const nome = m?.[1]?.trim();
  if (!nome) return null;
  // Evita capturar a própria palavra-alvo ou verbos como "nome".
  const limpo = nome.replace(/\s+/g, " ").trim();
  return limpo.length >= 2 ? capitalizar(limpo) : null;
}

function capitalizar(s: string): string {
  return s
    .split(" ")
    .map((p) => (p ? p[0].toUpperCase() + p.slice(1) : p))
    .join(" ");
}

/** Normaliza um e-mail ditado por voz: "joão arroba gmail ponto com". */
export function extrairEmailFalado(texto: string): string {
  return texto
    .toLowerCase()
    .trim()
    .replace(new RegExp("\\s*arroba\\s*", "g"), "@")
    .replace(new RegExp("\\s*ponto\\s*", "g"), ".")
    .replace(new RegExp("\\s+", "g"), "");
}
