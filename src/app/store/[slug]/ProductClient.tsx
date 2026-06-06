"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { urlFor } from "@/sanity/lib/image";
import { 
  ShoppingBag, 
  Minus, 
  Plus, 
  Check, 
  Share2, 
  Truck, 
  ShieldCheck, 
  RotateCcw, 
  Heart,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Star,
  Tag,
  Info
} from "lucide-react";
import { PortableText } from "@portabletext/react";
import { motion, AnimatePresence } from "framer-motion";

interface ProductClientProps {
  product: {
    _id: string;
    name?: string;
    title?: string;
    description: string;
    price: number;
    compareAtPrice?: number;
    images?: any[];
    category?: {
      title: string;
      slug?: { current: string };
    };
    stock?: number;
    sizes?: string[];
    colors?: string[];
    variants?: string[];
    content?: any[];
    isNew?: boolean;
  };
}

const getColorHex = (colorName: string): string => {
  const normalized = colorName.trim().toLowerCase();
  const colorMap: { [key: string]: string } = {
    // Arabic colors mapping
    "أسود": "#0f172a",
    "اسود": "#0f172a",
    "أبيض": "#ffffff",
    "ابيض": "#ffffff",
    "أحمر": "#dc2626",
    "احمر": "#dc2626",
    "أزرق": "#2563eb",
    "ازرق": "#2563eb",
    "أخضر": "#16a34a",
    "اخضر": "#16a34a",
    "أصفر": "#ca8a04",
    "اصفر": "#ca8a04",
    "رمادي": "#4b5563",
    "كحلي": "#1e3a8a",
    "زيتي": "#3f6212",
    "خردلي": "#d97706",
    "وردي": "#db2777",
    "بنفسجي": "#7c3aed",
    "برتقالي": "#ea580c",
    "بني": "#78350f",
    "بيج": "#f5f5dc",
    
    // English colors mapping
    "black": "#0f172a",
    "white": "#ffffff",
    "red": "#dc2626",
    "blue": "#2563eb",
    "green": "#16a34a",
    "yellow": "#ca8a04",
    "gray": "#4b5563",
    "grey": "#4b5563",
    "navy": "#1e3a8a",
    "olive": "#3f6212",
    "mustard": "#d97706",
    "pink": "#db2777",
    "purple": "#7c3aed",
    "orange": "#ea580c",
    "brown": "#78350f",
    "beige": "#f5f5dc"
  };
  
  return colorMap[normalized] || "";
};

