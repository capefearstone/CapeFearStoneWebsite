const [site, about, serviceData, testimonialData, galleryData, contact] = await Promise.all([
  loadJson("/content/site.json"),
  loadJson("/content/about.json"),
  loadJson("/content/services.json"),
  loadJson("/content/testimonials.json"),
  loadJson("/content/gallery.json"),
  loadJson("/content/contact.json")
]);

const testimonials = testimonialData.testimonials;
const gallery = galleryData.projects;

const routes = {
  "/": renderHome,
  "/about": renderAbout,
  "/services": renderServices,
  "/portfolio": renderPortfolio,
  "/contact": renderContact
};

const app = document.querySelector("#app");

async function loadJson(path) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Could not load ${path}`);
  }
  return response.json();
}

function image(src, alt, className = "") {
  return `<img class="${className}" src="${src}" alt="${alt}" loading="lazy" />`;
}

function serviceList(items) {
  return items.map((item) => `<li>${item}</li>`).join("");
}

function testimonialCards(items) {
  return items
    .map(
      (item) => `
        <article class="testimonial-card">
          <p>"${item.quote}"</p>
          <footer>
            <strong>${item.name}</strong>
            <span>${item.projectType}</span>
          </footer>
        </article>
      `
    )
    .join("");
}

function galleryCards(items) {
  return items
    .map(
      (item) => `
        <article class="project-card">
          ${image(item.image, item.alt, "project-image")}
          <div class="project-card__body">
            <div>
              <p class="eyebrow">${item.projectType}</p>
              <h3>${item.title}</h3>
            </div>
            <p>${item.description}</p>
            <span>${item.location}</span>
          </div>
        </article>
      `
    )
    .join("");
}

function serviceSections(items) {
  return items
    .map(
      (item, index) => `
        <article class="service-feature ${index % 2 === 1 ? "service-feature--reverse" : ""}">
          ${image(item.image, item.alt, "service-feature__image")}
          <div class="service-feature__content">
            <p class="eyebrow">${item.eyebrow}</p>
            <h2>${item.title}</h2>
            <a class="button button-secondary" href="/contact" data-link>${item.buttonText}</a>
          </div>
        </article>
      `
    )
    .join("");
}

function shell(pageHtml) {
  return `
    <header class="site-header">
      <a class="brand" href="/" aria-label="${site.businessName} home">
        <span class="brand-name">${site.businessName}</span>
        <span class="brand-subtitle">Custom Hardscapes</span>
      </a>
      <nav class="site-nav" aria-label="Main navigation">
        <a href="/" data-link>Home</a>
        <a href="/about" data-link>About</a>
        <a href="/services" data-link>Services</a>
        <a href="/portfolio" data-link>Portfolio</a>
        <a class="nav-cta" href="/contact" data-link>Contact</a>
      </nav>
    </header>
    <main>${pageHtml}</main>
    <footer class="site-footer">
      <div>
        <strong>${site.businessName}</strong>
        <p>${site.tagline}</p>
      </div>
      <div>
        <p>${site.serviceArea}</p>
        <p><a href="tel:${site.phone.replace(/[^0-9]/g, "")}">${site.phone}</a> · <a href="mailto:${site.email}">${site.email}</a></p>
      </div>
    </footer>
  `;
}

function renderHome() {
  return shell(`
    <section class="hero">
      ${image(site.heroImage, site.heroAlt, "hero-image")}
      <div class="hero-overlay">
        <h1>${site.businessName}</h1>
        <p>${site.tagline}</p>
        <a class="button button-primary" href="/contact" data-link>Get a Quote</a>
      </div>
    </section>
    <section class="section testimonials">
      <div class="section-heading">
        <h2>Testimonials</h2>
      </div>
      <div class="testimonial-grid">${testimonialCards(testimonials)}</div>
    </section>
  `);
}

function renderAbout() {
  return shell(`
    <section class="section about-grid">
      ${image(about.portrait, about.portraitAlt, "portrait-image")}
      <div>
        <p class="eyebrow">${about.role}</p>
        <h2>${about.name}</h2>
        <p>${about.description}</p>
        <a class="button button-secondary" href="/contact" data-link>Start a project</a>
      </div>
    </section>
  `);
}

function renderServices() {
  return shell(`
    <section class="section services-page">
      <div class="section-heading">
        <h1>${serviceData.heading}</h1>
      </div>
      <div class="services-stack">${serviceSections(serviceData.services)}</div>
    </section>
  `);
}

function renderPortfolio() {
  return shell(`
    <section class="section portfolio-page">
      <div class="section-heading">
        <h1>Portfolio</h1>
      </div>
      <div class="gallery-grid">${galleryCards(gallery)}</div>
    </section>
  `);
}

function renderContact() {
  return shell(`
    <section class="section contact-section">
      <div class="contact-panel">
        <div class="contact-details">
          <h2>Contact</h2>
          <p><strong>Phone</strong><a href="tel:${site.phone.replace(/[^0-9]/g, "")}">${site.phone}</a></p>
          <p><strong>Email</strong><a href="mailto:${site.email}">${site.email}</a></p>
        </div>
        <form class="contact-form" name="project-inquiry" method="POST" data-netlify="true" netlify-honeypot="bot-field">
          <input type="hidden" name="form-name" value="project-inquiry" />
          <p class="hidden-field">
            <label>Do not fill this out: <input name="bot-field" /></label>
          </p>
          <label for="name">Name</label>
          <input id="name" name="name" type="text" autocomplete="name" required />
          <label for="email">Email</label>
          <input id="email" name="email" type="email" autocomplete="email" required />
          <label for="message">Message</label>
          <textarea id="message" name="message" rows="7" required></textarea>
          <button class="button button-primary" type="submit">Send message</button>
        </form>
      </div>
    </section>
  `);
}

function navigate(path) {
  const routePath = normalizePath(path);
  const renderer = routes[routePath] ?? renderHome;
  app.innerHTML = renderer();
  document.title = `${routePath === "/" ? "Home" : routePath.slice(1)[0].toUpperCase() + routePath.slice(2)} | ${site.businessName}`;
  updateActiveNav(routePath);
  window.scrollTo({ top: 0, behavior: "auto" });
}

function normalizePath(path) {
  if (path.length > 1 && path.endsWith("/")) {
    return path.slice(0, -1);
  }
  return path;
}

function updateActiveNav(path) {
  document.querySelectorAll("[data-link]").forEach((link) => {
    const href = link.getAttribute("href");
    link.toggleAttribute("aria-current", href === path);
  });
}

document.addEventListener("click", (event) => {
  const link = event.target.closest("a[data-link]");
  if (!link) return;
  event.preventDefault();
  const path = link.getAttribute("href");
  history.pushState({}, "", path);
  navigate(path);
});

window.addEventListener("popstate", () => navigate(location.pathname));

navigate(location.pathname);
