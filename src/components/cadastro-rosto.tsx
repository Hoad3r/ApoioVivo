"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { descritorDe } from "@/lib/face/face-api";
import {
  adicionarRosto,
  listarRostos,
  removerRosto,
  type PapelRosto,
  type RostoRegistrado,
} from "@/lib/face/registro";

export function CadastroRosto() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [lista, setLista] = useState<RostoRegistrado[]>([]);
  const [nome, setNome] = useState("");
  const [papel, setPapel] = useState<PapelRosto>("idoso");
  const [status, setStatus] = useState("Iniciando câmera…");
  const [ocupado, setOcupado] = useState(false);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let ativo = true;

    async function iniciar() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
          audio: false,
        });
        if (!ativo) return;
        const v = videoRef.current;
        if (v) {
          v.srcObject = stream;
          await v.play();
        }
        setStatus("Posicione o rosto no centro e toque em Cadastrar.");
      } catch {
        setStatus("Não foi possível acessar a câmera.");
      }
    }

    iniciar();
    setLista(listarRostos());

    return () => {
      ativo = false;
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  async function cadastrar(e: FormEvent) {
    e.preventDefault();
    if (!nome.trim() || !videoRef.current) return;
    setOcupado(true);
    setStatus("Processando o rosto…");
    const desc = await descritorDe(videoRef.current);
    setOcupado(false);
    if (!desc) {
      setStatus("Rosto não detectado. Aproxime-se e tente de novo.");
      return;
    }
    adicionarRosto({ nome, papel, descritor: Array.from(desc) });
    setStatus(`Rosto de ${nome} cadastrado com sucesso!`);
    setNome("");
    setLista(listarRostos());
  }

  function remover(id: string) {
    removerRosto(id);
    setLista(listarRostos());
  }

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-2xl bg-black">
        <video ref={videoRef} className="w-full" playsInline muted />
      </div>

      <p role="status" aria-live="polite" className="text-center text-zinc-700">
        {status}
      </p>

      <form
        onSubmit={cadastrar}
        className="space-y-3 rounded-2xl bg-white p-4 shadow-sm"
      >
        <input
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Nome da pessoa"
          required
          className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-lg"
        />
        <select
          value={papel}
          onChange={(e) => setPapel(e.target.value as PapelRosto)}
          className="w-full rounded-xl border border-zinc-300 px-3 py-2 text-lg"
        >
          <option value="idoso">Idoso(a)</option>
          <option value="cuidador">Cuidador(a) / Familiar</option>
        </select>
        <button
          type="submit"
          disabled={ocupado}
          className="w-full rounded-xl bg-blue-700 py-3 font-bold text-white hover:bg-blue-800 disabled:opacity-60"
        >
          {ocupado ? "Processando…" : "📸 Cadastrar rosto"}
        </button>
      </form>

      <ul className="space-y-2">
        {lista.map((r) => (
          <li
            key={r.id}
            className="flex items-center justify-between rounded-2xl bg-white p-3 shadow-sm"
          >
            <span className="font-bold text-zinc-900">
              {r.nome}{" "}
              <span className="text-sm font-normal text-zinc-500">
                ({r.papel === "idoso" ? "idoso" : "cuidador"})
              </span>
            </span>
            <button
              type="button"
              onClick={() => remover(r.id)}
              className="rounded-xl bg-red-50 px-3 py-1 text-sm font-medium text-red-600 hover:bg-red-100"
            >
              Remover
            </button>
          </li>
        ))}
        {lista.length === 0 && (
          <li className="py-4 text-center text-zinc-500">
            Nenhum rosto cadastrado ainda.
          </li>
        )}
      </ul>
    </div>
  );
}
