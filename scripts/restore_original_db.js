const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const originalColors = [
    {
      name: "Satsuma Turuncusu",
      badge: "Satsuma Turuncusu",
      hex: "#c36844",
      angleImages: [
        "/uploads/2_1784875244201.png",
        "/uploads/3_1784875244153.png",
        "/uploads/4_1784875244108.png",
        "/uploads/5_1784875244061.png",
        "/uploads/6_1784875244280.png",
        "/uploads/1_1784875244240.png"
      ]
    },
    {
      name: "Zeytin Yeşili",
      badge: "Zeytin Yeşili",
      hex: "#65a752",
      angleImages: [
        "/uploads/2__3__1784817573246.png",
        "/uploads/3__3__1784817573206.png",
        "/uploads/4__3__1784817573168.png",
        "/uploads/5__3__1784817573130.png",
        "/uploads/6__3__1784817573095.png",
        "/uploads/1__3__1784817573067.png"
      ]
    },
    {
      name: "Akdeniz Mavisi",
      badge: "Akdeniz Mavisi",
      hex: "#3982b1",
      angleImages: [
        "/uploads/2__1__1784875304317.png",
        "/uploads/3__1__1784875304268.png",
        "/uploads/4__1__1784875304202.png",
        "/uploads/5__1__1784875304001.png",
        "/uploads/6__1__1784875303967.png",
        "/uploads/1__1__1784875303919.png"
      ]
    },
    {
      name: "Sıcak Kum",
      badge: "Sıcak Kum",
      hex: "#c2a999",
      angleImages: [
        "/uploads/2__2__1784875372901.png",
        "/uploads/3__2__1784875372601.png",
        "/uploads/4__2__1784875372561.png",
        "/uploads/5__2__1784875372526.png",
        "/uploads/6__2__1784875372490.png",
        "/uploads/1__2__1784875372448.png"
      ]
    },
    {
      name: "Bulut Gri",
      badge: "Bulut Gri",
      hex: "#b5b2ae",
      angleImages: [
        "/uploads/2__4__1784875491145.png",
        "/uploads/3__4__1784875491100.png",
        "/uploads/4__4__1784875491052.png",
        "/uploads/5__4__1784875491002.png",
        "/uploads/6__4__1784875490957.png",
        "/uploads/1__4__1784875490900.png"
      ]
    },
    {
      name: "Akşam Güneşi",
      badge: "Akşam Güneşi",
      hex: "#c52626",
      angleImages: [
        "/uploads/2__5__1784875543742.png",
        "/uploads/3__5__1784875543550.png",
        "/uploads/4__5__1784875543517.png",
        "/uploads/5__5__1784875543478.png",
        "/uploads/6__5__1784875543433.png",
        "/uploads/1__5__1784875543401.png"
      ]
    }
  ];

  const vehicles = await prisma.vehicle.findMany();
  for (const v of vehicles) {
    if (v.id === 'karea-1784807667000' || v.id === 'karea-fit' || v.name.toLowerCase().includes('fit')) {
      await prisma.vehicle.update({
        where: { id: v.id },
        data: {
          colors: JSON.stringify(originalColors),
          images: JSON.stringify(['/images/karea_official_hero.jpg'])
        }
      });
    }
  }

  console.log('Restored user uploaded 360 color angle images to database!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