export default function ProductClient({ product }: ProductClientProps) {
  const { addToCart, showToast } = useApp();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  
  // States for variants & options
  const sizes = product.sizes || [];
  const colors = product.colors || [];
  const oldVariants = product.variants || [];
  
  const [selectedSize, setSelectedSize] = useState(sizes.length > 0 ? sizes[0] : "");
  const [selectedColor, setSelectedColor] = useState(colors.length > 0 ? colors[0] : "");
  const [selectedVariant, setSelectedVariant] = useState(oldVariants.length > 0 ? oldVariants[0] : "");
  
  const [addedToCart, setAddedToCart] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  
  // Accordion state
  const [expandedSection, setExpandedSection] = useState<string | null>("details");

  const images = product.images || [];
  const mainImage = images[activeImageIndex]
    ? urlFor(images[activeImageIndex]).width(800).height(800).url()
    : "/placeholder.jpg";

  // Compute title and pricing values
  const productName = product.name || product.title || "";
  const hasDiscount = !!(product.compareAtPrice && product.compareAtPrice > product.price);
  const discountPercent = hasDiscount 
    ? Math.round(((product.compareAtPrice! - product.price) / product.compareAtPrice!) * 100)
    : 0;

  const handleAddToCart = () => {
    // Construct variant string
    const variantDetails = [];
    if (selectedSize) variantDetails.push(selectedSize);
    if (selectedColor) variantDetails.push(selectedColor);
    if (selectedVariant) variantDetails.push(selectedVariant);
    
    const variantString = variantDetails.length > 0 ? ` (${variantDetails.join(" / ")})` : "";

    const cartProduct = {
      id: product._id,
      name: productName + variantString,
      price: product.price,
      category: (product.category?.slug?.current || "accessories") as any,
      image: images[0] ? urlFor(images[0]).width(400).height(400).url() : "/placeholder.jpg",
      description: product.description,
    };

    // Add multiple quantities
    for (let i = 0; i < quantity; i++) {
      addToCart(cartProduct);
    }

    setAddedToCart(true);
    setTimeout(() => {
      setAddedToCart(false);
    }, 2500);
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      if (navigator.share) {
        navigator.share({
          title: productName,
          text: product.description,
          url: window.location.href,
        }).catch(console.error);
      } else {
        navigator.clipboard.writeText(window.location.href);
        showToast("تم نسخ رابط المنتج بنجاح!", "success");
      }
    }
  };

  const decreaseQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const increaseQuantity = () => {
    if (!product.stock || quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const toggleAccordion = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mt-4 font-cairo">
      
      {/* Right Column: Product Image Gallery (lg:col-span-5) */}
      <div className="lg:col-span-5 space-y-4">
        {/* Main image display box */}
        <div className="relative aspect-square bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-md flex items-center justify-center group transition-all duration-300">
          <AnimatePresence mode="wait">
            <motion.img
              key={activeImageIndex}
              src={mainImage}
              alt={productName}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="w-full h-full object-contain p-4 mix-blend-multiply hover:scale-105 transition-transform duration-500 cursor-zoom-in"
            />
          </AnimatePresence>

          {/* Floating Badges */}
          <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
            {product.isNew && (
              <span className="bg-gradient-to-l from-amber-500 to-amber-600 text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                جديد
              </span>
            )}
            {hasDiscount && (
              <span className="bg-rose-500 text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
                <Tag className="w-3 h-3" />
                وفر {discountPercent}%
              </span>
            )}
          </div>

          {/* Slide Arrow Navigation Overlay */}
          {images.length > 1 && (
            <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
                }}
                className="w-9 h-9 rounded-full bg-white/90 shadow flex items-center justify-center text-slate-800 hover:bg-white pointer-events-auto transition-transform hover:-translate-x-1"
                aria-label="Previous image"
              >
                <Plus className="w-4 h-4 rotate-45" /> {/* fallback navigation icon */}
              </button>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
                }}
                className="w-9 h-9 rounded-full bg-white/90 shadow flex items-center justify-center text-slate-800 hover:bg-white pointer-events-auto transition-transform hover:translate-x-1"
                aria-label="Next image"
              >
                <Plus className="w-4 h-4 rotate-45" /> {/* fallback navigation icon */}
              </button>
            </div>
          )}
        </div>

        {/* Thumbnail gallery */}
        {images.length > 1 && (
          <div className="flex gap-3 overflow-x-auto py-2 scrollbar-thin">
            {images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImageIndex(idx)}
                className={`relative w-20 h-20 bg-white rounded-2xl overflow-hidden border-2 flex-shrink-0 transition-all duration-300 ${
                  activeImageIndex === idx 
                    ? "border-accent-yellow scale-95 shadow-sm shadow-yellow-55" 
                    : "border-slate-100 hover:border-slate-300"
                }`}
              >
                <img
                  src={urlFor(img).width(150).height(150).url()}
                  alt={`Thumbnail ${idx + 1}`}
                  className="w-full h-full object-contain p-1.5 mix-blend-multiply"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Left Column: Product Information & Purchase Actions (lg:col-span-7) */}
      <div className="lg:col-span-7 text-right flex flex-col justify-between space-y-6">
        
        {/* Main Info Block */}
        <div className="space-y-6">
          
          {/* Breadcrumb replacement & Share/Wishlist header */}
          <div className="flex items-center justify-between">
            {product.category?.title ? (
              <span className="text-[11px] font-bold text-accent-yellow tracking-wide bg-yellow-50 px-3.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
                <Sparkles className="w-3 h-3" />
                {product.category.title}
              </span>
            ) : (
              <span className="text-[11px] font-bold text-slate-400">متجر ملهم</span>
            )}
            
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setIsWishlisted(!isWishlisted)}
                className={`p-2 rounded-full border transition-all duration-300 ${
                  isWishlisted 
                    ? "bg-rose-50 border-rose-100 text-rose-500 scale-105" 
                    : "bg-white border-slate-100 text-slate-400 hover:text-rose-500 hover:border-slate-200"
                }`}
                title="أضف للمفضلة"
              >
                <Heart className={`w-4 h-4 ${isWishlisted ? "fill-rose-500" : ""}`} />
              </button>
              <button 
                onClick={handleShare}
                className="p-2 rounded-full bg-white border border-slate-100 text-slate-400 hover:text-accent-yellow hover:border-slate-200 transition-all duration-300"
                title="مشاركة المنتج"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Product Title and Rating */}
          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-black text-slate-800 font-tajawal leading-tight">
              {productName}
            </h1>
            
            {/* Trust rating mockup */}
            <div className="flex items-center gap-2 justify-end text-xs text-slate-500">
              <span className="font-sans">(98 تقييم)</span>
              <span className="font-bold text-slate-700">4.9</span>
              <div className="flex items-center gap-0.5 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
            </div>
          </div>

          {/* Pricing Block */}
          <div className="bg-slate-50/70 p-4 rounded-2xl flex items-center justify-between border border-slate-100">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block font-medium">السعر الحالي</span>
              <div className="flex items-baseline gap-2 font-sans pt-0.5">
                <span className="text-2xl md:text-3xl font-black text-slate-900">
                  {product.price}
                </span>
                <span className="text-sm font-bold text-slate-650">ر.س</span>
              </div>
            </div>
            
            {hasDiscount && (
              <div className="text-left font-sans">
                <span className="text-[10px] text-slate-400 block font-medium">السعر الأصلي</span>
                <div className="flex items-center gap-1.5 pt-0.5">
                  <span className="text-slate-400 line-through text-sm">
                    {product.compareAtPrice} ر.س
                  </span>
                  <span className="bg-rose-100 text-rose-600 text-[10px] font-extrabold px-2 py-0.5 rounded-md">
                    وفر {discountPercent}%
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Description Section */}
          <div className="space-y-1.5">
            <h2 className="text-xs font-bold text-slate-700 font-tajawal">نظرة عامة على المنتج</h2>
            <p className="text-slate-600 text-[13px] leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Size Options Selector */}
          {sizes.length > 0 && (
            <div className="space-y-2.5 pt-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-700 font-tajawal">المقاس المتاح</span>
                <span className="text-[11px] text-accent-yellow hover:underline cursor-pointer">جدول المقاسات</span>
              </div>
              <div className="flex flex-wrap gap-2.5 justify-end">
                {sizes.map((size) => {
                  const isSelected = selectedSize === size;
                  return (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`min-w-[42px] h-[42px] rounded-xl text-xs font-bold border transition-all duration-300 flex items-center justify-center ${
                        isSelected
                          ? "bg-accent-teal border-accent-teal text-white shadow-sm shadow-yellow-100"
                          : "bg-white border-slate-200 text-slate-700 hover:border-slate-350 hover:bg-slate-50"
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Color Options Selector */}
          {colors.length > 0 && (
            <div className="space-y-2.5 pt-2">
              <span className="text-xs font-bold text-slate-700 font-tajawal block">اللون المتاح</span>
              <div className="flex flex-wrap gap-3 justify-end">
                {colors.map((color) => {
                  const hex = getColorHex(color);
                  const isSelected = selectedColor === color;
                  return (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`relative w-8 h-8 rounded-full border transition-all duration-350 flex items-center justify-center ${
                        isSelected 
                          ? "ring-2 ring-accent-yellow ring-offset-2 scale-110 border-transparent shadow-sm" 
                          : "border-slate-200 hover:scale-105"
                      }`}
                      style={{ backgroundColor: hex || "#cbd5e1" }}
                      title={color}
                    >
                      {isSelected && (
                        <Check className={`w-4 h-4 ${
                          hex && hex.toLowerCase() === "#ffffff" ? "text-slate-900" : "text-white"
                        }`} />
                      )}
                      {!hex && (
                        <span className="text-[10px] font-bold text-slate-800 leading-none">
                          {color.substring(0, 2)}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Variants fallback (if sizes/colors not populated but old variants list is) */}
          {sizes.length === 0 && colors.length === 0 && oldVariants.length > 0 && (
            <div className="space-y-2.5 pt-2">
              <span className="text-xs font-bold text-slate-700 font-tajawal block">الخيارات المتاحة</span>
              <div className="flex flex-wrap gap-2.5 justify-end">
                {oldVariants.map((v) => {
                  const isSelected = selectedVariant === v;
                  return (
                    <button
                      key={v}
                      onClick={() => setSelectedVariant(v)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all duration-300 ${
                        isSelected
                          ? "bg-slate-900 border-slate-900 text-white shadow-md"
                          : "bg-white border-slate-200 text-slate-650 hover:border-slate-300"
                      }`}
                    >
                      {v}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Stock and Status Alert */}
          <div className="flex items-center gap-2 justify-end pt-2">
            {product.stock !== undefined ? (
              product.stock > 5 ? (
                <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-bold bg-emerald-50 px-3 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>متوفر في المخزن (شحن فوري)</span>
                </div>
              ) : product.stock > 0 ? (
                <div className="flex items-center gap-1.5 text-amber-600 text-xs font-bold bg-amber-50 px-3 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  <span>كمية محدودة جداً ({product.stock} قطع متبقية!)</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-rose-600 text-xs font-bold bg-rose-50 px-3 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 bg-rose-500 rounded-full" />
                  <span>نفذت الكمية حالياً</span>
                </div>
              )
            ) : (
              <div className="flex items-center gap-1.5 text-slate-600 text-xs font-bold bg-slate-50 px-3 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                <span>متوفر للطلب</span>
              </div>
            )}
          </div>

        </div>

        {/* Purchase Action Box */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between gap-4">
            {/* Quantity control */}
            <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
              <button
                onClick={increaseQuantity}
                disabled={product.stock !== undefined && quantity >= product.stock}
                className="p-3 hover:bg-slate-50 text-slate-600 disabled:opacity-20 transition-colors"
                aria-label="Increase quantity"
              >
                <Plus className="w-4 h-4" />
              </button>
              <span className="px-5 font-bold text-slate-800 text-sm font-sans w-12 text-center">
                {quantity}
              </span>
              <button
                onClick={decreaseQuantity}
                disabled={quantity <= 1}
                className="p-3 hover:bg-slate-50 text-slate-600 disabled:opacity-20 transition-colors"
                aria-label="Decrease quantity"
              >
                <Minus className="w-4 h-4" />
              </button>
            </div>
            <span className="text-xs font-bold text-slate-600 font-tajawal">الكمية المطلوبة</span>
          </div>

          {/* Add to Cart CTA */}
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className={`w-full py-4 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 shadow-md transition-all duration-350 active:scale-[0.98] ${
              addedToCart
                ? "bg-emerald-600 text-white shadow-emerald-100 hover:bg-emerald-700"
                : "bg-accent-teal text-white hover:bg-primary-teal shadow-yellow-50/50 glow-btn"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {addedToCart ? (
              <>
                <Check className="w-5 h-5 animate-scale" />
                <span>تمت الإضافة إلى سلتك بنجاح!</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-5 h-5" />
                <span>إضافة إلى سلة التسوق</span>
              </>
            )}
          </button>
        </div>

        {/* Tabbed Info Accordion Section (Details, Shipping, Payments) */}
        <div className="border-t border-slate-100 pt-6 mt-6 space-y-3">
          
          {/* Section 1: detailed info */}
          <div className="border border-slate-100 rounded-2xl overflow-hidden bg-white shadow-sm">
            <button
              onClick={() => toggleAccordion("details")}
              className="w-full px-5 py-4 flex items-center justify-between text-right font-tajawal font-bold text-xs text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <span className="text-slate-400">
                {expandedSection === "details" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </span>
              <div className="flex items-center gap-2">
                <span>تفاصيل ومواصفات المنتج</span>
                <Info className="w-4 h-4 text-accent-yellow" />
              </div>
            </button>
            
            {expandedSection === "details" && (
              <div className="px-5 pb-5 pt-1 text-slate-650 text-xs leading-relaxed text-right border-t border-slate-50">
                {product.content && product.content.length > 0 ? (
                  <div className="prose prose-slate max-w-none">
                    <PortableText
                      value={product.content}
                      components={{
                        block: {
                          h3: ({ children }) => <h3 className="text-sm font-bold text-slate-800 mt-4 mb-2 font-tajawal">{children}</h3>,
                          normal: ({ children }) => <p className="mb-3 text-slate-600">{children}</p>,
                        },
                        list: {
                          bullet: ({ children }) => <ul className="list-disc list-inside mr-4 space-y-1 mb-3 text-slate-600">{children}</ul>,
                        },
                      }}
                    />
                  </div>
                ) : (
                  <p>{product.description}</p>
                )}
              </div>
            )}
          </div>

          {/* Section 2: shipping info */}
          <div className="border border-slate-100 rounded-2xl overflow-hidden bg-white shadow-sm">
            <button
              onClick={() => toggleAccordion("shipping")}
              className="w-full px-5 py-4 flex items-center justify-between text-right font-tajawal font-bold text-xs text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <span className="text-slate-400">
                {expandedSection === "shipping" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </span>
              <div className="flex items-center gap-2">
                <span>خيارات التوصيل والشحن</span>
                <Truck className="w-4 h-4 text-accent-yellow" />
              </div>
            </button>
            
            {expandedSection === "shipping" && (
              <div className="px-5 pb-5 pt-3 text-slate-600 text-xs leading-relaxed text-right border-t border-slate-50 space-y-2">
                <p>🚀 توصيل سريع وموثوق لكافة مدن المملكة ودول الخليج.</p>
                <p>📍 التوصيل داخل الرياض خلال 24-48 ساعة، ومتبقي مناطق المملكة خلال 3-5 أيام عمل.</p>
                <p>📦 شحن مجاني بالكامل لكافة سلات التسوق التي تتجاوز قيمتها 300 ر.س.</p>
              </div>
            )}
          </div>

          {/* Section 3: guarantee info */}
          <div className="border border-slate-100 rounded-2xl overflow-hidden bg-white shadow-sm">
            <button
              onClick={() => toggleAccordion("guarantee")}
              className="w-full px-5 py-4 flex items-center justify-between text-right font-tajawal font-bold text-xs text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <span className="text-slate-400">
                {expandedSection === "guarantee" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </span>
              <div className="flex items-center gap-2">
                <span>سياسة الاسترجاع والدفع الآمن</span>
                <ShieldCheck className="w-4 h-4 text-accent-yellow" />
              </div>
            </button>
            
            {expandedSection === "guarantee" && (
              <div className="px-5 pb-5 pt-3 text-slate-600 text-xs leading-relaxed text-right border-t border-slate-50 space-y-2">
                <p>💳 وسائل دفع آمنة بنسبة 100% تشمل (مدى، فيزا، ماستركارد، وأبل باي).</p>
                <p>🔄 سياسة إرجاع مرنة وسهلة: يمكنك استبدال أو إرجاع المنتج خلال 14 يوماً من استلامه بشرط أن يظل بحالته الأصلية وتغليفه الأصلي.</p>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
