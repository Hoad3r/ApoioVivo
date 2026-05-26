"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { EscutaContinua } from "@/lib/escuta-continua";
import { falar } from "@/lib/voice";
import { interpretar, responder } from "@/lib/dialogo";
import {
  interpretarComandoLembrete,
  extrairMinutosAFrente,
  querCriarLembrete,
  tituloLembrete,
} from "@/lib/comando-lembrete";
import { querCadastrarCuidador } from "@/lib/comando-cuidador";
import { responderOndeEsta, lerMemoria } from "@/lib/vision/memoria-objetos";
import {
  interpretarComandoContato,
  acharContato,
  linkLigacao,
  linkWhatsApp,
  type ComandoContato,
} from "@/lib/contato";
import { listarCuidadores } from "@/lib/supabase/cuidadores";
import { minutosBrasilia, minutosParaHHMM } from "@/lib/hora";
import { notificarCuidador } from "@/lib/notificacao";
import { enviarAlertaEmail } from "@/lib/alertar";
import { getDataStore } from "@/lib/data";

const CHAVE = "apoio-vivo:maos-livres";
const ROTAS: { palavras: string[]; rota: string; nome: string }[] = [
  { palavras: ["lembrete"], rota: "/lembretes", nome: "Lembretes" },
  {
    palavras: ["emergência", "emergencia", "ajuda", "socorro"],
    rota: "/emergencia",
    nome: "Emergência",
  },
  {
    palavras: ["câmera", "camera", "monitor"],
    rota: "/monitoramento",
    nome: "Monitoramento",
  },
  { palavras: ["família", "familia", "contato"], rota: "/familia", nome: "Família" },
  { palavras: ["histórico", "historico"], rota: "/historico", nome: "Histórico" },
  { palavras: ["início", "inicio", "casa"], rota: "/", nome: "Início" },
];

/**
 * Assistente mãos livres: escuta contínua, SEM palavra de ativação. Tudo o que
 * é ouvido é tratado como possível comando (ligar, lembrete, navegar, "cadê meu
 * X", bem-estar). Ignora a própria fala do app para não se ouvir. Um toque
 * inicial libera o microfone; depois é só falar.
 */
