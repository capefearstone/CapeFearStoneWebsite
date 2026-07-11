import { cp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { createSiteRenderer } from "../src/site-renderer.js";
import { canonicalUrl, localBusinessSchema, seoByPath, siteUrl } from "../src/seo.js";

const root = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(root, "..");
const dist = join(projectRoot, "dist");

async function readJson(relativePath) {
  return JSON.parse(await readFile(join(projectRoot, relativePath), "utf8"));
}

const [template, site, about, serviceData, testimonialData, galleryData, contact] = await Promise.all([
  readFile(join(projectRoot, "index.html"), "utf8"),
  readJson("content/site.json"),
  readJson("content/about.json"),
  readJson("content/services.json"),
  readJson("content/testimonials.json"),
  readJson("content/gallery.json"),
  readJson("content/contact.json")
]);

const { routes, renderNotFound } = createSiteRenderer({
  site,
  about,
  serviceData,
  testimonialData,
  galleryData,
  contact
});

const routeDefinitions = [
  { path: "/", output: "index.html" },
  { path: "/about", output: "about/index.html" },
  { path: "/services", output: "services/index.html" },
  { path: "/portfolio", output: "portfolio/index.html" },
  { path: "/contact", output: "contact/index.html" }
];

function escapeAttribute(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function structuredData(path, metadata) {
  const url = canonicalUrl(path);
  const { "@context": context, ...business } = localBusinessSchema(site, serviceData.services);

  return {
    "@context": context,
    "@graph": [
      business,
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: `${siteUrl}/`,
        name: site.businessName,
        publisher: { "@id": `${siteUrl}/#business` }
      },
      {
        "@type": "WebPage",
        "@id": `${url}#webpage`,
        url,
        name: metadata.title,
        description: metadata.description,
        isPartOf: { "@id": `${siteUrl}/#website` },
        about: { "@id": `${siteUrl}/#business` }
      }
    ]
  };
}

function seoBlock(path, { noindex = false } = {}) {
  const metadata = seoByPath[path];
  const url = canonicalUrl(path);
  const title = escapeAttribute(metadata.title);
  const description = escapeAttribute(metadata.description);
  const robots = noindex ? "noindex, follow" : "index, follow";
  const schema = noindex ? "" : `
    <script type="application/ld+json">
      ${JSON.stringify(structuredData(path, metadata)).replaceAll("<", "\\u003c")}
    </script>`;

  return `<!-- SEO:START -->
    <title>${title}</title>
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
    <meta name="description" content="${description}" />
    <meta name="robots" content="${robots}" />
    <link rel="canonical" href="${url}" />
    <meta property="og:locale" content="en_US" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="${escapeAttribute(site.businessName)}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:url" content="${url}" />
    <meta property="og:image" content="${siteUrl}/assets/cape-fear-stone-logo.png" />
    <meta property="og:image:alt" content="Cape Fear Stone logo" />
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${siteUrl}/assets/cape-fear-stone-logo.png" />${schema}
    <!-- SEO:END -->`;
}

function renderPage(path, content, options = {}) {
  let html = template
    .replace(/<!-- SEO:START -->[\s\S]*?<!-- SEO:END -->/, seoBlock(path, options))
    .replace("<!-- APP:CONTENT -->", content)
    .replace(/[ \t]+$/gm, "");

  if (options.includeScript === false) {
    html = html.replace(/\s*<script type="module" src="\/src\/main\.js"><\/script>/, "");
  }

  return html;
}

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });

await cp(join(projectRoot, "src"), join(dist, "src"), { recursive: true });
await cp(join(projectRoot, "content"), join(dist, "content"), { recursive: true });
await cp(join(projectRoot, "public"), dist, { recursive: true });

for (const route of routeDefinitions) {
  const outputPath = join(dist, route.output);
  await mkdir(dirname(outputPath), { recursive: true });
  await writeFile(outputPath, renderPage(route.path, routes[route.path]()), "utf8");
}

await writeFile(
  join(dist, "404.html"),
  renderPage("/404", renderNotFound(), { noindex: true, includeScript: false }),
  "utf8"
);

console.log("Built prerendered static site to dist/");
