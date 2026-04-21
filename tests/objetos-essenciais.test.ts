import { describe, it, expect } from "vitest";
import { infoObjetoEssencial } from "@/lib/vision/objetos-essenciais";

describe("infoObjetoEssencial", () => {
  it("garrafa vira remédio/água", () => {
    expect(infoObjetoEssencial("bottle")).toMatch(/remédio|água/i);
  });
  it("bolsa aponta chaves e carteira", () => {
    expect(infoObjetoEssencial("handbag")).toMatch(/chaves|carteira/i);
  });
  it("celular é reconhecido", () => {
    expect(infoObjetoEssencial("cell phone")).toMatch(/celular/i);
  });
  it("objeto sem proxy retorna null", () => {
    expect(infoObjetoEssencial("chair")).toBeNull();
  });
});
