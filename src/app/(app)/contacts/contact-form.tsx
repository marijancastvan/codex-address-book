"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { createCityForContact, saveContact } from "./actions";
import type { ContactFieldErrors, ContactInput } from "@/lib/validation";

type CityOption = { id: string; name: string };
type ContactFormValues = ContactInput & { id: string };

export function ContactForm({
  initialValue,
  initialCity,
  closeHref,
  editing,
}: {
  initialValue: ContactFormValues;
  initialCity: CityOption | null;
  closeHref: string;
  editing: boolean;
}) {
  const router = useRouter();
  const [values, setValues] = useState(initialValue);
  const [fieldErrors, setFieldErrors] = useState<ContactFieldErrors>({});
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);
  const [cityText, setCityText] = useState(initialCity?.name ?? "");
  const [selectedCity, setSelectedCity] = useState<CityOption | null>(initialCity);
  const [cityResults, setCityResults] = useState<CityOption[]>([]);
  const [cityLoading, setCityLoading] = useState(false);
  const [citySearchError, setCitySearchError] = useState("");
  const [cityCreateLoading, setCityCreateLoading] = useState(false);
  const [cityCreateError, setCityCreateError] = useState("");

  useEffect(() => {
    const term = cityText.trim();
    if (selectedCity && term === selectedCity.name) return;
    if (term.length < 2) {
      setCityResults([]);
      setCityLoading(false);
      setCitySearchError("");
      return;
    }

    let active = true;
    setCityLoading(true);
    setCitySearchError("");
    const timeout = window.setTimeout(async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("cities")
          .select("id, name")
          .ilike("name", `%${term}%`)
          .order("name")
          .limit(10);

        if (!active) return;
        if (error) {
          setCityResults([]);
          setCitySearchError("Pretraga mesta nije uspela. Pokušajte ponovo.");
        } else {
          setCityResults(data ?? []);
        }
      } catch {
        if (!active) return;
        setCityResults([]);
        setCitySearchError("Pretraga mesta nije uspela. Pokušajte ponovo.");
      } finally {
        if (active) setCityLoading(false);
      }
    }, 250);

    return () => {
      active = false;
      window.clearTimeout(timeout);
    };
  }, [cityText, selectedCity]);

  function updateField(field: keyof ContactInput, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
  }

  function updateCityText(value: string) {
    setCityText(value);
    setSelectedCity(null);
    setCityCreateError("");
    updateField("city_id", "");
  }

  function selectCity(city: CityOption) {
    setSelectedCity(city);
    setCityText(city.name);
    updateField("city_id", city.id);
    setCityResults([]);
    setCitySearchError("");
    setCityCreateError("");
  }

  async function createCity() {
    const name = cityText.trim();
    if (cityCreateLoading || !name) return;
    setCityCreateLoading(true);
    setCityCreateError("");
    try {
      const result = await createCityForContact(name);
      if (result.success) {
        selectCity(result.city);
      } else {
        setCityCreateError(result.error);
      }
    } catch {
      setCityCreateError("Kreiranje mesta nije uspelo. Pokušajte ponovo.");
    } finally {
      setCityCreateLoading(false);
    }
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
    <div className="city-picker">
      <div className="city-picker-row">
        <label htmlFor="contact-city">Mesto<input id="contact-city" type="search" value={cityText} onChange={(event) => updateCityText(event.target.value)} placeholder="Pretražite mesta" autoComplete="off" disabled={cityCreateLoading} role="combobox" aria-autocomplete="list" aria-expanded={cityResults.length > 0} aria-controls="contact-city-results" aria-invalid={Boolean(fieldErrors.city_id)} aria-describedby={fieldErrors.city_id ? "contact-city-error" : undefined} /></label>
        <button type="button" className="button-link secondary city-create-toggle" onClick={createCity} disabled={cityCreateLoading || !cityText.trim()}>{cityCreateLoading ? "Kreiranje mesta…" : "Dodaj novo mesto"}</button>
      </div>
      <input type="hidden" name="city_id" value={values.city_id} />
      {cityLoading && <p className="city-search-status" role="status">Pretraživanje mesta…</p>}
      {citySearchError && <p className="city-search-error" role="alert">{citySearchError}</p>}
      {!cityLoading && !citySearchError && cityText.trim().length >= 2 && !selectedCity && cityResults.length === 0 && <p className="city-search-status" role="status">Nema rezultata.</p>}
      {cityResults.length > 0 && <ul className="city-results" id="contact-city-results" role="listbox" aria-label="Rezultati pretrage mesta">
        {cityResults.map((city) => <li key={city.id} role="option" aria-selected="false"><button type="button" className="city-result" onClick={() => selectCity(city)}>{city.name}</button></li>)}
      </ul>}
      {cityCreateError && <p className="city-search-error" role="alert">{cityCreateError}</p>}
      {fieldErrors.city_id && <span className="field-error" id="contact-city-error" role="alert">{fieldErrors.city_id}</span>}
    </div>
    {formError && <p className="error" role="alert">{formError}</p>}
    <div className="actions"><button disabled={busy}>{busy ? "Čuvanje…" : editing ? "Sačuvaj izmene" : "Sačuvaj kontakt"}</button><Link className="button-link secondary" href={closeHref}>Otkaži</Link></div>
  </form>;
}
