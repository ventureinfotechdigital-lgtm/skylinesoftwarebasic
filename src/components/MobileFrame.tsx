import React from 'react';

interface MobileFrameProps {
  children: React.ReactNode;
  coupleNames?: string;
}

export const MobileFrame: React.FC<MobileFrameProps> = ({
  children,
  coupleNames = 'pulkit-weds-shreya.wedding',
}) => {
  return (
    <div className="relative flex items-center justify-center p-2 sm:p-3 h-full max-h-full">
      {/* Smartphone Body Outer Chassis - scales smoothly to fit viewport height */}
      <div className="relative w-full max-w-[380px] h-full max-h-[800px] aspect-[380/790] bg-[#1c1c1e] rounded-[48px] p-3 shadow-[0_25px_70px_rgba(0,0,0,0.65),0_0_0_10px_#262830,0_0_0_12px_#14161c] border border-white/10 flex flex-col justify-between overflow-hidden">
        {/* Dynamic Island / Speaker Pill at Top */}
        <div className="absolute top-3.5 left-1/2 -translate-x-1/2 z-50 flex items-center justify-between px-3 w-28 h-6 bg-black rounded-full border border-neutral-800 shadow-sm pointer-events-none">
          <div className="w-2.5 h-2.5 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center">
            <div className="w-1 h-1 rounded-full bg-blue-900/60" />
          </div>
          <div className="w-2 h-2 rounded-full bg-neutral-900" />
        </div>

        {/* Top Status Bar */}
        <div className="relative z-40 w-full h-9 flex items-center justify-between px-6 text-[12px] font-semibold text-white/90 select-none pointer-events-none shrink-0">
          <span>14:02</span>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] tracking-tighter">5G</span>
            <div className="w-5 h-2.5 rounded-[3px] border border-white/80 p-0.5 flex items-center">
              <div className="h-full w-3.5 bg-white rounded-[1px]" />
            </div>
          </div>
        </div>

        {/* Screen Display Area */}
        <div className="relative flex-1 min-h-0 w-full rounded-[34px] overflow-hidden bg-black shadow-inner">
          {children}
        </div>

        {/* Bottom Browser Address Bar */}
        <div className="relative z-40 w-full h-11 flex items-center justify-between px-4 text-white/70 select-none pt-1 shrink-0">
          <div className="flex items-center gap-2 flex-1 max-w-[240px] mx-auto bg-neutral-800/80 backdrop-blur-md px-3 py-1.5 rounded-full border border-neutral-700 text-[11px] text-neutral-300 shadow-inner">
            <span className="text-neutral-400">🔒</span>
            <span className="truncate font-mono">{coupleNames}</span>
          </div>
          <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/35 rounded-full" />
        </div>
      </div>
    </div>
  );
};
