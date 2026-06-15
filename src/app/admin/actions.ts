"use server";

import { createClient } from "@supabase/supabase-js";

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
      { data: ordersData }
    ] = await Promise.all([
      supabaseAdmin.from("profiles").select("*", { count: "exact", head: true }),
      supabaseAdmin.from("registrations").select("*", { count: "exact", head: true }),
      supabaseAdmin.from("orders").select("*", { count: "exact", head: true }),
      supabaseAdmin.from("orders").select("total").eq("status", "paid")
    ]);

    const revenue = ordersData?.reduce((sum, o) => sum + Number(o.total), 0) || 0;

    return {
      users: usersCount || 0,
      registrations: registrationsCount || 0,
      orders: ordersCount || 0,
      revenue
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
