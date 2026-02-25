/**
 * SEOHead Component
 * Reusable component to manage SEO meta tags per page
 * Usage: <SEOHead title="..." description="..." />
 */

import { useEffect } from 'react';
import {
  updatePageMeta,
  addStructuredData,
  getFullUrl,
  generateOrganizationSchema
} from '../../utils/seo';

export const SEOHead = ({
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
  canonical,
  structuredData
}) => {
  useEffect(() => {
    // Update meta tags
    updatePageMeta({
      title: title ? `${title} | Shams Al-Arab` : 'Shams Al-Arab - تعلم البرمجة بالعربية',
      description: description || 'تعلم البرمجة بالعربية مع كورسات مترجمة ومسارات برمجة متكاملة',
      image: image || `${getFullUrl('/src/assets/og-image.png')}`,
      url: url || getFullUrl(window.location.pathname),
      type,
      keywords: keywords || 'كورسات برمجة, تعلم البرمجة, مسارات برمجة, دورات مترجمة',
      ogTitle,
      ogDescription,
      twitterTitle,
      twitterDescription,
      canonical: canonical || getFullUrl(window.location.pathname)
    });

    // Add structured data
    if (structuredData) {
      addStructuredData(structuredData);
    } else {
      // Add default organization schema
      addStructuredData(generateOrganizationSchema());
    }
  }, [title, description, image, url, type, keywords, ogTitle, ogDescription, twitterTitle, twitterDescription, canonical, structuredData]);

  return null;
};

export default SEOHead;
