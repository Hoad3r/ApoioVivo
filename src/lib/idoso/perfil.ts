/**
 * Perfil da pessoa assistida (idoso) — o "dono" do dispositivo.
 *
 * Modelo: o aparelho pertence ao idoso. Numa configuração inicial (1ª vez),
 * grava-se o nome/idade, que passam a alimentar a saudação e o painel.
 * Persistência no Supabase (tabela `idosos`) quando há backend, com cache local
 * para leitura síncrona e funcionamento offline.
 */
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { temSupabase } from "@/lib/supabase/config";

export interface PerfilIdoso {
  nome: string;
  idade: number | null;
}

const K_PERFIL = "apoiovivo:idoso-perfil";

/** Leitura síncrona do cache local (usada pela saudação). */
export function lerPerfilLocal(): PerfilIdoso | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(K_PERFIL);
    return raw ? (JSON.parse(raw) as PerfilIdoso) : null;
  } catch {
    return null;
  }
}

function salvarPerfilLocal(p: PerfilIdoso): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(K_PERFIL, JSON.stringify(p));
}

/**
 * Carrega o perfil do backend (quando há sessão) e atualiza o cache local.
 * Sem backend, devolve apenas o cache local.
 */
export async function carregarPerfil(): Promise<PerfilIdoso | null> {
  const supabase = getSupabaseBrowser();
  if (!supabase) return lerPerfilLocal();

  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return lerPerfilLocal();

  const { data, error } = await supabase
    .from("idosos")
    .select("nome, idade")
    .order("criado_em", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error || !data) return lerPerfilLocal();

  const perfil: PerfilIdoso = { nome: data.nome, idade: data.idade ?? null };
  salvarPerfilLocal(perfil);
  return perfil;
}

/** Cria ou atualiza o perfil do idoso (upsert por usuário) e atualiza o cache. */
export async function salvarPerfil(p: PerfilIdoso): Promise<void> {
  const nome = p.nome.trim();
  const perfil: PerfilIdoso = { nome, idade: p.idade };
  salvarPerfilLocal(perfil);

  if (!temSupabase()) return;
  const supabase = getSupabaseBrowser();
  if (!supabase) return;

  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) throw new Error("Não autenticado.");

  const { data: existente } = await supabase
    .from("idosos")
    .select("id")
    .order("criado_em", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (existente) {
    const { error } = await supabase
      .from("idosos")
      .update({ nome, idade: p.idade })
      .eq("id", existente.id);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from("idosos")
      .insert({ nome, idade: p.idade, user_id: userId });
    if (error) throw error;
  }
}
