'use client';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase-browser';

type Service = { id:string; name:string; default_price:number; default_duration_min:number; active:boolean };

export default function ServicesPage() {
  const s = createClient();
  const [list, setList] = useState<Service[]>([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState<number>(25);
  const [dur, setDur] = useState<number>(30);

  async function load() {
    const { data } = await s.from('services').select('*').order('name');
    setList(data||[]);
  }
  useEffect(()=>{ load(); },[]);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    // salon_id ophalen via profiel
    const { data: { user } } = await s.auth.getUser();
    const { data: profile } = await s.from('profiles').select('salon_id').eq('id', user!.id).single();
    await s.from('services').insert({ salon_id: profile!.salon_id, name, default_price: price, default_duration_min: dur, active: true });
    setName(''); setPrice(25); setDur(30);
    await load();
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <section className="card">
        <h2 className="font-medium mb-3">Nieuwe dienst</h2>
        <form onSubmit={add} className="space-y-2">
          <input className="input" placeholder="Naam (bv. Knippen)" value={name} onChange={e=>setName(e.target.value)} required />
          <div className="flex gap-2">
            <input className="input" type="number" step="0.01" placeholder="Prijs" value={price} onChange={e=>setPrice(Number(e.target.value))} />
            <input className="input" type="number" placeholder="Duur (min)" value={dur} onChange={e=>setDur(Number(e.target.value))} />
          </div>
          <button className="btn">Toevoegen</button>
        </form>
      </section>

      <section className="card">
        <h2 className="font-medium mb-3">Diensten</h2>
        <ul className="divide-y">
          {list.map(sv => (
            <li key={sv.id} className="py-2 flex justify-between">
              <div>
                <div className="font-medium">{sv.name}</div>
                <div className="text-sm text-slate-500">€ {Number(sv.default_price).toFixed(2)} • {sv.default_duration_min} min</div>
              </div>
              <span className="text-xs">{sv.active ? 'Actief' : 'Inactief'}</span>
            </li>
          ))}
          {list.length===0 && <li className="py-2 text-sm text-slate-500">Nog geen diensten.</li>}
        </ul>
      </section>
    </div>
  );
}
