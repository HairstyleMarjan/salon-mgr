import { redirect } from 'next/navigation';
import { createServerClient } from '@lib/supabase-server';

const s = createServerClient();

export default async function Dashboard() {
  // check of gebruiker is ingelogd
  const { data: { user } } = await s.auth.getUser();
  if (!user) redirect('/login');

  const today = new Date();
  const todayISO = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();

  const { data: appts } = await s
    .from('appointments')
    .select('id, starts_at, customers(first_name,last_name), services(name)')
    .gte('starts_at', todayISO)
    .order('starts_at', { ascending: true })
    .limit(10);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Welkom</h1>

      <section className="card">
        <h2 className="font-medium mb-2">Afspraken vandaag</h2>
        <ul className="divide-y">
          {(appts || []).map((a: any) => (
            <li key={a.id} className="py-2 flex justify-between">
              <div>{a.customers?.first_name} {a.customers?.last_name}</div>
              <div className="text-sm text-slate-500">{a.services?.name || ''}</div>
              <div className="text-sm">
                {new Date(a.starts_at).toLocaleString('nl-NL', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </li>
          ))}
          {(!appts || appts.length === 0) && (
            <li className="py-2 text-sm text-slate-500">Geen afspraken.</li>
          )}
        </ul>
      </section>
    </div>
  );
}
