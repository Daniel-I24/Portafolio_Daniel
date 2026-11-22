"use client";

import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from "react";
import { Icon } from "./Icon";
import { useCalm } from "./MotionProvider";

interface GalleryProps {
  label: string;
  count: number;
  /** Changes when the filtered set changes, so the gallery returns to the start. */
  resetKey: string;
  children: ReactNode;
}

const DRAG_THRESHOLD = 6; // px before a press becomes a drag (and the click is swallowed)
const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Horizontal gallery: native scroll with snap (swipe on touch), arrows, mouse drag, arrow/Home/End keys,
 * a "03 / 10" counter and its own visible scrollbar in the palette (the native one is hidden).
 * Cards tilt toward the cursor through two CSS variables per card (no animation library).
 */
export function Gallery({ label, count, resetKey, children }: GalleryProps) {
  const calm = useCalm();
  const track = useRef<HTMLUListElement>(null);
  const [view, setView] = useState({ index: 0, start: true, end: count <= 1, size: 1, offset: 0 });
  const drag = useRef<{ x: number; left: number; moved: boolean } | null>(null);

  const measure = useCallback(() => {
    const el = track.current;
    if (!el) return;
    const max = Math.max(1, el.scrollWidth - el.clientWidth);
    const step = (el.firstElementChild as HTMLElement | null)?.offsetWidth ?? el.clientWidth;
    const end = el.scrollLeft > max - 4;
    setView({
      // At the far end several cards may be in view: the counter then shows the last one.
      index: end ? count - 1 : Math.min(count - 1, Math.round(el.scrollLeft / Math.max(1, step + 20))),
      start: el.scrollLeft < 4,
      end,
      size: Math.min(1, el.clientWidth / el.scrollWidth),
      offset: el.scrollLeft / max,
    });
  }, [count]);

  useEffect(() => {
    track.current?.scrollTo({ left: 0 });
    measure();
    addEventListener("resize", measure);
    return () => removeEventListener("resize", measure);
  }, [measure, resetKey]);

  const go = (direction: 1 | -1) => {
    const el = track.current;
    const step = (el?.firstElementChild as HTMLElement | null)?.offsetWidth ?? 0;
    el?.scrollBy({ left: direction * (step + 20), behavior: calm ? "auto" : "smooth" });
  };

  const onKeyDown = (event: KeyboardEvent<HTMLUListElement>) => {
    const keys: Record<string, () => void> = {
      ArrowRight: () => go(1), ArrowLeft: () => go(-1),
      Home: () => track.current?.scrollTo({ left: 0 }), End: () => track.current?.scrollTo({ left: track.current.scrollWidth }),
    };
    if (keys[event.key]) { event.preventDefault(); keys[event.key](); }
  };

  // Mouse drag (touch keeps native swipe). Snap is suspended while dragging.
  const onPointerDown = (event: PointerEvent<HTMLUListElement>) => {
    if (event.pointerType !== "mouse" || event.button !== 0 || !track.current) return;
    drag.current = { x: event.clientX, left: track.current.scrollLeft, moved: false };
  };
  const onPointerMove = (event: PointerEvent<HTMLUListElement>) => {
    const el = track.current;
    const card = (event.target as Element).closest<HTMLElement>("[data-tilt]");
    if (card && !calm && event.pointerType === "mouse") {
      const box = card.getBoundingClientRect();
      card.style.setProperty("--px", ((event.clientX - box.left) / box.width).toFixed(3));
      card.style.setProperty("--py", ((event.clientY - box.top) / box.height).toFixed(3));
    }
    if (!drag.current || !el) return;
    const dx = event.clientX - drag.current.x;
    if (Math.abs(dx) > DRAG_THRESHOLD) { drag.current.moved = true; el.dataset.dragging = ""; }
    if (drag.current.moved) el.scrollLeft = drag.current.left - dx;
  };
  const endDrag = () => {
    if (track.current) delete track.current.dataset.dragging;
    setTimeout(() => { drag.current = null; });
  };

  // overflow-anchor: none — when a filter changes the row height, the page must not jump to keep a card in place.
  return (
    <div className="[overflow-anchor:none]">
      <ul ref={track} tabIndex={0} aria-label={`${label}: usa las flechas del teclado para recorrerla`} onScroll={measure} onKeyDown={onKeyDown}
        onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={endDrag} onPointerLeave={endDrag}
        onClickCapture={(event) => { if (drag.current?.moved) { event.preventDefault(); event.stopPropagation(); } }}
        className="-mx-4 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-px-4 px-4 pb-10 pt-4 [scrollbar-width:none] data-[dragging]:cursor-grabbing data-[dragging]:snap-none data-[dragging]:select-none sm:-mx-8 sm:scroll-px-8 sm:px-8 lg:cursor-grab [&::-webkit-scrollbar]:hidden">
        {children}
      </ul>

      <div className="mt-2 flex items-center gap-5">
        {/* Custom scrollbar: shows how much of the row is in view and where; native scrolling does the work. */}
        <div aria-hidden className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-deep">
          <span className="absolute inset-y-0 left-0 rounded-full bg-steel shadow-glow transition-transform duration-150"
            style={{ width: `${view.size * 100}%`, transform: `translateX(${view.offset * (1 / view.size - 1) * 100}%)` }} />
        </div>
        <p className="text-sm font-medium tabular-nums text-mist" aria-live="polite" aria-atomic="true">
          <span className="sr-only">Proyecto </span><span className="text-ice">{pad(view.index + 1)}</span> / {pad(count)}
        </p>
        <div className="flex gap-2">
          {([-1, 1] as const).map((direction) => (
            <button key={direction} type="button" onClick={() => go(direction)} disabled={direction < 0 ? view.start : view.end}
              aria-label={direction < 0 ? "Proyecto anterior" : "Proyecto siguiente"}
              className="grid size-11 place-items-center rounded-full border border-steel text-ice transition-[background-color,color,opacity] duration-150 hover:bg-ice hover:text-abyss disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-ice">
              <Icon name="arrow" size={18} className={direction < 0 ? "rotate-180" : ""} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
