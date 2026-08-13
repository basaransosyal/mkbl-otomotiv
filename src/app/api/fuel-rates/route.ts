import { NextResponse } from 'next/server';
import { getLiveFuelAndElectricityRates } from '@/lib/fuelService';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const forceRefresh = searchParams.get('refresh') === 'true';
    const data = await getLiveFuelAndElectricityRates(forceRefresh || true);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Fetch fuel rates API error:', error);
    return NextResponse.json(
      {
        electricityRate: 2.75,
        gasolinePrice: 44.50,
        isLive: false,
        lastUpdated: new Date().toLocaleDateString('tr-TR'),
        sourceName: 'Varsayılan Birim Fiyat',
      },
      { status: 200 }
    );
  }
}
