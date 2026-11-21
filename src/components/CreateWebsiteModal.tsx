import React, { useState } from 'react';
import {
  Sparkles,
  Heart,
  Calendar,
  MapPin,
  Upload,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  X,
  Wand2,
} from 'lucide-react';
import { InvitationConfig } from '../types';
import { weddingAudio } from '../utils/audioSynth';
import { SkylineLogo } from './SkylineLogo';
import confetti from 'canvas-confetti';

interface CreateWebsiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onWebsiteCreated: (newConfig: InvitationConfig) => void;
  currentConfig: InvitationConfig;
}

export const CreateWebsiteModal: React.FC<CreateWebsiteModalProps> = ({
  isOpen,
  onClose,
  onWebsiteCreated,
  currentConfig,
}) => {
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);

  // Form State
  const [groomName, setGroomName] = useState(currentConfig.groomName);
  const [brideName, setBrideName] = useState(currentConfig.brideName);
  const [weddingDate, setWeddingDate] = useState(currentConfig.weddingDate);
  const [weddingTime, setWeddingTime] = useState(currentConfig.weddingTime);
  const [venueName, setVenueName] = useState(currentConfig.venueName);
  const [venueCity, setVenueCity] = useState(currentConfig.venueCity);
  const [venueAddress, setVenueAddress] = useState(currentConfig.venueAddress);
  const [heroPhoto, setHeroPhoto] = useState(currentConfig.heroCouplePhoto);
  const [scratchPhoto, setScratchPhoto] = useState(currentConfig.scratchRevealPhoto);

  if (!isOpen) return null;

  const handleHeroPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setHeroPhoto(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleScratchPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setScratchPhoto(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreate = () => {
    setIsGenerating(true);

    // Format date
    const d = new Date(weddingDate);
    const formattedDate = d.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });

    const gInitial = groomName.trim().charAt(0).toUpperCase() || 'G';
    const bInitial = brideName.trim().charAt(0).toUpperCase() || 'B';
    const monogram = `${gInitial}${bInitial}`;
    const hashtag = `#${groomName.replace(/\s+/g, '')}Weds${brideName.replace(/\s+/g, '')}`;

    const newConfig: InvitationConfig = {
      ...currentConfig,
      id: `wedding-${Date.now()}`,
      groomName: groomName.trim() || 'Groom',
      brideName: brideName.trim() || 'Bride',
      monogramText: monogram,
      weddingDate,
      weddingTime,
      weddingDateFormatted: formattedDate,
      venueName: venueName.trim() || 'Royal Palace',
      venueCity: venueCity.trim() || 'Udaipur, India',
      venueAddress: venueAddress.trim() || `${venueName}, ${venueCity}`,
      googleMapsUrl: `https://maps.google.com/?q=${encodeURIComponent(venueName + ' ' + venueCity)}`,
      hashtag,
      heroCouplePhoto: heroPhoto,
      scratchRevealPhoto: scratchPhoto,
      galleryPhotos: [
        {
          id: 'g-user-1',
          url: heroPhoto,
          caption: 'Two souls, one heart ✨',
          date: 'Special Moment',
        },
        ...currentConfig.galleryPhotos.slice(1),
      ],
    };

    setTimeout(() => {
      weddingAudio.playBlessingChime();
      confetti({
        particleCount: 70,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#D4AF37', '#E11D48', '#FFD700', '#FFFFFF', '#EA580C'],
      });
      setIsGenerating(false);
      onWebsiteCreated(newConfig);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl bg-[#12151E] text-slate-100 rounded-2xl shadow-2xl overflow-hidden border border-white/12 flex flex-col max-h-[90vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          aria-label="Close"
          className="absolute top-4 right-4 p-2 rounded-lg text-slate-400 hover:text-white bg-[#1C2130] hover:bg-[#262C3F] border border-white/10 transition-colors z-20"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-r from-[#171B26] via-[#1C2130] to-[#141720] text-white border-b border-white/10 text-center relative overflow-hidden">
          <div className="relative z-10 flex flex-col items-center">
            <SkylineLogo size="sm" variant="dark" className="mb-3" />
            <h2 className="text-xl font-bold text-white">
              Create Your <span className="text-lavender-highlight">3D Wedding Website</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-md">
              Enter couple details, date, venue, and photos to build your interactive 3D invitation.
            </p>

            {/* Stepper Dots */}
            <div className="flex items-center gap-2 mt-4">
              <span
                className={`w-7 h-7 rounded-full text-xs font-semibold flex items-center justify-center border transition-all ${
                  step === 1
                    ? 'bg-[#7C3AED] text-white border-[#C4B5FD] font-bold scale-105'
                    : step > 1
                    ? 'bg-emerald-600 text-white border-emerald-400'
                    : 'bg-[#1B1F2B] text-slate-400 border-white/10'
                }`}
              >
                1
              </span>
              <span className="w-6 h-0.5 bg-white/15" />
              <span
                className={`w-7 h-7 rounded-full text-xs font-semibold flex items-center justify-center border transition-all ${
                  step === 2
                    ? 'bg-[#7C3AED] text-white border-[#C4B5FD] font-bold scale-105'
                    : step > 2
                    ? 'bg-emerald-600 text-white border-emerald-400'
                    : 'bg-[#1B1F2B] text-slate-400 border-white/10'
                }`}
              >
                2
              </span>
              <span className="w-6 h-0.5 bg-white/15" />
              <span
                className={`w-7 h-7 rounded-full text-xs font-semibold flex items-center justify-center border transition-all ${
                  step === 3
                    ? 'bg-[#7C3AED] text-white border-[#C4B5FD] font-bold scale-105'
                    : 'bg-[#1B1F2B] text-slate-400 border-white/10'
                }`}
              >
                3
              </span>
            </div>
          </div>
        </div>

        {/* Modal Form Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* STEP 1: COUPLE DETAILS */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex items-center gap-2 text-white font-semibold text-xs border-b border-white/10 pb-2">
                <Heart className="w-4 h-4 text-[#C4B5FD]" />
                Step 1: Couple Details
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-200 block mb-1.5">
                    Groom&apos;s Name *
                  </label>
                  <input
                    id="modal-input-groom"
                    type="text"
                    required
                    value={groomName}
                    onChange={(e) => setGroomName(e.target.value)}
                    placeholder="e.g., Pulkit"
                    className="w-full bg-[#0D0F14] border border-white/15 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#A78BFA] transition-all"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-200 block mb-1.5">
                    Bride&apos;s Name *
                  </label>
                  <input
                    id="modal-input-bride"
                    type="text"
                    required
                    value={brideName}
                    onChange={(e) => setBrideName(e.target.value)}
                    placeholder="e.g., Shreya"
                    className="w-full bg-[#0D0F14] border border-white/15 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#A78BFA] transition-all"
                  />
                </div>
              </div>

              {/* Preview Monogram */}
              <div className="bg-[#161924] p-4 rounded-xl border border-white/10 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-white">
                    Monogram Emblem
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Displayed across the scroll arch &amp; 3D scenes
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full bg-[#7C3AED] border-2 border-[#C4B5FD] text-white font-title text-lg font-black flex items-center justify-center shadow-md">
                  {groomName.charAt(0).toUpperCase() || 'G'}
                  {brideName.charAt(0).toUpperCase() || 'B'}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: DATE & VENUE */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex items-center gap-2 text-white font-semibold text-xs border-b border-white/10 pb-2">
                <Calendar className="w-4 h-4 text-[#C4B5FD]" />
                Step 2: Date &amp; Venue
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-200 block mb-1.5">
                    Wedding Date *
                  </label>
                  <input
                    id="modal-input-date"
                    type="date"
                    required
                    value={weddingDate}
                    onChange={(e) => setWeddingDate(e.target.value)}
                    className="w-full bg-[#0D0F14] border border-white/15 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#A78BFA] transition-all"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-200 block mb-1.5">
                    Ceremony Time *
                  </label>
                  <input
                    id="modal-input-time"
                    type="time"
                    required
                    value={weddingTime}
                    onChange={(e) => setWeddingTime(e.target.value)}
                    className="w-full bg-[#0D0F14] border border-white/15 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#A78BFA] transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-slate-200 block mb-1.5">
                  Venue Name *
                </label>
                <input
                  id="modal-input-venue"
                  type="text"
                  required
                  value={venueName}
                  onChange={(e) => setVenueName(e.target.value)}
                  placeholder="e.g., The Oberoi Udaivilas"
                  className="w-full bg-[#0D0F14] border border-white/15 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#A78BFA] transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium text-slate-200 block mb-1.5">
                    City / Destination *
                  </label>
                  <input
                    id="modal-input-city"
                    type="text"
                    required
                    value={venueCity}
                    onChange={(e) => setVenueCity(e.target.value)}
                    placeholder="e.g., Udaipur, Rajasthan"
                    className="w-full bg-[#0D0F14] border border-white/15 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#A78BFA] transition-all"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-slate-200 block mb-1.5">
                    Address / Landmark
                  </label>
                  <input
                    id="modal-input-address"
                    type="text"
                    value={venueAddress}
                    onChange={(e) => setVenueAddress(e.target.value)}
                    placeholder="e.g., Haridas Ji Ki Magri, Mulla Talai"
                    className="w-full bg-[#0D0F14] border border-white/15 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-[#A78BFA] transition-all"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: UPLOAD PHOTOS */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="flex items-center gap-2 text-white font-semibold text-xs border-b border-white/10 pb-2">
                <Upload className="w-4 h-4 text-[#C4B5FD]" />
                Step 3: Couple Photos
              </div>

              {/* Main Photo */}
              <div className="bg-[#161924] p-4 rounded-xl border border-white/10 flex items-center gap-4">
                <img
                  src={heroPhoto}
                  alt="Couple Preview"
                  className="w-20 h-20 rounded-lg object-cover border border-white/15 shadow-md shrink-0"
                />
                <div className="flex-1">
                  <h4 className="text-xs font-semibold text-white mb-0.5">
                    Main Couple Portrait
                  </h4>
                  <p className="text-[11px] text-slate-400 mb-2">
                    Used for the blessing scene, gallery, and invitation card.
                  </p>
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-semibold cursor-pointer transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    Upload Couple Photo
                    <input
                      id="modal-upload-hero-input"
                      type="file"
                      accept="image/*"
                      onChange={handleHeroPhotoUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Scratch Reveal Secret Photo */}
              <div className="bg-[#161924] p-4 rounded-xl border border-white/10 flex items-center gap-4">
                <img
                  src={scratchPhoto}
                  alt="Secret Scratch Preview"
                  className="w-20 h-20 rounded-lg object-cover border border-white/15 shadow-md shrink-0"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h4 className="text-xs font-semibold text-white">
                      Scratch-to-Reveal Keepsake
                    </h4>
                    <span className="text-[11px] text-[#C4B5FD] font-medium">
                      Interactive
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 mb-2">
                    The surprise photo hidden under golden scratch foil.
                  </p>
                  <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1F2433] hover:bg-[#7C3AED] text-slate-100 text-xs font-semibold cursor-pointer border border-white/15 transition-colors">
                    <Upload className="w-3.5 h-3.5" />
                    Upload Reveal Photo
                    <input
                      id="modal-upload-scratch-input"
                      type="file"
                      accept="image/*"
                      onChange={handleScratchPhotoUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 bg-[#0D0F14] border-t border-white/10 flex items-center justify-between">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              type="button"
              className="flex items-center gap-1 px-4 py-2 rounded-lg text-slate-300 hover:text-white text-xs font-semibold transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              id="modal-next-step-btn"
              onClick={() => setStep(step + 1)}
              type="button"
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-semibold shadow-md transition-all"
            >
              Next Step
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              id="modal-create-website-btn"
              onClick={handleCreate}
              disabled={isGenerating}
              type="button"
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-semibold shadow-xl transition-all disabled:opacity-50"
            >
              <Wand2 className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
              {isGenerating ? 'Crafting 3D Website...' : 'Create 3D Website'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
