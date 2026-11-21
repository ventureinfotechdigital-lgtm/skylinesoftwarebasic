import { InvitationConfig, OrderRecord, PricingPlan, PricingTierPrice } from '../types';
import { getPlanByPrice } from '../data/weddingPresets';
import { weddingAudio } from './audioSynth';
import confetti from 'canvas-confetti';

declare global {
  interface Window {
    Razorpay?: any;
  }
}

export interface CheckoutCustomerDetails {
  name: string;
  email: string;
  phone: string;
}

export interface RunRazorpayCheckoutParams {
  config: InvitationConfig;
  selectedPrice: PricingTierPrice;
  paymentMode: 'live' | 'demo';
  customer: CheckoutCustomerDetails;
  onStart?: () => void;
  onSuccess: (order: OrderRecord) => void;
  onError: (message: string) => void;
  onFinish?: () => void;
}

export function buildGuestInvitationUrl(
  config: InvitationConfig,
  licenseKeyOverride?: string
): string {
  const orderKey = licenseKeyOverride || config.activeOrder?.licenseKey || 'ROYAL-VIP';
  return `${window.location.origin}${window.location.pathname}?view=invitation&licensed=true&groom=${encodeURIComponent(
    config.groomName
  )}&bride=${encodeURIComponent(config.brideName)}&date=${encodeURIComponent(
    config.weddingDate
  )}&venue=${encodeURIComponent(config.venueName)}&city=${encodeURIComponent(
    config.venueCity
  )}&theme=${encodeURIComponent(config.theme?.presetId || 'royal-rajasthan-3d')}&order=${encodeURIComponent(orderKey)}`;
}

