export function FormError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p className="rounded-md border border-red-600/30 bg-red-600/10 px-3 py-2 text-sm text-red-600">
      {message}
    </p>
  );
}
