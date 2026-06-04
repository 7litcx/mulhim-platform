import { defineType, defineField } from "sanity";

export const academy = defineType({
  name: "academy",
  title: "الأكاديميات (Academies)",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "عنوان الأكاديمية",
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
      name: "category",
      title: "التصنيف / الفئة",
      type: "reference",
      to: [{ type: "category" }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "description",
      title: "وصف قصير",
      type: "text",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "content",
      title: "تفاصيل الأكاديمية والمنهج الدراسي",
      type: "array",
      of: [{ type: "block" }, { type: "image", options: { hotspot: true } }],
    }),
    defineField({
      name: "images",
      title: "صور الأكاديمية / الشعار / الغلاف",
      type: "array",
      of: [{ type: "image", options: { hotspot: true } }],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: "price",
      title: "رسوم الدراسة (ريال سعودي)",
      type: "number",
      validation: (rule) => rule.required().min(0),
    }),
    defineField({
      name: "startDate",
      title: "تاريخ البدء",
      type: "date",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "endDate",
      title: "تاريخ الانتهاء",
      type: "date",
      validation: (rule) => rule.required().custom((endDate, context) => {
        const startDate = (context.parent as Record<string, unknown>)?.startDate as string | undefined;
        if (!startDate || !endDate) return true;
        return new Date(endDate) > new Date(startDate) ? true : "تاريخ الانتهاء يجب أن يكون بعد تاريخ البدء";
      }),
    }),
    defineField({
      name: "tutors",
      title: "المدربون / المعلمون",
      type: "array",
      of: [
        {
          type: "object",
          name: "tutor",
          title: "المدرب",
          fields: [
            { name: "name", title: "الاسم كامل", type: "string" },
            { name: "role", title: "الدور / التخصص", type: "string" },
            { name: "avatar", title: "الصورة الشخصية", type: "image", options: { hotspot: true } },
          ],
        },
      ],
    }),
    defineField({
      name: "featured",
      title: "أكاديمية مميزة ونشطة",
      type: "boolean",
      initialValue: false,
    }),
  ],

  preview: {
    select: {
      title: "title",
      categoryName: "category.title",
      media: "images.0",
    },
    prepare(selection) {
      const { title, categoryName, media } = selection;
      return {
        title,
        subtitle: categoryName ? `التصنيف: ${categoryName}` : "",
        media,
      };
    },
  },
});
