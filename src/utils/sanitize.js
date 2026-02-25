/**
 * Input Sanitization and Validation Utility
 * Prevents XSS and ensures data integrity
 */

/**
 * Sanitize HTML string to prevent XSS attacks
 */
export const sanitizeHtml = (html) => {
  if (!html) return '';
  
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
};

/**
 * Sanitize user input for emails
 */
export const sanitizeEmail = (email) => {
  if (!email) return '';
  
  // Basic email validation and sanitization
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const trimmed = email.trim().toLowerCase();
  
  return emailRegex.test(trimmed) ? trimmed : '';
};

/**
 * Sanitize payment-related inputs
 */
export const sanitizePaymentData = (data) => {
  if (!data || typeof data !== 'object') return null;

  return {
    firstName: sanitizeHtml((data.firstName || '').trim()).substring(0, 50),
    lastName: sanitizeHtml((data.lastName || '').trim()).substring(0, 50),
    email: sanitizeEmail(data.email),
    phone: sanitizePhone(data.phone),
    courseId: sanitizeAlphanumeric(data.courseId),
    price: sanitizePrice(data.price),
    paymentMethod: sanitizeAlphanumeric(data.paymentMethod),
    notes: sanitizeHtml((data.notes || '').trim()).substring(0, 500),
    bankName: sanitizeHtml((data.bankName || '').trim()).substring(0, 100),
    accountNumber: sanitizeAlphanumeric((data.accountNumber || '').replace(/\s/g, ''))
  };
};

/**
 * Sanitize phone number
 */
export const sanitizePhone = (phone) => {
  if (!phone) return '';
  
  // Remove all non-digit characters except +
  const cleaned = phone.replace(/[^\d+]/g, '');
  
  // Validate basic phone format
  if (cleaned.length < 7 || cleaned.length > 15) return '';
  
  return cleaned;
};

/**
 * Sanitize price/currency values
 */
export const sanitizePrice = (price) => {
  if (!price) return 0;
  
  const num = parseFloat(price);
  
  // Validate it's a positive number and not too large
  if (isNaN(num) || num < 0 || num > 1000000) return 0;
  
  // Round to 2 decimal places
  return Math.round(num * 100) / 100;
};

/**
 * Sanitize alphanumeric strings (for IDs, codes, etc)
 */
export const sanitizeAlphanumeric = (str) => {
  if (!str) return '';
  
  return String(str).replace(/[^a-zA-Z0-9-_]/g, '').substring(0, 255);
};

/**
 * Validate uploaded file
 */
export const validateUploadedFile = (file, options = {}) => {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  } = options;

  if (!file) return { valid: false, error: 'No file provided' };
  
  // Check file size
  if (file.size > maxSize) {
    return { valid: false, error: `File size exceeds ${maxSize / 1024 / 1024}MB limit` };
  }

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Invalid file type' };
  }

  // Verify file extension matches MIME type
  const extension = file.name.split('.').pop().toLowerCase();
  const validExtensions = {
    'image/jpeg': ['jpg', 'jpeg'],
    'image/png': ['png'],
    'image/webp': ['webp'],
    'image/gif': ['gif']
  };

  if (!validExtensions[file.type]?.includes(extension)) {
    return { valid: false, error: 'File extension does not match file type' };
  }

  return { valid: true };
};

/**
 * Escape special characters for safe display
 */
export const escapeForDisplay = (str) => {
  if (!str) return '';
  
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};
