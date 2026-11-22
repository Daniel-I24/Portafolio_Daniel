"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { CircularQueue } from "@/lib/structures";
import { iconButtonClass } from "./Button";
import { Icon } from "./Icon";
import { useCalm } from "./MotionProvider";

const INTERVAL = 7000; // ms per slide while playing

/**
 * Soft carousel over server-rendered slides. A CircularQueue holds the order (wraps both ways).
 * Slides stack in one grid cell and cross-fade (opacity + transform); hidden ones are inert.
 * Autoplay pauses on hover, on focus inside and with its own button; calm mode never autoplays.
 */
export function Carousel({ label, slides }: { label: string; slides: ReactNode[] }) {
  const calm = useCalm();
  const queue = useMemo(() => new CircularQueue(slides.map((_, i) => i)), [slides]);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const playing = !calm && !paused && !hovered && slides.length > 1;

  const step = (move: "next" | "prev") => setIndex(queue[move]() ?? 0);
  const goTo = (i: number) => setIndex(queue.goTo(i) ?? 0);

  useEffect(() => {
    if (!playing) return;
    const timer = setInterval(() => setIndex(queue.next() ?? 0), INTERVAL);
    return () => clearInterval(timer);
  }, [playing, queue]);

  return (
    <section aria-roledescription="carrusel" aria-label={label}
      onPointerEnter={() => setHovered(true)} onPointerLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)} onBlur={(event) => !event.currentTarget.contains(event.relatedTarget) && setHovered(false)}>
      <div className="grid" aria-live={playing ? "off" : "polite"}>
        {slides.map((slide, i) => (
          <div key={i} role="group" aria-roledescription="testimonio" aria-label={`${i + 1} de ${slides.length}`} inert={i !== index}
            className={`[grid-area:1/1] transition-[opacity,transform] duration-700 ease-(--ease-soft) ${i === index ? "opacity-100" : "pointer-events-none translate-x-6 opacity-0"}`}>
            {slide}
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-2" role="group" aria-label="Elegir testimonio">
          {slides.map((_, i) => (
            <button key={i} type="button" onClick={() => goTo(i)} aria-label={`Testimonio ${i + 1}`} aria-current={i === index}
              className="grid size-11 place-items-center">
              <span className={`block h-1.5 w-8 rounded-full transition-[transform,background-color] duration-300 ${i === index ? "bg-mist" : "scale-x-[0.375] bg-steel"}`} />
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {!calm && slides.length > 1 && (
            <button type="button" onClick={() => setPaused(!paused)} aria-pressed={paused} className={iconButtonClass}
              aria-label={paused ? "Reanudar el carrusel" : "Pausar el carrusel"}>
              <Icon name={paused ? "play" : "pause"} size={16} />
            </button>
          )}
          <button type="button" onClick={() => step("prev")} aria-label="Testimonio anterior" className={iconButtonClass}><Icon name="arrow" size={18} className="rotate-180" /></button>
          <button type="button" onClick={() => step("next")} aria-label="Testimonio siguiente" className={iconButtonClass}><Icon name="arrow" size={18} /></button>
        </div>
      </div>
    </section>
  );
}
