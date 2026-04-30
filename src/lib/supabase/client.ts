import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_URL, temSupabase } from "./config";

let client: SupabaseClient | null = null;

/**
 * Cliente Supabase do navegador (singleton). Retorna null quando o backend
 * não está configurado — nesse caso o app usa o modo local.
 */
export function getSupabaseBrowser(): SupabaseClient | null {
  if (!temSupabase()) return null;
  if (!client) {
    client = createBrowserClient(SUPABASE_URL!, SUPABASE_ANON_KEY!);
  }
  return client;
}
