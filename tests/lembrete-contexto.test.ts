import { describe, it, expect } from "vitest";
import {
  horaParaMinutos,
  proximoLembrete,
  mensagemContextual,
} from "@/lib/lembrete-contexto";
import type { Lembrete } from "@/lib/types";

const L = (id: string, titulo: string, hora: string): Lembrete => ({
  id,
  titulo,
  hora,
  recorrencia: "diario",
});

const lembretes = [
  L("1", "Remédio", "08:00"),
  L("2", "Almoço", "12:00"),
  L("3", "Jantar", "19:00"),
];

describe("lembrete-contexto", () => {
  it("converte hora em minutos", () => {
    expect(horaParaMinutos("08:30")).toBe(510);
  });

  it("escolhe o próximo lembrete à frente do horário atual", () => {
    const r = proximoLembrete(lembretes, new Date("2026-06-17T09:00:00"));
    expect(r?.titulo).toBe("Almoço");
  });

  it("volta ao primeiro lembrete quando todos já passaram", () => {
    const r = proximoLembrete(lembretes, new Date("2026-06-17T20:00:00"));
    expect(r?.titulo).toBe("Remédio");
  });

  it("mensagem contextual do almoço lembra de beber água", () => {
    expect(mensagemContextual("Maria", L("2", "Almoço", "12:00"))).toMatch(
      /água/i,
    );
  });
});
