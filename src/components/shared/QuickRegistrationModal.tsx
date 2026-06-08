"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, Plus, CreditCard, Sparkles } from "lucide-react";
import { useApp } from "@/context/AppContext";

interface QuickRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetItem: { title: string } | null;
  targetType: "academy" | "trip" | "program";
}

export default function QuickRegistrationModal({
  isOpen,
  onClose,
  targetItem,
  targetType
}: QuickRegistrationModalProps) {
  const { registerUser, currentUser, familyChildren, registrations, showToast } = useApp();

  const [regForm, setRegForm] = useState({ fullName: "", grade: "", phone: "", email: "" });
  
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
    if (grade.includes("جامعي")) return 20;
    return 15;
  };
  const [regSuccess, setRegSuccess] = useState(false);
  const [paymentOption, setPaymentOption] = useState<string>("cash");

  // Compute unique children names registered by current parent
  const myChildren = useMemo(() => {
    if (!currentUser) return [];
    
    // Always include family children
    const unique = new Set<string>();
    familyChildren.forEach(c => unique.add(c.full_name.trim()));
    
    // Fallback: also include children found in previous registrations
    registrations
      .filter((r) => r.email.trim().toLowerCase() === currentUser.email.trim().toLowerCase() && r.type !== "volunteer")
      .forEach((r) => unique.add(r.fullName.trim()));
      
    return Array.from(unique);
  }, [familyChildren, registrations, currentUser]);

  // Pre-populate parent contact details when registration modal opens
  useEffect(() => {
    if (isOpen && currentUser) {
      setRegForm((prev) => ({
        ...prev,
        phone: prev.phone || currentUser.phone || "",
        email: prev.email || currentUser.email || ""
      }));
    }
    
    // Reset success state if modal is opened again
    if (isOpen) {
      setRegSuccess(false);
    }
  }, [isOpen, currentUser]);

  const handleRegister = async (e?: React.SyntheticEvent) => {
    if (e) e.preventDefault();
    if (!currentUser) {
      showToast("يرجى تسجيل الدخول أولاً للمتابعة.", "error");
      return;
    }
    
    if (regForm.fullName && regForm.phone && targetItem) {
      const typeLabel = targetType === "academy" ? "أكاديمية " : targetType === "trip" ? "رحلة " : "برنامج ";

      let finalPaymentMethod = "بطاقة ائتمانية (سداد كامل المبلغ عبر المتجر)";
      if (paymentOption === "cash") {
        finalPaymentMethod = "الدفع النقدي (خصم ١٠٠ ريال لأول ١٠٠ مشترك)";
      } else if (paymentOption === "tabby") {
        finalPaymentMethod = "أقساط تابي (٤ أقساط ٣٠٠ ريال كل شهر)";
      }

      try {
        await registerUser({
          fullName: regForm.fullName,
          age: getAgeFromGrade(regForm.grade),
          phone: regForm.phone,
          email: regForm.email,
          interests: [typeLabel + targetItem.title + " - " + regForm.grade],
          type: targetType,
          targetName: `${targetItem.title} - ${regForm.grade}`,
          paymentMethod: finalPaymentMethod
        });
        
        setRegSuccess(true);
        setRegForm({ fullName: "", grade: "", phone: "", email: "" });
        setTimeout(() => {
          setRegSuccess(false);
          onClose();
        }, 3000);
      } catch (error) {
        // Error is already shown via toast in registerUser
        console.error("Registration failed:", error);
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && targetItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm cursor-pointer"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 15 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            className="bg-white rounded-3xl overflow-hidden border border-slate-100 w-full max-w-md relative z-10 shadow-2xl p-6 text-right"
          >
            <button
              onClick={onClose}
              className="absolute top-4 left-4 p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
            >
              <Plus className="w-5 h-5 rotate-45" />
            </button>

            {regSuccess ? (
              <div className="py-12 flex flex-col items-center justify-center text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-slate-800">تم تسجيل طلبك بنجاح!</h3>
                <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                  تم تسجيل اهتمامك بالانضمام إلى <b>{targetItem.title}</b>. سنقوم بالتواصل معك عبر الواتساب أو الهاتف لتأكيد السداد والاشتراك الرسمي!
                </p>
              </div>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-1">
                  <span className="text-[10px] text-accent-yellow font-extrabold uppercase tracking-wide">تسجيل سريع</span>
                  <h3 className="font-bold text-base text-slate-800 leading-tight">طلب انضمام إلى {targetItem.title}</h3>
                </div>

                {currentUser && myChildren.length > 0 && (
                  <div className="space-y-1.5 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    <span className="text-[10px] font-extrabold text-slate-500 block">اختيار سريع من الأبناء المسجلين:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {myChildren.map((name) => (
                        <button
                          type="button"
                          key={name}
                          onClick={() => {
                            const prevReg = registrations.find((r) => r.fullName.trim() === name);
                            setRegForm({
                              fullName: name,
                              grade: "",
                              phone: currentUser.phone || "",
                              email: currentUser.email || ""
                            });
                          }}
                          className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 rounded-lg text-[10px] font-bold border border-slate-200 transition-all cursor-pointer"
                        >
                          {name}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-1 pt-1">
                  <label htmlFor="modalFullName" className="text-xs font-bold text-slate-500 block">الاسم الكامل للمشترك</label>
                  <input
                    id="modalFullName"
                    type="text"
                    required
                    value={regForm.fullName}
                    onChange={(e) => setRegForm({ ...regForm, fullName: e.target.value })}
                    placeholder="أدخل اسمك أو اسم ابنك"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-accent-yellow rounded-xl px-4 py-2.5 text-xs text-right focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label htmlFor="modalGrade" className="text-xs font-bold text-slate-500 block">الفصل الدراسي</label>
                    <select
                      id="modalGrade"
                      required
                      value={regForm.grade}
                      onChange={(e) => setRegForm({ ...regForm, grade: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-accent-yellow rounded-xl px-4 py-2.5 text-xs text-right focus:outline-none appearance-none cursor-pointer"
                    >
                      <option value="" disabled>اختر الفصل الدراسي</option>
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
                      <option value="جامعي">جامعي</option>
                      <option value="غير ذلك">غير ذلك</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="modalPhone" className="text-xs font-bold text-slate-500 block">رقم جوال ولي الأمر</label>
                    <input
                      id="modalPhone"
                      type="tel"
                      required
                      value={regForm.phone}
                      onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                      placeholder="+966 5X XXX XXXX"
                      className="w-full bg-slate-50 border border-slate-200 focus:border-accent-yellow rounded-xl px-4 py-2.5 text-xs text-right focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label htmlFor="modalEmail" className="text-xs font-bold text-slate-500 block">البريد الإلكتروني</label>
                  <input
                    id="modalEmail"
                    type="email"
                    required
                    value={regForm.email}
                    onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                    placeholder="email@example.com"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-accent-yellow rounded-xl px-4 py-2.5 text-xs text-left focus:outline-none font-sans"
                    dir="ltr"
                  />
                </div>

                {/* Payment choice */}
                <div className="space-y-3 pt-2 border-t border-slate-100 mt-4">
                  <label className="text-xs font-bold text-slate-500 block">اختر طريقة الدفع المفضلة</label>
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
                          <span className="block font-bold text-xs text-slate-800">الدفع النقدي (خصم ١٠٠ ريال لأول ١٠٠ مشترك)</span>
                          <span className="text-[10px] text-emerald-600 font-extrabold block mt-0.5">احصل على الخصم فوراً عند تأكيد الحجز</span>
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
                          <span className="block font-bold text-xs text-slate-800">بطاقة ائتمانية (سداد كامل المبلغ عبر المتجر)</span>
                          <span className="text-[10px] text-slate-400 font-normal block mt-0.5">الدفع الآمن عبر Stc pay , Apple pay,مدى </span>
                        </div>
                      </div>
                      <CheckCircle className={`w-4.5 h-4.5 ${paymentOption === "card" ? "text-accent-yellow" : "text-slate-200"}`} />
                    </button>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full py-3.5 bg-accent-teal hover:bg-primary-teal text-white rounded-xl text-xs font-bold transition-all duration-300 shadow-md hover:shadow-lg mt-4 cursor-pointer"
                >
                  إرسال طلب الانضمام
                </motion.button>
              </form>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
