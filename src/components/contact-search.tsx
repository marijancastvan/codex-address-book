"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export function ContactSearch({ initialValue }: { initialValue: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(initialValue);
  const currentQuery = searchParams.toString();

  useEffect(() => {
    if (!initialValue) setValue("");
  }, [initialValue]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const params = new URLSearchParams(currentQuery);
      const term = value.trim();
      if (term) params.set("q", term);
      else params.delete("q");
      const query = params.toString();
      const destination = query ? `${pathname}?${query}` : pathname;
      const current = currentQuery ? `${pathname}?${currentQuery}` : pathname;
      if (destination !== current) router.replace(destination, { scroll: false });
    }, 250);
    return () => window.clearTimeout(timeout);
  }, [currentQuery, pathname, router, value]);

  return <label className="search-label">Pretraga kontakata
    <input type="search" value={value} onChange={(event) => setValue(event.target.value)} placeholder="Ime, prezime, telefon ili email" />
  </label>;
}
