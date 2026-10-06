import { createFileRoute } from "@tanstack/react-router";
import { SITEMAP_PATHS, absoluteUrl } from "@/lib/seo";

// No <lastmod>: without a real per-page change date it would be a guess, and Google ignores
// lastmod values it finds unreliable.
function sitemapXml() {
  const urls = SITEMAP_PATHS.map((path) => `  <url><loc>${absoluteUrl(path)}</loc></url>`);
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls,
    "</urlset>",
    "",
  ].join("\n");
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: () =>
        new Response(sitemapXml(), {
          headers: {
            "Content-Type": "application/xml; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        }),
    },
  },
});
