import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

/** One public page (the sections are anchors); /admin stays out. */
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: siteUrl().href, lastModified: new Date(), changeFrequency: "monthly", priority: 1 }];
}
