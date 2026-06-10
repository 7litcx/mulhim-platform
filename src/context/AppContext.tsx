"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from "lucide-react";
import { supabase } from "@/utils/supabase";

// Helper to generate UUIDs for Supabase tables
const generateUUID = () => {
  if (typeof window !== "undefined" && window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// Types
interface Toast {
  id: string;
  message: string;
  type: "success" | "error" | "info" | "warning";
}

// Types
interface Product {
  id: string;
  name: string;
  price: number;
  category: "all" | "t-shirts" | "sweaters" | "caps" | "perfumes" | "accessories" | "bottles";
  image: string;
  description: string;
  isNew?: boolean;
}

interface Trip {
  id: string;
  title: string;
  type: "adventure" | "spiritual" | "recreational";
  typeName: string;
  price: number;
  date: string;
  location: string;
  image: string;
  description: string;
  highlights: string[];
}

interface Academy {
  id: string;
  title: string;
  ageGroup: string;
  schedule: string;
  coachName: string;
  coachTitle: string;
  coachImage: string;
  coachBio: string;
  image: string;
  price: number;
  description: string;
  category: string;
}

interface Program {
  id: string;
  title: string;
  target: "girls" | "boys";
  category: "developmental" | "skills" | "sports" | "youth" | "tournaments" | "seasonal";
  categoryName: string;
  date: string;
  image: string;
  description: string;
  price: number;
}

interface CartItem {
  product: Product;
  quantity: number;
}

interface Registration {
  id: string;
  fullName: string;
  age: number;
  phone: string;
  email: string;
  interests: string[];
  type: "trip" | "academy" | "program" | "volunteer";
  targetName: string;
  date: string;
  status: "pending" | "approved" | "completed";
  paymentMethod?: string;
  extraData?: any; // For custom forms like summer program
}

interface Child {
  id: string;
  parent_id: string;
  full_name: string;
  gender: string;
  grade: string;
}

interface Order {
  id: string;
  customerName: string;
  phone: string;
  email: string;
  items: CartItem[];
  total: number;
  paymentMethod: string;
  status: "pending" | "paid" | "shipped";
  date: string;
}

interface AppContextType {
  products: Product[];
  trips: Trip[];
  academies: Academy[];
  programs: Program[];
  cart: CartItem[];
  registrations: Registration[];
  familyChildren: Child[];
  orders: Order[];
  currentUser: { id?: string; fullName: string; email: string; phone: string; guardian2Name?: string; guardian2Phone?: string; role?: "user" | "admin"; } | null;
  toasts: Toast[];
  showToast: (message: string, type?: Toast["type"]) => void;
  
  // E-commerce Actions
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  
  // Dashboard & Addition Actions
  addProduct: (product: Omit<Product, "id">) => void;
  addTrip: (trip: Omit<Trip, "id">) => void;
  addAcademy: (academy: Omit<Academy, "id">) => void;
  addProgram: (program: Omit<Program, "id">) => void;
  deleteProduct: (id: string) => void;
  deleteTrip: (id: string) => void;
  deleteAcademy: (id: string) => void;
  deleteProgram: (id: string) => void;
  
  // Registration and Checkout
  addFamilyChild: (child: Omit<Child, "id" | "parent_id">) => Promise<void>;
  registerUser: (reg: Omit<Registration, "id" | "date" | "status">) => Promise<void>;
  placeOrder: (order: Omit<Order, "id" | "date" | "status" | "items" | "total">) => Promise<string>;
  updateOrderStatus: (id: string, status: Order["status"]) => Promise<void>;
  updateRegStatus: (id: string, status: Registration["status"]) => Promise<void>;
  loginUser: (fullName: string, email: string, phone: string, password?: string, isSignUp?: boolean, guardian2Name?: string, guardian2Phone?: string) => Promise<void>;
  logoutUser: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Initial Static Data (Preloaded to match the UI screens)
const defaultProducts: Product[] = [
  {
    id: "p1",
    name: "هودي ملهم كلاسيك",
    price: 180,
    category: "sweaters",
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&q=80&w=600",
    description: "قطن عضوي ١٠٠٪، مريح وعصري ومناسب لجميع الأجواء.",
    isNew: true
  },
  {
    id: "p2",
    name: "قبعة ملهم الرياضية",
    price: 85,
    category: "caps",
    image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?auto=format&fit=crop&q=80&w=600",
    description: "تصميم عصري قابل للتعديل ومقاوم للتعرق.",
  },
  {
    id: "p3",
    name: "عطر \"إلهام\"",
    price: 250,
    category: "perfumes",
    image: "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&q=80&w=600",
    description: "رائحة فريدة تمزج بين الأصالة والحداثة.",
    isNew: true
  },
  {
    id: "p4",
    name: "مطارة مياه ستيل",
    price: 95,
    category: "bottles",
    image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?auto=format&fit=crop&q=80&w=600",
    description: "تحتفظ بالحرارة والبرودة لمدة ٢٤ ساعة.",
  },
  {
    id: "p5",
    name: "تيشيرت \"كن ملهماً\"",
    price: 110,
    category: "t-shirts",
    image: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&q=80&w=600",
    description: "أسود ملكي بتصميم بسيط ومميز.",
  },
  {
    id: "p6",
    name: "مجموعة جوارب رياضية",
    price: 45,
    category: "accessories",
    image: "https://images.unsplash.com/photo-1582966772680-860e372bb558?auto=format&fit=crop&q=80&w=600",
    description: "طقم من ٣ أزواج، ناعمة وممتصة للرطوبة.",
  },
  {
    id: "p7",
    name: "ساعة ملهم الرقمية",
    price: 320,
    category: "accessories",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&q=80&w=600",
    description: "مقاومة للماء، تتبع النشاط اليومي وتدعم العربية.",
  },
  {
    id: "p8",
    name: "حقيبة الظهر \"مغامر\"",
    price: 290,
    category: "accessories",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=600",
    description: "مساحة واسعة وحماية كاملة للكمبيوتر المحمول.",
  }
];

const defaultTrips: Trip[] = [
  {
    id: "t1",
    title: "استكشاف أعماق الصحراء المغربية",
    type: "adventure",
    typeName: "رحلات مغامرة",
    price: 2400,
    date: "15 - 22 أكتوبر 2026",
    location: "مرزوكة، المغرب",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=600",
    description: "رحلة لقلب الصحراء، استكشاف الواحات، ركوب الجمال ومخيمات بدوية ساحرة تحت النجوم.",
    highlights: ["تخييم فاخر في الصحراء", "جولات دفع رباعي وتزلج رملي", "استكشاف التراث الأمازيغي"]
  },
  {
    id: "t2",
    title: "رحلة إيمانية لمكة والمدينة",
    type: "spiritual",
    typeName: "رحلات إيمانية",
    price: 1200,
    date: "05 - 08 ديسمبر 2026",
    location: "مكة المكرمة والمدينة المنورة",
    image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&q=80&w=600",
    description: "تجربة روحانية فريدة تشمل أداء العمرة وزيارة الحرمين الشريفين والمعالم التاريخية الإسلامية.",
    highlights: ["أداء مناسك العمرة", "زيارة المعالم النبوية والتاريخية", "جلسات إيمانية وتوعوية"]
  },
  {
    id: "t3",
    title: "مغامرة الهايكنج في جبال عسير",
    type: "adventure",
    typeName: "رحلات مغامرة",
    price: 850,
    date: "12 - 14 نوفمبر 2026",
    location: "أبها، عسير",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=600",
    description: "تحدي هايكنج في المرتفعات الخضراء، تجربة تسلق الجبال والتخييم في أجواء رائعة وبإشراف مدربين محترفين.",
    highlights: ["مسارات هايكنج بمستويات مختلفة", "تخييم جبلي وسهرة شواء", "توثيق فوتوغرافي كامل"]
  },
  {
    id: "t4",
    title: "رحلة ترفيهية في شواطئ نيوم",
    type: "recreational",
    typeName: "رحلات ترفيهية",
    price: 1800,
    date: "20 - 23 ديسمبر 2026",
    location: "نيوم، تبوك",
    image: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&q=80&w=600",
    description: "استمتع بأجمل الوجهات الشاطئية والأنشطة الرياضية البحرية الفاخرة مع شباب ملهم.",
    highlights: ["رحلات بحرية وغوص سطحي", "ألعاب شاطئية وبطولة طائرة", "زيارة معالم نيوم الساحلية"]
  }
];

const defaultAcademies: Academy[] = [
  {
    id: "a1",
    title: "أكاديمية كرة القدم",
    ageGroup: "9 - 15 سنة",
    schedule: "الأحد والثلاثاء: 4:00 م - 7:00 م (رياضية)",
    coachName: "أحمد المنصور",
    coachTitle: "مدرب أكاديمية كرة القدم",
    coachImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300",
    coachBio: "خبرة ١٢ عاماً في تدريب الناشئين، حاصل على رخصة التدريب الآسيوية A.",
    image: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=600",
    price: 450,
    description: "برنامج تدريبي متكامل يركز على أساسيات اللعبة، اللياقة البدنية والروح الرياضية والعمل الجماعي.",
    category: "sports"
  },
  {
    id: "a2",
    title: "أكاديمية السباحة",
    ageGroup: "8 - 14 سنة",
    schedule: "الاثنين والأربعاء: 5:00 م - 8:00 م (رياضية)",
    coachName: "خالد فيصل",
    coachTitle: "مدرب سباحة أول",
    coachImage: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=300",
    coachBio: "بطل وطني سابق في السباحة الحرة، مؤهل للإنقاذ والتدريب المتقدم للناشئين.",
    image: "https://images.unsplash.com/photo-1519766304817-4f37bda74a27?auto=format&fit=crop&q=80&w=600",
    price: 550,
    description: "تعلم فنون السباحة من الصفر حتى الاحتراف في مسابح مغلقة ومجهزة بأحدث وسائل الأمان.",
    category: "sports"
  },
  {
    id: "a3",
    title: "أكاديمية القيادة",
    ageGroup: "16 - 22 سنة",
    schedule: "السبت: 5:00 م - 8:00 م (تطويرية)",
    coachName: "سارة الغامدي",
    coachTitle: "خبير تدريب القيادة",
    coachImage: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=300",
    coachBio: "مستشارة معتمدة في القيادة وتطوير الذات، دربت أكثر من ٥٠٠٠ شاب وفتاة.",
    image: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&q=80&w=600",
    price: 600,
    description: "بناء الشخصية القيادية، تعزيز مهارات التفاوض والتحدث أمام الجمهور وإدارة المشاريع الشبابية.",
    category: "leadership"
  },
  {
    id: "a4",
    title: "أكاديمية الفنون التشكيلية",
    ageGroup: "كافة الأعمار",
    schedule: "الأحد والأربعاء: 4:00 م - 8:00 م (فنية ومواهب)",
    coachName: "ليلى العبدالله",
    coachTitle: "فنانة تشكيلية ومدربة",
    coachImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=300",
    coachBio: "حاصلة على ماجستير الفنون الجميلة، شاركت في معارض محلية ودولية متعددة.",
    image: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?auto=format&fit=crop&q=80&w=600",
    price: 400,
    description: "اكتشف شغفك الفني وتعلم الرسم بالألوان الزيتية، الأكريليك وتقنيات النحت والخط العربي.",
    category: "skills"
  }
];

const defaultPrograms: Program[] = [
  // Girls Programs
  {
    id: "pr1",
    title: "برنامج تطوير المهارات الرقمية للفتيات",
    target: "girls",
    category: "skills",
    categoryName: "الأنشطة المهارية",
    date: "يبدأ 1 سبتمبر - 3 أيام بالأسبوع",
    image: "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?auto=format&fit=crop&q=80&w=600",
    price: 350,
    description: "تأهيل وتدريب الفتيات على مهارات البرمجة، التصميم الجرافيكي وصناعة المحتوى الإبداعي."
  },
  {
    id: "pr2",
    title: "مخيم القياديات الواعدات",
    target: "girls",
    category: "developmental",
    categoryName: "البرامج التطويرية",
    date: "15 - 20 سبتمبر",
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=600",
    price: 450,
    description: "ورش عمل ولقاءات حوارية تهدف لبناء الشخصية وتعلم التفكير الاستراتيجي والذكاء الاجتماعي للفتيات."
  },
  {
    id: "pr3",
    title: "بطولة التنس والأنشطة الترفيهية",
    target: "girls",
    category: "sports",
    categoryName: "الأنشطة الرياضية والترفيهية",
    date: "كل خميس وجمعة في أكتوبر",
    image: "https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&q=80&w=600",
    price: 200,
    description: "مساحة آمنة ومجهزة لممارسة رياضة التنس وكرة السلة والعديد من الفعاليات الترفيهية الممتعة."
  },
  // Boys Programs
  {
    id: "pr4",
    title: "برنامج القادة الشباب",
    target: "boys",
    category: "youth",
    categoryName: "البرامج الشبابية",
    date: "10 سبتمبر - 20 سبتمبر",
    image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&q=80&w=600",
    price: 400,
    description: "تنمية مهارات التخطيط، إلقاء الخطابات، إدارة الفرق وبناء المبادرات التطوعية المجتمعية للبنين."
  },
  {
    id: "pr5",
    title: "بطولة ملهم للفروسية والرماية",
    target: "boys",
    category: "tournaments",
    categoryName: "البطولات",
    date: "12 - 15 نوفمبر",
    image: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?auto=format&fit=crop&q=80&w=600",
    price: 300,
    description: "بطولة تنافسية تعيد إحياء الرياضات الأصيلة بمشاركة فرسان ورماة محترفين لتوجيه وتدريب الشباب."
  },
  {
    id: "pr6",
    title: "المخيم الشتوي الاستكشافي",
    target: "boys",
    category: "seasonal",
    categoryName: "الفعاليات الموسمية",
    date: "15 - 20 يناير 2027",
    image: "https://images.unsplash.com/photo-1533240332313-0db49b459ad6?auto=format&fit=crop&q=80&w=600",
    price: 500,
    description: "مغامرة موسمية في ربوع الطبيعة الشتوية، تشمل ركوب الدراجات الجبلية، الرماية وتعلم مهارات البقاء والاعتماد على الذات."
  }
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(defaultProducts);
  const [trips, setTrips] = useState<Trip[]>(defaultTrips);
  const [academies, setAcademies] = useState<Academy[]>(defaultAcademies);
  const [programs, setPrograms] = useState<Program[]>(defaultPrograms);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [familyChildren, setFamilyChildren] = useState<Child[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentUser, setCurrentUser] = useState<{ id?: string; fullName: string; email: string; phone: string; guardian2Name?: string; guardian2Phone?: string; role?: "user" | "admin"; } | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = React.useCallback((message: string, type: Toast["type"] = "info") => {
    const id = "toast_" + Date.now() + "_" + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sync state with LocalStorage and Supabase on client side
  useEffect(() => {
    // 1. Initial LocalStorage fetch
    const localProducts = localStorage.getItem("mulhim_products");
    const localTrips = localStorage.getItem("mulhim_trips");
    const localAcademies = localStorage.getItem("mulhim_academies");
    const localPrograms = localStorage.getItem("mulhim_programs");
    const localCart = localStorage.getItem("mulhim_cart");
    const localRegs = localStorage.getItem("mulhim_registrations");
    const localChildren = localStorage.getItem("mulhim_children");
    const localOrders = localStorage.getItem("mulhim_orders");
    const localUser = localStorage.getItem("mulhim_user");

    if (localProducts) setProducts(JSON.parse(localProducts));
    if (localTrips) setTrips(JSON.parse(localTrips));
    if (localAcademies) setAcademies(JSON.parse(localAcademies));
    if (localPrograms) setPrograms(JSON.parse(localPrograms));
    if (localCart) setCart(JSON.parse(localCart));
    if (localRegs) setRegistrations(JSON.parse(localRegs));
    if (localChildren) setFamilyChildren(JSON.parse(localChildren));
    if (localOrders) setOrders(JSON.parse(localOrders));
    if (localUser) setCurrentUser(JSON.parse(localUser));

    // 2. Real-time Supabase Auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        // Fetch user profile from Supabase profiles
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        const user = {
          id: session.user.id,
          fullName: profile?.full_name || session.user.user_metadata.full_name || session.user.email?.split("@")[0] || "عضو ملهم",
          email: session.user.email || "",
          phone: profile?.phone || session.user.user_metadata.phone || "",
          guardian2Name: profile?.guardian2_name || session.user.user_metadata.guardian2_name || "",
          guardian2Phone: profile?.guardian2_phone || session.user.user_metadata.guardian2_phone || "",
          role: profile?.role || "user"
        };
        setCurrentUser(user);
        saveToLocalStorage("mulhim_user", user);

        // Fetch user's children and registrations from Supabase concurrently
        const [
          { data: regsData },
          { data: childrenData },
          { data: ordersData }
        ] = await Promise.all([
          supabase
            .from("registrations")
            .select("*")
            .or(`user_id.eq.${session.user.id},email.eq.${session.user.email}`),
          supabase
            .from("children")
            .select("*")
            .eq("parent_id", session.user.id),
          supabase
            .from("orders")
            .select("*, order_items(*)")
            .or(`user_id.eq.${session.user.id},email.eq.${session.user.email}`)
        ]);

        if (regsData) {
          const formattedRegs: Registration[] = regsData.map((r: any) => ({
            id: r.id,
            fullName: r.full_name,
            age: r.age || 0,
            phone: r.phone || "",
            email: r.email || "",
            interests: r.interests || [],
            type: r.type,
            targetName: r.target_name || "",
            date: new Date(r.created_at).toLocaleDateString("ar-SA"),
            status: r.status || "pending",
            paymentMethod: r.payment_method
          }));
          setRegistrations(formattedRegs);
          saveToLocalStorage("mulhim_registrations", formattedRegs);
        }

        if (childrenData) {
          setFamilyChildren(childrenData);
          saveToLocalStorage("mulhim_children", childrenData);
        }

        if (ordersData) {
          const formattedOrders: Order[] = ordersData.map((o: any) => ({
            id: o.id,
            customerName: o.customer_name,
            phone: o.phone,
            email: o.email,
            total: Number(o.total),
            paymentMethod: o.payment_method,
            status: o.status,
            date: new Date(o.created_at).toLocaleDateString("ar-SA"),
            items: (o.order_items || []).map((oi: any) => ({
              product: {
                id: oi.product_id,
                name: oi.product_name,
                price: Number(oi.price),
                category: "all",
                image: "",
                description: ""
              },
              quantity: oi.quantity
            }))
          }));
          setOrders(formattedOrders);
          saveToLocalStorage("mulhim_orders", formattedOrders);
        }
      } else {
        const localUserAfter = localStorage.getItem("mulhim_user");
        if (!localUserAfter) {
          setCurrentUser(null);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  function saveToLocalStorage(key: string, data: any) {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(key, JSON.stringify(data));
      } catch (e) {
        console.error("Error saving to local storage:", e);
      }
    }
  }

  // E-commerce Cart Logic
  const addToCart = (product: Product) => {
    const updated = [...cart];
    const index = updated.findIndex((item) => item.product.id === product.id);
    if (index > -1) {
      updated[index].quantity += 1;
    } else {
      updated.push({ product, quantity: 1 });
    }
    setCart(updated);
    saveToLocalStorage("mulhim_cart", updated);
  };

  const removeFromCart = (productId: string) => {
    const updated = cart.filter((item) => item.product.id !== productId);
    setCart(updated);
    saveToLocalStorage("mulhim_cart", updated);
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    const updated = cart.map((item) =>
      item.product.id === productId ? { ...item, quantity } : item
    );
    setCart(updated);
    saveToLocalStorage("mulhim_cart", updated);
  };

  const clearCart = () => {
    setCart([]);
    saveToLocalStorage("mulhim_cart", []);
  };

  // Dashboard additions (Admin)
  const addProduct = (p: Omit<Product, "id">) => {
    const newP: Product = { ...p, id: "p_" + Date.now() };
    setProducts((prev) => {
      const updated = [newP, ...prev];
      saveToLocalStorage("mulhim_products", updated);
      return updated;
    });
  };

  const addTrip = (t: Omit<Trip, "id">) => {
    const newT: Trip = { ...t, id: "t_" + Date.now() };
    setTrips((prev) => {
      const updated = [newT, ...prev];
      saveToLocalStorage("mulhim_trips", updated);
      return updated;
    });
  };

  const addAcademy = (a: Omit<Academy, "id">) => {
    const newA: Academy = { ...a, id: "a_" + Date.now() };
    setAcademies((prev) => {
      const updated = [newA, ...prev];
      saveToLocalStorage("mulhim_academies", updated);
      return updated;
    });
  };

  const addProgram = (pr: Omit<Program, "id">) => {
    const newPr: Program = { ...pr, id: "pr_" + Date.now() };
    setPrograms((prev) => {
      const updated = [newPr, ...prev];
      saveToLocalStorage("mulhim_programs", updated);
      return updated;
    });
  };

  // Dashboard deletions
  const deleteProduct = (id: string) => {
    setProducts((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      saveToLocalStorage("mulhim_products", updated);
      return updated;
    });
  };

  const deleteTrip = (id: string) => {
    setTrips((prev) => {
      const updated = prev.filter((t) => t.id !== id);
      saveToLocalStorage("mulhim_trips", updated);
      return updated;
    });
  };

  const deleteAcademy = (id: string) => {
    setAcademies((prev) => {
      const updated = prev.filter((a) => a.id !== id);
      saveToLocalStorage("mulhim_academies", updated);
      return updated;
    });
  };

  const deleteProgram = (id: string) => {
    setPrograms((prev) => {
      const updated = prev.filter((pr) => pr.id !== id);
      saveToLocalStorage("mulhim_programs", updated);
      return updated;
    });
  };

  // Family / Child Actions
  const addFamilyChild = async (child: Omit<Child, "id" | "parent_id">) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || currentUser?.id;
      
      if (!userId) throw new Error("User not found");

      const { data: newChild, error: childErr } = await supabase
        .from("children")
        .insert({
          parent_id: userId,
          full_name: child.full_name.trim(),
          gender: child.gender,
          grade: child.grade
        })
        .select()
        .single();

      if (childErr) throw childErr;

      if (newChild) {
        setFamilyChildren((prev) => {
          // avoid duplicate
          if (prev.some(c => c.id === newChild.id)) return prev;
          const updated = [...prev, newChild];
          saveToLocalStorage("mulhim_children", updated);
          return updated;
        });
      }
    } catch (err) {
      console.error("Error adding child:", err);
      throw err;
    }
  };

  // Registration Actions
  const registerUser = async (reg: Omit<Registration, "id" | "date" | "status">) => {
    // Check if this person is already registered for this activity
    const normalizeString = (str: string) => str.trim().replace(/\s+/g, " ");
    
    const isAlreadyRegistered = registrations.some(
      (r) => normalizeString(r.fullName) === normalizeString(reg.fullName) && r.targetName === reg.targetName
    );

    if (isAlreadyRegistered && reg.extraData?.formType !== "summer_program") {
      showToast("تم التسجيل مسبقاً في هذا البرنامج", "error");
      throw new Error("Already registered");
    }

    const tempId = generateUUID();
    const newReg: Registration = {
      ...reg,
      id: tempId,
      date: new Date().toLocaleDateString("ar-SA"),
      status: "pending"
    };

    // Sync with Supabase
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const userId = user?.id || currentUser?.id;
      
      if (userId) {
        let childId: string | null = null;

        // If it's a child registration (program/academy/trip), insert/select child
        if (reg.type !== "volunteer") {
          // Check if child already exists
          console.log('2. Checking existing child...');
          const { data: existingChild } = await supabase
            .from("children")
            .select("id")
            .eq("parent_id", userId)
            .eq("full_name", reg.fullName.trim())
            .maybeSingle();
          console.log('2. Existing child check done. Found:', !!existingChild);

          if (existingChild) {
            childId = existingChild.id;
          } else {
            // Determine gender and grade
            const gender = reg.targetName.includes("أنثى") ? "أنثى" : "ذكر";
            let grade = "غير محدد";
            if (reg.targetName.includes("الصف")) {
              const parts = reg.targetName.split("-");
              if (parts.length > 1) {
                grade = parts[1].split("(")[0].trim();
              }
            }

        console.log('3. Inserting child...');
        const { data: newChild, error: childErr } = await supabase
          .from("children")
          .insert({
            parent_id: userId,
            full_name: reg.fullName.trim(),
            gender,
            grade
          })
          .select()
          .single();
        console.log('3. Child insert done.');

        if (childErr) {
          console.error("Error inserting child to Supabase:", childErr);
        }

        if (newChild) {
          childId = newChild.id;
        }
      }
    }

    // Insert registration record
    const targetId = reg.targetName.includes(":") ? reg.targetName.split(":")[1]?.trim() : reg.targetName.replace(/\s+/g, "-");

    console.log('4. Inserting registration...');
    const { error: regErr } = await supabase.from("registrations").insert({
      id: tempId,
      user_id: userId,
      child_id: childId,
      full_name: reg.fullName,
      age: reg.age || null,
      phone: reg.phone,
      email: reg.email,
      interests: reg.interests,
      type: reg.type,
      target_id: targetId,
      target_name: reg.targetName,
      status: "pending",
      payment_method: reg.paymentMethod, // Added payment_method directly
      extra_data: {
        ...(reg.extraData || {}),
        paymentMethod: reg.paymentMethod
      }
    });
    console.log('4. Registration insert done.');

    if (regErr) {
      console.error("Error inserting registration to Supabase:", regErr);
      showToast("حدث خطأ أثناء حفظ البيانات: " + regErr.message, "error");
      throw new Error(regErr.message);
    }
    
    // Only update local state if Supabase insert was successful
    setRegistrations((prev) => {
      const updated = [newReg, ...prev];
      saveToLocalStorage("mulhim_registrations", updated);
      return updated;
    });
  }
} catch (e: any) {
  console.error("Error inserting registration to Supabase:", e);
  showToast("حدث خطأ غير متوقع أثناء الحفظ: " + (e?.message || e), "error");
  throw e;
}
};

// Order Placement
const placeOrder = async (ord: Omit<Order, "id" | "date" | "status" | "items" | "total">): Promise<string> => {
const orderId = generateUUID();
const baseTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
const discount = ord.paymentMethod.includes("خصم") ? 100 : 0;
const total = Math.max(0, baseTotal - discount);
const newOrder: Order = {
  ...ord,
  id: orderId,
  items: [...cart],
  total,
  date: new Date().toLocaleDateString("ar-SA"),
  status: ord.paymentMethod.includes("بطاقة") ? "paid" : "pending"
};

// Sync with Supabase via API route to bypass RLS and securely insert order items
try {
  const { data: { session } } = await supabase.auth.getSession();
  const userId = session?.user?.id || currentUser?.id || null;

  const itemsToInsert = cart.map((item) => ({
    order_id: orderId,
    product_id: item.product.id,
    product_name: item.product.name,
    price: item.product.price,
    quantity: item.quantity
  }));

  const res = await fetch("/api/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      orderId,
      userId,
      customerName: ord.customerName,
      phone: ord.phone,
      email: ord.email,
      total,
      paymentMethod: ord.paymentMethod,
      status: ord.paymentMethod.includes("بطاقة") ? "paid" : "pending",
      items: itemsToInsert
    })
  });

  const data = await res.json();

  if (data.success) {
    showToast("تم تأكيد وحفظ طلبك بنجاح في قاعدة البيانات!", "success");
    setOrders((prev) => {
      const updated = [newOrder, ...prev];
      saveToLocalStorage("mulhim_orders", updated);
      return updated;
    });
  } else {
    console.error("Error saving order via API:", data.error);
    showToast("فشل حفظ الطلب في قاعدة البيانات: " + data.error, "error");
  }
} catch (e: any) {
  console.error("Error calling order API:", e);
  showToast("خطأ غير متوقع في الاتصال بخادم الطلبات: " + (e?.message || e), "error");
}

    clearCart();
    return orderId;
  };

  const updateOrderStatus = async (id: string, status: Order["status"]) => {
    setOrders((prev) => {
      const updated = prev.map((o) => (o.id === id ? { ...o, status } : o));
      saveToLocalStorage("mulhim_orders", updated);
      return updated;
    });

    try {
      await supabase
        .from("orders")
        .update({ status })
        .eq("id", id);
    } catch (e) {
      console.error("Error updating order status in Supabase:", e);
    }
  };

  const updateRegStatus = async (id: string, status: Registration["status"]) => {
    setRegistrations((prev) => {
      const updated = prev.map((r) => (r.id === id ? { ...r, status } : r));
      saveToLocalStorage("mulhim_registrations", updated);
      return updated;
    });

    try {
      await supabase
        .from("registrations")
        .update({ status })
        .eq("id", id);
    } catch (e) {
      console.error("Error updating registration status in Supabase:", e);
    }
  };

  // Auth actions
  const loginUser = async (fullName: string, email: string, phone: string, password?: string, isSignUp?: boolean, guardian2Name?: string, guardian2Phone?: string) => {
    if (password) {
      if (isSignUp) {
        // 1. Sign up using Supabase auth
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              phone: phone,
              guardian2_name: guardian2Name,
              guardian2_phone: guardian2Phone
            }
          }
        });

        if (error) {
          showToast(`خطأ في إنشاء الحساب: ${error.message}`, "error");
          throw error;
        }

        if (data.user) {
          const user = {
            id: data.user.id,
            fullName,
            email,
            phone,
            role: "user" as const,
            guardian2Name,
            guardian2Phone
          };
          setCurrentUser(user);
          saveToLocalStorage("mulhim_user", user);
          showToast("تم إنشاء الحساب بنجاح!", "success");
        }
      } else {
        // 2. Sign in using Supabase auth
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
          // Translate common Supabase auth errors to Arabic
          let arabicMessage = error.message;
          if (error.message?.includes("Email not confirmed")) {
            arabicMessage = "البريد الإلكتروني لم يتم تأكيده بعد. تحقق من بريدك وانقر رابط التأكيد.";
          } else if (error.message?.includes("Invalid login credentials")) {
            arabicMessage = "البريد الإلكتروني أو كلمة المرور غير صحيحة.";
          } else if (error.message?.includes("Too many requests")) {
            arabicMessage = "محاولات كثيرة جداً. انتظر دقيقة ثم أعد المحاولة.";
          } else if (error.message?.includes("User not found")) {
            arabicMessage = "لا يوجد حساب مسجل بهذا البريد الإلكتروني.";
          }
          showToast(`خطأ: ${arabicMessage}`, "error");
          throw error;
        }

        if (data?.user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", data.user.id)
            .single();

          const user = {
            id: data.user.id,
            fullName: profile?.full_name || data.user.user_metadata.full_name || fullName,
            email: data.user.email || email,
            phone: profile?.phone || data.user.user_metadata.phone || phone,
            role: (profile?.role || "user") as "user" | "admin", // <-- تأكد من جلب الصلاحية هنا
            guardian2Name: profile?.guardian2_name || data.user.user_metadata.guardian2_name || "",
            guardian2Phone: profile?.guardian2_phone || data.user.user_metadata.guardian2_phone || ""
          };
          setCurrentUser(user);
          saveToLocalStorage("mulhim_user", user);
          showToast("تم تسجيل الدخول بنجاح!", "success");
        }
      }
    } else {
      // Simulated Auth fallback
      const user = { fullName, email, phone, role: "user" as const, guardian2Name, guardian2Phone };
      setCurrentUser(user);
      saveToLocalStorage("mulhim_user", user);
      showToast("تم تسجيل الدخول (نمط محاكاة)", "info");
    }
  };

  const logoutUser = async () => {
    // Clear local state and localStorage immediately to ensure instant UI response and prevent race conditions
    setCurrentUser(null);
    localStorage.removeItem("mulhim_user");
    showToast("تم تسجيل الخروج", "info");

    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error("Error during Supabase signout:", e);
    }
  };

  return (
    <AppContext.Provider
      value={{
        products,
        trips,
        academies,
        programs,
        cart,
        registrations,
        familyChildren,
        orders,
        currentUser,
        toasts,
        showToast,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        addProduct,
        addTrip,
        addAcademy,
        addProgram,
        deleteProduct,
        deleteTrip,
        deleteAcademy,
        deleteProgram,
        addFamilyChild,
        registerUser,
        placeOrder,
        updateOrderStatus,
        updateRegStatus,
        loginUser,
        logoutUser
      }}
    >
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </AppContext.Provider>
  );
};

