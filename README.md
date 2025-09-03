# Salon Manager (MVP)

Een simpele, productie-klare web-app (PWA-ready) voor kapsalons.
Gemaakt met **Next.js (App Router)** + **Supabase**.

## Snelstart (lokaal)
1. Vul `.env.local` in (zie `.env.example`).
2. `npm install`
3. `npm run dev`
4. Open http://localhost:3000

## Deploy naar Vercel
1. Maak een nieuw project in Vercel (Import → Upload projectmap of koppel je repo).
2. Voeg **Environment Variables** toe:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Deploy. Je krijgt direct een URL.
4. Open de URL op iPhone/iPad → **Delen** → **Zet op beginscherm**.

## Inloggen
Gebruik de e-mails/wachtwoorden die je in Supabase → Auth → Users hebt aangemaakt.

## Belangrijke pagina's
- `/login` — inloggen
- `/dashboard` — afspraken vandaag + dagomzet
- `/customers` — klanten zoeken/bekijken
- `/appointments` — agenda (lijst)
- `/services` — diensten beheren
- `/pos` — kassa (bon maken, pin/contant)

## Notes
- RLS is ingesteld in de database (per salon).
- Dit is een MVP: makkelijk uit te breiden met DnD-kalender, exports, herinneringen, etc.
