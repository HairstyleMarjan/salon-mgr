'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase-browser';

type Customer = {
  id: string;
  first_name: string;
  last_name: string;
  phone?: string | null;
  email?: string | null;
};

export default function CustomersPage() {
  const s = createClient();

  const [list, setList] = useState<Customer[]>([]);
  const [q, setQ] = useState('');

  async function load() {
    // basisquery
    let query = s
      .from('customers')
      .select('id,first_name,last_name,phone,email')
      .order('last_name');

    // optionele zoekfilter op achternaam
    if (q) query = query.ilike('last_name', `%${q}%`);

    const { data, error } = await query;
    if (error) {
      console.error(error);
      setList([]);
      return;
    }
    setList(data ?? []);
  }

  // laad bij eerste keer en telkens als q verandert
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-semibold">Klanten</h1>

      <div className="flex gap-2">
        <input
          className="input max-w-xs"
          placeholder="Zoek op achternaam..."
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <a href="/customers/new" className="btn">
          Nieuwe klant
        </a>
      </div>

      <ul className="divide-y">
        {list.map((c) => (
          <li key={c.id} className="py-2 flex justify-between">
            <div>
              <a href={`/customers/${c.id}`} className="font-medium">
                {c.last_name}, {c.first_name}
              </a>
              <span className="ml-2 text-sm text-slate-500">
                {c.phone || ''} {c.email ? `• ${c.email}` : ''}
              </span>
            </div>
          </li>
        ))}
        {list.length === 0 && (
          <li className="py-2 text-sm text-slate-500">Geen klanten gevonden.</li>
        )}
      </ul>
    </div>
  );
}
