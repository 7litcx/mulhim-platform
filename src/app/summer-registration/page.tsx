"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import SignatureCanvas from "react-signature-canvas";
import { supabase } from "@/utils/supabase";
import { Sparkles, CreditCard, CheckCircle } from "lucide-react";

export default function SummerRegistrationPage() {
  const router = useRouter();
  const { currentUser: user, showToast, registerUser } = useApp();
  const signatureRef = useRef<SignatureCanvas>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [formData, setFormData] = useState({
    fullName: "",
    idNumber: "",
    grade: "",
    birthDate: "",
    gender: "",
    age: "",
    neighborhood: "",
    parentName: "",
    parentPhone: "",
    otherPhone: "",
    hasDiseases: "لا",
    diseasesDetails: "",
    hasAllergies: "لا",
    allergiesDetails: "",
    howDidYouHear: "",
    pledgeAccepted: false,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentOption, setPaymentOption] = useState<"cash" | "card">("cash");


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    if (name === "birthDate" && value) {
      const selectedYear = new Date(value).getFullYear();
      if (selectedYear > 2020) {
        showToast("عذراً، البرنامج مخصص لمواليد 2020 وما قبل", "error");
        return; // Do not update the state with the invalid date
      }
    }

    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const clearSignature = () => {
    signatureRef.current?.clear();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const nameParts = formData.fullName.trim().split(/\s+/);
    if (nameParts.length < 3) {
      showToast("الرجاء إدخال الاسم الثلاثي أو الرباعي للمتقدم", "error");
      return;
    }

    if (formData.birthDate) {
      const selectedYear = new Date(formData.birthDate).getFullYear();
      if (selectedYear > 2020) {
        showToast("عذراً، البرنامج مخصص لمواليد 2020 وما قبل", "error");
        return;
      }
    }

    if (!formData.pledgeAccepted) {
      showToast("يجب الموافقة على التعهد والأنظمة والتعليمات", "error");
      return;
    }

    if (signatureRef.current?.isEmpty()) {
      showToast("الرجاء التوقيع على الاستمارة", "error");
      return;
    }

    // Get base64 image of the signature BEFORE state changes trigger any re-renders
    const signatureDataUrl = signatureRef.current?.getTrimmedCanvas().toDataURL("image/png");

    setIsSubmitting(true);

    try {

      const extraData = {
        ...formData,
        signature: signatureDataUrl,
        formType: "summer_program"
      };

      // Create an AbortController or a proper timeout mechanism
      let timeoutId: NodeJS.Timeout;
      const timeoutPromise = new Promise((_, reject) => {
        timeoutId = setTimeout(() => reject(new Error("طال الاتصال بالخادم (ربما بسبب التحديث). الرجاء المحاولة مرة أخرى.")), 60000);
      });

      try {
        // Race the registration against the timeout
        await Promise.race([
          registerUser({
            fullName: formData.fullName,
            age: parseInt(formData.age) || 0,
            phone: formData.parentPhone,
            email: user.email,
            interests: [],
            type: "program",
            targetName: "برنامج لون صيفك 3",
            paymentMethod: paymentOption === "cash" ? "دفع نقدي" : "دفع اونلاين",
            extraData: extraData
          }),
          timeoutPromise
        ]);
      } finally {
        clearTimeout(timeoutId!);
      }

      showToast(paymentOption === "card" ? "تم الإرسال! سيتم تحويلك لصفحة الدفع الآن..." : "تم إرسال استمارة التسجيل بنجاح! سيتم التواصل معكم قريباً", "success");
      setIsSubmitting(false);
      setTimeout(() => {
        if (paymentOption === "card") {
          const paymentUrl = formData.gender === "أنثى" 
            ? "https://salla.sa/sorog/payment/p1579466864"
            : "https://salla.sa/sorog/payment/p1113970107";
          window.location.href = paymentUrl;
        } else {
          router.push("/dashboard");
        }
      }, 1500);
    } catch (error: any) {
      console.error("Error submitting form:", error);
      showToast("حدث خطأ أثناء الإرسال: " + (error.message || "حاول مرة أخرى"), "error");
      setIsSubmitting(false);
    }
  };

  if (!mounted) {
    return null; // Or a loading spinner
  }

  if (!user) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-16 bg-slate-50 text-right pt-32">
        <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-150 shadow-xl max-w-md w-full text-center space-y-6 animate-in zoom-in-95 duration-200">
          <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
             <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
               <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
             </svg>
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-800 font-tajawal">يجب تسجيل الدخول</h2>
            <p className="text-xs text-slate-500 leading-relaxed font-tajawal">
              للوصول إلى استمارة التسجيل في برنامج لون صيفك، يرجى تسجيل الدخول لحسابك في منصة ملهم.
            </p>
          </div>
          <button
            onClick={() => router.push("/register?redirect=/summer-registration")}
            className="w-full py-3 bg-accent-teal hover:bg-primary-teal text-white rounded-xl text-sm font-bold transition-all shadow-md"
          >
            تسجيل الدخول / إنشاء حساب
          </button>
        </div>
      </div>
    );
  }

  const inputClassName = "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-accent-teal focus:bg-white focus:ring-2 focus:ring-accent-teal/20 transition-all";
  const labelClassName = "text-sm font-bold text-slate-700 mb-2 block";
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 pt-24" dir="rtl">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Form Header */}
        <div className="bg-white rounded-t-3xl p-6 sm:p-10 border-b-4 border-accent-teal shadow-sm flex flex-col items-center text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary-teal to-accent-teal"></div>
          <div className="flex flex-col sm:flex-row justify-between items-center w-full mb-8 gap-6 sm:gap-4">
            <img src="/mulihmlogo.svg" alt="ملهم" className="h-14 sm:h-16 object-contain" />
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
               <div className="h-10 px-4 sm:px-5 bg-teal-50 text-primary-teal rounded-full flex items-center justify-center text-xs sm:text-sm font-bold border border-teal-100 shadow-sm">
                 شعار لون صيفك
               </div>
               <div className="h-10 px-4 sm:px-5 bg-teal-50 text-primary-teal rounded-full flex items-center justify-center text-xs sm:text-sm font-bold border border-teal-100 shadow-sm">
                 مدارس الأندلس
               </div>
            </div>
          </div>
          <div className="inline-flex items-center justify-center p-3 bg-teal-50 rounded-2xl mb-4 text-accent-teal">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" className="sm:w-8 sm:h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-primary-teal font-tajawal mb-3 leading-tight">استمارة مشاركة</h1>
          <p className="text-slate-500 font-medium text-base sm:text-lg">برنامج لون صيفك 3</p>
        </div>

        {/* Main Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-b-3xl shadow-sm p-6 sm:p-8 space-y-8">
          
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClassName}>اسم المتقدم / ة رباعيًا :</label>
              <input required name="fullName" value={formData.fullName} onChange={handleChange} className={inputClassName} placeholder="أدخل الاسم الرباعي" />
            </div>
            <div>
              <label className={labelClassName}>رقم الهوية :</label>
              <input required name="idNumber" value={formData.idNumber} onChange={handleChange} className={inputClassName} placeholder="أدخل رقم الهوية" />
            </div>
            
            <div>
              <label className={labelClassName}>الصف الدراسي العام الماضي ١٤٤٧ هـ :</label>
              <select required name="grade" value={formData.grade} onChange={handleChange} className={inputClassName}>
                <option value="" disabled>اختر الصف الدراسي</option>
                <option value="الأول الابتدائي">الأول الابتدائي</option>
                <option value="الثاني الابتدائي">الثاني الابتدائي</option>
                <option value="الثالث الابتدائي">الثالث الابتدائي</option>
                <option value="الرابع الابتدائي">الرابع الابتدائي</option>
                <option value="الخامس الابتدائي">الخامس الابتدائي</option>
                <option value="السادس الابتدائي">السادس الابتدائي</option>
                <option value="الأول المتوسط">الأول المتوسط</option>
                <option value="الثاني المتوسط">الثاني المتوسط</option>
                <option value="الثالث المتوسط">الثالث المتوسط</option>
                <option value="الأول الثانوي">الأول الثانوي</option>
              </select>
            </div>
            <div>
              <label className={labelClassName}>تاريخ الميلاد (بالميلادي) :</label>
              <input type="date" required name="birthDate" value={formData.birthDate} max="2020-12-31" onChange={handleChange} className={inputClassName} />
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 flex items-center gap-6">
              <label className="text-sm font-bold text-slate-700">الجنس :</label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="gender" value="ذكر" checked={formData.gender === "ذكر"} onChange={handleChange} className="w-4 h-4 text-accent-teal focus:ring-accent-teal accent-accent-teal" />
                <span className="text-slate-700 font-medium">ذكر</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="gender" value="أنثى" checked={formData.gender === "أنثى"} onChange={handleChange} className="w-4 h-4 text-accent-teal focus:ring-accent-teal accent-accent-teal" />
                <span className="text-slate-700 font-medium">أنثى</span>
              </label>
            </div>
            <div>
              <label className={labelClassName}>العمر :</label>
              <input required type="number" name="age" value={formData.age} onChange={handleChange} className={inputClassName} placeholder="أدخل العمر" />
            </div>

            <div className="md:col-span-2">
              <label className={labelClassName}>عنوان الحي الذي تسكن به :</label>
              <input required name="neighborhood" value={formData.neighborhood} onChange={handleChange} className={inputClassName} placeholder="أدخل اسم الحي" />
            </div>

            <div>
              <label className={labelClassName}>اسم ولي الأمر :</label>
              <input required name="parentName" value={formData.parentName} onChange={handleChange} className={inputClassName} placeholder="أدخل اسم ولي الأمر" />
            </div>
            <div>
              <label className={labelClassName}>جوال ولي الأمر (سيضاف لواتس البرنامج):</label>
              <input required name="parentPhone" value={formData.parentPhone} onChange={handleChange} className={inputClassName} placeholder="05XXXXXXXX" />
            </div>
            <div>
              <label className={labelClassName}>جوال آخر :</label>
              <input name="otherPhone" value={formData.otherPhone} onChange={handleChange} className={inputClassName} placeholder="05XXXXXXXX" />
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Medical Info */}
          <div className="bg-white border border-slate-100 shadow-sm rounded-2xl p-5 sm:p-6 space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1 h-full bg-accent-teal"></div>
            
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <label className="text-sm font-bold text-slate-700 md:w-1/2">هل يعاني المتقدم/ة من أي أمراض :</label>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="hasDiseases" value="لا" checked={formData.hasDiseases === "لا"} onChange={handleChange} className="w-4 h-4 text-accent-teal focus:ring-accent-teal accent-accent-teal" />
                  <span className="font-medium text-slate-700">لا</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="hasDiseases" value="نعم" checked={formData.hasDiseases === "نعم"} onChange={handleChange} className="w-4 h-4 text-accent-teal focus:ring-accent-teal accent-accent-teal" />
                  <span className="font-medium text-slate-700">نعم</span>
                </label>
              </div>
              {formData.hasDiseases === "نعم" && (
                <input placeholder="اذكر التفاصيل:" name="diseasesDetails" value={formData.diseasesDetails} onChange={handleChange} className="w-full md:flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-accent-teal focus:ring-1 focus:ring-accent-teal/20 text-sm" />
              )}
            </div>

            <hr className="border-slate-100" />

            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <label className="text-sm font-bold text-slate-700 md:w-1/2">هل يعاني المتقدم/ة من حساسية أطعمة :</label>
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="hasAllergies" value="لا" checked={formData.hasAllergies === "لا"} onChange={handleChange} className="w-4 h-4 text-accent-teal focus:ring-accent-teal accent-accent-teal" />
                  <span className="font-medium text-slate-700">لا</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="hasAllergies" value="نعم" checked={formData.hasAllergies === "نعم"} onChange={handleChange} className="w-4 h-4 text-accent-teal focus:ring-accent-teal accent-accent-teal" />
                  <span className="font-medium text-slate-700">نعم</span>
                </label>
              </div>
              {formData.hasAllergies === "نعم" && (
                <input placeholder="اذكر الأطعمة:" name="allergiesDetails" value={formData.allergiesDetails} onChange={handleChange} className="w-full md:flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-accent-teal focus:ring-1 focus:ring-accent-teal/20 text-sm" />
              )}
            </div>
            
            <hr className="border-slate-100" />
            
            <div>
              <label className={labelClassName}>كيف عرفت عن البرنامج:</label>
              <input required name="howDidYouHear" value={formData.howDidYouHear} onChange={handleChange} className={inputClassName} placeholder="مثال: تويتر، صديق، الخ" />
            </div>
          </div>

          {/* Pledge & Rules Container */}
          <div className="space-y-4 border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            {/* Pledge */}
            <div className="bg-teal-50/50 p-6 sm:p-8">
              <h3 className="text-xl font-bold text-primary-teal text-center mb-4 font-tajawal flex items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 14 4-4"></path><path d="M3.34 19a10 10 0 1 1 17.32 0"></path></svg>
                تعهد
              </h3>
              <p className="text-sm text-slate-700 leading-relaxed text-justify">
                أتعهد أنا الموقع أدناه (ولي أمر المشارك/ة) بأن أتقيد بجميع الأنظمة والتعليمات الخاصة بالبرنامج وأن أتحلى بالآداب الإسلامية والأخلاق الرياضية الحميدة في تعاملي مع المعلمين والمشاركين وللإدارة كامل الحق في إلغاء اشتراكي واتخاذ القرار الذي تراه مناسباً في حالة مخالفتي لذلك. كما أقر بأني قرأت جميع الأنظمة والتعليمات أدناه.
              </p>
            </div>

            <hr className="border-teal-100" />

            {/* Rules */}
            <div className="bg-white p-6 sm:p-8 text-sm text-slate-700 leading-relaxed space-y-4">
               <h3 className="text-xl font-bold text-primary-teal text-center mb-6 font-tajawal flex items-center justify-center gap-2">
                 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><path d="M14 2v6h6"></path><path d="M16 13H8"></path><path d="M16 17H8"></path><path d="M10 9H8"></path></svg>
                 أنظمة وتعليمات
               </h3>
               <ul className="list-none space-y-3 font-medium">
                  <li className="flex gap-2"><span className="text-accent-teal font-bold">١-</span> <span>سوف يتم فتح ملف لكل منتسب بالبرنامج الصيفي، يحوي عدة نماذج تشمل معلوماته الشخصية مع صورة هويته أو هوية والده إذا كان مضافًا في بطاقة العائلة.</span></li>
                  <li className="flex gap-2"><span className="text-accent-teal font-bold">٢-</span> <span>التقيد بالنظافة الشخصية وارتداء الملابس المحتشمة التي تستر العورة وتجنب ارتداء الملابس الضيقة أو التي تحمل عبارات غير لائقة والالتزام بالآداب الإسلامية العامة وعدم التلفظ بكلمات بذيئة أو جارحة.</span></li>
                  <li className="flex gap-2"><span className="text-accent-teal font-bold">٣-</span> <span>على المشاركين إخلاء الملاعب وجميع الفصول وحمام السباحة قبل الصلاة بمدة لا تزيد عن ٥ دقائق استعدادًا للصلاة أو الانصراف من البرنامج.</span></li>
                  <li className="flex gap-2"><span className="text-accent-teal font-bold">٤-</span> <span>لا يحق لأي مشارك المطالبة باسترجاع رسوم الاشتراك بعد حضور اليوم الثاني للبرنامج.</span></li>
                  <li className="flex gap-2"><span className="text-accent-teal font-bold">٥-</span> <span>لدى برنامج لون صيفك ٣ (والذي يمثلها مكتب سرج للاستشارات التربوية والتعليمية) الحقوق الحصرية باستخدام صور المشتركين خلال أي دورة تدريبية أو أنشطة وبذلك يسمح باستخدام جميع الصور والفيديوهات للإعلانات والحملات الترويجية من خلال كافة وسائل الإعلام المرئية والمسموعة والمقروءة.</span></li>
                  <li className="flex gap-2"><span className="text-accent-teal font-bold">٦-</span> <span>يتحمل المشترك تكلفة أي ضرر أو تلف بممتلكات البرنامج أو المشاركين بها.</span></li>
                  <li className="flex gap-2"><span className="text-accent-teal font-bold">٧-</span> <span>نرجو الالتزام بوقت الحضور والانصراف للبرنامج من الساعة السادسة مساءً إلى الساعة الحادية عشر مساءً.</span></li>
                  <li className="flex gap-2"><span className="text-accent-teal font-bold">٨-</span> <span>مدة البرنامج شهر كامل ٤ أيام أسبوعيًا تبدأ من الأربعاء ١٤٤٨/٠١/٢٣ هـ إلى الأربعاء ١٤٤٨/٠٢/٢٢ هـ.</span></li>
                  <li className="flex gap-2"><span className="text-accent-teal font-bold">٩-</span> <span>حضور المشارك يكون بالزي الخاص بالبرنامج.</span></li>
                  <li className="flex gap-2"><span className="text-accent-teal font-bold">١٠-</span> <span>في حال كان المشارك يعاني من أي أمراض مزمنة أو حساسية من أطعمة معينة يتم إبلاغ مشرف المرحلة بذلك لمتابعته.</span></li>
                  <li className="flex gap-2"><span className="text-accent-teal font-bold">١١-</span> <span>سيتم عمل قروب خاص لأولياء الأمور في كل مجموعة ويرسل فيه كل مايخص البرنامج من جداول وفعاليات وتعليمات وتقارير يومية مرئية.</span></li>
                  <li className="flex gap-2"><span className="text-accent-teal font-bold">١٢-</span> <span>في حال وجود أي ملاحظة أو استفسار لاتتردد بالاتصال على الرقم (٠٥٦٤٦٠٥٠٥٥).</span></li>
                  <li className="flex gap-2"><span className="text-accent-teal font-bold">١٣-</span> <span>وقت حصة السباحة نرجو إحضار ملابس خاصة بالسباحة مع منشفة (يمنع السباحة بملابس قطنية).</span></li>
                  <li className="flex gap-2"><span className="text-accent-teal font-bold">١٤-</span> <span>ختامًا: نتمنى لأبنائكم صيف ممتع وفعاليات متنوعة وبرامج هادفة برفقة كادر إشراف تربوي متميز.</span></li>
               </ul>
            </div>
          </div>

          <label className="flex items-start gap-3 cursor-pointer bg-teal-50 p-4 sm:p-5 rounded-2xl border border-teal-200 transition-colors hover:bg-teal-100/50">
            <input 
              type="checkbox" 
              required
              name="pledgeAccepted"
              checked={formData.pledgeAccepted} 
              onChange={handleChange} 
              className="mt-1 w-5 h-5 text-accent-teal rounded focus:ring-accent-teal accent-accent-teal cursor-pointer shrink-0" 
            />
            <span className="text-sm font-bold text-primary-teal leading-relaxed">أقر وأوافق على التعهد وكافة الأنظمة والتعليمات المذكورة أعلاه.</span>
          </label>

          {/* Signatures */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 items-end bg-slate-50 p-5 sm:p-8 rounded-2xl border border-slate-200">
             <div className="space-y-4 w-full">
               <label className="text-sm font-bold text-primary-teal flex items-center gap-2">
                 <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"></path><path d="m15 5 4 4"></path></svg>
                 التوقيع الإلكتروني لولي الأمر:
               </label>
               <div className="border-2 border-dashed border-accent-teal/50 rounded-xl bg-white overflow-hidden relative group transition-colors hover:border-accent-teal w-full">
                 <SignatureCanvas 
                    ref={signatureRef}
                    penColor="#0a2a43"
                    canvasProps={{ className: "w-full h-40 sm:h-48 cursor-crosshair" }}
                    clearOnResize={false}
                 />
                 <button 
                   type="button" 
                   onClick={clearSignature}
                   className="absolute top-2 left-2 text-xs bg-white shadow-sm border border-slate-200 px-3 py-1.5 rounded-lg text-red-500 hover:bg-red-50 hover:border-red-200 transition-all font-medium opacity-100 md:opacity-0 md:group-hover:opacity-100"
                 >
                   مسح التوقيع
                 </button>
               </div>
               <p className="text-xs text-slate-500 font-medium">يرجى التوقيع داخل المربع أعلاه</p>
             </div>

             <div className="space-y-6 bg-white p-5 sm:p-6 rounded-xl border border-slate-200 w-full overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:gap-4 items-start sm:items-end">
                   <label className="text-sm font-bold text-slate-500 whitespace-nowrap mb-1 sm:mb-0">الاسم :</label>
                   <div className="border-b-2 border-slate-200 w-full text-center pb-1 sm:pb-2 text-primary-teal font-bold text-base sm:text-lg overflow-hidden text-ellipsis whitespace-nowrap">
                     {formData.parentName || "ــــــــــــــــــــــــــــــــ"}
                   </div>
                </div>
                <div className="flex flex-col sm:flex-row sm:gap-4 items-start sm:items-end">
                   <label className="text-sm font-bold text-slate-500 whitespace-nowrap mb-1 sm:mb-0">التاريخ :</label>
                   <div className="border-b-2 border-slate-200 w-full text-center pb-1 sm:pb-2 text-primary-teal font-bold text-base sm:text-lg">
                     {new Date().toLocaleDateString('ar-SA')}
                   </div>
                </div>
             </div>
          </div>

          <div className="pt-8 space-y-6">
            
            {/* Payment Options */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-700 block">اختر طريقة الدفع المفضلة:</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Option 1: Cash */}
                <button
                  type="button"
                  onClick={() => setPaymentOption("cash")}
                  className={`p-4 rounded-2xl border text-right transition-all text-xs font-bold flex justify-between items-center cursor-pointer w-full ${paymentOption === "cash"
                      ? "border-accent-yellow bg-yellow-50/50 text-accent-yellow shadow-inner"
                      : "border-slate-100 bg-slate-50 text-slate-700 hover:bg-slate-100"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl transition-all ${paymentOption === "cash" ? "bg-accent-yellow text-primary-navy shadow-md shadow-yellow-100" : "bg-slate-200 text-slate-500"}`}>
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div className="text-right">
                      <span className="block font-bold text-xs text-slate-800">الدفع النقدي (خصم ١٠٠ ريال لأول ١٠٠ مشترك)</span>
                      <span className="text-[10px] text-emerald-600 font-extrabold block mt-0.5">احصل على الخصم فوراً عند تأكيد الحجز</span>
                    </div>
                  </div>
                  <CheckCircle className={`w-4 h-4 shrink-0 mr-2 ${paymentOption === "cash" ? "text-accent-yellow" : "text-slate-200"}`} />
                </button>

                {/* Option 2: Card */}
                <button
                  type="button"
                  onClick={() => setPaymentOption("card")}
                  className={`p-4 rounded-2xl border text-right transition-all text-xs font-bold flex justify-between items-center cursor-pointer w-full ${paymentOption === "card"
                      ? "border-accent-yellow bg-yellow-50/50 text-accent-yellow shadow-inner animate-pulse-subtle"
                      : "border-slate-100 bg-slate-50 text-slate-700 hover:bg-slate-100"
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl transition-all ${paymentOption === "card" ? "bg-accent-yellow text-primary-navy shadow-md shadow-yellow-100" : "bg-slate-200 text-slate-500"}`}>
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div className="text-right">
                      <span className="block font-bold text-xs text-slate-800">بطاقة ائتمانية (سداد كامل المبلغ عبر المتجر)</span>
                      <span className="text-[10px] text-slate-400 font-normal block mt-0.5">الدفع الآمن عبر Stc pay , Apple pay, مدى </span>
                    </div>
                  </div>
                  <CheckCircle className={`w-4 h-4 shrink-0 mr-2 ${paymentOption === "card" ? "text-accent-yellow" : "text-slate-200"}`} />
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-primary-teal to-accent-teal text-white py-5 rounded-2xl font-bold text-xl hover:shadow-lg hover:shadow-accent-teal/30 hover:-translate-y-1 transition-all disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none flex justify-center items-center gap-3"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  جاري الإرسال...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                  إرسال الاستمارة وتأكيد التسجيل
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
