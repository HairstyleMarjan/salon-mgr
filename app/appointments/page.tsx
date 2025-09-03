import { createServerClient } from '@/lib/supabase-server';
import { format } from 'date-fns';
import { nl } from 'date-fns/locale';

export default async function AppointmentsPage() {
  const s = createServerClient();

  const { data: appts } = await s
    .from('appointments')
    .select(
      'id, starts_at, ends_at, notes, customers(first_name,last_name), services(name)'
    )
    .order('starts_at', { ascending: true });

  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-semibold">Agenda (vandaag & later)</h1>

      <ul className="divide-y card">
        {(appts || []).map((a: any) => (
          <li key={a.id} className="py-2 text-sm flex justify-between">
            <div>
              <div className="font-medium">
                {a.customers?.first_name} {a.customers?.last_name}
              </div>
              <div className="text-slate-500">
                {a.services?.name || '—'} {a.notes ? `• ${a.notes}` : ''}
              </div>
            </div>

            <div>
              {format(new Date(a.starts_at), 'dd/MM HH:mm', { locale: nl })}
            </div>
          </li>
        ))}

        {(!appts || appts.length === 0) && (
          <li className="py-2 text-sm text-slate-500">Geen afspraken gevonden.</li>
        )}
      </ul>
    </div>
  );
}
