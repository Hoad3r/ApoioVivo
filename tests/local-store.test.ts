import { describe, it, expect, beforeEach } from "vitest";
import { LocalStore, type KeyValue } from "@/lib/data/local-store";

class MemoryStorage implements KeyValue {
  private m = new Map<string, string>();
  getItem(k: string) {
    return this.m.has(k) ? this.m.get(k)! : null;
  }
  setItem(k: string, v: string) {
    this.m.set(k, v);
  }
}

let store: LocalStore;

beforeEach(() => {
  store = new LocalStore(new MemoryStorage());
});

describe("LocalStore", () => {
  it("inicia sem nome semente (definido na configuração do dispositivo)", () => {
    expect(store.getUsuario()).toMatchObject({ nome: "", idade: 0 });
  });

  it("lista os 5 lembretes do seed", () => {
    expect(store.listLembretes()).toHaveLength(5);
  });

  it("adiciona um lembrete com id gerado", () => {
    const novo = store.addLembrete({
      titulo: "Teste",
      hora: "09:00",
      recorrencia: "unico",
    });
    expect(novo.id).toBeTruthy();
    expect(store.listLembretes()).toHaveLength(6);
  });

  it("remove um lembrete existente", () => {
    store.removeLembrete("l1");
    expect(store.listLembretes().some((l) => l.id === "l1")).toBe(false);
  });

  it("registra um evento com id e data, no topo da lista", () => {
    const ev = store.addEvento({
      tipo: "emergencia",
      descricao: "Botão de emergência acionado",
      urgente: true,
    });
    expect(ev.id).toBeTruthy();
    expect(ev.criadoEm).toBeTruthy();
    expect(store.listEventos()[0].id).toBe(ev.id);
  });
});
