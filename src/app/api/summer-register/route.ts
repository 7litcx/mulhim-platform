import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { v4 as uuidv4 } from 'uuid';
import { client, previewClient } from "@/sanity/lib/client";

export const dynamic = "force-dynamic";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { fullName, age, phone, email, interests, type, targetName, paymentMethod, extraData, userId } = body;

    if (!fullName || !phone) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    // Check if registration is closed for this program in Sanity
    if (targetName) {
      try {
        const query = `*[_type == "program" && (title == $target || title == "لون صيفك" || title match "صيفك")][0] { registrationClosed }`;
        const program = await previewClient.fetch(query, { target: targetName })
          .catch(() => client.fetch(query, { target: targetName }));
          
        if (program && program.registrationClosed === true) {
          return NextResponse.json(
            { success: false, error: "عذراً، لقد تم إغلاق التسجيل في هذا البرنامج." },
            { status: 400 }
          );
        }
      } catch (err) {
        console.error("Error checking program status in API:", err);
      }
    }

    const regId = uuidv4();
    const targetId = targetName.includes(":") ? targetName.split(":")[1]?.trim() : targetName.replace(/\s+/g, "-");

    if (extraData?.idNumber) {
      const cleanId = String(extraData.idNumber).trim();
      if (cleanId) {
        const { data: existingRegs, error: fetchErr } = await supabaseAdmin
          .from("registrations")
          .select("id")
          .eq("extra_data->>idNumber", cleanId)
          .limit(1);

        if (!fetchErr && existingRegs && existingRegs.length > 0) {
          return NextResponse.json({ success: false, error: "تم التسجيل مسبقاً باستخدام رقم الهوية هذا." }, { status: 400 });
        }
      }
    }

    // We need a valid user_id from auth.users to attach this public registration to.
    let finalUserId = userId;
    
    if (!finalUserId) {
      let guestUserId = null;
      // Try to find the dedicated guest user by email using Admin API
      const { data: usersData } = await supabaseAdmin.auth.admin.listUsers();
      let guestUser = usersData?.users.find(u => u.email === "guest_public@mulhim.com");
      
      if (guestUser) {
        guestUserId = guestUser.id;
      } else {
        // Create a dedicated guest user
        const { data: newGuest, error: createErr } = await supabaseAdmin.auth.admin.createUser({
          email: "guest_public@mulhim.com",
          password: "GuestPublicPassword123!",
          email_confirm: true,
          user_metadata: { full_name: "زائر (تسجيل خارجي)" }
        });
        if (newGuest?.user) {
          guestUserId = newGuest.user.id;
        } else {
          // Fallback to the first available user if creation fails
          console.error("Failed to create guest user:", createErr);
          guestUserId = usersData?.users[0]?.id || null;
        }
      }
      finalUserId = guestUserId;
    }

    const { error: regErr } = await supabaseAdmin.from("registrations").insert({
      id: regId,
      user_id: finalUserId, // Assigned to user or guest user to bypass not-null constraint
      child_id: null, // Public registration
      full_name: fullName,
      age: age || null,
      phone: phone,
      email: email || "guest_public@mulhim.com",
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
