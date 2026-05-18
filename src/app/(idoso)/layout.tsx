import { NavInferior } from "@/components/nav-inferior";
import { AvisoLembretes } from "@/components/aviso-lembretes";
import { GuardaSessao } from "@/components/guarda-sessao";

export default function IdosoLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="mx-auto min-h-dvh w-full max-w-md bg-zinc-50 pb-24 shadow-sm sm:max-w-lg">
      <GuardaSessao>
        <AvisoLembretes />
        {children}
        <NavInferior />
      </GuardaSessao>
    </div>
  );
}
