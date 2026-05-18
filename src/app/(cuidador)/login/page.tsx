"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { temSupabase } from "@/lib/supabase/config";

export default function LoginPage() {
  const router = useRouter();
  const [modo, setModo] = useState<"entrar" | "cadastrar">("entrar");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function enviar(e: FormEvent) {
    e.preventDefault();
    const supabase = getSupabaseBrowser();
    if (!supabase) return;
    setCarregando(true);
    setMsg(null);
    const resultado =
      modo === "entrar"
        ? await supabase.auth.signInWithPassword({ email, password: senha })
        : await supabase.auth.signUp({ email, password: senha });
    setCarregando(false);
    if (resultado.error) {
      setMsg(resultado.error.message);
      return;
    }
    router.push("/");
  }

  return (
    <main className="mx-auto min-h-dvh max-w-md px-5 py-10">
      <Link href="/" className="text-blue-700">
        ← Início
      </Link>
      <h1 className="mt-4 text-2xl font-bold text-zinc-900">
        {modo === "entrar" ? "Entrar" : "Criar conta"} — Apoio Vivo
      </h1>
      <p className="mt-1 text-sm text-zinc-600">
        Conta deste dispositivo. Use na primeira configuração; depois o aparelho
        fica pronto para a pessoa assistida.
      </p>

      {!temSupabase() ? (
        <div className="mt-6 rounded-2xl bg-amber-50 p-4 text-amber-900">
          <p className="font-bold">Backend não configurado</p>
          <p className="mt-1 text-sm">
            Crie um projeto no Supabase e preencha o <code>.env.local</code> (veja{" "}
            <code>.env.example</code>) para ativar o login e o envio de alertas.
            Enquanto isso, o app funciona em modo local.
          </p>
        </div>
      ) : (
        <form
          onSubmit={enviar}
          className="mt-6 space-y-3 rounded-2xl bg-white p-4 shadow-sm"
        >
          <label className="block">
            <span className="text-sm font-medium text-zinc-700">E-mail</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2 text-lg"
            />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-zinc-700">Senha</span>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              minLength={6}
              className="mt-1 w-full rounded-xl border border-zinc-300 px-3 py-2 text-lg"
            />
          </label>
          <button
            type="submit"
            disabled={carregando}
            className="w-full rounded-xl bg-blue-700 py-3 font-bold text-white hover:bg-blue-800 disabled:opacity-60"
          >
            {carregando ? "Aguarde…" : modo === "entrar" ? "Entrar" : "Criar conta"}
          </button>
          {msg && (
            <p role="status" className="text-center text-sm text-red-600">
              {msg}
            </p>
          )}
          <button
            type="button"
            onClick={() => setModo(modo === "entrar" ? "cadastrar" : "entrar")}
            className="w-full text-center text-sm text-blue-700"
          >
            {modo === "entrar"
              ? "Não tem conta? Criar conta"
              : "Já tem conta? Entrar"}
          </button>
        </form>
      )}
    </main>
  );
}
