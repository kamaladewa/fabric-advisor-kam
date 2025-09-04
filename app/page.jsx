'use client';
import React, { useEffect, useState } from 'react';

export default function Page() {
  const GARMENTS = ['Kaos','Kemeja','Blouse','Gaun/ Dress','Celana','Rok','Hoodie/ Sweater','Jaket Fashion','Jaket Outdoor','Blazer/ Jas','Seragam','Olahraga/ Athleisure'];
  const CLIMATES = [ { value: 'tropis', label: 'Tropis (panas/lembap)' }, { value: 'sedang', label: 'Sedang' }, { value: 'dingin', label: 'Dingin' }, { value: 'lembap', label: 'Lembap/berhujan' } ];
  const BUDGETS = [ { value: 'low', label: 'Rendah' }, { value: 'mid', label: 'Sedang' }, { value: 'high', label: 'Tinggi' } ];
  const PREFERENCES = [ { key: 'nyaman', label: 'Nyaman/ lembut' }, { key: 'adem', label: 'Adem/ breathable' }, { key: 'hangat', label: 'Hangat' }, { key: 'ringan', label: 'Ringan' }, { key: 'elastis', label: 'Elastis/ stretch' }, { key: 'jatuh', label: 'Jatuh/ drapey' }, { key: 'tahan_air', label: 'Tahan air' }, { key: 'tahan_kerut', label: 'Tidak mudah kusut' }, { key: 'tahan_lama', label: 'Tahan lama' }, { key: 'mewah', label: 'Tampilan mewah' } ];

  const [garment, setGarment] = useState(GARMENTS[0]);
  const [climate, setClimate] = useState('tropis');
  const [budget, setBudget] = useState('mid');
  const [prefs, setPrefs] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(()=>{ fetchRecommendations(); }, []);

  async function fetchRecommendations(){
    setLoading(true);
    try{
      const res = await fetch('/api/recommend', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ garment, climate, prefs, budget })
      });
      const j = await res.json();
      setResults(j.top || []);
    }catch(e){
      console.error(e);
    }finally{
      setLoading(false);
    }
  }

  const togglePref = (k) => setPrefs(s => s.includes(k) ? s.filter(x=>x!==k) : [...s,k]);

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900">
      <header className="border-b bg-white">
        <div className="mx-auto max-w-6xl px-4 py-4"><h1 className="text-2xl font-bold">Fabric Advisor</h1></div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-4">
          <div className="rounded-2xl bg-white p-4 border">
            <label className="block text-sm font-medium">Jenis pakaian</label>
            <select className="w-full rounded-xl border px-3 py-2 mt-1" value={garment} onChange={(e)=>setGarment(e.target.value)}>
              {GARMENTS.map(g => <option key={g}>{g}</option>)}
            </select>

            <label className="block text-sm font-medium mt-3">Iklim</label>
            <select className="w-full rounded-xl border px-3 py-2 mt-1" value={climate} onChange={(e)=>setClimate(e.target.value)}>
              {CLIMATES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>

            <label className="block text-sm font-medium mt-3">Budget</label>
            <div className="flex gap-2 mt-2">
              {BUDGETS.map(b=> <button key={b.value} onClick={()=>setBudget(b.value)} className={`rounded-xl border px-3 py-2 ${budget===b.value? 'bg-gray-900 text-white':''}`}>{b.label}</button>)}
            </div>

            <label className="block text-sm font-medium mt-3">Preferensi</label>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {PREFERENCES.map(p=> (
                <button key={p.key} onClick={()=>togglePref(p.key)} className={`rounded-xl border px-3 py-2 text-left ${prefs.includes(p.key)? 'bg-gray-900 text-white':''}`}>{p.label}</button>
              ))}
            </div>

            <div className="mt-4 flex gap-2">
              <button onClick={fetchRecommendations} className="rounded-xl bg-gray-900 text-white px-4 py-2">Cari Rekomendasi</button>
              <button onClick={()=>{ setPrefs([]); setBudget('mid'); setClimate('tropis'); setGarment(GARMENTS[0]); }} className="rounded-xl border px-4 py-2">Reset</button>
            </div>
          </div>
          <div className="rounded-2xl bg-white p-4 border text-sm">Tips: Untuk iklim tropis prioritaskan breathability (Katun, Linen, Tencel). Untuk jaket outdoor pilih softshell / nylon ripstop.</div>
        </div>

        <div className="md:col-span-2 space-y-4">
          <div className="rounded-2xl bg-white p-4 border space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Rekomendasi</h2>
              <div className="text-sm text-gray-500">{loading? 'Mengambil...' : `${results.length} hasil`}</div>
            </div>
            <div className="space-y-3">
              {results.map(r => (
                <div key={r.name} className="border rounded-xl p-3 grid md:grid-cols-3 gap-2">
                  <div>
                    <div className="font-semibold">{r.name}</div>
                    <div className="text-xs text-gray-500 mt-1">{r.texture} • {r.note}</div>
                  </div>
                  <div className="text-sm md:col-span-1">Harga: {r.priceRange ? `Rp ${new Intl.NumberFormat('id-ID').format(r.priceRange[0])} – ${new Intl.NumberFormat('id-ID').format(r.priceRange[1])}/m` : '-'}</div>
                  <div className="text-right md:text-left">
                    <div className="text-xs text-gray-500">Skor: {r.score?.toFixed(2)}</div>
                    <details className="mt-2 text-sm">
                      <summary className="cursor-pointer">Detail</summary>
                      <div className="mt-2 text-xs text-gray-700 grid grid-cols-2 gap-2">
                        <div><strong>Use:</strong> {r.use?.join(', ')}</div>
                        <div><strong>Care:</strong> {r.care}</div>
                        <div><strong>Flags:</strong> {Object.entries(r.flags || {}).filter(([k,v])=>v).map(([k])=>k).join(', ') || '-'}</div>
                        <div><strong>Traits:</strong> Breath {r.traits?.breathability} • Warm {r.traits?.warmth}</div>
                      </div>
                    </details>
                  </div>
                </div>
              ))}
              {!results.length && <div className="text-sm text-gray-500">Klik "Cari Rekomendasi" untuk mulai.</div>}
            </div>
          </div>

          <div className="rounded-2xl bg-white p-4 border">
            <h3 className="font-semibold">Semua kain</h3>
            <FabricList />
          </div>
        </div>
      </main>
      <footer className="border-t bg-white py-4 text-xs text-gray-600"><div className="mx-auto max-w-6xl px-4">© Fabric Advisor</div></footer>
    </div>
  );
}

function FabricList(){
  const [list, setList] = useState([]);
  useEffect(()=>{ fetch('/api/fabrics').then(r=>r.json()).then(setList).catch(console.error); }, []);
  return (
    <div className="mt-3 grid gap-2">
      {list.map(f => (
        <div key={f.name} className="rounded-lg border p-2 text-sm flex items-center justify-between">
          <div>
            <div className="font-medium">{f.name}</div>
            <div className="text-xs text-gray-500">{f.texture} • {f.note}</div>
          </div>
          <div className="text-xs">Rp {new Intl.NumberFormat('id-ID').format(f.priceRange?.[0]||0)} – {new Intl.NumberFormat('id-ID').format(f.priceRange?.[1]||0)}</div>
        </div>
      ))}
    </div>
  );
}
