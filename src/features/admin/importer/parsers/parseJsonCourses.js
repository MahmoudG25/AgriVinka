import { v4 as uuidv4 } from 'uuid';

export const parseJsonCourses = (jsonString) => {
  try {
    const parsed = JSON.parse(jsonString);
    let items = [];

    if (Array.isArray(parsed)) {
      items = parsed;
    } else if (typeof parsed === 'object' && parsed !== null) {
      items = [parsed];
    } else {
      return { items: [], errors: ['Invalid JSON format: Must be an array or an object'] };
    }

    // Basic mapping for common aliases
    const mappedItems = items.map(item => {
      // Create a copy to avoid mutating original if needed, 
      // though here we are constructing a new object significantly.
      // We'll maintain unknown keys as-is for the normalizer to handle or drop,
      // but we'll try to map common variations to the standard schema first.

      const newItem = { ...item };

      // Title aliases
      if (!newItem.title && newItem.course_title) newItem.title = newItem.course_title;
      if (!newItem.title && newItem.name) newItem.title = newItem.name;

      // Description aliases
      if (!newItem.description && newItem.desc) newItem.description = newItem.desc;
      if (!newItem.description && newItem.course_description) newItem.description = newItem.course_description;
      if (!newItem.description && newItem.details) newItem.description = newItem.details;

      // Price aliases
      if (!newItem.pricing) newItem.pricing = {};
      if (newItem.price !== undefined) newItem.pricing.price = newItem.price;
      if (newItem.cost !== undefined) newItem.pricing.price = newItem.cost;
      if (newItem.original_price !== undefined) newItem.pricing.original_price = newItem.original_price;
      if (newItem.old_price !== undefined) newItem.pricing.original_price = newItem.old_price;

      // Media aliases
      if (!newItem.media) newItem.media = {};
      if (newItem.thumbnail) newItem.media.thumbnail = newItem.thumbnail;
      if (newItem.image) newItem.media.thumbnail = newItem.image;
      if (newItem.cover) newItem.media.thumbnail = newItem.cover;
      if (newItem.imageUrl) newItem.media.thumbnail = newItem.imageUrl;
      if (newItem.preview_video || newItem.video || newItem.preview) {
        newItem.media.preview_video = newItem.preview_video || newItem.video || newItem.preview;
      }

      // Instructor aliases
      if (!newItem.instructor) newItem.instructor = {};
      if (newItem.instructor_name) newItem.instructor.name = newItem.instructor_name;
      if (newItem.teacher) newItem.instructor.name = newItem.teacher;
      if (newItem.instructor_image) newItem.instructor.image = newItem.instructor_image;
      if (newItem.instructor_bio) newItem.instructor.bio = newItem.instructor_bio;

      // Meta aliases
      if (!newItem.meta) newItem.meta = {};
      if (newItem.duration) newItem.meta.duration = newItem.duration;
      if (newItem.level) newItem.meta.level = newItem.level;

      return newItem;
    });

    return { items: mappedItems, errors: [] };
  } catch (error) {
    return { items: [], errors: [`JSON Parse Error: ${error.message}`] };
  }
};
