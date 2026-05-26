import { criarReconhecimento, type ReconhecimentoVoz } from "@/lib/speech";

type AoOuvir = (texto: string) => void;

/**
 * Mantém o reconhecimento de voz ligado continuamente, religando sozinho a
 * cada frase. Sem palavra de ativação: tudo o que é ouvido é entregue ao
 * callback, que decide se vira comando.
 */
export class EscutaContinua {
  private reco: ReconhecimentoVoz | null = null;
  private ligado = false;

  constructor(
    private aoOuvir: AoOuvir,
    private aoMudarEstado?: (ligado: boolean) => void,
  ) {}

  suportado(): boolean {
    return criarReconhecimento() !== null;
  }

  ativo(): boolean {
    return this.ligado;
  }

  iniciar(): void {
    if (this.ligado) return;
    this.ligado = true;
    this.aoMudarEstado?.(true);
    this.abrir();
  }

  parar(): void {
    this.ligado = false;
    this.aoMudarEstado?.(false);
    try {
      this.reco?.stop();
    } catch {
      /* ignora */
    }
    this.reco = null;
  }

  private abrir(): void {
    if (!this.ligado || this.reco) return;
    const reco = criarReconhecimento();
    if (!reco) return;
    this.reco = reco;
    reco.onresult = (e) => {
      const texto = (e.results[0]?.[0]?.transcript ?? "").trim();
      if (texto) this.aoOuvir(texto);
    };
    reco.onerror = () => {
      /* a escuta religa no onend */
    };
    reco.onend = () => {
      this.reco = null;
      if (this.ligado) setTimeout(() => this.abrir(), 300);
    };
    try {
      reco.start();
    } catch {
      this.reco = null;
      setTimeout(() => this.abrir(), 600);
    }
  }
}
