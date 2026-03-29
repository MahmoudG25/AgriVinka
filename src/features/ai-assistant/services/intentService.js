// Intent detection for AI assistant.
// This is a heuristic layer; it can be replaced by an ML classification endpoint.

const plantKeywords = [
  'نبات', 'مرض', 'أوراق', 'ذبابة', 'عفن', 'اصفرار', 'تساقط', 'pest', 'leaf', 'infection', 'plant', 'disease', 'crop', 'fungus'
];

const courseKeywords = [
  'دورة', 'مسار', 'تعلم', 'course', 'path', 'training', 'skill'
];

const generalKeywords = [
  'كيف', 'ما', 'ماذا', 'لماذا', 'when', 'where', 'how', 'why', 'help', 'support'
];

const toComparable = (txt = '') => String(txt).toLowerCase();

export const detectIntent = ({ text = '', hasImage = false }) => {
  const normalized = toComparable(text);

  // If explicit plant keywords present, set plant_analysis
  const hasPlantWord = plantKeywords.some(k => normalized.includes(k));
  const hasCourseWord = courseKeywords.some(k => normalized.includes(k));
  const hasGeneralWord = generalKeywords.some(k => normalized.includes(k));

  if (hasPlantWord && (hasImage || normalized.length > 0)) {
    return { intent: 'plant_analysis', confidence: 0.95 };
  }

  if (hasImage && !hasPlantWord) {
    // image only or ambiguous text
    return { intent: 'plant_analysis', confidence: 0.65 };
  }

  if (hasCourseWord) {
    return { intent: 'course_recommendation', confidence: 0.85 };
  }

  if (hasGeneralWord || normalized.trim().length > 0) {
    return { intent: 'general_question', confidence: 0.8 };
  }

  return { intent: 'general_question', confidence: 0.5 };
};

export const isAffirmative = (text = '') => {
  const norm = toComparable(text).trim();
  return ['نعم', 'ايوه', 'ا', 'yes', 'y', 'أكيد', 'أكيداً'].some(w => norm === w || norm.startsWith(`${w} `));
};

export const isNegative = (text = '') => {
  const norm = toComparable(text).trim();
  return ['لا', 'لأ', 'not', 'no'].some(w => norm === w || norm.startsWith(`${w} `));
};
