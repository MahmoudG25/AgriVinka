import React, { useState } from 'react';
import PageShell from '../../../components/layout/PageShell';
import { motion, AnimatePresence } from 'framer-motion';
import { analyzePlantImage } from '../services/analysisService';
import CaptureScreen from '../components/CaptureScreen';
import LoadingSpinner from '../components/LoadingSpinner';
import AnalysisResult from '../components/AnalysisResult';

const PlantAnalyzerPage = () => {
  const [appState, setAppState] = useState('IDLE'); // IDLE, ANALYZING, RESULT, ERROR
  const [analysisResult, setAnalysisResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const handleAnalyze = async (data) => {
    setAppState('ANALYZING');
    setErrorMsg('');

    try {
      const result = await analyzePlantImage(data);
      setAnalysisResult(result);
      setAppState('RESULT');
    } catch (err) {
      console.error("Analysis Failed:", err);
      setErrorMsg(err.message || 'حدث خطأ أثناء الاتصال بمزود الذكاء الاصطناعي.');
      setAppState('ERROR');
    }
  };

  const handleReset = () => {
    setAppState('IDLE');
    setAnalysisResult(null);
    setErrorMsg('');
  };

  return (
    <PageShell narrow className="pt-24 mt-4">
      <AnimatePresence mode="wait">

        {/* STATE: IDLE or ERROR */}
        {(appState === 'IDLE' || appState === 'ERROR') && (
          <motion.div
            key="capture"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
          >
            {appState === 'ERROR' && (
              <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl border border-red-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-xl">error</span>
                  <p className="text-sm font-medium">{errorMsg}</p>
                </div>
                <button onClick={() => setAppState('IDLE')} className="text-red-400 hover:text-red-600">
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>
            )}

            <div className="max-w-2xl mx-auto">
              <CaptureScreen onAnalyze={handleAnalyze} />
            </div>
          </motion.div>
        )}

        {/* STATE: ANALYZING */}
        {appState === 'ANALYZING' && (
          <motion.div
            key="loading"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.3 }}
            className="flex items-center justify-center py-20"
          >
            <LoadingSpinner />
          </motion.div>
        )}

        {/* STATE: RESULT */}
        {appState === 'RESULT' && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
          >
            <AnalysisResult result={analysisResult} onReset={handleReset} />
          </motion.div>
        )}

      </AnimatePresence>
    </PageShell>
  );
};

export default PlantAnalyzerPage;
