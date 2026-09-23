# Address Book

Mala aplikacija za upravljanje ličnim kontaktima, napravljena pomoću Next.js App Router-a, TypeScript-a i Supabase Auth/PostgreSQL.

## Lokalno pokretanje

1. Instalirajte Node.js i dependencies komandom `npm install`.
2. Kopirajte `.env.example` u `.env.local` i unesite URL Supabase projekta i anon/publishable key.
3. Primenite `supabase/migrations/202609230001_initial_schema.sql` u SQL Editor-u Supabase projekta ili kroz Supabase CLI.
4. Pokrenite `npm run dev` i otvorite `http://localhost:3000`.

Registracija koristi Supabase Auth. Kada je email confirmation uključen, korisnik dobija poruku da proveri email. Dodati su početni gradovi u migraciji. RLS štiti kontakte po `user_id`; svi prijavljeni korisnici mogu čitati listu gradova.

Za Vercel deployment povežite Git repozitorijum, dodajte iste javne Supabase promenljive u Vercel project settings, primenite migraciju na Supabase i dodajte domen aplikacije u Auth redirect URL podešavanja.
