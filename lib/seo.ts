import { Metadata } from 'next';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
  ogType?: 'website' | 'article';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
  noindex?: boolean;
}

const defaultMetadata = {
  siteName: 'RANKUP',
  baseUrl: process.env.NEXT_PUBLIC_BASE_URL || 'https://rankup.com',
  defaultTitle: 'RANKUP - 종합 금융 정보 플랫폼',
  defaultDescription: '실시간 주식, 뉴스, 커뮤니티를 한 곳에서. 투자자를 위한 완벽한 정보 플랫폼',
  defaultKeywords: ['주식', '투자', '증권', '뉴스', '커뮤니티', '금융', '재테크', 'KOSPI', 'KOSDAQ'],
  twitterHandle: '@rankup',
  locale: 'ko_KR',
};

/**
 * Generate metadata for SEO optimization
 */
export function generateMetadata({
  title,
  description,
  keywords,
  ogImage,
  ogType = 'website',
  author,
  publishedTime,
  modifiedTime,
  section,
  tags,
  noindex = false,
}: SEOProps = {}): Metadata {
  const fullTitle = title
    ? `${title} | ${defaultMetadata.siteName}`
    : defaultMetadata.defaultTitle;

  const fullDescription = description || defaultMetadata.defaultDescription;

  const allKeywords = [
    ...defaultMetadata.defaultKeywords,
    ...(keywords || []),
    ...(tags || []),
  ].join(', ');

  const imageUrl = ogImage || `${defaultMetadata.baseUrl}/og-image.png`;

  return {
    title: fullTitle,
    description: fullDescription,
    keywords: allKeywords,
    authors: author ? [{ name: author }] : undefined,
    robots: noindex ? 'noindex, nofollow' : 'index, follow',

    openGraph: {
      type: ogType,
      locale: defaultMetadata.locale,
      url: defaultMetadata.baseUrl,
      siteName: defaultMetadata.siteName,
      title: fullTitle,
      description: fullDescription,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: fullTitle,
        },
      ],
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
      ...(section && { section }),
      ...(tags && tags.length > 0 && { tags }),
    },

    twitter: {
      card: 'summary_large_image',
      site: defaultMetadata.twitterHandle,
      creator: defaultMetadata.twitterHandle,
      title: fullTitle,
      description: fullDescription,
      images: [imageUrl],
    },

    alternates: {
      canonical: defaultMetadata.baseUrl,
    },

    viewport: {
      width: 'device-width',
      initialScale: 1,
      maximumScale: 5,
    },

    icons: {
      icon: '/favicon.ico',
      apple: '/apple-touch-icon.png',
    },

    manifest: '/manifest.json',
  };
}

/**
 * Generate JSON-LD structured data for SEO
 */
export function generateStructuredData(type: 'website' | 'article' | 'organization', data: any) {
  const baseStructure = {
    '@context': 'https://schema.org',
  };

  switch (type) {
    case 'website':
      return {
        ...baseStructure,
        '@type': 'WebSite',
        name: defaultMetadata.siteName,
        url: defaultMetadata.baseUrl,
        description: defaultMetadata.defaultDescription,
        potentialAction: {
          '@type': 'SearchAction',
          target: `${defaultMetadata.baseUrl}/search?q={search_term_string}`,
          'query-input': 'required name=search_term_string',
        },
      };

    case 'article':
      return {
        ...baseStructure,
        '@type': 'Article',
        headline: data.title,
        description: data.description,
        author: {
          '@type': 'Person',
          name: data.author,
        },
        datePublished: data.publishedAt,
        dateModified: data.modifiedAt,
        image: data.image,
        publisher: {
          '@type': 'Organization',
          name: defaultMetadata.siteName,
          logo: {
            '@type': 'ImageObject',
            url: `${defaultMetadata.baseUrl}/logo.png`,
          },
        },
      };

    case 'organization':
      return {
        ...baseStructure,
        '@type': 'Organization',
        name: defaultMetadata.siteName,
        url: defaultMetadata.baseUrl,
        logo: `${defaultMetadata.baseUrl}/logo.png`,
        description: defaultMetadata.defaultDescription,
        sameAs: [
          // Add social media URLs here
          'https://twitter.com/rankup',
          'https://www.facebook.com/rankup',
        ],
      };

    default:
      return baseStructure;
  }
}

/**
 * Generate breadcrumb structured data
 */
export function generateBreadcrumbStructuredData(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${defaultMetadata.baseUrl}${item.url}`,
    })),
  };
}
