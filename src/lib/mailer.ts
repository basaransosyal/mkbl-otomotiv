import nodemailer from 'nodemailer';
import { prisma } from '@/lib/prisma';

export interface FormEmailData {
  formType: 'TEST_DRIVE' | 'SERVICE' | 'CONTACT';
  title: string;
  badge: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  details: { label: string; value: string }[];
  notes?: string | null;
  adminLink: string;
}

/**
 * Normalizes role text for matching target recipients
 */
function normalizeRole(role: string): string {
  return role
    .toUpperCase()
    .replace(/İ/g, 'I')
    .replace(/Ş/g, 'S')
    .replace(/Ğ/g, 'G')
    .replace(/Ü/g, 'U')
    .replace(/Ö/g, 'O')
    .replace(/Ç/g, 'C')
    .trim();
}

/**
 * Retrieves recipient email addresses based on form type and user roles
 * Test Drive -> SATIŞ (Sales)
 * Service -> SSH (After Sales Services)
 * Contact -> MÜŞTERİ İLİŞKİLERİ (Customer Relations)
 */
export async function getRecipientsForForm(formType: 'TEST_DRIVE' | 'SERVICE' | 'CONTACT'): Promise<string[]> {
  try {
    const settings = await prisma.siteSettings.findFirst();
    const fallbackEmail = settings?.email || 'info@mkbloto.com';

    let targetRoleNormalized = '';
    if (formType === 'TEST_DRIVE') {
      targetRoleNormalized = 'SATIS'; // SATIŞ
    } else if (formType === 'SERVICE') {
      targetRoleNormalized = 'SSH'; // SSH
    } else if (formType === 'CONTACT') {
      targetRoleNormalized = 'MUSTE RILISKILERI'; // MÜŞTERİ İLİŞKİLERİ
    }

    // Fetch active users from database
    const users = await prisma.adminUser.findMany({
      where: { isActive: true },
    });

    const matchingEmails = users
      .filter((u) => {
        if (!u.email || !u.email.trim()) return false;
        const userRoleNorm = normalizeRole(u.role);
        
        if (formType === 'TEST_DRIVE') {
          return userRoleNorm.includes('SATIS');
        } else if (formType === 'SERVICE') {
          return userRoleNorm.includes('SSH') || userRoleNorm.includes('SERVIS');
        } else if (formType === 'CONTACT') {
          return userRoleNorm.includes('MUSTE') || userRoleNorm.includes('ILISKI');
        }
        return false;
      })
      .map((u) => u.email!.trim());

    if (matchingEmails.length > 0) {
      return Array.from(new Set(matchingEmails));
    }

    // Fallback: If no role specific email found, return fallback site email & admins with email
    const adminEmails = users
      .filter((u) => u.email && (normalizeRole(u.role).includes('ADMIN') || normalizeRole(u.role).includes('YONETICI')))
      .map((u) => u.email!.trim());

    if (adminEmails.length > 0) {
      return Array.from(new Set(adminEmails));
    }

    return [fallbackEmail];
  } catch (err) {
    console.error('Error fetching email recipients:', err);
    return ['info@mkbloto.com'];
  }
}

/**
 * Generates brand-aligned HTML Email Template matching MKBL Otomotiv corporate identity
 */
