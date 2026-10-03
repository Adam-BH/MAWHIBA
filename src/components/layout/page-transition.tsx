/** Segment templates remount on navigation: a short fade, off under prefers-reduced-motion (globals.css). */
export function PageTransition({ children }: { children: React.ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
