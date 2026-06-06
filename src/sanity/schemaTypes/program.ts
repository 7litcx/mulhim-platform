import { defineType, defineField } from "sanity";

export const program = defineType({
  name: "program",
  title: "البرامج (Programs)",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "عنوان البرنامج",
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
        ],
        layout: "radio",
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
      title: "وصف البرنامج",
      type: "text",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "content",
      title: "محتوى وتفاصيل البرنامج",
      type: "array",
      of: [
        { type: "block" },
        {
          type: "image",
          options: { hotspot: true },
        },
      ],
    }),
    defineField({
      name: "images",
      title: "صور البرنامج / معرض الصور",
      type: "array",
      of: [{ type: "image", options: { hotspot: true } }],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: "price",
      title: "السعر (ريال سعودي)",
      type: "number",
      description: "ضع 0 إذا كان البرنامج مجانياً أو اتركه فارغاً.",
      validation: (rule) => rule.min(0),
    }),
    defineField({
      name: "startDate",
      title: "تاريخ البدء",
      type: "datetime",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "endDate",
      title: "تاريخ الانتهاء",
      type: "datetime",
      validation: (rule) => rule.required().custom((endDate, context) => {
        const startDate = (context.parent as Record<string, unknown>)?.startDate as string | undefined;
        if (!startDate || !endDate) return true;
        return new Date(endDate) > new Date(startDate) ? true : "تاريخ الانتهاء يجب أن يكون بعد تاريخ البدء";
      }),
    }),
    defineField({
      name: "registrationDeadline",
      title: "الموعد النهائي للتسجيل",
      type: "datetime",
    }),
    defineField({
      name: "location",
      title: "موقع / مكان إقامة البرنامج",
      type: "string",
    }),
    defineField({
      name: "featured",
      title: "برنامج مميز ونشط",
      type: "boolean",
      initialValue: false,
    }),
  ],

  preview: {
    select: {
      title: "title",
      target: "target",
      media: "images.0",
    },
    prepare(selection) {
      const { title, target, media } = selection;
      const targetLabel = target === "girls" ? "فتيات" : target === "boys" ? "بنين" : "عام";
      return {
        title,
        subtitle: `الفئة: ${targetLabel}`,
        media,
      };
    },
  },
});
