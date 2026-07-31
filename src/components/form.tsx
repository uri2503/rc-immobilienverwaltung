export const inputClass =
  "w-full rounded-md border border-black/15 bg-transparent px-3 py-2 text-sm dark:border-white/15";

export const labelClass = "block text-sm font-medium mb-1";

export const buttonClass =
  "rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background hover:opacity-90";

export const secondaryButtonClass =
  "rounded-md border border-black/15 px-4 py-2 text-sm font-medium hover:bg-black/5 dark:border-white/15 dark:hover:bg-white/10";

export const dangerButtonClass =
  "rounded-md border border-red-600/40 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-600/10";

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
