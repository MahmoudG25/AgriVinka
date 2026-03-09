import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useAuth } from '../../../app/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { aiDiagnosisService, analyzePlantImage, PROVIDERS } from '../../../services/firestore/aiDiagnosisService';
import { compressImage } from '../../../features/plant-analyzer/services/imageUtils';
import DiagnosisDetailModal from './DiagnosisDetailModal';

/**
 * AIHistorySection — Full inline plant analyzer + paginated diagnosis history.
 * Placed in the dashboard sidebar. Replaces the old display-only component.
 */
const PAGE_SIZE = 4;

const AIHistorySection = ({ scans: initialScans = [], loading: dashboardLoading }) => {
  const { currentUser } = useAuth();
  const uid = currentUser?.uid;

  // --- Analyzer State ---
  const [selectedProvider, setSelectedProvider] = useState(PROVIDERS.OPENAI);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analysisError, setAnalysisError] = useState(null);
  const [savedConfirm, setSavedConfirm] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  // --- History State ---
  const [scans, setScans] = useState(initialScans);
  const [paginationCursor, setPaginationCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // --- Modal State ---
  const [selectedScan, setSelectedScan] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Sync initial dashboard scans
  useEffect(() => {
    if (initialScans.length > 0) {
      setScans(initialScans);
      setHasMore(initialScans.length >= PAGE_SIZE);
    }
  }, [initialScans]);

  // --- Image Handling ---
  const handleImageSelect = useCallback(async (file) => {
    if (!file || !uid) return;

    setAnalysisError(null);
    setAnalysisResult(null);
    setSavedConfirm(false);
    setIsAnalyzing(true);

    try {
      // Compress
      const compressed = await compressImage(file, 1024, 0.8);
      setImagePreview(`data:${compressed.mimeType};base64,${compressed.base64}`);

      // Analyze
      const result = await analyzePlantImage({
        provider: selectedProvider,
        base64: compressed.base64,
        mimeType: compressed.mimeType,
        language: 'ar'
      });

      setAnalysisResult(result);

      // Auto-save to Firestore
      try {
        await aiDiagnosisService.saveScanHistory(uid, {
          base64: compressed.base64,
          mimeType: compressed.mimeType
        }, selectedProvider, result);

        setSavedConfirm(true);
        setTimeout(() => setSavedConfirm(false), 3000);

        // Refresh history
        refreshHistory();
      } catch (saveErr) {
        console.error('Failed to save scan:', saveErr);
        // Result is still shown even if save fails
      }

    } catch (err) {
      console.error('Analysis failed:', err);
      setAnalysisError(err.message || 'فشل في تحليل الصورة. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsAnalyzing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (cameraInputRef.current) cameraInputRef.current.value = '';
    }
  }, [uid, selectedProvider]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleImageSelect(file);
  };

  // Drag & Drop
  const [isDragging, setIsDragging] = useState(false);
  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file?.type.startsWith('image/')) handleImageSelect(file);
  };

  // --- History ---
  const refreshHistory = async () => {
    if (!uid) return;
    try {
      const data = await aiDiagnosisService.getUserScans(uid, PAGE_SIZE);
      setScans(data.items);
      setPaginationCursor(data.lastDoc);
      setHasMore(data.hasMore);
    } catch (err) {
      console.error('Failed to refresh history:', err);
    }
  };

  const loadMore = async () => {
    if (!uid || !hasMore || loadingMore) return;
    setLoadingMore(true);
    try {
      const data = await aiDiagnosisService.getUserScans(uid, PAGE_SIZE, paginationCursor);
      setScans(prev => [...prev, ...data.items]);
      setPaginationCursor(data.lastDoc);
      setHasMore(data.hasMore);
    } catch (err) {
      console.error('Failed to load more:', err);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleDelete = async (scanId) => {
    if (!uid) return;
    try {
      await aiDiagnosisService.deleteScan(uid, scanId);
      setScans(prev => prev.filter(s => s.id !== scanId));
    } catch (err) {
      console.error('Failed to delete scan:', err);
    }
  };

  // --- Loading Skeleton ---
  if (dashboardLoading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-5">
        <div className="h-5 bg-gray-100 rounded w-40 mb-5" />
        <div className="space-y-3">
          {[1, 2].map(i => (
            <div key={i} className="animate-pulse flex gap-3 p-3 rounded-xl bg-gray-50">
              <div className="w-14 h-14 rounded-lg bg-gray-100 shrink-0" />
              <div className="flex-1 space-y-2 py-1">
                <div className="h-3 bg-gray-100 rounded w-3/4" />
                <div className="h-3 bg-gray-50 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // --- Not logged in (safety check) ---
  if (!uid) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center">
        <span className="material-symbols-outlined text-5xl text-gray-300 mb-3 block">lock</span>
        <p className="text-sm text-gray-500 mb-4">سجل الدخول لاستخدام فاحص النباتات الذكي</p>
        <Link to="/login" className="btn btn-primary text-sm">تسجيل الدخول</Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

      {/* ===== Section Header ===== */}
      <div className="flex items-center justify-between px-5 pt-5 pb-3">
        <h2 className="text-base font-black text-heading-dark flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-xl">psychiatry</span>
          فاحص النباتات الذكي
        </h2>
        <Link
          to="/analyzer"
          className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1"
        >
          صفحة كاملة <span className="material-symbols-outlined text-xs rtl:rotate-180">arrow_forward</span>
        </Link>
      </div>

      {/* ===== Inline Analyzer ===== */}
      <div className="px-5 pb-4 space-y-3">
        {/* Provider Selector */}
        <div className="flex items-center gap-2">
          <select
            value={selectedProvider}
            onChange={(e) => setSelectedProvider(e.target.value)}
            disabled={isAnalyzing}
            className="flex-1 appearance-none bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-bold text-heading-dark focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-50"
          >
            <option value={PROVIDERS.OPENAI}>GPT-4o</option>
            <option value={PROVIDERS.GEMINI}>Gemini</option>
            <option value={PROVIDERS.GROK}>Grok</option>
          </select>
        </div>

        {/* Drop Zone / Buttons */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-2xl transition-all cursor-pointer ${isDragging ? 'border-primary bg-primary/5 scale-[1.01]' :
            isAnalyzing ? 'border-gray-200 bg-gray-50 opacity-70' :
              'border-gray-200 hover:border-primary/30 bg-gray-50/50'
            }`}
        >
          {/* Hidden inputs */}
          <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
          <input type="file" accept="image/*" capture="environment" ref={cameraInputRef} onChange={handleFileChange} className="hidden" />

          {isAnalyzing ? (
            /* Loading State */
            <div className="flex flex-col items-center justify-center py-8 gap-3">
              <div className="relative w-16 h-16">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                  className="absolute inset-0 border-3 border-dashed border-primary/30 rounded-full"
                />
                <div className="absolute inset-2 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-2xl">psychology</span>
                </div>
              </div>
              <p className="text-xs font-bold text-gray-500">يجري تحليل الصورة...</p>
            </div>
          ) : (
            /* Upload Area */
            <div className="flex flex-col items-center justify-center py-6 gap-3">
              <span className="material-symbols-outlined text-3xl text-gray-300">add_photo_alternate</span>
              <p className="text-xs text-gray-400 font-medium text-center">اسحب صورة هنا أو اختر من الأسفل</p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => cameraInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-hover transition-colors shadow-sm"
                >
                  <span className="material-symbols-outlined text-sm">photo_camera</span>
                  كاميرا
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-1.5 px-4 py-2 bg-gray-100 text-heading-dark text-xs font-bold rounded-xl hover:bg-gray-200 transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">imagesmode</span>
                  ملف
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Error */}
        {analysisError && (
          <div className="flex items-start gap-2 p-3 bg-red-50 rounded-xl border border-red-100 text-red-600">
            <span className="material-symbols-outlined text-sm shrink-0 mt-0.5">error</span>
            <div>
              <p className="text-xs font-medium">{analysisError}</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-xs font-bold text-red-500 hover:text-red-700 mt-1 underline"
              >
                حاول مرة أخرى
              </button>
            </div>
          </div>
        )}

        {/* Inline Result */}
        <AnimatePresence>
          {analysisResult && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-primary/5 border border-primary/10 rounded-2xl p-4 space-y-3"
            >
              {/* Image preview */}
              {imagePreview && (
                <div className="w-full h-32 rounded-xl overflow-hidden">
                  <img src={imagePreview} alt="صورة التحليل" className="w-full h-full object-cover" />
                </div>
              )}

              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-black text-sm text-heading-dark">{analysisResult.diagnosis}</h4>
                  <p className="text-[10px] text-gray-500 mt-0.5">
                    ثقة: <span className="font-bold">{analysisResult.confidence}</span>
                  </p>
                </div>
                {savedConfirm && (
                  <span className="flex items-center gap-1 text-[10px] text-green-600 font-bold bg-green-50 px-2 py-1 rounded-full">
                    <span className="material-symbols-outlined text-xs">check_circle</span>
                    تم الحفظ
                  </span>
                )}
              </div>

              {/* Quick causes */}
              {analysisResult.causes?.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-gray-400 mb-1">الأسباب:</p>
                  <ul className="space-y-1">
                    {analysisResult.causes.slice(0, 2).map((c, i) => (
                      <li key={i} className="text-xs text-gray-600 flex items-start gap-1.5">
                        <span className="w-1 h-1 mt-1.5 bg-red-400 rounded-full shrink-0"></span>
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Quick care steps */}
              {analysisResult.careSteps?.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-gray-400 mb-1">العلاج:</p>
                  <ul className="space-y-1">
                    {analysisResult.careSteps.slice(0, 2).map((s, i) => (
                      <li key={i} className="text-xs text-gray-600 flex items-start gap-1.5">
                        <span className="w-4 h-4 bg-green-100 text-green-700 rounded-full flex items-center justify-center text-[9px] font-black shrink-0">{i + 1}</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <Link
                to="/analyzer"
                className="block text-center text-[10px] font-bold text-primary hover:underline pt-1"
              >
                عرض التحليل الكامل ←
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ===== Diagnosis History ===== */}
      <div className="border-t border-gray-100 px-5 py-4">
        <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider mb-3">سجل التشخيصات السابقة</h3>

        {scans.length > 0 ? (
          <div className="space-y-2">
            {scans.map(scan => (
              <button
                key={scan.id}
                onClick={() => { setSelectedScan(scan); setModalOpen(true); }}
                className="w-full group flex gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50/50 hover:border-primary/20 hover:bg-primary/5 transition-all text-right"
              >
                <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-gray-200">
                  <img
                    src={scan.imageUrl || 'https://placehold.co/100x100?text=🌿'}
                    alt="صورة الفحص"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    loading="lazy"
                  />
                </div>
                <div className="flex flex-col flex-1 justify-center min-w-0">
                  <h4 className="font-bold text-xs text-heading-dark truncate">
                    {scan.result?.diagnosis || scan.prediction?.name || 'تشخيص'}
                  </h4>
                  <div className="flex items-center gap-2 text-[10px] mt-1">
                    <span className={`px-1.5 py-0.5 rounded-full font-bold ${scan.prediction?.severity === 'high' ? 'bg-red-100 text-red-700' :
                      scan.prediction?.severity === 'medium' ? 'bg-amber-100 text-amber-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                      {scan.result?.confidence || `${Math.round((scan.prediction?.confidence || 0) * 100)}%`}
                    </span>
                    <span className="text-gray-400" dir="ltr">
                      {scan.timestamp?.seconds
                        ? new Date(scan.timestamp.seconds * 1000).toLocaleDateString('ar-EG')
                        : 'الآن'}
                    </span>
                  </div>
                </div>
                <span className="material-symbols-outlined text-gray-300 group-hover:text-primary text-sm self-center transition-colors rtl:rotate-180">
                  chevron_right
                </span>
              </button>
            ))}

            {/* Load More */}
            {hasMore && (
              <button
                onClick={loadMore}
                disabled={loadingMore}
                className="w-full text-center py-2.5 text-xs font-bold text-primary hover:bg-primary/5 rounded-xl transition-colors disabled:opacity-50"
              >
                {loadingMore ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                    جاري التحميل...
                  </span>
                ) : (
                  'تحميل المزيد'
                )}
              </button>
            )}
          </div>
        ) : (
          <div className="py-8 text-center">
            <span className="material-symbols-outlined text-3xl text-gray-200 mb-2 block">biotech</span>
            <p className="text-xs text-gray-400 font-medium">لا توجد تشخيصات سابقة</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <DiagnosisDetailModal
        scan={selectedScan}
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setSelectedScan(null); }}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default AIHistorySection;
