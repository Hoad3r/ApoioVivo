"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { temSupabase } from "@/lib/supabase/config";
import { useSessao } from "@/lib/supabase/use-sessao";
import {
  adicionarCuidador,
  listarCuidadores,
  removerCuidador,
  type Cuidador,
} from "@/lib/supabase/cuidadores";

const FORM_VAZIO = { nome: "", parentesco: "", email: "", telefone: "" };

export default function CuidadoresPage() {
  const { user, carregando } = useSessao();
  const [lista, setLista] = useState<Cuidador[]>([]);
  const [form, setForm] = useState(FORM_VAZIO);
  const [msg, setMsg] = useState<string | null>(null);

  const recarregar = useCallback(async () => {
    try {
      setLista(await listarCuidadores());
    } catch {
      setMsg("Erro ao carregar os cuidadores.");
    }
  }, []);

  useEffect(() => {
    if (user) recarregar();
  }, [user, recarregar]);

  async function adicionar(e: FormEvent) {
    e.preventDefault();
    if (!form.nome.trim() || !form.email.trim()) return;
    try {
      await adicionarCuidador({
        nome: form.nome,
        email: form.email,
        parentesco: form.parentesco || null,
        telefone: form.telefone || null,
      });
      setForm(FORM_VAZIO);
      setMsg(null);
      await recarregar();
    } catch {
      setMsg("Erro ao salvar. Verifique se executou o schema.sql no Supabase.");
    }
  }

  async function remover(id: string) {
    try {
      await removerCuidador(id);
      await recarregar();
    } catch {
      setMsg("Erro ao remover.");
    }
  }

  return (
    <main className="mx-auto min-h-dvh max-w-md px-5 py-10">
      <Link href="/conta" className="text-blue-700">
        ← Minha conta
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-zinc-900">
        Cuidadores e Familiares
      </h1>
      <p className="mt-1 text-sm text-zinc-600">
        Quem recebe os alertas de queda, anomalia e emergência.
      </p>

      {!temSupabase() ? (
        <p className="mt-6 rounded-2xl bg-amber-50 p-4 text-amber-900">
          Backend não configurado. Veja <code>.env.example</code> para ativar.
        </p>
      ) : carregando ? (
        <p className="mt-6 text-zinc-600">Carregando…</p>
      ) : !user ? (
        <div className="mt-6 rounded-2xl bg-white p-4 shadow-sm">
          <p className="text-zinc-700">Entre para gerenciar os cuidadores.</p>
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
            onSubmit={adicionar}
            className="mt-6 space-y-3 rounded-2xl bg-white p-4 shadow-sm"
          >
            <h2 className="text-lg font-bold">Adicionar</h2>
            <input
              value={form.nome}
              onChange={(e) => setForm({ ...form, nome: e.target.value })}
              placeholder="Nome"
              required
              className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-lg"
            />
            <input
              value={form.parentesco}
              onChange={(e) => setForm({ ...form, parentesco: e.target.value })}
              placeholder="Parentesco (ex.: filha)"
              className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-lg"
            />
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="E-mail (recebe os alertas)"
              required
              className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-lg"
            />
            <input
              value={form.telefone}
              onChange={(e) => setForm({ ...form, telefone: e.target.value })}
              placeholder="Telefone (opcional)"
              className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-lg"
            />
            <button
              type="submit"
              className="w-full rounded-xl bg-green-600 py-3 font-bold text-white hover:bg-green-700"
            >
              ＋ Adicionar cuidador
            </button>
            {msg && (
              <p role="status" className="text-center text-sm text-red-600">
                {msg}
              </p>
            )}
          </form>

          <ul className="mt-4 space-y-3">
            {lista.map((c) => (
              <li
                key={c.id}
                className="flex items-start justify-between gap-3 rounded-2xl bg-white p-4 shadow-sm"
              >
                <div className="min-w-0">
                  <p className="font-bold text-zinc-900">
                    {c.nome}
                    {c.parentesco && (
                      <span className="ml-1 text-sm font-normal text-zinc-500">
                        ({c.parentesco})
                      </span>
                    )}
                  </p>
                  <p className="truncate text-sm text-zinc-600">{c.email}</p>
                  {c.telefone && (
                    <p className="text-sm text-zinc-500">{c.telefone}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => remover(c.id)}
                  className="shrink-0 rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
                >
                  Remover
                </button>
              </li>
            ))}
            {lista.length === 0 && (
              <li className="py-6 text-center text-zinc-500">
                Nenhum cuidador cadastrado ainda.
              </li>
            )}
          </ul>
        </>
      )}
    </main>
  );
}
