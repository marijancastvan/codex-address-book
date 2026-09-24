"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { saveContact } from "./actions";
import type { ContactFieldErrors, ContactInput } from "@/lib/validation";

type CityOption = { id: string; name: string };
type ContactFormValues = ContactInput & { id: string };

export function ContactForm({
  initialValue,
  cities,
  closeHref,
  editing,
}: {
  initialValue: ContactFormValues;
  cities: CityOption[];
  closeHref: string;
  editing: boolean;
}) {
  const router = useRouter();
  const [values, setValues] = useState(initialValue);
  const [fieldErrors, setFieldErrors] = useState<ContactFieldErrors>({});
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);

  function updateField(field: keyof ContactInput, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setFieldErrors({});
    setFormError("");

    try {
      const result = await saveContact(new FormData(event.currentTarget));
      if (result.success) {
        router.replace("/contacts");
        router.refresh();
        return;
      }
      setFieldErrors(result.fieldErrors ?? {});
      setFormError(result.formError ?? "Proverite unete podatke.");
    } catch {
      setFormError("Čuvanje kontakta nije uspelo. Pokušajte ponovo.");
    } finally {
      setBusy(false);
    }
  }

  return <form onSubmit={submit} className="contact-form" noValidate>
    <input type="hidden" name="id" value={initialValue.id ?? ""} />
    <label htmlFor="contact-first-name">Ime<input id="contact-first-name" name="first_name" value={values.first_name} onChange={(event) => updateField("first_name", event.target.value)} maxLength={100} aria-invalid={Boolean(fieldErrors.first_name)} aria-describedby={fieldErrors.first_name ? "contact-first-name-error" : undefined} />{fieldErrors.first_name && <span className="field-error" id="contact-first-name-error" role="alert">{fieldErrors.first_name}</span>}</label>
    <label htmlFor="contact-last-name">Prezime<input id="contact-last-name" name="last_name" value={values.last_name} onChange={(event) => updateField("last_name", event.target.value)} maxLength={100} aria-invalid={Boolean(fieldErrors.last_name)} aria-describedby={fieldErrors.last_name ? "contact-last-name-error" : undefined} />{fieldErrors.last_name && <span className="field-error" id="contact-last-name-error" role="alert">{fieldErrors.last_name}</span>}</label>
    <label htmlFor="contact-phone">Telefon<input id="contact-phone" name="phone" type="tel" value={values.phone} onChange={(event) => updateField("phone", event.target.value)} maxLength={40} aria-invalid={Boolean(fieldErrors.phone)} aria-describedby={fieldErrors.phone ? "contact-phone-error" : undefined} />{fieldErrors.phone && <span className="field-error" id="contact-phone-error" role="alert">{fieldErrors.phone}</span>}</label>
    <label htmlFor="contact-email">Email<input id="contact-email" name="email" type="email" value={values.email} onChange={(event) => updateField("email", event.target.value)} maxLength={254} aria-invalid={Boolean(fieldErrors.email)} aria-describedby={fieldErrors.email ? "contact-email-error" : undefined} />{fieldErrors.email && <span className="field-error" id="contact-email-error" role="alert">{fieldErrors.email}</span>}</label>
    <label htmlFor="contact-city">Mesto<select id="contact-city" name="city_id" value={values.city_id} onChange={(event) => updateField("city_id", event.target.value)} aria-invalid={Boolean(fieldErrors.city_id)} aria-describedby={fieldErrors.city_id ? "contact-city-error" : undefined}><option value="">Izaberite mesto</option>{cities.map((city) => <option key={city.id} value={city.id}>{city.name}</option>)}</select>{fieldErrors.city_id && <span className="field-error" id="contact-city-error" role="alert">{fieldErrors.city_id}</span>}</label>
    {formError && <p className="error" role="alert">{formError}</p>}
    <div className="actions"><button disabled={busy}>{busy ? "Čuvanje…" : editing ? "Sačuvaj izmene" : "Sačuvaj kontakt"}</button><a className="button-link secondary" href={closeHref}>Otkaži</a></div>
  </form>;
}
