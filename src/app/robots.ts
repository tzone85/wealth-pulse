import type { MetadataRoute } from 'next';

// Private dashboard — disallow all crawlers.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      disallow: '/',
    },
  };
}
