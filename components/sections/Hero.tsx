import Image from "next/image";
import type { CSSProperties } from "react";
import { ButtonLink } from "@/components/ui/Button";
import { CvButton } from "@/components/ui/CvButton";
import { Icon } from "@/components/ui/Icon";
import { container, sectionNumber } from "@/components/ui/Section";
import { shortPhrase } from "@/lib/domain";
import type { ProfileData } from "@/lib/schemas";

/** Staggered CSS entrance that starts when the intro curtain lifts (see `.enter` in globals.css). */
const step = (i: number) => ({ style: { "--i": i } as CSSProperties });

export function Hero({ profile, cvNote }: { profile: ProfileData; cvNote?: string }) {
  const [first, ...rest] = profile.displayName.split(" ");
  return (
    <section id="inicio" aria-labelledby="inicio-title" className="scroll-mt-20 pb-20 pt-32 sm:pb-28 sm:pt-40">
      <div className={`${container} grid items-center gap-14 lg:grid-cols-[1.25fr_0.9fr] lg:gap-20`}>
        <div>
          <div {...step(0)} className="enter flex flex-wrap items-center gap-3">
            {profile.availability && (
              <p className="inline-flex items-center gap-2 rounded-full border border-line bg-card px-3.5 py-2 text-sm font-medium text-pine">
                <span aria-hidden className="size-2 rounded-full bg-pine motion-safe:animate-pulse" />
                {profile.availability}
              </p>
            )}
            <p className="text-sm font-medium uppercase tracking-[0.12em] text-muted"><span className="text-rust">{sectionNumber("inicio")}</span> — Inicio</p>
          </div>

          <h1 id="inicio-title" {...step(1)} className="enter mt-7 font-display text-hero font-semibold tracking-[-0.025em] [font-variation-settings:'opsz'_144]">
            {first}
            <br />
            <em className="font-medium text-rust">{rest.join(" ")}</em>
            <span className="sr-only"> — {profile.fullName}</span>
          </h1>

          <p {...step(2)} className="enter mt-7 font-display text-lg font-medium sm:text-xl">
            {profile.role}
            {profile.goal && <span className="text-muted"> · {profile.goal}</span>}
          </p>
          <p {...step(3)} className="enter mt-4 max-w-[46ch] text-lg text-muted">{shortPhrase(profile)}</p>

          <div {...step(4)} className="enter mt-9 flex flex-wrap items-center gap-3">
            <ButtonLink href="#proyectos" icon="arrow">Ver proyectos</ButtonLink>
            <CvButton href={profile.cvUrl} missingNote={cvNote} />
          </div>
          {profile.location && (
            <p {...step(5)} className="enter mt-6 inline-flex items-center gap-2 text-sm text-muted">
              <Icon name="pin" size={18} className="text-rust" />
              {profile.location}
            </p>
          )}
        </div>

        {profile.photo && (
          <figure {...step(2)} className="enter relative mx-auto w-full max-w-85 lg:max-w-110 lg:justify-self-end">
            <div className="rotate-[1.5deg] rounded-[1.75rem] border border-line bg-card p-3.5 shadow-lift transition-transform duration-300 hover:rotate-0">
              <Image src={profile.photo} alt={`Foto de ${profile.fullName}`} width={1002} height={880}
                sizes="(min-width: 1024px) 440px, 340px" priority className="h-auto w-full" />
            </div>
            <figcaption className="absolute -left-2 bottom-8 -rotate-3 rounded-xl bg-marigold px-4 py-2.5 text-sm font-semibold text-ink shadow-lift sm:-left-5">
              {profile.fullName}
            </figcaption>
          </figure>
        )}
      </div>
    </section>
  );
}