const ToastItem: React.FC<{ toast: Toast; onClose: () => void }> = ({ toast, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const config = {
    success: {
      bg: "bg-emerald-50/95 border-emerald-100 text-emerald-800",
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />,
      bar: "bg-emerald-500",
    },
    error: {
      bg: "bg-rose-50/95 border-rose-100 text-rose-800",
      icon: <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />,
      bar: "bg-rose-500",
    },
    warning: {
      bg: "bg-amber-50/95 border-amber-100 text-amber-800",
      icon: <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />,
      bar: "bg-amber-500",
    },
    info: {
      bg: "bg-blue-50/95 border-blue-100 text-blue-800",
      icon: <Info className="w-5 h-5 text-blue-500 flex-shrink-0" />,
      bar: "bg-blue-500",
    },
  };

  const style = config[toast.type] || config.info;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.2 } }}
      className={`flex items-center gap-3 border shadow-xl rounded-2xl p-4 pr-3 pl-4 max-w-sm pointer-events-auto backdrop-blur-md relative overflow-hidden ${style.bg}`}
      dir="rtl"
    >
      {style.icon}
      <p className="text-xs font-bold font-tajawal flex-grow leading-relaxed">
        {toast.message}
      </p>
      <button
        type="button"
        onClick={onClose}
        className="p-1 hover:bg-black/5 rounded-full transition-colors flex-shrink-0"
      >
        <X className="w-3.5 h-3.5 opacity-60 hover:opacity-100" />
      </button>

      {/* Progress Bar */}
      <motion.div
        initial={{ width: "100%" }}
        animate={{ width: "0%" }}
        transition={{ duration: 4, ease: "linear" }}
        className={`absolute bottom-0 right-0 left-0 h-0.5 ${style.bar}`}
      />
    </motion.div>
  );
};

const ToastContainer: React.FC<{ toasts: Toast[]; onRemove: (id: string) => void }> = ({
  toasts,
  onRemove,
}) => {
  return (
    <div className="fixed bottom-6 left-6 z-50 flex flex-col gap-3 pointer-events-none max-w-sm w-full">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onClose={() => onRemove(toast.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
