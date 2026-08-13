import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSiteSettingsStore, setSiteSettingsStore, DEFAULT_SITE_SETTINGS } from '@/lib/settings';
import { clearFuelServiceCache } from '@/lib/fuelService';

export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
};

// Filter body so only fields that exist in Prisma SiteSettings model are passed
const sanitizeBodyForPrisma = (body: Record<string, any>) => {
  const allowedKeys = new Set([
    'siteName', 'phone', 'email', 'address', 'workingHours', 'copyrightText',
    'facebookUrl', 'instagramUrl', 'linkedinUrl', 'youtubeUrl',
    'navHomeText', 'navModelsText', 'navServiceText', 'navContactText', 'navCtaButtonText', 'navCtaButtonUrl',
    'heroTitle', 'heroSubtitle', 'heroBadge', 'ctaButtonText', 'ctaButtonUrl',
    'footerDescription', 'footerBadge1', 'footerBadge2', 'footerModelLinksTitle', 'footerServicesTitle', 'footerShowroomTitle',
    'footerModelLink1', 'footerModelLink1Url', 'footerModelLink1Active',
    'footerModelLink2', 'footerModelLink2Url', 'footerModelLink2Active',
    'footerModelLink3', 'footerModelLink3Url', 'footerModelLink3Active',
    'footerServiceLink1', 'footerServiceLink1Url', 'footerServiceLink1Active',
    'footerServiceLink2', 'footerServiceLink2Url', 'footerServiceLink2Active',
    'footerServiceLink3', 'footerServiceLink3Url', 'footerServiceLink3Active',
    'footerServiceLink4', 'footerServiceLink4Url', 'footerServiceLink4Active',
    'footerAdminLinkText', 'footerAdminLinkUrl', 'footerAdminLinkActive',
    'calcTitle', 'calcSubtitle', 'defaultElectricityRate', 'defaultGasPrice', 'defaultGasConsump', 'defaultEvConsump',
    'showCalculator', 'collectApiKey', 'collectApiActive', 'epiasUser', 'epiasPass', 'epiasApiKey', 'epiasActive', 'autoFetchFuelRates',
    'whatsappActive', 'whatsappPhone', 'whatsappTitle', 'whatsappSubtitle', 'whatsappMessage', 'whatsappQuickOptions', 'whatsappPosition',
    'contactPageBadge', 'contactPageTitle', 'contactPageSubtitle', 'contactInfoTitle',
    'contactMapName', 'contactMapCoords', 'contactMapButtonText', 'contactMapUrl', 'contactMapEmbedUrl',
    'contactFormBadge', 'contactFormTitle', 'contactFormSubtitle', 'contactFormButtonText',
    'servicePageBadge', 'servicePageTitle', 'servicePageSubtitle',
    'serviceFormBadge', 'serviceFormTitle', 'serviceFormSubtitle', 'serviceFormButtonText',
    'testDriveFormBadge', 'testDriveFormTitle', 'testDriveFormSubtitle', 'testDriveFormButtonText',
    'consentExplicitText', 'consentCommercialText', 'privacyPolicyText', 'termsOfUseText', 'kvkkText',
    'showCookieBanner', 'cookieBannerText', 'cookiePolicyText',
    'googleTagManagerId', 'googleAdsId', 'metaPixelId', 'customHeadScripts', 'customBodyScripts',
    'smtpHost', 'smtpPort', 'smtpUser', 'smtpPass', 'smtpSender', 'smtpEnableSsl',
    'homeShowHero', 'homeOrderHero', 'homeShowGallery', 'homeOrderGallery',
    'homeShowCalculator', 'homeOrderCalculator', 'homeShowConfigurator', 'homeOrderConfigurator',
    'homeShowFeatures', 'homeOrderFeatures'
  ]);

  const sanitized: Record<string, any> = {};
  for (const [key, value] of Object.entries(body)) {
    if (allowedKeys.has(key)) {
      sanitized[key] = value;
    }
  }
  return sanitized;
};

export async function GET() {
  try {
    let settings = await prisma.siteSettings.findUnique({
      where: { id: 'default' },
    });

    if (!settings) {
      try {
        const createData = sanitizeBodyForPrisma(DEFAULT_SITE_SETTINGS as any);
        settings = await prisma.siteSettings.create({
          data: {
            id: 'default',
            ...createData,
          },
        });
      } catch (err) {
        console.warn('Create default siteSettings error:', err);
      }
    }

    const merged = {
      ...DEFAULT_SITE_SETTINGS,
      ...(settings || {}),
    };

    return NextResponse.json(merged, { headers: NO_CACHE_HEADERS });
  } catch (error) {
    console.log('Prisma fallback for GET /api/settings');
    return NextResponse.json(getSiteSettingsStore(), { headers: NO_CACHE_HEADERS });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const cleanBody = sanitizeBodyForPrisma(body);

    try {
      const defaultCreateData = sanitizeBodyForPrisma(DEFAULT_SITE_SETTINGS as any);
      const updated = await prisma.siteSettings.upsert({
        where: { id: 'default' },
        update: cleanBody,
        create: {
          id: 'default',
          ...defaultCreateData,
          ...cleanBody,
        },
      });
      setSiteSettingsStore(updated);
      clearFuelServiceCache();
      
      const merged = {
        ...DEFAULT_SITE_SETTINGS,
        ...updated,
      };

      return NextResponse.json(merged, { headers: NO_CACHE_HEADERS });
    } catch (e) {
      console.log('Prisma fallback for PUT /api/settings:', e);
      const updatedInMem = setSiteSettingsStore(cleanBody);
      clearFuelServiceCache();
      
      const merged = {
        ...DEFAULT_SITE_SETTINGS,
        ...updatedInMem,
      };

      return NextResponse.json(merged, { headers: NO_CACHE_HEADERS });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Ayarlar güncellenemedi.' }, { status: 500, headers: NO_CACHE_HEADERS });
  }
}
