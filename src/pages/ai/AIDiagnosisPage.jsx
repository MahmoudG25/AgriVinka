import React, { useState, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { aiDiagnosisService } from '../../services/aiDiagnosisService';
import { logger } from '../../utils/logger';
import SEOHead from '../../components/common/SEOHead';
import { toast } from 'react-hot-toast';
import {
  FaUpload,
  FaCamera,
  FaLeaf,
  FaExclamationTriangle,
  FaCheckCircle,
  FaInfoCircle,
  FaSpinner
} from 'react-icons/fa';

const AIDiagnosisPage = () => {
  const { currentUser } = useAuth();
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);

  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const handleImageSelect = (file) => {
    if (!file) return;

    // Validate type
    if (!file.type.startsWith('image/')) {
      toast.error('الرجاء اختيار صورة صالحة');
      return;
    }

    // Create preview
    setSelectedImage(file);
    setPreviewUrl(URL.createObjectURL(file));
    setResult(null); // Reset previous results
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleImageSelect(files[0]);
    }
  };

  const startAnalysis = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    setResult(null);

    try {
      // 1. Analyze the image
      const analysisResult = await aiDiagnosisService.analyzeImage(selectedImage);

      // 2. Set UI Result immediately
      setResult(analysisResult.prediction);

      // 3. Save to history (if logged in) in the background
      if (currentUser?.uid) {
        aiDiagnosisService.saveScanHistory(currentUser.uid, selectedImage, analysisResult)
          .then(() => logger.info('Scan saved'))
          .catch(err => console.error('Failed backgrounds save', err));
      }

      toast.success('تم تحليل الصورة بنجاح');

    } catch (error) {
      toast.error(error.message || 'حدث خطأ أثناء الفحص');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const clearSelection = () => {
    setSelectedImage(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  return (
    <>
      <SEOHead
        title="تشخيص أمراض النباتات بالذكاء الاصطناعي | AgriVinka"
        description="ارفع صورة لنباتك المريض ودع الذكاء الاصطناعي يخبرك بالمرض وطرق العلاج المقترحة في ثوانٍ."
      />

      <div className="pt-32 pb-20 min-h-screen bg-[#f8f9fb]" dir="rtl">
        <div className="container-layout ">

          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-bold text-heading-dark mb-4 flex items-center justify-center gap-3">
              <FaLeaf className="text-primary" />
              المُشخِّص الزراعي الذكي (AI)
            </h1>
            <p className="text-gray-600 text-lg mx-auto">
              تطبيق متقدم يعتمد على الذكاء الاصطناعي لاكتشاف أكثر من 50 نوعاً من الأمراض النباتية.
              {currentUser ? ' سيتم حفظ نتائج فحصك في سجل حسابك الشخصي.' : ' سجل الدخول لحفظ نتائج فحوصاتك.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">

            {/* Input Section */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full flex flex-col">
              <h2 className="text-xl font-bold mb-4">الصورة المراد فحصها</h2>

              {!previewUrl ? (
                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-8 bg-gray-50 hover:bg-gray-100 hover:border-primary transition-colors text-center"
                >
                  <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                    <FaUpload className="text-3xl text-primary" />
                  </div>
                  <h3 className="font-bold text-gray-700 mb-2">اسحب وأفلت الصورة هنا</h3>
                  <p className="text-sm text-gray-500 mb-6">أو استخدم أحد الأزرار أدناه</p>

                  <div className="flex gap-4 w-full px-4">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex-1 py-3 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-700 hover:border-primary hover:text-primary transition-colors"
                    >
                      اختر صورة من الجهاز
                    </button>
                    <button
                      onClick={() => cameraInputRef.current?.click()}
                      className="flex-1 py-3 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary-hover transition-colors flex justify-center items-center gap-2"
                    >
                      <FaCamera /> التقط صورة
                    </button>
                  </div>

                  {/* Hidden Inputs */}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={(e) => handleImageSelect(e.target.files[0])}
                  />
                  {/* Capture specifies bringing up the camera on mobile devices */}
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    ref={cameraInputRef}
                    onChange={(e) => handleImageSelect(e.target.files[0])}
                  />
                </div>
              ) : (
                <div className="flex-1 flex flex-col">
                  <div className="relative rounded-xl overflow-hidden bg-gray-900 mb-4 h-64 md:h-80 group">
                    <img src={previewUrl} alt="Preview" className="w-full h-full object-contain" />
                    <button
                      onClick={clearSelection}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 text-sm opacity-80 hover:opacity-100 transition-opacity"
                      title="إزالة الصورة"
                    >
                      ×
                    </button>
                    {isAnalyzing && (
                      <div className="absolute inset-0 bg-primary/20 backdrop-blur-[2px] z-10 overflow-hidden">
                        <div className="absolute top-0 left-0 right-0 h-1 bg-primary blur-[2px] animate-[scan_2s_ease-in-out_infinite]" />
                      </div>
                    )}
                  </div>

                  <button
                    onClick={startAnalysis}
                    disabled={isAnalyzing || result}
                    className="w-full py-4 bg-primary text-white rounded-xl font-bold text-lg hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
                  >
                    {isAnalyzing ? (
                      <><FaSpinner className="animate-spin" /> جاري تحليل الأنسجة...</>
                    ) : result ? (
                      <><FaCheckCircle /> اكتمل الفحص</>
                    ) : (
                      'ابدأ الفحص الآن'
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Results Section */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full">
              <h2 className="text-xl font-bold mb-4">نتائج التشخيص</h2>

              {!isAnalyzing && !result && (
                <div className="h-48 md:h-full min-h-[300px] flex flex-col items-center justify-center text-gray-400">
                  <span className="material-symbols-outlined text-6xl mb-4 opacity-20">analytics</span>
                  <p>قم برفع صورة وبدء الفحص لظهور النتائج هنا.</p>
                </div>
              )}

              {isAnalyzing && (
                <div className="h-48 md:h-full min-h-[300px] flex flex-col items-center justify-center text-primary">
                  <FaSpinner className="text-4xl animate-spin mb-4" />
                  <p className="font-bold animate-pulse">يتم الآن مطابقة الصورة مع قاعدة البيانات الذكية...</p>
                </div>
              )}

              {result && (
                <div className="space-y-6 animate-fade-in">

                  {/* Primary Verdict */}
                  <div className={`p-4 rounded-xl border-l-4 ${result.severity === 'high' ? 'bg-red-50 border-red-500 text-red-900' :
                    result.severity === 'medium' ? 'bg-amber-50 border-amber-500 text-amber-900' :
                      result.severity === 'none' ? 'bg-green-50 border-green-500 text-green-900' :
                        'bg-gray-50 border-gray-500 text-gray-900'
                    }`}>
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-xl">{result.name}</h3>
                      <span className="bg-white px-2 py-1 rounded text-sm font-bold shadow-sm">
                        مستوى الثقة: {Math.round(result.confidence * 100)}%
                      </span>
                    </div>
                  </div>

                  {/* Symptoms */}
                  {result.symptoms && result.symptoms.length > 0 && (
                    <div>
                      <h4 className="font-bold text-gray-800 flex items-center gap-2 mb-2">
                        <FaExclamationTriangle className="text-amber-500" />
                        الأعراض المتوقعة:
                      </h4>
                      <ul className="list-disc list-inside space-y-1 text-gray-600 pr-2">
                        {result.symptoms.map((s, i) => <li key={i}>{s}</li>)}
                      </ul>
                    </div>
                  )}

                  {/* Treatments */}
                  {result.treatment && result.treatment.length > 0 && (
                    <div>
                      <h4 className="font-bold text-gray-800 flex items-center gap-2 mb-2">
                        <FaCheckCircle className="text-green-500" />
                        خطوات العلاج المقترحة:
                      </h4>
                      <ul className="list-disc list-inside space-y-1 text-gray-600 pr-2">
                        {result.treatment.map((t, i) => <li key={i}>{t}</li>)}
                      </ul>
                    </div>
                  )}

                  {/* Disclaimer */}
                  <div className="mt-8 p-4 bg-blue-50 text-blue-800 rounded-lg text-sm flex items-start gap-3">
                    <FaInfoCircle className="mt-0.5 shrink-0" />
                    <p>
                      <strong>تنويه هام:</strong> هذه النتيجة مولدة آلياً بواسطة الذكاء الاصطناعي وبناء على الصورة المرفقة فقط. ننصح دائماً باستشارة مهندس زراعي مختص قبل تطبيق أي مبيدات كيميائية.
                    </p>
                  </div>

                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </>
  );
};

export default AIDiagnosisPage;
