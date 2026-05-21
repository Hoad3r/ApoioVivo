import { describe, it, expect } from "vitest";
import {
  querCadastrarCuidador,
  extrairNomeCuidador,
  extrairEmailFalado,
} from "@/lib/comando-cuidador";

describe("querCadastrarCuidador", () => {
  it("reconhece 'adicionar cuidador'", () => {
    expect(querCadastrarCuidador("adicionar cuidador")).toBe(true);
  });

  it("reconhece variações (cadastrar/novo contato/familiar)", () => {
    expect(querCadastrarCuidador("quero cadastrar um cuidador")).toBe(true);
    expect(querCadastrarCuidador("novo contato familiar")).toBe(true);
    expect(querCadastrarCuidador("registrar responsável")).toBe(true);
  });

  it("ignora frases que não pedem cadastro", () => {
    expect(querCadastrarCuidador("abrir a câmera")).toBe(false);
    expect(querCadastrarCuidador("ligar para o cuidador")).toBe(false);
  });
});

describe("extrairNomeCuidador", () => {
  it("extrai o nome dito junto ('cuidador chamado João')", () => {
    expect(extrairNomeCuidador("cadastrar cuidador chamado joão")).toBe("João");
  });

  it("retorna null quando não há nome", () => {
    expect(extrairNomeCuidador("adicionar cuidador")).toBeNull();
  });
});

describe("extrairEmailFalado", () => {
  it("normaliza 'arroba' e 'ponto'", () => {
    expect(extrairEmailFalado("joao arroba gmail ponto com")).toBe(
      "joao@gmail.com",
    );
  });

  it("mantém um e-mail já formatado", () => {
    expect(extrairEmailFalado("ana@exemplo.com.br")).toBe("ana@exemplo.com.br");
  });
});
