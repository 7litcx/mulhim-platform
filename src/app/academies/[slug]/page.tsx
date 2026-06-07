import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, MapPin, Sparkles, Clock, ArrowRight, ShieldCheck, Award, Users } from "lucide-react";
import { getAcademyBySlug, getAcademies } from "@/sanity/lib/requests";
import { urlFor } from "@/sanity/lib/image";
import { PortableText } from "@portabletext/react";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Generate static params for all existing academies to enable static generation (SSG)
export async function generateStaticParams() {
  const academies = await getAcademies();
  return academies.filter(a => a.slug?.current).map((a) => ({
    slug: a.slug.current,
  }));
}

// Dynamic SEO metadata generation
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const academy = await getAcademyBySlug(slug);

  if (!academy) {
    return {
      title: "الأكاديمية غير موجودة | منصة ملهم",
    };
  }

  const ogImage = academy.images?.[0]
    ? urlFor(academy.images[0]).width(1200).height(630).url()
    : "/og-default.jpg";

  const cleanDescription = academy.description 
    ? (academy.description.length > 155 ? `${academy.description.substring(0, 152)}...` : academy.description)
    : "سجل في أكاديميات ملهم الرياضية والتعليمية لتطوير المهارات الرياضية والقيادية للشباب والناشئين.";

  return {
    title: `${academy.title} | منصة ملهم`,
    description: cleanDescription,
    keywords: ["ملهم", "أكاديميات ملهم", academy.title, academy.category?.title || ""],
    openGraph: {
      title: academy.title,
      description: cleanDescription,
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
  };
}


