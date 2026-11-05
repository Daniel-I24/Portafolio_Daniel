"use client";

import { Reorder } from "motion/react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { deleteEntity, reorder, setPublished, type ActionResult } from "@/app/admin/actions";
import { Icon } from "@/components/ui/Icon";
import { Modal } from "@/components/ui/Modal";
import type { EntityTable as Table } from "@/lib/schemas";
import { Trie } from "@/lib/structures";
import { EntityForm } from "./EntityForm";

type Row = Record<string, unknown> & { id: string; published: boolean };

/** First field that exists, so one table works for every entity (title/name, period/role/group…). */
const pick = (row: Row, keys: string[]) => String(keys.map((key) => row[key]).find((value) => value) ?? "");
const titleOf = (row: Row) => pick(row, ["title", "name"]);
const subtitleOf = (row: Row) => pick(row, ["period", "role", "group", "type", "kind"]);
const iconButton = "grid size-9 place-items-center border-2 border-ink bg-paper text-ink hover:bg-mustard disabled:opacity-40";

export function EntityTable({ table, rows: initialRows }: { table: Table; rows: Row[] }) {
  const router = useRouter();
  const [rows, setRows] = useState(initialRows);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<Row | "new" | null>(null);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [pending, startTransition] = useTransition();
  const latest = useRef(rows); // drag end must save the final order, not the one captured at render
  latest.current = rows;
  useEffect(() => setRows(initialRows), [initialRows]); // router.refresh() brings fresh server rows

  const trie = useMemo(() => rows.reduce((t, row) => t.insert(`${titleOf(row)} ${subtitleOf(row)}`, row.id), new Trie<string>()), [rows]);
  const matches = query ? new Set(trie.search(query)) : null;
  const visible = matches ? rows.filter((row) => matches.has(row.id)) : rows;

  const run = (task: () => Promise<ActionResult>) => startTransition(async () => {
    const result = await task();
    setStatus(result.message);
    if (result.ok) router.refresh();
  });
  const saveOrder = (next: Row[]) => run(() => reorder(table, next.map((row) => row.id)));
  const move = (index: number, step: number) => {
    const next = [...rows];
    [next[index], next[index + step]] = [next[index + step], next[index]];
    setRows(next);
    saveOrder(next);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        <label className="grow">
          <span className="sr-only">Buscar</span>
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar…" className="w-full border-[3px] border-ink bg-paper px-3 py-2 text-ink" />
        </label>
        <button type="button" onClick={() => setEditing("new")} className="inline-flex items-center gap-2 border-[3px] border-ink bg-hoodie px-4 py-2 font-extrabold uppercase text-ink shadow-sticker-sm">
          <Icon name="plus" size={18} /> Nuevo
        </button>
      </div>
      <p role="status" className="mt-3 min-h-6 font-mono text-sm text-mustard">{pending ? "Guardando…" : status}</p>
      {query && <p className="font-mono text-sm text-cement">El orden por arrastre se desactiva mientras buscas.</p>}

      <Reorder.Group as="ol" axis="y" values={rows} onReorder={setRows} className="mt-2 space-y-2">
        {visible.map((row) => {
          const index = rows.indexOf(row);
          return (
            <Reorder.Item key={row.id} value={row} as="li" drag={query ? false : "y"} onDragEnd={() => saveOrder(latest.current)}
              className="flex flex-wrap items-center gap-3 border-[3px] border-ink bg-paper p-3 text-ink">
              <span aria-hidden className="cursor-grab font-mono text-concrete">⋮⋮</span>
              <div className="min-w-0 grow">
                <p className="truncate font-semibold">{titleOf(row)}</p>
                <p className="truncate font-mono text-sm text-concrete">{subtitleOf(row)}</p>
              </div>
              <button type="button" role="switch" aria-checked={row.published} aria-label={`Publicado: ${titleOf(row)}`}
                onClick={() => { setRows(rows.map((r) => (r.id === row.id ? { ...r, published: !r.published } : r))); run(() => setPublished(table, row.id, !row.published)); }}
                className={`border-2 border-ink px-2 py-1 font-mono text-sm ${row.published ? "bg-slime" : "bg-cement"}`}>
                {row.published ? "Publicado" : "Borrador"}
              </button>
              <button type="button" aria-label={`Subir ${titleOf(row)}`} disabled={!!query || index === 0} onClick={() => move(index, -1)} className={iconButton}>
                <Icon name="arrow" size={16} className="-rotate-90" />
              </button>
              <button type="button" aria-label={`Bajar ${titleOf(row)}`} disabled={!!query || index === rows.length - 1} onClick={() => move(index, 1)} className={iconButton}>
                <Icon name="arrow" size={16} className="rotate-90" />
              </button>
              <button type="button" aria-label={`Editar ${titleOf(row)}`} onClick={() => setEditing(row)} className={iconButton}><Icon name="edit" size={16} /></button>
              {confirming === row.id ? (
                <span className="flex items-center gap-2 text-sm font-semibold">
                  ¿Eliminar?
                  <button type="button" onClick={() => { setRows(rows.filter((r) => r.id !== row.id)); setConfirming(null); run(() => deleteEntity(table, row.id)); }} className="border-2 border-spray-pink bg-ink px-2 py-1 text-paper">Sí</button>
                  <button type="button" onClick={() => setConfirming(null)} className="border-2 border-ink bg-paper px-2 py-1">No</button>
                </span>
              ) : (
                <button type="button" aria-label={`Eliminar ${titleOf(row)}`} onClick={() => setConfirming(row.id)} className={iconButton}><Icon name="trash" size={16} /></button>
              )}
            </Reorder.Item>
          );
        })}
      </Reorder.Group>
      {visible.length === 0 && <p className="mt-4 font-semibold text-paper">{query ? "Nada coincide con la búsqueda." : "Todavía no hay registros."}</p>}

      <Modal open={editing !== null} onClose={() => setEditing(null)} title={editing === "new" ? "Nuevo registro" : `Editar: ${editing ? titleOf(editing) : ""}`}>
        {editing && (
          <EntityForm key={editing === "new" ? "new" : editing.id} table={table} initial={editing === "new" ? { order: rows.length } : editing}
            onDone={() => { setEditing(null); router.refresh(); }} />
        )}
      </Modal>
    </div>
  );
}
