import type { DataStore } from "./types";
import type { Evento, Lembrete, Usuario } from "@/lib/types";

/** Mínimo de uma store chave-valor (compatível com window.localStorage). */
export interface KeyValue {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

const K_VERSAO = "apoiovivo:versao";
const K_USUARIO = "apoiovivo:usuario";
const K_LEMBRETES = "apoiovivo:lembretes";
const K_EVENTOS = "apoiovivo:eventos";

/** Bump para forçar a reaplicação do seed em navegadores com dados antigos. */
const VERSAO = "2";

const SEED_USUARIO: Usuario = { id: "u1", nome: "Maria", idade: 78 };

const SEED_LEMBRETES: Lembrete[] = [
  { id: "l1", titulo: "Tomar remédio para pressão", hora: "08:00", recorrencia: "diario" },
  { id: "l2", titulo: "Beber água", hora: "10:00", recorrencia: "a-cada-2h" },
  { id: "l3", titulo: "Almoço", hora: "12:00", recorrencia: "diario" },
  { id: "l4", titulo: "Caminhada leve", hora: "16:00", recorrencia: "seg-sex" },
  { id: "l5", titulo: "Jantar", hora: "19:00", recorrencia: "diario" },
];

/** Eventos nomeados que aparecem como alertas no Painel do Cuidador. */
const SEED_ALERTAS: Evento[] = [
  {
    id: "e1",
    tipo: "atividade",
    descricao: "Maria está se movimentando na cozinha",
    criadoEm: new Date().toISOString(),
    urgente: false,
  },
  {
    id: "e2",
    tipo: "lembrete-ignorado",
    descricao: "Remédio das 14h não foi confirmado",
    criadoEm: new Date().toISOString(),
    urgente: true,
  },
  {
    id: "e3",
    tipo: "queda",
    descricao: "Queda leve detectada no quarto",
    criadoEm: new Date().toISOString(),
    urgente: true,
  },
];

/** Atividade espalhada pelos últimos 7 dias, para popular o gráfico semanal. */
function gerarAtividadesSemana(agora = Date.now()): Evento[] {
  const eventos: Evento[] = [];
  const porDia = [4, 3, 4, 3, 4, 2, 3]; // hoje (0) .. 6 dias atrás
  for (let d = 0; d < porDia.length; d++) {
    for (let i = 0; i < porDia[d]; i++) {
      const t = new Date(agora - d * 86400000 - i * 2 * 3600000);
      eventos.push({
        id: `atv-${d}-${i}`,
        tipo: "atividade",
        descricao: "Atividade detectada em casa",
        criadoEm: t.toISOString(),
        urgente: false,
      });
    }
  }
  return eventos;
}

/** Implementação de DataStore sobre uma store chave-valor, com dados-semente. */
export class LocalStore implements DataStore {
  constructor(private storage: KeyValue) {
    if (this.storage.getItem(K_VERSAO) !== VERSAO) {
      this.storage.setItem(K_VERSAO, VERSAO);
      this.write(K_USUARIO, SEED_USUARIO);
      this.write(K_LEMBRETES, SEED_LEMBRETES);
      this.write(K_EVENTOS, [...SEED_ALERTAS, ...gerarAtividadesSemana()]);
    }
  }

  private read<T>(key: string, fallback: T): T {
    const raw = this.storage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  }

  private write(key: string, value: unknown): void {
    this.storage.setItem(key, JSON.stringify(value));
  }

  getUsuario(): Usuario {
    return this.read<Usuario>(K_USUARIO, SEED_USUARIO);
  }

  listLembretes(): Lembrete[] {
    return this.read<Lembrete[]>(K_LEMBRETES, []);
  }

  addLembrete(lembrete: Omit<Lembrete, "id">): Lembrete {
    const novo: Lembrete = { ...lembrete, id: crypto.randomUUID() };
    this.write(K_LEMBRETES, [...this.listLembretes(), novo]);
    return novo;
  }

  updateLembrete(lembrete: Lembrete): void {
    this.write(
      K_LEMBRETES,
      this.listLembretes().map((x) => (x.id === lembrete.id ? lembrete : x)),
    );
  }

  removeLembrete(id: string): void {
    this.write(
      K_LEMBRETES,
      this.listLembretes().filter((x) => x.id !== id),
    );
  }

  listEventos(): Evento[] {
    return this.read<Evento[]>(K_EVENTOS, []);
  }

  addEvento(evento: Omit<Evento, "id" | "criadoEm">): Evento {
    const novo: Evento = {
      ...evento,
      id: crypto.randomUUID(),
      criadoEm: new Date().toISOString(),
    };
    this.write(K_EVENTOS, [novo, ...this.listEventos()]);
    return novo;
  }
}
