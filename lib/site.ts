import type { ProfileData } from "./schemas";

/**
 * Public address of the site, for metadata, sitemap, robots and structured data. NEXT_PUBLIC_SITE_URL wins;
 * on Vercel the production domain (a system variable) is the fallback, so links never point to localhost.
 */
export function siteUrl(): URL {
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL ?? process.env.VERCEL_URL;
  return new URL(process.env.NEXT_PUBLIC_SITE_URL ?? (vercel ? `https://${vercel}` : "http://localhost:3000"));
}

/** schema.org Person for search engines (JSON-LD). Only public profile data; the email stays out. */
export function personJsonLd(profile: ProfileData, skills: string[]): string {
  const url = siteUrl().href;
  const person = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.fullName,
    alternateName: profile.displayName,
    jobTitle: profile.role,
    description: profile.tagline || profile.about,
    url,
    image: profile.photo ? new URL(profile.photo, url).href : undefined,
    address: profile.location ? { "@type": "PostalAddress", addressLocality: profile.location } : undefined,
    sameAs: profile.socials.map((social) => social.url),
    knowsAbout: skills,
  };
  // "<" escaped so the JSON can never close the script tag.
  return JSON.stringify(person).replace(/</g, "\u003c");
}
