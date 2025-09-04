import fs from 'fs';
import path from 'path';

export async function GET() {
  const p = path.join(process.cwd(), 'data', 'fabrics.json');
  const raw = await fs.promises.readFile(p, 'utf-8');
  const data = JSON.parse(raw);
  return new Response(JSON.stringify(data), { status: 200, headers: { 'Content-Type': 'application/json' } });
}
