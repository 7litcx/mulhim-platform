import { defineType, defineField } from "sanity";

export const product = defineType({
  name: "product",
  title: "المنتجات (Products)",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "اسم المنتج",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "الرابط البديل (Slug)",
      type: "slug",
      options: {
        source: "name",
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
      title: "تفاصيل المنتج ومواصفاته",
      type: "array",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "images",
      title: "صور المنتج",
      type: "array",
      of: [{ type: "image", options: { hotspot: true } }],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: "price",
      title: "السعر (ريال سعودي)",
      type: "number",
      validation: (rule) => rule.min(0),
    }),
    defineField({
      name: "compareAtPrice",
      title: "السعر السابق قبل الخصم (ريال سعودي)",
      type: "number",
      description: "السعر الأصلي قبل التخفيض.",
      validation: (rule) => rule.min(0),
    }),
    defineField({
      name: "isNew",
      title: "منتج جديد",
      type: "boolean",
      initialValue: true,
    }),
    defineField({
      name: "stock",
      title: "كمية المخزون",
      type: "number",
      initialValue: 10,
      validation: (rule) => rule.required().min(0),
    }),
    defineField({
      name: "isAvailable",
      title: "المنتج متوفر؟",
      type: "boolean",
      description: "إذا تم تعطيل هذا الخيار، سيتم عرض المنتج كـ (غير متوفر) ولن يظهر سعره وتفاصيله.",
      initialValue: true,
    }),
    defineField({
      name: "sizes",
      title: "المقاسات المتوفرة",
      type: "array",
      of: [{ type: "string" }],
      options: {
        list: [
          { title: "S", value: "S" },
          { title: "M", value: "M" },
          { title: "L", value: "L" },
          { title: "XL", value: "XL" },
          { title: "XXL", value: "XXL" },
        ],
      },
    }),
    defineField({
      name: "colors",
      title: "الألوان المتوفرة",
      type: "array",
      of: [{ type: "string" }],
      options: {
        layout: "tags",
      },
    }),

  ],

  preview: {
    select: {
      title: "name",
      price: "price",
      media: "images.0",
    },
    prepare(selection) {
      const { title, price, media } = selection;
      return {
        title,
        subtitle: `${price} ريال سعودي`,
        media,
      };
    },
  },
});
