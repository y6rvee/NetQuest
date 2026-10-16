// Proxy Groq untuk Cloudflare Workers — menyimpan kunci API di server, bukan di browser guru.
// 1) Buat Worker baru, tempel kode ini.
// 2) Settings → Variables → tambah Secret:  GROQ_API_KEY = gsk_...
// 3) Ubah ALLOWED_ORIGIN ke alamat situs NetQuest Anda.
// 4) Di NetQuest: Panel Guru → Pengaturan AI → Endpoint = https://NAMA-WORKER.workers.dev  (kunci API dikosongkan).
const ALLOWED_ORIGIN = 'https://situs-anda.example.com';
const ALLOWED_MODELS = ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'openai/gpt-oss-120b', 'openai/gpt-oss-20b'];

export default {
  async fetch(req, env) {
    const cors = {
      'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Expose-Headers': 'retry-after',
    };
    if (req.method === 'OPTIONS') return new Response(null, { headers: cors });
    if (req.method !== 'POST' || req.headers.get('Origin') !== ALLOWED_ORIGIN)
      return new Response('Forbidden', { status: 403, headers: cors });

    let body;
    try { body = await req.json(); } catch { return new Response('Bad request', { status: 400, headers: cors }); }
    if (!ALLOWED_MODELS.includes(body.model)) return new Response('Model tidak diizinkan', { status: 400, headers: cors });
    body.max_tokens = Math.min(body.max_tokens || 4000, 4096);

    const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + env.GROQ_API_KEY },
      body: JSON.stringify(body),
    });
    return new Response(r.body, { status: r.status, headers: { ...cors, 'Content-Type': 'application/json', 'retry-after': r.headers.get('retry-after') || '' } });
  },
};
