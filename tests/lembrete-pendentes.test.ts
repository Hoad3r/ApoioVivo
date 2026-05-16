import { describe, it, expect } from "vitest";
import {
  lembretesAtrasados,
  mensagemAtraso,
} from "@/lib/lembrete-pendentes";
import type { Lembrete } from "@/lib/types";

const lembretes: Lembrete[] = [
  { id: "1", titulo: "Tomar remédio", hora: "08:00", recorrencia: "diario" },
  { id: "2", titulo: "Almoçar", hora: "12:00", recorrencia: "diario" },
  { id: "3", titulo: "Caminhar", hora: "18:00", recorrencia: "diario" },
];

describe("lembretesAtrasados", () => {
  it("retorna os que já passaram hoje (agora 13:00)", () => {
    const r = lembretesAtrasados(lembretes, 13 * 60, new Set());
    expect(r.map((l) => l.id)).toEqual(["1", "2"]);
  });
  it("ignora os já avisados", () => {
    const r = lembretesAtrasados(lembretes, 13 * 60, new Set(["1"]));
    expect(r.map((l) => l.id)).toEqual(["2"]);
  });
  it("não inclui o horário exato (esse é tratado ao vivo)", () => {
    const r = lembretesAtrasados(lembretes, 12 * 60, new Set());
    expect(r.map((l) => l.id)).toEqual(["1"]);
  });
});

describe("mensagemAtraso", () => {
  it("um lembrete", () => {
    expect(mensagemAtraso("Maria", [lembretes[0]])).toMatch(
      /tinha um lembrete.*08:00/i,
    );
  });
  it("vários lembretes", () => {
    const m = mensagemAtraso("Maria", [lembretes[0], lembretes[1]]);
    expect(m).toMatch(/passaram/i);
    expect(m).toMatch(/08:00/);
    expect(m).toMatch(/12:00/);
  });
});
