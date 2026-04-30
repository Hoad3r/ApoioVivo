"use client";

import { useEffect, useState } from "react";
import type { AuthChangeEvent, Session, User } from "@supabase/supabase-js";
import { getSupabaseBrowser } from "./client";

/** Hook de sessão do cuidador. user = null quando deslogado ou sem backend. */
export function useSessao() {
  const [user, setUser] = useState<User | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const supabase = getSupabaseBrowser();
    if (!supabase) {
      setCarregando(false);
      return;
    }
    supabase.auth.getUser().then((res) => {
      setUser(res.data.user ?? null);
      setCarregando(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange(
      (_evento: AuthChangeEvent, sessao: Session | null) => {
        setUser(sessao?.user ?? null);
      },
    );
    return () => sub.subscription.unsubscribe();
  }, []);

  return { user, carregando };
}
