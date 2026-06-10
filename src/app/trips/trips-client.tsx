"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { useRouter } from "next/navigation";
import { normalizeLink } from "@/utils/link";
import QuickRegistrationModal from "@/components/shared/QuickRegistrationModal";

import {
  Compass, MapPin, Calendar, Heart, ArrowLeft, Star,
  CheckCircle, Plus, Info, Check, MessageSquare, ShieldCheck, Award
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
const resolveImage = (img: any, width = 800, height = 500) => {
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

interface TripsClientProps {
  sanityTrips: any[];
  sanityTestimonials: any[];
  sanityCategories?: any[];
  sanityHeroBanners?: any[];
}

export default function TripsClient({
  sanityTrips,
  sanityTestimonials,
  sanityCategories = [],
  sanityHeroBanners = []
}: TripsClientProps) {
  const { trips: contextTrips, registerUser, currentUser, registrations } = useApp();
  const router = useRouter();

  // Filter states
  const [filterType, setFilterType] = useState<string>("all");
  const [selectedTrip, setSelectedTrip] = useState<any | null>(null);

  // Custom suggestion state
  const [suggestion, setSuggestion] = useState({ title: "", description: "" });
  const [isSuggested, setIsSuggested] = useState(false);

  // Quick registration state
  const [showRegModal, setShowRegModal] = useState(false);

  // Combine Sanity data with local fallback
  const displayTrips = sanityTrips.length > 0 ? sanityTrips : contextTrips;

  // Resolve dynamic Trips page banner from Sanity
  const tripsBanner = sanityHeroBanners.find(b => b.page === "trips");
  const tripsHero = tripsBanner ? {
    title: tripsBanner.title,
    subtitle: tripsBanner.description,
    image: resolveImage(tripsBanner.images?.[0] || tripsBanner.image, 1600, 800),
    btnText: tripsBanner.btnText,
    link: tripsBanner.link
  } : {
    title: "رحلات مُلهم: مغامرات تصنع الأثر",
    subtitle: "الشباب، العلم، الأثر والمغامرة. وجوه بحاجة لبعضها البعض في كل خطوة نخطوها معاً. استعد لتجربة استثنائية تبني شخصيتك.",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1200",
    btnText: "استكشف الرحلات",
    link: ""
  };

  // Get categories list from sanityCategories, with fallback to hardcoded list
  let categoriesList: { id: string; name: string }[] = [];

  if (sanityCategories && sanityCategories.length > 0) {
    const targetCategories = sanityCategories
      .filter((cat: any) => cat.target === "trip")
      .map((cat: any) => ({
        id: cat.slug?.current || cat._id,
        name: cat.title
      }));
    categoriesList = [{ id: "all", name: "الكل" }, ...targetCategories];
  } else {
    categoriesList = [
      { id: "all", name: "الكل" },
      { id: "adventure", name: "مغامرة" },
      { id: "spiritual", name: "إيمانية" },
      { id: "recreational", name: "ترفيهية" }
    ];
  }

  const filteredTrips = filterType === "all"
    ? displayTrips
    : displayTrips.filter((t: any) => {
      // Resolve category ID from Sanity category reference, or typeName, or local type
      const catId = t.category?.slug?.current || t.category?._id || t.type;

      // If it matches exactly
      if (catId === filterType) return true;

      // Fallback for static/Arabic matching:
      const selectedCat = categoriesList.find(c => c.id === filterType);
      if (selectedCat) {
        const tripTypeName = t.typeName || t.type;
        return tripTypeName === selectedCat.name || tripTypeName === selectedCat.id;
      }

      return false;
    });

  const handleSuggest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (suggestion.title.trim() && suggestion.description.trim()) {
      try {
        const response = await fetch("/api/send-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: "suggestion",
            data: suggestion,
          }),
        });

        if (response.ok) {
          setIsSuggested(true);
          setSuggestion({ title: "", description: "" });
          setTimeout(() => setIsSuggested(false), 5000);
        } else {
          console.error("Failed to submit suggestion via API");
          // Fallback
          setIsSuggested(true);
          setSuggestion({ title: "", description: "" });
          setTimeout(() => setIsSuggested(false), 5000);
        }
      } catch (err) {
        console.error("Error submitting suggestion:", err);
        // Fallback
        setIsSuggested(true);
        setSuggestion({ title: "", description: "" });
        setTimeout(() => setIsSuggested(false), 5000);
      }
    }
  };



  const gearList = [
    "حقيبة ظهر مريحة ومتينة",
    "ملابس ملائمة ومقاومة للرياح والحرارة",
    "حذاء هايكنج أو حذاء رياضي مريح ومناسب للمشي الطويل",
    "عبوة ماء حافظة للحرارة (مطارة ملهم)",
    "نظارات شمسية وواقي من أشعة الشمس الكثيفة",
    "كاميرا أو هاتف لتوثيق اللحظات الملهمة"
  ];


  return (
    <div className="pb-10">

      {/* 1. Hero Section */}
      <section className="relative min-h-[380px] sm:min-h-[450px] md:min-h-[500px] flex items-center py-12 sm:py-12 md:py-16 bg-slate-900 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <motion.img
            initial={{ scale: 1.15, opacity: 0 }}
            animate={{ scale: 1.05, opacity: 0.65 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            src={tripsHero.image}
            alt={tripsHero.title}
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent md:bg-gradient-to-l md:from-slate-950/95 md:via-slate-950/30 md:to-transparent" />
        </div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center text-right text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-4 sm:space-y-6 max-w-3xl"
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-accent-yellow/20 text-accent-yellow rounded-full text-[10px] sm:text-xs font-bold border border-accent-yellow/30 self-start">
              <Compass className="w-3.5 h-3.5 animate-spin-slow" />
              استكشف العالم معنا
            </span>
            <h1 className="text-xl sm:text-3xl md:text-5xl font-black font-tajawal leading-tight">
              {tripsHero.title}
            </h1>
            {tripsHero.subtitle && (
              <p className="text-xs sm:text-sm md:text-base text-slate-300 font-light leading-relaxed">
                {tripsHero.subtitle}
              </p>
            )}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 justify-start w-full sm:w-auto">
              {tripsHero.btnText && (
                tripsHero.link && normalizeLink(tripsHero.link) !== "/trips" && !tripsHero.link.startsWith("#") ? (
                  <MotionLink
                    href={normalizeLink(tripsHero.link)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full sm:w-auto px-5 sm:px-6 py-2.5 sm:py-3 bg-accent-teal hover:bg-primary-teal text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg transition-all duration-300 flex items-center justify-center cursor-pointer"
                  >
                    {tripsHero.btnText}
                  </MotionLink>
                ) : (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      const el = document.getElementById("trips-list");
                      el?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="w-full sm:w-auto px-5 sm:px-6 py-2.5 sm:py-3 bg-accent-teal hover:bg-primary-teal text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg transition-all duration-300 flex items-center justify-center"
                  >
                    {tripsHero.btnText}
                  </motion.button>
                )
              )}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  const el = document.getElementById("suggest-section");
                  el?.scrollIntoView({ behavior: "smooth" });
                }}
                className="w-full sm:w-auto px-5 sm:px-6 py-2.5 sm:py-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl text-xs sm:text-sm font-bold backdrop-blur-sm transition-all duration-300 flex items-center justify-center"
              >
                اقترح وجهة
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 2. Trip Categories / Types Grid */}
      <section className="bg-primary-teal py-16 w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-2xl mx-auto space-y-3 mb-12"
          >
            <h2 className="text-2xl md:text-3xl font-extrabold text-white font-tajawal">أنواع رحلاتنا</h2>
            <p className="text-teal-50 text-sl">نصنف رحلاتنا لتلبي تطلعاتك وتساعدك على صياغة اهتماماتك المفضلة.</p>
          </motion.div>

          <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 text-right"
        >
          {/* Card 1 */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -6 }}
            className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm text-center flex flex-col items-center space-y-3 group hover:shadow-md transition-all duration-300"
          >
            <div className="w-14 h-14 bg-primary-teal/10 text-primary-teal rounded-2xl flex items-center justify-center mb-2 group-hover:scale-110 transition-all duration-300">
              <Compass className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-slate-800 text-base">رحلات مغامرة</h3>
            <p className="text-sm text-slate-800 leading-relaxed max-w-xs text-center">
              تحديات، هايكنج، واستكشاف في الطبيعة الجبلية والصحراوية لبناء الصلابة والاعتماد على الذات.
            </p>
          </motion.div>
          {/* Card 2 */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -6 }}
            className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm text-center flex flex-col items-center space-y-3 group hover:shadow-md transition-all duration-300"
          >
            <div className="w-14 h-14 bg-primary-teal/10 text-primary-teal rounded-2xl flex items-center justify-center mb-2 group-hover:scale-110 transition-all duration-300">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-slate-800 text-base">رحلات إيمانية</h3>
            <p className="text-sm text-slate-800 leading-relaxed max-w-xs text-center">
              تجربة روحانية وزيارة الحرمين الشريفين تشمل دروس التوعية وتعزيز الجوانب الإيمانية للشباب.
            </p>
          </motion.div>
          {/* Card 3 */}
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -6 }}
            className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm text-center flex flex-col items-center space-y-3 group hover:shadow-md transition-all duration-300"
          >
            <div className="w-14 h-14 bg-primary-teal/10 text-primary-teal rounded-2xl flex items-center justify-center mb-2 group-hover:scale-110 transition-all duration-300">
              <Heart className="w-7 h-7" />
            </div>
            <h3 className="font-bold text-slate-800 text-base">رحلات ترفيهية</h3>
            <p className="text-sm text-slate-800 leading-relaxed max-w-xs text-center">
              أنشطة رياضية بحرية، ألعاب شاطئية وفعاليات جماعية ترفيهية ممتعة تعزز الصداقات والألفة.
            </p>
          </motion.div>
        </motion.div>
        </div>
      </section>

      {/* 3. Current Trips Listing & Details Modal */}
      <section id="trips-list" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-2 text-right"
          >
            <h2 className="text-2xl md:text-3xl font-extrabold text-primary-navy font-tajawal">الرحلات الحالية</h2>
            <p className="text-slate-800 text-sl">اختر رحلتك المفضلة وسجل فوراً لتضمن مقعدك في دفعتنا القادمة.</p>
          </motion.div>

          {/* Filter Bar */}
          <div className="flex flex-wrap gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200 self-start">
            {categoriesList.map((cat) => {
              return (
                <motion.button
                  key={cat.id}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setFilterType(cat.id)}
                  className={`px-5 py-2 rounded-lg text-xs font-bold transition-all duration-300 ${filterType === cat.id
                      ? "bg-white text-accent-yellow shadow-sm"
                      : "text-slate-500 hover:text-slate-800"
                    }`}
                >
                  {cat.name}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Trips Grid */}
        <motion.div
          key={filterType}
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {filteredTrips.map((trip: any) => {
            const tripSlug = trip.slug?.current || trip.id;
            const tripLink = trip.slug?.current ? `/trips/${trip.slug.current}` : `/trips?id=${trip.id}`;
            const tripImg = resolveImage(trip.image || trip.images?.[0]);
            const tripDate = trip.date || trip.startDate || "";

            return (
              <motion.div
                key={trip.id || trip._id}
                variants={itemVariants}
                whileHover={{ y: -8, scale: 1.01 }}
                className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col group text-right"
              >
                <div className="h-56 w-full overflow-hidden relative">
                  {trip.registrationOpen !== false ? (
                    <Link href={tripLink}>
                      <img
                        src={tripImg}
                        alt={trip.title}
                        className="w-full h-full object-cover object-top group-hover:scale-105 transition-all duration-500"
                      />
                    </Link>
                  ) : (
                    <img
                      src={tripImg}
                      alt={trip.title}
                      className="w-full h-full object-cover object-top opacity-80"
                    />
                  )}
                  <span className="absolute z-20 top-4 right-4 bg-slate-900/80 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-bold">
                    {trip.typeName || trip.type}
                  </span>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
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
                      {trip.location && trip.registrationOpen !== false && (
                        <span className="flex items-center gap-1">
                          <span>{trip.location}</span>
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        </span>
                      )}
                      {tripDate && trip.registrationOpen !== false && (
                        <span className="flex items-center gap-1">
                          <span>{tripDate}</span>
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-slate-800 leading-relaxed line-clamp-2 pt-2">
                      {trip.description}
                    </p>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-slate-50">
                    {trip.registrationOpen === false ? null : typeof trip.price !== "undefined" && trip.price !== null ? (
                      <div>
                        <span className="text-[10px] text-slate-400 block font-medium">الرسوم المطلوبة</span>
                        <span className="text-accent-yellow font-extrabold text-base">{trip.price === 0 ? "مجاناً" : `${trip.price} ر.س`}</span>
                      </div>
                    ) : <div />}
                    <div className="flex gap-2">
                      {trip.registrationOpen !== false && (
                        <MotionLink
                          href={tripLink}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer"
                        >
                          التفاصيل
                        </MotionLink>
                      )}
                      {trip.registrationOpen !== false && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            if (!currentUser) {
                              router.push('/register?type=trip&name=' + encodeURIComponent(trip.title));
                              return;
                            }
                            setSelectedTrip(trip);
                            setShowRegModal(true);
                          }}
                          className="px-4 py-2.5  bg-accent-teal hover:bg-primary-teal text-white rounded-xl text-xs font-bold transition-all duration-300 shadow-md hover:shadow-lg"
                        >
                          حجز سريع
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

      {/* 4. Suggest next Trip Section */}
      <section id="suggest-section" className="bg-slate-50 py-16 border-y border-slate-100 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            {/* Story/Visual info */}
            <div className="space-y-6 text-right">
              <span className="text-xl font-bold text-accent-yellow uppercase tracking-widest block">أفكار ومقترحات</span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-primary-navy font-tajawal">اقترح رحلتك القادمة!</h2>
              <p className="text-slate-800 text-sl leading-relaxed">
                هل هناك مكان تحلم باستكشافه معنا؟ هل لديك فكرة لمغامرة جديدة أو وجهة إيمانية تود زيارتها مع مجتمع شباب ملهم؟
              </p>
              <p className="text-slate-800 text-sl leading-relaxed">
                نحن نهتم بأفكاركم وندرس كافة المقترحات بعناية لنبني رحلاتنا القادمة وفقاً لرغبات وااحتياجات أعضاء مجتمعنا. شاركنا فكرتك وسنحققها معاً!
              </p>

              <div className="flex items-center gap-3 pt-2 text-sm text-slate-800 font-medium justify-end">
                <span>أكثر من ٢٠ وجهة تم تنظيمها بناءً على اقتراحاتكم السابقة!</span>
                <MessageSquare className="w-5 h-5 text-accent-yellow" />
              </div>
            </div>

            {/* Form Box */}
            <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-lg relative overflow-hidden text-right">
              <div className="absolute top-0 right-0 left-0 h-1.5 bg-accent-yellow" />

              {isSuggested ? (
                <div className="py-12 flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in zoom-in duration-300">
                  <div className="w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-800">نشكرك على اقتراحك الرائع!</h3>
                  <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                    تم إرسال فكرة وجهتك بنجاح إلى فريق تخطيط الرحلات لدينا. سنقوم بدراستها والتواصل معك قريباً عند البدء في التخطيط لها!
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSuggest} className="space-y-4">
                  <h3 className="font-bold text-slate-800 text-base mb-2">أرسل اقتراحك إلينا</h3>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 block">الوجهة أو عنوان الرحلة المقترحة</label>
                    <input
                      type="text"
                      required
                      value={suggestion.title}
                      onChange={(e) => setSuggestion({ ...suggestion, title: e.target.value })}
                      placeholder="مثال: رحلة سفاري في تنزانيا، هايكنج الطائف..."
                      className="w-full bg-slate-50 border border-slate-200 focus:border-accent-yellow rounded-xl px-4 py-3 text-xs text-right focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 block">وصف الرحلة والأفكار التي تود إضافتها</label>
                    <textarea
                      required
                      rows={4}
                      value={suggestion.description}
                      onChange={(e) => setSuggestion({ ...suggestion, description: e.target.value })}
                      placeholder="اكتب الأنشطة المقترحة، تاريخ الرحلة المناسب، وما الذي يجعلك متحمساً لهذه الوجهة..."
                      className="w-full bg-slate-50 border border-slate-200 focus:border-accent-yellow rounded-xl px-4 py-3 text-xs text-right focus:outline-none resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-accent-teal hover:bg-primary-teal text-white rounded-xl text-xs font-bold transition-all duration-300 shadow-md hover:shadow-lg"
                  >
                    إرسال الاقتراح
                  </button>
                </form>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* 5. What to take checklist section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Visual card */}
          <div className="rounded-3xl overflow-hidden shadow-xl aspect-video lg:aspect-square relative group">
            <img
              src="https://images.unsplash.com/photo-1486916856992-e4db22c8df33?auto=format&fit=crop&q=80&w=800"
              alt="تجهيز الرحلة"
              className="w-full h-full object-contain object-top group-hover:scale-105 transition-all duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent" />
            <div className="absolute bottom-6 right-6 text-white space-y-1 text-right">
              <span className="text-xs text-accent-yellow font-extrabold block">جاهز للمغامرة؟</span>
              <h4 className="font-bold text-base font-tajawal">تحضير الحقيبة والمعدات اللازمة</h4>
            </div>
          </div>

          {/* Checklist details */}
          <div className="space-y-6 text-right font-tajawal">
            <span className="text-xl font-bold text-accent-yellow uppercase tracking-widest block">دليل المغامر</span>
            <h2 className="text-2xl md:text-3xl font-extrabold text-primary-navy">ماذا تأخذ معك في حقيبتك؟</h2>
            <p className="text-slate-800 text-sl leading-relaxed">
              التخطيط والتجهيز المناسب هو سر نجاح أي مغامرة. للتسهيل عليك، قمنا بإعداد هذه القائمة للأشياء الأساسية التي يجب أن تضمها حقيبتك:
            </p>

            <ul className="space-y-3.5 text-sm text-slate-800 font-medium flex flex-col items-end">
              {gearList.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5 justify-end">
                  <span>{item}</span>
                  <Check className="w-4.5 h-4.5 text-accent-yellow flex-shrink-0 mt-0.5" />
                </li>
              ))}
            </ul>
          </div>

        </div>
      </section>


      {/* 7. Slide-over details drawer */}
      <AnimatePresence>
        {selectedTrip && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
              onClick={() => setSelectedTrip(null)}
            />

            <div className="fixed inset-y-0 left-0 max-w-full flex pr-10 pl-0">
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 260 }}
                className="w-screen max-w-lg bg-white shadow-2xl flex flex-col h-full text-right"
              >

                {/* Image banner */}
                <div className="h-64 relative flex-shrink-0">
                  <img
                    src={resolveImage(selectedTrip.image || selectedTrip.images?.[0])}
                    alt={selectedTrip.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSelectedTrip(null)}
                    className="absolute top-6 left-6 p-2 rounded-full bg-slate-900/60 text-white hover:bg-slate-900 transition-all cursor-pointer font-bold"
                  >
                    <Plus className="w-5 h-5 rotate-45" />
                  </motion.button>
                  <div className="absolute bottom-6 right-6 text-white space-y-1">
                    <span className="bg-accent-yellow text-primary-navy text-[10px] font-bold px-2.5 py-1 rounded-full">
                      {selectedTrip.typeName || selectedTrip.type}
                    </span>
                    <h3 className="font-bold text-lg font-tajawal">{selectedTrip.title}</h3>
                  </div>
                </div>

                {/* Details Info */}
                <div className="flex-grow overflow-y-auto p-6 space-y-6">

                  {(selectedTrip.location || selectedTrip.date || selectedTrip.startDate) && (
                    <div className={`grid ${selectedTrip.location && (selectedTrip.date || selectedTrip.startDate) ? 'grid-cols-2' : 'grid-cols-1'} gap-4 border border-slate-100 p-4 rounded-xl bg-slate-50 text-xs`}>
                      {selectedTrip.location && (
                        <div className="space-y-1">
                          <span className="text-slate-400 block font-semibold">الموقع والوجهة</span>
                          <span className="font-bold text-slate-700 flex items-center gap-1 justify-end">
                            {selectedTrip.location}
                            <MapPin className="w-3.5 h-3.5 text-accent-yellow" />
                          </span>
                        </div>
                      )}
                      {(selectedTrip.date || selectedTrip.startDate) && (
                        <div className="space-y-1">
                          <span className="text-slate-400 block font-semibold">التاريخ والموعد</span>
                          <span className="font-bold text-slate-700 flex items-center gap-1 justify-end">
                            {selectedTrip.date || selectedTrip.startDate || ""}
                            <Calendar className="w-3.5 h-3.5 text-accent-yellow" />
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="space-y-2">
                    <h4 className="font-bold text-slate-800 text-sm">وصف وتفاصيل الرحلة</h4>
                    <p className="text-xs text-slate-505 leading-relaxed font-medium">
                      {selectedTrip.description}
                    </p>
                  </div>

                  {selectedTrip.highlights && selectedTrip.highlights.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-bold text-slate-800 text-sm">أبرز معالم ومميزات الرحلة</h4>
                      <ul className="space-y-2.5 text-xs text-slate-550 font-medium flex flex-col items-end">
                        {selectedTrip.highlights.map((h: string, i: number) => (
                          <li key={i} className="flex items-center gap-2 justify-end">
                            <span>{h}</span>
                            <Check className="w-4 h-4 text-emerald-500" />
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl text-xs text-amber-700 space-y-1">
                    <span className="font-bold flex items-center gap-1 justify-end">
                      <span>ملاحظة هامة</span>
                      <Info className="w-4 h-4" />
                    </span>
                    <p className="leading-relaxed">
                      العدد محدود جداً لضمان جودة الأنشطة والتنظيم الفاخر. يتم تأكيد الحجز فور تسديد الرسوم مباشرة.
                    </p>
                  </div>

                </div>

                {/* Checkout / Registration trigger */}
                <div className="border-t border-slate-100 p-6 bg-slate-50 flex items-center justify-between">
                  {typeof selectedTrip.price !== "undefined" && selectedTrip.price !== null ? (
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold">التكلفة الإجمالية</span>
                      <span className="text-lg font-extrabold text-accent-yellow">{selectedTrip.price === 0 ? "مجاناً" : `${selectedTrip.price} ر.س`}</span>
                    </div>
                  ) : <div />}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setShowRegModal(true);
                    }}
                    className="px-8 py-3.5 bg-accent-teal hover:bg-primary-teal text-white rounded-xl text-xs font-bold transition-all duration-300 shadow-md hover:shadow-lg cursor-pointer"
                  >
                    سجل في الرحلة الآن
                  </motion.button>
                </div>

              </motion.div>
            </div>
          </div>
        )}
      </AnimatePresence>

      <QuickRegistrationModal
        isOpen={showRegModal}
        onClose={() => {
          setShowRegModal(false);
        }}
        targetItem={selectedTrip}
        targetType="trip"
      />

    </div>
  );
}
