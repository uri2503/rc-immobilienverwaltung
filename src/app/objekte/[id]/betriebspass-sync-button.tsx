"use client";

import { useState, useTransition } from "react";
import { syncObjektZuBetriebspass } from "./betriebspass-sync-actions";
import { secondaryButtonClass } from "@/components/form";

export function BetriebspassSyncButton({ objektId }: { objektId: string }) {
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<{ ok: boolean; message: string } | null>(null);

  function handleClick() {
    startTransition(async () => {
      const ergebnis = await syncObjektZuBetriebspass(objektId);
      setStatus(
        ergebnis.ok
          ? {
              ok: true,
              message: `Übertragen · ${new Date(ergebnis.timestamp).toLocaleString("de-DE")}`,
            }
          : { ok: false, message: ergebnis.error },
      );
    });
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className={secondaryButtonClass}
      >
        {isPending ? "Überträgt …" : "Nach Betriebspass übertragen"}
      </button>
      {status && (
        <span className={`text-xs ${status.ok ? "text-emerald-600" : "text-red-600"}`}>
          {status.message}
        </span>
      )}
    </div>
  );
}
