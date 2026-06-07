"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { AppProvider } from "@/context/AppContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  
  // If we are in the Sanity Studio, don't load the heavy site components
  if (pathname?.startsWith("/studio")) {
    return <main className="flex-grow flex flex-col">{children}</main>;
  }

  return (
    <AppProvider>
      <React.Suspense fallback={null}>
        <Header />
      </React.Suspense>
      <main className="flex-grow flex flex-col">
        {children}
      </main>
      <Footer />
    </AppProvider>
  );
}
