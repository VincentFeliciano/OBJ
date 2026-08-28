const https = require('https');

function stripePost(path, params, sk) {
  return new Promise((resolve, reject) => {
    const body = new URLSearchParams(params).toString();
    const auth = Buffer.from(sk + ':').toString('base64');
    const req = https.request({
      hostname: 'api.stripe.com',
      path,
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + auth,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(body),
      },
    }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(JSON.parse(data)));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

module.exports = async function handler(req, res) {
  /* CORS — allow the GitHub Pages origin */
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const sk = process.env.STRIPE_SECRET_KEY;
  if (!sk) return res.status(500).json({ error: 'Stripe not configured' });

  let body = '';
  req.on('data', c => body += c);
  await new Promise(r => req.on('end', r));

  let items;
  try { items = JSON.parse(body).items; } catch { return res.status(400).json({ error: 'Invalid request' }); }

  if (!Array.isArray(items) || !items.length) return res.status(400).json({ error: 'No items' });

  /* Build line_items params */
  const params = {
    mode: 'payment',
    success_url: 'https://vincentfeliciano.github.io/OBJ/checkout.html?success=1',
    cancel_url:  'https://vincentfeliciano.github.io/OBJ/checkout.html',
  };
  items.forEach((item, i) => {
    params[`line_items[${i}][price]`]    = item.priceId;
    params[`line_items[${i}][quantity]`] = '1';
  });

  try {
    const session = await stripePost('/v1/checkout/sessions', params, sk);
    if (session.url) {
      res.status(200).json({ url: session.url });
    } else {
      res.status(500).json({ error: session.error?.message || 'Session creation failed' });
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};
