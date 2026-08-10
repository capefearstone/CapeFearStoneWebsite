import { createSiteRenderer } from "/src/site-renderer.js";
import { canonicalUrl, normalizeRoutePath, seoByPath, siteUrl } from "/src/seo.js";

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

let revealObserver;
let scrollFrame;

initializeVisualEffects();

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

function navigate(path, hash = "") {
  const routePath = normalizeRoutePath(path);
  const renderer = routes[routePath];
  const useViewTransition = Boolean(document.startViewTransition && !reducedMotion.matches);

  if (!renderer) {
    window.location.assign(path);
    return;
  }

  const updatePage = () => {
    app.innerHTML = renderer();
    updateMetadata(routePath);
    updateActiveNav(routePath);
    if (hash) {
      document
        .querySelector(hash)
        ?.scrollIntoView({ behavior: reducedMotion.matches ? "auto" : "smooth", block: "start" });
    } else {
      window.scrollTo({ top: 0, behavior: "auto" });
    }
    initializeVisualEffects({ showViewport: useViewTransition });
  };

  if (useViewTransition) {
    document.startViewTransition(updatePage);
    return;
  }

  updatePage();
}

function updateActiveNav(path) {
  document.querySelectorAll(".site-nav [data-link]").forEach((link) => {
    const href = link.getAttribute("href");
    link.toggleAttribute("aria-current", normalizeRoutePath(href) === path);
  });
}

function updateScrollEffects() {
  const header = document.querySelector(".site-header");
  header?.classList.toggle("is-scrolled", window.scrollY > 16);
}

function queueScrollEffects() {
  if (scrollFrame) return;

  scrollFrame = window.requestAnimationFrame(() => {
    updateScrollEffects();
    scrollFrame = undefined;
  });
}

function initializeVisualEffects({ showViewport = false } = {}) {
  revealObserver?.disconnect();

  const revealTargets = document.querySelectorAll(
    [
      ".hero-overlay > *",
      ".intro-grid > *",
      ".service-list li",
      ".section-heading",
      ".testimonial-card",
      ".service-feature > *",
      ".project-card",
      ".about-grid > *",
      ".contact-panel > *",
      ".site-footer > *"
    ].join(",")
  );

  revealTargets.forEach((element, index) => {
    element.classList.add("reveal");
    element.style.setProperty("--reveal-delay", `${(index % 4) * 80}ms`);

    if (showViewport && element.getBoundingClientRect().top < window.innerHeight * 0.92) {
      element.classList.add("is-visible");
    }
  });

  if (reducedMotion.matches || !("IntersectionObserver" in window)) {
    revealTargets.forEach((element) => element.classList.add("is-visible"));
  } else {
    revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );

    revealTargets.forEach((element) => {
      if (!element.classList.contains("is-visible")) revealObserver.observe(element);
    });
  }

  updateScrollEffects();
}

document.addEventListener("click", (event) => {
  const link = event.target.closest("a[data-link]");
  if (!link) return;

  const url = new URL(link.href, siteUrl);
  if (url.origin !== window.location.origin) return;

  event.preventDefault();
  history.pushState({}, "", `${url.pathname}${url.hash}`);
  navigate(url.pathname, url.hash);
});

window.addEventListener("popstate", () => navigate(location.pathname, location.hash));
window.addEventListener("scroll", queueScrollEffects, { passive: true });
reducedMotion.addEventListener?.("change", initializeVisualEffects);

updateMetadata(normalizeRoutePath(location.pathname));
updateActiveNav(normalizeRoutePath(location.pathname));
