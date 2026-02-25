import { v4 as uuidv4 } from 'uuid';
import { slugify } from '../utils/slugify';

export const normalizeCourse = (rawItem) => {
  const item = { ...rawItem };

  // 1. Basic String Normalization
  const trim = (str) => typeof str === 'string' ? str.trim() : '';
  const toNum = (val) => {
    if (typeof val === 'number') return val;
    if (typeof val === 'string') {
      const cleaned = val.replace(/[$,]/g, '').trim();
      if (cleaned.toLowerCase() === 'free') return 0;
      return parseFloat(cleaned) || 0;
    }
    return 0;
  };
  const toBool = (val) => {
    if (typeof val === 'boolean') return val;
    if (typeof val === 'string') {
      return ['true', 'yes', '1', 'y'].includes(val.toLowerCase());
    }
    return false;
  };

  // 2. Title & ID
  const title = trim(item.title);
  let id = trim(item.id);
  // Generate slug if ID is missing. Note: Uniqueness check happens later in the batch process.
  if (!id && title) {
    id = slugify(title);
  } else if (id) {
    id = slugify(id); // Ensure provided ID is also URL-safe
  }

  // 3. Pricing Logic
  const price = toNum(item.pricing?.price);
  const original_price = toNum(item.pricing?.original_price);
  let discount = toNum(item.pricing?.discount_percentage);

  if (!discount && original_price > price && original_price > 0) {
    discount = Math.round(((original_price - price) / original_price) * 100);
  }

  // 4. Structure Construction
  const normalized = {
    id: id,
    title: title,
    short_title: trim(item.short_title) || trim(item.title),
    description: trim(item.description),

    pricing: {
      price: price,
      original_price: original_price,
      discount_percentage: discount
    },

    meta: {
      duration: trim(item.meta?.duration),
      level: trim(item.meta?.level || 'Beginner'),
      certificate: toBool(item.meta?.certificate || true),
      rating: toNum(item.meta?.rating || 0),
      reviews_count: toNum(item.meta?.reviews_count || 0)
    },

    media: {
      thumbnail: trim(item.media?.thumbnail),
      preview_video: trim(item.media?.preview_video)
    },

    instructor: {
      name: trim(item.instructor?.name),
      title: trim(item.instructor?.title),
      bio: trim(item.instructor?.bio),
      image: trim(item.instructor?.image)
    },

    learning_points: [],
    sections: []
  };

  // 5. Array Handling
  if (Array.isArray(item.learning_points)) {
    normalized.learning_points = item.learning_points.map(trim).filter(Boolean);
  } else if (typeof item.learning_points === 'string') {
    normalized.learning_points = item.learning_points.split(/[;\n]/).map(trim).filter(Boolean);
  }

  // 6. Sections & Lessons
  if (Array.isArray(item.sections)) {
    normalized.sections = item.sections.map(sec => {
      const sectionId = sec.id || uuidv4();
      const lessons = Array.isArray(sec.lessons) ? sec.lessons.map(lesson => ({
        id: lesson.id || uuidv4(),
        title: trim(lesson.title),
        duration: trim(lesson.duration) || '0:00',
        free_preview: toBool(lesson.free_preview)
      })) : [];

      return {
        id: sectionId,
        title: trim(sec.title || 'New Section'),
        duration: trim(sec.duration), // Optional, can be computed but keeping as is
        lessons: lessons
      };
    });
  }

  return normalized;
};