export function generateBrandedHtmlEmail(data: FormEmailData, siteName: string = 'MKBL Otomotiv'): string {
  const detailRows = data.details
    .map(
      (item) => `
      <tr>
        <td style="padding: 10px 14px; border-bottom: 1px solid #1E293B; color: #94A3B8; font-size: 13px; font-weight: 600; width: 35%; text-align: left;">
          ${item.label}
        </td>
        <td style="padding: 10px 14px; border-bottom: 1px solid #1E293B; color: #F8FAFC; font-size: 13px; font-weight: 700; text-align: left;">
          ${item.value}
        </td>
      </tr>
    `
    )
    .join('');

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.title}</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #0B0F17; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; -webkit-font-smoothing: antialiased;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0B0F17; padding: 40px 15px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" style="max-width: 600px; background-color: #0D1527; border: 1px solid #1E3A8A; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 50px rgba(0,0,0,0.5);">
            
            <!-- HEADER -->
            <tr>
              <td style="padding: 30px 30px 20px 30px; background: linear-gradient(135deg, #0B1329 0%, #1E293B 100%); border-bottom: 1px solid #1E3A8A; text-align: left;">
                <table width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td>
                      <span style="font-size: 20px; font-weight: 900; color: #FFFFFF; letter-spacing: 1px;">
                        MKBL <span style="color: #00F0FF;">OTOMOTİV</span>
                      </span>
                      <div style="font-size: 11px; color: #94A3B8; margin-top: 2px;">Elektrikli Mikro Ulaşım & Yetkili Bayi</div>
                    </td>
                    <td align="right">
                      <span style="display: inline-block; padding: 6px 12px; background-color: rgba(0, 240, 255, 0.1); border: 1px solid rgba(0, 240, 255, 0.3); border-radius: 8px; color: #00F0FF; font-size: 11px; font-weight: 700; text-transform: uppercase;">
                        ${data.badge}
                      </span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- TITLE & WELCOME -->
            <tr>
              <td style="padding: 25px 30px 10px 30px; text-align: left;">
                <h1 style="margin: 0; font-size: 18px; font-weight: 800; color: #FFFFFF; font-family: sans-serif;">
                  ${data.title}
                </h1>
                <p style="margin: 8px 0 0 0; font-size: 13px; color: #94A3B8; line-height: 1.5;">
                  Web siteniz üzerinden yeni bir bildirim formu gönderildi. Form detayları aşağıda bilgilerinize sunulmuştur:
                </p>
              </td>
            </tr>

            <!-- CUSTOMER DETAILS TABLE -->
            <tr>
              <td style="padding: 15px 30px;">
                <table width="100%" cellspacing="0" cellpadding="0" style="background-color: #080D1A; border-radius: 12px; border: 1px solid #1E293B; border-collapse: collapse; overflow: hidden;">
                  <tr>
                    <td style="padding: 10px 14px; border-bottom: 1px solid #1E293B; color: #94A3B8; font-size: 13px; font-weight: 600; width: 35%; text-align: left;">
                      Müşteri Ad Soyad
                    </td>
                    <td style="padding: 10px 14px; border-bottom: 1px solid #1E293B; color: #00F0FF; font-size: 14px; font-weight: 800; text-align: left;">
                      ${data.customerName}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 14px; border-bottom: 1px solid #1E293B; color: #94A3B8; font-size: 13px; font-weight: 600; width: 35%; text-align: left;">
                      Telefon Numarası
                    </td>
                    <td style="padding: 10px 14px; border-bottom: 1px solid #1E293B; color: #F8FAFC; font-size: 13px; font-weight: 700; text-align: left;">
                      <a href="tel:${data.customerPhone}" style="color: #38BDF8; text-decoration: none;">${data.customerPhone}</a>
                    </td>
                  </tr>
                  ${
                    data.customerEmail
                      ? `
                  <tr>
                    <td style="padding: 10px 14px; border-bottom: 1px solid #1E293B; color: #94A3B8; font-size: 13px; font-weight: 600; width: 35%; text-align: left;">
                      E-Posta Adresi
                    </td>
                    <td style="padding: 10px 14px; border-bottom: 1px solid #1E293B; color: #F8FAFC; font-size: 13px; font-weight: 700; text-align: left;">
                      <a href="mailto:${data.customerEmail}" style="color: #38BDF8; text-decoration: none;">${data.customerEmail}</a>
                    </td>
                  </tr>
                  `
                      : ''
                  }
                  ${detailRows}
                </table>
              </td>
            </tr>

            <!-- NOTES / MESSAGE BOX -->
            ${
              data.notes
                ? `
            <tr>
              <td style="padding: 0 30px 20px 30px;">
                <div style="background-color: #080D1A; border: 1px solid #1E293B; border-radius: 12px; padding: 14px; font-size: 12px; color: #CBD5E1; line-height: 1.6;">
                  <strong style="color: #38BDF8; display: block; margin-bottom: 4px;">Müşteri Notu / Mesajı:</strong>
                  ${data.notes}
                </div>
              </td>
            </tr>
            `
                : ''
            }

            <!-- ACTION BUTTON -->
            <tr>
              <td style="padding: 10px 30px 30px 30px;" align="center">
                <a href="${data.adminLink}" target="_blank" style="display: inline-block; padding: 14px 28px; background: linear-gradient(135deg, #2563EB 0%, #0284C7 100%); color: #FFFFFF; font-size: 13px; font-weight: 700; text-decoration: none; border-radius: 12px; box-shadow: 0 4px 15px rgba(37, 99, 235, 0.4);">
                  Yönetim Panelinde İncele →
                </a>
              </td>
            </tr>

            <!-- FOOTER -->
            <tr>
              <td style="padding: 20px 30px; background-color: #080D1A; border-top: 1px solid #1E293B; text-align: center; font-size: 11px; color: #64748B;">
                Bu e-posta MKBL Otomotiv web sitesi otomasyonu tarafından otomatik olarak gönderilmiştir.<br>
                © ${new Date().getFullYear()} ${siteName} - Tüm hakları saklıdır.
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;
}

/**
 * Sends the e-mail notification to routed role recipients
 */
export async function sendFormEmailNotification(data: FormEmailData): Promise<boolean> {
  try {
    const settings = await prisma.siteSettings.findFirst();
    const siteName = settings?.siteName || 'MKBL Otomotiv';

    // 1. Get recipients based on form type (Satış, SSH, Müşteri İlişkileri)
    const recipients = await getRecipientsForForm(data.formType);

    if (!recipients || recipients.length === 0) {
      console.warn('No email recipients found for form type:', data.formType);
      return false;
    }

    const htmlContent = generateBrandedHtmlEmail(data, siteName);
    const subject = `[${data.badge}] ${data.customerName} - ${data.title}`;

    // 2. Configure SMTP Transporter
    const smtpHost = settings?.smtpHost || process.env.SMTP_HOST;
    const smtpPort = settings?.smtpPort || Number(process.env.SMTP_PORT) || 587;
    const smtpUser = settings?.smtpUser || process.env.SMTP_USER;
    const smtpPass = settings?.smtpPass || process.env.SMTP_PASS;
    const smtpSender = settings?.smtpSender || process.env.SMTP_SENDER || `MKBL Otomotiv <bildirim@mkbloto.com>`;

    // If SMTP host is configured, send via nodemailer
    if (smtpHost && smtpUser && smtpPass) {
      const transporter = nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: settings?.smtpEnableSsl ?? smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      });

      await transporter.sendMail({
        from: smtpSender,
        to: recipients.join(', '),
        subject: subject,
        html: htmlContent,
      });

      console.log(`[EMAIL DISPATCH SUCCESS] Sent ${data.formType} email to:`, recipients.join(', '));
      return true;
    } else {
      // Test / Fallback Log mode when SMTP is not configured yet
      console.log('====================================================');
      console.log(`[EMAIL DISPATCH LOG MODE (SMTP Host Pending Setup)]`);
      console.log(`Form Type: ${data.formType}`);
      console.log(`Recipients (Roles): ${recipients.join(', ')}`);
      console.log(`Subject: ${subject}`);
      console.log('====================================================');
      return true;
    }
  } catch (err) {
    console.error('Error sending form e-mail notification:', err);
    return false;
  }
}
