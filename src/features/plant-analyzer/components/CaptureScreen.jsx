import React, { useState, useRef } from 'react';
import { PROVIDERS } from '../services/analysisService';
import { compressImage } from '../services/imageUtils';

const CaptureScreen = ({ onAnalyze }) => {
  const [selectedProvider, setSelectedProvider] = useState(PROVIDERS.OPENAI);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorItem, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleProviderChange = (e) => {
    setSelectedProvider(e.target.value);
  };

  const handleImageCapture = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setError(null);

    try {
      // 1. Compress Image (Max 1024px, 80% quality)
      const compressed = await compressImage(file, 1024, 0.8);

      console.log(`Image Size Optimization: 
        Original: ${(compressed.originalSize / 1024).toFixed(2)} KB
        Optimized: ${(compressed.newSize / 1024).toFixed(2)} KB
      `);

      // 2. Pass to parent
      await onAnalyze({
        provider: selectedProvider,
        base64: compressed.base64,
        mimeType: compressed.mimeType
      });

    } catch (err) {
      console.error(err);
      setError("فشلت معالجة الصورة. يرجى المحاولة بصورة أخرى.");
    } finally {
      setIsProcessing(false);
      // Reset input incase they select the identical file again
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full space-y-10">
      {/* Intro */}
      <div className="text-center space-y-4">
        <div className="relative inline-flex items-center justify-center w-20 h-20 mb-2">
          <div className="absolute inset-0 bg-primary/20 rounded-[2rem] rotate-6 animate-pulse"></div>
          <div className="relative w-full h-full bg-gradient-to-br from-primary to-secondary text-white rounded-[1.5rem] flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined text-4xl">psychiatry</span>
          </div>
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-heading-dark tracking-tight">فاحص أمراض النبات</h1>
        <p className="text-gray-500 max-w-md mx-auto leading-relaxed text-lg">التقط صورة لورقة النبات المصابة وسيقوم الذكاء الاصطناعي بتشخيص الحالة واقتراح العلاج.</p>
      </div>

      {/* Provider Selector */}
      <div className="bg-white/50 backdrop-blur-sm p-6 rounded-3xl shadow-sm border border-gray-100/50 group hover:border-primary/20 transition-all">
        <label className="block text-sm font-black text-heading-dark/70 mb-3 px-1 uppercase tracking-wider">اختر محرك الذكاء الاصطناعي</label>
        <div className="relative">
          <select
            value={selectedProvider}
            onChange={handleProviderChange}
            disabled={isProcessing}
            className="w-full appearance-none bg-white border-2 border-transparent rounded-2xl px-5 py-4 text-base font-bold text-heading-dark shadow-sm ring-1 ring-gray-100 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary disabled:opacity-50 transition-all cursor-pointer"
          >
            <option value={PROVIDERS.OPENAI}>GPT-4o (الأكثر دقة)</option>
            <option value={PROVIDERS.GEMINI}>Google Gemini (سريع)</option>
            <option value={PROVIDERS.GROK}>xAI Grok (تجريبي)</option>
          </select>
          <div className="absolute inset-y-0 left-0 flex items-center px-5 pointer-events-none text-primary">
            <span className="material-symbols-outlined text-2xl">expand_more</span>
          </div>
        </div>
      </div>

      {/* Error Output */}
      {errorItem && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm font-medium border border-red-100 flex items-start gap-2">
          <span className="material-symbols-outlined text-lg shrink-0">error</span>
          <p>{errorItem}</p>
        </div>
      )}

      {/* Capture Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Hidden File Input */}
        <input
          type="file"
          accept="image/*"
          capture="environment"
          ref={fileInputRef}
          onChange={handleImageCapture}
          className="hidden"
        />

        {/* Primary Action: Camera */}
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isProcessing}
          className="group relative flex flex-col items-center justify-center gap-4 p-8 bg-primary hover:bg-primary-hover text-white rounded-[2rem] overflow-hidden transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-[0_20px_40px_-12px_rgba(var(--color-primary),0.4)] hover:-translate-y-1 active:scale-95"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined text-4xl">photo_camera</span>
          </div>
          <div className="text-center">
            <span className="block font-black text-lg">التقاط صورة</span>
            <span className="text-xs text-white/70 font-medium">استخدم كاميرا الهاتف</span>
          </div>
          {isProcessing && (
            <div className="absolute inset-0 bg-primary/95 flex items-center justify-center backdrop-blur-md">
              <span className="material-symbols-outlined animate-spin text-4xl">progress_activity</span>
            </div>
          )}
        </button>

        {/* Secondary Action: Gallery */}
        <div className="relative h-full">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageCapture}
            className="hidden"
            id="gallery-upload"
          />
          <label
            htmlFor="gallery-upload"
            className="group flex flex-col items-center justify-center gap-4 p-8 bg-white hover:bg-gray-50 text-heading-dark rounded-[2rem] border-2 border-dashed border-gray-200 cursor-pointer h-full transition-all hover:border-primary/30 hover:-translate-y-1 active:scale-95"
          >
            <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-2xl flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-all">
              <span className="material-symbols-outlined text-4xl">imagesmode</span>
            </div>
            <div className="text-center">
              <span className="block font-black text-lg">رفع من الاستوديو</span>
              <span className="text-xs text-gray-500 font-medium">اختر صورة مخزنة</span>
            </div>
          </label>
        </div>
      </div>

    </div>
  );
};

export default CaptureScreen;
