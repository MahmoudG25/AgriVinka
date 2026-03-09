export const validateCourse = (course) => {
  const errors = [];
  const warnings = [];

  // Critical Errors (Block Import)
  if (!course.title || course.title.length < 3) {
    errors.push('Title is required and must be at least 3 characters.');
  }

  // Check if ID is present (it should be normalized by now)
  if (!course.id) {
    errors.push('Could not generate a valid ID/Slug from the title.');
  }

  if (!course.description || course.description.length < 10) {
    errors.push('Description is required (min 10 chars).');
  }

  if (course.pricing && course.pricing.price < 0) {
    errors.push('Price cannot be negative.');
  }

  // Warnings (Allow Import but Flag)
  if (!course.media || !course.media.thumbnail) {
    warnings.push('Missing thumbnail image.');
  } else {
    try {
      new URL(course.media.thumbnail);
    } catch {
      warnings.push('Thumbnail URL appears to be invalid.');
    }
  }

  if (!course.instructor || !course.instructor.name) {
    warnings.push('Instructor name is missing.');
  }

  if (!course.sections || course.sections.length === 0) {
    warnings.push('Course has no sections/lessons.');
  }

  if (!course.learning_points || course.learning_points.length === 0) {
    warnings.push('No learning points provided.');
  }

  return { isValid: errors.length === 0, errors, warnings };
};
