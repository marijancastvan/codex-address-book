"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useRouter } from "next/navigation";

export function Modal({ title, closeHref, children }: { title: string; closeHref: string; children: ReactNode }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const router = useRouter();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
    return () => { if (dialog?.open) dialog.close(); };
  }, []);

  function close() { router.replace(closeHref, { scroll: false }); }

  return <dialog ref={dialogRef} className="modal" aria-labelledby="modal-title" onCancel={(event) => { event.preventDefault(); close(); }}>
    <header className="modal-heading"><h2 id="modal-title">{title}</h2><button type="button" className="icon-button" aria-label="Zatvori" onClick={close}>×</button></header>
    {children}
  </dialog>;
}
