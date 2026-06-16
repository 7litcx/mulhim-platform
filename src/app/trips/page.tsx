import { Metadata } from "next";
import { getTrips, getCategories, getHeroBanners } from "@/sanity/lib/requests";
import TripsClient from "./trips-client";

export const revalidate = 60; // Revalidate every 60 seconds

export const metadata: Metadata = {
  title: "الرحلات والأنشطة | منصة ملهم",
  description: "انضم لرحلات ملهم المميزة والمغامرات الاستكشافية لبناء الصلابة والاعتماد على النفس وترك أثر مستدام.",
};

export default async function TripsPage() {
  const [sanityTrips, sanityCategories, sanityHeroBanners] = await Promise.all([
    getTrips().catch(() => []),
    getCategories().catch(() => []),
    getHeroBanners().catch(() => []),
  ]);

  return (
    <TripsClient
      sanityTrips={sanityTrips || []}
      sanityCategories={sanityCategories || []}

      sanityHeroBanners={sanityHeroBanners || []}
    />
  );
}
