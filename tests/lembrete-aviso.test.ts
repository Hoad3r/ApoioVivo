import { describe, it, expect } from "vitest";
import { lembretesDevidos } from "@/lib/lembrete-aviso";
import { partesBrasilia } from "@/lib/hora";
import type { Lembrete } from "@/lib/types";

const lembrete = (id: string, titulo: string, hora: string): Lembrete => ({
  id,
  titulo,
  hora,
  recorrencia: "diario",
});

describe("lembretesDevidos", () => {
  const lista = [
    lembrete("1", "Tomar remédio", "08:00"),
    lembrete("2", "Almoçar", "12:00"),
    lembrete("3", "Beber água", "08:00"),
  ];

  it("retorna os lembretes do minuto atual", () => {
    const devidos = lembretesDevidos(lista, 8 * 60); // 08:00
    expect(devidos.map((l) => l.id)).toEqual(["1", "3"]);
  });

  it("não retorna nada fora do horário", () => {
    expect(lembretesDevidos(lista, 9 * 60 + 30)).toEqual([]);
  });
});

describe("partesBrasilia", () => {
  it("converte um instante UTC conhecido para o fuso de Brasília (UTC-3)", () => {
    // 2026-06-17T12:00:00Z → 09:00 em São Paulo (UTC-3, sem horário de verão).
    const d = new Date("2026-06-17T12:00:00Z");
    expect(partesBrasilia(d)).toEqual({ hora: 9, minuto: 0 });
  });
});
