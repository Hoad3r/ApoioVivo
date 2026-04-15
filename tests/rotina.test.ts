import { describe, it, expect } from "vitest";
import {
  detectarAnomalia,
  resumoAtividadeSemanal,
  mediaAtividade,
} from "@/lib/rotina";
import type { Evento, TipoEvento } from "@/lib/types";

const DIAS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function ev(tipo: TipoEvento, criadoEm: string, urgente = false): Evento {
  return { id: Math.random().toString(), tipo, descricao: "x", criadoEm, urgente };
}

const TARDE = new Date("2026-06-17T15:00:00");

describe("detectarAnomalia", () => {
  it("acusa anomalia com lembrete ignorado urgente", () => {
    const r = detectarAnomalia(
      [ev("lembrete-ignorado", TARDE.toISOString(), true)],
      TARDE,
    );
    expect(r.anomalia).toBe(true);
  });

  it("sem anomalia com atividade recente durante o dia", () => {
    const recente = new Date(TARDE.getTime() - 30 * 60 * 1000).toISOString();
    expect(detectarAnomalia([ev("atividade", recente)], TARDE).anomalia).toBe(
      false,
    );
  });

  it("acusa inatividade prolongada durante o dia", () => {
    const antiga = new Date(TARDE.getTime() - 5 * 3600 * 1000).toISOString();
    expect(detectarAnomalia([ev("atividade", antiga)], TARDE).anomalia).toBe(
      true,
    );
  });

  it("não acusa durante o horário de descanso", () => {
    const madrugada = new Date("2026-06-17T03:00:00");
    expect(detectarAnomalia([], madrugada).anomalia).toBe(false);
  });
});

describe("resumoAtividadeSemanal", () => {
  it("retorna 7 dias, de Seg a Dom", () => {
    const r = resumoAtividadeSemanal([], TARDE);
    expect(r).toHaveLength(7);
    expect(r[0].dia).toBe("Seg");
    expect(r[6].dia).toBe("Dom");
  });

  it("conta a atividade do dia e calcula o percentual", () => {
    const eventos = [
      ev("atividade", TARDE.toISOString()),
      ev("atividade", TARDE.toISOString()),
    ];
    const r = resumoAtividadeSemanal(eventos, TARDE);
    const nomeHoje = DIAS[TARDE.getDay()];
    expect(r.find((d) => d.dia === nomeHoje)?.percentual).toBe(40);
  });
});

describe("mediaAtividade", () => {
  it("calcula a média dos percentuais", () => {
    expect(
      mediaAtividade([
        { dia: "Seg", percentual: 50 },
        { dia: "Ter", percentual: 100 },
      ]),
    ).toBe(75);
  });
});
