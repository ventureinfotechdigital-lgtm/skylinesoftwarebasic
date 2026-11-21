import React, { useState, useEffect } from 'react';
import { InvitationConfig, ViewMode, PricingTierPrice, OrderRecord } from './types';
import { DEFAULT_INVITATION } from './data/defaultInvitation';
import { BuilderSidebar } from './components/BuilderSidebar';
import { MobileFrame } from './components/MobileFrame';
import { WeddingInvitationWebsite } from './components/WeddingInvitationWebsite';
import { ThreeDCardStudio } from './components/ThreeDCardStudio';
import { ShareModal } from './components/ShareModal';
import { CreateWebsiteModal } from './components/CreateWebsiteModal';
import { PaymentModal } from './components/PaymentModal';
import { PricingModal } from './components/PricingModal';
import { SkylineLogo } from './components/SkylineLogo';
import { WeddingPreset, applyPresetToConfig, getPresetPrice, WEDDING_PRESETS } from './data/weddingPresets';
import { weddingAudio } from './utils/audioSynth';
import confetti from 'canvas-confetti';
import {
  Eye,
  Sparkles,
  RefreshCw,
  Wand2,
  Layers,
  Globe,
  Tag,
  Lock,
  Check,
  Share2,
} from 'lucide-react';

export default function App() {
  const queryParams = new URLSearchParams(window.location.search);
  const isGuestViewQuery = queryParams.get('view') === 'invitation';

  const [config, setConfig] = useState<InvitationConfig>(() => {
    const groom = queryParams.get('groom');
    const bride = queryParams.get('bride');
    const venue = queryParams.get('venue');
    const city = queryParams.get('city');
    const date = queryParams.get('date');
    const theme = queryParams.get('theme');
    const isLicensedParam = queryParams.get('licensed') === 'true' || Boolean(queryParams.get('order'));

    let base: InvitationConfig = { ...DEFAULT_INVITATION };

    const saved = localStorage.getItem('3d_wedding_invitation_config');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object') {
          const savedPresetId = parsed.theme?.presetId;
          const isValidPreset = !savedPresetId || WEDDING_PRESETS.some((p) => p.id === savedPresetId);
          if (isValidPreset || parsed.isUnlocked) {
            base = parsed;
          }
        }
      } catch {
        // fallback
      }
    }

    if (groom) base.groomName = groom;
    if (bride) base.brideName = bride;
    if (venue) base.venueName = venue;
    if (city) base.venueCity = city;
    if (date) {
      base.weddingDate = date;
      const d = new Date(date);
      if (!isNaN(d.getTime())) {
        base.weddingDateFormatted = d.toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        });
      }
    }
    if (groom && bride) {
      base.monogramText = `${groom.charAt(0)}${bride.charAt(0)}`.toUpperCase();
      base.hashtag = `#${groom}Weds${bride}`;
    }
    if (theme) {
      const preset = WEDDING_PRESETS.find((p) => p.id === theme);
      if (preset) {
        base = applyPresetToConfig(preset, base);
      }
    }
    if (isLicensedParam) {
      base.isUnlocked = true;
    }

    return base;
  });

  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [activeStage, setActiveStage] = useState<'website' | '3d-cards'>('website');
  const [mobileTab, setMobileTab] = useState<'builder' | 'preview'>('builder');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isGuestMode, setIsGuestMode] = useState(isGuestViewQuery);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [checkoutTargetPrice, setCheckoutTargetPrice] = useState<PricingTierPrice>(() => getPresetPrice(config.theme?.presetId));

  useEffect(() => {
    localStorage.setItem('3d_wedding_invitation_config', JSON.stringify(config));
  }, [config]);

  const handleOpenPayment = (price?: PricingTierPrice) => {
    if (price) {
      setCheckoutTargetPrice(price);
    } else {
      setCheckoutTargetPrice(getPresetPrice(config.theme?.presetId));
    }
    setIsPaymentModalOpen(true);
  };

  const handleOpenPricing = () => {
    setIsPricingModalOpen(true);
  };

  const handlePaymentSuccess = (order: OrderRecord) => {
    setConfig((prev) => {
      const updated: InvitationConfig = {
        ...prev,
        isUnlocked: true,
        activeOrder: order,
      };
      localStorage.setItem('3d_wedding_invitation_config', JSON.stringify(updated));
      return updated;
    });
  };

  const handleConfigChange = (updated: InvitationConfig) => {
    setConfig(updated);
  };

  const handleGenerateWebsite = () => {
    setActiveStage('website');
    setMobileTab('preview');
  };

  const handleViewWebsite = () => {
    setActiveStage('website');
    setMobileTab('preview');
  };

  const handleApplyPreset = (preset: WeddingPreset) => {
    weddingAudio.playBlessingChime();
    const updated = applyPresetToConfig(preset, config);
    setConfig(updated);

    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.6 },
      colors: preset.petalColors || ['#D4AF37', '#F59E0B', '#E11D48', '#FFFFFF'],
    });
  };

  const handleResetToDefault = () => {
    if (window.confirm('Reset invitation to default sample template (Ethan & Sophia)?')) {
      setConfig(DEFAULT_INVITATION);
      localStorage.removeItem('3d_wedding_invitation_config');
    }
  };

  // Pure Guest View (Standalone shared invitation link)
  if (isGuestMode) {
    const isGuestUnlocked = Boolean(
      config.isUnlocked ||
      queryParams.get('licensed') === 'true' ||
      Boolean(queryParams.get('order'))
    );
    const activePrice = getPresetPrice(config.theme?.presetId);

    return (
      <>
        {!isGuestUnlocked ? (
          <main className="relative w-full min-h-[100dvh] bg-[#0D0F14] overflow-y-auto flex flex-col items-center justify-center p-4">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(124,58,237,0.12)_0%,transparent_65%)] pointer-events-none" />

            <div className="relative w-full max-w-md bg-[#151822] border border-white/12 rounded-2xl p-6 sm:p-8 shadow-2xl text-center space-y-5 animate-in fade-in duration-300">
              <div className="flex justify-center">
                <SkylineLogo size="md" variant="dark" />
              </div>

              <div>
                <p className="text-xs font-medium text-[#C4B5FD] inline-flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" />
                  Private 3D Wedding Invitation
                </p>
                <h1 className="font-classic text-2xl font-bold text-white mt-1.5">
                  {config.groomName} &amp; <span className="text-lavender-highlight">{config.brideName}</span>
                </h1>
                <p className="text-xs text-slate-400 font-editorial italic mt-0.5">
                  {config.weddingDateFormatted} &middot; {config.venueName}, {config.venueCity}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#0D0F14] border border-white/10 text-left space-y-2 text-xs text-slate-200">
                <p className="leading-relaxed">
                  This 3D wedding invitation is in <strong className="text-[#E9D5FF]">private preview</strong>. Purchase a license to unlock your <strong className="text-[#DDD6FE]">shareable guest link</strong>.
                </p>

                <div className="pt-2 border-t border-white/10 space-y-1.5 text-[11px] text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-[#C4B5FD] shrink-0" />
                    <span>Interactive 3D unrolling scroll &amp; gatefold card</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-[#C4B5FD] shrink-0" />
                    <span>Royal music serenades &amp; live guest blessings</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-[#C4B5FD] shrink-0" />
                    <span>Instant WhatsApp &amp; direct shareable link after payment</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5 pt-1">
                <button
                  type="button"
                  onClick={() => handleOpenPayment(activePrice)}
                  className="w-full min-h-[44px] py-3 px-4 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-lg tabular-nums"
                >
                  <Sparkles className="w-4 h-4 text-[#E9D5FF]" />
                  <span>Unlock &amp; Share Link (₹{activePrice.toLocaleString('en-IN')})</span>
                </button>

                <button
                  type="button"
                  onClick={handleOpenPricing}
                  className="w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-[#1D2130] hover:bg-[#262B3E] text-slate-200 border border-white/12 font-medium text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Tag className="w-3.5 h-3.5 text-[#C4B5FD]" />
                  <span>Compare All 4 Packages (₹1,499 – ₹2,999)</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    window.location.href = window.location.pathname;
                  }}
                  className="text-xs text-slate-400 hover:text-white underline pt-1 block mx-auto transition-colors"
                >
                  Open in Skyline Studio (Edit in App) &rarr;
                </button>
              </div>
            </div>
          </main>
        ) : (
          <main className="relative w-full h-[100dvh] bg-[#0D0F14] overflow-hidden flex flex-col items-center justify-center">
            <div className="w-full h-full max-w-md mx-auto relative shadow-2xl overflow-hidden">
              <WeddingInvitationWebsite
                config={config}
                isStandalone={true}
              />
            </div>

            <div className="fixed bottom-4 right-4 z-40 flex items-center gap-2">
              {config.isUnlocked && (
                <button
                  type="button"
                  onClick={() => setIsShareModalOpen(true)}
                  className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white border border-purple-300/30 text-xs font-semibold px-3.5 py-2.5 rounded-full shadow-xl flex items-center gap-1.5 transition-all"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Share Link</span>
                </button>
              )}
              {!isGuestViewQuery && (
                <button
                  onClick={() => setIsGuestMode(false)}
                  className="bg-[#151822]/95 hover:bg-[#1E2230] text-slate-100 border border-white/15 text-xs px-3 py-2.5 rounded-full shadow-xl backdrop-blur-md flex items-center gap-1.5 transition-all"
                  title="Return to Studio Creator"
                >
                  <Eye className="w-3.5 h-3.5 text-[#C4B5FD]" />
                  <span>Exit Guest View</span>
                </button>
              )}
            </div>
          </main>
        )}

        <PaymentModal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          config={config}
          onPaymentSuccess={handlePaymentSuccess}
          initialPrice={checkoutTargetPrice}
        />

        <PricingModal
          isOpen={isPricingModalOpen}
          onClose={() => setIsPricingModalOpen(false)}
          currentSelectedPrice={checkoutTargetPrice}
          onSelectPlan={(price) => {
            setIsPricingModalOpen(false);
            handleOpenPayment(price);
          }}
        />

        <ShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          config={config}
          onOpenPayment={handleOpenPayment}
          onOpenPricing={handleOpenPricing}
        />
      </>
    );
  }

  return (
    <div className="relative w-full min-h-[100dvh] lg:h-screen flex flex-col lg:flex-row lg:overflow-hidden bg-[#0D0F14]">
      {/* Mobile Sticky Top Navigation Bar (< lg) — compact 48px height, well under 15% cap */}
      <div className="lg:hidden sticky top-0 w-full h-12 bg-[#12151E]/95 backdrop-blur-md border-b border-white/10 px-3 flex items-center justify-between gap-2 z-40 shrink-0 shadow-md">
        <div className="flex items-center gap-2 min-w-0">
          <SkylineLogo size="sm" iconOnly={true} />
          <span className="text-xs font-semibold text-white truncate">
            {config.groomName} &amp; <span className="text-lavender-highlight">{config.brideName}</span>
          </span>
        </div>

        {/* 3-Way Mobile Switcher: Studio | 3D Card | Live Invite */}
        <div className="flex items-center gap-1 bg-[#090B10] p-0.5 rounded-lg border border-white/10 shrink-0">
          <button
            type="button"
            onClick={() => setMobileTab('builder')}
            className={`px-2.5 py-1 min-h-[32px] text-[11px] rounded-md font-semibold transition-all whitespace-nowrap ${
              mobileTab === 'builder'
                ? 'bg-[#7C3AED] text-white shadow-xs'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Studio
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveStage('3d-cards');
              setMobileTab('preview');
            }}
            className={`px-2.5 py-1 min-h-[32px] text-[11px] rounded-md font-semibold transition-all whitespace-nowrap ${
              mobileTab === 'preview' && activeStage === '3d-cards'
                ? 'bg-[#7C3AED] text-white shadow-xs'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            3D Card
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveStage('website');
              setMobileTab('preview');
            }}
            className={`px-2.5 py-1 min-h-[32px] text-[11px] rounded-md font-semibold transition-all whitespace-nowrap ${
              mobileTab === 'preview' && activeStage === 'website'
                ? 'bg-[#7C3AED] text-white shadow-xs'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            Live Invite
          </button>
        </div>
      </div>

      {/* Left Sidebar: Creator Studio (flows vertically on mobile so user scrolls down effortlessly) */}
      <div className={`${mobileTab === 'builder' ? 'flex flex-col w-full' : 'hidden'} lg:flex lg:h-full lg:w-auto shrink-0`}>
        <BuilderSidebar
          config={config}
          onChange={handleConfigChange}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onOpenShare={() => setIsShareModalOpen(true)}
          onOpenCreateModal={() => setIsCreateModalOpen(true)}
          onOpenPayment={handleOpenPayment}
          onPaymentSuccess={handlePaymentSuccess}
          onOpenPricing={handleOpenPricing}
          onOpen3DStudio={() => {
            setActiveStage('3d-cards');
            setMobileTab('preview');
          }}
          onApplyPreset={handleApplyPreset}
          onGenerateWebsite={handleGenerateWebsite}
          onViewWebsite={handleViewWebsite}
        />
      </div>

      {/* Right Stage: Live 3D Website & 3D Card Studio */}
      <main className={`relative flex-1 ${mobileTab === 'preview' ? 'flex h-[calc(100dvh-48px)] lg:h-full' : 'hidden'} lg:flex flex-col overflow-hidden bg-gradient-to-br from-[#0D0F14] via-[#131722] to-[#0D0F14]`}>
        {/* Top Floating Control Bar over preview canvas */}
        <header className="relative z-30 w-full h-12 border-b border-white/10 bg-[#12151E]/95 backdrop-blur-md px-3 sm:px-4 flex items-center justify-between gap-3 shrink-0 overflow-x-auto no-scrollbar">
          {/* Left: Stage Switcher */}
          <div className="flex items-center gap-3 min-w-0 shrink-0">
            <div className="hidden lg:flex items-center bg-[#090B10] p-0.5 rounded-lg border border-white/10 shadow-inner shrink-0">
              <button
                type="button"
                onClick={() => setActiveStage('website')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all whitespace-nowrap ${
                  activeStage === 'website'
                    ? 'bg-[#7C3AED] text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-100'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>3D Website</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveStage('3d-cards')}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all whitespace-nowrap ${
                  activeStage === '3d-cards'
                    ? 'bg-[#7C3AED] text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-100'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>3D Cards &amp; Themes</span>
              </button>
            </div>

            <span className="hidden xl:inline-block text-xs font-medium text-slate-300 tracking-wide truncate">
              {config.groomName} &amp; <span className="text-lavender-highlight font-semibold">{config.brideName}</span>
            </span>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 shrink-0 ml-auto">
            <button
              type="button"
              onClick={handleOpenPricing}
              className="text-xs text-slate-200 hover:text-white bg-[#1B1F2B] hover:bg-[#252A3A] border border-white/10 px-2.5 py-1.5 rounded-md flex items-center gap-1 font-medium transition-colors whitespace-nowrap tabular-nums"
              title="Compare all 4 Pricing Tiers (₹1,499 - ₹2,999)"
            >
              <Tag className="w-3 h-3 text-[#C4B5FD]" />
              <span className="hidden sm:inline">Pricing (₹1,499 – ₹2,999)</span>
              <span className="sm:hidden">Plans</span>
            </button>

            <button
              type="button"
              onClick={() => handleOpenPayment()}
              className="text-xs text-white bg-[#7C3AED] hover:bg-[#6D28D9] px-3 py-1.5 rounded-md flex items-center gap-1.5 font-semibold shadow-md transition-all active:scale-95 whitespace-nowrap tabular-nums"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#E9D5FF]" />
              <span>
                {config.isUnlocked
                  ? 'Licensed · Share'
                  : `Buy ₹${getPresetPrice(config.theme?.presetId).toLocaleString('en-IN')}`}
              </span>
            </button>

            <button
              id="top-bar-create-website-btn"
              onClick={() => setIsCreateModalOpen(true)}
              type="button"
              className="text-xs text-slate-200 bg-[#1B1F2B] hover:bg-[#252A3A] px-2.5 py-1.5 rounded-md flex items-center gap-1.5 font-medium transition-all active:scale-95 border border-white/10 whitespace-nowrap"
            >
              <Wand2 className="w-3.5 h-3.5 text-[#C4B5FD]" />
              <span className="hidden sm:inline">Wizard</span>
            </button>

            <button
              onClick={handleResetToDefault}
              type="button"
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 transition-colors px-2 py-1.5 whitespace-nowrap"
              title="Reset to default Ethan & Sophia template"
            >
              <RefreshCw className="w-3 h-3" />
              <span className="hidden md:inline">Reset</span>
            </button>

            <button
              onClick={() => setIsGuestMode(true)}
              type="button"
              className="text-xs text-slate-200 hover:text-white bg-[#1B1F2B] hover:bg-[#252A3A] border border-white/10 px-2.5 py-1.5 rounded-md flex items-center gap-1 font-medium transition-colors whitespace-nowrap"
            >
              <Eye className="w-3 h-3 text-[#C4B5FD]" />
              <span>Guest View</span>
            </button>
          </div>
        </header>

        {/* Center Preview Stage */}
        <div className="relative flex-1 min-h-0 w-full flex items-center justify-center overflow-hidden">
          {activeStage === '3d-cards' ? (
            <div className="w-full h-full animate-in fade-in duration-200">
              <ThreeDCardStudio
                onApplyPreset={(preset) => {
                  handleApplyPreset(preset);
                  setActiveStage('website');
                }}
                onOpenPayment={handleOpenPayment}
                onOpenPricing={handleOpenPricing}
                isUnlocked={config.isUnlocked}
                currentCouple={{
                  groom: config.groomName,
                  bride: config.brideName,
                  date: config.weddingDateFormatted,
                  venue: config.venueName,
                }}
              />
            </div>
          ) : (
            <div className="relative w-full h-full flex items-center justify-center lg:p-4 overflow-hidden">
              {/* Mobile (< lg): Full-bleed responsive live 3D website so users can scroll down smoothly without fake phone bezel clipping */}
              <div className="lg:hidden w-full h-full bg-black overflow-hidden">
                <WeddingInvitationWebsite config={config} />
              </div>

              {/* Desktop (lg+): Smartphone mockup or expanded fullscreen preview */}
              <div className="hidden lg:flex w-full h-full items-center justify-center">
                {viewMode === 'split' ? (
                  <div className="relative h-full max-h-full flex items-center justify-center animate-in zoom-in-95 duration-200">
                    <MobileFrame coupleNames={`${config.groomName.toLowerCase()}-${config.brideName.toLowerCase()}.wedding`}>
                      <WeddingInvitationWebsite config={config} />
                    </MobileFrame>
                  </div>
                ) : (
                  <div className="relative w-full h-full max-w-lg mx-auto bg-black rounded-3xl overflow-hidden shadow-2xl border border-white/10 animate-in zoom-in-95 duration-200">
                    <WeddingInvitationWebsite config={config} />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        config={config}
        onOpenPayment={handleOpenPayment}
        onOpenPricing={handleOpenPricing}
      />

      <CreateWebsiteModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onWebsiteCreated={(newConfig) => {
          setConfig(newConfig);
          setActiveStage('website');
          setViewMode('split');
          setMobileTab('preview');
        }}
        currentConfig={config}
      />

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        config={config}
        initialPrice={checkoutTargetPrice}
        onPaymentSuccess={handlePaymentSuccess}
      />

      <PricingModal
        isOpen={isPricingModalOpen}
        onClose={() => setIsPricingModalOpen(false)}
        currentSelectedPrice={checkoutTargetPrice}
        onSelectPlan={(price) => {
          setCheckoutTargetPrice(price);
          setIsPricingModalOpen(false);
          setIsPaymentModalOpen(true);
        }}
      />
    </div>
  );
}
