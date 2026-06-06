import { defineType, defineField } from "sanity";

export const trip = defineType({
  name: "trip",
  title: "الرحلات والأنشطة (Trips)",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "عنوان الرحلة",
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
      name: "typeName",
      title: "نوع / نمط الرحلة",
      type: "string",
      description: "مثال: مغامرة (Adventure)، ثقافية (Cultural)، تعليمية (Educational)",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "category",
      title: "التصنيف / الفئة",
      type: "reference",
      to: [{ type: "category" }],
    }),
    defineField({
      name: "location",
      title: "الوجهة / الموقع",
      type: "string",
    }),
    defineField({
      name: "description",
      title: "وصف قصير",
      type: "text",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "content",
      title: "برنامج وتفاصيل الرحلة",
      type: "array",
      of: [{ type: "block" }, { type: "image", options: { hotspot: true } }],
    }),
    defineField({
      name: "images",
      title: "صور الرحلة / معرض الصور",
      type: "array",
      of: [{ type: "image", options: { hotspot: true } }],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: "price",
      title: "تكلفة الرحلة (ريال سعودي)",
      type: "number",
      validation: (rule) => rule.min(0),
    }),
    defineField({
      name: "startDate",
      title: "تاريخ البدء",
      type: "date",
    }),
    defineField({
      name: "endDate",
      title: "تاريخ الانتهاء",
      type: "date",
      validation: (rule) => rule.custom((endDate, context) => {
        const startDate = (context.parent as Record<string, unknown>)?.startDate as string | undefined;
        if (!startDate || !endDate) return true;
        return new Date(endDate) > new Date(startDate) ? true : "تاريخ الانتهاء يجب أن يكون بعد تاريخ البدء";
      }),
    }),
    defineField({
      name: "maxParticipants",
      title: "الحد الأقصى للمشاركين",
      type: "number",
    }),
    defineField({
      name: "featured",
      title: "رحلة مميزة ونشطة",
      type: "boolean",
      initialValue: false,
    }),
    defineField({
      name: "registrationOpen",
      title: "التسجيل متاح (مفتوح)",
      type: "boolean",
      description: "إذا تم تعطيله، سيتم إخفاء التفاصيل المالية وزر التسجيل عن المستخدمين.",
      initialValue: true,
    }),
  ],

  preview: {
    select: {
      title: "title",
      location: "location",
      media: "images.0",
    },
    prepare(selection) {
      const { title, location, media } = selection;
      return {
        title,
        subtitle: location || "",
        media,
      };
    },
  },
});
