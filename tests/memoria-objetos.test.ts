import { describe, it, expect } from "vitest";
import { responderOndeEsta, type VistoEm } from "@/lib/vision/memoria-objetos";

const agora = new Date("2026-06-18T12:00:00");
const memoria: VistoEm[] = [
  {
    classe: "cell phone",
    ambiente: "sala",
    quando: new Date("2026-06-18T11:59:00").toISOString(),
  },
];

describe("responderOndeEsta", () => {
  it("responde celular com ambiente e tempo", () => {
    const r = responderOndeEsta("cadê meu celular", memoria, agora);
    expect(r).toMatch(/celular/i);
    expect(r).toMatch(/sala/i);
  });
  it("remédio mapeia para garrafa", () => {
    const mem: VistoEm[] = [
      { classe: "bottle", ambiente: "cozinha", quando: agora.toISOString() },
    ];
    expect(responderOndeEsta("onde está meu remédio", mem, agora)).toMatch(
      /cozinha/i,
    );
  });
  it("sem registro, responde que não viu", () => {
    expect(responderOndeEsta("cadê meu celular", [], agora)).toMatch(
      /não vi|não encontrei/i,
    );
  });
  it("consulta sem objeto conhecido retorna null", () => {
    expect(responderOndeEsta("que horas são", memoria, agora)).toBeNull();
  });
});
