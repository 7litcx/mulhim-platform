"use client";

import React from "react";
import { FileText, Sparkles } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="space-y-12 pb-20">
      <section className="relative bg-primary-navy text-white py-14 overflow-hidden shadow-inner">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(13,148,136,0.25),transparent_60%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-4">
          <FileText className="w-12 h-12 text-accent-yellow mx-auto" />
          <h1 className="text-2xl md:text-4xl font-black font-tajawal leading-tight">
            شروط وأحكام الاستخدام
          </h1>
          <p className="text-xs md:text-sm text-slate-300 max-w-xl mx-auto font-light leading-relaxed">
            الشروط والأحكام المنظمة لعضويات واشتراكات منصة ملهم.
          </p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 text-right text-xs sm:text-sm text-slate-600 leading-relaxed space-y-6">
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <h3 className="font-extrabold text-slate-800 text-sm">العضوية والسلوك العام</h3>
          <p>
            بالتسجيل في منصة ملهم، يتعهد العضو بالالتزام بالأنظمة والأخلاق والآداب العامة أثناء مشاركته في الرحلات الميدانية، الأنشطة الرياضية، والمحاضرات التدريبية داخل الأكاديميات.
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <h3 className="font-extrabold text-slate-800 text-sm">التسجيل والاشتراك المالي</h3>
          <p>
            تتطلب بعض الرحلات والأكاديميات سداد رسوم اشتراك محددة مقدماً لتأكيد حجز المقعد بشكل رسمي. تتم كافة عمليات الدفع الإلكترونية بطريقة آمنة عبر بوابة الدفع الشريكة Tap payments، ويكون العضو مسؤولاً عن دقة المعلومات المدخلة.
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <h3 className="font-extrabold text-slate-800 text-sm">التأجيل والتغيب</h3>
          <p>
            في حال رغبة المشترك في الاعتذار عن عدم حضور برنامج أو أكاديمية معينة، يرجى التنسيق معنا قبل بداية اللقاءات بأسبوع على الأقل ليتسنى لنا إتاحة المقعد لمنتسب آخر وتنسيق المستحقات.
          </p>
        </div>
      </section>
    </div>
  );
}