export function ensureRazorpayLoaded(): Promise<boolean> {
  if (typeof window !== 'undefined' && typeof window.Razorpay !== 'undefined') {
    return Promise.resolve(true);
  }
  return new Promise((resolve) => {
    const existingScript = document.querySelector(
      'script[src*="checkout.razorpay.com"]'
    ) as HTMLScriptElement | null;
    if (existingScript) {
      const start = Date.now();
      const interval = window.setInterval(() => {
        if (typeof window.Razorpay !== 'undefined') {
          window.clearInterval(interval);
          resolve(true);
        } else if (Date.now() - start >= 4500) {
          window.clearInterval(interval);
          resolve(false);
        }
      }, 100);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    script.onload = () => resolve(Boolean(window.Razorpay));
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export async function runRazorpayCheckout({
  config,
  selectedPrice,
  paymentMode,
  customer,
  onStart,
  onSuccess,
  onError,
  onFinish,
}: RunRazorpayCheckoutParams): Promise<void> {
  onStart?.();

  const currentPlan: PricingPlan = getPlanByPrice(selectedPrice);
  const coupleTitle = `${config.groomName} & ${config.brideName}`;

  const cleanPhone = (customer.phone || '').replace(/\D/g, '').slice(-10);
  const cleanEmail = (customer.email || '').trim();
  const cleanName = (customer.name || '').trim();

  // Only attach prefill fields if the customer explicitly typed them
  const prefill: Record<string, string> = {};
  if (cleanName) prefill.name = cleanName;
  if (cleanEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    prefill.email = cleanEmail;
  }
  if (cleanPhone && cleanPhone.length === 10) {
    prefill.contact = cleanPhone;
  }

  try {
    let orderData: any = null;
    let createOrderError: string | null = null;

    try {
      const response = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: selectedPrice,
          currency: 'INR',
          planId: currentPlan.id,
          planName: currentPlan.name,
          coupleNames: coupleTitle,
          customerName: cleanName || undefined,
          customerEmail: cleanEmail || undefined,
          customerPhone: cleanPhone || undefined,
          isDemo: paymentMode === 'demo',
        }),
      });

      const parsed = await response.json().catch(() => null);
      if (response.ok && parsed?.success) {
        orderData = parsed;
      } else {
        createOrderError =
          parsed?.message ||
          parsed?.error?.description ||
          `Payment server returned HTTP ${response.status}.`;
      }
    } catch {
      createOrderError =
        'Payment server is unreachable right now. Please try Sandbox Test mode.';
    }

    // Demo / Sandbox Mode
    if (paymentMode === 'demo' || orderData?.isDemo) {
      setTimeout(async () => {
        const demoOrderId = orderData?.orderId || `order_demo_${Date.now()}`;
        const demoPaymentId = `pay_demo_${Date.now()}`;
        const demoLicenseKey = `SKY-VIP-DEMO-${Math.random()
          .toString(36)
          .substring(2, 6)
          .toUpperCase()}-${Date.now().toString().slice(-4)}`;

        const demoOrder: OrderRecord = {
          orderId: demoOrderId,
          paymentId: demoPaymentId,
          licenseKey: demoLicenseKey,
          planId: currentPlan.id,
          planName: currentPlan.name,
          amount: selectedPrice,
          currency: 'INR',
          coupleNames: coupleTitle,
          customerName: cleanName || 'Verified Customer',
          customerEmail: cleanEmail || '—',
          customerPhone: cleanPhone || '—',
          paidAt: new Date().toISOString(),
          status: 'PAID_AND_ACTIVE',
          isDemo: true,
          unlockedFeatures: currentPlan.features,
        };

        try {
          await fetch('/api/razorpay/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: demoOrderId,
              razorpay_payment_id: demoPaymentId,
              razorpay_signature: 'sig_demo_verified',
              planId: currentPlan.id,
              planName: currentPlan.name,
              amount: selectedPrice,
              coupleNames: coupleTitle,
              customerName: cleanName || undefined,
              customerEmail: cleanEmail || undefined,
              customerPhone: cleanPhone || undefined,
              isDemo: true,
            }),
          });
        } catch {
          // ignore offline verify
        }

        onFinish?.();
        onSuccess(demoOrder);
        weddingAudio.playBlessingChime();
        confetti({
          particleCount: 100,
          spread: 90,
          origin: { y: 0.5 },
          colors: ['#9333EA', '#C084FC', '#E9D5FF', '#A855F7', '#FFFFFF'],
        });
      }, 600);
      return;
    }

    if (createOrderError || !orderData?.keyId || !orderData?.orderId) {
      throw new Error(
        createOrderError ||
          'Razorpay order could not be initialized. Please verify your Razorpay credentials or use Sandbox Test.'
      );
    }

    const isLoaded = await ensureRazorpayLoaded();
    if (!isLoaded || typeof window.Razorpay === 'undefined') {
      throw new Error(
        'Razorpay checkout script could not load. Please disable blockers or try Sandbox Test.'
      );
    }

    const keyId = String(orderData.keyId).trim();
    if (!keyId.startsWith('rzp_')) {
      throw new Error('Invalid Razorpay Key ID configured on server.');
    }

    const amountInPaise =
      Number(orderData.amount) || Math.round(Number(selectedPrice) * 100);
    const rawOrderId = String(orderData.orderId).trim();
    if (!/^order_[a-zA-Z0-9]{10,24}$/.test(rawOrderId)) {
      throw new Error('Invalid Razorpay order reference received from server.');
    }

    const options: any = {
      key: keyId,
      amount: amountInPaise,
      currency: orderData.currency || 'INR',
      order_id: rawOrderId,
      name: 'Skyline Software',
      description: `${currentPlan.name} - ${coupleTitle}`,
      notes: {
        wedding: coupleTitle,
        plan: currentPlan.name,
      },
      retry: {
        enabled: true,
        max_count: 3,
      },
      timeout: 300,
      theme: {
        color: '#7C3AED',
      },
      modal: {
        confirm_close: true,
        ondismiss: function () {
          onFinish?.();
        },
      },
      handler: async function (paymentResponse: any) {
        try {
          const paymentId =
            paymentResponse.razorpay_payment_id || `pay_live_${Date.now()}`;
          const orderId = paymentResponse.razorpay_order_id || rawOrderId;
          const licenseKey = `SKY-VIP-${Math.random()
            .toString(36)
            .substring(2, 6)
            .toUpperCase()}-${Date.now().toString().slice(-4)}`;

          let verifyResponse: Response | null = null;
          let verifyJson: any = null;
          for (let attempt = 0; attempt < 2; attempt++) {
            try {
              verifyResponse = await fetch('/api/razorpay/verify-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  razorpay_order_id: orderId,
                  razorpay_payment_id: paymentId,
                  razorpay_signature: paymentResponse.razorpay_signature,
                  planId: currentPlan.id,
                  planName: currentPlan.name,
                  amount: selectedPrice,
                  coupleNames: coupleTitle,
                  customerName: cleanName || undefined,
                  customerEmail: cleanEmail || undefined,
                  customerPhone: cleanPhone || undefined,
                  isDemo: false,
                }),
              });
              verifyJson = await verifyResponse.json().catch(() => null);
              if (verifyResponse.ok && verifyJson?.success) break;
              if (verifyResponse.status === 400) break;
            } catch {
              if (attempt === 0) {
                await new Promise((r) => setTimeout(r, 600));
              }
            }
          }

          if (!verifyResponse?.ok || !verifyJson?.success) {
            throw new Error(
              `${verifyJson?.message || 'Payment verification failed.'} (Payment Ref: ${paymentId})`
            );
          }

          const verifiedOrder: OrderRecord = {
            ...(verifyJson.order || {}),
            orderId,
            paymentId,
            signature: paymentResponse.razorpay_signature,
            licenseKey: verifyJson.order?.licenseKey || licenseKey,
            planId: currentPlan.id,
            planName: currentPlan.name,
            amount: selectedPrice,
            currency: 'INR',
            coupleNames: coupleTitle,
            customerName: cleanName || 'Verified Customer',
            customerEmail: cleanEmail || '—',
            customerPhone: cleanPhone || '—',
            paidAt: verifyJson.order?.paidAt || new Date().toISOString(),
            status: 'PAID_AND_ACTIVE',
            isDemo: false,
            unlockedFeatures: currentPlan.features,
          };

          onFinish?.();
          onSuccess(verifiedOrder);
          weddingAudio.playBlessingChime();
          confetti({
            particleCount: 120,
            spread: 100,
            origin: { y: 0.5 },
            colors: ['#9333EA', '#C084FC', '#E9D5FF', '#A855F7', '#FFFFFF'],
          });
        } catch (handlerErr: any) {
          onFinish?.();
          onError(handlerErr.message || 'Error processing payment confirmation');
        }
      },
    };

    // Only pass prefill if user explicitly supplied at least one contact field
    if (Object.keys(prefill).length > 0) {
      options.prefill = prefill;
    }

    const rzp = new window.Razorpay(options);
    rzp.on('payment.failed', function (failRes: any) {
      onFinish?.();
      const desc = failRes?.error?.description;
      onError(
        desc === 'Authentication failed'
          ? 'Razorpay authentication failed. Please verify your Razorpay credentials or use Sandbox Test.'
          : desc || 'Payment was declined or cancelled. Please try again.'
      );
    });
    rzp.open();
  } catch (err: any) {
    onFinish?.();
    onError(
      err.message ||
        'Payment initiation failed. Try Sandbox Test mode to test immediately.'
    );
  }
}
