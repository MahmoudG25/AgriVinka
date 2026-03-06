import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { logger } from '../../../utils/logger';
import {
  MdClass,
  MdMap,
  MdPeople,
  MdCloudUpload,
  MdWorkspacePremium,
  MdPendingActions,
  MdShoppingCart,
  MdTrendingUp,
  MdAdd,
  MdCheckCircle,
  MdWarning
} from 'react-icons/md';
import { addToast, openModal } from '../../../app/store/slices/uiSlice';
import { courseService } from '../../../services/firestore/courseService';
import { roadmapService } from '../../../services/firestore/roadmapService';
import { adminStatsService } from '../../../services/firestore/adminStatsService';
import { pageService } from '../../../services/firestore/pageService';

/* ═══════════════════════════════════════════════
   KPI Card — accent-stripe left border
   ═══════════════════════════════════════════════ */
const KPICard = ({ title, value, icon: Icon, accent, loading }) => (
  <div className="bg-white rounded-xl border border-border-light hover:shadow-sm transition-shadow overflow-hidden flex">
    {/* Accent stripe */}
    <div className={`w-1 shrink-0 ${accent}`} />
    <div className="flex items-center justify-between flex-1 p-4">
      <div>
        <p className="text-xs text-gray-400 font-medium mb-1">{title}</p>
        {loading ? (
          <div className="h-7 w-14 bg-gray-100 rounded animate-pulse" />
        ) : (
          <p className="text-2xl font-bold text-heading-dark tabular-nums">{value}</p>
        )}
      </div>
      <div className={`p-2.5 rounded-lg ${accent} bg-opacity-10`}>
        <Icon size={22} className="opacity-70" />
      </div>
    </div>
  </div>
);

/* ═══════════════════════════════════════════════
   Quick-Link Card
   ═══════════════════════════════════════════════ */
const QuickLink = ({ to, icon: Icon, label, desc }) => (
  <Link
    to={to}
    className="group bg-white rounded-xl border border-border-light p-4 hover:shadow-sm hover:border-primary/20 transition-all flex items-start gap-3"
  >
    <div className="p-2 bg-primary/5 rounded-lg text-primary group-hover:bg-primary/10 transition-colors shrink-0">
      <Icon size={20} />
    </div>
    <div className="min-w-0">
      <p className="text-sm font-bold text-heading-dark group-hover:text-primary transition-colors">{label}</p>
      <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
    </div>
  </Link>
);

/* ═══════════════════════════════════════════════
   Dashboard Page
   ═══════════════════════════════════════════════ */
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

  const kpiCards = [
    { title: 'إجمالي المستخدمين', value: userMetrics.totalUsers, icon: MdPeople, accent: 'bg-blue-500', loading: metricsLoading },
    { title: 'الدورات المكتملة', value: userMetrics.totalCompleted, icon: MdWorkspacePremium, accent: 'bg-emerald-500', loading: metricsLoading },
    { title: 'طلبات قيد الانتظار', value: userMetrics.pendingOrders, icon: MdPendingActions, accent: 'bg-amber-500', loading: metricsLoading },
    { title: 'إجمالي الطلبات', value: userMetrics.totalOrders, icon: MdShoppingCart, accent: 'bg-purple-500', loading: metricsLoading },
    { title: 'إجمالي الدورات', value: contentStats.courses, icon: MdClass, accent: 'bg-indigo-500', loading },
    { title: 'المسارات التعليمية', value: contentStats.roadmaps, icon: MdMap, accent: 'bg-teal-500', loading },
  ];

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-xl font-bold text-heading-dark">لوحة المعلومات</h1>
        <p className="text-sm text-gray-400 mt-0.5">نظرة شاملة على منصة AgriVinka</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {kpiCards.map((kpi, idx) => (
          <KPICard key={idx} {...kpi} />
        ))}
      </div>

      {/* Quick Links */}
      <div>
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">وصول سريع</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <QuickLink to="/features/admin/courses/new" icon={MdAdd} label="إضافة دورة" desc="إنشاء دورة تعليمية جديدة" />
          <QuickLink to="/features/admin/orders" icon={MdShoppingCart} label="إدارة الطلبات" desc="مراجعة الطلبات المعلقة" />
          <QuickLink to="/features/admin/users" icon={MdPeople} label="المستخدمين" desc="عرض وإدارة الأعضاء" />
          <QuickLink to="/features/admin/certificates" icon={MdWorkspacePremium} label="الشهادات" desc="عرض الشهادات الصادرة" />
        </div>
      </div>

      {/* System Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* System Tools */}
        <div className="bg-white rounded-xl border border-border-light p-5">
          <h2 className="text-sm font-bold text-heading-dark mb-1">أدوات النظام</h2>
          <p className="text-xs text-gray-400 mb-4">أدوات مفيدة لإدارة البيانات ونقلها.</p>
          <div className="flex flex-col gap-3">
            <button
              onClick={handleReset}
              className="bg-red-50 hover:bg-red-100 text-red-600 font-bold text-sm py-2.5 px-4 rounded-lg transition-colors border border-red-100"
            >
              تنظيف المحلي (Reset Storage)
            </button>
            <button
              onClick={handleSeedDatabase}
              disabled={seedLoading}
              className="bg-primary/10 hover:bg-primary/20 text-primary font-bold text-sm py-2.5 px-4 rounded-lg transition-colors flex justify-center items-center gap-2 disabled:opacity-50"
            >
              <MdCloudUpload size={18} />
              {seedLoading ? 'جاري الحقن...' : 'حقن محتوى AgriVinka (Seed DB)'}
            </button>
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white rounded-xl border border-border-light p-5">
          <h2 className="text-sm font-bold text-heading-dark mb-4">حالة النظام</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center pb-3 border-b border-border-light">
              <span className="text-sm text-gray-500">قاعدة البيانات</span>
              <span className="text-sm text-green-600 font-medium flex items-center gap-1.5">
                <MdCheckCircle size={16} />
                Firestore متصل
              </span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-border-light">
              <span className="text-sm text-gray-500">Cloudinary</span>
              <span className={`text-sm font-medium flex items-center gap-1.5 ${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME ? 'text-green-600' : 'text-red-500'}`}>
                {import.meta.env.VITE_CLOUDINARY_CLOUD_NAME ? (
                  <><MdCheckCircle size={16} /> متصل</>
                ) : (
                  <><MdWarning size={16} /> غير متصل</>
                )}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">نسخة التطبيق</span>
              <span className="text-sm text-heading-dark font-medium">1.3.0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
