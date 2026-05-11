"use client";

import { useEffect, useState } from "react";
import { nomeDaPessoa } from "@/lib/pessoa";
import { horaBrasilia } from "@/lib/hora";

function saudacao(h: number): string {
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

export function CabecalhoInicio() {
  const [nome, setNome] = useState("");

  useEffect(() => {
    setNome(nomeDaPessoa());
  }, []);

  return (
    <div>
      <p className="text-lg sm:text-xl">{saudacao(horaBrasilia())},</p>
      <p className="text-3xl font-bold sm:text-4xl">{nome || "Olá!"}</p>
    </div>
  );
}
