import type { Evento } from "@/lib/types";

/**
 * Lógica pura de rotina e anomalias para o Painel do Cuidador.
 * Sem dependências externas — testável em Node.
 */

const DIAS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const ORDEM_SEMANA = [1, 2, 3, 4, 5, 6, 0]; // Seg .. Dom

const HORA_DORMIR_INICIO = 22;
const HORA_DORMIR_FIM = 6;
const INATIVIDADE_LIMITE_MS = 3 * 60 * 60 * 1000;

export interface DiaAtividade {
  dia: string;
  percentual: number;
}

export interface ResultadoAnomalia {
  anomalia: boolean;
  motivo: string | null;
}

/** Resumo de atividade dos últimos 7 dias, por dia da semana (Seg→Dom). */
export function resumoAtividadeSemanal(
  eventos: Evento[],
  agora: Date = new Date(),
): DiaAtividade[] {
  const contagem = new Array(7).fill(0);
  const limite = agora.getTime() - 7 * 86400000;
  for (const e of eventos) {
    if (e.tipo !== "atividade") continue;
    const t = new Date(e.criadoEm).getTime();
    if (t < limite || t > agora.getTime()) continue;
    contagem[new Date(e.criadoEm).getDay()] += 1;
  }
  return ORDEM_SEMANA.map((d) => ({
    dia: DIAS[d],
    percentual: Math.min(100, contagem[d] * 20),
  }));
}

export function mediaAtividade(dados: DiaAtividade[]): number {
  if (dados.length === 0) return 0;
  return Math.round(
    dados.reduce((soma, d) => soma + d.percentual, 0) / dados.length,
  );
}

/**
 * Detecta anomalia: lembrete importante ignorado, ou inatividade prolongada
 * fora do horário de descanso.
 */
export function detectarAnomalia(
  eventos: Evento[],
  agora: Date = new Date(),
): ResultadoAnomalia {
  const ignorado = eventos.find(
    (e) => e.tipo === "lembrete-ignorado" && e.urgente,
  );
  if (ignorado) {
    return {
      anomalia: true,
      motivo: ignorado.descricao || "Lembrete importante ignorado",
    };
  }

  const hora = agora.getHours();
  const dormindo = hora >= HORA_DORMIR_INICIO || hora < HORA_DORMIR_FIM;
  if (!dormindo) {
    const ultima = eventos
      .filter((e) => e.tipo === "atividade")
      .map((e) => new Date(e.criadoEm).getTime())
      .sort((a, b) => b - a)[0];
    if (ultima === undefined || agora.getTime() - ultima > INATIVIDADE_LIMITE_MS) {
      return {
        anomalia: true,
        motivo: "Inatividade prolongada fora do horário de descanso",
      };
    }
  }

  return { anomalia: false, motivo: null };
}

/** Aprende o perfil de atividade por hora (0–23) a partir do histórico. */
export function perfilAtividadePorHora(eventos: Evento[]): number[] {
  const horas = new Array<number>(24).fill(0);
  for (const e of eventos) {
    if (e.tipo !== "atividade") continue;
    horas[new Date(e.criadoEm).getHours()] += 1;
  }
  return horas;
}

/** Conjunto de horas em que a pessoa costuma estar ativa (rotina aprendida). */
export function horasAtivas(eventos: Evento[]): Set<number> {
  const perfil = perfilAtividadePorHora(eventos);
  const naoNulas = perfil.filter((c) => c > 0);
  const media = naoNulas.length
    ? naoNulas.reduce((a, b) => a + b, 0) / naoNulas.length
    : 0;
  const limite = Math.max(1, media * 0.5);
  const ativas = new Set<number>();
  perfil.forEach((c, h) => {
    if (c >= limite) ativas.add(h);
  });
  return ativas;
}

/**
 * Anomalia baseada na rotina APRENDIDA: se o horário atual costuma ser ativo,
 * mas não há atividade recente, sinaliza. Também sinaliza lembrete ignorado.
 */
export function detectarAnomaliaAprendida(
  eventos: Evento[],
  agora: Date = new Date(),
): ResultadoAnomalia {
  const ignorado = eventos.find(
    (e) => e.tipo === "lembrete-ignorado" && e.urgente,
  );
  if (ignorado) {
    return {
      anomalia: true,
      motivo: ignorado.descricao || "Lembrete importante ignorado",
    };
  }

  const ativas = horasAtivas(eventos);
  const hora = agora.getHours();
  if (ativas.has(hora)) {
    const ultima = eventos
      .filter((e) => e.tipo === "atividade")
      .map((e) => new Date(e.criadoEm).getTime())
      .sort((a, b) => b - a)[0];
    if (ultima === undefined || agora.getTime() - ultima > INATIVIDADE_LIMITE_MS) {
      return {
        anomalia: true,
        motivo: "Sem atividade em um horário em que a rotina costuma ser ativa",
      };
    }
  }

  return { anomalia: false, motivo: null };
}
