import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://mulhim.com' // استبدل الرابط برابط الموقع الفعلي إذا لم يكن موجوداً في .env

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard/', '/admin/', '/api/', '/studio/'], // منع محركات البحث من أرشفة لوحات التحكم والمسارات الخاصة
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
