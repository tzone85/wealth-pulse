import { Analytics } from "@vercel/analytics/next";
import Script from "next/script";

export function AnalyticsProvider() {
  return (
    <>
      <Script
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=G-56NMRETY0W`}
      />
      <Script
        id="google-analytics"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-56NMRETY0W', {
              page_path: window.location.pathname,
            });
          `,
        }}
      />
      <Analytics />
    </>
  );
}
