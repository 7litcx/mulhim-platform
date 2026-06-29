"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { useRouter } from "next/navigation";
import { normalizeLink } from "@/utils/link";
import QuickRegistrationModal from "@/components/shared/QuickRegistrationModal";

import {
  GraduationCap, ChevronDown
} from "lucide-react";
import { urlFor } from "@/sanity/lib/image";
import { motion, AnimatePresence } from "framer-motion";

const MotionLink = motion(Link);

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
} as const;


// Helper to resolve images
const resolveImage = (img: any, width = 600, height = 400) => {
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

interface AcademiesClientProps {
  sanityAcademies: any[];
  sanityFAQs: any[];
  sanityHeroBanners?: any[];
}

export default function AcademiesClient({
  sanityAcademies,
  sanityFAQs,
  sanityHeroBanners = []
}: AcademiesClientProps) {
  const { academies: contextAcademies, registerUser, currentUser, registrations } = useApp();
  const router = useRouter();

  const [selectedAcademy, setSelectedAcademy] = useState<any | null>(null);
  const [showRegModal, setShowRegModal] = useState(false);


  // FAQs Accordion State
  const [faqOpenIdx, setFaqOpenIdx] = useState<number | null>(null);

  const toggleFaq = (idx: number) => {
    setFaqOpenIdx(faqOpenIdx === idx ? null : idx);
  };



  // Resolve dynamic Academies page banner from Sanity
  const academiesBanner = sanityHeroBanners.find(b => b.page === "academies");
  const academiesHero = academiesBanner ? {
    title: academiesBanner.title,
    subtitle: academiesBanner.description,
    image: resolveImage(academiesBanner.images?.[0] || academiesBanner.image, 1600, 800),
    btnText: academiesBanner.btnText,
    link: academiesBanner.link
  } : {
    title: "أكاديميات مُلهم: حيث تُصقل المواهب",
    subtitle: "منصة تدريب احترافية تهدف لتمكين الشباب في مجالات الرياضة، القيادة، الفنون والمهارات الإبداعية بمناهج عملية وخطط مصممة خصيصاً على أيدي مدربين متميزين.",
    image: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&q=80&w=1200",
    btnText: "عرض الأكاديميات",
    link: ""
  };

  const defaultFaqList = [
    {
      q: "ما هي مدة الاشتراكات في الأكاديميات؟",
      a: "تتراوح الاشتراكات بين شهرين إلى ثلاثة أشهر متتالية، تشمل لقاءات عملية مكثفة أسبوعياً، بالإضافة إلى حفل تخرج وشهادة معتمدة لإتمام الدورة."
    },
    {
      q: "هل تتوفر حصص تجريبية قبل التسجيل الفعلي؟",
      a: "نعم، نوفر حصة تجريبية مجانية لجميع المسجلين الجدد في الأكاديميات الرياضية والفنية للوقوف على مستوى المشترك والتأكد من ملاءمة البرنامج لرغبته."
    },
    {
      q: "كيف يتم تحديد الفئة العمرية المناسبة للأبناء؟",
      a: "يتم تصنيف المجموعات بناءً على الأعمار الموضحة في تفاصيل كل أكاديمية. وفي حال وجود تفاوت بسيط في المستوى، يتم عمل تقييم أولي في الأسبوع الأول لإعادة توزيع الطلاب مع المجموعة الأنسب."
    },
    {
      q: "هل توجد وسائل مواصلات أو نقل للأكاديميات؟",
      a: "كانت وما زالت رغبتنا تيسير المواصلات. حالياً، نعتمد على حضور أولياء الأمور للمشتركين الصغار لضمان المتابعة والتواصل المباشر مع المدربين، ونسعى لتوفير باصات نقل مخصصة في القريب العاجل."
    }
  ];

  const displayFAQs = sanityFAQs.length > 0
    ? sanityFAQs.map((f: any) => ({ q: f.title, a: f.description }))
    : defaultFaqList;

  const displayAcademies = (sanityAcademies.length > 0 ? sanityAcademies : contextAcademies).map((acad: any) => {
    if (acad._id) {
      const firstTutor = acad.tutors?.[0];
      return {
        ...acad,
        tutor: firstTutor ? {
          name: firstTutor.name,
          role: firstTutor.role,
          image: firstTutor.avatar,
        } : null
      };
    } else {
      return {
        ...acad,
        tutor: acad.coachName ? {
          name: acad.coachName,
          role: acad.coachTitle,
          image: acad.coachImage,
          bio: acad.coachBio
        } : null
      };
    }
  });

  // Extract all unique tutors from displayAcademies
  const allTutorsList: any[] = [];
  const seenTutorNames = new Set<string>();

  displayAcademies.forEach((acad: any) => {
    if (acad._id && acad.tutors && acad.tutors.length > 0) {
      acad.tutors.forEach((t: any) => {
        if (t && t.name && !seenTutorNames.has(t.name)) {
          seenTutorNames.add(t.name);
          allTutorsList.push({
            name: t.name,
            role: t.role,
            image: t.avatar,
            bio: ""
          });
        }
      });
    } else if (acad.tutor) {
      if (!seenTutorNames.has(acad.tutor.name)) {
        seenTutorNames.add(acad.tutor.name);
        allTutorsList.push(acad.tutor);
      }
    }
  });

  return (
    <div className="space-y-8 pb-10">

      {/* 1. Hero Section */}
      <section className="relative min-h-[380px] sm:min-h-[450px] md:min-h-[500px] flex items-center py-12 sm:py-12 md:py-16 bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <motion.img
            initial={{ scale: 1.15, opacity: 0 }}
            animate={{ scale: 1.05, opacity: 0.35 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            src={academiesHero.image}
            alt={academiesHero.title}
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent" />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center text-right text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-4 sm:space-y-6 max-w-4xl"
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-accent-yellow/20 text-accent-yellow rounded-full text-xs font-bold border border-accent-yellow/30 self-start">
              <GraduationCap className="w-3.5 h-3.5" />
              استثمر في مستقبلك ومواهبك
            </span>
            <h1 className="text-3xl md:text-5xl font-black font-tajawal leading-tight">
              {academiesHero.title}
            </h1>
            {academiesHero.subtitle && (
              <p className="text-sm md:text-base text-slate-300 font-light leading-relaxed">
                {academiesHero.subtitle}
              </p>
            )}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 justify-start w-full sm:w-auto">
              {academiesHero.btnText && (
                academiesHero.link && normalizeLink(academiesHero.link) !== "/academies" && !academiesHero.link.startsWith("#") ? (
                  <MotionLink
                    href={normalizeLink(academiesHero.link)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full sm:w-auto px-6 py-3 bg-accent-teal hover:bg-primary-teal text-white rounded-xl text-xs font-bold shadow-lg transition-all duration-300 flex items-center justify-center cursor-pointer"
                  >
                    {academiesHero.btnText}
                  </MotionLink>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      const el = document.getElementById("academies-list");
                      el?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="w-full sm:w-auto px-6 py-3 bg-accent-teal hover:bg-primary-teal text-white rounded-xl text-xs font-bold shadow-lg transition-all duration-300 flex items-center justify-center"
                  >
                    {academiesHero.btnText}
                  </motion.button>
                )
              )}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  const el = document.getElementById("faq-section");
                  el?.scrollIntoView({ behavior: "smooth" });
                }}
                className="w-full sm:w-auto px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl text-xs font-bold backdrop-blur-sm transition-all duration-300 flex items-center justify-center"
              >
                الأسئلة الشائعة
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. Academies Grid Listing */}
      <section id="academies-list" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto space-y-3 mb-16"
        >
          <span className="text-xl font-bold text-accent-yellow tracking-widest uppercase block">برامجنا الاحترافية</span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-primary-navy font-tajawal">أكاديمياتنا المتخصصة</h2>
          <p className="text-slate-800 text-sl">
            انضم إلى الأكاديمية التي تتماشى مع طموحاتك ومواهبك لتبدأ رحلة التعلم والتطور مع مدربينا.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-2 gap-10"
        >
          {displayAcademies.map((acad: any) => {
            const acadLink = acad.slug?.current ? `/academies/${acad.slug.current}` : `/academies?id=${acad.id}`;
            const acadImg = resolveImage(acad.image || acad.images?.[0]);

            return (
              <motion.div
                key={acad.id || acad._id}
                variants={itemVariants}
                whileHover={{ y: -8, scale: 1.01 }}
                className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col md:flex-row group text-right"
              >
                <div className="md:w-2/5 h-64 md:h-auto overflow-hidden relative">
                  <Link href={acadLink}>
                    <img
                      src={acadImg}
                      alt={acad.title}
                      className="w-full h-full object-cover object-top group-hover:scale-105 transition-all duration-500"
                    />
                  </Link>
                  <span className="absolute z-20 top-4 right-4 bg-slate-900/80 backdrop-blur-sm text-accent-yellow px-3 py-1 rounded-full text-[10px] font-bold">
                    {acad.ageGroup || acad.targetAge || "جميع الأعمار"}
                  </span>
                </div>

                {/* Info Block */}
                <div className="md:w-3/5 p-6 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <Link href={acadLink}>
                      <h3 className="font-extrabold text-slate-800 text-lg group-hover:text-accent-yellow transition-all duration-200">
                        {acad.title}
                      </h3>
                    </Link>
                    {(acad.schedule || acad.startDate) && (
                      <p className="text-xs text-slate-405 font-medium leading-relaxed">
                        {acad.schedule || acad.startDate || ""}
                      </p>
                    )}
                    <p className="text-sm text-slate-800 leading-relaxed line-clamp-3 pt-1">
                      {acad.description}
                    </p>
                    {acad.tutor && (
                      <div className="flex items-center gap-2 pt-2 text-[11px] text-slate-405 justify-end">
                        <span className="text-[10px]">{acad.tutor.role || "مدرب معتمد"}</span>
                        <span>•</span>
                        <span className="font-bold text-slate-700">{acad.tutor.name}</span>
                        <span className="font-semibold">المدرب:</span>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                    {acad.registrationOpen === false ? null : typeof acad.price !== "undefined" && acad.price !== null ? (
                      <span className="text-accent-yellow font-extrabold text-base">
                        {acad.price === 0 ? "مجاناً" : (
                          <>
                            {acad.price} ر.س <span className="text-[10px] text-slate-400 font-medium">/ شهرين</span>
                          </>
                        )}
                      </span>
                    ) : <span />}
                    <div className="flex gap-2">
                      <MotionLink
                        href={acadLink}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer text-center ${
                          acad.registrationOpen === false 
                            ? "bg-accent-teal hover:bg-primary-teal text-white px-5" 
                            : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                        }`}
                      >
                        التفاصيل
                      </MotionLink>
                      {acad.registrationOpen !== false && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            if (!currentUser) {
                              router.push('/register?type=academy&name=' + encodeURIComponent(acad.title));
                              return;
                            }
                            setSelectedAcademy(acad);
                            setShowRegModal(true);
                          }}
                          className="px-4 py-2.5 bg-accent-teal hover:bg-primary-teal text-white rounded-xl text-xs font-bold transition-all duration-300"
                        >
                          سجل الآن
                        </motion.button>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* 3. Trainers Section */}
      <section className="bg-slate-50 py-16 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-4 mb-16">
            <h2 className="text-2xl md:text-3xl font-extrabold text-primary-navy font-tajawal">تعرف على مدربينا</h2>
            <p className="text-slate-800 text-sl">
              نخبة من المدربين والخبراء المعتمدين محلياً ودولياً لتوجيهك ودعمك في كل مرحلة من رحلة تمكينك.
            </p>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
          >
            {allTutorsList.map((tutor: any, idx: number) => {
              const tutorImg = resolveImage(tutor.image, 200, 200);

              return (
                <motion.div
                  key={tutor.name || `tutor-${idx}`}
                  variants={itemVariants}
                  whileHover={{ y: -6, scale: 1.02 }}
                  className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm text-center space-y-4 group hover:shadow-md transition-all duration-300"
                >
                  <div className="w-24 h-24 rounded-full overflow-hidden mx-auto shadow-inner relative">
                    <img
                      src={tutorImg}
                      alt={tutor.name}
                      className="w-full h-full object-contain object-top group-hover:scale-105 transition-all duration-300"
                    />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-800 text-sm">{tutor.name}</h4>
                    <span className="text-[10px] text-accent-yellow font-semibold">{tutor.role || "مدرب معتمد"}</span>
                  </div>
                  {tutor.bio && (
                    <p className="text-[11px] text-slate-405 leading-relaxed line-clamp-3">
                      {tutor.bio}
                    </p>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* 4. FAQs accordion section */}
      <section id="faq-section" className="max-w-4xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-4 mb-12"
        >
          <h2 className="text-2xl md:text-3xl font-extrabold text-primary-navy font-tajawal">الأسئلة الشائعة في الأكاديميات</h2>
          <p className="text-slate-800 text-sl">كل ما تود معرفته عن نظام الاشتراكات والمواعيد وطرق الدفع والتدريب.</p>
        </motion.div>

        <div className="space-y-4 text-right">
          {displayFAQs.map((faq: any, idx: number) => {
            const isOpen = faqOpenIdx === idx;
            return (
              <motion.div
                key={faq.q || `faq-${idx}`}
                layout
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full px-6 py-5 flex justify-between items-center text-right font-bold text-slate-800 text-xs sm:text-sm hover:text-accent-yellow transition-all duration-200"
                >
                  <ChevronDown className={`w-4 h-4 text-slate-455 transition-transform duration-300 ${isOpen ? "rotate-180 text-accent-yellow" : ""}`} />
                  <span>{faq.q}</span>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-5 pt-1 text-xs text-slate-505 leading-relaxed border-t border-slate-50">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* 5. Quick Registration Modal Form */}
      <QuickRegistrationModal
        isOpen={showRegModal}
        onClose={() => {
          setShowRegModal(false);
          setSelectedAcademy(null);
        }}
        targetItem={selectedAcademy}
        targetType="academy"
      />

    </div>
  );
}
