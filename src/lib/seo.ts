import { SITE_URL } from "@/lib/business-info";

// Public pages listed in sitemap.xml. Add a path here when a new public route appears;
// staff-only routes (/admin) stay out.
export const SITEMAP_PATHS = ["/", "/privacy"] as const;

export type SitemapPath = (typeof SITEMAP_PATHS)[number];

export function absoluteUrl(path: string) {
  return path === "/" ? `${SITE_URL}/` : `${SITE_URL}${path}`;
}

// Per-page head tags shared by every public route: the canonical link plus the Open Graph /
// Twitter tags that need the page's own title, description and URL. Social networks and
// Twitter fall back to og:* for anything twitter:* doesn't set.
export function seoHead({
  path,
  title,
  description,
  ogDescription = description,
}: {
  path: SitemapPath;
  title: string;
  description: string;
  ogDescription?: string;
}) {
  const url = absoluteUrl(path);
  return {
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: ogDescription },
      { property: "og:url", content: url },
      { property: "og:type", content: "website" },
      { property: "og:locale", content: "ru_RU" },
      { property: "og:site_name", content: "APELSIN INDUSTRIAL" },
      // og:image must be an absolute URL: crawlers don't resolve relative paths.
      { property: "og:image", content: absoluteUrl("/og-image.png") },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "Логотип APELSIN INDUSTRIAL" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: url }],
  };
}
