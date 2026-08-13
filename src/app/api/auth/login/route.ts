import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const DEFAULT_SUPER_ADMIN = {
  username: 'admin',
  fullName: 'MKBL Süper Admin',
  email: 'admin@mkbloto.com',
  password: 'mkbl2026',
  role: 'SÜPER ADMİN',
  isActive: true,
};

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Kullanıcı adı ve şifre zorunludur.' }, { status: 400 });
    }

    const cleanUsername = username.toLowerCase().trim();

    // Check DB users
    let user = await prisma.adminUser.findFirst({
      where: {
        username: {
          equals: cleanUsername,
        },
      },
    });

    // If no users exist at all in DB, seed default super admin
    if (!user) {
      const userCount = await prisma.adminUser.count();
      if (userCount === 0) {
        user = await prisma.adminUser.create({
          data: DEFAULT_SUPER_ADMIN,
        });
      }
    }

    // Check fallback super admin credentials if username is 'admin' and DB match failed
    if (!user && (cleanUsername === 'admin' || cleanUsername === 'mkbl')) {
      if (password === 'mkbl2026') {
        return NextResponse.json({
          success: true,
          user: {
            username: 'admin',
            fullName: 'MKBL Süper Admin',
            role: 'SÜPER ADMİN',
            email: 'admin@mkbloto.com',
          },
        });
      }
    }

    if (!user) {
      return NextResponse.json({ error: 'Kullanıcı adı veya şifre hatalı!' }, { status: 401 });
    }

    if (!user.isActive) {
      return NextResponse.json({ error: 'Bu kullanıcı hesabı askıya alınmıştır. Lütfen Süper Admin ile iletişime geçin.' }, { status: 403 });
    }

    if (user.password !== password) {
      return NextResponse.json({ error: 'Kullanıcı adı veya şifre hatalı!' }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        role: user.role,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Giriş yapılırken sunucu hatası oluştu.' }, { status: 500 });
  }
}
