"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

export function ResetPasswordForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [complete, setComplete] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setMessage("");
    const data = new FormData(event.currentTarget);
    const password = String(data.get("password") ?? "");
    const confirmation = String(data.get("confirmation") ?? "");
    if (password.length < 8) { setError("Lozinka mora imati najmanje 8 karaktera."); return; }
    if (password !== confirmation) { setError("Potvrda lozinke se ne poklapa."); return; }
    setBusy(true);
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) {
        setMessage("Lozinka je promenjena. Odjavite se pa se prijavite novom lozinkom.");
      } else {
        setComplete(true);
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Promena lozinke nije uspela. Zatražite novi link za promenu.");
    } finally { setBusy(false); }
  }

  async function finishSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login"); router.refresh();
  }

  return <main className="auth-card">
    <h1>Postavite novu lozinku</h1>
    {complete ? <><p className="success" role="status">Lozinka je uspešno promenjena. Sada se možete prijaviti novom lozinkom.</p><Link href="/login">Idi na prijavu</Link></> : <>
      <form className="stack" onSubmit={submit} noValidate>
        <label>Nova lozinka<input name="password" type="password" autoComplete="new-password" required minLength={8} /></label>
        <label>Potvrda nove lozinke<input name="confirmation" type="password" autoComplete="new-password" required minLength={8} /></label>
        {error && <p className="error" role="alert">{error}</p>}{message && <p className="success" role="status">{message}</p>}
        <button disabled={busy}>{busy ? "Čuvanje…" : "Promeni lozinku"}</button>
      </form>
      {message && <button className="secondary" onClick={finishSignOut}>Odjavi se i idi na prijavu</button>}
    </>}
  </main>;
}