export function AssistenteMaosLivres() {
  const router = useRouter();
  const [ligado, setLigado] = useState(false);
  const [legenda, setLegenda] = useState<string | null>(null);
  const escutaRef = useRef<EscutaContinua | null>(null);
  const falandoRef = useRef(false);
  const timerFalaRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const ultimoNada = useRef(0);
  const pendenteLembrete = useRef<string | null>(null);

  function criarLembrete(titulo: string, minutosAFrente: number) {
    const hora = minutosParaHHMM(minutosBrasilia() + minutosAFrente);
    getDataStore().addLembrete({ titulo, hora, recorrencia: "unico" });
    dizer(`Combinado! Vou te lembrar de ${titulo.toLowerCase()} às ${hora}.`);
  }

  function dizer(texto: string) {
    // Enquanto o app fala, ignoramos o que o microfone captar (a própria voz).
    falandoRef.current = true;
    setLegenda(`🔊 ${texto}`);
    // Segurança: se o fim da fala não disparar, libera a escuta mesmo assim.
    const limite = Math.min(15000, 2500 + texto.length * 90);
    if (timerFalaRef.current) clearTimeout(timerFalaRef.current);
    timerFalaRef.current = setTimeout(() => {
      falandoRef.current = false;
    }, limite);
    falar(texto, {
      urgente: true,
      aoTerminar: () => {
        if (timerFalaRef.current) clearTimeout(timerFalaRef.current);
        // pequeno atraso para não captar o eco final da própria fala
        setTimeout(() => {
          falandoRef.current = false;
        }, 300);
      },
    });
  }

  function pedirAjuda() {
    getDataStore().addEvento({
      tipo: "emergencia",
      descricao: "Pedido de ajuda por voz (mãos livres)",
      urgente: true,
    });
    notificarCuidador(
      "Apoio Vivo — Pedido de ajuda",
      "A pessoa pediu ajuda por voz.",
    );
    enviarAlertaEmail(
      "Pedido de ajuda",
      "A pessoa pediu ajuda por voz (assistente mãos livres).",
    );
  }

  async function tratarContato(cmd: ComandoContato) {
    let lista: Awaited<ReturnType<typeof listarCuidadores>> = [];
    try {
      lista = await listarCuidadores();
    } catch {
      /* sem backend: lista vazia */
    }
    const c = acharContato(cmd.alvo, lista);
    if (!c) {
      dizer(`Não encontrei ${cmd.alvo} nos seus contatos.`);
      return;
    }
    if (!c.telefone) {
      dizer(`Não tenho o telefone de ${c.nome}. Peça para cadastrarem.`);
      return;
    }
    if (cmd.acao === "whatsapp") {
      dizer(`Abrindo o WhatsApp de ${c.nome}.`);
      window.open(linkWhatsApp(c.telefone), "_blank");
    } else {
      dizer(`Ligando para ${c.nome}.`);
      window.location.href = linkLigacao(c.telefone);
    }
  }

  function tratar(texto: string) {
    if (falandoRef.current) return; // ignora a própria fala do app
    const comando = texto.trim();
    if (!comando) return;
    setLegenda(`💬 "${comando}"`);

    // 0) resposta do horário de um lembrete que ficou pendente
    if (pendenteLembrete.current) {
      const min = extrairMinutosAFrente(comando);
      if (min != null) {
        const titulo = pendenteLembrete.current;
        pendenteLembrete.current = null;
        criarLembrete(titulo, min);
        return;
      }
      pendenteLembrete.current = null; // não disse horário: segue o fluxo normal
    }

    // 1) "cadê meu X?"
    const ondeEsta = responderOndeEsta(comando, lerMemoria());
    if (ondeEsta) {
      dizer(ondeEsta);
      return;
    }

    // 2) ligar / WhatsApp para um contato
    const contato = interpretarComandoContato(comando);
    if (contato) {
      void tratarContato(contato);
      return;
    }

    // 3) criar lembrete por voz (com horário) — ANTES da navegação
    const lem = interpretarComandoLembrete(comando);
    if (lem) {
      criarLembrete(lem.titulo, lem.minutosAFrente);
      return;
    }
    // 3b) quis criar um lembrete mas não disse o horário: pergunta (não navega)
    if (querCriarLembrete(comando)) {
      pendenteLembrete.current = tituloLembrete(comando);
      dizer("Para quando devo marcar? Diga, por exemplo, daqui a 10 minutos.");
      return;
    }

    // 4) cadastrar cuidador
    if (querCadastrarCuidador(comando)) {
      dizer("Vamos cadastrar um cuidador.");
      router.push("/cuidadores?voz=1");
      return;
    }

    // 5) navegação
    const t = comando.toLowerCase();
    const rota = ROTAS.find((r) => r.palavras.some((p) => t.includes(p)));
    if (rota) {
      dizer(`Abrindo ${rota.nome}.`);
      router.push(rota.rota);
      return;
    }

    // 6) bem-estar / ajuda (intenções claras)
    const intencao = interpretar(comando);
    if (intencao === "ajuda") {
      pedirAjuda();
      dizer(responder("ajuda"));
      return;
    }
    if (intencao === "positivo" || intencao === "negativo") {
      dizer(responder(intencao));
      return;
    }

    // 7) não reconheceu: responde com moderação (não fica interrompendo).
    const agora = Date.now();
    if (agora - ultimoNada.current > 8000) {
      ultimoNada.current = agora;
      dizer("Desculpe, não entendi. Pode repetir?");
    }
  }

  useEffect(() => {
    const esc = new EscutaContinua(
      (texto) => tratar(texto),
      (on) => setLigado(on),
    );
    escutaRef.current = esc;
    const habilitado = () =>
      esc.suportado() && localStorage.getItem(CHAVE) === "1";
    if (habilitado() && !document.hidden) esc.iniciar();

    // Só ouve com o app visível: para ao sair/bloquear, retoma ao voltar.
    const onVisibilidade = () => {
      if (document.hidden) esc.parar();
      else if (habilitado()) esc.iniciar();
    };
    document.addEventListener("visibilitychange", onVisibilidade);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilidade);
      esc.parar();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function alternar() {
    const esc = escutaRef.current;
    if (!esc) return;
    if (!esc.suportado()) {
      setLegenda("Seu navegador não permite escuta por voz.");
      return;
    }
    if (ligado) {
      esc.parar();
      localStorage.removeItem(CHAVE);
      setLegenda(null);
    } else {
      esc.iniciar();
      localStorage.setItem(CHAVE, "1");
      dizer("Pronto, pode falar comigo.");
    }
  }

  return (
    // Flutua acima da barra de navegação, sem empurrar o cabeçalho das telas.
    <div className="fixed inset-x-0 bottom-20 z-20 px-3 lg:bottom-4 lg:left-64">
      <div className="mx-auto w-full max-w-md rounded-2xl border border-zinc-200 bg-white/95 p-2 shadow-lg backdrop-blur sm:max-w-lg lg:max-w-3xl">
        <button
          type="button"
          onClick={alternar}
          className={`flex w-full items-center justify-center gap-2 rounded-xl border py-2.5 text-base font-bold ${
            ligado
              ? "border-teal-300 bg-teal-50 text-teal-700"
              : "border-zinc-300 bg-white text-zinc-700"
          }`}
          aria-pressed={ligado}
        >
          <span aria-hidden>{ligado ? "🟢" : "🎤"}</span>
          {ligado
            ? "Ouvindo você — é só falar"
            : "Ativar assistente (mãos livres)"}
        </button>
        {legenda && (
          <p
            role="status"
            aria-live="polite"
            className="mt-1 truncate text-center text-sm text-zinc-600"
          >
            {legenda}
          </p>
        )}
      </div>
    </div>
  );
}
