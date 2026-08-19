'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Save,
  Check,
  Plus,
  Trash2,
  MoveUp,
  MoveDown,
  GripVertical,
  Type,
  Image as ImageIcon,
  Building2,
  AlertTriangle,
  Link2,
  LayoutGrid,
  Eye,
  Smartphone,
  Tablet,
  Monitor,
  Sparkles,
  Settings2,
  X,
  Sliders,
  Calculator,
  Rotate3d,
  Car,
  Calendar,
  Layers,
  Maximize2,
  Minimize2,
  Zap,
  Gauge,
  BatteryCharging,
  Move,
  Info,
  PhoneCall,
  LayoutTemplate
} from 'lucide-react';
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Navigation,
  Wrench,
  FileText,
  RefreshCw
} from 'lucide-react';
import BankCard from '@/components/BankCard';
import CostCalculator from '@/components/CostCalculator';
import VehicleGallerySlider from '@/components/VehicleGallerySlider';
import Vehicle360Viewer from '@/components/Vehicle360Viewer';
import { INITIAL_VEHICLES } from '@/lib/data';
import { ISiteSettings, DEFAULT_SITE_SETTINGS } from '@/lib/settings';

export interface IPageBlock {
  id: string;
  type:
    | 'hero'
    | 'configurator360'
    | 'gallery360'
    | 'specsTable'
    | 'calculator'
    | 'featuresGrid'
    | 'testDriveCard'
    | 'bank'
    | 'text'
    | 'image'
    | 'alert'
    | 'button'
    | 'serviceHero'
    | 'serviceCards'
    | 'serviceForm'
    | 'contactHero'
    | 'contactInfo'
    | 'contactForm'
    | 'modelsGrid'
    | 'privacyContent';
  width?: 'full' | 'half' | 'third' | 'twothirds';
  paddingSize?: 'small' | 'medium' | 'large';
  borderRadius?: 'lg' | '2xl' | 'full';
  bgTheme?: 'glass' | 'slate' | 'emerald' | 'transparent';

  // Specific content properties
  heading?: string;
  headingSize?: 'small' | 'medium' | 'large';
  text?: string;
  imageUrl?: string;
  caption?: string;
  title?: string;
  banks?: Array<{
    bankName: string;
    branchName: string;
    branchCode: string;
    accountNo: string;
    iban: string;
    accountHolder: string;
    logoBg?: string;
  }>;
  alertType?: 'info' | 'warning' | 'success';
  alertTitle?: string;
  alertText?: string;
  buttonLabel?: string;
  buttonUrl?: string;
  buttonStyle?: 'primary' | 'secondary' | 'outline';
}

