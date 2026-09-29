"use server";
import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { validateContact, type ContactFieldErrors } from "@/lib/validation";

export type SaveContactResult = { fieldErrors?: ContactFieldErrors; formError?: string; success?: boolean };
type CityOption = { id: string; name: string };
export type CreateCityForContactResult =
  | { success: true; city: CityOption }
  | { success: false; error: string };
export type CreateDummyContactsResult =
  | { success: true; count: number }
  | { success: false; error: string };

export async function createDummyContacts(formData: FormData): Promise<CreateDummyContactsResult> {
  const rawQuantity = String(formData.get("quantity") ?? "").trim();
  if (!/^\d+$/.test(rawQuantity)) {
    return { success: false, error: "Unesite ceo broj od 1 do 500." };
  }

  const quantity = Number(rawQuantity);
  if (!Number.isSafeInteger(quantity) || quantity < 1 || quantity > 500) {
    return { success: false, error: "Količina mora biti ceo broj od 1 do 500." };
  }

  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return { success: false, error: "Sesija je istekla. Prijavite se ponovo." };
  }

  const { data: cities, error: citiesError } = await supabase.from("cities").select("id");
  if (citiesError) {
    return { success: false, error: "Lista mesta nije dostupna. Pokušajte ponovo." };
  }
  if (!cities?.length) {
    return { success: false, error: "Nema unetih mesta. Dodajte mesto pre kreiranja dummy kontakata." };
  }

  const batchId = randomUUID().replace(/-/g, "");
  const phoneBase = Number.parseInt(batchId.slice(-10), 16) % 10_000_000_000;
  const contacts = Array.from({ length: quantity }, (_, index) => {
    const sequence = String(index + 1).padStart(3, "0");
    const numericSuffix = (phoneBase + index) % 10_000_000_000;
    return {
      first_name: "Dummy",
      last_name: `${batchId}-${sequence}`,
      phone: `+1555${String(numericSuffix).padStart(10, "0")}`,
      email: `dummy.${batchId}.${sequence}@example.test`,
      city_id: cities[index % cities.length].id,
    };
  });

  const { error: insertError } = await supabase.from("contacts").insert(contacts);
  if (insertError) {
    if (insertError.code === "42501") {
      return { success: false, error: "Nemate dozvolu za kreiranje kontakata. Prijavite se ponovo." };
    }
    if (insertError.code === "23503") {
      return { success: false, error: "Jedno od mesta više nije dostupno. Osvežite stranicu i pokušajte ponovo." };
    }
    return { success: false, error: "Kreiranje dummy kontakata nije uspelo. Pokušajte ponovo." };
  }

  revalidatePath("/contacts");
  return { success: true, count: quantity };
}

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
