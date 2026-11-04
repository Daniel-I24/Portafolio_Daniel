"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { SECTIONS } from "@/components/sections/Navbar";
import { SectionObserver } from "@/lib/patterns";
import { Trie } from "@/lib/structures";
import { Icon } from "./Icon";

const IDS = SECTIONS.map((section) => section.id);
const FILLS = ["bg-hoodie", "bg-mustard", "bg-paper"];

/** Floating spray can that fans out one paint bubble per section. Doubles as the mobile menu. */
export function BubbleMenu() {
  const reduced = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<string>("inicio");
  const rootRef = useRef<HTMLDivElement>(null);
  const canRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const trie = useMemo(() => SECTIONS.reduce((t, s) => t.insert(`${s.label} ${s.keywords}`, s.id), new Trie<string>()), []);
  const matches = query ? new Set(trie.search(query)) : null;
  const visible = SECTIONS.filter((section) => !matches || matches.has(section.id));

  // Scroll spy: the observer notifies which section crosses the middle of the viewport.
  useEffect(() => {
    const observer = new SectionObserver().observe(IDS);
    observer.subscribe((id, isVisible) => isVisible && setActive(id));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!open) return;
    searchRef.current?.focus();
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  const close = (refocus = true) => {
    setOpen(false);
    setQuery("");
    if (refocus) canRef.current?.focus();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const focusables = [searchRef.current, ...rootRef.current!.querySelectorAll<HTMLElement>("[role=menuitem]")].filter(Boolean) as HTMLElement[];
    const index = focusables.indexOf(document.activeElement as HTMLElement);
    const move = (to: number) => { event.preventDefault(); focusables[(to + focusables.length) % focusables.length]?.focus(); };
    if (event.key === "Escape") close();
    else if (event.key === "ArrowUp") move(index + 1); // bubbles stack upward
    else if (event.key === "ArrowDown") move(index - 1);
    else if (event.key === "Home" && index > 0) move(1);
    else if (event.key === "End" && index > 0) move(focusables.length - 1);
    else if (event.key === "Tab") move(index + (event.shiftKey ? -1 : 1)); // focus trap
  };

  const spring = reduced ? { duration: 0 } : { type: "spring" as const, stiffness: 420, damping: 22 };

  return (
    <div ref={rootRef} className="fixed bottom-4 right-4 z-50" onKeyDown={open ? onKeyDown : undefined}>
      <AnimatePresence>
        {open && (
          <motion.div id="bubble-menu" role="dialog" aria-modal="true" aria-label="Menú de secciones" className="absolute bottom-20 right-0 flex w-64 flex-col items-end gap-2"
            initial={{ opacity: 1 }} exit={{ opacity: 0, transition: { duration: reduced ? 0 : 0.15 } }}>
            <motion.div aria-hidden className="shape-splat pointer-events-none absolute -bottom-24 -right-10 size-44 bg-hoodie/90"
              initial={{ scale: 0, rotate: -40 }} animate={{ scale: 1, rotate: 0 }} transition={spring} />
            <ul role="menu" aria-label="Secciones" className="relative flex flex-col-reverse items-end gap-2">
              {visible.map((section, i) => {
                const isActive = section.id === active;
                const curve = Math.sin((i / Math.max(visible.length - 1, 1)) * Math.PI) * 44;
                return (
                  <motion.li key={section.id} role="none" style={{ marginRight: curve }}
                    initial={{ opacity: 0, scale: 0.3, x: 40, y: 30 }} animate={{ opacity: 1, scale: 1, x: 0, y: 0, rotate: i % 2 ? 3 : -3 }}
                    transition={{ ...spring, delay: reduced ? 0 : i * 0.04 }}>
                    <a role="menuitem" href={`#${section.id}`} aria-current={isActive ? "location" : undefined} onClick={() => close(false)}
                      className={`relative block rounded-full border-[3px] border-ink px-4 py-1.5 font-spray text-lg tracking-wide shadow-sticker transition-transform duration-150 hover:-translate-y-0.5 ${isActive ? "bg-denim text-paper" : `${FILLS[i % FILLS.length]} text-ink`}`}>
                      {section.label}
                      {isActive && <span aria-hidden className="animate-drip absolute -bottom-3 left-1/2 h-4 w-2 origin-top rounded-b-full bg-denim" />}
                    </a>
                  </motion.li>
                );
              })}
              {visible.length === 0 && <li role="none" className="bg-paper px-3 py-1 font-marker text-ink shadow-sticker">Nada con “{query}”</li>}
            </ul>
            <label className="relative w-full">
              <span className="sr-only">Buscar sección</span>
              <input ref={searchRef} type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar sección…"
                className="w-full border-[3px] border-ink bg-paper px-3 py-2 font-marker text-ink shadow-sticker placeholder:text-concrete" />
            </label>
          </motion.div>
        )}
      </AnimatePresence>
      <motion.button ref={canRef} type="button" aria-expanded={open} aria-controls="bubble-menu" aria-label={open ? "Cerrar menú" : "Abrir menú"}
        onClick={() => (open ? close() : setOpen(true))} whileTap={reduced ? undefined : { scaleY: 0.85, scaleX: 1.1 }}
        animate={reduced ? undefined : { rotate: open ? -20 : 0 }} transition={spring}
        className="grid size-16 place-items-center rounded-full border-[3px] border-ink bg-mustard text-ink shadow-sticker">
        <Icon name="spray" size={34} />
      </motion.button>
    </div>
  );
}
