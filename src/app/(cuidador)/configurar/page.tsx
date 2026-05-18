"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { temSupabase } from "@/lib/supabase/config";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { useSessao } from "@/lib/supabase/use-sessao";
import { carregarPerfil, salvarPerfil } from "@/lib/idoso/perfil";

export default function ConfigurarPage() {
  const router = useRouter();
  const { user, carregando } = useSessao();
  const [nome, setNome] = useState("");
  const [idade, setIdade] = useState("");
  const [jaTinhaPerfil, setJaTinhaPerfil] = useState(false);
  const [carregandoPerfil, setCarregandoPerfil] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const precisaLogin = temSupabase() && !carregando && !user;

  useEffect(() => {
    if (carregando) return;
    if (precisaLogin) {
      setCarregandoPerfil(false);
      return;
    }
    carregarPerfil().then((perfil) => {
      if (perfil?.nome) {
        setNome(perfil.nome);
        setIdade(perfil.idade != null ? String(perfil.idade) : "");
        setJaTinhaPerfil(true);
      }
      setCarregandoPerfil(false);
    });
  }, [carregando, precisaLogin]);

  async function salvar(e: FormEvent) {
    e.preventDefault();
    if (!nome.trim()) return;
    setSalvando(true);
    setMsg(null);
    try {
      await salvarPerfil({
        nome,
        idade: idade.trim() ? Number(idade) : null,
      });
      if (!jaTinhaPerfil) {
        router.replace("/");
        return;
      }
      setJaTinhaPerfil(true);
      setMsg("✓ Perfil salvo.");
    } catch {
      setMsg("Erro ao salvar. Verifique se executou o schema.sql no Supabase.");
    } finally {
      setSalvando(false);
    }
  }

  async function sair() {
    await getSupabaseBrowser()?.auth.signOut();
    router.push("/login");
  }

  return (
    <main className="mx-auto min-h-dvh max-w-md px-5 py-10">
      {jaTinhaPerfil && (
        <Link href="/" className="text-blue-700">
          ← Início
        </Link>
      )}
      <h1 className="mt-4 text-2xl font-bold text-zinc-900">
        {jaTinhaPerfil ? "Configurações" : "Configurar dispositivo"}
      </h1>
      <p className="mt-1 text-sm text-zinc-600">
        {jaTinhaPerfil
          ? "Ajuste o perfil e os contatos que recebem os alertas."
          : "Quem vai usar este aparelho? Informe o nome da pessoa assistida."}
      </p>

      {carregando || carregandoPerfil ? (
        <p className="mt-6 text-zinc-600">Carregando…</p>
      ) : precisaLogin ? (
        <div className="mt-6 rounded-2xl bg-white p-4 shadow-sm">
          <p className="text-zinc-700">Entre para configurar o dispositivo.</p>
          <Link
            href="/login"
            className="mt-3 inline-block rounded-xl bg-blue-700 px-5 py-2 font-bold text-white"
          >
            Entrar
          </Link>
        </div>
      ) : (
        <>
          <form
            onSubmit={salvar}
            className="mt-6 space-y-3 rounded-2xl bg-white p-4 shadow-sm"
          >
            <h2 className="text-lg font-bold">Pessoa assistida</h2>
            <label className="block">
              <span className="text-sm font-medium text-zinc-700">Nome</span>
              <input
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Ex.: Dona Lúcia"
                required
                className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2 text-lg"
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-zinc-700">
                Idade (opcional)
              </span>
              <input
                type="number"
                min={0}
                value={idade}
                onChange={(e) => setIdade(e.target.value)}
                className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2 text-lg"
              />
            </label>
            <button
              type="submit"
              disabled={salvando}
              className="w-full rounded-xl bg-blue-700 py-3 font-bold text-white hover:bg-blue-800 disabled:opacity-60"
            >
              {salvando ? "Salvando…" : jaTinhaPerfil ? "Salvar" : "Continuar"}
            </button>
            {msg && (
              <p role="status" className="text-center text-sm text-zinc-600">
                {msg}
              </p>
            )}
          </form>

          {jaTinhaPerfil && (
            <div className="mt-4 space-y-3">
              <Link
                href="/cuidadores"
                className="block rounded-xl bg-green-600 px-5 py-3 text-center font-bold text-white"
              >
                👥 Cuidadores e familiares
              </Link>
              <Link
                href="/painel"
                className="block rounded-xl bg-zinc-100 px-5 py-3 text-center font-bold text-zinc-800"
              >
                📊 Painel de acompanhamento
              </Link>
              {temSupabase() && user && (
                <button
                  type="button"
                  onClick={sair}
                  className="w-full rounded-xl border border-red-300 bg-red-50 py-3 font-bold text-red-700"
                >
                  Sair desta conta
                </button>
              )}
            </div>
          )}
        </>
      )}
    </main>
  );
}
