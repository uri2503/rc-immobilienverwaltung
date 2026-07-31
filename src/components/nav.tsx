import Link from "next/link";

const links = [
  { href: "/", label: "Übersicht" },
  { href: "/objekte", label: "Objekte" },
  { href: "/vertragspartner", label: "Vertragspartner" },
  { href: "/vertraege", label: "Verträge" },
];

export function Nav() {
  return (
    <header className="border-b border-black/10 dark:border-white/10">
      <div className="mx-auto flex max-w-5xl items-center gap-6 px-6 py-4">
        <Link href="/" className="font-semibold">
          Immobilienverwaltung
        </Link>
        <nav className="flex gap-4 text-sm">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-foreground/70 hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
