/**
 * Lógica pura de avaliação de queda a partir dos keypoints de pose.
 * Sem dependências (testável em Node, sem TensorFlow).
 */
export interface Keypoint {
  name?: string;
  x: number;
  y: number;
  score?: number;
}

type Ponto = { x: number; y: number };

/** Keypoints abaixo deste score são considerados pouco confiáveis e ignorados. */
const SCORE_MIN = 0.3;

/**
 * Tolerância: a distância horizontal só precisa alcançar 80% da vertical para
 * já contar como queda. Quanto menor o fator, mais sensível (dispara mais cedo).
 */
const FATOR_TOLERANCIA = 0.8;

function meio(a: Ponto, b: Ponto): Ponto {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

/** Detalhe do raciocínio do avaliador — usado pelo modo de depuração da UI. */
export interface DiagnosticoQueda {
  caiu: boolean;
  /** Qual eixo do corpo foi usado para decidir. */
  eixo: "ombro→quadril" | "cabeça→ombros" | "sem referência";
  /** Distância horizontal entre os dois pontos do eixo. */
  dx: number;
  /** Distância vertical entre os dois pontos do eixo. */
  dy: number;
  /** Limiar: a queda dispara quando dx > limiar (= dy * tolerância). */
  limiar: number;
  /** Pontos do corpo que a IA enxergou com confiança suficiente. */
  pontosVisiveis: string[];
}

/**
 * Avalia a queda e devolve o raciocínio completo (para depuração).
 *
 * Em pé: ombros bem acima dos quadris (distância vertical grande).
 * Caído: ombros e quadris quase na mesma altura, afastados na horizontal.
 *
 * Tolerante: se os quadris não estiverem visíveis (comum em webcam de mesa, que
 * só pega o tronco), usa o eixo cabeça → ombros como referência alternativa.
 */
export function diagnosticarQueda(keypoints: Keypoint[]): DiagnosticoQueda {
  const visiveis: string[] = [];
  const get = (n: string): Ponto | undefined => {
    const k = keypoints.find((p) => p.name === n);
    if (!k) return undefined;
    if (k.score !== undefined && k.score < SCORE_MIN) return undefined;
    visiveis.push(n);
    return { x: k.x, y: k.y };
  };

  const ls = get("left_shoulder");
  const rs = get("right_shoulder");
  // Basta um ombro visível para termos uma referência do tronco superior.
  const ombro = ls && rs ? meio(ls, rs) : (ls ?? rs);

  const vazio: DiagnosticoQueda = {
    caiu: false,
    eixo: "sem referência",
    dx: 0,
    dy: 0,
    limiar: 0,
    pontosVisiveis: visiveis,
  };
  if (!ombro) return vazio;

  const lh = get("left_hip");
  const rh = get("right_hip");
  const quadril = lh && rh ? meio(lh, rh) : (lh ?? rh);

  // Caso ideal: eixo ombros → quadril.
  if (quadril) {
    const dx = Math.abs(ombro.x - quadril.x);
    const dy = Math.abs(ombro.y - quadril.y);
    const limiar = dy * FATOR_TOLERANCIA;
    return { caiu: dx > limiar, eixo: "ombro→quadril", dx, dy, limiar, pontosVisiveis: visiveis };
  }

  // Tolerância para webcam sem quadris no enquadramento: cabeça → ombros.
  const cabeca = get("nose") ?? get("left_eye") ?? get("right_eye");
  if (cabeca) {
    const dx = Math.abs(cabeca.x - ombro.x);
    const dy = Math.abs(cabeca.y - ombro.y);
    const limiar = dy * FATOR_TOLERANCIA;
    return { caiu: dx > limiar, eixo: "cabeça→ombros", dx, dy, limiar, pontosVisiveis: visiveis };
  }

  return vazio;
}

/**
 * Retorna true quando o tronco está mais horizontal que vertical — indício de
 * que a pessoa está deitada/caída. (Atalho sobre {@link diagnosticarQueda}.)
 */
export function avaliarQueda(keypoints: Keypoint[]): boolean {
  return diagnosticarQueda(keypoints).caiu;
}
