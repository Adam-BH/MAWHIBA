/** Remounts on every navigation: gentle fade + slide-up entrance (disabled by prefers-reduced-motion in globals.css). */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300 ease-out">{children}</div>;
}
