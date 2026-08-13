const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const vehicles = await prisma.vehicle.findMany();
  
  for (const v of vehicles) {
    let images = [];
    try {
      images = JSON.parse(v.images || '[]');
    } catch (e) {
      images = [];
    }

    // Filter out unuploaded mock images
    const cleanImages = images.filter(img => 
      !img.includes('official_1') &&
      !img.includes('official_2') &&
      !img.includes('official_3') &&
      !img.includes('official_4') &&
      !img.includes('karea_fit.jpg') &&
      !img.includes('karea_fit_white.jpg') &&
      !img.includes('cargo.jpg') &&
      !img.includes('city.jpg') &&
      !img.includes('sport.jpg')
    );

    if (cleanImages.length === 0) {
      cleanImages.push('/images/karea_official_hero.jpg');
    }

    let colors = [];
    try {
      colors = JSON.parse(v.colors || '[]');
    } catch (e) {
      colors = [];
    }

    const cleanColors = colors.map(c => {
      let angleImages = c.angleImages || [];
      angleImages = angleImages.filter(img => 
        !img.includes('official_1') &&
        !img.includes('official_2') &&
        !img.includes('official_3') &&
        !img.includes('official_4') &&
        !img.includes('karea_fit.jpg') &&
        !img.includes('karea_fit_white.jpg') &&
        !img.includes('cargo.jpg') &&
        !img.includes('city.jpg') &&
        !img.includes('sport.jpg')
      );
      return { ...c, angleImages };
    });

    await prisma.vehicle.update({
      where: { id: v.id },
      data: {
        images: JSON.stringify(cleanImages),
        colors: JSON.stringify(cleanColors)
      }
    });
  }

  console.log('Database purged of all unuploaded stock demo images!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
