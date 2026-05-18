"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSessao } from "@/lib/supabase/use-sessao";
import { temSupabase } from "@/lib/supabase/config";

/**
 * Protege as telas do idoso: sem sessão (e com backend configurado), redireciona
 * para /login. Em modo local (sem Supabase), libera o acesso normalmente.
 */
export function GuardaSessao({ children }: { children: React.ReactNode }) {
  const { user, carregando } = useSessao();
  const router = useRouter();

  const precisaLogin = temSupabase() && !carregando && !user;

  useEffect(() => {
    if (precisaLogin) router.replace("/login");
  }, [precisaLogin, router]);

  // Enquanto verifica a sessão (com backend), evita piscar a tela protegida.
  if (temSupabase() && (carregando || !user)) {
    return (
      <p className="py-20 text-center text-zinc-500">Carregando…</p>
    );
  }

  return <>{children}</>;
}
