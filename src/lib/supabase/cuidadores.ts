import { getSupabaseBrowser } from "./client";

export interface Cuidador {
  id: string;
  nome: string;
  parentesco: string | null;
  email: string;
  telefone: string | null;
}

/** Lista os cuidadores/familiares do usuário logado (RLS garante o escopo). */
export async function listarCuidadores(): Promise<Cuidador[]> {
  const supabase = getSupabaseBrowser();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("cuidadores")
    .select("id, nome, parentesco, email, telefone")
    .order("criado_em", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Cuidador[];
}

/** Adiciona um cuidador/familiar vinculado ao usuário logado. */
export async function adicionarCuidador(c: Omit<Cuidador, "id">): Promise<void> {
  const supabase = getSupabaseBrowser();
  if (!supabase) return;
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) throw new Error("Não autenticado.");
  const { error } = await supabase
    .from("cuidadores")
    .insert({ ...c, user_id: userId });
  if (error) throw error;
}

/** Atualiza os dados de um cuidador/familiar (RLS garante o escopo). */
export async function atualizarCuidador(
  id: string,
  c: Omit<Cuidador, "id">,
): Promise<void> {
  const supabase = getSupabaseBrowser();
  if (!supabase) return;
  const { error } = await supabase
    .from("cuidadores")
    .update({
      nome: c.nome,
      parentesco: c.parentesco,
      email: c.email,
      telefone: c.telefone,
    })
    .eq("id", id);
  if (error) throw error;
}

/** Remove um cuidador/familiar. */
export async function removerCuidador(id: string): Promise<void> {
  const supabase = getSupabaseBrowser();
  if (!supabase) return;
  const { error } = await supabase.from("cuidadores").delete().eq("id", id);
  if (error) throw error;
}
