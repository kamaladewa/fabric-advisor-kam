import { useState } from 'react';

export default function Home() {
  const [garment, setGarment] = useState('Kaos');
  const [climate, setClimate] = useState('tropis');
  const [budget, setBudget] = useState('mid');
  const [prefs, setPrefs] = useState([]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const PREFERENCES = [
    { key: 'nyaman', label: 'Nyaman' },
    { key: 'adem', label: 'Adem' },
    { key: 'hangat', label: 'Hangat' },
    { key: 'ringan', label: 'Ringan' },
    { key: 'elastis', label: 'Elastis' },
    { key: 'mewah', label: 'Mewah' }
  ];

  function togglePref(k){
    setPrefs(p => p.includes(k) ? p.filter(x=>x!==k) : [...p,k]);
  }

  async function submit(e){
    e.preventDefault();
    setLoading(true);
    setResults(null);
    try{
      const res = await fetch('/api/recommend', {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ garment, climate, budget, prefs })
      });
      const j = await res.json();
      setResults(j.top || []);
    }catch(err){
      setResults({ error: err.message });
    }finally{
      setLoading(false);
    }
  }

  return (
    <div style={{fontFamily:'system-ui,Segoe UI,Roboto,Helvetica,Arial',padding:20}}>
      <header style={{maxWidth:900,margin:'0 auto 20px'}}>
        <h1 style={{margin:0}}>Fabric Advisor</h1>
        <p style={{color:'#555'}}>Pilih kebutuhan kemudian klik <strong>Carikan</strong>.</p>
      </header>

      <main style={{maxWidth:900,margin:'0 auto',display:'grid',gridTemplateColumns:'1fr 1fr',gap:20}}>
        <form onSubmit={submit} style={{padding:20,border:'1px solid #eee',borderRadius:8}}>
          <div style={{marginBottom:12}}>
            <label>Jenis Pakaian</label><br/>
            <select value={garment} onChange={e=>setGarment(e.target.value)} style={{width:'100%',padding:8}}>
              <option>Kaos</option>
              <option>Kemeja</option>
              <option>Blouse</option>
              <option>Gaun/ Dress</option>
              <option>Celana</option>
              <option>Rok</option>
              <option>Hoodie/ Sweater</option>
              <option>Jaket Fashion</option>
              <option>Jaket Outdoor</option>
              <option>Blazer/ Jas</option>
              <option>Seragam</option>
              <option>Olahraga/ Athleisure</option>
            </select>
          </div>

          <div style={{marginBottom:12}}>
            <label>Iklim</label><br/>
            <select value={climate} onChange={e=>setClimate(e.target.value)} style={{width:'100%',padding:8}}>
              <option value="tropis">Tropis (panas/lembap)</option>
              <option value="sedang">Sedang</option>
              <option value="dingin">Dingin</option>
              <option value="lembap">Lembap/berhujan</option>
            </select>
          </div>

          <div style={{marginBottom:12}}>
            <label>Budget</label><br/>
            <select value={budget} onChange={e=>setBudget(e.target.value)} style={{width:'100%',padding:8}}>
              <option value="low">Rendah</option>
              <option value="mid">Sedang</option>
              <option value="high">Tinggi</option>
            </select>
          </div>

          <div style={{marginBottom:12}}>
            <label>Preferensi</label><br/>
            <div style={{display:'flex',flexWrap:'wrap',gap:8,marginTop:8}}>
              {PREFERENCES.map(p=>(
                <button key={p.key} type="button" onClick={()=>togglePref(p.key)}
                  style={{
                    padding:'8px 10px',
                    border: '1px solid #ddd',
                    borderRadius:6,
                    background: prefs.includes(p.key)?'#111':'#fff',
                    color: prefs.includes(p.key)?'#fff':'#111'
                  }}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <button type="submit" style={{padding:'10px 14px',background:'#0070f3',color:'#fff',border:'none',borderRadius:6}}>
              {loading? 'Mencari...' : 'Carikan'}
            </button>
          </div>
        </form>

        <section style={{padding:20,border:'1px solid #eee',borderRadius:8}}>
          <h3>Hasil Rekomendasi</h3>
          {results === null && <p style={{color:'#777'}}>Belum ada hasil. Isi form di sebelah kiri lalu klik Carikan.</p>}
          {Array.isArray(results) && results.length===0 && <p>Tidak ada hasil.</p>}
          {Array.isArray(results) && results.map((r,idx)=>(
            <div key={r.name||idx} style={{padding:12,marginBottom:12, border:'1px solid #f0f0f0',borderRadius:6}}>
              <div style={{fontWeight:600}}>{r.name}</div>
              <div style={{color:'#555',fontSize:13}}>{r.texture} • {r.note}</div>
              <div style={{marginTop:8,fontSize:13}}>Harga: {r.priceRange ? `Rp ${new Intl.NumberFormat('id-ID').format(r.priceRange[0])} – ${new Intl.NumberFormat('id-ID').format(r.priceRange[1])}/m` : '-'}</div>
              <div style={{marginTop:6,fontSize:13,color:'#333'}}>Skor: {r.score?.toFixed(2)}</div>
            </div>
          ))}
          {results && results.error && <div style={{color:'red'}}>{results.error}</div>}
        </section>
      </main>

      <footer style={{maxWidth:900,margin:'20px auto',color:'#777'}}>© Fabric Advisor</footer>
    </div>
  );
}
