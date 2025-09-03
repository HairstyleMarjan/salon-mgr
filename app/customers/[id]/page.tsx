import { createServerClient } from '@lib/supabase-server';

const s = createServerClient();

export default async function CustomerDetail({
  params,
}: {
  params: { id: string }
}) {
  // 1. Klantgegevens ophalen
  const { data: customer } = await s
    .from('customers')
    .select('id, first_name, last_name, phone, email, notes, created_at')
    .eq('id', params.id)
    .single();

  if (!customer) {
    return <p className="text-red-600">Klant niet gevonden.</p>;
  }

  // 2. Eventuele notities / afspraken ophalen
  const { data: visits } = await s
    .from('visit_notes') // ← pas dit aan naar jouw tabelnaam
    .select('id, content, created_at')
    .eq('customer_id', params.id)
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">
        {customer.first_name} {customer.last_name}
      </h1>

      <section className="card space-y-1 text-sm">
        <div><strong>Telefoon:</strong> {customer.phone || '–'}</div>
        <div><strong>E-mail:</strong> {customer.email || '–'}</div>
        <div>
          <strong>Aangemaakt:</strong>{' '}
          {customer.created_at
            ? new Date(customer.created_at).toLocaleDateString('nl-NL')
            : '–'}
        </div>
        <div><strong>Notities:</strong> {customer.notes || '–'}</div>
      </section>

      <section className="card">
        <h2 className="font-medium mb-2">Bezoeknotities</h2>
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
