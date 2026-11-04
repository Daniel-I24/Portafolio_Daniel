"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { SectionTitle } from "@/components/ui/SectionTitle";
import type { TestimonialData } from "@/lib/schemas";
import { CircularQueue } from "@/lib/structures";

export type TestimonialView = TestimonialData & { initials: string };

const ROTATE_MS = 6000;
const TONES = ["bg-hoodie", "bg-mustard", "bg-slime"];
const controlClass = "grid size-12 place-items-center border-[3px] border-ink bg-paper text-ink shadow-sticker-sm transition-colors duration-150 hover:bg-mustard";

function Avatar({ person, tone, size }: { person: TestimonialView; tone: string; size: "sm" | "lg" }) {
  const box = size === "lg" ? "size-16 text-2xl" : "size-11 text-base";
  if (person.avatarUrl) {
    return <Image src={person.avatarUrl} alt="" width={64} height={64} className={`${box} sticker-cut rounded-full object-cover`} />;
  }
  return <span aria-hidden className={`${box} ${tone} sticker-cut grid place-items-center rounded-full font-spray text-ink`}>{person.initials}</span>;
}

export function Testimonials({ testimonials }: { testimonials: TestimonialView[] }) {
  const reduced = useReducedMotion();
  const queue = useMemo(() => new CircularQueue(testimonials), [testimonials]);
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [hovered, setHovered] = useState(false);
  const [stopped, setStopped] = useState(false);

  const move = useCallback((target: number, dir: number) => {
    setDirection(dir);
    queue.goTo(target);
    setIndex(queue.index);
  }, [queue]);
  const next = useCallback(() => move(queue.index + 1, 1), [move, queue]);
  const prev = () => move(queue.index - 1, -1);

  useEffect(() => {
    if (hovered || stopped || reduced || queue.size < 2) return;
    const timer = setInterval(next, ROTATE_MS);
    return () => clearInterval(timer);
  }, [hovered, stopped, reduced, next, queue.size]);

  const current = queue.current;
  if (!current) return null;

  return (
    <section id="testimonios" aria-labelledby="testimonios-title" className="scroll-mt-16 px-4 py-24 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <SectionTitle id="testimonios-title" kicker="lo que dicen en la calle" tone="hoodie">Testimonios</SectionTitle>

        <div role="region" aria-roledescription="carrusel" aria-label="Testimonios" className="mt-14"
          onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
          onFocus={() => setHovered(true)} onBlur={() => setHovered(false)}>
          <AnimatePresence mode="wait" custom={direction} initial={false}>
            <motion.figure key={current.id} aria-roledescription="diapositiva" aria-label={`${index + 1} de ${queue.size}`}
              custom={direction}
              initial={reduced ? false : { opacity: 0, x: direction * 60, rotate: direction * 2 }}
              animate={{ opacity: 1, x: 0, rotate: 0 }}
              exit={reduced ? undefined : { opacity: 0, x: direction * -60, rotate: direction * -2 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              drag={reduced ? false : "x"} dragConstraints={{ left: 0, right: 0 }} dragElastic={0.4}
              onDragEnd={(_, info) => (info.offset.x < -60 ? next() : info.offset.x > 60 ? prev() : undefined)}
              className="cursor-grab touch-pan-y active:cursor-grabbing">
              <blockquote className="relative rounded-[2.5rem] border-[3px] border-ink bg-paper px-6 py-8 text-ink shadow-sticker-lg sm:px-12 sm:py-12">
                <p className="text-lg leading-relaxed sm:text-xl">“{current.quote}”</p>
                <svg aria-hidden viewBox="0 0 48 36" className="absolute -bottom-[33px] left-14 w-12 overflow-visible">
                  <path d="M2-3L10 32 42-3" fill="var(--color-paper)" stroke="var(--color-ink)" strokeWidth={3} strokeLinejoin="round" />
                </svg>
              </blockquote>
              <figcaption className="ml-6 mt-12 flex items-center gap-4">
                <Avatar person={current} tone={TONES[index % TONES.length]} size="lg" />
                <span>
                  <span className="block font-marker text-xl text-paper">{current.name}</span>
                  <span className="block font-mono text-sm text-cement">{current.role}</span>
                </span>
              </figcaption>
            </motion.figure>
          </AnimatePresence>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <button type="button" onClick={prev} aria-label="Testimonio anterior" className={controlClass}>
              <Icon name="arrow" size={22} className="rotate-180" />
            </button>
            <button type="button" onClick={next} aria-label="Testimonio siguiente" className={controlClass}>
              <Icon name="arrow" size={22} />
            </button>
            <ul className="flex gap-3" aria-label="Elegir testimonio">
              {testimonials.map((person, i) => (
                <li key={person.id}>
                  <button type="button" onClick={() => move(i, i > index ? 1 : -1)} aria-label={`Ver testimonio de ${person.name}`} aria-current={i === index || undefined}
                    className={`block rounded-full transition-transform duration-150 hover:-translate-y-1 ${i === index ? "-translate-y-1 outline-3 outline-offset-2 outline-denim" : "opacity-70"}`}>
                    <Avatar person={person} tone={TONES[i % TONES.length]} size="sm" />
                  </button>
                </li>
              ))}
            </ul>
            {!reduced && (
              <button type="button" onClick={() => setStopped((s) => !s)} aria-pressed={stopped}
                className="ml-auto font-mono text-sm text-paper underline decoration-mustard decoration-2 underline-offset-4">
                {stopped ? "Reanudar rotación" : "Pausar rotación"}
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
