/**
 * SEO Utility Module
 * Manages dynamic page titles, meta tags, structured data, and canonical URLs
 */

export const updatePageMeta = ({
  title,
  description,
  image,
  url,
  type = 'website',
  keywords,
  ogTitle,
  ogDescription,
  twitterTitle,
  twitterDescription,
  canonical
}) => {
  // Update title
  if (title) {
    document.title = title;
    updateMetaTag('og:title', ogTitle || title);
    updateMetaTag('twitter:title', twitterTitle || title);
  }

  // Update description
  if (description) {
    updateMetaTag('description', description);
    updateMetaTag('og:description', ogDescription || description);
    updateMetaTag('twitter:description', twitterDescription || description);
  }

  // Update image
  if (image) {
    updateMetaTag('og:image', image);
    updateMetaTag('twitter:image', image);
  }

  // Update URL
  if (url) {
    updateMetaTag('og:url', url);
  }

  // Update type
  if (type) {
    updateMetaTag('og:type', type);
  }

  // Update keywords
  if (keywords) {
    updateMetaTag('keywords', keywords);
  }

  // Update canonical
  if (canonical) {
    updateCanonical(canonical);
  }
};

export const updateMetaTag = (name, content) => {
  let tag = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`);

  if (!tag) {
    tag = document.createElement('meta');
    const isProperty = name.startsWith('og:') || name.startsWith('twitter:');
    if (isProperty) {
      tag.setAttribute('property', name);
    } else {
      tag.setAttribute('name', name);
    }
    document.head.appendChild(tag);
  }

  tag.setAttribute('content', content);
};

export const updateCanonical = (url) => {
  let canonical = document.querySelector('link[rel="canonical"]');

  if (!canonical) {
    canonical = document.createElement('link');
    canonical.rel = 'canonical';
    document.head.appendChild(canonical);
  }

  canonical.href = url;
};

export const addStructuredData = (data) => {
  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(data);
  document.head.appendChild(script);
};

export const getBaseUrl = () => {
  return location.origin;
};

export const getFullUrl = (path) => {
  return `${getBaseUrl()}${path}`;
};

/**
 * Course structured data (JSON-LD)
 */
export const generateCourseSchema = ({
  id,
  name,
  description,
  image,
  url,
  price,
  currency = 'USD',
  instructor = 'AgriVinka',
  rating = 4.8,
  reviewCount = 100,
  studentCount = 1000
}) => ({
  '@context': 'https://schema.org/',
  '@type': 'Course',
  'name': name,
  'description': description,
  'image': image,
  'url': url,
  'isPartOf': {
    '@type': 'EducationalOrganization',
    'name': 'AgriVinka',
    'url': getBaseUrl(),
    'logo': `${getBaseUrl()}/src/assets/logo.svg`,
    'sameAs': [
      'https://www.facebook.com/agrivinka',
      'https://www.twitter.com/agrivinka'
    ]
  },
  'provider': {
    '@type': 'EducationalOrganization',
    'name': 'AgriVinka',
    'url': getBaseUrl()
  },
  'instructor': {
    '@type': 'Person',
    'name': instructor,
    'url': getBaseUrl()
  },
  'aggregateRating': {
    '@type': 'AggregateRating',
    'ratingValue': rating,
    'reviewCount': reviewCount
  },
  'numberOfStudents': studentCount,
  'offers': {
    '@type': 'Offer',
    'price': price,
    'priceCurrency': currency,
    'url': url
  }
});

/**
 * Organization structured data
 */
export const generateOrganizationSchema = () => ({
  '@context': 'https://schema.org',
  '@type': 'EducationalOrganization',
  'name': 'AgriVinka',
  'url': getBaseUrl(),
  'logo': `${getBaseUrl()}/src/assets/logo.svg`,
  'description': 'تعلم البرمجة بالعربية - كورسات مترجمة ومسارات برمجة متكاملة',
  'email': 'contact@agrivinka.com',
  'sameAs': [
    'https://www.facebook.com/agrivinka',
    'https://www.twitter.com/agrivinka'
  ],
  'contactPoint': {
    '@type': 'ContactPoint',
    'contactType': 'Customer Service',
    'email': 'contact@agrivinka.com'
  }
});

/**
 * Breadcrumb structured data
 */
export const generateBreadcrumbSchema = (breadcrumbs) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  'itemListElement': breadcrumbs.map((item, index) => ({
    '@type': 'ListItem',
    'position': index + 1,
    'name': item.label,
    'item': getFullUrl(item.url)
  }))
});
