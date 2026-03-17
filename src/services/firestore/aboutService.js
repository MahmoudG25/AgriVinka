import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const COLLECTION_NAME = 'pages';
const PAGE_ID = 'about';

export const defaultAboutData = {
  hero: {
    title: "تمكين الجيل القادم من المبتكرين الزراعيين",
    description: "نحن هنا لنقود التحول الرقمي في القطاع الزراعي من خلال التعليم والابتكار",
    backgroundImage: "https://images.unsplash.com/photo-1500382017468-9049fee74a62?q=80&w=2000&auto=format&fit=crop",
  },
  bridge: {
    title: "سد الفجوة بين التقاليد والتقنية",
    description: "بدأت رحلة AgriVinka من ملاحظة بسيطة: الفجوة الكبيرة بين الخبرة الزراعية التقليدية المتوارثة وبين التقنيات الحديثة المتسارعة. نحن نؤمن بأن المستقبل يكمن في دمج الاثنين معاً.\n\nانطلقت منصتنا لتمكين المزارعين الشباب بالأدوات والبيانات والمهارات اللازمة لمواجهة تحديات الأمن الغذائي في القرن الحادي والعشرين، محولين الزراعة من مهنة شاقة إلى قطاع ابتكاري مستدام.",
    image1: "https://images.unsplash.com/photo-1592982537447-6f29fb25ff71?q=80&w=800&auto=format&fit=crop",
    image2: "https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?q=80&w=800&auto=format&fit=crop",
    badge: "قصتنا"
  },
  visionMission: {
    vision: {
      title: "رؤيتنا",
      description: "أن نصبح المنصة الرائدة عالمياً في تمكين المجتمعات الزراعية من خلال الابتكار الرقمي، لنخلق مستقبلاً يزدهر فيه الإنسان والأرض معاً.",
      icon: "visibility"
    },
    mission: {
      title: "رسالتنا",
      description: "توفير تعليم زراعي عالي الجودة سهل الوصول إليه يربط المبتكرين بالموارد والخبرات اللازمة.",
      icon: "target"
    },
    values: [
      {
        title: "الاستدامة",
        description: "نلتزم بتعزيز الممارسات الزراعية التي تحافظ على البيئة وتضمن استمرارية الموارد للأجيال القادمة.",
        icon: "eco"
      },
      {
        title: "المجتمع",
        description: "بناء شبكة قوية من الخبراء والمزارعين والطلاب لتبادل المعرفة والنمو المشترك.",
        icon: "groups"
      },
      {
        title: "الابتكار",
        description: "نتبنى أحدث تقنيات الذكاء الاصطناعي وتحليل البيانات لتطوير حلول زراعية ذكية.",
        icon: "psychology"
      }
    ]
  },
  stats: [
    { label: "طالب ومتعلم", value: "50,000+" },
    { label: "دورة تدريبية", value: "100+" },
    { label: "دولة مشاركة", value: "15" },
    { label: "دعم فني", value: "24/7" }
  ],
  team: {
    title: "فريق العمل",
    subtitle: "نخبة من الخبراء المتخصصين لتغيير مستقبل الزراعة",
    members: [
      {
        name: "أحمد المنصوري",
        role: "المؤسس والمدير التنفيذي",
        image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400&auto=format&fit=crop"
      },
      {
        name: "د. سارة خالد",
        role: "خبير ذكاء اصطناعي",
        image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&auto=format&fit=crop"
      },
      {
        name: "م. عمر ياسين",
        role: "خبير علوم زراعية",
        image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop"
      },
      {
        name: "ليلى حسن",
        role: "مصممة تجربة المستخدم",
        image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=400&auto=format&fit=crop"
      }
    ]
  },
  cta: {
    title: "هل أنت مستعد لبدء رحلتك الزراعية؟",
    subtitle: "انضم إلى آلاف المبتكرين الذين بدأوا بالفعل في تشكيل مستقبل الغذاء، ابدأ تعلمك اليوم مع AgriVinka",
    primaryBtn: "انضم إلينا الآن",
    secondaryBtn: "تصفح الدورات"
  }
};

export const aboutService = {
  getAboutPage: async () => {
    try {
      const docRef = doc(db, COLLECTION_NAME, PAGE_ID);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { ...defaultAboutData, ...docSnap.data() };
      }
      return defaultAboutData;
    } catch (error) {
      console.error("Error fetching about page:", error);
      throw error;
    }
  },

  updateAboutPage: async (data) => {
    try {
      const docRef = doc(db, COLLECTION_NAME, PAGE_ID);
      await setDoc(docRef, data, { merge: true });
    } catch (error) {
      console.error("Error updating about page:", error);
      throw error;
    }
  }
};
