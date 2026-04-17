"use client";

import { useEffect, useState } from "react";

const CHAVE = "apoiovivo:contraste";

/** Alterna o modo de alto contraste (WCAG) e persiste a preferência. */
export function AltoContrasteToggle() {
  const [ativo, setAtivo] = useState(false);

  useEffect(() => {
    setAtivo(document.documentElement.classList.contains("alto-contraste"));
  }, []);

  function alternar() {
    const novo = !ativo;
    setAtivo(novo);
    document.documentElement.classList.toggle("alto-contraste", novo);
    try {
      localStorage.setItem(CHAVE, novo ? "1" : "0");
    } catch {
      /* localStorage indisponível: ignora */
    }
  }

  return (
    <button
      type="button"
      onClick={alternar}
      aria-pressed={ativo}
      className="rounded-full bg-white/20 px-3 py-2 text-sm font-semibold text-white hover:bg-white/30"
    >
      <span aria-hidden>◐</span> {ativo ? "Contraste normal" : "Alto contraste"}
    </button>
  );
}
