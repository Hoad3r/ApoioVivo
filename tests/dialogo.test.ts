import { describe, it, expect } from "vitest";
import { interpretar, responder } from "@/lib/dialogo";

describe("interpretar", () => {
  it("reconhece bem-estar como positivo", () => {
    expect(interpretar("estou bem, obrigado")).toBe("positivo");
    expect(interpretar("tô ótima hoje")).toBe("positivo");
    expect(interpretar("sim")).toBe("positivo");
  });

  it("reconhece mal-estar como negativo", () => {
    expect(interpretar("não estou muito bem")).toBe("negativo");
    expect(interpretar("estou cansada")).toBe("negativo");
    expect(interpretar("me sinto triste")).toBe("negativo");
    expect(interpretar("nada bem")).toBe("negativo");
  });

  it("reconhece pedido de ajuda", () => {
    expect(interpretar("socorro")).toBe("ajuda");
    expect(interpretar("estou passando mal")).toBe("ajuda");
    expect(interpretar("estou com dor")).toBe("ajuda");
  });

  it("retorna indefinido quando não entende", () => {
    expect(interpretar("xpto qualquer coisa")).toBe("indefinido");
  });
});

describe("responder", () => {
  it("para ajuda, informa que vai avisar o cuidador", () => {
    expect(responder("ajuda").toLowerCase()).toContain("cuidador");
  });

  it("sempre devolve uma frase não vazia", () => {
    for (const i of ["positivo", "negativo", "ajuda", "indefinido"] as const) {
      expect(responder(i).length).toBeGreaterThan(0);
    }
  });
});
