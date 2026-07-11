export const siteUrl = "https://capefearstone.com";

export const seoByPath = {
  "/": {
    title: "Premier Custom Hardscapes in Wilmington, NC",
    description:
      "Cape Fear Stone builds custom paver patios, walkways, retaining walls, and stone borders in Wilmington, Leland, and the Cape Fear region. Request a free quote."
  },
  "/about": {
    title: "About Cape Fear Stone | Wilmington, NC Hardscaping",
    description:
      "Meet Cape Fear Stone owner Seth Rice and learn about his experience building durable, detailed masonry and hardscape projects in the Cape Fear region."
  },
  "/services": {
    title: "Hardscaping Services in Wilmington, NC | Cape Fear Stone",
    description:
      "Explore custom paver patios, walkways, retaining walls, stone edging, and other hardscaping services for Wilmington, Leland, and nearby communities."
  },
  "/portfolio": {
    title: "Portfolio | Cape Fear Stone",
    description:
      "View Cape Fear Stone patio, walkway, retaining wall, and stone edging projects serving homeowners throughout the Cape Fear region."
  },
  "/contact": {
    title: "Request a Hardscaping Quote | Cape Fear Stone",
    description:
      "Contact Cape Fear Stone to discuss a paver patio, walkway, retaining wall, stone border, or custom hardscape project in the Cape Fear region."
  },
  "/404": {
    title: "Page Not Found | Cape Fear Stone",
    description: "The requested page could not be found. Return to Cape Fear Stone to explore our hardscaping services."
  }
};

export function normalizeRoutePath(path) {
  if (!path || path === "/") return "/";
  return `/${path.split("/").filter(Boolean)[0]}`;
}

export function canonicalUrl(path) {
  const normalizedPath = normalizeRoutePath(path);
  return normalizedPath === "/" ? `${siteUrl}/` : `${siteUrl}${normalizedPath}/`;
}

export function localBusinessSchema(site, services) {
  return {
    "@context": "https://schema.org",
    "@type": "HomeAndConstructionBusiness",
    "@id": `${siteUrl}/#business`,
    name: site.businessName,
    url: `${siteUrl}/`,
    logo: `${siteUrl}/assets/cape-fear-stone-logo.png`,
    image: `${siteUrl}/assets/cape-fear-stone-logo.png`,
    description: seoByPath["/"].description,
    telephone: site.phone,
    email: site.email,
    sameAs: site.facebook ? [site.facebook] : undefined,
    areaServed: site.serviceArea,
    founder: {
      "@type": "Person",
      name: "Seth Rice"
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Hardscaping services",
      itemListElement: services.map((service) => ({
        "@type": "Offer",
        itemOffered: {
          "@type": "Service",
          name: service.title
        }
      }))
    }
  };
}
