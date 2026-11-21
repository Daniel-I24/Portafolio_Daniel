import { existsSync } from "node:fs";
import { join } from "node:path";
import { About } from "@/components/sections/About";
import { Contact } from "@/components/sections/Contact";
import { Experience } from "@/components/sections/Experience";
import { Footer } from "@/components/sections/Footer";
import { Hero } from "@/components/sections/Hero";
import { Loader } from "@/components/sections/Loader";
import { Navbar } from "@/components/sections/Navbar";
import { OffTheClock } from "@/components/sections/OffTheClock";
import { Projects } from "@/components/sections/Projects";
import { Stats } from "@/components/sections/Stats";
import { Testimonials } from "@/components/sections/Testimonials";
import { Ambient } from "@/components/ui/Ambient";
import { LavaLamp } from "@/components/ui/LavaLamp";
import { Marquee } from "@/components/ui/Marquee";
import { MotionProvider } from "@/components/ui/MotionProvider";
import { SectionCurtain } from "@/components/ui/SectionCurtain";
import { KIND_LABELS } from "@/lib/domain";
import { getPortfolio } from "@/lib/patterns";
import type { ProfileData } from "@/lib/schemas";

const CV_PENDING = "El CV se está actualizando: muy pronto podrás descargarlo.";

/** A local CV path must exist in public/; remote URLs (Supabase Storage) are trusted. */
const cvMissing = ({ cvUrl }: ProfileData) =>
  !cvUrl || (cvUrl.startsWith("/") && !existsSync(join(process.cwd(), "public", cvUrl)));

const initialsOf = (name: string) => name.split(/\s+/).slice(0, 2).map((word) => word[0]).join("").toUpperCase();

// Order: lava backdrop → loader → menu → hero → LED band → key figures → about → projects → testimonials → experience → beyond code → contact → footer.
// Client sections receive plain views: class instances cannot cross the server/client boundary,
// so the polymorphic methods (badge, accent, icon, links…) are resolved here.
export default async function HomePage() {
  const { profile, projects, testimonials, experience, skills, interests } = await getPortfolio();
  const cvNote = cvMissing(profile) ? CV_PENDING : undefined;
  const socials = profile.socials.map(({ label, url, kind }) => ({ label, url, icon: kind }));
  const platforms = [...new Set(projects.map((project) => project.kind))].map((kind) => KIND_LABELS[kind]);
  const techs = new Set(skills.map((skill) => skill.data.name.toLowerCase())).size;
  const techGroups = [...new Set(skills.map((skill) => skill.data.group))];

  return (
    <MotionProvider>
      <LavaLamp />
      <Loader initials={initialsOf(profile.displayName)} />
      <Navbar initials={initialsOf(profile.displayName)} name={profile.displayName} cvUrl={profile.cvUrl} cvNote={cvNote} />
      <main id="contenido" tabIndex={-1} className="overflow-x-clip outline-none">
        <Hero profile={profile} cvNote={cvNote} />
        <Marquee text={profile.role} />
        <Stats projects={projects.length} platforms={platforms} techs={techs} techGroups={techGroups} />
        <About profile={profile} skills={skills.map((skill) => skill.data)} />
        <Projects projects={projects.map((project) => ({ ...project.data, links: project.links() }))} />
        <Testimonials testimonials={testimonials.map((t) => ({ ...t.data, initials: t.initials }))} />
        <Experience items={experience.map((e) => ({ ...e.data, badge: e.badge(), accent: e.accent(), icon: e.icon() }))} />
        <OffTheClock interests={interests.map((interest) => ({ ...interest.data, icon: interest.icon }))} />
        <Contact email={profile.email} socials={socials} />
      </main>
      <SectionCurtain />
      <Ambient />
      <Footer profile={profile} socials={[...socials, { label: "Correo", url: `mailto:${profile.email}`, icon: "mail" }]} />
    </MotionProvider>
  );
}
