import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { logger } from '../../utils/logger';
import { MdClass, MdMap, MdPeople, MdPermMedia, MdCloudUpload } from 'react-icons/md';
import { addToast, openModal } from '../../store/slices/uiSlice';
import { courseService } from '../../services/courseService';
import { roadmapService } from '../../services/roadmapService';
import { orderService } from '../../services/orderService';
import { pageService } from '../../services/pageService';

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-border-light flex items-center justify-between">
    <div>
      <p className="text-gray-500 text-sm mb-1">{title}</p>
      <h3 className="text-2xl font-bold text-heading-dark">{value}</h3>
    </div>
    <div className={`p-3 rounded-full ${color}`}>
      <Icon size={24} className="text-white" />
    </div>
  </div>
);

const DashboardPage = () => {
  const dispatch = useDispatch();
  const [stats, setStats] = useState({ courses: 0, roadmaps: 0, orders: 0 });
  const [loading, setLoading] = useState(true);
  const [seedLoading, setSeedLoading] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [courses, roadmaps, orders] = await Promise.all([
          courseService.getAllCourses(false), // Fetch all including hidden
          roadmapService.getAllRoadmaps(),
          orderService.getOrders()
        ]);
        setStats({
          courses: courses.length,
          roadmaps: roadmaps.length,
          orders: orders.length
        });
      } catch (error) {
        logger.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
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
          content: "تأسست أكاديمية نماء لسد الفجوة العميقة بين التعليم الجامعي النظري، وبين المهارات العملية المطلوبة. يجمع فريقنا من الخبراء سنوات من العمل الميداني والبحث العلمي لدمج الخبرة التطبيقية في مسارات ميسرة.",
          image1: 'https://images.unsplash.com/photo-1592982537447-6f29fb25ff71?q=80&w=2070&auto=format&fit=crop',
          image2: 'https://images.unsplash.com/photo-1628183204732-34fecad14828?q=80&w=1964&auto=format&fit=crop'
        },
        ctaFinal: {
          title: "هل أنت مستعد لتطوير مهاراتك الزراعية؟",
          description: "انضم الآن وابدأ رحلة الاحتراف في الهندسة الزراعية مع خطة مدروسة."
        }
      };

      await pageService.updatePageData('home', agritechHomeData);
      dispatch(addToast({ type: 'success', message: 'تم حقن بيانات نماء الزراعية في القاعدة بنجاح!' }));
    } catch (err) {
      logger.error('Failed to seed DB', err);
      dispatch(addToast({ type: 'error', message: 'حدث خطأ أثناء حفظ البيانات' }));
    } finally {
      setSeedLoading(false);
    }
  };

  const dashboardStats = [
    {
      title: 'إجمالي الدورات',
      value: loading ? '...' : stats.courses,
      icon: MdClass,
      color: 'bg-blue-500'
    },
    {
      title: 'المسارات التعليمية',
      value: loading ? '...' : stats.roadmaps,
      icon: MdMap,
      color: 'bg-green-500'
    },
    {
      title: 'الطلبات',
      value: loading ? '...' : stats.orders,
      icon: MdPeople,
      color: 'bg-purple-500'
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-heading-dark">لوحة المعلومات</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {dashboardStats.map((stat, idx) => (
          <StatCard key={idx} {...stat} />
        ))}
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
              className="flex-1 bg-primary hover:bg-accent text-white font-bold py-3 px-4 rounded-xl transition-colors border shadow-md flex justify-center items-center gap-2"
            >
              <MdCloudUpload size={20} />
              {seedLoading ? 'جاري الحقن...' : 'حقن محتوى أكاديمية نماء نصوص (Seed DB)'}
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
              <span className="text-gray-900 font-bold">1.2.0 (Firestore)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
