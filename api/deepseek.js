// api/deepseek.js
// Vercel Node.js Fonksiyonu — resmi "fetch" Web Standard export imzası.
// OpenRouter üzerinden ücretsiz modelleri dener; biri "unavailable/404" dönerse
// otomatik olarak listedeki bir sonrakine geçer.
// OPENROUTER_API_KEY ve APP_SECRET, Vercel Dashboard > Settings > Environment Variables'tan gelir.

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type'
};

// Sırayla denenecek ücretsiz modeller. Biri kaldırılır/ücretli olursa,
// bu listeye openrouter.ai/models > Price: Free'den yeni bir tane ekleyip
// eskisini silmen yeterli olur.
const FALLBACK_MODELS = [
  'nvidia/nemotron-3-super-120b-a12b:free',
  'nvidia/nemotron-3-ultra-550b-a55b:free',
  'tencent/hy3:free',
  'poolside/laguna-m.1:free'
];

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
    if (request.method !== 'POST') {
      return jsonResponse({ error: 'Sadece POST isteği kabul edilir' }, 405);
    }

    let body;
    try {
      body = await request.json();
    } catch (e) {
      return jsonResponse({ error: 'Geçersiz istek gövdesi (JSON değil)' }, 400);
    }

    const secret = body && body.secret;
    const requestedModel = body && body.model;
    const messages = body && body.messages;

    if (secret !== process.env.APP_SECRET) {
      return jsonResponse({ error: 'Yetkisiz istek' }, 401);
    }
    if (!messages || !Array.isArray(messages)) {
      return jsonResponse({ error: 'Geçersiz istek: messages eksik' }, 400);
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return jsonResponse({ error: 'Sunucuda OPENROUTER_API_KEY tanımlı değil' }, 500);
    }

    // İstemcinin gönderdiği model önce denenir, sonra listedeki geri kalanlar.
    const modelsToTry = requestedModel
      ? [requestedModel, ...FALLBACK_MODELS.filter(m => m !== requestedModel)]
      : FALLBACK_MODELS;

    let lastError = null;

    for (const model of modelsToTry) {
      try {
        const upstream = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + apiKey,
            'HTTP-Referer': 'https://koruker.github.io',
            'X-Title': 'Hisse Sinyal Terminali'
          },
          body: JSON.stringify({ model: model, messages: messages, temperature: 0.3 })
        });

        const data = await upstream.json();

        if (upstream.ok) {
          return jsonResponse(data, 200);
        }
        lastError = { model: model, status: upstream.status, detail: data };

      } catch (err) {
        lastError = { model: model, error: String(err) };
      }
    }

    return jsonResponse({ error: 'Tüm modeller başarısız oldu: ' + JSON.stringify(lastError) }, 502);
  }
};
