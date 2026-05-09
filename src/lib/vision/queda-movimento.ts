/**
 * Detecção de queda por MOVIMENTO (complementa a análise de pose horizontal).
 *
 * Ideia: uma queda é rápida (some em 1-2 frames) e acontece na VERTICAL —
 * a pessoa despenca / desaparece para baixo. Já sair pela LATERAL (horizontal)
 * normalmente é só a pessoa indo buscar algo ou saindo do cômodo.
 *
 * Lógica pura, sem dependências (testável em Node).
 */

/** Um quadro resumido da posição do corpo (coordenadas normalizadas 0..1). */
export interface QuadroPose {
  /** Timestamp em ms. */
  t: number;
  /** Havia pessoa detectada com confiança neste quadro. */
  presente: boolean;
  /** Centro X do corpo (0 = esquerda, 1 = direita). */
  cx: number;
  /** Centro Y do corpo (0 = topo, 1 = base). */
  cy: number;
  /** Altura da caixa do corpo relativa ao frame (0..1). */
  alturaRel: number;
}

/** Janela de tempo (ms) considerada "recente" para avaliar o movimento. */
const JANELA_MS = 1200;
/** Descida vertical mínima (fração do frame) para contar como queda. */
const DESCIDA_MIN = 0.22;
/** Movimento vertical mínimo ao sumir para considerar "sumiu para baixo". */
const SUMICO_VERTICAL_MIN = 0.08;
/** A descida precisa superar o movimento lateral por esta razão (queda é vertical). */
const RAZAO_VERTICAL = 1.5;

/**
 * Decide se o histórico recente indica uma queda.
 * `hist` em ordem cronológica (último elemento = mais recente).
 */
export function detectarQuedaMovimento(hist: QuadroPose[]): boolean {
  if (hist.length < 2) return false;
  const fim = hist[hist.length - 1];
  const janela = hist.filter((q) => fim.t - q.t <= JANELA_MS);
  const presentes = janela.filter((q) => q.presente);

  // Caso 1: pessoa ainda visível, mas desceu rápido e "achatou" (despencou).
  if (fim.presente && presentes.length >= 2) {
    const primeiro = presentes[0];
    const descida = fim.cy - primeiro.cy; // > 0 = desceu
    const horizontal = Math.abs(fim.cx - primeiro.cx);
    const achatou = fim.alturaRel < primeiro.alturaRel * 0.65;
    if (descida >= DESCIDA_MIN && descida > horizontal * RAZAO_VERTICAL && achatou) {
      return true;
    }
  }

  // Caso 2: pessoa sumiu — distinguir sumiço VERTICAL (queda) do LATERAL (saiu).
  if (!fim.presente) {
    const ultimoPresente = [...janela].reverse().find((q) => q.presente);
    if (!ultimoPresente) return false;

    const idx = janela.indexOf(ultimoPresente);
    const anterior = [...janela.slice(0, idx)]
      .reverse()
      .find((q) => q.presente);

    if (anterior) {
      const dy = ultimoPresente.cy - anterior.cy; // > 0 = movia para baixo
      const dx = Math.abs(ultimoPresente.cx - anterior.cx);
      // Só é queda se sumiu descendo de forma claramente vertical e significativa.
      return dy > dx * RAZAO_VERTICAL && dy > SUMICO_VERTICAL_MIN;
    }

    // Sem direção (só um quadro): só dispara se já estava claramente no chão.
    return ultimoPresente.cy > 0.78 && ultimoPresente.alturaRel < 0.3;
  }

  return false;
}
