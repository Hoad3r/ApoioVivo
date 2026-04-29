/** Configuração e detecção de disponibilidade do Supabase. */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * True quando as chaves públicas do Supabase estão configuradas.
 * Permite que o app degrade para o modo local quando o backend não foi configurado.
 */
export function temSupabase(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
}
