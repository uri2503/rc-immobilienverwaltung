export const inputClass =
  "w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm shadow-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/20";

export const labelClass = "block text-sm font-medium mb-1.5 text-foreground/80";

export const buttonClass =
  "inline-flex items-center justify-center rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60";

export const secondaryButtonClass =
  "inline-flex items-center justify-center rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium shadow-sm transition-colors hover:bg-accent-soft";

export const dangerButtonClass =
  "inline-flex items-center justify-center rounded-lg border border-red-600/30 bg-surface px-4 py-2 text-sm font-medium text-red-600 shadow-sm transition-colors hover:bg-red-600/10 disabled:cursor-not-allowed disabled:opacity-60";

export const cardClass = "rounded-xl border border-border bg-surface p-6 shadow-sm";

export const tableWrapClass =
  "overflow-x-auto rounded-xl border border-border bg-surface shadow-sm";

export const tableClass = "w-full text-left text-sm";

export const theadRowClass = "border-b border-border bg-accent-soft/60 text-foreground/60";

export const thClass = "px-4 py-3 font-medium";

export const tdClass = "px-4 py-3";

export const trClass = "border-b border-border last:border-0 transition-colors hover:bg-accent-soft/40";

export function badgeClass(tone: "neutral" | "accent" | "positive" = "neutral") {
  const tones = {
    neutral: "bg-black/5 text-foreground/70 dark:bg-white/10",
    accent: "bg-accent-soft text-accent",
    positive: "bg-emerald-500/10 text-emerald-600",
  };
  return `inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${tones[tone]}`;
}

export function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className={labelClass}>
        {label}
      </label>
      {children}
    </div>
  );
}
