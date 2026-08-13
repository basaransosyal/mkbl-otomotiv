import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await prisma.adminUser.findUnique({
      where: { id: params.id },
    });

    if (!user) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: 'Fetch user error' }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const { id, createdAt, updatedAt, requesterRole, ...updateData } = body;

    // Fetch existing user to check role
    const existing = await prisma.adminUser.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı.' }, { status: 404 });
    }

    // Protection rule: If existing user is Super Admin or username is 'admin', only Super Admin can edit
    const isTargetSuper = existing.role === 'SÜPER ADMİN' || existing.username === 'admin';
    if (isTargetSuper && requesterRole !== 'SÜPER ADMİN') {
      return NextResponse.json(
        { error: 'Süper Admin kullanıcı bilgilerini ve şifresini sadece Süper Admin yetkisine sahip kullanıcılar değiştirebilir!' },
        { status: 403 }
      );
    }

    // Protection rule: Non-Super Admin cannot promote anyone to Super Admin
    if (updateData.role === 'SÜPER ADMİN' && requesterRole !== 'SÜPER ADMİN') {
      return NextResponse.json(
        { error: 'Süper Admin yetkisi atamaya izniniz bulunmamaktadır!' },
        { status: 403 }
      );
    }

    const updated = await prisma.adminUser.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const existing = await prisma.adminUser.findUnique({
      where: { id: params.id },
    });

    if (existing && (existing.role === 'SÜPER ADMİN' || existing.username === 'admin')) {
      return NextResponse.json({ error: 'Süper Admin hesabı silinemez!' }, { status: 403 });
    }

    await prisma.adminUser.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}
