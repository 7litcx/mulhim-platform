import { defineType, defineField } from "sanity";

export const heroBanner = defineType({
  name: "heroBanner",
  title: "البانرات الترويجية (Hero Banners)",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "العنوان الرئيسي",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "الرابط البديل (Slug)",
      type: "slug",
      options: {
        source: "title",
        maxLength: 96,
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "description",
      title: "الوصف / العنوان الفرعي",
      type: "text",
      description: "اختياري، إذا تم تركه فارغاً فلن يظهر الوصف",
    }),
    defineField({
      name: "images",
      title: "صور الخلفية",
      type: "array",
      of: [{ type: "image", options: { hotspot: true } }],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: "video",
      title: "فيديو الخلفية (اختياري - يستبدل الصور إذا وجد)",
      type: "file",
      options: {
        accept: "video/*"
      },
      description: "يمكنك رفع فيديو قصير للعمل كخلفية بدلاً من الصور.",
    }),
    defineField({
      name: "price",
      title: "السعر الترويجي (اختياري)",
      type: "number",
      description: "سعر اختياري لعرضه بشكل بارز على البانر.",
    }),
    defineField({
      name: "startDate",
      title: "تاريخ البدء والنشاط",
      type: "datetime",
    }),
    defineField({
      name: "endDate",
      title: "تاريخ الانتهاء والنشاط",
      type: "datetime",
    }),
    defineField({
      name: "btnText",
      title: "نص الزر",
      type: "string",
      description: "اختياري، إذا تم تركه فارغاً فلن يظهر الزر",
    }),
    defineField({
      name: "page",
      title: "الصفحة المستهدفة / القسم",
      type: "string",
      options: {
        list: [
          { title: "الرئيسية (السلايدر) - Home Slider", value: "home" },
          { title: "صفحة عن ملهم - About Page", value: "about" },
          { title: "صفحة الرحلات - Trips Page", value: "trips" },
          { title: "صفحة البرامج - Programs Page", value: "programs" },
          { title: "صفحة المتجر - Store Page", value: "store" },
          { title: "صفحة الأكاديميات - Academies Page", value: "academies" },
        ],
      },
      initialValue: "home",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "featured",
      title: "بانر مميز ونشط",
      type: "boolean",
      description: "قم بالتفعيل لجعل هذا البانر نشطاً ومميزاً على الموقع.",
      initialValue: true,
    }),
  ],

  preview: {
    select: {
      title: "title",
      page: "page",
      media: "images.0",
    },
    prepare(selection) {
      const { title, page, media } = selection;
      return {
        title,
        subtitle: `الصفحة: ${page || "الرئيسية"}`,
        media,
      };
    },
  },
});
