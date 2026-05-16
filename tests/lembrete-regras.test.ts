import { describe, it, expect } from "vitest";
import { mensagemLembrete, tipoLembrete } from "@/lib/lembrete-regras";
import type { Lembrete } from "@/lib/types";

const rem: Lembrete = {
  id: "1",
  titulo: "Tomar remédio",
  hora: "08:00",
  recorrencia: "diario",
};
const almoco: Lembrete = {
  id: "2",
  titulo: "Almoçar",
  hora: "12:00",
  recorrencia: "diario",
};

describe("tipoLembrete", () => {
  it("classifica remédio", () => expect(tipoLembrete(rem)).toBe("remedio"));
  it("classifica refeição", () => expect(tipoLembrete(almoco)).toBe("refeicao"));
});

describe("mensagemLembrete", () => {
  it("reforça hidratação na refeição", () => {
    expect(mensagemLembrete("Maria", almoco, [])).toMatch(/água/i);
  });
  it("quando vê a garrafa, diz que o remédio está por perto", () => {
    expect(mensagemLembrete("Maria", rem, ["bottle"])).toMatch(/aqui|por perto/i);
  });
  it("quando NÃO vê garrafa, faz nudge para pegar o remédio", () => {
    expect(mensagemLembrete("Maria", rem, ["cell phone"])).toMatch(
      /não vi|pegar/i,
    );
  });
});
