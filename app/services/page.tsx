'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@lib/supabase-browser';

const s = createClient();

type Service = { id: string; name: string; default_price?: number | null };

export default function ServicesPage() {
  const [list, setList] = useState<Service[]>([]);

  async function load() {
    const { data } = await s.from('services').select('*').order('name');
    setList(data || []);
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Diensten</h1>
      <ul className="divide-y">
        {list.map((sv) => (
          <li key={sv.id} className="py-2 flex justify-between">
            <span>{sv.name}</span>
            <span>{sv.default_price != null ? `€ ${Number(sv.default_price).toFixed(2)}` : ''}</span>
          </li>
        ))}
        {list.length === 0 && <li className="py-2 text-sm text-slate-500">Nog geen diensten.</li>}
      </ul>
    </div>
  );
}
