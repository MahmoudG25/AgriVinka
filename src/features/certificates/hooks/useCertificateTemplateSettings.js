import { useEffect, useState, useCallback } from "react";
import {
  DEFAULT_CERTIFICATE_TEMPLATE_SETTINGS,
  getCertificateTemplateSettings,
  updateCertificateTemplateSettings,
  resetCertificateTemplateSettings,
} from "../services/templateSettingsService.js";

export function useCertificateTemplateSettings() {
  const [settings, setSettings] = useState(
    DEFAULT_CERTIFICATE_TEMPLATE_SETTINGS,
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getCertificateTemplateSettings()
      .then((data) => !cancelled && setSettings(data))
      .catch((err) => {
        console.error("Failed to load certificate template settings", err);
        if (!cancelled) setError(err);
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const save = useCallback(async (partial) => {
    setSaving(true);
    setError(null);
    try {
      const next = await updateCertificateTemplateSettings(partial);
      setSettings(next);
      return next;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  const reset = useCallback(async () => {
    setSaving(true);
    setError(null);
    try {
      const next = await resetCertificateTemplateSettings();
      setSettings(next);
      return next;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setSaving(false);
    }
  }, []);

  return { settings, loading, saving, error, save, reset };
}
