import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { INITIAL_GALLERY_SLIDES, getGallerySlidesStore, setGallerySlidesStore, GallerySlideItem } from '@/lib/data';

export async function GET() {
  try {
    let slides = await prisma.gallerySlide.findMany({
      orderBy: { order: 'asc' },
    });

    if (!slides || slides.length === 0) {
      try {
        await prisma.gallerySlide.createMany({
          data: INITIAL_GALLERY_SLIDES.map((s) => ({
            id: s.id,
            vehicleId: s.vehicleId || 'karea-fit',
            title: s.title,
            subtitle: s.subtitle || '',
            description: s.description || '',
            tagText: s.tagText || 'Karea Özel Donanım',
            imageUrl: s.imageUrl,
            order: s.order,
            isPublished: s.isPublished !== false,
          })),
        });
        slides = await prisma.gallerySlide.findMany({
          orderBy: { order: 'asc' },
        });
      } catch (err) {
        console.warn('Create initial gallery slides error:', err);
      }
    }

    if (slides && slides.length > 0) {
      return NextResponse.json(slides);
    }
    return NextResponse.json(getGallerySlidesStore());
  } catch (error) {
    console.error('GET /api/gallery error:', error);
    return NextResponse.json(getGallerySlidesStore());
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const newSlideData = {
      id: body.id || `slide-${Date.now()}`,
      vehicleId: body.vehicleId || 'karea-fit',
      title: body.title || 'Yeni Galeri Görseli',
      subtitle: body.subtitle || '',
      description: body.description || '',
      tagText: body.tagText || 'Karea Özel Donanım',
      imageUrl: body.imageUrl || '/images/karea_official_1.jpg',
      order: Number(body.order) || 0,
      isPublished: body.isPublished !== undefined ? body.isPublished : true,
    };

    try {
      const created = await prisma.gallerySlide.create({
        data: newSlideData,
      });
      return NextResponse.json(created, { status: 201 });
    } catch (dbErr) {
      console.warn('Prisma gallery create error:', dbErr);
      const store = getGallerySlidesStore();
      store.push(newSlideData);
      setGallerySlidesStore(store);
      return NextResponse.json(newSlideData, { status: 201 });
    }
  } catch (error) {
    console.error('POST /api/gallery error:', error);
    return NextResponse.json({ error: 'Galeri slaydı oluşturulamadı.' }, { status: 500 });
  }
}
