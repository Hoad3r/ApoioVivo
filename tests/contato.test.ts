import { describe, it, expect } from "vitest";
import {
  normalizarTelefone,
  linkLigacao,
  linkWhatsApp,
  interpretarComandoContato,
  acharContato,
} from "@/lib/contato";
import type { Cuidador } from "@/lib/supabase/cuidadores";

const contatos: Cuidador[] = [
  { id: "1", nome: "Ana Souza", parentesco: "filha", email: "ana@x.com", telefone: "(11) 98765-4321" },
  { id: "2", nome: "João Lima", parentesco: "filho", email: "joao@x.com", telefone: null },
];

describe("normalização e links", () => {
  it("mantém só dígitos", () => {
    expect(normalizarTelefone("(11) 98765-4321")).toBe("11987654321");
  });
  it("link de ligação com DDI 55", () => {
    expect(linkLigacao("(11) 98765-4321")).toBe("tel:+5511987654321");
  });
  it("link de WhatsApp com DDI 55", () => {
    expect(linkWhatsApp("11987654321")).toBe("https://wa.me/5511987654321");
  });
  it("não duplica o DDI quando já tem 55", () => {
    expect(linkWhatsApp("5511987654321")).toBe("https://wa.me/5511987654321");
  });
});

describe("interpretarComandoContato", () => {
  it("ligar para a Ana", () => {
    const c = interpretarComandoContato("ligar para a Ana");
    expect(c?.acao).toBe("ligar");
    expect(c?.alvo.toLowerCase()).toMatch(/ana/);
  });
  it("chamar o João no WhatsApp → whatsapp", () => {
    const c = interpretarComandoContato("chamar o João no WhatsApp");
    expect(c?.acao).toBe("whatsapp");
    expect(c?.alvo.toLowerCase()).toMatch(/joão|joao/);
  });
  it("fala sem comunicação retorna null", () => {
    expect(interpretarComandoContato("que horas são")).toBeNull();
  });
});

describe("acharContato", () => {
  it("acha por parentesco (minha filha)", () => {
    expect(acharContato("minha filha", contatos)?.id).toBe("1");
  });
  it("acha por primeiro nome", () => {
    expect(acharContato("ana", contatos)?.id).toBe("1");
  });
  it("retorna null quando não acha", () => {
    expect(acharContato("pedro", contatos)).toBeNull();
  });
});
