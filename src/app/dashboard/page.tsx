"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import {
  User, Mail, Phone, Calendar, ShieldCheck, LogOut,
  Compass, GraduationCap, Sparkles, Heart,
  ShoppingBag, CheckCircle, Clock, ChevronLeft, ArrowLeft,
  TrendingUp, Award, MapPin, Package, ShoppingCart, UserCheck, AlertCircle
} from "lucide-react";

export default function DashboardPage() {
  const { currentUser, logoutUser, registrations, familyChildren, orders } = useApp();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState<"family" | "orders">("family");

  // If not logged in, show access warning
  if (!currentUser) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-16 bg-slate-50 text-right">
        <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-150 shadow-xl max-w-md w-full text-center space-y-6 animate-in zoom-in-95 duration-200">
          <div className="w-20 h-20 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-800 font-tajawal">لوحة التحكم مقفلة</h2>
            <p className="text-xs text-slate-500 leading-relaxed font-tajawal">
              يرجى تسجيل الدخول أو إنشاء حساب جديد لتتمكن من الوصول لبيانات أبنائك وبناتك ومتابعة نشاطاتهم ومشترياتك في منصة ملهم.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Link
              href="/register"
              className="w-full py-3 bg-accent-teal hover:bg-primary-teal text-white rounded-xl text-xs font-bold transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center gap-1.5"
            >
              تسجيل الدخول / إنشاء حساب
            </Link>
            <Link
              href="/"
              className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all duration-300 flex items-center justify-center"
            >
              العودة للرئيسية
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Get registrations associated with current parent
  const myRegistrations = registrations.filter(
    (reg) => reg.email.trim().toLowerCase() === currentUser.email.trim().toLowerCase()
  );

  // Group registrations by child name (fullName)
  const childrenMap: { [name: string]: typeof registrations } = {};
  myRegistrations.forEach((reg) => {
    const name = reg.fullName.trim();
    if (!childrenMap[name]) {
      childrenMap[name] = [];
    }
    childrenMap[name].push(reg);
  });

  // Unique list of children names (from family list + any fallback from registrations)
  const uniqueChildNames = new Set<string>();
  familyChildren.forEach(c => uniqueChildNames.add(c.full_name.trim()));
  myRegistrations.forEach(r => uniqueChildNames.add(r.fullName.trim()));
  const childrenNames = Array.from(uniqueChildNames);

  // Get orders associated with current parent
  const myOrders = orders.filter(
    (order) => order.email.trim().toLowerCase() === currentUser.email.trim().toLowerCase()
  );

  const handleLogout = () => {
    logoutUser();
    router.push("/");
  };

  const getActivityTypeLabel = (type: string) => {
    switch (type) {
      case "trip": return "رحلة استكشافية";
      case "academy": return "أكاديمية قيادية";
      case "volunteer": return "فرصة تطوعية";
      default: return "برنامج إثرائي";
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "trip": return <Compass className="w-5 h-5 text-yellow-600" />;
      case "academy": return <GraduationCap className="w-5 h-5 text-blue-600" />;
      case "volunteer": return <Heart className="w-5 h-5 text-purple-600" />;
      default: return <Sparkles className="w-5 h-5 text-amber-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-bold border border-emerald-100">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
            مؤكد ومقبول
          </span>
        );
      case "completed":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-[10px] font-bold border border-blue-100">
            <CheckCircle className="w-3.5 h-3.5 text-blue-500" />
            مكتمل
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full text-[10px] font-bold border border-amber-100">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            قيد المراجعة
          </span>
        );
    }
  };

  const getOrderBadge = (status: string) => {
    switch (status) {
      case "paid":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-bold border border-emerald-100">
            مدفوع ومؤكد
          </span>
        );
      case "shipped":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full text-[10px] font-bold border border-blue-100">
            تم الشحن والتوصيل
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 rounded-full text-[10px] font-bold border border-amber-100">
            قيد الانتظار
          </span>
        );
    }
  };

  if (currentUser.role === 'admin') {
    return (
      <div className="bg-slate-50 min-h-screen pt-28 pb-10 text-right font-tajawal">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          
          {/* Welcome Section */}
          <div className="bg-gradient-to-r from-primary-navy to-slate-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl border border-slate-800 flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-accent-yellow/10 rounded-full blur-2xl" />
            <div className="absolute right-1/3 -top-12 w-60 h-60 bg-blue-500/5 rounded-full blur-3xl" />
            
            <div className="relative z-10 space-y-2 text-center md:text-right">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-accent-yellow/20 text-accent-yellow rounded-full text-xs font-bold border border-accent-yellow/30 mx-auto md:mx-0">
                <ShieldCheck className="w-3.5 h-3.5" />
                حساب المشرف العام
              </span>
              <h1 className="text-2xl sm:text-3xl font-black leading-tight">مرحباً بك، {currentUser.fullName}</h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl font-light">
                أهلاً بك في لوحة تحكم المشرفين. يمكنك من هنا الوصول إلى أنظمة إدارة المحتوى والبيانات الخاصة بمنصة ملهم.
              </p>
            </div>

            <div className="relative z-10">
              <button
                onClick={handleLogout}
                className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl text-xs font-bold transition-all duration-300 shadow-md hover:shadow-lg flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                تسجيل خروج
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sanity Admin Redirect Notice */}
            <div className="bg-slate-900 text-white rounded-3xl p-8 border border-slate-800 shadow-xl space-y-4 relative overflow-hidden flex flex-col hover:border-slate-700 transition-colors">
              <div className="absolute top-0 right-0 left-0 h-1 bg-blue-500" />
              <div className="flex-grow space-y-3">
                <h4 className="font-bold text-slate-150 text-lg flex items-center gap-2">
                  <AlertCircle className="w-6 h-6 text-blue-400" />
                  <span>لوحة التحكم للمشرفين (Sanity)</span>
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed font-tajawal">
                  منصة إدارة المحتوى (CMS). يمكنك تعديل محتوى الصفحات، إضافة المنتجات، الرحلات، والأكاديميات، وتحديث الصور والنصوص بمرونة تامة.
                </p>
              </div>
              <Link
                href="/studio"
                className="w-full mt-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
              >
                انتقل إلى لوحة التحكم (Sanity Studio)
              </Link>
            </div>

            {/* Platform Admin Link */}
            <div className="bg-white text-slate-900 rounded-3xl p-8 border border-red-100 shadow-xl space-y-4 relative overflow-hidden flex flex-col hover:border-red-200 transition-colors">
              <div className="absolute top-0 right-0 left-0 h-1 bg-red-500" />
              <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-red-50 rounded-full blur-2xl" />
              <div className="flex-grow space-y-3 relative z-10">
                <h4 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                  <ShieldCheck className="w-6 h-6 text-red-500" />
                  <span>لوحة إدارة المنصة والبيانات</span>
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed font-tajawal">
                  بصفتك مدير نظام (Admin)، يمكنك إدارة الحسابات، طلبات المتجر، تسجيلات الرحلات والبرامج، ومتابعة رسائل العملاء والإحصائيات من هنا.
                </p>
              </div>
              <Link
                href="/admin"
                className="w-full mt-6 py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg relative z-10"
              >
                الدخول للوحة تحكم الإدارة
              </Link>
            </div>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen pt-28 pb-10 text-right font-tajawal">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-primary-navy to-slate-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl border border-slate-800">
          <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-accent-yellow/10 rounded-full blur-2xl" />
          <div className="absolute right-1/3 -top-12 w-60 h-60 bg-blue-500/5 rounded-full blur-3xl" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:justify-between md:items-center gap-6">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-accent-yellow/20 text-accent-yellow rounded-full text-xs font-bold border border-accent-yellow/30">
                <UserCheck className="w-3.5 h-3.5" />
                حساب ولي الأمر الرسمي
              </span>
              <h1 className="text-2xl sm:text-3xl font-black leading-tight">مرحباً بك، {currentUser.fullName}</h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl font-light">
                هنا يمكنك متابعة الأنشطة والرحلات والأكاديميات التي يشارك فيها أبناؤك وبناتك، بالإضافة إلى إدارة فواتير مشترياتك في منصة ملهم.
              </p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setActiveSection("family")}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 shadow-md ${
                  activeSection === "family"
                    ? "bg-accent-yellow text-primary-navy shadow-yellow-500/20"
                    : "bg-white/10 text-primary-navy hover:bg-white/20"
                }`}
              >
                أبنائي ومتابعة الأنشطة ({childrenNames.length})
              </button>
              <button
                onClick={() => setActiveSection("orders")}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 shadow-md ${
                  activeSection === "orders"
                    ? "bg-accent-yellow text-primary-navy shadow-yellow-500/20"
                    : "bg-white/10 text-primary-navy hover:bg-white/20"
                }`}
              >
                مشترياتي وطلباتي ({myOrders.length})
              </button>
            </div>
          </div>
        </div>

        {/* Dashboard Panels Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Content Area (8 Cols) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* 1. FAMILY SECTION */}
            {activeSection === "family" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="flex justify-between items-center pb-2">
                  <h2 className="text-lg sm:text-xl font-bold text-slate-800 flex items-center gap-2">
                    <User className="w-5 h-5 text-accent-yellow" />
                    متابعة أنشطة الأبناء
                  </h2>
                  <span className="text-xs text-slate-400 font-bold">بناءً على البريد: {currentUser.email}</span>
                </div>

                {childrenNames.length === 0 ? (
                  <div className="bg-white rounded-3xl p-12 border border-slate-200/60 shadow-sm text-center max-w-lg mx-auto space-y-6">
                    <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto border border-slate-100">
                      <User className="w-8 h-8" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-bold text-slate-800">لم يتم تسجيل أي من أبنائك بعد</h3>
                      <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
                        يبدو أنك لم تقم بالتسجيل في أي برامج أو رحلات أو أكاديميات لأبنائك حتى الآن. يمكنك تصفح الأنشطة المتاحة أدناه والتسجيل فوراً.
                      </p>
                    </div>
                    <div className="flex flex-wrap justify-center gap-3 pt-2">
                      <Link
                        href="/programs"
                        className="px-5 py-2.5 bg-accent-teal hover:bg-primary-teal text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                      >
                        استكشف البرامج والفعاليات
                      </Link>
                      <Link
                        href="/trips"
                        className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
                      >
                        الرحلات الاستكشافية
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-8">
                    {childrenNames.map((childName) => {
                      const childRegs = childrenMap[childName] || [];
                      const familyChild = familyChildren.find(c => c.full_name.trim() === childName);
                      // Estimate age from grade or fallback
                      let childAge = 12;
                      if (familyChild?.grade?.includes("الابتدائي")) childAge = 9;
                      if (familyChild?.grade?.includes("المتوسط")) childAge = 14;
                      if (familyChild?.grade?.includes("الثانوي")) childAge = 17;
                      if (childRegs[0]?.age) childAge = childRegs[0].age;
                      
                      return (
                        <div key={childName} className="bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden hover:shadow-md transition-all duration-300">
                          {/* Child header bar */}
                          <div className="bg-slate-50 px-6 py-4 border-b border-slate-150 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-yellow-500/10 text-accent-yellow flex items-center justify-center font-bold text-sm">
                                {childName.charAt(0)}
                              </div>
                              <div>
                                <h3 className="font-bold text-slate-800 text-sm">{childName}</h3>
                                <span className="text-[10px] text-slate-400 block font-semibold">العمر التقريبي: {childAge} سنة</span>
                              </div>
                            </div>
                            <span className="px-3 py-1 bg-white border border-slate-200 rounded-xl text-[10px] font-bold text-slate-500">
                              عدد الاشتراكات: {childRegs.length}
                            </span>
                          </div>

                          {/* Subscriptions list */}
                          <div className="divide-y divide-slate-100 p-6">
                            {childRegs.length === 0 ? (
                              <div className="text-center py-6">
                                <span className="text-xs text-slate-400">لا توجد اشتراكات مسجلة لهذا الابن حتى الآن.</span>
                              </div>
                            ) : (
                              childRegs.map((reg) => {
                                // clean up program interest names for display
                                const displayName = reg.targetName.startsWith("اهتمام بالبرنامج الصيفي:")
                                  ? reg.targetName.replace("اهتمام بالبرنامج الصيفي:", "").trim()
                                  : reg.targetName;

                              return (
                                <div key={reg.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row justify-between sm:items-center gap-4 text-right">
                                  <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 bg-slate-50 border border-slate-150 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                                      {getActivityIcon(reg.type)}
                                    </div>
                                    <div className="space-y-1">
                                      <h4 className="font-bold text-slate-800 text-xs sm:text-sm line-clamp-1">{displayName}</h4>
                                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold">
                                        <span>{getActivityTypeLabel(reg.type)}</span>
                                        <span>•</span>
                                        <span>سجل بتاريخ: {reg.date}</span>
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-3 justify-end sm:self-center">
                                    {getStatusBadge(reg.status)}
                                  </div>
                                </div>
                              );
                            })
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* 2. ORDERS SECTION */}
            {activeSection === "orders" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="flex justify-between items-center pb-2">
                  <h2 className="text-lg sm:text-xl font-bold text-slate-800 flex items-center gap-2">
                    <Package className="w-5 h-5 text-accent-yellow" />
                    طلبات مشتريات المتجر
                  </h2>
                  <span className="text-xs text-slate-400 font-bold">إدارة وتتبع فواتير المنتجات</span>
                </div>

                {myOrders.length === 0 ? (
                  <div className="bg-white rounded-3xl p-12 border border-slate-200/60 shadow-sm text-center max-w-lg mx-auto space-y-6">
                    <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto border border-slate-100">
                      <ShoppingBag className="w-8 h-8" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-bold text-slate-800">لم تقم بأي عمليات شراء بعد</h3>
                      <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
                        تصفح متجر ملهم الإلكتروني الرسمي واختر من التشكيلة الحصرية الفاخرة للتيشيرتات والأكواب والمعدات والملابس الفاخرة.
                      </p>
                    </div>
                    <Link
                      href="/store"
                      className="inline-block px-6 py-2.5 bg-accent-teal hover:bg-primary-teal text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                    >
                      تصفح المتجر الآن
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {myOrders.map((order) => (
                      <div key={order.id} className="bg-white rounded-3xl border border-slate-200/60 shadow-sm overflow-hidden hover:shadow-md transition-all duration-300">
                        {/* Order Header bar */}
                        <div className="bg-slate-50 px-6 py-4 border-b border-slate-150 flex flex-wrap justify-between items-center gap-3">
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                            <span className="font-bold text-slate-850 text-xs">رقم الطلب: <code className="bg-slate-200/60 px-1.5 py-0.5 rounded font-sans text-accent-yellow text-xs font-bold">{order.id}</code></span>
                            <span className="text-[10px] text-slate-450 font-bold">تاريخ الطلب: {order.date}</span>
                          </div>
                          
                          <div className="flex items-center gap-3">
                            <span className="text-[10px] font-bold text-slate-405">التكلفة: <b className="text-accent-yellow text-sm font-extrabold">{order.total} ر.س</b></span>
                            {getOrderBadge(order.status)}
                          </div>
                        </div>

                        {/* Order Items list */}
                        <div className="p-6 space-y-4 divide-y divide-slate-100">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex gap-4 items-center justify-between py-3 first:pt-0 last:pb-0 text-right">
                              <div className="flex gap-3 items-center">
                                <div className="w-12 h-12 bg-slate-50 border border-slate-150 rounded-xl overflow-hidden flex-shrink-0">
                                  <img
                                    src={item.product.image}
                                    alt={item.product.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="space-y-0.5">
                                  <h4 className="font-bold text-slate-800 text-xs sm:text-sm line-clamp-1">{item.product.name}</h4>
                                  <span className="text-[10px] text-slate-400 block font-semibold">سعر الحبة: {item.product.price} ر.س</span>
                                </div>
                              </div>

                              <div className="text-left">
                                <span className="text-xs text-slate-500 font-bold">الكمية: {item.quantity}</span>
                                <span className="font-bold text-slate-800 block text-xs mt-0.5">{item.product.price * item.quantity} ر.س</span>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Order Footer summary info */}
                        <div className="bg-slate-50/50 border-t border-slate-100 px-6 py-3 text-[10px] text-slate-400 font-bold flex justify-between">
                          <span>طريقة الاستلام: من المقر الرئيسي</span>
                          <span>طريقة الدفع: {order.paymentMethod}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* QUICK RECOMMENDATIONS */}
            <div className="bg-gradient-to-br from-yellow-50 to-emerald-50/30 rounded-3xl p-6 border border-yellow-100 flex flex-col sm:flex-row justify-between items-center gap-4 text-right">
              <div className="space-y-1">
                <h4 className="font-bold text-yellow-800 text-sm flex items-center gap-1.5 justify-end sm:justify-start">
                  <Sparkles className="w-4 h-4 text-accent-yellow" />
                  هل تود تسجيل ابن آخر؟
                </h4>
                <p className="text-[11px] text-yellow-650 leading-relaxed font-tajawal">
                  يمكنك استعراض الفعاليات أو الرحلات القادمة وستتم تعبئة تفاصيل ولي الأمر تلقائياً لسرعة إتمام الحجز.
                </p>
              </div>
              <Link
                href="/trips"
                className="px-5 py-2.5 bg-accent-teal hover:bg-primary-teal text-white rounded-xl text-xs font-bold transition-all duration-300 shadow-md hover:shadow-lg flex items-center gap-1.5 whitespace-nowrap self-stretch sm:self-center justify-center"
              >
                <span>تصفح الرحلات والبرامج</span>
                <ArrowLeft className="w-3.5 h-3.5" />
              </Link>
            </div>

          </div>

          {/* Sidebar Area - Profile Details (4 Cols) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Parent Profile Card */}
            <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm p-6 space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="w-12 h-12 bg-primary-navy rounded-full text-white flex items-center justify-center font-bold text-lg shadow-md">
                  {currentUser.fullName.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 text-sm sm:text-base leading-tight">{currentUser.fullName}</h3>
                  <span className="text-[10px] text-slate-400 block font-semibold">عضو مسجل منذ ٢٠٢٦</span>
                </div>
              </div>

              {/* Profile Fields */}
              <div className="space-y-3.5 text-xs text-slate-650">
                <div className="flex items-center justify-between py-1 border-b border-slate-50">
                  <span className="font-bold text-slate-700 flex items-center gap-1.5">
                    <User className="w-4 h-4 text-slate-400" />
                    اسم ولي الأمر:
                  </span>
                  <span className="font-semibold text-slate-800">{currentUser.fullName}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-slate-50">
                  <span className="font-bold text-slate-700 flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-slate-400" />
                    البريد الإلكتروني:
                  </span>
                  <span className="font-semibold text-slate-800 font-sans">{currentUser.email}</span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="font-bold text-slate-700 flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-slate-400" />
                    رقم الهاتف:
                  </span>
                  <span className="font-semibold text-slate-800 font-sans" dir="ltr">{currentUser.phone}</span>
                </div>
              </div>

              {/* Statistics mini grid */}
              <div className="grid grid-cols-3 gap-2 text-center pt-2">
                <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                  <span className="text-lg font-black text-accent-yellow block leading-none">{childrenNames.length}</span>
                  <span className="text-[9px] text-slate-400 font-bold">الأبناء</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                  <span className="text-lg font-black text-blue-600 block leading-none">{myRegistrations.length}</span>
                  <span className="text-[9px] text-slate-400 font-bold">الاشتراكات</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                  <span className="text-lg font-black text-purple-600 block leading-none">{myOrders.length}</span>
                  <span className="text-[9px] text-slate-400 font-bold">المشتريات</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleLogout}
                  className="w-full py-3 bg-red-50 hover:bg-red-100 text-red-650 rounded-xl text-xs font-bold transition-all duration-300 flex items-center justify-center gap-1.5"
                >
                  <LogOut className="w-4 h-4" />
                  تسجيل خروج من الحساب
                </button>
              </div>
            </div>

            {/* Quick Links Menu */}
            <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm p-6 space-y-4">
              <h4 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-3">روابط وتصفح سريع</h4>
              <nav className="flex flex-col gap-1 text-xs font-bold text-slate-600">
                <Link
                  href="/programs"
                  className="py-2.5 px-3 rounded-xl hover:bg-slate-50 hover:text-accent-yellow flex items-center justify-between transition-all"
                >
                  <span>البرامج والأنشطة الشبابية</span>
                  <ChevronLeft className="w-4 h-4 text-slate-400" />
                </Link>
                <Link
                  href="/trips"
                  className="py-2.5 px-3 rounded-xl hover:bg-slate-50 hover:text-accent-yellow flex items-center justify-between transition-all"
                >
                  <span>الرحلات والمخيمات الاستكشافية</span>
                  <ChevronLeft className="w-4 h-4 text-slate-400" />
                </Link>
                <Link
                  href="/academies"
                  className="py-2.5 px-3 rounded-xl hover:bg-slate-50 hover:text-accent-yellow flex items-center justify-between transition-all"
                >
                  <span>أكاديميات القيادة والتأهيل</span>
                  <ChevronLeft className="w-4 h-4 text-slate-400" />
                </Link>
                <Link
                  href="/store"
                  className="py-2.5 px-3 rounded-xl hover:bg-slate-50 hover:text-accent-yellow flex items-center justify-between transition-all"
                >
                  <span>المتجر الإلكتروني لملهم</span>
                  <ChevronLeft className="w-4 h-4 text-slate-400" />
                </Link>
              </nav>
            </div>



          </div>

        </div>

      </div>
    </div>
  );
}
