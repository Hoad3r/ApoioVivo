import { describe, it, expect } from "vitest";
import { escolherIndice, periodoDoDia, saudacoes } from "@/lib/frases";

describe("escolherIndice", () => {
  it("com uma opção sempre retorna 0", () => {
    expect(escolherIndice(1, undefined, 0.9)).toBe(0);
  });

  it("mapeia o sorteio para um índice válido", () => {
    expect(escolherIndice(4, undefined, 0)).toBe(0);
    expect(escolherIndice(4, undefined, 0.99)).toBe(3);
  });

  it("evita repetir o índice anterior", () => {
    // sorteio cairia em 2, mas anterior é 2 → vai para 3.
    expect(escolherIndice(4, 2, 0.5)).toBe(3);
  });
});

describe("periodoDoDia", () => {
  it("classifica manhã, tarde e noite", () => {
    expect(periodoDoDia(8)).toBe("manhã");
    expect(periodoDoDia(14)).toBe("tarde");
    expect(periodoDoDia(21)).toBe("noite");
  });
});

describe("saudacoes", () => {
  it("usa o cumprimento do período e inclui o nome", () => {
    const manha = saudacoes("Maria", 9);
    expect(manha.length).toBeGreaterThan(1);
    expect(manha.every((s) => s.includes("Maria"))).toBe(true);
    expect(manha.some((s) => s.includes("Bom dia"))).toBe(true);

    const noite = saudacoes("João", 20);
    expect(noite.some((s) => s.includes("Boa noite"))).toBe(true);
  });
});
