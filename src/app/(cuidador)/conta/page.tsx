"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { temSupabase } from "@/lib/supabase/config";
import { useSessao } from "@/lib/supabase/use-sessao";

export default function ContaPage() {
  const router = useRouter();
  const { user, carregando } = useSessao();

  async function sair() {
    await getSupabaseBrowser()?.auth.signOut();
    router.push("/login");
  }

  return (
    <main className="mx-auto min-h-dvh max-w-md px-5 py-10">
      <Link href="/" className="text-blue-700">
        ← Início
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-zinc-900">Minha Conta</h1>

      {!temSupabase() ? (
        <p className="mt-6 rounded-2xl bg-amber-50 p-4 text-amber-900">
          Backend não configurado. Veja <code>.env.example</code> para ativar.
        </p>
      ) : carregando ? (
        <p className="mt-6 text-zinc-600">Carregando…</p>
      ) : !user ? (
        <div className="mt-6 rounded-2xl bg-white p-4 shadow-sm">
          <p className="text-zinc-700">Você não está conectado.</p>
          <Link
            href="/login"
            className="mt-3 inline-block rounded-xl bg-blue-700 px-5 py-2 font-bold text-white"
          >
            Entrar
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          <div className="rounded-2xl bg-white p-4 shadow-sm">
            <p className="text-sm text-zinc-500">Conectado como</p>
            <p className="text-lg font-bold text-zinc-900">{user.email}</p>
          </div>
          <Link
            href="/painel"
            className="block rounded-xl bg-zinc-100 px-5 py-3 text-center font-bold text-zinc-800"
          >
            Ir para o Painel do Cuidador
          </Link>
          <button
            type="button"
            onClick={sair}
            className="w-full rounded-xl border border-red-300 bg-red-50 py-3 font-bold text-red-700"
          >
            Sair
          </button>
        </div>
      )}
    </main>
  );
}
