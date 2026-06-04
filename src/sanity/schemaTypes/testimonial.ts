import { defineType, defineField } from "sanity";

export const testimonial = defineType({
  name: "testimonial",
  title: "آراء وتجارب المشاركين (Testimonials)",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "اسم كاتب الرأي / المشارك",
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
      name: "role",
      title: "الدور / الصفة",
      type: "string",
      description: "مثال: ولي أمر، طالب، مشارك في رحلة",
    }),
    defineField({
      name: "description",
      title: "الرأي / الاقتباس",
      type: "text",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "price",
      title: "القيمة أو التكلفة المرتبطة (اختياري)",
      type: "number",
      description: "تفاصيل مالية اختيارية ذات صلة.",
    }),
    defineField({
      name: "startDate",
      title: "تاريخ تقديم الرأي",
      type: "datetime",
    }),
    defineField({
      name: "endDate",
      title: "تاريخ انتهاء الصلاحية",
      type: "datetime",
    }),
    defineField({
      name: "featured",
      title: "رأي مميز ونشط",
      type: "boolean",
      initialValue: true,
    }),
  ],

  preview: {
    select: {
      title: "title",
      role: "role",
    },
    prepare(selection) {
      const { title, role } = selection;
      return {
        title,
        subtitle: role || "",
      };
    },
  },
});
