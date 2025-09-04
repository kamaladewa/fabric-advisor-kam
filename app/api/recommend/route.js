import fs from 'fs';
import path from 'path';

function desiredProfile({ garment, climate, prefs }) {
  const weights = {
    breathability: 1,
    warmth: 1,
    thickness: 0.5,
    elasticity: 0.5,
    durability: 0.8,
    luxury: 0.6,
    waterproof: 0,
    wrinkleResist: 0.2,
  };
  if (climate === 'tropis') { weights.breathability += 1.2; weights.warmth -= 0.4; weights.thickness -= 0.2; }
  if (climate === 'dingin') { weights.warmth += 1.5; weights.thickness += 0.8; }
  if (climate === 'lembap') { weights.waterproof += 1.0; weights.wrinkleResist += 0.4; weights.breathability += 0.4; }
  const g = garment;
  if (['Kaos', 'Blouse'].includes(g)) { weights.breathability += 0.8; weights.elasticity += 0.5; }
  if (['Kemeja', 'Seragam'].includes(g)) { weights.wrinkleResist += 0.5; weights.durability += 0.3; }
  if (['Gaun/ Dress', 'Rok'].includes(g)) { weights.luxury += 0.8; weights.elasticity += 0.3; }
  if (['Hoodie/ Sweater'].includes(g)) { weights.warmth += 0.8; weights.thickness += 0.5; }
  if (['Jaket Fashion'].includes(g)) { weights.luxury += 0.6; weights.durability += 0.5; }
  if (['Jaket Outdoor'].includes(g)) { weights.waterproof += 1.2; weights.durability += 0.8; }
  if (['Blazer/ Jas'].includes(g)) { weights.luxury += 1.0; weights.wrinkleResist += 0.6; weights.thickness += 0.3; }
  if (['Olahraga/ Athleisure'].includes(g)) { weights.elasticity += 1.0; weights.breathability += 0.6; weights.durability += 0.4; }

  const p = new Set(prefs || []);
  if (p.has('nyaman')) weights.breathability += 0.6;
  if (p.has('adem')) weights.breathability += 0.8;
  if (p.has('hangat')) weights.warmth += 1.0;
  if (p.has('ringan')) weights.thickness -= 0.4;
  if (p.has('elastis')) weights.elasticity += 1.0;
  if (p.has('jatuh')) weights.luxury += 0.6;
  if (p.has('tahan_air')) weights.waterproof += 1.2;
  if (p.has('tahan_kerut')) weights.wrinkleResist += 0.8;
  if (p.has('tahan_lama')) weights.durability += 1.0;
  if (p.has('mewah')) weights.luxury += 1.2;
  return weights;
}

function scoreFabric(fab, weights, budget) {
  let score = 0;
  const t = fab.traits || {};
  const f = fab.flags || {};
  score += (t.breathability || 0) * (weights.breathability || 0);
  score += (t.warmth || 0) * (weights.warmth || 0);
  score += (t.thickness || 0) * (weights.thickness || 0);
  score += (t.elasticity || 0) * (weights.elasticity || 0);
  score += (t.durability || 0) * (weights.durability || 0);
  score += (t.luxury || 0) * (weights.luxury || 0);
  score += (f.waterproof ? 1 : 0) * (weights.waterproof || 0);
  score += (f.wrinkleResist ? 1 : 0) * (weights.wrinkleResist || 0);
  const mid = (fab.priceRange?.[0] + fab.priceRange?.[1]) / 2 || 100000;
  const band = budget === 'low' ? 80000 : budget === 'mid' ? 180000 : 400000;
  const diff = Math.abs(mid - band);
  const budgetAdj = Math.max(0, 1 - diff / (band * 1.5));
  score += budgetAdj * 1.2;
  return score;
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { garment, climate, prefs, budget } = body;
    const p = path.join(process.cwd(), 'data', 'fabrics.json');
    const raw = await fs.promises.readFile(p, 'utf-8');
    const fabrics = JSON.parse(raw);
    const weights = desiredProfile({ garment, climate, prefs });
    const ranked = fabrics.map((f) => ({ fabric: f, score: scoreFabric(f, weights, budget) }));
    ranked.sort((a, b) => b.score - a.score);
    const top = ranked.slice(0, 20).map((r) => ({ ...r.fabric, score: r.score }));
    return new Response(JSON.stringify({ top }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
