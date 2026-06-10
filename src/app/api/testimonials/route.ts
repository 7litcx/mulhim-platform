import { NextResponse } from "next/server";
import { supabase } from "@/utils/supabase";

// Prevent caching to ensure we always get the real-time testimonials
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("testimonials")
      .select("*")
      .eq("is_approved", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching testimonials:", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, testimonials: data });
  } catch (err: any) {
    console.error("Testimonials GET error:", err);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { user_id, user_name, content, rating, role } = body;

    if (!user_name || !content) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    // Insert into testimonials table.
    // By default, it could be is_approved = true, but let's just insert it.
    const { error } = await supabase.from("testimonials").insert([
      {
        user_id: user_id || null,
        user_name,
        role: role || "عضو في مجتمع ملهم",
        content,
        rating: rating || 5,
        is_approved: true // Auto-approve, admin can delete later
      }
    ]);

    if (error) {
      console.error("Error submitting testimonial:", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Testimonials POST error:", err);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
