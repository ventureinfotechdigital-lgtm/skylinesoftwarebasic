import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  ShieldCheck,
  CreditCard,
  Share2,
  ExternalLink,
  Info,
  Lock,
  Zap,
  Check,
  AlertCircle,
  Copy,
  Printer,
  Send,
  Link2,
} from 'lucide-react';
import { InvitationConfig, PricingTierPrice, OrderRecord } from '../types';
import { PRICING_PLANS, getPresetPrice, getPlanByPrice } from '../data/weddingPresets';
import { weddingAudio } from '../utils/audioSynth';
import { SkylineLogo } from './SkylineLogo';
import confetti from 'canvas-confetti';

declare global {
  interface Window {
    Razorpay?: any;
  }
}

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: InvitationConfig;
  onPaymentSuccess: (order: OrderRecord) => void;
  initialPrice?: PricingTierPrice;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  config,
  onPaymentSuccess,
  initialPrice,
}) => {
  const defaultPrice = initialPrice || getPresetPrice(config.theme?.presetId);
  const [selectedPrice, setSelectedPrice] = useState<PricingTierPrice>(defaultPrice);
  const [paymentMode, setPaymentMode] = useState<'live' | 'demo'>('live');

  // Intentionally empty by default: no prefilled customer name, email, or phone
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  // Flow states
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [completedOrder, setCompletedOrder] = useState<OrderRecord | null>(config.activeOrder || null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedInvite, setCopiedInvite] = useState(false);
  const [copiedLicense, setCopiedLicense] = useState(false);
  const [gatewayConfigured, setGatewayConfigured] = useState<boolean | null>(null);

  useEffect(() => {
    if (initialPrice) {
      setSelectedPrice(initialPrice);
    } else {
      setSelectedPrice(getPresetPrice(config.theme?.presetId));
    }

    if (isOpen) {
      setErrorMessage(null);
      setCompletedOrder(config.activeOrder || null);
      fetch('/api/payment/config')
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && typeof data.configured === 'boolean') {
            setGatewayConfigured(data.configured);
          }
        })
        .catch(() => {
          setGatewayConfigured(null);
        });
    }
  }, [initialPrice, config.theme?.presetId, config.activeOrder, isOpen]);

  if (!isOpen) return null;

  const currentPlan = getPlanByPrice(selectedPrice);
  const coupleTitle = `${config.groomName} & ${config.brideName}`;

  const liveInvitationUrl = `${window.location.origin}${window.location.pathname}?view=invitation&licensed=true&groom=${encodeURIComponent(
    config.groomName
  )}&bride=${encodeURIComponent(config.brideName)}&date=${encodeURIComponent(
    config.weddingDate
  )}&venue=${encodeURIComponent(config.venueName)}&city=${encodeURIComponent(
    config.venueCity
  )}&theme=${encodeURIComponent(config.theme?.presetId || 'royal-rajasthan-3d')}&order=${completedOrder?.licenseKey || 'ROYAL-VIP'}`;

  const inviteShareText = `You are cordially invited to celebrate the wedding of ${config.groomName} & ${config.brideName} on ${config.weddingDateFormatted} at ${config.venueName}, ${config.venueCity}.\n\nOpen our 3D Interactive Invitation Website:\n${liveInvitationUrl}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(liveInvitationUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyInviteMessage = () => {
    navigator.clipboard.writeText(inviteShareText);
    setCopiedInvite(true);
    setTimeout(() => setCopiedInvite(false), 2500);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${coupleTitle} — Wedding Invitation`,
          text: `You are invited to the wedding of ${coupleTitle}.`,
          url: liveInvitationUrl,
        });
      } catch {
        // User cancelled share sheet
      }
    } else {
      handleCopyLink();
    }
  };

  const handleCopyLicense = (lic: string) => {
    navigator.clipboard.writeText(lic);
    setCopiedLicense(true);
    setTimeout(() => setCopiedLicense(false), 2500);
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  const ensureRazorpayLoaded = (): Promise<boolean> => {
    if (typeof window !== 'undefined' && typeof window.Razorpay !== 'undefined') {
      return Promise.resolve(true);
    }
    return new Promise((resolve) => {
      const existingScript = document.querySelector('script[src*="checkout.razorpay.com"]') as HTMLScriptElement | null;
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
  };

  const handleInitiatePayment = async () => {
    setIsProcessing(true);
    setErrorMessage(null);

    const cleanPhone = (customerPhone || '').replace(/\D/g, '').slice(-10);
    const cleanEmail = (customerEmail || '').trim();
    const cleanName = (customerName || '').trim();

    // Only attach prefill fields if the customer explicitly typed them
    const prefill: Record<string, string> = {};
    if (cleanName) {
      prefill.name = cleanName;
    }
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
        createOrderError = 'Payment server is unreachable right now. Please try Sandbox Test mode.';
      }

      // Demo / Sandbox Mode
      if (paymentMode === 'demo' || orderData?.isDemo) {
        setTimeout(async () => {
          const demoOrderId = orderData?.orderId || `order_demo_${Date.now()}`;
          const demoPaymentId = `pay_demo_${Date.now()}`;
          const demoLicenseKey = `SKY-VIP-DEMO-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Date.now().toString().slice(-4)}`;

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
            // ignore
          }

          setIsProcessing(false);
          setCompletedOrder(demoOrder);
          onPaymentSuccess(demoOrder);
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
        throw new Error('Razorpay checkout script could not load. Please disable blockers or try Sandbox Test.');
      }

      const keyId = String(orderData.keyId).trim();
      if (!keyId.startsWith('rzp_')) {
        throw new Error('Invalid Razorpay Key ID configured on server.');
      }

      const amountInPaise = Number(orderData.amount) || Math.round(Number(selectedPrice) * 100);
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
            setIsProcessing(false);
          },
        },
        handler: async function (paymentResponse: any) {
          try {
            const paymentId = paymentResponse.razorpay_payment_id || `pay_live_${Date.now()}`;
            const orderId = paymentResponse.razorpay_order_id || rawOrderId;
            const licenseKey = `SKY-VIP-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Date.now().toString().slice(-4)}`;

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

            setCompletedOrder(verifiedOrder);
            onPaymentSuccess(verifiedOrder);
            setIsProcessing(false);
            weddingAudio.playBlessingChime();
            confetti({
              particleCount: 120,
              spread: 100,
              origin: { y: 0.5 },
              colors: ['#9333EA', '#C084FC', '#E9D5FF', '#A855F7', '#FFFFFF'],
            });
          } catch (handlerErr: any) {
            setIsProcessing(false);
            setErrorMessage(handlerErr.message || 'Error processing payment confirmation');
          }
        },
      };

      // Only pass prefill if user explicitly supplied at least one contact field
      if (Object.keys(prefill).length > 0) {
        options.prefill = prefill;
      }

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (failRes: any) {
        setIsProcessing(false);
        const desc = failRes?.error?.description;
        setErrorMessage(
          desc === 'Authentication failed'
            ? 'Razorpay authentication failed. Please verify your Razorpay credentials or use Sandbox Test.'
            : desc || 'Payment was declined or cancelled. Please try again.'
        );
      });
      rzp.open();
    } catch (err: any) {
      setIsProcessing(false);
      setErrorMessage(err.message || 'Payment initiation failed. Try Sandbox Test mode to test immediately.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#12151E] border border-white/12 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* Top Header */}
        <div className="relative px-6 py-4 bg-gradient-to-r from-[#171B26] via-[#1C2130] to-[#141720] border-b border-white/10 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-4 min-w-0">
            <SkylineLogo size="sm" variant="dark" />
            <div className="h-7 w-[1px] bg-white/10 hidden sm:block" />
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-semibold text-white truncate">
                {completedOrder ? (
                  <>
                    Payment Confirmed · <span className="text-lavender-highlight">Ready to Share</span>
                  </>
                ) : (
                  <>
                    Checkout &amp; <span className="text-lavender-highlight">Publish Invitation</span>
                  </>
                )}
              </h2>
              <p className="text-xs text-slate-400 truncate">
                {completedOrder
                  ? 'Share your official invitation link with guests via WhatsApp or direct copy'
                  : 'Razorpay Secure Checkout · Instant Link Activation'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            type="button"
            aria-label="Close checkout"
            className="p-2 text-slate-400 hover:text-white rounded-lg bg-[#1C2130] hover:bg-[#262C3F] border border-white/10 transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5 text-slate-100">
          {/* SUCCESS & SHARE LINK SCREEN */}
          {completedOrder ? (
            <div className="space-y-5 animate-in fade-in zoom-in-95 duration-300">
              {/* Confirmation Banner */}
              <div className="p-5 rounded-xl bg-[#161924] border border-white/12 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-emerald-500/15 border border-emerald-400/40 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                </div>
                <p className="text-xs font-medium text-emerald-300">
                  Payment Verified · Official Website Unlocked
                </p>
                <h3 className="font-classic text-2xl font-bold text-white">
                  {coupleTitle} <span className="text-lavender-highlight">Invitation Live</span>
                </h3>
                <p className="text-xs text-slate-300 max-w-md mx-auto">
                  Share the official link below with your guests so they can experience your 3D animated wedding invitation.
                </p>

                {/* Order Details Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 mt-3 border-t border-white/10 text-left text-xs">
                  <div>
                    <span className="text-[11px] text-slate-400 block">License Key</span>
                    <button
                      type="button"
                      onClick={() => handleCopyLicense(completedOrder.licenseKey)}
                      className="font-mono font-semibold text-[#DDD6FE] hover:text-white flex items-center gap-1 mt-0.5 truncate"
                    >
                      {completedOrder.licenseKey}
                      {copiedLicense ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 opacity-60" />}
                    </button>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block">Payment ID</span>
                    <span className="font-mono text-slate-200 truncate block mt-0.5 tabular-nums">
                      {completedOrder.paymentId}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block">Selected Plan</span>
                    <span className="font-medium text-slate-200 truncate block mt-0.5">
                      {completedOrder.planName}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block">Amount Paid</span>
                    <span className="font-bold text-amber-300 text-sm block mt-0.5 tabular-nums">
                      ₹{completedOrder.amount.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Primary Share Link Box */}
              <div className="bg-[#161924] p-4 rounded-xl border border-[#A78BFA]/35 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-white flex items-center gap-1.5">
                    <Link2 className="w-3.5 h-3.5 text-[#C4B5FD]" />
                    Shareable Guest Invitation Link
                  </label>
                  <span className="text-[11px] text-emerald-400 font-medium">Ready for Guests</span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={liveInvitationUrl}
                    className="flex-1 bg-[#0D0F14] border border-white/15 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono select-all focus:outline-none focus:border-[#A78BFA]"
                  />
                  <button
                    onClick={handleCopyLink}
                    type="button"
                    className="px-4 py-2 rounded-lg bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold text-xs flex items-center gap-1.5 transition-colors shrink-0 whitespace-nowrap"
                  >
                    {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    {copiedLink ? 'Link Copied' : 'Copy Link'}
                  </button>
                </div>

                {/* Primary Share Channels */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                  <a
                    href={`https://api.whatsapp.com/send?text=${encodeURIComponent(inviteShareText)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2.5 px-3.5 rounded-lg bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors whitespace-nowrap"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    Share on WhatsApp
                  </a>

                  <button
                    type="button"
                    onClick={handleCopyInviteMessage}
                    className="py-2.5 px-3.5 rounded-lg bg-[#1F2433] hover:bg-[#282F42] text-slate-100 text-xs font-semibold border border-white/12 flex items-center justify-center gap-2 transition-colors whitespace-nowrap"
                  >
                    {copiedInvite ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-[#C4B5FD]" />}
                    {copiedInvite ? 'Invite Copied' : 'Copy Invite Text'}
                  </button>

                  <button
                    type="button"
                    onClick={handleNativeShare}
                    className="py-2.5 px-3.5 rounded-lg bg-[#7C3AED]/20 hover:bg-[#7C3AED]/30 text-[#E9D5FF] text-xs font-semibold border border-[#A78BFA]/35 flex items-center justify-center gap-2 transition-colors whitespace-nowrap"
                  >
                    <Send className="w-3.5 h-3.5 text-[#C4B5FD]" />
                    Share Anywhere
                  </button>
                </div>
              </div>

              {/* Secondary Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <a
                  href={liveInvitationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2.5 px-4 rounded-lg bg-[#1B1F2B] hover:bg-[#242938] text-slate-100 text-xs font-semibold flex items-center justify-center gap-2 border border-white/12 transition-colors"
                >
                  <ExternalLink className="w-4 h-4 text-[#C4B5FD]" />
                  Open Live Invitation
                </a>

                <button
                  type="button"
                  onClick={handlePrintInvoice}
                  className="py-2.5 px-4 rounded-lg bg-[#161924] hover:bg-[#1F2433] text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 border border-white/10 transition-colors"
                >
                  <Printer className="w-4 h-4 text-[#C4B5FD]" />
                  Print Receipt
                </button>
              </div>

              <div className="flex items-center justify-center gap-6 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    setCompletedOrder(null);
                    setErrorMessage(null);
                  }}
                  className="text-xs text-slate-400 hover:text-white underline"
                >
                  Upgrade / Buy Another Tier
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-xs text-slate-200 hover:text-white underline"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            /* CHECKOUT SCREEN */
            <>
              {/* Payment Gateway Mode Switch */}
              <div className="bg-[#0D0F14] p-1 rounded-xl border border-white/10 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => {
                    setPaymentMode('live');
                    setErrorMessage(null);
                  }}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all whitespace-nowrap ${
                    paymentMode === 'live'
                      ? 'bg-[#7C3AED] text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  Razorpay Live Checkout
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPaymentMode('demo');
                    setErrorMessage(null);
                  }}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all whitespace-nowrap ${
                    paymentMode === 'demo'
                      ? 'bg-[#7C3AED] text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" />
                  Sandbox Test Mode
                </button>
              </div>

              {/* Status Banner */}
              {paymentMode === 'live' ? (
                gatewayConfigured === false ? (
                  <div className="px-3.5 py-2.5 rounded-lg bg-rose-950/40 border border-rose-500/40 flex items-center gap-2.5 text-xs text-rose-200">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>
                      Razorpay live credentials are not configured on the server. Add <strong>RAZORPAY_KEY_ID</strong> and <strong>RAZORPAY_KEY_SECRET</strong> or switch to <strong>Sandbox Test Mode</strong>.
                    </span>
                  </div>
                ) : (
                  <div className="px-3.5 py-2.5 rounded-lg bg-[#161924] border border-white/10 flex items-center gap-2.5 text-xs text-slate-300">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>
                      Secured by <strong className="text-white">Razorpay Checkout</strong> &middot; Accepts UPI, Credit/Debit Cards, NetBanking, and Wallets.
                    </span>
                  </div>
                )
              ) : (
                <div className="px-3.5 py-2.5 rounded-lg bg-[#161924] border border-white/10 flex items-center gap-2.5 text-xs text-slate-300">
                  <Info className="w-4 h-4 text-[#C4B5FD] shrink-0" />
                  <span>
                    <strong className="text-white">Sandbox Test Active:</strong> Simulates instant verification to preview the unlocked sharing link without real charges.
                  </span>
                </div>
              )}

              {/* Package Tier Selector */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-white">
                    Select Package Tier
                  </label>
                  <span className="text-[11px] text-slate-400">One-time payment &middot; Lifetime link</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {PRICING_PLANS.map((plan) => {
                    const isSelected = selectedPrice === plan.price;
                    return (
                      <button
                        key={plan.id}
                        type="button"
                        onClick={() => setSelectedPrice(plan.price)}
                        className={`p-3 rounded-xl text-left border transition-all relative flex flex-col justify-between ${
                          isSelected
                            ? 'bg-[#1D2130] border-[#A78BFA] ring-1 ring-[#A78BFA]/40'
                            : 'bg-[#0D0F14] border-white/10 hover:border-white/25'
                        }`}
                      >
                        <div>
                          <span className="text-[11px] font-medium text-[#C4B5FD] block truncate">
                            {plan.badge}
                          </span>
                          <h4 className="text-xs font-semibold text-white mt-0.5 line-clamp-1">
                            {plan.name}
                          </h4>
                        </div>
                        <div className="mt-3 pt-2 border-t border-white/10">
                          <div className="flex items-baseline gap-1.5 tabular-nums">
                            <span className="text-base font-bold text-amber-300">
                              ₹{plan.price.toLocaleString('en-IN')}
                            </span>
                            <span className="text-[11px] text-slate-500 line-through">
                              ₹{plan.originalPrice.toLocaleString('en-IN')}
                            </span>
                          </div>
                          <span className="text-[10px] text-emerald-400 font-medium block">
                            {plan.discount}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Selected Plan Summary */}
              <div className="p-4 rounded-xl bg-[#161924] border border-white/10 space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div>
                    <h3 className="text-sm font-semibold text-white">
                      {currentPlan.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {currentPlan.tagline}
                    </p>
                  </div>
                  <div className="text-right tabular-nums">
                    <span className="text-lg font-bold text-amber-300">
                      ₹{currentPlan.price.toLocaleString('en-IN')}
                    </span>
                    <span className="text-[11px] text-slate-400 block">
                      One-time license
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {currentPlan.features.slice(0, 6).map((feat, idx) => (
                    <div key={idx} className="flex items-start gap-1.5 text-xs text-slate-300">
                      <Check className="w-3.5 h-3.5 text-[#C4B5FD] shrink-0 mt-0.5" />
                      <span className="line-clamp-1">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Optional Customer Details (Never prefilled) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-white">
                    Customer Details <span className="text-slate-400 font-normal">(Optional — entered fresh or inside Razorpay)</span>
                  </label>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <span className="text-[11px] text-slate-400 block mb-1">Full Name</span>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Enter your name"
                      autoComplete="off"
                      className="w-full bg-[#0D0F14] border border-white/15 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#A78BFA]"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block mb-1">Email Address</span>
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="you@example.com"
                      autoComplete="off"
                      className="w-full bg-[#0D0F14] border border-white/15 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#A78BFA]"
                    />
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block mb-1">Mobile Number</span>
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="10-digit mobile"
                      autoComplete="off"
                      className="w-full bg-[#0D0F14] border border-white/15 rounded-lg px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-[#A78BFA]"
                    />
                  </div>
                </div>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="p-3 rounded-lg bg-rose-950/50 border border-rose-500/40 text-xs text-rose-200 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Bottom Payment CTA */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={handleInitiatePayment}
                  disabled={isProcessing}
                  className={`w-full min-h-[48px] py-3.5 px-6 rounded-xl font-semibold text-sm flex items-center justify-center gap-2.5 transition-all shadow-lg active:scale-[0.99] tabular-nums ${
                    isProcessing
                      ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
                      : 'bg-[#7C3AED] hover:bg-[#6D28D9] text-white'
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/25 border-t-white rounded-full animate-spin" />
                      Opening Secure Checkout...
                    </>
                  ) : paymentMode === 'live' ? (
                    <>
                      <Lock className="w-4 h-4 text-[#E9D5FF]" />
                      Pay ₹{currentPlan.price.toLocaleString('en-IN')} with Razorpay
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 text-[#E9D5FF]" />
                      Complete Sandbox Test (₹{currentPlan.price.toLocaleString('en-IN')})
                    </>
                  )}
                </button>

                <div className="flex items-center justify-center gap-3 text-[11px] text-slate-400 mt-2.5">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    256-bit SSL Encrypted
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>Instant Share Link</span>
                  <span aria-hidden="true">·</span>
                  <span>No Recurring Fees</span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
