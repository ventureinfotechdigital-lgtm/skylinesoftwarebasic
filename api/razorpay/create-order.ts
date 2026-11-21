const sanitizeEnv = (val?: string) => (val || '').trim().replace(/^["']|["']$/g, '');
const RAZORPAY_KEY_ID = sanitizeEnv(process.env.RAZORPAY_KEY_ID);
const RAZORPAY_KEY_SECRET = sanitizeEnv(process.env.RAZORPAY_KEY_SECRET);

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const {
      amount,
      currency = 'INR',
      planId,
      planName,
      coupleNames,
      isDemo,
    } = body;

    const amountInRupees = Number(amount) || 1499;
    const amountInPaise = Math.round(amountInRupees * 100);

    // If explicit Demo Sandbox simulation mode
    if (isDemo) {
      const demoOrderId = `order_demo_${Date.now()}`;
      return res.status(200).json({
        success: true,
        orderId: demoOrderId,
        amount: amountInPaise,
        currency,
        keyId: RAZORPAY_KEY_ID || null,
        isDemo: true,
      });
    }

    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      return res.status(400).json({
        success: false,
        code: 'RAZORPAY_NOT_CONFIGURED',
        message: 'Razorpay live credentials are not configured. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET or switch to Demo Mode.',
      });
    }

    // Call official Razorpay Orders API
    const authString = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString('base64');

    try {
      const response = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          Authorization: `Basic ${authString}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: amountInPaise,
          currency: 'INR',
          receipt: `rcpt_${Date.now().toString().slice(-8)}`,
          notes: {
            planId: planId || 'tier-1499',
            planName: planName || '3D Wedding Invitation',
            coupleNames: coupleNames || 'Royal Couple',
          },
        }),
      });

      const data = (await response.json()) as any;

      if (!response.ok) {
        const description = data?.error?.description || 'Failed to create Razorpay order.';
        const code = data?.error?.code || 'RAZORPAY_ORDER_ERROR';
        return res.status(response.status).json({
          success: false,
          code,
          message:
            description === 'Authentication failed'
              ? 'Razorpay authentication failed. Please verify RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET, or use Demo Mode.'
              : description,
        });
      }

      return res.status(200).json({
        success: true,
        orderId: data.id,
        amount: data.amount,
        currency: data.currency,
        keyId: RAZORPAY_KEY_ID,
        isDemo: false,
      });
    } catch (apiErr: any) {
      console.error('Network issue calling Razorpay live API in serverless:', apiErr.message);
      return res.status(502).json({
        success: false,
        code: 'RAZORPAY_NETWORK_ERROR',
        message: 'Unable to reach Razorpay servers. Please try Demo Mode.',
      });
    }
  } catch (error: any) {
    console.error('Error in create-order serverless function:', error);
    res.status(500).json({ success: false, message: error.message || 'Error creating order' });
  }
}
