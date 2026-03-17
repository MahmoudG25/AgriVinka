/**
 * Normalizes frontend roadmap config + Firebase course data for the UI.
 *
 * @param {Object} config - The lightweight roadmap config from roadmapConfigs.js
 * @param {Array}  courses - Array of full course documents from Firestore
 * @returns {Object} Normalized data for each section
 */
export const adaptPathData = (config, courses) => {
  if (!config) return null;

  const courseList = courses || [];

  // ── Resolve image from course fields ──
  const resolveImage = (course) => {
    return (
      course?.image ||
      course?.media?.thumbnail ||
      course?.preview_image ||
      ''
    );
  };

  // ── Parse duration string to hours (best-effort) ──
  const parseHours = (durationStr) => {
    if (!durationStr) return 0;
    const match = String(durationStr).match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  };

  // ── Normalize each course into a module shape ──
  const normalizedModules = courseList.map((course, idx) => {
    const outcomes = course.learning_points || course.outcomes || [];
    const skills = course.skills || course.tags || [];
    const lessonsCount = course.sections
      ? course.sections.reduce((acc, sec) => acc + (sec.lessons?.length || 0), 0)
      : (course.lessons_count || 0);

    return {
      id: course.id,
      title: course.title,
      description: course.description,
      duration: course.meta?.duration || course.duration || '',
      image: resolveImage(course),
      order: idx + 1,
      outcomes,
      skills,
      level: course.meta?.level || course.level || '',
      lessonsCount,
      sectionsCount: course.sections?.length || 0
    };
  });

  // ── Aggregate learning points (unique, up to 8) ──
  const aggregatedOutcomes = normalizedModules
    .flatMap((m) => m.outcomes)
    .filter((item, index, self) => item && self.indexOf(item) === index)
    .slice(0, 8);

  // ── Aggregate skills (unique, up to 12) — ONLY from real data ──
  const aggregatedSkills = normalizedModules
    .flatMap((m) => m.skills)
    .filter((item, index, self) => item && self.indexOf(item) === index)
    .slice(0, 12);

  // ── Derive total duration (only if parseable) ──
  const totalHours = normalizedModules.reduce(
    (sum, m) => sum + parseHours(m.duration),
    0
  );

  // ── Instructor (from config, fallback) ──
  const instructor = config.instructor || {
    name: 'AgriVinka Team',
    role: 'Instructor',
    image: '',
    bio: ''
  };

  return {
    meta: {
      id: Object.keys(config).length ? undefined : undefined, // id comes from URL param
      title: config.title,
      coursesCount: courseList.length,
      language: 'العربية'
    },
    hero: {
      title: config.title,
      description: config.description,
      level: config.level || '',
      duration: totalHours > 0 ? `${totalHours} ساعة` : '',
      coursesCount: courseList.length
    },
    sidebar: {
      pricing: {
        price: config.price || null,
        discount: config.discount || 0,
        currency: '$',
        features: [
          'وصول مدى الحياة',
          'شهادة إتمام معتمدة',
          'ملفات المشاريع',
          'دعم فني متميز'
        ]
      },
      instructor: { ...instructor },
      delivery: {
        type: 'أونلاين',
        subtitle: 'وصول فوري بعد التسجيل.'
      }
    },
    overview: {
      outcomes: aggregatedOutcomes
    },
    skills: {
      items: aggregatedSkills
    },
    modules: normalizedModules
  };
};
