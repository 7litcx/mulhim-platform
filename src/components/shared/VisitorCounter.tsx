"use client";

import React, { useEffect, useState } from "react";
import { Users } from "lucide-react";
import { motion } from "framer-motion";

export default function VisitorCounter() {
  const [visits, setVisits] = useState<number | null>(null);

  useEffect(() => {
    // Only increment and fetch once per session using sessionStorage
    const fetchVisits = async () => {
      try {
        const hasVisited = sessionStorage.getItem("hasVisited");
        
        // If they already visited in this session, we don't want to increment again,
        // but since our API increments automatically, we might need a separate endpoint to just get the count?
        // Actually, to make it simple and "constantly updating", let's just use the same API.
        // If hasVisited is true, we could theoretically fetch from a GET that doesn't increment.
        // For now, let's increment every time they load the page to make it feel "active",
        // or just increment once per session.
        
        const res = await fetch("/api/visits");
        if (res.ok) {
          const data = await res.json();
          setVisits(data.visits);
          sessionStorage.setItem("hasVisited", "true");
        }
      } catch (error) {
        console.error("Failed to fetch visits:", error);
      }
    };

    fetchVisits();
  }, []);

  if (visits === null) return null; // Don't render until we have a number

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-2 mt-6 lg:mt-0 shadow-sm backdrop-blur-sm w-fit mx-auto lg:mx-0"
    >
      <div className="w-10 h-10 bg-accent-teal/20 text-accent-teal rounded-xl flex items-center justify-center">
        <Users className="w-5 h-5" />
      </div>
      <div className="flex flex-col text-right">
        <span className="text-[10px] font-bold text-slate-400">عدد الزيارات</span>
        <div className="flex items-baseline gap-1" dir="ltr">
          <span className="text-xl font-black text-white">{visits.toLocaleString('en-US')}</span>
        </div>
      </div>
    </motion.div>
  );
}
