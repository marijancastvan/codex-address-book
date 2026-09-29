"use server";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { validateContact, type ContactFieldErrors } from "@/lib/validation";

export type SaveContactResult = { fieldErrors?: ContactFieldErrors; formError?: string; success?: boolean };
type CityOption = { id: string; name: string };
export type CreateCityForContactResult =
  | { success: true; city: CityOption }
  | { success: false; error: string };

export async function createCityForContact(rawName: string): Promise<CreateCityForContactResult> {
  const name = rawName.trim();
  if (!name) return { success: false, error: "Naziv mesta je obavezan." };
  if (name.length > 100) return { success: false, error: "Naziv mesta može imati najviše 100 znakova." };

  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { success: false, error: "Prijavite se da biste kreirali mesto." };

  const { data, error } = await supabase
    .from("cities")
    .insert({ name })
    .select("id, name")
    .single();

  if (!error && data) return { success: true, city: data };
  if (error?.code === "23505") {
    const escapedName = name.replace(/[\\%_]/g, "\\$&");
    const { data: matches, error: lookupError } = await supabase
      .from("cities")
      .select("id, name")
      .ilike("name", `%${escapedName}%`);
    const existingCity = matches?.find((city) => city.name.trim().toLocaleLowerCase() === name.toLocaleLowerCase());
    if (!lookupError && existingCity) return { success: true, city: existingCity };
    return { success: false, error: "Mesto sa ovim nazivom već postoji, ali nije moglo da se učita. Pokušajte ponovo." };
  }

  return { success: false, error: error?.message ?? "Kreiranje mesta nije uspelo. Pokušajte ponovo." };
}

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
