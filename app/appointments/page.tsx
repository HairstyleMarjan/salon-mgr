import { createServerClient } from '@lib/supabase-server';

const s = createServerClient();

export default async function AppointmentsPage() {
  const today = new Date();
  const todayISO = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();

  const { data: appts } = await s
    .from('appointments')
    .select(`id, starts_at, ends_at, notes,
             customers(first_name, last_name),
             services(name)`)
    .gte('starts_at', todayISO)
    .order('starts_at', { ascending: true });

  function fmt(d?: string | null) {
    if (!d) return '';
    return new Date(d).toLocaleString('nl-NL', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Agenda (vandaag & later)</h1>
      <ul className="divide-y">
        {(appts || []).map((a: any) => (
          <li key={a.id} className="py-2 flex justify-between">
            <div className="font-medium">
              {a.customers?.first_name} {a.customers?.last_name}
            </div>
            <div className="text-sm text-slate-500">
              {a.services?.name || ''} {a.notes ? `· ${a.notes}` : ''}
            </div>
            <div className="text-sm">{fmt(a.starts_at)}</div>
          </li>
        ))}
        {(!appts || appts.length === 0) && (
          <li className="py-2 text-sm text-slate-500">Geen afspraken gevonden.</li>
        )}
      </ul>
    </div>
  );
}
