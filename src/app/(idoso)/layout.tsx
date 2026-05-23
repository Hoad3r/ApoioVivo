import { NavInferior } from "@/components/nav-inferior";
import { SidebarNav } from "@/components/sidebar-nav";
import { AvisoLembretes } from "@/components/aviso-lembretes";
import { GuardaSessao } from "@/components/guarda-sessao";

export default function IdosoLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="min-h-dvh bg-teal-50 lg:flex">
      <SidebarNav />
      <div className="flex-1">
        <GuardaSessao>
          <AvisoLembretes />
          <div className="mx-auto w-full max-w-3xl pb-24 lg:pb-10">
            {children}
          </div>
          <NavInferior />
        </GuardaSessao>
      </div>
    </div>
  );
}
