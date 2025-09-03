import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase-server';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';

export default async function Dashboard() {
  const s = createServerClient();

  // check login
  const { data: { user } } = await s.auth.getUser();
  if (!user) redirect('/login');

  // laad profiel (voor salon_id)
  const { data: profile } = await s
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  // vandaag 00:00 t/m 23:59
  const today = new Date();
  const startISO = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  ).toISOString();

  const { data: appts } = await s
    .from('appointments')
    .select(
      'id, starts_at, customers(first_name,last_name), services(name)'
    )
    .gte('starts_at', startISO)
    .order('starts_at', { ascending: true });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Welkom</h1>

      <section className="card">
        <h2 className="font-medium mb-2">Afspraken vandaag</h2>
        <ul className="space-y-1">
          {(appts || []).map((a: any) => (
            <li key={a.id} className="text-sm">
              <span className="text-slate-500">
                {format(new Date(a.starts_at), 'HH:mm', { locale: nl })}
              </span>{' '}
              — {a.customers?.first_name} {a.customers?.last_name} • {a.services?.name}
            </li>
          ))}
          {(!appts || appts.length === 0) && (
            <li className="py-2 text-sm text-slate-500">Geen afspraken gevonden.</li>
          )}
        </ul>
      </section>
    </div>
  );
}