export default function VisualPageBuilder() {
  const router = useRouter();
  const params = useParams();
  const pageId = params?.id as string;

  const [vehiclesList, setVehiclesList] = useState<any[]>(INITIAL_VEHICLES);
  const [settings, setSettings] = useState<ISiteSettings>(DEFAULT_SITE_SETTINGS);
  const [pageData, setPageData] = useState<any>(null);
  const [blocks, setBlocks] = useState<IPageBlock[]>([]);
  const [activeBlockId, setActiveBlockId] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/settings')
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data === 'object') {
          setSettings((prev) => ({ ...prev, ...data }));
        }
      })
      .catch((err) => console.log('Builder settings fetch error:', err));
  }, []);

  useEffect(() => {
    fetch('/api/vehicles')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setVehiclesList(data);
        }
      })
      .catch((err) => console.log('Builder vehicles fetch error:', err));
  }, []);

  const currentPath = pageData?.path || '';
  const currentTitle = (pageData?.title || '').toLowerCase();

  const activeVehicle =
    vehiclesList.find(
      (v: any) =>
        (currentPath && currentPath === `/models/${v.id}`) ||
        (v.name && currentTitle.includes(v.name.toLowerCase()))
    ) ||
    vehiclesList.find(
      (v: any) =>
        v.id === 'karea-fit' ||
        (v.name && v.name.toLowerCase().includes('fit')) ||
        (v.slug && v.slug.includes('fit'))
    ) ||
    vehiclesList[0] ||
    INITIAL_VEHICLES[0];
  const [deviceView, setDeviceView] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Mouse Drag and Drop State
  const [draggedBlockIndex, setDraggedBlockIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [isPaletteDragging, setIsPaletteDragging] = useState(false);

  // PRE-POPULATE DEFAULT BLOCKS IF PAGE HAS NO SAVED CUSTOM BLOCKS YET (CORRESPONDS 100% TO LIVE SITES)
  const getDefaultBlocksForPage = (page: any): IPageBlock[] => {
    const path = page.path || '';
    const slug = page.slug || '';

    // 1. Ana Sayfa (`/` or `ana-sayfa`)
    if (path === '/' || slug === 'ana-sayfa') {
      return [
        {
          id: 'hero-main',
          type: 'hero',
          width: 'full',
          bgTheme: 'glass',
          heading: 'Bindiğin Gibi Değil. Karea Fit',
          text: 'Var olan bir sınıftan değil, yeni bir sınıfın ilki. %100 elektrikli Karea Fit, bugün şehir hayatına tam uyum sağlamak için tasarlandı.',
          title: 'MKBL OTOMOTİV GÜVENCESİYLE %100 ELEKTRİKLİ',
        },
        {
          id: 'configurator-360',
          type: 'configurator360',
          width: 'full',
          bgTheme: 'glass',
          heading: '360° Renk & Açı Konfigüratörü',
        },
        {
          id: 'gallery-360',
          type: 'gallery360',
          width: 'full',
          bgTheme: 'slate',
          heading: 'Fotoğraf & Özellik Galerisi',
        },
        {
          id: 'calculator-main',
          type: 'calculator',
          width: 'full',
          bgTheme: 'glass',
        },
        {
          id: 'features-main',
          type: 'featuresGrid',
          width: 'full',
          bgTheme: 'slate',
        },
      ];
    }

    // 2. Servis & Bakım (`/service` or `servis-bakim`)
    if (path === '/service' || slug === 'servis-bakim') {
      return [
        { id: 'service-hero-1', type: 'serviceHero', width: 'full', bgTheme: 'glass' },
        { id: 'service-cards-1', type: 'serviceCards', width: 'full', bgTheme: 'glass' },
        { id: 'service-form-1', type: 'serviceForm', width: 'full', bgTheme: 'glass' },
      ];
    }

    // 3. Showroom & İletişim (`/contact` or `showroom-iletisim`)
    if (path === '/contact' || slug === 'showroom-iletisim') {
      return [
        { id: 'contact-hero-1', type: 'contactHero', width: 'full', bgTheme: 'glass' },
        { id: 'contact-info-1', type: 'contactInfo', width: 'full', bgTheme: 'glass' },
        { id: 'contact-form-1', type: 'contactForm', width: 'full', bgTheme: 'glass' },
      ];
    }

    // 4. Elektrikli Modeller Kataloğu (`/models` or `modeller`)
    if (path === '/models' || slug === 'modeller') {
      return [
        { id: 'models-grid-1', type: 'modelsGrid', width: 'full', bgTheme: 'glass' },
      ];
    }

    // 5. Gizlilik & KVKK Politikaları (`/privacy` or `gizlilik-kvkk`)
    if (path === '/privacy' || slug === 'gizlilik-kvkk') {
      return [
        { id: 'privacy-content-1', type: 'privacyContent', width: 'full', bgTheme: 'glass' },
      ];
    }

    // 6. Banka Bilgileri (`/banka-bilgileri`)
    if (path === '/banka-bilgileri' || slug === 'banka-bilgileri') {
      return [
        {
          id: 'bank-1',
          type: 'bank',
          width: 'full',
          bgTheme: 'glass',
          title: 'Resmi Banka Hesap Numaraları & IBAN Bilgileri',
        },
      ];
    }

    // 7. Model Detay Sayfaları (`/models/karea-fit`, `/models/karea-cargo`, `MODEL` pageType)
    if (path.startsWith('/models/') || page.pageType === 'MODEL') {
      const modelName = page.title ? page.title.replace(' (Model Detay)', '').replace('MKBL ', '') : 'Karea Fit';
      return [
        {
          id: `hero-${page.id || 'model'}`,
          type: 'hero',
          width: 'full',
          bgTheme: 'glass',
          heading: modelName || 'MKBL Elektrikli Araç',
          text: 'Bindiğin gibi değil. İdeal Şehir Aracı.',
          title: 'MKBL OTOMOTİV GÜVENCESİYLE %100 ELEKTRİKLİ',
        },
        {
          id: `configurator360-${page.id || 'model'}`,
          type: 'configurator360',
          width: 'full',
          bgTheme: 'glass',
          heading: `${modelName} Renk & Açı Konfigüratörü`,
        },
        {
          id: `gallery360-${page.id || 'model'}`,
          type: 'gallery360',
          width: 'full',
          bgTheme: 'slate',
          heading: `${modelName} Fotoğraf Galerisi`,
        },
        {
          id: `specs-${page.id || 'model'}`,
          type: 'specsTable',
          width: 'full',
          bgTheme: 'glass',
          heading: 'Resmi Teknik Bilgiler (Karea.com Verileri)',
        },
        {
          id: `features-${page.id || 'model'}`,
          type: 'featuresGrid',
          width: 'full',
          bgTheme: 'glass',
        },
        {
          id: `testdrive-${page.id || 'model'}`,
          type: 'testDriveCard',
          width: 'full',
          bgTheme: 'emerald',
        },
      ];
    }

    // Generic fallback
    return [
      {
        id: `text-${Date.now()}`,
        type: 'text',
        width: 'full',
        bgTheme: 'glass',
        heading: page.title || 'Sayfa Başlığı',
        text: page.content || 'Sayfa detaylı açıklaması ve içeriği.',
      },
    ];
  };

  // Load Page Details & Sync Live Page Layout
  useEffect(() => {
    if (!pageId) return;

    fetch(`/api/pages/${pageId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.error) {
          setPageData(data);
          let hasValidJSONBlocks = false;
          if (data.content) {
            try {
              const parsed = JSON.parse(data.content);
              if (Array.isArray(parsed) && parsed.length > 0) {
                const path = data.path || '';
                const slug = data.slug || '';
                const isService = path === '/service' || slug === 'servis-bakim';
                const isContact = path === '/contact' || slug === 'showroom-iletisim';
                const isModels = path === '/models' || slug === 'modeller';
                const isPrivacy = path === '/privacy' || slug === 'gizlilik-kvkk';

                // Check if page contains stale vehicle hero blocks for non-vehicle pages
                const hasStaleHeroOnService = isService && parsed.some((b: any) => b.type === 'hero' && !parsed.some((x: any) => x.type === 'serviceHero'));
                const hasStaleHeroOnContact = isContact && parsed.some((b: any) => b.type === 'hero' && !parsed.some((x: any) => x.type === 'contactHero'));
                const hasStaleHeroOnModels = isModels && parsed.some((b: any) => b.type === 'hero' && !parsed.some((x: any) => x.type === 'modelsGrid'));
                const hasStaleHeroOnPrivacy = isPrivacy && parsed.some((b: any) => b.type === 'hero' && !parsed.some((x: any) => x.type === 'privacyContent'));

                if (hasStaleHeroOnService || hasStaleHeroOnContact || hasStaleHeroOnModels || hasStaleHeroOnPrivacy) {
                  setBlocks(getDefaultBlocksForPage(data));
                } else {
                  setBlocks(parsed);
                }
                hasValidJSONBlocks = true;
              }
            } catch (e) {}
          }

          // If no custom blocks saved yet, populate canvas with default live elements!
          if (!hasValidJSONBlocks) {
            setBlocks(getDefaultBlocksForPage(data));
          }
        }
      })
      .catch((err) => console.error('Fetch page error:', err))
      .finally(() => setIsLoading(false));
  }, [pageId]);

  // Save Blocks
  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const jsonContent = JSON.stringify(blocks);
      const res = await fetch(`/api/pages/${pageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: jsonContent }),
      });

      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Save page error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Add Block Factory
  const createBlockInstance = (type: IPageBlock['type']): IPageBlock => {
    const newId = `${type}-${Date.now()}`;
    let newBlock: IPageBlock = {
      id: newId,
      type,
      width: 'full',
      paddingSize: 'medium',
      borderRadius: '2xl',
      bgTheme: 'glass',
    };

    if (type === 'hero') {
      newBlock = {
        ...newBlock,
        heading: 'Bindiğin Gibi Değil. Karea Fit',
        text: 'Var olan bir sınıftan değil, yeni bir sınıfın ilki. %100 elektrikli Karea Fit, bugün şehir hayatına tam uyum sağlamak için tasarlandı.',
        title: 'MKBL OTOMOTİV GÜVENCESİYLE %100 ELEKTRİKLİ',
      };
    } else if (type === 'configurator360') {
      newBlock = {
        ...newBlock,
        heading: '360° Renk & Açı Konfigüratörü',
      };
    } else if (type === 'gallery360') {
      newBlock = {
        ...newBlock,
        heading: '3D Fotoğraf & Özellik Galerisi',
      };
    } else if (type === 'specsTable') {
      newBlock = {
        ...newBlock,
        heading: 'Resmi Teknik Bilgiler (Karea.com Verileri)',
      };
    } else if (type === 'text') {
      newBlock = {
        ...newBlock,
        heading: 'Yeni Başlık & Metin Alanı',
        headingSize: 'medium',
        text: 'Buraya sayfa içeriğini, detaylı açıklamaları ve tanıtım yazılarını ekleyebilirsiniz.',
      };
    } else if (type === 'image') {
      newBlock = {
        ...newBlock,
        imageUrl: 'https://images.unsplash.com/photo-1563720223185-11003d516935?w=1200&auto=format&fit=crop&q=80',
        caption: 'Karea Fit Elektrikli Şehir Aracı',
      };
    } else if (type === 'bank') {
      newBlock = {
        ...newBlock,
        title: 'Resmi Banka Hesap Numaraları & IBAN Bilgileri',
        banks: [
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
        ],
      };
    } else if (type === 'alert') {
      newBlock = {
        ...newBlock,
        alertType: 'info',
        alertTitle: 'Duyuru & Kampanya Panosu',
        alertText: 'Stoklar sınırlıdır. Kepez showroom’umuzda test sürüşü yapmak için hemen randevu alabilirsiniz.',
      };
    } else if (type === 'button') {
      newBlock = {
        ...newBlock,
        buttonLabel: 'Test Sürüşü Randevusu Alın',
        buttonUrl: '/contact',
        buttonStyle: 'primary',
      };
    } else if (type === 'featuresGrid') {
      newBlock = {
        ...newBlock,
        title: 'MKBL Karea Fit Donanım Özellikleri',
      };
    } else if (type === 'testDriveCard') {
      newBlock = {
        ...newBlock,
        title: "Karea Fit'i Bizzat Deneyimleyin",
      };
    }

    return newBlock;
  };

  const addBlock = (type: IPageBlock['type']) => {
    const newInst = createBlockInstance(type);
    setBlocks((prev) => [...prev, newInst]);
    setActiveBlockId(newInst.id);
  };

  const removeBlock = (id: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== id));
    if (activeBlockId === id) setActiveBlockId(null);
  };

  const updateBlock = (id: string, updates: Partial<IPageBlock>) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, ...updates } : b))
    );
  };

  const moveBlock = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === blocks.length - 1) return;

    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const updated = [...blocks];
    const [moved] = updated.splice(index, 1);
    updated.splice(newIndex, 0, moved);
    setBlocks(updated);
  };

  // Drag and Drop handlers
  const handlePaletteDragStart = (e: React.DragEvent, type: IPageBlock['type']) => {
    e.dataTransfer.setData('application/json', JSON.stringify({ source: 'palette', type }));
    setIsPaletteDragging(true);
  };

  const handleCanvasDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.setData('application/json', JSON.stringify({ source: 'canvas', index }));
    setDraggedBlockIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    setDragOverIndex(null);
    setIsPaletteDragging(false);

    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));
      if (data.source === 'palette' && data.type) {
        const newInst = createBlockInstance(data.type);
        const updated = [...blocks];
        updated.splice(targetIndex, 0, newInst);
        setBlocks(updated);
        setActiveBlockId(newInst.id);
      } else if (data.source === 'canvas' && typeof data.index === 'number') {
        const srcIndex = data.index;
        if (srcIndex === targetIndex) return;

        const updated = [...blocks];
        const [moved] = updated.splice(srcIndex, 1);
        updated.splice(targetIndex, 0, moved);
        setBlocks(updated);
      }
    } catch (err) {
      console.error('Drop error:', err);
    } finally {
      setDraggedBlockIndex(null);
    }
  };

  const activeBlock = blocks.find((b) => b.id === activeBlockId);

  if (isLoading) {
    return (
      <div className="pt-32 pb-20 text-center text-gray-400">
        <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <span>Görsel düzenleyici yükleniyor...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050A16] text-white flex flex-col font-sans select-none">
      {/* BUILDER HEADER CONTROL BAR */}
      <header className="h-16 bg-[#0B1426] border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between z-50 relative shrink-0">
        <div className="flex items-center space-x-4">
          <Link
            href="/admin/pages"
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition-all"
          >
            <ChevronLeft className="w-4 h-4 text-blue-400" />
            <span>Sayfalara Dön</span>
          </Link>

          <div>
            <h1 className="text-sm font-bold text-white font-['Outfit'] flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>{pageData?.title || 'Sayfa Düzenleme'}</span>
            </h1>
            <p className="text-[10px] text-gray-400 font-mono">{pageData?.path}</p>
          </div>
        </div>

        {/* Device Responsive View Switcher */}
        <div className="hidden md:flex items-center space-x-1 bg-[#060B17] p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setDeviceView('desktop')}
            className={`p-2 rounded-lg text-xs font-bold transition-all ${
              deviceView === 'desktop' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
            }`}
            title="Masaüstü Görünümü"
          >
            <Monitor className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeviceView('tablet')}
            className={`p-2 rounded-lg text-xs font-bold transition-all ${
              deviceView === 'tablet' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
            }`}
            title="Tablet Görünümü"
          >
            <Tablet className="w-4 h-4" />
          </button>
          <button
            onClick={() => setDeviceView('mobile')}
            className={`p-2 rounded-lg text-xs font-bold transition-all ${
              deviceView === 'mobile' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:text-white'
            }`}
            title="Mobil Görünümü"
          >
            <Smartphone className="w-4 h-4" />
          </button>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              if (pageData && confirm('Bu sayfanın düzenini canlı sitedeki varsayılan özgün öğeleriyle sıfırlamak istediğinize emin misiniz?')) {
                setBlocks(getDefaultBlocksForPage(pageData));
              }
            }}
            className="px-3 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer"
            title="Canlı Sayfa Tasarımını Getir"
          >
            <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Canlı Düzeni Getir</span>
          </button>

          <Link
            href={pageData?.path || '/'}
            target="_blank"
            className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-slate-700 text-xs font-bold transition-all flex items-center space-x-1.5"
          >
            <Eye className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Canlı Sitede Gör</span>
          </Link>

          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-sky-400 hover:from-blue-500 hover:to-sky-300 text-white text-xs font-bold shadow-lg flex items-center space-x-2 transition-all cursor-pointer"
          >
            {isSaving ? (
              <span>Kaydediliyor...</span>
            ) : saveSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span>Kaydedildi & Yayında!</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Kaydet & Yayınla</span>
              </>
            )}
          </button>
        </div>
      </header>

      {/* MAIN WORKSPACE split into 3 PANELS */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* LEFT PANEL: COMPONENT & BLOCK PALETTE */}
        <aside className="w-72 sm:w-80 bg-[#0B1426] border-r border-slate-800 p-5 space-y-6 overflow-y-auto shrink-0 custom-scrollbar">
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
              <LayoutGrid className="w-4 h-4 text-blue-400" />
              <span>ÖĞE KÜTÜPHANESİ</span>
            </h3>
            <p className="text-[11px] text-gray-400 mt-1">
              Öğeye tıklayın veya fare ile sürükleyip sayfanın istediğiniz alanına bırakın.
            </p>
          </div>

          {/* GROUP 1: INTERACTIVE TOOLS & SITE MODULES */}
          <div className="space-y-2.5">
            <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider block">
              🏎️ ETKİLEŞİMLİ ARAÇLAR & MODÜLLER
            </span>

            {/* ITEM: HERO BANNER */}
            <div
              draggable
              onDragStart={(e) => handlePaletteDragStart(e, 'hero')}
              onClick={() => addBlock('hero')}
              className="p-3.5 rounded-2xl bg-[#0F1C36] hover:bg-blue-950/40 border border-slate-700/80 hover:border-blue-500/60 cursor-grab active:cursor-grabbing transition-all group flex items-center justify-between shadow-md"
            >
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                  <LayoutTemplate className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-white">Ana Sayfa & Model Hero Banner</h4>
                  <p className="text-[10px] text-gray-400">Manşet başlık, rozet ve fiyat</p>
                </div>
              </div>
              <GripVertical className="w-4 h-4 text-gray-500 group-hover:text-blue-400" />
            </div>

            {/* ITEM: 360 COLOR CONFIGURATOR */}
            <div
              draggable
              onDragStart={(e) => handlePaletteDragStart(e, 'configurator360')}
              onClick={() => addBlock('configurator360')}
              className="p-3.5 rounded-2xl bg-[#0F1C36] hover:bg-sky-950/40 border border-slate-700/80 hover:border-sky-500/60 cursor-grab active:cursor-grabbing transition-all group flex items-center justify-between shadow-md"
            >
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400 group-hover:scale-110 transition-transform">
                  <Rotate3d className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-white">360° Renk & Açı Konfigüratörü</h4>
                  <p className="text-[10px] text-gray-400">3D renk seçici ve dönen araç</p>
                </div>
              </div>
              <GripVertical className="w-4 h-4 text-gray-500 group-hover:text-sky-400" />
            </div>

            {/* ITEM: 3D PHOTO SLIDER GALLERY */}
            <div
              draggable
              onDragStart={(e) => handlePaletteDragStart(e, 'gallery360')}
              onClick={() => addBlock('gallery360')}
              className="p-3.5 rounded-2xl bg-[#0F1C36] hover:bg-purple-950/40 border border-slate-700/80 hover:border-purple-500/60 cursor-grab active:cursor-grabbing transition-all group flex items-center justify-between shadow-md"
            >
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                  <ImageIcon className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-white">3D Fotoğraf & Özellik Galerisi</h4>
                  <p className="text-[10px] text-gray-400">Fotoğraflı kaydırılabilir kartlar</p>
                </div>
              </div>
              <GripVertical className="w-4 h-4 text-gray-500 group-hover:text-purple-400" />
            </div>

            {/* ITEM: TECHNICAL SPECS TABLE */}
            <div
              draggable
              onDragStart={(e) => handlePaletteDragStart(e, 'specsTable')}
              onClick={() => addBlock('specsTable')}
              className="p-3.5 rounded-2xl bg-[#0F1C36] hover:bg-blue-950/40 border border-slate-700/80 hover:border-blue-500/60 cursor-grab active:cursor-grabbing transition-all group flex items-center justify-between shadow-md"
            >
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                  <Info className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-white">Resmi Teknik Bilgiler Tablosu</h4>
                  <p className="text-[10px] text-gray-400">Motor, Batarya, Menzil tablosu</p>
                </div>
              </div>
              <GripVertical className="w-4 h-4 text-gray-500 group-hover:text-blue-400" />
            </div>

            {/* ITEM: COST CALCULATOR */}
            <div
              draggable
              onDragStart={(e) => handlePaletteDragStart(e, 'calculator')}
              onClick={() => addBlock('calculator')}
              className="p-3.5 rounded-2xl bg-[#0F1C36] hover:bg-emerald-950/40 border border-slate-700/80 hover:border-emerald-500/60 cursor-grab active:cursor-grabbing transition-all group flex items-center justify-between shadow-md"
            >
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                  <Calculator className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-white">Tasarruf Hesaplayıcı</h4>
                  <p className="text-[10px] text-gray-400">Yakıt vs Elektrik hesaplama</p>
                </div>
              </div>
              <GripVertical className="w-4 h-4 text-gray-500 group-hover:text-emerald-400" />
            </div>

            {/* ITEM: FEATURES GRID */}
            <div
              draggable
              onDragStart={(e) => handlePaletteDragStart(e, 'featuresGrid')}
              onClick={() => addBlock('featuresGrid')}
              className="p-3.5 rounded-2xl bg-[#0F1C36] hover:bg-indigo-950/40 border border-slate-700/80 hover:border-indigo-500/60 cursor-grab active:cursor-grabbing transition-all group flex items-center justify-between shadow-md"
            >
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                  <Car className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-white">Donanım & Özellik Kartları</h4>
                  <p className="text-[10px] text-gray-400">Menzil, Hız, Şarj donanımı</p>
                </div>
              </div>
              <GripVertical className="w-4 h-4 text-gray-500 group-hover:text-indigo-400" />
            </div>

            {/* ITEM: TEST DRIVE CALLOUT CARD */}
            <div
              draggable
              onDragStart={(e) => handlePaletteDragStart(e, 'testDriveCard')}
              onClick={() => addBlock('testDriveCard')}
              className="p-3.5 rounded-2xl bg-[#0F1C36] hover:bg-emerald-950/40 border border-slate-700/80 hover:border-emerald-500/60 cursor-grab active:cursor-grabbing transition-all group flex items-center justify-between shadow-md"
            >
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                  <Calendar className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-white">VIP Test Sürüşü Kartı</h4>
                  <p className="text-[10px] text-gray-400">Test sürüşü çağrı kutusu</p>
                </div>
              </div>
              <GripVertical className="w-4 h-4 text-gray-500 group-hover:text-emerald-400" />
            </div>

            {/* ITEM: BANK IBAN ACCOUNTS */}
            <div
              draggable
              onDragStart={(e) => handlePaletteDragStart(e, 'bank')}
              onClick={() => addBlock('bank')}
              className="p-3.5 rounded-2xl bg-[#0F1C36] hover:bg-emerald-950/40 border border-slate-700/80 hover:border-emerald-500/60 cursor-grab active:cursor-grabbing transition-all group flex items-center justify-between shadow-md"
            >
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                  <Building2 className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-white">Banka & IBAN Kartları</h4>
                  <p className="text-[10px] text-gray-400">Resmi banka hesap tablosu</p>
                </div>
              </div>
              <GripVertical className="w-4 h-4 text-gray-500 group-hover:text-emerald-400" />
            </div>
          </div>

          {/* GROUP: SERVICE & CONTACT SYSTEM MODULES */}
          <div className="space-y-2.5 pt-2 border-t border-slate-800/80">
            <span className="text-[10px] uppercase font-bold text-emerald-400 tracking-wider block">
              🛠️ SERVİS, İLETİŞİM & KURUMSAL
            </span>

            {/* ITEM: SERVICE HERO */}
            <div
              draggable
              onDragStart={(e) => handlePaletteDragStart(e, 'serviceHero')}
              onClick={() => addBlock('serviceHero')}
              className="p-3 rounded-2xl bg-[#0F1C36] hover:bg-blue-950/40 border border-slate-700/80 hover:border-blue-500/60 cursor-grab active:cursor-grabbing transition-all group flex items-center justify-between shadow-md"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                  <Wrench className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-white">Servis Başlık Banner'ı</h4>
                  <p className="text-[10px] text-gray-400">Bakım & servis başlığı</p>
                </div>
              </div>
              <GripVertical className="w-4 h-4 text-gray-500 group-hover:text-blue-400" />
            </div>

            {/* ITEM: SERVICE CARDS */}
            <div
              draggable
              onDragStart={(e) => handlePaletteDragStart(e, 'serviceCards')}
              onClick={() => addBlock('serviceCards')}
              className="p-3 rounded-2xl bg-[#0F1C36] hover:bg-blue-950/40 border border-slate-700/80 hover:border-blue-500/60 cursor-grab active:cursor-grabbing transition-all group flex items-center justify-between shadow-md"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                  <BatteryCharging className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-white">3 Servis Hizmet Kartı</h4>
                  <p className="text-[10px] text-gray-400">Batarya, Periyodik & 220V</p>
                </div>
              </div>
              <GripVertical className="w-4 h-4 text-gray-500 group-hover:text-blue-400" />
            </div>

            {/* ITEM: SERVICE FORM */}
            <div
              draggable
              onDragStart={(e) => handlePaletteDragStart(e, 'serviceForm')}
              onClick={() => addBlock('serviceForm')}
              className="p-3 rounded-2xl bg-[#0F1C36] hover:bg-emerald-950/40 border border-slate-700/80 hover:border-emerald-500/60 cursor-grab active:cursor-grabbing transition-all group flex items-center justify-between shadow-md"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-white">Online Servis Randevu Formu</h4>
                  <p className="text-[10px] text-gray-400">Plaka & Şasi randevu alımı</p>
                </div>
              </div>
              <GripVertical className="w-4 h-4 text-gray-500 group-hover:text-emerald-400" />
            </div>

            {/* ITEM: CONTACT HERO */}
            <div
              draggable
              onDragStart={(e) => handlePaletteDragStart(e, 'contactHero')}
              onClick={() => addBlock('contactHero')}
              className="p-3 rounded-2xl bg-[#0F1C36] hover:bg-blue-950/40 border border-slate-700/80 hover:border-blue-500/60 cursor-grab active:cursor-grabbing transition-all group flex items-center justify-between shadow-md"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-white">Showroom İletişim Banner</h4>
                  <p className="text-[10px] text-gray-400">Showroom başlık kartı</p>
                </div>
              </div>
              <GripVertical className="w-4 h-4 text-gray-500 group-hover:text-blue-400" />
            </div>

            {/* ITEM: CONTACT INFO */}
            <div
              draggable
              onDragStart={(e) => handlePaletteDragStart(e, 'contactInfo')}
              onClick={() => addBlock('contactInfo')}
              className="p-3 rounded-2xl bg-[#0F1C36] hover:bg-blue-950/40 border border-slate-700/80 hover:border-blue-500/60 cursor-grab active:cursor-grabbing transition-all group flex items-center justify-between shadow-md"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-white">Showroom İletişim & Harita</h4>
                  <p className="text-[10px] text-gray-400">Adres, Tel, E-posta & Harita</p>
                </div>
              </div>
              <GripVertical className="w-4 h-4 text-gray-500 group-hover:text-blue-400" />
            </div>

            {/* ITEM: CONTACT FORM */}
            <div
              draggable
              onDragStart={(e) => handlePaletteDragStart(e, 'contactForm')}
              onClick={() => addBlock('contactForm')}
              className="p-3 rounded-2xl bg-[#0F1C36] hover:bg-sky-950/40 border border-slate-700/80 hover:border-sky-500/60 cursor-grab active:cursor-grabbing transition-all group flex items-center justify-between shadow-md"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400 group-hover:scale-110 transition-transform">
                  <PhoneCall className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-white">İletişim & Teklif Formu</h4>
                  <p className="text-[10px] text-gray-400">Mesaj & Teklif formu</p>
                </div>
              </div>
              <GripVertical className="w-4 h-4 text-gray-500 group-hover:text-sky-400" />
            </div>

            {/* ITEM: MODELS GRID */}
            <div
              draggable
              onDragStart={(e) => handlePaletteDragStart(e, 'modelsGrid')}
              onClick={() => addBlock('modelsGrid')}
              className="p-3 rounded-2xl bg-[#0F1C36] hover:bg-indigo-950/40 border border-slate-700/80 hover:border-indigo-500/60 cursor-grab active:cursor-grabbing transition-all group flex items-center justify-between shadow-md"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform">
                  <Car className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-white">Araç Kataloğu Grid</h4>
                  <p className="text-[10px] text-gray-400">Tüm elektrikli araç kartları</p>
                </div>
              </div>
              <GripVertical className="w-4 h-4 text-gray-500 group-hover:text-indigo-400" />
            </div>

            {/* ITEM: PRIVACY CONTENT */}
            <div
              draggable
              onDragStart={(e) => handlePaletteDragStart(e, 'privacyContent')}
              onClick={() => addBlock('privacyContent')}
              className="p-3 rounded-2xl bg-[#0F1C36] hover:bg-slate-900 border border-slate-700/80 hover:border-slate-500 cursor-grab active:cursor-grabbing transition-all group flex items-center justify-between shadow-md"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-xl bg-slate-700/40 border border-slate-600 flex items-center justify-center text-slate-300 group-hover:scale-110 transition-transform">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-white">Gizlilik & KVKK Politikaları</h4>
                  <p className="text-[10px] text-gray-400">Yasal metin kartları</p>
                </div>
              </div>
              <GripVertical className="w-4 h-4 text-gray-500 group-hover:text-slate-300" />
            </div>
          </div>

          {/* GROUP 2: CONTENT & MEDIA */}
          <div className="space-y-2.5 pt-2 border-t border-slate-800/80">
            <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider block">
              📝 SAYFA İÇERİĞİ & MEDYA
            </span>

            {/* ITEM: TEXT */}
            <div
              draggable
              onDragStart={(e) => handlePaletteDragStart(e, 'text')}
              onClick={() => addBlock('text')}
              className="p-3.5 rounded-2xl bg-[#0F1C36] hover:bg-blue-950/40 border border-slate-700/80 hover:border-blue-500/60 cursor-grab active:cursor-grabbing transition-all group flex items-center justify-between shadow-md"
            >
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                  <Type className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-white">Metin & Başlık Kutusu</h4>
                  <p className="text-[10px] text-gray-400">Paragraf ve içerik alanı</p>
                </div>
              </div>
              <GripVertical className="w-4 h-4 text-gray-500 group-hover:text-blue-400" />
            </div>

            {/* ITEM: IMAGE */}
            <div
              draggable
              onDragStart={(e) => handlePaletteDragStart(e, 'image')}
              onClick={() => addBlock('image')}
              className="p-3.5 rounded-2xl bg-[#0F1C36] hover:bg-purple-950/40 border border-slate-700/80 hover:border-purple-500/60 cursor-grab active:cursor-grabbing transition-all group flex items-center justify-between shadow-md"
            >
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
                  <ImageIcon className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-white">Fotoğraf & Görsel Kutusu</h4>
                  <p className="text-[10px] text-gray-400">Resim ve galeri görseli</p>
                </div>
              </div>
              <GripVertical className="w-4 h-4 text-gray-500 group-hover:text-purple-400" />
            </div>

            {/* ITEM: ALERT */}
            <div
              draggable
              onDragStart={(e) => handlePaletteDragStart(e, 'alert')}
              onClick={() => addBlock('alert')}
              className="p-3.5 rounded-2xl bg-[#0F1C36] hover:bg-amber-950/40 border border-slate-700/80 hover:border-amber-500/60 cursor-grab active:cursor-grabbing transition-all group flex items-center justify-between shadow-md"
            >
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                  <AlertTriangle className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-white">Duyuru & Uyarı Panosu</h4>
                  <p className="text-[10px] text-gray-400">Renkli bilgilendirme panosu</p>
                </div>
              </div>
              <GripVertical className="w-4 h-4 text-gray-500 group-hover:text-amber-400" />
            </div>

            {/* ITEM: BUTTON */}
            <div
              draggable
              onDragStart={(e) => handlePaletteDragStart(e, 'button')}
              onClick={() => addBlock('button')}
              className="p-3.5 rounded-2xl bg-[#0F1C36] hover:bg-emerald-950/40 border border-slate-700/80 hover:border-emerald-500/60 cursor-grab active:cursor-grabbing transition-all group flex items-center justify-between shadow-md"
            >
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                  <Link2 className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h4 className="text-xs font-extrabold text-white">Buton & Bağlantı</h4>
                  <p className="text-[10px] text-gray-400">Yönlendirme butonu</p>
                </div>
              </div>
              <GripVertical className="w-4 h-4 text-gray-500 group-hover:text-emerald-400" />
            </div>
          </div>
        </aside>

        {/* CENTER BUILDER CANVAS */}
        <main className="flex-1 bg-[#050A16] p-4 sm:p-8 overflow-y-auto custom-scrollbar flex flex-col items-center">
          <div
            className={`w-full transition-all duration-300 space-y-6 ${
              deviceView === 'mobile'
                ? 'max-w-sm'
                : deviceView === 'tablet'
                ? 'max-w-2xl'
                : 'max-w-5xl'
            }`}
          >
            {blocks.length === 0 ? (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => handleDrop(e, 0)}
                className="p-16 text-center border-2 border-dashed border-slate-800 rounded-3xl bg-[#091122]/50 space-y-4"
              >
                <div className="w-16 h-16 rounded-3xl bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center mx-auto shadow-xl">
                  <Move className="w-8 h-8 animate-bounce" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white font-['Outfit']">Sayfanız Boş</h3>
                  <p className="text-xs text-gray-400 max-w-sm mx-auto mt-1">
                    Sol paneldeki öğelerden birine tıklayın veya buraya sürükleyip bırakarak sayfa tasarımınızı oluşturun.
                  </p>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-12 gap-6">
                {blocks.map((block, index) => {
                  const isActive = activeBlockId === block.id;
                  const isBeingDragged = draggedBlockIndex === index;
                  const isDragOver = dragOverIndex === index;

                  const bgClass =
                    block.bgTheme === 'emerald'
                      ? 'bg-emerald-950/20 border-emerald-500/30'
                      : block.bgTheme === 'glass'
                      ? 'bg-[#0D1527]/90 backdrop-blur-xl border-blue-500/30'
                      : block.bgTheme === 'slate'
                      ? 'bg-[#091122] border-slate-700/80'
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
                      key={block.id}
                      draggable
                      onDragStart={(e) => handleCanvasDragStart(e, index)}
                      onDragOver={(e) => handleDragOver(e, index)}
                      onDrop={(e) => handleDrop(e, index)}
                      onClick={() => setActiveBlockId(block.id)}
                      className={`relative group ${colSpanClass} ${paddingClass} ${roundedClass} border shadow-2xl transition-all duration-200 cursor-pointer ${bgClass} ${
                        isActive
                          ? 'ring-2 ring-blue-500 border-blue-400 shadow-blue-950/50 scale-[1.01]'
                          : 'hover:border-slate-600'
                      } ${isBeingDragged ? 'opacity-40 border-dashed border-blue-500' : ''} ${
                        isDragOver ? 'border-t-4 border-t-emerald-400' : ''
                      }`}
                    >
                      {/* ACTION BAR HOVER TOOLBAR */}
                      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex items-center space-x-1.5 bg-[#0B1426]/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-700 shadow-xl z-20">
                        <div
                          className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white cursor-grab"
                          title="Sürükle & Taşı"
                        >
                          <GripVertical className="w-3.5 h-3.5" />
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            moveBlock(index, 'up');
                          }}
                          disabled={index === 0}
                          className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white disabled:opacity-30"
                          title="Yukarı Taşı"
                        >
                          <MoveUp className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            moveBlock(index, 'down');
                          }}
                          disabled={index === blocks.length - 1}
                          className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white disabled:opacity-30"
                          title="Aşağı Taşı"
                        >
                          <MoveDown className="w-3.5 h-3.5" />
                        </button>

                        <div className="w-px h-4 bg-slate-800"></div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveBlockId(block.id);
                          }}
                          className="p-1.5 rounded-lg hover:bg-blue-600/40 text-blue-400"
                          title="Boyut & Özellikleri Düzenle"
                        >
                          <Settings2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeBlock(block.id);
                          }}
                          className="p-1.5 rounded-lg hover:bg-rose-600/40 text-rose-400"
                          title="Kutuyu Sil"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* BLOCK CANVAS RENDERERS */}

                      {/* TYPE: HERO BANNER */}
                      {block.type === 'hero' && (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center py-4">
                          {/* Left Column */}
                          <div className="lg:col-span-7 space-y-4">
                            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-950/80 border border-blue-500/30 text-xs font-semibold text-blue-400">
                              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                              <span>{block.title || 'MKBL Otomotiv Güvencesiyle %100 Elektrikli'}</span>
                            </div>

                            <h1 className="text-3xl sm:text-4xl font-extrabold text-white font-['Outfit'] tracking-tight leading-tight">
                              {block.heading || 'Bindiğin Gibi Değil. Karea Fit'}
                            </h1>

                            <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
                              {block.text || 'Var olan bir sınıftan değil, yeni bir sınıfın ilki. %100 elektrikli Karea Fit, bugün şehir hayatına tam uyum sağlamak için tasarlandı.'}
                            </p>

                            {/* Key Specs Bar */}
                            <div className="grid grid-cols-3 gap-3 border-y border-blue-500/20 py-3">
                              <div>
                                <div className="text-xl font-extrabold text-white font-['Outfit']">{activeVehicle.rangeKm || 135} km</div>
                                <div className="text-[10px] text-gray-400">Şehir İçi Menzil</div>
                              </div>
                              <div>
                                <div className="text-xl font-extrabold text-blue-400 font-['Outfit']">{activeVehicle.topSpeed || 90} km/h</div>
                                <div className="text-[10px] text-gray-400">Azami Hız Limit</div>
                              </div>
                              <div>
                                <div className="text-xl font-extrabold text-emerald-400 font-['Outfit']">2 Saat</div>
                                <div className="text-[10px] text-gray-400">%20-%80 220V Şarj</div>
                              </div>
                            </div>

                            {/* Hero Action Buttons */}
                            <div className="flex flex-wrap items-center gap-3 pt-2">
                              <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-sky-400 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-lg flex items-center space-x-1.5">
                                <span>Test Sürüşü Randevusu Al</span>
                                <ChevronRight className="w-3.5 h-3.5" />
                              </span>
                              <span className="bg-white/5 text-white font-semibold text-xs px-5 py-3 rounded-xl border border-blue-500/30">
                                360° Modeli İncele
                              </span>
                            </div>
                          </div>

                          {/* Right Column: Hero Vehicle Image Card */}
                          <div className="lg:col-span-5 relative">
                            <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden glass-panel p-2 border border-blue-500/30 shadow-xl bg-gradient-to-b from-[#0F1C38] to-[#080E1C]">
                              <img
                                src={(activeVehicle.images && activeVehicle.images[0]) || '/images/karea_official_hero.jpg'}
                                alt={activeVehicle.name || 'Karea Fit'}
                                className="w-full h-full object-contain p-2"
                              />
                              <div className="absolute bottom-3 left-3 right-3 p-3 rounded-xl bg-[#091122]/90 backdrop-blur-md border border-blue-500/30 flex items-center justify-between">
                                <div>
                                  <div className="text-[9px] uppercase font-semibold text-blue-400">{activeVehicle.name || 'KAREA FİT'} - BAŞLANGIÇ FİYATI</div>
                                  <div className="text-base font-bold text-white font-['Outfit']">
                                    ₺{(activeVehicle.price || 749000).toLocaleString('tr-TR')}
                                  </div>
                                </div>
                                <div className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                                  {activeVehicle.stockStatus || 'STOKTA'}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* TYPE: 360 COLOR CONFIGURATOR */}
                      {block.type === 'configurator360' && (
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2 text-sky-400 text-xs font-bold mb-2">
                            <Rotate3d className="w-4 h-4" />
                            <span>{block.heading || '360° Renk & Açı Konfigüratörü'}</span>
                          </div>
                          <Vehicle360Viewer vehicle={activeVehicle} colors={activeVehicle.colors && activeVehicle.colors.length > 0 ? activeVehicle.colors : undefined} />
                        </div>
                      )}

                      {/* TYPE: 3D PHOTO SLIDER GALLERY */}
                      {block.type === 'gallery360' && (
                        <div className="space-y-3 pointer-events-none">
                          <div className="flex items-center space-x-2 text-purple-400 text-xs font-bold mb-2">
                            <ImageIcon className="w-4 h-4" />
                            <span>{block.heading || '3D Fotoğraf & Özellik Galerisi (Canlı Sitede Tam Etkileşimli)'}</span>
                          </div>
                          <VehicleGallerySlider />
                        </div>
                      )}

                      {/* TYPE: TECHNICAL SPECS TABLE */}
                      {block.type === 'specsTable' && (
                        <div className="space-y-4 pointer-events-none">
                          <h3 className="text-base font-bold text-white font-['Outfit'] flex items-center space-x-2">
                            <Info className="w-4 h-4 text-blue-400" />
                            <span>{block.heading || 'Resmi Teknik Bilgiler (Karea.com Verileri)'}</span>
                          </h3>
                          <div className="grid grid-cols-2 gap-4 text-xs">
                            <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                              <span className="text-gray-400 block text-[10px]">Peak Motor Gücü</span>
                              <span className="font-bold text-white">12 kW (Peak Motor Gücü)</span>
                            </div>
                            <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                              <span className="text-gray-400 block text-[10px]">Batarya Tipi</span>
                              <span className="font-bold text-blue-400">9.98 kWh LFP</span>
                            </div>
                            <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                              <span className="text-gray-400 block text-[10px]">Şehir İçi Menzil</span>
                              <span className="font-bold text-blue-400">135 KM</span>
                            </div>
                            <div className="p-3 rounded-xl bg-black/40 border border-white/5 space-y-1">
                              <span className="text-gray-400 block text-[10px]">Azami Hız</span>
                              <span className="font-bold text-white">90 KM/S</span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* TYPE: TEXT */}
                      {block.type === 'text' && (
                        <div className="space-y-3 pr-24">
                          {block.heading && (
                            <h2 className="font-bold font-['Outfit'] text-white text-xl sm:text-2xl">
                              {block.heading}
                            </h2>
                          )}
                          {block.text && (
                            <p className="text-gray-300 text-xs sm:text-sm leading-relaxed whitespace-pre-line">
                              {block.text}
                            </p>
                          )}
                        </div>
                      )}

                      {/* TYPE: IMAGE */}
                      {block.type === 'image' && (
                        <div className="space-y-2 pr-24">
                          {block.imageUrl ? (
                            <div className="overflow-hidden rounded-2xl border border-slate-700/60 max-h-80">
                              <img src={block.imageUrl} alt="Visual" className="w-full h-auto object-cover" />
                            </div>
                          ) : (
                            <div className="p-8 text-center bg-black/30 rounded-2xl border border-dashed border-slate-700 text-xs text-gray-400">
                              Görsel URL'si ekleyin
                            </div>
                          )}
                          {block.caption && (
                            <p className="text-center text-xs text-gray-400 italic">{block.caption}</p>
                          )}
                        </div>
                      )}

                      {/* TYPE: BANK CARDS */}
                      {block.type === 'bank' && (
                        <div className="space-y-4 pointer-events-none">
                          <h3 className="text-base font-bold text-white font-['Outfit'] flex items-center space-x-2">
                            <Building2 className="w-4 h-4 text-emerald-400" />
                            <span>{block.title || 'Banka Hesap Numaraları'}</span>
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {(block.banks || []).map((bank, bIdx) => (
                              <BankCard key={bIdx} bank={bank} />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* TYPE: COST CALCULATOR */}
                      {block.type === 'calculator' && (
                        <div className="space-y-2 pointer-events-none">
                          <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold mb-2">
                            <Calculator className="w-4 h-4" />
                            <span>Tasarruf Hesaplayıcı Modülü (Canlı Sitede Tam Etkileşimli)</span>
                          </div>
                          <CostCalculator />
                        </div>
                      )}

                      {/* TYPE: FEATURES GRID */}
                      {block.type === 'featuresGrid' && (
                        <div className="space-y-4">
                          <h3 className="text-base sm:text-lg font-bold text-white font-['Outfit'] flex items-center space-x-2">
                            <Sparkles className="w-4 h-4 text-blue-400" />
                            <span>{block.heading || block.title || 'Donanım ve Teknik Özellikler'}</span>
                          </h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                            {[
                              'Çelik Kafes Şasi Güvenlik Yapısı',
                              '3.3 kW/s Ev Tipi Standart 220V Priz Şarjı (%20-%80 2 Saat)',
                              '90 km/s Azami Hız & 135 km Şehir İçi Menzil',
                              'İklimlendirme Kliması & PTC Isıtıcı',
                              'Rejeneratif Frenleme (Enerji Geri Kazanımı)',
                              'Elektrik Destekli Direksiyon & Hidrolik Disk Fren',
                              'Geri Görüş Kamerası & Park Sensörü',
                              'Dokunmatik Multimedya Ekran & Bluetooth',
                              'Elektrikli Camlar & Uzaktan Kumandalı Merkezi Kilit',
                              '2 Koltuk / 3 Kapı / 184 Litre Bagaj Hacmi'
                            ].map((feat, index) => (
                              <div
                                key={index}
                                className="p-3 rounded-xl bg-[#091225] border border-blue-500/15 flex items-center space-x-2.5"
                              >
                                <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                                <span className="text-[11px] text-gray-200 font-medium">{feat}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* TYPE: TEST DRIVE CALLOUT CARD */}
                      {block.type === 'testDriveCard' && (
                        <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-900/40 to-indigo-900/40 border border-blue-500/40 text-center space-y-3">
                          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-bold">
                            <Calendar className="w-3 h-3" />
                            <span>VIP TEST SÜRÜŞÜ</span>
                          </div>
                          <h3 className="text-xl font-bold text-white font-['Outfit']">
                            {block.title || "Karea Fit'i Bizzat Deneyimleyin"}
                          </h3>
                          <p className="text-xs text-gray-300 max-w-lg mx-auto">
                            Kepez Showroom'umuzda 100% elektrikli ideal şehir aracımızı bizzat test edin.
                          </p>
                        </div>
                      )}

                      {/* TYPE: ALERT BANNER */}
                      {block.type === 'alert' && (
                        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-1 pr-24 flex items-start space-x-3">
                          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                          <div>
                            <h4 className="font-bold text-amber-300">{block.alertTitle || 'Duyuru'}</h4>
                            <p className="text-[11px] text-amber-200/90 leading-relaxed">{block.alertText}</p>
                          </div>
                        </div>
                      )}

                      {/* TYPE: BUTTON */}
                      {block.type === 'button' && (
                        <div className="flex justify-center py-2">
                          <span className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-xs shadow-lg flex items-center space-x-2">
                            <span>{block.buttonLabel || 'Buton Metni'}</span>
                          </span>
                        </div>
                      )}

                      {/* TYPE: SERVICE HERO */}
                      {block.type === 'serviceHero' && (
                        <div className="text-center max-w-3xl mx-auto space-y-3 py-4">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400">
                            {settings.servicePageBadge || 'MKBL OTOMOTİV YETKİLİ SERVİS'}
                          </span>
                          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit']">
                            {settings.servicePageTitle || 'Elektrikli Araç Bakım & Servis Hizmetleri'}
                          </h1>
                          <p className="text-gray-300 text-xs leading-relaxed max-w-xl mx-auto">
                            {settings.servicePageSubtitle || 'Karea Fit aracınızın periyodik bakımı, LFP batarya ölçümü ve 220V ev şarjı güvenlik kontrolleri için Kepez yetkili servisimiz hizmetinizde.'}
                          </p>
                        </div>
                      )}

                      {/* TYPE: SERVICE CARDS */}
                      {block.type === 'serviceCards' && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-2">
                          <div className="glass-panel rounded-2xl p-5 border border-blue-500/20 space-y-2 bg-[#091122]">
                            <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/40">
                              <BatteryCharging className="w-4.5 h-4.5" />
                            </div>
                            <h3 className="text-sm font-bold text-white font-['Outfit']">
                              {settings.footerServiceLink2 || 'LFP Batarya Health Check-up'}
                            </h3>
                            <p className="text-[11px] text-gray-400 leading-relaxed">
                              9.98 kWh LFP batarya hücre voltaj dengesi, BMS yazılım güncellemeleri ve maksimum menzil performans testi gerçekleştirilir.
                            </p>
                          </div>

                          <div className="glass-panel rounded-2xl p-5 border border-blue-500/20 space-y-2 bg-[#091122]">
                            <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/40">
                              <Wrench className="w-4.5 h-4.5" />
                            </div>
                            <h3 className="text-sm font-bold text-white font-['Outfit']">
                              {settings.footerServiceLink1 || 'Elektrikli Periyodik Bakım'}
                            </h3>
                            <p className="text-[11px] text-gray-400 leading-relaxed">
                              Fren hidroliği, balata kontrolü, bağımsız süspansiyon sistemleri ve 220V şarj muhafaza tesisatının periyodik kontrolleri yapılır.
                            </p>
                          </div>

                          <div className="glass-panel rounded-2xl p-5 border border-blue-500/20 space-y-2 bg-[#091122]">
                            <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/40">
                              <Zap className="w-4.5 h-4.5" />
                            </div>
                            <h3 className="text-sm font-bold text-white font-['Outfit']">
                              {settings.footerServiceLink3 || '220V Şarj Güvenlik Kontrolü'}
                            </h3>
                            <p className="text-[11px] text-gray-400 leading-relaxed">
                              Evinizdeki 220V priz hattının 3.3 kW/s akım güvenliği kontrolü ve aracınızın klimasının uzaktan eşleştirmeleri gerçekleştirilir.
                            </p>
                          </div>
                        </div>
                      )}

                      {/* TYPE: SERVICE FORM */}
                      {block.type === 'serviceForm' && (
                        <div className="glass-panel rounded-3xl p-6 border border-blue-500/30 space-y-4 bg-[#080E1D]">
                          <div className="text-center space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
                              {settings.serviceFormBadge || 'RANDEVU ALIN'}
                            </span>
                            <h3 className="text-xl font-bold text-white font-['Outfit']">
                              {settings.serviceFormTitle || 'Servis Randevusu Oluşturun'}
                            </h3>
                            <p className="text-[11px] text-gray-400">
                              {settings.serviceFormSubtitle || 'Aracınızın şasi numarası ve plakanız ile kolayca online servis randevusu alabilirsiniz.'}
                            </p>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            <div className="space-y-1">
                              <label className="text-gray-400 text-[10px]">Ad Soyad</label>
                              <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 text-gray-500">Ahmet Yılmaz</div>
                            </div>
                            <div className="space-y-1">
                              <label className="text-gray-400 text-[10px]">Telefon</label>
                              <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 text-gray-500">0 (5XX) XXX XX XX</div>
                            </div>
                            <div className="space-y-1">
                              <label className="text-gray-400 text-[10px]">Plaka & Şasi No</label>
                              <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 text-gray-500">07 ABC 123</div>
                            </div>
                            <div className="space-y-1">
                              <label className="text-gray-400 text-[10px]">Hizmet Türü</label>
                              <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 text-gray-300 font-semibold">LFP Batarya Check-up & Testi</div>
                            </div>
                          </div>

                          <div className="pt-2 text-center">
                            <span className="inline-block px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold text-xs shadow-lg">
                              {settings.serviceFormButtonText || 'Servis Randevusunu Onayla'}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* TYPE: CONTACT HERO */}
                      {block.type === 'contactHero' && (
                        <div className="text-center max-w-3xl mx-auto space-y-3 py-4">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400">
                            {settings.contactPageBadge || 'MKBL OTOMOTİV KEPEZ SHOWROOM'}
                          </span>
                          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit']">
                            {settings.contactPageTitle || 'Bize Ulaşın & Showroomumuzu Ziyaret Edin'}
                          </h1>
                          <p className="text-gray-300 text-xs leading-relaxed max-w-xl mx-auto">
                            {settings.contactPageSubtitle || 'Karea Fit %100 elektrikli ideal şehir aracımızı bizzat test etmek, fiyat ve teslimat teklifi almak için Kepez showroomumuza davetlisiniz.'}
                          </p>
                        </div>
                      )}

                      {/* TYPE: CONTACT INFO */}
                      {block.type === 'contactInfo' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 py-2">
                          <div className="glass-panel rounded-2xl p-5 border border-blue-500/20 space-y-3 bg-[#091122]">
                            <h3 className="text-base font-bold text-white font-['Outfit'] flex items-center space-x-2">
                              <Building2 className="w-4 h-4 text-blue-400" />
                              <span>{settings.contactInfoTitle || 'Showroom İletişim Bilgileri'}</span>
                            </h3>
                            <div className="space-y-2 text-xs text-gray-300">
                              <div className="flex items-start space-x-2.5 p-2.5 rounded-xl bg-black/40 border border-white/5">
                                <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                                <span>{settings.address}</span>
                              </div>
                              <div className="flex items-center space-x-2.5 p-2.5 rounded-xl bg-black/40 border border-white/5">
                                <Phone className="w-4 h-4 text-blue-400 shrink-0" />
                                <span>{settings.phone}</span>
                              </div>
                              <div className="flex items-center space-x-2.5 p-2.5 rounded-xl bg-black/40 border border-white/5">
                                <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                                <span>{settings.email}</span>
                              </div>
                              <div className="flex items-center space-x-2.5 p-2.5 rounded-xl bg-black/40 border border-white/5">
                                <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
                                <span>{settings.workingHours}</span>
                              </div>
                            </div>
                          </div>

                          <div className="glass-panel rounded-2xl p-5 border border-blue-500/20 flex flex-col justify-between space-y-3 bg-[#091122]">
                            <div>
                              <h3 className="text-base font-bold text-white font-['Outfit'] flex items-center space-x-2">
                                <Navigation className="w-4 h-4 text-emerald-400" />
                                <span>{settings.contactMapName || 'MKBL Kepez Plaza'} Harita Konumu</span>
                              </h3>
                              <p className="text-[10px] text-gray-400 mt-0.5">Koordinatlar: {settings.contactMapCoords || '36.9200° N, 30.7600° E'}</p>
                            </div>

                            <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden bg-black/50 border border-white/10 flex items-center justify-center text-center p-3">
                              <div className="space-y-1">
                                <MapPin className="w-6 h-6 text-blue-400 mx-auto animate-bounce" />
                                <div className="text-[11px] font-bold text-white">Google Maps Harita Önizleme</div>
                              </div>
                            </div>

                            <div>
                              <span className="w-full py-2 rounded-xl bg-blue-600/30 border border-blue-500/40 text-blue-300 font-bold text-xs flex items-center justify-center space-x-1.5">
                                <Navigation className="w-3.5 h-3.5" />
                                <span>{settings.contactMapButtonText || "Google Maps'te Yol Tarifi Al"}</span>
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* TYPE: CONTACT FORM */}
                      {block.type === 'contactForm' && (
                        <div className="glass-panel rounded-3xl p-6 border border-blue-500/30 space-y-4 bg-[#080E1D]">
                          <div className="text-center space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400">
                              {settings.contactFormBadge || 'BİZE YAZIN'}
                            </span>
                            <h3 className="text-xl font-bold text-white font-['Outfit']">
                              {settings.contactFormTitle || 'İletişim & Karea Fit Teklif Formu'}
                            </h3>
                            <p className="text-[11px] text-gray-400">
                              {settings.contactFormSubtitle || 'Formu doldurarak merak ettiğiniz tüm soruları iletebilir, uzman ekibimizden detaylı yanıt alabilirsiniz.'}
                            </p>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            <div className="space-y-1">
                              <label className="text-gray-400 text-[10px]">Adınız Soyadınız</label>
                              <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 text-gray-500">Mehmet Öz</div>
                            </div>
                            <div className="space-y-1">
                              <label className="text-gray-400 text-[10px]">Telefon Numarası</label>
                              <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 text-gray-500">0 (5XX) XXX XX XX</div>
                            </div>
                          </div>
                          <div className="space-y-1 text-xs">
                            <label className="text-gray-400 text-[10px]">Mesajınız & Talebiniz</label>
                            <div className="p-2.5 rounded-xl bg-black/40 border border-white/10 text-gray-500 h-16">Karea Fit test sürüşü ve teklif almak istiyorum...</div>
                          </div>

                          <div className="pt-1 text-center">
                            <span className="inline-block px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-sky-400 text-white font-bold text-xs shadow-lg">
                              {settings.contactFormButtonText || 'Mesaj Gönder'}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* TYPE: MODELS GRID */}
                      {block.type === 'modelsGrid' && (
                        <div className="space-y-4 py-2">
                          <div className="text-center space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400">
                              TÜM ELEKTRİKLİ MİKRO ARAÇLAR
                            </span>
                            <h2 className="text-xl font-bold text-white font-['Outfit']">
                              MKBL Elektrikli Araç Kataloğu & Modeller
                            </h2>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {vehiclesList.map((v: any) => (
                              <div key={v.id} className="glass-panel rounded-2xl p-4 border border-blue-500/30 space-y-3 bg-[#091122]">
                                <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden bg-[#0A1122]">
                                  <img src={(v.images && v.images[0]) || '/images/karea_official_hero.jpg'} alt={v.name} className="w-full h-full object-cover" />
                                  <span className="absolute top-2 left-2 bg-blue-950/80 backdrop-blur-md text-blue-400 border border-blue-500/30 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
                                    {v.name}
                                  </span>
                                </div>

                                <div className="space-y-1">
                                  <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-bold text-white font-['Outfit']">{v.name}</h3>
                                    <span className="text-sm font-bold text-blue-400">₺{(v.price || 749000).toLocaleString('tr-TR')}</span>
                                  </div>
                                  <p className="text-[10px] text-gray-400 truncate">{v.tagline || 'İdeal Şehir Aracı'}</p>
                                </div>

                                <div className="grid grid-cols-3 gap-1.5 text-center text-[9px]">
                                  <div className="p-1.5 rounded-lg bg-black/40 border border-white/5">
                                    <span className="text-gray-400 block">Menzil</span>
                                    <span className="font-bold text-white">{v.rangeKm || 135} km</span>
                                  </div>
                                  <div className="p-1.5 rounded-lg bg-black/40 border border-white/5">
                                    <span className="text-gray-400 block">Azami Hız</span>
                                    <span className="font-bold text-blue-400">{v.topSpeed || 90} km/s</span>
                                  </div>
                                  <div className="p-1.5 rounded-lg bg-black/40 border border-white/5">
                                    <span className="text-gray-400 block">Şarj Süresi</span>
                                    <span className="font-bold text-emerald-400">2 Saat</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* TYPE: PRIVACY CONTENT */}
                      {block.type === 'privacyContent' && (
                        <div className="space-y-4 py-2">
                          <div className="text-center space-y-1">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-blue-400">
                              YASAL METİNLER & POLİTİKALAR
                            </span>
                            <h2 className="text-xl font-bold text-white font-['Outfit']">
                              Gizlilik Politikası, Kullanım Şartları & KVKK Metinleri
                            </h2>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="glass-panel p-4 rounded-2xl border border-blue-500/20 space-y-2 bg-[#091122]">
                              <h3 className="text-xs font-bold text-white flex items-center space-x-1.5">
                                <FileText className="w-3.5 h-3.5 text-blue-400" />
                                <span>Gizlilik Politikası</span>
                              </h3>
                              <p className="text-[10px] text-gray-400 leading-relaxed line-clamp-4">
                                {settings.privacyPolicyText || 'MKBL Otomotiv olarak kişisel verilerinizin güvenliğine önem veriyoruz...'}
                              </p>
                            </div>

                            <div className="glass-panel p-4 rounded-2xl border border-blue-500/20 space-y-2 bg-[#091122]">
                              <h3 className="text-xs font-bold text-white flex items-center space-x-1.5">
                                <FileText className="w-3.5 h-3.5 text-blue-400" />
                                <span>Kullanım Şartları</span>
                              </h3>
                              <p className="text-[10px] text-gray-400 leading-relaxed line-clamp-4">
                                {settings.termsOfUseText || 'Bu web sitesinde yer alan tüm içerikler MKBL Otomotiv A.Ş.\'ye aittir...'}
                              </p>
                            </div>

                            <div className="glass-panel p-4 rounded-2xl border border-blue-500/20 space-y-2 bg-[#091122]">
                              <h3 className="text-xs font-bold text-white flex items-center space-x-1.5">
                                <FileText className="w-3.5 h-3.5 text-blue-400" />
                                <span>KVKK Metni</span>
                              </h3>
                              <p className="text-[10px] text-gray-400 leading-relaxed line-clamp-4">
                                {settings.kvkkText || '6698 Sayılı Kanun uyarınca kişisel verilerinizin işlenme amaçları...'}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>

        {/* RIGHT PANEL: RESIZING & PROPERTY INSPECTOR */}
        {activeBlock && (
          <aside className="w-72 sm:w-80 bg-[#0B1426] border-l border-slate-800 p-5 space-y-6 overflow-y-auto shrink-0 custom-scrollbar animate-in slide-in-from-right-4 duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-2">
                <Sliders className="w-4 h-4 text-blue-400" />
                <span>Boyutlandırma & Ayarlar</span>
              </h3>
              <button
                onClick={() => setActiveBlockId(null)}
                className="p-1 text-gray-400 hover:text-white rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* GRID WIDTH RATIO */}
            <div className="space-y-2">
              <label className="block text-[10px] uppercase font-bold text-gray-400">
                Genişlik Oranı (Grid Width):
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => updateBlock(activeBlock.id, { width: 'full' })}
                  className={`p-2.5 rounded-xl border text-center font-bold transition-all ${
                    activeBlock.width === 'full' || !activeBlock.width
                      ? 'bg-blue-600 text-white border-blue-400'
                      : 'bg-white/5 text-gray-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  Tam Genişlik (%100)
                </button>
                <button
                  type="button"
                  onClick={() => updateBlock(activeBlock.id, { width: 'half' })}
                  className={`p-2.5 rounded-xl border text-center font-bold transition-all ${
                    activeBlock.width === 'half'
                      ? 'bg-blue-600 text-white border-blue-400'
                      : 'bg-white/5 text-gray-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  Yarım Genişlik (%50)
                </button>
                <button
                  type="button"
                  onClick={() => updateBlock(activeBlock.id, { width: 'third' })}
                  className={`p-2.5 rounded-xl border text-center font-bold transition-all ${
                    activeBlock.width === 'third'
                      ? 'bg-blue-600 text-white border-blue-400'
                      : 'bg-white/5 text-gray-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  Üçte Bir (%33)
                </button>
                <button
                  type="button"
                  onClick={() => updateBlock(activeBlock.id, { width: 'twothirds' })}
                  className={`p-2.5 rounded-xl border text-center font-bold transition-all ${
                    activeBlock.width === 'twothirds'
                      ? 'bg-blue-600 text-white border-blue-400'
                      : 'bg-white/5 text-gray-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  Üçte İki (%66)
                </button>
              </div>
            </div>

            {/* BACKGROUND THEME */}
            <div className="space-y-2">
              <label className="block text-[10px] uppercase font-bold text-gray-400">
                Arka Plan Teması:
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => updateBlock(activeBlock.id, { bgTheme: 'glass' })}
                  className={`p-2 rounded-xl border font-semibold ${
                    activeBlock.bgTheme === 'glass'
                      ? 'bg-blue-600/30 text-blue-300 border-blue-400'
                      : 'bg-white/5 text-gray-400 border-slate-800'
                  }`}
                >
                  Glassmorphism
                </button>
                <button
                  type="button"
                  onClick={() => updateBlock(activeBlock.id, { bgTheme: 'slate' })}
                  className={`p-2 rounded-xl border font-semibold ${
                    activeBlock.bgTheme === 'slate'
                      ? 'bg-blue-600/30 text-blue-300 border-blue-400'
                      : 'bg-white/5 text-gray-400 border-slate-800'
                  }`}
                >
                  Koyu Slate
                </button>
                <button
                  type="button"
                  onClick={() => updateBlock(activeBlock.id, { bgTheme: 'emerald' })}
                  className={`p-2 rounded-xl border font-semibold ${
                    activeBlock.bgTheme === 'emerald'
                      ? 'bg-emerald-600/30 text-emerald-300 border-emerald-400'
                      : 'bg-white/5 text-gray-400 border-slate-800'
                  }`}
                >
                  Zümrüt Yeşili
                </button>
                <button
                  type="button"
                  onClick={() => updateBlock(activeBlock.id, { bgTheme: 'transparent' })}
                  className={`p-2 rounded-xl border font-semibold ${
                    activeBlock.bgTheme === 'transparent'
                      ? 'bg-blue-600/30 text-blue-300 border-blue-400'
                      : 'bg-white/5 text-gray-400 border-slate-800'
                  }`}
                >
                  Şeffaf
                </button>
              </div>
            </div>

            {/* BLOCK SPECIFIC EDITORS */}
            <div className="space-y-4 pt-4 border-t border-slate-800">
              <label className="block text-[10px] uppercase font-bold text-blue-400">
                İçerik & Metin Düzenleme:
              </label>

              {(activeBlock.type === 'text' || activeBlock.type === 'hero') && (
                <>
                  <div>
                    <label className="block text-gray-400 text-[10px] mb-1">Başlık Metni:</label>
                    <input
                      type="text"
                      value={activeBlock.heading || ''}
                      onChange={(e) => updateBlock(activeBlock.id, { heading: e.target.value })}
                      className="w-full bg-[#060A14] border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-[10px] mb-1">Açıklama / Paragraf Metni:</label>
                    <textarea
                      rows={4}
                      value={activeBlock.text || ''}
                      onChange={(e) => updateBlock(activeBlock.id, { text: e.target.value })}
                      className="w-full bg-[#060A14] border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-blue-500 resize-none font-sans"
                    ></textarea>
                  </div>
                </>
              )}

              {activeBlock.type === 'image' && (
                <>
                  <div>
                    <label className="block text-gray-400 text-[10px] mb-1">Görsel URL Adresi:</label>
                    <input
                      type="text"
                      value={activeBlock.imageUrl || ''}
                      onChange={(e) => updateBlock(activeBlock.id, { imageUrl: e.target.value })}
                      className="w-full bg-[#060A14] border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-[10px] mb-1">Görsel Altı Yazısı (Caption):</label>
                    <input
                      type="text"
                      value={activeBlock.caption || ''}
                      onChange={(e) => updateBlock(activeBlock.id, { caption: e.target.value })}
                      className="w-full bg-[#060A14] border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </>
              )}

              {activeBlock.type === 'alert' && (
                <>
                  <div>
                    <label className="block text-gray-400 text-[10px] mb-1">Uyarı Başlığı:</label>
                    <input
                      type="text"
                      value={activeBlock.alertTitle || ''}
                      onChange={(e) => updateBlock(activeBlock.id, { alertTitle: e.target.value })}
                      className="w-full bg-[#060A14] border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-400 text-[10px] mb-1">Uyarı Metni:</label>
                    <textarea
                      rows={3}
                      value={activeBlock.alertText || ''}
                      onChange={(e) => updateBlock(activeBlock.id, { alertText: e.target.value })}
                      className="w-full bg-[#060A14] border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-blue-500 resize-none font-sans"
                    ></textarea>
                  </div>
                </>
              )}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
