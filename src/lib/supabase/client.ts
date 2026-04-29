import { createBrowserClient } from "@supabase/ssr";
import { SUPABASE_ANON_KEY, SUPABASE_URL, temSupabase } from "./config";

type BrowserClient = ReturnType<typeof createBrowserClient>;

let client: BrowserClient | null = null;

/**
 * Cliente Supabase do navegador (singleton). Retorna null quando o backend
 * não está configurado — nesse caso o app usa o modo local.
 */
export function getSupabaseBrowser(): BrowserClient | null {
  if (!temSupabase()) return null;
  if (!client) {
    client = createBrowserClient(SUPABASE_URL!, SUPABASE_ANON_KEY!);
  }
  return client;
}
