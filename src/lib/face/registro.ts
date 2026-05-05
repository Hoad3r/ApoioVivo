export type PapelRosto = "idoso" | "cuidador";

export interface RostoRegistrado {
  id: string;
  nome: string;
  papel: PapelRosto;
  descritor: number[]; // 128 valores
}

const CHAVE = "apoiovivo:rostos";

/** Distância euclidiana entre dois descritores faciais (lógica pura). */
export function distanciaDescritores(
  a: ArrayLike<number>,
  b: ArrayLike<number>,
): number {
  let soma = 0;
  for (let i = 0; i < a.length; i++) {
    const d = a[i] - b[i];
    soma += d * d;
  }
  return Math.sqrt(soma);
}

/**
 * Identifica o rosto cadastrado mais próximo, se abaixo do limiar (lógica pura).
 * Quanto menor a distância, mais parecido. ~0.5 é um bom limiar para o modelo.
 */
export function identificar(
  descritor: ArrayLike<number>,
  registros: RostoRegistrado[],
  limiar = 0.55,
): RostoRegistrado | null {
  let melhor: RostoRegistrado | null = null;
  let menorDistancia = Infinity;
  for (const r of registros) {
    const d = distanciaDescritores(r.descritor, descritor);
    if (d < menorDistancia) {
      menorDistancia = d;
      melhor = r;
    }
  }
  return menorDistancia <= limiar ? melhor : null;
}

// ── Persistência local (navegador) ────────────────────────────────

export function listarRostos(): RostoRegistrado[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(CHAVE) ?? "[]") as RostoRegistrado[];
  } catch {
    return [];
  }
}

export function adicionarRosto(r: Omit<RostoRegistrado, "id">): RostoRegistrado {
  const novo: RostoRegistrado = { ...r, id: crypto.randomUUID() };
  localStorage.setItem(CHAVE, JSON.stringify([...listarRostos(), novo]));
  return novo;
}

export function removerRosto(id: string): void {
  localStorage.setItem(
    CHAVE,
    JSON.stringify(listarRostos().filter((r) => r.id !== id)),
  );
}
