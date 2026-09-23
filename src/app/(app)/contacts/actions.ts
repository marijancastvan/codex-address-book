"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { validateContact } from "@/lib/validation";

export async function saveContact(formData: FormData) {
  const parsed = validateContact(formData);
  if (parsed.error || !parsed.value) redirect(`/contacts?error=${encodeURIComponent(parsed.error ?? "Neispravan kontakt.")}`);
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const id = String(formData.get("id") ?? "").trim();
  const query = id ? supabase.from("contacts").update(parsed.value).eq("id", id).eq("user_id", user.id) : supabase.from("contacts").insert({ ...parsed.value, user_id: user.id });
  const { error } = await query;
  if (error) redirect(`/contacts?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/contacts");
  redirect("/contacts");
}
export async function deleteContact(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) redirect("/contacts");
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { error } = await supabase.from("contacts").delete().eq("id", id).eq("user_id", user.id);
  if (error) redirect(`/contacts?error=${encodeURIComponent(error.message)}`);
  revalidatePath("/contacts");
  redirect("/contacts");
}
export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
