import { Logo } from "@/components/layout/logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-6 bg-secondary px-4 py-10">
      <Logo className="text-2xl" />
      <div className="w-full max-w-md rounded-4xl bg-card p-6 shadow-lift animate-in fade-in-0 slide-in-from-bottom-2 duration-300 ease-out sm:p-10">{children}</div>
    </div>
  );
}
