"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { supabase } from "@/utils/supabase";
import {
  Users, ShoppingBag, ClipboardList, MessageSquare, TrendingUp, ShieldCheck, Download, AlertCircle, Plus, X
} from "lucide-react";
import {
  fetchAdminUsers,
  fetchAdminRegistrations,
  fetchAdminOrders,
  fetchAdminMessages,
  fetchAdminTestimonials,
  updateRegistrationStatusAction,
  updateOrderStatusAction,
  deleteRecordAction,
  toggleUserRoleAction
} from "./actions";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { SummerProgramPDF } from "@/components/SummerProgramPDF";

export default function AdminDashboardPage() {
  const { currentUser, showToast, logoutUser } = useApp();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"overview" | "users" | "registrations" | "orders" | "messages" | "testimonials">("overview");
  const [searchQuery, setSearchQuery] = useState("");

  const [users, setUsers] = useState<any[]>([]);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  useEffect(() => {
    setPage(1);
  }, [activeTab, searchQuery]);

  // Derived filtered data
  const filteredUsers = users.filter(u =>
    (u.full_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (u.phone || "").includes(searchQuery)
  );

  const filteredRegistrations = registrations.filter(r =>
    (r.full_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.target_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.phone || "").includes(searchQuery) ||
    (r.email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (r.payment_method || "").includes(searchQuery)
  );

  const filteredOrders = orders.filter(o =>
    (o.id || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (o.customer_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (o.phone || "").includes(searchQuery)
  );

  const filteredTestimonials = testimonials.filter(t =>
    (t.user_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (t.content || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const paginatedUsers = filteredUsers.slice(0, page * ITEMS_PER_PAGE);
  const paginatedRegistrations = filteredRegistrations.slice(0, page * ITEMS_PER_PAGE);
  const paginatedOrders = filteredOrders.slice(0, page * ITEMS_PER_PAGE);
  const paginatedTestimonials = filteredTestimonials.slice(0, page * ITEMS_PER_PAGE);

  // Custom Confirm Modal State
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => { }
  });

  const confirmAction = (title: string, message: string, onConfirm: () => void) => {
    setConfirmModal({ isOpen: true, title, message, onConfirm });
  };

  const [createUserModal, setCreateUserModal] = useState(false);
  const [newUser, setNewUser] = useState({ fullName: "", email: "", phone: "", password: "", role: "user" });
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const pdfRef = React.useRef<HTMLDivElement>(null);
  const [pdfRegistration, setPdfRegistration] = useState<any>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const handleExportPDF = async (registration: any) => {
    setPdfRegistration(registration);
    setIsGeneratingPDF(true);
    showToast("جاري تجهيز ملف الـ PDF...", "success");

    setTimeout(async () => {
      try {
        if (!pdfRef.current) return;
        const canvas = await html2canvas(pdfRef.current, { scale: 2 } as any);
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save(`استمارة_${registration.full_name.replace(/\s+/g, '_')}.pdf`);
        showToast("تم تنزيل الملف بنجاح!", "success");
      } catch (err) {
        console.error(err);
        showToast("حدث خطأ أثناء إنشاء الـ PDF", "error");
      } finally {
        setPdfRegistration(null);
        setIsGeneratingPDF(false);
      }
    }, 1000); // Wait for render
  };

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error("Unauthorized: لا توجد جلسة صالحة. يرجى تسجيل الدخول مجدداً.");

      // Fetch independently but await all to catch Unauthorized errors from server actions
      const [usersData, registrationsData, ordersData, messagesData, testimonialsData] = await Promise.all([
        fetchAdminUsers(token),
        fetchAdminRegistrations(token),
        fetchAdminOrders(token),
        fetchAdminMessages(token),
        fetchAdminTestimonials(token)
      ]);

      setUsers(usersData);
      setRegistrations(registrationsData);
      setOrders(ordersData);
      setMessages(messagesData);
      setTestimonials(testimonialsData);

      // Give a tiny bit of time for initial queries to resolve before removing skeleton
      setTimeout(() => setLoading(false), 500);

    } catch (error: any) {
      console.error("Error fetching admin data:", error);
      if (error.message?.includes("Unauthorized")) {
        showToast("عفواً، انتهت الجلسة أو لا تملك صلاحية الوصول. الرجاء تسجيل الدخول بحساب الإدارة.", "error");
        if (logoutUser) {
          await logoutUser();
        }
        router.push("/register?mode=login");
      } else {
        showToast(error.message || "حدث خطأ أثناء جلب بيانات الإدارة.", "error");
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [currentUser, router]);

  const updateRegistrationStatus = async (id: string, status: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) return;

      await updateRegistrationStatusAction(token, id, status);
      setRegistrations(prev => prev.map(r => r.id === id ? { ...r, status } : r));
      showToast("تم تحديث حالة التسجيل بنجاح.", "success");
    } catch (e: any) {
      showToast("فشل تحديث الحالة: " + e.message, "error");
    }
  };

  const updateOrderStatus = async (id: string, status: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) return;

      await updateOrderStatusAction(token, id, status);
      setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
      showToast("تم تحديث حالة الطلب بنجاح.", "success");
    } catch (e: any) {
      showToast("فشل تحديث حالة الطلب: " + e.message, "error");
    }
  };

  const deleteRecord = (table: string, id: string, stateUpdater: React.Dispatch<React.SetStateAction<any[]>>) => {
    confirmAction(
      "تأكيد الحذف",
      "هل أنت متأكد من حذف هذا السجل نهائياً؟ لا يمكن التراجع عن هذه الخطوة.",
      async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          const token = session?.access_token;
          if (!token) return;

          await deleteRecordAction(token, table, id);
          stateUpdater((prev: any[]) => prev.filter((item: any) => item.id !== id));
          showToast("تم الحذف بنجاح.", "success");
        } catch (e: any) {
          showToast("فشل الحذف: " + e.message, "error");
        }
      }
    );
  };

  const toggleUserRole = (id: string, currentRole: string) => {
    const newRole = currentRole === "admin" ? "user" : "admin";
    confirmAction(
      "تغيير الصلاحية",
      `هل أنت متأكد من تغيير صلاحية المستخدم إلى ${newRole === 'admin' ? 'مشرف' : 'مستخدم'}؟`,
      async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          const token = session?.access_token;
          if (!token) return;

          await toggleUserRoleAction(token, id, newRole);
          setUsers(prev => prev.map(u => u.id === id ? { ...u, role: newRole } : u));
          showToast("تم تحديث الصلاحية بنجاح.", "success");
        } catch (e: any) {
          showToast("فشل التحديث: " + e.message, "error");
        }
      }
    );
  };

  const handleCreateUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setModalError(null);
    if (!newUser.fullName || !newUser.email || !newUser.password) {
      setModalError("الرجاء تعبئة الحقول الأساسية.");
      return;
    }
    setIsCreatingUser(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      if (!token) throw new Error("لا توجد جلسة صالحة. الرجاء تسجيل الدخول كمسؤول.");

      const response = await fetch("/api/admin/create-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          email: newUser.email,
          password: newUser.password,
          fullName: newUser.fullName,
          phone: newUser.phone || "",
          role: newUser.role
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "فشل الاتصال بالخادم.");
      }

      const newId = data.user.id;

      // Add to local state
      setUsers(prev => [{
        id: newId,
        full_name: newUser.fullName,
        email: newUser.email,
        phone: newUser.phone,
        role: newUser.role,
        created_at: new Date().toISOString()
      }, ...prev]);

      showToast("تم إنشاء المستخدم بنجاح.", "success");
      setCreateUserModal(false);
      setNewUser({ fullName: "", email: "", phone: "", password: "", role: "user" });
    } catch (e: any) {
      console.error(e);
      setModalError(e.message || "حدث خطأ غير معروف");
      window.alert("تفاصيل الخطأ: " + (e.message || "مجهول"));
    } finally {
      setIsCreatingUser(false);
    }
  };

  const exportRegistrationsCSV = () => {
    const headers = [
      "الاسم الرباعي", "رقم الهوية", "الصف الدراسي", "تاريخ الميلاد", "الجنس", "العمر", "الحي",
      "اسم ولي الأمر", "جوال ولي الأمر", "جوال آخر", "الأمراض", "الحساسية", "كيف عرفت عن البرنامج",
      "البرنامج/الرحلة", "البريد الإلكتروني", "طريقة الدفع", "الحالة", "تاريخ التسجيل"
    ];
    const csvContent = [
      headers.join(","),
      ...registrations.map(r => {
        const ed = r.extra_data || {};
        const diseases = ed.hasDiseases === "نعم" ? `نعم - ${ed.diseasesDetails || ""}` : "لا";
        const allergies = ed.hasAllergies === "نعم" ? `نعم - ${ed.allergiesDetails || ""}` : "لا";
        const statusText = (r.status === 'registered' || r.status === 'approved' || r.status === 'completed') ? 'تم التسجيل' : 'قيد المراجعة';
        return [
          `"${r.full_name || ""}"`,
          `"${ed.idNumber || ""}"`,
          `"${ed.grade || ""}"`,
          `"${ed.birthDate || ""}"`,
          `"${ed.gender || ""}"`,
          `"${r.age || ed.age || ""}"`,
          `"${ed.neighborhood || ""}"`,
          `"${ed.parentName || ""}"`,
          `"${r.phone || ed.parentPhone || ""}"`,
          `"${ed.otherPhone || ""}"`,
          `"${diseases}"`,
          `"${allergies}"`,
          `"${ed.howDidYouHear || ""}"`,
          `"${r.target_name || ""} (${r.type || ""})"`,
          `"${r.email || ""}"`,
          `"${r.payment_method || "غير محدد"}"`,
          `"${statusText}"`,
          `"${new Date(r.created_at).toLocaleDateString('ar-SA')}"`
        ].join(",");
      })
    ].join("\n");

    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `registrations_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!currentUser || currentUser.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-accent-yellow border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const totalRevenue = orders.reduce((sum, o) => o.status === "paid" ? sum + Number(o.total) : sum, 0);

  return (
    <div className="bg-slate-50 min-h-screen pt-28 pb-10 text-right font-tajawal">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">

        {/* Admin Header */}
        <div className="bg-gradient-to-r from-primary-navy to-slate-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl border border-slate-800">
          <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-accent-yellow/10 rounded-full blur-2xl" />
          <div className="relative z-10 flex flex-col md:flex-row md:justify-between md:items-center gap-6">
            <div className="space-y-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-500/20 text-red-300 rounded-full text-xs font-bold border border-red-500/30">
                <ShieldCheck className="w-3.5 h-3.5" />
                لوحة تحكم المشرف (Admin)
              </span>
              <h1 className="text-2xl sm:text-3xl font-black leading-tight">إدارة منصة مُلهِم</h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl font-light">
                مرحباً {currentUser.fullName}، من هنا يمكنك التحكم الكامل بالمسجلين، الطلبات، وصلاحيات المنصة المركزية.
              </p>
            </div>
          </div>
        </div>

        {/* Dashboard Tabs */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: "overview", label: "نظرة عامة", icon: TrendingUp },
            { id: "users", label: "المستخدمين", icon: Users },
            { id: "registrations", label: "الاشتراكات", icon: ClipboardList },
            { id: "orders", label: "طلبات المتجر", icon: ShoppingBag },
            { id: "messages", label: "الرسائل", icon: MessageSquare },
            { id: "testimonials", label: "الآراء والتقييمات", icon: MessageSquare },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setSearchQuery("");
                }}
                className={`px-5 py-3 rounded-xl text-sm font-bold transition-all shadow-sm flex items-center gap-2 ${activeTab === tab.id
                    ? "bg-accent-yellow text-primary-navy shadow-yellow-500/20"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                  }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="py-12 flex justify-center">
            <div className="w-8 h-8 border-4 border-accent-yellow border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="space-y-6">

            {/* OVERVIEW TAB */}
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-500">إجمالي الحسابات</h3>
                    <p className="text-2xl font-black text-slate-800">{users.length}</p>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
                    <ClipboardList className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-500">الاشتراكات الكلية</h3>
                    <p className="text-2xl font-black text-slate-800">{registrations.length}</p>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-500">طلبات المتجر</h3>
                    <p className="text-2xl font-black text-slate-800">{orders.length}</p>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-500">المبيعات المدفوعة</h3>
                    <p className="text-2xl font-black text-slate-800">{totalRevenue} ر.س</p>
                  </div>
                </div>
              </div>
            )}

            {/* USERS TAB */}
            {activeTab === "users" && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in">
                <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50">
                  <h2 className="font-bold text-slate-800">إدارة المستخدمين</h2>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <input
                      type="text"
                      placeholder="بحث عن مستخدم..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-accent-yellow w-full sm:w-64"
                    />
                    <button
                      onClick={() => setCreateUserModal(true)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-accent-yellow hover:bg-yellow-600 text-primary-navy rounded-lg text-sm font-bold transition-colors whitespace-nowrap"
                    >
                      <Plus className="w-4 h-4" />
                      إضافة مستخدم
                    </button>
                  </div>
                </div>
                {/* Desktop Table View */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full text-sm text-right whitespace-nowrap">
                    <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-4">الاسم</th>
                        <th className="px-6 py-4">البريد الإلكتروني</th>
                        <th className="px-6 py-4">رقم الهاتف</th>
                        <th className="px-6 py-4">الصلاحية</th>
                        <th className="px-6 py-4">تاريخ التسجيل</th>
                        <th className="px-6 py-4 text-center">إجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {paginatedUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-50/50">
                          <td className="px-6 py-4 font-bold text-slate-800">{u.full_name}</td>
                          <td className="px-6 py-4 text-slate-600" dir="ltr">{u.email}</td>
                          <td className="px-6 py-4 text-slate-600" dir="ltr">{u.phone}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${u.role === 'admin' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'}`}>
                              {u.role === 'admin' ? 'مشرف' : 'مستخدم'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-500 text-xs">{new Date(u.created_at).toLocaleDateString('ar-SA')}</td>
                          <td className="px-6 py-4 flex items-center justify-center gap-2">
                            <button onClick={() => toggleUserRole(u.id, u.role)} className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-xs font-bold transition-colors">الصلاحية</button>
                            <button onClick={() => deleteRecord("profiles", u.id, setUsers)} className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-bold transition-colors">حذف</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards View */}
                <div className="grid grid-cols-1 gap-4 lg:hidden p-4 bg-slate-50/50">
                  {paginatedUsers.map((u) => (
                    <div key={u.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col gap-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-bold text-slate-800">{u.full_name}</div>
                          <div className="text-xs text-slate-500 mt-1" dir="ltr">{u.email}</div>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${u.role === 'admin' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'}`}>
                          {u.role === 'admin' ? 'مشرف' : 'مستخدم'}
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-sm text-slate-600">
                        <span className="text-xs text-slate-400">{new Date(u.created_at).toLocaleDateString('ar-SA')}</span>
                        <span dir="ltr" className="font-medium">{u.phone}</span>
                      </div>

                      <div className="flex gap-2 pt-3 border-t border-slate-100 mt-1">
                        <button onClick={() => toggleUserRole(u.id, u.role)} className="flex-1 py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-xs font-bold transition-colors">تغيير الصلاحية</button>
                        <button onClick={() => deleteRecord("profiles", u.id, setUsers)} className="flex-1 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-bold transition-colors">حذف</button>
                      </div>
                    </div>
                  ))}
                </div>

                {filteredUsers.length > paginatedUsers.length && (
                  <div className="flex justify-center p-4 border-t border-slate-100">
                    <button onClick={() => setPage(p => p + 1)} className="px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-bold transition-all">
                      عرض المزيد
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* REGISTRATIONS TAB */}
            {activeTab === "registrations" && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in">
                <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50">
                  <h2 className="font-bold text-slate-700">سجل المشتركين</h2>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <input
                      type="text"
                      placeholder="بحث عن مشترك..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-accent-yellow w-full sm:w-64"
                    />
                    <button
                      onClick={exportRegistrationsCSV}
                      className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 border border-emerald-200 whitespace-nowrap"
                    >
                      <Download className="w-4 h-4" />
                      تصدير تقرير (CSV)
                    </button>
                  </div>
                </div>
                {/* Desktop Table View */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full text-sm text-right whitespace-nowrap">
                    <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3">الاسم الرباعي</th>
                        <th className="px-4 py-3">رقم الهوية</th>
                        <th className="px-4 py-3">الصف</th>
                        <th className="px-4 py-3">تاريخ الميلاد</th>
                        <th className="px-4 py-3">الجنس</th>
                        <th className="px-4 py-3">العمر</th>
                        <th className="px-4 py-3">الحي</th>
                        <th className="px-4 py-3">ولي الأمر</th>
                        <th className="px-4 py-3">جوال ولي الأمر</th>
                        <th className="px-4 py-3">جوال آخر</th>
                        <th className="px-4 py-3">أمراض</th>
                        <th className="px-4 py-3">حساسية</th>
                        <th className="px-4 py-3">طريقة الدفع</th>
                        <th className="px-4 py-3">الحالة</th>
                        <th className="px-4 py-3 text-center">إجراء</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {paginatedRegistrations.map((r) => {
                        const ed = r.extra_data || {};
                        return (
                          <tr key={r.id} className="hover:bg-slate-50/50">
                            <td className="px-4 py-3 font-bold text-slate-800">{r.full_name}</td>
                            <td className="px-4 py-3 text-slate-700">{ed.idNumber || "-"}</td>
                            <td className="px-4 py-3 text-slate-700">{ed.grade || "-"}</td>
                            <td className="px-4 py-3 text-slate-700">{ed.birthDate || "-"}</td>
                            <td className="px-4 py-3 text-slate-700">{ed.gender || "-"}</td>
                            <td className="px-4 py-3 text-slate-700">{r.age || ed.age || "-"}</td>
                            <td className="px-4 py-3 text-slate-700">{ed.neighborhood || "-"}</td>
                            <td className="px-4 py-3 text-slate-700">{ed.parentName || "-"}</td>
                            <td className="px-4 py-3 text-slate-700" dir="ltr">{r.phone || ed.parentPhone || "-"}</td>
                            <td className="px-4 py-3 text-slate-700" dir="ltr">{ed.otherPhone || "-"}</td>
                            <td className="px-4 py-3 text-slate-700">{ed.hasDiseases === "نعم" ? `نعم (${ed.diseasesDetails || ""})` : "لا"}</td>
                            <td className="px-4 py-3 text-slate-700">{ed.hasAllergies === "نعم" ? `نعم (${ed.allergiesDetails || ""})` : "لا"}</td>
                            <td className="px-4 py-3 text-xs font-bold">
                              <span className={`px-2 py-1 rounded-md ${r.payment_method?.includes('بطاقة') ? 'bg-blue-50 text-blue-700' :
                                  r.payment_method?.includes('تابي') ? 'bg-[#d3ffde] text-[#05cd9c]' :
                                    r.payment_method?.includes('نقدي') ? 'bg-emerald-50 text-emerald-700' :
                                      'bg-slate-100 text-slate-500'
                                }`}>
                                {r.payment_method || 'غير محدد'}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <select
                                value={r.status === 'completed' || r.status === 'registered' ? 'approved' : r.status}
                                onChange={(e) => updateRegistrationStatus(r.id, e.target.value)}
                                className={`text-xs font-bold px-2 py-1.5 rounded outline-none border ${r.status === 'approved' || r.status === 'registered' || r.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                    'bg-amber-50 text-amber-700 border-amber-200'
                                  }`}
                              >
                                <option value="pending">قيد المراجعة</option>
                                <option value="approved">تم التسجيل</option>
                              </select>
                            </td>
                            <td className="px-4 py-3 text-slate-500 text-xs text-center flex flex-col gap-2 items-center">
                              <span>{new Date(r.created_at).toLocaleDateString('ar-SA')}</span>
                              {ed.formType === 'summer_program' && (
                                <button
                                  onClick={() => handleExportPDF(r)}
                                  disabled={isGeneratingPDF}
                                  className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-[10px] font-bold transition-colors w-full text-center"
                                >
                                  استمارة PDF
                                </button>
                              )}
                              <button onClick={() => deleteRecord("registrations", r.id, setRegistrations)} className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-[10px] font-bold transition-colors w-full text-center">حذف</button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards View */}
                <div className="grid grid-cols-1 gap-4 lg:hidden p-4 bg-slate-50/50">
                  {paginatedRegistrations.map((r) => {
                    const ed = r.extra_data || {};
                    return (
                      <div key={r.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col gap-3 relative">
                        <div className="flex justify-between items-start border-b border-slate-100 pb-2">
                          <div>
                            <div className="font-bold text-slate-800 text-lg">{r.full_name}</div>
                            <div className="text-xs text-slate-500 mt-1">الهوية: {ed.idNumber || "-"} | العمر: {r.age || ed.age || "-"}</div>
                          </div>
                          <select
                            value={r.status === 'completed' || r.status === 'registered' ? 'approved' : r.status}
                            onChange={(e) => updateRegistrationStatus(r.id, e.target.value)}
                            className={`text-[10px] font-bold px-2 py-1 rounded outline-none border ${r.status === 'approved' || r.status === 'registered' || r.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                'bg-amber-50 text-amber-700 border-amber-200'
                              }`}
                          >
                            <option value="pending">قيد المراجعة</option>
                            <option value="approved">تم التسجيل</option>
                          </select>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg">
                          <div className="flex flex-col"><span className="text-slate-400 text-[10px]">الصف الدراسي</span><span className="font-bold">{ed.grade || "-"}</span></div>
                          <div className="flex flex-col"><span className="text-slate-400 text-[10px]">الجنس</span><span className="font-bold">{ed.gender || "-"}</span></div>
                          <div className="flex flex-col"><span className="text-slate-400 text-[10px]">تاريخ الميلاد</span><span className="font-bold">{ed.birthDate || "-"}</span></div>
                          <div className="flex flex-col"><span className="text-slate-400 text-[10px]">الحي</span><span className="font-bold">{ed.neighborhood || "-"}</span></div>
                        </div>

                        <div className="grid grid-cols-1 gap-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border-t border-slate-100 mt-1">
                          <div className="flex justify-between"><span className="text-slate-400">ولي الأمر:</span><span className="font-bold">{ed.parentName || "-"}</span></div>
                          <div className="flex justify-between"><span className="text-slate-400">جوال ولي الأمر:</span><span className="font-bold" dir="ltr">{r.phone || ed.parentPhone || "-"}</span></div>
                          <div className="flex justify-between"><span className="text-slate-400">جوال آخر:</span><span className="font-bold" dir="ltr">{ed.otherPhone || "-"}</span></div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border-t border-slate-100 mt-1">
                          <div className="flex flex-col"><span className="text-slate-400 text-[10px]">أمراض</span><span className="font-bold text-red-600">{ed.hasDiseases === "نعم" ? `نعم (${ed.diseasesDetails || ""})` : "لا"}</span></div>
                          <div className="flex flex-col"><span className="text-slate-400 text-[10px]">حساسية</span><span className="font-bold text-red-600">{ed.hasAllergies === "نعم" ? `نعم (${ed.allergiesDetails || ""})` : "لا"}</span></div>
                        </div>

                        <div className="flex items-center justify-between mt-1">
                          <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${r.payment_method?.includes('بطاقة') ? 'bg-blue-50 text-blue-700' :
                              r.payment_method?.includes('تابي') ? 'bg-[#d3ffde] text-[#05cd9c]' :
                                r.payment_method?.includes('نقدي') ? 'bg-emerald-50 text-emerald-700' :
                                  'bg-slate-100 text-slate-500'
                            }`}>
                            {r.payment_method || 'غير محدد'}
                          </span>
                          <span className="text-xs text-slate-400">{new Date(r.created_at).toLocaleDateString('ar-SA')}</span>
                        </div>

                        <div className="flex flex-col gap-2 mt-2">
                          {ed.formType === 'summer_program' && (
                            <button
                              onClick={() => handleExportPDF(r)}
                              disabled={isGeneratingPDF}
                              className="w-full py-2 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-xs font-bold transition-colors"
                            >
                              تنزيل الاستمارة (PDF)
                            </button>
                          )}
                          <button onClick={() => deleteRecord("registrations", r.id, setRegistrations)} className="w-full py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-bold transition-colors">
                            حذف السجل
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {filteredRegistrations.length > paginatedRegistrations.length && (
                  <div className="flex justify-center p-4 border-t border-slate-100">
                    <button onClick={() => setPage(p => p + 1)} className="px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-bold transition-all">
                      عرض المزيد
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ORDERS TAB */}
            {activeTab === "orders" && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in">
                <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50/50">
                  <h2 className="font-bold text-slate-700">طلبات المتجر</h2>
                  <div className="flex gap-2 w-full sm:w-auto">
                    <input
                      type="text"
                      placeholder="بحث برقم الطلب أو الجوال..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-accent-yellow w-full sm:w-64"
                    />
                  </div>
                </div>
                {/* Desktop Table View */}
                <div className="hidden lg:block overflow-x-auto">
                  <table className="w-full text-sm text-right whitespace-nowrap">
                    <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                      <tr>
                        <th className="px-6 py-4">رقم الطلب</th>
                        <th className="px-6 py-4">العميل</th>
                        <th className="px-6 py-4">الإجمالي</th>
                        <th className="px-6 py-4">المنتجات</th>
                        <th className="px-6 py-4">الحالة</th>
                        <th className="px-6 py-4 text-center">إجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {paginatedOrders.map((o) => (
                        <tr key={o.id} className="hover:bg-slate-50/50">
                          <td className="px-6 py-4 font-mono text-xs text-slate-500">{o.id.substring(0, 8)}...</td>
                          <td className="px-6 py-4">
                            <div className="font-bold text-slate-800">{o.customer_name}</div>
                            <div className="text-[10px] text-slate-500" dir="ltr">{o.phone}</div>
                          </td>
                          <td className="px-6 py-4 font-black text-accent-yellow">{o.total} ر.س</td>
                          <td className="px-6 py-4 text-xs text-slate-600 whitespace-normal">
                            {o.order_items?.map((item: any, idx: number) => (
                              <div key={idx} className="line-clamp-1">{item.quantity}x {item.product_name}</div>
                            ))}
                          </td>
                          <td className="px-6 py-4">
                            <select
                              value={o.status}
                              onChange={(e) => updateOrderStatus(o.id, e.target.value)}
                              className={`text-xs font-bold px-2 py-1.5 rounded outline-none border ${o.status === 'paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                  o.status === 'shipped' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                    'bg-amber-50 text-amber-700 border-amber-200'
                                }`}
                            >
                              <option value="pending">قيد الانتظار</option>
                              <option value="paid">مدفوع</option>
                              <option value="shipped">تم الشحن</option>
                            </select>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button onClick={() => deleteRecord("orders", o.id, setOrders)} className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-bold transition-colors">حذف</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Cards View */}
                <div className="grid grid-cols-1 gap-4 lg:hidden p-4 bg-slate-50/50">
                  {paginatedOrders.map((o) => (
                    <div key={o.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col gap-3">
                      <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                        <div>
                          <div className="text-[10px] font-mono text-slate-400 mb-1">#{o.id.substring(0, 8)}</div>
                          <div className="font-bold text-slate-800">{o.customer_name}</div>
                          <div className="text-xs text-slate-500 mt-0.5" dir="ltr">{o.phone}</div>
                        </div>
                        <div className="text-left">
                          <div className="font-black text-accent-yellow mb-2">{o.total} ر.س</div>
                          <select
                            value={o.status}
                            onChange={(e) => updateOrderStatus(o.id, e.target.value)}
                            className={`text-[10px] font-bold px-2 py-1 rounded outline-none border ${o.status === 'paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                o.status === 'shipped' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                  'bg-amber-50 text-amber-700 border-amber-200'
                              }`}
                          >
                            <option value="pending">قيد الانتظار</option>
                            <option value="paid">مدفوع</option>
                            <option value="shipped">تم الشحن</option>
                          </select>
                        </div>
                      </div>

                      <div className="text-xs text-slate-600">
                        <div className="font-bold mb-1 text-slate-700">المنتجات:</div>
                        <ul className="list-disc list-inside space-y-1">
                          {o.order_items?.map((item: any, idx: number) => (
                            <li key={idx}>{item.quantity}x {item.product_name}</li>
                          ))}
                        </ul>
                      </div>

                      <button onClick={() => deleteRecord("orders", o.id, setOrders)} className="w-full mt-1 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-bold transition-colors">
                        حذف الطلب
                      </button>
                    </div>
                  ))}
                </div>

                {filteredOrders.length > paginatedOrders.length && (
                  <div className="flex justify-center p-4 border-t border-slate-100">
                    <button onClick={() => setPage(p => p + 1)} className="px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-bold transition-all">
                      عرض المزيد
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* MESSAGES TAB */}
            {activeTab === "messages" && (
              <div className="animate-in fade-in space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {messages.length === 0 ? (
                    <div className="col-span-full py-10 text-center text-slate-500 font-bold">لا توجد رسائل حالياً.</div>
                  ) : (
                    messages.slice(0, page * ITEMS_PER_PAGE).map((m) => (
                      <div key={m.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-bold text-slate-800">{m.name}</h3>
                            <div className="text-xs text-slate-500 font-sans" dir="ltr">{m.email} | {m.phone}</div>
                          </div>
                          <span className="text-[10px] text-slate-400 bg-slate-50 px-2 py-1 rounded">
                            {new Date(m.created_at).toLocaleDateString('ar-SA')}
                          </span>
                        </div>
                        <div className="pt-4 border-t border-slate-100">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="text-xs font-bold text-primary-navy">{m.subject}</h4>
                            <button onClick={() => deleteRecord("contact_messages", m.id, setMessages)} className="text-[10px] px-2 py-1 bg-red-50 text-red-600 hover:bg-red-100 rounded-md font-bold transition-colors">حذف الرسالة</button>
                          </div>
                          <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl">
                            {m.message}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {messages.length > page * ITEMS_PER_PAGE && (
                  <div className="flex justify-center p-4">
                    <button onClick={() => setPage(p => p + 1)} className="px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-bold transition-all">
                      عرض المزيد
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Testimonials Tab */}
            {activeTab === "testimonials" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid grid-cols-1 gap-4">
                  {testimonials.length === 0 ? (
                    <div className="col-span-full py-10 text-center text-slate-500 font-bold">لا توجد آراء وتقييمات حالياً.</div>
                  ) : (
                    paginatedTestimonials.map((t) => (
                      <div key={t.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-bold text-slate-800">{t.user_name}</h3>
                            <div className="text-xs text-slate-500 font-sans">{t.role}</div>
                            <div className="flex gap-1 text-accent-gold mt-1">
                              {[...Array(t.rating || 5)].map((_, i) => (
                                <svg key={i} className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" /></svg>
                              ))}
                            </div>
                          </div>
                          <span className="text-[10px] text-slate-400 bg-slate-50 px-2 py-1 rounded">
                            {new Date(t.created_at).toLocaleDateString('ar-SA')}
                          </span>
                        </div>
                        <div className="pt-4 border-t border-slate-100">
                          <div className="flex justify-between items-start mb-2">
                            <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-xl flex-grow ml-4">
                              {t.content}
                            </p>
                            <button onClick={() => deleteRecord("testimonials", t.id, setTestimonials)} className="text-[10px] px-2 py-1 bg-red-50 text-red-600 hover:bg-red-100 rounded-md font-bold transition-colors shrink-0 mt-2">حذف الرأي</button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {filteredTestimonials.length > page * ITEMS_PER_PAGE && (
                  <div className="flex justify-center p-4">
                    <button onClick={() => setPage(p => p + 1)} className="px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-bold transition-all">
                      عرض المزيد
                    </button>
                  </div>
                )}
              </div>
            )}

          </div>
        )}

        {/* Custom Confirm Modal */}
        {confirmModal.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-300 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-red-500" />
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-center text-slate-800 mb-2">{confirmModal.title}</h3>
              <p className="text-sm text-center text-slate-500 mb-8 leading-relaxed font-tajawal">
                {confirmModal.message}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    confirmModal.onConfirm();
                    setConfirmModal({ ...confirmModal, isOpen: false });
                  }}
                  className="flex-1 py-3.5 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm font-bold transition-all shadow-md hover:shadow-lg"
                >
                  تأكيد
                </button>
                <button
                  onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                  className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-bold transition-all"
                >
                  تراجع
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create User Modal */}
        {createUserModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 relative overflow-hidden animate-in zoom-in-95 duration-300">
              <button
                onClick={() => setCreateUserModal(false)}
                className="absolute top-4 left-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Users className="w-6 h-6 text-accent-yellow" />
                إضافة مستخدم جديد
              </h3>

              {modalError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
                  {modalError}
                </div>
              )}

              <form onSubmit={handleCreateUser} className="space-y-4">
                <div>
                  <label htmlFor="createFullName" className="block text-sm font-bold text-slate-700 mb-1">الاسم الكامل *</label>
                  <input id="createFullName" required type="text" value={newUser.fullName} onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-accent-yellow focus:ring-1 focus:ring-accent-yellow outline-none transition-all text-sm" placeholder="الاسم الكامل" />
                </div>
                <div>
                  <label htmlFor="createEmail" className="block text-sm font-bold text-slate-700 mb-1">البريد الإلكتروني *</label>
                  <input id="createEmail" required type="email" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-accent-yellow focus:ring-1 focus:ring-accent-yellow outline-none transition-all text-sm" placeholder="example@email.com" />
                </div>
                <div>
                  <label htmlFor="createPassword" className="block text-sm font-bold text-slate-700 mb-1">كلمة المرور *</label>
                  <input id="createPassword" required type="password" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-accent-yellow focus:ring-1 focus:ring-accent-yellow outline-none transition-all text-sm" placeholder="••••••••" />
                </div>
                <div>
                  <label htmlFor="createPhone" className="block text-sm font-bold text-slate-700 mb-1">رقم الهاتف</label>
                  <input id="createPhone" type="tel" value={newUser.phone} onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-accent-yellow focus:ring-1 focus:ring-accent-yellow outline-none transition-all text-sm" placeholder="05XXXXXXXX" />
                </div>
                <div>
                  <label htmlFor="createRole" className="block text-sm font-bold text-slate-700 mb-1">الصلاحية</label>
                  <select id="createRole" value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:border-accent-yellow focus:ring-1 focus:ring-accent-yellow outline-none transition-all text-sm">
                    <option value="user">مستخدم عادي</option>
                    <option value="admin">مشرف (Admin)</option>
                  </select>
                </div>
                <button type="submit" disabled={isCreatingUser} className="w-full mt-4 py-3.5 bg-accent-yellow hover:bg-yellow-600 text-primary-navy rounded-xl text-sm font-bold transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex justify-center items-center gap-2">
                  {isCreatingUser ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : "إنشاء الحساب"}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Hidden PDF component for HTML2Canvas */}
        <SummerProgramPDF registration={pdfRegistration} ref={pdfRef} />
      </div>
    </div>
  );
}
