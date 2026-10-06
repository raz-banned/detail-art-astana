import { createFileRoute } from "@tanstack/react-router";
import { absoluteUrl } from "@/lib/seo";

function robotsTxt() {
  const rules: string[] = ["User-agent: *", "Disallow: /admin"];
  return [...rules, "", `Sitemap: ${absoluteUrl("/sitemap.xml")}`, ""].join("\n");
}

export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: () =>
        new Response(robotsTxt(), {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        }),
    },
  },
});
