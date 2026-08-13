import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { updateMessageStatusStore, deleteMessageStore, ContactMessage } from '@/lib/data';

const prisma = new PrismaClient();

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { status } = body as { status: ContactMessage['status'] };

    try {
      const updated = await prisma.contactMessage.update({
        where: { id: params.id },
        data: { status },
      });
      return NextResponse.json(updated);
    } catch (e) {
      console.log('Prisma fallback for PATCH /api/messages/[id]');
      updateMessageStatusStore(params.id, status);
      return NextResponse.json({ id: params.id, status });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Güncellenemedi.' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    try {
      await prisma.contactMessage.delete({
        where: { id: params.id },
      });
      return NextResponse.json({ success: true, id: params.id });
    } catch (e) {
      deleteMessageStore(params.id);
      return NextResponse.json({ success: true, id: params.id });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Mesaj silinemedi.' }, { status: 500 });
  }
}
