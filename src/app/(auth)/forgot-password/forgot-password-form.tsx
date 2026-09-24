"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

export function ForgotPasswordForm() {
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setMessage("");
    const email = String(new FormData(event.currentTarget).get("email") ?? "").trim();
    if (!email) { setError("Email je obavezan."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("Unesite ispravnu email adresu."); return; }
    setBusy(true);
    try {
      const supabase = createClient();
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
      });
      if (resetError) throw resetError;
      setMessage("Ako postoji nalog za ovu email adresu, poslaćemo poruku sa linkom za promenu lozinke.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Slanje email-a nije uspelo. Pokušajte ponovo.");
    } finally { setBusy(false); }
  }

  return <main className="auth-card">
    <h1>Zaboravljena lozinka</h1>
    <p className="subtle">Unesite email adresu povezanu sa nalogom.</p>
    <form className="stack" onSubmit={submit} noValidate>
      <label>Email<input name="email" type="email" autoComplete="email" required /></label>
      {error && <p className="error" role="alert">{error}</p>}{message && <p className="success" role="status">{message}</p>}
      <button disabled={busy}>{busy ? "Slanje…" : "Pošalji link za promenu lozinke"}</button>
    </form>
    <p><Link href="/login">Nazad na prijavu</Link></p>
  </main>;
}
