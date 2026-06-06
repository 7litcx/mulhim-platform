"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useApp } from "@/context/AppContext";
import {
  Sparkles, Compass, GraduationCap, ShoppingBag,
  ArrowLeft, Calendar, MapPin,
  ShoppingCart, Award, Users
} from "lucide-react";
import { urlFor } from "@/sanity/lib/image";
import { motion, AnimatePresence } from "framer-motion";

const MotionLink = motion.create(Link);

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      type: "spring", 
      stiffness: 80, 
      damping: 14 
    } 
  }
} as const;interface CounterProps {
  target: number;
  duration?: number;
}

function AnimatedCounter({ target, duration = 2000 }: CounterProps) {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const elementRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setHasStarted(true);
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!hasStarted) return;

    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeProgress = 1 - (1 - progress) * (1 - progress);
      setCount(Math.floor(easeProgress * target));

      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };

    window.requestAnimationFrame(step);
  }, [hasStarted, target, duration]);

  return <span ref={elementRef}>{count.toLocaleString()}</span>;
}

// Helper to handle both Sanity image asset objects and Unsplash URL strings
const resolveImage = (img: any, width = 800, height = 500) => {
  if (!img) return "/placeholder.jpg";
  if (typeof img === "string") return img;
  if (typeof img === "object") {
    try {
      return urlFor(img).url();
    } catch {
      return "/placeholder.jpg";
    }
  }
  return "/placeholder.jpg";
};

import { normalizeLink } from "@/utils/link";

interface HomeClientProps {
  readonly sanityHeroBanners: any[];
  readonly sanityPrograms: any[];
  readonly sanityTrips: any[];
  readonly sanityAcademies: any[];
  readonly sanityProducts: any[];
}

