import React from 'react';
import {
  X,
  Check,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';
import { PRICING_PLANS } from '../data/weddingPresets';
import { PricingTierPrice } from '../types';
import { SkylineLogo } from './SkylineLogo';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPlan: (price: PricingTierPrice) => void;
  currentSelectedPrice?: PricingTierPrice;
}

export const PricingModal: React.FC<PricingModalProps> = ({
  isOpen,
  onClose,
  onSelectPlan,
  currentSelectedPrice,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl bg-[#12151E] border border-white/12 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[95vh]">
        {/* Header */}
        <div className="relative px-6 py-5 bg-gradient-to-r from-[#171B26] via-[#1C2130] to-[#141720] border-b border-white/10 flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-4 min-w-0">
            <SkylineLogo size="sm" variant="dark" />
            <div className="h-8 w-[1px] bg-white/10 hidden sm:block" />
            <div className="min-w-0">
              <h2 className="text-lg sm:text-xl font-bold text-white truncate">
                Wedding Website Packages &middot; <span className="text-lavender-highlight">Skyline Software</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5 truncate">
                Transparent one-time licensing (₹1,499 – ₹2,999) &middot; Instant shareable link on payment completion
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            type="button"
            aria-label="Close pricing"
            className="p-2 text-slate-400 hover:text-white rounded-lg bg-[#1C2130] hover:bg-[#262C3F] border border-white/10 transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Plans Grid */}
        <div className="p-5 sm:p-7 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {PRICING_PLANS.map((plan) => {
              const isCurrent = currentSelectedPrice === plan.price;
              const isUltra = plan.price === 2999;

              return (
                <div
                  key={plan.id}
                  className={`relative rounded-xl p-5 flex flex-col justify-between border transition-all duration-200 ${
                    isCurrent || isUltra
                      ? 'bg-[#191D2A] border-[#A78BFA]/70 ring-1 ring-[#A78BFA]/30'
                      : 'bg-[#0D0F14] border-white/10 hover:border-white/25'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between text-[11px] mb-2">
                      <span className="font-semibold text-[#C4B5FD]">{plan.badge}</span>
                      <span className="text-emerald-400 font-medium">{plan.discount}</span>
                    </div>

                    <h3 className="text-base font-bold text-white">
                      {plan.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                      {plan.tagline}
                    </p>

                    <div className="mt-4 pb-4 border-b border-white/10 tabular-nums">
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-amber-300">
                          ₹{plan.price.toLocaleString('en-IN')}
                        </span>
                        <span className="text-xs text-slate-500 line-through">
                          ₹{plan.originalPrice.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 block mt-0.5">
                        One-time fee &middot; Lifetime cloud hosting
                      </span>
                    </div>

                    <div className="py-4 space-y-2">
                      <span className="text-[11px] font-semibold text-slate-200 block mb-2">
                        Key Inclusions
                      </span>
                      {plan.features.map((feat, fIdx) => (
                        <div key={fIdx} className="flex items-start gap-2 text-xs text-slate-300">
                          <Check className="w-3.5 h-3.5 text-[#C4B5FD] shrink-0 mt-0.5" />
                          <span className="leading-snug">{feat}</span>
                        </div>
                      ))}
                    </div>

                    <div className="pt-2 pb-4">
                      <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">
                        Matched Designs
                      </span>
                      <div className="space-y-1 text-[11px] text-slate-300">
                        {plan.recommendedDesigns.map((des, dIdx) => (
                          <div key={dIdx} className="truncate">
                            &middot; {des}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/10 mt-auto">
                    <button
                      type="button"
                      onClick={() => onSelectPlan(plan.price)}
                      className={`w-full min-h-[42px] py-2.5 px-4 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all tabular-nums ${
                        isUltra || isCurrent
                          ? 'bg-[#7C3AED] hover:bg-[#6D28D9] text-white'
                          : 'bg-[#1F2433] hover:bg-[#7C3AED] text-slate-100 hover:text-white border border-white/12'
                      }`}
                    >
                      <span>Select ₹{plan.price.toLocaleString('en-IN')}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 p-4 rounded-xl bg-[#0D0F14] border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-300">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <span className="font-semibold text-white block">Razorpay Verified Checkout</span>
                <span>Instant shareable invitation link unlocked immediately upon payment verification.</span>
              </div>
            </div>
            <div className="flex items-center gap-3 text-slate-300 text-[11px]">
              <span>Instant Link</span>
              <span aria-hidden="true">&middot;</span>
              <span>WhatsApp Invite</span>
              <span aria-hidden="true">&middot;</span>
              <span>Mobile Ready</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