export default async function AcademyDetailsPage({ params }: PageProps) {
  const { slug } = await params;
  const academy = await getAcademyBySlug(slug);

  if (!academy) {
    notFound();
  }

  if (academy.registrationOpen === false) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
        <h1 className="text-3xl md:text-4xl font-black text-rose-500 mb-4 font-tajawal">التسجيل مغلق</h1>
        <p className="text-slate-600 mb-8 max-w-md leading-relaxed">
          نعتذر، التسجيل في هذه الأكاديمية غير متاح حالياً، ولا يمكن عرض التفاصيل. يرجى متابعة برامجنا القادمة.
        </p>
        <Link href="/academies" className="px-6 py-3 bg-primary-navy text-white rounded-xl font-bold hover:bg-slate-800 transition-colors">
          العودة للأكاديميات
        </Link>
      </div>
    );
  }

  const startDateFormatted = academy.startDate || null;

  return (
    <div className="min-h-screen pb-20 bg-slate-50/50">
      {/* Header Cover Banner */}
      <div className="relative h-[300px] md:h-[400px] bg-slate-900 overflow-hidden">
        {academy.images?.[0] && (
          <img
            src={urlFor(academy.images[0]).width(1600).height(850).url()}
            alt={academy.title}
            className="w-full h-full object-cover opacity-40 scale-105"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/70 to-transparent" />
        
        <div className="absolute inset-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-10 text-right text-white">
          <div className="space-y-4 max-w-3xl">
            <Link
              href="/academies"
              className="inline-flex items-center gap-1 text-xs text-accent-yellow hover:underline mb-2"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              العودة إلى الأكاديميات
            </Link>
            
            <div className="flex flex-wrap gap-2 justify-end">
              {academy.category?.title && (
                <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold">
                  {academy.category.title}
                </span>
              )}
              <span className="inline-flex items-center gap-1 bg-accent-yellow/20 text-accent-yellow px-3 py-1 rounded-full text-xs font-bold border border-accent-yellow/30">
                <Award className="w-3.5 h-3.5" />
                برنامج تدريبي معتمد
              </span>
            </div>
            
            <h1 className="text-2xl md:text-4xl font-extrabold leading-tight font-tajawal">
              {academy.title}
            </h1>
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Right column: Info & Rich description */}
          <div className="lg:col-span-2 space-y-8 text-right bg-white p-6 md:p-8 rounded-2xl border border-slate-100 shadow-sm">
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-800 font-tajawal font- tajawal">عن الأكاديمية</h2>
              <p className="text-slate-650 leading-relaxed text-sm">
                {academy.description}
              </p>
            </div>

            {/* Rich text Content */}
            {academy.content && academy.content.length > 0 && (
              <div className="prose prose-slate max-w-none pt-6 border-t border-slate-100 text-slate-700 leading-relaxed text-sm">
                <PortableText
                  value={academy.content}
                  components={{
                    block: {
                      h3: ({ children }) => <h3 className="text-lg font-bold text-slate-850 mt-6 mb-2 font-tajawal">{children}</h3>,
                      normal: ({ children }) => <p className="mb-4 text-slate-600">{children}</p>,
                    },
                    list: {
                      bullet: ({ children }) => <ul className="list-disc list-inside mr-5 space-y-2 mb-4">{children}</ul>,
                    },
                  }}
                />
              </div>
            )}

            {/* Trainers / Tutors List */}
            {academy.tutors && academy.tutors.length > 0 && (
              <div className="space-y-6 pt-8 border-t border-slate-100">
                <h3 className="font-bold text-slate-800 font-tajawal">المدربون المشرفون</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {academy.tutors.map((tutor: any, idx: number) => {
                    const tutorImg = tutor.avatar 
                      ? urlFor(tutor.avatar).width(150).height(150).url()
                      : "/placeholder.jpg";

                    return (
                      <div key={idx} className="flex gap-4 items-center bg-slate-50 p-4 rounded-2xl border border-slate-100 justify-end">
                        <div className="text-right">
                          <h4 className="font-bold text-slate-800 text-sm">{tutor.name}</h4>
                          <p className="text-[10px] text-accent-yellow font-medium">{tutor.role || "مدرب معتمد"}</p>
                        </div>
                        <div className="w-14 h-14 rounded-full overflow-hidden border border-white shadow-sm">
                          <img src={tutorImg} alt={tutor.name} className="w-full h-full object-cover" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Gallery */}
            {academy.images && academy.images.length > 1 && (
              <div className="space-y-4 pt-8 border-t border-slate-100">
                <h3 className="font-bold text-slate-800 font-tajawal">لقطات من بيئة التدريب</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {academy.images.slice(1).map((img: any, idx: number) => (
                    <div key={idx} className="h-32 rounded-xl overflow-hidden bg-slate-100">
                      <img
                        src={urlFor(img).width(400).height(300).url()}
                        alt={`${academy.title} snapshot ${idx + 1}`}
                        className="w-full h-full object-cover hover:scale-105 transition-all duration-300"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Left column: Sidebar actions */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6 text-right">
              {typeof academy.price !== "undefined" && academy.price !== null && (
                <div className="space-y-1">
                  <span className="text-xs text-slate-400 font-medium">قيمة الاشتراك</span>
                  <div className="text-2xl font-black text-accent-yellow font-sans">
                    {academy.price > 0 ? `${academy.price} ر.س` : "مجاني"}
                    {academy.price > 0 && <span className="text-xs text-slate-400 font-medium"> / شهرين</span>}
                  </div>
                </div>
              )}

              <div className="space-y-4 border-t border-slate-100 pt-4 text-xs font-semibold text-slate-600">
                {startDateFormatted && (
                  <div className="flex items-center gap-3 justify-end">
                    <span>{startDateFormatted}</span>
                    <Calendar className="w-5 h-5 text-accent-yellow flex-shrink-0" />
                  </div>
                )}

                <div className="flex items-center gap-3 justify-end">
                  <span>مقر ملهم أو الملاعب الشريكة</span>
                  <MapPin className="w-5 h-5 text-accent-yellow flex-shrink-0" />
                </div>

                <div className="flex items-center gap-3 justify-end">
                  <span>دفعة واحدة أو تقسيط ميسر</span>
                  <Award className="w-5 h-5 text-accent-yellow flex-shrink-0" />
                </div>
              </div>

              <Link
                href={`/register?type=academy&name=${encodeURIComponent(academy.title)}`}
                className="w-full block text-center py-4 bg-accent-teal hover:bg-primary-teal text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all duration-300"
              >
                انضم الآن وسجل اهتمامك
              </Link>
              
              <p className="text-[10px] text-slate-400 text-center leading-normal">
                سنقوم بالتواصل معكم في غضون 24 ساعة لشرح كافة خطوات الحضور والجدول الزمني.
              </p>
            </div>

            {/* Quality badge */}
            <div className="bg-yellow-50 border border-yellow-100 p-4 rounded-2xl flex items-start gap-3 text-right justify-end">
              <div className="space-y-1 text-right">
                <h4 className="text-xs font-bold text-slate-800">جودة وضمان مُلهم</h4>
                <p className="text-[10px] text-slate-500 leading-normal">
                  نضمن بيئة تربوية وتدريبية احترافية، مع توفير كافة الاحترازات ووسائل السلامة لمشاركينا الأعزاء.
                </p>
              </div>
              <ShieldCheck className="w-5 h-5 text-accent-yellow mt-0.5 flex-shrink-0" />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
