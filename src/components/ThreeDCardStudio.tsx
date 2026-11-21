import React, { useState } from 'react';
import {
  Sparkles,
  Layers,
  Check,
  Sliders,
  X,
} from 'lucide-react';
import { WEDDING_PRESETS, WeddingPreset } from '../data/weddingPresets';
import { ThreeDWeddingCard } from './ThreeDWeddingCard';
import { weddingAudio } from '../utils/audioSynth';
import { PricingTierPrice } from '../types';

interface ThreeDCardStudioProps {
  onApplyPreset: (preset: WeddingPreset) => void;
  onClose?: () => void;
  onOpenPayment?: (price?: PricingTierPrice) => void;
  onOpenPricing?: () => void;
  isUnlocked?: boolean;
  currentCouple?: {
    groom: string;
    bride: string;
    date: string;
    venue: string;
  };
}

export const ThreeDCardStudio: React.FC<ThreeDCardStudioProps> = ({
  onApplyPreset,
  onClose,
  onOpenPayment,
  onOpenPricing,
  isUnlocked = false,
  currentCouple,
}) => {
  const [selectedPresetId, setSelectedPresetId] = useState<string>(WEDDING_PRESETS[0].id);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isCustomizing, setIsCustomizing] = useState(false);

  const [customNames, setCustomNames] = useState({
    groom: currentCouple?.groom || WEDDING_PRESETS[0].groomName,
    bride: currentCouple?.bride || WEDDING_PRESETS[0].brideName,
    date: currentCouple?.date || WEDDING_PRESETS[0].weddingDateFormatted,
    venue: currentCouple?.venue || WEDDING_PRESETS[0].venueName,
  });

  const selectedPreset =
    WEDDING_PRESETS.find((p) => p.id === selectedPresetId) || WEDDING_PRESETS[0];

  const filteredPresets =
    categoryFilter === 'all'
      ? WEDDING_PRESETS
      : WEDDING_PRESETS.filter((p) =>
          p.culturalTheme.toLowerCase().includes(categoryFilter.toLowerCase())
        );

  const handleSelectPreset = (preset: WeddingPreset) => {
    setSelectedPresetId(preset.id);
    weddingAudio.playCardFlipSound();
    if (!isCustomizing) {
      setCustomNames({
        groom: preset.groomName,
        bride: preset.brideName,
        date: preset.weddingDateFormatted,
        venue: preset.venueName,
      });
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col bg-[#0D0F14] text-slate-100 overflow-y-auto lg:overflow-hidden">
      {/* Top Header */}
      <header className="relative z-20 w-full px-3.5 sm:px-4 py-2.5 bg-[#131620]/95 backdrop-blur-md border-b border-white/10 flex flex-wrap items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-[#7C3AED] flex items-center justify-center shadow-md shrink-0">
            <Layers className="w-4 h-4 text-[#E9D5FF]" />
          </div>
          <div className="min-w-0">
            <h2 className="text-xs sm:text-sm font-semibold text-white tracking-wide flex items-center gap-1.5 truncate">
              <span>3D Wedding Cards &amp;</span>
              <span className="text-lavender-highlight">Themes</span>
            </h2>
            <p className="text-[10px] sm:text-[11px] text-slate-400 truncate hidden sm:block">
              Touch or drag card to tilt in 3D · Tap seal to open gatefold
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar">
          {onOpenPricing && (
            <button
              type="button"
              onClick={onOpenPricing}
              className="px-2.5 py-1.5 min-h-[36px] rounded-lg text-xs font-medium flex items-center gap-1.5 bg-[#1B1F2B] hover:bg-[#252A3A] text-slate-200 border border-white/10 transition-all whitespace-nowrap tabular-nums"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#C4B5FD]" />
              <span className="hidden md:inline">Pricing (₹1,499 – ₹2,999)</span>
              <span className="md:hidden">Plans</span>
            </button>
          )}

          {onOpenPayment && (
            <button
              type="button"
              onClick={() => onOpenPayment(selectedPreset.price)}
              className="px-3 py-1.5 min-h-[36px] rounded-lg text-xs font-semibold flex items-center gap-1.5 bg-[#7C3AED] hover:bg-[#6D28D9] text-white shadow-md transition-all active:scale-95 whitespace-nowrap tabular-nums"
            >
              <span>Buy ₹{selectedPreset.price.toLocaleString('en-IN')}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsCustomizing(!isCustomizing)}
            className={`px-2.5 sm:px-3 py-1.5 min-h-[36px] rounded-lg text-xs font-medium flex items-center gap-1.5 border transition-all whitespace-nowrap ${
              isCustomizing
                ? 'bg-[#7C3AED]/25 text-[#E9D5FF] border-[#A78BFA] font-semibold'
                : 'bg-[#1B1F2B] text-slate-200 hover:text-white border-white/10'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Customize Text</span>
            <span className="sm:hidden">Edit</span>
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg bg-[#1B1F2B] hover:bg-[#252A3A] text-slate-300 hover:text-white border border-white/10 transition-colors"
              title="Close Studio"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </header>

      {/* Main Content: Themes Selector FIRST (sideways strip on mobile, left column on desktop) + 3D Stage */}
      <div className="relative flex-1 w-full lg:overflow-hidden flex flex-col lg:flex-row">
        {/* Theme Selector */}
        <aside className="w-full lg:w-80 lg:h-full shrink-0 bg-[#12151E] border-b lg:border-b-0 lg:border-r border-white/10 flex flex-col lg:overflow-y-auto">
          {/* Category Filter Tabs (Sideways Scrollable) */}
          <div className="p-3 border-b border-white/10 bg-[#12151E] shrink-0">
            <p className="text-[11px] font-semibold text-slate-300 mb-2">
              1. Pick <span className="text-lavender-highlight">Theme</span> (Swipe sideways)
            </p>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar snap-x">
              {[
                { id: 'all', label: 'All 4 Themes' },
                { id: 'Rajasthan', label: 'Royal Palace' },
                { id: 'Pastel', label: 'Pastel Romance' },
                { id: 'Tamil', label: 'South Indian' },
                { id: 'Christian', label: 'Christian' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setCategoryFilter(tab.id)}
                  className={`snap-start px-3 py-1.5 rounded-md text-[11px] whitespace-nowrap font-medium transition-all shrink-0 ${
                    categoryFilter === tab.id
                      ? 'bg-[#7C3AED] text-white shadow-sm'
                      : 'bg-[#1B1F2B] text-slate-300 hover:bg-[#252A3A]'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Mobile Sideways Theme Cards Strip + Desktop Vertical List */}
          <div className="p-3 flex lg:flex-col gap-2.5 overflow-x-auto lg:overflow-x-visible lg:overflow-y-auto snap-x no-scrollbar flex-1">
            {filteredPresets.map((p) => {
              const isSelected = p.id === selectedPreset.id;
              return (
                <div
                  key={p.id}
                  onClick={() => handleSelectPreset(p)}
                  className={`snap-start w-[210px] sm:w-[230px] lg:w-full shrink-0 relative cursor-pointer rounded-xl p-2.5 transition-all flex items-center gap-2.5 border ${
                    isSelected
                      ? 'bg-[#1D2130] border-[#A78BFA] shadow-lg'
                      : 'bg-[#151822] border-white/10 hover:border-white/25 hover:bg-[#191D2A]'
                  }`}
                >
                  <div className="relative w-12 h-16 lg:w-14 lg:h-18 rounded-lg overflow-hidden shrink-0 border border-white/15 shadow-md">
                    <img
                      src={p.coverImage}
                      alt={p.name}
                      className="w-full h-full object-cover object-center"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 text-[10px] mb-0.5">
                      <span className="font-semibold text-[#C4B5FD] truncate">{p.badge}</span>
                      <span aria-hidden="true" className="text-slate-600">·</span>
                      <span className="font-bold text-amber-300 tabular-nums shrink-0">₹{p.price}</span>
                    </div>
                    <h4 className="font-classic text-xs font-bold text-white truncate">
                      {p.name}
                    </h4>
                    <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                      {p.groomName} &amp; {p.brideName}
                    </p>
                  </div>

                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-[#7C3AED] text-white flex items-center justify-center shrink-0 shadow-sm">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </aside>

        {/* Interactive 3D Card Stage */}
        <main className="flex-1 lg:h-full lg:overflow-y-auto flex flex-col items-center justify-start lg:justify-between p-4 sm:p-6 bg-gradient-to-br from-[#0D0F14] via-[#131722] to-[#0D0F14]">
          {/* Active Preset Title Banner */}
          <div className="w-full max-w-lg text-center mb-2">
            <div className="flex items-center justify-center gap-2 text-xs text-slate-300 mb-1">
              <span className="font-semibold text-[#C4B5FD]">{selectedPreset.badge}</span>
              <span aria-hidden="true">·</span>
              <span className="font-bold text-amber-300 tabular-nums">
                ₹{selectedPreset.price.toLocaleString('en-IN')} One-time
              </span>
            </div>
            <h3 className="font-classic text-xl sm:text-2xl font-bold text-white mt-0.5">
              {selectedPreset.name}
            </h3>
            <p className="text-xs text-slate-400 italic mt-0.5">
              {selectedPreset.subtitle}
            </p>

            {onOpenPayment && (
              <div className="mt-2.5 flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => onOpenPayment(selectedPreset.price)}
                  className="min-h-[40px] px-4 py-1.5 rounded-lg text-xs font-semibold bg-[#7C3AED] hover:bg-[#6D28D9] text-white shadow-md flex items-center gap-1.5 transition-all active:scale-95 tabular-nums"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#E9D5FF]" />
                  <span>Unlock &amp; Publish for ₹{selectedPreset.price.toLocaleString('en-IN')}</span>
                </button>
              </div>
            )}
          </div>

          {/* Inline Customizer Drawer */}
          {isCustomizing && (
            <div className="w-full max-w-md bg-[#151822] rounded-xl p-4 border border-white/15 shadow-2xl mb-4 animate-in slide-in-from-top-2 duration-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-white flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-[#C4B5FD]" />
                  Customize Names &amp; Details for 3D Card
                </span>
                <button
                  type="button"
                  onClick={() => setIsCustomizing(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block text-[11px] text-slate-300 mb-1">
                    Groom Name
                  </label>
                  <input
                    type="text"
                    value={customNames.groom}
                    onChange={(e) =>
                      setCustomNames({ ...customNames, groom: e.target.value })
                    }
                    className="w-full px-3 py-1.5 bg-[#0D0F14] border border-white/15 rounded-lg text-xs text-white focus:outline-none focus:border-[#A78BFA]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-300 mb-1">
                    Bride Name
                  </label>
                  <input
                    type="text"
                    value={customNames.bride}
                    onChange={(e) =>
                      setCustomNames({ ...customNames, bride: e.target.value })
                    }
                    className="w-full px-3 py-1.5 bg-[#0D0F14] border border-white/15 rounded-lg text-xs text-white focus:outline-none focus:border-[#A78BFA]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-300 mb-1">
                    Wedding Date
                  </label>
                  <input
                    type="text"
                    value={customNames.date}
                    onChange={(e) =>
                      setCustomNames({ ...customNames, date: e.target.value })
                    }
                    className="w-full px-3 py-1.5 bg-[#0D0F14] border border-white/15 rounded-lg text-xs text-white focus:outline-none focus:border-[#A78BFA]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-300 mb-1">
                    Venue Name
                  </label>
                  <input
                    type="text"
                    value={customNames.venue}
                    onChange={(e) =>
                      setCustomNames({ ...customNames, venue: e.target.value })
                    }
                    className="w-full px-3 py-1.5 bg-[#0D0F14] border border-white/15 rounded-lg text-xs text-white focus:outline-none focus:border-[#A78BFA]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Live Interactive 3D Card */}
          <div className="w-full flex justify-center py-2">
            <ThreeDWeddingCard
              preset={selectedPreset}
              onApplyPresetToWebsite={onApplyPreset}
              customNames={customNames}
              isInteractive={true}
              isUnlocked={isUnlocked}
              onRequireUnlock={onOpenPayment ? () => onOpenPayment(selectedPreset.price) : undefined}
            />
          </div>

          {/* Cultural Insight & Shloka */}
          <div className="w-full max-w-md bg-[#151822]/90 rounded-xl p-3 border border-white/10 text-center mt-3">
            <p className="text-[11px] font-sanskrit text-amber-200">
              {selectedPreset.shloka}
            </p>
            <p className="text-[10px] text-slate-400 font-editorial italic mt-1">
              &ldquo;{selectedPreset.shlokaMeaning}&rdquo;
            </p>
          </div>
        </main>
      </div>
    </div>
  );
};
