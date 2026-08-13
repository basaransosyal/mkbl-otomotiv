import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getVehiclesStore, setVehiclesStore, normalizeVehiclePrice } from '@/lib/data';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    const dbVehicle = await prisma.vehicle.findUnique({
      where: { id },
    });
    if (dbVehicle) {
      let currentPrice = dbVehicle.price;
      if (currentPrice > 0 && currentPrice < 1000) {
        currentPrice = currentPrice * 1000;
        try {
          await prisma.vehicle.update({
            where: { id },
            data: { price: currentPrice },
          });
        } catch (e) {
          console.error('Auto fix vehicle price error:', e);
        }
      }
      return NextResponse.json({
        ...dbVehicle,
        price: currentPrice,
        images: JSON.parse(dbVehicle.images || '[]'),
        colors: JSON.parse(dbVehicle.colors || '[]'),
        features: JSON.parse(dbVehicle.features || '[]'),
      });
    }
  } catch (err) {
    console.warn('Prisma lookup failed, falling back:', err);
  }

  const store = getVehiclesStore();
  const found = store.find((v) => v.id === id);
  if (!found) {
    return NextResponse.json({ error: 'Araç bulunamadı.' }, { status: 404 });
  }
  return NextResponse.json({
    ...found,
    price: normalizeVehiclePrice(found.price),
  });
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  try {
    const body = await req.json();
    const finalPrice = normalizeVehiclePrice(body.price);

    try {
      const updatedDb = await prisma.vehicle.update({
        where: { id },
        data: {
          name: body.name,
          tagline: body.tagline,
          category: body.category,
          price: finalPrice,
          rangeKm: Number(body.rangeKm),
          topSpeed: Number(body.topSpeed),
          chargeTime: body.chargeTime,
          battery: body.battery,
          licenseType: body.licenseType,
          motorPower: body.motorPower,
          dimensions: body.dimensions,
          chargePower: body.chargePower,
          capacityDetails: body.capacityDetails,
          rimSize: body.rimSize,
          images: JSON.stringify(body.images || []),
          colors: JSON.stringify(body.colors || []),
          features: JSON.stringify(body.features || []),
          stockStatus: body.stockStatus,
          isPublished: body.isPublished !== undefined ? body.isPublished : true,
          showOnHomepage: body.showOnHomepage !== undefined ? body.showOnHomepage : true,
        },
      });
      return NextResponse.json({
        ...updatedDb,
        images: JSON.parse(updatedDb.images),
        colors: JSON.parse(updatedDb.colors),
        features: JSON.parse(updatedDb.features),
      });
    } catch {
      // In-memory update fallback
      const store = getVehiclesStore();
      const index = store.findIndex((v) => v.id === id);
      if (index !== -1) {
        store[index] = { ...store[index], ...body, price: finalPrice };
        setVehiclesStore(store);
        return NextResponse.json(store[index]);
      }
      return NextResponse.json({ error: 'Araç bulunamadı.' }, { status: 404 });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Araç güncellenemedi.' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  try {
    await prisma.vehicle.delete({
      where: { id },
    });
  } catch (err) {
    console.warn('Prisma delete failed, removing from store:', err);
  }

  const store = getVehiclesStore();
  const filtered = store.filter((v) => v.id !== id);
  setVehiclesStore(filtered);

  return NextResponse.json({ success: true, id });
}
