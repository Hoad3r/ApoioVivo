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

function meio(a: Keypoint, b: Keypoint): { x: number; y: number } {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

/**
 * Retorna true quando o tronco está mais horizontal que vertical — indício de
 * que a pessoa está deitada/caída.
 *
 * Em pé: ombros bem acima dos quadris (distância vertical grande).
 * Caído: ombros e quadris quase na mesma altura, afastados na horizontal.
 */
export function avaliarQueda(keypoints: Keypoint[]): boolean {
  const get = (n: string) => keypoints.find((k) => k.name === n);
  const ls = get("left_shoulder");
  const rs = get("right_shoulder");
  const lh = get("left_hip");
  const rh = get("right_hip");
  if (!ls || !rs || !lh || !rh) return false;

  const ombro = meio(ls, rs);
  const quadril = meio(lh, rh);
  const dx = Math.abs(quadril.x - ombro.x);
  const dy = Math.abs(quadril.y - ombro.y);
  return dx > dy;
}
