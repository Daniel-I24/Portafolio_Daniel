"use client";

import { useState, useTransition } from "react";
import { saveEntity, type ActionResult, type AdminTable } from "@/app/admin/actions";
import { Icon } from "@/components/ui/Icon";
import { entitySchemas, profileSchema } from "@/lib/schemas";
import { browserClient } from "@/lib/supabase";

// Zod internals are untyped from outside: introspection only reads `def`, `description` and `maxLength`.
type Kind = "text" | "textarea" | "email" | "url" | "number" | "boolean" | "select" | "list" | "lines";
type ZodNode = { def: Record<string, never> & { type: string }; description?: string; maxLength?: number | null; format?: string | null };
type Field = { key: string; label: string; kind: Kind; options?: string[]; parts?: string[]; upload: boolean };

/** Fields whose value is a file in Storage: they get an upload button. */
const UPLOADS = new Set(["photo", "cvUrl", "imageUrl", "apkUrl", "downloadUrl", "avatarUrl", "gallery"]);
const HIDDEN = new Set(["id", "order"]); // id is generated; order is set by drag & drop in EntityTable
const inputClass = "mt-1 w-full border-[3px] border-ink bg-paper px-3 py-2 text-ink";

function unwrap(node: ZodNode): ZodNode {
  const def = node.def as unknown as { type: string; innerType?: ZodNode; in?: ZodNode };
  if (["default", "optional", "nullable"].includes(def.type)) return unwrap(def.innerType!);
  if (def.type === "pipe") return unwrap(def.in!);
  return node;
}

/** Turns a Zod object schema into form fields: the schema is the single source of truth. */
function fieldsOf(shape: Record<string, unknown>): Field[] {
  return Object.entries(shape).filter(([key]) => !HIDDEN.has(key)).map(([key, value]) => {
    const outer = value as ZodNode;
    const node = unwrap(outer);
    const def = node.def as unknown as { type: string; entries?: Record<string, string>; element?: ZodNode & { shape?: object } };
    const base = { key, label: outer.description ?? key, upload: UPLOADS.has(key) };
    if (def.type === "enum") return { ...base, kind: "select", options: Object.values(def.entries!) };
    if (def.type === "union") return { ...base, kind: "url" };
    if (def.type === "boolean" || def.type === "number") return { ...base, kind: def.type };
    if (def.type === "array") {
      const parts = def.element?.shape ? Object.keys(def.element.shape) : undefined;
      return { ...base, kind: parts ? "lines" : "list", parts };
    }
    if (node.format === "email" || node.format === "url") return { ...base, kind: node.format };
    return { ...base, kind: (node.maxLength ?? 0) > 300 ? "textarea" : "text" };
  });
}

/** Display string ↔ stored value: lists as "a, b"; object arrays as one "x | y" per line. */
function toText(field: Field, value: unknown): string | boolean {
  if (field.kind === "boolean") return Boolean(value);
  if (field.kind === "list") return ((value as string[]) ?? []).join(", ");
  if (field.kind === "lines") return ((value as Record<string, string>[]) ?? []).map((item) => field.parts!.map((p) => item[p]).join(" | ")).join("\n");
  if (field.kind === "select" && value == null) return String(field.options![0]);
  return value == null ? "" : String(value);
}
function fromText(field: Field, text: string | boolean): unknown {
  if (field.kind === "boolean") return text;
  const value = String(text);
  if (field.kind === "number") return value === "" ? undefined : Number(value); // undefined → schema default
  if (field.kind === "list") return value.split(",").map((item) => item.trim()).filter(Boolean);
  if (field.kind === "lines") {
    return value.split("\n").filter((line) => line.trim()).map((line) => {
      const cells = line.split("|").map((cell) => cell.trim());
      return Object.fromEntries(field.parts!.map((part, i) => [part, cells[i] ?? ""]));
    });
  }
  return value;
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
                <input {...common} type="checkbox" checked={values[field.key] as boolean} onChange={(e) => set(field.key, e.target.checked)} className="size-5 accent-hoodie" />
                {field.label}
              </label>
            ) : (
              <>
                <label htmlFor={id} className="font-semibold">{field.label}{field.parts && <span className="ml-2 font-mono text-sm text-concrete">{field.parts.join(" | ")} · uno por línea</span>}</label>
                {field.kind === "select" ? (
                  <select {...common} value={values[field.key] as string} onChange={(e) => set(field.key, e.target.value)} className={inputClass}>
                    {field.options!.map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                ) : ["textarea", "lines"].includes(field.kind) ? (
                  <textarea {...common} rows={field.kind === "lines" ? 3 : 5} value={values[field.key] as string} onChange={(e) => set(field.key, e.target.value)} className={inputClass} />
                ) : (
                  <input {...common} type={field.kind === "list" || field.kind === "text" ? "text" : field.kind} value={values[field.key] as string} onChange={(e) => set(field.key, e.target.value)} className={inputClass} />
                )}
                {field.upload && (
                  <label className="mt-2 inline-flex cursor-pointer items-center gap-2 font-mono text-sm text-ink underline decoration-denim decoration-2">
                    <Icon name="plus" size={16} /> {uploading === field.key ? "Subiendo…" : "Subir archivo"}
                    <input type="file" className="sr-only" onChange={(e) => e.target.files?.[0] && upload(field, e.target.files[0])} />
                  </label>
                )}
              </>
            )}
            {error && <p id={`${id}-error`} className="mt-1 border-l-4 border-spray-pink pl-2 text-sm font-semibold">{error}</p>}
          </div>
        );
      })}
      <div className="flex items-center gap-4 sm:col-span-2">
        <button type="submit" disabled={pending || uploading !== null} className="border-[3px] border-ink bg-hoodie px-5 py-2 font-extrabold uppercase text-ink shadow-sticker disabled:opacity-60">
          {pending ? "Guardando…" : "Guardar"}
        </button>
        <p role="status" className={`font-semibold ${result?.ok ? "border-l-4 border-slime pl-2" : "border-l-4 border-spray-pink pl-2"}`}>{result?.message}</p>
      </div>
    </form>
  );
}
