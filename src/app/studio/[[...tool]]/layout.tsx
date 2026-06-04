import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mulhim Studio | لوحة التحكم",
  description: "Sanity Studio Content Management System for Mulhim Youth Platform.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full min-h-screen bg-slate-950 text-white select-none">
      {children}
    </div>
  );
}
