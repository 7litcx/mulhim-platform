"use server";

import { createClient } from "@supabase/supabase-js";
import { client as sanityClient } from "@/sanity/lib/client";

// Initialize Supabase admin client with service_role key to bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Helper to verify admin status
async function verifyAdmin(token: string) {
  if (!token) throw new Error("Unauthorized: Token missing");

  const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
  if (userError || !user) throw new Error("Unauthorized: Invalid token.");

  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (error || data?.role !== "admin") {
    throw new Error("Unauthorized: You must be an admin.");
  }
}

export async function fetchAdminUsers(token: string) {
  try {
    await verifyAdmin(token);
    const { data, error } = await supabaseAdmin.from("profiles").select("*").order("created_at", { ascending: false }).limit(2000);
    if (error) throw new Error(error.message);
    return data || [];
  } catch (e: any) { return { error: e.message }; }
}

export async function fetchAdminRegistrations(token: string) {
  try {
    await verifyAdmin(token);
    const { data, error } = await supabaseAdmin.from("registrations").select("*").order("created_at", { ascending: false }).limit(2000);
    if (error) throw new Error(error.message);
    return data || [];
  } catch (e: any) { return { error: e.message }; }
}

export async function fetchAdminOrders(token: string) {
  try {
    await verifyAdmin(token);
    const { data, error } = await supabaseAdmin.from("orders").select("*, order_items(*)").order("created_at", { ascending: false }).limit(2000);
    if (error) throw new Error(error.message);
    return data || [];
  } catch (e: any) { return { error: e.message }; }
}

export async function fetchAdminMessages(token: string) {
  try {
    await verifyAdmin(token);
    const { data, error } = await supabaseAdmin.from("contact_messages").select("*").order("created_at", { ascending: false }).limit(2000);
    if (error) throw new Error(error.message);
    return data || [];
  } catch (e: any) { return { error: e.message }; }
}

export async function fetchAdminTestimonials(token: string) {
  try {
    await verifyAdmin(token);
    const { data, error } = await supabaseAdmin.from("testimonials").select("*").order("created_at", { ascending: false }).limit(2000);
    if (error) throw new Error(error.message);
    return data || [];
  } catch (e: any) { return { error: e.message }; }
}

