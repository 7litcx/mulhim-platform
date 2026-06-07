import { Metadata } from "next";
import { getHeroBanners, getPrograms, getTrips, getAcademies, getProducts } from "@/sanity/lib/requests";
import HomeClient from "./home-client";

export const revalidate = 60; // Revalidate every 60 seconds (Incremental Static Regeneration)

export const metadata: Metadata = {
  title: "منصة مُلهم | تمكين الشباب وبناء قادة المستقبل",
  description: "منصة ملهم تهدف لتمكين الشباب وتوفير فرص استثنائية للنمو والتعلم في بيئة مجتمعية محفزة لبناء جيل يقود المستقبل بأثر مستدام.",
  openGraph: {
    title: "منصة مُلهم | تمكين الشباب وبناء قادة المستقبل",
    description: "منصة ملهم تهدف لتمكين الشباب وتوفير فرص استثنائية للنمو والتعلم في بيئة مجتمعية محفزة لبناء جيل يقود المستقبل بأثر مستدام.",
    images: ["/mulhim_open_graph.png"],
  },
};

export default async function HomePage() {
  // Fetch dynamic content from Sanity parallelly for speed
  const [sanityHeroBanners, sanityPrograms, sanityTrips, sanityAcademies, sanityProducts] = await Promise.all([
    getHeroBanners().catch(() => []),
    getPrograms().catch(() => []),
    getTrips().catch(() => []),
    getAcademies().catch(() => []),
    getProducts().catch(() => []),
  ]);

  return (
    <HomeClient
      sanityHeroBanners={sanityHeroBanners || []}
      sanityPrograms={sanityPrograms || []}
      sanityTrips={sanityTrips || []}
      sanityAcademies={sanityAcademies || []}
      sanityProducts={sanityProducts || []}
    />
  );
}
