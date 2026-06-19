import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const { email, origin } = await req.json();

    if (!email) {
      return NextResponse.json({ success: false, error: "البريد الإلكتروني مطلوب" }, { status: 400 });
    }

    // Initialize Supabase admin client to generate the reset link
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ success: false, error: "Server configuration missing" }, { status: 500 });
    }

    const adminAuthClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Generate the recovery link
    const siteUrl = origin || req.headers.get('origin') || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const { data, error } = await adminAuthClient.auth.admin.generateLink({
      type: "recovery",
      email: email,
      options: {
        redirectTo: `${siteUrl}/reset-password`,
      },
    });

    if (error) {
      console.error("Error generating reset link:", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    // Use hashed_token instead of action_link to prevent email scanners from consuming the token
    const resetLink = `${siteUrl}/reset-password?token_hash=${data.properties.hashed_token}&type=recovery`;

    // SMTP configuration
    const host = process.env.EMAIL_HOST;
    const port = parseInt(process.env.EMAIL_PORT || "587");
    const secure = process.env.EMAIL_SECURE === "true";
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;

    if (!host || !user || !pass) {
      return NextResponse.json({ success: false, error: "SMTP settings missing" }, { status: 500 });
    }

    // Create transport
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass,
      },
    });

    const htmlContent = `
      <div dir="rtl" style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; padding: 30px; border-radius: 16px; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; color: #1e293b;">
        <div style="background-color: #0f172a; padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: #0d9488; margin: 0; font-size: 24px; font-weight: 800;">منصة مُلهم</h1>
          <p style="color: #94a3b8; margin: 5px 0 0 0; font-size: 14px;">إعادة تعيين كلمة المرور</p>
        </div>
        
        <div style="background-color: #ffffff; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); text-align: center;">
          <p style="font-size: 16px; line-height: 1.6; color: #334155; margin-bottom: 24px;">لقد تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بحسابك في منصة مُلهم. الرجاء النقر على الزر أدناه لإعادة تعيين كلمة المرور:</p>
          
          <a href="${resetLink}" style="display: inline-block; background-color: #0d9488; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; margin-bottom: 24px;">إعادة تعيين كلمة المرور</a>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; border-right: 4px solid #f59e0b; margin-top: 20px; text-align: right;">
            <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #334155;">إذا لم تطلب إعادة تعيين كلمة المرور، يرجى تجاهل هذه الرسالة.</p>
          </div>
          
          <div style="margin-top: 30px; text-align: center; border-top: 1px solid #f1f5f9; padding-top: 20px;">
            <span style="font-size: 11px; color: #94a3b8;">تم إرسال هذه الرسالة تلقائياً من منصة مُلهم.</span>
          </div>
        </div>
      </div>
    `;

    // Send the email
    await transporter.sendMail({
      from: `"دعم منصة مُلهم" <${user}>`,
      to: email,
      subject: "إعادة تعيين كلمة المرور - منصة مُلهم",
      html: htmlContent,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error sending reset password email:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
