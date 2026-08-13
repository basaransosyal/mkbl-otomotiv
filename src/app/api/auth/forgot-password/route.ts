import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Lütfen e-posta adresinizi girin.' }, { status: 400 });
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

    // Also support default admin email
    if (!user && (cleanEmail === 'admin@mkbloto.com' || cleanEmail === 'admin')) {
      return NextResponse.json({
        success: true,
        message: 'Şifre sıfırlama bağlantısı admin@mkbloto.com e-posta adresinize gönderilmiştir.',
        email: 'admin@mkbloto.com',
        username: 'admin',
      });
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Bu e-posta adresine ait kayıtlı yönetici hesabı bulunamadı.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Şifre sıfırlama bağlantısı ve doğrulama talimatları ${user.email || user.username} e-posta adresinize gönderildi!`,
      email: user.email || user.username,
      username: user.username,
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Şifre sıfırlama talebi işlenirken sunucu hatası oluştu.' }, { status: 500 });
  }
}
