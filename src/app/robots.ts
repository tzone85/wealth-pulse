import type { MetadataRoute } from 'next';

// Required for static export (GitHub Pages); harmless in server mode.
export const dynamic = 'force-static';

// Private dashboard — disallow all crawlers.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      disallow: '/',
    },
  };
}
