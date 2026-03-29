import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../app/contexts/AuthContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

const DEFAULT_SETTINGS = {
  assistantEnabled: true,
  maxDailyMessages: 50,
  imageAnalysisEnabled: true,
  voiceInputEnabled: true,
  voiceOutputEnabled: true,
};

export const useAiSettings = () => {
  const { currentUser, userData } = useAuth();
  const [globalSettings, setGlobalSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    if (!currentUser) {
      setGlobalSettings(DEFAULT_SETTINGS);
      setLoading(false);
      return;
    }
    try {
      const snap = await getDoc(doc(db, 'ai_settings', 'global'));
      setGlobalSettings(snap.exists() ? snap.data() : DEFAULT_SETTINGS);
    } catch {
      // Permission error (non-admin) or network: fall back to defaults so the UI works
      setGlobalSettings(DEFAULT_SETTINGS);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  // ── Per-user derived values ─────────────────────────────────────────────────
  const userAiBlocked   = userData?.aiEnabled === false;
  const userUsageCount  = userData?.aiUsageCount ?? 0;
  const userLimitOverride = userData?.aiLimitOverride ?? null;
  const effectiveLimit  = userLimitOverride ?? globalSettings?.maxDailyMessages ?? 50;

  // ── Feature flags ────────────────────────────────────────────────────────────
  const assistantGloballyEnabled = globalSettings?.assistantEnabled !== false;
  const imageEnabled  = globalSettings?.imageAnalysisEnabled !== false;
  const voiceInEnabled  = globalSettings?.voiceInputEnabled !== false;
  const voiceOutEnabled = globalSettings?.voiceOutputEnabled !== false;

  // TRUE if the user can use the assistant at all
  const isAssistantEnabled = assistantGloballyEnabled && !userAiBlocked;
  const isLimitReached     = userUsageCount >= effectiveLimit;

  /**
   * Returns a reason string why a message cannot be sent, or null if allowed.
   * @param {boolean} hasImage – whether the user is trying to send an image
   * @param {boolean} isVoice  – whether the user triggered via voice input
   */
  const getBlockReason = (hasImage = false, isVoice = false) => {
    if (!assistantGloballyEnabled) {
      return 'المساعد الذكي متوقف مؤقتاً من قِبل الإدارة. يرجى المحاولة لاحقاً.';
    }
    if (userAiBlocked) {
      return 'تم تعطيل المساعد الذكي لحسابك. يرجى التواصل مع فريق الدعم.';
    }
    if (isLimitReached) {
      return `لقد وصلت إلى الحد الأقصى (${effectiveLimit} رسالة). يمكنك التواصل مع الدعم لرفع الحد أو الانتظار حتى تتم إعادة ضبطه.`;
    }
    if (hasImage && !imageEnabled) {
      return 'ميزة تحليل الصور معطّلة حالياً. يرجى إرسال سؤالك كنص.';
    }
    if (isVoice && !voiceInEnabled) {
      return 'ميزة الإدخال الصوتي معطّلة حالياً. يرجى الكتابة يدوياً.';
    }
    return null;
  };

  return {
    globalSettings,
    loading,
    isAssistantEnabled,
    isLimitReached,
    imageEnabled,
    voiceInEnabled,
    voiceOutEnabled,
    effectiveLimit,
    userUsageCount,
    getBlockReason,
    refetch: fetchSettings,
  };
};
