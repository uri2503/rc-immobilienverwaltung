import { createObjekt } from "../actions";
import { ObjektForm } from "../objekt-form";

export default function NeuesObjektPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-xl font-semibold">Neues Objekt</h1>
      <ObjektForm action={createObjekt} />
    </div>
  );
}
