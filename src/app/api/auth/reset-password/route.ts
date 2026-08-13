import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { email, newPassword } = await req.json();

    if (!email || !newPassword) {
      return NextResponse.json({ error: 'E-posta adresi ve yeni şifre zorunludur.' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Find user by email or username
    const user = await prisma.adminUser.findFirst({
      where: {
        OR: [
          { email: { equals: cleanEmail } },
          { username: { equals: cleanEmail } },
        ],
      },
    });

    if (user) {
      await prisma.adminUser.update({
        where: { id: user.id },
        data: { password: newPassword },
      });
      return NextResponse.json({ success: true, message: 'Şifreniz başarıyla güncellendi! Yeni şifrenizle giriş yapabilirsiniz.' });
    }

    // Default admin fallback
    if (cleanEmail === 'admin@mkbloto.com' || cleanEmail === 'admin') {
      const adminUser = await prisma.adminUser.findFirst({ where: { username: 'admin' } });
      if (adminUser) {
        await prisma.adminUser.update({
          where: { id: adminUser.id },
          data: { password: newPassword },
        });
      }
      return NextResponse.json({ success: true, message: 'Süper Admin şifreniz başarıyla güncellendi! Yeni şifrenizle giriş yapabilirsiniz.' });
    }

    return NextResponse.json({ error: 'Kullanıcı bulunamadı.' }, { status: 404 });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: 'Şifre güncellenirken sunucu hatası oluştu.' }, { status: 500 });
  }
}
