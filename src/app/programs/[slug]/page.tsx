import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, MapPin, Sparkles, Clock, ArrowRight, ShieldCheck, DollarSign } from "lucide-react";
import { getProgramBySlug, getPrograms } from "@/sanity/lib/requests";
import { urlFor } from "@/sanity/lib/image";
import { PortableText } from "@portabletext/react";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Generate static params for all existing programs to enable static generation (SSG)
export async function generateStaticParams() {
  const programs = await getPrograms();
  return programs.map((p) => ({
    slug: p.slug.current,
  }));
}

// Dynamic SEO metadata generation
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const program = await getProgramBySlug(slug);

  if (!program) {
    return {
      title: "البرنامج غير موجود | منصة ملهم",
    };
  }

  const ogImage = program.images?.[0]
    ? urlFor(program.images[0]).width(1200).height(630).url()
    : "/og-default.jpg";

  const cleanDescription = program.description 
    ? (program.description.length > 155 ? `${program.description.substring(0, 152)}...` : program.description)
    : "شارك في برامج ملهم التطويرية والتعليمية التي تهدف لبناء المهارات والقيم القيادية بطريقة تفاعلية وممتعة.";

  return {
    title: `${program.title} | منصة ملهم`,
    description: cleanDescription,
    keywords: ["ملهم", "برامج ملهم", program.title, program.category?.title || ""],
    openGraph: {
      title: program.title,
      description: cleanDescription,
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
  };
}


export default async function ProgramDetailsPage({ params }: PageProps) {
  const { slug } = await params;
  const program = await getProgramBySlug(slug);

  if (!program) {
    notFound();
  }

  const startDateFormatted = new Date(program.startDate).toLocaleDateString("ar-SA", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen pb-20 bg-slate-50/50">
      {/* Header Banner */}
      <div className="relative h-[300px] md:h-[400px] bg-slate-900 overflow-hidden">
        {program.images?.[0] && (
          <img
            src={urlFor(program.images[0]).width(1600).height(800).url()}
            alt={program.title}
            className="w-full h-full object-cover opacity-40 scale-105"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/70 to-transparent" />
        
        <div className="absolute inset-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-10 text-right text-white">
          <div className="space-y-4 max-w-3xl">
            <Link
              href="/programs"
              className="inline-flex items-center gap-1 text-xs text-accent-yellow hover:underline mb-2"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              العودة إلى البرامج
            </Link>
            
            <div className="flex flex-wrap gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                program.target === "girls" ? "bg-rose-600/90" : program.target === "boys" ? "bg-blue-600/90" : "bg-yellow-600/90"
              }`}>
                {program.target === "girls" ? "للفتيات" : program.target === "boys" ? "للبنين" : "عام للجميع"}
              </span>
              {program.category?.title && (
                <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold">
                  {program.category.title}
                </span>
              )}
            </div>
            
            <h1 className="text-2xl md:text-4xl font-extrabold leading-tight font-tajawal">
              {program.title}
            </h1>
          </div>
        </div>
      </div>

      {/* Main Details Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Right Side: Description and Details */}
          <div className="lg:col-span-2 space-y-8 text-right bg-white p-6 md:p-8 rounded-2xl border border-slate-100 shadow-sm">
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-800 font-tajawal">عن البرنامج</h2>
              <p className="text-slate-600 leading-relaxed text-sm">
                {program.description}
              </p>
            </div>

            {/* Rich Text content */}
            {program.content && program.content.length > 0 && (
              <div className="prose prose-slate max-w-none pt-6 border-t border-slate-100 text-slate-700 leading-relaxed text-sm">
                <PortableText
                  value={program.content}
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

            {/* Gallery */}
            {program.images && program.images.length > 1 && (
              <div className="space-y-4 pt-8 border-t border-slate-100">
                <h3 className="font-bold text-slate-800 font-tajawal">معرض الصور</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {program.images.slice(1).map((img, idx) => (
                    <div key={idx} className="h-32 rounded-xl overflow-hidden bg-slate-100">
                      <img
                        src={urlFor(img).width(400).height(300).url()}
                        alt={`${program.title} gallery ${idx + 1}`}
                        className="w-full h-full object-cover hover:scale-105 transition-all duration-300"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Left Side: Summary Card & Action */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6 text-right">
              <div className="space-y-1">
                <span className="text-xs text-slate-400 font-medium">رسوم التسجيل</span>
                <div className="text-2xl font-black text-accent-yellow font-sans">
                  {program.price > 0 ? `${program.price} ر.س` : "مجاناً بالكامل"}
                </div>
              </div>

              <div className="space-y-4 border-t border-slate-100 pt-4 text-xs font-semibold text-slate-600">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-accent-yellow flex-shrink-0" />
                  <div>
                    <span className="block text-[10px] text-slate-450">تاريخ البدء</span>
                    <span>{startDateFormatted}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-accent-yellow flex-shrink-0" />
                  <div>
                    <span className="block text-[10px] text-slate-450">المكان</span>
                    <span>{program.location || "حضوري - مقر ملهم الرئيسي"}</span>
                  </div>
                </div>

                {program.registrationDeadline && (
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-amber-500 flex-shrink-0" />
                    <div>
                      <span className="block text-[10px] text-slate-450">آخر موعد للتسجيل</span>
                      <span className="text-amber-600">
                        {new Date(program.registrationDeadline).toLocaleDateString("ar-SA")}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <Link
                href={`/register?type=program&name=${encodeURIComponent(program.title)}`}
                className="w-full block text-center py-4 bg-accent-yellow hover:bg-primary-yellow text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all duration-300"
              >
                احجز مقعدك الآن
              </Link>
              
              <p className="text-[10px] text-slate-400 text-center leading-normal">
                بمجرد الحجز، سيتواصل معك منسقو البرنامج لتأكيد التسجيل وإرسال تفاصيل التجمع.
              </p>
            </div>
            
            {/* Safety Assurance */}
            <div className="bg-yellow-50 border border-yellow-100 p-4 rounded-2xl flex items-start gap-3 text-right">
              <ShieldCheck className="w-5 h-5 text-accent-yellow mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-slate-800">بيئة آمنة وتفاعلية</h4>
                <p className="text-[10px] text-slate-500 leading-normal">
                  جميع برامجنا وفعالياتنا تلتزم بأعلى معايير السلامة والتأطير التربوي، بقيادة نخبة من الموجهين والمشرفين المعتمدين.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
