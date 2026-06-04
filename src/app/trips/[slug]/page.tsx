import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, MapPin, Compass, Users, Clock, ArrowRight, ShieldCheck } from "lucide-react";
import { getTripBySlug, getTrips } from "@/sanity/lib/requests";
import { urlFor } from "@/sanity/lib/image";
import { PortableText } from "@portabletext/react";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const trips = await getTrips();
  return trips.map((t) => ({
    slug: t.slug.current,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const trip = await getTripBySlug(slug);

  if (!trip) {
    return {
      title: "الرحلة غير موجودة | منصة ملهم",
    };
  }

  const ogImage = trip.images?.[0]
    ? urlFor(trip.images[0]).width(1200).height(630).url()
    : "/og-default.jpg";

  const cleanDescription = trip.description 
    ? (trip.description.length > 155 ? `${trip.description.substring(0, 152)}...` : trip.description)
    : "انضم لرحلات ملهم المميزة والمغامرات الاستكشافية لبناء الصلابة والاعتماد على النفس وترك أثر مستدام.";

  return {
    title: `${trip.title} | منصة ملهم`,
    description: cleanDescription,
    keywords: ["ملهم", "رحلات ملهم", trip.title, trip.location || ""],
    openGraph: {
      title: trip.title,
      description: cleanDescription,
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
  };
}


export default async function TripDetailsPage({ params }: PageProps) {
  const { slug } = await params;
  const trip = await getTripBySlug(slug);

  if (!trip) {
    notFound();
  }

  const startDateFormatted = new Date(trip.startDate).toLocaleDateString("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const endDateFormatted = new Date(trip.endDate).toLocaleDateString("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="min-h-screen pb-20 bg-slate-50/50">
      {/* Cover Header */}
      <div className="relative h-[300px] md:h-[400px] bg-slate-900 overflow-hidden">
        {trip.images?.[0] && (
          <img
            src={urlFor(trip.images[0]).width(1600).height(800).url()}
            alt={trip.title}
            className="w-full h-full object-cover opacity-40 scale-105"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/70 to-transparent" />
        
        <div className="absolute inset-0 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-end pb-10 text-right text-white">
          <div className="space-y-4 max-w-3xl">
            <Link
              href="/trips"
              className="inline-flex items-center gap-1 text-xs text-accent-yellow hover:underline mb-2"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              العودة إلى الرحلات
            </Link>
            
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-accent-yellow text-white rounded-full text-xs font-bold">
                {trip.typeName}
              </span>
              <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                <MapPin className="w-3 h-3 text-accent-yellow" />
                {trip.location}
              </span>
            </div>
            
            <h1 className="text-2xl md:text-4xl font-extrabold leading-tight font-tajawal">
              {trip.title}
            </h1>
          </div>
        </div>
      </div>

      {/* Grid Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-8 text-right bg-white p-6 md:p-8 rounded-2xl border border-slate-100 shadow-sm">
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-800 font-tajawal">عن الرحلة والمغامرة</h2>
              <p className="text-slate-600 leading-relaxed text-sm">
                {trip.description}
              </p>
            </div>

            {/* Rich text Content (Itinerary) */}
            {trip.content && trip.content.length > 0 && (
              <div className="prose prose-slate max-w-none pt-6 border-t border-slate-100 text-slate-700 leading-relaxed text-sm">
                <PortableText
                  value={trip.content}
                  components={{
                    block: {
                      h3: ({ children }) => <h3 className="text-lg font-bold text-slate-850 mt-6 mb-2 font-tajawal">{children}</h3>,
                      normal: ({ children }) => <p className="mb-4 text-slate-650">{children}</p>,
                    },
                    list: {
                      bullet: ({ children }) => <ul className="list-disc list-inside mr-5 space-y-2 mb-4">{children}</ul>,
                    },
                  }}
                />
              </div>
            )}

            {/* Gallery */}
            {trip.images && trip.images.length > 1 && (
              <div className="space-y-4 pt-8 border-t border-slate-100">
                <h3 className="font-bold text-slate-800 font-tajawal">معرض الصور الاستكشافية</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {trip.images.slice(1).map((img, idx) => (
                    <div key={idx} className="h-32 rounded-xl overflow-hidden bg-slate-100">
                      <img
                        src={urlFor(img).width(400).height(300).url()}
                        alt={`${trip.title} gallery ${idx + 1}`}
                        className="w-full h-full object-cover hover:scale-105 transition-all duration-300"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6 text-right">
              <div className="space-y-1">
                <span className="text-xs text-slate-400 font-medium">تكلفة الاشتراك</span>
                <div className="text-2xl font-black text-accent-yellow font-sans">
                  {trip.price} ر.س
                </div>
              </div>

              <div className="space-y-4 border-t border-slate-100 pt-4 text-xs font-semibold text-slate-600">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-accent-yellow flex-shrink-0" />
                  <div>
                    <span className="block text-[10px] text-slate-450">تاريخ الذهاب</span>
                    <span>{startDateFormatted}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-accent-yellow flex-shrink-0" />
                  <div>
                    <span className="block text-[10px] text-slate-450">تاريخ الإياب</span>
                    <span>{endDateFormatted}</span>
                  </div>
                </div>

                {trip.maxParticipants && (
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-accent-yellow flex-shrink-0" />
                    <div>
                      <span className="block text-[10px] text-slate-450">المقاعد المتاحة</span>
                      <span>{trip.maxParticipants} مقعد فقط</span>
                    </div>
                  </div>
                )}
              </div>

              <Link
                href={`/register?type=trip&name=${encodeURIComponent(trip.title)}`}
                className="w-full block text-center py-4 bg-primary-navy hover:bg-slate-800 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all duration-300"
              >
                احجز مقعدك في الرحلة
              </Link>
            </div>

            {/* Note */}
            <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex items-start gap-3 text-right">
              <Compass className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-slate-800">ملاحظة هامة للمغامرين</h4>
                <p className="text-[10px] text-slate-500 leading-normal">
                  تتطلب الرحلة لياقة بدنية متوسطة، ويتم تنظيم لقاء تمهيدي لشرح المستلزمات والتوجيهات والمسار قبل موعد الانطلاق بأسبوع.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
