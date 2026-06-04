import { Metadata } from "next";
import { getHeroBanners, getPrograms, getTrips, getProducts } from "@/sanity/lib/requests";
import HomeClient from "./home-client";

export const revalidate = 60; // Revalidate every 60 seconds (Incremental Static Regeneration)

export const metadata: Metadata = {
  title: "منصة مُلهم | تمكين الشباب وبناء قادة المستقبل",
  description: "منصة ملهم تهدف لتمكين الشباب وتوفير فرص استثنائية للنمو والتعلم في بيئة مجتمعية محفزة لبناء جيل يقود المستقبل بأثر مستدام.",
  openGraph: {
    title: "منصة مُلهم | تمكين الشباب وبناء قادة المستقبل",
    description: "منصة ملهم تهدف لتمكين الشباب وتوفير فرص استثنائية للنمو والتعلم في بيئة مجتمعية محفزة لبناء جيل يقود المستقبل بأثر مستدام.",
    images: ["/og-default.jpg"],
  },
};

export default async function HomePage() {
  // Fetch dynamic content from Sanity parallelly for speed
  const [sanityHeroBanners, sanityPrograms, sanityTrips, sanityProducts] = await Promise.all([
    getHeroBanners().catch(() => []),
    getPrograms().catch(() => []),
    getTrips().catch(() => []),
    getProducts().catch(() => []),
  ]);

  return (
    <HomeClient
      sanityHeroBanners={sanityHeroBanners || []}
      sanityPrograms={sanityPrograms || []}
      sanityTrips={sanityTrips || []}
      sanityProducts={sanityProducts || []}
    />
  );
}
