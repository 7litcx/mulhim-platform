import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from 'uuid';

export const dynamic = "force-dynamic";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { fullName, age, phone, email, interests, type, targetName, paymentMethod, extraData } = body;

    if (!fullName || !phone) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    const regId = uuidv4();
    const targetId = targetName.includes(":") ? targetName.split(":")[1]?.trim() : targetName.replace(/\s+/g, "-");

    const { error: regErr } = await supabaseAdmin.from("registrations").insert({
      id: regId,
      user_id: null, // Public registration
      child_id: null, // Public registration
      full_name: fullName,
      age: age || null,
      phone: phone,
      email: email || "guest@mulhim.com",
      interests: interests || [],
      type: type,
      target_id: targetId,
      target_name: targetName,
      status: "pending",
      payment_method: paymentMethod,
      extra_data: {
        ...(extraData || {}),
        paymentMethod: paymentMethod,
        isExternal: true
      }
    });

    if (regErr) {
      console.error("Error inserting public registration:", regErr);
      return NextResponse.json({ success: false, error: regErr.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, regId });
  } catch (err: any) {
    console.error("Public registration POST error:", err);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
