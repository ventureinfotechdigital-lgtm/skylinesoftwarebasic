import React, { useState } from 'react';
import {
  Heart,
  Calendar,
  MapPin,
  Image as ImageIcon,
  Sparkles,
  Share2,
  Eye,
  Smartphone,
  Maximize2,
  Upload,
  Plus,
  Trash2,
  CheckCircle2,
  ArrowRight,
  Check,
  Flame,
  Camera,
  ShieldCheck,
  Palette,
  ChevronRight,
  Lock,
  CreditCard,
} from 'lucide-react';
import { InvitationConfig, ViewMode, EventItem, PricingTierPrice, OrderRecord } from '../types';
import {
  WEDDING_PRESETS,
  WeddingPreset,
  THEME_PHOTO_LIBRARY,
  getPresetPrice,
  getPresetTierName,
} from '../data/weddingPresets';
import goldenHaldiImg from '../assets/images/golden_haldi_ceremony_1788535162943.jpg';
import twilightMehendiImg from '../assets/images/twilight_garden_mehendi_1788535181766.jpg';
import royalSangeetImg from '../assets/images/royal_sangeet_celebration_1788588370944.jpg';
import royalSindoorImg from '../assets/images/royal_sindoor_vivaha_1788535101917.jpg';
import lavenderReceptionImg from '../assets/images/lavender_reception_aisle_1788535137772.jpg';
import { weddingAudio } from '../utils/audioSynth';
import confetti from 'canvas-confetti';
import { SkylineLogo } from './SkylineLogo';
import { CoupleEndPreview } from './CoupleEndPreview';
import { PayUnlockSection, BuilderStepId } from './PayUnlockSection';

interface BuilderSidebarProps {
  config: InvitationConfig;
  onChange: (updated: InvitationConfig) => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  onOpenShare: () => void;
  onOpenCreateModal?: () => void;
  onOpen3DStudio?: () => void;
  onOpenPayment?: (price?: PricingTierPrice) => void;
  onPaymentSuccess: (order: OrderRecord) => void;
  onOpenPricing?: () => void;
  onApplyPreset?: (preset: WeddingPreset) => void;
  onViewWebsite?: () => void;
  onGenerateWebsite?: () => void;
}

