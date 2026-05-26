import type { DiaAtividade } from "@/lib/rotina";

interface GraficoAtividadeProps {
  dados: DiaAtividade[];
  media: number;
}

/** Gráfico de barras da atividade semanal, com resumo textual acessível. */
export function GraficoAtividade({ dados, media }: GraficoAtividadeProps) {
  return (
    <div>
      <div
        className="flex items-end justify-between gap-1"
        style={{ height: 140 }}
        role="img"
        aria-label={`Atividade semanal. Média de ${media} por cento. ${dados
          .map((d) => `${d.dia} ${d.percentual}%`)
          .join(", ")}.`}
      >
        {dados.map((d) => (
          <div
            key={d.dia}
            className="flex flex-1 flex-col items-center justify-end gap-1"
          >
            <span className="text-[11px] font-bold text-zinc-700">
              {d.percentual}%
            </span>
            <div
              className="w-full max-w-8 rounded-t bg-teal-600"
              style={{ height: Math.max(4, d.percentual * 1.1) }}
              aria-hidden
            />
            <span className="text-[11px] text-zinc-500">{d.dia}</span>
          </div>
        ))}
      </div>
      <p className="mt-3 text-center text-sm text-zinc-600">
        Média de atividade: <strong className="text-zinc-900">{media}%</strong>
      </p>
    </div>
  );
}
