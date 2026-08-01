"use client";

import { useActionState } from "react";
import type { ActionState } from "@/lib/action-state";
import { initialActionState } from "@/lib/action-state";
import { buttonClass } from "@/components/form";
import { FormError } from "@/components/form-error";

export function BerechnenButton({
  action,
}: {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
}) {
  const [state, formAction, isPending] = useActionState(action, initialActionState);

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <button type="submit" disabled={isPending} className={buttonClass}>
        {isPending ? "Berechnet …" : "Abrechnung berechnen & speichern"}
      </button>
      <FormError message={state.error} />
    </form>
  );
}
