"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function cityErrorMessage(error: { code?: string; message: string }) {
  if (error.code === "23505") return "Mesto sa ovim nazivom već postoji.";
  if (error.code === "23503") return "Ovo mesto koriste kontakti i ne može biti obrisano.";
  return error.message;
}

export async function saveCity(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const id = String(formData.get("id") ?? "").trim();
  const modal = id ? `edit=${encodeURIComponent(id)}` : "new=city";
  if (!name) redirect(`/cities?${modal}&error=${encodeURIComponent("Naziv mesta je obavezan.")}`);
  if (name.length > 100) redirect(`/cities?${modal}&error=${encodeURIComponent("Naziv mesta može imati najviše 100 znakova.")}`);

  const supabase = await createClient();
  const query = id
    ? supabase.from("cities").update({ name }).eq("id", id)
    : supabase.from("cities").insert({ name });
  const { error } = await query;
  if (error) redirect(`/cities?${modal}&error=${encodeURIComponent(cityErrorMessage(error))}`);
  redirect("/cities");
}

export async function deleteCity(formData: FormData) {
  const id = String(formData.get("id") ?? "").trim();
  if (!id) redirect("/cities");
  const supabase = await createClient();
  const { error } = await supabase.from("cities").delete().eq("id", id);
  if (error) redirect(`/cities?confirmDelete=${encodeURIComponent(id)}&error=${encodeURIComponent(cityErrorMessage(error))}`);
  redirect("/cities");
}
