import { describe, it, expect } from "vitest";
import {
  detectarAnomalia,
  detectarAnomaliaAprendida,
  horasAtivas,
  perfilAtividadePorHora,
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

describe("rotina aprendida", () => {
  it("aprende o perfil de atividade por hora", () => {
    const perfil = perfilAtividadePorHora([
      ev("atividade", "2026-06-17T08:00:00"),
      ev("atividade", "2026-06-17T08:30:00"),
    ]);
    expect(perfil[8]).toBe(2);
    expect(perfil[3]).toBe(0);
  });

  it("identifica as horas em que costuma estar ativa", () => {
    const eventos = [
      ev("atividade", "2026-06-17T08:00:00"),
      ev("atividade", "2026-06-17T09:00:00"),
    ];
    expect(horasAtivas(eventos).has(8)).toBe(true);
    expect(horasAtivas(eventos).has(3)).toBe(false);
  });

  it("acusa anomalia em hora ativa sem atividade recente", () => {
    const eventos = [
      ev("atividade", "2026-06-15T08:00:00"),
      ev("atividade", "2026-06-16T08:00:00"),
    ];
    const agora = new Date("2026-06-17T08:00:00");
    expect(detectarAnomaliaAprendida(eventos, agora).anomalia).toBe(true);
  });

  it("sem anomalia quando houve atividade recente na hora ativa", () => {
    const agora = new Date("2026-06-17T08:00:00");
    const eventos = [
      ev("atividade", "2026-06-15T08:00:00"),
      ev("atividade", new Date(agora.getTime() - 10 * 60000).toISOString()),
    ];
    expect(detectarAnomaliaAprendida(eventos, agora).anomalia).toBe(false);
  });
});
