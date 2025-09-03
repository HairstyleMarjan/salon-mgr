import { createServer } from '@/lib/supabase';
import { format } from 'date-fns';
import nl from 'date-fns/locale/nl';

export default async function Dashboard() {
  const supabase = createServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return <p>Niet ingelogd.</p>;

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  const todayISO = new Date().toISOString().slice(0,10);
  const { data: appts } = await supabase
    .from('appointments')
    .select('id, starts_at, ends_at, customers(first_name,last_name)')
    .gte('starts_at', todayISO)
    .order('starts_at', { ascending: true });

  // RPC voor dagomzet, als die bestaat
  let salesToday = 0;
  const { data: salesSum } = await supabase.rpc('sum_sales_today', { p_salon: profile?.salon_id });
  if (typeof salesSum === 'number') salesToday = salesSum;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Welkom</h1>

      <section className="card">
        <h2 className="font-medium mb-2">Afspraken vandaag</h2>
        <ul className="space-y-1">
          {(appts||[]).map((a:any) => (
            <li key={a.id} className="text-sm">
              {format(new Date(a.starts_at), "HH:mm", { locale: nl })} — {a.customers?.first_name} {a.customers?.last_name}
            </li>
          ))}
          {(!appts || appts.length===0) && <li className="text-sm text-slate-500">Geen afspraken.</li>}
        </ul>
      </section>

      <section className="card">
        <h2 className="font-medium mb-2">Omzet vandaag</h2>
        <p className="text-xl font-semibold">€ {Number(salesToday || 0).toFixed(2)}</p>
      </section>
    </div>
  );
}
