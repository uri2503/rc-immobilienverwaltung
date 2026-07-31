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
    { href: "/objekte", label: "Objekte", count: objekte.count ?? 0 },
    { href: "/objekte", label: "Einheiten", count: einheiten.count ?? 0 },
    { href: "/vertragspartner", label: "Vertragspartner", count: partner.count ?? 0 },
    { href: "/vertraege", label: "Verträge", count: vertraege.count ?? 0 },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-xl font-semibold">Übersicht</h1>
        <p className="text-sm text-foreground/60">
          Stammdaten und Mietverhältnisse für das Immobilienportfolio.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="rounded-lg border border-black/10 p-4 hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/5"
          >
            <div className="text-2xl font-semibold">{card.count}</div>
            <div className="text-sm text-foreground/60">{card.label}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
