"use client";

import { useActionState } from "react";
import { initialActionState } from "@/lib/action-state";
import { setzeAbrechnungStatus } from "../actions";
import type { AbrechnungStatus } from "@/lib/types";

export function AbrechnungStatusButtons({
  id,
  status,
  revalidateTargetPath,
}: {
  id: string;
  status: AbrechnungStatus;
  revalidateTargetPath: string;
}) {
  const [, versendetAction, versendetPending] = useActionState(
    setzeAbrechnungStatus.bind(null, id, "versendet" as AbrechnungStatus, revalidateTargetPath),
    initialActionState,
  );
  const [, bezahltAction, bezahltPending] = useActionState(
    setzeAbrechnungStatus.bind(null, id, "bezahlt" as AbrechnungStatus, revalidateTargetPath),
    initialActionState,
  );

  return (
    <div className="flex flex-col items-end gap-1 text-xs">
      {status === "entwurf" && (
        <form action={versendetAction}>
          <button type="submit" disabled={versendetPending} className="text-accent hover:underline">
            Als versendet markieren
          </button>
        </form>
      )}
      {status !== "bezahlt" && (
        <form action={bezahltAction}>
          <button type="submit" disabled={bezahltPending} className="text-accent hover:underline">
            Als bezahlt markieren
          </button>
        </form>
      )}
    </div>
  );
}
