export function createSiteRenderer({ site, about, serviceData, testimonialData, galleryData, contact }) {
  const testimonials = testimonialData.testimonials;
  const gallery = galleryData.projects;

  function image(src, alt, className = "", { eager = false } = {}) {
    const loadingAttributes = eager
      ? 'loading="eager" fetchpriority="high"'
      : 'loading="lazy"';

    return `<img class="${className}" src="${src}" alt="${alt}" ${loadingAttributes} decoding="async" />`;
  }

  function serviceList(items) {
    return items.map((item) => `<li>${item}</li>`).join("");
  }

  function facebookLink(className = "") {
    return `<a class="facebook-link ${className}" href="${site.facebook}" target="_blank" rel="noopener noreferrer" aria-label="Cape Fear Stone on Facebook">
      <svg aria-hidden="true" viewBox="0 0 24 24" focusable="false">
        <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.435H7.078v-3.492h3.047V9.414c0-3.028 1.792-4.7 4.533-4.7 1.312 0 2.686.236 2.686.236v2.974h-1.513c-1.49 0-1.956.931-1.956 1.887v2.262h3.328l-.532 3.492h-2.796V24C19.612 23.094 24 18.1 24 12.073Z" />
      </svg>
      <span>Facebook</span>
    </a>`;
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
                <h2>${item.title}</h2>
              </div>
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
              <a class="button button-primary" href="/contact/" data-link>${item.buttonText}</a>
            </div>
          </article>
        `
      )
      .join("");
  }

  function shell(pageHtml) {
    return `
      <header class="site-header">
        <a class="brand" href="/" aria-label="${site.businessName} home" data-link>
          <span class="brand-name">${site.businessName}</span>
          <span class="brand-subtitle">Custom Hardscapes</span>
        </a>
        <nav class="site-nav" aria-label="Main navigation">
          <a href="/" data-link>Home</a>
          <a href="/about/" data-link>About</a>
          <a href="/services/" data-link>Services</a>
          <a href="/portfolio/" data-link>Portfolio</a>
          <a class="nav-cta" href="/contact/" data-link>Contact</a>
        </nav>
      </header>
      <main>${pageHtml}</main>
      <footer class="site-footer">
        <div class="footer-brand">
          <strong>${site.businessName}</strong>
          <p>&copy; 2026 Cape Fear Stone. Website Designed by Cam Spitler.</p>
        </div>
        <div class="footer-contact">
          <p><span>Email</span><a href="mailto:${site.email}">${site.email}</a></p>
          <p><span>Phone</span><a href="tel:${site.phone.replace(/[^0-9]/g, "")}">${site.phone}</a></p>
          <p><span>Social</span>${facebookLink("facebook-link--footer")}</p>
        </div>
      </footer>
    `;
  }

  function renderHome() {
    return shell(`
      <section class="hero">
        ${image(site.heroImage, site.heroAlt, "hero-image", { eager: true })}
        <div class="hero-overlay">
          <h1>${site.businessName}</h1>
          <p>${site.tagline}</p>
          <a class="button button-primary" href="/contact/" data-link>Get a Free Quote</a>
        </div>
      </section>
      <section class="section intro-grid">
        <div>
          <p class="eyebrow">Serving ${site.serviceArea}</p>
          <h2>${site.introTitle}</h2>
        </div>
        <ul class="service-list">${serviceList(site.services)}</ul>
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
          <h1>${about.name}</h1>
          <p>${about.description}</p>
          <a class="button button-primary" href="/contact/" data-link>Start a Project</a>
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
            <h1>${contact.heading}</h1>
            <p><strong>Email</strong><a href="mailto:${site.email}">${site.email}</a></p>
            <p><strong>Phone</strong><a href="tel:${site.phone.replace(/[^0-9]/g, "")}">${site.phone}</a></p>
            <p><strong>Facebook</strong>${facebookLink("facebook-link--contact")}</p>
            <p class="contact-service-area"><strong>Service area</strong><span>${site.serviceArea}</span></p>
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

  function renderNotFound() {
    return shell(`
      <section class="page-hero">
        <p class="eyebrow">404</p>
        <h1>Page not found</h1>
        <p>The page you requested may have moved or no longer exists.</p>
        <a class="button button-primary" href="/">Return Home</a>
      </section>
    `);
  }

  return {
    routes: {
      "/": renderHome,
      "/about": renderAbout,
      "/services": renderServices,
      "/portfolio": renderPortfolio,
      "/contact": renderContact
    },
    renderNotFound
  };
}
