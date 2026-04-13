import { NavInferior } from "@/components/nav-inferior";

export default function IdosoLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="mx-auto min-h-dvh w-full max-w-md bg-zinc-50 pb-24 shadow-sm sm:max-w-lg">
      {children}
      <NavInferior />
    </div>
  );
}
