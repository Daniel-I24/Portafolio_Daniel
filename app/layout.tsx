import type { Metadata, Viewport } from "next";
import { Fraunces, IBM_Plex_Sans } from "next/font/google";
import { shortPhrase } from "@/lib/domain";
import { getPortfolio } from "@/lib/patterns";
import { siteUrl } from "@/lib/site";
import "./globals.css";

// Both families are on the hero (name, surname in italics, role, text, buttons), so both are preloaded.
// `swap` paints text at once; the metric-matched fallback (adjustFontFallback) keeps the later swap from moving layout.
const fraunces = Fraunces({
  subsets: ["latin"], axes: ["opsz"], style: ["normal", "italic"], variable: "--font-fraunces",
  display: "swap", preload: true, adjustFontFallback: true, fallback: ["Georgia", "serif"],
});
const plex = IBM_Plex_Sans({
  weight: ["400", "500", "600"], subsets: ["latin"], variable: "--font-plex",
  display: "swap", preload: true, adjustFontFallback: true, fallback: ["system-ui", "sans-serif"],
});

/**
 * Runs before paint: sets the animations state (the saved choice, else off only with OS reduced motion)
 * and skips the loader on repeat visits or with animations off, so neither flashes before hydration.
 */
const PREFS_SCRIPT = `try{var d=document.documentElement,m=localStorage.getItem("motion");d.dataset.motion=m==="on"||m==="off"?m:matchMedia("(prefers-reduced-motion: reduce)").matches?"off":"on";if(sessionStorage.getItem("intro")||d.dataset.motion==="off")d.dataset.intro="seen"}catch(e){}`;

export async function generateMetadata(): Promise<Metadata> {
  const { profile } = await getPortfolio();
  const title = `${profile.fullName} · ${profile.role}`;
  const description = `${shortPhrase(profile)} ${profile.goal}. ${profile.location}.`;
  return {
    // Icons (icon.svg, favicon.ico, apple-icon.png) and the Open Graph image come from files in app/.
    metadataBase: siteUrl(),
    title: { default: title, template: `%s · ${profile.displayName}` },
    description,
    applicationName: `${profile.displayName} · Portafolio`,
    authors: [{ name: profile.fullName, url: profile.socials.find((s) => s.kind === "github")?.url }],
    creator: profile.fullName,
    keywords: ["desarrollador full stack", "portafolio", "Next.js", "Angular", "Spring Boot", "Kotlin", "Pasto", "Colombia", profile.fullName],
    alternates: { canonical: "/" },
    robots: { index: true, follow: true },
    openGraph: { type: "profile", locale: "es_CO", url: "/", title, description, siteName: profile.displayName },
    twitter: { card: "summary_large_image", title, description },
    formatDetection: { telephone: false, email: false, address: false },
  };
}

export const viewport: Viewport = { themeColor: "#021a2a", colorScheme: "dark" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`scroll-smooth ${fraunces.variable} ${plex.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: PREFS_SCRIPT }} />
      </head>
      <body className="min-h-dvh text-ice antialiased">{children}</body>
    </html>
  );
}
