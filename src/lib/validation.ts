export type ContactInput = { first_name: string; last_name: string; phone: string; email: string; city_id: string };
export function validateContact(formData: FormData): { value?: ContactInput; error?: string } {
  const value: ContactInput = {
    first_name: String(formData.get("first_name") ?? "").trim(),
    last_name: String(formData.get("last_name") ?? "").trim(),
    phone: String(formData.get("phone") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    city_id: String(formData.get("city_id") ?? "").trim(),
  };
  if (!value.first_name || !value.last_name || !value.phone || !value.email || !value.city_id) return { error: "Popunite sva obavezna polja." };
  if (!/^(?=.*\d)[0-9+()\s-]+$/.test(value.phone)) return { error: "Unesite ispravan broj telefona." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.email)) return { error: "Unesite ispravnu email adresu." };
  return { value };
}
