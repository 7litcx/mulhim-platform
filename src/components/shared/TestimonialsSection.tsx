"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Star, MessageSquare, CheckCircle } from "lucide-react";
import { useApp } from "@/context/AppContext";

export default function TestimonialsSection() {
  const { currentUser } = useApp();
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ content: "", rating: 5, role: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const res = await fetch("/api/testimonials");
      const data = await res.json();
      if (data.success) {
        setTestimonials(data.testimonials);
      }
    } catch (err) {
      console.error("Failed to fetch testimonials:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.content.trim()) return;
    
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: currentUser?.id || null,
          user_name: currentUser?.fullName || "زائر كريم",
          role: formData.role || "عضو في مجتمع ملهم",
          content: formData.content,
          rating: formData.rating
        })
      });
      const data = await res.json();
      if (data.success) {
        setIsSuccess(true);
        setFormData({ content: "", rating: 5, role: "" });
        fetchTestimonials(); // Refresh list
        setTimeout(() => {
          setIsSuccess(false);
          setShowForm(false);
        }, 3000);
      }
    } catch (err) {
      console.error("Error submitting testimonial", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading && testimonials.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 mb-16">
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-14 text-right">
        <div className="space-y-4 max-w-2xl">
          <h2 className="text-2xl md:text-3xl font-extrabold text-primary-navy font-tajawal">آراء مُلهمينا</h2>
          <p className="text-slate-800 text-sl leading-relaxed">
            تجارب حقيقية عاشها شباب وفتيات من مجتمعنا في رحلاتنا الاستكشافية والبرامج التدريبية.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-6 py-3 bg-accent-teal hover:bg-primary-teal text-white rounded-xl text-sm font-bold shadow-md transition-all flex items-center gap-2 self-start md:self-end"
        >
          <MessageSquare className="w-4 h-4" />
          أضف رأيك
        </button>
      </div>

      {showForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="bg-slate-50 p-6 rounded-2xl border border-slate-200 mb-10 overflow-hidden text-right"
        >
          {isSuccess ? (
             <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
               <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center">
                 <CheckCircle className="w-6 h-6" />
               </div>
               <h3 className="font-bold text-slate-800">شكراً لك!</h3>
               <p className="text-sm text-slate-500">تمت إضافة رأيك بنجاح.</p>
             </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 max-w-xl ml-auto">
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">الاسم</label>
                <input 
                  type="text" 
                  value={currentUser?.fullName || ""} 
                  disabled 
                  className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-500" 
                  placeholder="سيتم استخدام اسم حسابك" 
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">المسمى أو الصفة (مثال: مشارك في برنامج الصيف)</label>
                <input 
                  type="text" 
                  value={formData.role} 
                  onChange={(e) => setFormData({...formData, role: e.target.value})} 
                  className="w-full px-4 py-2 bg-white border border-slate-200 focus:border-accent-yellow rounded-lg text-sm outline-none transition-all" 
                  placeholder="مشارك، ولي أمر، إلخ" 
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-600 block mb-1">الرأي والتجربة</label>
                <textarea 
                  required
                  rows={3}
                  value={formData.content} 
                  onChange={(e) => setFormData({...formData, content: e.target.value})} 
                  className="w-full px-4 py-3 bg-white border border-slate-200 focus:border-accent-yellow rounded-lg text-sm outline-none transition-all resize-none" 
                  placeholder="اكتب عن تجربتك معنا هنا..." 
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="px-5 py-2 bg-slate-200 text-slate-700 rounded-lg text-sm font-bold hover:bg-slate-300 transition-all">إلغاء</button>
                <button type="submit" disabled={isSubmitting} className="px-5 py-2 bg-accent-yellow hover:bg-yellow-500 text-primary-navy rounded-lg text-sm font-bold transition-all flex items-center gap-2">
                  {isSubmitting ? "جاري الإرسال..." : "نشر الرأي"}
                </button>
              </div>
            </form>
          )}
        </motion.div>
      )}

      {testimonials.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((test: any, index: number) => (
            <motion.div
              key={test.id || index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05)" }}
              className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm transition-all duration-300 relative flex flex-col justify-between text-right"
            >
              <div className="space-y-4">
                <div className="flex gap-0.5 text-accent-gold justify-end">
                  {[...Array(test.rating || 5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <p className="text-sm text-slate-800 leading-relaxed font-medium italic">
                  "{test.content}"
                </p>
              </div>

              <div className="flex items-center gap-3 pt-6 mt-6 border-t border-slate-50 justify-end">
                <div className="text-right">
                  <h4 className="font-bold text-slate-800 text-sm">{test.user_name}</h4>
                  <span className="text-xs text-slate-400 font-semibold">{test.role}</span>
                </div>
                <div className="w-10 h-10 rounded-full bg-accent-yellow/10 text-accent-yellow flex items-center justify-center font-bold text-sm shadow-inner select-none">
                  {test.user_name ? test.user_name.charAt(0) : "M"}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 text-slate-500 font-bold bg-slate-50 rounded-2xl border border-slate-100">
          لا توجد آراء بعد. كن أول من يشاركنا رأيه!
        </div>
      )}
    </section>
  );
}
