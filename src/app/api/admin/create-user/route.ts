import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const { email, password, fullName, phone, role } = await request.json();

    // 1. التأكد من وجود التوثيق (Authorization Header)
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "غير مصرح لك بالوصول (Token مفقود)." }, { status: 401 });
    }
    const token = authHeader.split(" ")[1];

    // 2. التأكد من توفر مفتاح الصلاحيات الكاملة
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: "بيانات الاتصال بقاعدة البيانات (Service Role Key) غير متوفرة في ملف .env.local" },
        { status: 500 }
      );
    }

    // إنشاء عميل Supabase بصلاحيات المشرف (Service Role)
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // 3. التحقق من صحة التوكن وأن المنفذ هو مسؤول (Admin)
    const { data: { user: caller }, error: callerError } = await supabaseAdmin.auth.getUser(token);
    if (callerError || !caller) {
      return NextResponse.json({ error: "رمز التوثيق غير صالح." }, { status: 401 });
    }

    const { data: callerProfile } = await supabaseAdmin
      .from("profiles")
      .select("role")
      .eq("id", caller.id)
      .single();

    if (!callerProfile || callerProfile.role !== "admin") {
      return NextResponse.json({ error: "صلاحيات غير كافية للقيام بهذا الإجراء." }, { status: 403 });
    }

    // 4. إنشاء المستخدم باستخدام الـ API الرسمي لـ Supabase
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: email,
      password: password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        phone: phone || "",
      },
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    const userId = authData.user.id;

    // 2. تحديث أو إنشاء صلاحية المستخدم في جدول profiles
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .upsert({
        id: userId,
        email: email,
        full_name: fullName,
        phone: phone || "",
        role: role,
      });

    if (profileError) {
      console.error("Profile Upsert Error:", profileError);
    }

    return NextResponse.json({ success: true, user: authData.user });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "حدث خطأ داخلي" }, { status: 500 });
  }
}
