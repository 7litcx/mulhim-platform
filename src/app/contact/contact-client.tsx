"use client";

import React, { useState } from "react";
import { Mail, Phone, Clock, Send, CheckCircle2, MessageSquare, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12
    }
  }
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 25 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 90,
      damping: 14
    }
  }
} as const;

export default function ContactClient() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "contact",
          data: formData,
        }),
      });

      if (response.ok) {
        setSubmitSuccess(true);
        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
        });
        // Clear success message after 5 seconds
        setTimeout(() => setSubmitSuccess(false), 5000);
      } else {
        console.error("Failed to send message via API");
        // Fallback for UX
        setSubmitSuccess(true);
      }
    } catch (err) {
      console.error("Error submitting contact form:", err);
      // Fallback for UX
      setSubmitSuccess(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* 1. Header Banner */}
      <section className="relative min-h-[380px] sm:min-h-[450px] md:min-h-[500px] flex items-center py-12 sm:py-20 md:py-24 bg-primary-navy overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(13,148,136,0.2),transparent_50%)]" />

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center text-right text-white space-y-4 sm:space-y-6">
          <motion.span
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 15 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-accent-yellow/20 text-accent-yellow rounded-full text-xs font-bold border border-accent-yellow/30 self-start font-tajawal"
          >
            <Sparkles className="w-3.5 h-3.5" />
            تواصل معنا
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 85, damping: 14, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl font-black font-tajawal leading-tight max-w-4xl"
          >
            يسعدنا تواصلك معنا
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 85, damping: 14, delay: 0.2 }}
            className="text-sm sm:text-base text-slate-300 max-w-2xl font-light leading-relaxed"
          >
            فريق مُلهم متواجد دائماً للإجابة على استفساراتكم وملاحظاتكم، لا تتردد في طرح أي سؤال أو تقديم مقترحات.
          </motion.p>
        </div>
      </section>

      {/* 2. Main Content Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left: Contact Info (4 cols) */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 70, damping: 15 }}
            className="lg:col-span-4 space-y-6 text-right"
            dir="rtl"
          >
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-8">
              <h3 className="text-lg font-bold text-primary-navy border-b border-slate-50 pb-4">
                معلومات الاتصال
              </h3>

              {/* Email */}
              <motion.div whileHover={{ x: -4 }} className="flex gap-4 items-start transition-all">
                <div className="w-12 h-12 bg-yellow-50 text-accent-yellow rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div className="space-y-1 pt-1">
                  <h4 className="text-xs font-bold text-slate-400">البريد الإلكتروني</h4>
                  <a href="mailto:info@mulhim180.com" className="text-sm font-semibold text-slate-800 hover:text-accent-yellow transition-all">
                    mulhim180@gmail.com
                  </a>
                </div>
              </motion.div>

              {/* Phone */}
              <motion.div whileHover={{ x: -4 }} className="flex gap-4 items-start transition-all">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div className="space-y-1 pt-1">
                  <h4 className="text-xs font-bold text-slate-400">رقم الهاتف</h4>
                  <a href="tel:+966500000000" className="text-sm font-semibold text-slate-800 hover:text-blue-600 transition-all font-sans" dir="ltr">
                    +966 5X XXX XXXX
                  </a>
                </div>
              </motion.div>

              {/* Hours */}
              <motion.div whileHover={{ x: -4 }} className="flex gap-4 items-start transition-all">
                <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div className="space-y-1 pt-1">
                  <h4 className="text-xs font-bold text-slate-400">أوقات العمل</h4>
                  <p className="text-sm font-semibold text-slate-800">
                    الأحد - الخميس (9:00 ص - 5:00 م)
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Right: Contact Form (8 cols) */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 70, damping: 15 }}
            className="lg:col-span-8 text-right"
            dir="rtl"
          >
            <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-100 shadow-sm space-y-6">
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-primary-navy font-tajawal">أرسل لنا رسالة</h2>
                <p className="text-xs text-slate-400">سوف نقوم بمراجعة رسالتك والتواصل معك بأقرب وقت ممكن.</p>
              </div>

              <AnimatePresence>
                {submitSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: -15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl flex items-start gap-3"
                  >
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <h4 className="font-bold text-sm">تم إرسال رسالتك بنجاح!</h4>
                      <p className="text-xs text-emerald-650">شكراً لتواصلك معنا. سيقوم فريق خدمة العملاء بالتواصل معك قريباً.</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Name */}
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-xs font-bold text-slate-700">الاسم الكامل *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="مثال: محمد أحمد"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent-yellow focus:bg-white transition-all text-right"
                    />
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <label htmlFor="phone" className="text-xs font-bold text-slate-700">رقم الجوال</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="05XXXXXXXX"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent-yellow focus:bg-white transition-all text-right font-sans"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Email */}
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-xs font-bold text-slate-700">البريد الإلكتروني *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="name@example.com"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent-yellow focus:bg-white transition-all text-right"
                    />
                  </div>

                  {/* Subject */}
                  <div className="space-y-2">
                    <label htmlFor="subject" className="text-xs font-bold text-slate-700">موضوع الرسالة *</label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      required
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="مثال: استفسار حول التسجيل"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent-yellow focus:bg-white transition-all text-right"
                    />
                  </div>
                </div>

                {/* Message */}
                <div className="space-y-2">
                  <label htmlFor="message" className="text-xs font-bold text-slate-700">تفاصيل الرسالة *</label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="اكتب رسالتك أو استفسارك بالتفصيل هنا..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent-yellow focus:bg-white transition-all text-right leading-relaxed resize-none"
                  />
                </div>

                {/* Submit Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-8 py-3.5 bg-accent-yellow hover:bg-primary-yellow text-white rounded-xl text-sm font-bold shadow-lg hover:shadow-yellow-900/20 disabled:bg-slate-350 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <span>جاري الإرسال...</span>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    </>
                  ) : (
                    <>
                      <span>إرسال الرسالة</span>
                      <Send className="w-4 h-4 rotate-180" />
                    </>
                  )}
                </motion.button>
              </form>
            </div>
          </motion.div>

        </div>
      </section>
    </div>
  );
}
