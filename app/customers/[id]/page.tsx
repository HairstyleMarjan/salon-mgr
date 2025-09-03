import { createServerClient } from '@lib/supabase-server';

const s = createServerClient();

export default async function CustomerDetail({
  params,
}: {
  params: { id: string }
}) {
  // klant ophalen
  const { data: cust } = await s
    .from('customers')
    .select('id, first_name, last_name, phone, email, notes, created_at')
    .eq('id', params.id)
    .single();

  // notities / bezoeken (pas aan als jouw tabel anders heet)
  const { data: visits } = await s
    .from('visit_notes')
    .select('id, content, created_at, staff_id')
    .eq('customer_id', params.id)
    .order('created_at', { ascending: false });

  if (!cust) {
    return <p>Onbekende klant.</p>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">
        {cust.first_name} {cust.last_name}
      </h1>

      <section className="card space-y-1 text-sm">
        <div><strong>Telefoon:</strong> {cust.phone || '–'}</div>
        <div><strong>E-mail:</strong> {cust.email || '–'}</div>
        <div>
          <strong>Aangemaakt:</strong>{' '}
          {cust.created_at
            ? new Date(cust.created_at).toLocaleDateString('nl-NL')
            : '–'}
        </div>
        <div><strong>Notities:</strong> {cust.notes || '–'}</div>
      </section>

      <section className="card">
        <h2 className="font-medium mb-2">Bezoeknotities / kleurrecepten</h2>
        <ul className="space-y-2">
          {(visits || []).map((v: any) => (
            <li key={v.id} className="text-sm">
              <div className="text-slate-500">
                {v.created_at
                  ? new Date(v.created_at).toLocaleString('nl-NL')
                  : ''}
              </div>
              <div>{v.content}</div>
            </li>
          ))}
          {(!visits || visits.length === 0) && (
            <li className="text-sm text-slate-500">Nog geen notities.</li>
          )}
        </ul>
      </section>
    </div>
  );
}
