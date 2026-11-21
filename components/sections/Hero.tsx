import Image from "next/image";
import type { CSSProperties } from "react";
import { ButtonLink } from "@/components/ui/Button";
import { CvButton } from "@/components/ui/CvButton";
import { Glow } from "@/components/ui/Glow";
import { Icon } from "@/components/ui/Icon";
import { container, sectionNumber } from "@/components/ui/Section";
import { TiltPhoto } from "@/components/ui/TiltPhoto";
import { shortPhrase } from "@/lib/domain";
import type { ProfileData } from "@/lib/schemas";

/** Position in the CSS entrance sequence that starts as the loader dissolves (see globals.css). */
const step = (i: number) => ({ style: { "--i": i } as CSSProperties });

/** A word whose letters rise one by one from behind a mask. */
const MaskedWord = ({ word }: { word: string }) => (
  <span className="-mb-[0.1em] block w-fit overflow-clip pb-[0.1em]">
    {[...word].map((char, i) => <span key={i} {...step(i)} className="letter inline-block">{char}</span>)}
  </span>
);

/** The surname: an outline wipes in like a pen stroke, the ink fills it, then a swash is drawn underneath. */
const DrawnWord = ({ word }: { word: string }) => (
  <span className="relative block w-fit pr-[0.08em]">
    <em {...step(4)} className="draw block font-medium text-transparent [-webkit-text-stroke:1.5px_var(--color-sky)]">{word}</em>
    <em {...step(11)} className="ink-in absolute inset-0 block font-medium text-sky">{word}</em>
    <svg viewBox="0 0 300 20" preserveAspectRatio="none" className="absolute -bottom-[0.12em] left-[2%] h-[0.16em] w-[96%] overflow-visible">
      <path {...step(12)} d="M4 14 C 70 4, 170 2, 296 10" pathLength={1} strokeDasharray="1 1.2" fill="none" stroke="var(--color-steel)" strokeWidth={5} strokeLinecap="round" className="swash" />
    </svg>
  </span>
);

export function Hero({ profile, cvNote }: { profile: ProfileData; cvNote?: string }) {
  const [first, ...rest] = profile.displayName.split(" ");
  const role = <>{profile.role}{profile.goal && <span className="text-mist"> · {profile.goal}</span>}</>;

  return (
    <section id="inicio" aria-labelledby="inicio-title" className="relative isolate scroll-mt-20 overflow-x-clip pb-16 pt-24 sm:pb-24 sm:pt-36 lg:pt-40">
      <div className={`${container} grid items-center gap-12 sm:gap-16 lg:grid-cols-[1.2fr_0.95fr] lg:gap-20`}>
        <div>
          <p {...step(0)} className="enter text-sm font-medium uppercase tracking-[0.12em] text-mist">
            <span className="text-sky">{sectionNumber("inicio")}</span> — Inicio
          </p>

          <h1 id="inicio-title" className="mt-5 font-display text-hero font-semibold tracking-[-0.025em] [font-variation-settings:'opsz'_144] sm:mt-7">
            <span aria-hidden className="block">
              <MaskedWord word={first} />
              <DrawnWord word={rest.join(" ")} />
            </span>
            <span className="sr-only">{profile.displayName} — {profile.fullName}</span>
          </h1>

          {/* Blur to sharp without animating a filter: a pre-blurred copy fades out over the sharp one. */}
          <p className="mt-8 grid font-display text-lg font-medium sm:text-xl">
            <span aria-hidden {...step(6)} className="unblur text-transparent [grid-area:1/1] [text-shadow:0_0_14px_var(--color-ice)] [&_*]:text-transparent">{role}</span>
            <span {...step(6)} className="sharpen [grid-area:1/1]">{role}</span>
          </p>
          <p {...step(7)} className="enter mt-4 max-w-[46ch] text-lg text-mist">{shortPhrase(profile)}</p>

          <div {...step(8)} className="enter mt-9 flex flex-wrap items-center gap-3">
            <ButtonLink href="#proyectos" icon="arrow">Ver proyectos</ButtonLink>
            <CvButton href={profile.cvUrl} missingNote={cvNote} />
          </div>
          {profile.location && (
            <p {...step(9)} className="enter mt-6 inline-flex items-center gap-2 text-sm text-mist">
              <Icon name="pin" size={18} className="text-sky" />
              {profile.location}
            </p>
          )}
        </div>

        {profile.photo && (
          <figure {...step(2)} className="enter relative isolate order-first mx-auto w-full max-w-52 sm:max-w-72 lg:order-none lg:max-w-110 lg:justify-self-end">
            {/* On phones the text sits right below the photo: the halo stays short there to keep 4.5:1. */}
            <Glow className="-inset-x-[22%] -bottom-[12%] -top-[18%] sm:-inset-x-[22%] sm:-top-[20%] sm:-bottom-[32%]" />
            <TiltPhoto>
              {/* The file has white rounded corners: a CSS clip with a softer radius and a slight zoom keeps them out
                  of view without touching the image. The LED tube follows the frame radius (TiltPhoto). */}
              <div className="overflow-hidden rounded-[11%/12.5%]">
                <Image src={profile.photo} alt={`Foto de ${profile.fullName}`} width={1002} height={880}
                  sizes="(min-width: 1024px) 440px, (min-width: 640px) 288px, 208px" priority className="h-auto w-full origin-[50%_45%] scale-[1.2]" />
              </div>
            </TiltPhoto>
            <figcaption className="absolute -bottom-3 -left-3 z-10 -rotate-3 rounded-xl bg-mist px-3 py-2 text-sm font-semibold text-abyss shadow-lift sm:-left-5 sm:bottom-8 sm:px-4 sm:py-2.5">
              {profile.fullName}
            </figcaption>
          </figure>
        )}
      </div>
    </section>
  );
}
