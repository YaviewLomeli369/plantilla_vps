import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import type { SiteConfig } from "@shared/schema";

interface SEOHeadProps {
  title?: string;
  description?: string;
  image?: string;
}

export function SEOHead({ title, description, image }: SEOHeadProps) {
  const { data: config } = useQuery<SiteConfig>({
    queryKey: ["/api/config"],
  });

  useEffect(() => {
    const configData = config?.config as any;
    const appearance = configData?.appearance || {};

    // Update document title
    const pageTitle = title || appearance.metaTitle || appearance.brandName || "Sistema Modular";
    document.title = pageTitle;

    // Update meta description
    const metaDescription = description || appearance.metaDescription || "Sistema web modular y configurable";
    let metaDescElement = document.querySelector('meta[name="description"]');
    if (!metaDescElement) {
      metaDescElement = document.createElement('meta');
      metaDescElement.setAttribute('name', 'description');
      document.head.appendChild(metaDescElement);
    }
    metaDescElement.setAttribute('content', metaDescription);

    // Update Open Graph tags
    const ogTitle = document.querySelector('meta[property="og:title"]') || document.createElement('meta');
    ogTitle.setAttribute('property', 'og:title');
    ogTitle.setAttribute('content', pageTitle);
    if (!document.querySelector('meta[property="og:title"]')) {
      document.head.appendChild(ogTitle);
    }

    const ogDescription = document.querySelector('meta[property="og:description"]') || document.createElement('meta');
    ogDescription.setAttribute('property', 'og:description');
    ogDescription.setAttribute('content', metaDescription);
    if (!document.querySelector('meta[property="og:description"]')) {
      document.head.appendChild(ogDescription);
    }

    const ogImage = document.querySelector('meta[property="og:image"]') || document.createElement('meta');
    ogImage.setAttribute('property', 'og:image');
    ogImage.setAttribute('content', image || appearance.ogImage || '/favicon.ico');
    if (!document.querySelector('meta[property="og:image"]')) {
      document.head.appendChild(ogImage);
    }

    // Update favicon
    if (appearance.faviconUrl) {
      let favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
      if (!favicon) {
        favicon = document.createElement('link');
        favicon.rel = 'icon';
        document.head.appendChild(favicon);
      }
      favicon.href = appearance.faviconUrl;
    }

  }, [config, title, description, image]);

  return null;
}