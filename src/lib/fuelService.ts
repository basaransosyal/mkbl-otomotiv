import { prisma } from '@/lib/prisma';
import { getSiteSettingsStore } from '@/lib/settings';

export interface LiveFuelData {
  electricityRate: number; // TL per kWh
  gasolinePrice: number;   // TL per Litre
  isLive: boolean;
  collectApiFlow: 'ACTIVE' | 'ERROR' | 'OFF';
  epiasFlow: 'ACTIVE' | 'ERROR' | 'OFF';
  lastUpdated: string;
  sourceName: string;
  electricitySource: string;
  gasolineSource: string;
  syncTimeInfo: string;
}

// Memory Store
let cachedFuelData: LiveFuelData | null = null;

export function clearFuelServiceCache() {
  cachedFuelData = null;
}

/**
 * Official EPİAŞ Transparency Portal V2 API Authenticator & Price Fetcher
 * Implements CAS TGT Authentication Specification (PDF Technical Guide Page 26-28)
 */
async function fetchEpiasRate(user: string, pass: string, apiKey?: string): Promise<{ rate: number; isSuccess: boolean }> {
  try {
    let tgtToken = apiKey?.trim();

    // If no manual TGT/API key provided, acquire official TGT via EPİAŞ CAS service (PDF Page 26-28)
    if (!tgtToken || !tgtToken.startsWith('TGT-')) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const params = new URLSearchParams();
      params.append('username', user || 'mkblsosyal@gmail.com');
      params.append('password', pass || 'Basaran+2026');

      const casRes = await fetch('https://giris.epias.com.tr/cas/v1/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept': 'text/plain',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        },
        body: params.toString(),
        signal: controller.signal,
        cache: 'no-store',
      });

      clearTimeout(timeoutId);

      if (casRes.ok || casRes.status === 201) {
        const textResp = await casRes.text();
        const extractedTgt = textResp.trim();
        if (extractedTgt.startsWith('TGT-')) {
          tgtToken = extractedTgt;
        }
      }
    }

    // Query PTF (MCP) Market Clearing Price Service with TGT header (PDF Page 28 & Page 156)
    if (tgtToken) {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const todayIso = new Date().toISOString().split('T')[0];
      const ptfRes = await fetch('https://seffaflik.epias.com.tr/electricity-service/v1/markets/dam/data/mcp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'TGT': tgtToken,
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        },
        body: JSON.stringify({
          startDate: `${todayIso}T00:00:00+03:00`,
          endDate: `${todayIso}T23:59:59+03:00`,
        }),
        signal: controller.signal,
        cache: 'no-store',
      });

      clearTimeout(timeoutId);

      if (ptfRes.ok) {
        const ptfData = await ptfRes.json().catch(() => null);
        if (ptfData?.items && Array.isArray(ptfData.items) && ptfData.items.length > 0) {
          const validItems = ptfData.items.filter((item: any) => typeof item.price === 'number' && item.price > 0);
          if (validItems.length > 0) {
            const avgPtfMwh = validItems.reduce((sum: number, item: any) => sum + item.price, 0) / validItems.length;
            const evKwhTariff = (avgPtfMwh / 1000) * 1.25; // Tariffs + Taxes + Distribution
            return { rate: Number(evKwhTariff.toFixed(2)), isSuccess: true };
          }
        }
      }
    }
  } catch (err) {
    // Timeout or network drop
  }

  return { rate: 3.25, isSuccess: false };
}

/**
 * Fuel & Electricity Rates Service supporting ON/OFF API Toggles & Admin Manual Defaults
 */
