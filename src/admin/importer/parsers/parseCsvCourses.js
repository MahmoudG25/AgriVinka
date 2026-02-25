import { v4 as uuidv4 } from 'uuid';

// Simple CSV parser that handles quotes and mixed content
const parseCSV = (text) => {
  const rows = [];
  let currentRow = [];
  let currentCell = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        // Escaped quote
        currentCell += '"';
        i++; // Skip next quote
      } else if (char === '"') {
        // End of quoted cell
        inQuotes = false;
      } else {
        currentCell += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        currentRow.push(currentCell.trim());
        currentCell = '';
      } else if (char === '\n' || char === '\r') {
        // Handle CRLF or LF
        if (char === '\r' && nextChar === '\n') {
          i++;
        }

        currentRow.push(currentCell.trim());
        if (currentRow.length > 0 && (currentRow.length > 1 || currentRow[0] !== '')) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentCell = '';
      } else {
        currentCell += char;
      }
    }
  }

  // Push last row if exists
  if (currentCell || currentRow.length > 0) {
    currentRow.push(currentCell.trim());
    if (currentRow.length > 0) rows.push(currentRow);
  }

  return rows;
};

export const parseCsvCourses = (csvString) => {
  try {
    const rows = parseCSV(csvString);
    if (rows.length < 2) {
      return { items: [], errors: ['CSV must have at least a header row and one data row'] };
    }

    const headers = rows[0].map(h => h.toLowerCase().replace(/[\s_]+/g, ''));
    const dataRows = rows.slice(1);

    const items = dataRows.map((row, rowIndex) => {
      const item = {};
      // Initialize nested objects
      item.pricing = {};
      item.media = {};
      item.instructor = {};
      item.meta = {};

      row.forEach((cell, index) => {
        if (index >= headers.length) return;
        const header = headers[index];

        // Map headers to schema
        if (['title', 'name', 'coursetitle'].includes(header)) item.title = cell;
        else if (['id', 'slug', 'courseid'].includes(header)) item.id = cell;
        else if (['description', 'desc', 'details'].includes(header)) item.description = cell;
        else if (['shorttitle', 'subtitle'].includes(header)) item.short_title = cell;

        // Pricing
        else if (['price', 'cost'].includes(header)) item.pricing.price = cell;
        else if (['originalprice', 'oldprice'].includes(header)) item.pricing.original_price = cell;
        else if (['discount', 'discountpercentage'].includes(header)) item.pricing.discount_percentage = cell;

        // Media
        else if (['thumbnail', 'image', 'cover', 'imageurl', 'img'].includes(header)) item.media.thumbnail = cell;
        else if (['video', 'preview', 'previewvideo'].includes(header)) item.media.preview_video = cell;

        // Instructor
        else if (['instructor', 'instructorname', 'teacher'].includes(header)) item.instructor.name = cell;
        else if (['instructortitle', 'jobtitle'].includes(header)) item.instructor.title = cell;
        else if (['instructorbio', 'bio'].includes(header)) item.instructor.bio = cell;
        else if (['instructorimage', 'teacherimage'].includes(header)) item.instructor.image = cell;

        // Meta
        else if (['duration', 'length'].includes(header)) item.meta.duration = cell;
        else if (['level', 'difficulty'].includes(header)) item.meta.level = cell;
        else if (['certificate'].includes(header)) item.meta.certificate = cell;

        // Arrays (simple split)
        else if (['learningpoints', 'whatwilleyoulearn', 'points'].includes(header)) {
          item.learning_points = cell.split(/[;\n]/).map(s => s.trim()).filter(Boolean);
        }
      });
      return item;
    });

    return { items, errors: [] };

  } catch (error) {
    return { items: [], errors: [`CSV Parse Error: ${error.message}`] };
  }
};
