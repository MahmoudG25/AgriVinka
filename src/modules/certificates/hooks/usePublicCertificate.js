import { useEffect, useState } from 'react';
import { getPublicCertificateById } from '../services/certificateService.js';

/**
 * Hook for the public verification page.
 *
 * @param {string | undefined} id
 */
export function usePublicCertificate(id) {
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(!!id);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    let cancelled = false;
    setLoading(true);
    setError(null);

    getPublicCertificateById(id)
      .then((data) => {
        if (cancelled) return;
        if (!data) {
          setError('لم يتم العثور على شهادة بهذا الرمز.');
          setCertificate(null);
        } else {
          setCertificate(data);
        }
      })
      .catch((err) => {
        if (cancelled) return;
        console.error('Error loading certificate', err);
        setError('تعذّر التحقق من الشهادة حالياً. حاول مرة أخرى لاحقاً.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  return { certificate, loading, error };
}

