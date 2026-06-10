"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { normalizeLink } from "@/utils/link";

import {
  ShoppingBag, ShoppingCart, Filter, ArrowLeft, ArrowRight,
  CheckCircle, CreditCard, ShieldCheck,
  Sparkles
} from "lucide-react";
import { urlFor } from "@/sanity/lib/image";
import { motion, AnimatePresence } from "framer-motion";

const MotionLink = motion.create(Link);

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
const resolveImage = (img: any, width = 600, height = 600) => {
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

interface StoreClientProps {
  readonly sanityProducts: any[];
  readonly sanityCategories?: any[];
  readonly sanityHeroBanners?: any[];
}

export default function StoreClient({
  sanityProducts,
  sanityCategories = [],
  sanityHeroBanners = []
}: StoreClientProps) {
  const {
    products: contextProducts, cart, addToCart,
    placeOrder, showToast, currentUser
  } = useApp();

  const searchParams = useSearchParams();
  const router = useRouter();
  const isCheckoutMode = searchParams.get("checkout") === "true";

  // Catalog States
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("latest");
  const [currentPage, setCurrentPage] = useState(1);

  // Checkout States
  const [checkoutForm, setCheckoutForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    cardNumber: "",
    cardExpiry: "",
    cardCVV: "",
    cardName: ""
  });
  const [orderSuccessId, setOrderSuccessId] = useState<string | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentOption, setPaymentOption] = useState<"cash" | "card">("cash");

  // Pre-populate parent contact details when entering checkout mode
  useEffect(() => {
    if (isCheckoutMode && currentUser) {
      setCheckoutForm((prev) => ({
        ...prev,
        fullName: prev.fullName || currentUser.fullName || "",
        phone: prev.phone || currentUser.phone || "",
        email: prev.email || currentUser.email || ""
      }));
    }
  }, [isCheckoutMode, currentUser]);

  // Combine Sanity data with local fallback
  const displayProducts = sanityProducts.length > 0 ? sanityProducts : contextProducts;

  const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  // Resolve dynamic Store page banner from Sanity
  const storeBanner = sanityHeroBanners.find(b => b.page === "store");
  const storeHero = storeBanner ? {
    title: storeBanner.title,
    subtitle: storeBanner.description,
    image: resolveImage(storeBanner.images?.[0] || storeBanner.image, 1600, 800),
    btnText: storeBanner.btnText,
    link: storeBanner.link
  } : {
    title: "إصدار محدود من معدات ملهم",
    subtitle: "اكتشف مجموعتنا الحصرية المصممة بعناية لتلائم أسلوب حياتك اليومي وتعبّر عن انتمائك لمجتمع ملهم الفريد.",
    image: "/images/hero-store.png",
    btnText: "تسوق المجموعة",
    link: ""
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, sortBy]);

  // Catalog Filters and Sorting
  const filteredProducts = activeCategory === "all"
    ? displayProducts
    : displayProducts.filter((p: any) => {
      const catId = p.category?.slug?.current || p.category;
      return catId === activeCategory;
    });

  const sortedProducts = [...filteredProducts].sort((a: any, b: any) => {
    if (sortBy === "price_low") return a.price - b.price;
    if (sortBy === "price_high") return b.price - a.price;

    // Sort by creation / id
    const aId = a._id || a.id || "";
    const bId = b._id || b.id || "";
    return bId.localeCompare(aId);
  });

  // Pagination (8 items per page)
  const itemsPerPage = 8;
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
  const paginatedProducts = sortedProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleCheckoutSubmit = async (e?: React.SyntheticEvent) => {
    if (e) e.preventDefault();
    
    // Manual validation
    if (!checkoutForm.fullName.trim() || !checkoutForm.phone.trim() || !checkoutForm.email.trim()) {
      showToast("الرجاء تعبئة جميع البيانات الأساسية (الاسم، الجوال، الإيميل).", "warning");
      return;
    }

    // Check product availability against sanityProducts
    const unavailableItems = cart.filter(item => {
      const sanityProd = displayProducts.find((p: any) => p.id === item.product.id || p._id === item.product.id);
      if (sanityProd && sanityProd.isAvailable === false) return true;
      return false;
    });

    if (unavailableItems.length > 0) {
      showToast("عذراً، بعض المنتجات في سلتك لم تعد متوفرة. يرجى إزالتها لإتمام الطلب.", "error");
      return;
    }

    if (cart.length === 0) {
      showToast("سلتك فارغة، يرجى إضافة بعض المنتجات أولاً.", "warning");
      return;
    }

    // Additional validation for Card Payment
    if (paymentOption === "card") {
      if (!checkoutForm.cardName.trim() || !checkoutForm.cardNumber.trim() || !checkoutForm.cardExpiry.trim() || !checkoutForm.cardCVV.trim()) {
        showToast("الرجاء إدخال بيانات البطاقة الائتمانية بالكامل.", "warning");
        return;
      }
    }

    let finalPaymentMethod = "بطاقة ائتمانية (سداد كامل المبلغ عبر المتجر)";
    if (paymentOption === "cash") {
      finalPaymentMethod = "الدفع النقدي (خصم ١٠٠ ريال لأول ١٠٠ مشترك)";
    }

    if (paymentOption === "card") {
      setIsProcessingPayment(true);
      setTimeout(async () => {
        const orderId = await placeOrder({
          customerName: checkoutForm.fullName,
          phone: checkoutForm.phone,
          email: checkoutForm.email,
          paymentMethod: finalPaymentMethod
        });
        setIsProcessingPayment(false);
        setOrderSuccessId(orderId);
      }, 2500);
    } else {
      const orderId = await placeOrder({
        customerName: checkoutForm.fullName,
        phone: checkoutForm.phone,
        email: checkoutForm.email,
        paymentMethod: finalPaymentMethod
      });
      setOrderSuccessId(orderId);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 300, behavior: "smooth" });
  };

  // Get categories list from sanityCategories, with fallback to hardcoded list
  let categories: { id: string; name: string }[] = [];

  if (sanityCategories && sanityCategories.length > 0) {
    const targetCategories = sanityCategories
      .filter((cat: any) => cat.target === "store")
      .map((cat: any) => ({
        id: cat.slug?.current || cat._id,
        name: cat.title
      }));
    categories = [{ id: "all", name: "الكل" }, ...targetCategories];
  } else {
    categories = [
      { id: "all", name: "الكل" },
      { id: "t-shirts", name: "تيشيرتات" },
      { id: "sweaters", name: "سويترات" },
      { id: "caps", name: "كابات" },
      { id: "perfumes", name: "عطور" },
      { id: "accessories", name: "إكسسوارات" },
      { id: "bottles", name: "قارورات ماء" }
    ];
  }

  let paymentTitle = "الدفع النقدي";
  if (paymentOption === "card") paymentTitle = "الدفع الإلكتروني عبر بوابة Tap";

  let paymentDesc = "الدفع النقدي";
  if (paymentOption === "card") paymentDesc = "بطاقة ائتمانية (سداد كامل عبر بوابة Tap)";

  let paymentStatus = "قيد التحقق والتأكيد (Pending)";
  if (paymentOption === "card") paymentStatus = "مدفوع (Paid)";

  let submitBtnText = "تأكيد الطلب والحصول على خصم 100 ر.س";
  if (paymentOption === "card") submitBtnText = "ادفع الآن عبر بوابة Tap الآمنة";

  return (
    <div className="space-y-8 pb-10">

      {/* RENDER STORE CATALOG MODE */}
      {isCheckoutMode === false ? (
        <>
          {/* 1. Hero Banner */}
          <section className="relative min-h-[380px] sm:min-h-[450px] md:min-h-[500px] flex items-center py-12 sm:py-12 md:py-16 bg-slate-900 overflow-hidden">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0">
              <motion.img
                initial={{ scale: 1.15, opacity: 0 }}
                animate={{ scale: 1.05, opacity: 0.65 }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                src={storeHero.image}
                alt={storeHero.title}
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent md:bg-gradient-to-l md:from-slate-950/95 md:via-slate-950/30 md:to-transparent" />
            </div>

            <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center text-right text-white">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="space-y-4 sm:space-y-6 max-w-xl"
              >
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-accent-yellow/20 text-accent-yellow rounded-full text-[10px] sm:text-xs font-bold border border-accent-yellow/30 self-start">
                  <Sparkles className="w-3.5 h-3.5" />
                  متجر ملهم الرسمي
                </span>
                <h1 className="text-xl sm:text-3xl md:text-4xl font-black font-tajawal leading-tight">
                  {storeHero.title}
                </h1>
                {storeHero.subtitle && (
                  <p className="text-xs sm:text-sm text-slate-300 font-light leading-relaxed">
                    {storeHero.subtitle}
                  </p>
                )}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 justify-start w-full sm:w-auto">
                  {storeHero.btnText && (
                    storeHero.link && normalizeLink(storeHero.link) !== "/store" && !storeHero.link.startsWith("#") ? (
                      <MotionLink
                        href={normalizeLink(storeHero.link)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full sm:w-auto px-5 sm:px-6 py-2.5 sm:py-3 bg-accent-teal hover:bg-primary-teal text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg transition-all duration-300 flex items-center justify-center cursor-pointer"
                      >
                        {storeHero.btnText}
                      </MotionLink>
                    ) : (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          const el = document.getElementById("store-products");
                          el?.scrollIntoView({ behavior: "smooth" });
                        }}
                        className="w-full sm:w-auto px-5 sm:px-6 py-2.5 sm:py-3 bg-accent-teal hover:bg-primary-teal text-white rounded-xl text-xs sm:text-sm font-bold shadow-lg transition-all duration-300 flex items-center justify-center"
                      >
                        {storeHero.btnText}
                      </motion.button>
                    )
                  )}
                </div>
              </motion.div>
            </div>
          </section>

          {/* 2. Filter tabs and Sort bar */}
          <section id="store-products" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 border-b border-slate-100 pb-6 text-right">

              {/* Category tabs */}
              <div className="flex flex-wrap gap-2 justify-center">
                {categories.map((cat) => (
                  <motion.button
                    key={cat.id}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-5 py-2 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer ${activeCategory === cat.id
                        ? "bg-accent-yellow text-primary-navy shadow-md shadow-yellow-500/25"
                        : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                  >
                    {cat.name}
                  </motion.button>
                ))}
              </div>

              {/* Sorting Bar */}
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400 font-bold flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5" />
                  ترتيب حسب:
                </span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-white border border-slate-200 focus:border-accent-yellow rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:outline-none"
                >
                  <option value="latest">الأحدث</option>
                  <option value="price_low">السعر: من الأقل للأعلى</option>
                  <option value="price_high">السعر: من الأعلى للأقل</option>
                </select>
              </div>

            </div>
          </section>

          {/* 3. Products Grid */}
          <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {paginatedProducts.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-16 bg-slate-50 rounded-3xl border border-slate-100 max-w-md mx-auto space-y-4"
              >
                <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="font-bold text-slate-800">لا توجد منتجات متاحة</h3>
                <p className="text-xs text-slate-400">نعمل على إعادة ملء المخزون وإضافة تصاميم جديدة قريباً.</p>
              </motion.div>
            ) : (
              <motion.div
                key={`${activeCategory}-${currentPage}-${sortBy}`}
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-right"
              >
                {paginatedProducts.map((product: any) => {
                  const productLink = product.slug?.current ? `/store/${product.slug.current}` : "/store";
                  const productImg = resolveImage(product.image || product.images?.[0], 400, 400);

                  return (
                    <motion.div
                      key={product.id || product._id}
                      variants={itemVariants}
                      whileHover={{ y: -6, scale: 1.015 }}
                      className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col group relative"
                    >
                      {product.isNew && (
                        <span className="absolute top-4 right-4 bg-accent-gold text-white text-[9px] font-extrabold px-2.5 py-1 rounded-full z-10 shadow-sm">
                          جديد حصرى
                        </span>
                      )}

                      {/* Image Block */}
                      <div className="h-64 w-full bg-slate-50 overflow-hidden relative">
                        <Link href={productLink} className="w-full h-full block">
                          <img
                            src={productImg}
                            alt={product.name || product.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                          />
                        </Link>
                      </div>

                      {/* Content Block */}
                      <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                        <div className="space-y-1">
                          <Link href={productLink}>
                            <h3 className="font-bold text-slate-800 text-sm group-hover:text-accent-yellow transition-all duration-200 line-clamp-1">
                              {product.name || product.title}
                            </h3>
                          </Link>
                          <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed font-tajawal">
                            {product.description}
                          </p>
                        </div>

                        <div className="flex justify-between items-center pt-3 border-t border-slate-50">
                          {product.isAvailable !== false ? (
                            <>
                              <span className="text-accent-yellow font-extrabold text-base">{product.price} ر.س</span>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={(e) => {
                                  e.preventDefault();
                                  addToCart({
                                    id: product.id || product._id,
                                    name: product.name || product.title,
                                    price: product.price,
                                    category: product.category?.slug?.current || product.category || "accessories",
                                    image: productImg,
                                    description: product.description,
                                  });
                                }}
                                className="p-2.5 bg-slate-100 hover:bg-accent-yellow text-slate-700 hover:text-primary-navy rounded-xl transition-all duration-300 flex items-center justify-center gap-1.5 text-xs font-bold cursor-pointer"
                                aria-label="أضف للسلة"
                              >
                                <ShoppingCart className="w-4 h-4" />
                                <span>أضف للسلّة</span>
                              </motion.button>
                            </>
                          ) : (
                            <span className="w-full text-center py-2 bg-slate-100 text-slate-500 rounded-xl text-xs font-bold">
                              غير متوفر حالياً
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </section>

          {/* 4. Pagination */}
          {totalPages > 1 && (
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                  className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 disabled:opacity-30 disabled:pointer-events-none hover:bg-slate-50 transition-all"
                  aria-label="الصفحة السابقة"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>

                {Array.from({ length: totalPages }).map((_, i) => {
                  const pNum = i + 1;
                  return (
                    <button
                      key={pNum}
                      onClick={() => handlePageChange(pNum)}
                      className={`w-9 h-9 rounded-xl text-xs font-bold transition-all ${currentPage === pNum
                          ? "bg-accent-yellow text-primary-navy shadow-md shadow-yellow-500/20"
                          : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                        }`}
                    >
                      {pNum}
                    </button>
                  );
                })}

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                  className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-500 disabled:opacity-30 disabled:pointer-events-none hover:bg-slate-50 transition-all"
                  aria-label="الصفحة التالية"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              </div>
            </section>
          )}
        </>
      ) : (
        // RENDER CHECKOUT & TAP ELECTRONIC PAYMENT GATEWAY MODE
        <motion.section
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16"
        >

          <AnimatePresence mode="wait">
            {orderSuccessId ? (
              // Payment / Order Success receipt screen
              <motion.div
                key="success-receipt"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="bg-white rounded-3xl border border-slate-100 shadow-xl max-w-xl mx-auto p-8 text-center space-y-6"
              >
                <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <ShieldCheck className="w-10 h-10 animate-bounce" />
                </div>
                <div className="space-y-2">
                  <span className="text-[10px] text-emerald-500 font-extrabold uppercase tracking-widest block font-sans">
                    {paymentTitle}
                  </span>
                  <h2 className="text-xl font-bold text-slate-800">تمت عملية الشراء بنجاح!</h2>
                  <p className="text-xs text-slate-400">شكراً لتسوقك من متجر ملهم. تم استلام طلبك وتأكيده بنجاح.</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => router.push("/dashboard")}
                    className="px-6 py-3 bg-primary-navy hover:bg-slate-800 text-white rounded-xl text-sm font-bold transition-all duration-300 shadow-md cursor-pointer"
                  >
                    متابعة الطلب
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => router.push("/store")}
                    className="px-6 py-3 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-bold transition-all duration-300 shadow-sm cursor-pointer"
                  >
                    العودة للمتجر
                  </motion.button>
                </div>
              </motion.div>
            ) : (
              // Checkout Form and Order details
              <motion.div
                key="checkout-form-container"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start"
              >

                {/* Form columns (7 cols) */}
                <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-100 shadow-xl p-6 sm:p-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 left-0 h-1.5 bg-accent-yellow" />

                  <AnimatePresence>
                    {isProcessingPayment && (
                      // Tap payments payment loader processing
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-white/95 rounded-3xl z-30 flex flex-col items-center justify-center text-center p-8 space-y-4"
                      >
                        <div className="w-14 h-14 border-4 border-slate-100 border-t-accent-yellow rounded-full animate-spin" />
                        <h3 className="font-bold text-slate-800">جاري معالجة الدفع الإلكتروني الآمن...</h3>
                        <p className="text-xs text-slate-400 max-w-xs font-tajawal">يرجى الانتظار، نقوم بالاتصال المشفر ببوابة الدفع <b>Tap payments</b> لإتمام عمليتك بأمان.</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <form className="space-y-6 text-right">
                    <div className="space-y-1">
                      <span className="text-[10px] text-accent-yellow font-extrabold uppercase">إتمام المشتريات والدفع</span>
                      <h2 className="text-lg font-bold text-slate-800">تفاصيل الفاتورة والاستلام</h2>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-1">
                        <label htmlFor="fullName" className="text-xs font-bold text-slate-500 block">الاسم الكامل للمشتري</label>
                        <input
                          id="fullName"
                          type="text"
                          value={checkoutForm.fullName}
                          onChange={(e) => setCheckoutForm({ ...checkoutForm, fullName: e.target.value })}
                          placeholder="مثال: أحمد عبد الله الغامدي"
                          className="w-full bg-slate-50 border border-slate-200 focus:border-accent-yellow rounded-xl px-4 py-3 text-xs text-right focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label htmlFor="phone" className="text-xs font-bold text-slate-500 block">رقم الجوال للتواصل</label>
                          <input
                            id="phone"
                            type="tel"
                            value={checkoutForm.phone}
                            onChange={(e) => setCheckoutForm({ ...checkoutForm, phone: e.target.value })}
                            placeholder="+966 5X XXX XXXX"
                            className="w-full bg-slate-50 border border-slate-200 focus:border-accent-yellow rounded-xl px-4 py-3 text-xs text-right focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label htmlFor="email" className="text-xs font-bold text-slate-500 block">البريد الإلكتروني</label>
                          <input
                            id="email"
                            type="email"
                            value={checkoutForm.email}
                            onChange={(e) => setCheckoutForm({ ...checkoutForm, email: e.target.value })}
                            placeholder="email@example.com"
                            className="w-full bg-slate-50 border border-slate-200 focus:border-accent-yellow rounded-xl px-4 py-3 text-xs text-left focus:outline-none font-sans"
                            dir="ltr"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Payment choice */}
                    <div className="space-y-3 pt-2">
                      <div className="text-xs font-bold text-slate-500 block">اختر طريقة الدفع المفضلة</div>
                      <div className="space-y-3">
                        {/* Option 1: Cash */}
                        <motion.button
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          type="button"
                          onClick={() => setPaymentOption("cash")}
                          className={`p-4 rounded-2xl border text-right transition-all text-xs font-bold flex justify-between items-center cursor-pointer w-full ${paymentOption === "cash"
                              ? "border-accent-yellow bg-yellow-50/50 text-accent-yellow shadow-inner"
                              : "border-slate-100 bg-slate-50 text-slate-700 hover:bg-slate-100"
                            }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-2.5 rounded-xl transition-all ${paymentOption === "cash" ? "bg-accent-yellow text-primary-navy shadow-md shadow-yellow-100" : "bg-slate-200 text-slate-500"}`}>
                              <Sparkles className="w-4 h-4" />
                            </div>
                            <div className="text-right">
                              <span className="block font-black text-sm text-slate-800 font-tajawal">الدفع النقدي (خصم ١٠٠ ريال لأول ١٠٠ مشترك)</span>
                              <span className="text-xs text-emerald-600 font-black block mt-1">احصل على الخصم فوراً عند تأكيد الحجز</span>
                            </div>
                          </div>
                          <CheckCircle className={`w-4.5 h-4.5 ${paymentOption === "cash" ? "text-accent-yellow" : "text-slate-200"}`} />
                        </motion.button>

                        {/* Option 2: Card */}
                        <motion.button
                          whileHover={{ scale: 1.01 }}
                          whileTap={{ scale: 0.99 }}
                          type="button"
                          onClick={() => setPaymentOption("card")}
                          className={`p-4 rounded-2xl border text-right transition-all text-xs font-bold flex justify-between items-center cursor-pointer w-full ${paymentOption === "card"
                              ? "border-accent-yellow bg-yellow-50/50 text-accent-yellow shadow-inner animate-pulse-subtle"
                              : "border-slate-100 bg-slate-50 text-slate-700 hover:bg-slate-100"
                            }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`p-2.5 rounded-xl transition-all ${paymentOption === "card" ? "bg-accent-yellow text-primary-navy shadow-md shadow-yellow-100" : "bg-slate-200 text-slate-500"}`}>
                              <CreditCard className="w-4 h-4" />
                            </div>
                            <div className="text-right">
                              <span className="block font-black text-sm text-slate-800 font-tajawal">بطاقة ائتمانية (سداد كامل المبلغ عبر المتجر)</span>
                              <span className="text-xs text-slate-500 font-bold block mt-1">الدفع الآمن عبر Stc pay , Apple pay,مدى </span>
                            </div>
                          </div>
                          <CheckCircle className={`w-4.5 h-4.5 ${paymentOption === "card" ? "text-accent-yellow" : "text-slate-200"}`} />
                        </motion.button>
                      </div>
                    </div>

                    {/* TAP CARD INPUT DETAILS */}
                    <AnimatePresence>
                      {paymentOption === "card" && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="bg-slate-50 border border-slate-100 p-6 rounded-2xl space-y-4 overflow-hidden"
                        >
                          <span className="text-[10px] text-accent-yellow font-extrabold flex items-center gap-1.5 justify-end">
                            <span>بوابة الدفع الآمنة من Tap payments</span>
                            <CreditCard className="w-3.5 h-3.5" />
                          </span>

                          <div className="space-y-3 text-right">
                            <div className="space-y-1">
                              <label htmlFor="cardName" className="text-[10px] font-bold text-slate-500 block">الاسم المكتوب على البطاقة</label>
                              <input
                                id="cardName"
                                type="text"
                                required={paymentOption === "card"}
                                value={checkoutForm.cardName}
                                onChange={(e) => setCheckoutForm({ ...checkoutForm, cardName: e.target.value })}
                                placeholder="AHMED A ALGHAMDI"
                                className="w-full bg-white border border-slate-200 focus:border-accent-yellow rounded-xl px-4 py-2.5 text-xs text-left focus:outline-none font-sans uppercase"
                                dir="ltr"
                              />
                            </div>

                            <div className="space-y-1">
                              <label htmlFor="cardNumber" className="text-[10px] font-bold text-slate-500 block">رقم بطاقة الائتمان (مدى، فيزا، ماستركارد)</label>
                              <input
                                id="cardNumber"
                                type="text"
                                required={paymentOption === "card"}
                                maxLength={19}
                                value={checkoutForm.cardNumber}
                                onChange={(e) => {
                                  const val = e.target.value.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim();
                                  setCheckoutForm({ ...checkoutForm, cardNumber: val });
                                }}
                                placeholder="4000 1234 5678 9010"
                                className="w-full bg-white border border-slate-200 focus:border-accent-yellow rounded-xl px-4 py-2.5 text-xs text-left focus:outline-none font-sans"
                                dir="ltr"
                              />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <label htmlFor="cardExpiry" className="text-[10px] font-bold text-slate-500 block">تاريخ الانتهاء</label>
                                <input
                                  id="cardExpiry"
                                  type="text"
                                  required={paymentOption === "card"}
                                  maxLength={5}
                                  value={checkoutForm.cardExpiry}
                                  onChange={(e) => {
                                    let val = e.target.value;
                                    if (val.length === 2 && !val.includes("/")) val = val + "/";
                                    setCheckoutForm({ ...checkoutForm, cardExpiry: val });
                                  }}
                                  placeholder="MM/YY"
                                  className="w-full bg-white border border-slate-200 focus:border-accent-yellow rounded-xl px-4 py-2.5 text-xs text-center focus:outline-none font-sans"
                                  dir="ltr"
                                />
                              </div>
                              <div className="space-y-1">
                                <label htmlFor="cardCVV" className="text-[10px] font-bold text-slate-500 block">رمز الأمان (CVV)</label>
                                <input
                                  id="cardCVV"
                                  type="password"
                                  required={paymentOption === "card"}
                                  maxLength={3}
                                  value={checkoutForm.cardCVV}
                                  onChange={(e) => setCheckoutForm({ ...checkoutForm, cardCVV: e.target.value })}
                                  placeholder="•••"
                                  className="w-full bg-white border border-slate-200 focus:border-accent-yellow rounded-xl px-4 py-2.5 text-xs text-center focus:outline-none font-sans"
                                  dir="ltr"
                                />
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={handleCheckoutSubmit}
                      className="w-full py-3.5 bg-accent-teal hover:bg-primary-teal text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all duration-300 font-tajawal cursor-pointer"
                    >
                      {submitBtnText}
                    </motion.button>
                  </form>
                </div>

                {/* Order Summary columns (5 cols) */}
                <div className="lg:col-span-5 bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-xl space-y-6 text-right">
                  <h3 className="font-extrabold text-base font-tajawal border-b border-slate-800 pb-3">ملخص طلبك</h3>

                  {cart.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-8">السلة فارغة. يرجى إضافة بعض المنتجات لإتمام الطلب.</p>
                  ) : (
                    <>
                      <div className="space-y-4 max-h-[220px] overflow-y-auto pr-1">
                        {cart.map((item) => (
                          <div key={item.product.id} className="flex gap-3 justify-between items-center text-xs">
                            <span className="font-bold text-accent-yellow">{item.product.price * item.quantity} ر.س</span>
                            <div className="flex gap-2.5 items-center justify-end">
                              <div className="text-right">
                                <h4 className="font-bold text-slate-100 line-clamp-1">{item.product.name}</h4>
                                <span className="text-[10px] text-slate-400">الكمية: {item.quantity}</span>
                              </div>
                              <div className="w-10 h-10 bg-slate-800 rounded-lg overflow-hidden flex-shrink-0">
                                <img src={resolveImage(item.product.image, 100, 100)} alt={item.product.name} className="w-full h-full object-cover" />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="border-t border-slate-800 pt-4 space-y-2.5 text-xs text-slate-350">
                        <div className="flex justify-between">
                          <span>{cartTotal} ر.س</span>
                          <span>المجموع الفرعي</span>
                        </div>
                        {paymentOption === "cash" && (
                          <div className="flex justify-between text-emerald-400 font-bold">
                            <span>-100 ر.س</span>
                            <span>خصم الدفع النقدي (لأول 100 مشترك)</span>
                          </div>
                        )}
                        <div className="flex justify-between font-tajawal">
                          <span className="text-emerald-400 font-bold">مجاني لفترة محدودة</span>
                          <span>قيمة الشحن والتوصيل</span>
                        </div>
                        <div className="flex justify-between border-t border-slate-800 pt-3 text-sm font-extrabold text-white font-tajawal">
                          <span className="text-accent-yellow">
                            {paymentOption === "cash" ? Math.max(0, cartTotal - 100) : cartTotal} ر.س
                          </span>
                          <span>المجموع الإجمالي</span>
                        </div>
                      </div>

                      <div className="pt-2">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => router.push("/store")}
                          className="w-full py-2.5 border border-slate-800 text-slate-400 hover:text-white rounded-xl text-center text-[10px] font-bold hover:bg-slate-800/40 transition-all cursor-pointer"
                        >
                          العودة وتعديل السلّة
                        </motion.button>
                      </div>
                    </>
                  )}
                </div>

              </motion.div>
            )}
          </AnimatePresence>

        </motion.section>
      )}

    </div>
  );
}
