const sanitizeEnv = (val?: string) => (val || '').trim().replace(/^["']|["']$/g, '');
const RAZORPAY_KEY_ID = sanitizeEnv(process.env.RAZORPAY_KEY_ID);
const RAZORPAY_KEY_SECRET = sanitizeEnv(process.env.RAZORPAY_KEY_SECRET);

export default function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  res.status(200).json({
    configured: Boolean(RAZORPAY_KEY_ID && RAZORPAY_KEY_SECRET),
    keyId: RAZORPAY_KEY_ID || null,
    currency: 'INR',
    prices: {
      classic: 1499,
      gold: 1999,
      imperial: 2499,
      ultra: 2999,
    },
    hasSecret: Boolean(RAZORPAY_KEY_SECRET),
  });
}
