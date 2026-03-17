import React from 'react';
import { Link } from 'react-router-dom';

const DashboardWelcomeBanner = ({ userData, continueItem }) => {
  const firstName = userData?.displayName?.split(' ')[0] || 'مستخدم';
  const progress = continueItem?.enrollment?.progressPercentage || 0;
  
  const courseTitle = continueItem?.title || 'زراعة النباتات الطبية والأساليب الحديثة';
  const imageUrl = continueItem?.media?.thumbnail || continueItem?.thumbnail || continueItem?.image || '/assets/plant-illustration.png';

  return (
    <div className="bg-[#2a5c3e] rounded-[2rem] overflow-hidden relative shadow-md">
      {/* Decorative patterns / shapes (optional bg) */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 100% 0%, #ffffff 0%, transparent 50%)' }} />

      <div className="flex flex-col md:flex-row items-center justify-between p-8 md:p-12 gap-8 relative z-10">
        {/* Right side Text */}
        <div className="flex-1 text-white">
          <h1 className="text-3xl font-black mb-3">
            أهلاً بك يا {firstName} <span className="text-yellow-400">👋</span>
          </h1>
          <p className="text-sm font-medium text-white/80 mb-8 max-w-lg leading-relaxed">
            استكمل رحلتك التعليمية في {courseTitle}.
          </p>

          {/* Progress Section */}
          <div className="bg-white/10 rounded-2xl p-4 max-w-md border border-white/10 backdrop-blur-sm">
            <div className="flex justify-between items-center mb-2 text-sm font-bold">
              <span>التقدم في الدورة الحالية</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2.5 bg-white/20 rounded-full overflow-hidden mb-5">
              <div 
                className="h-full bg-green-400 rounded-full transition-all duration-700"
                style={{ width: `${progress}%` }}
              />
            </div>
            
            <Link 
              to={continueItem ? `/courses/${continueItem.id}/play` : '/courses'}
              className="inline-flex items-center justify-center gap-2 bg-white text-[#2a5c3e] px-6 py-2.5 rounded-full text-sm font-bold hover:bg-gray-50 transition-colors"
            >
              استمرار التعلم
              <span className="material-symbols-outlined text-sm rtl:rotate-180">arrow_back</span>
            </Link>
          </div>
        </div>

        {/* Left side Image / Illustration */}
        <div className="shrink-0 relative">
          <div className="w-56 h-56 md:w-64 md:h-64 bg-white rounded-[2rem] -rotate-6 shadow-xl flex items-center justify-center overflow-hidden border-[6px] border-white p-2">
            <div className="w-full h-full bg-gray-50 rounded-2xl overflow-hidden relative shadow-inner">
               <img src={imageUrl} alt="Course Thumbnail" className="w-full h-full object-cover" onError={(e) => { e.target.onerror = null; e.target.src = 'https://placehold.co/400x400?text=Course'; }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardWelcomeBanner;
