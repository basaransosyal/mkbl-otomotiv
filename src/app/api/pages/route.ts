import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const DEFAULT_PAGES_SEED = [
  {
    slug: 'ana-sayfa',
    title: 'Ana Sayfa & Manşet Hero',
    path: '/',
    metaTitle: 'MKBL Otomotiv - %100 Elektrikli Karea Fit İdeal Şehir Aracı',
    metaDescription: 'MKBL Otomotiv güvencesiyle %100 elektrikli ideal şehir aracı Karea Fit. Ev tipi 220V prizden hızlı şarj ve yüksek yakıt tasarrufu.',
    isPublished: true,
    isIndexable: true,
    pageType: 'SİSTEM',
    cmsTabTarget: 'homepage',
    content: 'Ana sayfa manşet başlığı, hero rozeti ve genel site tanıtım alanı.'
  },
  {
    slug: 'karea-fit-model',
    title: 'MKBL Karea Fit (Model Detay)',
    path: '/models/karea-fit',
    metaTitle: 'MKBL Karea Fit Teknik Özellikleri & 360° Renk Seçenekleri',
    metaDescription: 'MKBL Karea Fit %100 elektrikli araç teknik özellikleri, 135 km menzil, 90 km/s hız, 360° renk seçenekleri ve donanım paketi.',
    isPublished: true,
    isIndexable: true,
    pageType: 'MODEL',
    cmsTabTarget: 'vehicles',
    content: 'Karea Fit model detay sayfası, 360° renk konfigüratörü ve resmi teknik bilgi tablosu.'
  },
  {
    slug: 'tüm-modeller',
    title: 'Elektrikli Modeller Kataloğu',
    path: '/models',
    metaTitle: 'Tüm MKBL Elektrikli Araç Modelleri & Fiyat Listesi',
    metaDescription: 'MKBL Otomotiv elektrikli şehir araçları katalog ve fiyat listesi. Tüm modellerimizi inceleyin.',
    isPublished: true,
    isIndexable: true,
    pageType: 'SİSTEM',
    cmsTabTarget: 'vehicles',
    content: 'Tüm araç modellerini listeleyen ana katalog ve araç arama ekranı.'
  },
  {
    slug: 'servis-bakim',
    title: 'Servis & Bakım Hizmetleri',
    path: '/service',
    metaTitle: 'MKBL Otomotiv Maslak Yetkili Servis & Online Randevu',
    metaDescription: 'Karea Fit periyodik bakım, LFP batarya health check ve 220V ev şarjı güvenlik kontrolleri için Maslak yetkili servis randevusu alın.',
    isPublished: true,
    isIndexable: true,
    pageType: 'SİSTEM',
    cmsTabTarget: 'service',
    content: 'Yetkili servis bilgilendirmesi ve online yetkili servis randevu formu.'
  },
  {
    slug: 'showroom-iletisim',
    title: 'Showroom & İletişim',
    path: '/contact',
    metaTitle: 'Maslak Showroom İletişim & Canlı Harita - MKBL Otomotiv',
    metaDescription: 'Maslak Plaza showroom adresi, çalışma saatleri, müşteri hizmetleri telefonu ve canlı Google Haritalar konumu.',
    isPublished: true,
    isIndexable: true,
    pageType: 'SİSTEM',
    cmsTabTarget: 'showroom',
    content: 'Showroom açık adresi, canlı Google Harita embedi ve iletişim / teklif alma formu.'
  },
  {
    slug: 'gizlilik-kvkk',
    title: 'Gizlilik & KVKK Politikaları',
    path: '/privacy',
    metaTitle: 'Gizlilik Politikası, Kullanım Şartları & KVKK Metni',
    metaDescription: 'MKBL Otomotiv kişisel verilerin korunması kanunu (KVKK) aydınlatma metni ve kullanım şartları.',
    isPublished: true,
    isIndexable: true,
    pageType: 'SİSTEM',
    cmsTabTarget: 'legal',
    content: 'Kullanım şartları, gizlilik politikası ve KVKK aydınlatma metinleri.'
  }
];

export async function GET() {
  try {
    let pages = await prisma.customPage.findMany({
      orderBy: { createdAt: 'asc' },
    });

    // Seed default pages if table is empty
    if (pages.length === 0) {
      for (const p of DEFAULT_PAGES_SEED) {
        await prisma.customPage.create({ data: p });
      }
      pages = await prisma.customPage.findMany({
        orderBy: { createdAt: 'asc' },
      });
    }

    // Auto-sync all vehicles in DB with CustomPage so every vehicle model page is editable
    try {
      const vehicles = await prisma.vehicle.findMany();
      let hasNewPageCreated = false;

      for (const v of vehicles) {
        const targetPath = `/models/${v.id}`;
        const nameSlug = v.name.toLowerCase().trim().replace(/\s+/g, '-');
        const altPath = `/models/${nameSlug}`;

        const existing = pages.find(
          (p) =>
            p.path === targetPath ||
            p.path === altPath ||
            p.slug === `model-${v.id}` ||
            p.slug === `${nameSlug}-model`
        );

        if (!existing) {
          await prisma.customPage.create({
            data: {
              slug: `model-${v.id}`,
              title: `MKBL ${v.name} (Model Detay)`,
              path: targetPath,
              metaTitle: `MKBL ${v.name} Teknik Özellikleri & 360° Renk Seçenekleri`,
              metaDescription: `MKBL ${v.name} %100 elektrikli araç teknik özellikleri, ${v.rangeKm} km menzil, ${v.topSpeed} km/s hız, 360° renk seçenekleri ve donanım paketi.`,
              isPublished: v.isPublished !== false,
              isIndexable: true,
              pageType: 'MODEL',
              cmsTabTarget: 'vehicles',
              content: `${v.name} model detay sayfası, 360° renk konfigüratörü ve resmi teknik bilgi tablosu.`,
            },
          });
          hasNewPageCreated = true;
        }
      }

      if (hasNewPageCreated) {
        pages = await prisma.customPage.findMany({
          orderBy: { createdAt: 'asc' },
        });
      }
    } catch (vErr) {
      console.error('Vehicle auto-sync to CustomPage error:', vErr);
    }

    return NextResponse.json(pages);
  } catch (error) {
    console.error('Fetch custom pages error:', error);
    return NextResponse.json({ error: 'Failed to fetch pages' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, path, slug, metaTitle, metaDescription, content, isPublished, isIndexable, pageType, cmsTabTarget } = body;

    if (!title || !path) {
      return NextResponse.json({ error: 'Başlık ve URL yolu zorunludur' }, { status: 400 });
    }

    const pageSlug = slug || path.replace(/^\//, '').replace(/\//g, '-') || `page-${Date.now()}`;

    const newPage = await prisma.customPage.create({
      data: {
        slug: pageSlug,
        title,
        path: path.startsWith('/') ? path : `/${path}`,
        metaTitle: metaTitle || title,
        metaDescription: metaDescription || '',
        content: content || '',
        isPublished: isPublished !== false,
        isIndexable: isIndexable !== false,
        pageType: pageType || 'ÖZEL',
        cmsTabTarget: cmsTabTarget || null,
      },
    });

    return NextResponse.json(newPage, { status: 201 });
  } catch (error) {
    console.error('Create custom page error:', error);
    return NextResponse.json({ error: 'Failed to create custom page' }, { status: 500 });
  }
}
