"use client";

import { useEffect, useRef, useState } from "react";
import { detectarObjetos, type Predicao } from "@/lib/vision/objetos";
import { detectarPose } from "@/lib/vision/pose";
import { diagnosticarQueda, type DiagnosticoQueda } from "@/lib/vision/queda";
import type { Keypoint } from "@/lib/vision/queda";
import {
  detectarQuedaMovimento,
  type QuadroPose,
} from "@/lib/vision/queda-movimento";
import { traduzir } from "@/lib/vision/traducoes";
import { infoObjetoEssencial } from "@/lib/vision/objetos-essenciais";
import { detectarAmbiente } from "@/lib/vision/ambiente";
import { falar } from "@/lib/voice";
import { frase, saudacoes } from "@/lib/frases";
import { horaBrasilia } from "@/lib/hora";
import { nomeDaPessoa } from "@/lib/pessoa";
import { notificarCuidador } from "@/lib/notificacao";
import { enviarAlertaEmail } from "@/lib/alertar";
import { descritorDe } from "@/lib/face/face-api";
import { identificar, listarRostos } from "@/lib/face/registro";
import { getDataStore } from "@/lib/data";

const LIMIAR = 0.6;
const FRAMES_PARA_QUEDA = 2;
const DEBOUNCE_QUEDA_MS = 15000;

