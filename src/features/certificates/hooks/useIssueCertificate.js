import { useCallback, useState } from 'react';
import { getOrCreateCertificate } from '../services/certificateService.js';
import { downloadCertificatePdf } from '../services/pdfService.js';

/**
 * Hook to issue (or fetch existing) certificate for a user/course
 * and immediately download the PDF.
 *
 * @returns {{ issueAndDownload: (args: { userId: string; courseId: string; studentName: string; courseName: string; instructorName: string }) => Promise<import('../types').Certificate | null>, isLoading: boolean, error: Error | null }}
 */
export function useIssueCertificate() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const issueAndDownload = useCallback(async (args) => {
    setIsLoading(true);
    setError(null);
    try {
      const certificate = await getOrCreateCertificate(args);
      await downloadCertificatePdf(certificate);
      return certificate;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { issueAndDownload, isLoading, error };
}

