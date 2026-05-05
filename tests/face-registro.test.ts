import { describe, it, expect } from "vitest";
import {
  distanciaDescritores,
  identificar,
  type RostoRegistrado,
} from "@/lib/face/registro";

const reg = (nome: string, descritor: number[]): RostoRegistrado => ({
  id: nome,
  nome,
  papel: "idoso",
  descritor,
});

describe("distanciaDescritores", () => {
  it("é zero para descritores iguais", () => {
    expect(distanciaDescritores([1, 2, 3], [1, 2, 3])).toBe(0);
  });
  it("calcula a distância euclidiana", () => {
    expect(distanciaDescritores([0, 0], [3, 4])).toBe(5);
  });
});

describe("identificar", () => {
  const registros = [reg("Maria", [0, 0, 0]), reg("João", [1, 1, 1])];

  it("reconhece o rosto mais próximo dentro do limiar", () => {
    expect(identificar([0, 0, 0.1], registros, 0.5)?.nome).toBe("Maria");
  });

  it("retorna null quando ninguém está perto o suficiente", () => {
    expect(identificar([5, 5, 5], registros, 0.5)).toBeNull();
  });

  it("retorna null sem rostos cadastrados", () => {
    expect(identificar([0, 0, 0], [], 0.5)).toBeNull();
  });
});
