import { BotaoGrande } from "@/components/botao-grande";
import { AltoContrasteToggle } from "@/components/alto-contraste-toggle";
import { ProximoLembrete } from "@/components/proximo-lembrete";
import { ComandoVoz } from "@/components/comando-voz";

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
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-lg sm:text-xl">{saudacao()},</p>
            <p className="text-3xl font-bold sm:text-4xl">{nome}</p>
          </div>
          <AltoContrasteToggle />
        </div>
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

        <ComandoVoz />

        <BotaoGrande href="/lembretes" label="Lembretes" icon="🔔" variante="azul" />
        <BotaoGrande
          href="/emergencia"
          label="Emergência"
          icon="📞"
          variante="vermelho"
        />
        <BotaoGrande
          href="/monitoramento"
          label="Monitoramento"
          icon="📷"
          variante="azul"
        />
        <BotaoGrande href="/historico" label="Histórico" icon="🕐" variante="neutro" />

        <ProximoLembrete />
      </div>
    </main>
  );
}
