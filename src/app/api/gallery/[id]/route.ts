import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getGallerySlidesStore, setGallerySlidesStore } from '@/lib/data';

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  try {
    const body = await req.json();

    try {
      const updated = await prisma.gallerySlide.update({
        where: { id },
        data: {
          vehicleId: body.vehicleId,
          title: body.title,
          subtitle: body.subtitle,
          description: body.description,
          tagText: body.tagText,
          imageUrl: body.imageUrl,
          order: body.order !== undefined ? Number(body.order) : undefined,
          isPublished: body.isPublished !== undefined ? body.isPublished : undefined,
        },
      });
      return NextResponse.json(updated);
    } catch (dbErr) {
      console.warn('Prisma update gallery slide fallback:', dbErr);
      const store = getGallerySlidesStore();
      const index = store.findIndex((s) => s.id === id);
      if (index !== -1) {
        store[index] = { ...store[index], ...body };
        setGallerySlidesStore(store);
        return NextResponse.json(store[index]);
      }
      return NextResponse.json({ error: 'Galeri slaydı bulunamadı.' }, { status: 404 });
    }
  } catch (error) {
    console.error('PUT /api/gallery/[id] error:', error);
    return NextResponse.json({ error: 'Galeri slaydı güncellenemedi.' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  try {
    try {
      await prisma.gallerySlide.delete({
        where: { id },
      });
    } catch (dbErr) {
      console.warn('Prisma delete gallery slide fallback:', dbErr);
      const store = getGallerySlidesStore().filter((s) => s.id !== id);
      setGallerySlidesStore(store);
    }
    return NextResponse.json({ success: true, message: 'Galeri slaydı silindi.' });
  } catch (error) {
    console.error('DELETE /api/gallery/[id] error:', error);
    return NextResponse.json({ error: 'Galeri slaydı silinemedi.' }, { status: 500 });
  }
}
