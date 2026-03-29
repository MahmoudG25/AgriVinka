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
    <div className="bg-[#1f2937] text-white rounded-[2rem] shadow-sm overflow-hidden relative p-8 md:p-10 mb-6">
      <div className="absolute inset-0 pointer-events-none opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 0% 100%, #10b981 0%, transparent 70%)' }} />

      <div className="relative z-10 flex flex-col items-start max-w-lg">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-white">psychiatry</span>
          </div>
          <h2 className="text-xl font-black text-white">محلل أمراض النبات الذكي</h2>
        </div>

        <p className="text-sm text-gray-300 font-medium leading-relaxed mb-8 max-w-sm">
          التقط صورة لنباتك المصاب وسيقوم الذكاء الاصطناعي بتشخيص الحالة واقتراح العلاج المناسب فوراً.
        </p>

        {/* Hidden inputs */}
        <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
        <input type="file" accept="image/*" capture="environment" ref={cameraInputRef} onChange={handleFileChange} className="hidden" />

        <div className="flex flex-wrap items-center gap-4">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isAnalyzing}
            className="flex items-center gap-2 px-6 py-2.5 bg-white text-heading-dark font-bold rounded-xl text-sm hover:bg-gray-50 transition-colors"
          >
            {isAnalyzing ? (
              <span className="material-symbols-outlined animate-spin text-base">progress_activity</span>
            ) : (
              <span className="material-symbols-outlined text-base">cloud_upload</span>
            )}
            {isAnalyzing ? 'جاري التحليل...' : 'تحميل صورة'}
          </button>
          
          <Link
            to="/analyzer"
            className="flex items-center gap-2 px-6 py-2.5 bg-white/10 text-white font-bold rounded-xl text-sm hover:bg-white/20 transition-colors border border-white/10 backdrop-blur-sm"
          >
            <span className="material-symbols-outlined text-base">history</span>
            سجل التشخيصات
          </Link>
        </div>

        {/* Error */}
        {analysisError && (
          <div className="mt-4 flex items-start gap-2 p-3 bg-red-500/20 rounded-xl border border-red-500/30 text-red-200">
            <span className="material-symbols-outlined text-sm shrink-0 mt-0.5">error</span>
            <div>
              <p className="text-xs font-medium">{analysisError}</p>
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
              className="mt-6 w-full bg-black/30 border border-white/10 rounded-2xl p-4 space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="font-black text-sm text-green-400">{analysisResult.diagnosis}</h4>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    ثقة: <span className="font-bold text-white">{analysisResult.confidence}</span>
                  </p>
                </div>
                {savedConfirm && (
                  <span className="flex items-center gap-1 text-[10px] text-green-400 font-bold bg-green-900/40 px-2 py-1 rounded-full">
                    <span className="material-symbols-outlined text-xs">check_circle</span>
                    تم الحفظ
                  </span>
                )}
              </div>

              {analysisResult.careSteps?.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold text-gray-500 mb-1">العلاج:</p>
                  <ul className="space-y-1">
                    {analysisResult.careSteps.slice(0, 2).map((s, i) => (
                      <li key={i} className="text-xs text-gray-300 flex items-start gap-1.5">
                        <span className="w-4 h-4 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center text-[9px] font-black shrink-0">{i + 1}</span>
                        {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
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

export default React.memo(AIHistorySection);
