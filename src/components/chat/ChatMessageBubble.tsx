import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  Globe2,
  Tag,
  Languages,
  Volume2,
  VolumeX,
  RefreshCw,
  CheckCheck
} from 'lucide-react';
import { ChatMessage } from '../../types';
import { CHAT_LANGUAGES } from './ChatLanguages';
import { api } from '../../api';
import { playTextToSpeech, stopTextToSpeech } from '../../utils/textToSpeech';
import { ScamWarningCard } from './ScamWarningCard';

interface ChatMessageBubbleProps {
  message: ChatMessage;
  isCurrentUser: boolean;
  viewerRole: 'buyer' | 'artisan';
  viewerLanguage: string;
  recipientLanguage?: string;
  onCounterOffer?: (price: number, quantity?: number) => void;
  onAcceptOffer?: (price: number, quantity?: number) => void;
  onUpdateMessageTranslations?: (messageId: string, translations: Record<string, string>) => void;
  onDismissScamWarning?: (messageId: string) => void;
  onReportBuyer?: (messageId: string, reason?: string) => void;
  onBlockBuyer?: () => void;
}

export const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({
  message,
  isCurrentUser,
  viewerRole,
  viewerLanguage,
  recipientLanguage,
  onCounterOffer,
  onAcceptOffer,
  onUpdateMessageTranslations,
  onDismissScamWarning,
  onReportBuyer,
  onBlockBuyer
}) => {
  const [showOriginal, setShowOriginal] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [localTranslation, setLocalTranslation] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const isDifferentLang = message.originalLanguage !== viewerLanguage;
  const existingTranslation = message.translations?.[viewerLanguage];

  // Detect if existing translation is corrupted with bracketed fallback like [తెలుగు]
  const isCorrupted = typeof existingTranslation === 'string' && /\[.*\]/.test(existingTranslation);

  // Check if we already have a clean translation
  const hasCleanTranslation = Boolean(
    existingTranslation &&
    !isCorrupted &&
    existingTranslation.trim().length > 0
  );

  // Automatically fetch on-demand translation if missing or corrupted
  useEffect(() => {
    let isMounted = true;

    if (!isDifferentLang) {
      setLocalTranslation(null);
      setTranslating(false);
      return;
    }

    if (hasCleanTranslation) {
      setLocalTranslation(existingTranslation!);
      setTranslating(false);
      return;
    }

    // Need to fetch translation on-demand from server
    setTranslating(true);
    api.translateText(message.originalText, message.originalLanguage, viewerLanguage)
      .then((res) => {
        if (!isMounted) return;
        if (res?.translatedText) {
          setLocalTranslation(res.translatedText);
          onUpdateMessageTranslations?.(message.id, { [viewerLanguage]: res.translatedText });
          // Save to server database quietly
          api.saveMessageTranslations(message.id, { [viewerLanguage]: res.translatedText }).catch(() => {});
        }
      })
      .catch((err) => {
        console.warn('On-demand chat translation notice:', err?.message || err);
      })
      .finally(() => {
        if (isMounted) setTranslating(false);
      });

    return () => {
      isMounted = false;
    };
  }, [message.id, message.originalText, message.originalLanguage, viewerLanguage, existingTranslation, isDifferentLang, hasCleanTranslation, onUpdateMessageTranslations]);

  // Determine active display text
  const activeTranslation = localTranslation || (hasCleanTranslation ? existingTranslation : null);
  const displayText = isDifferentLang && !showOriginal && activeTranslation
    ? activeTranslation
    : message.originalText;

  const originalLangInfo = CHAT_LANGUAGES[message.originalLanguage] || {
    name: message.originalLanguage,
    native: message.originalLanguage,
    speechLang: 'en-IN'
  };

  const viewerLangInfo = CHAT_LANGUAGES[viewerLanguage] || {
    name: viewerLanguage,
    native: viewerLanguage,
    speechLang: 'en-IN'
  };

  const otherRoleLang = recipientLanguage || (viewerRole === 'artisan' ? 'en' : 'te');
  const otherLangInfo = CHAT_LANGUAGES[otherRoleLang] || {
    name: otherRoleLang,
    native: otherRoleLang,
    speechLang: 'en-IN'
  };
  const deliveryTranslation = message.translations?.[otherRoleLang];

  const formatTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  // Text to Speech playback
  const handlePlayAudio = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (isPlayingAudio) {
      stopTextToSpeech();
      setIsPlayingAudio(false);
      return;
    }

    const textToSpeak = displayText;
    const targetLang = (isDifferentLang && !showOriginal && activeTranslation)
      ? viewerLanguage
      : message.originalLanguage;

    setIsPlayingAudio(true);
    playTextToSpeech(textToSpeak, targetLang, {
      onStart: () => setIsPlayingAudio(true),
      onEnd: () => setIsPlayingAudio(false),
      onError: () => setIsPlayingAudio(false)
    });
  };

  const isArtisanMessage = message.senderRole === 'artisan';

  return (
    <div
      className={`flex flex-col my-2.5 ${
        isCurrentUser ? 'items-end' : 'items-start'
      }`}
    >
      {/* Sender metadata banner */}
      <div className="flex items-center gap-1.5 mb-1 px-1 text-[11px] text-[#7C6E62]">
        <span className="font-semibold text-[#4A3728]">
          {isCurrentUser ? 'You' : message.senderName}
        </span>
        <span
          className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider ${
            isArtisanMessage
              ? 'bg-amber-100 text-amber-900 border border-amber-200'
              : 'bg-stone-200 text-stone-800'
          }`}
        >
          {isArtisanMessage ? 'Artisan / Seller' : 'Buyer'}
        </span>
        <span>•</span>
        <span>{formatTime(message.createdAt)}</span>
      </div>

      {/* Main bubble box */}
      <div
        className={`max-w-[85%] sm:max-w-[78%] rounded-2xl p-3.5 shadow-xs transition-all ${
          isCurrentUser
            ? 'bg-[#C05D4D] text-white rounded-tr-xs'
            : 'bg-white border border-[#E5E1DA] text-[#2D241E] rounded-tl-xs'
        }`}
      >
        {/* Voice Input Tag if message was spoken */}
        {message.isVoiceInput && (
          <div
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold mb-2 ${
              isCurrentUser
                ? 'bg-white/20 text-white'
                : 'bg-red-50 text-[#C05D4D] border border-red-100'
            }`}
          >
            <Mic className="w-3 h-3 animate-pulse" />
            <span>Voice Input ({originalLangInfo.native})</span>
          </div>
        )}

        {/* Bargain / Price Offer Card if proposedPrice exists */}
        {message.proposedPrice !== undefined && message.proposedPrice > 0 && (
          <div
            className={`mb-2.5 p-2.5 rounded-xl border ${
              isCurrentUser
                ? 'bg-black/15 border-white/25 text-white'
                : 'bg-amber-50/80 border-amber-200 text-amber-950'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-amber-400 shrink-0" />
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider opacity-80 block">
                    Price Bargain Offer
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-base font-black">
                      ₹{message.proposedPrice.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs opacity-75">/ unit</span>
                    {message.proposedQuantity && (
                      <span className="text-[11px] font-bold ml-1 px-1.5 py-0.2 rounded bg-amber-200/40 text-amber-900">
                        Qty: {message.proposedQuantity} pcs
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action buttons if received by the other party */}
              {!isCurrentUser && (
                <div className="flex items-center gap-1">
                  {onAcceptOffer && (
                    <button
                      type="button"
                      onClick={() => onAcceptOffer(message.proposedPrice!, message.proposedQuantity)}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold shadow-xs transition-colors cursor-pointer"
                    >
                      Accept
                    </button>
                  )}
                  {onCounterOffer && (
                    <button
                      type="button"
                      onClick={() => onCounterOffer(message.proposedPrice!, message.proposedQuantity)}
                      className="px-2.5 py-1 rounded-lg bg-[#4A3728] hover:bg-[#382a1e] text-white text-[11px] font-bold shadow-xs transition-colors cursor-pointer"
                    >
                      Counter
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Message Content & Translating state */}
        {translating ? (
          <div className="flex items-center gap-2 py-1 text-sm font-medium animate-pulse opacity-90">
            <RefreshCw className="w-3.5 h-3.5 animate-spin shrink-0" />
            <span>Translating to {viewerLangInfo.native}...</span>
          </div>
        ) : (
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm sm:text-base leading-relaxed whitespace-pre-wrap font-sans break-words flex-1">
              {displayText}
            </p>
            {/* Audio Voice Listen Button */}
            <button
              type="button"
              onClick={handlePlayAudio}
              className={`p-1 rounded-md transition-colors shrink-0 ${
                isCurrentUser
                  ? 'hover:bg-white/20 text-white/80 hover:text-white'
                  : 'hover:bg-stone-100 text-[#7C6E62] hover:text-[#C05D4D]'
              }`}
              title={isPlayingAudio ? 'Stop speech audio' : `Listen in ${viewerLangInfo.native}`}
            >
              {isPlayingAudio ? (
                <VolumeX className="w-3.5 h-3.5 text-red-300 animate-pulse" />
              ) : (
                <Volume2 className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        )}

        {/* Delivery translation preview for current user's outgoing message */}
        {isCurrentUser && deliveryTranslation && otherRoleLang !== message.originalLanguage && (
          <div className="mt-2 pt-1.5 border-t border-white/20 text-[11px] text-white/90 flex items-center justify-between gap-2">
            <span className="truncate">
              Delivered in <strong className="font-semibold">{otherLangInfo.native}</strong>: "{deliveryTranslation}"
            </span>
            <CheckCheck className="w-3.5 h-3.5 text-white/80 shrink-0" />
          </div>
        )}

        {/* Translation metadata & View Original / View Translated Toggle */}
        {isDifferentLang && (
          <div
            className={`mt-2.5 pt-2 border-t flex flex-wrap items-center justify-between gap-2 text-[11px] ${
              isCurrentUser
                ? 'border-white/20 text-white/90'
                : 'border-stone-200 text-stone-600'
            }`}
          >
            <div className="flex items-center gap-1">
              <Globe2 className="w-3 h-3 shrink-0" />
              <span>
                {showOriginal ? (
                  <span>
                    Original in <strong className="font-semibold">{originalLangInfo.name} ({originalLangInfo.native})</strong>
                  </span>
                ) : (
                  <span>
                    Translated to <strong className="font-semibold">{viewerLangInfo.native}</strong> from {originalLangInfo.name}
                  </span>
                )}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setShowOriginal(!showOriginal)}
              className={`px-2 py-0.5 rounded text-[10px] font-bold underline transition-colors cursor-pointer ${
                isCurrentUser
                  ? 'hover:bg-white/20 text-white'
                  : 'hover:bg-stone-100 text-[#C05D4D]'
              }`}
            >
              {showOriginal ? `View in ${viewerLangInfo.native}` : 'View Original'}
            </button>
          </div>
        )}

        {/* AI Scam & Fraud Protection Warning Card */}
        {message.scamAnalysis && (
          <ScamWarningCard
            analysis={message.scamAnalysis}
            viewerLanguage={viewerLanguage}
            isCurrentUser={isCurrentUser}
            onDismiss={onDismissScamWarning ? () => onDismissScamWarning(message.id) : undefined}
            onReport={onReportBuyer ? () => onReportBuyer(message.id) : undefined}
            onBlock={onBlockBuyer}
          />
        )}
      </div>
    </div>
  );
};
