'use client';

import { useEffect } from 'react';

export function getAttributionData() {
  if (typeof window === 'undefined') return {};
  try {
    return {
      utm_source: sessionStorage.getItem('utm_source') || '',
      utm_medium: sessionStorage.getItem('utm_medium') || '',
      utm_campaign: sessionStorage.getItem('utm_campaign') || '',
      utm_term: sessionStorage.getItem('utm_term') || '',
      utm_content: sessionStorage.getItem('utm_content') || '',
      gclid: sessionStorage.getItem('gclid') || '',
      fbclid: sessionStorage.getItem('fbclid') || '',
      landing_url: sessionStorage.getItem('landing_url') || '',
    };
  } catch (e) {
    return {};
  }
}

export function pushDataLayerEvent(eventData: Record<string, any>) {
  if (typeof window === 'undefined') return;
  try {
    (window as any).dataLayer = (window as any).dataLayer || [];
    (window as any).dataLayer.push(eventData);
  } catch (e) {
    console.error('DataLayer push error:', e);
  }
}

export default function AttributionTracker() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      // Set initial landing_url if not already set in sessionStorage
      if (!sessionStorage.getItem('landing_url')) {
        sessionStorage.setItem('landing_url', window.location.href);
      }

      // Parse URL Search Params
      const searchParams = new URLSearchParams(window.location.search);
      const paramsToTrack = [
        'utm_source',
        'utm_medium',
        'utm_campaign',
        'utm_term',
        'utm_content',
        'gclid',
        'fbclid',
      ];

      paramsToTrack.forEach((param) => {
        const val = searchParams.get(param);
        if (val) {
          sessionStorage.setItem(param, val);
        }
      });
    } catch (err) {
      console.error('AttributionTracker error:', err);
    }
  }, []);

  return null;
}
