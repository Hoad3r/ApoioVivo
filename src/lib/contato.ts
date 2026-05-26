/**
 * Comunicação do idoso com a família/cuidadores: monta links de ligação
 * (discador) e WhatsApp e interpreta comandos de voz ("ligar para a Ana",
 * "chamar o João no WhatsApp"). Lógica pura e testável.
 */
import type { Cuidador } from "@/lib/supabase/cuidadores";

function semAcento(s: string): string {
  return (s ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(new RegExp("[\\u0300-\\u036f]", "g"), "");
}

/** Mantém apenas dígitos do telefone. */
export function normalizarTelefone(raw: string): string {
  return (raw ?? "").replace(/\D/g, "");
}

/** Garante DDI 55 (Brasil) para uso em links internacionais. */
function e164(raw: string): string {
  const d = normalizarTelefone(raw);
  if (!d) return "";
  return d.startsWith("55") ? d : `55${d}`;
}

/** Link de ligação para o discador do aparelho. */
export function linkLigacao(raw: string): string {
  const n = e164(raw);
  return n ? `tel:+${n}` : "";
}

/** Link de conversa/chamada no WhatsApp (opcionalmente com texto). */
export function linkWhatsApp(raw: string, texto?: string): string {
  const n = e164(raw);
  if (!n) return "";
  const q = texto ? `?text=${encodeURIComponent(texto)}` : "";
  return `https://wa.me/${n}${q}`;
}

export interface ComandoContato {
  acao: "ligar" | "whatsapp";
  alvo: string;
}

/**
 * Interpreta um comando de comunicação, ou null se não for um.
 * "whatsapp/zap/mensagem" tem prioridade sobre "ligar/chamar".
 */
export function interpretarComandoContato(texto: string): ComandoContato | null {
  const t = semAcento(texto);
  const whats = /(whats|whatsapp|zap|mensagem)/.test(t);
  const liga = /(ligar|ligue|liga|telefonar|chamar)/.test(t);
  if (!whats && !liga) return null;

  const m = texto.match(
    new RegExp(
      "(?:ligar|ligue|liga|telefonar|chamar|whatsapp|whats|zap|mensagem)\\s+" +
        "(?:para|pra|pro|com|o|a|no|na|ao|à)?\\s*(.+)$",
      "i",
    ),
  );
  let alvo = (m?.[1] ?? "").trim();
  // Remove sufixos como "no whatsapp", "pelo zap".
  alvo = alvo
    .replace(/\s+(no|pelo|pela|por)\s+(whats(app)?|zap).*$/i, "")
    .trim();
  if (!alvo) return null;
  return { acao: whats ? "whatsapp" : "ligar", alvo };
}

/** Acha o contato pelo nome (primeiro nome) ou parentesco ("minha filha"). */
export function acharContato(
  alvo: string,
  cuidadores: Cuidador[],
): Cuidador | null {
  const a = semAcento(alvo);
  if (!a) return null;
  // 1) parentesco ("filha", "filho", "esposa"…).
  for (const c of cuidadores) {
    const par = semAcento(c.parentesco ?? "");
    if (par && (a.includes(par) || par.includes(a))) return c;
  }
  // 2) nome (primeiro nome contido nos dois sentidos).
  for (const c of cuidadores) {
    const nome = semAcento(c.nome);
    const primeiro = nome.split(/\s+/)[0];
    if (primeiro && (a.includes(primeiro) || nome.includes(a))) return c;
  }
  return null;
}
