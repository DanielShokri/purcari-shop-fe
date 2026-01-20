import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'product';
  schemaData?: object;
}

const SEO: React.FC<SEOProps> = ({
  title,
  description,
  canonical,
  ogImage,
  ogType = 'website',
  schemaData,
}) => {
  const siteName = 'Purcari Israel';
  const fullTitle = title ? `${title} | ${siteName}` : siteName;
  const defaultDescription = 'יינות פרימיום מבית יקב פורקארי (Purcari) - מסורת של איכות מאז 1827. משלוחים לכל הארץ.';
  const metaDescription = description || defaultDescription;
  const siteUrl = 'https://purcari.co.il';
  const fullCanonical = canonical ? `${siteUrl}${canonical}` : siteUrl;
  const defaultOgImage = `${siteUrl}/images/og-default.jpg`; // Fallback image

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={metaDescription} />
      <link rel="canonical" href={fullCanonical} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:image" content={ogImage || defaultOgImage} />
      <meta property="og:url" content={fullCanonical} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="he_IL" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={ogImage || defaultOgImage} />

      {/* Structured Data */}
      {schemaData && (
        <script type="application/ld+json">
          {Array.isArray(schemaData) 
            ? JSON.stringify(schemaData) 
            : JSON.stringify(schemaData)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;
