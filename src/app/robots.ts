import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mulhim180.com'

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard/', '/admin/', '/api/', '/studio/'], // منع محركات البحث من أرشفة لوحات التحكم والمسارات الخاصة
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
