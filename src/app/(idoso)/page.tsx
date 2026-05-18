import Link from "next/link";
import { BotaoGrande } from "@/components/botao-grande";
import { AltoContrasteToggle } from "@/components/alto-contraste-toggle";
import { ProximoLembrete } from "@/components/proximo-lembrete";
import { ComandoVoz } from "@/components/comando-voz";
import { AssistenteConversa } from "@/components/assistente-conversa";
import { CabecalhoInicio } from "@/components/cabecalho-inicio";

export default function Inicio() {
  return (
    <main>
      <header className="rounded-b-3xl bg-blue-800 px-6 pb-8 pt-7 text-white">
        <div className="flex items-start justify-between gap-3">
          <CabecalhoInicio />
          <div className="flex items-center gap-1">
            <AltoContrasteToggle />
            <Link
              href="/configurar"
              aria-label="Configurações"
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-xl hover:bg-white/25"
            >
              ⚙️
            </Link>
          </div>
        </div>
      </header>

      <div className="space-y-4 px-5 py-6">
        <div className="flex items-center gap-3 rounded-2xl bg-green-600 px-5 py-4 text-white">
          <span aria-hidden className="text-2xl">
            ✓
          </span>
          <div>
            <p className="text-xl font-bold">Tudo bem!</p>
            <p className="text-sm opacity-90">Estou aqui com você</p>
          </div>
        </div>

        <AssistenteConversa />
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
