import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { updateTestDriveStatusStore, deleteTestDriveStore } from '@/lib/data';

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  try {
    const { status } = await req.json();

    try {
      const updated = await prisma.testDriveRequest.update({
        where: { id },
        data: { status },
      });
      return NextResponse.json(updated);
    } catch {
      updateTestDriveStatusStore(id, status);
      return NextResponse.json({ success: true, id, status });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Durum güncellenemedi.' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  try {
    try {
      await prisma.testDriveRequest.delete({
        where: { id },
      });
      return NextResponse.json({ success: true, id });
    } catch {
      deleteTestDriveStore(id);
      return NextResponse.json({ success: true, id });
    }
  } catch (error) {
    return NextResponse.json({ error: 'Test sürüşü talebi silinemedi.' }, { status: 500 });
  }
}
