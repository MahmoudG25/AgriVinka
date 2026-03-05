import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../firebase/config';

const SETTINGS_DOC_REF = doc(db, 'settings', 'certificateTemplate');

/** Default, safe template settings (used when Firestore doc missing/partial). */
export const DEFAULT_CERTIFICATE_TEMPLATE_SETTINGS = {
  academyNameEn: 'AgriVinka',
  academyNameAr: 'AgriVinka',
  logoUrl: '',
  siteLogoUrl: '',
  primaryColor: '#0f3b1c',
  accentColor: '#c9a646',
  borderEnabled: true,
  titleEn: 'Certificate of Completion',
  subtitleEn: 'This certifies the successful completion of a course',
  sealTextEn: 'Accredited by AgriVinka',
  footerTextEn: 'Verify at: agrivinka.com/verify',
  signature: {
    enabled: true,
    instructorName: 'AgriVinka',
    signatureImageUrl: '',
  },
  watermark: {
    enabled: true,
    type: 'text',
    text: 'NAMAA ACADEMY',
    imageUrl: '',
  },
  templateVersion: 'v1',
};

let cachedSettings = null;
let fetchPromise = null;

/** Merge Firestore data with defaults (deep-ish merge for nested objects). */
function mergeWithDefaults(data) {
  const s = data || {};
  return {
    ...DEFAULT_CERTIFICATE_TEMPLATE_SETTINGS,
    ...s,
    signature: {
      ...DEFAULT_CERTIFICATE_TEMPLATE_SETTINGS.signature,
      ...(s.signature || {}),
    },
    watermark: {
      ...DEFAULT_CERTIFICATE_TEMPLATE_SETTINGS.watermark,
      ...(s.watermark || {}),
    },
  };
}

export async function getCertificateTemplateSettings() {
  const snap = await getDoc(SETTINGS_DOC_REF);
  if (!snap.exists()) return mergeWithDefaults(null);
  return mergeWithDefaults(snap.data());
}

/** Cached getter used by PDF generator (no React). */
export async function getCertificateTemplateSettingsCached() {
  if (cachedSettings) return cachedSettings;
  if (fetchPromise) return fetchPromise;
  fetchPromise = getCertificateTemplateSettings()
    .then((s) => {
      cachedSettings = s;
      return s;
    })
    .finally(() => {
      fetchPromise = null;
    });
  return fetchPromise;
}

/** Admin: update settings (partial, merged server-side). */
export async function updateCertificateTemplateSettings(partial) {
  const current = await getCertificateTemplateSettings();
  const next = mergeWithDefaults({ ...current, ...partial });
  await setDoc(SETTINGS_DOC_REF, {
    ...next,
    updatedAt: serverTimestamp(),
  });
  cachedSettings = next;
  return next;
}

/** Admin: reset Firestore doc to exact defaults. */
export async function resetCertificateTemplateSettings() {
  const next = {
    ...DEFAULT_CERTIFICATE_TEMPLATE_SETTINGS,
    updatedAt: serverTimestamp(),
  };
  await setDoc(SETTINGS_DOC_REF, next);
  cachedSettings = next;
  return next;
}