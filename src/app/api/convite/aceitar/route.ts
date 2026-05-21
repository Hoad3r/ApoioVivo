import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

/**
 * Aceitação pública de um convite: o cuidador preenche seus dados e é inserido
 * na lista de quem recebe os alertas do idoso que gerou o convite.
 * Usa a service-role (servidor) porque o visitante não está autenticado; o token
 * é de uso único e expira, limitando o escopo.
 */
export async function POST(req: NextRequest) {
  const admin = getSupabaseAdmin();
  if (!admin) {
    return NextResponse.json(
      { erro: "Backend não configurado." },
      { status: 503 },
    );
  }

  const body = (await req.json().catch(() => null)) as {
    token?: string;
    nome?: string;
    email?: string;
    parentesco?: string;
    telefone?: string;
  } | null;

  const token = body?.token?.trim();
  const nome = body?.nome?.trim();
  const email = body?.email?.trim();
  const telefone = body?.telefone?.trim();
  if (!token || !nome || !email || !telefone) {
    return NextResponse.json({ erro: "Dados incompletos." }, { status: 400 });
  }

  const { data: convite, error } = await admin
    .from("convites")
    .select("token, user_id, usado, expira_em")
    .eq("token", token)
    .maybeSingle();

  if (error || !convite) {
    return NextResponse.json({ erro: "Convite inválido." }, { status: 404 });
  }
  if (convite.usado) {
    return NextResponse.json(
      { erro: "Este convite já foi usado." },
      { status: 409 },
    );
  }
  if (convite.expira_em && new Date(convite.expira_em) < new Date()) {
    return NextResponse.json({ erro: "Convite expirado." }, { status: 410 });
  }

  const { error: insErr } = await admin.from("cuidadores").insert({
    user_id: convite.user_id,
    nome,
    email,
    parentesco: body?.parentesco?.trim() || null,
    telefone,
  });
  if (insErr) {
    return NextResponse.json({ erro: "Erro ao salvar." }, { status: 500 });
  }

  await admin.from("convites").update({ usado: true }).eq("token", token);
  return NextResponse.json({ ok: true });
}
