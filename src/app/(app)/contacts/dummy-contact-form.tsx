"use client";

import { useRef, useState, type FormEvent } from "react";
import { createDummyContacts } from "./actions";

export function DummyContactForm() {
  const [quantity, setQuantity] = useState("10");
  const [pending, setPending] = useState(false);
  const pendingRef = useRef(false);
  const [feedback, setFeedback] = useState<{ kind: "success" | "error"; text: string } | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pendingRef.current) return;
    setFeedback(null);

    const normalizedQuantity = quantity.trim();
    const parsedQuantity = Number(normalizedQuantity);
    if (!/^\d+$/.test(normalizedQuantity) || !Number.isSafeInteger(parsedQuantity) || parsedQuantity < 1 || parsedQuantity > 500) {
      setFeedback({ kind: "error", text: "Količina mora biti ceo broj od 1 do 500." });
      return;
    }

    pendingRef.current = true;
    setPending(true);
    try {
      const result = await createDummyContacts(new FormData(event.currentTarget));
      if (result.success) {
        setFeedback({ kind: "success", text: `Uspešno je kreirano ${result.count} dummy kontakata.` });
      } else {
        setFeedback({ kind: "error", text: result.error });
      }
    } catch {
      setFeedback({ kind: "error", text: "Kreiranje dummy kontakata nije uspelo. Pokušajte ponovo." });
    } finally {
      pendingRef.current = false;
      setPending(false);
    }
  }

  return <form className="dummy-generator" onSubmit={submit} noValidate>
    <div className="dummy-generator-copy">
      <strong>Test podaci</strong>
      <span>Dodajte kontakte za testiranje većeg spiska.</span>
    </div>
    <label htmlFor="dummy-contact-quantity">Količina
      <input id="dummy-contact-quantity" name="quantity" type="number" min={1} max={500} step={1} required value={quantity} onChange={(event) => setQuantity(event.target.value)} disabled={pending} />
    </label>
    <button type="submit" disabled={pending}>{pending ? "Kreiranje…" : "KREIRAJ DUMMY"}</button>
    {feedback && <p className={feedback.kind} role={feedback.kind === "error" ? "alert" : "status"}>{feedback.text}</p>}
  </form>;
}
