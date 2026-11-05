import type { Metadata, Viewport } from "next";
import { Archivo, JetBrains_Mono, Permanent_Marker, Rubik_Spray_Paint, Sedgwick_Ave_Display } from "next/font/google";
import { shortPhrase } from "@/lib/domain";
import { getPortfolio } from "@/lib/patterns";
import "./globals.css";

const spray = Rubik_Spray_Paint({ weight: "400", subsets: ["latin"], variable: "--font-rubik-spray", display: "swap" });
const tag = Sedgwick_Ave_Display({ weight: "400", subsets: ["latin"], variable: "--font-sedgwick", display: "swap" });
const marker = Permanent_Marker({ weight: "400", subsets: ["latin"], variable: "--font-permanent-marker", display: "swap" });
const archivo = Archivo({ weight: ["400", "600", "800"], subsets: ["latin"], variable: "--font-archivo", display: "swap" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains", display: "swap" });

const fontVariables = [spray, tag, marker, archivo, mono].map((font) => font.variable).join(" ");

export async function generateMetadata(): Promise<Metadata> {
  const { profile } = await getPortfolio();
  const title = `${profile.fullName} · ${profile.role}`;
  const description = `${shortPhrase(profile)} ${profile.goal}. ${profile.location}.`;
  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
    title: { default: title, template: `%s · ${profile.tag}` },
    description,
    authors: [{ name: profile.fullName, url: profile.socials.find((s) => s.kind === "github")?.url }],
    openGraph: { type: "website", locale: "es_CO", title, description, siteName: profile.tag },
    twitter: { card: "summary_large_image", title, description },
  };
}

export const viewport: Viewport = { themeColor: "#17181c", colorScheme: "dark" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`scroll-smooth ${fontVariables}`}>
      <body className="min-h-dvh bg-asphalt text-paper antialiased">{children}</body>
    </html>
  );
}
