import { Hero } from "@/components/sections/Hero";
import { Navbar } from "@/components/sections/Navbar";
import { BubbleMenu } from "@/components/ui/BubbleMenu";
import { getPortfolio } from "@/lib/patterns";

// Sections follow the course order: Navbar → Hero → About → Projects → Testimonials → Experience → Contact → extra → Footer.
// Phase 3 adds the remaining sections after Hero.
export default async function HomePage() {
  const { profile } = await getPortfolio();
  return (
    <>
      <Navbar profile={profile} />
      <main id="contenido">
        <Hero profile={profile} />
      </main>
      <BubbleMenu />
    </>
  );
}
