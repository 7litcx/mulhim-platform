import { Metadata } from "next";
import { Suspense } from "react";
import { getProducts, getCategories, getHeroBanners } from "@/sanity/lib/requests";
import StoreClient from "./store-client";

export const revalidate = 60; // Revalidate every 60 seconds

export const metadata: Metadata = {
  title: "المتجر | منصة ملهم",
  description: "اكتشف مجموعة حصرية من تيشيرتات، سويترات، كابات، عطور وإكسسوارات ملهم المصممة بعناية لمجتمعنا الفريد.",
};

async function StoreWrapper() {
  const [sanityProducts, sanityCategories, sanityHeroBanners] = await Promise.all([
    getProducts().catch(() => []),
    getCategories().catch(() => []),
    getHeroBanners().catch(() => []),
  ]);
  return (
    <StoreClient
      sanityProducts={sanityProducts || []}
      sanityCategories={sanityCategories || []}
      sanityHeroBanners={sanityHeroBanners || []}
    />
  );
}

export default function StorePage() {
  return (
    <Suspense fallback={
      <div className="py-12 text-center text-xs font-bold text-slate-400 flex flex-col items-center justify-center gap-2">
        <div className="w-8 h-8 border-2 border-slate-200 border-t-accent-yellow rounded-full animate-spin" />
        <span>جاري تحميل المتجر الإلكتروني...</span>
      </div>
    }>
      <StoreWrapper />
    </Suspense>
  );
}
