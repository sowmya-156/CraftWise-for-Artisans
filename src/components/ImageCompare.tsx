import React, { useState } from 'react';
import { Sparkles, Image as ImageIcon, Check, SlidersHorizontal } from 'lucide-react';

interface ImageCompareProps {
  originalImage: string;
  enhancedImage: string;
  selectedPreference: 'original' | 'enhanced';
  onSelectPreference: (pref: 'original' | 'enhanced') => void;
  appliedEnhancements?: string[];
  allowSelection?: boolean;
}

export const ImageCompare: React.FC<ImageCompareProps> = ({
  originalImage,
  enhancedImage,
  selectedPreference,
  onSelectPreference,
  appliedEnhancements = [
    'Exposure & lighting balance',
    'Weave texture sharpening',
    'Vibrancy & color correction',
    'Clean studio presentation'
  ],
  allowSelection = true
}) => {
  const [activeTab, setActiveTab] = useState<'side-by-side' | 'enhanced' | 'original'>('side-by-side');

  return (
    <div className="bg-white rounded-2xl border border-[#E5E1DA] shadow-xs p-4 sm:p-6 overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#C05D4D]" />
            <h3 className="font-bold text-[#4A3728] text-base sm:text-lg">
              Product Image Enhancement (Before & After)
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-[#7C6E62] mt-0.5">
            CraftWise enhances lighting, texture sharpness, and framing while preserving true artisan authenticity.
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center bg-[#FAF9F6] border border-[#E5E1DA] p-1 rounded-xl text-xs font-semibold self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('side-by-side')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'side-by-side' ? 'bg-white text-[#4A3728] shadow-xs' : 'text-[#7C6E62] hover:text-[#4A3728]'
            }`}
          >
            Side-by-Side
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('enhanced')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'enhanced' ? 'bg-[#C05D4D] text-white shadow-xs' : 'text-[#7C6E62] hover:text-[#4A3728]'
            }`}
          >
            Enhanced Only
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('original')}
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              activeTab === 'original' ? 'bg-white text-[#4A3728] shadow-xs' : 'text-[#7C6E62] hover:text-[#4A3728]'
            }`}
          >
            Original
          </button>
        </div>
      </div>

      {/* Main Image Stage */}
      {activeTab === 'side-by-side' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Original View */}
          <div
            onClick={() => allowSelection && onSelectPreference('original')}
            className={`relative rounded-xl border-2 p-3 transition-all cursor-pointer ${
              selectedPreference === 'original'
                ? 'border-[#4A3728] bg-[#FAF9F6] shadow-md ring-2 ring-[#4A3728]/10'
                : 'border-[#E5E1DA] hover:border-stone-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-[#E5E1DA] text-[#4A3728]">
                <ImageIcon className="w-3.5 h-3.5" /> Original Photo
              </span>
              {selectedPreference === 'original' && (
                <span className="text-xs font-semibold text-[#4A3728] flex items-center gap-1">
                  <Check className="w-4 h-4 text-[#4A3728]" /> Active Choice
                </span>
              )}
            </div>
            <div className="aspect-square bg-[#FAF9F6] rounded-lg overflow-hidden flex items-center justify-center">
              <img
                src={originalImage}
                alt="Original artisan photo"
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <p className="text-[11px] text-[#7C6E62] mt-2 text-center">
              Unedited photo captured by artisan camera/phone
            </p>
          </div>

          {/* Enhanced View */}
          <div
            onClick={() => allowSelection && onSelectPreference('enhanced')}
            className={`relative rounded-xl border-2 p-3 transition-all cursor-pointer ${
              selectedPreference === 'enhanced'
                ? 'border-[#C05D4D] bg-[#C05D4D0A] shadow-md ring-2 ring-[#C05D4D]/20'
                : 'border-[#E5E1DA] hover:border-[#C05D4D]/50'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider bg-[#C05D4D] text-white shadow-xs">
                <Sparkles className="w-3.5 h-3.5" /> AI Enhanced
              </span>
              {selectedPreference === 'enhanced' && (
                <span className="text-xs font-semibold text-[#C05D4D] flex items-center gap-1">
                  <Check className="w-4 h-4 text-[#C05D4D]" /> Active Choice
                </span>
              )}
            </div>
            <div className="aspect-square bg-gradient-to-b from-[#FAF9F6] to-[#C05D4D08] rounded-lg overflow-hidden flex items-center justify-center border border-[#C05D4D22]">
              <img
                src={enhancedImage || originalImage}
                alt="AI-enhanced artisan product"
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <p className="text-[11px] text-[#C05D4D] font-medium mt-2 text-center">
              Optimized for e-commerce catalogues & B2B buyers
            </p>
          </div>
        </div>
      ) : activeTab === 'enhanced' ? (
        <div className="max-w-md mx-auto p-3 rounded-xl border border-[#C05D4D33] bg-[#C05D4D08]">
          <div className="aspect-square rounded-lg overflow-hidden bg-white shadow-inner flex items-center justify-center">
            <img
              src={enhancedImage || originalImage}
              alt="Enhanced product view"
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      ) : (
        <div className="max-w-md mx-auto p-3 rounded-xl border border-[#E5E1DA] bg-[#FAF9F6]">
          <div className="aspect-square rounded-lg overflow-hidden bg-white shadow-inner flex items-center justify-center">
            <img
              src={originalImage}
              alt="Original product view"
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      )}

      {/* Applied Enhancements List */}
      <div className="mt-4 pt-3 border-t border-[#F0EDEA] flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-[#7C6E62] flex items-center gap-1">
          <SlidersHorizontal className="w-3 h-3 text-[#C05D4D]" /> Enhancements Applied:
        </span>
        {appliedEnhancements.map((enh, i) => (
          <span
            key={i}
            className="text-[11px] bg-[#FAF9F6] text-[#4A3728] font-medium px-2.5 py-0.5 rounded-full border border-[#E5E1DA]"
          >
            ✓ {enh}
          </span>
        ))}
      </div>

      {/* Action Buttons as explicitly requested in Section 11 */}
      {allowSelection && (
        <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            id="accept-enhanced-btn"
            onClick={() => onSelectPreference('enhanced')}
            className={`w-full sm:w-auto px-6 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${
              selectedPreference === 'enhanced'
                ? 'bg-[#C05D4D] text-white shadow-md ring-2 ring-[#C05D4D]/40'
                : 'bg-[#4A3728] text-white hover:bg-[#2D241E]'
            }`}
          >
            <Check className="w-4 h-4" />
            Accept Enhanced Image (Recommended)
          </button>
          <button
            type="button"
            id="keep-original-btn"
            onClick={() => onSelectPreference('original')}
            className={`w-full sm:w-auto px-5 py-3 rounded-xl text-sm font-semibold transition-all border ${
              selectedPreference === 'original'
                ? 'bg-[#4A3728] text-white border-[#4A3728] shadow-md'
                : 'bg-white text-[#4A3728] border-[#E5E1DA] hover:bg-[#FAF9F6]'
            }`}
          >
            Keep Original Photo
          </button>
        </div>
      )}
    </div>
  );
};
