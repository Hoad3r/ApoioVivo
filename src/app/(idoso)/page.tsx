import { BotaoGrande } from "@/components/botao-grande";

function saudacao(d = new Date()): string {
  const h = d.getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

export default function Inicio() {
  // O nome virá da camada de dados (seed) na próxima etapa.
  const nome = "Maria";

  return (
    <main>
      <header className="rounded-b-3xl bg-blue-800 px-6 pb-8 pt-7 text-white">
        <p className="text-lg">{saudacao()},</p>
        <p className="text-3xl font-bold">{nome}</p>
      </header>

      <div className="space-y-4 px-5 py-6">
        <div className="flex items-center gap-3 rounded-2xl bg-green-600 px-5 py-4 text-white">
          <span aria-hidden className="text-2xl">
            ✓
          </span>
          <div>
            <p className="text-xl font-bold">Tudo bem!</p>
            <p className="text-sm opacity-90">Monitoramento ativo</p>
          </div>
        </div>

        <BotaoGrande href="/lembretes" label="Lembretes" icon="🔔" variante="azul" />
        <BotaoGrande
          href="/emergencia"
          label="Emergência"
          icon="📞"
          variante="vermelho"
        />
        <BotaoGrande href="/historico" label="Histórico" icon="🕐" variante="neutro" />

        <div className="rounded-2xl bg-zinc-100 px-5 py-4 text-center">
          <p className="text-zinc-600">
            Próximo lembrete às <strong className="text-zinc-900">14:00</strong>
          </p>
          <p className="text-zinc-600">Tomar remédio para pressão</p>
        </div>
      </div>
    </main>
  );
}
