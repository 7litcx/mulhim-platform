"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { useRouter } from "next/navigation";
import { normalizeLink } from "@/utils/link";
import QuickRegistrationModal from "@/components/shared/QuickRegistrationModal";

import {
  Sparkles, Calendar, Heart, ShieldAlert, CheckCircle,
  Plus, Users, Trophy, Award, MapPin
} from "lucide-react";
import { urlFor } from "@/sanity/lib/image";
import { motion, AnimatePresence } from "framer-motion";

const MotionLink = motion(Link);

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08
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
const resolveImage = (img: any) => {
  if (!img) return "/placeholder.jpg";
  if (typeof img === "string") return img;
  if (typeof img === "object") {
    try {
      return urlFor(img).url();
    } catch (e) {
      return "/placeholder.jpg";
    }
  }
  return "/placeholder.jpg";
};

interface ProgramsClientProps {
  sanityPrograms: any[];
  sanityCategories?: any[];
  sanityHeroBanners?: any[];
}

export default function ProgramsClient({
  sanityPrograms,
  sanityCategories = [],
  sanityHeroBanners = []
}: ProgramsClientProps) {
  const { programs: contextPrograms, registerUser, currentUser, registrations } = useApp();
  const router = useRouter();

  // Gender tab state
  const [activeGender, setActiveGender] = useState<"girls" | "boys">("boys");

  // Category sub-filters
  const [activeCategory, setActiveCategory] = useState<string>("all");

  const [selectedProgram, setSelectedProgram] = useState<any | null>(null);
  const [showRegModal, setShowRegModal] = useState(false);

  // Combine Sanity data with local fallback
  const displayPrograms = sanityPrograms.length > 0 ? sanityPrograms : contextPrograms;

  // Resolve dynamic Programs page banner from Sanity
  const programsBanner = sanityHeroBanners.find(b => b.page === "programs");
  const programsHero = programsBanner ? {
    title: programsBanner.title,
    subtitle: programsBanner.description,
    image: resolveImage(programsBanner.images?.[0] || programsBanner.image),
    btnText: programsBanner.btnText,
    link: programsBanner.link
  } : {
    title: "برامج الفتيات والبنين والأنشطة الشبابية",
    subtitle: "ورش عمل تطبيقية، بطولات رياضية، برامج بناء مهارات ومخيمات استكشافية مصممة لبناء جيل قيادي مبدع ومتمكن.",
    image: "/images/hero-academies.png",
    btnText: "تعرف على البرامج",
    link: ""
  };

  // Filter logic based on Gender and selected sub-category
  const filteredPrograms = displayPrograms.filter((p: any) => {
    const matchGender = p.target === activeGender || p.target === "general";

    // Support both Sanity category (object with slug/id) and static category (string)
    const categoryId = p.category?.slug?.current || p.category;
    const matchCategory = activeCategory === "all" || categoryId === activeCategory;
    return matchGender && matchCategory;
  });



  // Get categories list from sanityCategories, with dynamic and hardcoded fallback
  let categoriesList: { id: string; name: string }[] = [];

  if (sanityCategories && sanityCategories.length > 0) {
    const targetCategories = sanityCategories
      .filter((cat: any) => cat.target === activeGender || cat.target === "general")
      .map((cat: any) => ({
        id: cat.slug?.current || cat._id,
        name: cat.title
      }));
    categoriesList = [{ id: "all", name: "الكل" }, ...targetCategories];
  } else {
    const programsForGender = displayPrograms.filter((p: any) => p.target === activeGender || p.target === "general");
    const uniqueCategories = Array.from(
      new Map(
        programsForGender
          .map((p: any) => {
            if (p.category && typeof p.category === "object") {
              return { id: p.category.slug?.current || p.category._id, name: p.category.title };
            } else if (typeof p.category === "string") {
              return { id: p.category, name: p.category };
            }
            return null;
          })
          .filter((cat): cat is { id: string; name: string } => cat !== null && !!cat.id && !!cat.name)
          .map(cat => [cat.id, cat])
      ).values()
    );

    categoriesList = uniqueCategories.length > 0
      ? [{ id: "all", name: "الكل" }, ...uniqueCategories]
      : activeGender === "girls"
        ? [
          { id: "all", name: "الكل" },
          { id: "developmental", name: "البرامج التطويرية" },
          { id: "skills", name: "الأنشطة المهارية" },
          { id: "sports", name: "الأنشطة الرياضية والترفيهية" }
        ]
        : [
          { id: "all", name: "الكل" },
          { id: "youth", name: "البرامج الشبابية" },
          { id: "tournaments", name: "البطولات" },
          { id: "seasonal", name: "الفعاليات الموسمية" }
        ];
  }

  const handleGenderChange = (gender: "girls" | "boys") => {
    setActiveGender(gender);
    setActiveCategory("all");
  };

  return (
    <div className="space-y-8 pb-10">

      {/* 1. Hero Section */}
      <section className="relative min-h-[380px] sm:min-h-[450px] md:min-h-[500px] flex items-center py-12 sm:py-12 md:py-16 bg-slate-900 overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <motion.img
            initial={{ scale: 1.15, opacity: 0 }}
            animate={{ scale: 1.05, opacity: 0.65 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            src={programsHero.image}
            alt={programsHero.title}
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent md:bg-gradient-to-l md:from-slate-950/95 md:via-slate-950/30 md:to-transparent" />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center text-right text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-4 sm:space-y-6 max-w-2xl"
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-accent-yellow/20 text-accent-yellow rounded-full text-[10px] sm:text-xs font-bold border border-accent-yellow/30 self-start">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
              برامج مميزة وفعاليات حية
            </span>
            <h1 className="text-xl sm:text-3xl md:text-4xl font-black font-tajawal leading-tight">
              {programsHero.title}
            </h1>
            {programsHero.subtitle && (
              <p className="text-xs sm:text-sm text-slate-300 font-light leading-relaxed">
                {programsHero.subtitle}
              </p>
            )}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 justify-start w-full sm:w-auto">
              {programsHero.btnText && (
                programsHero.link && normalizeLink(programsHero.link) !== "/programs" && !programsHero.link.startsWith("#") ? (
                  <MotionLink
                    href={normalizeLink(programsHero.link)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full sm:w-auto px-5 sm:px-6 py-2.5 sm:py-3 bg-accent-teal hover:bg-primary-teal text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg transition-all duration-300 flex items-center justify-center cursor-pointer"
                  >
                    {programsHero.btnText}
                  </MotionLink>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      const el = document.getElementById("programs-tabs");
                      el?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="w-full sm:w-auto px-5 sm:px-6 py-2.5 sm:py-3 bg-accent-teal hover:bg-primary-teal text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg transition-all duration-300 flex items-center justify-center"
                  >
                    {programsHero.btnText}
                  </motion.button>
                )
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. Main Gender Tabs */}
      <section id="programs-tabs" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center mb-10">
          <div className="flex bg-slate-100 p-2 rounded-2xl border border-slate-200 w-full max-w-lg">
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => handleGenderChange("girls")}
              className={`flex-1 py-3.5 rounded-xl text-sm font-extrabold transition-all duration-300 ${activeGender === "girls"
                  ? "bg-white text-accent-teal shadow-md scale-100"
                  : "text-slate-500 hover:text-slate-800"
                }`}
            >
              برامج الفتيات
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => handleGenderChange("boys")}
              className={`flex-1 py-3.5 rounded-xl text-sm font-extrabold transition-all duration-300 ${activeGender === "boys"
                  ? "bg-white text-accent-teal shadow-md scale-100"
                  : "text-slate-500 hover:text-slate-800"
                }`}
            >
              برامج البنين
            </motion.button>
          </div>
        </div>

        {/* Category Tabs Sub-Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categoriesList.map((cat, idx) => (
            <motion.button
              key={`${cat.id}-${idx}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-6 py-2.5 rounded-full text-xs font-bold transition-all duration-300 ${activeCategory === cat.id
                  ? "bg-teal-50 text-accent-teal border border-teal-200"
                  : "bg-white border border-slate-200 text-slate-500 hover:text-slate-800 hover:border-slate-300"
                }`}
            >
              {cat.name}
            </motion.button>
          ))}
        </div>

        {/* Programs Listing Grid */}
        {filteredPrograms.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16 bg-slate-50 rounded-3xl border border-slate-100 max-w-2xl mx-auto space-y-4"
          >
            <div className="w-14 h-14 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
              <Award className="w-6 h-6 animate-bounce" />
            </div>
            <h3 className="font-bold text-slate-800">لا توجد برامج متاحة حالياً في هذا القسم</h3>
            <p className="text-xs text-slate-400">تابعنا قريباً، نقوم بإضافة برامج وأنشطة ممتازة بشكل مستمر!</p>
          </motion.div>
        ) : (
          <motion.div
            key={`${activeGender}-${activeCategory}`}
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filteredPrograms.map((program: any) => {
              const programSlug = program.slug?.current || program.id;
              const programLink = program.slug?.current ? `/programs/${program.slug.current}` : `/programs?id=${program.id}`;
              const programImg = resolveImage(program.image || program.images?.[0]);
              const programDate = program.date || program.startDate || "";

              return (
                <motion.div
                  key={program.id || program._id}
                  variants={itemVariants}
                  whileHover={{ y: -8, scale: 1.01 }}
                  className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col group text-right"
                >
                  {/* Program Banner */}
                  <div className="h-56 w-full overflow-hidden relative">
                    <Link href={programLink}>
                      <img
                        src={programImg}
                        alt={program.title}
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-all duration-500"
                      />
                    </Link>
                    <span className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-sm text-white px-3 py-1 rounded-full text-[10px] font-bold z-20">
                      {program.categoryName || program.category?.title || "برنامج مميز"}
                    </span>
                    <span className={`absolute top-4 left-4 text-white text-[10px] font-bold px-3 py-1 rounded-full ${program.target === "girls" ? "bg-accent-teal/90" : program.target === "boys" ? "bg-accent-teal/90" : "bg-yellow-600/90"
                      }`}>
                      {program.target === "girls" ? "للفتيات" : program.target === "boys" ? "للبنين" : "عام للجميع"}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <Link href={programLink}>
                        <h3 className="font-bold text-slate-800 text-sm sm:text-base group-hover:text-accent-yellow transition-all duration-200 line-clamp-2 leading-snug">
                          {program.title}
                        </h3>
                      </Link>
                      <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5 justify-end">
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
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
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
                          className={`px-4 py-2.5 text-white rounded-xl text-xs font-bold transition-all duration-300 shadow-md hover:shadow-lg ${activeGender === "girls"
                              ? "bg-accent-teal hover:bg-primary-teal"
                              : "bg-accent-teal hover:bg-primary-teal"
                            }`}
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
        )}
      </section>

      {/* 3. Program Registration Modal */}
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
