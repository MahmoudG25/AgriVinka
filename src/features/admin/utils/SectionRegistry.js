// src/admin/utils/SectionRegistry.js
import Hero from '../../../components/home/Hero';
import FeaturedCourses from '../../../components/home/FeaturedCourses';
import PlatformFeatures from '../../../components/home/PlatformFeatures';
import Tracks from '../../../components/home/Tracks';
import Testimonials from '../../../components/home/Testimonials';
import FAQ from '../../../components/home/FAQ';
import CTA from '../../../components/home/CTA';
import Pricing from '../../../components/home/Pricing';

// Registry maps string types to actual React components and provides form schemas for the Admin Builder
export const SectionRegistry = {
  hero: {
    name: 'القسم الرئيسي (Hero)',
    component: Hero,
    schema: [
      { key: 'title', label: 'العنوان الرئيسي', type: 'text', placeholder: 'مثال: تعلم التقنية بأسلوب حديث' },
      { key: 'subtitle', label: 'العنوان الفرعي', type: 'textarea', placeholder: 'وصف قصير تحت العنوان' },
      { key: 'videoUrl', label: 'رابط فيديو تعريفي (Hero Video)', type: 'url', placeholder: 'رابط يوتيوب أو فيديو مباشر' },
      { key: 'ctaText', label: 'نص زر الإجراء (CTA)', type: 'text', placeholder: 'مثال: ابدأ التعلم الآن' },
      { key: 'ctaLink', label: 'رابط زر الإجراء', type: 'text', placeholder: 'مثال: /courses' }
    ],
    defaultData: {
      title: 'AgriVinka للتعليم التقني',
      subtitle: 'طور مهاراتك مع أفضل الخبراء في الوطن العربي.',
      videoUrl: '',
      ctaText: 'استكشف الدورات',
      ctaLink: '/courses'
    }
  },

  featuredCourses: {
    name: 'الدورات المميزة (Featured Courses)',
    component: FeaturedCourses,
    schema: [
      { key: 'title', label: 'عنوان القسم', type: 'text' },
      { key: 'subtitle', label: 'الوصف', type: 'textarea' },
      { key: 'limit', label: 'عدد الدورات المعروضة', type: 'number', placeholder: 'أقصى عدد (مثال: 4)' }
    ],
    defaultData: {
      title: 'أحدث الدورات التدريبية',
      subtitle: 'اخترنا لك مجموعة من أفضل دوراتنا لتطوير مسيرتك المهنية.',
      limit: 4
    }
  },

  platformFeatures: {
    name: 'مميزات المنصة (Platform Features)',
    component: PlatformFeatures,
    schema: [
      { key: 'badge', label: 'الشارة (Badge)', type: 'text' },
      { key: 'title', label: 'عنوان القسم', type: 'text' },
      { key: 'subtitle', label: 'الوصف', type: 'textarea' },
      { key: 'features', label: 'المميزات', type: 'json' }
    ],
    defaultData: {
      badge: 'لماذا تختار منصتنا؟',
      title: 'طريقك الأمثل لاحتراف المجال الزراعي',
      subtitle: 'نقدم لك بيئة تعليمية متكاملة تجمع بين المعرفة الأكاديمية والممارسة العملية.',
      features: []
    }
  },

  learningPaths: {
    name: 'المسارات التعليمية (Learning Paths)',
    component: Tracks,
    schema: [
      { key: 'badge', label: 'الشارة (Badge)', type: 'text' },
      { key: 'title', label: 'عنوان القسم', type: 'text' },
      { key: 'subtitle', label: 'العنوان الفرعي', type: 'text' },
      { key: 'description', label: 'الوصف', type: 'textarea' },
      { key: 'tabs', label: 'التصنيفات المتاحة (json)', type: 'json' }
    ],
    defaultData: {
      badge: '🎯 مساراتك نحو الاحتراف',
      title: 'خطط دراسية متدرجة ترسم لك',
      subtitle: 'الطريق من الأساسيات وحتى التخصص',
      description: 'مصممة بعناية لبناء مهندس زراعي شامل.',
      tabs: ['الكل', 'الإنتاج النباتي', 'الزراعة الذكية']
    }
  },

  testimonials: {
    name: 'آراء المتدربين (Testimonials)',
    component: Testimonials,
    schema: [
      { key: 'title', label: 'عنوان القسم', type: 'text' },
      { key: 'subtitle', label: 'الوصف', type: 'textarea' }
    ],
    defaultData: {
      title: 'ماذا يقولون عنا؟',
      subtitle: 'قصص نجاح وإلهام من طلابنا.'
    }
  },

  faq: {
    name: 'الأسئلة الشائعة (FAQ)',
    component: FAQ,
    schema: [
      { key: 'title', label: 'عنوان القسم', type: 'text' },
      { key: 'subtitle', label: 'الوصف', type: 'textarea' }
    ],
    defaultData: {
      title: 'الأسئلة الشائعة',
      subtitle: 'كل ما تحتاج معرفته عن منصتنا التعليمة'
    }
  },

  cta: {
    name: 'دعوة للإجراء (CTA Banner)',
    component: CTA,
    schema: [
      { key: 'title', label: 'العنوان', type: 'text' },
      { key: 'subtitle', label: 'الوصف', type: 'textarea' },
      { key: 'buttonText', label: 'نص الزر', type: 'text' },
      { key: 'buttonLink', label: 'رابط الزر', type: 'text' }
    ],
    defaultData: {
      title: 'هل أنت جاهز للبدء؟',
      subtitle: 'انضم لآلاف الطلاب وابدأ رحلة التعلم اليوم.',
      buttonText: 'إنشاء حساب مجاني',
      buttonLink: '/register'
    }
  },

  pricing: {
    name: 'الباقات والأسعار (Pricing)',
    component: Pricing,
    schema: [
      { key: 'title', label: 'العنوان', type: 'text' },
      { key: 'subtitle', label: 'الوصف', type: 'textarea' }
    ],
    defaultData: {
      title: 'اختر الباقة المناسبة لك',
      subtitle: 'استثمر في مستقبلك المهني مع خطط مرنة.'
    }
  }
};
