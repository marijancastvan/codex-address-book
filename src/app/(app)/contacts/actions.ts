"use server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { validateContact, type ContactFieldErrors } from "@/lib/validation";

export type SaveContactResult = { fieldErrors?: ContactFieldErrors; formError?: string; success?: boolean };

export async function saveContact(formData: FormData): Promise<SaveContactResult> {
  const parsed = validateContact(formData);
  const id = String(formData.get("id") ?? "").trim();
  if (!parsed.value) return { fieldErrors: parsed.fieldErrors };
  const supabase = await createClient();
  const query = id ? supabase.from("contacts").update(parsed.value).eq("id", id) : supabase.from("contacts").insert(parsed.value);
  const { error } = await query;
  if (error) return { formError: error.message };
  return { success: true };
}
export async function deleteContact(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) redirect("/contacts");
  const supabase = await createClient();
  const { error } = await supabase.from("contacts").delete().eq("id", id);
  if (error) redirect(`/contacts?confirmDelete=${encodeURIComponent(id)}&error=${encodeURIComponent(error.message)}`);
  redirect("/contacts");
}
export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
