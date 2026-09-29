import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logout } from "../contacts/actions";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return <main className="shell">
    <section className="panel dashboard-panel">
      <header className="heading data-page-header dashboard-header">
        <div className="page-heading-copy">
          <p className="dashboard-eyebrow">LIČNI ADRESAR</p>
          <div className="page-title-row"><span className="page-title-accent" aria-hidden="true" /><h1>Address Book</h1></div>
          <p className="page-user-chip"><span className="page-user-label">Prijavljeni ste kao</span><span className="page-user-email">{user.email}</span></p>
        </div>
        <div className="actions data-page-actions"><form action={logout}><button className="secondary">Odjava</button></form></div>
      </header>
      <div className="dashboard-intro"><p>Izaberite šta želite da pregledate.</p></div>
      <nav className="dashboard-options" aria-label="Glavna navigacija">
        <Link className="dashboard-option dashboard-option-contacts" href="/contacts"><strong>KONTAKTI</strong><span>Pregled i upravljanje kontaktima</span></Link>
        <Link className="dashboard-option dashboard-option-cities" href="/cities"><strong>MESTA</strong><span>Pregled i upravljanje mestima</span></Link>
      </nav>
    </section>
  </main>;
}
