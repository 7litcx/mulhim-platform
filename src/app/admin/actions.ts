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
  await verifyAdmin(token);
  const { data, error } = await supabaseAdmin.from("profiles").select("*").order("created_at", { ascending: false }).limit(2000);
  if (error) throw new Error(error.message);
  return data || [];
}

export async function fetchAdminRegistrations(token: string) {
  await verifyAdmin(token);
  const { data, error } = await supabaseAdmin.from("registrations").select("*").order("created_at", { ascending: false }).limit(2000);
  if (error) throw new Error(error.message);
  return data || [];
}

export async function fetchAdminOrders(token: string) {
  await verifyAdmin(token);
  const { data, error } = await supabaseAdmin.from("orders").select("*, order_items(*)").order("created_at", { ascending: false }).limit(2000);
  if (error) throw new Error(error.message);
  return data || [];
}

export async function fetchAdminMessages(token: string) {
  await verifyAdmin(token);
  const { data, error } = await supabaseAdmin.from("contact_messages").select("*").order("created_at", { ascending: false }).limit(2000);
  if (error) throw new Error(error.message);
  return data || [];
}

export async function fetchAdminTestimonials(token: string) {
  await verifyAdmin(token);
  const { data, error } = await supabaseAdmin.from("testimonials").select("*").order("created_at", { ascending: false }).limit(2000);
  if (error) throw new Error(error.message);
  return data || [];
}

export async function updateRegistrationStatusAction(token: string, id: string, status: string) {
  await verifyAdmin(token);
  const { error } = await supabaseAdmin.from("registrations").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);
  return true;
}

export async function updateOrderStatusAction(token: string, id: string, status: string) {
  await verifyAdmin(token);
  const { error } = await supabaseAdmin.from("orders").update({ status }).eq("id", id);
  if (error) throw new Error(error.message);
  return true;
}

export async function deleteRecordAction(token: string, table: string, id: string) {
  await verifyAdmin(token);
  
  // Handle specific tables to avoid Foreign Key constraint violations
  if (table === "orders") {
    await supabaseAdmin.from("order_items").delete().eq("order_id", id);
  } else if (table === "profiles") {
    // Try to delete children first if they exist
    await supabaseAdmin.from("children").delete().eq("parent_id", id);
    await supabaseAdmin.from("registrations").delete().eq("user_id", id);
    await supabaseAdmin.from("orders").delete().eq("user_id", id);
    
    // Attempt to delete from Auth as well (if this fails, we still proceed to delete the profile)
    await supabaseAdmin.auth.admin.deleteUser(id).catch(() => {});
  }

  const { error } = await supabaseAdmin.from(table).delete().eq("id", id);
  if (error) throw new Error(error.message);
  return true;
}

export async function toggleUserRoleAction(token: string, id: string, newRole: string) {
  await verifyAdmin(token);
  const { error } = await supabaseAdmin.from("profiles").update({ role: newRole }).eq("id", id);
  if (error) throw new Error(error.message);
  return true;
}
