import { Metadata } from "next";
import { getPrograms, getCategories, getHeroBanners } from "@/sanity/lib/requests";
import ProgramsClient from "./programs-client";

export const revalidate = 60; // Revalidate every 60 seconds

export const metadata: Metadata = {
  title: "البرامج والفعاليات | منصة ملهم",
  description: "اكتشف برامج الفتيات والبنين والأنشطة الشبابية، ورش العمل التطبيقية، والبطولات الرياضية في منصة ملهم.",
};

export default async function ProgramsPage() {
  const [sanityPrograms, sanityCategories, sanityHeroBanners] = await Promise.all([
    getPrograms().catch(() => []),
    getCategories().catch(() => []),
    getHeroBanners().catch(() => []),
  ]);

  return (
    <ProgramsClient
      sanityPrograms={sanityPrograms || []}
      sanityCategories={sanityCategories || []}
      sanityHeroBanners={sanityHeroBanners || []}
    />
  );
}
