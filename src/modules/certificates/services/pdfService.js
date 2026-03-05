import React from 'react';
import { pdf } from '@react-pdf/renderer';
import CertificateDocument from '../pdf/CertificateDocument.jsx';
import { getCertificateTemplateSettingsCached } from '../services/templateSettingsService.js';

// Small sanity check only; most valid PDFs will be much larger,
// but we keep this low to avoid blocking downloads in edge cases.
const MIN_PDF_SIZE_BYTES = 1024;

/**
 * Generate a Blob for a certificate PDF.
 * This is the client-side implementation that can later be swapped
 * with a server-side generator without changing callers.
 *
 * @param {import('../types').Certificate} certificate
 * @returns {Promise<Blob>}
 */
export async function generateCertificatePdfBlob(certificate) {
  // Fetch template settings (cached after first call)
  const templateSettings = await getCertificateTemplateSettingsCached();

  const instance = pdf(
    React.createElement(CertificateDocument, { certificate, templateSettings })
  );
  const blob = await instance.toBlob();

  if (!blob || typeof blob.size !== 'number') {
    throw new Error('فشل إنشاء ملف الشهادة PDF.');
  }

  if (blob.size < MIN_PDF_SIZE_BYTES) {
    // Log a warning but still return the blob so the user can try to open it.
    // This avoids breaking the UX if the PDF is valid but very small.
    // eslint-disable-next-line no-console
    console.warn('Certificate PDF blob size is unusually small:', blob.size);
  }

  return blob;
}

/**
 * Generate a sensible filename for a certificate PDF.
 *
 * @param {import('../types').Certificate} certificate
 */
export function getCertificateFilename(certificate) {
  const serial = certificate.serialNumber || certificate.id || 'certificate';
  return `Namaa-Certificate-${serial}.pdf`;
}

/**
 * Generate and immediately trigger a download of the certificate PDF.
 *
 * @param {import('../types').Certificate} certificate
 */
export async function downloadCertificatePdf(certificate) {
  const blob = await generateCertificatePdfBlob(certificate);
  const filename = getCertificateFilename(certificate);

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  return blob;
}

/**
 * Interface kept for future server-side implementation.
 * For now it simply delegates to the client-side generator.
 *
 * @param {string} certificateId
 * @param {() => Promise<import('../types').Certificate>} loader
 * @returns {Promise<{ blob: Blob }>}
 */
export async function generateCertificatePdf(certificateId, loader) {
  const cert = await loader();
  if (!cert || cert.id !== certificateId) {
    throw new Error('Certificate not found for PDF generation.');
  }
  const blob = await generateCertificatePdfBlob(cert);
  return { blob };
}

