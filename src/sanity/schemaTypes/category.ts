import { defineType, defineField } from "sanity";

export const category = defineType({
  name: "category",
  title: "التصنيفات (Categories)",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "الاسم / العنوان",
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
      name: "target",
      title: "الفئة المستهدفة",
      type: "string",
      options: {
        list: [
          { title: "فتيات (Girls)", value: "girls" },
          { title: "بنين (Boys)", value: "boys" },
          { title: "عام (General)", value: "general" },
          { title: "المتجر (Store)", value: "store" },
          { title: "الرحلات (Trip)", value: "trip" },
        ],
        layout: "radio",
      },
      initialValue: "general",
    }),
    defineField({
      name: "description",
      title: "وصف التصنيف",
      type: "text",
    }),
    defineField({
      name: "images",
      title: "صور التصنيف",
      type: "array",
      of: [{ type: "image", options: { hotspot: true } }],
    }),
    defineField({
      name: "price",
      title: "السعر الأساسي / يبدأ من...",
      type: "number",
      description: "سعر مرجعي اختياري يبدأ منه هذا التصنيف.",
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
      name: "featured",
      title: "تصنيف مميز",
      type: "boolean",
      initialValue: false,
    }),
  ],

});
