import { Metadata } from "next";
import { getHeroBanners } from "@/sanity/lib/requests";
import AboutClient from "./about-client";

export const revalidate = 60; // Revalidate every 60 seconds

export const metadata: Metadata = {
  title: "عن مُلهم | منصة ملهم",
  description: "نحن أكثر من مجرد منصة؛ نحن مجتمع متكامل يسعى لتحويل الشغف إلى واقع ملموس، وتمكين الشباب من قيادة المستقبل بروح الابتكار والعطاء.",
};

export default async function AboutPage() {
  const sanityHeroBanners = await getHeroBanners().catch(() => []);

  return (
    <AboutClient
      sanityHeroBanners={sanityHeroBanners || []}
    />
  );
}
