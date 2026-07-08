// api/deepseek.js
//
// Bu dosya GitHub reponda /api/deepseek.js yolunda durmalı.
// Vercel, /api klasöründeki her dosyayı otomatik olarak bir sunucu fonksiyonuna çevirir.
// Yani bu dosya, hisse-sinyal-terminali.html'in çağıracağı adres olacak:
//   https://<proje-adin>.vercel.app/api/deepseek
//
// DEEPSEEK_API_KEY ve APP_SECRET buraya YAZILMAZ — Vercel Dashboard'daki
// "Environment Variables" ekranından eklenir, kod hiçbir zaman anahtarı görmez
// (process.env üzerinden okunur).

export default async function handler(req, res) {
  // CORS ayarları: GitHub Pages (github.io) farklı bir alan adı olduğu için gerekli
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Sadece POST isteği kabul edilir' });
  }

  const { secret, model, messages } = req.body || {};

  if (secret !== process.env.APP_SECRET) {
    return res.status(401).json({ error: 'Yetkisiz istek' });
  }
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Geçersiz istek: messages eksik' });
  }

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Sunucuda DEEPSEEK_API_KEY tanımlı değil (Vercel Environment Variables kontrol et)' });
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
      return res.status(upstream.status).json({ error: 'DeepSeek hata döndürdü: ' + JSON.stringify(data) });
    }
    return res.status(200).json(data);

  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
}
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Sadece POST isteği kabul edilir' });
  }

  const { secret, model, messages } = req.body || {};

  if (secret !== process.env.APP_SECRET) {
    return res.status(401).json({ error: 'Yetkisiz istek' });
  }
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Geçersiz istek: messages eksik' });
  }

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Sunucuda DEEPSEEK_API_KEY tanımlı değil (Vercel Environment Variables kontrol et)' });
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
      return res.status(upstream.status).json({ error: 'DeepSeek hata döndürdü: ' + JSON.stringify(data) });
    }
    return res.status(200).json(data);

  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
}
