"use client";

import dynamic from "next/dynamic";
import Link from "next/link";

const CadastroRosto = dynamic(
  () => import("@/components/cadastro-rosto").then((m) => m.CadastroRosto),
  {
    ssr: false,
    loading: () => (
      <p className="py-10 text-center text-zinc-500">
        Carregando módulo de reconhecimento facial…
      </p>
    ),
  },
);

export default function RostosPage() {
  return (
    <main>
      <header className="flex items-center gap-3 rounded-b-3xl bg-blue-800 px-5 pb-6 pt-6 text-white">
        <Link href="/monitoramento" aria-label="Voltar" className="text-2xl">
          ←
        </Link>
        <h1 className="text-2xl font-bold">Cadastrar Rostos</h1>
      </header>
      <div className="px-5 py-6">
        <p className="mb-4 text-zinc-600">
          Cadastre o rosto do idoso e dos cuidadores para o sistema saudar cada
          pessoa pelo nome ao reconhecê-la na câmera.
        </p>
        <CadastroRosto />
      </div>
    </main>
  );
}
