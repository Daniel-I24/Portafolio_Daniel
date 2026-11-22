import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

/** Everything is public except the admin panel and the login callback. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/auth"] },
    sitemap: new URL("/sitemap.xml", siteUrl()).href,
    host: siteUrl().origin,
  };
}
