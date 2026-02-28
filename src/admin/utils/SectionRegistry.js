// src/admin/utils/SectionRegistry.js
import Hero from '../../components/home/Hero';
import FeaturedCourses from '../../components/home/Tracks';
import LearningPaths from '../../components/home/Roadmap';
import Stats from '../../components/home/AboutPreview';
import Testimonials from '../../components/home/Testimonials';
import Partners from '../../components/home/Partners';
import FAQ from '../../components/home/FAQ';
import CTA from '../../components/home/CTA';
import Diagnosis from '../../components/home/Diagnosis';
import Pricing from '../../components/home/Pricing';
import Mission from '../../components/home/Mission';

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
      title: 'أكاديمية نماء للتعليم التقني',
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
      { key: 'limit', label: 'عدد الدورات المعروضة', type: 'number', placeholder: 'أقصى عدد (مثال: 6)' }
    ],
    defaultData: {
      title: 'أحدث الدورات التدريبية',
      subtitle: 'اخترنا لك مجموعة من أفضل دوراتنا لتطوير مسيرتك المهنية.',
      limit: 6
    }
  },

  learningPaths: {
    name: 'خارطة الطريق (Roadmap)',
    component: LearningPaths,
    schema: [
      { key: 'title', label: 'عنوان القسم', type: 'text', placeholder: 'مثال: خارطة طريقك من الصفر' },
      { key: 'subtitle', label: 'العنوان الفرعي', type: 'text', placeholder: 'مثال: إلى الاحتراف والدخل' },
      { key: 'description', label: 'الوصف', type: 'textarea', placeholder: 'وصف القسم' },
      { key: 'studentCount', label: 'عدد الطلاب (نص)', type: 'text', placeholder: 'مثال: +1.2k' },
      { key: 'finalTitle', label: 'عنوان القسم النهائي', type: 'text', placeholder: 'مثال: من الصفر...' },
      { key: 'finalIncome', label: 'الدخل النهائي (نص)', type: 'text', placeholder: 'مثال: $1,250.00' },
      { key: 'finalDesc', label: 'وصف القسم النهائي', type: 'textarea', placeholder: 'وصف الجائزة الكبرى' },
      { key: 'steps', label: 'خطوات خارطة الطريق (مصفوفة JSON)', type: 'json', placeholder: '[{ "stepNumber": "01", "title": "...", "subtitle": "...", "description": "...", "icon": "architecture", "color": "from-blue-500 to-blue-700", "shadow": "shadow-blue-500/30", "duration": "4 أسابيع", "outcome": "...", "income": "...", "emotional": "...", "progress": 20 }]' }
    ],
    defaultData: {
      title: 'خارطة طريقك من الصفر',
      subtitle: 'إلى الاحتراف والدخل',
      description: 'لا نبيع لك كورسات، نحن نصمم لك رحلة تحول كاملة. خطوات مدروسة علمياً لتضمن وصولك للهدف دون تشتت.',
      studentCount: '+1.2k',
      finalTitle: 'من الصفر...',
      finalIncome: '$1,250.00',
      finalDesc: 'هذه ليست مجرد دورة تعليمية، هذا استثمار في مستقبلك.',
      steps: []
    }
  },

  stats: {
    name: 'الإحصائيات (Stats)',
    component: Stats,
    schema: [
      // For complex arrays like items, the PageBuilder will need special handling, but we define the structure here.
      { key: 'items', label: 'الإحصائيات (مصفوفة JSON)', type: 'json', placeholder: '[{ "value": "+1000", "label": "طالب" }]' }
    ],
    defaultData: {
      items: [
        { value: '+50,000', label: 'طالب مسجل' },
        { value: '+200', label: 'دورة تدريبية' }
      ]
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

  partners: {
    name: 'شركاء النجاح (Partners)',
    component: Partners,
    schema: [
      { key: 'title', label: 'عنوان القسم', type: 'text' }
    ],
    defaultData: {
      title: 'شركاء النجاح'
    }
  },

  faq: {
    name: 'الأسئلة الشائعة (FAQ)',
    component: FAQ,
    schema: [
      { key: 'title', label: 'عنوان القسم', type: 'text' },
      { key: 'subtitle', label: 'الوصف', type: 'textarea' }
      // FAQs are usually managed in a separate global collection or as a JSON array field
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
      { key: 'description', label: 'الوصف', type: 'textarea' },
      { key: 'buttonText', label: 'نص الزر', type: 'text' },
      { key: 'buttonLink', label: 'رابط الزر', type: 'text' }
    ],
    defaultData: {
      title: 'هل أنت جاهز للبدء؟',
      description: 'انضم لآلاف الطلاب وابدأ رحلة التعلم اليوم.',
      buttonText: 'إنشاء حساب مجاني',
      buttonLink: '/register'
    }
  },

  diagnosis: {
    name: 'قسم المشكلات والحلول (Diagnosis)',
    component: Diagnosis,
    schema: [
      { key: 'title', label: 'العنوان', type: 'text' },
      { key: 'subtitle', label: 'الوصف', type: 'textarea' }
    ],
    defaultData: {
      title: 'هل تواجه هذه التحديات؟',
      subtitle: 'الكثير من المهندسين الزراعيين يواجهون نفس المشاكل. نحن هنا لمساعدتك.'
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
  },

  mission: {
    name: 'مهمتنا (Mission)',
    component: Mission,
    schema: [
      { key: 'title', label: 'العنوان', type: 'text' },
      { key: 'subtitle', label: 'الوصف', type: 'textarea' }
    ],
    defaultData: {
      title: 'مهمتنا ورؤيتنا',
      subtitle: 'نسعى للارتقاء بالقطاع الزراعي من خلال تعليم احترافي موثوق يجمع بين العلم والتطبيق الأكاديمي.'
    }
  }
};
