import React, { useState } from 'react';

// Default fallback image
const DEFAULT_FALLBACK = "https://placehold.co/600x400?text=No+Image";

/**
 * Validates if a URL is a valid remote URL (http/https).
 * Rejects local paths like /src/assets or relative paths.
 * @param {string} url 
 * @returns {boolean}
 */
export const validateImageUrl = (url) => {
  if (!url) return false;
  if (typeof url !== 'string') return false;

  // Must start with http:// or https://
  // In DEV, allow local paths starting with /
  if (import.meta.env.DEV && (url.startsWith('/') || url.startsWith('./'))) {
    return true;
  }

  return url.startsWith('http://') || url.startsWith('https://');
};

/**
 * Returns the URL if valid, otherwise returns the fallback.
 * @param {string} url 
 * @param {string} fallbackUrl 
 * @returns {string}
 */
export const getValidImageUrl = (url, fallbackUrl = DEFAULT_FALLBACK) => {
  return validateImageUrl(url) ? url : fallbackUrl;
};

/**
 * Generates Cloudinary optimized URL with auto format and quality
 * @param {string} url - Original Cloudinary URL or image URL
 * @param {object} options - Cloudinary transformation options
 * @returns {string} - Optimized URL
 */
export const optimizeCloudinaryUrl = (url, options = {}) => {
  if (!url || !url.includes('cloudinary.com')) {
    return url;
  }

  const {
    width,
    height,
    quality = 'auto', // 'auto' lets Cloudinary choose based on browser
    format = 'auto',   // 'auto' uses best format (webp, etc)
    crop = 'fill',
    gravity = 'auto'
  } = options;

  // Extract Cloudinary upload URL parts
  const parts = url.split('/upload/');
  if (parts.length !== 2) return url;

  const [cloudinaryBase, imagePath] = parts;
  
  // Build transformation string
  const transformations = [];
  
  if (format && format !== 'auto') {
    transformations.push(`f_${format}`);
  } else {
    transformations.push('f_auto'); // Auto format
  }
  
  if (quality) {
    transformations.push(`q_${quality}`);
  }
  
  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  if (crop) transformations.push(`c_${crop}`);
  if (gravity) transformations.push(`g_${gravity}`);

  const transformString = transformations.join(',');
  
  return `${cloudinaryBase}/upload/${transformString}/${imagePath}`;
};

/**
 * Generate responsive image URLs for different breakpoints
 */
export const getResponsiveImageUrl = (url, breakpoints = {}) => {
  const defaults = {
    mobile: 480,
    tablet: 768,
    desktop: 1200,
    ...breakpoints
  };

  return {
    mobile: optimizeCloudinaryUrl(url, { width: defaults.mobile }),
    tablet: optimizeCloudinaryUrl(url, { width: defaults.tablet }),
    desktop: optimizeCloudinaryUrl(url, { width: defaults.desktop }),
    original: url
  };
};

/**
 * Image component that handles local path validation and load errors.
 * Replaces invalid or broken images with a fallback.
 * Includes lazy loading and responsive image support.
 */
export const ImageWithFallback = ({ 
  src, 
  fallbackSrc = DEFAULT_FALLBACK, 
  alt, 
  className, 
  loading = 'lazy',
  optimize = true,
  ...props 
}) => {
  const [imgSrc, setImgSrc] = useState(() => {
    const validUrl = getValidImageUrl(src, fallbackSrc);
    return optimize ? optimizeCloudinaryUrl(validUrl) : validUrl;
  });
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(fallbackSrc);
    }
  };

  // If the prop src changes, we need to reset unless we already fell back
  React.useEffect(() => {
    const validUrl = getValidImageUrl(src, fallbackSrc);
    const finalUrl = optimize ? optimizeCloudinaryUrl(validUrl) : validUrl;
    setImgSrc(finalUrl);
    setHasError(false);
  }, [src, fallbackSrc, optimize]);

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      loading={loading}
      onError={handleError}
      {...props}
    />
  );
};

/**
 * Responsive image component with srcSet for different screen sizes
 */
export const ResponsiveImage = ({
  src,
  fallbackSrc = DEFAULT_FALLBACK,
  alt,
  className,
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
  optimize = true,
  ...props
}) => {
  const [imgSrc, setImgSrc] = useState(() => {
    const validUrl = getValidImageUrl(src, fallbackSrc);
    return optimize ? optimizeCloudinaryUrl(validUrl, { width: 1200 }) : validUrl;
  });
  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(fallbackSrc);
    }
  };

  React.useEffect(() => {
    const validUrl = getValidImageUrl(src, fallbackSrc);
    const finalUrl = optimize ? optimizeCloudinaryUrl(validUrl, { width: 1200 }) : validUrl;
    setImgSrc(finalUrl);
    setHasError(false);
  }, [src, fallbackSrc, optimize]);

  // Generate responsive URLs for srcSet
  const srcSet = [
    `${optimizeCloudinaryUrl(imgSrc, { width: 640 })} 640w`,
    `${optimizeCloudinaryUrl(imgSrc, { width: 1024 })} 1024w`,
    `${optimizeCloudinaryUrl(imgSrc, { width: 1280 })} 1280w`,
  ].join(', ');

  return (
    <img
      src={imgSrc}
      srcSet={srcSet}
      sizes={sizes}
      alt={alt}
      className={className}
      loading="lazy"
      onError={handleError}
      {...props}
    />
  );
};