export function MonitorCamera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ultimoFalado = useRef("");
  const ultimaQueda = useRef(0);
  const framesQueda = useRef(0);
  const registrarQuedaRef = useRef<(origem: "real" | "simulada") => void>(
    () => {},
  );
  const saudou = useRef(false);
  const alertouCozinha = useRef(false);
  const historico = useRef<QuadroPose[]>([]);
  const ultimoCentro = useRef({ cx: 0.5, cy: 0.5, alturaRel: 0.6 });
  const debugRef = useRef(false);
  const [debug, setDebug] = useState(false);
  const [diag, setDiag] = useState<
    | (DiagnosticoQueda & { frames: number; mov: boolean; cy: number })
    | null
  >(null);
  const [erroPose, setErroPose] = useState<string | null>(null);
  const [status, setStatus] = useState("Carregando modelos de IA…");
  const [objetos, setObjetos] = useState<string[]>([]);
  const [alertaQueda, setAlertaQueda] = useState(false);
  const [saudacaoFacial, setSaudacaoFacial] = useState<string | null>(null);
  const [infoObjeto, setInfoObjeto] = useState<string | null>(null);
  const [ambiente, setAmbiente] = useState<string | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let ativo = true;
    let timer: ReturnType<typeof setTimeout> | null = null;

    function registrarQueda(origem: "real" | "simulada") {
      const agora = Date.now();
      if (agora - ultimaQueda.current < DEBOUNCE_QUEDA_MS) return;
      ultimaQueda.current = agora;
      getDataStore().addEvento({
        tipo: "queda",
        descricao:
          origem === "simulada"
            ? "Queda simulada para demonstração"
            : "Queda detectada pela câmera",
        urgente: true,
      });
      falar(
        "Tudo bem? Parece que você caiu. Já avisei alguém para te ajudar.",
        { urgente: true },
      );
      const detalhe =
        origem === "simulada"
          ? "Queda simulada (demonstração)."
          : "Uma possível queda foi detectada pela câmera.";
      notificarCuidador("Apoio Vivo — Queda detectada", detalhe);
      enviarAlertaEmail("Queda detectada", detalhe);
      setAlertaQueda(true);
      setTimeout(() => setAlertaQueda(false), 6000);
    }
    registrarQuedaRef.current = registrarQueda;

    function desenhar(preds: Predicao[]) {
      const v = videoRef.current;
      const c = canvasRef.current;
      if (!v || !c) return;
      c.width = v.videoWidth;
      c.height = v.videoHeight;
      const ctx = c.getContext("2d");
      if (!ctx) return;
      ctx.clearRect(0, 0, c.width, c.height);
      ctx.lineWidth = 3;
      ctx.strokeStyle = "#1d4ed8";
      ctx.font = "18px sans-serif";
      for (const p of preds) {
        if (p.score < LIMIAR) continue;
        const [x, y, w, h] = p.bbox;
        ctx.strokeRect(x, y, w, h);
        const label = traduzir(p.class);
        const lw = ctx.measureText(label).width + 10;
        ctx.fillStyle = "#1d4ed8";
        ctx.fillRect(x, y - 24, lw, 24);
        ctx.fillStyle = "#ffffff";
        ctx.fillText(label, x + 5, y - 6);
      }
    }

    // Desenha os pontos do corpo que a IA enxergou (modo depuração).
    function desenharPose(keypoints: Keypoint[]) {
      const v = videoRef.current;
      const c = canvasRef.current;
      if (!v || !c) return;
      if (!c.width || !c.height) {
        c.width = v.videoWidth;
        c.height = v.videoHeight;
      }
      const ctx = c.getContext("2d");
      if (!ctx) return;
      const relevantes = new Set([
        "nose",
        "left_eye",
        "right_eye",
        "left_shoulder",
        "right_shoulder",
        "left_hip",
        "right_hip",
      ]);
      for (const k of keypoints) {
        const conf = k.score ?? 0;
        if (conf < 0.3) continue;
        const destaque = k.name ? relevantes.has(k.name) : false;
        ctx.beginPath();
        ctx.arc(k.x, k.y, destaque ? 7 : 4, 0, Math.PI * 2);
        ctx.fillStyle = destaque ? "#16a34a" : "#a3e635";
        ctx.fill();
      }
    }

    async function loop() {
      if (!ativo) return;
      const v = videoRef.current;
      if (v && v.readyState >= 2) {
        try {
          const preds = await detectarObjetos(v);
          if (!ativo) return;
          desenhar(preds);
          const validos = preds.filter((p) => p.score >= LIMIAR);
          const classes = validos.map((p) => p.class);
          // A própria pessoa não é um "objeto" — não mostra nem anuncia "pessoa".
          const objetosUteis = validos.filter((p) => p.class !== "person");
          setObjetos([
            ...new Set(objetosUteis.map((p) => traduzir(p.class))),
          ]);

          // Só fala quando há informação que de fato ajuda (remédio, telefone…).
          // Nada de narrar "isto é X" para cada coisa — isso é assistir, não vigiar.
          const principal = [...objetosUteis]
            .sort((a, b) => b.score - a.score)
            .find((p) => infoObjetoEssencial(p.class));
          if (principal && principal.class !== ultimoFalado.current) {
            ultimoFalado.current = principal.class;
            const info = infoObjetoEssencial(principal.class);
            if (info) {
              setInfoObjeto(info);
              falar(info);
            }
          }

          const amb = detectarAmbiente(classes);
          setAmbiente(amb);
          if (amb === "cozinha" && !alertouCozinha.current) {
            alertouCozinha.current = true;
            const nome = nomeDaPessoa();
            const hora = horaBrasilia();
            const almoco = hora >= 11 && hora <= 14;
            const msg = almoco
              ? `Olá, ${nome}! Você está na cozinha e já passa do meio-dia. É uma ótima hora para almoçar. Lembre-se de beber água também.`
              : `Olá, ${nome}! Você está na cozinha. Lembre-se de se alimentar bem e beber água.`;
            setInfoObjeto(msg);
            falar(msg);
          }
        } catch {
          /* frame de objeto com erro: ignora */
        }

        try {
          const keypoints = await detectarPose(v);
          if (!ativo) return;
          const d = diagnosticarQueda(keypoints);

          // Resumo de posição do corpo (normalizado) para análise de movimento.
          const largura = v.videoWidth || 1;
          const altura = v.videoHeight || 1;
          const visiveis = keypoints.filter((k) => (k.score ?? 0) >= 0.3);
          const presente = visiveis.length >= 3;
          if (presente) {
            const xs = visiveis.map((k) => k.x);
            const ys = visiveis.map((k) => k.y);
            const minX = Math.min(...xs);
            const maxX = Math.max(...xs);
            const minY = Math.min(...ys);
            const maxY = Math.max(...ys);
            ultimoCentro.current = {
              cx: (minX + maxX) / 2 / largura,
              cy: (minY + maxY) / 2 / altura,
              alturaRel: (maxY - minY) / altura,
            };
          }
          historico.current.push({
            t: Date.now(),
            presente,
            ...ultimoCentro.current,
          });
          if (historico.current.length > 25) historico.current.shift();
          const quedaMov = detectarQuedaMovimento(historico.current);

          framesQueda.current = d.caiu ? framesQueda.current + 1 : 0;
          if (debugRef.current) {
            desenharPose(keypoints);
            setDiag({
              ...d,
              frames: framesQueda.current,
              mov: quedaMov,
              cy: ultimoCentro.current.cy,
            });
            setErroPose(null);
          }
          // Queda confirmada por movimento (instantâneo) OU pose horizontal sustentada.
          if (quedaMov || framesQueda.current >= FRAMES_PARA_QUEDA) {
            framesQueda.current = 0;
            registrarQueda("real");
          }

          if (!saudou.current) {
            const rostos = listarRostos();
            if (rostos.length > 0) {
              // Reconhecimento facial real: identifica quem está na câmera.
              const desc = await descritorDe(v);
              if (desc) {
                const reconhecido = identificar(desc, rostos);
                if (reconhecido) {
                  saudou.current = true;
                  const hora = horaBrasilia();
                  const saud =
                    reconhecido.papel === "idoso"
                      ? frase("saud-idoso", saudacoes(reconhecido.nome, hora))
                      : frase("saud-cuidador", [
                          `Olá, ${reconhecido.nome}! Bem-vindo.`,
                          `Oi, ${reconhecido.nome}! Que bom ter você aqui.`,
                        ]);
                  setSaudacaoFacial(`👋 ${saud}`);
                  falar(saud);
                }
              }
            } else {
              // Sem rostos cadastrados: saúda ao detectar a pessoa (via pose).
              const nariz = keypoints.find((k) => k.name === "nose");
              if (nariz && (nariz.score ?? 0) > 0.4) {
                saudou.current = true;
                const nome = nomeDaPessoa();
                const hora = horaBrasilia();
                const msg = frase("saud-pose", saudacoes(nome, hora));
                setSaudacaoFacial(`👋 ${msg}`);
                falar(msg);
              }
            }
          }
        } catch (e) {
          // Em depuração, mostra o erro em vez de engoli-lo silenciosamente.
          if (debugRef.current) {
            setErroPose(e instanceof Error ? e.message : String(e));
            console.error("Erro na detecção de pose/face:", e);
          }
        }
      }
      timer = setTimeout(loop, 800);
    }

    async function iniciar() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" },
          audio: false,
        });
        const v = videoRef.current;
        if (!v) return;
        v.srcObject = stream;
        await v.play();
        setStatus("Estou aqui com você 💙");
        loop();
      } catch {
        setStatus(
          "Não foi possível acessar a câmera. Permita o acesso e recarregue a página.",
        );
      }
    }

    iniciar();

    return () => {
      ativo = false;
      if (timer) clearTimeout(timer);
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  return (
    <div className="space-y-4">
      {alertaQueda && (
        <div
          role="alert"
          className="rounded-2xl bg-red-600 px-5 py-4 text-center text-lg font-bold text-white"
        >
          🚨 Você caiu? Fique tranquilo, já pedi ajuda para você.
        </div>
      )}

      {saudacaoFacial && (
        <div className="rounded-2xl bg-green-600 px-5 py-3 text-center text-lg font-bold text-white">
          {saudacaoFacial}
        </div>
      )}

      <div className="relative overflow-hidden rounded-2xl bg-black">
        <video
          ref={videoRef}
          className="w-full"
          playsInline
          muted
          aria-label="Câmera de monitoramento"
        />
        <canvas
          ref={canvasRef}
          className="pointer-events-none absolute inset-0 h-full w-full"
        />
      </div>

      <p
        role="status"
        aria-live="polite"
        className="text-center text-lg font-medium text-zinc-700"
      >
        {status}
      </p>

      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Objetos reconhecidos
        </p>
        <p className="mt-1 text-xl font-bold text-zinc-900">
          {objetos.length > 0 ? objetos.join(", ") : "—"}
        </p>
        {ambiente && (
          <p className="mt-2 text-sm text-zinc-600">
            <span aria-hidden>📍</span> Ambiente:{" "}
            <strong className="capitalize text-zinc-900">{ambiente}</strong>
          </p>
        )}
      </div>

      {infoObjeto && (
        <div
          role="status"
          aria-live="polite"
          className="rounded-2xl bg-blue-50 px-5 py-4 text-blue-900"
        >
          <span aria-hidden>💬</span> {infoObjeto}
        </div>
      )}

      <button
        type="button"
        onClick={() => registrarQuedaRef.current("simulada")}
        className="w-full rounded-2xl border-2 border-red-300 bg-red-50 py-4 text-lg font-bold text-red-700 hover:bg-red-100"
      >
        🧪 Simular queda (demonstração)
      </button>

      <button
        type="button"
        onClick={() => {
          const novo = !debug;
          setDebug(novo);
          debugRef.current = novo;
          if (!novo) setDiag(null);
        }}
        className="w-full rounded-2xl border-2 border-zinc-300 bg-zinc-50 py-3 font-bold text-zinc-700 hover:bg-zinc-100"
      >
        🔍 {debug ? "Ocultar" : "Mostrar"} raciocínio da IA
      </button>

      {debug && (
        <div className="space-y-1 rounded-2xl bg-zinc-900 px-4 py-3 font-mono text-sm text-zinc-100">
          <p className="font-bold text-zinc-300">🔍 Raciocínio — detecção de queda</p>
          {erroPose && (
            <p className="text-red-400">
              ⚠️ Erro na pose: {erroPose}
            </p>
          )}
          {diag ? (
            <>
              <p>
                Pontos vistos ({diag.pontosVisiveis.length}):{" "}
                {diag.pontosVisiveis.length
                  ? diag.pontosVisiveis.map((n) => NOME_PT[n] ?? n).join(", ")
                  : "nenhum — a IA não está te enxergando"}
              </p>
              <p>Eixo usado: {diag.eixo}</p>
              <p>
                Horizontal (dx): <strong>{Math.round(diag.dx)}</strong> ·
                Vertical (dy): <strong>{Math.round(diag.dy)}</strong>
              </p>
              <p>
                Regra: queda quando dx &gt; {Math.round(diag.limiar)} (= dy × 0,8)
              </p>
              <p>
                Caiu neste frame:{" "}
                <strong className={diag.caiu ? "text-red-400" : "text-green-400"}>
                  {diag.caiu ? "SIM" : "não"}
                </strong>{" "}
                · frames seguidos: {diag.frames}/{FRAMES_PARA_QUEDA}
              </p>
              <p>
                Altura na tela (cy): {diag.cy.toFixed(2)} · queda por movimento:{" "}
                <strong className={diag.mov ? "text-red-400" : "text-green-400"}>
                  {diag.mov ? "SIM" : "não"}
                </strong>
              </p>
            </>
          ) : (
            <p className="text-zinc-400">Aguardando leitura da câmera…</p>
          )}
        </div>
      )}
    </div>
  );
}

const NOME_PT: Record<string, string> = {
  nose: "nariz",
  left_eye: "olho esq.",
  right_eye: "olho dir.",
  left_shoulder: "ombro esq.",
  right_shoulder: "ombro dir.",
  left_hip: "quadril esq.",
  right_hip: "quadril dir.",
};
