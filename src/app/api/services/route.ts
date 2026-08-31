import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServicesStore, addServiceStore, ServiceAppointment } from '@/lib/data';
import { sendFormEmailNotification } from '@/lib/mailer';

export async function GET() {
  try {
    const list = await prisma.serviceAppointment.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(list);
  } catch (err) {
    console.warn('Prisma get services error:', err);
    return NextResponse.json(getServicesStore());
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    try {
      const created = await prisma.serviceAppointment.create({
        data: ({
          fullName: body.fullName || 'Misafir Müşteri',
          phone: body.phone || '',
          email: body.email || '',
          licensePlate: body.licensePlate || '07 KRA 00',
          vehicleModel: body.vehicleModel || 'Karea Fit',
          serviceType: body.serviceType || 'Batarya Check-up & LFP Testi',
          appointmentDate: body.appointmentDate || new Date().toISOString().split('T')[0],
          appointmentTime: body.appointmentTime || '10:00',
          status: 'BEKLEMEDE',
          userNotes: body.userNotes || '',
          landingUrl: body.landingUrl || body.landing_url || null,
          utmSource: body.utmSource || body.utm_source || null,
          utmMedium: body.utmMedium || body.utm_medium || null,
          utmCampaign: body.utmCampaign || body.utm_campaign || null,
          utmTerm: body.utmTerm || body.utm_term || null,
          utmContent: body.utmContent || body.utm_content || null,
          gclid: body.gclid || null,
          fbclid: body.fbclid || null,
        }) as any,
      });

      // Dispatch E-mail to SSH role recipients
      const origin = req.headers.get('origin') || 'http://localhost:3000';
      sendFormEmailNotification({
        formType: 'SERVICE',
        title: 'Yeni Servis Randevu Talebi',
        badge: 'SSH FORMU',
        customerName: created.fullName,
        customerPhone: created.phone,
        customerEmail: created.email,
        details: [
          { label: 'Araç Modeli', value: created.vehicleModel },
          { label: 'Araç Plakası', value: created.licensePlate },
          { label: 'Talep Edilen Servis İşlemi', value: created.serviceType },
          { label: 'Randevu Tarihi & Saat', value: `${created.appointmentDate} / ${created.appointmentTime}` },
        ],
        notes: created.userNotes,
        adminLink: `${origin}/mkbl-kontrol-77/services`,
      }).catch((e) => console.error('Service email dispatch error:', e));

      return NextResponse.json(created, { status: 201 });
    } catch (dbErr) {
      console.error('Prisma service appointment create error:', dbErr);
      const fallbackSrv: ServiceAppointment = {
        id: `srv-${Date.now()}`,
        fullName: body.fullName || 'Misafir Müşteri',
        phone: body.phone || '',
        email: body.email || '',
        licensePlate: body.licensePlate || '07 KRA 00',
        vehicleModel: body.vehicleModel || 'Karea Fit',
        serviceType: body.serviceType || 'Batarya Check-up & LFP Testi',
        appointmentDate: body.appointmentDate || new Date().toISOString().split('T')[0],
        appointmentTime: body.appointmentTime || '10:00',
        status: 'BEKLEMEDE',
        userNotes: body.userNotes || '',
        createdAt: new Date().toISOString(),
      };
      addServiceStore(fallbackSrv);
      return NextResponse.json(fallbackSrv, { status: 201 });
    }
  } catch (error) {
    console.error('POST service appointment server error:', error);
    return NextResponse.json({ error: 'Servis randevusu oluşturulamadı.' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { ids } = await req.json();
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'Silinecek kayıt seçilmedi.' }, { status: 400 });
    }

    try {
      await prisma.serviceAppointment.deleteMany({
        where: { id: { in: ids } },
      });
      return NextResponse.json({ success: true, count: ids.length });
    } catch (dbErr) {
      const { deleteServicesStore } = await import('@/lib/data');
      deleteServicesStore(ids);
      return NextResponse.json({ success: true, count: ids.length });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Toplu silme başarısız.' }, { status: 500 });
  }
}
