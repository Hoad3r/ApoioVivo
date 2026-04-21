import { describe, it, expect } from "vitest";
import { infoObjetoEssencial } from "@/lib/vision/objetos-essenciais";
import { detectarAmbiente } from "@/lib/vision/ambiente";

describe("infoObjetoEssencial", () => {
  it("dá informação personalizada para a garrafa (remédio)", () => {
    expect(infoObjetoEssencial("bottle")).toMatch(/rem[eé]dio/i);
  });
  it("sugere ligar para a família ao ver o celular", () => {
    expect(infoObjetoEssencial("cell phone")).toMatch(/fam[ií]lia/i);
  });
  it("retorna null para objeto sem informação", () => {
    expect(infoObjetoEssencial("car")).toBeNull();
  });
});

describe("detectarAmbiente", () => {
  it("infere cozinha pela geladeira", () => {
    expect(detectarAmbiente(["refrigerator", "person"])).toBe("cozinha");
  });
  it("infere quarto pela cama", () => {
    expect(detectarAmbiente(["bed"])).toBe("quarto");
  });
  it("retorna null sem objetos de ambiente conhecidos", () => {
    expect(detectarAmbiente(["car", "person"])).toBeNull();
  });
});
