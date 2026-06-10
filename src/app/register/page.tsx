"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { supabase } from "@/utils/supabase";
import {
  Sparkles, CheckCircle, GraduationCap, Compass, Heart,
  ArrowLeft, ArrowRight, ShieldCheck, Mail, Phone, Lock, User, Plus, CreditCard, Eye, EyeOff
} from "lucide-react";

function RegisterContent() {
  const { loginUser, currentUser, logoutUser, registerUser, addFamilyChild, showToast, registrations } = useApp();
  const searchParams = useSearchParams();
  const router = useRouter();
  const activityType = searchParams.get("type");
  const activityName = searchParams.get("name");

  // Mode: "register", "login", or "forgot"
  const [mode, setMode] = useState<"register" | "login" | "forgot">("register");
  const [forgotEmail, setForgotEmail] = useState("");
  const [isSendingReset, setIsSendingReset] = useState(false);

  // Form states
  const [regForm, setRegForm] = useState({
    guardian1Name: "",
    guardian1Phone: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const [loginForm, setLoginForm] = useState({
    email: "",
    password: ""
  });
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  const [isSuccess, setIsSuccess] = useState(false);

  // Compute unique children names registered by current parent
  const myChildren = React.useMemo(() => {
    if (!currentUser) return [];
    const unique = new Set(
      registrations
        .filter((r) => r.email.trim().toLowerCase() === currentUser.email.trim().toLowerCase() && r.type !== "volunteer")
        .map((r) => r.fullName.trim())
    );
    return Array.from(unique);
  }, [registrations, currentUser]);

  // Quick activity registration form states
  const [selectedChildName, setSelectedChildName] = useState<string>("");
  const [newChildForm, setNewChildForm] = useState({
    fullName: "",
    age: "",
    gender: "ذكر",
    grade: "الصف الأول المتوسط"
  });
  const [activityAgreed, setActivityAgreed] = useState(false);
  const [activitySuccess, setActivitySuccess] = useState(false);
  const [paymentOption, setPaymentOption] = useState<"cash" | "card">("cash");

  const handleSelectChild = (name: string) => {
    setSelectedChildName(name);
    if (name === "new") {
      setNewChildForm({
        fullName: "",
        age: "",
        gender: "ذكر",
        grade: "الصف الأول المتوسط"
      });
    } else {
      const prevReg = registrations.find(
        (r) => r.fullName.trim() === name && r.email.trim().toLowerCase() === currentUser?.email.trim().toLowerCase()
      );
      let gender = "ذكر";
      let grade = "الصف الأول المتوسط";
      if (prevReg) {
        if (prevReg.targetName.includes("أنثى")) gender = "أنثى";
        else if (prevReg.targetName.includes("ذكر")) gender = "ذكر";
        
        if (prevReg.targetName.includes("الصف")) {
          const parts = prevReg.targetName.split("-");
          if (parts.length > 1) {
            grade = parts[1].split("(")[0].trim();
          }
        }
      }
      setNewChildForm({
        fullName: name,
        age: prevReg ? String(prevReg.age) : "12",
        gender,
        grade
      });
    }
  };

  React.useEffect(() => {
    if (currentUser && myChildren.length > 0 && !selectedChildName) {
      handleSelectChild(myChildren[0]);
    } else if (currentUser && myChildren.length === 0) {
      setSelectedChildName("new");
    }
  }, [myChildren, currentUser]);

  const handleActivityRegisterSubmit = async (e?: React.SyntheticEvent) => {
    if (e) e.preventDefault();
    if (!currentUser) {
      showToast("يرجى تسجيل الدخول أولاً للمتابعة.", "error");
      return;
    }
    if (!activityAgreed) {
      showToast("الرجاء قراءة التعهد والموافقة عليه للمتابعة.", "warning");
      return;
    }
    if (!newChildForm.fullName || !newChildForm.age || !newChildForm.gender || !newChildForm.grade) {
      showToast("الرجاء تعبئة كافة حقول بيانات المشترك.", "warning");
      return;
    }

    try {
      const targetName = `${activityName} - ${newChildForm.grade} (${newChildForm.gender})`;

      const completeRegistration = async () => {
        await registerUser({
          fullName: newChildForm.fullName,
          age: Number(newChildForm.age),
          phone: currentUser.phone,
          email: currentUser.email,
          interests: [activityType === "trip" ? "trip" : activityType === "academy" ? "academy" : "program"],
          type: activityType as any,
          targetName,
          paymentMethod: paymentOption === "card" ? "بطاقة ائتمانية" : "نقدي"
        });
        setActivitySuccess(true);
        showToast("تم التسجيل وحجز المقعد بنجاح!", "success");
      };

      if (paymentOption === "card") {
        showToast("جاري التحويل لبوابة الدفع الآمنة...", "info");
        setTimeout(() => {
          completeRegistration();
        }, 1500);
      } else {
        await completeRegistration();
      }

    } catch (err) {
      console.error("Activity registration failed:", err);
      showToast("حدث خطأ أثناء إتمام التسجيل. الرجاء المحاولة مرة أخرى.", "error");
    }
  };

  const getAgeFromGrade = (grade: string): number => {
    if (grade.includes("الأول الابتدائي")) return 7;
    if (grade.includes("الثاني الابتدائي")) return 8;
    if (grade.includes("الثالث الابتدائي")) return 9;
    if (grade.includes("الرابع الابتدائي")) return 10;
    if (grade.includes("الخامس الابتدائي")) return 11;
    if (grade.includes("السادس الابتدائي")) return 12;
    if (grade.includes("الأول المتوسط")) return 13;
    if (grade.includes("الثاني المتوسط")) return 14;
    if (grade.includes("الثالث المتوسط")) return 15;
    if (grade.includes("الأول الثانوي")) return 16;
    if (grade.includes("الثاني الثانوي")) return 17;
    if (grade.includes("الثالث الثانوي")) return 18;
    return 12;
  };

  const handleRegisterSubmit = async (e?: React.SyntheticEvent) => {
    if (e) e.preventDefault();
    if (!regForm.guardian1Name || !regForm.email || !regForm.guardian1Phone || !regForm.password || !regForm.confirmPassword) {
      showToast("الرجاء تعبئة كافة الحقول المطلوبة للتسجيل.", "warning");
      return;
    }
    if (regForm.password !== regForm.confirmPassword) {
      showToast("كلمة المرور وتأكيد كلمة المرور غير متطابقين.", "error");
      return;
    }
    const phoneRegex = /^05\d{8}$/;
    if (!phoneRegex.test(regForm.guardian1Phone)) {
      showToast("رقم الجوال يجب أن يبدأ بـ 05 ويتكون من 10 أرقام.", "error");
      return;
    }
    try {
      // 1. Login/Signup the user officially via Supabase
      await loginUser(
        regForm.guardian1Name,
        regForm.email,
        regForm.guardian1Phone,
        regForm.password,
        true
      );

      setIsSuccess(true);

      setTimeout(() => {
        setIsSuccess(false);
        setRegForm({
          guardian1Name: "",
          guardian1Phone: "",
          email: "",
          password: "",
          confirmPassword: ""
        });
      }, 4000);
    } catch (err) {
      console.error("Signup failed:", err);
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginForm.email) {
      showToast("الرجاء إدخال البريد الإلكتروني.", "warning");
      return;
    }
    if (!loginForm.password) {
      showToast("الرجاء إدخال كلمة المرور.", "warning");
      return;
    }
    setIsLoggingIn(true);
    try {
      const simulatedName = loginForm.email.split("@")[0];
      await loginUser(simulatedName, loginForm.email, "", loginForm.password, false);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setLoginForm({ email: "", password: "" });
      }, 3000);
    } catch (err) {
      console.error("Login failed:", err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) {
      showToast("الرجاء إدخال البريد الإلكتروني الخاص بك.", "warning");
      return;
    }
    setIsSendingReset(true);
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail, origin: window.location.origin }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        showToast(`خطأ: ${result.error || "فشل في إرسال البريد الإلكتروني"}`, "error");
      } else {
        showToast("تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني بنجاح!", "success");
        setMode("login");
        setForgotEmail("");
      }
    } catch (err: any) {
      showToast("حدث خطأ غير متوقع. الرجاء المحاولة لاحقاً.", "error");
    } finally {
      setIsSendingReset(false);
    }
  };

  React.useEffect(() => {
    const urlMode = searchParams.get("mode");
    if (urlMode === "login") {
      setMode("login");
    } else if (urlMode === "register") {
      setMode("register");
    } else if (urlMode === "forgot") {
      setMode("forgot");
    }
  }, [searchParams]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16 flex-grow flex flex-col justify-center">

      {/* Page header copy */}
      <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
        <h1 className="text-2xl md:text-3xl font-extrabold text-primary-navy font-tajawal">
          {currentUser ? (activityType && activityName ? "تسجيل سريع في النشاط" : "تفاصيل حسابك") : "انضم إلى مجتمع مُلهم"}
        </h1>
        <p className="text-slate-500 text-sm leading-relaxed">
          {currentUser
            ? (activityType && activityName ? "سجل ابنك/ابنتك مباشرة في هذا النشاط دون الحاجة لإعادة إدخال بياناتك الشخصية كولي أمر." : "أنت الآن عضو رسمي في منصة ملهم. تصفح برامجك وسجلات تسجيلاتك عبر لوحة التحكم.")
            : "خطوتك الأولى نحو تجربة استثنائية مليئة بالتعلم والمغامرة. سجل الآن لتكون جزءاً من رحلتنا."
          }
        </p>
      </div>

      {currentUser ? (
        activityType && activityName ? (
          // RENDER QUICK ACTIVITY REGISTRATION FOR LOGGED IN PARENTS
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl max-w-2xl mx-auto w-full p-8 text-right space-y-6 animate-in zoom-in-95 duration-200 relative overflow-hidden">
            <div className="absolute top-0 right-0 left-0 h-1.5 bg-accent-yellow" />
            
            {activitySuccess ? (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center shadow-inner">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-800">تم التسجيل بنجاح!</h3>
                <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                  تم حجز مقعد لـ <strong className="text-slate-700">{newChildForm.fullName}</strong> في <strong>{activityName}</strong> بنجاح.
                </p>
                <p className="text-[11px] text-slate-400 max-w-sm">
                  تم إرسال تفاصيل التأكيد والتعليمات إلى بريد ولي الأمر: {currentUser.email} ورقم الجوال: {currentUser.phone}.
                </p>
                <div className="flex gap-3 pt-4 justify-center">
                  <Link
                    href="/dashboard"
                    className="px-6 py-2.5 bg-primary-navy hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-md hover:shadow-lg"
                  >
                    انتقل للوحة التحكم لمتابعة الطلب
                  </Link>
                  <Link
                    href="/"
                    className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
                  >
                    العودة للرئيسية
                  </Link>
                </div>
              </div>
            ) : (
              <form className="space-y-6">
                {/* Activity details badge */}
                <div className="p-4 bg-slate-50 border border-slate-200/60 rounded-2xl flex items-start gap-4">
                  <div className="w-12 h-12 bg-accent-yellow/10 text-accent-yellow rounded-xl flex items-center justify-center flex-shrink-0">
                    {activityType === "trip" ? (
                      <Compass className="w-6 h-6" />
                    ) : activityType === "academy" ? (
                      <GraduationCap className="w-6 h-6" />
                    ) : (
                      <Sparkles className="w-6 h-6" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] text-accent-yellow font-extrabold block">
                      طلب تسجيل سريع في {activityType === "trip" ? "رحلة استكشافية" : activityType === "academy" ? "أكاديمية قيادية" : "برنامج إثرائي"}
                    </span>
                    <h3 className="font-bold text-slate-800 text-sm leading-tight">{activityName}</h3>
                  </div>
                </div>

                {/* Readonly Guardian badge */}
                <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-2xl text-[11px] text-blue-800 leading-normal flex flex-wrap gap-x-4 gap-y-1">
                  <span><strong>ولي الأمر المسجل:</strong> {currentUser.fullName}</span>
                  <span><strong>الجوال:</strong> {currentUser.phone}</span>
                  <span><strong>البريد:</strong> {currentUser.email}</span>
                </div>

                {/* Child Selection Pills */}
                {myChildren.length > 0 && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 block">اختر أحد أبنائك المسجلين أو أضف جديداً:</label>
                    <div className="flex flex-wrap gap-2">
                      {myChildren.map((name) => (
                        <button
                          type="button"
                          key={name}
                          onClick={() => handleSelectChild(name)}
                          className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                            selectedChildName === name
                              ? "bg-accent-yellow text-primary-navy border-accent-yellow shadow-md animate-in fade-in duration-200"
                              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          {name}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => handleSelectChild("new")}
                        className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-1 cursor-pointer ${
                          selectedChildName === "new"
                            ? "bg-accent-yellow text-primary-navy border-accent-yellow shadow-md animate-in fade-in duration-200"
                            : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                        }`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        ابن/ابنة جديدة
                      </button>
                    </div>
                  </div>
                )}

                {/* Child Details form fields */}
                <div className="space-y-4 pt-2 border-t border-slate-100">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 block">الاسم الكامل للمشترك *</label>
                    <input
                      type="text"
                      disabled={selectedChildName !== "new"}
                      value={newChildForm.fullName}
                      onChange={(e) => setNewChildForm({ ...newChildForm, fullName: e.target.value })}
                      placeholder="أدخل اسم الابن/الابنة الثلاثي"
                      className="w-full bg-slate-50 border border-slate-200 focus:border-accent-yellow rounded-xl px-4 py-3 text-xs text-right focus:outline-none disabled:bg-slate-100 disabled:text-slate-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 block">الجنس *</label>
                      <select
                        disabled={selectedChildName !== "new"}
                        value={newChildForm.gender}
                        onChange={(e) => setNewChildForm({ ...newChildForm, gender: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-accent-yellow rounded-xl px-3 py-3 text-xs text-right focus:outline-none disabled:bg-slate-100 disabled:text-slate-500"
                      >
                        <option value="ذكر">ذكر</option>
                        <option value="أنثى">أنثى</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 block">الصف الدراسي *</label>
                      <select
                        disabled={selectedChildName !== "new"}
                        value={newChildForm.grade}
                        onChange={(e) => setNewChildForm({ ...newChildForm, grade: e.target.value })}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-accent-yellow rounded-xl px-3 py-3 text-xs text-right focus:outline-none disabled:bg-slate-100 disabled:text-slate-500"
                      >
                        <option value="الصف الأول الابتدائي">الصف الأول الابتدائي</option>
                        <option value="الصف الثاني الابتدائي">الصف الثاني الابتدائي</option>
                        <option value="الصف الثالث الابتدائي">الصف الثالث الابتدائي</option>
                        <option value="الصف الرابع الابتدائي">الصف الرابع الابتدائي</option>
                        <option value="الصف الخامس الابتدائي">الصف الخامس الابتدائي</option>
                        <option value="الصف السادس الابتدائي">الصف السادس الابتدائي</option>
                        <option value="الصف الأول المتوسط">الصف الأول المتوسط</option>
                        <option value="الصف الثاني المتوسط">الصف الثاني المتوسط</option>
                        <option value="الصف الثالث المتوسط">الصف الثالث المتوسط</option>
                        <option value="الصف الأول الثانوي">الصف الأول الثانوي</option>
                        <option value="الصف الثاني الثانوي">الصف الثاني الثانوي</option>
                        <option value="الصف الثالث الثانوي">الصف الثالث الثانوي</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 block">العمر *</label>
                      <input
                        type="number"
                        disabled={selectedChildName !== "new"}
                        value={newChildForm.age}
                        onChange={(e) => setNewChildForm({ ...newChildForm, age: e.target.value })}
                        placeholder="مثال: 14"
                        className="w-full bg-slate-50 border border-slate-200 focus:border-accent-yellow rounded-xl px-4 py-3 text-xs text-right focus:outline-none disabled:bg-slate-100 disabled:text-slate-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Pledge section */}
                <div className="space-y-4 pt-4 border-t border-slate-100">
                  <div className="border border-slate-200 rounded-2xl bg-slate-50/70 p-4 space-y-3 max-h-[160px] overflow-y-auto text-right text-xs leading-relaxed text-slate-600 font-tajawal scrollbar-thin">
                    <h4 className="font-bold text-slate-800 text-xs pb-2 border-b border-slate-200">الأنظمة والتعليمات والتعاميم</h4>
                    <p className="text-[10px] leading-relaxed">
                      أتعهد بالتقيد بالنظافة الشخصية والملابس اللائقة، والآداب والتعليمات الموجهة من مشرفي النشاط. كما أقر بأن جميع البيانات المدخلة صحيحة تماماً وبأنني اطلعت على كافة الشروط والتفاصيل المتعلقة بالنشاط وأوافق عليها.
                    </p>
                  </div>

                  <label className="flex items-start gap-3 p-4 bg-yellow-50/40 border border-yellow-100 rounded-2xl cursor-pointer hover:bg-yellow-50/70 transition-all select-none">
                    <input
                      type="checkbox"
                      checked={activityAgreed}
                      onChange={(e) => setActivityAgreed(e.target.checked)}
                      className="mt-1 w-4 h-4 text-accent-yellow focus:ring-accent-yellow border-slate-300 rounded cursor-pointer"
                    />
                    <div className="text-right text-[11px] leading-relaxed text-slate-700 font-medium">
                      <span className="font-extrabold text-accent-yellow block mb-1">الموافقة والإقرار بالتعهد *</span>
                      أوافق على الالتزام بالتعليمات الموضحة وأتعهد بنظام وسلوك المشترك خلال فترة النشاط.
                    </div>
                  </label>

                  {/* Payment choice */}
                  <div className="space-y-3 pt-2">
                    <label className="text-sm font-black text-slate-800 font-tajawal block">اختر طريقة الدفع المفضلة</label>
                    <div className="space-y-3">
                      {/* Option 1: Cash (Now First) */}
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
                            <span className="block font-black text-sm text-slate-800 font-tajawal">الدفع النقدي (خصم ١٠٠ ريال لأول ١٠٠ مشترك)</span>
                            <span className="text-xs text-emerald-600 font-black block mt-1">احصل على الخصم فوراً عند تأكيد الحجز</span>
                          </div>
                        </div>
                        <CheckCircle className={`w-4.5 h-4.5 ${paymentOption === "cash" ? "text-accent-yellow" : "text-slate-200"}`} />
                      </button>

                      {/* Option 2: Card (Now Second) */}
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
                            <span className="block font-black text-sm text-slate-800 font-tajawal">بطاقة ائتمانية (سداد كامل المبلغ عبر المتجر)</span>
                            <span className="text-xs text-slate-500 font-bold block mt-1">الدفع الآمن عبر Stc pay , Apple pay,مدى </span>
                          </div>
                        </div>
                        <CheckCircle className={`w-4.5 h-4.5 ${paymentOption === "card" ? "text-accent-yellow" : "text-slate-200"}`} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                  <Link
                    href="/"
                    className="text-xs text-slate-400 hover:text-slate-600 font-semibold"
                  >
                    إلغاء والعودة للرئيسية
                  </Link>
                  <button
                    type="button"
                    onClick={handleActivityRegisterSubmit}
                    className="px-6 py-3 bg-accent-teal hover:bg-primary-teal text-white rounded-xl text-xs font-bold transition-all shadow-md hover:shadow-lg flex items-center gap-1.5 cursor-pointer"
                  >
                    تأكيد حجز مقعد النشاط
                    <CheckCircle className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : (
          // RENDER LOGGED IN SCREEN
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl max-w-2xl mx-auto w-full p-8 text-center space-y-6 animate-in zoom-in-95 duration-200">
            <div className="w-20 h-20 bg-yellow-50 text-accent-yellow rounded-full flex items-center justify-center mx-auto shadow-inner">
              <ShieldCheck className="w-10 h-10" />
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-bold text-slate-800">مرحباً بك مجدداً، {currentUser.fullName}!</h2>
              <p className="text-xs text-slate-400">لقد تم تسجيل دخولك بنجاح باستخدام بريدك: {currentUser.email}</p>
            </div>
            <div className="border border-slate-100 p-4 rounded-xl bg-slate-50 text-right text-xs max-w-md mx-auto space-y-2">
              <p><span className="font-bold text-slate-500">الاسم الكامل:</span> {currentUser.fullName}</p>
              <p><span className="font-bold text-slate-500">رقم الهاتف:</span> {currentUser.phone}</p>
              <p><span className="font-bold text-slate-500">البريد الإلكتروني:</span> {currentUser.email}</p>
            </div>
            <div className="flex gap-4 justify-center">
              <Link
                href="/dashboard"
                className="px-6 py-2.5 bg-primary-navy hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all duration-300"
              >
                انتقل للوحة التحكم
              </Link>
              <button
                onClick={logoutUser}
                className="px-6 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold transition-all duration-300"
              >
                تسجيل الخروج
              </button>
            </div>
          </div>
        )
      ) : (
        // RENDER LOGIN / REGISTER WIZARD
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch max-w-5xl mx-auto w-full">

          {/* LEFT COLUMN: THE FORMS (8 cols) */}
          <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden flex flex-col relative min-h-[460px]">
            <div className="absolute top-0 right-0 left-0 h-1.5 bg-accent-yellow" />

            {isSuccess ? (
              // Success Screen inside form
              <div className="flex-grow flex flex-col items-center justify-center p-8 text-center space-y-4 animate-in fade-in zoom-in duration-300">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-slate-800">
                  {mode === "register" ? "تم تسجيل عضويتك بنجاح!" : "تم تسجيل دخولك بنجاح!"}
                </h3>
                <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                  مرحباً بك في مجتمع ملهم. لقد أصبحت الآن قادراً على التسجيل في الرحلات والأكاديميات بشكل أسرع وإدارة مشترياتك بكل سهولة!
                </p>
                <Link
                  href="/"
                  className="px-6 py-2.5 bg-accent-teal hover:bg-primary-teal text-white rounded-xl text-xs font-bold transition-all duration-300"
                >
                  العودة للرئيسية
                </Link>
              </div>
            ) : mode === "register" ? (
              // REGISTER FORM WIZARD
              <form onSubmit={handleRegisterSubmit} className="p-8 flex-grow flex flex-col justify-between">
                <div className="space-y-5 animate-in fade-in duration-300">
                  <span className="text-[10px] text-accent-yellow font-extrabold block">إنشاء حساب جديد</span>
                  
                  <div className="space-y-4 border border-slate-100 p-5 rounded-2xl bg-slate-50/50">
                    <h4 className="text-xs font-extrabold text-slate-700 font-tajawal">بيانات ولي الأمر</h4>
                    
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 block">اسم ولي الأمر *</label>
                        <input
                          type="text"
                          required
                          value={regForm.guardian1Name}
                          onChange={(e) => setRegForm({ ...regForm, guardian1Name: e.target.value })}
                          placeholder="الاسم الثلاثي"
                          className="w-full bg-white border border-slate-200 focus:border-accent-yellow rounded-xl px-4 py-3 text-xs text-right focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 block">رقم الجوال *</label>
                        <input
                          type="tel"
                          required
                          maxLength={10}
                          pattern="05[0-9]{8}"
                          title="يجب أن يبدأ الرقم بـ 05 ويتكون من 10 أرقام"
                          value={regForm.guardian1Phone}
                          onChange={(e) => {
                            const val = e.target.value.replace(/\D/g, '');
                            setRegForm({ ...regForm, guardian1Phone: val });
                          }}
                          placeholder="05XXXXXXXX"
                          className="w-full bg-white border border-slate-200 focus:border-accent-yellow rounded-xl px-4 py-3 text-xs text-right focus:outline-none font-sans"
                          dir="ltr"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 block">البريد الإلكتروني *</label>
                        <input
                          type="email"
                          required
                          value={regForm.email}
                          onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                          placeholder="parent@example.com"
                          className="w-full bg-white border border-slate-200 focus:border-accent-yellow rounded-xl px-4 py-3 text-xs text-left focus:outline-none font-sans"
                          dir="ltr"
                        />
                      </div>

                      <div className="space-y-1 relative">
                        <label className="text-xs font-bold text-slate-500 block">كلمة المرور *</label>
                        <div className="relative">
                          <input
                            type={showRegPassword ? "text" : "password"}
                            required
                            value={regForm.password}
                            onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                            placeholder="أدخل كلمة مرور قوية"
                            className="w-full bg-white border border-slate-200 focus:border-accent-yellow rounded-xl pl-10 pr-4 py-3 text-xs text-right focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => setShowRegPassword(!showRegPassword)}
                            className="absolute left-3.5 top-3.5 text-slate-400 hover:text-slate-600 transition-colors"
                          >
                            {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1 relative">
                        <label className="text-xs font-bold text-slate-500 block">تأكيد كلمة المرور *</label>
                        <div className="relative">
                          <input
                            type={showRegConfirmPassword ? "text" : "password"}
                            required
                            value={regForm.confirmPassword}
                            onChange={(e) => setRegForm({ ...regForm, confirmPassword: e.target.value })}
                            placeholder="أعد إدخال كلمة المرور"
                            className="w-full bg-white border border-slate-200 focus:border-accent-yellow rounded-xl pl-10 pr-4 py-3 text-xs text-right focus:outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                            className="absolute left-3.5 top-3.5 text-slate-400 hover:text-slate-600 transition-colors"
                          >
                            {showRegConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-6 border-t border-slate-50 mt-6 font-tajawal">
                  <button
                    type="button"
                    onClick={() => setMode("login")}
                    className="text-xs text-slate-400 hover:text-accent-yellow transition-all font-semibold cursor-pointer"
                  >
                    لديك حساب بالفعل؟ تسجيل الدخول
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-accent-teal hover:bg-primary-teal text-white rounded-xl text-xs font-bold transition-all shadow-md hover:shadow-lg flex items-center gap-1.5 cursor-pointer"
                  >
                    تأكيد التسجيل
                    <CheckCircle className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            ) : mode === "login" ? (
              // LOGIN FORM
              <form onSubmit={handleLoginSubmit} className="p-8 flex-grow flex flex-col justify-between">
                <div className="space-y-5">
                  <span className="text-[10px] text-accent-yellow font-extrabold block">تسجيل الدخول إلى حسابك</span>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 block">البريد الإلكتروني *</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={loginForm.email}
                        onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                        placeholder="email@example.com"
                        className="w-full bg-slate-50 border border-slate-200 focus:border-accent-yellow rounded-xl pl-10 pr-4 py-3 text-xs text-left focus:outline-none font-sans"
                        dir="ltr"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 block">كلمة المرور *</label>
                    <div className="relative">
                      <Lock className="absolute right-3.5 top-3.5 w-4 h-4 text-slate-400" />
                      <input
                        type={showLoginPassword ? "text" : "password"}
                        required
                        value={loginForm.password}
                        onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                        placeholder="••••••••"
                        className="w-full bg-slate-50 border border-slate-200 focus:border-accent-yellow rounded-xl pl-10 pr-10 py-3 text-xs text-right focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute left-3.5 top-3.5 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                        {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <div className="text-left pt-1">
                      <button
                        type="button"
                        onClick={() => setMode("forgot")}
                        className="text-[10px] text-accent-yellow hover:underline font-bold cursor-pointer font-tajawal"
                      >
                        هل نسيت كلمة المرور؟
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-6 border-t border-slate-50 mt-8 font-tajawal">
                  <button
                    type="button"
                    onClick={() => setMode("register")}
                    className="text-xs text-slate-400 hover:text-accent-yellow transition-all font-semibold cursor-pointer"
                  >
                    ليس لديك حساب؟ إنشاء حساب جديد
                  </button>
                  <button
                    type="submit"
                    disabled={isLoggingIn}
                    className="px-6 py-2.5 bg-accent-yellow hover:bg-primary-yellow disabled:bg-slate-300 text-primary-navy rounded-xl text-xs font-bold transition-all shadow-md hover:shadow-lg cursor-pointer flex items-center gap-1.5"
                  >
                    {isLoggingIn ? "جاري الدخول..." : "تسجيل الدخول"}
                  </button>
                </div>
              </form>
            ) : (
              // FORGOT PASSWORD FORM
              <form onSubmit={handleForgotPasswordSubmit} className="p-8 flex-grow flex flex-col justify-between font-tajawal">
                <div className="space-y-5 animate-in fade-in duration-350">
                  <span className="text-[10px] text-accent-yellow font-extrabold block">استعادة كلمة المرور</span>
                  <h3 className="text-sm font-bold text-slate-800">نسيت كلمة المرور؟</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    أدخل بريدك الإلكتروني المسجل وسنرسل لك رابطاً لإعادة تعيين كلمة مرور جديدة لحسابك.
                  </p>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 block">البريد الإلكتروني *</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="email@example.com"
                        className="w-full bg-slate-50 border border-slate-200 focus:border-accent-yellow rounded-xl pl-10 pr-4 py-3 text-xs text-left focus:outline-none font-sans"
                        dir="ltr"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-6 border-t border-slate-50 mt-8">
                  <button
                    type="button"
                    onClick={() => setMode("login")}
                    className="text-xs text-slate-400 hover:text-accent-yellow transition-all font-semibold cursor-pointer"
                  >
                    العودة لتسجيل الدخول
                  </button>
                  <button
                    type="submit"
                    disabled={isSendingReset}
                    className="px-6 py-2.5 bg-accent-yellow hover:bg-primary-yellow disabled:bg-slate-300 text-primary-navy rounded-xl text-xs font-bold transition-all shadow-md hover:shadow-lg flex items-center gap-1.5 cursor-pointer"
                  >
                    {isSendingReset ? "جاري الإرسال..." : "إرسال رابط الاستعادة"}
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* RIGHT COLUMN: BENEFITS PANEL (4 cols) */}
          <div className="lg:col-span-4 bg-gradient-to-br from-primary-navy to-slate-900 rounded-3xl p-8 text-white flex flex-col justify-between border border-slate-800 shadow-xl space-y-10">
            <div className="space-y-8">
              <h3 className="font-extrabold text-base font-tajawal relative pb-2 after:content-[''] after:absolute after:bottom-0 after:right-0 after:w-8 after:h-0.5 after:bg-accent-yellow">
                لماذا تنضم إلينا؟
              </h3>

              {/* Benefit 1 */}
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-yellow-500/10 text-accent-yellow rounded-xl flex items-center justify-center flex-shrink-0 border border-yellow-500/20">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-100 text-xs">أكاديميات متخصصة</h4>
                  <p className="text-[10px] text-slate-400 leading-relaxed">برامج تدريبية مكثفة وعملية بقيادة أفضل المدربين المعتمدين.</p>
                </div>
              </div>

              {/* Benefit 2 */}
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-blue-500/10 text-blue-400 rounded-xl flex items-center justify-center flex-shrink-0 border border-blue-500/20">
                  <Compass className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-100 text-xs">رحلات ملهمة</h4>
                  <p className="text-[10px] text-slate-400 leading-relaxed">هايكنج، تخييم ومخيمات إيمانية تصنع فيك مغامراً وقائداً متميزاً.</p>
                </div>
              </div>

              {/* Benefit 3 */}
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-amber-500/10 text-amber-400 rounded-xl flex items-center justify-center flex-shrink-0 border border-amber-500/20">
                  <Heart className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-100 text-xs">فرص تطوعية</h4>
                  <p className="text-[10px] text-slate-400 leading-relaxed">أطلق طاقاتك في مبادرات مجتمعية مؤثرة تخدم وطنك وتنمي وعيك.</p>
                </div>
              </div>
            </div>


          </div>

        </div>
      )}

    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[65vh] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-slate-100 border-t-accent-yellow animate-spin"></div>
        <span className="text-xs text-slate-400 font-medium font-tajawal">جاري تحميل صفحة التسجيل...</span>
      </div>
    }>
      <RegisterContent />
    </Suspense>
  );
}
