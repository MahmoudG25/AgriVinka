# 🛠️ Production Utilities & Best Practices Guide

Quick reference guide for using the new production-grade utilities in AgriVinka

---

## 📖 Table of Contents
1. [Logging](#logging)
2. [SEO](#seo)
3. [Security & Sanitization](#security--sanitization)
4. [Image Optimization](#image-optimization)
5. [Accessibility](#accessibility)

---

## 🔍 Logging

### Overview
Development-aware logging that only shows console messages in development mode.

### Usage

```javascript
import { logger } from '@/utils/logger';

// These only log in development mode (import.meta.env.DEV)
logger.log('Debug message', data);
logger.error('Error occurred:', error);
logger.warn('Warning message', warning);
logger.info('Info message', info);
logger.debug('Debug message', debug);
```

### Example in Components
```jsx
useEffect(() => {
  const fetchData = async () => {
    try {
      const result = await someService.getData();
      setData(result);
    } catch (error) {
      logger.error('Failed to fetch data:', error); // Only logs in DEV
    }
  };
  fetchData();
}, []);
```

---

## 🎯 SEO

### Overview
Complete SEO management system with dynamic meta tags, structured data, and sitemap support.

### Core Components

#### SEOHead Component (React)
Manages per-page SEO settings including meta tags and structured data.

```jsx
import SEOHead from '@/components/common/SEOHead';
import { generateCourseSchema } from '@/utils/seo';

export default function CoursePage() {
  const course = { /* course data */ };

  return (
    <>
      <SEOHead
        title={course.title}
        description={course.description}
        image={course.image}
        keywords="البرمجة, كورسات, تعليم"
        structuredData={generateCourseSchema({
          id: course.id,
          name: course.title,
          description: course.description,
          image: course.image,
          url: window.location.href,
          price: course.price
        })}
      />
      <main>
        {/* Page content */}
      </main>
    </>
  );
}
```

#### SEO Utilities

```javascript
import {
  updatePageMeta,
  updateMetaTag,
  updateCanonical,
  addStructuredData,
  generateCourseSchema,
  generateOrganizationSchema,
  generateBreadcrumbSchema,
  getFullUrl
} from '@/utils/seo';

// Update meta tags
updatePageMeta({
  title: 'Page Title',
  description: 'Page description',
  image: 'https://example.com/image.png',
  url: window.location.href,
  keywords: 'keyword1, keyword2'
});

// Add structured data
addStructuredData(generateOrganizationSchema());

// Generate full URL
const url = getFullUrl('/courses'); // https://agrivinka.com/courses
```

### Files
- SEO Utility: `src/utils/seo.js`
- React Component: `src/components/common/SEOHead.jsx`
- Sitemap: `public/sitemap.xml`
- Robots: `public/robots.txt`

---

## 🔒 Security & Sanitization

### Overview
Input validation and sanitization to prevent XSS and ensure data integrity.

### Core Functions

```javascript
import {
  sanitizeHtml,
  sanitizeEmail,
  sanitizePaymentData,
  sanitizePhone,
  sanitizePrice,
  sanitizeAlphanumeric,
  validateUploadedFile,
  escapeForDisplay
} from '@/utils/sanitize';

// Sanitize form inputs
const email = sanitizeEmail(userInput); // 'user@example.com'
const phone = sanitizePhone(userInput); // '+1234567890'
const price = sanitizePrice(userInput); // 99.99

// Complete payment data sanitization
const formData = sanitizePaymentData({
  firstName: 'Ahmed',
  lastName: 'Ali',
  email: 'user@example.com',
  phone: '+201234567890',
  courseId: 'course-123',
  price: 99.99,
  paymentMethod: 'bank_transfer',
  notes: 'Any customer notes'
});

// Validate uploaded files
const validation = validateUploadedFile(file, {
  maxSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp']
});

if (!validation.valid) {
  console.error(validation.error);
}

// Safe HTML display
const safeHtml = escapeForDisplay(userContent);
```

### Firestore Rules
Rules in `firestore.rules` ensure:
- Public can read courses/roadmaps (no write)
- Admin-only write/update/delete
- Only authenticated users can modify data
- Custom JWT claim check for admin status

### Example Implementation
```jsx
const handlePaymentSubmit = async (formData) => {
  try {
    // Sanitize all inputs
    const sanitized = sanitizePaymentData(formData);
    
    // Validate
    if (!sanitized.email || !sanitized.price) {
      throw new Error('Invalid data');
    }
    
    // Submit to Firebase
    const orderId = await orderService.createOrder(sanitized);
    return orderId;
  } catch (error) {
    logger.error('Payment error:', error);
    throw error;
  }
};
```

---

## 🖼️ Image Optimization

### Overview
Cloudinary optimization with automatic format selection, responsive images, and lazy loading.

### Components

#### ImageWithFallback
Basic image with fallback and lazy loading.

```jsx
import { ImageWithFallback } from '@/utils/imageUtils';

<ImageWithFallback
  src="https://res.cloudinary.com/.../image.jpg"
  alt="Product image"
  className="w-full h-auto"
  loading="lazy"
  optimize={true} // Applies Cloudinary optimization
/>
```

#### ResponsiveImage
Advanced responsive images with srcSet.

```jsx
import { ResponsiveImage } from '@/utils/imageUtils';

<ResponsiveImage
  src="https://res.cloudinary.com/.../image.jpg"
  alt="Course thumbnail"
  className="rounded-lg"
  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
  optimize={true}
/>
```

#### Manual Optimization

```javascript
import { optimizeCloudinaryUrl, getResponsiveImageUrl } from '@/utils/imageUtils';

// Optimize single URL
const optimized = optimizeCloudinaryUrl(url, {
  width: 800,
  height: 600,
  quality: 'auto',
  format: 'auto'
});

// Get responsive URLs
const responsive = getResponsiveImageUrl(url, {
  mobile: 480,
  tablet: 768,
  desktop: 1200
});

// Use in srcSet
<img
  src={responsive.desktop}
  srcSet={`${responsive.mobile} 480w, ${responsive.tablet} 768w, ${responsive.desktop} 1200w`}
  alt="Description"
/>
```

### Cloudinary Transformations
- `f_auto` - Auto format (WebP, AVIF, etc)
- `q_auto` - Auto quality based on browser
- `w_*` - Width in pixels
- `h_*` - Height in pixels
- `c_fill` - Crop to fill dimensions

### Best Practices
1. Always use `optimize={true}` for Cloudinary URLs
2. Use `ResponsiveImage` for hero/banner images
3. Use `ImageWithFallback` for product/course thumbnails
4. Always provide descriptive `alt` text
5. Test images on slow connections (DevTools 3G)

---

## ♿ Accessibility (A11Y)

### Overview
Accessibility utilities for WCAG 2.1 compliance covering focus management, ARIA, and keyboard navigation.

### Focus Management

```javascript
import { focusManagement } from '@/utils/a11y';

// Get all focusable elements
const focusable = focusManagement.getFocusableElements(container);

// Focus first element (useful for modals)
focusManagement.focusFirstElement(modalElement);

// Focus last element
focusManagement.focusLastElement(modalElement);

// Trap focus (for modal escape handling)
const handleKeyDown = (e) => {
  if (e.key === 'Tab') {
    focusManagement.trapFocus(e, modalElement);
  }
};
```

### ARIA Utilities

```javascript
import { ariaHelpers } from '@/utils/a11y';

// Generate unique IDs
const labelId = ariaHelpers.generateId('label'); // 'label-a1b2c3d4e'

// Set loading state
const element = document.getElementById('content');
ariaHelpers.setLoadingState(element, true);

// Set error state
ariaHelpers.setErrorState(inputElement, errorMessage, 'error-123');

// Announce to screen readers
ariaHelpers.announce('Order placed successfully!', 'polite');
ariaHelpers.announce('Critical error occurred', 'assertive');
```

### Keyboard Navigation

```javascript
import { keyboardHelpers } from '@/utils/a11y';

const handleKeyDown = (e) => {
  if (keyboardHelpers.isActivationKey(e)) {
    // Handle Enter or Space
  }
  
  if (keyboardHelpers.isEscapeKey(e)) {
    // Close modal or panel
  }
  
  if (keyboardHelpers.isArrowKey(e)) {
    const direction = keyboardHelpers.getArrowDirection(e);
    // Handle arrow up/down/left/right
  }
};
```

### Color Contrast Checking

```javascript
import { contrastChecker } from '@/utils/a11y';

// Check contrast ratio
const ratio = contrastChecker.getContrastRatio(
  [255, 0, 0],  // Red RGB
  [255, 255, 255]  // White RGB
);

// Check WCAG AA compliance
const isCompliant = contrastChecker.meetsAAStandard(
  [255, 0, 0], // Foreground
  [255, 255, 255], // Background
  false // isLargeText (18px+ or 14px+ bold)
);
```

### React Component Example

```jsx
import { useRef } from 'react';
import { focusManagement, ariaHelpers, keyboardHelpers } from '@/utils/a11y';

export function AccessibleDialog({ onClose }) {
  const dialogRef = useRef();

  const handleKeyDown = (e) => {
    if (keyboardHelpers.isEscapeKey(e)) {
      onClose();
    }
    if (e.key === 'Tab') {
      focusManagement.trapFocus(e, dialogRef.current);
    }
  };

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
      onKeyDown={handleKeyDown}
    >
      <h2 id="dialog-title">Dialog Title</h2>
      <button onClick={onClose} aria-label="Close dialog">×</button>
    </div>
  );
}
```

### Common ARIA Labels

```javascript
import { ariaLabels } from '@/utils/a11y';

<button aria-label={ariaLabels.closeButton}>×</button>
<button aria-label={ariaLabels.openMenu}>☰</button>
<button aria-label={ariaLabels.search}>🔍</button>
<div aria-label={ariaLabels.loadingData}>Loading...</div>
```

---

## 🚀 Performance Tips

1. **Use Lazy Loading** - All pages use React.lazy() + Suspense
2. **Optimize Images** - Always use imageUtils for Cloudinary
3. **Split Code** - Admin pages already in separate chunk
4. **Tree Shake** - Remove unused imports (Vite handles this)
5. **Monitor Bundle** - Check `npm run build` output

## 🧪 Testing Utilities

```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Check for unused code
npm run lint

# Check bundle size
# Use: https://github.com/vitejs/vite-plugin-visualizer
```

---

## 📚 Additional Resources

- SEO Guide: See `PRODUCTION_DEPLOYMENT.md`
- Firestore Demo: Check `src/services/*.js`
- Component Examples: Check `src/pages/Home.jsx`
- Vite Docs: https://vitejs.dev/
- Firebase Docs: https://firebase.google.com/docs
- WCAG 2.1: https://www.w3.org/WAI/WCAG21/quickref/

---

## ✅ Quick Checklist for New Features

When adding new features:
- [ ] Use SEOHead component if public-facing page
- [ ] Use logger instead of console
- [ ] Sanitize all user inputs
- [ ] Use ImageWithFallback for images
- [ ] Add ARIA labels where needed
- [ ] Test with keyboard navigation
- [ ] Check mobile responsiveness
- [ ] Verify performance impact

---

**Ready to build production features! 🚀**
