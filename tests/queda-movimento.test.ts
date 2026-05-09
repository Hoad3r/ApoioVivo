import { describe, it, expect } from "vitest";
import {
  detectarQuedaMovimento,
  type QuadroPose,
} from "@/lib/vision/queda-movimento";

function q(
  t: number,
  presente: boolean,
  cx: number,
  cy: number,
  alturaRel: number,
): QuadroPose {
  return { t, presente, cx, cy, alturaRel };
}

describe("detectarQuedaMovimento", () => {
  it("histórico curto demais NÃO é queda", () => {
    expect(detectarQuedaMovimento([q(0, true, 0.5, 0.5, 0.6)])).toBe(false);
  });

  it("pessoa parada em pé NÃO é queda", () => {
    const hist = [
      q(0, true, 0.5, 0.5, 0.6),
      q(300, true, 0.5, 0.5, 0.6),
      q(600, true, 0.5, 0.5, 0.6),
    ];
    expect(detectarQuedaMovimento(hist)).toBe(false);
  });

  it("sumiço pela LATERAL (foi buscar algo) NÃO é queda", () => {
    const hist = [
      q(0, true, 0.5, 0.5, 0.6),
      q(300, true, 0.7, 0.5, 0.6),
      q(600, true, 0.9, 0.5, 0.6),
      q(900, false, 0.9, 0.5, 0.6),
    ];
    expect(detectarQuedaMovimento(hist)).toBe(false);
  });

  it("sumiço para BAIXO (despencou) É queda", () => {
    const hist = [
      q(0, true, 0.5, 0.4, 0.6),
      q(200, true, 0.5, 0.55, 0.5),
      q(400, false, 0.5, 0.55, 0.5),
    ];
    expect(detectarQuedaMovimento(hist)).toBe(true);
  });

  it("descida rápida com achatamento (visível) É queda", () => {
    const hist = [
      q(0, true, 0.5, 0.35, 0.6),
      q(200, true, 0.5, 0.5, 0.35),
      q(400, true, 0.5, 0.58, 0.25),
    ];
    expect(detectarQuedaMovimento(hist)).toBe(true);
  });

  it("saída na DIAGONAL (mais lateral que vertical) NÃO é queda", () => {
    const hist = [
      q(0, true, 0.5, 0.5, 0.6),
      q(300, true, 0.8, 0.58, 0.6),
      q(600, false, 0.8, 0.58, 0.6),
    ];
    expect(detectarQuedaMovimento(hist)).toBe(false);
  });

  it("já caído no chão (bem embaixo e achatado) É queda", () => {
    const hist = [
      q(0, true, 0.5, 0.82, 0.25),
      q(300, false, 0.5, 0.82, 0.25),
    ];
    expect(detectarQuedaMovimento(hist)).toBe(true);
  });

  it("sumiço na parte baixa mas ainda em pé NÃO é queda", () => {
    const hist = [
      q(0, true, 0.5, 0.65, 0.5),
      q(300, false, 0.5, 0.65, 0.5),
    ];
    expect(detectarQuedaMovimento(hist)).toBe(false);
  });
});
