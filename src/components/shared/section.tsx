/** Page section: one heading, an optional quiet action, the same rhythm everywhere. */
export function Section({ title, action, children, className }: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={className ?? "mt-12"}>
      <div className="mb-4 flex items-baseline justify-between gap-4">
        <h2 className="text-xl font-semibold">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}
