import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ContactSearch } from "@/components/contact-search";
import { Modal } from "@/components/modal";
import { ContactForm } from "./contact-form";
import { deleteContact, logout } from "./actions";

type SearchParams = Promise<{ q?: string; edit?: string; new?: string; confirmDelete?: string; error?: string }>;

export default async function ContactsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const citiesRequest = supabase.from("cities").select("id, name").order("name");
  let contactsRequest = supabase.from("contacts").select("id, first_name, last_name, phone, email, city_id, cities(name)").eq("user_id", user.id).order("last_name").order("first_name");
  const term = params.q?.trim() ?? "";
  const safeTerm = term.replace(/[,%()]/g, " ").trim();
  if (safeTerm) contactsRequest = contactsRequest.or(`first_name.ilike.%${safeTerm}%,last_name.ilike.%${safeTerm}%,phone.ilike.%${safeTerm}%,email.ilike.%${safeTerm}%`);
  const [{ data: cities, error: cityError }, { data: contacts, error }] = await Promise.all([citiesRequest, contactsRequest]);

  const editing = params.edit ? contacts?.find((contact) => contact.id === params.edit) : undefined;
  const input = editing ?? { first_name: "", last_name: "", phone: "", email: "", city_id: "" };
  const closeHref = term ? `/contacts?q=${encodeURIComponent(term)}` : "/contacts";
  const deleting = params.confirmDelete ? contacts?.find((contact) => contact.id === params.confirmDelete) : undefined;

  return <main className="shell">
    <section className="panel">
      <header className="heading">
        <div><p><Link href="/dashboard">← Početna</Link></p><h1>Moji kontakti</h1><p className="subtle">Prijavljeni ste kao {user.email}</p></div>
        <div className="actions"><Link href="/cities">Mesta</Link><form action={logout}><button className="secondary">Odjava</button></form></div>
      </header>
      {params.error && !params.new && !params.edit && !params.confirmDelete && <p className="error" role="alert">{params.error}</p>}
      {(error || cityError) && <p className="error" role="alert">{error?.message ?? cityError?.message}</p>}
      <div className="toolbar">
        <ContactSearch initialValue={term} />
        <Link className="button-link" href={`/contacts?new=contact${term ? `&q=${encodeURIComponent(term)}` : ""}`}>Novi kontakt</Link>
      </div>
      {error ? <p className="subtle">Kontakti trenutno nisu dostupni.</p> : contacts?.length ? <>
        <div className="table-wrap contact-desktop"><table><thead><tr><th>Ime i prezime</th><th>Telefon</th><th>Email</th><th>Mesto</th><th>Akcije</th></tr></thead><tbody>{contacts.map((contact) => <tr key={contact.id}>
          <td>{contact.first_name} {contact.last_name}</td><td>{contact.phone}</td><td>{contact.email}</td><td>{(contact.cities as unknown as { name: string } | null)?.name ?? "—"}</td>
          <td><div className="row-actions"><Link className="button-link secondary" href={`/contacts?edit=${contact.id}${term ? `&q=${encodeURIComponent(term)}` : ""}`}>Izmeni</Link><Link className="button-link danger" href={`/contacts?confirmDelete=${contact.id}${term ? `&q=${encodeURIComponent(term)}` : ""}`}>Obriši</Link></div></td>
        </tr>)}</tbody></table></div>
        <div className="contact-cards">{contacts.map((contact) => <article className="contact-card" key={contact.id}>
          <h2>{contact.first_name} {contact.last_name}</h2><dl><dt>Telefon</dt><dd>{contact.phone}</dd><dt>Email</dt><dd>{contact.email}</dd><dt>Mesto</dt><dd>{(contact.cities as unknown as { name: string } | null)?.name ?? "—"}</dd></dl>
          <div className="row-actions"><Link className="button-link secondary" href={`/contacts?edit=${contact.id}${term ? `&q=${encodeURIComponent(term)}` : ""}`}>Izmeni</Link><Link className="button-link danger" href={`/contacts?confirmDelete=${contact.id}${term ? `&q=${encodeURIComponent(term)}` : ""}`}>Obriši</Link></div>
        </article>)}</div>
      </> : <p className="subtle">{term ? "Nema kontakata koji odgovaraju pretrazi." : "Još nemate kontakte. Izaberite „Novi kontakt“ da dodate prvi."}</p>}
    </section>

    {(params.new === "contact" || editing) && <Modal title={editing ? "Izmena kontakta" : "Novi kontakt"} closeHref={closeHref}>
      {cityError ? <p className="error" role="alert">Lista mesta nije dostupna: {cityError.message}</p> : <ContactForm initialValue={{ ...input, id: editing?.id ?? "" }} cities={cities ?? []} closeHref={closeHref} editing={Boolean(editing)} />}
    </Modal>}

    {params.confirmDelete && deleting && <Modal title="Brisanje kontakta" closeHref={closeHref}>
      {params.error && <p className="error" role="alert">{params.error}</p>}
      <p>Da li ste sigurni da želite da obrišete ovaj kontakt? <strong>{deleting.first_name} {deleting.last_name}</strong></p>
      <form action={deleteContact} className="actions"><input type="hidden" name="id" value={deleting.id} /><button className="danger">Obriši kontakt</button><Link className="button-link secondary" href={closeHref}>Otkaži</Link></form>
    </Modal>}
  </main>;
}
