import type { Metadata, Viewport } from "next";
import { Fraunces, IBM_Plex_Sans } from "next/font/google";
import { shortPhrase } from "@/lib/domain";
import { getPortfolio } from "@/lib/patterns";
import "./globals.css";

const fraunces = Fraunces({ subsets: ["latin"], axes: ["opsz"], style: ["normal", "italic"], variable: "--font-fraunces", display: "swap" });
const plex = IBM_Plex_Sans({ weight: ["400", "500", "600"], subsets: ["latin"], variable: "--font-plex", display: "swap" });

/**
 * Runs before paint: sets the animations state (the saved choice, else off only with OS reduced motion)
 * and skips the intro on repeat visits or with animations off, so neither flashes before hydration.
 */
const PREFS_SCRIPT = `try{var d=document.documentElement,m=localStorage.getItem("motion");d.dataset.motion=m==="on"||m==="off"?m:matchMedia("(prefers-reduced-motion: reduce)").matches?"off":"on";if(sessionStorage.getItem("intro")||d.dataset.motion==="off")d.dataset.intro="seen"}catch(e){}`;

export async function generateMetadata(): Promise<Metadata> {
  const { profile } = await getPortfolio();
  const title = `${profile.fullName} · ${profile.role}`;
  const description = `${shortPhrase(profile)} ${profile.goal}. ${profile.location}.`;
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
    title: { default: title, template: `%s · ${profile.displayName}` },
    description,
    authors: [{ name: profile.fullName, url: profile.socials.find((s) => s.kind === "github")?.url }],
    openGraph: { type: "website", locale: "es_CO", title, description, siteName: profile.displayName },
    twitter: { card: "summary_large_image", title, description },
  };
}

export const viewport: Viewport = { themeColor: "#f2eee5", colorScheme: "light" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${fraunces.variable} ${plex.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: PREFS_SCRIPT }} />
      </head>
      <body className="min-h-dvh bg-paper text-ink antialiased">{children}</body>
    </html>
  );
}
