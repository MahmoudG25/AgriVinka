import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../../app/contexts/AuthContext';
import { aiDiagnosisService } from '../../../services/firestore/aiDiagnosisService';
import AnalyzerNavbar from '../components/AnalyzerNavbar';
import DiagnosisDetailModal from '../../../pages/dashboard/components/DiagnosisDetailModal';
import { Link, useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';

const PAGE_SIZE = 8;

const MyAnalysesPage = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const uid = currentUser?.uid;

  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [paginationCursor, setPaginationCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);

  const [selectedScan, setSelectedScan] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    // If no user, redirect to login or analyzer
    if (currentUser === null) {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    const fetchInitialHistory = async () => {
      if (!uid) return;
      setLoading(true);
      try {
        const data = await aiDiagnosisService.getUserScans(uid, PAGE_SIZE);
        setScans(data.items);
        setPaginationCursor(data.lastDoc);
        setHasMore(data.hasMore);
      } catch (err) {
        console.error('Failed to fetch history:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialHistory();
  }, [uid]);

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

  const openScanDetails = (scan) => {
    setSelectedScan(scan);
    setModalOpen(true);
  };

  return (
    <div dir="rtl" className="min-h-screen bg-[#f8faf8]">
      <AnalyzerNavbar />

      <div className="w-full mx-auto px-4 sm:px-6 lg:px-8 max-w-[1440px] pt-10 pb-20">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-heading-dark mb-3">سجل تحليلاتي</h1>
            <p className="text-gray-500 text-lg">تاريخ الفحوصات الطبية لنباتاتك عبر الذكاء الاصطناعي.</p>
          </div>
          <Link
            to="/analyzer"
            className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-hover text-white px-6 py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-primary/20 hover:-translate-y-1 w-full sm:w-auto text-center"
          >
            <span className="material-symbols-outlined text-lg">add_a_photo</span>
            فحص نبات جديد
          </Link>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <LoadingSpinner />
          </div>
        ) : scans.length === 0 ? (
          <div className="bg-white rounded-[2rem] p-12 text-center border border-gray-100 shadow-sm flex flex-col items-center justify-center min-h-[400px]">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
              <span className="material-symbols-outlined text-5xl text-gray-300">history</span>
            </div>
            <h3 className="text-2xl font-black text-heading-dark mb-2">لا يوجد سجلات حالياً</h3>
            <p className="text-gray-500 mb-8 max-w-sm">لم تقم بفحص أي نباتات حتى الآن. ابدأ فحص نباتك الأول لاكتشاف الأمراض وطرق العلاج.</p>
            <Link
              to="/analyzer"
              className="px-8 py-3.5 bg-primary text-white font-bold rounded-xl hover:bg-primary-hover transition-colors shadow-lg shadow-primary/20"
            >
              ابدأ الفحص الآن
            </Link>
          </div>
        ) : (
          <div className="space-y-10">
            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {scans.map((scan, index) => {
                const result = scan.result || {};
                const name = result.diagnosis || scan.prediction?.name || 'غير محدد';
                const confidence = result.confidence || 'Medium';
                
                const confidenceConfig = {
                  High: { bg: 'bg-green-100', text: 'text-green-700', label: 'دقة عالية' },
                  Medium: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'دقة متوسطة' },
                  Low: { bg: 'bg-red-100', text: 'text-red-700', label: 'دقة ضعيفة' }
                }[confidence] || { bg: 'bg-green-100', text: 'text-green-700', label: 'تم التحليل' };

                const dateStr = scan.timestamp?.seconds
                  ? new Date(scan.timestamp.seconds * 1000).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric', year: 'numeric' })
                  : 'وقت غير محدد';

                return (
                  <motion.div
                    key={scan.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => openScanDetails(scan)}
                    className="group bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:border-primary/30 hover:shadow-xl transition-all cursor-pointer flex flex-col h-full"
                  >
                    {/* Image Area */}
                    <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                      {scan.imageUrl ? (
                        <img 
                          src={scan.imageUrl} 
                          alt={name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                          loading="lazy" 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <span className="material-symbols-outlined text-5xl">eco</span>
                        </div>
                      )}
                      
                      {/* Badge overlay top left */}
                      <div className="absolute top-3 left-3 flex gap-2">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black shadow-sm ${confidenceConfig.bg} ${confidenceConfig.text}`}>
                          {confidenceConfig.label}
                        </span>
                      </div>
                      
                      {/* Date overlay bottom right */}
                      <div className="absolute bottom-3 right-3 px-2 py-1 bg-black/60 backdrop-blur-md rounded-lg text-[10px] font-medium text-white flex items-center gap-1 shadow-sm">
                        <span className="material-symbols-outlined text-[10px]">calendar_today</span>
                        {dateStr}
                      </div>

                      {/* Engine badge */}
                      {scan.provider && (
                        <div className="absolute top-3 right-3 px-2.5 py-1 bg-white/90 backdrop-blur-md rounded-lg text-[10px] font-black text-gray-700 shadow-sm uppercase">
                          {scan.provider}
                        </div>
                      )}
                    </div>
                    
                    {/* Content Area */}
                    <div className="p-5 flex-1 flex flex-col">
                      <h3 className="font-bold text-lg text-heading-dark mb-2 line-clamp-1 flex-1 group-hover:text-primary transition-colors">
                        {name}
                      </h3>
                      
                      <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-50">
                        <span className="text-xs font-bold text-gray-500 flex items-center gap-1">
                          عرض التفاصيل
                          <span className="material-symbols-outlined text-sm -scale-x-100">arrow_right_alt</span>
                        </span>
                        
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleDelete(scan.id); }}
                          className="w-8 h-8 rounded-lg bg-gray-50 text-gray-400 hover:bg-red-50 hover:text-red-500 flex items-center justify-center transition-colors"
                          title="حذف هذا الفحص"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div className="flex justify-center pt-6">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="px-8 py-3 bg-white border-2 border-primary/20 text-primary font-bold rounded-xl hover:bg-primary/5 hover:border-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loadingMore ? (
                    <>
                      <span className="material-symbols-outlined animate-spin">progress_activity</span>
                      جاري التحميل...
                    </>
                  ) : (
                    'عرض المزيد'
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <DiagnosisDetailModal
        scan={selectedScan}
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setSelectedScan(null); }}
        onDelete={(id) => { handleDelete(id); setModalOpen(false); }}
      />
    </div>
  );
};

export default MyAnalysesPage;
