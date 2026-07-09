// api/price.js
// Vercel Node.js Fonksiyonu — Yahoo Finance fiyat verisini sunucu tarafında çekip
// tarayıcıya CORS izniyle geri döndürür (Yahoo, GitHub Pages gibi üçüncü parti
// sitelerden gelen doğrudan tarayıcı isteklerine izin vermiyor).
// Bu fonksiyon herhangi bir API anahtarı gerektirmez, Yahoo'nun public uç noktasını çağırır.

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

function jsonResponse(obj, status) {
  return new Response(JSON.stringify(obj), {
    status: status || 200,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS }
  });
}

export default {
  async fetch(request) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 200, headers: CORS_HEADERS });
    }
    if (request.method !== 'GET') {
      return jsonResponse({ error: 'Sadece GET isteği kabul edilir' }, 405);
    }

    const url = new URL(request.url);
    const symbol = url.searchParams.get('symbol');
    if (!symbol) {
      return jsonResponse({ error: 'symbol parametresi eksik (örn. ?symbol=THYAO.IS)' }, 400);
    }

    try {
      const upstream = await fetch(
        'https://query1.finance.yahoo.com/v8/finance/chart/' + encodeURIComponent(symbol) + '?range=6mo&interval=1d',
        { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }
      );
      const data = await upstream.json();
      if (!upstream.ok) {
        return jsonResponse({ error: 'Yahoo Finance hata döndürdü: ' + JSON.stringify(data) }, upstream.status);
      }
      return jsonResponse(data, 200);

    } catch (err) {
      return jsonResponse({ error: String(err) }, 500);
    }
  }
};
