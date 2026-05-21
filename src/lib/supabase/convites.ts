import { getSupabaseBrowser } from "./client";

/**
 * Cria um convite (token de uso único) vinculado ao usuário logado e devolve a
 * URL pública que o cuidador abre para se cadastrar sozinho — sem o idoso digitar.
 */
export async function criarConvite(): Promise<string> {
  const supabase = getSupabaseBrowser();
  if (!supabase) throw new Error("Backend não configurado.");
  const { data: userData } = await supabase.auth.getUser();
  const userId = userData.user?.id;
  if (!userId) throw new Error("Não autenticado.");

  const { data, error } = await supabase
    .from("convites")
    .insert({ user_id: userId })
    .select("token")
    .single();
  if (error) throw error;

  const token = data.token as string;
  return `${window.location.origin}/convite/${token}`;
}
