'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase-browser';

// typen voor services en winkelmand
type Service = { id: string; name: string; default_price: number };
type Item = { service_id: string; description: string; qty: number; unit_price: number };

export default function POSPage() {
  // één Supabase client en we noemen ‘m simpelweg s
  const s = createClient();

  const [services, setServices] = useState<Service[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [payment, setPayment] = useState<'cash' | 'card' | 'other'>('card');

  // services laden
  useEffect(() => {
    s.from('services')
      .select('id,name,default_price')
      .eq('active', true)
      .then(({ data }) => setServices(data || []));
  }, []);

  // totaalbedrag
  const total = items.reduce((sum, i) => sum + (i.qty * i.unit_price), 0);

  // item toevoegen
  function add(service: Service) {
    setItems(prev => [
      ...prev,
      {
        service_id: service.id,
        description: service.name,
        qty: 1,
        unit_price: Number(service.default_price),
      },
    ]);
  }

  // afrekenen
  async function checkout() {
    if (!items.length) return;

    const { data: { user } } = await s.auth.getUser();
    if (!user) return alert('Niet ingelogd');

    // profiel van de gebruiker ophalen (voor salon_id)
    const { data: profile, error: perr } = await s
      .from('profiles')
      .select('salon_id,id')
      .eq('id', user.id)
      .single();

    if (perr || !profile) return alert('Profiel niet gevonden');

    // verkoop opslaan
    const { data: sale, error: e1 } = await s
      .from('sales')
      .insert({
        salon_id: profile.salon_id,
        staff_id: profile.id,
        total: total,
        payment_method: payment,
      })
      .select('id')
      .single();

    if (e1 || !sale) return alert(e1?.message || 'Kon verkoop niet opslaan');

    // verkoopregels opslaan
    const { error: e2 } = await s.from('sale_items').insert(
      items.map(it => ({
        sale_id: sale.id,
        service_id: it.service_id,
        description: it.description,
        qty: it.qty,
        unit_price: it.unit_price,
      }))
    );

    if (e2) return alert(e2.message);

    setItems([]); // leeg mandje
    alert('Bon opgeslagen ✅');
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="card">
        <h2 className="font-medium mb-2">Diensten</h2>
        <div className="grid grid-cols-2 gap-2">
          {services.map(sv => (
            <button key={sv.id} onClick={() => add(sv)} className="btn text-left">
              <span className="mr-2">{sv.name}</span>
              <span className="text-slate-500">€ {(Number(sv.default_price)).toFixed(2)}</span>
            </button>
          ))}
        </div>
        {services.length === 0 && (
          <div className="text-sm text-slate-500 mt-3">Nog geen diensten. Voeg ze toe op de pagina Diensten.</div>
        )}
      </div>

      <div className="card">
        <h2 className="font-medium mb-2">Bon</h2>
        <ul className="divide-y mb-3">
          {items.map((it, idx) => (
            <li key={idx} className="py-2 flex justify-between">
              <span>{it.description}</span>
              <span>€ {(it.qty * it.unit_price).toFixed(2)}</span>
            </li>
          ))}
          {items.length === 0 && (
            <li className="py-2 text-sm text-slate-500">Nog geen items.</li>
          )}
        </ul>

        <div className="flex items-center justify-between mb-3">
          <div><strong>Totaal</strong></div>
          <div><strong>€ {total.toFixed(2)}</strong></div>
        </div>

        <div className="flex gap-2 mb-3">
          <select className="input" value={payment} onChange={e => setPayment(e.target.value as any)}>
            <option value="card">Pin</option>
            <option value="cash">Contant</option>
            <option value="other">Overig</option>
          </select>
        </div>

        <button disabled={!items.length} onClick={checkout} className="btn">Afrekenen</button>
      </div>
    </div>
  );
}
