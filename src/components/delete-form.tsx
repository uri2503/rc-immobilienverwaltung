"use client";

import { useActionState } from "react";
import type { ActionState } from "@/lib/action-state";
import { initialActionState } from "@/lib/action-state";
import { dangerButtonClass } from "./form";

export function DeleteForm({
  action,
  confirmMessage,
  label = "Löschen",
}: {
  action: (prevState: ActionState, formData: FormData) => Promise<ActionState>;
  confirmMessage: string;
  label?: string;
}) {
  const [state, formAction, isPending] = useActionState(action, initialActionState);

  return (
    <form action={formAction} className="flex flex-col items-end gap-2">
      <button
        type="submit"
        disabled={isPending}
        className={dangerButtonClass}
        onClick={(event) => {
          if (!window.confirm(confirmMessage)) {
            event.preventDefault();
          }
        }}
      >
        {isPending ? "Wird gelöscht …" : label}
      </button>
      {state.error && (
        <p className="max-w-xs text-right text-sm text-red-600">{state.error}</p>
      )}
    </form>
  );
}
