"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSessao } from "@/lib/supabase/use-sessao";
import { temSupabase } from "@/lib/supabase/config";
import { carregarPerfil } from "@/lib/idoso/perfil";

/**
 * Protege as telas do idoso (modo dispositivo):
 *  - sem sessão (com backend) → redireciona para /login;
 *  - logado, mas sem perfil do idoso → redireciona para /configurar (setup 1ª vez).
 * Em modo local (sem Supabase), libera o acesso normalmente.
 */
export function GuardaSessao({ children }: { children: React.ReactNode }) {
  const { user, carregando } = useSessao();
  const router = useRouter();
  const [verificandoPerfil, setVerificandoPerfil] = useState(true);

  const semBackend = !temSupabase();

  useEffect(() => {
    if (semBackend) {
      setVerificandoPerfil(false);
      return;
    }
    if (carregando) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    let ativo = true;
    carregarPerfil().then((perfil) => {
      if (!ativo) return;
      if (!perfil?.nome?.trim()) {
        router.replace("/configurar");
        return;
      }
      setVerificandoPerfil(false);
    });
    return () => {
      ativo = false;
    };
  }, [semBackend, carregando, user, router]);

  if (!semBackend && (carregando || !user || verificandoPerfil)) {
    return <p className="py-20 text-center text-zinc-500">Carregando…</p>;
  }

  return <>{children}</>;
}
