// api/deepseek.js
// Vercel Fonksiyonu — Web Standard "fetch" imzası kullanır (güncel Vercel varsayılanı).
// DEEPSEEK_API_KEY ve APP_SECRET, Vercel Dashboard > Settings > Environment Variables'tan gelir.

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

function jsonResponse(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
  });
}

export default async function handler(request) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: CORS_HEADERS });
  }
  if (request.method !== 'POST') {
    return jsonResponse({ error: 'Sadece POST isteği kabul edilir' }, 405);
  }

  let body;
  try {
    body = await request.json();
  } catch (e) {
    return jsonResponse({ error: 'Geçersiz istek gövdesi (JSON değil)' }, 400);
  }

  const { secret, model, messages } = body || {};

  if (secret !== process.env.APP_SECRET) {
    return jsonResponse({ error: 'Yetkisiz istek' }, 401);
  }
  if (!messages || !Array.isArray(messages)) {
    return jsonResponse({ error: 'Geçersiz istek: messages eksik' }, 400);
  }

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return jsonResponse({ error: 'Sunucuda DEEPSEEK_API_KEY tanımlı değil (Vercel Environment Variables kontrol et)' }, 500);
  }

  try {
    const upstream = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model || 'deepseek-v4-flash',
        messages,
        temperature: 0.3
      })
    });

    const data = await upstream.json();
    if (!upstream.ok) {
      return jsonResponse({ error: 'DeepSeek hata döndürdü: ' + JSON.stringify(data) }, upstream.status);
    }
    return jsonResponse(data, 200);

  } catch (err) {
    return jsonResponse({ error: String(err) }, 500);
  }
}
