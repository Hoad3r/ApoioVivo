"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listarCuidadores, type Cuidador } from "@/lib/supabase/cuidadores";
import { linkLigacao, linkWhatsApp } from "@/lib/contato";

/**
 * "Falar com a família": atalho de toque (acessível) para ligar ou chamar no
 * WhatsApp os contatos cadastrados. Complementa o comando de voz mãos livres.
 */
export default function FamiliaPage() {
  const [lista, setLista] = useState<Cuidador[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);

  useEffect(() => {
    let ativo = true;
    listarCuidadores()
      .then((cs) => {
        if (ativo) setLista(cs);
      })
      .catch(() => {
        if (ativo) setErro(true);
      })
      .finally(() => {
        if (ativo) setCarregando(false);
      });
    return () => {
      ativo = false;
    };
  }, []);

  return (
    <main>
      <header className="flex items-center gap-3 rounded-b-3xl bg-gradient-to-br from-teal-600 to-teal-700 px-5 pb-6 pt-6 text-white">
        <Link href="/" aria-label="Voltar para o início" className="text-2xl">
          ←
        </Link>
        <h1 className="text-2xl font-bold">Falar com a família</h1>
      </header>

      <div className="space-y-4 px-5 py-6">
        {carregando ? (
          <p className="py-10 text-center text-zinc-500">Carregando contatos…</p>
        ) : lista.length === 0 ? (
          <div className="rounded-2xl bg-white p-6 text-center shadow-sm">
            <p className="text-lg text-zinc-700">
              Nenhum contato cadastrado ainda.
            </p>
            <p className="mt-1 text-sm text-zinc-500">
              Peça para um familiar se cadastrar nas configurações.
            </p>
          </div>
        ) : (
          lista.map((c) => (
            <section key={c.id} className="rounded-3xl bg-white p-5 shadow-sm">
              <p className="text-2xl font-bold text-zinc-900">
                {c.nome}
                {c.parentesco && (
                  <span className="ml-2 text-lg font-normal text-zinc-500">
                    ({c.parentesco})
                  </span>
                )}
              </p>
              {c.telefone ? (
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <a
                    href={linkLigacao(c.telefone)}
                    className="flex min-h-16 items-center justify-center gap-2 rounded-2xl bg-teal-700 text-xl font-bold text-white hover:bg-teal-800"
                  >
                    <span aria-hidden>📞</span> Ligar
                  </a>
                  <a
                    href={linkWhatsApp(c.telefone)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex min-h-16 items-center justify-center gap-2 rounded-2xl bg-green-600 text-xl font-bold text-white hover:bg-green-700"
                  >
                    <span aria-hidden>💬</span> WhatsApp
                  </a>
                </div>
              ) : (
                <p className="mt-3 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  Sem telefone cadastrado — este contato só recebe e-mail.
                </p>
              )}
            </section>
          ))
        )}
        {erro && (
          <p className="text-center text-sm text-red-600">
            Não foi possível carregar os contatos.
          </p>
        )}
      </div>
    </main>
  );
}
