import { SITE_URL } from "@/lib/business-info";

// Public pages listed in sitemap.xml. Add a path here when a new public route appears;
// staff-only routes (/admin) stay out.
export const SITEMAP_PATHS = ["/", "/detailing", "/privacy"] as const;

// Pages still showing draft copy the company hasn't confirmed: kept out of the sitemap and
// marked noindex, so search engines don't pick up services that may be wrong. Move a path to
// SITEMAP_PATHS once its copy is real.
export const DRAFT_PATHS = ["/metal-workshop"] as const;

export type SitemapPath = (typeof SITEMAP_PATHS)[number];
type DraftPath = (typeof DRAFT_PATHS)[number];

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
  path: SitemapPath | DraftPath;
  title: string;
  description: string;
  ogDescription?: string;
}) {
  const url = absoluteUrl(path);
  // One tag only: TanStack Router keeps a single meta per `name`, so a second robots tag would
  // silently replace the first. No nofollow: the links on a draft page lead to indexed pages.
  const isDraft = (DRAFT_PATHS as readonly string[]).includes(path);
  const robots = isDraft ? [{ name: "robots", content: "noindex" }] : [];

  return {
    meta: [
      ...robots,
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
