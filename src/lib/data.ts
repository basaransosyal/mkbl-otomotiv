export interface VehicleColor {
  name: string;
  badge?: string;
  hex: string;
  image?: string;
  angleImages?: string[];
}

export interface Vehicle {
  id: string;
  name: string;
  tagline: string;
  category: 'City';
  price: number;
  rangeKm: number;
  topSpeed: number;
  chargeTime: string;
  battery: string;
  licenseType: string;
  motorPower: string;
  dimensions?: string;
  chargePower?: string;
  capacityDetails?: string;
  rimSize?: string;
  images: string[];
  colors: VehicleColor[];
  features: string[];
  stockStatus: 'STOKTA' | 'ÖN SİPARİŞ' | 'TÜKENDİ';
  isPublished?: boolean;
  showOnHomepage?: boolean;
}

export interface TestDriveRequest {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  city: string;
  vehicleId?: string;
  vehicleName: string;
  preferredDate: string;
  preferredTime: string;
  status: 'BEKLEMEDE' | 'ARANDI' | 'TAMAMLANDI' | 'İPTAL';
  notes?: string;
  createdAt: string;
}

export const normalizeVehiclePrice = (input: any): number => {
  if (input === null || input === undefined || input === '') return 0;
  if (typeof input === 'number') {
    if (isNaN(input)) return 0;
    return input > 0 && input < 1000 ? Math.round(input * 1000) : Math.round(input);
  }
  let str = input.toString().trim();
  str = str.replace(/[₺TL\s]/gi, '');
  str = str.replace(/\./g, '');
  str = str.replace(',', '.');
  let num = parseFloat(str);
  if (isNaN(num)) return 0;
  if (num > 0 && num < 1000) {
    num = num * 1000;
  }
  return Math.round(num);
};

export interface ServiceAppointment {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  licensePlate: string;
  vehicleModel: string;
  serviceType: string;
  appointmentDate: string;
  appointmentTime: string;
  status: 'BEKLEMEDE' | 'ONAYLANDI' | 'TAMAMLANDI' | 'İPTAL';
  userNotes?: string;
  createdAt: string;
}

export interface ContactMessage {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  subject: string;
  message: string;
  status: 'BEKLEMEDE' | 'OKUNDU' | 'YANITLANDI' | 'İPTAL';
  createdAt: string;
}

// INITIAL SEED DATA
export const INITIAL_VEHICLES: Vehicle[] = [
  {
    id: 'karea-fit',
    name: 'Karea Fit',
    tagline: 'Bindiğin gibi değil. İdeal Şehir Aracı.',
    category: 'City',
    price: 485000,
    rangeKm: 135,
    topSpeed: 90,
    chargeTime: '%20’den %80’e 2 Saat (3.3 kW/s Ev Tipi 220V Priz)',
    battery: '9.98 kWh LFP (Lityum Demir Fosfat)',
    licenseType: 'B / B1 (16 Yaş ve Üzeri)',
    motorPower: '12 kW (Peak Motor Gücü)',
    dimensions: '2.631 mm x 1.498 mm x 1.621 mm',
    chargePower: '3,3 kW/s Ev Tipi 220V',
    capacityDetails: '3 Kapı / 2 Koltuk / 184 L',
    rimSize: '13 inç Alaşım Jant',
    images: [
      '/images/karea_official_hero.jpg'
    ],
    colors: [
      {
        name: 'Satsuma Turuncusu',
        badge: 'Satsuma Turuncusu',
        hex: '#ff6b00',
        image: '/images/karea_official_hero.jpg',
        angleImages: ['/images/karea_official_hero.jpg']
      },
      {
        name: 'Zeytin Yeşili',
        badge: 'Zeytin Yeşili',
        hex: '#4a5d4e',
        image: '/images/karea_official_hero.jpg',
        angleImages: ['/images/karea_official_hero.jpg']
      },
      {
        name: 'Akdeniz Mavisi',
        badge: 'Akdeniz Mavisi',
        hex: '#1e5b88',
        image: '/images/karea_official_hero.jpg',
        angleImages: ['/images/karea_official_hero.jpg']
      },
      {
        name: 'Sıcak Kum',
        badge: 'Sıcak Kum',
        hex: '#d2c4b5',
        image: '/images/karea_official_hero.jpg',
        angleImages: ['/images/karea_official_hero.jpg']
      },
      {
        name: 'Bulut Gri',
        badge: 'Bulut Gri',
        hex: '#a1a8b0',
        image: '/images/karea_official_hero.jpg',
        angleImages: ['/images/karea_official_hero.jpg']
      },
      {
        name: 'Akşam Güneşi',
        badge: 'Akşam Güneşi',
        hex: '#c52626',
        image: '/images/karea_official_hero.jpg',
        angleImages: ['/images/karea_official_hero.jpg']
      }
    ],
    features: [
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
    ],
    stockStatus: 'STOKTA',
    isPublished: true
  }
];

export interface GallerySlideItem {
  id: string;
  vehicleId?: string;
  title: string;
  subtitle?: string;
  description?: string;
  tagText?: string;
  imageUrl: string;
  order: number;
  isPublished?: boolean;
}

