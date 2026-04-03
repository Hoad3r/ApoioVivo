import type { DataStore } from "./types";
import { LocalStore } from "./local-store";

let instance: DataStore | null = null;

/**
 * Retorna o DataStore da aplicação (singleton). Usa localStorage no navegador.
 * Deve ser chamado apenas no cliente.
 */
export function getDataStore(): DataStore {
  if (!instance) {
    instance = new LocalStore(window.localStorage);
  }
  return instance;
}

export type { DataStore } from "./types";
