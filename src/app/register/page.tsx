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
  const { loginUser, currentUser, logoutUser, registerUser, showToast, registrations } = useApp();
  const searchParams = useSearchParams();
  const router = useRouter();
  const activityType = searchParams.get("type");
  const activityName = searchParams.get("name");

  // Mode: "register", "login", or "forgot"
  const [mode, setMode] = useState<"register" | "login" | "forgot">("register");
  const [forgotEmail, setForgotEmail] = useState("");
  const [isSendingReset, setIsSendingReset] = useState(false);

  // Registration Step: 1, 2, 3, 4
  const [step, setStep] = useState(1);
  const [isAgreed, setIsAgreed] = useState(false);

  // Form states
  const [regForm, setRegForm] = useState({
    guardian1Name: "",
    guardian1Phone: "",
    guardian2Name: "",
    guardian2Phone: "",
    children: [
      { fullName: "", gender: "", grade: "" }
    ],
    email: "",
    password: ""
  });

  const [loginForm, setLoginForm] = useState({
    email: "",
    password: ""
  });
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);
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
  const [paymentOption, setPaymentOption] = useState<"cash" | "card" | "tabby">("card");

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
          paymentMethod: paymentOption === "card" ? "بطاقة ائتمانية" : paymentOption === "tabby" ? "أقساط تابي" : "نقدي"
        });
        setActivitySuccess(true);
        showToast("تم التسجيل وحجز المقعد بنجاح!", "success");
      };

      if (paymentOption === "card" || paymentOption === "tabby") {
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

  const handleNextStep = () => {
    if (step === 1) {
      if (!regForm.guardian1Name || !regForm.guardian1Phone || !regForm.guardian2Name || !regForm.guardian2Phone) {
        showToast("الرجاء تعبئة كافة الحقول المطلوبة لبيانات أولياء الأمور.", "warning");
        return;
      }
    }
    if (step === 2) {
      const hasEmptyChild = regForm.children.some(
        child => !child.fullName || !child.gender || !child.grade
      );
      if (hasEmptyChild || regForm.children.length === 0) {
        showToast("الرجاء تعبئة كافة الحقول المطلوبة للأبناء والبنات.", "warning");
        return;
      }
    }
    if (step === 3) {
      if (!isAgreed) {
        showToast("الرجاء قراءة الأنظمة والتعليمات والموافقة على التعهد للمتابعة.", "warning");
        return;
      }
    }
    setStep(step + 1);
  };

  const handlePrevStep = () => {
    setStep(step - 1);
  };

  const handleRegisterSubmit = async (e?: React.SyntheticEvent) => {
    if (e) e.preventDefault();
    if (regForm.guardian1Name && regForm.email && regForm.guardian1Phone && regForm.password) {
      try {
        // 1. Login/Signup the user officially (using Guardian 1 & 2 info) via Supabase
        await loginUser(
          regForm.guardian1Name,
          regForm.email,
          regForm.guardian1Phone,
          regForm.password,
          true,
          regForm.guardian2Name,
          regForm.guardian2Phone
        );

        // 2. Submit to context registrations for each child (this will insert to Supabase)
        for (const child of regForm.children) {
          await registerUser({
            fullName: child.fullName,
            age: getAgeFromGrade(child.grade),
            phone: `${regForm.guardian1Phone} (ولي الأمر 2: ${regForm.guardian2Phone})`,
            email: regForm.email,
            interests: ["program"],
            type: "program",
            targetName: `اهتمام بالبرنامج الصيفي: ${child.fullName} - ${child.grade} (${child.gender})`,
            paymentMethod: paymentOption === "card" ? "بطاقة ائتمانية" : paymentOption === "tabby" ? "أقساط تابي" : "نقدي"
          });
        }

        setIsSuccess(true);

        setTimeout(() => {
          setIsSuccess(false);
          setStep(1);
          setIsAgreed(false);
          setRegForm({
            guardian1Name: "",
            guardian1Phone: "",
            guardian2Name: "",
            guardian2Phone: "",
            children: [
              { fullName: "", gender: "", grade: "" }
            ],
            email: "",
            password: ""
          });
        }, 4000);
      } catch (err) {
        console.error("Signup failed:", err);
      }
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
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) {
        showToast(`خطأ: ${error.message}`, "error");
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 flex-grow flex flex-col justify-center">

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
                              ? "bg-accent-yellow text-white border-accent-yellow shadow-md animate-in fade-in duration-200"
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
                            ? "bg-accent-yellow text-white border-accent-yellow shadow-md animate-in fade-in duration-200"
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
                    <label className="text-xs font-bold text-slate-500 block">اختر طريقة الدفع المفضلة</label>
                    <div className="space-y-3">
                      {/* Option 1: Card */}
                      <button
                        type="button"
                        onClick={() => setPaymentOption("card")}
                        className={`p-4 rounded-2xl border text-right transition-all text-xs font-bold flex justify-between items-center cursor-pointer w-full ${paymentOption === "card"
                            ? "border-accent-yellow bg-yellow-50/50 text-accent-yellow shadow-inner animate-pulse-subtle"
                            : "border-slate-100 bg-slate-50 text-slate-700 hover:bg-slate-100"
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2.5 rounded-xl transition-all ${paymentOption === "card" ? "bg-accent-yellow text-white shadow-md shadow-yellow-100" : "bg-slate-200 text-slate-500"}`}>
                            <CreditCard className="w-4 h-4" />
                          </div>
                          <div className="text-right">
                            <span className="block font-bold text-xs text-slate-800">بطاقة ائتمانية (سداد كامل المبلغ عبر المتجر)</span>
                            <span className="text-[10px] text-slate-400 font-normal block mt-0.5">الدفع الآمن عبر Stc pay , Apple pay,مدى </span>
                          </div>
                        </div>
                        <CheckCircle className={`w-4.5 h-4.5 ${paymentOption === "card" ? "text-accent-yellow" : "text-slate-200"}`} />
                      </button>

                      {/* Option 2: Cash */}
                      <button
                        type="button"
                        onClick={() => setPaymentOption("cash")}
                        className={`p-4 rounded-2xl border text-right transition-all text-xs font-bold flex justify-between items-center cursor-pointer w-full ${paymentOption === "cash"
                            ? "border-accent-yellow bg-yellow-50/50 text-accent-yellow shadow-inner"
                            : "border-slate-100 bg-slate-50 text-slate-700 hover:bg-slate-100"
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2.5 rounded-xl transition-all ${paymentOption === "cash" ? "bg-accent-yellow text-white shadow-md shadow-yellow-100" : "bg-slate-200 text-slate-500"}`}>
                            <Sparkles className="w-4 h-4" />
                          </div>
                          <div className="text-right">
                            <span className="block font-bold text-xs text-slate-800">الدفع النقدي (خصم ١٠٠ ريال لأول ١٠٠ مشترك)</span>
                            <span className="text-[10px] text-emerald-600 font-extrabold block mt-0.5">احصل على الخصم فوراً عند تأكيد الحجز</span>
                          </div>
                        </div>
                        <CheckCircle className={`w-4.5 h-4.5 ${paymentOption === "cash" ? "text-accent-yellow" : "text-slate-200"}`} />
                      </button>

                      {/* Option 3: Tabby */}
                      <button
                        type="button"
                        onClick={() => setPaymentOption("tabby")}
                        className={`p-4 rounded-2xl border text-right transition-all text-xs font-bold flex justify-between items-center cursor-pointer w-full ${paymentOption === "tabby"
                            ? "border-accent-yellow bg-yellow-50/50 text-accent-yellow shadow-inner"
                            : "border-slate-100 bg-slate-50 text-slate-700 hover:bg-slate-100"
                          }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`px-3 py-1 bg-[#d3ffde] text-[#05cd9c] rounded-xl font-sans text-xs font-black uppercase tracking-wider select-none border border-[#b2fad5]`}>
                            tabby
                          </div>
                          <div className="text-right">
                            <span className="block font-bold text-xs text-slate-800">أقساط تابي (٤ أقساط ٣٠٠ ريال كل شهر)</span>
                            <span className="text-[10px] text-[#05cd9c] font-extrabold block mt-0.5">قسم فاتورتك على دفعات ميسرة بدون فوائد</span>
                          </div>
                        </div>
                        <CheckCircle className={`w-4.5 h-4.5 ${paymentOption === "tabby" ? "text-accent-yellow" : "text-slate-200"}`} />
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
                    className="px-6 py-3 bg-accent-yellow hover:bg-primary-yellow text-white rounded-xl text-xs font-bold transition-all shadow-md hover:shadow-lg flex items-center gap-1.5 cursor-pointer"
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
                  className="px-6 py-2.5 bg-accent-yellow hover:bg-primary-yellow text-white rounded-xl text-xs font-bold transition-all duration-300"
                >
                  العودة للرئيسية
                </Link>
              </div>
            ) : mode === "register" ? (
              // REGISTER FORM WIZARD
              <form className="p-8 flex-grow flex flex-col justify-between">

                {/* Step Indicators */}
                <div className="flex justify-between items-center mb-8 max-w-md mx-auto text-xs relative">
                  {/* Progress Line */}
                  <div className="absolute top-4 right-0 left-0 h-0.5 bg-slate-100 z-0" />

                  {/* Progress Line Active */}
                  <div
                    className="absolute top-4 right-0 h-0.5 bg-accent-yellow transition-all duration-300 z-0"
                    style={{ width: step === 1 ? "0%" : step === 2 ? "33%" : step === 3 ? "66%" : "100%" }}
                  />

                  {/* Step 1 */}
                  <div className="flex flex-col items-center gap-1 z-10">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold font-sans transition-all duration-300 ${step >= 1 ? "bg-accent-yellow text-white shadow-sm ring-4 ring-white" : "bg-slate-100 text-slate-400"
                      }`}>
                      1
                    </div>
                    <span className={`font-bold text-[9px] sm:text-[10px] ${step >= 1 ? "text-accent-yellow" : "text-slate-400"}`}>أولياء الأمور</span>
                  </div>

                  {/* Step 2 */}
                  <div className="flex flex-col items-center gap-1 z-10">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold font-sans transition-all duration-300 ${step >= 2 ? "bg-accent-yellow text-white shadow-sm ring-4 ring-white" : "bg-slate-100 text-slate-400"
                      }`}>
                      2
                    </div>
                    <span className={`font-bold text-[9px] sm:text-[10px] ${step >= 2 ? "text-accent-yellow" : "text-slate-400"}`}>الأبناء/البنات</span>
                  </div>

                  {/* Step 3 */}
                  <div className="flex flex-col items-center gap-1 z-10">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold font-sans transition-all duration-300 ${step >= 3 ? "bg-accent-yellow text-white shadow-sm ring-4 ring-white" : "bg-slate-100 text-slate-400"
                      }`}>
                      3
                    </div>
                    <span className={`font-bold text-[9px] sm:text-[10px] ${step >= 3 ? "text-accent-yellow" : "text-slate-400"}`}>التعهد والأنظمة</span>
                  </div>

                  {/* Step 4 */}
                  <div className="flex flex-col items-center gap-1 z-10">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold font-sans transition-all duration-300 ${step >= 4 ? "bg-accent-yellow text-white shadow-sm ring-4 ring-white" : "bg-slate-100 text-slate-400"
                      }`}>
                      4
                    </div>
                    <span className={`font-bold text-[9px] sm:text-[10px] ${step >= 4 ? "text-accent-yellow" : "text-slate-400"}`}>الحساب</span>
                  </div>
                </div>

                {/* Step Contents */}
                <div className="flex-grow py-4 space-y-4">
                  {step === 1 && (
                    // STEP 1: GUARDIANS INFO
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-3 duration-300">
                      <span className="text-[10px] text-accent-yellow font-extrabold block">الخطوة ١: بيانات أولياء الأمور</span>

                      <div className="space-y-4 border border-slate-100 p-5 rounded-2xl bg-slate-50/50">
                        <h4 className="text-xs font-extrabold text-slate-700 font-tajawal">ولي الأمر الأول (الأساسي)</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 block">اسم ولي الأمر الأول *</label>
                            <input
                              type="text"
                              required
                              value={regForm.guardian1Name}
                              onChange={(e) => setRegForm({ ...regForm, guardian1Name: e.target.value })}
                              placeholder="الاسم الثلاثي لولي الأمر الأول"
                              className="w-full bg-white border border-slate-200 focus:border-accent-yellow rounded-xl px-4 py-3 text-xs text-right focus:outline-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 block">رقم جوال ولي الأمر الأول *</label>
                            <input
                              type="tel"
                              required
                              value={regForm.guardian1Phone}
                              onChange={(e) => setRegForm({ ...regForm, guardian1Phone: e.target.value })}
                              placeholder="05XXXXXXXX"
                              className="w-full bg-white border border-slate-200 focus:border-accent-yellow rounded-xl px-4 py-3 text-xs text-right focus:outline-none font-sans"
                              dir="ltr"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4 border border-slate-100 p-5 rounded-2xl bg-slate-50/50">
                        <h4 className="text-xs font-extrabold text-slate-700 font-tajawal">ولي الأمر الثاني (الاحتياطي)</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 block">اسم ولي الأمر الثاني *</label>
                            <input
                              type="text"
                              required
                              value={regForm.guardian2Name}
                              onChange={(e) => setRegForm({ ...regForm, guardian2Name: e.target.value })}
                              placeholder="الاسم الثلاثي لولي الأمر الثاني"
                              className="w-full bg-white border border-slate-200 focus:border-accent-yellow rounded-xl px-4 py-3 text-xs text-right focus:outline-none"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-500 block">رقم جوال ولي الأمر الثاني *</label>
                            <input
                              type="tel"
                              required
                              value={regForm.guardian2Phone}
                              onChange={(e) => setRegForm({ ...regForm, guardian2Phone: e.target.value })}
                              placeholder="05XXXXXXXX"
                              className="w-full bg-white border border-slate-200 focus:border-accent-yellow rounded-xl px-4 py-3 text-xs text-right focus:outline-none font-sans"
                              dir="ltr"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {step === 2 && (
                    // STEP 2: CHILDREN INFO
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-3 duration-300 max-h-[400px] overflow-y-auto pr-1">
                      <span className="text-[10px] text-accent-yellow font-extrabold block">الخطوة ٢: بيانات الأبناء والبنات</span>

                      {regForm.children.map((child, index) => (
                        <div key={index} className="space-y-4 border border-slate-100 p-5 rounded-2xl bg-slate-50/50 relative">
                          <div className="flex justify-between items-center">
                            <h4 className="text-xs font-extrabold text-slate-700 font-tajawal">الابن/الابنة {index + 1}</h4>
                            {regForm.children.length > 1 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = regForm.children.filter((_, i) => i !== index);
                                  setRegForm({ ...regForm, children: updated });
                                }}
                                className="text-[10px] text-red-500 hover:text-red-700 font-bold transition-all"
                              >
                                حذف
                              </button>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-1 md:col-span-1">
                              <label className="text-xs font-bold text-slate-500 block">الاسم الثلاثي *</label>
                              <input
                                type="text"
                                required
                                value={child.fullName}
                                onChange={(e) => {
                                  const updated = [...regForm.children];
                                  updated[index].fullName = e.target.value;
                                  setRegForm({ ...regForm, children: updated });
                                }}
                                placeholder="الاسم الأول، اسم الأب، العائلة"
                                className="w-full bg-white border border-slate-200 focus:border-accent-yellow rounded-xl px-3 py-3 text-xs text-right focus:outline-none"
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-xs font-bold text-slate-500 block">الجنس *</label>
                              <select
                                required
                                value={child.gender}
                                onChange={(e) => {
                                  const updated = [...regForm.children];
                                  updated[index].gender = e.target.value;
                                  setRegForm({ ...regForm, children: updated });
                                }}
                                className="w-full bg-white border border-slate-200 focus:border-accent-yellow rounded-xl px-3 py-3 text-xs text-right focus:outline-none text-slate-700 font-bold"
                              >
                                <option value="">اختر الجنس</option>
                                <option value="ذكر">ذكر</option>
                                <option value="أنثى">أنثى</option>
                              </select>
                            </div>

                            <div className="space-y-1">
                              <label className="text-xs font-bold text-slate-500 block">الصف الدراسي *</label>
                              <select
                                required
                                value={child.grade}
                                onChange={(e) => {
                                  const updated = [...regForm.children];
                                  updated[index].grade = e.target.value;
                                  setRegForm({ ...regForm, children: updated });
                                }}
                                className="w-full bg-white border border-slate-200 focus:border-accent-yellow rounded-xl px-3 py-3 text-xs text-right focus:outline-none text-slate-700 font-bold"
                              >
                                <option value="">اختر الصف</option>
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
                          </div>
                        </div>
                      ))}

                      {/* Add Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setRegForm({
                            ...regForm,
                            children: [...regForm.children, { fullName: "", gender: "", grade: "" }]
                          });
                        }}
                        className="w-full py-4 border-2 border-dashed border-slate-200 hover:border-accent-yellow text-slate-500 hover:text-accent-yellow rounded-2xl text-xs font-bold transition-all duration-300 flex items-center justify-center gap-2 bg-white cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        إضافة ابن/ابنة آخر
                      </button>
                    </div>
                  )}

                  {step === 3 && (
                    // STEP 3: PLEDGE AND RULES
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-3 duration-300">
                      <span className="text-[10px] text-accent-yellow font-extrabold block">الخطوة ٣: التعهد والأنظمة والتعليمات</span>

                      {/* Rules container */}
                      <div className="border border-slate-200 rounded-2xl bg-slate-50/70 p-4 space-y-3 max-h-[220px] overflow-y-auto text-right text-xs leading-relaxed text-slate-600 font-tajawal scrollbar-thin">
                        <h4 className="font-bold text-slate-800 text-xs pb-2 border-b border-slate-200">أنظمة وتعليمات البرنامج</h4>
                        <ol className="list-decimal list-inside space-y-2 text-[11px]">
                          <li>سوف يتم فتح ملف لكل منتسب بالبرنامج الصيفي، يحتوي عدة نماذج تشمل معلوماته الشخصية مع صورة هويته أو هوية والده إذا كان مضافاً في بطاقة العائلة.</li>
                          <li>التقيد بالنظافة الشخصية وارتداء الملابس المحتشمة التي تستر العورة وتجنب ارتداء الملابس الضيقة أو التي تحمل عبارات غير لائقة والالتزام بالآداب الإسلامية العامة وعدم التفوه بكلمات بذيئة أو جارحة.</li>
                          <li>على المشاركين إخلاء الملاعب وجميع الفصول وحمام السباحة قبل الصلاة بمدة لا تزيد عن 5 دقائق استعداداً للصلاة أو الانصراف من البرنامج.</li>
                          <li>لا يحق لأي مشارك المطالبة باسترجاع رسوم الاشتراك بعد حضور اليوم الثاني للبرنامج.</li>
                          <li>لدى برنامج لون صيفك 3 والذي يمثله مكتب سرح للاستشارات التربوية والتعليمية الحقوق الحصرية باستخدام صور المشتركين خلال أي دورة تدريبية أو أنشطة وبذلك يسمح باستخدام جميع الصور والفيديوهات للإعلانات والحملات الترويجية من خلال كافة وسائل الإعلام المرئية والمسموعة والمقروءة.</li>
                          <li>يتحمل المشترك تكلفة أي ضرر أو تلف بممتلكات البرنامج أو المشاركين بها.</li>
                          <li>نرجو الالتزام بوقت الحضور والانصراف للبرنامج من الساعة السادسة مساءً إلى الساعة الحادية عشر مساءً.</li>
                          <li>مدة البرنامج شهر كامل 4 أيام أسبوعياً تبدأ من الأربعاء 23 / 01 / 1448هـ إلى الأربعاء 22 / 02 / 1448هـ.</li>
                          <li>حضور المشارك بالزي الخاص بالبرنامج.</li>
                          <li>في حال كان المشارك يعاني من أي أمراض مزمنة أو حساسية من أطعمة معينة يتم إبلاغ مشرف المرحلة بذلك للمتابعة.</li>
                          <li>سيتم عمل قروب خاص لأولياء الأمور في كل مجموعة ويرسل فيه كل ما يخص البرنامج من جداول وفعاليات وتعليمات وتقارير يومية مرئية.</li>
                          <li>في حال وجود أي ملاحظة أو استفسار لا نتردد بالاتصال على الرقم (0566500555).</li>
                          <li>وقت حصة السباحة نرجو إحضار ملابس خاصة بالسباحة مع منشفة (يمنع السباحة بملابس قطنية).</li>
                          <li>ختاماً: نتمنى لأبنائكم صيف ممتع وفعاليات متنوعة وبرامج هادفة برفقة كادر إشراف تربوي متميز. عند التسجيل في برنامج لون صيفك.</li>
                        </ol>
                      </div>

                      {/* Pledge checkbox */}
                      <label className="flex items-start gap-3 p-4 bg-yellow-50/40 border border-yellow-100 rounded-2xl cursor-pointer hover:bg-yellow-50/70 transition-all select-none">
                        <input
                          type="checkbox"
                          checked={isAgreed}
                          onChange={(e) => setIsAgreed(e.target.checked)}
                          className="mt-1 w-4 h-4 text-accent-yellow focus:ring-accent-yellow border-slate-300 rounded cursor-pointer"
                        />
                        <div className="text-right text-[11px] leading-relaxed text-slate-700 font-medium">
                          <span className="font-extrabold text-accent-yellow block mb-1">التعهد والإقرار *</span>
                          أتعهد أنا الموقع أدناه (ولي أمر المشارك/ة) بأن أتقيد بجميع الأنظمة والتعليمات الخاصة بالبرنامج وأن أتحلى بالآداب الإسلامية والأخلاق الرياضية الحميدة في تعاملي مع المعلمين والمشاركين وبالإدارة كامل الحق في إنهاء اشتراكي واتخاذ القرار الذي تراه مناسباً في حالة مخالفتي لذلك، كما أقر بأنني قرأت جميع الأنظمة والتعليمات أدناه والموافقة عليها.
                        </div>
                      </label>

                      {/* Payment choice */}
                      <div className="space-y-3 pt-2">
                        <label className="text-xs font-bold text-slate-500 block">اختر طريقة الدفع المفضلة</label>
                        <div className="space-y-3">
                          {/* Option 1: Card */}
                          <button
                            type="button"
                            onClick={() => setPaymentOption("card")}
                            className={`p-4 rounded-2xl border text-right transition-all text-xs font-bold flex justify-between items-center cursor-pointer w-full ${paymentOption === "card"
                                ? "border-accent-yellow bg-yellow-50/50 text-accent-yellow shadow-inner animate-pulse-subtle"
                                : "border-slate-100 bg-slate-50 text-slate-700 hover:bg-slate-100"
                              }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`p-2.5 rounded-xl transition-all ${paymentOption === "card" ? "bg-accent-yellow text-white shadow-md shadow-yellow-100" : "bg-slate-200 text-slate-500"}`}>
                                <CreditCard className="w-4 h-4" />
                              </div>
                              <div className="text-right">
                                <span className="block font-bold text-xs text-slate-800">بطاقة ائتمانية (سداد كامل المبلغ عبر المتجر)</span>
                                <span className="text-[10px] text-slate-400 font-normal block mt-0.5">الدفع الآمن عبر Stc pay , Apple pay,مدى </span>
                              </div>
                            </div>
                            <CheckCircle className={`w-4.5 h-4.5 ${paymentOption === "card" ? "text-accent-yellow" : "text-slate-200"}`} />
                          </button>

                          {/* Option 2: Cash */}
                          <button
                            type="button"
                            onClick={() => setPaymentOption("cash")}
                            className={`p-4 rounded-2xl border text-right transition-all text-xs font-bold flex justify-between items-center cursor-pointer w-full ${paymentOption === "cash"
                                ? "border-accent-yellow bg-yellow-50/50 text-accent-yellow shadow-inner"
                                : "border-slate-100 bg-slate-50 text-slate-700 hover:bg-slate-100"
                              }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`p-2.5 rounded-xl transition-all ${paymentOption === "cash" ? "bg-accent-yellow text-white shadow-md shadow-yellow-100" : "bg-slate-200 text-slate-500"}`}>
                                <Sparkles className="w-4 h-4" />
                              </div>
                              <div className="text-right">
                                <span className="block font-bold text-xs text-slate-800">الدفع النقدي (خصم ١٠٠ ريال لأول ١٠٠ مشترك)</span>
                                <span className="text-[10px] text-emerald-600 font-extrabold block mt-0.5">احصل على الخصم فوراً عند تأكيد الحجز</span>
                              </div>
                            </div>
                            <CheckCircle className={`w-4.5 h-4.5 ${paymentOption === "cash" ? "text-accent-yellow" : "text-slate-200"}`} />
                          </button>

                          {/* Option 3: Tabby */}
                          <button
                            type="button"
                            onClick={() => setPaymentOption("tabby")}
                            className={`p-4 rounded-2xl border text-right transition-all text-xs font-bold flex justify-between items-center cursor-pointer w-full ${paymentOption === "tabby"
                                ? "border-accent-yellow bg-yellow-50/50 text-accent-yellow shadow-inner"
                                : "border-slate-100 bg-slate-50 text-slate-700 hover:bg-slate-100"
                              }`}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`px-3 py-1 bg-[#d3ffde] text-[#05cd9c] rounded-xl font-sans text-xs font-black uppercase tracking-wider select-none border border-[#b2fad5]`}>
                                tabby
                              </div>
                              <div className="text-right">
                                <span className="block font-bold text-xs text-slate-800">أقساط تابي (٤ أقساط ٣٠٠ ريال كل شهر)</span>
                                <span className="text-[10px] text-[#05cd9c] font-extrabold block mt-0.5">قسم فاتورتك على دفعات ميسرة بدون فوائد</span>
                              </div>
                            </div>
                            <CheckCircle className={`w-4.5 h-4.5 ${paymentOption === "tabby" ? "text-accent-yellow" : "text-slate-200"}`} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {step === 4 && (
                    // STEP 4: ACCOUNT
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-3 duration-300">
                      <span className="text-[10px] text-accent-yellow font-extrabold block">الخطوة ٤: معلومات حساب ولي الأمر</span>
                      <p className="text-xs text-slate-400">يرجى إدخال البريد الإلكتروني وكلمة المرور لتتمكن من متابعة حالة طلبات الأبناء لاحقاً:</p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-slate-500 block">البريد الإلكتروني *</label>
                          <input
                            type="email"
                            required
                            value={regForm.email}
                            onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                            placeholder="parent@example.com"
                            className="w-full bg-slate-50 border border-slate-200 focus:border-accent-yellow rounded-xl px-4 py-3 text-xs text-left focus:outline-none font-sans"
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
                              className="w-full bg-slate-50 border border-slate-200 focus:border-accent-yellow rounded-xl pl-10 pr-4 py-3 text-xs text-right focus:outline-none"
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
                      </div>
                      <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl text-[11px] text-blue-700 leading-relaxed font-medium">
                        بالتسجيل، أنت توافق على شروط الخدمة وسياسة الخصوصية الخاصة بمنصة ملهم. سوف تحصل على حساب ولي أمر لمتابعة الأبناء المسجلين.
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer Controls */}
                <div className="flex justify-between items-center pt-6 border-t border-slate-50 mt-6">
                  {step > 1 ? (
                    <button
                      type="button"
                      onClick={handlePrevStep}
                      className="px-5 py-2.5 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                      السابق
                    </button>
                  ) : (
                    <div />
                  )}

                  {step < 4 ? (
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="px-5 py-2.5 bg-accent-yellow hover:bg-primary-yellow text-white rounded-xl text-xs font-bold transition-all shadow-md hover:shadow-lg flex items-center gap-1.5 cursor-pointer"
                    >
                      التالي
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleRegisterSubmit}
                      className="px-6 py-2.5 bg-accent-yellow hover:bg-primary-yellow text-white rounded-xl text-xs font-bold transition-all shadow-md hover:shadow-lg flex items-center gap-1.5 cursor-pointer"
                    >
                      تأكيد التسجيل النهائي
                      <CheckCircle className="w-3.5 h-3.5" />
                    </button>
                  )}
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
                    className="px-6 py-2.5 bg-accent-yellow hover:bg-primary-yellow disabled:bg-slate-300 text-white rounded-xl text-xs font-bold transition-all shadow-md hover:shadow-lg cursor-pointer flex items-center gap-1.5"
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
                    className="px-6 py-2.5 bg-accent-yellow hover:bg-primary-yellow disabled:bg-slate-300 text-white rounded-xl text-xs font-bold transition-all shadow-md hover:shadow-lg flex items-center gap-1.5 cursor-pointer"
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

            {/* Bottom toggle indicator */}
            <div className="pt-6 border-t border-slate-800 text-center font-tajawal">
              {mode === "register" ? (
                <button
                  onClick={() => setMode("login")}
                  className="text-xs text-slate-300 hover:text-white transition-all font-bold cursor-pointer"
                >
                  لديك حساب بالفعل؟ تسجيل الدخول
                </button>
              ) : mode === "login" ? (
                <button
                  onClick={() => {
                    setMode("register");
                    setStep(1);
                  }}
                  className="text-xs text-slate-300 hover:text-white transition-all font-bold cursor-pointer"
                >
                  لا تملك حساباً؟ إنشاء حساب الآن
                </button>
              ) : (
                <button
                  onClick={() => setMode("login")}
                  className="text-xs text-slate-300 hover:text-white transition-all font-bold cursor-pointer"
                >
                  العودة لتسجيل الدخول
                </button>
              )}
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
