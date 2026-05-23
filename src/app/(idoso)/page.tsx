import Link from "next/link";
import { BotaoGrande } from "@/components/botao-grande";
import { AltoContrasteToggle } from "@/components/alto-contraste-toggle";
import { ProximoLembrete } from "@/components/proximo-lembrete";
import { ComandoVoz } from "@/components/comando-voz";
import { AssistenteConversa } from "@/components/assistente-conversa";
import { CabecalhoInicio } from "@/components/cabecalho-inicio";

export default function Inicio() {
  return (
    <main className="space-y-4 px-5 py-6">
      <header className="rounded-3xl bg-gradient-to-br from-teal-600 to-teal-700 px-6 pb-7 pt-6 text-white">
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

      <div className="flex items-center gap-3 rounded-2xl bg-teal-600 px-5 py-4 text-white">
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

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <BotaoGrande href="/lembretes" label="Lembretes" icon="🔔" variante="teal" />
        <BotaoGrande href="/monitoramento" label="Câmera" icon="📷" variante="teal" />
        <BotaoGrande href="/historico" label="Histórico" icon="🕐" variante="neutro" />
      </div>

      <BotaoGrande
        href="/emergencia"
        label="Emergência"
        icon="📞"
        variante="emergencia"
      />

      <ProximoLembrete />
    </main>
  );
}
