import React from 'react';
import { prisma } from '@/lib/prisma';
import { getVehiclesStore, normalizeVehiclePrice, Vehicle } from '@/lib/data';
import { DEFAULT_SITE_SETTINGS, getSiteSettingsStore, ISiteSettings } from '@/lib/settings';
import HomeClient from '@/components/HomeClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getInitialVehicles(): Promise<Vehicle[]> {
  try {
    const dbVehicles = await prisma.vehicle.findMany({
      orderBy: { createdAt: 'desc' },
    });

    if (dbVehicles && dbVehicles.length > 0) {
      return dbVehicles.map((v) => ({
        id: v.id,
        name: v.name,
        tagline: v.tagline,
        category: (v.category as Vehicle['category']) || 'City',
        price: normalizeVehiclePrice(v.price),
        rangeKm: v.rangeKm,
        topSpeed: v.topSpeed,
        chargeTime: v.chargeTime,
        battery: v.battery,
        licenseType: v.licenseType,
        motorPower: v.motorPower,
        dimensions: v.dimensions ?? undefined,
        chargePower: v.chargePower ?? undefined,
        capacityDetails: v.capacityDetails ?? undefined,
        rimSize: v.rimSize ?? undefined,
        images: JSON.parse(v.images || '[]'),
        colors: JSON.parse(v.colors || '[]'),
        features: JSON.parse(v.features || '[]'),
        stockStatus: (v.stockStatus as Vehicle['stockStatus']) || 'STOKTA',
        isPublished: v.isPublished,
        showOnHomepage: v.showOnHomepage,
      }));
    }
  } catch (error) {
    console.warn('SSR vehicles fetch fallback:', error);
  }

  return getVehiclesStore().map((v) => ({
    ...v,
    price: normalizeVehiclePrice(v.price),
  }));
}

async function getInitialSettings(): Promise<ISiteSettings> {
  try {
    const settings = await prisma.siteSettings.findUnique({
      where: { id: 'default' },
    });

    if (settings) {
      const serialized = JSON.parse(JSON.stringify(settings));
      return {
        ...DEFAULT_SITE_SETTINGS,
        ...serialized,
      };
    }
  } catch (error) {
    console.warn('SSR settings fetch fallback:', error);
  }

  return {
    ...DEFAULT_SITE_SETTINGS,
    ...getSiteSettingsStore(),
  };
}

export default async function HomePage() {
  const [initialVehicles, initialSettings] = await Promise.all([
    getInitialVehicles(),
    getInitialSettings(),
  ]);

  return (
    <HomeClient
      initialVehicles={initialVehicles}
      initialSettings={initialSettings}
    />
  );
}
