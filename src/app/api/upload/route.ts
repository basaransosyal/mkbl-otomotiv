import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'Dosya bulunamadı.' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Ensure public/uploads directory exists
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadsDir, { recursive: true });

    // Validate file type & extension for security
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.svg', '.gif'];
    const fileExt = (path.extname(file.name) || '.jpg').toLowerCase();
    
    if (!allowedExtensions.includes(fileExt) || !file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Güvenlik uyarısı: Yalnızca resim dosyalarına (.jpg, .png, .webp, .svg, .gif) izin verilir.' }, { status: 400 });
    }

    const cleanBase = path.basename(file.name, fileExt).replace(/[^a-zA-Z0-9_-]/g, '_');
    const fileName = `${cleanBase}_${Date.now()}${fileExt}`;
    const filePath = path.join(uploadsDir, fileName);

    await writeFile(filePath, buffer);

    const fileUrl = `/uploads/${fileName}`;
    return NextResponse.json({ url: fileUrl, fileName });
  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json({ error: 'Yükleme sırasında hata oluştu.' }, { status: 500 });
  }
}
