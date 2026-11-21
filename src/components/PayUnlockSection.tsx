import React, { useState, useEffect, useRef } from 'react';
import {
  Check,
  CheckCircle2,
  Copy,
  CreditCard,
  ExternalLink,
  Link2,
  Lock,
  Printer,
  Send,
  Share2,
  ShieldCheck,
  Sparkles,
  Zap,
  AlertCircle,
  Eye,
} from 'lucide-react';
import { InvitationConfig, OrderRecord, PricingTierPrice } from '../types';
import { PRICING_PLANS, getPlanByPrice, getPresetPrice } from '../data/weddingPresets';
import { buildGuestInvitationUrl, runRazorpayCheckout } from '../utils/razorpayCheckout';

export type BuilderStepId = 'presets' | 'couple' | 'venue' | 'ceremonies' | 'photos' | 'pay';

interface PayUnlockSectionProps {
  config: InvitationConfig;
  onPaymentSuccess: (order: OrderRecord) => void;
  onJumpToStep: (step: BuilderStepId) => void;
  onPreviewLive: () => void;
  stepCompletion: {
    presets: boolean;
    couple: boolean;
    venue: boolean;
    ceremonies: boolean;
    photos: boolean;
  };
}

export const PayUnlockSection: React.FC<PayUnlockSectionProps> = ({
  config,
  onPaymentSuccess,
  onJumpToStep,
  onPreviewLive,
  stepCompletion,
}) => {
  const defaultTierPrice = getPresetPrice(config.theme?.presetId);
  const [selectedPrice, setSelectedPrice] = useState<PricingTierPrice>(defaultTierPrice);
  const [paymentMode, setPaymentMode] = useState<'live' | 'demo'>('live');
  const [gatewayConfigured, setGatewayConfigured] = useState<boolean | null>(null);

  // Never prefilled
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedInvite, setCopiedInvite] = useState(false);
  const [copiedLicense, setCopiedLicense] = useState(false);

  // Interactive 3D pass tilt state
  const passRef = useRef<HTMLDivElement | null>(null);
  const [passTilt, setPassTilt] = useState({ x: 0, y: 0 });
  const [isTilting, setIsTilting] = useState(false);

  useEffect(() => {
    setSelectedPrice(getPresetPrice(config.theme?.presetId));
  }, [config.theme?.presetId]);

  useEffect(() => {
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
  }, []);

  const currentPlan = getPlanByPrice(selectedPrice);
  const savings = currentPlan.originalPrice - currentPlan.price;
  const coupleTitle = `${config.groomName} & ${config.brideName}`;

  const updatePassTilt = (clientX: number, clientY: number) => {
    if (!passRef.current) return;
    const rect = passRef.current.getBoundingClientRect();
    const xPct = (clientX - rect.left) / rect.width - 0.5;
    const yPct = (clientY - rect.top) / rect.height - 0.5;
    setPassTilt({
      x: Number((-yPct * 12).toFixed(2)),
      y: Number((xPct * 14).toFixed(2)),
    });
  };

  const resetPassTilt = () => {
    setIsTilting(false);
    setPassTilt({ x: 0, y: 0 });
  };

  const handleCheckout = () => {
    setErrorMessage(null);
    runRazorpayCheckout({
      config,
      selectedPrice,
      paymentMode,
      customer: {
        name: customerName,
        email: customerEmail,
        phone: customerPhone,
      },
      onStart: () => setIsProcessing(true),
      onSuccess: (order) => {
        setIsProcessing(false);
        onPaymentSuccess(order);
      },
      onError: (msg) => {
        setIsProcessing(false);
        setErrorMessage(msg);
      },
      onFinish: () => setIsProcessing(false),
    });
  };

  const liveGuestUrl = config.isUnlocked ? buildGuestInvitationUrl(config) : '';
  const inviteShareText = `You are cordially invited to celebrate the wedding of ${coupleTitle} on ${config.weddingDateFormatted} at ${config.venueName}, ${config.venueCity}.\n\nOpen our 3D Interactive Invitation Website:\n${liveGuestUrl}`;

  const handleCopyLink = () => {
    if (!config.isUnlocked || !liveGuestUrl) return;
    navigator.clipboard.writeText(liveGuestUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyInvite = () => {
    if (!config.isUnlocked || !liveGuestUrl) return;
    navigator.clipboard.writeText(inviteShareText);
    setCopiedInvite(true);
    setTimeout(() => setCopiedInvite(false), 2500);
  };

  const handleNativeShare = async () => {
    if (!config.isUnlocked || !liveGuestUrl) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${coupleTitle} — Wedding Invitation`,
          text: `You are invited to the wedding of ${coupleTitle}.`,
          url: liveGuestUrl,
        });
      } catch {
        // cancelled
      }
    } else {
      handleCopyLink();
    }
  };

  const checklistSteps: Array<{ id: BuilderStepId; label: string; done: boolean }> = [
    { id: 'presets', label: '1. Theme', done: stepCompletion.presets },
    { id: 'couple', label: '2. Couple', done: stepCompletion.couple },
    { id: 'venue', label: '3. Venue', done: stepCompletion.venue },
    { id: 'ceremonies', label: '4. Events', done: stepCompletion.ceremonies },
    { id: 'photos', label: '5. Media', done: stepCompletion.photos },
  ];

  // UNLOCKED STATE: POST-PAYMENT LIVE SHARE HUB
  if (config.isUnlocked && config.activeOrder) {
    const order = config.activeOrder;
    return (
      <div className="space-y-4 animate-in fade-in duration-200">
        {/* Unlocked 3D VIP Pass */}
        <div className="perspective-[900px]">
          <div
            ref={passRef}
            onPointerDown={(e) => {
              setIsTilting(true);
              updatePassTilt(e.clientX, e.clientY);
            }}
            onPointerMove={(e) => {
              if (e.pointerType === 'mouse' || isTilting) {
                updatePassTilt(e.clientX, e.clientY);
              }
            }}
            onPointerUp={resetPassTilt}
            onPointerLeave={resetPassTilt}
            onPointerCancel={resetPassTilt}
            className="relative rounded-2xl overflow-hidden border border-emerald-400/40 bg-[#151822] shadow-2xl touch-pan-y select-none"
            style={{
              transform: `rotateX(${passTilt.x}deg) rotateY(${passTilt.y}deg)`,
              transition: isTilting
                ? 'transform 60ms linear'
                : 'transform 350ms cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <div className="relative h-36 overflow-hidden">
              <img
                src={config.heroCouplePhoto}
                alt={coupleTitle}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0D0F14] via-black/50 to-black/30" />
              <div className="absolute top-3 inset-x-3 flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-300 bg-black/75 px-2.5 py-1 rounded-lg border border-emerald-400/35">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Payment Confirmed
                </span>
                <span className="text-xs font-bold text-amber-300 tabular-nums bg-black/75 px-2.5 py-1 rounded-lg border border-white/10">
                  ₹{order.amount.toLocaleString('en-IN')} Paid
                </span>
              </div>
              <div className="absolute bottom-3 inset-x-3">
                <h3 className="font-classic text-xl font-bold text-white">
                  {coupleTitle}
                </h3>
                <p className="text-[11px] text-slate-300 truncate">
                  {config.weddingDateFormatted} &middot; {config.venueName}, {config.venueCity}
                </p>
              </div>
            </div>

            <div className="p-3.5 grid grid-cols-2 gap-3 bg-[#12151E] border-t border-white/10 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block">License Key</span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(order.licenseKey);
                    setCopiedLicense(true);
                    setTimeout(() => setCopiedLicense(false), 2000);
                  }}
                  className="font-mono font-semibold text-[#DDD6FE] hover:text-white flex items-center gap-1 mt-0.5 truncate"
                >
                  <span className="truncate">{order.licenseKey}</span>
                  {copiedLicense ? (
                    <Check className="w-3 h-3 text-emerald-400 shrink-0" />
                  ) : (
                    <Copy className="w-3 h-3 opacity-70 shrink-0" />
                  )}
                </button>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block">Active Tier</span>
                <span className="font-semibold text-white truncate block mt-0.5">
                  {order.planName}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Shareable Link Box */}
        <div className="bg-[#151822] p-4 rounded-2xl border border-[#A78BFA]/40 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-white flex items-center gap-1.5">
              <Link2 className="w-4 h-4 text-[#C4B5FD]" />
              Official Guest Invitation Link
            </label>
            <span className="text-[11px] font-semibold text-emerald-400">Active</span>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={liveGuestUrl}
              className="flex-1 bg-[#0D0F14] border border-white/15 rounded-xl px-3 py-2.5 text-xs text-slate-100 font-mono select-all focus:outline-none focus:border-[#A78BFA]"
            />
            <button
              type="button"
              onClick={handleCopyLink}
              className="min-h-[44px] px-3.5 py-2 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0 whitespace-nowrap"
            >
              {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              <span>{copiedLink ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <a
              href={`https://api.whatsapp.com/send?text=${encodeURIComponent(inviteShareText)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[44px] py-2.5 px-3 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap"
            >
              <Share2 className="w-4 h-4" />
              <span>Share on WhatsApp</span>
            </a>

            <button
              type="button"
              onClick={handleNativeShare}
              className="min-h-[44px] py-2.5 px-3 rounded-xl bg-[#7C3AED]/20 hover:bg-[#7C3AED]/30 text-[#E9D5FF] text-xs font-semibold border border-[#A78BFA]/35 flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap"
            >
              <Send className="w-4 h-4 text-[#C4B5FD]" />
              <span>Share via Apps</span>
            </button>

            <button
              type="button"
              onClick={handleCopyInvite}
              className="min-h-[44px] py-2.5 px-3 rounded-xl bg-[#1F2433] hover:bg-[#282F42] text-slate-100 text-xs font-semibold border border-white/12 flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap"
            >
              {copiedInvite ? (
                <Check className="w-4 h-4 text-emerald-400" />
              ) : (
                <Copy className="w-4 h-4 text-[#C4B5FD]" />
              )}
              <span>{copiedInvite ? 'Text Copied' : 'Copy Invite Text'}</span>
            </button>

            <a
              href={liveGuestUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="min-h-[44px] py-2.5 px-3 rounded-xl bg-[#1F2433] hover:bg-[#282F42] text-slate-100 text-xs font-semibold border border-white/12 flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap"
            >
              <ExternalLink className="w-4 h-4 text-[#C4B5FD]" />
              <span>Open Guest Link</span>
            </a>
          </div>

          <button
            type="button"
            onClick={() => window.print()}
            className="w-full min-h-[40px] py-2 px-3 rounded-xl bg-[#0D0F14] hover:bg-[#191D2A] text-slate-300 text-xs font-medium border border-white/10 flex items-center justify-center gap-1.5 transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-[#C4B5FD]" />
            <span>Print Order Receipt</span>
          </button>
        </div>
      </div>
    );
  }

  // LOCKED STATE: INTERACTIVE 6TH CHECKOUT & PUBLISH STUDIO
  return (
    <div className="space-y-4 animate-in fade-in duration-150">
      {/* 1. Interactive 3D Invitation Pass Card */}
      <div className="perspective-[900px]">
        <div
          ref={passRef}
          onPointerDown={(e) => {
            setIsTilting(true);
            updatePassTilt(e.clientX, e.clientY);
          }}
          onPointerMove={(e) => {
            if (e.pointerType === 'mouse' || isTilting) {
              updatePassTilt(e.clientX, e.clientY);
            }
          }}
          onPointerUp={resetPassTilt}
          onPointerLeave={resetPassTilt}
          onPointerCancel={resetPassTilt}
          className="relative rounded-2xl overflow-hidden border border-white/15 bg-[#151822] shadow-2xl touch-pan-y select-none"
          style={{
            transform: `rotateX(${passTilt.x}deg) rotateY(${passTilt.y}deg)`,
            transition: isTilting
              ? 'transform 60ms linear'
              : 'transform 350ms cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <div className="relative h-40 overflow-hidden">
            <img
              src={config.heroCouplePhoto}
              alt={coupleTitle}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0D0F14] via-black/55 to-black/35" />

            <div className="absolute top-3 inset-x-3 flex items-center justify-between gap-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/75 border border-amber-400/35 text-[11px] font-semibold text-amber-300">
                <Lock className="w-3 h-3" />
                <span>Share Link Locked</span>
              </div>
              <button
                type="button"
                onClick={onPreviewLive}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/75 hover:bg-black text-[11px] font-semibold text-slate-200 border border-white/15 transition-colors"
              >
                <Eye className="w-3 h-3 text-[#C4B5FD]" />
                <span>Preview</span>
              </button>
            </div>

            <div className="absolute bottom-3 inset-x-3 flex items-end justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[10px] font-medium text-[#DDD6FE] truncate">
                  {config.theme?.culturalTheme || 'Royal 3D Website'}
                </p>
                <h3 className="font-classic text-xl font-bold text-white truncate">
                  {coupleTitle}
                </h3>
                <p className="text-[11px] text-slate-300 truncate">
                  {config.weddingDateFormatted} &middot; {config.venueCity}
                </p>
              </div>

              <div className="text-right shrink-0 tabular-nums">
                <span className="text-[10px] text-slate-400 block line-through">
                  ₹{currentPlan.originalPrice.toLocaleString('en-IN')}
                </span>
                <span className="text-lg font-bold text-amber-300 leading-none">
                  ₹{currentPlan.price.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          {/* Clickable 5-Step Readiness Bar */}
          <div className="p-2.5 bg-[#10131B] border-t border-white/10 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {checklistSteps.map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => onJumpToStep(st.id)}
                className={`px-2 py-1 rounded-md text-[10px] font-semibold flex items-center gap-1 whitespace-nowrap shrink-0 border transition-colors ${
                  st.done
                    ? 'bg-[#192222] border-emerald-500/35 text-emerald-300 hover:bg-[#1E2B2B]'
                    : 'bg-[#171B26] border-white/10 text-slate-300 hover:text-white'
                }`}
              >
                <CheckCircle2
                  className={`w-3 h-3 ${st.done ? 'text-emerald-400' : 'text-slate-500'}`}
                />
                <span>{st.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Masked Locked Share Link Preview */}
      <div className="bg-[#151822] p-3.5 rounded-2xl border border-white/10 space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-white flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-amber-300" />
            Guest Share Link
          </span>
          <span className="text-[11px] text-amber-300 font-medium">Locked until payment</span>
        </div>
        <div className="flex items-center gap-2 bg-[#0D0F14] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-slate-500 font-mono select-none">
          <Link2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span className="truncate blur-[2px]">
            {window.location.origin}/?view=invitation&amp;token=SKY-VIP-LOCKED
          </span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          All 3D previews are unlocked for editing. Complete one-time checkout below to generate and share your official guest link.
        </p>
      </div>

      {/* 3. Interactive 4-Tier Package Selector */}
      <div className="bg-[#151822] p-4 rounded-2xl border border-white/10 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h4 className="text-xs font-bold text-white">
            Select <span className="text-lavender-highlight">Publish Tier</span>
          </h4>
          <span className="text-[11px] text-emerald-400 font-semibold tabular-nums">
            Save ₹{savings.toLocaleString('en-IN')} today
          </span>
        </div>

        {/* Horizontal sideways-scrollable on mobile, 2x2 grid on larger panel */}
        <div className="flex sm:grid sm:grid-cols-2 gap-2 overflow-x-auto sm:overflow-visible snap-x no-scrollbar pb-1 sm:pb-0">
          {PRICING_PLANS.map((plan) => {
            const isSelected = selectedPrice === plan.price;
            return (
              <button
                key={plan.id}
                type="button"
                onClick={() => setSelectedPrice(plan.price)}
                className={`snap-start min-w-[145px] sm:min-w-0 p-3 rounded-xl text-left border transition-all flex flex-col justify-between shrink-0 ${
                  isSelected
                    ? 'bg-[#1D2130] border-[#A78BFA] ring-1 ring-[#A78BFA]/45 shadow-md'
                    : 'bg-[#0D0F14] border-white/10 hover:border-white/25'
                }`}
              >
                <div>
                  <span className="text-[10px] font-semibold text-[#C4B5FD] block truncate">
                    {plan.badge}
                  </span>
                  <span className="text-xs font-bold text-white block mt-0.5 truncate">
                    {plan.name}
                  </span>
                </div>
                <div className="mt-2.5 pt-2 border-t border-white/10 flex items-baseline justify-between gap-1 tabular-nums">
                  <span className="text-sm font-bold text-amber-300">
                    ₹{plan.price.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] text-slate-500 line-through">
                    ₹{plan.originalPrice.toLocaleString('en-IN')}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Dynamic Tier Features Preview */}
        <div className="pt-2 border-t border-white/10 space-y-1.5">
          <p className="text-[11px] font-semibold text-slate-300">
            Included in {currentPlan.name}:
          </p>
          <div className="grid grid-cols-1 gap-1.5">
            {currentPlan.features.slice(0, 5).map((feat, idx) => (
              <div key={idx} className="flex items-start gap-1.5 text-[11px] text-slate-300">
                <Check className="w-3.5 h-3.5 text-[#C4B5FD] shrink-0 mt-0.5" />
                <span>{feat}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Interactive Payment Console */}
      <div className="bg-[#151822] p-4 rounded-2xl border border-white/10 space-y-3">
        {/* Live vs Sandbox Toggle */}
        <div className="bg-[#0D0F14] p-1 rounded-xl border border-white/10 flex items-center gap-1">
          <button
            type="button"
            onClick={() => {
              setPaymentMode('live');
              setErrorMessage(null);
            }}
            className={`flex-1 min-h-[38px] py-1.5 px-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all whitespace-nowrap ${
              paymentMode === 'live'
                ? 'bg-[#7C3AED] text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Razorpay Live</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setPaymentMode('demo');
              setErrorMessage(null);
            }}
            className={`flex-1 min-h-[38px] py-1.5 px-2.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all whitespace-nowrap ${
              paymentMode === 'demo'
                ? 'bg-[#7C3AED] text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Sandbox Test</span>
          </button>
        </div>

        {paymentMode === 'live' && gatewayConfigured === false && (
          <div className="p-2.5 rounded-xl bg-rose-950/40 border border-rose-500/35 text-[11px] text-rose-200 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>
              Live Razorpay keys are not active on server. Use Sandbox Test or configure keys.
            </span>
          </div>
        )}

        {/* Optional Fresh Inputs (Never prefilled) */}
        <div className="space-y-2">
          <p className="text-[11px] font-medium text-slate-300">
            Billing Details <span className="text-slate-500">(Optional — or enter inside Razorpay)</span>
          </p>
          <input
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Your full name"
            autoComplete="off"
            className="w-full bg-[#0D0F14] border border-white/15 focus:border-[#A78BFA] rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 outline-none"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              placeholder="Email address"
              autoComplete="off"
              className="w-full bg-[#0D0F14] border border-white/15 focus:border-[#A78BFA] rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 outline-none"
            />
            <input
              type="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="10-digit mobile"
              autoComplete="off"
              className="w-full bg-[#0D0F14] border border-white/15 focus:border-[#A78BFA] rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 outline-none"
            />
          </div>
        </div>

        {errorMessage && (
          <div className="p-2.5 rounded-xl bg-rose-950/50 border border-rose-500/40 text-xs text-rose-200 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <button
          id="step6-pay-unlock-btn"
          type="button"
          onClick={handleCheckout}
          disabled={isProcessing}
          className={`w-full min-h-[48px] py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg active:scale-[0.99] tabular-nums ${
            isProcessing
              ? 'bg-slate-800 text-slate-400 cursor-not-allowed'
              : 'bg-gradient-to-r from-[#7C3AED] to-[#9333EA] hover:from-[#6D28D9] hover:to-[#7E22CE] text-white'
          }`}
        >
          {isProcessing ? (
            <>
              <div className="w-4 h-4 border-2 border-white/25 border-t-white rounded-full animate-spin" />
              <span>Opening Checkout...</span>
            </>
          ) : paymentMode === 'live' ? (
            <>
              <Sparkles className="w-4 h-4 text-[#E9D5FF]" />
              <span>Pay ₹{currentPlan.price.toLocaleString('en-IN')} &amp; Unlock Link</span>
            </>
          ) : (
            <>
              <Zap className="w-4 h-4 text-[#E9D5FF]" />
              <span>Test Unlock Share Link (₹{currentPlan.price.toLocaleString('en-IN')})</span>
            </>
          )}
        </button>

        <div className="flex items-center justify-center gap-2.5 text-[11px] text-slate-400 pt-0.5">
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            Razorpay Secured
          </span>
          <span aria-hidden="true">&middot;</span>
          <span>Instant Link Unlock</span>
        </div>
      </div>
    </div>
  );
};