export async function fetchAdminOverviewStats(token: string) {
  try {
    await verifyAdmin(token);
    const [
      { count: usersCount },
      { count: registrationsCount },
      { count: ordersCount },
      { data: ordersData },
      { data: regsData }
    ] = await Promise.all([
      supabaseAdmin.from("profiles").select("*", { count: "exact", head: true }),
      supabaseAdmin.from("registrations").select("*", { count: "exact", head: true }),
      supabaseAdmin.from("orders").select("*", { count: "exact", head: true }),
      supabaseAdmin.from("orders").select("total").eq("status", "paid"),
      supabaseAdmin.from("registrations").select("type, target_name, status, payment_method")
    ]);

    const revenue = ordersData?.reduce((sum, o) => sum + Number(o.total), 0) || 0;

    // Fetch Sanity programs, academies, and trips
    let sanityItems: { title: string; price: number; type: string }[] = [];
    try {
      const sanityRes = await sanityClient.fetch(`
        *[_type in ["program", "academy", "trip"]]{
          "title": title,
          "price": price,
          "_type": _type
        }
      `);
      if (Array.isArray(sanityRes)) {
        sanityItems = sanityRes.map(item => ({
          title: item.title || "",
          price: Number(item.price) || 0,
          type: item._type
        }));
      }
    } catch (err) {
      console.error("Failed to fetch sanity prices:", err);
    }

    const staticPrices: Record<string, number> = {
      // Trips
      "رحلة جبال طويق الاستكشافية": 250,
      "مخيم العقبة القيادي": 450,
      "رحلة الكهوف والوديان": 350,
      // Academies
      "أكاديمية الفرسان للفروسية والرماية": 800,
      "أكاديمية القادة الشباب": 600,
      "أكاديمية ملهم للبرمجة والذكاء الاصطناعي": 600,
      "أكاديمية الفنون التشكيلية": 400,
      // Programs
      "برنامج تطوير المهارات الرقمية للفتيات": 350,
      "مخيم القياديات الواعدات": 450,
      "بطولة التنس والأنشطة الترفيهية": 200,
      "برنامج القادة الشباب": 400,
      "بطولة ملهم للفروسية والرماية": 300,
      "المخيم الشتوي الاستكشافي": 500,
      "برنامج لون صيفك 3": 1200,
      "لون صيفك": 1200,
    };

    const getPrice = (targetName: string, paymentMethod: string) => {
      const cleanTargetName = targetName.split(" - ")[0].trim();
      
      const sanityMatch = sanityItems.find(item => 
        item.title.trim().toLowerCase() === cleanTargetName.toLowerCase() ||
        cleanTargetName.toLowerCase().includes(item.title.trim().toLowerCase()) ||
        item.title.trim().toLowerCase().includes(cleanTargetName.toLowerCase())
      );
      
      let basePrice = 0;
      if (sanityMatch && sanityMatch.price > 0) {
        basePrice = sanityMatch.price;
      } else {
        const staticMatchKey = Object.keys(staticPrices).find(key =>
          key.toLowerCase() === cleanTargetName.toLowerCase() ||
          cleanTargetName.toLowerCase().includes(key.toLowerCase()) ||
          key.toLowerCase().includes(cleanTargetName.toLowerCase())
        );
        if (staticMatchKey) {
          basePrice = staticPrices[staticMatchKey];
        }
      }
      return basePrice;
    };

    const approvedRegistrations = regsData?.filter(r => 
      r.status === 'approved' || 
      r.status === 'registered' || 
      r.status === 'completed'
    ) || [];

    const regRevenue = approvedRegistrations.reduce((sum, r) => {
      const price = getPrice(r.target_name || "", r.payment_method || "");
      return sum + price;
    }, 0);

    return {
      users: usersCount || 0,
      registrations: registrationsCount || 0,
      orders: ordersCount || 0,
      revenue,
      regRevenue
    };
  } catch (e: any) { return { error: e.message }; }
}

export async function updateRegistrationStatusAction(token: string, id: string, status: string) {
  try {
    await verifyAdmin(token);
    const { error } = await supabaseAdmin.from("registrations").update({ status }).eq("id", id);
    if (error) throw new Error(error.message);
    return true;
  } catch (e: any) { return { error: e.message }; }
}

export async function updateOrderStatusAction(token: string, id: string, status: string) {
  try {
    await verifyAdmin(token);
    const { error } = await supabaseAdmin.from("orders").update({ status }).eq("id", id);
    if (error) throw new Error(error.message);
    return true;
  } catch (e: any) { return { error: e.message }; }
}

export async function deleteRecordAction(token: string, table: string, id: string) {
  try {
    await verifyAdmin(token);

    if (table === "orders") {
      await supabaseAdmin.from("order_items").delete().eq("order_id", id);
    } else if (table === "profiles") {
      await supabaseAdmin.from("children").delete().eq("parent_id", id);
      await supabaseAdmin.from("registrations").delete().eq("user_id", id);
      await supabaseAdmin.from("orders").delete().eq("user_id", id);
      await supabaseAdmin.auth.admin.deleteUser(id).catch(() => { });
    }

    const { error } = await supabaseAdmin.from(table).delete().eq("id", id);
    if (error) throw new Error(error.message);
    return true;
  } catch (e: any) { return { error: e.message }; }
}

export async function toggleUserRoleAction(token: string, id: string, newRole: string) {
  try {
    await verifyAdmin(token);
    const { error } = await supabaseAdmin.from("profiles").update({ role: newRole }).eq("id", id);
    if (error) throw new Error(error.message);
    return true;
  } catch (e: any) { return { error: e.message }; }
}
