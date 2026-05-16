import { describe, it, expect } from "vitest";
import {
  interpretarComandoLembrete,
  extrairMinutosAFrente,
  querCriarLembrete,
  tituloLembrete,
} from "@/lib/comando-lembrete";
import { minutosParaHHMM } from "@/lib/hora";

describe("interpretarComandoLembrete", () => {
  it("entende 'para daqui a 5 minutos' (sem título → padrão)", () => {
    const c = interpretarComandoLembrete(
      "definir um lembrete para daqui a 5 minutos",
    );
    expect(c).toEqual({ titulo: "Lembrete", minutosAFrente: 5 });
  });

  it("extrai o título de 'me lembre de tomar remédio em 10 minutos'", () => {
    const c = interpretarComandoLembrete(
      "me lembre de tomar remédio em 10 minutos",
    );
    expect(c?.minutosAFrente).toBe(10);
    expect(c?.titulo).toBe("Tomar remédio");
  });

  it("entende horas por extenso ('uma hora')", () => {
    const c = interpretarComandoLembrete("criar lembrete daqui a uma hora");
    expect(c?.minutosAFrente).toBe(60);
  });

  it("extrai título com 'para' antes do tempo", () => {
    const c = interpretarComandoLembrete(
      "lembrete para beber água daqui a 15 minutos",
    );
    expect(c?.minutosAFrente).toBe(15);
    expect(c?.titulo).toBe("Beber água");
  });

  it("ignora frases que não são comando de lembrete", () => {
    expect(interpretarComandoLembrete("abrir a câmera")).toBeNull();
    expect(interpretarComandoLembrete("lembrete")).toBeNull(); // sem tempo
  });
});

describe("extrairMinutosAFrente", () => {
  it("entende minutos e horas", () => {
    expect(extrairMinutosAFrente("daqui a 10 minutos")).toBe(10);
    expect(extrairMinutosAFrente("em uma hora")).toBe(60);
  });
  it("retorna null sem expressão de tempo", () => {
    expect(extrairMinutosAFrente("de remédio")).toBeNull();
  });
});

describe("querCriarLembrete", () => {
  it("reconhece intenção de criar", () => {
    expect(querCriarLembrete("criar um lembrete de remédio")).toBe(true);
    expect(querCriarLembrete("me lembre de tomar água")).toBe(true);
  });
  it("não confunde com abrir a tela de lembretes", () => {
    expect(querCriarLembrete("abrir lembretes")).toBe(false);
    expect(querCriarLembrete("ver meus lembretes")).toBe(false);
  });
});

describe("tituloLembrete", () => {
  it("extrai o título sem horário", () => {
    expect(tituloLembrete("criar um lembrete de remédio")).toBe("Remédio");
  });
  it("extrai o título descartando o horário", () => {
    expect(
      tituloLembrete("me lembre de tomar água daqui a 10 minutos"),
    ).toBe("Tomar água");
  });
});

describe("minutosParaHHMM", () => {
  it("formata e dá a volta após 24h", () => {
    expect(minutosParaHHMM(8 * 60 + 5)).toBe("08:05");
    expect(minutosParaHHMM(23 * 60 + 50 + 20)).toBe("00:10"); // 23:50 + 20min
  });
});
