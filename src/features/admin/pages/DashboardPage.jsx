import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { logger } from '../../../utils/logger';
import {
  MdClass,
  MdMap,
  MdPeople,
  MdCloudUpload,
  MdSchool,
  MdPendingActions,
  MdShoppingCart,
  MdWorkspacePremium
} from 'react-icons/md';
import { addToast, openModal } from '../../../app/store/slices/uiSlice';
import { courseService } from '../../../services/firestore/courseService';
import { roadmapService } from '../../../services/firestore/roadmapService';
import { adminStatsService } from '../../../services/firestore/adminStatsService';
import { pageService } from '../../../services/firestore/pageService';

const StatCard = ({ title, value, icon: Icon, color, loading }) => (
  <div className="bg-white p-5 rounded-2xl shadow-sm border border-border-light flex items-center justify-between hover:shadow-md transition-shadow">
    <div>
      <p className="text-gray-500 text-sm mb-1">{title}</p>
      {loading ? (
        <div className="h-8 w-16 bg-gray-100 rounded animate-pulse" />
      ) : (
        <h3 className="text-2xl font-bold text-heading-dark">{value}</h3>
      )}
    </div>
    <div className={`p-3 rounded-full ${color}`}>
      <Icon size={24} className="text-white" />
    </div>
  </div>
);

