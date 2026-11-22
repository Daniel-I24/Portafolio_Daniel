"use client";

import { useState, useTransition } from "react";
import { saveEntity, type ActionResult, type AdminTable } from "@/app/admin/actions";
import { Icon } from "@/components/ui/Icon";
import { entitySchemas, profileSchema } from "@/lib/schemas";
import { fieldsOf, fromText, toText, type Field } from "./fields";
import { browserClient } from "@/lib/supabase";

const inputClass = "mt-1 w-full rounded-xl border border-line bg-deep px-3 py-2 text-ice";

/** One checkbox of a multi-choice field; the value is kept as "a, b". */
function Choice({ option, value, onChange }: { option: string; value: string; onChange: (next: string) => void }) {
  const chosen = value.split(", ").filter(Boolean);
  const toggle = (on: boolean) => onChange((on ? [...chosen, option] : chosen.filter((c) => c !== option)).join(", "));
  return <label className="flex items-center gap-2"><input type="checkbox" checked={chosen.includes(option)} onChange={(e) => toggle(e.target.checked)} className="size-5 accent-sky" />{option}</label>;
}

interface EntityFormProps {
  table: AdminTable;
  initial?: Record<string, unknown>;
  onDone?: (result: ActionResult) => void;
}

/** Generic create/edit form generated from the table's Zod schema, with per-field errors and Storage uploads. */
export function EntityForm({ table, initial = {}, onDone }: EntityFormProps) {
  const schema = table === "profile" ? profileSchema : entitySchemas[table];
  const fields = fieldsOf(schema.shape);
  const [values, setValues] = useState(() => Object.fromEntries(fields.map((f) => [f.key, toText(f, initial[f.key] ?? (f.kind === "boolean" && f.key === "published" ? true : undefined))])));
  const [result, setResult] = useState<ActionResult | null>(null);
  const [uploading, setUploading] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const set = (key: string, value: string | boolean) => setValues((v) => ({ ...v, [key]: value }));

  const upload = async (field: Field, file: File) => {
    setUploading(field.key);
    const path = `${table}/${Date.now()}-${file.name.toLowerCase().replace(/[^a-z0-9.]+/g, "-")}`;
    const bucket = browserClient().storage.from("public-assets");
    const { error } = await bucket.upload(path, file, { upsert: false });
    setUploading(null);
    if (error) return setResult({ ok: false, message: "No se pudo subir el archivo." });
    const url = bucket.getPublicUrl(path).data.publicUrl;
    set(field.key, field.kind === "list" ? [values[field.key], url].filter(Boolean).join(", ") : url);
  };

  const submit = () => startTransition(async () => {
    const payload = Object.fromEntries(fields.map((f) => [f.key, fromText(f, values[f.key])]));
    const response = await saveEntity(table, { ...payload, id: initial.id, order: initial.order ?? 0 });
    setResult(response);
    if (response.ok) onDone?.(response);
  });

  return (
    <form action={submit} className="grid gap-4 sm:grid-cols-2">
      {fields.map((field) => {
        const id = `field-${field.key}`;
        const error = result?.errors?.[field.key];
        const common = { id, "aria-invalid": Boolean(error), "aria-describedby": error ? `${id}-error` : undefined };
        const wide = ["textarea", "lines"].includes(field.kind) || field.upload;
        return (
          <div key={field.key} className={wide ? "sm:col-span-2" : ""}>
            {field.kind === "boolean" ? (
              <label className="flex items-center gap-3 font-semibold">
                <input {...common} type="checkbox" checked={values[field.key] as boolean} onChange={(e) => set(field.key, e.target.checked)} className="size-5 accent-sky" />
                {field.label}
              </label>
            ) : (
              <>
                <label htmlFor={id} id={`${id}-label`} className="font-semibold">{field.label}{field.parts && <span className="ml-2 text-sm text-mist">{field.parts.join(" | ")} · uno por línea</span>}</label>
                {field.kind === "multi" ? (
                  <div role="group" aria-labelledby={`${id}-label`} className="mt-2 flex flex-wrap gap-4">
                    {field.options!.map((option) => <Choice key={option} option={option} value={String(values[field.key])} onChange={(next) => set(field.key, next)} />)}
                  </div>
                ) : field.kind === "select" ? (
                  <select {...common} value={values[field.key] as string} onChange={(e) => set(field.key, e.target.value)} className={inputClass}>
                    {field.options!.map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                ) : ["textarea", "lines"].includes(field.kind) ? (
                  <textarea {...common} rows={field.kind === "lines" ? 3 : 5} value={values[field.key] as string} onChange={(e) => set(field.key, e.target.value)} className={inputClass} />
                ) : (
                  <input {...common} type={field.kind === "list" || field.kind === "text" ? "text" : field.kind} value={values[field.key] as string} onChange={(e) => set(field.key, e.target.value)} className={inputClass} />
                )}
                {field.upload && (
                  <label className="mt-2 inline-flex cursor-pointer items-center gap-2 text-sm text-ice underline decoration-sky decoration-2">
                    <Icon name="plus" size={16} /> {uploading === field.key ? "Subiendo…" : "Subir archivo"}
                    <input type="file" className="sr-only" onChange={(e) => e.target.files?.[0] && upload(field, e.target.files[0])} />
                  </label>
                )}
              </>
            )}
            {error && <p id={`${id}-error`} className="mt-1 border-l-4 border-sky pl-2 text-sm font-semibold">{error}</p>}
          </div>
        );
      })}
      <div className="flex items-center gap-4 sm:col-span-2">
        <button type="submit" disabled={pending || uploading !== null} className="rounded-full bg-navy px-5 py-2.5 font-semibold text-ice hover:bg-slate disabled:opacity-60">
          {pending ? "Guardando…" : "Guardar"}
        </button>
        <p role="status" className="border-l-4 border-sky pl-2 font-semibold">{result?.message}</p>
      </div>
    </form>
  );
}
