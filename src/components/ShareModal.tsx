import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  MessageCircle,
  ExternalLink,
  QrCode,
  Sparkles,
  ShieldCheck,
  Lock,
  Send,
} from 'lucide-react';
import { InvitationConfig, PricingTierPrice } from '../types';
import { getPresetPrice } from '../data/weddingPresets';
import { SkylineLogo } from './SkylineLogo';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: InvitationConfig;
  onOpenPayment?: (price?: PricingTierPrice) => void;
  onOpenPricing?: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  config,
  onOpenPayment,
  onOpenPricing,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const activePrice = getPresetPrice(config.theme?.presetId);

  const officialGuestUrl = `${window.location.origin}${window.location.pathname}?view=invitation&licensed=true&groom=${encodeURIComponent(
    config.groomName
  )}&bride=${encodeURIComponent(config.brideName)}&date=${encodeURIComponent(
    config.weddingDate
  )}&venue=${encodeURIComponent(config.venueName)}&city=${encodeURIComponent(
    config.venueCity
  )}&theme=${encodeURIComponent(config.theme?.presetId || 'royal-rajasthan-3d')}&order=${config.activeOrder?.licenseKey || 'ROYAL-VIP'}`;

  const whatsappMessage = encodeURIComponent(
    `You are cordially invited to celebrate the wedding of ${config.groomName} & ${config.brideName}!\n\nDate: ${config.weddingDateFormatted}\nVenue: ${config.venueName}, ${config.venueCity}\n\nOpen our Official 3D Animated Invitation Website:\n${officialGuestUrl}\n\nWith love,\n${config.groomName} & ${config.brideName}`
  );

  const whatsappUrl = `https://api.whatsapp.com/send?text=${whatsappMessage}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(officialGuestUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${config.groomName} & ${config.brideName} — Wedding Invitation`,
          text: `You are invited to the wedding of ${config.groomName} & ${config.brideName}.`,
          url: officialGuestUrl,
        });
      } catch {
        // cancelled
      }
    } else {
      handleCopyLink();
    }
  };

  const handleOpenCheckout = () => {
    onClose();
    if (onOpenPayment) {
      onOpenPayment(activePrice);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#12151E] rounded-2xl shadow-2xl overflow-hidden border border-white/12 p-6 text-slate-100">
        <button
          onClick={onClose}
          type="button"
          aria-label="Close"
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white bg-[#1C2130] hover:bg-[#262C3F] border border-white/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-5 space-y-2">
          <div className="flex justify-center">
            <SkylineLogo size="sm" variant="dark" />
          </div>
          <div className="flex items-center justify-center gap-1.5 pt-1">
            {config.isUnlocked ? (
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            ) : (
              <Lock className="w-4 h-4 text-[#C4B5FD]" />
            )}
            <h3 className="text-lg font-semibold text-white">
              {config.isUnlocked ? (
                <>
                  Share <span className="text-lavender-highlight">Official Guest Link</span>
                </>
              ) : (
                <>
                  Guest Link <span className="text-lavender-highlight">Locked</span>
                </>
              )}
            </h3>
          </div>
          <p className="text-xs text-slate-400">
            {config.isUnlocked
              ? 'Your invitation website is licensed and ready to share with guests'
              : 'Complete payment to unlock your permanent shareable guest invitation link.'}
          </p>
        </div>

        {/* UNLOCKED STATE */}
        {config.isUnlocked ? (
          <div className="space-y-4">
            <div className="bg-[#161924] p-3.5 rounded-xl border border-white/12">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-semibold text-slate-200 block">
                  Official Guest Website Link
                </label>
                <span className="text-[11px] font-medium text-emerald-400">Licensed</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={officialGuestUrl}
                  className="flex-1 bg-[#0D0F14] border border-white/15 rounded-lg px-3 py-2 text-xs text-slate-100 font-mono select-all focus:outline-none focus:border-[#A78BFA]"
                />
                <button
                  id="copy-invitation-link-btn"
                  onClick={handleCopyLink}
                  type="button"
                  className="px-3.5 py-2 rounded-lg bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shrink-0"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>

            <div className="space-y-2.5">
              <a
                id="share-whatsapp-btn"
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                Share via WhatsApp
              </a>

              <button
                type="button"
                onClick={handleNativeShare}
                className="w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-[#7C3AED]/20 hover:bg-[#7C3AED]/30 text-[#E9D5FF] text-xs font-semibold border border-[#A78BFA]/35 flex items-center justify-center gap-2 transition-colors"
              >
                <Send className="w-4 h-4 text-[#C4B5FD]" />
                Share via Apps / Contacts
              </button>

              <a
                id="open-standalone-tab-btn"
                href={officialGuestUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-[#1B1F2B] hover:bg-[#252A3A] text-slate-100 text-xs font-semibold flex items-center justify-center gap-2 border border-white/12 transition-colors"
              >
                <ExternalLink className="w-4 h-4 text-[#C4B5FD]" />
                Open Live Guest View in New Tab
              </a>
            </div>

            <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5 font-mono">
                <QrCode className="w-3.5 h-3.5 text-[#C4B5FD]" />
                {config.activeOrder?.licenseKey || 'SKY-VIP'}
              </span>
              <span className="font-mono text-[11px] text-slate-300">
                {config.hashtag}
              </span>
            </div>
          </div>
        ) : (
          /* LOCKED STATE */
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-[#161924] border border-white/12 text-left space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white">
                  VIP Guest Access
                </span>
                <span className="text-sm font-bold text-amber-300 tabular-nums">
                  ₹{activePrice.toLocaleString('en-IN')}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Preview and customize everything freely inside the studio. Link sharing is locked until checkout is completed via Razorpay.
              </p>

              <div className="flex items-center gap-2 bg-[#0D0F14] border border-white/10 rounded-lg px-3 py-2 text-xs text-slate-500 font-mono select-none">
                <Lock className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                <span className="truncate blur-[2px]">
                  {window.location.origin}/?view=invitation&amp;token=SKY-VIP-LOCKED
                </span>
              </div>

              <div className="pt-2 border-t border-white/10 space-y-1.5 text-[11px] text-slate-300">
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-[#C4B5FD] shrink-0" />
                  <span>Permanent shareable wedding website link</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-[#C4B5FD] shrink-0" />
                  <span>One-click WhatsApp &amp; direct invite sharing</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-[#C4B5FD] shrink-0" />
                  <span>Interactive 3D Scroll, Gatefold &amp; RSVP tracking</span>
                </div>
              </div>
            </div>

            <button
              id="unlock-guest-link-cta-btn"
              type="button"
              onClick={handleOpenCheckout}
              className="w-full min-h-[44px] py-3 px-4 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold text-xs shadow-lg flex items-center justify-center gap-2 transition-all tabular-nums"
            >
              <Sparkles className="w-4 h-4 text-[#E9D5FF]" />
              <span>Purchase &amp; Unlock Link (₹{activePrice.toLocaleString('en-IN')})</span>
            </button>

            {onOpenPricing && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenPricing();
                }}
                className="w-full py-1.5 text-center text-xs text-slate-400 hover:text-white font-medium transition-colors"
              >
                Compare all 4 Design Tiers (₹1,499 – ₹2,999) &rarr;
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
