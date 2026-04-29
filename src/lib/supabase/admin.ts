import { createClient } from "@supabase/supabase-js";

/**
 * Cliente Supabase com a chave de serviço (apenas no servidor — API routes).
 * Usado para ler os cuidadores e enviar os alertas. Retorna null se não configurado.
 */
export function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return null;
  return createClient(url, serviceKey, { auth: { persistSession: false } });
}
