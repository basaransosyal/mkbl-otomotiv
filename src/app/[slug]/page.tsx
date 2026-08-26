import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '../../lib/prisma';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import BankCard from '../../components/BankCard';
import CostCalculator from '../../components/CostCalculator';
import Vehicle360Viewer from '../../components/Vehicle360Viewer';
import VehicleGallerySlider from '../../components/VehicleGallerySlider';
import { INITIAL_VEHICLES } from '../../lib/data';
import {
  ChevronRight,
  Sparkles,
  Building2,
  Copy,
  Check,
  FileText,
  ArrowRight,
  ShieldCheck,
  Zap,
  Gauge,
  BatteryCharging,
  Car,
  Calendar,
  PhoneCall,
  Clock,
  MapPin,
  Info,
  Rotate3d,
  Image as ImageIcon
} from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  params: {
    slug: string;
  };
}

async function getPageBySlug(slug: string) {
  const cleanSlug = slug.replace(/^\//, '');
  const page = await prisma.customPage.findFirst({
    where: {
      OR: [
        { slug: cleanSlug },
        { path: `/${cleanSlug}` },
        { path: cleanSlug },
        { path: `/models/${cleanSlug}` },
        { slug: `model-${cleanSlug}` }
      ],
    },
  });
  return page;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const page = await getPageBySlug(params.slug);
  if (!page || !page.isPublished) {
    return {
      title: 'Sayfa Bulunamadı - MKBL Otomotiv',
    };
  }

  return {
    title: `${page.metaTitle || page.title} | MKBL Otomotiv`,
    description: page.metaDescription || `${page.title} - MKBL Otomotiv kurumsal bilgi ve detaylar.`,
    openGraph: {
      title: page.metaTitle || page.title,
      description: page.metaDescription || '',
      url: `https://mkbloto.com${page.path}`,
      siteName: 'MKBL Otomotiv',
      locale: 'tr_TR',
      type: 'website',
    },
    robots: {
      index: page.isIndexable !== false,
      follow: page.isIndexable !== false,
    },
  };
}

export default async function CustomDynamicPage({ params }: PageProps) {
  const page = await getPageBySlug(params.slug);

  if (!page || !page.isPublished) {
    notFound();
  }

  // Parse page blocks if stored as JSON
  let blocks: any[] = [];
  let isBlockData = false;

  if (page.content) {
    try {
      const parsed = JSON.parse(page.content);
      if (Array.isArray(parsed) && parsed.length > 0) {
        blocks = parsed;
        isBlockData = true;
      }
    } catch (e) {
      isBlockData = false;
    }
  }

  // Fetch site settings for calculator defaults
  const settings = await prisma.siteSettings.findFirst();
  const defaultVehicle = INITIAL_VEHICLES[0];

  const defaultBankAccounts = [
    {
      bankName: 'Garanti BBVA',
      branchName: 'Antalya Ticaret Şubesi',
      branchCode: '014',
      accountNo: '6203060 (TL)',
      iban: 'TR25 0006 2000 0140 0006 2030 60',
      accountHolder: 'BAŞARAN OTOMOTİV OTELCİLİK TURİZM İNŞ. A.Ş.',
      logoBg: 'from-emerald-600 to-teal-800',
    },
    {
      bankName: 'Türkiye İş Bankası',
      branchName: 'Antalya Ticaret Şubesi',
      branchCode: '6225',
      accountNo: '8002 (TL)',
      iban: 'TR15 0006 4000 0016 2250 0080 02',
      accountHolder: 'BAŞARAN OTOMOTİV OTELCİLİK TURİZM İNŞ. A.Ş.',
      logoBg: 'from-blue-600 to-indigo-900',
    },
    {
      bankName: 'Halkbank',
      branchName: 'Antalya Ticaret Şubesi',
      branchCode: '0624',
      accountNo: '10100019 (TL)',
      iban: 'TR81 0001 2009 6240 0010 1000 19',
      accountHolder: 'BAŞARAN OTOMOTİV OTELCİLİK TURİZM İNŞ. A.Ş.',
      logoBg: 'from-sky-600 to-cyan-800',
    },
    {
      bankName: 'VakıfBank',
      branchName: 'Antalya Ticaret Şubesi',
      branchCode: '1224',
      accountNo: '007274157111 (TL)',
      iban: 'TR43 0001 5001 5800 7274 1571 11',
      accountHolder: 'BAŞARAN OTOMOTİV OTELCİLİK TURİZM İNŞ. A.Ş.',
      logoBg: 'from-amber-600 to-yellow-800',
    },
  ];

  return (
    <main className="min-h-screen bg-[#070D1C] text-white font-sans selection:bg-blue-500 selection:text-white pb-20">
      {/* HEADER NAVBAR */}
      <Navbar />

      {/* HERO / HEADER BANNER */}
      <div className="relative pt-32 pb-16 overflow-hidden border-b border-slate-800/80 bg-gradient-to-b from-[#0B1528] via-[#080F1E] to-[#070D1C]">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-4">
          <nav className="flex items-center space-x-2 text-xs text-gray-400">
            <Link href="/" className="hover:text-blue-400 transition-colors">
              Ana Sayfa
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
            <span className="text-gray-200 font-semibold truncate">{page.title}</span>
          </nav>

          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>MKBL OTOMOTİV KURUMSAL</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white font-['Outfit'] tracking-tight">
              {page.title}
            </h1>
            {page.metaDescription && (
              <p className="text-gray-300 text-sm sm:text-base max-w-3xl leading-relaxed">
                {page.metaDescription}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* PAGE CONTENT CONTAINER */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 space-y-12">
        {/* IF BLOCKS DATA CREATED IN VISUAL BUILDER */}
        {isBlockData && blocks.length > 0 ? (
          <div className="grid grid-cols-12 gap-6">
            {blocks.map((block: any, index: number) => {
              const bgClass =
                block.bgTheme === 'emerald'
                  ? 'bg-emerald-950/20 border-emerald-500/30'
                  : block.bgTheme === 'glass'
                  ? 'bg-[#0D1527]/80 backdrop-blur-xl border-blue-500/20'
                  : block.bgTheme === 'slate'
                  ? 'bg-[#091122] border-slate-700/60'
                  : 'bg-transparent border-transparent';

              const roundedClass =
                block.borderRadius === 'lg' ? 'rounded-xl' : 'rounded-3xl';
              const paddingClass =
                block.paddingSize === 'small'
                  ? 'p-4 sm:p-5'
                  : block.paddingSize === 'large'
                  ? 'p-8 sm:p-12'
                  : 'p-6 sm:p-8';
              const colSpanClass =
                block.width === 'half'
                  ? 'col-span-12 md:col-span-6'
                  : block.width === 'third'
                  ? 'col-span-12 md:col-span-4'
                  : block.width === 'twothirds'
                  ? 'col-span-12 md:col-span-8'
                  : 'col-span-12';

              return (
                <div
                  key={block.id || index}
                  className={`${colSpanClass} ${paddingClass} ${roundedClass} border shadow-xl transition-all duration-300 ${bgClass}`}
                >
                  {/* HERO BANNER */}
                  {block.type === 'hero' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center py-4">
                      <div className="lg:col-span-7 space-y-4">
                        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-950/80 border border-blue-500/30 text-xs font-semibold text-blue-400">
                          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                          <span>{block.title || 'MKBL Otomotiv Güvencesiyle %100 Elektrikli'}</span>
                        </div>
                        <h1 className="text-3xl sm:text-5xl font-extrabold text-white font-['Outfit'] tracking-tight leading-tight">
                          {block.heading || 'Bindiğin Gibi Değil. Karea Fit'}
                        </h1>
                        <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                          {block.text || 'Var olan bir sınıftan değil, yeni bir sınıfın ilki. %100 elektrikli Karea Fit, bugün şehir hayatına tam uyum sağlamak için tasarlandı.'}
                        </p>
                        <div className="grid grid-cols-3 gap-3 border-y border-blue-500/20 py-3 max-w-md">
                          <div>
                            <div className="text-xl sm:text-2xl font-extrabold text-white font-['Outfit']">135 km</div>
                            <div className="text-[11px] text-gray-400">Şehir İçi Menzil</div>
                          </div>
                          <div>
                            <div className="text-xl sm:text-2xl font-extrabold text-blue-400 font-['Outfit']">90 km/h</div>
                            <div className="text-[11px] text-gray-400">Azami Hız Limit</div>
                          </div>
                          <div>
                            <div className="text-xl sm:text-2xl font-extrabold text-emerald-400 font-['Outfit']">2 Saat</div>
                            <div className="text-[11px] text-gray-400">%20-%80 220V Şarj</div>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 pt-2">
                          <Link
                            href="/contact"
                            className="bg-gradient-to-r from-blue-600 via-blue-500 to-sky-400 text-white font-bold text-xs sm:text-sm px-6 py-3.5 rounded-2xl shadow-lg flex items-center space-x-2"
                          >
                            <span>Test Sürüşü Randevusu Al</span>
                            <ChevronRight className="w-4 h-4" />
                          </Link>
                          <Link
                            href="/models/karea-fit"
                            className="bg-white/5 hover:bg-white/10 text-white font-semibold text-xs sm:text-sm px-6 py-3.5 rounded-2xl border border-blue-500/30"
                          >
                            360° Modeli İncele
                          </Link>
                        </div>
                      </div>
                      <div className="lg:col-span-5 relative">
                        <div className="relative aspect-[4/3] w-full rounded-3xl overflow-hidden glass-panel p-2 border border-blue-500/30 shadow-2xl bg-gradient-to-b from-[#0F1C38] to-[#080E1C]">
                          <img
                            src="/images/karea_official_hero.jpg"
                            alt="Karea Fit"
                            className="w-full h-full object-contain p-4"
                          />
                          <div className="absolute bottom-4 left-4 right-4 p-3 rounded-2xl bg-[#091122]/90 backdrop-blur-md border border-blue-500/30 flex items-center justify-between">
                            <div>
                              <div className="text-[10px] uppercase font-semibold text-blue-400">KAREA FİT - BAŞLANGIÇ FİYATI</div>
                              <div className="text-lg font-bold text-white font-['Outfit']">₺749.000</div>
                            </div>
                            <div className="px-3 py-1 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold">
                              STOKTA
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 360 COLOR CONFIGURATOR */}
                  {block.type === 'configurator360' && (
                    <div className="space-y-4">
                      <Vehicle360Viewer vehicle={defaultVehicle} colors={defaultVehicle.colors} />
                    </div>
                  )}

                  {/* 3D PHOTO SLIDER GALLERY */}
                  {block.type === 'gallery360' && (
                    <div className="space-y-4">
                      <VehicleGallerySlider />
                    </div>
                  )}

                  {/* TECHNICAL SPECS TABLE */}
                  {block.type === 'specsTable' && (
                    <div className="space-y-6">
                      <h3 className="text-2xl font-bold text-white font-['Outfit'] flex items-center space-x-2">
                        <Info className="w-5 h-5 text-blue-400" />
                        <span>{block.heading || 'Resmi Teknik Bilgiler (Karea.com Verileri)'}</span>
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="flex justify-between py-2 border-b border-white/10">
                          <span className="text-gray-400">Peak Motor Gücü</span>
                          <span className="font-semibold text-white">12 kW (Peak Motor Gücü)</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-white/10">
                          <span className="text-gray-400">Batarya Tipi</span>
                          <span className="font-semibold text-blue-400">9.98 kWh LFP</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-white/10">
                          <span className="text-gray-400">Şehir İçi Menzil</span>
                          <span className="font-semibold text-blue-400">135 KM</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-white/10">
                          <span className="text-gray-400">Azami Hız</span>
                          <span className="font-semibold text-white">90 KM/S</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TEXT */}
                  {block.type === 'text' && (
                    <div className="space-y-3">
                      {block.heading && (
                        <h2 className="text-xl sm:text-2xl font-bold font-['Outfit'] text-white">
                          {block.heading}
                        </h2>
                      )}
                      {block.text && (
                        <div
                          className="text-gray-300 text-sm sm:text-base leading-relaxed whitespace-pre-line"
                          dangerouslySetInnerHTML={{ __html: block.text }}
                        ></div>
                      )}
                    </div>
                  )}

                  {/* IMAGE */}
                  {block.type === 'image' && block.imageUrl && (
                    <div className="space-y-3">
                      <div className="overflow-hidden rounded-2xl border border-slate-700/50 shadow-2xl">
                        <img
                          src={block.imageUrl}
                          alt={block.caption || page.title}
                          className="w-full h-auto object-cover max-h-[500px]"
                        />
                      </div>
                      {block.caption && (
                        <p className="text-center text-xs text-gray-400 italic">{block.caption}</p>
                      )}
                    </div>
                  )}

                  {/* BANK CARDS */}
                  {block.type === 'bank' && (
                    <div className="space-y-6">
                      {block.title && (
                        <h3 className="text-xl font-bold text-white font-['Outfit'] flex items-center space-x-2">
                          <Building2 className="w-5 h-5 text-emerald-400" />
                          <span>{block.title}</span>
                        </h3>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {(block.banks || defaultBankAccounts).map((bank: any, bIdx: number) => (
                          <BankCard key={bIdx} bank={bank} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* COST CALCULATOR */}
                  {block.type === 'calculator' && (
                    <div className="space-y-4">
                      <CostCalculator initialSettings={settings || undefined} />
                    </div>
                  )}

                  {/* FEATURES GRID */}
                  {block.type === 'featuresGrid' && (
                    <div className="space-y-6">
                      <div className="text-center space-y-2">
                        <h3 className="text-2xl font-extrabold text-white font-['Outfit']">
                          MKBL Karea Fit Öne Çıkan Donanım Özellikleri
                        </h3>
                        <p className="text-xs text-gray-400 max-w-xl mx-auto">
                          %100 elektrikli ideal şehir içi mobilite çözümü. Şehirde sıfır emisyon ve maksimum ekonomi.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-5 rounded-2xl bg-[#091225] border border-blue-500/20 text-center space-y-2">
                          <Zap className="w-8 h-8 text-emerald-400 mx-auto" />
                          <h4 className="font-extrabold text-white text-lg">135 KM</h4>
                          <p className="text-[11px] text-gray-400">Tek Şarjla Şehir İçi Menzil</p>
                        </div>
                        <div className="p-5 rounded-2xl bg-[#091225] border border-blue-500/20 text-center space-y-2">
                          <Gauge className="w-8 h-8 text-blue-400 mx-auto" />
                          <h4 className="font-extrabold text-white text-lg">90 KM/S</h4>
                          <p className="text-[11px] text-gray-400">Maksimum Hız Kapasitesi</p>
                        </div>
                        <div className="p-5 rounded-2xl bg-[#091225] border border-blue-500/20 text-center space-y-2">
                          <BatteryCharging className="w-8 h-8 text-amber-400 mx-auto" />
                          <h4 className="font-extrabold text-white text-lg">220V EV ŞARJ</h4>
                          <p className="text-[11px] text-gray-400">Ev Tipi Prizden Kolay Şarj</p>
                        </div>
                        <div className="p-5 rounded-2xl bg-[#091225] border border-blue-500/20 text-center space-y-2">
                          <Car className="w-8 h-8 text-purple-400 mx-auto" />
                          <h4 className="font-extrabold text-white text-lg">LFP BATARYA</h4>
                          <p className="text-[11px] text-gray-400">Güvenli Lityum Demir Fosfat</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TEST DRIVE CARD */}
                  {block.type === 'testDriveCard' && (
                    <div className="p-8 rounded-3xl bg-gradient-to-r from-blue-900/40 via-indigo-900/30 to-purple-900/40 border border-blue-500/40 text-center space-y-4 relative overflow-hidden">
                      <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 border border-blue-400/40 text-blue-300 text-xs font-bold">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>MKBL VIP TEST SÜRÜŞÜ</span>
                      </div>
                      <h3 className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit']">
                        Karea Fit'i Bizzat Deneyimleyin
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-300 max-w-2xl mx-auto leading-relaxed">
                        Kepez Showroom'umuzda 100% elektrikli ideal şehir aracımızı bizzat test edin. Uzman satış danışmanlarımız sorularınızı yanıtlamaktan mutluluk duyacaktır.
                      </p>
                      <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
                        <Link
                          href="/contact"
                          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold text-xs shadow-xl flex items-center space-x-2 transition-all hover:scale-105"
                        >
                          <Calendar className="w-4 h-4" />
                          <span>Test Sürüşü Randevusu Alın</span>
                        </Link>
                        <a
                          href="tel:02422285555"
                          className="px-6 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 flex items-center space-x-2 transition-all"
                        >
                          <PhoneCall className="w-4 h-4 text-blue-400" />
                          <span>0242 228 55 55</span>
                        </a>
                      </div>
                    </div>
                  )}

                  {/* ALERT */}
                  {block.type === 'alert' && (
                    <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-sm space-y-2 flex items-start space-x-3">
                      <Sparkles className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <h4 className="font-bold text-amber-300">{block.alertTitle || 'Önemli Bilgilendirme'}</h4>
                        <p className="text-xs text-amber-200/90 leading-relaxed">{block.alertText}</p>
                      </div>
                    </div>
                  )}

                  {/* BUTTON */}
                  {block.type === 'button' && (
                    <div className="flex justify-center pt-2">
                      <Link
                        href={block.buttonUrl || '/'}
                        className="inline-flex items-center space-x-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-bold text-sm shadow-xl shadow-emerald-950/50 transition-all hover:scale-105"
                      >
                        <span>{block.buttonLabel || 'Devam Et'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          /* DEFAULT FALLBACK WHEN NO BLOCKS SAVED */
          <div className="space-y-8">
            <div className="glass-panel rounded-3xl p-8 sm:p-12 border border-blue-500/20 text-gray-200 leading-relaxed space-y-6">
              <div
                className="whitespace-pre-line text-sm sm:text-base text-gray-300"
                dangerouslySetInnerHTML={{ __html: page.content || '' }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <Footer />
    </main>
  );
}
