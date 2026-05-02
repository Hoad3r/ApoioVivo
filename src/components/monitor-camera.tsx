"use client";

import { useEffect, useRef, useState } from "react";
import { detectarObjetos, type Predicao } from "@/lib/vision/objetos";
import { detectarPose } from "@/lib/vision/pose";
import { avaliarQueda } from "@/lib/vision/queda";
import { traduzir } from "@/lib/vision/traducoes";
import { infoObjetoEssencial } from "@/lib/vision/objetos-essenciais";
import { detectarAmbiente } from "@/lib/vision/ambiente";
import { falar } from "@/lib/voice";
import { notificarCuidador } from "@/lib/notificacao";
import { enviarAlertaEmail } from "@/lib/alertar";
import { getDataStore } from "@/lib/data";

const LIMIAR = 0.6;
const FRAMES_PARA_QUEDA = 3;
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
      falar("Atenção! Detectamos uma possível queda. O cuidador foi avisado.");
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
          setObjetos([...new Set(validos.map((p) => traduzir(p.class)))]);

          const principal = [...validos].sort((a, b) => b.score - a.score)[0];
          if (principal && principal.class !== ultimoFalado.current) {
            ultimoFalado.current = principal.class;
            const info = infoObjetoEssencial(principal.class);
            const msg = info ?? `Isto é: ${traduzir(principal.class)}`;
            setInfoObjeto(msg);
            falar(msg);
          }

          const amb = detectarAmbiente(classes);
          setAmbiente(amb);
          if (amb === "cozinha" && !alertouCozinha.current) {
            alertouCozinha.current = true;
            const nome = getDataStore().getUsuario().nome;
            const hora = new Date().getHours();
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
          const caiu = avaliarQueda(keypoints);
          framesQueda.current = caiu ? framesQueda.current + 1 : 0;
          if (framesQueda.current >= FRAMES_PARA_QUEDA) {
            framesQueda.current = 0;
            registrarQueda("real");
          }

          const nariz = keypoints.find((k) => k.name === "nose");
          if (nariz && (nariz.score ?? 0) > 0.4 && !saudou.current) {
            saudou.current = true;
            const nome = getDataStore().getUsuario().nome;
            const msg = `Olá, ${nome}! Que bom ver você.`;
            setSaudacaoFacial(msg);
            falar(msg);
          }
        } catch {
          /* frame de pose com erro: ignora */
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
        setStatus("Monitorando: objetos e quedas");
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
          🚨 Queda detectada! O cuidador foi avisado.
        </div>
      )}

      {saudacaoFacial && (
        <div className="rounded-2xl bg-green-600 px-5 py-3 text-center text-lg font-bold text-white">
          👋 {saudacaoFacial}
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
    </div>
  );
}
