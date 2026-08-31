import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getMessagesStore, addMessageStore, ContactMessage } from '@/lib/data';
import { sendFormEmailNotification } from '@/lib/mailer';

export async function GET() {
  try {
    const messages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(messages);
  } catch (error) {
    console.warn('Prisma get messages error:', error);
    return NextResponse.json(getMessagesStore());
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    try {
      const created = await prisma.contactMessage.create({
        data: ({
          fullName: body.fullName || 'İsimsiz Müşteri',
          phone: body.phone || '',
          email: body.email || '',
          subject: body.subject || 'Showroom İletişim',
          message: body.message || '',
          status: 'BEKLEMEDE',
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

      // Dispatch E-mail to MÜŞTERİ İLİŞKİLERİ role recipients
      const origin = req.headers.get('origin') || 'http://localhost:3000';
      sendFormEmailNotification({
        formType: 'CONTACT',
        title: 'Yeni İletişim Formu Mesajı',
        badge: 'MÜŞTERİ İLİŞKİLERİ FORMU',
        customerName: created.fullName,
        customerPhone: created.phone,
        customerEmail: created.email,
        details: [
          { label: 'Mesaj Konusu', value: created.subject },
        ],
        notes: created.message,
        adminLink: `${origin}/mkbl-kontrol-77/messages`,
      }).catch((e) => console.error('Contact email dispatch error:', e));

      return NextResponse.json(created, { status: 201 });
    } catch (dbErr) {
      console.error('Prisma contact message create error:', dbErr);
      const fallbackMsg: ContactMessage = {
        id: `msg-${Date.now()}`,
        fullName: body.fullName || 'İsimsiz Müşteri',
        phone: body.phone || '',
        email: body.email || '',
        subject: body.subject || 'Showroom İletişim',
        message: body.message || '',
        status: 'BEKLEMEDE',
        createdAt: new Date().toISOString(),
      };
      addMessageStore(fallbackMsg);
      return NextResponse.json(fallbackMsg, { status: 201 });
    }
  } catch (error) {
    console.error('POST message server error:', error);
    return NextResponse.json({ error: 'Mesaj gönderilemedi.' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { ids } = await req.json();
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'Silinecek mesaj seçilmedi.' }, { status: 400 });
    }

    try {
      await prisma.contactMessage.deleteMany({
        where: { id: { in: ids } },
      });
      return NextResponse.json({ success: true, count: ids.length });
    } catch (dbErr) {
      const { deleteMessagesStore } = await import('@/lib/data');
      deleteMessagesStore(ids);
      return NextResponse.json({ success: true, count: ids.length });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Toplu silme başarısız.' }, { status: 500 });
  }
}
