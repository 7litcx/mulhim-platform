import React from "react";
import type { Metadata } from "next";
import { LayoutWrapper } from "@/components/LayoutWrapper";
import "./globals.css";

import { Cairo, Tajawal } from "next/font/google";

const cairo = Cairo({
  subsets: ["arabic"],
  display: "swap",
  variable: "--font-cairo",
  preload: true,
});

const tajawal = Tajawal({
  weight: ["400", "500", "700", "800", "900"],
  subsets: ["arabic"],
  display: "swap",
  variable: "--font-tajawal",
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: "منصة مُلهم | تمكين وإلهام الشباب",
  description: "منصة ملهم تهدف لتمكين الشباب وتوفير فرص استثنائية للنمو والتعلم في بيئة مجتمعية محفزة عبر برامج، أكاديميات، رحلات استكشافية ومتجر متكامل.",
  keywords: ["ملهم", "منصة ملهم", "أكاديمية ملهم", "رحلات ملهم", "تمكين الشباب", "برامج شبابية", "متجر ملهم"],
  authors: [{ name: "فريق ملهم" }],
  verification: {
    google: "mPkFLAXU_wKxF7gdKsKSPe3lKJ1TDwt6o_f7zOPeTCY",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={`h-full scroll-smooth ${cairo.variable} ${tajawal.variable}`} data-scroll-behavior="smooth">
      <body className="min-h-full flex flex-col bg-slate-50/50 text-slate-900 font-tajawal font-medium antialiased text-lg">
        <LayoutWrapper>
          {children}
        </LayoutWrapper>
      </body>
    </html>
  );
}
