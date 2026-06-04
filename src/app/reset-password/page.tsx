"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/utils/supabase";
import { Lock, CheckCircle, KeyRound } from "lucide-react";
import { useApp } from "@/context/AppContext";

export default function ResetPasswordPage() {
  const { showToast } = useApp();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    // Check if the user is logged in (Supabase sets session from recovery link hash automatically)
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.log("No active session found on reset page mount yet.");
      }
    };
    checkSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password) {
      showToast("الرجاء إدخال كلمة المرور الجديدة.", "warning");
      return;
    }

    if (password.length < 6) {
      showToast("كلمة المرور يجب أن لا تقل عن 6 أحرف.", "warning");
      return;
    }

    if (password !== confirmPassword) {
      showToast("كلمتا المرور غير متطابقتين.", "warning");
      return;
    }

    setIsLoading(true);

    try {
      // Check for active session first to prevent hanging if the link is invalid/expired
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        showToast("رابط إعادة التعيين غير صالح أو منتهي الصلاحية. الرجاء طلب رابط جديد.", "error");
        setIsLoading(false);
        return;
      }

      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        showToast(`خطأ أثناء تحديث كلمة المرور: ${error.message}`, "error");
      } else {
        showToast("تم تحديث كلمة المرور بنجاح!", "success");
        setIsSuccess(true);
        // Automatically log out user so they can log in with new password cleanly
        await supabase.auth.signOut();
        setTimeout(() => {
          router.push("/register?mode=login");
        }, 3000);
      }
    } catch (err) {
      console.error("Reset password error:", err);
      showToast("حدث خطأ غير متوقع. الرجاء المحاولة مرة أخرى.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-tajawal">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <div className="mx-auto w-12 h-12 bg-yellow-50 text-accent-yellow rounded-full flex items-center justify-center shadow-inner">
          <KeyRound className="w-6 h-6" />
        </div>
        <h2 className="text-2xl md:text-3xl font-extrabold text-primary-navy font-tajawal">
          إعادة تعيين كلمة المرور
        </h2>
        <p className="text-slate-500 text-xs">
          أدخل كلمة المرور الجديدة لحساب ولي الأمر الخاص بك.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="bg-white py-8 px-4 border border-slate-100 shadow-xl rounded-3xl sm:px-10 text-right relative overflow-hidden">
          <div className="absolute top-0 right-0 left-0 h-1.5 bg-accent-yellow" />

          {isSuccess ? (
            <div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center shadow-inner animate-bounce">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 font-tajawal">تم التحديث بنجاح!</h3>
              <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                تم تغيير كلمة المرور الخاصة بك بنجاح. سيتم توجيهك الآن إلى صفحة تسجيل الدخول...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-1 animate-in fade-in duration-300">
                <label htmlFor="password" className="text-xs font-bold text-slate-500 block">
                  كلمة المرور الجديدة *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  <input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-accent-yellow rounded-xl pl-10 pr-4 py-3 text-xs text-right focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1 animate-in fade-in duration-300">
                <label htmlFor="confirmPassword" className="text-xs font-bold text-slate-500 block">
                  تأكيد كلمة المرور الجديدة *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                  <input
                    id="confirmPassword"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-accent-yellow rounded-xl pl-10 pr-4 py-3 text-xs text-right focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full px-6 py-3 bg-accent-yellow hover:bg-primary-yellow disabled:bg-slate-300 text-white rounded-xl text-xs font-bold transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isLoading ? "جاري الحفظ..." : "حفظ كلمة المرور الجديدة"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
