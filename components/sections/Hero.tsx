import dynamic from "next/dynamic";
import Image from "next/image";
import { SprayButton } from "@/components/ui/SprayButton";
import { shortPhrase } from "@/lib/domain";
import type { ProfileData } from "@/lib/schemas";

// The animated scene ships in its own chunk; it still server-renders so the name is in the HTML.
const GraffitiWall = dynamic(() => import("@/components/ui/GraffitiWall"));

export function Hero({ profile }: { profile: ProfileData }) {
  return (
    <section id="inicio" className="scroll-mt-16 px-4 pb-20 pt-20 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <GraffitiWall name={profile.displayName} fullName={profile.fullName} />

        <div className="mt-12 grid items-start gap-12 md:grid-cols-[1fr_auto] md:gap-16">
          <div className="max-w-2xl">
            <p className="font-spray text-4xl leading-none text-paper sm:text-6xl">{profile.role}</p>
            <p className="mt-5 inline-block -rotate-3 border-[3px] border-ink bg-mustard px-3 py-1 font-marker text-lg text-ink shadow-sticker sm:text-xl">
              {profile.goal}
            </p>
            <p className="mt-6 text-lg leading-relaxed text-paper sm:text-xl">{shortPhrase(profile)}</p>
            <p className="mt-2 font-mono text-sm text-cement">{profile.location}</p>
            <div className="mt-8 flex flex-wrap items-center gap-5">
              <SprayButton href={profile.cvUrl} download icon="download">Descargar CV</SprayButton>
              <SprayButton href="#proyectos" icon="arrow" variant="secondary">Ver mis proyectos</SprayButton>
            </div>
          </div>

          <figure className="relative mx-auto w-60 rotate-3 bg-paper p-2 sticker-cut sm:w-72 md:mx-0 md:mt-4">
            <span aria-hidden className="absolute -top-4 left-4 z-10 h-7 w-24 -rotate-12 bg-mustard/70 shadow-sticker-sm" />
            <span aria-hidden className="absolute -bottom-3 right-2 z-10 h-7 w-20 rotate-[16deg] bg-mustard/70 shadow-sticker-sm" />
            <Image
              src={profile.photo}
              alt={`Foto de ${profile.displayName}`}
              width={1002}
              height={880}
              sizes="(min-width: 640px) 272px, 224px"
              priority
              className="h-auto w-full"
            />
            <figcaption className="mt-1 text-right font-tag text-2xl text-ink">{profile.tag}</figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
