export type ContactInput = { first_name: string; last_name: string; phone: string; email: string; city_id: string };
export type ContactFieldErrors = Partial<Record<keyof ContactInput, string>>;

export function validateContact(formData: FormData): { value?: ContactInput; fieldErrors?: ContactFieldErrors } {
  const value: ContactInput = {
    first_name: String(formData.get("first_name") ?? "").trim(),
    last_name: String(formData.get("last_name") ?? "").trim(),
    phone: String(formData.get("phone") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    city_id: String(formData.get("city_id") ?? "").trim(),
  };
  const fieldErrors: ContactFieldErrors = {};
  if (!value.first_name) fieldErrors.first_name = "Ime je obavezno.";
  if (!value.last_name) fieldErrors.last_name = "Prezime je obavezno.";
  if (!value.phone) fieldErrors.phone = "Broj telefona je obavezan.";
  else if (!/^(?=.*\d)[0-9+()\s-]+$/.test(value.phone)) fieldErrors.phone = "Unesite ispravan broj telefona.";
  if (!value.email) fieldErrors.email = "Email je obavezan.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.email)) fieldErrors.email = "Unesite ispravnu email adresu.";
  if (!value.city_id) fieldErrors.city_id = "Mesto je obavezno.";
  if (Object.keys(fieldErrors).length) return { fieldErrors };
  return { value };
}
