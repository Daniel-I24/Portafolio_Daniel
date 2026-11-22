/** Turns a Zod object schema into admin form fields, and converts values to and from their text form. */

// Zod internals are untyped from outside: introspection only reads `def`, `description` and `maxLength`.
type Kind = "text" | "textarea" | "email" | "url" | "number" | "boolean" | "select" | "multi" | "list" | "lines";
type ZodNode = { def: Record<string, never> & { type: string }; description?: string; maxLength?: number | null; format?: string | null };
export type Field = { key: string; label: string; kind: Kind; options?: string[]; parts?: string[]; upload: boolean };

/** Fields whose value is a file in Storage get an upload button. */
const UPLOADS = new Set(["photo", "cvUrl", "imageUrl", "apkUrl", "downloadUrl", "avatarUrl", "gallery"]);
const HIDDEN = new Set(["id", "order"]); // id is generated; order is set by drag & drop in EntityTable

function unwrap(node: ZodNode): ZodNode {
  const def = node.def as unknown as { type: string; innerType?: ZodNode; in?: ZodNode };
  if (["default", "optional", "nullable"].includes(def.type)) return unwrap(def.innerType!);
  if (def.type === "pipe") return unwrap(def.in!);
  return node;
}

/** Turns a Zod object schema into form fields: the schema is the single source of truth. */
export function fieldsOf(shape: Record<string, unknown>): Field[] {
  return Object.entries(shape).filter(([key]) => !HIDDEN.has(key)).map(([key, value]) => {
    const outer = value as ZodNode;
    const node = unwrap(outer);
    const def = node.def as unknown as { type: string; entries?: Record<string, string>; element?: ZodNode & { shape?: object } };
    const base = { key, label: outer.description ?? key, upload: UPLOADS.has(key) };
    if (def.type === "enum") return { ...base, kind: "select", options: Object.values(def.entries!) };
    if (def.type === "union") return { ...base, kind: "url" };
    if (def.type === "boolean" || def.type === "number") return { ...base, kind: def.type };
    if (def.type === "array") {
      const element = def.element && (unwrap(def.element).def as unknown as { type: string; entries?: Record<string, string> });
      if (element?.type === "enum") return { ...base, kind: "multi", options: Object.values(element.entries!) }; // platforms
      const parts = def.element?.shape ? Object.keys(def.element.shape) : undefined;
      return { ...base, kind: parts ? "lines" : "list", parts };
    }
    if (node.format === "email" || node.format === "url") return { ...base, kind: node.format };
    return { ...base, kind: (node.maxLength ?? 0) > 300 ? "textarea" : "text" };
  });
}

/** Display string ↔ stored value: lists and multi-choices as "a, b"; object arrays as one "x | y" per line. */
export function toText(field: Field, value: unknown): string | boolean {
  if (field.kind === "boolean") return Boolean(value);
  if (field.kind === "list" || field.kind === "multi") return ((value as string[]) ?? []).join(", ");
  if (field.kind === "lines") return ((value as Record<string, string>[]) ?? []).map((item) => field.parts!.map((p) => item[p]).join(" | ")).join("\n");
  if (field.kind === "select" && value == null) return String(field.options![0]);
  return value == null ? "" : String(value);
}
export function fromText(field: Field, text: string | boolean): unknown {
  const value = String(text);
  if (field.kind === "boolean") return text;
  if (field.kind === "number") return value === "" ? undefined : Number(value); // undefined → schema default
  if (field.kind === "list" || field.kind === "multi") return value.split(",").map((item) => item.trim()).filter(Boolean);
  if (field.kind === "lines") {
    return value.split("\n").filter((line) => line.trim()).map((line) => {
      const cells = line.split("|").map((cell) => cell.trim());
      return Object.fromEntries(field.parts!.map((part, i) => [part, cells[i] ?? ""]));
    });
  }
  return value;
}
