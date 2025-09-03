'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@lib/supabase-browser';

const s = createClient();

type Service = { id: string; name: string; default_price: number | null };
type Item = { service_id: string; description: string; qty: number; unit_price: number };

export default function POSPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [payment, setPayment] = useState<'cash' | 'card' | 'other'>('card');

  useEffect(() => {
    s.from('services')
      .select('id,name,default_price')
      .eq('active', true)
      .then(({ data }) => setServices(data || []));
  }, []);

  const total = items.reduce((sum, i) => sum + i.qty * i.unit_price, 0);

  function add(service: Service) {
    setItems((prev) => [
      ...prev,
      {
        service_id: service.id,
        description: service.name,
        qty: 1,
        unit_price: Number(service.default_price ?? 0),
      },
    ]);
  }

  async function checkout() {
    if (!items.length) return;

    const { data: { user } } = await s.auth.getUser();
    if (!user) return alert('Niet ingelogd');

    const { data: profile, error: perr } = await s
      .from('profiles')
      .select('salon_id_id,id')
      .eq('id', user.id)
      .single();

    if (perr || !profile) return alert('Profiel niet gevonden');

    // 1) verkoop aanmaken
    const { data: sale, error } = await s
      .from('sales')
      .insert({
        salon_id: profile.salon_id_id,
        staff_id: profile.id,
        total: total,
        payment_method: payment,
      })
      .select('id')
      .single();

    if (error || !sale) return alert(error?.message || 'Fout bij opslaan');

    // 2) verkoopregels opslaan
    const rows = items.map((it) => ({
      sale_id: sale.id,
      service_id: it.service_id,
      description: it.description,
      qty: it.qty,
      unit_price: it.unit_price,
    }));

    const { error: e2 } = await s.from('sale_items').insert(rows);
    if (e2) return alert(e2.message);

    setItems([]);
    alert('Bon opgeslagen.');
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Kassa</h1>

      <section className="card">
        <h2 className="font-medium mb-2">Diensten</h2>
        <div className="grid md:grid-cols-2 gap-3">
          {services.map((sv) => (
            <button key={sv.id} className="btn text-left" onClick={() => add(sv)}>
              <span className="mr-2">{sv.name}</span>
              <span className="text-slate-500">€ {Number(sv.default_price ?? 0).toFixed(2)}</span>
            </button>
          ))}
        </div>
        {services.length === 0 && (
          <div className="text-sm text-slate-500 mt-2">Nog geen diensten. Voeg ze toe op de pagina Diensten.</div>
        )}
      </section>

      <section className="card">
        <h2 className="font-medium mb-2">Bon</h2>
        <ul className="divide-y mb-3">
          {items.map((it, idx) => (
            <li key={idx} className="py-2 flex justify-between">
              <span>{it.description}</span>
              <span>
                {it.qty}× € {it.unit_price.toFixed(2)}
              </span>
            </li>
          ))}
          {items.length === 0 && <li className="py-2 text-sm text-slate-500">Nog geen items.</li>}
        </ul>

        <div className="flex items-center justify-between mb-3">
          <strong>Totaal</strong>
          <strong>€ {total.toFixed(2)}</strong>
        </div>

        <div className="flex gap-2 mb-3">
          <select className="input" value={payment} onChange={(e) => setPayment(e.target.value as any)}>
            <option value="card">Pin</option>
            <option value="cash">Contant</option>
            <option value="other">Overig</option>
          </select>
          <button disabled={!items.length} onClick={checkout} className="btn">
            Afrekenen
          </button>
        </div>
      </section>
    </div>
  );
}
