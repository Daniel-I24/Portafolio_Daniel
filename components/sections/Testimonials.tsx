import Image from "next/image";
import { Carousel } from "@/components/ui/Carousel";
import { Reveal } from "@/components/ui/Reveal";
import { Section } from "@/components/ui/Section";
import type { TestimonialData } from "@/lib/schemas";

export type TestimonialView = TestimonialData & { initials: string };

/** Avatar tones for people without a photo; text color keeps 4.5:1 on each. */
const TONES = ["bg-navy text-ice", "bg-mist text-abyss", "bg-slate text-ice"];

function Avatar({ person, tone }: { person: TestimonialView; tone: string }) {
  if (person.avatarUrl) {
    return <Image src={person.avatarUrl} alt="" width={56} height={56} className="size-14 rounded-full object-cover" />;
  }
  return <span aria-hidden className={`grid size-14 shrink-0 place-items-center rounded-full font-display text-lg font-semibold ${tone}`}>{person.initials}</span>;
}

export function Testimonials({ testimonials }: { testimonials: TestimonialView[] }) {
  if (testimonials.length === 0) return null;
  return (
    <Section id="testimonios" title="Testimonios" lead="Personas que han trabajado conmigo o han usado lo que construyo." surface="bone">
      <Reveal className="max-w-3xl">
        <Carousel label="Testimonios" slides={testimonials.map((person, i) => (
          <figure key={person.id} className="flex h-full flex-col rounded-3xl border border-line bg-abyss p-7 sm:p-10">
            <span aria-hidden className="font-display text-[4rem] leading-none text-sky">“</span>
            <blockquote className="mt-2 flex-1 font-display text-lg leading-relaxed text-ice sm:text-xl">
              <p>{person.quote}</p>
            </blockquote>
            <figcaption className="mt-8 flex items-center gap-4 border-t border-line pt-6">
              <Avatar person={person} tone={TONES[i % TONES.length]} />
              <span>
                <span className="block font-semibold">{person.name}</span>
                {person.role && <span className="block text-sm text-mist">{person.role}</span>}
              </span>
            </figcaption>
          </figure>
        ))} />
      </Reveal>
    </Section>
  );
}
