import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getVehiclesStore, setVehiclesStore, Vehicle, normalizeVehiclePrice } from '@/lib/data';

export async function GET() {
  try {
    const dbVehicles = await prisma.vehicle.findMany({
      orderBy: { createdAt: 'desc' },
    });

    if (dbVehicles && dbVehicles.length > 0) {
      const formatted = await Promise.all(
        dbVehicles.map(async (v) => {
          let currentPrice = v.price;
          // Auto-fix any vehicle with price < 1000 (e.g. 749 -> 749000)
          if (currentPrice > 0 && currentPrice < 1000) {
            currentPrice = currentPrice * 1000;
            try {
              await prisma.vehicle.update({
                where: { id: v.id },
                data: { price: currentPrice },
              });
            } catch (e) {
              console.error('Auto fix price error:', e);
            }
          }
          return {
            ...v,
            price: currentPrice,
            images: JSON.parse(v.images || '[]'),
            colors: JSON.parse(v.colors || '[]'),
            features: JSON.parse(v.features || '[]'),
          };
        })
      );
      return NextResponse.json(formatted);
    }
  } catch (error) {
    console.warn('Prisma DB fallback to in-memory store:', error);
  }

  const store = getVehiclesStore().map((v) => ({
    ...v,
    price: normalizeVehiclePrice(v.price),
  }));
  return NextResponse.json(store);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const newVehicleData = {
      id: body.id || `karea-${Date.now()}`,
      name: body.name || 'Yeni MKBL Karea',
      tagline: body.tagline || 'Şehir İçi Elektrikli Mobilite',
      category: body.category || 'City',
      price: normalizeVehiclePrice(body.price) || 450000,
      rangeKm: Number(body.rangeKm) || 120,
      topSpeed: Number(body.topSpeed) || 45,
      chargeTime: body.chargeTime || '3.5 Saat (220V Priz)',
      battery: body.battery || '10.5 kWh Lityum',
      licenseType: body.licenseType || 'B / B1',
      motorPower: body.motorPower || '6 kW',
      dimensions: body.dimensions || '2.631 mm x 1.498 mm x 1.621 mm',
      chargePower: body.chargePower || '3,3 kW/s Ev Tipi 220V',
      capacityDetails: body.capacityDetails || '3 Kapı / 2 Koltuk / 184 L',
      rimSize: body.rimSize || '13 inç Alaşım Jant',
      images: Array.isArray(body.images) ? body.images : ['/images/hero.jpg'],
      colors: Array.isArray(body.colors)
        ? body.colors
        : [{ name: 'Klasik Beyaz', hex: '#FFFFFF', image: '/images/hero.jpg' }],
      features: Array.isArray(body.features)
        ? body.features
        : ['220V Şarj Uyumlu', 'Cam Tavan', 'Dijital Gösterge'],
      stockStatus: body.stockStatus || 'STOKTA',
      isPublished: body.isPublished !== undefined ? body.isPublished : true,
      showOnHomepage: body.showOnHomepage !== undefined ? body.showOnHomepage : true,
    };

    try {
      const createdDb = await prisma.vehicle.create({
        data: {
          ...newVehicleData,
          images: JSON.stringify(newVehicleData.images),
          colors: JSON.stringify(newVehicleData.colors),
          features: JSON.stringify(newVehicleData.features),
        },
      });
      return NextResponse.json({
        ...createdDb,
        images: JSON.parse(createdDb.images),
        colors: JSON.parse(createdDb.colors),
        features: JSON.parse(createdDb.features),
      });
    } catch {
      // In-memory fallback
      const current = getVehiclesStore();
      const updated = [newVehicleData as Vehicle, ...current];
      setVehiclesStore(updated);
      return NextResponse.json(newVehicleData);
    }
  } catch (error) {
    return NextResponse.json({ error: 'Araç oluşturulamadı.' }, { status: 500 });
  }
}
