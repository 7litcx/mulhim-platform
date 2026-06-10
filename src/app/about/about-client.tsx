"use client";

import React, { useState, useEffect, useRef } from "react";
import { Sparkles, Heart, Compass, Target, Users, User, BookOpen, Trophy, ShieldCheck, Star, Award, UserCheck, Handshake, Eye } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";
import { normalizeLink } from "@/utils/link";
import { motion } from "framer-motion";

const MotionLink = motion.create(Link);

interface CounterProps {
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

function RealVisitorCounter() {
  const [visits, setVisits] = useState<number | null>(null);

  useEffect(() => {
    const fetchVisits = async () => {
      try {
        const res = await fetch("/api/visits");
        if (res.ok) {
          const data = await res.json();
          setVisits(data.visits);
          sessionStorage.setItem("hasVisited", "true");
        } else {
          setVisits(12500); // Fallback
        }
      } catch (error) {
        console.error("Failed to fetch visits:", error);
        setVisits(12500); // Fallback
      }
    };

    fetchVisits();
  }, []);

  if (visits === null) return <span>...</span>;
  return <AnimatedCounter target={visits} duration={2500} />;
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
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

// Helper to resolve images
const resolveImage = (img: any, width = 1600, height = 800) => {
  if (!img) return null;
  if (typeof img === "string") return img;
  if (typeof img === "object") {
    try {
      return urlFor(img).width(width).height(height).url();
    } catch (e) {
      return null;
    }
  }
  return null;
};

interface AboutClientProps {
  sanityHeroBanners?: any[];
}

export default function AboutClient({ sanityHeroBanners = [] }: AboutClientProps) {
  // Resolve dynamic About page banner from Sanity
  const aboutBanner = sanityHeroBanners.find(b => b.page === "about");
  
  const aboutHero = aboutBanner ? {
    title: aboutBanner.title,
    subtitle: aboutBanner.description,
    image: resolveImage(aboutBanner.images?.[0] || aboutBanner.image, 1600, 800),
    btnText: aboutBanner.btnText,
    link: aboutBanner.link
  } : {
    title: "عن مُلهم: قصة طموح وأثر",
    subtitle: "نحن أكثر من مجرد منصة؛ نحن مجتمع متكامل يسعى لتحويل الشغف إلى واقع ملموس، وتمكين الشباب من قيادة المستقبل بروح الابتكار والعطاء.",
    image: null,
    btnText: "قصتنا وقيمنا",
    link: ""
  };

  return (
    <div className="space-y-8 pb-10">
      
      {/* 1. Page Hero Banner */}
      <section className="relative min-h-[380px] sm:min-h-[450px] md:min-h-[500px] flex items-center py-12 sm:py-12 md:py-16 bg-slate-900 overflow-hidden text-white shadow-inner">
        {/* Background Image with Overlay */}
        {aboutHero.image ? (
          <div className="absolute inset-0 z-0 transition-all duration-1000 ease-in-out">
            <div className="absolute inset-0 w-full h-full opacity-65">
              <Image
                src={aboutHero.image || "/images/About.png"}
                alt={aboutHero.title || "About Us"}
                fill
                priority
                fetchPriority="high"
                className="object-cover object-center"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent md:bg-gradient-to-l md:from-slate-950/95 md:via-slate-950/30 md:to-transparent" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(13,148,136,0.25),transparent_60%)] z-0" />
        )}
        
        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <motion.span 
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 15 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-accent-yellow/20 text-accent-yellow rounded-full text-xs font-bold border border-accent-yellow/30"
          >
            <Sparkles className="w-3.5 h-3.5" />
            قصتنا وقيمنا
          </motion.span>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 80, damping: 14, delay: 0.1 }}
            className="text-2xl sm:text-4xl md:text-5xl font-black font-tajawal leading-tight max-w-4xl mx-auto"
          >
            {aboutHero.title}
          </motion.h1>
          {aboutHero.subtitle && (
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 80, damping: 14, delay: 0.2 }}
              className="text-xs sm:text-sm md:text-lg text-slate-300 max-w-2xl mx-auto font-light leading-relaxed"
            >
              {aboutHero.subtitle}
            </motion.p>
          )}
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 100, damping: 15, delay: 0.3 }}
            className="flex justify-center pt-2 w-full"
          >
            {aboutHero.btnText && (
              aboutHero.link && normalizeLink(aboutHero.link) !== "/about" && !aboutHero.link.startsWith("#") ? (
                <MotionLink
                  href={normalizeLink(aboutHero.link)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full sm:w-auto px-6 py-3 bg-accent-teal hover:bg-primary-teal text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg transition-all duration-300 flex items-center justify-center cursor-pointer"
                >
                  {aboutHero.btnText}
                </MotionLink>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    const el = document.getElementById("our-story");
                    el?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="w-full sm:w-auto px-6 py-3 bg-accent-teal hover:bg-primary-teal text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg transition-all duration-300 flex items-center justify-center cursor-pointer"
                >
                  {aboutHero.btnText}
                </motion.button>
              )
            )}
          </motion.div>
        </div>
      </section>

      {/* 2. Our Story Section */}
      <section id="our-story" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 60, damping: 15 }}
            className="relative rounded-3xl overflow-hidden shadow-xl aspect-video lg:aspect-square"
          >
            <Image
              src="/images/About.jpeg"
              alt="قصتنا"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </motion.div>

          {/* Text Block */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 60, damping: 15 }}
            className="space-y-6 text-right"
          >
            <span className="text-xl font-bold text-accent-yellow uppercase tracking-wider block">البداية والتطور</span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-primary-navy font-tajawal">حكايتنا.. كيف بدأ الإلهام؟</h2>
            <div className="text-slate-800 text-sl leading-relaxed space-y-4 font-tajawal">
              <p>
                بدأت منصة "مُلهم" كفكرة بسيطة في أروقة التجمعات الشبابية، حيث لاحظنا فجوة بين تطلعات الشباب الواعد والمعرفة العملية والأنشطة الإثرائية التي تبني وتصقل شخصياتهم في بيئة ملهمة وصحية.
              </p>
              <p>
                اليوم، تطورت المنصة لتصبح وجهة متكاملة تقدم برامج تدريبية، أكاديميات تخصصية، ورحلات استكشافية ومخيمات موسمية، بالإضافة إلى متجر ملهم الذي يمثل فخراً واعتزازاً بهوية المنصة وأهدافها.
              </p>
              <p>
                نحن نؤمن بأن كل شاب وفتاة يملكون قوة إلهام كامنة، وبأن دورنا هو تهيئة البيئة الحاضنة وتوفير الأدوات اللازمة لاستكشاف هذه القوى وتوجيهها بالشكل الصحيح لصنع التميز المستدام.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 3. Vision, Mission & Values Grid */}
      <section className="bg-slate-50 py-16 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {/* Vision */}
            <motion.div 
              variants={itemVariants}
              whileHover={{ y: -6, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)" }}
              className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm transition-all duration-300 text-center flex flex-col items-center space-y-4 group"
            >
              <div className="w-14 h-14 bg-primary-teal/10 text-primary-teal rounded-2xl flex items-center justify-center group-hover:scale-110 transition-all duration-300">
                <Compass className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">رؤيتنا</h3>
              <p className="text-sm text-slate-800 leading-relaxed max-w-xs">
                أن نكون المنصة الشبابية الرائدة في تمكين المهارات، صناعة الأثر، وتخريج أجيال متمكنة من القادة والمبدعين.
              </p>
            </motion.div>

            {/* Mission */}
            <motion.div 
              variants={itemVariants}
              whileHover={{ y: -6, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)" }}
              className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm transition-all duration-300 text-center flex flex-col items-center space-y-4 group"
            >
              <div className="w-14 h-14 bg-primary-teal/10 text-primary-teal rounded-2xl flex items-center justify-center group-hover:scale-110 transition-all duration-300">
                <Target className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">رسالتنا</h3>
              <p className="text-sm text-slate-800 leading-relaxed max-w-xs">
                توفير بيئة تفاعلية تجمع بين التعلم العملي، المتعة، والمغامرة لبناء الشخصية المتكاملة وتعزيز التميز للشباب.
              </p>
            </motion.div>

            {/* Values */}
            <motion.div 
              variants={itemVariants}
              whileHover={{ y: -6, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)" }}
              className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm transition-all duration-300 text-center flex flex-col items-center space-y-4 group"
            >
              <div className="w-14 h-14 bg-primary-teal/10 text-primary-teal rounded-2xl flex items-center justify-center group-hover:scale-110 transition-all duration-300">
                <Heart className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">قيمنا</h3>
              <p className="text-sm text-slate-800 leading-relaxed max-w-xs">
                الإبداع، التمكين، الشفافية، والعمل الجماعي، وهي الركائز الأساسية التي تنطلق منها كافة برامجنا ومبادراتنا.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 4. Strategic Goals */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto space-y-4 mb-16"
        >
          <h2 className="text-2xl md:text-3xl font-extrabold text-primary-navy font-tajawal">أهدافنا الاستراتيجية</h2>
          <p className="text-slate-800 text-sl">
            نسير وفق خطط استراتيجية مرسومة تضمن التطوير المستمر للخدمات وتعظيم الأثر الاجتماعي للشباب.
          </p>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          <motion.div 
            variants={itemVariants}
            whileHover={{ scale: 1.03 }}
            className="flex flex-col gap-4 p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 text-right"
          >
            <div className="w-12 h-12 bg-slate-100 text-primary-navy rounded-xl flex items-center justify-center flex-shrink-0">
              <UserCheck className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h4 className="font-bold text-slate-800 text-sl">بناء الشخصية والقيم</h4>
              <p className="text-sm text-slate-800 leading-relaxed">تنشئة جيل معتز بقيمه، واثق بنفسه، وقادر على تحمل المسؤولية والإسهام الإيجابي في مجتمعه.</p>
            </div>
          </motion.div>

          <motion.div 
            variants={itemVariants}
            whileHover={{ scale: 1.03 }}
            className="flex flex-col gap-4 p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 text-right"
          >
            <div className="w-12 h-12 bg-slate-100 text-primary-navy rounded-xl flex items-center justify-center flex-shrink-0">
              <Star className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h4 className="font-bold text-slate-800 text-sl">تقديم برامج نوعية مؤثرة</h4>
              <p className="text-sm text-slate-800 leading-relaxed">تصميم وتنفيذ برامج تربوية وتعليمية وترفيهية مبتكرة تحقق تجربة مميزة وأثرًا مستدامًا للمشاركين.</p>
            </div>
          </motion.div>

          <motion.div 
            variants={itemVariants}
            whileHover={{ scale: 1.03 }}
            className="flex flex-col gap-4 p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 text-right"
          >
            <div className="w-12 h-12 bg-slate-100 text-primary-navy rounded-xl flex items-center justify-center flex-shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h4 className="font-bold text-slate-800 text-sl">تطوير الكوادر والقيادات</h4>
              <p className="text-sm text-slate-800 leading-relaxed">تأهيل الكوادر وتطوير قدراتهم المهنية والقيادية لضمان جودة الأداء واستدامة النجاح.</p>
            </div>
          </motion.div>

          <motion.div 
            variants={itemVariants}
            whileHover={{ scale: 1.03 }}
            className="flex flex-col gap-4 p-6 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 text-right"
          >
            <div className="w-12 h-12 bg-slate-100 text-primary-navy rounded-xl flex items-center justify-center flex-shrink-0">
              <Handshake className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <h4 className="font-bold text-slate-800 text-sl">تعزيز الاستدامة والشراكات</h4>
              <p className="text-sm text-slate-800 leading-relaxed">بناء شراكات فاعلة وتنويع الموارد بما يسهم في توسيع الأثر واستمرار البرنامج وتطوره.</p>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* 6. Success Marquee */}
      <section className="bg-primary-teal py-16 text-white relative overflow-hidden border-y border-white/5">
        {/* Background glow effects */}
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
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-8" 
            dir="rtl"
          >
            {/* Stat 1 */}
            <motion.div 
              variants={itemVariants}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className="relative group p-6 sm:p-8 bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 hover:border-accent-yellow/30 rounded-3xl backdrop-blur-md transition-all duration-300 flex flex-col items-center text-center shadow-lg"
            >
              {/* Card Glow Highlight */}
              <div className="absolute inset-0 bg-gradient-to-br from-accent-yellow/0 via-accent-yellow/0 to-accent-yellow/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-yellow-500/10 border border-yellow-500/20 text-accent-yellow rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 shadow-[0_0_15px_rgba(13,148,136,0.1)]">
                <Users className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <h3 className="text-3xl sm:text-4xl md:text-5xl font-black font-sans bg-clip-text text-transparent bg-gradient-to-r from-accent-yellow to-emerald-400">
                +<AnimatedCounter target={500} />
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
                +<AnimatedCounter target={20} />
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
                +<AnimatedCounter target={10} />
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 font-tajawal font-medium mt-3 leading-relaxed">
                رحلات استكشافية ومغامرات
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
                +<AnimatedCounter target={11} />
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 font-tajawal font-medium mt-3 leading-relaxed">
                شريك نجاح متميز
              </p>
            </motion.div>

            {/* Stat 5 */}
            <motion.div 
              variants={itemVariants}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className="relative group p-6 sm:p-8 bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 hover:border-accent-yellow/30 rounded-3xl backdrop-blur-md transition-all duration-300 flex flex-col items-center text-center shadow-lg"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-accent-yellow/0 via-accent-yellow/0 to-accent-yellow/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="w-12 h-12 sm:w-14 sm:h-14 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                <Eye className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <h3 className="text-3xl sm:text-4xl md:text-5xl font-black font-sans bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-300">
                +<RealVisitorCounter />
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 font-tajawal font-medium mt-3 leading-relaxed">
                زيارات الموقع
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* 5. Mulhim Supervisors Section */}
      <section className="bg-slate-50 py-16 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-2xl mx-auto space-y-4 mb-16"
          >
            <h2 className="text-2xl md:text-3xl font-extrabold text-primary-navy font-tajawal">مشرفو مُلهِم</h2>
            <p className="text-slate-800 text-sl">
              نخبة من الكفاءات المتميزة التي تقود مبادرات وبرامج منصة مُلهم نحو التميز والإبداع.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" dir="rtl">
            {/* Supervisor 1 */}
            <motion.div 
               whileHover={{ y: -5 }}
               className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm text-center flex flex-col items-center gap-4 transition-all duration-300 hover:shadow-md group"
            >
              <div className="w-28 h-28 rounded-full bg-slate-100 overflow-hidden relative border-4 border-white shadow-lg mb-2">
                <Image src="/images/supervaisor1.jpeg" alt="الشيخ باسم عبدالهادي" fill className="object-cover object-top" />
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
               className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm text-center flex flex-col items-center gap-4 transition-all duration-300 hover:shadow-md group"
            >
              <div className="w-28 h-28 rounded-full bg-slate-100 overflow-hidden relative border-4 border-white shadow-lg mb-2">
                <Image src="/images/supervaisor2.jpeg" alt="الاستاذ نواف السيد" fill className="object-cover object-top" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-800 font-tajawal">الأستاذ نواف السيد</h3>
                <p className="text-blue-500 font-bold text-xs">المشرف الإداري</p>
              </div>
              <div className="text-sm text-slate-800 leading-relaxed text-right space-y-3 w-full">
                <ul className="list-disc list-inside space-y-2 text-xs sm:text-sm">
                  <li>مؤسس برنامج ملهم.</li>
                  <li>خبرة تزيد عن ١٠ سنوات في الممارسة التربوية والتعليمية.</li>
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
               className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm text-center flex flex-col items-center gap-4 transition-all duration-300 hover:shadow-md group"
            >
              <div className="w-28 h-28 rounded-full bg-slate-100 overflow-hidden relative border-4 border-white shadow-lg mb-2">
                <Image src="/images/supervaisor3.jpeg" alt="د. إبراهيم طارق محمود" fill className="object-cover object-top" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-slate-800 font-tajawal">د. إبراهيم طارق محمود</h3>
                <p className="text-emerald-500 font-bold text-xs">مشرف التطوير والتدريب</p>
              </div>
              <div className="text-sm text-slate-800 leading-relaxed text-right space-y-3 w-full">
                <ul className="list-disc list-inside space-y-2 text-xs sm:text-sm">
                  <li>عضو هيئة تدريس في جامعة الملك عبدالعزيز.</li>
                  <li>مستشار تربوي.</li>
                  <li>مهتم بتأسيس الكيانات التربوية والتعليمية.</li>
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

      {/* 6. Success Partners Marquee Logos */}
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
              <span>شركة هاتريك</span>
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.1, y: -2 }}
              className="flex items-center gap-2 font-tajawal font-black text-slate-400 hover:text-accent-yellow text-xl tracking-wider select-none cursor-pointer transition-colors duration-300"
            >
              <Award className="w-6 h-6 text-slate-350 group-hover:text-accent-yellow" />
              <span>مؤسسة سُرج</span>
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.1, y: -2 }}
              className="flex items-center gap-2 font-tajawal font-black text-slate-400 hover:text-accent-yellow text-xl tracking-wider select-none cursor-pointer transition-colors duration-300"
            >
              <Award className="w-6 h-6 text-slate-350 group-hover:text-accent-yellow" />
              <span>جامع رافع الغامدي</span>
            </motion.div>
            <motion.div 
              whileHover={{ scale: 1.1, y: -2 }}
              className="flex items-center gap-2 font-tajawal font-black text-slate-400 hover:text-accent-yellow text-xl tracking-wider select-none cursor-pointer transition-colors duration-300"
            >
              <Award className="w-6 h-6 text-slate-350 group-hover:text-accent-yellow" />
              <span>مدارس الأندلس</span>
            </motion.div>
          </div>
        </div>
      </section>

    </div>
  );
}
