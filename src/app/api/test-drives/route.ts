import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTestDrivesStore, addTestDriveStore, TestDriveRequest } from '@/lib/data';
import { sendFormEmailNotification } from '@/lib/mailer';

export async function GET() {
  try {
    const list = await prisma.testDriveRequest.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(list);
  } catch (err) {
    console.warn('Prisma get test drives error:', err);
    return NextResponse.json(getTestDrivesStore());
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    try {
      const created = await prisma.testDriveRequest.create({
        data: {
          fullName: body.fullName || 'Misafir Müşteri',
          phone: body.phone || '',
          email: body.email || '',
          city: body.city || 'Antalya (Kepez Showroom)',
          vehicleId: body.vehicleId || 'karea-fit',
          vehicleName: body.vehicleName || 'Karea Fit',
          preferredDate: body.preferredDate || new Date().toISOString().split('T')[0],
          preferredTime: body.preferredTime || '14:00',
          status: 'BEKLEMEDE',
          notes: body.notes || '',
        },
      });

      // Dispatch E-mail to SATIŞ role recipients
      const origin = req.headers.get('origin') || 'http://localhost:3000';
      sendFormEmailNotification({
        formType: 'TEST_DRIVE',
        title: 'Yeni Test Sürüşü Randevu Talebi',
        badge: 'SATIŞ FORMU',
        customerName: created.fullName,
        customerPhone: created.phone,
        customerEmail: created.email,
        details: [
          { label: 'Talep Edilen Araç Modeli', value: created.vehicleName },
          { label: 'Tercih Edilen Tarih', value: created.preferredDate },
          { label: 'Tercih Edilen Saat', value: created.preferredTime },
          { label: 'Lokasyon / Şehir', value: created.city },
        ],
        notes: created.notes,
        adminLink: `${origin}/admin/test-drives`,
      }).catch((e) => console.error('Test drive email dispatch error:', e));

      return NextResponse.json(created, { status: 201 });
    } catch (dbErr) {
      console.error('Prisma test drive create error:', dbErr);
      const fallbackTD: TestDriveRequest = {
        id: `td-${Date.now()}`,
        fullName: body.fullName || 'Misafir Müşteri',
        phone: body.phone || '',
        email: body.email || '',
        city: body.city || 'Antalya (Kepez Showroom)',
        vehicleId: body.vehicleId || 'karea-fit',
        vehicleName: body.vehicleName || 'Karea Fit',
        preferredDate: body.preferredDate || new Date().toISOString().split('T')[0],
        preferredTime: body.preferredTime || '14:00',
        status: 'BEKLEMEDE',
        notes: body.notes || '',
        createdAt: new Date().toISOString(),
      };
      addTestDriveStore(fallbackTD);
      return NextResponse.json(fallbackTD, { status: 201 });
    }
  } catch (error) {
    console.error('POST test drive server error:', error);
    return NextResponse.json({ error: 'Test sürüşü talebi oluşturulamadı.' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { ids } = await req.json();
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'Silinecek kayıt seçilmedi.' }, { status: 400 });
    }

    try {
      await prisma.testDriveRequest.deleteMany({
        where: { id: { in: ids } },
      });
      return NextResponse.json({ success: true, count: ids.length });
    } catch (dbErr) {
      const { deleteTestDrivesStore } = await import('@/lib/data');
      deleteTestDrivesStore(ids);
      return NextResponse.json({ success: true, count: ids.length });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Toplu silme başarısız.' }, { status: 500 });
  }
}
