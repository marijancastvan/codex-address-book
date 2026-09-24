import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Modal } from "@/components/modal";
import { deleteCity, saveCity } from "./actions";

type SearchParams = Promise<{ new?: string; edit?: string; confirmDelete?: string; error?: string }>;

export default async function CitiesPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: cities, error } = await supabase.from("cities").select("id, name").order("name");
  const editing = params.edit ? cities?.find((city) => city.id === params.edit) : undefined;
  const deleting = params.confirmDelete ? cities?.find((city) => city.id === params.confirmDelete) : undefined;

  return <main className="shell"><section className="panel">
    <header className="heading">
      <div><p><Link href="/dashboard">← Početna</Link></p><h1>Mesta</h1><p className="subtle">Prijavljeni ste kao {user.email}</p></div>
      <div className="actions"><Link href="/contacts">Kontakti</Link><Link className="button-link" href="/cities?new=city">Novo mesto</Link></div>
    </header>
    {params.error && !params.new && !params.edit && !params.confirmDelete && <p className="error" role="alert">{params.error}</p>}
    {error ? <p className="error" role="alert">Mesta trenutno nisu dostupna: {error.message}</p> : cities?.length ? <div className="table-wrap"><table><thead><tr><th>Naziv mesta</th><th>Akcije</th></tr></thead><tbody>{cities.map((city) => <tr key={city.id}>
      <td>{city.name}</td><td><div className="row-actions"><Link className="button-link secondary" href={`/cities?edit=${city.id}`}>Izmeni</Link><Link className="button-link danger" href={`/cities?confirmDelete=${city.id}`}>Obriši</Link></div></td>
    </tr>)}</tbody></table></div> : <p className="subtle">Nema unetih mesta. Dodajte prvo mesto.</p>}

    {(params.new === "city" || editing) && <Modal title={editing ? "Izmena mesta" : "Novo mesto"} closeHref="/cities">
      {params.error && <p className="error" role="alert">{params.error}</p>}
      <form action={saveCity} className="stack" noValidate>
        <input type="hidden" name="id" value={editing?.id ?? ""} />
        <label>Naziv mesta<input name="name" defaultValue={editing?.name ?? ""} required maxLength={100} autoFocus /></label>
        <div className="actions"><button>{editing ? "Sačuvaj izmene" : "Sačuvaj mesto"}</button><Link className="button-link secondary" href="/cities">Otkaži</Link></div>
      </form>
    </Modal>}

    {params.confirmDelete && deleting && <Modal title="Brisanje mesta" closeHref="/cities">
      {params.error && <p className="error" role="alert">{params.error}</p>}
      <p>Da li ste sigurni da želite da obrišete ovo mesto? <strong>{deleting.name}</strong></p>
      <form action={deleteCity} className="actions"><input type="hidden" name="id" value={deleting.id} /><button className="danger">Obriši mesto</button><Link className="button-link secondary" href="/cities">Otkaži</Link></form>
    </Modal>}
  </section></main>;
}