export default function HomeClient({
  sanityHeroBanners,
  sanityPrograms,
  sanityTrips,
  sanityAcademies,
  sanityProducts,
}: HomeClientProps) {
  const { products: contextProducts, trips: contextTrips, programs: contextPrograms, academies: contextAcademies, addToCart } = useApp();
  const [activeTab, setActiveTab] = useState<"girls" | "boys">("girls");

  // Filter for home page banners
  const sanityHomeBanners = sanityHeroBanners.filter(banner => banner.page === "home" || !banner.page);

  // Get the first home page banner, or use default fallback
  const heroSlide = sanityHomeBanners.length > 0
    ? (() => {
      const banner = sanityHomeBanners[0];
      let resolvedLink = banner.link;
      
      // If link is empty, "/", or "#", try to auto-resolve it
      if (!resolvedLink || resolvedLink === "/" || resolvedLink === "#") {
        const titleLower = (banner.title || "").toLowerCase();
        if (titleLower.includes("رحلات") || titleLower.includes("trips") || titleLower.includes("مغامرات")) {
          resolvedLink = "/trips";
        } else if (titleLower.includes("أكاديمية") || titleLower.includes("أكاديميات") || titleLower.includes("academies")) {
          resolvedLink = "/academies";
        } else if (titleLower.includes("متجر") || titleLower.includes("store") || titleLower.includes("مقتنيات")) {
          resolvedLink = "/store";
        } else if (titleLower.includes("برنامج") || titleLower.includes("برامج") || titleLower.includes("programs")) {
          resolvedLink = "/programs";
        } else {
          // Force undefined to use the defaultLink in normalizeLink
          resolvedLink = undefined;
        }
      }

      return {
        title: banner.title,
        subtitle: banner.description,
        image: resolveImage(banner.images?.[0] || banner.image, 1600, 800),
        link: normalizeLink(resolvedLink, "/programs"),
        btnText: banner.btnText || banner.buttonText || "عرض المزيد"
      };
    })()
    : {
        title: "رحلات ملهم: مغامرات تصنع الأثر",
        subtitle: "استكشف العالم، وابنِ علاقات حقيقية في رحلات ملهم المليئة بالمتعة والتعلم والروح الجماعية.",
        image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1200",
        link: "/trips",
        btnText: "عرض الرحلات"
      };

  const displayProducts = sanityProducts.length > 0 ? sanityProducts : contextProducts;
  const displayTrips = sanityTrips.length > 0 ? sanityTrips : contextTrips;
  const displayPrograms = sanityPrograms.length > 0 ? sanityPrograms : contextPrograms;
  const displayAcademies = sanityAcademies?.length > 0 ? sanityAcademies : contextAcademies;

  const featuredProducts = displayProducts.slice(0, 4);
  const featuredTrips = displayTrips.slice(0, 3);
  const featuredAcademies = displayAcademies?.slice(0, 3) || [];
  const featuredPrograms = displayPrograms
    .filter((p: any) => p.target === activeTab || p.target === "general")
    .slice(0, 3);

  return (
    <div className="space-y-8 pb-10">

      {/* 1. Premium Hero Banner Section */}
      <section className="relative min-h-[380px] sm:min-h-[450px] md:min-h-[500px] flex items-center pt-32 pb-16 bg-slate-900 overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <motion.img
            initial={{ scale: 1.15, opacity: 0 }}
            animate={{ scale: 1.05, opacity: 0.65 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            src={heroSlide.image || "/images/about-founding.png"}
            alt={heroSlide.title || "Hero Banner"}
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent md:bg-gradient-to-l md:from-slate-950/95 md:via-slate-950/30 md:to-transparent" />
        </div>

        {/* Content Container */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center text-right text-white">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-2xl space-y-6"
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-accent-yellow/20 text-accent-yellow rounded-full text-xs font-bold border border-accent-yellow/30 self-start">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              منصة ملهم 
            </span>
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold leading-tight font-tajawal">
              {heroSlide.title}
            </h1>
            <p className="text-xs sm:text-sm md:text-lg text-slate-300 leading-relaxed font-light">
              {heroSlide.subtitle}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 justify-start w-full sm:w-auto">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
                <Link 
                  href={heroSlide.link || "/programs"} 
                  className="w-full sm:w-auto px-8 py-3.5 bg-accent-yellow hover:bg-primary-yellow text-white rounded-xl text-sm font-bold shadow-lg hover:shadow-yellow-900/30 transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
                >
                  {heroSlide.btnText}
                  <ArrowLeft className="w-4 h-4" />
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }} className="w-full sm:w-auto">
                <Link 
                  href="/register" 
                  className="w-full sm:w-auto px-8 py-3.5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-xl text-sm font-bold backdrop-blur-sm transition-all duration-300 flex items-center justify-center cursor-pointer"
                >
                  سجل معنا الآن
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>


      {/* 2. Core Offerings & Features Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto space-y-4"
        >
          <h2 className="text-2xl md:text-3xl font-extrabold text-primary-navy font-tajawal">لماذا تنضم إلى مجتمع مُلهم؟</h2>
          <p className="text-slate-500 text-sm leading-relaxed">
            نسعى لتقديم تجارب متكاملة تجمع بين العلم، المهارة، المغامرة، والعطاء لتمكينك من صنع أثر مستدام وتطوير ذاتك.
          </p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-12"
        >
          {/* Feature 1 */}
          <motion.div 
            variants={itemVariants}
            whileHover={{ y: -8, scale: 1.02 }}
            className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 text-center flex flex-col items-center"
          >
            <div className="w-14 h-14 bg-yellow-50 text-accent-yellow rounded-2xl flex items-center justify-center mb-6">
              <GraduationCap className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-2">أكاديميات متخصصة</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              برامج تدريبية مكثفة بقيادة خبراء الصناعة في القيادة والرياضة والفنون.
            </p>
            <Link href="/academies" className="mt-4 text-xs font-bold text-accent-yellow hover:underline flex items-center gap-1">
              تعرف عليها <ArrowLeft className="w-3 h-3" />
            </Link>
          </motion.div>

          {/* Feature 2 */}
          <motion.div 
            variants={itemVariants}
            whileHover={{ y: -8, scale: 1.02 }}
            className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 text-center flex flex-col items-center"
          >
            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
              <Compass className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-2">رحلات مُلهمة</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              استكشاف وتجارب واقعية تبني الشخصية وتعزز روح الفريق والاعتماد على النفس.
            </p>
            <Link href="/trips" className="mt-4 text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
              استكشف الرحلات <ArrowLeft className="w-3 h-3" />
            </Link>
          </motion.div>

          {/* Feature 4 */}
          <motion.div 
            variants={itemVariants}
            whileHover={{ y: -8, scale: 1.02 }}
            className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 text-center flex flex-col items-center"
          >
            <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mb-6">
              <ShoppingBag className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-2">إصدارات ومعدات ملهم</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              متجر متكامل بمنتجات مميزة وتصاميم شبابية بجودة عالية لتكون فخوراً بهويتك.
            </p>
            <Link href="/store" className="mt-4 text-xs font-bold text-rose-600 hover:underline flex items-center gap-1">
              تسوق الآن <ArrowLeft className="w-3 h-3" />
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* 3. About Mulhim Section */}
      <section className="bg-slate-50 py-16 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center gap-12 text-right">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="md:w-1/2 space-y-6"
            >
              <span className="text-xs font-bold text-accent-yellow tracking-widest uppercase block">عن منصة مُلهم</span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-primary-navy font-tajawal">نصنع القادة ونبني الأثر</h2>
              <p className="text-slate-600 text-sm leading-relaxed">
                منصة ملهم هي مجتمع شبابي متكامل يهدف إلى تمكين الجيل الجديد وتوفير فرص استثنائية للنمو والتعلم في بيئة محفزة. نحن نؤمن بأن كل شاب وفتاة يمتلك قدرات كامنة تحتاج إلى التوجيه الصحيح والمساحة الآمنة للإبداع.
              </p>
              <p className="text-slate-600 text-sm leading-relaxed">
                من خلال برامجنا، أكاديمياتنا، ورحلاتنا، نجمع بين الترفيه والفائدة لنبني شخصيات متوازنة قادرة على إحداث تأثير إيجابي ومستدام في المجتمع.
              </p>
              <div className="pt-4 flex justify-end">
                <MotionLink
                  href="/about"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 hover:border-accent-yellow text-slate-700 hover:text-accent-yellow rounded-xl text-sm font-bold shadow-sm transition-all duration-300 cursor-pointer"
                >
                  تعرف علينا أكثر
                  <ArrowLeft className="w-4 h-4" />
                </MotionLink>
              </div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="md:w-1/2 w-full"
            >
              <div className="relative h-80 sm:h-96 w-full rounded-3xl overflow-hidden shadow-lg border border-slate-100">
                <img
                  src="/images/about-founding.png"
                  alt="عن ملهم"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-primary-navy/40 to-transparent" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 3.1. Mulhim Supervisors Section */}
      <section className="bg-white py-16 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-2xl mx-auto space-y-4 mb-16"
          >
            <h2 className="text-2xl md:text-3xl font-extrabold text-primary-navy font-tajawal">مشرفو مُلهِم</h2>
            <p className="text-slate-500 text-sm">
              نخبة من الكفاءات المتميزة التي تقود مبادرات وبرامج منصة مُلهم نحو التميز والإبداع.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" dir="rtl">
            {/* Supervisor 1 */}
            <motion.div 
               whileHover={{ y: -5 }}
               className="bg-slate-50 rounded-3xl p-8 border border-slate-100 shadow-sm text-center flex flex-col items-center gap-4 transition-all duration-300 hover:shadow-md group"
            >
              <div className="w-28 h-28 rounded-full bg-slate-100 overflow-hidden relative border-4 border-white shadow-lg mb-2">
                <img src="/images/supervaisor1.jpeg" alt="الشيخ باسم عبدالهادي" className="w-full h-full object-cover object-top" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-800 font-tajawal">الشيخ باسم عبدالهادي</h3>
                <p className="text-accent-yellow font-bold text-xs">مشرف البرامج</p>
              </div>
              <div className="text-sm text-slate-500 leading-relaxed text-right space-y-3 w-full">
                <p>
                  يتمتع الشيخ باسم بخبرة تزيد على 25 عامًا في الإشراف وإدارة البرامج التربوية والشبابية، ساهم خلالها في قيادة وتطوير المبادرات الهادفة لبناء الشخصية.
                </p>
                <div>
                  <span className="font-bold text-slate-700 text-xs">أبرز المناصب القيادية:</span>
                  <ul className="list-disc list-inside mt-1 space-y-1 text-xs">
                    <li>مدير مجمع الحمودي لتحفيظ القرآن الكريم سابقًا.</li>
                    <li>مشرف البرامج في جمعية خيركم لتحفيظ القرآن الكريم.</li>
                    <li>مدير البرامج بمكتب حي الفيحاء سابقًا.</li>
                    <li>مدير برنامج ملتقى بصمة إبداع سابقًا.</li>
                    <li>مدير برنامج لون صيفك سابقًا.</li>
                  </ul>
                </div>
                <p className="text-xs">
                  يمتلك خبرة واسعة في التخطيط والتنظيم، مما أسهم في تحقيق أثر إيجابي ومستدام لدى المشاركين.
                </p>
              </div>
            </motion.div>

            {/* Supervisor 2 */}
            <motion.div 
               whileHover={{ y: -5 }}
               className="bg-slate-50 rounded-3xl p-8 border border-slate-100 shadow-sm text-center flex flex-col items-center gap-4 transition-all duration-300 hover:shadow-md group"
            >
              <div className="w-28 h-28 rounded-full bg-slate-100 overflow-hidden relative border-4 border-white shadow-lg mb-2">
                <img src="/images/supervaisor2.jpeg" alt="الاستاذ نواف السيد" className="w-full h-full object-cover object-top" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-800 font-tajawal">الاستاذ نواف السيد</h3>
                <p className="text-blue-500 font-bold text-xs">مشرف إداري</p>
              </div>
              <div className="text-sm text-slate-500 leading-relaxed text-right space-y-3 w-full">
                <p>
                  يتميز الأستاذ نواف بخبرة في العمل الإداري والتنظيمي، مع اهتمام بتطوير البرامج والمبادرات ذات الأثر التربوي والتعليمي.
                </p>
                <p>
                  يشغل منصب مدير حلقات مشكاة القرآنية بجامع الشيخ رافع الغامدي في جدة، حيث يسهم في الإشراف على البرامج القرآنية وتنظيم أعمال الحلقات بما يحقق أهدافها التعليمية والتربوية.
                </p>
                <p>
                  وهو خريج جامعة الملك عبدالعزيز من كلية الآداب والعلوم الإنسانية، مما عزز من خبراته المعرفية والإدارية وأسهم في مسيرته المهنية.
                </p>
              </div>
            </motion.div>

            {/* Supervisor 3 */}
            <motion.div 
               whileHover={{ y: -5 }}
               className="bg-slate-50 rounded-3xl p-8 border border-slate-100 shadow-sm text-center flex flex-col items-center gap-4 transition-all duration-300 hover:shadow-md group"
            >
              <div className="w-28 h-28 rounded-full bg-slate-100 overflow-hidden relative border-4 border-white shadow-lg mb-2">
                <img src="/images/supervaisor3.jpeg" alt="د. إبراهيم طارق محمود" className="w-full h-full object-cover object-top" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-800 font-tajawal">د. إبراهيم طارق محمود</h3>
                <p className="text-emerald-500 font-bold text-xs">مشرف التطوير والتدريب</p>
              </div>
              <div className="text-sm text-slate-500 leading-relaxed text-right space-y-3 w-full">
                <p>
                  يُعرف د. إبراهيم باهتمامه بالعمل الشبابي والتطوير المؤسسي، مع تركيزه على بناء المبادرات التي تسهم في تنمية قدرات الشباب وتمكينهم من تحقيق أثر مستدام.
                </p>
                <p>
                  يعمل عضو هيئة تدريس في جامعة الملك عبدالعزيز، حيث يجمع بين الخبرة الأكاديمية والممارسة العملية في مجالات التطوير والتأهيل.
                </p>
                <p>
                  يهتم بتصميم وتنفيذ البرامج النوعية، ويولي عناية خاصة بمجالات التدريب والابتكار والتقنيات الحديثة في تطوير الأفراد والمؤسسات.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 3.2. Success Marquee */}
      <section className="bg-gradient-to-b from-primary-navy to-slate-950 py-12 text-white relative overflow-hidden border-b border-white/5">
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-72 h-72 bg-accent-yellow/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-72 h-72 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8" 
            dir="rtl"
          >
            {/* Stat 1 */}
            <motion.div 
              variants={itemVariants}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className="relative group p-6 sm:p-8 bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 hover:border-accent-yellow/30 rounded-3xl backdrop-blur-md transition-all duration-300 flex flex-col items-center text-center shadow-lg"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-accent-yellow/0 via-accent-yellow/0 to-accent-yellow/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-yellow-500/10 border border-yellow-500/20 text-accent-yellow rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 shadow-[0_0_15px_rgba(13,148,136,0.1)]">
                <Users className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <h3 className="text-3xl sm:text-4xl md:text-5xl font-black font-sans bg-clip-text text-transparent bg-gradient-to-r from-accent-yellow to-emerald-400">
                +<AnimatedCounter target={5000} />
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 font-tajawal font-medium mt-3 leading-relaxed">
                عضو مشارك ونشط
              </p>
            </motion.div>

            {/* Stat 2 */}
            <motion.div 
              variants={itemVariants}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className="relative group p-6 sm:p-8 bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 hover:border-accent-yellow/30 rounded-3xl backdrop-blur-md transition-all duration-300 flex flex-col items-center text-center shadow-lg"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-accent-yellow/0 via-accent-yellow/0 to-accent-yellow/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                <Award className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <h3 className="text-3xl sm:text-4xl md:text-5xl font-black font-sans bg-clip-text text-transparent bg-gradient-to-r from-blue-455 to-accent-yellow">
                +<AnimatedCounter target={100} />
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 font-tajawal font-medium mt-3 leading-relaxed">
                برنامج وأكاديمية تدريبية
              </p>
            </motion.div>

            {/* Stat 3 */}
            <motion.div 
              variants={itemVariants}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className="relative group p-6 sm:p-8 bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 hover:border-accent-yellow/30 rounded-3xl backdrop-blur-md transition-all duration-300 flex flex-col items-center text-center shadow-lg"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-accent-yellow/0 via-accent-yellow/0 to-accent-yellow/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
                <Compass className="w-6 h-6 sm:w-7 sm:h-7 animate-[spin_8s_linear_infinite] group-hover:animate-[spin_3s_linear_infinite]" />
              </div>
              <h3 className="text-3xl sm:text-4xl md:text-5xl font-black font-sans bg-clip-text text-transparent bg-gradient-to-r from-amber-400 to-accent-yellow">
                +<AnimatedCounter target={50} />
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 font-tajawal font-medium mt-3 leading-relaxed">
                رحلة استكشافية ومغامرة
              </p>
            </motion.div>

            {/* Stat 4 */}
            <motion.div 
              variants={itemVariants}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className="relative group p-6 sm:p-8 bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 hover:border-accent-yellow/30 rounded-3xl backdrop-blur-md transition-all duration-300 flex flex-col items-center text-center shadow-lg"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-accent-yellow/0 via-accent-yellow/0 to-accent-yellow/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 shadow-[0_0_15px_rgba(168,85,247,0.1)]">
                <Sparkles className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <h3 className="text-3xl sm:text-4xl md:text-5xl font-black font-sans bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-400">
                +<AnimatedCounter target={25} />
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 font-tajawal font-medium mt-3 leading-relaxed">
                شريك نجاح متميز
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 4. Showcase Programs & Events with tabs */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12"
        >
          <div className="space-y-2 text-right">
            <h2 className="text-2xl md:text-3xl font-extrabold text-primary-navy font-tajawal">برامج وفعاليات ملهمة</h2>
            <p className="text-slate-500 text-sm">برامج مخصصة مبنية بدقة للشباب والفتيات تضمن الترفيه وبناء المهارات.</p>
          </div>

          {/* Tabs */}
          <div className="flex bg-slate-100 p-1.5 rounded-xl border border-slate-200 self-start md:self-end">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab("girls")}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${activeTab === "girls"
                ? "bg-white text-accent-teal shadow-sm"
                : "text-slate-500 hover:text-slate-800"
                }`}
            >
              برامج الفتيات
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab("boys")}
              className={`px-6 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${activeTab === "boys"
                ? "bg-white text-accent-teal shadow-sm"
                : "text-slate-500 hover:text-slate-800"
                }`}
            >
              برامج البنين
            </motion.button>
          </div>
        </motion.div>

        {/* Programs Grid */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {featuredPrograms.map((program) => {

              const programLink = program.slug?.current ? `/programs/${program.slug.current}` : `/programs?id=${program.id}`;
              const programImg = resolveImage(program.image || program.images?.[0]);
              const programDate = program.date || (program.startDate ? new Date(program.startDate).toLocaleDateString("ar-SA") : "");

              let targetBgClass = "bg-yellow-600/90";
              let targetText = "عام للجميع";
              if (program.target === "girls") {
                targetBgClass = "bg-accent-teal/90";
                targetText = "للفتيات";
              } else if (program.target === "boys") {
                targetBgClass = "bg-accent-teal/90";
                targetText = "للبنين";
              }

              return (
                <motion.div
                  key={program.id || program._id}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col group"
                >
                  {/* Image */}
                  <div className="h-52 w-full overflow-hidden relative">
                    <Image
                      src={programImg || "/images/about-founding.png"}
                      alt={program.title || "Program"}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover object-top group-hover:scale-105 transition-transform duration-500 z-10"
                    />
                    <span className="absolute top-4 right-4 bg-slate-900/85 backdrop-blur-sm text-accent-yellow px-3 py-1 rounded-full text-[10px] font-bold">
                      {program.categoryName || program.category?.title || "نشاط ملهم"}
                    </span>
                    <span className={`absolute top-4 left-4 text-white text-[10px] font-bold px-3 py-1 rounded-full ${targetBgClass}`}>
                      {targetText}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4 text-right">
                    <div className="space-y-2">
                      <Link href={programLink}>
                        <h3 className="font-bold text-slate-800 group-hover:text-accent-yellow transition-all duration-200 line-clamp-2 leading-snug">
                          {program.title}
                        </h3>
                      </Link>
                      <p className="text-xs text-slate-400 font-medium flex items-center gap-1 justify-end">
                        <span>{programDate}</span>
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      </p>
                      <p className="text-xs text-slate-550 leading-relaxed line-clamp-3 pt-1">
                        {program.description}
                      </p>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                      <span className="text-slate-800 font-bold text-sm">
                        {program.price > 0 ? `${program.price} ر.س` : "مجاناً"}
                      </span>
                      <div className="flex gap-2">
                        <MotionLink
                          href={programLink}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer"
                        >
                          التفاصيل
                        </MotionLink>
                        <MotionLink
                          href={program.title?.includes("صيف") ? "/summer-registration" : `/register?type=program&name=${encodeURIComponent(program.title)}`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-4 py-2.5 bg-accent-teal hover:bg-primary-teal text-white rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer shadow-md hover:shadow-lg"
                        >
                          سجل الآن
                        </MotionLink>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </AnimatePresence>

        <div className="text-center mt-12">
          <MotionLink
            href="/programs"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-white border border-slate-200 hover:border-accent-teal text-slate-700 hover:text-accent-teal rounded-xl text-sm font-bold shadow-sm transition-all duration-300 cursor-pointer"
          >
            مشاهدة كافة البرامج والأنشطة
            <ArrowLeft className="w-4 h-4" />
          </MotionLink>
        </div>
      </section>

      {/* 4.5. Highlighted Academies Section */}
      <section className="bg-slate-50 py-16 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-2xl mx-auto space-y-3 mb-14"
          >
            <span className="text-xs font-bold text-accent-yellow tracking-widest uppercase block">برامجنا الاحترافية</span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-primary-navy font-tajawal">أكاديمياتنا المتخصصة</h2>
            <p className="text-slate-500 text-sm">
              انضم إلى الأكاديمية التي تتماشى مع طموحاتك ومواهبك لتبدأ رحلة التعلم والتطور مع مدربينا.
            </p>
          </motion.div>

          {/* Academies Grid */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {featuredAcademies.map((acad: any) => {
              const acadLink = acad.slug?.current ? `/academies/${acad.slug.current}` : `/academies?id=${acad.id}`;
              const acadImg = resolveImage(acad.image || acad.images?.[0]);

              return (
                <motion.div
                  key={acad.id || acad._id}
                  variants={itemVariants}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col group text-right"
                >
                  {/* Image Block */}
                  <div className="h-52 w-full overflow-hidden relative">
                    <img
                      src={acadImg}
                      alt={acad.title}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-all duration-500"
                    />
                    <span className="absolute z-20 top-4 right-4 bg-slate-900/80 backdrop-blur-sm text-accent-yellow px-3 py-1 rounded-full text-[10px] font-bold">
                      {acad.ageGroup || acad.targetAge || "جميع الأعمار"}
                    </span>
                  </div>

                  {/* Info Block */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <Link href={acadLink}>
                        <h3 className="font-extrabold text-slate-800 text-base group-hover:text-accent-yellow transition-all duration-200 line-clamp-1">
                          {acad.title}
                        </h3>
                      </Link>
                      <p className="text-xs text-slate-405 font-medium leading-relaxed">
                        {acad.schedule || (acad.startDate ? new Date(acad.startDate).toLocaleDateString("ar-SA") : "")}
                      </p>
                      <p className="text-xs text-slate-505 leading-relaxed line-clamp-2 pt-1">
                        {acad.description}
                      </p>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                      <span className="text-accent-yellow font-extrabold text-base">
                        {acad.price} ر.س
                      </span>
                      <MotionLink
                        href={acadLink}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-4 py-2 bg-primary-navy hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer"
                      >
                        التفاصيل والتسجيل
                      </MotionLink>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          <div className="text-center mt-12">
            <MotionLink
              href="/academies"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-accent-yellow hover:bg-primary-yellow text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer"
            >
              مشاهدة كافة الأكاديميات
              <ArrowLeft className="w-4 h-4" />
            </MotionLink>
          </div>
        </div>
      </section>

      {/* 5. Highlighted Trips Section */}
      <section className="bg-slate-50 py-16 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-2xl mx-auto space-y-3 mb-14"
          >
            <span className="text-xs font-bold text-accent-yellow tracking-widest uppercase block">مغامرات فريدة من نوعها</span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-primary-navy font-tajawal">رحلات ملهم: مغامرات تصنع الأثر</h2>
            <p className="text-slate-500 text-sm">
              برامج ترفيهية وإيمانية ومغامرات شبابية مصممة لبناء الوعي والروح الجماعية والمهارة في أروع وجهات العالم.
            </p>
          </motion.div>

          {/* Trips Grid */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {featuredTrips.map((trip) => {

              const tripLink = trip.slug?.current ? `/trips/${trip.slug.current}` : `/trips?id=${trip.id}`;
              const tripImg = resolveImage(trip.image || trip.images?.[0]);
              const tripDate = trip.date || (trip.startDate ? new Date(trip.startDate).toLocaleDateString("ar-SA") : "");

              return (
                <motion.div
                  key={trip.id || trip._id}
                  variants={itemVariants}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col group"
                >
                  {/* Trip Image */}
                  <div className="h-52 w-full overflow-hidden relative">
                    <Image
                      src={tripImg || "/images/about-founding.png"}
                      alt={trip.title || "Trip"}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover object-top group-hover:scale-105 transition-transform duration-500 z-10"
                    />
                    <span className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-bold">
                      {trip.typeName}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4 text-right">
                    <div className="space-y-2">
                      <Link href={tripLink}>
                        <h3 className="font-bold text-slate-800 text-base group-hover:text-accent-yellow transition-all duration-200 line-clamp-1">
                          {trip.title}
                        </h3>
                      </Link>
                      <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-400 font-medium justify-end">
                        <span className="flex items-center gap-1">
                          <span>{tripDate}</span>
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        </span>
                        <span className="flex items-center gap-1">
                          <span>{trip.location}</span>
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        </span>
                      </div>
                      <p className="text-xs text-slate-550 leading-relaxed line-clamp-2 pt-2">
                        {trip.description}
                      </p>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-medium">يبدأ من</span>
                        <span className="text-accent-yellow font-bold text-base">{trip.price} ر.س</span>
                      </div>
                      <MotionLink
                        href={tripLink}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-5 py-2.5 bg-primary-navy hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer"
                      >
                        التفاصيل والتسجيل
                      </MotionLink>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          <div className="text-center mt-12">
            <MotionLink
              href="/trips"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-accent-yellow hover:bg-primary-yellow text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer"
            >
              استكشف كافة وجهاتنا
              <ArrowLeft className="w-4 h-4" />
            </MotionLink>
          </div>
        </div>
      </section>

      {/* 6. Featured Products Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12"
        >
          <div className="space-y-2 text-right">
            <span className="text-xs font-bold text-accent-yellow tracking-widest uppercase block">المجموعة الرسمية</span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-primary-navy font-tajawal">مقتنيات وإصدارات ملهم</h2>
            <p className="text-slate-500 text-sm">تصاميم فريدة من هوياتنا ملائمة لأنشطتك اليومية ومصممة بجودة عالية.</p>
          </div>
          <MotionLink
            href="/store"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 border border-slate-200 hover:border-accent-yellow text-slate-600 hover:text-accent-yellow rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer"
          >
            زيارة المتجر بالكامل
            <ArrowLeft className="w-3.5 h-3.5" />
          </MotionLink>
        </motion.div>

        {/* Product Cards Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {featuredProducts.map((product) => {
            const productLink = product.slug?.current ? `/store/${product.slug.current}` : `/store`;
            const productImg = resolveImage(product.image || product.images?.[0], 400, 400);

            return (
              <motion.div
                key={product.id || product._id}
                variants={itemVariants}
                whileHover={{ y: -8, scale: 1.02 }}
                className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col group relative text-right"
              >
                {product.isNew && (
                  <span className="absolute top-4 right-4 bg-accent-gold text-white text-[9px] font-extrabold px-2.5 py-1 rounded-full z-10 shadow-sm">
                    جديد حصرى
                  </span>
                )}

                {/* Product Image */}
                <div className="h-52 w-full overflow-hidden relative">
                  <Link href={productLink} className="absolute inset-0 z-10">
                    <Image
                      src={productImg || "/images/about-founding.png"}
                      alt={product.name || product.title || "Product"}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
                    />
                  </Link>
                </div>

                {/* Product Info */}
                <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                  <div className="space-y-1">
                    <Link href={productLink}>
                      <h3 className="font-bold text-slate-800 text-sm group-hover:text-accent-yellow transition-all duration-200 line-clamp-1">
                        {product.name || product.title}
                      </h3>
                    </Link>
                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                      {product.description}
                    </p>
                  </div>

                  <div className="flex justify-between items-center pt-3 border-t border-slate-50">
                    <span className="text-accent-yellow font-extrabold text-base">{product.price} ر.س</span>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        // Normalize product format for context
                        addToCart({
                          id: product.id || product._id,
                          name: product.name || product.title,
                          price: product.price,
                          category: product.category?.slug?.current || product.category || "accessories",
                          image: productImg,
                          description: product.description,
                        });
                      }}
                      className="p-2.5 bg-slate-100 hover:bg-accent-yellow text-slate-700 hover:text-white rounded-xl transition-all duration-300 flex items-center justify-center gap-1.5 text-xs font-bold"
                      aria-label="إضافة للسلة"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span>أضف للسلّة</span>
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* 7. Success Partners Marquee Logos */}
      <section className="bg-slate-50/50 py-16 border-t border-slate-100 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h3 className="text-slate-400 font-bold text-xs tracking-widest uppercase">شركاء النجاح المتميزين</h3>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-10 md:gap-16 opacity-75 transition-all duration-500">
            <motion.div 
              whileHover={{ scale: 1.1, y: -2 }}
              className="flex items-center gap-2 font-tajawal font-black text-slate-400 hover:text-accent-yellow text-xl tracking-wider select-none cursor-pointer transition-colors duration-300"
            >
              <Award className="w-6 h-6 text-slate-350 group-hover:text-accent-yellow" />
              <span>مؤسسة العطاء</span>
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.1, y: -2 }}
              className="flex items-center gap-2 font-tajawal font-black text-slate-400 hover:text-accent-yellow text-xl tracking-wider select-none cursor-pointer transition-colors duration-300"
            >
              <Award className="w-6 h-6 text-slate-350 group-hover:text-accent-yellow" />
              <span>أكاديمية الريادة</span>
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.1, y: -2 }}
              className="flex items-center gap-2 font-tajawal font-black text-slate-400 hover:text-accent-yellow text-xl tracking-wider select-none cursor-pointer transition-colors duration-300"
            >
              <Award className="w-6 h-6 text-slate-350 group-hover:text-accent-yellow" />
              <span>جمعية التمكين</span>
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.1, y: -2 }}
              className="flex items-center gap-2 font-tajawal font-black text-slate-400 hover:text-accent-yellow text-xl tracking-wider select-none cursor-pointer transition-colors duration-300"
            >
              <Award className="w-6 h-6 text-slate-350 group-hover:text-accent-yellow" />
              <span>شركة آفاق</span>
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.1, y: -2 }}
              className="flex items-center gap-2 font-tajawal font-black text-slate-400 hover:text-accent-yellow text-xl tracking-wider select-none cursor-pointer transition-colors duration-300"
            >
              <Award className="w-6 h-6 text-slate-350 group-hover:text-accent-yellow" />
              <span>مبادرة أثر</span>
            </motion.div>
          </div>
        </div>
      </section>

    </div>
  );
}
