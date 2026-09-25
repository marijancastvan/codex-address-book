"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const callbackError = searchParams.get("error");
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setMessage("");
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") ?? "").trim();
    const password = String(data.get("password") ?? "");
    if (!email) { setError("Email je obavezan."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("Unesite ispravnu email adresu."); return; }
    if (!password) { setError("Lozinka je obavezna."); return; }
    if (password.length < 8) { setError("Lozinka mora imati najmanje 8 karaktera."); return; }
    setBusy(true);
    try {
      const supabase = createClient();
      if (mode === "login") {
        const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
        if (authError) throw authError;
        router.replace("/dashboard");
      } else {
        const { data: result, error: authError } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard` } });
        if (authError) throw authError;
        if (result.session) { router.replace("/dashboard"); router.refresh(); }
        else setMessage("Registracija je uspešna. Proverite email i potvrdite adresu da biste se prijavili.");
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Došlo je do greške. Pokušajte ponovo.");
    } finally { setBusy(false); }
  }
  return <main className="auth-card">
    <h1>{mode === "login" ? "Prijava" : "Kreiranje naloga"}</h1><p className="subtle">Address Book</p>
    <form className="stack" onSubmit={submit} noValidate>
      <label>Email<input name="email" type="email" autoComplete="email" required /></label>
      <label>Lozinka<input name="password" type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} minLength={8} required /></label>
      {(error || callbackError) && <p className="error" role="alert">{error || callbackError}</p>}{message && <p className="success" role="status">{message}</p>}
      <button disabled={busy}>{busy ? "Sačekajte…" : mode === "login" ? "Prijavi se" : "Registruj se"}</button>
    </form>
    <p className="subtle">{mode === "login" ? <><Link href="/forgot-password">Zaboravili ste lozinku?</Link><br />Nemate nalog? <Link href="/register">Registrujte se</Link></> : <>Već imate nalog? <Link href="/login">Prijavite se</Link></>}</p>
  </main>;
}
