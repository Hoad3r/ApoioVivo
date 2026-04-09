"use client";

import { useEffect, useRef, useState } from "react";
import { detectarObjetos, type Predicao } from "@/lib/vision/objetos";
import { traduzir } from "@/lib/vision/traducoes";
import { falar } from "@/lib/voice";

const LIMIAR = 0.6;

export function MonitorCamera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ultimoFalado = useRef<string>("");
  const [status, setStatus] = useState("Iniciando câmera…");
  const [objetos, setObjetos] = useState<string[]>([]);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let ativo = true;
    let timer: ReturnType<typeof setTimeout> | null = null;

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
          const nomes = [
            ...new Set(
              preds.filter((p) => p.score >= LIMIAR).map((p) => traduzir(p.class)),
            ),
          ];
          setObjetos(nomes);
          const principal = nomes[0];
          if (principal && principal !== ultimoFalado.current) {
            ultimoFalado.current = principal;
            falar(`Isto é: ${principal}`);
          }
        } catch {
          /* frame com erro: ignora e continua */
        }
      }
      timer = setTimeout(loop, 700);
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
        setStatus("Reconhecendo objetos…");
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
      </div>
    </div>
  );
}
