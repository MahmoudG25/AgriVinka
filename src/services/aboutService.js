import { db } from '../firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const COLLECTION_NAME = 'pages';
const PAGE_ID = 'about';

export const defaultAboutData = {
  hero: {
    title: "من نحن",
    description: "نحن لا نكتفي بنقل الخبر، بل نصنع الحدث. تهدف AgriVinka إلى دعم المبدعين، توثيق التراث، وتعزيز الحوار الثقافي.",
    image: "", // URL from MediaUploader
    initiatives: [
      {
        id: "init-1",
        icon: "menu_book",
        title: "مشروع التوثيق الرقمي",
        description: "أرشفة رقمية للتراث الشفهي والمكتوب باستخدام أحدث التقنيات."
      },
      {
        id: "init-2",
        icon: "palette",
        title: "حاضنة الفنون البصرية",
        description: "دعم الفنانين الشباب عبر ورش عمل ومعارض افتراضية وواقعية."
      },
      {
        id: "init-3",
        icon: "forum",
        title: "منتدى الحوار العربي",
        description: "سلسلة ندوات تجمع المفكرين لمناقشة تحديات وفرص المستقبل."
      }
    ]
  },
  quote: {
    text: "في AgriVinka، نؤمن بأن هويتنا هي بوصلتنا نحو المستقبل. نكتب بلغتنا، ونحلم بطموحنا، ونبني بأيدينا.",
    author: "فريق التحرير"
  },
  story: {
    title: "قصة AgriVinka",
    content: "تأسست منصة AgriVinka لتكون منارة إعلامية وثقافية تجمع شتات المبدعين العرب. انطلقنا من فكرة بسيطة: أن المحتوى العربي يستحق أن يقدم بأعلى معايير الجودة والاحترافية.\n\nفريقنا يتكون من نخبة من الكتاب، الفنانين، والمطورين الشغوفين بإبراز الوجه المشرق لحضارتنا. نسعى لبناء مجتمع تفاعلي يثري المحتوى العربي على الإنترنت.",
    image1: "",
    image2: ""
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