export async function getLiveFuelAndElectricityRates(forceRefresh: boolean = false): Promise<LiveFuelData> {
  if (!forceRefresh && cachedFuelData) {
    return cachedFuelData;
  }

  const now = new Date();
  const todayDisplayStr = now.toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const dbSettings = await prisma.siteSettings.findFirst().catch(() => null);
  const store = getSiteSettingsStore();

  const isCollectApiActive = Boolean(dbSettings?.collectApiActive ?? store.collectApiActive ?? false);
  const isEpiasActive = Boolean(dbSettings?.epiasActive ?? store.epiasActive ?? false);

  // Admin Panel Manual Default Prices
  const defaultGasPrice = dbSettings?.defaultGasPrice ?? store.defaultGasPrice ?? 67.00;
  const defaultEvRate = dbSettings?.defaultElectricityRate ?? store.defaultElectricityRate ?? 3.25;

  let liveGasPrice = defaultGasPrice;
  let liveEvRate = defaultEvRate;

  let collectApiFlow: 'ACTIVE' | 'ERROR' | 'OFF' = isCollectApiActive ? 'ERROR' : 'OFF';
  let epiasFlow: 'ACTIVE' | 'ERROR' | 'OFF' = isEpiasActive ? 'ERROR' : 'OFF';

  // 1. Fetch CollectAPI Gasoline if ON
  if (isCollectApiActive) {
    const collectApiKey = dbSettings?.collectApiKey || store.collectApiKey || process.env.COLLECT_API_KEY || '';
    if (collectApiKey && collectApiKey.trim().length > 5) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);

        const res = await fetch('https://api.collectapi.com/gasPrice/turkeyGasoline?city=antalya', {
          headers: {
            'content-type': 'application/json',
            'authorization': collectApiKey.startsWith('apikey') ? collectApiKey : `apikey ${collectApiKey}`,
          },
          signal: controller.signal,
          cache: 'no-store',
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const data = await res.json().catch(() => null);
          if (data?.success && Array.isArray(data.result) && data.result.length > 0) {
            const parsed = parseFloat(String(data.result[0].benzin || data.result[0].gasoline).replace(',', '.'));
            if (!isNaN(parsed) && parsed > 10) {
              liveGasPrice = parsed;
              collectApiFlow = 'ACTIVE'; // GREEN LIGHT
            }
          }
        }
      } catch (e) {
        collectApiFlow = 'ERROR'; // RED LIGHT - Fallback to defaultGasPrice
      }
    }
  }

  // 2. Fetch EPİAŞ Electricity if ON (PDF CAS TGT Spec)
  if (isEpiasActive) {
    const epiasUser = dbSettings?.epiasUser || store.epiasUser || 'mkblsosyal@gmail.com';
    const epiasPass = dbSettings?.epiasPass || store.epiasPass || 'Basaran+2026';
    const epiasApiKey = dbSettings?.epiasApiKey || store.epiasApiKey || '';
    const epiasResult = await fetchEpiasRate(epiasUser, epiasPass, epiasApiKey);
    if (epiasResult.isSuccess) {
      liveEvRate = epiasResult.rate;
      epiasFlow = 'ACTIVE'; // GREEN LIGHT
    } else {
      epiasFlow = 'ERROR'; // RED LIGHT - Fallback to defaultEvRate
    }
  }

  const isLiveSuccess = (isCollectApiActive && collectApiFlow === 'ACTIVE') || (isEpiasActive && epiasFlow === 'ACTIVE');

  cachedFuelData = {
    electricityRate: Number(liveEvRate.toFixed(2)),
    gasolinePrice: Number(liveGasPrice.toFixed(2)),
    isLive: isLiveSuccess,
    collectApiFlow,
    epiasFlow,
    lastUpdated: todayDisplayStr,
    sourceName: isLiveSuccess ? 'Canlı API Piyasa Verileri' : 'Admin Paneli Tanımlı Varsayılan Tarifeler',
    electricitySource: epiasFlow === 'ACTIVE' ? 'EPİAŞ Canlı Elektrik Piyasası Tarifesi' : 'Admin Paneli Tanımlı Elektrik Birim Fiyatı',
    gasolineSource: collectApiFlow === 'ACTIVE' ? 'CollectAPI Antalya Benzin Pompa Fiyatı' : 'Admin Paneli Tanımlı Benzin Litre Fiyatı',
    syncTimeInfo: isLiveSuccess ? 'Canlı API Akışı Sağlanıyor' : 'Varsayılan Sabit Fiyatlar Kullanılıyor',
  };

  return cachedFuelData;
}
