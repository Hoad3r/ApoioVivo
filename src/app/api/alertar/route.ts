import { NextResponse, type NextRequest } from "next/server";
import { Resend } from "resend";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

/**
 * Envia e-mail de alerta a todos os cuidadores cadastrados.
 * Degrada em silêncio (200) quando o backend não está configurado, para não
 * quebrar o fluxo do app no modo local.
 */
export async function POST(req: NextRequest) {
  const apiKey = process.env.RESEND_API_KEY;
  const from =
    process.env.ALERTA_EMAIL_FROM ?? "Apoio Vivo <onboarding@resend.dev>";
  const admin = getSupabaseAdmin();

  if (!apiKey || !admin) {
    return NextResponse.json({ enviado: false, motivo: "backend nao configurado" });
  }

  const { tipo, descricao } = (await req.json()) as {
    tipo?: string;
    descricao?: string;
  };

  const { data } = await admin.from("cuidadores").select("nome, email");
  const cuidadores = (data ?? []) as { nome: string; email: string }[];
  if (cuidadores.length === 0) {
    return NextResponse.json({ enviado: false, motivo: "sem cuidadores" });
  }

  const resend = new Resend(apiKey);
  const assunto = `Apoio Vivo — Alerta: ${tipo ?? "evento"}`;
  const enviados: string[] = [];

  for (const c of cuidadores) {
    await resend.emails.send({
      from,
      to: c.email,
      subject: assunto,
      text: `Olá, ${c.nome}.\n\n${descricao ?? "Um alerta foi registrado."}\n\nEste é um alerta automático do Apoio Vivo.`,
    });
    enviados.push(c.email);
  }

  return NextResponse.json({ enviado: true, destinatarios: enviados });
}
