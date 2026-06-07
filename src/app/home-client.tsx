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
import { useRouter } from "next/navigation";
import QuickRegistrationModal from "@/components/shared/QuickRegistrationModal";

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
  const { products: contextProducts, trips: contextTrips, programs: contextPrograms, academies: contextAcademies, addToCart, currentUser } = useApp();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"girls" | "boys">("boys");
  const [showRegModal, setShowRegModal] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<any>(null);

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
        btnText: banner.btnText || banner.buttonText
      };
    })()
    : {
        title: "رحلات ملهم: مغامرات تصنع الأثر",
        subtitle: "استكشف العالم، وابنِ علاقات حقيقية في رحلات ملهم المليئة بالمتعة والتعلم والروح الجماعية.",
        image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1200",
        link: "/trips",
        btnText: null
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
            src={heroSlide.image || "/images/About.jpeg"}
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
            {heroSlide.subtitle && (
              <p className="text-xl sm:text-sm md:text-lg text-slate-300 leading-relaxed font-light">
                {heroSlide.subtitle}
              </p>
            )}
            {heroSlide.btnText && (
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 justify-start w-full sm:w-auto">
                <MotionLink
                  href={heroSlide.link}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full sm:w-auto px-6 py-3 bg-accent-teal hover:bg-primary-teal text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg transition-all duration-300 flex items-center justify-center cursor-pointer"
                >
                  {heroSlide.btnText}
                </MotionLink>
              </div>
            )}
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
          <p className="text-slate-800 text-sl leading-relaxed">
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
            <div className="w-14 h-14 bg-teal-50 text-accent-teal rounded-2xl flex items-center justify-center mb-6">
              <GraduationCap className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-3">أكاديميات متخصصة</h3>
            <p className="text-sm text-slate-800 leading-relaxed">
              برامج تدريبية مكثفة بقيادة خبراء الصناعة في القيادة والرياضة والفنون.
            </p>
            <Link href="/academies" className="mt-4 text-sm font-bold text-accent-teal hover:underline flex items-center gap-1">
              تعرف عليها <ArrowLeft className="w-3 h-3" />
            </Link>
          </motion.div>

          {/* Feature 2 */}
          <motion.div 
            variants={itemVariants}
            whileHover={{ y: -8, scale: 1.02 }}
            className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 text-center flex flex-col items-center"
          >
            <div className="w-14 h-14 bg-teal-50 text-accent-teal rounded-2xl flex items-center justify-center mb-6">
              <Compass className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">رحلات مُلهمة</h3>
            <p className="text-sm text-slate-800 leading-relaxed">
              استكشاف وتجارب واقعية تبني الشخصية وتعزز روح الفريق والاعتماد على النفس.
            </p>
            <Link href="/trips" className="mt-4 text-sm font-bold text-accent-teal hover:underline flex items-center gap-1">
              استكشف الرحلات <ArrowLeft className="w-3 h-3" />
            </Link>
          </motion.div>

          {/* Feature 4 */}
          <motion.div 
            variants={itemVariants}
            whileHover={{ y: -8, scale: 1.02 }}
            className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 text-center flex flex-col items-center"
          >
            <div className="w-14 h-14 bg-teal-50 text-accent-teal rounded-2xl flex items-center justify-center mb-6">
              <ShoppingBag className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-2">إصدارات ومعدات ملهم</h3>
            <p className="text-sm text-slate-800 leading-relaxed">
              متجر متكامل بمنتجات مميزة وتصاميم شبابية بجودة عالية لتكون فخوراً بهويتك.
            </p>
            <Link href="/store" className="mt-4 text-sm font-bold text-accent-teal hover:underline flex items-center gap-1">
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
              <span className="text-xl font-bold text-accent-yellow tracking-widest uppercase block">عن منصة مُلهم</span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-primary-navy font-tajawal">نصنع القادة ونبني الأثر</h2>
              <p className="text-slate-800 text-sl leading-relaxed">
                منصة ملهم هي مجتمع شبابي متكامل يهدف إلى تمكين الجيل الجديد وتوفير فرص استثنائية للنمو والتعلم في بيئة محفزة. نحن نؤمن بأن كل شاب وفتاة يمتلك قدرات كامنة تحتاج إلى التوجيه الصحيح والمساحة الآمنة للإبداع.
              </p>
              <p className="text-slate-800 text-sl leading-relaxed">
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
                <Image
                  src="/images/About.jpeg"
                  alt="عن ملهم"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-primary-navy/40 to-transparent" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 3.2. Success Marquee */}
      <section className="bg-primary-teal py-16 text-white relative overflow-hidden border-b border-white/5">
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-72 h-72 bg-accent-yellow/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-72 h-72 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-2xl mx-auto space-y-3 mb-12"
          >
            <h2 className="text-2xl md:text-3xl font-extrabold text-white font-tajawal">مُلهم في أرقام</h2>
            <p className="text-slate-400 text-sm md:text-base">
              مسيرتنا تتوج بالأرقام، وأثرنا يمتد ليصنع التغيير.
            </p>
          </motion.div>

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
                <h3 className="text-lg font-bold text-slate-800 font-tajawal">الأستاذ باسم عبدالهادي</h3>
                <p className="text-accent-yellow font-bold text-xs">مشرف البرامج</p>
              </div>
              <div className="text-sm text-slate-800 leading-relaxed text-right space-y-3 w-full">
                <ul className="list-disc list-inside space-y-2 text-xs sm:text-sm">
                  <li>خبرة تتجاوز 25 عامًا في الإشراف وإدارة البرامج التربوية والشبابية.</li>
                  <li>أسهم في قيادة وتطوير العديد من المبادرات والبرامج ذات الأثر التربوي والتنموي.</li>
                  <li>شغل منصب مشرف البرامج في جمعية خيركم.</li>
                  <li>عمل مديرًا للبرامج بمكتب حي الفيحاء.</li>
                  <li>مؤسس برنامج «لون صيفك».</li>
                  <li>يمتلك خبرة واسعة في التخطيط والإشراف على البرامج النوعية وإدارة الفرق.</li>
                </ul>
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
                <h3 className="text-lg font-bold text-slate-800 font-tajawal">الأستاذ نواف السيد</h3>
                <p className="text-blue-500 font-bold text-xs">المشرف الإداري</p>
              </div>
              <div className="text-sm text-slate-800 leading-relaxed text-right space-y-3 w-full">
                <ul className="list-disc list-inside space-y-2 text-xs sm:text-sm">
                  <li>خريج جامعة الملك عبدالعزيز.</li>
                  <li>مشرف إداري في برنامج ملهم.</li>
                  <li>يمتلك خبرة في الإدارة والتنظيم وتطوير المبادرات التربوية والتعليمية.</li>
                  <li>مدير حلقات مشكاة القرآنية بجامع الشيخ رافع الغامدي بجدة.</li>
                  <li>مهتم ببناء الأنظمة الإدارية وتحسين بيئات العمل.</li>
                </ul>
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
              <div className="text-sm text-slate-800 leading-relaxed text-right space-y-3 w-full">
                <ul className="list-disc list-inside space-y-2 text-xs sm:text-sm">
                  <li>عضو هيئة تدريس في جامعة الملك عبدالعزيز.</li>
                  <li>خبرة تزيد على 10 سنوات في التطوير المؤسسي والعمل الشبابي والتدريب.</li>
                  <li>أسهم في تأسيس وإدارة عدد من الجمعيات والمراكز والمبادرات الشبابية والقرآنية.</li>
                  <li>مهتم ببناء البرامج النوعية وتنمية القدرات.</li>
                  <li>يعمل على تطوير الكوادر والفرق العاملة ورفع كفاءتها.</li>
                </ul>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Promotional Ad Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative bg-primary-teal rounded-[2rem] overflow-hidden shadow-2xl border border-white/10 flex flex-col lg:flex-row items-center justify-between"
        >
          {/* Text Content */}
          <div className="p-10 lg:p-14 lg:w-1/2 text-right space-y-6 z-10 relative">
            <div className="inline-block bg-accent-yellow/10 text-accent-yellow px-4 py-1.5 rounded-full text-xs font-bold mb-2 border border-accent-yellow/20">
              التسجيل متاح الآن
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-white font-tajawal leading-tight">
              لا تفوت فرصة الصيف! <br/>
              <span className="text-accent-yellow">برنامج "لون صيفك"</span>
            </h2>
            <p className="text-slate-300 text-sm md:text-base leading-relaxed max-w-lg font-cairo">
              استعد لصيف مليء بالمتعة والتطوير. فعاليات رياضية، وأنشطة متنوعة صُممت خصيصاً لتطوير المهارات واكتشاف المواهب للبنين والفتيات في بيئة آمنة وملهمة.
            </p>
            
            <div className="pt-4">
              <Link href="/summer-registration" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-accent-yellow text-slate-900 rounded-xl font-bold hover:bg-white transition-all duration-300 shadow-[0_0_20px_rgba(255,220,127,0.3)] hover:shadow-[0_0_25px_rgba(255,220,127,0.5)] transform hover:-translate-y-1 text-base">
                سجل الآن في البرنامج
                <svg className="w-5 h-5 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Image Content (Flyer Showcase) */}
          <div className="w-full lg:w-1/2 p-6 lg:p-12 relative flex justify-center items-center bg-slate-800/30 overflow-hidden">
             {/* Decorational glow */}
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-accent-yellow/20 blur-[80px] rounded-full pointer-events-none" />
             
             <Link href="/summer-registration" className="relative block w-full max-w-md transform transition-transform duration-500 hover:scale-105 hover:-rotate-1 z-10">
               <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white/10 ring-1 ring-white/5 bg-white">
                 <img 
                  src="/images/summer.webp" 
                  alt="إعلان البرنامج الصيفي" 
                  className="w-full h-auto object-contain"
                />
               </div>
               
               {/* Click badge */}
               <div className="absolute -bottom-4 -left-4 bg-accent-teal text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg border-2 border-white animate-bounce flex items-center gap-2">
                 <span>اضغط للتفاصيل</span>
                 <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" /></svg>
               </div>
             </Link>
          </div>
        </motion.div>
      </section>

      {/* 4. Showcase Programs & Events with tabs */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12"
        >
          <div className="space-y-2 text-right">
            <h2 className="text-2xl md:text-3xl font-extrabold text-primary-navy font-tajawal">برامج وفعاليات ملهمة</h2>
            <p className="text-slate-800 text-sl">برامج مخصصة مبنية بدقة للشباب والفتيات تضمن الترفيه وبناء المهارات.</p>
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
              const programDate = program.date || program.startDate || "";

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
                      src={programImg || "/images/About.png"}
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
                        <motion.button
                          onClick={() => {
                            const isSummerProgram = program.title?.includes("صيف");
                            
                            if (isSummerProgram) {
                              router.push('/summer-registration');
                              return;
                            }

                            if (!currentUser) {
                              router.push('/register?type=program&name=' + encodeURIComponent(program.title));
                              return;
                            }
                            setSelectedProgram(program);
                            setShowRegModal(true);
                          }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-4 py-2.5 bg-accent-teal hover:bg-primary-teal text-white rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer shadow-md hover:shadow-lg"
                        >
                          سجل الآن
                        </motion.button>
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
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-accent-yellow hover:bg-primary-yellow text-primary-navy rounded-xl text-sm font-bold shadow-sm transition-all duration-300 cursor-pointer"
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
            <span className="text-xl font-bold text-accent-yellow tracking-widest uppercase block">برامجنا الاحترافية</span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-primary-navy font-tajawal">أكاديمياتنا المتخصصة</h2>
            <p className="text-slate-800 text-sl">
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
                    {acad.registrationOpen !== false ? (
                      <Link href={acadLink}>
                        <img
                          src={acadImg}
                          alt={acad.title}
                          className="w-full h-full object-cover object-top group-hover:scale-105 transition-all duration-500"
                        />
                      </Link>
                    ) : (
                      <img
                        src={acadImg}
                        alt={acad.title}
                        className="w-full h-full object-cover object-top opacity-80"
                      />
                    )}
                    <span className="absolute z-20 top-4 right-4 bg-slate-900/80 backdrop-blur-sm text-accent-yellow px-3 py-1 rounded-full text-[10px] font-bold">
                      {acad.ageGroup || acad.targetAge || "جميع الأعمار"}
                    </span>
                  </div>

                  {/* Info Block */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      {acad.registrationOpen !== false ? (
                        <Link href={acadLink}>
                          <h3 className="font-extrabold text-slate-800 text-base group-hover:text-accent-yellow transition-all duration-200 line-clamp-1">
                            {acad.title}
                          </h3>
                        </Link>
                      ) : (
                        <h3 className="font-extrabold text-slate-800 text-base opacity-80 line-clamp-1">
                          {acad.title}
                        </h3>
                      )}
                      {acad.registrationOpen !== false && (
                        <p className="text-xs text-slate-405 font-medium leading-relaxed">
                          {acad.schedule || acad.startDate || ""}
                        </p>
                      )}
                      <p className="text-sm text-slate-800 leading-relaxed line-clamp-2 pt-1">
                        {acad.description}
                      </p>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                      {acad.registrationOpen === false ? null : (
                        <span className="text-accent-yellow font-extrabold text-base">
                          {acad.price} ر.س
                        </span>
                      )}
                      {acad.registrationOpen !== false && (
                        <MotionLink
                          href={acadLink}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-4 py-2  bg-accent-teal hover:bg-primary-teal text-white rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer"
                        >
                          التفاصيل والتسجيل
                        </MotionLink>
                      )}
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
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-accent-yellow hover:bg-primary-yellow text-primary-navy rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer"
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
            <span className="text-xl font-bold text-accent-yellow tracking-widest uppercase block">مغامرات فريدة من نوعها</span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-primary-navy font-tajawal">رحلات ملهم: مغامرات تصنع الأثر</h2>
            <p className="text-slate-800 text-sl">
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
              const tripDate = trip.date || trip.startDate || "";

              return (
                <motion.div
                  key={trip.id || trip._id}
                  variants={itemVariants}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col group"
                >
                  {/* Trip Image */}
                  <div className="h-52 w-full overflow-hidden relative">
                    {trip.registrationOpen !== false ? (
                      <Link href={tripLink}>
                        <Image
                          src={tripImg || "/images/About.png"}
                          alt={trip.title || "Trip"}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover object-top group-hover:scale-105 transition-transform duration-500 z-10"
                        />
                      </Link>
                    ) : (
                      <Image
                        src={tripImg || "/images/About.png"}
                        alt={trip.title || "Trip"}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover object-top opacity-80 z-10"
                      />
                    )}
                    <span className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-bold z-20">
                      {trip.typeName}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4 text-right">
                    <div className="space-y-2">
                      {trip.registrationOpen !== false ? (
                        <Link href={tripLink}>
                          <h3 className="font-bold text-slate-800 text-base group-hover:text-accent-yellow transition-all duration-200 line-clamp-1">
                            {trip.title}
                          </h3>
                        </Link>
                      ) : (
                        <h3 className="font-bold text-slate-800 text-base opacity-80 line-clamp-1">
                          {trip.title}
                        </h3>
                      )}
                      <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-slate-400 font-medium justify-end">
                        {trip.registrationOpen !== false && tripDate && (
                          <span className="flex items-center gap-1">
                            <span>{tripDate}</span>
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          </span>
                        )}
                        {trip.registrationOpen !== false && trip.location && (
                          <span className="flex items-center gap-1">
                            <span>{trip.location}</span>
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-800 leading-relaxed line-clamp-2 pt-2">
                        {trip.description}
                      </p>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                      {trip.registrationOpen === false ? null : (
                        <div>
                          <span className="text-[10px] text-slate-400 block font-medium">يبدأ من</span>
                          <span className="text-accent-yellow font-bold text-base">{trip.price} ر.س</span>
                        </div>
                      )}
                      {trip.registrationOpen !== false && (
                        <MotionLink
                          href={tripLink}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-5 py-2.5  bg-accent-teal hover:bg-primary-teal text-white rounded-xl text-xs font-bold transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer"
                        >
                          التفاصيل والتسجيل
                        </MotionLink>
                      )}
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
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-accent-yellow hover:bg-primary-yellow text-primary-navy rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer"
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
            <span className="text-xl font-bold text-accent-yellow tracking-widest uppercase block">المجموعة الرسمية</span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-primary-navy font-tajawal">مقتنيات وإصدارات ملهم</h2>
            <p className="text-slate-800 text-sl">تصاميم فريدة من هوياتنا ملائمة لأنشطتك اليومية ومصممة بجودة عالية.</p>
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
                      src={productImg || "/images/About.png"}
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
                      className="p-2.5 bg-slate-100 hover:bg-accent-yellow text-slate-700 hover:text-primary-navy rounded-xl transition-all duration-300 flex items-center justify-center gap-1.5 text-xs font-bold"
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
            <h3 className="text-slate-400 font-bold text-xl tracking-widest uppercase">شركاء النجاح المتميزين</h3>
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

      {/* Program Registration Modal */}
      <QuickRegistrationModal
        isOpen={showRegModal}
        onClose={() => {
          setShowRegModal(false);
          setSelectedProgram(null);
        }}
        targetItem={selectedProgram}
        targetType="program"
      />

    </div>
  );
}
