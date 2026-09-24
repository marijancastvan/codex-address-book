import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logout } from "../contacts/actions";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return <main className="shell">
    <section className="panel">
      <header className="heading">
        <div><h1>Address Book</h1><p className="subtle">Prijavljeni ste kao {user.email}</p></div>
        <form action={logout}><button className="secondary">Odjava</button></form>
      </header>
      <p>Izaberite šta želite da pregledate.</p>
      <nav className="dashboard-options" aria-label="Glavna navigacija">
        <Link className="dashboard-option" href="/contacts"><strong>KONTAKTI</strong><span>Pregled i upravljanje kontaktima</span></Link>
        <Link className="dashboard-option" href="/cities"><strong>MESTA</strong><span>Pregled i upravljanje mestima</span></Link>
      </nav>
    </section>
  </main>;
}
