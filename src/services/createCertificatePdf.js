import { PDFDocument, rgb } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import ArabicReshaper from 'arabic-persian-reshaper';
import bidiFactory from 'bidi-js';

const bidi = bidiFactory();

/**
 * Helper sequence to reshape and flip Arabic text for pdf-lib
 */
function prepareArabicText(text) {
  if (!text) return '';
  // 1. Reshape to connect characters
  const reshaped = ArabicReshaper.convertArabic(text);
  // 2. Reorder for RTL drawing
  const reordered = bidi.getReorderedString(reshaped, 'rtl');
  return reordered;
}

export async function createCertificatePdf(data) {
  const {
    studentName,
    courseTitle,
    completionDate,
    instructorName,
    certificateCode,
    issueDate
  } = data;

  // A4 Landscape is 841.89 x 595.28 points
  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);

  const page = pdfDoc.addPage([841.89, 595.28]);
  const { width, height } = page.getSize();

  // Draw background template
  try {
    // Vite dynamic import trick to get the asset URL or try fetching it
    // Usually, we can fetch from public or use a bundled asset. 
    // Assuming the user places it in public/certificates/cert-template.png or we bundled it.
    // For browser context, we'll try to fetch '/certificates/cert-template.png' first
    let templateRes = await fetch('/certificates/cert-template.png?v=2');
    if (!templateRes.ok || templateRes.headers.get('content-type')?.includes('text/html')) {
      // Fallback if not in public, try to find it in assets
      console.warn("Template not found in /certificates/, attempting fallback.");
      templateRes = await fetch('/assets/cert-template.png?v=2');
    }

    if (templateRes.ok && !templateRes.headers.get('content-type')?.includes('text/html')) {
      const imgBytes = await templateRes.arrayBuffer();
      const bgImage = await pdfDoc.embedPng(imgBytes);
      page.drawImage(bgImage, {
        x: 0, y: 0,
        width, height
      });
    } else {
      // Draw a fallback premium design if template is fully missing
      page.drawRectangle({
        x: 0, y: 0, width, height,
        color: rgb(0.96, 0.94, 0.90), // wheat base
      });
      // Frame
      page.drawRectangle({
        x: 20, y: 20, width: width - 40, height: height - 40,
        borderColor: rgb(0.1, 0.36, 0.12), // Deep academic green
        borderWidth: 4,
      });
      // Header Text fallback
      console.warn("No template PNG found. Using fallback draw.");
    }
  } catch (err) {
    console.error("Could not load template:", err);
  }

  // Load Fonts
  const [cairoBoldRes, cairoRegRes, montserratRes] = await Promise.all([
    fetch('/fonts/Cairo-Bold.ttf?v=2'),
    fetch('/fonts/Cairo-Regular.ttf?v=2'),
    fetch('/fonts/Montserrat-SemiBold.ttf?v=2')
  ]);

  const isValidResponse = (res) => res.ok && !res.headers.get('content-type')?.includes('text/html');

  if (!isValidResponse(cairoBoldRes) || !isValidResponse(cairoRegRes) || !isValidResponse(montserratRes)) {
    throw new Error('فشلت عملية تحميل الخطوط. الرجاء إعادة تشغيل السيرفر المحلي (npm run dev) ليتعرف على ملفات الخطوط الجديدة في مجلد public/fonts');
  }

  const [cairoBoldBytes, cairoRegBytes, montserratBytes] = await Promise.all([
    cairoBoldRes.arrayBuffer(),
    cairoRegRes.arrayBuffer(),
    montserratRes.arrayBuffer()
  ]);

  const fontArBold = await pdfDoc.embedFont(cairoBoldBytes);
  const fontArReg = await pdfDoc.embedFont(cairoRegBytes);
  const fontEn = await pdfDoc.embedFont(montserratBytes);

  // Helper to draw centered text
  const drawCenteredText = (text, y, font, size, color) => {
    const textWidth = font.widthOfTextAtSize(text, size);
    page.drawText(text, {
      x: (width - textWidth) / 2,
      y,
      size,
      font,
      color
    });
  };

  const primaryGreen = rgb(0.1, 0.36, 0.12);
  const darkGray = rgb(0.2, 0.2, 0.2);
  const secondaryGold = rgb(0.85, 0.65, 0.13); // Gold/Wheat accent

  // 1. Title Block
  const titleAr = prepareArabicText('شهادة إتمام');
  drawCenteredText(titleAr, height - 120, fontArBold, 48, primaryGreen);

  const titleEn = "Certificate of Completion";
  drawCenteredText(titleEn, height - 150, fontEn, 18, secondaryGold);

  // 2. Presented To
  const presentedToAr = prepareArabicText('تُمنح هذه الشهادة إلى');
  drawCenteredText(presentedToAr, height - 210, fontArReg, 20, darkGray);

  // 3. Student Name
  const studentAr = prepareArabicText(studentName || 'Student Name');
  // Usually student names can be large, around 40 pt
  drawCenteredText(studentAr, height - 270, fontArBold, 42, primaryGreen);

  // 4. Course info
  const courseContext = prepareArabicText('لإتمامه/ا بنجاح دورة:');
  drawCenteredText(courseContext, height - 330, fontArReg, 20, darkGray);

  const courseTitleAr = prepareArabicText(courseTitle || 'Course Title');
  drawCenteredText(courseTitleAr, height - 380, fontArBold, 28, primaryGreen);

  // 5. Completion Date
  const dateFormatted = new Intl.DateTimeFormat('ar-EG', {
    year: 'numeric', month: 'long', day: 'numeric'
  }).format(new Date(completionDate || issueDate || Date.now()));

  const dateStr = prepareArabicText(`بتاريخ: ${dateFormatted}`);
  drawCenteredText(dateStr, height - 420, fontArReg, 16, darkGray);

  // 6. Instructor Signature (Bottom Right - RTL context)
  // In RTL, "Bottom Right" visually means x near width - 200
  const instructorLabel = prepareArabicText('توقيع المحاضر');
  const instNameAr = prepareArabicText(instructorName);

  page.drawText(instructorLabel, {
    x: width - 200, y: 120, size: 14, font: fontArReg, color: darkGray
  });

  // Draw signature line
  page.drawLine({
    start: { x: width - 250, y: 100 },
    end: { x: width - 80, y: 100 },
    thickness: 1,
    color: darkGray
  });

  page.drawText(instNameAr, {
    x: width - 220, y: 70, size: 16, font: fontArBold, color: primaryGreen
  });

  // 7. Certificate ID & Issue Date (Bottom Left)
  const idLabel = prepareArabicText('رقم الشهادة:');
  const codeStr = certificateCode || 'NMA-XXXX-XXXX';
  page.drawText(idLabel, {
    x: 80, y: 120, size: 12, font: fontArReg, color: darkGray
  });
  page.drawText(codeStr, {
    x: 80, y: 100, size: 12, font: fontEn, color: darkGray
  });

  const issueLabel = prepareArabicText('تاريخ الإصدار:');
  page.drawText(issueLabel, {
    x: 80, y: 70, size: 12, font: fontArReg, color: darkGray
  });
  const issueDateStr = new Intl.DateTimeFormat('en-GB').format(new Date(issueDate || Date.now()));
  page.drawText(issueDateStr, {
    x: 80, y: 55, size: 12, font: fontEn, color: darkGray
  });

  // 8. Platform Name Center Bottom
  const platformName = prepareArabicText('أكاديمية نماء / Namaa Academy');
  drawCenteredText(platformName, 40, fontArBold, 14, secondaryGold);

  // Return PDF as Uint8Array
  const pdfBytes = await pdfDoc.save();
  return pdfBytes;
}
