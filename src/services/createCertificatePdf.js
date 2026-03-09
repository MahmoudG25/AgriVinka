import { PDFDocument, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import { ArabicShaper } from 'arabic-persian-reshaper';
import { generateQRMatrix } from '../utils/qrcode';
import { getCertificateTemplateSettingsCached } from '../features/certificates/services/templateSettingsService.js';

// Template version — increment when layout changes significantly
export const TEMPLATE_VERSION = '2.0.0';

/**
 * Reshape Arabic text for pdf-lib (which has no GSUB/shaping support).
 * 1. Convert characters to their connected presentation forms
 * 2. Reverse the string so LTR renderer displays it correctly as RTL
 */
function prepareArabicText(text) {
  if (!text) return '';
  const reshaped = ArabicShaper.convertArabic(text);
  return [...reshaped].reverse().join('');
}

/**
 * Check if text contains Arabic characters.
 */
function hasArabic(text) {
  return /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(text);
}

/**
 * Convert hex color to pdf-lib rgb().
 */
function hexToRgb(hex) {
  const h = (hex || '#000000').replace('#', '');
  return rgb(
    parseInt(h.substring(0, 2), 16) / 255,
    parseInt(h.substring(2, 4), 16) / 255,
    parseInt(h.substring(4, 6), 16) / 255
  );
}

/**
 * Try to fetch and embed a PNG logo into the PDF.
 */
async function fetchLogoBytes(logoUrl) {
  // If a custom logo URL is set, try it first
  const sources = logoUrl
    ? [logoUrl, '/assets/000.png', '/logo.png']
    : ['/assets/000.png', '/logo.png'];

  for (const src of sources) {
    try {
      const res = await fetch(src);
      if (res.ok && !res.headers.get('content-type')?.includes('text/html')) {
        return await res.arrayBuffer();
      }
    } catch { /* continue */ }
  }
  return null;
}

/**
 * Load and validate a font file from public/fonts/.
 */
async function loadFont(path) {
  const cacheBuster = `?v=${Date.now()}`;
  const res = await fetch(`${path}${cacheBuster}`);
  if (!res.ok || res.headers.get('content-type')?.includes('text/html')) {
    throw new Error(`Failed to load font: ${path}`);
  }
  const bytes = await res.arrayBuffer();
  if (bytes.byteLength < 100) {
    throw new Error(`Font file is too small/empty: ${path}`);
  }
  return bytes;
}

/**
 * Draw a QR code onto the PDF page as filled rectangles.
 */
function drawQRCode(page, qrData, x, y, moduleSize, color) {
  const { matrix, size: qrSize } = qrData;
  for (let row = 0; row < qrSize; row++) {
    for (let col = 0; col < qrSize; col++) {
      if (matrix[row][col]) {
        page.drawRectangle({
          x: x + col * moduleSize,
          // PDF y-axis is bottom-up, QR rows go top-down
          y: y + (qrSize - 1 - row) * moduleSize,
          width: moduleSize,
          height: moduleSize,
          color,
        });
      }
    }
  }
}

/**
 * Generate a professional bilingual certificate PDF.
 * Colors, texts, and branding are pulled from Firestore template settings.
 * 
 * @param {Object} data Certificate data
 * @param {string} data.studentName Student's full name
 * @param {string} data.courseTitle Course name
 * @param {string} data.completionDate Completion date
 * @param {string} data.instructorName Instructor name
 * @param {string} data.certificateCode Unique certificate ID
 * @param {string} data.serialNumber Serial number (NMA-YYYYMMDD-XXXXX)
 * @param {string} data.verificationUrl Full verification URL for QR code
 * @param {string} data.issueDate Issue date
 * @param {Object} [templateSettings] Optional template settings (auto-fetched if missing)
 * @returns {Promise<Uint8Array>} PDF bytes
 */
export async function createCertificatePdf(data, templateSettings) {
  const {
    studentName,
    courseTitle,
    completionDate,
    instructorName,
    certificateCode,
    serialNumber,
    verificationUrl,
    issueDate
  } = data;

  // Fetch template settings from Firestore (cached) if not explicitly passed
  const ts = templateSettings || await getCertificateTemplateSettingsCached();

  // A4 Landscape: 841.89 x 595.28 points
  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);

  const page = pdfDoc.addPage([841.89, 595.28]);
  const { width, height } = page.getSize();

  // ── Color Palette (driven by template settings) ──
  const cream = rgb(0.97, 0.95, 0.91);
  const green = hexToRgb(ts.primaryColor);
  const greenLight = green;
  const gold = hexToRgb(ts.accentColor);
  const goldLight = rgb(0.92, 0.78, 0.35);
  const dark = rgb(0.15, 0.15, 0.15);
  const gray = rgb(0.5, 0.5, 0.5);
  const white = rgb(1, 1, 1);

  // ── Background ──
  page.drawRectangle({ x: 0, y: 0, width, height, color: cream });

  // ── Borders (conditional on settings) ──
  if (ts.borderEnabled !== false) {
    // Outer decorative border (dark green)
    page.drawRectangle({
      x: 12, y: 12, width: width - 24, height: height - 24,
      borderColor: green, borderWidth: 3,
    });

    // Inner decorative border (gold)
    page.drawRectangle({
      x: 22, y: 22, width: width - 44, height: height - 44,
      borderColor: gold, borderWidth: 1.5,
    });

    // Inner-inner thin border
    page.drawRectangle({
      x: 28, y: 28, width: width - 56, height: height - 56,
      borderColor: rgb(0.88, 0.85, 0.78), borderWidth: 0.5,
    });
  }

  // Top green accent bar
  page.drawRectangle({
    x: 22, y: height - 52, width: width - 44, height: 30,
    color: green,
  });

  // Bottom green accent bar
  page.drawRectangle({
    x: 22, y: 22, width: width - 44, height: 18,
    color: green,
  });

  // Corner decorative squares (gold accents at corners)
  const cornerSize = 15;
  const cornerInset = 28;
  for (const [cx, cy] of [
    [cornerInset, cornerInset],
    [cornerInset, height - cornerInset - cornerSize],
    [width - cornerInset - cornerSize, cornerInset],
    [width - cornerInset - cornerSize, height - cornerInset - cornerSize]
  ]) {
    page.drawRectangle({ x: cx, y: cy, width: cornerSize, height: cornerSize, color: gold });
  }

  // ── Load Fonts ──
  // Use STATIC fonts only (variable fonts break fontkit)
  const [cairoBoldBytes, cairoRegBytes, montserratBytes] = await Promise.all([
    loadFont('/fonts/Cairo-Regular.ttf'),     // Using Cairo-Regular as "bold" since it's the static version
    loadFont('/fonts/CAIROREG.TTF'),           // Cairo Regular static
    loadFont('/fonts/Montserrat-SemiBold.ttf') // Montserrat SemiBold static
  ]);

  const fontArBold = await pdfDoc.embedFont(cairoBoldBytes);
  const fontAr = await pdfDoc.embedFont(cairoRegBytes);
  const fontEn = await pdfDoc.embedFont(montserratBytes);

  // ── Helper: Draw centered text ──
  const drawCentered = (text, y, font, size, color) => {
    const w = font.widthOfTextAtSize(text, size);
    page.drawText(text, { x: (width - w) / 2, y, size, font, color });
  };

  // ── Helper: Draw right-aligned text ──
  const drawRight = (text, xRight, y, font, size, color) => {
    const w = font.widthOfTextAtSize(text, size);
    page.drawText(text, { x: xRight - w, y, size, font, color });
  };

  // ── Layout Y positions (top to bottom) ──
  let Y = height - 85;

  // ── 1. Logo ──
  try {
    const logoBytes = await fetchLogoBytes(ts.logoUrl);
    if (logoBytes) {
      const logoPng = await pdfDoc.embedPng(logoBytes);
      const logoScale = logoPng.scale(0.12);
      const logoW = Math.min(logoScale.width, 100);
      const logoH = Math.min(logoScale.height, 50);
      page.drawImage(logoPng, {
        x: (width - logoW) / 2,
        y: Y - 5,
        width: logoW,
        height: logoH
      });
      Y -= 55;
    }
  } catch { /* logo optional */ }

  // ── 2. Main Title ──
  drawCentered(prepareArabicText('شهادة إتمام'), Y, fontArBold, 38, green);
  Y -= 26;
  drawCentered(ts.titleEn || 'Certificate of Completion', Y, fontEn, 14, gold);

  // Decorative gold line under title
  Y -= 14;
  page.drawLine({
    start: { x: width / 2 - 120, y: Y },
    end: { x: width / 2 + 120, y: Y },
    thickness: 1.5, color: gold
  });
  // Small diamond at center of line
  const diamondY = Y;
  page.drawRectangle({
    x: width / 2 - 4, y: diamondY - 4, width: 8, height: 8,
    color: gold, rotate: { type: 'degrees', angle: 45 }
  });

  // ── 3. "Presented To" ──
  Y -= 32;
  drawCentered(prepareArabicText('تُمنح هذه الشهادة إلى'), Y, fontAr, 15, dark);
  Y -= 16;
  drawCentered('This certificate is presented to', Y, fontEn, 9, gray);

  // ── 4. Student Name ──
  Y -= 40;
  const nameText = studentName || 'اسم المتدرب';
  if (hasArabic(nameText)) {
    drawCentered(prepareArabicText(nameText), Y, fontArBold, 32, green);
  } else {
    drawCentered(nameText, Y, fontEn, 32, green);
  }

  // Underline decoration
  Y -= 10;
  const nameWidth = hasArabic(nameText)
    ? fontArBold.widthOfTextAtSize(prepareArabicText(nameText), 32)
    : fontEn.widthOfTextAtSize(nameText, 32);
  page.drawLine({
    start: { x: (width - nameWidth) / 2, y: Y },
    end: { x: (width + nameWidth) / 2, y: Y },
    thickness: 0.75, color: goldLight
  });

  // ── 5. Course Info ──
  Y -= 30;
  drawCentered(prepareArabicText('وذلك لإتمام دورة'), Y, fontAr, 13, dark);
  Y -= 15;
  drawCentered('For successfully completing the course', Y, fontEn, 8, gray);

  // ── 6. Course Title ──
  Y -= 32;
  const courseText = courseTitle || 'عنوان الدورة';
  if (hasArabic(courseText)) {
    drawCentered(prepareArabicText(courseText), Y, fontAr, 22, green);
  } else {
    drawCentered(courseText, Y, fontEn, 22, green);
  }

  // ── 7. Completion Date ──
  Y -= 30;
  const dateObj = new Date(completionDate || issueDate || Date.now());
  const dateAr = new Intl.DateTimeFormat('ar-EG', {
    year: 'numeric', month: 'long', day: 'numeric'
  }).format(dateObj);
  drawCentered(prepareArabicText('بتاريخ: ' + dateAr), Y, fontAr, 12, dark);

  Y -= 15;
  const dateEn = new Intl.DateTimeFormat('en-GB', {
    year: 'numeric', month: 'long', day: 'numeric'
  }).format(dateObj);
  drawCentered('Date: ' + dateEn, Y, fontEn, 8, gray);

  // ── 8. Instructor Signature Area (Right side) ──
  const instY = 105;
  drawRight(prepareArabicText('توقيع المحاضر'), width - 90, instY + 18, fontAr, 10, gray);
  page.drawLine({
    start: { x: width - 240, y: instY + 8 },
    end: { x: width - 80, y: instY + 8 },
    thickness: 0.75, color: dark
  });
  // Use instructor name from settings if signature is enabled
  const instName = (ts.signature?.enabled && ts.signature?.instructorName)
    ? ts.signature.instructorName
    : (instructorName || 'AgriVinka');
  if (hasArabic(instName)) {
    drawRight(prepareArabicText(instName), width - 90, instY - 12, fontArBold, 13, green);
  } else {
    drawRight(instName, width - 90, instY - 12, fontEn, 13, green);
  }

  // ── 9. Certificate ID & Serial (Left side) ──
  const idY = 105;
  const code = certificateCode || 'NMA-XXXX';
  const serial = serialNumber || code;

  page.drawText(prepareArabicText('رقم الشهادة:'), { x: 55, y: idY + 18, size: 9, font: fontAr, color: gray });
  page.drawText(code, { x: 55, y: idY + 4, size: 9, font: fontEn, color: dark });

  page.drawText(prepareArabicText('الرقم التسلسلي:'), { x: 55, y: idY - 14, size: 9, font: fontAr, color: gray });
  page.drawText(serial, { x: 55, y: idY - 28, size: 9, font: fontEn, color: dark });

  // ── 10. QR Code (Bottom-right, above the bottom bar) ──
  if (verificationUrl) {
    try {
      const qrData = generateQRMatrix(verificationUrl);
      const moduleSize = 2;
      const qrTotalSize = qrData.size * moduleSize;
      const qrX = width - 80 - qrTotalSize;
      const qrY = 48;

      // White background for QR
      page.drawRectangle({
        x: qrX - 4, y: qrY - 4,
        width: qrTotalSize + 8, height: qrTotalSize + 8,
        color: white,
        borderColor: rgb(0.9, 0.9, 0.9),
        borderWidth: 0.5
      });

      drawQRCode(page, qrData, qrX, qrY, moduleSize, dark);
    } catch (e) {
      console.warn('QR generation failed:', e.message);
    }
  }

  // ── 11. Bottom Accreditation Line ──
  drawCentered(prepareArabicText('شهادة معتمدة من AgriVinka'), 48, fontAr, 10, gold);
  drawCentered(ts.sealTextEn || 'Accredited by AgriVinka', 35, fontEn, 7, gray);

  // ── Top bar text ──
  drawCentered((ts.academyNameEn || 'AGRIVINKA').toUpperCase(), height - 44, fontEn, 9, white);

  // ── Return PDF ──
  return await pdfDoc.save();
}
