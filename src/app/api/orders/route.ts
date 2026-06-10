import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

// Initialize Supabase admin client with service_role key to bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderId, userId, customerName, phone, email, total, paymentMethod, status, items } = body;

    if (!orderId || !customerName || !items || items.length === 0) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    // 1. Insert order
    const { error: orderErr } = await supabaseAdmin.from("orders").insert({
      id: orderId,
      user_id: userId,
      customer_name: customerName,
      phone,
      email,
      total,
      payment_method: paymentMethod,
      status
    });

    if (orderErr) {
      console.error("Error inserting order:", orderErr);
      return NextResponse.json({ success: false, error: orderErr.message }, { status: 500 });
    }

    // 2. Insert order items
    const { error: itemsErr } = await supabaseAdmin.from("order_items").insert(items);

    if (itemsErr) {
      console.error("Error inserting order items:", itemsErr);
      return NextResponse.json({ success: false, error: itemsErr.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Orders POST error:", err);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
