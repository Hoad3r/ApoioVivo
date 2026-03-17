import { NavInferior } from "@/components/nav-inferior";

export default function IdosoLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="mx-auto min-h-dvh max-w-md bg-zinc-50 pb-24">
      {children}
      <NavInferior />
    </div>
  );
}
