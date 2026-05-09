/**
 * Horário oficial de Brasília (America/Sao_Paulo), independente do fuso do
 * aparelho. Usa Intl para converter a data atual para o fuso correto.
 */
export function partesBrasilia(d: Date = new Date()): {
  hora: number;
  minuto: number;
} {
  const partes = new Intl.DateTimeFormat("en-GB", {
    timeZone: "America/Sao_Paulo",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(d);
  const num = (tipo: string) =>
    Number(partes.find((p) => p.type === tipo)?.value ?? "0");
  return { hora: num("hour") % 24, minuto: num("minute") };
}

/** Hora (0-23) em Brasília. */
export function horaBrasilia(d: Date = new Date()): number {
  return partesBrasilia(d).hora;
}

/** Minutos desde a meia-noite em Brasília. */
export function minutosBrasilia(d: Date = new Date()): number {
  const { hora, minuto } = partesBrasilia(d);
  return hora * 60 + minuto;
}

/** Converte minutos desde a meia-noite em "HH:MM" (com volta após 24h). */
export function minutosParaHHMM(min: number): string {
  const m = ((Math.round(min) % 1440) + 1440) % 1440;
  const hh = String(Math.floor(m / 60)).padStart(2, "0");
  const mm = String(m % 60).padStart(2, "0");
  return `${hh}:${mm}`;
}
