import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { supabase } from "@/utils/supabase";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, data } = body;

    const emailTo = process.env.EMAIL_TO || "mulhim180@gmail.com";

    // SMTP configuration
    const host = process.env.EMAIL_HOST;
    const port = parseInt(process.env.EMAIL_PORT || "587");
    const secure = process.env.EMAIL_SECURE === "true";
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;

    // Check if email configuration is present, if not, log warning and return mock success
    if (!host || !user || !pass) {
      console.warn(
        "SMTP settings (EMAIL_HOST, EMAIL_USER, EMAIL_PASS) are missing in environment variables. Email sending is simulated.",
        { type, data }
      );
      return NextResponse.json({
        success: true,
        message: "Email sending simulated successfully. Please configure SMTP variables to receive real emails.",
        simulated: true,
      });
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

    let subject = "";
    let htmlContent = "";

    if (type === "contact") {
      const { name, email, phone, subject: contactSubject, message } = data;
      subject = `📨 رسالة تواصل جديدة: ${contactSubject || "بدون عنوان"}`;
      
      // Save to Supabase contact_messages table
      try {
        await supabase.from("contact_messages").insert({
          name,
          email,
          phone: phone || null,
          subject: contactSubject || "بدون عنوان",
          message
        });
      } catch (dbErr) {
        console.error("Failed to save contact message to Supabase:", dbErr);
      }

      htmlContent = `
        <div dir="rtl" style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; padding: 30px; border-radius: 16px; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; color: #1e293b;">
          <div style="background-color: #0f172a; padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: #0d9488; margin: 0; font-size: 24px; font-weight: 800;">منصة مُلهم</h1>
            <p style="color: #94a3b8; margin: 5px 0 0 0; font-size: 14px;">إشعار استلام رسالة تواصل جديدة</p>
          </div>
          
          <div style="background-color: #ffffff; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
            <p style="font-size: 16px; line-height: 1.6; color: #334155; margin-bottom: 24px;">لقد تلقيت رسالة تواصل جديدة من نموذج الاتصال بالمنصة. تفاصيل الرسالة أدناه:</p>
            
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 12px 0; font-weight: bold; color: #475569; width: 30%;">الاسم:</td>
                <td style="padding: 12px 0; color: #0f172a;">${name}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 12px 0; font-weight: bold; color: #475569;">البريد الإلكتروني:</td>
                <td style="padding: 12px 0; color: #0f172a;"><a href="mailto:${email}" style="color: #0d9488; text-decoration: none;">${email}</a></td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 12px 0; font-weight: bold; color: #475569;">رقم الجوال:</td>
                <td style="padding: 12px 0; color: #0f172a; direction: ltr; text-align: right;">${phone || "غير محدد"}</td>
              </tr>
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 12px 0; font-weight: bold; color: #475569;">الموضوع:</td>
                <td style="padding: 12px 0; color: #0f172a;">${contactSubject || "بدون موضوع"}</td>
              </tr>
            </table>
            
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; border-right: 4px solid #0d9488; margin-top: 20px;">
              <h4 style="margin: 0 0 10px 0; color: #0f172a; font-size: 14px;">نص الرسالة:</h4>
              <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #334155; white-space: pre-line;">${message}</p>
            </div>
            
            <div style="margin-top: 30px; text-align: center; border-top: 1px solid #f1f5f9; padding-top: 20px;">
              <span style="font-size: 11px; color: #94a3b8;">تم إرسال هذه الرسالة تلقائياً من منصة مُلهم.</span>
            </div>
          </div>
        </div>
      `;
    } else if (type === "suggestion") {
      const { title, description } = data;
      subject = `💡 اقتراح وجهة رحلة جديدة: ${title}`;

      // Save to Supabase contact_messages table
      try {
        await supabase.from("contact_messages").insert({
          name: "اقتراح رحلة",
          email: emailTo,
          phone: null,
          subject: `اقتراح وجهة رحلة جديدة: ${title}`,
          message: description
        });
      } catch (dbErr) {
        console.error("Failed to save suggestion to Supabase:", dbErr);
      }

      htmlContent = `
        <div dir="rtl" style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; padding: 30px; border-radius: 16px; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; color: #1e293b;">
          <div style="background-color: #0f172a; padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
            <h1 style="color: #0d9488; margin: 0; font-size: 24px; font-weight: 800;">منصة مُلهم</h1>
            <p style="color: #94a3b8; margin: 5px 0 0 0; font-size: 14px;">إشعار باقتراح رحلة جديدة</p>
          </div>
          
          <div style="background-color: #ffffff; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
            <p style="font-size: 16px; line-height: 1.6; color: #334155; margin-bottom: 24px;">لقد قام أحد الزوار بإرسال اقتراح لوجهة رحلة جديدة عبر نموذج الاقتراحات بالمنصة:</p>
            
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 12px 0; font-weight: bold; color: #475569; width: 30%;">الوجهة المقترحة:</td>
                <td style="padding: 12px 0; color: #0d9488; font-size: 18px; font-weight: 800;">${title}</td>
              </tr>
            </table>
            
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; border-right: 4px solid #0d9488; margin-top: 20px;">
              <h4 style="margin: 0 0 10px 0; color: #0f172a; font-size: 14px;">الأفكار المقترحة وتفاصيل الوجهة:</h4>
              <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #334155; white-space: pre-line;">${description}</p>
            </div>
            
            <div style="margin-top: 30px; text-align: center; border-top: 1px solid #f1f5f9; padding-top: 20px;">
              <span style="font-size: 11px; color: #94a3b8;">تم إرسال هذه الرسالة تلقائياً من منصة مُلهم.</span>
            </div>
          </div>
        </div>
      `;
    } else {
      return NextResponse.json({ success: false, error: "Invalid type" }, { status: 400 });
    }

    // Send the email
    await transporter.sendMail({
      from: `"${type === "contact" ? "رسائل تواصل - مُلهم" : "اقتراحات رحلات - مُلهم"}" <${user}>`,
      to: emailTo,
      subject: subject,
      html: htmlContent,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error sending email:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
