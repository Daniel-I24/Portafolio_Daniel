import { existsSync } from "node:fs";
import { join } from "node:path";
import { About } from "@/components/sections/About";
import { Contact } from "@/components/sections/Contact";
import { Experience } from "@/components/sections/Experience";
import { Footer } from "@/components/sections/Footer";
import { Hero } from "@/components/sections/Hero";
import { Navbar } from "@/components/sections/Navbar";
import { OffTheClock } from "@/components/sections/OffTheClock";
import { Projects } from "@/components/sections/Projects";
import { Testimonials } from "@/components/sections/Testimonials";
import { BubbleMenu } from "@/components/ui/BubbleMenu";
import { AcademicExperience } from "@/lib/domain";
import { getPortfolio } from "@/lib/patterns";
import type { ProfileData } from "@/lib/schemas";

const CV_PENDING = "El CV se está actualizando: muy pronto podrás descargarlo.";

/** A local CV path must exist in public/; remote URLs (Supabase Storage) are trusted. */
const cvMissing = ({ cvUrl }: ProfileData) =>
  !cvUrl || (cvUrl.startsWith("/") && !existsSync(join(process.cwd(), "public", cvUrl)));

// Sections follow the course order: Navbar → Hero → About → Projects → Testimonials → Experience → Contact → extra → Footer.
// Client sections receive plain views: class instances cannot cross the server/client boundary,
// so the polymorphic methods (badge, accent, icon, secondaryAction…) are resolved here.
export default async function HomePage() {
  const { profile, projects, testimonials, experience, skills, interests } = await getPortfolio();
  const cvNote = cvMissing(profile) ? CV_PENDING : undefined;
  const socials = profile.socials.map(({ label, url, kind }) => ({ label, url, icon: kind }));
  const studies = experience.find((item) => item instanceof AcademicExperience);

  return (
    <>
      <Navbar profile={profile} cvNote={cvNote} />
      <main id="contenido" className="overflow-x-clip">
        <Hero profile={profile} cvNote={cvNote} />
        <About
          profile={profile}
          skills={skills.map((skill) => skill.data)}
          studies={studies ? `${studies.data.title} · ${studies.data.place.split("·")[0].trim()}` : ""}
          interests={interests.map((interest) => interest.data.title)}
        />
        <Projects projects={projects.map((project) => ({ ...project.data, action: project.secondaryAction() }))} />
        <Testimonials testimonials={testimonials.map((t) => ({ ...t.data, initials: t.initials }))} />
        <Experience items={experience.map((e) => ({ ...e.data, badge: e.badge(), accent: e.accent(), icon: e.icon() }))} />
        <Contact email={profile.email} socials={socials} />
        <OffTheClock
          interests={interests.map((interest) => interest.data)}
          skills={skills.map((skill) => ({ ...skill.data, levelLabel: skill.levelLabel, fill: skill.fill }))}
        />
      </main>
      <Footer profile={profile} socials={[...socials, { label: "Correo", url: `mailto:${profile.email}`, icon: "mail" }]} />
      <BubbleMenu />
    </>
  );
}
