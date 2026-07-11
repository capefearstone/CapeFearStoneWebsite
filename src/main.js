import { createSiteRenderer } from "/src/site-renderer.js";
import { canonicalUrl, normalizeRoutePath, seoByPath, siteUrl } from "/src/seo.js";

const [site, about, serviceData, testimonialData, galleryData, contact] = await Promise.all([
  loadJson("/content/site.json"),
  loadJson("/content/about.json"),
  loadJson("/content/services.json"),
  loadJson("/content/testimonials.json"),
  loadJson("/content/gallery.json"),
  loadJson("/content/contact.json")
]);

const { routes } = createSiteRenderer({
  site,
  about,
  serviceData,
  testimonialData,
  galleryData,
  contact
});

const app = document.querySelector("#app");

async function loadJson(path) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Could not load ${path}`);
  }
  return response.json();
}

function setMeta(selector, attribute, value) {
  const element = document.querySelector(selector);
  if (element) element.setAttribute(attribute, value);
}

function updateMetadata(path) {
  const metadata = seoByPath[path] ?? seoByPath["/"];
  const url = canonicalUrl(path);

  document.title = metadata.title;
  setMeta('meta[name="description"]', "content", metadata.description);
  setMeta('link[rel="canonical"]', "href", url);
  setMeta('meta[property="og:title"]', "content", metadata.title);
  setMeta('meta[property="og:description"]', "content", metadata.description);
  setMeta('meta[property="og:url"]', "content", url);
  setMeta('meta[name="twitter:title"]', "content", metadata.title);
  setMeta('meta[name="twitter:description"]', "content", metadata.description);
}

function navigate(path) {
  const routePath = normalizeRoutePath(path);
  const renderer = routes[routePath];

  if (!renderer) {
    window.location.assign(path);
    return;
  }

  app.innerHTML = renderer();
  updateMetadata(routePath);
  updateActiveNav(routePath);
  window.scrollTo({ top: 0, behavior: "auto" });
}

function updateActiveNav(path) {
  document.querySelectorAll(".site-nav [data-link]").forEach((link) => {
    const href = link.getAttribute("href");
    link.toggleAttribute("aria-current", normalizeRoutePath(href) === path);
  });
}

document.addEventListener("click", (event) => {
  const link = event.target.closest("a[data-link]");
  if (!link) return;

  const url = new URL(link.href, siteUrl);
  if (url.origin !== window.location.origin) return;

  event.preventDefault();
  history.pushState({}, "", url.pathname);
  navigate(url.pathname);
});

window.addEventListener("popstate", () => navigate(location.pathname));

updateMetadata(normalizeRoutePath(location.pathname));
updateActiveNav(normalizeRoutePath(location.pathname));
