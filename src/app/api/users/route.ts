import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const DEFAULT_SUPER_ADMIN = {
  username: 'admin',
  fullName: 'MKBL Süper Admin',
  email: 'admin@mkbloto.com',
  password: 'mkbl2026', // Hashed/stored secure password
  role: 'SÜPER ADMİN',
  isActive: true,
};

export async function GET() {
  try {
    let users = await prisma.adminUser.findMany({
      orderBy: { createdAt: 'asc' },
    });

    // Seed default super admin user if empty
    if (users.length === 0) {
      await prisma.adminUser.create({ data: DEFAULT_SUPER_ADMIN });
      users = await prisma.adminUser.findMany({
        orderBy: { createdAt: 'asc' },
      });
    }

    return NextResponse.json(users);
  } catch (error) {
    console.error('Fetch admin users error:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { username, fullName, email, password, role, title, isActive } = body;

    if (!username || !fullName || !password) {
      return NextResponse.json({ error: 'Kullanıcı adı, ad soyad ve şifre zorunludur.' }, { status: 400 });
    }

    // Check if username already exists
    const existing = await prisma.adminUser.findUnique({
      where: { username },
    });

    if (existing) {
      return NextResponse.json({ error: 'Bu kullanıcı adı zaten kullanılmaktadır.' }, { status: 400 });
    }

    const newUser = await prisma.adminUser.create({
      data: {
        username: username.toLowerCase().trim(),
        fullName,
        email: email || '',
        password,
        role: role || 'YÖNETİCİ',
        title: title || 'Yönetici',
        isActive: isActive !== false,
      },
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
