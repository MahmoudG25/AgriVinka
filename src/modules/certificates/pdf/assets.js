import { Font } from '@react-pdf/renderer';
import QRCode from 'qrcode';

// Paths are relative to the web root when bundled with Vite.
// Place the font files under public/fonts as described in the summary.
const FONTS = {
  serif: {
    regular: '/fonts/PlayfairDisplay-Regular.ttf',
    bold: '/fonts/PlayfairDisplay-Bold.ttf',
  },
  sans: {
    regular: '/fonts/Montserrat-Regular.ttf',
    semiBold: '/fonts/Montserrat-SemiBold.ttf',
  },
  arabic: {
    regular: '/fonts/Amiri-Regular.ttf',
    bold: '/fonts/Amiri-Bold.ttf',
  },
};

let fontsRegistered = false;

export function registerCertificateFonts() {
  if (fontsRegistered) return;
  fontsRegistered = true;

  Font.register({
    family: 'NamaaSerif',
    fonts: [
      { src: FONTS.serif.regular, fontWeight: 'normal' },
      { src: FONTS.serif.bold, fontWeight: 'bold' },
    ],
  });

  Font.register({
    family: 'NamaaSans',
    fonts: [
      { src: FONTS.sans.regular, fontWeight: 'normal' },
      { src: FONTS.sans.semiBold, fontWeight: '600' },
    ],
  });

  Font.register({
    family: 'NamaaArabic',
    fonts: [
      { src: FONTS.arabic.regular, fontWeight: 'normal' },
      { src: FONTS.arabic.bold, fontWeight: 'bold' },
    ],
  });
}

export function hasArabic(text) {
  if (!text) return false;
  return /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(text);
}

export const certificateTemplateConfig = {
  size: 'A4',
  orientation: 'landscape',
  colors: {
    background: '#f9f7f2',
    borderOuter: '#0f3b1c',
    borderInner: '#d9c58d',
    accent: '#0f3b1c',
    gold: '#c9a646',
    textMain: '#222222',
    textMuted: '#666666',
    badgeBg: '#0f3b1c',
    badgeText: '#ffffff',
  },
  branding: {
    academyEn: 'Namaa Academy',
    academyAr: 'نماء أكاديمي',
  },
};

/**
 * Generate a data URL image for the QR code pointing to verificationUrl.
 * Used inside React-PDF <Image>.
 */
export async function generateQrDataUrl(verificationUrl) {
  if (!verificationUrl) return null;
  try {
    // Low error correction level is enough for URLs and keeps the graphic simple.
    return await QRCode.toDataURL(verificationUrl, {
      errorCorrectionLevel: 'M',
      margin: 0,
      color: { dark: '#000000', light: '#ffffff00' },
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn('Failed to generate QR code data URL', err);
    return null;
  }
}

