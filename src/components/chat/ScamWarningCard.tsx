import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Lock,
  Volume2,
  VolumeX,
  XCircle,
  Flag,
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { ScamAnalysis } from '../../types';
import { playTextToSpeech, stopTextToSpeech } from '../../utils/textToSpeech';

interface ScamWarningCardProps {
  analysis: ScamAnalysis;
  viewerLanguage: string;
  isCurrentUser: boolean;
  onDismiss?: () => void;
  onReport?: () => void;
  onBlock?: () => void;
}

export const ScamWarningCard: React.FC<ScamWarningCardProps> = ({
  analysis,
  viewerLanguage,
  isCurrentUser,
  onDismiss,
  onReport,
  onBlock
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [expanded, setExpanded] = useState(!analysis.isDismissed);

  // Pick localized strings with graceful fallbacks
  const localized = analysis.localized?.[viewerLanguage] ||
    analysis.localized?.['en'] || {
      warningTitle: analysis.riskLevel === 'high_risk' ? 'High Risk Scam Detected' : 'Possible Scam',
      warningText: 'This message may be unsafe. Never share OTPs, PINs, or bank details. Do not make payments outside CraftWise.',
      artisanExplanation: 'This buyer message contains patterns often associated with online payment scams.',
      recommendedAdvice: 'Never share any OTP or bank PIN. CraftWise never asks for fees to receive payments.',
      riskBadge: analysis.riskLevel === 'high_risk' ? 'High Risk' : 'Suspicious'
    };

  const isSafe = analysis.riskLevel === 'safe';
  const isHighRisk = analysis.riskLevel === 'high_risk';
  const isSuspicious = analysis.riskLevel === 'suspicious';

  // If message is safe, render a subtle trust verification indicator
  if (isSafe) {
    return (
      <div className="mt-1.5 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-semibold">
        <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
        <span>{localized.riskBadge || 'Verified Safe'}</span>
      </div>
    );
  }

  // Audio voice explanation
  const handlePlayVoice = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlaying) {
      stopTextToSpeech();
      setIsPlaying(false);
      return;
    }

    const speechScript = `${localized.warningTitle}. ${localized.warningText}. ${localized.artisanExplanation}. ${localized.recommendedAdvice}`;
    setIsPlaying(true);
    playTextToSpeech(speechScript, viewerLanguage, {
      onStart: () => setIsPlaying(true),
      onEnd: () => setIsPlaying(false),
      onError: () => setIsPlaying(false)
    });
  };

  // If dismissed, show a collapsed state
  if (analysis.isDismissed && !expanded) {
    return (
      <div className="mt-2 p-2 rounded-xl bg-stone-100 border border-stone-200 text-[11px] text-stone-600 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-stone-500 shrink-0" />
          <span>Safety warning dismissed by you</span>
        </div>
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="text-stone-700 font-semibold underline text-[10px] hover:text-stone-900 cursor-pointer"
        >
          View Warning Details
        </button>
      </div>
    );
  }

  return (
    <div
      className={`mt-2.5 rounded-xl border p-3 shadow-xs transition-all ${
        isHighRisk
          ? 'bg-red-50/90 border-red-300 text-red-950'
          : 'bg-amber-50/90 border-amber-300 text-amber-950'
      }`}
    >
      {/* Header with Risk Badge, Title, and Audio Listen button */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          {isHighRisk ? (
            <div className="p-1 rounded-lg bg-red-100 text-red-700">
              <ShieldAlert className="w-4 h-4 animate-bounce" />
            </div>
          ) : (
            <div className="p-1 rounded-lg bg-amber-100 text-amber-800">
              <AlertTriangle className="w-4 h-4" />
            </div>
          )}

          <div>
            <div className="flex items-center gap-1.5">
              <span
                className={`px-1.5 py-0.2 rounded-md text-[10px] font-black uppercase tracking-wider ${
                  isHighRisk
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'bg-amber-600 text-white shadow-xs'
                }`}
              >
                {localized.riskBadge}
              </span>
              <span className="font-bold text-xs sm:text-sm text-stone-900">
                {localized.warningTitle}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {/* Audio narration button in artisan's native language */}
          <button
            type="button"
            onClick={handlePlayVoice}
            className={`p-1 rounded-lg transition-colors cursor-pointer ${
              isHighRisk
                ? 'hover:bg-red-200/60 text-red-700'
                : 'hover:bg-amber-200/60 text-amber-800'
            }`}
            title="Listen to safety warning in your language"
          >
            {isPlaying ? (
              <VolumeX className="w-4 h-4 text-red-600 animate-pulse" />
            ) : (
              <Volume2 className="w-4 h-4" />
            )}
          </button>

          {analysis.isDismissed && (
            <button
              type="button"
              onClick={() => setExpanded(false)}
              className="p-1 text-stone-500 hover:text-stone-800 cursor-pointer"
              title="Minimize"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Warning Text */}
      <p className="mt-2 text-xs font-semibold leading-snug text-stone-900">
        "{localized.warningText}"
      </p>

      {/* Artisan Friendly Explanation */}
      <div
        className={`mt-2 p-2 rounded-lg text-xs leading-relaxed ${
          isHighRisk
            ? 'bg-white/80 border border-red-200 text-red-900'
            : 'bg-white/80 border border-amber-200 text-amber-900'
        }`}
      >
        <span className="font-bold block mb-0.5 text-[11px] uppercase tracking-wide opacity-90">
          Why this was flagged:
        </span>
        <p className="font-medium text-stone-800">{localized.artisanExplanation}</p>
        {localized.recommendedAdvice && (
          <p className="mt-1.5 text-[11px] font-semibold text-stone-700 pt-1 border-t border-stone-200/60">
            💡 <span className="underline">Tip:</span> {localized.recommendedAdvice}
          </p>
        )}
      </div>

      {/* Flagged Phrases (if any) */}
      {analysis.flaggedPhrases && analysis.flaggedPhrases.length > 0 && (
        <div className="mt-2 flex flex-wrap items-center gap-1 text-[10px]">
          <span className="font-bold text-stone-700">Flagged words:</span>
          {analysis.flaggedPhrases.map((phrase, idx) => (
            <span
              key={idx}
              className="px-1.5 py-0.2 rounded bg-red-100 text-red-800 border border-red-200 font-mono font-medium"
            >
              "{phrase}"
            </span>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      {!isCurrentUser && (
        <div className="mt-3 pt-2.5 border-t border-stone-200/70 flex flex-wrap items-center justify-between gap-2">
          {/* Left: Dismiss Warning */}
          {onDismiss && !analysis.isDismissed && (
            <button
              type="button"
              onClick={onDismiss}
              className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-stone-600 hover:text-stone-900 hover:bg-stone-200/60 transition-colors cursor-pointer"
              title="I understand the risk and believe this message is safe"
            >
              Dismiss Warning
            </button>
          )}

          {/* Right: Safety actions */}
          <div className="flex items-center gap-1.5 ml-auto">
            {onReport && (
              <button
                type="button"
                onClick={onReport}
                className="px-2.5 py-1 rounded-lg bg-white border border-red-300 hover:bg-red-50 text-red-700 text-[11px] font-bold shadow-2xs transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Flag className="w-3 h-3" />
                <span>Report Buyer</span>
              </button>
            )}

            {onBlock && (
              <button
                type="button"
                onClick={onBlock}
                className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-700 active:bg-red-800 text-white text-[11px] font-bold shadow-2xs transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Lock className="w-3 h-3" />
                <span>Block Buyer</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
