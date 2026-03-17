import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PROVIDERS } from '../services/analysisService';
import { compressImage } from '../services/imageUtils';

const CaptureScreen = ({ onAnalyze }) => {
  const [selectedProvider, setSelectedProvider] = useState(PROVIDERS.OPENAI);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [errorItem, setError] = useState(null);

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const handleProviderChange = (e) => setSelectedProvider(e.target.value);

  const processFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError("الرجاء اختيار ملف صورة صحيح (JPG, PNG, إلخ).");
      return;
    }
    setError(null);
    setIsProcessingFile(true);

    try {
      const compressed = await compressImage(file, 1024, 0.8);

      setSelectedImage({
        file,
        previewUrl: `data:${compressed.mimeType};base64,${compressed.base64}`,
        base64: compressed.base64,
        mimeType: compressed.mimeType
      });
    } catch (err) {
      console.error(err);
      setError("فشلت معالجة الصورة. يرجى المحاولة بصورة أخرى.");
    } finally {
      setIsProcessingFile(false);
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    // Reset inputs so user can select the same file again if they cancel
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const clearImage = () => {
    setSelectedImage(null);
    setError(null);
  };

  const handleStartAnalysis = () => {
    if (!selectedImage) return;
    onAnalyze({
      provider: selectedProvider,
      base64: selectedImage.base64,
      mimeType: selectedImage.mimeType
    });
  };

  // Drag & Drop handlers
  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  }, []);

  return (
    <div className="w-full relative">
      {/* Hidden Inputs */}
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleImageSelect}
        className="hidden"
      />
      <input
        type="file"
        accept="image/*"
        capture="environment"
        ref={cameraInputRef}
        onChange={handleImageSelect}
        className="hidden"
      />

      {/* Hero Section */}
      <div className="text-center space-y-4 mb-10">
        <div className="mx-auto w-16 h-16 bg-[#16a34a] rounded-[1.5rem] flex items-center justify-center text-white shadow-lg shadow-green-500/20 mb-6 relative">
          <div className="absolute inset-0 bg-white/20 rounded-[1.5rem] rotate-6"></div>
          <span className="material-symbols-outlined text-3xl shrink-0 relative z-10">psychiatry</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">فاحص أمراض النبات بالذكاء الاصطناعي</h1>
        <p className="text-gray-500 max-w-lg mx-auto leading-relaxed text-sm md:text-base">
          قم برفع صورة لورقة النبات وسيقوم الذكاء الاصطناعي بتحليلها وتشخيص المرض واقتراح العلاج المناسب.
        </p>
      </div>

      {/* AI Engine Selector */}
      <div className="bg-white rounded-[1.5rem] p-4 shadow-sm border border-gray-100 max-w-xl mx-auto mb-8 relative z-10 transition-all hover:border-green-500/30 hover:shadow-md">
        <label className="block text-[11px] font-bold text-gray-400 mb-2 px-2 uppercase tracking-wide">
          اختر محرك الذكاء الاصطناعي
        </label>
        <div className="relative">
          <select
            value={selectedProvider}
            onChange={handleProviderChange}
            className="w-full appearance-none bg-gray-50 border border-gray-100 rounded-xl px-4 py-3.5 text-sm font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all cursor-pointer"
          >
            <option value={PROVIDERS.OPENAI}>GPT-4o (الأكثر دقة)</option>
            <option value={PROVIDERS.GEMINI}>Google Gemini (سريع ومجاني)</option>
            <option value={PROVIDERS.GROK}>xAI Grok (تجريبي)</option>
          </select>
          <div className="absolute inset-y-0 left-0 flex items-center px-4 pointer-events-none text-green-600">
            <span className="material-symbols-outlined text-xl">expand_more</span>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {errorItem && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="max-w-xl mx-auto mb-6"
          >
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 flex items-start gap-3">
              <span className="material-symbols-outlined text-xl mt-0.5">error</span>
              <p className="text-sm font-medium">{errorItem}</p>
            </div>
          </motion.div>
        </AnimatePresence>
      )}

      {/* Main Interaction Area */}
      <AnimatePresence mode="wait">
        {!selectedImage ? (
          <motion.div
            key="upload"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`max-w-2xl mx-auto rounded-3xl transition-all duration-300 relative ${isDragging ? 'scale-[1.02]' : ''}`}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-10">
              {/* Active Drop Overlay */}
              <AnimatePresence>
                {isDragging && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute -inset-4 z-20 bg-[#16a34a]/10 border-2 border-dashed border-[#16a34a] rounded-[2.5rem] backdrop-blur-sm flex items-center justify-center pointer-events-none"
                  >
                    <div className="bg-white p-6 rounded-2xl shadow-xl flex flex-col items-center">
                      <span className="material-symbols-outlined text-5xl text-[#16a34a] mb-2 animate-bounce">cloud_upload</span>
                      <span className="font-bold text-gray-800">أفلت الصورة هنا</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Camera Button (Right per Arabic layout) */}
              {/* Notice using order-last or flex to respect RTL, grid naturally puts first item on right in RTL */}
              <button
                onClick={() => cameraInputRef.current?.click()}
                disabled={isProcessingFile}
                className="group flex flex-col items-center justify-center gap-4 p-10 bg-[#0f9d58] text-white rounded-[2rem] shadow-[0_15px_30px_-10px_rgba(15,157,88,0.5)] hover:-translate-y-1 hover:shadow-[0_25px_40px_-10px_rgba(15,157,88,0.6)] active:scale-95 transition-all w-full min-h-[220px] disabled:opacity-70 disabled:cursor-wait relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform relative z-10 backdrop-blur-sm">
                  <span className="material-symbols-outlined text-3xl">photo_camera</span>
                </div>
                <div className="text-center relative z-10">
                  <span className="block font-black text-xl mb-1">التقاط صورة</span>
                  <span className="text-xs text-white/80 font-medium">استخدم كاميرا الهاتف</span>
                </div>
              </button>

              {/* Gallery Button (Left per Arabic layout) */}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessingFile}
                className="group flex flex-col items-center justify-center gap-4 p-10 bg-white text-gray-700 rounded-[2rem] border-2 border-dashed border-gray-200 hover:border-[#0f9d58]/50 hover:bg-[#0f9d58]/5 hover:-translate-y-1 active:scale-95 transition-all w-full min-h-[220px] disabled:opacity-70 disabled:cursor-wait shadow-sm"
              >
                <div className="w-16 h-16 bg-gray-50 text-gray-400 rounded-2xl flex items-center justify-center group-hover:bg-[#0f9d58]/10 group-hover:text-[#0f9d58] transition-colors">
                  <span className="material-symbols-outlined text-3xl">imagesmode</span>
                </div>
                <div className="text-center">
                  <span className="block font-black text-xl mb-1 text-gray-800">رفع من الاستوديو</span>
                  <span className="text-xs text-gray-500 font-medium">اختر صورة مخزنة</span>
                </div>
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="max-w-xl mx-auto"
          >
            <div className="bg-white p-6 md:p-8 rounded-[2rem] shadow-[0_20px_50px_-20px_rgba(0,0,0,0.1)] border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-800">معاينة الصورة</h3>
                <span className="text-xs text-green-600 font-bold bg-green-50 px-3 py-1 rounded-full">جاهزة للتحليل</span>
              </div>

              <div className="relative w-full aspect-square sm:aspect-[4/3] bg-gray-100 rounded-2xl overflow-hidden mb-8 group">
                <img src={selectedImage.previewUrl} alt="Preview" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                  <button
                    onClick={clearImage}
                    className="bg-white/20 hover:bg-red-500 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110 backdrop-blur-md"
                    title="حذف الصورة"
                  >
                    <span className="material-symbols-outlined text-2xl">delete</span>
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={clearImage}
                  className="px-6 py-4 rounded-xl text-gray-500 font-bold hover:bg-gray-100 transition-colors sm:w-1/3 flex items-center justify-center gap-2 border border-transparent hover:border-gray-200"
                >
                  إلغاء
                </button>
                <button
                  onClick={handleStartAnalysis}
                  className="px-6 py-4 rounded-xl bg-[#0f9d58] text-white font-black hover:bg-[#0b8a4b] hover:shadow-lg shadow-[#0f9d58]/30 transition-all flex-1 flex items-center justify-center gap-3 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 w-full h-full bg-white/20 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] skew-x-12"></div>
                  <span className="material-symbols-outlined text-xl">psychiatry</span>
                  <span className="text-lg">تحليل الصورة</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global CSS for shimmer effect if needed */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}} />
    </div>
  );
};

export default CaptureScreen;
