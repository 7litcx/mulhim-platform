"use client";

import React from "react";
import { ShieldCheck, Sparkles } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="space-y-12 pb-20">
      <section className="relative bg-primary-navy text-white py-14 overflow-hidden shadow-inner">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(13,148,136,0.25),transparent_60%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-4">
          <ShieldCheck className="w-12 h-12 text-accent-yellow mx-auto animate-pulse" />
          <h1 className="text-2xl md:text-4xl font-black font-tajawal leading-tight">
            سياسة الخصوصية وحماية البيانات
          </h1>
          <p className="text-xs md:text-sm text-slate-300 max-w-xl mx-auto font-light leading-relaxed">
            التزامنا بحماية سرية وأمان معلوماتكم الشخصية في منصة ملهم.
          </p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 sm:px-6 text-right text-xs sm:text-sm text-slate-600 leading-relaxed space-y-6">
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <h3 className="font-extrabold text-slate-800 text-sm">مقدمة حول جمع البيانات</h3>
          <p>
            تلتزم منصة ملهم بشكل كامل بحماية خصوصية زوارها ومشاركيها. توضح هذه السياسة كيف نقوم بجمع البيانات الشخصية (مثل الاسم، العمر، البريد الإلكتروني، ورقم الجوال) واستخدامها وتخزينها بأمان.
          </p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <h3 className="font-extrabold text-slate-800 text-sm">كيفية استخدام البيانات الشخصية</h3>
          <p>
            تُستخدم معلوماتكم الشخصية بشكل أساسي من أجل:
          </p>
          <ul className="list-disc pr-5 space-y-2">
            <li>تسجيلكم وتأكيد حجوزاتكم في الأكاديميات والرحلات والأنشطة الشبابية.</li>
            <li>توصيل ومعالجة شحنات منتجات متجر ملهم الإلكتروني.</li>
            <li>إرسال تنبيهات المواعيد وتأكيدات السداد وتحديثات البرامج عبر الجوال أو البريد.</li>
            <li>تحسين جودة تجربة التصفح والخدمات التي تقدمها المنصة للمجتمع.</li>
          </ul>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4">
          <h3 className="font-extrabold text-slate-800 text-sm">أمان البيانات المشفرة</h3>
          <p>
            نحن نطبق إجراءات حماية إلكترونية قوية لحفظ وتأمين بياناتكم من الوصول غير المصرح به أو التغيير أو الإفصاح. نحن لا نبيع أو نشارك معلوماتكم مع أي أطراف خارجية أو جهات تجارية على الإطلاق.
          </p>
        </div>
      </section>
    </div>
  );
}
