"use client";

import dynamic from "next/dynamic";
import Link from "next/link";

const MonitorCamera = dynamic(
  () => import("@/components/monitor-camera").then((m) => m.MonitorCamera),
  {
    ssr: false,
    loading: () => (
      <p className="py-10 text-center text-zinc-500">
        Carregando módulo de visão computacional…
      </p>
    ),
  },
);

export default function MonitoramentoPage() {
  return (
    <main>
      <header className="flex items-center gap-3 rounded-b-3xl bg-blue-800 px-5 pb-6 pt-6 text-white">
        <Link href="/" aria-label="Voltar para o início" className="text-2xl">
          ←
        </Link>
        <h1 className="text-2xl font-bold">Monitoramento</h1>
      </header>
      <div className="px-5 py-6">
        <MonitorCamera />
      </div>
    </main>
  );
}
