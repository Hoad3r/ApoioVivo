"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { temSupabase } from "@/lib/supabase/config";
import { useSessao } from "@/lib/supabase/use-sessao";
import {
  adicionarCuidador,
  atualizarCuidador,
  listarCuidadores,
  removerCuidador,
  type Cuidador,
} from "@/lib/supabase/cuidadores";
import { criarConvite } from "@/lib/supabase/convites";
import { CadastroCuidadorVoz } from "@/components/cadastro-cuidador-voz";

const FORM_VAZIO = { nome: "", parentesco: "", email: "", telefone: "" };

export default function CuidadoresPage() {
  const { user, carregando } = useSessao();
  const [lista, setLista] = useState<Cuidador[]>([]);
  const [form, setForm] = useState(FORM_VAZIO);
  const [editando, setEditando] = useState<string | null>(null);
  const [editForm, setEditForm] = useState(FORM_VAZIO);
  const [msg, setMsg] = useState<string | null>(null);
  const [autoVoz] = useState(
    () =>
      typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).get("voz") === "1",
  );
  const [linkConvite, setLinkConvite] = useState<string | null>(null);
  const [gerandoLink, setGerandoLink] = useState(false);
  const [copiado, setCopiado] = useState(false);

  async function gerarLink() {
    setGerandoLink(true);
    setMsg(null);
    try {
      setLinkConvite(await criarConvite());
    } catch {
      setMsg("Erro ao gerar o link. Verifique se executou o schema.sql no Supabase.");
    } finally {
      setGerandoLink(false);
    }
  }

  async function copiarLink() {
    if (!linkConvite) return;
    try {
      await navigator.clipboard.writeText(linkConvite);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2000);
    } catch {
      /* sem clipboard: o link continua visível para cópia manual */
    }
  }

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
    if (!form.nome.trim() || !form.email.trim() || !form.telefone.trim()) return;
    try {
      await adicionarCuidador({
        nome: form.nome,
        email: form.email,
        parentesco: form.parentesco || null,
        telefone: form.telefone.trim(),
      });
      setForm(FORM_VAZIO);
      setMsg(null);
      await recarregar();
    } catch {
      setMsg("Erro ao salvar. Verifique se executou o schema.sql no Supabase.");
    }
  }

  function iniciarEdicao(c: Cuidador) {
    setMsg(null);
    setEditando(c.id);
    setEditForm({
      nome: c.nome,
      parentesco: c.parentesco ?? "",
      email: c.email,
      telefone: c.telefone ?? "",
    });
  }

  async function salvarEdicao(id: string) {
    if (
      !editForm.nome.trim() ||
      !editForm.email.trim() ||
      !editForm.telefone.trim()
    ) {
      setMsg("Nome, telefone e e-mail são obrigatórios.");
      return;
    }
    try {
      await atualizarCuidador(id, {
        nome: editForm.nome.trim(),
        parentesco: editForm.parentesco.trim() || null,
        email: editForm.email.trim(),
        telefone: editForm.telefone.trim(),
      });
      setEditando(null);
      setMsg(null);
      await recarregar();
    } catch {
      setMsg("Erro ao salvar a edição.");
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
      <Link href="/configurar" className="text-teal-700">
        ← Configurações
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
            className="mt-3 inline-block rounded-xl bg-teal-700 px-5 py-2 font-bold text-white"
          >
            Entrar
          </Link>
        </div>
      ) : (
        <>
          <section className="mt-6 rounded-2xl bg-white p-4 shadow-sm">
            <h2 className="text-lg font-bold">Cadastrar por voz</h2>
            <p className="mb-3 text-sm text-zinc-600">
              Diga o nome, o telefone e o e-mail; o app cadastra para você.
            </p>
            <CadastroCuidadorVoz auto={autoVoz} onCadastrado={recarregar} />
          </section>

          <section className="mt-4 rounded-2xl bg-white p-4 shadow-sm">
            <h2 className="text-lg font-bold">Convidar por link</h2>
            <p className="mb-3 text-sm text-zinc-600">
              Gere um link e envie ao familiar; ele preenche os próprios dados.
            </p>
            <button
              type="button"
              onClick={gerarLink}
              disabled={gerandoLink}
              className="w-full rounded-xl bg-teal-700 py-3 font-bold text-white hover:bg-teal-800 disabled:opacity-60"
            >
              {gerandoLink ? "Gerando…" : "🔗 Gerar link de convite"}
            </button>
            {linkConvite && (
              <div className="mt-3 space-y-2">
                <p className="break-all rounded-xl bg-zinc-100 p-3 text-sm text-zinc-700">
                  {linkConvite}
                </p>
                <button
                  type="button"
                  onClick={copiarLink}
                  className="w-full rounded-xl border border-teal-300 bg-teal-50 py-2 text-sm font-medium text-teal-700"
                >
                  {copiado ? "✓ Copiado!" : "Copiar link"}
                </button>
              </div>
            )}
          </section>

          <form
            onSubmit={adicionar}
            className="mt-4 space-y-3 rounded-2xl bg-white p-4 shadow-sm"
          >
            <h2 className="text-lg font-bold">Adicionar manualmente</h2>
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
              type="tel"
              value={form.telefone}
              onChange={(e) => setForm({ ...form, telefone: e.target.value })}
              placeholder="Telefone (para ligar / WhatsApp)"
              required
              className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-lg"
            />
            <button
              type="submit"
              className="w-full rounded-xl bg-teal-700 py-3 font-bold text-white hover:bg-teal-800"
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
            {lista.map((c) =>
              editando === c.id ? (
                <li
                  key={c.id}
                  className="space-y-3 rounded-2xl bg-white p-4 shadow-sm ring-2 ring-teal-200"
                >
                  <input
                    value={editForm.nome}
                    onChange={(e) =>
                      setEditForm({ ...editForm, nome: e.target.value })
                    }
                    placeholder="Nome"
                    className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-lg"
                  />
                  <input
                    value={editForm.parentesco}
                    onChange={(e) =>
                      setEditForm({ ...editForm, parentesco: e.target.value })
                    }
                    placeholder="Parentesco (ex.: filha)"
                    className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-lg"
                  />
                  <input
                    type="tel"
                    value={editForm.telefone}
                    onChange={(e) =>
                      setEditForm({ ...editForm, telefone: e.target.value })
                    }
                    placeholder="Telefone (para ligar / WhatsApp)"
                    className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-lg"
                  />
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) =>
                      setEditForm({ ...editForm, email: e.target.value })
                    }
                    placeholder="E-mail (recebe os alertas)"
                    className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-lg"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => salvarEdicao(c.id)}
                      className="flex-1 rounded-xl bg-teal-700 py-2 font-bold text-white hover:bg-teal-800"
                    >
                      Salvar
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditando(null)}
                      className="flex-1 rounded-xl border border-zinc-300 py-2 font-medium text-zinc-700 hover:bg-zinc-100"
                    >
                      Cancelar
                    </button>
                  </div>
                </li>
              ) : (
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
                    {c.telefone ? (
                      <p className="text-sm text-zinc-500">{c.telefone}</p>
                    ) : (
                      <p className="text-sm font-medium text-amber-700">
                        Sem telefone — toque em Editar para adicionar.
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => iniciarEdicao(c)}
                      className="rounded-xl bg-teal-50 px-3 py-2 text-sm font-medium text-teal-700 hover:bg-teal-100"
                    >
                      Editar
                    </button>
                    <button
                      type="button"
                      onClick={() => remover(c.id)}
                      className="rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100"
                    >
                      Remover
                    </button>
                  </div>
                </li>
              ),
            )}
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
