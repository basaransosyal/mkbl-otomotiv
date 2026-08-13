'use client';

import React, { useEffect, useState } from 'react';
import Script from 'next/script';
import { ISiteSettings } from '@/lib/settings';

export default function TrackingScripts() {
  const [settings, setSettings] = useState<ISiteSettings | null>(null);

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data === 'object') {
          setSettings(data);
        }
      })
      .catch((err) => console.error('Tracking scripts settings error:', err));
  }, []);

  if (!settings) return null;

  const {
    googleTagManagerId,
    googleAdsId,
    metaPixelId,
    customHeadScripts,
    customBodyScripts,
  } = settings;

  return (
    <>
      {/* GOOGLE TAG MANAGER (GTM) */}
      {googleTagManagerId && (
        <Script
          id="gtm-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','${googleTagManagerId.trim()}');
            `,
          }}
        />
      )}

      {/* GOOGLE ADS (GTAG) */}
      {googleAdsId && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${googleAdsId.trim()}`}
            strategy="afterInteractive"
          />
          <Script
            id="google-ads-script"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${googleAdsId.trim()}');
              `,
            }}
          />
        </>
      )}

      {/* META PIXEL (FACEBOOK PIXEL) */}
      {metaPixelId && (
        <Script
          id="meta-pixel-script"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${metaPixelId.trim()}');
              fbq('track', 'PageView');
            `,
          }}
        />
      )}

      {/* CUSTOM HEAD SCRIPTS */}
      {customHeadScripts && (
        <Script
          id="custom-head-scripts"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: customHeadScripts }}
        />
      )}

      {/* CUSTOM BODY SCRIPTS */}
      {customBodyScripts && (
        <Script
          id="custom-body-scripts"
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{ __html: customBodyScripts }}
        />
      )}
    </>
  );
}
