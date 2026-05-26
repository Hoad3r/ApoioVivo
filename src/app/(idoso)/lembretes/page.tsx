"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Lembrete, Recorrencia } from "@/lib/types";
import { RECORRENCIA_LABEL } from "@/lib/types";
import { getDataStore } from "@/lib/data";
import { LembreteCard } from "@/components/lembrete-card";

const RECORRENCIAS: Recorrencia[] = ["diario", "a-cada-2h", "seg-sex", "unico"];

interface FormState {
  titulo: string;
  hora: string;
  recorrencia: Recorrencia;
}

const FORM_VAZIO: FormState = { titulo: "", hora: "08:00", recorrencia: "diario" };

export default function LembretesPage() {
  const [lembretes, setLembretes] = useState<Lembrete[]>([]);
  const [form, setForm] = useState<FormState | null>(null);
  const [editandoId, setEditandoId] = useState<string | null>(null);

  function recarregar() {
    setLembretes(getDataStore().listLembretes());
  }

  useEffect(() => {
    recarregar();
  }, []);

  function abrirNovo() {
    setEditandoId(null);
    setForm(FORM_VAZIO);
  }

  function abrirEdicao(l: Lembrete) {
    setEditandoId(l.id);
    setForm({ titulo: l.titulo, hora: l.hora, recorrencia: l.recorrencia });
  }

  function cancelar() {
    setForm(null);
    setEditandoId(null);
  }

  function salvar() {
    if (!form || !form.titulo.trim()) return;
    const store = getDataStore();
    if (editandoId) {
      store.updateLembrete({ id: editandoId, ...form });
    } else {
      store.addLembrete(form);
    }
    cancelar();
    recarregar();
  }

  function excluir(id: string) {
    getDataStore().removeLembrete(id);
    recarregar();
  }

  return (
    <main>
      <header className="flex items-center gap-3 rounded-b-3xl bg-gradient-to-br from-teal-600 to-teal-700 px-5 pb-6 pt-6 text-white">
        <Link href="/" aria-label="Voltar para o início" className="text-2xl">
          ←
        </Link>
        <h1 className="text-2xl font-bold">Meus Lembretes</h1>
      </header>

      <div className="space-y-4 px-5 py-6">
        <button
          type="button"
          onClick={abrirNovo}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-teal-700 py-4 text-xl font-bold text-white hover:bg-teal-800"
        >
          <span aria-hidden>＋</span> Adicionar Lembrete
        </button>

        {form && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              salvar();
            }}
            className="space-y-3 rounded-2xl bg-white p-4 shadow-sm"
          >
            <h2 className="text-lg font-bold">
              {editandoId ? "Editar lembrete" : "Novo lembrete"}
            </h2>
            <label className="block">
              <span className="text-sm font-medium text-zinc-700">Título</span>
              <input
                value={form.titulo}
                onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2 text-lg"
                placeholder="Ex.: Tomar remédio"
                required
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-zinc-700">Horário</span>
              <input
                type="time"
                value={form.hora}
                onChange={(e) => setForm({ ...form, hora: e.target.value })}
                className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2 text-lg"
                required
              />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-zinc-700">Recorrência</span>
              <select
                value={form.recorrencia}
                onChange={(e) =>
                  setForm({ ...form, recorrencia: e.target.value as Recorrencia })
                }
                className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2 text-lg"
              >
                {RECORRENCIAS.map((r) => (
                  <option key={r} value={r}>
                    {RECORRENCIA_LABEL[r]}
                  </option>
                ))}
              </select>
            </label>
            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                className="flex-1 rounded-xl bg-teal-700 py-3 font-bold text-white hover:bg-teal-800"
              >
                Salvar
              </button>
              <button
                type="button"
                onClick={cancelar}
                className="flex-1 rounded-xl bg-zinc-100 py-3 font-bold text-zinc-700 hover:bg-zinc-200"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}

        {lembretes.map((l) => (
          <LembreteCard
            key={l.id}
            lembrete={l}
            onEditar={() => abrirEdicao(l)}
            onExcluir={() => excluir(l.id)}
          />
        ))}
      </div>
    </main>
  );
}
