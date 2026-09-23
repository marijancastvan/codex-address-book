import { createClient } from "@/lib/supabase/server";
import { saveContact, deleteContact, logout } from "./actions";
type SearchParams = Promise<{ q?: string; edit?: string; error?: string }>;

export default async function ContactsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return <main className="shell"><p className="error">Prijava je neophodna.</p></main>;
  const { data: cities, error: cityError } = await supabase.from("cities").select("id, name").order("name");
  let query = supabase.from("contacts").select("id, first_name, last_name, phone, email, city_id, cities(name)").eq("user_id", user.id).order("last_name").order("first_name");
  const term = params.q?.trim();
  if (term) {
    const safe = term.replace(/[,%()]/g, " ").trim();
    if (safe) query = query.or(`first_name.ilike.%${safe}%,last_name.ilike.%${safe}%,phone.ilike.%${safe}%,email.ilike.%${safe}%`);
  }
  const { data: contacts, error } = await query;
  const editing = params.edit ? contacts?.find((contact) => contact.id === params.edit) : undefined;
  const input = editing ?? { first_name: "", last_name: "", phone: "", email: "", city_id: "" };
  return <main className="shell"><section className="panel">
    <header className="heading"><div><h1>Moji kontakti</h1><p className="subtle">Prijavljeni ste kao {user.email}</p></div><form action={logout}><button className="secondary">Odjava</button></form></header>
    {(params.error || error || cityError) && <p className="error" role="alert">{params.error ?? error?.message ?? cityError?.message}</p>}
    {!cityError && <form action={saveContact} className="contact-form">
      <input type="hidden" name="id" value={editing?.id ?? ""} />
      <label>Ime<input name="first_name" defaultValue={input.first_name} required maxLength={100} /></label>
      <label>Prezime<input name="last_name" defaultValue={input.last_name} required maxLength={100} /></label>
      <label>Telefon<input name="phone" type="tel" defaultValue={input.phone} required maxLength={40} /></label>
      <label>Email<input name="email" type="email" defaultValue={input.email} required maxLength={254} /></label>
      <label>Grad<select name="city_id" defaultValue={input.city_id} required><option value="" disabled>Izaberite grad</option>{(cities ?? []).map((city) => <option key={city.id} value={city.id}>{city.name}</option>)}</select></label>
      <div className="actions"><button>{editing ? "Sačuvaj izmene" : "Dodaj kontakt"}</button>{editing && <a href="/contacts">Otkaži izmenu</a>}</div>
    </form>}
    <form action="/contacts" method="get" className="toolbar"><input name="q" type="search" placeholder="Pretraži ime, prezime, telefon ili email" defaultValue={term ?? ""} /><button className="secondary">Pretraži</button>{term && <a href="/contacts">Obriši pretragu</a>}</form>
    {error ? null : contacts?.length ? <div className="table-wrap"><table><thead><tr><th>Ime i prezime</th><th>Telefon</th><th>Email</th><th>Grad</th><th>Akcije</th></tr></thead><tbody>{contacts.map((contact) => <tr key={contact.id}>
      <td>{contact.first_name} {contact.last_name}</td><td>{contact.phone}</td><td>{contact.email}</td><td>{(contact.cities as unknown as { name: string } | null)?.name ?? "—"}</td>
      <td><div className="row-actions"><a href={`/contacts?edit=${contact.id}${term ? `&q=${encodeURIComponent(term)}` : ""}`}><button type="button" className="secondary">Izmeni</button></a><form action={deleteContact}><input type="hidden" name="id" value={contact.id} /><button className="danger">Obriši</button></form></div></td>
    </tr>)}</tbody></table></div> : <p className="subtle">{term ? "Nema kontakata koji odgovaraju pretrazi." : "Još nemate kontakte. Dodajte prvi kontakt iznad."}</p>}
  </section></main>;
}
