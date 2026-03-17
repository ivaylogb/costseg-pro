export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { code } = req.body || {};

    if (!code) {
      return res.status(400).json({ valid: false, error: 'No code provided' });
    }

    // Promo codes stored as comma-separated env var
    const validCodes = (process.env.PROMO_CODES || '').split(',').map(c => c.trim().toUpperCase()).filter(Boolean);

    if (validCodes.includes(code.trim().toUpperCase())) {
      return res.status(200).json({ valid: true });
    }

    return res.status(200).json({ valid: false, error: 'Invalid promo code' });
  } catch (err) {
    console.error('Promo verify error:', err);
    res.status(500).json({ valid: false, error: err.message });
  }
}
