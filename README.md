# Address Book

Mala aplikacija za upravljanje ličnim kontaktima, napravljena pomoću Next.js App Router-a, TypeScript-a i Supabase Auth/PostgreSQL.

## Lokalno pokretanje

1. Instalirajte Node.js i dependencies komandom `npm install`.
2. Kopirajte `.env.example` u `.env.local` i unesite URL Supabase projekta i anon/publishable key.
3. Za novu bazu primenite migracije redom. Za Supabase projekat koji već koristi V1 šemu, primenite samo novu migraciju `202609240001_v2_city_access_and_contact_owner.sql` (ili pokrenite Supabase CLI koji prati već evidentirane migracije).
4. Pokrenite `npm run dev` i otvorite `http://localhost:3000`.

Registracija koristi Supabase Auth. Kada je email confirmation uključen, korisnik dobija poruku da proveri email. Dodati su početni gradovi u početnoj migraciji. RLS štiti kontakte po `user_id`; prijavljeni korisnici mogu upravljati zajedničkom listom mesta.

Za Vercel deployment povežite Git repozitorijum i dodajte `NEXT_PUBLIC_SUPABASE_URL` i `NEXT_PUBLIC_SUPABASE_ANON_KEY` u Vercel project settings. U Supabase Auth → URL Configuration postavite Site URL na `https://codex-address-book.vercel.app` i dodajte production callback URL `https://codex-address-book.vercel.app/auth/callback` kao i `http://localhost:3000/**` u Redirect URLs. Ako email template sam sastavlja confirmation link, koristite `{{ .RedirectTo }}` umesto fiksnog `{{ .SiteURL }}`. Primenite obe migracije pre korišćenja V2.