const DashboardPage = () => {
  const dispatch = useDispatch();
  const [contentStats, setContentStats] = useState({ courses: 0, roadmaps: 0 });
  const [userMetrics, setUserMetrics] = useState({
    totalUsers: 0,
    totalCompleted: 0,
    pendingOrders: 0,
    totalOrders: 0
  });
  const [loading, setLoading] = useState(true);
  const [metricsLoading, setMetricsLoading] = useState(true);
  const [seedLoading, setSeedLoading] = useState(false);

  useEffect(() => {
    // Fetch content stats (courses, roadmaps)
    const fetchContentStats = async () => {
      try {
        const [courses, roadmaps] = await Promise.all([
          courseService.getAllCourses(false),
          roadmapService.getAllRoadmaps()
        ]);
        setContentStats({
          courses: courses.length,
          roadmaps: roadmaps.length
        });
      } catch (error) {
        logger.error('Error fetching content stats:', error);
      } finally {
        setLoading(false);
      }
    };

    // Fetch user metrics (efficient aggregation)
    const fetchUserMetrics = async () => {
      try {
        const stats = await adminStatsService.getAdminDashboardStats();
        setUserMetrics(stats);
      } catch (error) {
        logger.error('Error fetching user metrics:', error);
      } finally {
        setMetricsLoading(false);
      }
    };

    fetchContentStats();
    fetchUserMetrics();
  }, []);

  const handleReset = () => {
    dispatch(openModal({
      type: 'CONFIRM',
      props: {
        title: 'إعادة ضبط قاعدة البيانات المحلية',
        message: 'سيتم حذف البيانات المحلية (Local Storage). البيانات على Firestore لن تتأثر.',
        confirmText: 'نعم، إعادة الضبط',
        isDestructive: true,
        onConfirm: () => {
          try {
            localStorage.clear();
            window.location.reload();
          } catch (e) {
            logger.error('Reset error:', e);
            dispatch(addToast({ type: 'error', message: 'حدث خطأ أثناء إعادة الضبط' }));
          }
        }
      }
    }));
  };

  const handleSeedDatabase = async () => {
    setSeedLoading(true);
    try {
      const agritechHomeData = {
        hero: {
          badge: '🚀 روّاد التعليم الزراعي الحديث',
          title: 'ارتقِ بمسارك المهني',
          subtitle: 'كمهندس زراعي عبر دورات متخصصة ومسارات معتمدة تجمع بين الأساس الأكاديمي والتطبيق الميداني.',
          ctaText: 'تصفح الدورات',
          videoUrl: ''
        },
        partners: [],
        diagnosis: {
          title: 'المشكلة ليست في قدراتك',
          subtitle: 'المشكلة في الفجوة بين النظرية والتطبيق.',
          items: [
            { emoji: "😵", title: "صدمة الميدان", desc: "تتخرج بمعرفة نظرية واسعة لتتفاجأ بأن الواقع في المزارع يختلف تماماً." },
            { emoji: "📚", title: "مناهج تقليدية", desc: "مواد علمية قديمة لا تواكب التقنيات الحديثة في الري الذكي وتشخيص الأمراض." },
            { emoji: "💸", title: "مخاطر الخسارة", desc: "تشخيص خاطئ قد يؤدي إلى خسارة محصول كامل في غضون أيام." },
            { emoji: "⏳", title: "صعوبة المواكبة", desc: "الوقت يمر بينما تتزايد تحديات الأمن الغذائي والزراعة المستدامة." }
          ]
        },
        tracks: {
          tabs: ['الكل', 'All', 'الإنتاج النباتي', 'الري والتسميد', 'وقاية النباتات', 'الهندسة الزراعية', 'الزراعة الذكية', 'تنسيق الحدائق', 'إدارة المشاتل']
        },
        testimonials: [
          { name: "م. أحمد عبد الله", role: "مهندس زراعي", image: "https://i.pravatar.cc/150?u=12", content: "الدورات غيرت نظرتي لتشخيص الآفات تماماً.", rating: 5 },
          { name: "سارة محمد", role: "طالبة بكلية الزراعة", image: "https://i.pravatar.cc/150?u=5", content: "مسار المهندس الشامل أعطاني الثقة للنزول للميدان.", rating: 5 },
          { name: "خالد سعيد", role: "متخصص ري", image: "https://i.pravatar.cc/150?u=8", content: "الشرح مبني على خبرة حقيقية ومواقف من المزارع الكبيرة.", rating: 5 }
        ],
        faq: [
          { question: "هل الكورسات تغني عن التدريب الميداني؟", answer: "نعم ندرس حالات حقيقية من مزارع ومختبرات لتجهيزك وتسهيل فرصك." },
          { question: "ما الفرق بين اختيار باقة مسار واختيار كورس منفرد؟", answer: "المسار تأخذك من الصفر وحتى إتقان تخصص معين، بينما الكورس يركز على مهارة محددة." },
          { question: "هل الشهادات معتمدة؟", answer: "جميع شهاداتنا موثقة ويمكن إضافتها مباشرة لملفك المهني في LinkedIn." }
        ],
        about: {
          title: "من المزرعة إلى الأكاديمية",
          content: "تأسست AgriVinka لسد الفجوة العميقة بين التعليم الجامعي النظري، وبين المهارات العملية المطلوبة. يجمع فريقنا من الخبراء سنوات من العمل الميداني والبحث العلمي لدمج الخبرة التطبيقية في مسارات ميسرة.",
          image1: 'https://images.unsplash.com/photo-1592982537447-6f29fb25ff71?q=80&w=2070&auto=format&fit=crop',
          image2: 'https://images.unsplash.com/photo-1628183204732-34fecad14828?q=80&w=1964&auto=format&fit=crop'
        },
        ctaFinal: {
          title: "هل أنت مستعد لتطوير مهاراتك الزراعية؟",
          description: "انضم الآن وابدأ رحلة الاحتراف في الهندسة الزراعية مع خطة مدروسة."
        }
      };

      await pageService.updatePageData('home', agritechHomeData);
      dispatch(addToast({ type: 'success', message: 'تم حقن بيانات AgriVinka الزراعية في القاعدة بنجاح!' }));
    } catch (err) {
      logger.error('Failed to seed DB', err);
      dispatch(addToast({ type: 'error', message: 'حدث خطأ أثناء حفظ البيانات' }));
    } finally {
      setSeedLoading(false);
    }
  };

  // User Metrics Cards (NEW)
  const metricsCards = [
    {
      title: 'إجمالي المستخدمين',
      value: userMetrics.totalUsers,
      icon: MdPeople,
      color: 'bg-blue-500',
      loading: metricsLoading
    },
    {
      title: 'الدورات المكتملة',
      value: userMetrics.totalCompleted,
      icon: MdWorkspacePremium,
      color: 'bg-emerald-500',
      loading: metricsLoading
    },
    {
      title: 'طلبات قيد الانتظار',
      value: userMetrics.pendingOrders,
      icon: MdPendingActions,
      color: 'bg-amber-500',
      loading: metricsLoading
    },
    {
      title: 'إجمالي الطلبات',
      value: userMetrics.totalOrders,
      icon: MdShoppingCart,
      color: 'bg-purple-500',
      loading: metricsLoading
    },
  ];

  // Content Stats Cards (existing)
  const contentCards = [
    {
      title: 'إجمالي الدورات',
      value: contentStats.courses,
      icon: MdClass,
      color: 'bg-indigo-500',
      loading
    },
    {
      title: 'المسارات التعليمية',
      value: contentStats.roadmaps,
      icon: MdMap,
      color: 'bg-teal-500',
      loading
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-heading-dark">لوحة المعلومات</h1>

      {/* User Metrics Row */}
      <div>
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">إحصائيات المستخدمين</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {metricsCards.map((stat, idx) => (
            <StatCard key={idx} {...stat} />
          ))}
        </div>
      </div>

      {/* Content Stats Row */}
      <div>
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">إحصائيات المحتوى</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {contentCards.map((stat, idx) => (
            <StatCard key={idx} {...stat} />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-border-light">
          <h2 className="text-lg font-bold mb-4">أدوات النظام</h2>
          <p className="text-sm text-gray-500 mb-4">
            أدوات مفيدة لإدارة البيانات ونقلها.
          </p>
          <div className="flex flex-col gap-4">
            <button
              onClick={handleReset}
              className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 font-bold py-3 px-4 rounded-xl transition-colors border border-red-100"
            >
              تنظيف المحلي (Reset Storage)
            </button>
            <button
              onClick={handleSeedDatabase}
              disabled={seedLoading}
              className="flex-1 bg-primary hover:bg-accent text-heading-dark font-bold py-3 px-4 rounded-xl transition-colors border shadow-md flex justify-center items-center gap-2"
            >
              <MdCloudUpload size={20} />
              {seedLoading ? 'جاري الحقن...' : 'حقن محتوى AgriVinka نصوص (Seed DB)'}
            </button>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-border-light">
          <h2 className="text-lg font-bold mb-4">حالة النظام</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-border-light pb-2">
              <span className="text-gray-600">قاعدة البيانات</span>
              <span className="text-green-600 font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                Firestore Connected
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-border-light pb-2">
              <span className="text-gray-600">Cloudinary</span>
              <span className={import.meta.env.VITE_CLOUDINARY_CLOUD_NAME ? "text-green-600 font-bold" : "text-red-500 font-bold"}>
                {import.meta.env.VITE_CLOUDINARY_CLOUD_NAME ? 'متصل' : 'غير متصل (اضبط .env)'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">نسخة التطبيق</span>
              <span className="text-gray-900 font-bold">1.3.0 (Firestore)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