export const BuilderSidebar: React.FC<BuilderSidebarProps> = ({
  config,
  onChange,
  viewMode,
  onViewModeChange,
  onOpenShare,
  onOpenCreateModal: _onOpenCreateModal,
  onOpen3DStudio,
  onOpenPayment,
  onPaymentSuccess,
  onOpenPricing,
  onApplyPreset,
  onViewWebsite,
  onGenerateWebsite,
}) => {
  // Theme comes FIRST by default; Pay & Share is Step 6
  const [activeTab, setActiveTab] = useState<BuilderStepId>('presets');
  const [isGenerated, setIsGenerated] = useState(false);
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);

  const isCoupleFilled = Boolean(config.groomName && config.brideName);
  const isVenueFilled = Boolean(config.weddingDate && config.venueName && config.venueCity);
  const isEventsFilled = config.events.length > 0;
  const isPhotosFilled = Boolean(config.heroCouplePhoto && config.galleryPhotos.length > 0);
  const completedSteps = [isCoupleFilled, isVenueFilled, isEventsFilled, isPhotosFilled].filter(Boolean).length;
  const totalSteps = 4;
  const progressPercent = Math.round((completedSteps / totalSteps) * 100);
  const activePrice = getPresetPrice(config.theme?.presetId);
  const activeTierName = getPresetTierName(config.theme?.presetId);

  const handleTextChange = (field: keyof InvitationConfig, val: string) => {
    const updated = { ...config, [field]: val };
    if (field === 'groomName' || field === 'brideName') {
      const gInitial = (field === 'groomName' ? val : config.groomName).charAt(0).toUpperCase();
      const bInitial = (field === 'brideName' ? val : config.brideName).charAt(0).toUpperCase();
      updated.monogramText = `${gInitial || 'P'}${bInitial || 'S'}`;
      updated.hashtag = `#${(field === 'groomName' ? val : config.groomName)}Weds${(field === 'brideName' ? val : config.brideName)}`;
    }
    onChange(updated);
  };

  const handleDateChange = (val: string) => {
    const d = new Date(val);
    const formatted = isNaN(d.getTime())
      ? config.weddingDateFormatted
      : d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    onChange({
      ...config,
      weddingDate: val,
      weddingDateFormatted: formatted,
    });
  };

  const handleFileUpload = (
    field: 'heroCouplePhoto' | 'scratchRevealPhoto',
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          onChange({ ...config, [field]: reader.result });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddGalleryPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          const newPhoto = {
            id: 'g-' + Date.now(),
            url: reader.result,
            caption: 'Auspicious Moment',
            date: 'Wedding Festivities',
          };
          onChange({
            ...config,
            galleryPhotos: [...config.galleryPhotos, newPhoto],
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteGalleryPhoto = (id: string) => {
    onChange({
      ...config,
      galleryPhotos: config.galleryPhotos.filter((p) => p.id !== id),
    });
  };

  const handleAddEvent = () => {
    const newEvent: EventItem = {
      id: 'e-' + Date.now(),
      title: 'New Sacred Ceremony',
      date: config.weddingDateFormatted,
      time: '07:00 PM',
      venue: config.venueName,
      description: 'Grand celebration with traditional music, dining, and festivities.',
      dressCode: 'Royal Ethnic Formal',
    };
    onChange({
      ...config,
      events: [...config.events, newEvent],
    });
  };

  const handleDeleteEvent = (id: string) => {
    onChange({
      ...config,
      events: config.events.filter((e) => e.id !== id),
    });
  };

  const handleGenerateWebsite = () => {
    weddingAudio.playBlessingChime();
    confetti({
      particleCount: 75,
      spread: 80,
      origin: { y: 0.65 },
      colors: ['#7C3AED', '#A855F7', '#F5D08A', '#E9D5FF', '#FFFFFF'],
    });

    setIsGenerated(true);
    setShowSuccessBanner(true);

    if (onGenerateWebsite) {
      onGenerateWebsite();
    }
  };

  const handleTriggerViewWebsite = () => {
    weddingAudio.playBlessingChime();
    if (onViewWebsite) {
      onViewWebsite();
    }
  };

  const steps: Array<{ id: BuilderStepId; num: number; label: string }> = [
    { id: 'presets', num: 1, label: '3D Themes' },
    { id: 'couple', num: 2, label: 'Couple' },
    { id: 'venue', num: 3, label: 'Date & Venue' },
    { id: 'ceremonies', num: 4, label: 'Ceremonies' },
    { id: 'photos', num: 5, label: 'Media Gallery' },
    { id: 'pay', num: 6, label: config.isUnlocked ? 'Share & Receipt' : 'Pay & Unlock' },
  ];

  return (
    <aside
      id="invitation-builder-sidebar"
      className="w-full lg:w-[440px] xl:w-[470px] lg:h-full flex flex-col bg-[#0D0F14] border-r border-white/10 shadow-2xl lg:overflow-hidden z-20 font-sans text-slate-100"
    >
      {/* Balanced Obsidian Slate Header with Skyline Logo & Lavender Highlights */}
      <div className="relative bg-gradient-to-b from-[#171B26] via-[#12151E] to-[#0D0F14] p-4 text-white border-b border-white/10 shrink-0">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <SkylineLogo size="md" variant="dark" />
            <p className="text-xs text-slate-400 mt-1.5 truncate">
              <span className="text-lavender-highlight font-semibold">
                {config.groomName} &amp; {config.brideName}
              </span>
              <span className="text-slate-600 mx-1.5">&middot;</span>
              <span>3D Wedding Studio</span>
            </p>
          </div>

          <button
            id="open-share-modal-btn"
            onClick={config.isUnlocked ? onOpenShare : () => setActiveTab('pay')}
            type="button"
            className={`flex items-center gap-1.5 px-3 py-2 min-h-[40px] rounded-lg border text-xs font-semibold transition-colors shrink-0 whitespace-nowrap active:scale-95 ${
              config.isUnlocked
                ? 'bg-[#7C3AED] hover:bg-[#6D28D9] border-[#C4B5FD]/40 text-white'
                : 'bg-[#1E2230] hover:bg-[#272C3D] border-white/12 text-slate-200'
            }`}
            title={config.isUnlocked ? 'Share Official Guest Link' : 'Share link is locked until payment in Step 6'}
          >
            {config.isUnlocked ? (
              <>
                <Share2 className="w-3.5 h-3.5 text-[#E9D5FF]" />
                <span>Share Link</span>
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5 text-amber-300" />
                <span>Share Locked</span>
              </>
            )}
          </button>
        </div>

        {/* Readiness Progress */}
        <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-[11px]">
          <span className="text-slate-300 font-medium flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#C4B5FD]" />
            <span>
              Readiness:{' '}
              <strong className="text-[#E9D5FF] tabular-nums">
                {completedSteps}/{totalSteps}
              </strong>{' '}
              Steps
            </span>
          </span>
          <span className="text-[#DDD6FE] font-semibold tabular-nums">{progressPercent}% Ready</span>
        </div>
        <div className="w-full h-1.5 bg-black/50 rounded-full mt-1.5 overflow-hidden border border-white/10">
          <div
            className="h-full bg-gradient-to-r from-[#7C3AED] via-[#A78BFA] to-[#F5D08A] rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Pricing & License Row */}
        <div className="mt-2.5 pt-2.5 border-t border-white/10 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0 text-xs">
            {config.isUnlocked ? (
              <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                <span>VIP License Active</span>
              </span>
            ) : (
              <div className="flex items-center gap-1.5 min-w-0 truncate">
                <span className="text-[11px] text-slate-400 font-medium shrink-0">
                  Selected Tier:
                </span>
                <span className="text-xs font-bold text-amber-300 tabular-nums shrink-0">
                  ₹{activePrice.toLocaleString('en-IN')}
                </span>
                <span className="text-slate-600 hidden sm:inline">&middot;</span>
                <span className="text-[11px] text-slate-300 truncate hidden sm:inline">
                  {activeTierName.split('(')[0].trim()}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {onOpenPricing && (
              <button
                type="button"
                onClick={onOpenPricing}
                className="px-2.5 py-1.5 rounded-lg text-[11px] font-semibold text-slate-200 hover:text-white bg-[#1B1F2B] hover:bg-[#252A3A] border border-white/10 transition-colors whitespace-nowrap shrink-0"
                title="View All 4 Pricing Tiers (₹1,499 - ₹2,999)"
              >
                Plans
              </button>
            )}

            {onOpenPayment && (
              <button
                type="button"
                onClick={() => onOpenPayment(activePrice)}
                className="px-2.5 py-1.5 rounded-lg text-[11px] font-bold bg-[#7C3AED] hover:bg-[#6D28D9] text-white shadow-sm flex items-center gap-1 transition-all whitespace-nowrap shrink-0 tabular-nums active:scale-95"
              >
                <Sparkles className="w-3 h-3 text-[#E9D5FF]" />
                <span>{config.isUnlocked ? 'Share / Receipt' : `Buy ₹${activePrice.toLocaleString('en-IN')}`}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Desktop Preview Mode Switcher (Hidden on mobile since mobile uses top native switcher) */}
      <div className="hidden lg:flex px-4 py-2 bg-[#11141C] border-b border-white/10 items-center justify-between shrink-0">
        <div className="flex items-center gap-1.5 text-xs text-slate-300">
          <Eye className="w-3.5 h-3.5 text-[#C4B5FD]" />
          <span className="font-semibold">Preview Frame</span>
        </div>

        <div className="flex items-center bg-[#090B10] rounded-lg p-0.5 border border-white/10">
          <button
            onClick={() => onViewModeChange('split')}
            type="button"
            className={`flex items-center gap-1 px-2.5 py-1 text-[11px] rounded-md font-semibold transition-all whitespace-nowrap shrink-0 ${
              viewMode === 'split'
                ? 'bg-[#7C3AED] text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-100'
            }`}
          >
            <Smartphone className="w-3 h-3" />
            <span>Phone Mockup</span>
          </button>
          <button
            onClick={() => onViewModeChange('fullscreen')}
            type="button"
            className={`flex items-center gap-1 px-2.5 py-1 text-[11px] rounded-md font-semibold transition-all whitespace-nowrap shrink-0 ${
              viewMode === 'fullscreen'
                ? 'bg-[#7C3AED] text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-100'
            }`}
          >
            <Maximize2 className="w-3 h-3" />
            <span>Full View</span>
          </button>
        </div>
      </div>

      {/* Sideways-Scrollable Step Navigation Tabs (Theme FIRST) */}
      <div className="sticky top-12 lg:static z-20 flex items-center border-b border-white/10 bg-[#12151E]/95 backdrop-blur-md px-2 overflow-x-auto snap-x scroll-smooth no-scrollbar shrink-0">
        {steps.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              type="button"
              className={`snap-start py-3 px-3 min-h-[44px] text-xs font-semibold border-b-2 flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-all ${
                isActive
                  ? 'border-[#A78BFA] text-white bg-white/[0.04]'
                  : 'border-transparent text-slate-400 hover:text-slate-100'
              }`}
            >
              <span
                className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold tabular-nums border ${
                  isActive
                    ? 'bg-[#7C3AED] text-white border-[#C4B5FD]/60'
                    : 'bg-[#1C202E] text-slate-400 border-white/10'
                }`}
              >
                {tab.num}
              </span>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Content Area — flows naturally on mobile so user can scroll down cleanly */}
      <div className="lg:flex-1 lg:overflow-y-auto p-4 space-y-4 bg-[#0D0F14] no-scrollbar">
        {/* STEP 1 (FIRST): 3D THEMES & PRESETS WITH SIDEWAYS CAROUSEL */}
        {activeTab === 'presets' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            {/* Section Intro + Open 3D Studio CTA */}
            <div className="bg-[#151822] p-4 rounded-2xl border border-white/10 shadow-sm">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <Palette className="w-4 h-4 text-[#C4B5FD]" />
                    <span>
                      Choose <span className="text-lavender-highlight">3D Wedding Theme</span>
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Swipe sideways to pick a cultural theme, then tap Next to edit details.
                  </p>
                </div>
                {onOpen3DStudio && (
                  <button
                    type="button"
                    onClick={onOpen3DStudio}
                    className="px-3 py-1.5 min-h-[36px] rounded-lg bg-[#202536] hover:bg-[#2A3045] border border-purple-400/35 text-[#E9D5FF] text-xs font-semibold shrink-0 whitespace-nowrap transition-colors"
                  >
                    3D Card View
                  </button>
                )}
              </div>

              {/* Horizontal Sideways-Scrollable Theme Strip */}
              <div className="mt-3.5 -mx-1 px-1 flex items-stretch gap-3 overflow-x-auto snap-x snap-mandatory scroll-smooth no-scrollbar pb-1.5">
                {WEDDING_PRESETS.map((preset) => {
                  const isActive =
                    config.theme?.presetId === preset.id ||
                    config.groomName.toLowerCase() === preset.groomName.toLowerCase();
                  return (
                    <div
                      key={`strip-${preset.id}`}
                      onClick={() => {
                        if (onApplyPreset) onApplyPreset(preset);
                      }}
                      className={`snap-start w-[156px] shrink-0 rounded-xl overflow-hidden border cursor-pointer transition-all flex flex-col ${
                        isActive
                          ? 'bg-[#1C2030] border-[#A78BFA] ring-1 ring-[#A78BFA]/50 shadow-lg'
                          : 'bg-[#0F1219] border-white/10 hover:border-white/25'
                      }`}
                    >
                      <div className="relative h-24 w-full overflow-hidden">
                        <img
                          src={preset.coverImage}
                          alt={preset.name}
                          className="w-full h-full object-cover object-center"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />
                        <span className="absolute bottom-1.5 left-2 text-[11px] font-bold text-amber-300 tabular-nums">
                          ₹{preset.price.toLocaleString('en-IN')}
                        </span>
                        {isActive && (
                          <span className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-[#7C3AED] text-white flex items-center justify-center shadow">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </span>
                        )}
                      </div>
                      <div className="p-2.5 flex-1 flex flex-col justify-between">
                        <div>
                          <p className="text-[10px] text-[#C4B5FD] font-semibold truncate">
                            {preset.culturalTheme}
                          </p>
                          <h4 className="text-xs font-bold text-white leading-snug line-clamp-1 mt-0.5">
                            {preset.name}
                          </h4>
                        </div>
                        <span className="mt-2 text-[10px] font-semibold text-slate-300 flex items-center justify-between">
                          <span>{isActive ? 'Active Theme' : 'Tap to Apply'}</span>
                          <ChevronRight className="w-3 h-3 text-[#C4B5FD]" />
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Detailed Vertical Theme Cards (for clear mobile scroll-down reading & direct purchase) */}
            <div className="space-y-3">
              {WEDDING_PRESETS.map((preset) => {
                const isActive =
                  config.theme?.presetId === preset.id ||
                  config.groomName.toLowerCase() === preset.groomName.toLowerCase();
                return (
                  <div
                    key={preset.id}
                    className={`p-3 rounded-2xl border transition-all ${
                      isActive
                        ? 'bg-[#191D2A] border-[#A78BFA]/70 ring-1 ring-[#A78BFA]/30 shadow-md'
                        : 'bg-[#151822] border-white/10 hover:border-white/25 shadow-xs'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative w-16 h-22 rounded-xl overflow-hidden shrink-0 border border-white/15 shadow-md">
                        <img
                          src={preset.coverImage}
                          alt={preset.name}
                          className="w-full h-full object-cover object-center"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-[10px] font-semibold text-[#C4B5FD] uppercase tracking-wider truncate">
                            {preset.badge}
                          </span>
                          <span className="text-xs font-bold text-amber-300 tabular-nums shrink-0">
                            ₹{preset.price.toLocaleString('en-IN')}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-white leading-tight">{preset.name}</h4>
                        <p className="text-[11px] text-slate-300 mt-0.5 line-clamp-1 italic">
                          {preset.subtitle}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">
                          {preset.culturalTheme} &middot; {preset.venueCity}
                        </p>

                        <div className="mt-2.5 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              if (onApplyPreset) {
                                onApplyPreset(preset);
                              }
                            }}
                            className={`flex-1 min-h-[38px] py-1.5 px-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition-all whitespace-nowrap ${
                              isActive
                                ? 'bg-[#7C3AED] text-white shadow-xs'
                                : 'bg-[#1F2433] hover:bg-[#282E42] text-slate-100 border border-white/10 active:scale-95'
                            }`}
                          >
                            {isActive ? (
                              <>
                                <CheckCircle2 className="w-3.5 h-3.5 text-[#E9D5FF]" />
                                <span>Active</span>
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-3.5 h-3.5 text-[#C4B5FD]" />
                                <span>Apply Theme</span>
                              </>
                            )}
                          </button>

                          {onOpenPayment && (
                            <button
                              type="button"
                              onClick={() => {
                                if (onApplyPreset) onApplyPreset(preset);
                                onOpenPayment(preset.price);
                              }}
                              className="min-h-[38px] py-1.5 px-3 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-neutral-950 flex items-center gap-1 shrink-0 whitespace-nowrap shadow-sm transition-all tabular-nums active:scale-95"
                              title={`Buy & Publish ${preset.name} (₹${preset.price})`}
                            >
                              <span>Buy ₹{preset.price.toLocaleString('en-IN')}</span>
                            </button>
                          )}

                          {onOpen3DStudio && (
                            <button
                              type="button"
                              onClick={() => {
                                if (onApplyPreset) onApplyPreset(preset);
                                onOpen3DStudio();
                              }}
                              className="min-h-[38px] py-1.5 px-2.5 rounded-xl bg-[#0F1219] hover:bg-[#191E2A] text-slate-200 text-xs font-semibold border border-white/10 whitespace-nowrap shrink-0"
                            >
                              3D
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Continue to Step 2 Button */}
            <button
              type="button"
              onClick={() => setActiveTab('couple')}
              className="w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-[#191D2A] hover:bg-[#222738] border border-white/12 text-slate-100 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <span>Next: Customize Couple Names</span>
              <ArrowRight className="w-4 h-4 text-[#C4B5FD]" />
            </button>
          </div>
        )}

        {/* STEP 2: COUPLE DETAILS */}
        {activeTab === 'couple' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="bg-[#151822] p-4 rounded-2xl border border-white/10 shadow-md space-y-3.5">
              <div className="flex items-center gap-2.5 border-b border-white/10 pb-2.5">
                <span className="p-1.5 rounded-lg bg-[#1F2433] text-[#C4B5FD] border border-white/10">
                  <Heart className="w-4 h-4 fill-[#A78BFA] text-[#C4B5FD]" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    <span className="text-lavender-highlight">Bride &amp; Groom</span> Profiles
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Names appear across the 3D scroll, mandap, and gold foil gatefold card
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1 flex items-center justify-between">
                  <span>Groom&apos;s Full Name *</span>
                  <span className="text-[10px] text-[#C4B5FD] font-medium">Royal Groom</span>
                </label>
                <input
                  id="groom-name-input"
                  type="text"
                  value={config.groomName}
                  onChange={(e) => handleTextChange('groomName', e.target.value)}
                  placeholder="e.g. Pulkit"
                  className="w-full bg-[#0D0F14] border border-white/15 focus:border-[#A78BFA] focus:ring-2 focus:ring-[#7C3AED]/25 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-white placeholder:text-slate-500 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1 flex items-center justify-between">
                  <span>Bride&apos;s Full Name *</span>
                  <span className="text-[10px] text-[#C4B5FD] font-medium">Royal Bride</span>
                </label>
                <input
                  id="bride-name-input"
                  type="text"
                  value={config.brideName}
                  onChange={(e) => handleTextChange('brideName', e.target.value)}
                  placeholder="e.g. Shreya"
                  className="w-full bg-[#0D0F14] border border-white/15 focus:border-[#A78BFA] focus:ring-2 focus:ring-[#7C3AED]/25 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-white placeholder:text-slate-500 outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-1">
                    Wedding Hashtag
                  </label>
                  <input
                    id="hashtag-input"
                    type="text"
                    value={config.hashtag}
                    onChange={(e) => handleTextChange('hashtag', e.target.value)}
                    placeholder="#PulkitWedsShreya"
                    className="w-full bg-[#0D0F14] border border-white/15 focus:border-[#A78BFA] rounded-xl px-3 py-2 text-xs font-medium text-slate-100 placeholder:text-slate-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-1">
                    Royal Monogram
                  </label>
                  <input
                    id="monogram-input"
                    type="text"
                    maxLength={3}
                    value={config.monogramText}
                    onChange={(e) => handleTextChange('monogramText', e.target.value.toUpperCase())}
                    placeholder="PS"
                    className="w-full bg-[#0D0F14] border border-white/15 focus:border-[#A78BFA] rounded-xl px-3 py-2 text-xs font-bold text-[#E9D5FF] uppercase text-center outline-none"
                  />
                </div>
              </div>

              <div className="pt-1">
                <label className="block text-xs font-semibold text-slate-200 mb-1">
                  Welcome Blessing / Message
                </label>
                <textarea
                  rows={2}
                  value={config.welcomeMessage}
                  onChange={(e) => handleTextChange('welcomeMessage', e.target.value)}
                  placeholder="With the celestial blessings of our elders..."
                  className="w-full bg-[#0D0F14] border border-white/15 focus:border-[#A78BFA] rounded-xl p-2.5 text-xs text-slate-100 placeholder:text-slate-500 outline-none resize-none leading-relaxed"
                />
              </div>
            </div>

            {/* Live Preview shown right at the end of the Couple section */}
            <CoupleEndPreview
              config={config}
              onOpenFullPreview={handleTriggerViewWebsite}
              onGoToPay={() => setActiveTab('pay')}
            />

            <button
              type="button"
              onClick={() => setActiveTab('venue')}
              className="w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-[#191D2A] hover:bg-[#222738] border border-white/12 text-slate-100 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <span>Next: Date &amp; Venue</span>
              <ArrowRight className="w-4 h-4 text-[#C4B5FD]" />
            </button>
          </div>
        )}

        {/* STEP 3: DATE & VENUE */}
        {activeTab === 'venue' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="bg-[#151822] p-4 rounded-2xl border border-white/10 shadow-md space-y-3.5">
              <div className="flex items-center gap-2.5 border-b border-white/10 pb-2.5">
                <span className="p-1.5 rounded-lg bg-[#1F2433] text-[#C4B5FD] border border-white/10">
                  <Calendar className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    <span className="text-lavender-highlight">Wedding Date</span> &amp; Venue
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Set the auspicious date, ceremony time, and celebration venue
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-1">
                    Wedding Date *
                  </label>
                  <input
                    id="wedding-date-picker"
                    type="date"
                    value={config.weddingDate}
                    onChange={(e) => handleDateChange(e.target.value)}
                    className="w-full bg-[#0D0F14] border border-white/15 focus:border-[#A78BFA] rounded-xl px-3 py-2 text-xs font-semibold text-white outline-none"
                  />
                  <p className="text-[10px] text-[#C4B5FD] font-medium mt-1">
                    {config.weddingDateFormatted}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-1">
                    Ceremony Time *
                  </label>
                  <input
                    id="wedding-time-input"
                    type="text"
                    value={config.weddingTime}
                    onChange={(e) => handleTextChange('weddingTime', e.target.value)}
                    placeholder="e.g. 07:00 PM onwards"
                    className="w-full bg-[#0D0F14] border border-white/15 focus:border-[#A78BFA] rounded-xl px-3 py-2 text-xs font-semibold text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1 flex items-center justify-between">
                  <span>Palace / Resort Venue *</span>
                  <span className="text-[10px] text-[#C4B5FD]">Location</span>
                </label>
                <div className="relative">
                  <input
                    id="venue-name-input"
                    type="text"
                    value={config.venueName}
                    onChange={(e) => handleTextChange('venueName', e.target.value)}
                    placeholder="e.g. The Oberoi Rajvilas Palace"
                    className="w-full bg-[#0D0F14] border border-white/15 focus:border-[#A78BFA] rounded-xl pl-3 pr-9 py-2 text-sm font-semibold text-white outline-none"
                  />
                  <MapPin className="w-4 h-4 text-[#C4B5FD] absolute right-3 top-2.5" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-1">
                    City, State *
                  </label>
                  <input
                    id="venue-city-input"
                    type="text"
                    value={config.venueCity}
                    onChange={(e) => handleTextChange('venueCity', e.target.value)}
                    placeholder="e.g. Jaipur, Rajasthan"
                    className="w-full bg-[#0D0F14] border border-white/15 focus:border-[#A78BFA] rounded-xl px-3 py-2 text-xs font-medium text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-1">
                    Google Maps Link
                  </label>
                  <input
                    id="google-maps-url-input"
                    type="url"
                    value={config.googleMapsUrl}
                    onChange={(e) => handleTextChange('googleMapsUrl', e.target.value)}
                    placeholder="https://maps.google.com/..."
                    className="w-full bg-[#0D0F14] border border-white/15 focus:border-[#A78BFA] rounded-xl px-3 py-2 text-xs text-slate-200 outline-none truncate"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1">
                  Street Address
                </label>
                <input
                  id="venue-address-input"
                  type="text"
                  value={config.venueAddress}
                  onChange={(e) => handleTextChange('venueAddress', e.target.value)}
                  placeholder="e.g. Goner Road, Jagatpura, Jaipur, Rajasthan 302031"
                  className="w-full bg-[#0D0F14] border border-white/15 focus:border-[#A78BFA] rounded-xl px-3 py-2 text-xs text-slate-200 outline-none"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveTab('ceremonies')}
              className="w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-[#191D2A] hover:bg-[#222738] border border-white/12 text-slate-100 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <span>Next: Ceremonies Itinerary</span>
              <ArrowRight className="w-4 h-4 text-[#C4B5FD]" />
            </button>
          </div>
        )}

        {/* STEP 4: CEREMONIES */}
        {activeTab === 'ceremonies' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>
                    <span className="text-lavender-highlight">Ceremonies</span> Itinerary
                  </span>
                  <span className="text-xs font-semibold text-slate-400 tabular-nums">
                    &middot; {config.events.length} Events
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  Haldi, Mehendi, Sangeeth, Vivaha &amp; Reception 3D sections
                </p>
              </div>

              <button
                id="add-ceremony-btn"
                onClick={handleAddEvent}
                type="button"
                className="flex items-center gap-1 px-3 py-2 min-h-[38px] rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-semibold shadow-sm transition-transform whitespace-nowrap shrink-0 active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Ceremony</span>
              </button>
            </div>

            <div className="space-y-3">
              {config.events.map((evt, idx) => (
                <div
                  key={evt.id}
                  className="bg-[#151822] p-3.5 rounded-2xl border border-white/10 shadow-sm space-y-2.5 relative"
                >
                  <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
                    <span className="text-[11px] font-bold text-[#DDD6FE] flex items-center gap-1.5 tabular-nums">
                      <Flame className="w-3.5 h-3.5 text-amber-400" />
                      Ceremony #{idx + 1}
                    </span>
                    <button
                      onClick={() => handleDeleteEvent(evt.id)}
                      type="button"
                      aria-label="Delete ceremony"
                      className="text-slate-400 hover:text-rose-400 p-1.5 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <input
                    type="text"
                    value={evt.title}
                    onChange={(e) => {
                      const updated = config.events.map((item) =>
                        item.id === evt.id ? { ...item, title: e.target.value } : item
                      );
                      onChange({ ...config, events: updated });
                    }}
                    placeholder="Ceremony Title"
                    className="w-full bg-[#0D0F14] border border-white/15 focus:border-[#A78BFA] rounded-xl px-3 py-2 text-xs font-bold text-white outline-none"
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={evt.date}
                      onChange={(e) => {
                        const updated = config.events.map((item) =>
                          item.id === evt.id ? { ...item, date: e.target.value } : item
                        );
                        onChange({ ...config, events: updated });
                      }}
                      placeholder="Date"
                      className="w-full bg-[#0D0F14] border border-white/15 focus:border-[#A78BFA] rounded-xl px-2.5 py-1.5 text-xs text-slate-200 outline-none"
                    />
                    <input
                      type="text"
                      value={evt.time}
                      onChange={(e) => {
                        const updated = config.events.map((item) =>
                          item.id === evt.id ? { ...item, time: e.target.value } : item
                        );
                        onChange({ ...config, events: updated });
                      }}
                      placeholder="Time"
                      className="w-full bg-[#0D0F14] border border-white/15 focus:border-[#A78BFA] rounded-xl px-2.5 py-1.5 text-xs text-slate-200 outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={evt.venue}
                      onChange={(e) => {
                        const updated = config.events.map((item) =>
                          item.id === evt.id ? { ...item, venue: e.target.value } : item
                        );
                        onChange({ ...config, events: updated });
                      }}
                      placeholder="Hall / Lawn"
                      className="w-full bg-[#0D0F14] border border-white/15 focus:border-[#A78BFA] rounded-xl px-2.5 py-1.5 text-xs text-slate-200 outline-none"
                    />
                    <input
                      type="text"
                      value={evt.dressCode || ''}
                      onChange={(e) => {
                        const updated = config.events.map((item) =>
                          item.id === evt.id ? { ...item, dressCode: e.target.value } : item
                        );
                        onChange({ ...config, events: updated });
                      }}
                      placeholder="Dress Code"
                      className="w-full bg-[#0D0F14] border border-white/15 focus:border-[#A78BFA] rounded-xl px-2.5 py-1.5 text-xs text-[#C4B5FD] font-medium outline-none"
                    />
                  </div>

                  {/* 3D Section Background Image & Blessings Config */}
                  <div className="pt-1.5 border-t border-white/10 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                        Ceremony 3D Background
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          const el = document.getElementById(`ceremony-section-${evt.id}`);
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="text-[10px] font-semibold text-[#C4B5FD] hover:text-white underline flex items-center gap-1"
                      >
                        <Sparkles className="w-2.5 h-2.5" />
                        <span>Preview 3D Section</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-5 gap-1 pt-0.5">
                      <button
                        type="button"
                        onClick={() => {
                          const updated = config.events.map((item) =>
                            item.id === evt.id ? { ...item, bgImageUrl: goldenHaldiImg, photoUrl: goldenHaldiImg } : item
                          );
                          onChange({ ...config, events: updated });
                        }}
                        className="p-1.5 rounded-lg border border-amber-500/40 bg-[#1A1508] hover:bg-[#28200A] text-[10px] font-bold text-amber-300 truncate"
                        title="Set Haldi Background"
                      >
                        Haldi
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = config.events.map((item) =>
                            item.id === evt.id ? { ...item, bgImageUrl: twilightMehendiImg, photoUrl: twilightMehendiImg } : item
                          );
                          onChange({ ...config, events: updated });
                        }}
                        className="p-1.5 rounded-lg border border-emerald-500/40 bg-[#0A1A10] hover:bg-[#0E2818] text-[10px] font-bold text-emerald-300 truncate"
                        title="Set Mehendi Background"
                      >
                        Mehendi
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = config.events.map((item) =>
                            item.id === evt.id ? { ...item, bgImageUrl: royalSangeetImg, photoUrl: royalSangeetImg } : item
                          );
                          onChange({ ...config, events: updated });
                        }}
                        className="p-1.5 rounded-lg border border-purple-500/40 bg-[#180A22] hover:bg-[#240E34] text-[10px] font-bold text-purple-300 truncate"
                        title="Set Sangeeth Background"
                      >
                        Sangeeth
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = config.events.map((item) =>
                            item.id === evt.id ? { ...item, bgImageUrl: royalSindoorImg, photoUrl: royalSindoorImg } : item
                          );
                          onChange({ ...config, events: updated });
                        }}
                        className="p-1.5 rounded-lg border border-rose-500/40 bg-[#200A10] hover:bg-[#300E18] text-[10px] font-bold text-rose-300 truncate"
                        title="Set Vivaha Background"
                      >
                        Vivaha
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const updated = config.events.map((item) =>
                            item.id === evt.id ? { ...item, bgImageUrl: lavenderReceptionImg, photoUrl: lavenderReceptionImg } : item
                          );
                          onChange({ ...config, events: updated });
                        }}
                        className="p-1.5 rounded-lg border border-slate-500/40 bg-[#1A1D28] hover:bg-[#262B3B] text-[10px] font-bold text-slate-200 truncate"
                        title="Set Reception Background"
                      >
                        Reception
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-1 text-[10px]">
                      <span className="text-slate-400 font-medium">Blessing Count:</span>
                      <div className="flex items-center gap-1.5">
                        <input
                          type="number"
                          value={evt.blessingCount ?? 150}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10) || 0;
                            const updated = config.events.map((item) =>
                              item.id === evt.id ? { ...item, blessingCount: val } : item
                            );
                            localStorage.setItem(`wedding_blessings_${evt.id}`, val.toString());
                            onChange({ ...config, events: updated });
                          }}
                          className="w-16 bg-[#0D0F14] border border-white/15 focus:border-[#A78BFA] rounded-lg px-2 py-0.5 text-right font-semibold tabular-nums text-xs text-white outline-none"
                        />
                        <span className="text-slate-400">blessings</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setActiveTab('photos')}
              className="w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-[#191D2A] hover:bg-[#222738] border border-white/12 text-slate-100 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <span>Next: Media Gallery</span>
              <ArrowRight className="w-4 h-4 text-[#C4B5FD]" />
            </button>
          </div>
        )}

        {/* STEP 5: MEDIA GALLERY */}
        {activeTab === 'photos' && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <div className="bg-[#151822] p-4 rounded-2xl text-white border border-white/10 shadow-sm space-y-3">
              <div>
                <h3 className="text-xs font-bold text-[#E9D5FF] uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#C4B5FD]" />
                  <span>Wedding Artwork &amp; Ceremony Photos</span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Swipe sideways or scroll to assign Hero, Scratch, or Gallery photos.
                </p>
              </div>

              {/* Horizontal sideways-scrollable photo picker on mobile + grid */}
              <div className="flex sm:grid sm:grid-cols-3 gap-2.5 pt-1 overflow-x-auto sm:overflow-y-auto sm:max-h-56 snap-x no-scrollbar pb-1">
                {THEME_PHOTO_LIBRARY.map((item) => (
                  <div
                    key={item.id}
                    className="snap-start w-[132px] sm:w-auto shrink-0 group relative rounded-xl overflow-hidden border border-white/12 bg-[#0D0F14] flex flex-col"
                  >
                    <div className="relative w-full h-20 sm:h-18 overflow-hidden">
                      <img
                        src={item.url}
                        alt={item.name}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-200"
                      />
                      <span className="absolute bottom-1 left-1 text-[8px] font-bold px-1.5 py-0.5 rounded bg-black/80 text-slate-200">
                        {item.category}
                      </span>
                    </div>
                    <p className="text-[10px] font-medium text-slate-200 p-1.5 truncate leading-tight">
                      {item.name}
                    </p>
                    <div className="p-1.5 pt-0 flex items-center gap-1">
                      <button
                        type="button"
                        title="Set as Hero Couple Portrait"
                        onClick={() => {
                          onChange({ ...config, heroCouplePhoto: item.url });
                          weddingAudio.playBlessingChime();
                        }}
                        className="flex-1 py-1 text-[9px] font-semibold bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded transition-colors text-center"
                      >
                        Hero
                      </button>
                      <button
                        type="button"
                        title="Set as Scratch Card Keepsake"
                        onClick={() => {
                          onChange({
                            ...config,
                            scratchRevealPhoto: item.url,
                            scratchRevealHeading: item.name.toUpperCase(),
                          });
                          weddingAudio.playBlessingChime();
                        }}
                        className="flex-1 py-1 text-[9px] font-semibold bg-amber-500 hover:bg-amber-400 text-neutral-950 rounded transition-colors text-center"
                      >
                        Scratch
                      </button>
                      <button
                        type="button"
                        title="Add to 3D Polaroid Gallery"
                        onClick={() => {
                          const newPhoto = {
                            id: 'g-' + Date.now(),
                            url: item.url,
                            caption: item.name,
                            date: item.category + ' Moments',
                          };
                          onChange({
                            ...config,
                            galleryPhotos: [...config.galleryPhotos, newPhoto],
                          });
                          weddingAudio.playBlessingChime();
                        }}
                        className="flex-1 py-1 text-[9px] font-bold bg-[#1F2433] hover:bg-[#2A3045] text-slate-100 rounded transition-colors text-center border border-white/10"
                      >
                        +Add
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero Couple Photo */}
            <div className="bg-[#151822] p-4 rounded-2xl border border-white/10 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-[#C4B5FD]" />
                    <span>Hero Couple Portrait</span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Featured on the royal scroll unfurl and welcoming section
                  </p>
                </div>
                <label className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-semibold cursor-pointer transition-colors shadow-xs whitespace-nowrap shrink-0">
                  <Upload className="w-3 h-3" />
                  <span>Replace</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload('heroCouplePhoto', e)}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="relative w-full h-40 rounded-xl overflow-hidden border border-white/15 shadow-md">
                <img
                  src={config.heroCouplePhoto}
                  alt="Couple Hero"
                  className="w-full h-full object-cover object-center"
                />
              </div>
            </div>

            {/* Scratch-to-Reveal Keepsake */}
            <div className="bg-[#151822] p-4 rounded-2xl border border-white/10 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Scratch Keepsake &amp; Gatefold Photo</span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Intimate ritual photo revealed under the ceremonial foil
                  </p>
                </div>
                <label className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold cursor-pointer transition-colors shadow-xs whitespace-nowrap shrink-0">
                  <Upload className="w-3 h-3" />
                  <span>Replace</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload('scratchRevealPhoto', e)}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="relative w-full h-40 rounded-xl overflow-hidden border border-white/15 shadow-md">
                <img
                  src={config.scratchRevealPhoto}
                  alt="Scratch Reveal Keepsake"
                  className="w-full h-full object-cover object-center"
                />
              </div>

              <div className="space-y-2 pt-1">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Keepsake Heading
                  </label>
                  <input
                    type="text"
                    value={config.scratchRevealHeading || ''}
                    onChange={(e) => onChange({ ...config, scratchRevealHeading: e.target.value })}
                    placeholder="e.g. 3D ROMANTIC VOW: PINNING THE BOUTONNIÈRE"
                    className="w-full bg-[#0D0F14] border border-white/15 focus:border-[#A78BFA] rounded-xl px-3 py-1.5 text-xs text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    Keepsake Note
                  </label>
                  <textarea
                    rows={2}
                    value={config.scratchRevealNote || ''}
                    onChange={(e) => onChange({ ...config, scratchRevealNote: e.target.value })}
                    placeholder="Romantic description revealed when guests scratch the foil"
                    className="w-full bg-[#0D0F14] border border-white/15 focus:border-[#A78BFA] rounded-xl px-3 py-1.5 text-xs text-white outline-none resize-none"
                  />
                </div>
              </div>
            </div>

            {/* 3D Gallery Photos */}
            <div className="bg-[#151822] p-4 rounded-2xl border border-white/10 shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-[#C4B5FD]" />
                    <span className="tabular-nums">
                      3D Polaroid Gallery ({config.galleryPhotos.length} Photos)
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Swipeable polaroid photos in the 3D gallery scene
                  </p>
                </div>
                <label className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-semibold cursor-pointer transition-colors shadow-xs whitespace-nowrap shrink-0">
                  <Plus className="w-3 h-3" />
                  <span>Add Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAddGalleryPhoto}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {config.galleryPhotos.map((photo) => (
                  <div
                    key={photo.id}
                    className="relative bg-[#0D0F14] rounded-xl p-1.5 border border-white/12 shadow-xs group overflow-hidden"
                  >
                    <img
                      src={photo.url}
                      alt={photo.caption}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <p className="text-[10px] font-medium text-slate-200 truncate mt-1 px-0.5">
                      {photo.caption}
                    </p>
                    <button
                      onClick={() => handleDeleteGalleryPhoto(photo.id)}
                      type="button"
                      aria-label="Delete photo"
                      className="absolute top-2 right-2 p-1 rounded-full bg-rose-600 text-white opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shadow-sm"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveTab('pay')}
              className="w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-md transition-colors"
            >
              <CreditCard className="w-4 h-4 text-[#E9D5FF]" />
              <span>Next: Pay &amp; Unlock Share Link</span>
              <ArrowRight className="w-4 h-4 text-[#E9D5FF]" />
            </button>
          </div>
        )}

        {/* STEP 6: INTERACTIVE PAY & UNLOCK SHARE LINK */}
        {activeTab === 'pay' && (
          <PayUnlockSection
            config={config}
            onPaymentSuccess={onPaymentSuccess}
            onJumpToStep={(step) => setActiveTab(step)}
            onPreviewLive={handleTriggerViewWebsite}
            stepCompletion={{
              presets: Boolean(config.theme?.presetId),
              couple: isCoupleFilled,
              venue: isVenueFilled,
              ceremonies: isEventsFilled,
              photos: isPhotosFilled,
            }}
          />
        )}
      </div>

      {/* Success Callout Banner */}
      {showSuccessBanner && (
        <div className="mx-4 mb-2 p-3.5 rounded-2xl bg-[#191D2A] border border-emerald-500/40 shadow-lg animate-in zoom-in-95 duration-200">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/40">
                <Check className="w-4 h-4 stroke-[3]" />
              </span>
              <div>
                <h4 className="text-xs font-bold text-white uppercase tracking-wide">
                  Wedding Website Generated
                </h4>
                <p className="text-[11px] text-slate-300 font-medium">
                  {config.groomName} &amp; {config.brideName}&apos;s 3D invitation is ready.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowSuccessBanner(false)}
              className="text-slate-400 hover:text-white text-xs p-1"
              aria-label="Dismiss banner"
            >
              ✕
            </button>
          </div>

          <div className="mt-2.5 flex items-center gap-2">
            <button
              type="button"
              onClick={handleTriggerViewWebsite}
              className="flex-1 min-h-[40px] py-2 px-3 rounded-xl bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-bold shadow-md flex items-center justify-center gap-1.5 transition-transform active:scale-95"
            >
              <Eye className="w-4 h-4 text-[#E9D5FF]" />
              <span>View Live Website</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#E9D5FF]" />
            </button>
          </div>
        </div>
      )}

      {/* Action Footer */}
      <div className="p-3.5 bg-[#11141C] border-t border-white/10 shrink-0 space-y-2">
        <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
          <span className="flex items-center gap-1 font-semibold text-slate-200">
            <Sparkles className="w-3.5 h-3.5 text-[#C4B5FD]" />
            <span className="tabular-nums">Status: {progressPercent}% Completed</span>
          </span>
          <span className="text-[#DDD6FE] font-medium truncate max-w-[160px]">
            {config.groomName} &amp; {config.brideName}
          </span>
        </div>

        {activeTab !== 'pay' && (
          <button
            type="button"
            onClick={() => setActiveTab('pay')}
            className="w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#9333EA] hover:from-[#6D28D9] hover:to-[#7E22CE] text-white font-bold text-xs tracking-wide shadow-lg flex items-center justify-center gap-2 transition-all active:scale-98 tabular-nums"
          >
            {config.isUnlocked ? (
              <>
                <Share2 className="w-4 h-4 text-[#E9D5FF] shrink-0" />
                <span className="truncate">Step 6: Share Official Link &amp; Receipt</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 text-[#E9D5FF] shrink-0" />
                <span className="truncate">
                  Step 6: Pay ₹{activePrice.toLocaleString('en-IN')} &amp; Unlock Share Link
                </span>
              </>
            )}
          </button>
        )}

        <div className="flex items-center gap-2">
          <button
            id="generate-wedding-website-btn"
            type="button"
            onClick={handleGenerateWebsite}
            className="flex-1 min-h-[44px] py-2.5 px-4 rounded-xl bg-[#1A1F2D] hover:bg-[#232A3C] text-white font-bold text-xs tracking-wide shadow-md flex items-center justify-center gap-2 transition-all active:scale-95 border border-white/12 whitespace-nowrap"
          >
            <Sparkles className="w-4 h-4 text-[#C4B5FD]" />
            <span>Generate 3D Website</span>
          </button>

          <button
            id="view-live-wedding-website-btn"
            type="button"
            onClick={handleTriggerViewWebsite}
            className={`min-h-[44px] py-2.5 px-4 rounded-xl font-bold text-xs shadow-md flex items-center justify-center gap-1.5 transition-all active:scale-95 border whitespace-nowrap shrink-0 ${
              isGenerated
                ? 'bg-[#7C3AED] hover:bg-[#6D28D9] text-white border-[#C4B5FD]/40'
                : 'bg-[#151822] hover:bg-[#1E2332] text-slate-200 border-white/12'
            }`}
            title="View Live 3D Wedding Website"
          >
            <Eye className="w-4 h-4 text-[#C4B5FD]" />
            <span>View</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
