import { Metadata } from "next";
import { getAcademies, getFeaturedFAQs, getHeroBanners } from "@/sanity/lib/requests";
import AcademiesClient from "./academies-client";

export const revalidate = 60; // Revalidate every 60 seconds

export const metadata: Metadata = {
  title: "الأكاديميات | منصة ملهم",
  description: "صقل المواهب وبناء القادة في أكاديميات ملهم المتخصصة في القيادة والرياضة والفنون مع كبار المدربين.",
};

export default async function AcademiesPage() {
  const [sanityAcademies, sanityFAQs, sanityHeroBanners] = await Promise.all([
    getAcademies().catch(() => []),
    getFeaturedFAQs().catch(() => []),
    getHeroBanners().catch(() => []),
  ]);

  return (
    <AcademiesClient 
      sanityAcademies={sanityAcademies || []} 
      sanityFAQs={sanityFAQs || []} 
      sanityHeroBanners={sanityHeroBanners || []}
    />
  );
}
