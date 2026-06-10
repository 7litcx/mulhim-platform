import { NextResponse } from "next/server";
import { supabase } from "@/utils/supabase";

// Prevent caching to ensure we always get the real-time count
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // We call the RPC function we will create in Supabase
    // This function atomically increments the count by 1 and returns the new value
    const { data, error } = await supabase.rpc("increment_site_visits");

    if (error) {
      console.error("Error fetching visits:", error);
      return NextResponse.json({ visits: 0 }, { status: 500 });
    }

    return NextResponse.json({ visits: data });
  } catch (err) {
    console.error("Server error:", err);
    return NextResponse.json({ visits: 0 }, { status: 500 });
  }
}