export const INITIAL_GALLERY_SLIDES: GallerySlideItem[] = [
  {
    id: 'slide-1',
    vehicleId: 'karea-fit',
    title: 'Şehir İçi Elektrikli Özgürlük',
    subtitle: '%100 Elektrikli Karea Fit',
    description: 'Ev tipi 220V prizden 2 saatte hızlı şarj (%20-%80) olabilen pratik ve yenilikçi şehir ulaşımı.',
    tagText: 'Karea Özel Donanım',
    imageUrl: '/images/karea_official_1.jpg',
    order: 1,
    isPublished: true,
  },
  {
    id: 'slide-2',
    vehicleId: 'karea-fit',
    title: 'Çelik Kafes Güvenlik Mimarisi',
    subtitle: 'Maksimum Sürücü Koruması',
    description: 'Kaza anında maksimum darbe emilimi sağlayan güçlendirilmiş hafif çelik şasi yapısı.',
    tagText: 'Güvenlik Donanımı',
    imageUrl: '/images/karea_official_2.jpg',
    order: 2,
    isPublished: true,
  },
  {
    id: 'slide-3',
    vehicleId: 'karea-fit',
    title: 'Geniş İç Hacim & Ergonomik Kabin',
    subtitle: 'Dokunmatik Multimedya & Klima',
    description: '2 kişilik konforlu koltuklar, elektrikli camlar, dijital gösterge ve 184 Litre bagaj hacmi.',
    tagText: 'İç Kabin Konforu',
    imageUrl: '/images/karea_official_3.jpg',
    order: 3,
    isPublished: true,
  },
  {
    id: 'slide-4',
    vehicleId: 'karea-fit',
    title: 'Rejeneratif Frenleme & Enerji Kazanımı',
    subtitle: '135 km Şehir İçi Menzil',
    description: 'Fren esnasında kinetik enerjiyi LFP bataryaya depolayarak menzilinizi %15 oranında uzatır.',
    tagText: 'Batarya & Enerji',
    imageUrl: '/images/karea_official_4.jpg',
    order: 4,
    isPublished: true,
  },
  {
    id: 'slide-5',
    vehicleId: 'karea-fit',
    title: 'Modern Şık Tasarım & Renk Seçenekleri',
    subtitle: 'Antalya Kepez Showroom',
    description: '6 farklı çift renk gövde seçeneği ve 360° dinamik açı konfigüratörü ile kendi tarzınızı yansıtın.',
    tagText: 'Dış Tasarım & Renk',
    imageUrl: '/images/karea_red_front_q.jpg',
    order: 5,
    isPublished: true,
  },
];

// Memory fallback stores
let vehiclesStore: Vehicle[] = [...INITIAL_VEHICLES];
let gallerySlidesStore: GallerySlideItem[] = [...INITIAL_GALLERY_SLIDES];
let testDrivesStore: TestDriveRequest[] = [];
let servicesStore: ServiceAppointment[] = [];
let messagesStore: ContactMessage[] = [];

export function getVehiclesStore(): Vehicle[] { return vehiclesStore; }
export function setVehiclesStore(v: Vehicle[]): void { vehiclesStore = v; }
export function getGallerySlidesStore(): GallerySlideItem[] { return gallerySlidesStore; }
export function setGallerySlidesStore(g: GallerySlideItem[]): void { gallerySlidesStore = g; }
export function getTestDrivesStore(): TestDriveRequest[] { return testDrivesStore; }
export function addTestDriveStore(td: TestDriveRequest): void { testDrivesStore.unshift(td); }
export function updateTestDriveStatusStore(id: string, status: any): void {
  const item = testDrivesStore.find(t => t.id === id);
  if (item) item.status = status;
}
export function deleteTestDriveStore(id: string): void {
  testDrivesStore = testDrivesStore.filter(t => t.id !== id);
}
export function deleteTestDrivesStore(ids: string[]): void {
  testDrivesStore = testDrivesStore.filter(t => !ids.includes(t.id));
}
export function getServicesStore(): ServiceAppointment[] { return servicesStore; }
export function addServiceStore(s: ServiceAppointment): void { servicesStore.unshift(s); }
export function updateServiceStatusStore(id: string, status: any): void {
  const item = servicesStore.find(s => s.id === id);
  if (item) item.status = status;
}
export function deleteServiceStore(id: string): void {
  servicesStore = servicesStore.filter(s => s.id !== id);
}
export function deleteServicesStore(ids: string[]): void {
  servicesStore = servicesStore.filter(s => !ids.includes(s.id));
}
export function getMessagesStore(): ContactMessage[] { return messagesStore; }
export function addMessageStore(m: ContactMessage): void { messagesStore.unshift(m); }
export function updateMessageStatusStore(id: string, status: any): void {
  const item = messagesStore.find(m => m.id === id);
  if (item) item.status = status;
}
export function deleteMessageStore(id: string): void {
  messagesStore = messagesStore.filter(m => m.id !== id);
}
export function deleteMessagesStore(ids: string[]): void {
  messagesStore = messagesStore.filter(m => !ids.includes(m.id));
}
