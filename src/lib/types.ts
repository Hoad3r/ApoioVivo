/**
 * Domain types for Apoio Vivo.
 *
 * Modeled after the PI-I specification (Usuario, Lembrete, Notificação/Evento).
 * No dependency on any storage client so the backend can change freely.
 */

export interface Usuario {
  id: string;
  nome: string;
  idade: number;
}

export type Recorrencia = "diario" | "a-cada-2h" | "seg-sex" | "unico";

export interface Lembrete {
  id: string;
  titulo: string;
  /** Horário no formato "HH:MM". */
  hora: string;
  recorrencia: Recorrencia;
}

export type TipoEvento =
  | "atividade"
  | "lembrete-ignorado"
  | "queda"
  | "emergencia"
  | "objeto";

export interface Evento {
  id: string;
  tipo: TipoEvento;
  descricao: string;
  /** ISO 8601. */
  criadoEm: string;
  urgente: boolean;
}

export const RECORRENCIA_LABEL: Record<Recorrencia, string> = {
  diario: "Todos os dias",
  "a-cada-2h": "A cada 2 horas",
  "seg-sex": "Segunda a Sexta",
  unico: "Uma vez",
};
