"use client";

import { useState, type FormEvent } from "react";
import { useParams } from "next/navigation";

const FORM_VAZIO = { nome: "", parentesco: "", email: "", telefone: "" };

export default function ConvitePage() {
  const params = useParams<{ token: string }>();
  const token = params?.token ?? "";
  const [form, setForm] = useState(FORM_VAZIO);
  const [estado, setEstado] = useState<"form" | "enviando" | "ok">("form");
  const [erro, setErro] = useState<string | null>(null);

  async function enviar(e: FormEvent) {
    e.preventDefault();
    if (!form.nome.trim() || !form.email.trim() || !form.telefone.trim()) return;
    setEstado("enviando");
    setErro(null);
    try {
      const res = await fetch("/api/convite/aceitar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, ...form }),
      });
      const dados = (await res.json().catch(() => ({}))) as { erro?: string };
      if (!res.ok) {
        setErro(dados.erro ?? "Não foi possível concluir o cadastro.");
        setEstado("form");
        return;
      }
      setEstado("ok");
    } catch {
      setErro("Falha de conexão. Tente novamente.");
      setEstado("form");
    }
  }

  return (
    <main className="mx-auto min-h-dvh max-w-md px-5 py-10">
      <h1 className="text-2xl font-bold text-zinc-900">
        Convite — Apoio Vivo
      </h1>
      <p className="mt-1 text-sm text-zinc-600">
        Você foi convidado para receber os alertas de cuidado. Preencha seus
        dados para confirmar.
      </p>

      {estado === "ok" ? (
        <div className="mt-6 rounded-2xl bg-teal-50 p-5 text-teal-800">
          <p className="text-lg font-bold">✓ Cadastro concluído!</p>
          <p className="mt-1 text-sm">
            Você passará a receber por e-mail os alertas (queda, emergência e
            anomalias). Pode fechar esta página.
          </p>
        </div>
      ) : (
        <form
          onSubmit={enviar}
          className="mt-6 space-y-3 rounded-2xl bg-white p-4 shadow-sm"
        >
          <input
            value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
            placeholder="Seu nome"
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
            placeholder="Seu e-mail (recebe os alertas)"
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
            disabled={estado === "enviando"}
            className="w-full rounded-xl bg-teal-700 py-3 font-bold text-white hover:bg-teal-800 disabled:opacity-60"
          >
            {estado === "enviando" ? "Enviando…" : "Confirmar cadastro"}
          </button>
          {erro && (
            <p role="status" className="text-center text-sm text-red-600">
              {erro}
            </p>
          )}
        </form>
      )}
    </main>
  );
}
