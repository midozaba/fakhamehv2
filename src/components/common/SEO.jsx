import React from 'react';
import { Helmet } from 'react-helmet-async';

/**
 * SEO Component for managing page meta tags
 *
 * @param {Object} props
 * @param {string} props.title - Page title
 * @param {string} props.description - Page description
 * @param {string} props.keywords - SEO keywords
 * @param {string} props.ogImage - Open Graph image URL
 * @param {string} props.ogType - Open Graph type (website, article, etc.)
 * @param {string} props.canonical - Canonical URL
 * @param {Object} props.structuredData - JSON-LD structured data
 * @param {string} props.lang - Page language (en/ar)
 */
const SEO = ({
  title = 'Al-Fakhama Car Rental',
  description = 'Premium car rental services in Jordan. Rent luxury cars, SUVs, and economy vehicles at competitive prices. 24/7 customer support.',
  keywords = 'car rental Jordan, rent a car Amman, car hire Jordan, luxury car rental, SUV rental, economy car rental, airport car rental',
  ogImage = '/og-image.jpg',
  ogType = 'website',
  canonical,
  structuredData,
  lang = 'en',
}) => {
  const siteUrl = 'https://www.al-fakhamah-car-rent.com';
  const canonicalUrl = canonical || `${siteUrl}${window.location.pathname}`;

  // Bilingual meta descriptions
  const bilingualDescription = {
    en: description,
    ar: description.includes('تأجير') ? description : 'خدمات تأجير السيارات المتميزة في الأردن. استأجر سيارات فاخرة ورياضية واقتصادية بأسعار تنافسية. دعم العملاء على مدار الساعة.'
  };

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <html lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'} />
      <title>{title}</title>
      <meta name="description" content={bilingualDescription[lang]} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph Meta Tags (Facebook, LinkedIn) */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={bilingualDescription[lang]} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={`${siteUrl}${ogImage}`} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content="Al-Fakhama Car Rental" />
      <meta property="og:locale" content={lang === 'ar' ? 'ar_AR' : 'en_US'} />

      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={bilingualDescription[lang]} />
      <meta name="twitter:image" content={`${siteUrl}${ogImage}`} />
      <meta name="twitter:site" content="@alfakhama" />
      <meta name="twitter:creator" content="@alfakhama" />

      {/* Additional Meta Tags */}
      <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
      <meta name="googlebot" content="index, follow" />
      <meta name="author" content="Al-Fakhama Car Rental" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />

      {/* Mobile Meta Tags */}
      <meta name="theme-color" content="#1e40af" />
      <meta name="apple-mobile-web-app-capable" content="yes" />
      <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      <meta name="apple-mobile-web-app-title" content="Al-Fakhama" />

      {/* Structured Data (JSON-LD) */}
      {structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;
