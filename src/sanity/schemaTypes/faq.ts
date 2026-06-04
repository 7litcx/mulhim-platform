import { defineType, defineField } from "sanity";

export const faq = defineType({
  name: "faq",
  title: "الأسئلة الشائعة (FAQs)",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "السؤال (العنوان)",
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
      title: "الإجابة (الوصف)",
      type: "text",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "images",
      title: "الصور / التوضيحات",
      type: "array",
      of: [{ type: "image", options: { hotspot: true } }],
      description: "وسائل إيضاح بصرية اختيارية للإجابة.",
    }),
    defineField({
      name: "price",
      title: "معلومات التكلفة / السعر",
      type: "number",
      description: "سعر أو تكلفة مرجعية اختيارية إذا كان السؤال متعلقاً بالخدمات المدفوعة.",
    }),
    defineField({
      name: "startDate",
      title: "تاريخ البدء",
      type: "datetime",
      description: "تاريخ بدء اختياري للأسئلة الشائعة المرتبطة بفترة زمنية محددة.",
    }),
    defineField({
      name: "endDate",
      title: "تاريخ الانتهاء",
      type: "datetime",
      description: "تاريخ انتهاء اختياري للأسئلة الشائعة المرتبطة بفترة زمنية محددة.",
    }),
    defineField({
      name: "featured",
      title: "سؤال شائك مميز",
      type: "boolean",
      description: "عرض هذا السؤال في الصفحة الرئيسية أو صفحة المساعدة.",
      initialValue: true,
    }),
  ],

});
