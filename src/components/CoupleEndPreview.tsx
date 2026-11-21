import React, { useState, useRef } from 'react';
import {
  Eye,
  Lock,
  ShieldCheck,
  Sparkles,
  Calendar,
  MapPin,
  Layers,
  ScrollText,
} from 'lucide-react';
import { InvitationConfig } from '../types';

interface CoupleEndPreviewProps {
  config: InvitationConfig;
  onOpenFullPreview: () => void;
  onGoToPay: () => void;
}

export const CoupleEndPreview: React.FC<CoupleEndPreviewProps> = ({
  config,
  onOpenFullPreview,
  onGoToPay,
}) => {
  const [previewStyle, setPreviewStyle] = useState<'scroll' | 'card'>('scroll');
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [isInteracting, setIsInteracting] = useState(false);
  const cardRef = useRef<HTMLDivElement | null>(null);

  const updateTilt = (clientX: number, clientY: number) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const xPct = (clientX - rect.left) / rect.width - 0.5;
    const yPct = (clientY - rect.top) / rect.height - 0.5;
    setTilt({
      x: Number((-yPct * 12).toFixed(2)),
      y: Number((xPct * 14).toFixed(2)),
    });
  };

  const resetTilt = () => {
    setIsInteracting(false);
    setTilt({ x: 0, y: 0 });
  };

  const primaryBg = config.theme?.primaryBg || '#1E0814';
  const accentGold = config.theme?.accentGold || '#D4AF37';

  return (
    <div className="bg-[#151822] p-4 rounded-2xl border border-white/10 shadow-md space-y-3">
      {/* Header + Mini Interactive View Switch */}
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-[#C4B5FD]" />
            <span>
              Couple <span className="text-lavender-highlight">Live Preview</span>
            </span>
          </h4>
          <p className="text-[11px] text-slate-400 truncate mt-0.5">
            Tilt card to test 3D depth · Share link stays locked until Pay
          </p>
        </div>

        <div className="flex items-center bg-[#090B10] p-0.5 rounded-lg border border-white/10 shrink-0">
          <button
            type="button"
            onClick={() => setPreviewStyle('scroll')}
            className={`px-2 py-1 rounded-md text-[10px] font-semibold flex items-center gap-1 transition-all whitespace-nowrap ${
              previewStyle === 'scroll'
                ? 'bg-[#7C3AED] text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ScrollText className="w-3 h-3" />
            <span>Scroll</span>
          </button>
          <button
            type="button"
            onClick={() => setPreviewStyle('card')}
            className={`px-2 py-1 rounded-md text-[10px] font-semibold flex items-center gap-1 transition-all whitespace-nowrap ${
              previewStyle === 'card'
                ? 'bg-[#7C3AED] text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-3 h-3" />
            <span>3D Card</span>
          </button>
        </div>
      </div>

      {/* Interactive 3D Preview Stage */}
      <div className="perspective-[900px]">
        <div
          ref={cardRef}
          onPointerDown={(e) => {
            setIsInteracting(true);
            updateTilt(e.clientX, e.clientY);
          }}
          onPointerMove={(e) => {
            if (e.pointerType === 'mouse' || isInteracting) {
              updateTilt(e.clientX, e.clientY);
            }
          }}
          onPointerUp={resetTilt}
          onPointerLeave={resetTilt}
          onPointerCancel={resetTilt}
          className="relative rounded-xl overflow-hidden border touch-pan-y select-none shadow-xl"
          style={{
            backgroundColor: primaryBg,
            borderColor: `${accentGold}55`,
            transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
            transition: isInteracting
              ? 'transform 60ms linear'
              : 'transform 350ms cubic-bezier(0.16, 1, 0.3, 1)',
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Background Photo + Scrim */}
          <div className="relative h-48 w-full overflow-hidden">
            <img
              src={
                previewStyle === 'card'
                  ? config.scratchRevealPhoto || config.heroCouplePhoto
                  : config.heroCouplePhoto
              }
              alt={`${config.groomName} and ${config.brideName}`}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center transition-transform duration-500"
              style={{
                transform: isInteracting ? 'scale(1.04)' : 'scale(1)',
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                background:
                  previewStyle === 'card'
                    ? 'linear-gradient(135deg, rgba(10,10,16,0.78) 0%, rgba(10,10,16,0.45) 50%, rgba(10,10,16,0.88) 100%)'
                    : 'linear-gradient(to top, rgba(9,9,14,0.92) 8%, rgba(9,9,14,0.35) 55%, rgba(9,9,14,0.65) 100%)',
              }}
            />

            {/* Top Row: Monogram & Theme Name */}
            <div className="absolute top-3 inset-x-3 flex items-center justify-between gap-2">
              <div
                className="w-9 h-9 rounded-full bg-black/70 backdrop-blur-sm border flex items-center justify-center font-title text-xs font-bold text-amber-200 shadow"
                style={{ borderColor: accentGold }}
              >
                {config.monogramText}
              </div>

              <span className="text-[10px] font-medium text-amber-200/90 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-md border border-white/10 truncate max-w-[65%]">
                {config.theme?.culturalTheme || 'Royal 3D Invitation'}
              </span>
            </div>

            {/* Bottom Overlay: Live Couple Text */}
            <div className="absolute bottom-3 inset-x-3 text-center">
              <p className="text-[10px] font-cinzel tracking-[0.2em] text-amber-300/90 uppercase">
                {previewStyle === 'card' ? '3D Gatefold Card Preview' : 'Royal Wedding Invitation'}
              </p>
              <h5 className="font-classic text-xl font-bold text-white mt-0.5 drop-shadow">
                {config.groomName || 'Groom'} &amp; {config.brideName || 'Bride'}
              </h5>
              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-200 mt-1">
                <span className="inline-flex items-center gap-1 truncate">
                  <Calendar className="w-3 h-3 text-amber-300 shrink-0" />
                  {config.weddingDateFormatted}
                </span>
                <span aria-hidden="true" className="text-slate-400">·</span>
                <span className="inline-flex items-center gap-1 truncate max-w-[140px]">
                  <MapPin className="w-3 h-3 text-amber-300 shrink-0" />
                  {config.venueCity}
                </span>
              </div>
              {config.hashtag && (
                <p className="text-[10px] font-mono text-[#DDD6FE] mt-1 truncate">
                  {config.hashtag}
                </p>
              )}
            </div>
          </div>

          {/* Bottom Share-Lock Notice Strip */}
          <div className="px-3 py-2 bg-[#0D0F14]/95 border-t border-white/10 flex items-center justify-between gap-2 text-[11px]">
            {config.isUnlocked ? (
              <span className="inline-flex items-center gap-1.5 text-emerald-400 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                <span>Licensed · Link Ready to Share</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-amber-300 font-medium">
                <Lock className="w-3.5 h-3.5 shrink-0" />
                <span>Preview Only · Share Link Locked</span>
              </span>
            )}

            <span className="text-[10px] text-slate-400 shrink-0">
              {config.isUnlocked ? 'Unlocked' : 'Pay in Step 6'}
            </span>
          </div>
        </div>
      </div>

      {/* Preview Actions */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onOpenFullPreview}
          className="flex-1 min-h-[44px] py-2 px-3 rounded-xl bg-[#1F2433] hover:bg-[#282E42] border border-white/12 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap"
        >
          <Eye className="w-3.5 h-3.5 text-[#C4B5FD]" />
          <span>Full Live Preview</span>
        </button>

        {!config.isUnlocked && (
          <button
            type="button"
            onClick={onGoToPay}
            className="min-h-[44px] py-2 px-3 rounded-xl bg-[#7C3AED]/20 hover:bg-[#7C3AED]/35 border border-[#A78BFA]/40 text-[#E9D5FF] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#C4B5FD]" />
            <span>Unlock Share</span>
          </button>
        )}
      </div>
    </div>
  );
};
