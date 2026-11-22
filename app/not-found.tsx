import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/Button";
import { LavaLamp } from "@/components/ui/LavaLamp";
import { container } from "@/components/ui/Section";

export const metadata: Metadata = { title: "Página no encontrada", robots: { index: false } };

/** 404 with the site's look: the lava backdrop (still, no JS here), a large serif number and the way back home. */
export default function NotFound() {
  return (
    <main id="contenido" className="relative isolate grid min-h-dvh place-items-center overflow-x-clip py-24">
      <LavaLamp />
      <div className={`${container} max-w-3xl`}>
        <p className="text-sm font-medium uppercase tracking-[0.12em] text-mist">
          <span className="text-sky">404</span> — Página no encontrada
        </p>
        <h1 className="mt-5 font-display text-hero font-semibold tracking-[-0.025em] [font-variation-settings:'opsz'_144]">
          Aquí <em className="font-medium text-sky">no hay</em> nada
        </h1>
        <p className="mt-8 max-w-[46ch] text-lg text-mist">
          El enlace está roto o la página cambió de lugar. Todo el portafolio vive en una sola página: vuelve al inicio y sigue desde ahí.
        </p>
        <div className="mt-9 flex flex-wrap gap-3">
          <ButtonLink href="/" icon="arrow">Volver al inicio</ButtonLink>
          <ButtonLink href="/#proyectos" variant="outline">Ver proyectos</ButtonLink>
        </div>
      </div>
    </main>
  );
}
