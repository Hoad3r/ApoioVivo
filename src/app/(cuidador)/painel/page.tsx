"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Evento, TipoEvento, Usuario } from "@/lib/types";
import { getDataStore } from "@/lib/data";
import {
  detectarAnomaliaAprendida,
  horasAtivas,
  mediaAtividade,
  resumoAtividadeSemanal,
  type DiaAtividade,
  type ResultadoAnomalia,
} from "@/lib/rotina";
import { GraficoAtividade } from "@/components/grafico-atividade";
import { pedirPermissaoNotificacao } from "@/lib/notificacao";
import { carregarPerfil, type PerfilIdoso } from "@/lib/idoso/perfil";

const ESTILO_ALERTA: Record<TipoEvento, { cor: string; icone: string; titulo: string }> = {
  atividade: { cor: "bg-green-600", icone: "💚", titulo: "Atividade Normal" },
  "lembrete-ignorado": { cor: "bg-amber-500", icone: "⚠️", titulo: "Lembrete Ignorado" },
  queda: { cor: "bg-red-600", icone: "🚨", titulo: "Queda Detectada" },
  emergencia: { cor: "bg-red-600", icone: "📞", titulo: "Emergência Acionada" },
  objeto: { cor: "bg-blue-600", icone: "📦", titulo: "Objeto Reconhecido" },
};

function formatar(criadoEm: string): string {
  return new Date(criadoEm).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function PainelCuidadorPage() {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [perfil, setPerfil] = useState<PerfilIdoso | null>(null);
  const [dados, setDados] = useState<DiaAtividade[]>([]);
  const [media, setMedia] = useState(0);
  const [alertas, setAlertas] = useState<Evento[]>([]);
  const [anomalia, setAnomalia] = useState<ResultadoAnomalia>({
    anomalia: false,
    motivo: null,
  });
  const [rotina, setRotina] = useState<string | null>(null);
  const [notifMsg, setNotifMsg] = useState<string | null>(null);

  async function ativarNotificacoes() {
    const ok = await pedirPermissaoNotificacao();
    setNotifMsg(
      ok
        ? "✓ Notificações ativadas. Você será avisado de quedas e emergências."
        : "Não foi possível ativar as notificações neste navegador.",
    );
  }

  useEffect(() => {
    const store = getDataStore();
    const eventos = store.listEventos();
    setUsuario(store.getUsuario());
    carregarPerfil().then(setPerfil);
    const resumo = resumoAtividadeSemanal(eventos);
    setDados(resumo);
    setMedia(mediaAtividade(resumo));
    setAnomalia(detectarAnomaliaAprendida(eventos));
    const ativas = [...horasAtivas(eventos)].sort((a, b) => a - b);
    setRotina(
      ativas.length ? `${ativas[0]}h–${ativas[ativas.length - 1]}h` : null,
    );

    const ultimaAtividade = eventos.find((e) => e.tipo === "atividade");
    const naoAtividade = eventos.filter((e) => e.tipo !== "atividade");
    const lista = ultimaAtividade
      ? [ultimaAtividade, ...naoAtividade]
      : naoAtividade;
    setAlertas(lista.slice(0, 5));
  }, []);

  return (
    <div className="mx-auto min-h-dvh w-full max-w-md bg-zinc-50 shadow-sm sm:max-w-lg">
      <header className="flex items-center gap-3 rounded-b-3xl bg-blue-800 px-5 pb-6 pt-6 text-white">
        <Link href="/" aria-label="Voltar para o início" className="text-2xl">
          ←
        </Link>
        <div>
          <p className="text-sm opacity-90">Monitorando</p>
          <h1 className="text-2xl font-bold">Painel do Cuidador</h1>
        </div>
      </header>

      <div className="space-y-4 px-5 py-6">
        {usuario && (
          <div className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm">
            <span
              aria-hidden
              className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-700 text-2xl text-white"
            >
              👤
            </span>
            <div>
              <p className="text-lg font-bold text-zinc-900">
                {perfil?.nome || usuario.nome || "Pessoa assistida"}
              </p>
              <p className="text-sm text-zinc-500">
                {(perfil?.idade ?? (usuario.idade || null)) != null && (
                  <>{perfil?.idade ?? usuario.idade} anos · </>
                )}
                <span className="font-medium text-green-600">● Online agora</span>
              </p>
            </div>
          </div>
        )}

        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <button
            type="button"
            onClick={ativarNotificacoes}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 py-3 font-bold text-white hover:bg-blue-800"
          >
            <span aria-hidden>🔔</span> Ativar notificações no dispositivo
          </button>
          {notifMsg && (
            <p
              role="status"
              aria-live="polite"
              className="mt-2 text-center text-sm text-zinc-600"
            >
              {notifMsg}
            </p>
          )}
        </div>

        {anomalia.anomalia && (
          <div
            role="alert"
            className="rounded-2xl border-l-4 border-red-500 bg-red-50 p-4 text-red-800"
          >
            <p className="font-bold">⚠️ Atenção</p>
            <p className="text-sm">{anomalia.motivo}</p>
          </div>
        )}

        <section className="rounded-2xl bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-lg font-bold text-zinc-900">
            <span aria-hidden>📊</span> Atividade Semanal
          </h2>
          <GraficoAtividade dados={dados} media={media} />
        </section>

        <section className="rounded-2xl bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-lg font-bold text-zinc-900">
            <span aria-hidden>🔔</span> Alertas Recentes
          </h2>
          <ul className="space-y-3">
            {alertas.map((e) => {
              const estilo = ESTILO_ALERTA[e.tipo];
              return (
                <li
                  key={e.id}
                  className="flex items-start gap-3 rounded-xl border border-zinc-100 p-3"
                >
                  <span
                    aria-hidden
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-lg text-white ${estilo.cor}`}
                  >
                    {estilo.icone}
                  </span>
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 font-bold text-zinc-900">
                      {estilo.titulo}
                      {e.urgente && (
                        <span className="rounded bg-red-100 px-1.5 py-0.5 text-[10px] font-bold text-red-700">
                          URGENTE
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-zinc-600">{e.descricao}</p>
                    <p className="text-xs text-zinc-400">{formatar(e.criadoEm)}</p>
                  </div>
                </li>
              );
            })}
            {alertas.length === 0 && (
              <li className="py-4 text-center text-zinc-500">
                Nenhum alerta no momento.
              </li>
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}
