import type { Evento, Lembrete, Usuario } from "@/lib/types";

/**
 * Contrato de acesso a dados. Toda a UI conversa com a aplicação através desta
 * interface — nunca direto com o armazenamento — para manter o backend trocável.
 */
export interface DataStore {
  getUsuario(): Usuario;

  listLembretes(): Lembrete[];
  addLembrete(lembrete: Omit<Lembrete, "id">): Lembrete;
  updateLembrete(lembrete: Lembrete): void;
  removeLembrete(id: string): void;

  listEventos(): Evento[];
  addEvento(evento: Omit<Evento, "id" | "criadoEm">): Evento;
}
