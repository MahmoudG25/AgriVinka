import React from 'react';
import { motion } from 'framer-motion';

const LoadingSpinner = () => {
  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-6">
      <div className="relative w-32 h-32 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
          className="absolute inset-0 border-4 border-dashed border-primary/30 rounded-full"
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="absolute w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center backdrop-blur-sm shadow-inner"
        >
          <span className="material-symbols-outlined text-primary text-4xl">psychology</span>
        </motion.div>

        {/* Scanning Line */}
        <motion.div
          animate={{ y: [-40, 40, -40] }}
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          className="absolute w-24 h-0.5 bg-primary/40 shadow-[0_0_8px_2px_rgba(var(--color-primary),0.5)]"
        />
      </div>

      <div className="text-center space-y-2">
        <h3 className="font-bold text-lg text-heading-dark">جاري تحليل صورة النبات...</h3>
        <p className="text-sm text-gray-500">يقوم الذكاء الاصطناعي الآن بفحص الأوراق وأعراض المرض</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
