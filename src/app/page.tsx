import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function Home() {
  const supabase = await createClient();

  const [objekte, einheiten, partner, vertraege] = await Promise.all([
    supabase.from("immo_objekt").select("*", { count: "exact", head: true }),
    supabase.from("immo_einheit").select("*", { count: "exact", head: true }),
    supabase.from("immo_vertragspartner").select("*", { count: "exact", head: true }),
    supabase.from("immo_vertrag").select("*", { count: "exact", head: true }),
  ]);

  const cards = [
    { href: "/objekte", label: "Objekte", count: objekte.count ?? 0, icon: "🏢" },
    { href: "/objekte", label: "Einheiten", count: einheiten.count ?? 0, icon: "🚪" },
    { href: "/vertragspartner", label: "Vertragspartner", count: partner.count ?? 0, icon: "👥" },
    { href: "/vertraege", label: "Verträge", count: vertraege.count ?? 0, icon: "📄" },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Übersicht</h1>
        <p className="mt-1 text-sm text-foreground/60">
          Stammdaten und Mietverhältnisse für das Immobilienportfolio.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="group rounded-xl border border-border bg-surface p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent-soft text-lg">
              {card.icon}
            </div>
            <div className="mt-3 text-2xl font-semibold tracking-tight">{card.count}</div>
            <div className="text-sm text-foreground/60">{card.label}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
