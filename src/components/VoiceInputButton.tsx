import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Loader2, Check, Sparkles, Volume2, VolumeX } from 'lucide-react';
import { ALL_SUPPORTED_LANGUAGES } from '../types';
import { api } from '../api';
import { getVoicePromptForField, playChimeTone } from '../utils/voicePrompts';
import { playTextToSpeech, stopTextToSpeech } from '../utils/textToSpeech';

export interface VoiceInputButtonProps {
  fieldLabel: string;
  currentLanguage: string; // language code e.g. 'te', 'hi', 'en', 'ta', 'kn', 'ml', 'mr', 'bn', 'or'
  onTranscript: (value: string) => void;
  isNumericOnly?: boolean;
  options?: string[]; // for dropdown fields like states or crafts
  className?: string;
  buttonSize?: 'sm' | 'md';
  askPrompt?: boolean; // whether to speak prompt aloud before recording (default true)
}

// Comprehensive numeral mapping for 9 Indian languages & English
const ACTION_LABELS_BY_LANG: Record<string, { ask: string; speak: string }> = {
  te: { ask: 'అడగండి', speak: 'మాట్లాడండి' },
  hi: { ask: 'पूछिए', speak: 'बोलिए' },
  ta: { ask: 'கேளுங்கள்', speak: 'பேசுங்கள்' },
  kn: { ask: 'ಕೇಳಿ', speak: 'ಮಾತನಾಡಿ' },
  ml: { ask: 'ചോദിക്കുക', speak: 'സംസാരിക്കുക' },
  bn: { ask: 'শুনুন', speak: 'বলুন' },
  mr: { ask: 'विचारा', speak: 'बोला' },
  or: { ask: 'ଶୁଣନ୍ତୁ', speak: 'କୁହନ୍ତୁ' },
  en: { ask: 'Ask', speak: 'Speak' }
};

const NUMERAL_MAP: Record<string, string> = {
  // English words
  'zero': '0', 'one': '1', 'two': '2', 'three': '3', 'four': '4',
  'five': '5', 'six': '6', 'seven': '7', 'eight': '8', 'nine': '9',
  // Telugu words
  'సున్నా': '0', 'ఒకటి': '1', 'రెండు': '2', 'మూడు': '3', 'నాలుగు': '4',
  'ఐదు': '5', 'ఆరు': '6', 'ఏడు': '7', 'ఎనిమిది': '8', 'తొమ్మిది': '9',
  // Hindi words
  'शून्य': '0', 'एक': '1', 'दो': '2', 'तीन': '3', 'चार': '4',
  'पांच': '5', 'पाँच': '5', 'छह': '6', 'सात': '7', 'आठ': '8', 'नौ': '9',
  // Tamil words
  'பூஜ்யம்': '0', 'ஒன்று': '1', 'இரண்டு': '2', 'மூன்று': '3', 'நான்கு': '4',
  'ஐந்து': '5', 'ஆறு': '6', 'ஏழு': '7', 'எட்டு': '8', 'ஒன்பது': '9',
  // Kannada words
  'ಸೊನ್ನೆ': '0', 'ಒಂದು': '1', 'ಎರಡು': '2', 'ಮೂರು': '3', 'ನಾಲ್ಕು': '4',
  'ಐದು': '5', 'ಆರು': '6', 'ಏಳು': '7', 'ಎಂಟು': '8', 'ಒಂಬತ್ತು': '9',
  // Malayalam words
  'പൂജ്യം': '0', 'ഒന്ന്': '1', 'രണ്ട്': '2', 'മൂന്ന്': '3', 'നാല്': '4',
  'അഞ്ച്': '5', 'ആറ്': '6', 'ഏഴ്': '7', 'എട്ട്': '8', 'ഒമ്പത്': '9',
  // Bengali words
  'শূন্য': '0', 'এক': '1', 'দুই': '2', 'তিন': '3', 'চার': '4',
  'পাঁচ': '5', 'ছয়': '6', 'সাত': '7', 'আট': '8', 'নয়': '9',
  // Marathi distinct words (shared Devanagari words already covered above)
  'दोन': '2', 'पाच': '5', 'सहा': '6', 'नऊ': '9',
  // Odia words
  'ଶୂନ୍ୟ': '0', 'ଏକ': '1', 'ଦୁଇ': '2', 'ତିନି': '3', 'ଚାରି': '4',
  'ପାଞ୍ଚ': '5', 'ଛଅ': '6', 'ସାତ': '7', 'ଆଠ': '8', 'ନଅ': '9',
  // Native Digits
  '౦': '0', '౧': '1', '౨': '2', '౩': '3', '౪': '4', '౫': '5', '౬': '6', '౭': '7', '౮': '8', '౯': '9',
  '०': '0', '१': '1', '२': '2', '३': '3', '४': '4', '५': '5', '६': '6', '७': '7', '८': '8', '९': '9',
  '೦': '0', '೧': '1', '೨': '2', '೩': '3', '೪': '4', '೫': '5', '೬': '6', '೭': '7', '೮': '8', '೯': '9',
  '൦': '0', '൧': '1', '൨': '2', '൩': '3', '൪': '4', '൫': '5', '൬': '6', '൭': '7', '൮': '8', '൯': '9',
  '০': '0', '১': '1', '২': '2', '৩': '3', '৪': '4', '৫': '5', '৬': '6', '৭': '7', '৮': '8', '৯': '9',
  '୦': '0', '୧': '1', '୨': '2', '୩': '3', '୪': '4', '୫': '5', '୬': '6', '୭': '7', '୮': '8', '୯': '9'
};

// Helper to convert spoken numerals into digits
export function parseSpokenNumbers(text: string): string {
  if (!text) return '';
  // Check words
  const words = text.toLowerCase().split(/[\s,.-]+/);
  let result = '';
  for (const w of words) {
    if (NUMERAL_MAP[w]) {
      result += NUMERAL_MAP[w];
    } else {
      // Check each character for native numerals or digits
      for (const ch of w) {
        if (NUMERAL_MAP[ch]) {
          result += NUMERAL_MAP[ch];
        } else if (/[0-9]/.test(ch)) {
          result += ch;
        }
      }
    }
  }
  return result;
}

// Find closest matching option from a list of options (case-insensitive substring or word match)
export function findClosestOption(spoken: string, options: string[]): string | null {
  if (!spoken || !options || options.length === 0) return null;
  const lower = spoken.toLowerCase().trim();

  // 1. Exact match
  const exact = options.find((opt) => opt.toLowerCase() === lower);
  if (exact) return exact;

  // 2. Option contains spoken text or spoken contains option
  const sub = options.find(
    (opt) => opt.toLowerCase().includes(lower) || lower.includes(opt.toLowerCase())
  );
  if (sub) return sub;

  // 3. Word-level overlap
  const spokenWords = lower.split(/\s+/).filter((w) => w.length > 2);
  let bestMatch: string | null = null;
  let maxOverlap = 0;

  for (const opt of options) {
    const optLower = opt.toLowerCase();
    let overlap = 0;
    for (const word of spokenWords) {
      if (optLower.includes(word)) overlap++;
    }
    if (overlap > maxOverlap) {
      maxOverlap = overlap;
      bestMatch = opt;
    }
  }

  return bestMatch;
}

export const VoiceInputButton: React.FC<VoiceInputButtonProps> = ({
  fieldLabel,
  currentLanguage,
  onTranscript,
  isNumericOnly = false,
  options,
  className = '',
  buttonSize = 'sm',
  askPrompt = true
}) => {
  const [isAskingPrompt, setIsAskingPrompt] = useState(false);
  const [isPlayingPromptOnly, setIsPlayingPromptOnly] = useState(false);
  const [promptSpeechText, setPromptSpeechText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isProcessingAi, setIsProcessingAi] = useState(false);
  const [liveInterim, setLiveInterim] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [successValue, setSuccessValue] = useState('');

  const recognitionRef = useRef<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const silenceTimerRef = useRef<any>(null);
  const promptTimeoutRef = useRef<any>(null);
  const accumulatedSpeechRef = useRef<string>('');

  const langConfig =
    ALL_SUPPORTED_LANGUAGES.find((l) => l.code === currentLanguage) ||
    ALL_SUPPORTED_LANGUAGES[0];

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopListening();
    };
  }, []);

  const triggerSuccessFeedback = (val: string) => {
    setSuccessValue(val);
    setShowSuccess(true);
    playChimeTone('success');
    setTimeout(() => {
      setShowSuccess(false);
    }, 2800);
  };

  const commitValue = (rawSpeech: string) => {
    if (!rawSpeech || !rawSpeech.trim()) return;
    const cleanSpeech = rawSpeech.trim();

    if (isNumericOnly) {
      const digits = parseSpokenNumbers(cleanSpeech);
      if (digits) {
        onTranscript(digits);
        triggerSuccessFeedback(digits);
      } else {
        // Fallback: extract any digits
        const rawDigits = cleanSpeech.replace(/\D/g, '');
        if (rawDigits) {
          onTranscript(rawDigits);
          triggerSuccessFeedback(rawDigits);
        }
      }
    } else if (options && options.length > 0) {
      const matched = findClosestOption(cleanSpeech, options);
      if (matched) {
        onTranscript(matched);
        triggerSuccessFeedback(matched);
      } else {
        onTranscript(cleanSpeech);
        triggerSuccessFeedback(cleanSpeech);
      }
    } else {
      // Capitalize first letter of each word for names/districts
      const formatted = cleanSpeech
        .replace(/[.,;!?]+$/, '')
        .split(' ')
        .map((word) => (word ? word.charAt(0).toUpperCase() + word.slice(1) : ''))
        .join(' ');

      onTranscript(formatted || cleanSpeech);
      triggerSuccessFeedback(formatted || cleanSpeech);
    }
  };

  const stopListening = () => {
    if (promptTimeoutRef.current) {
      clearTimeout(promptTimeoutRef.current);
      promptTimeoutRef.current = null;
    }

    stopTextToSpeech();

    setIsAskingPrompt(false);
    setIsPlayingPromptOnly(false);
    setIsListening(false);
    setLiveInterim('');

    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
      recognitionRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      try {
        mediaRecorderRef.current.stop();
      } catch {
        // ignore
      }
    }
  };

  const startListening = async () => {
    setIsAskingPrompt(false);
    accumulatedSpeechRef.current = '';
    setLiveInterim('');
    setIsListening(true);

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    let speechRecognitionSupported = Boolean(SpeechRecognition);

    // Also start MediaRecorder as an audio stream fallback for AI transcription
    let stream: MediaStream | null = null;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
        }

        // If Web Speech already produced text, do not call AI transcription
        if (accumulatedSpeechRef.current && accumulatedSpeechRef.current.trim().length > 0) {
          return;
        }

        // If Web Speech did not produce text, use AI backend transcription if valid audio recorded
        const mimeType = mediaRecorder.mimeType || 'audio/webm';
        const blob = new Blob(audioChunksRef.current, { type: mimeType });

        if (blob.size >= 500 && audioChunksRef.current.length > 0) {
          try {
            setIsProcessingAi(true);
            const reader = new FileReader();
            reader.onloadend = async () => {
              const base64 = reader.result as string;
              try {
                const res = await api.transcribeAudio({
                  audioBase64: base64,
                  spokenLanguage: langConfig.label,
                  language: langConfig.code
                });
                if (res && res.transcript && res.transcript.trim()) {
                  commitValue(res.transcript.trim());
                  playChimeTone('success');
                }
              } catch {
                // Audio fallback completed
              } finally {
                setIsProcessingAi(false);
              }
            };
            reader.readAsDataURL(blob);
          } catch {
            setIsProcessingAi(false);
          }
        }
      };

      mediaRecorder.start(250);
    } catch (e) {
      console.warn('Microphone permission or MediaRecorder not available:', e);
    }

    if (langConfig.code === 'or') {
      // Chrome Web Speech API does not support Odia (or-IN) natively.
      // Show user feedback that their voice is being recorded for Gemini transcription.
      setLiveInterim('Recording voice in Odia (ଓଡ଼ିଆ)... Tap 🎤 when done');
      silenceTimerRef.current = setTimeout(() => {
        stopListening();
      }, 7000);
    } else if (speechRecognitionSupported) {
      try {
        const recognizer = new SpeechRecognition();
        recognizer.continuous = true;
        recognizer.interimResults = true;
        recognizer.lang = langConfig.speechCode || 'te-IN';

        recognizer.onresult = (event: any) => {
          let interim = '';
          let final = '';

          for (let i = 0; i < event.results.length; i++) {
            const res = event.results[i];
            if (res.isFinal) {
              final += res[0].transcript + ' ';
            } else {
              interim += res[0].transcript + ' ';
            }
          }

          const currentCombined = (final + interim).trim();
          if (currentCombined) {
            accumulatedSpeechRef.current = currentCombined;
            setLiveInterim(currentCombined);
            // Auto commit preview directly into input so artisan sees it immediately!
            commitValue(currentCombined);
          }

          // Reset silence timer: auto-stop after 2.5 seconds of silence
          if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = setTimeout(() => {
            stopListening();
          }, 2500);
        };

        recognizer.onerror = (err: any) => {
          console.warn('Speech recognition status:', err?.error || err);
          if (err.error === 'not-allowed' || err.error === 'service-not-allowed') {
            stopListening();
          } else if (err.error === 'language-not-supported') {
            setLiveInterim(`Recording voice in ${langConfig.nativeName}... Tap 🎤 when done`);
          }
        };

        recognizer.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognizer;
        recognizer.start();

        // Safety timeout: stop listening after 10 seconds if no speech detected
        silenceTimerRef.current = setTimeout(() => {
          stopListening();
        }, 10000);
      } catch (e) {
        console.warn('Could not launch speech recognizer:', e);
        silenceTimerRef.current = setTimeout(() => {
          stopListening();
        }, 5000);
      }
    } else {
      // If Web Speech is not supported, record for 4 seconds then transcribe via AI
      silenceTimerRef.current = setTimeout(() => {
        stopListening();
      }, 4500);
    }
  };

  // Speak voice question prompt (Sound Icon Action - does NOT auto-start mic)
  const handleAskClick = () => {
    if (isAskingPrompt) {
      stopTextToSpeech();
      setIsAskingPrompt(false);
      if (promptTimeoutRef.current) {
        clearTimeout(promptTimeoutRef.current);
        promptTimeoutRef.current = null;
      }
      return;
    }

    if (isListening) {
      stopListening();
    }

    const promptText = getVoicePromptForField(fieldLabel, langConfig.code);
    setPromptSpeechText(promptText);
    setIsAskingPrompt(true);

    const finishAsking = () => {
      if (promptTimeoutRef.current) {
        clearTimeout(promptTimeoutRef.current);
        promptTimeoutRef.current = null;
      }
      stopTextToSpeech();
      setIsAskingPrompt(false);
    };

    // Safety fallback timer: auto-clear asking state after 8s if network audio delays
    promptTimeoutRef.current = setTimeout(() => {
      finishAsking();
    }, 8000);

    playTextToSpeech(promptText, langConfig.code, {
      onStart: () => {
        setIsAskingPrompt(true);
      },
      onEnd: () => {
        finishAsking();
      },
      onError: () => {
        finishAsking();
      }
    });
  };

  // Artisan speaking action (Mic Icon Action)
  const handleSpeakClick = () => {
    if (isListening) {
      stopListening();
      return;
    }

    if (isAskingPrompt) {
      stopTextToSpeech();
      setIsAskingPrompt(false);
    }

    playChimeTone('listening');
    startListening();
  };

  const promptTextDisplay = getVoicePromptForField(fieldLabel, langConfig.code);
  const actionLabels = ACTION_LABELS_BY_LANG[langConfig.code] || ACTION_LABELS_BY_LANG['en'];
  const askLabelText = buttonSize === 'sm' || langConfig.code === 'en' ? actionLabels.ask : `${actionLabels.ask} (Ask)`;
  const speakLabelText = buttonSize === 'sm' || langConfig.code === 'en' ? actionLabels.speak : `${actionLabels.speak} (Speak)`;

  return (
    <div className={`inline-flex flex-wrap items-center gap-1.5 ${className}`}>
      {/* 1. SOUND ICON BUTTON: STRICTLY FOR ASKING WHAT TO ENTER */}
      <button
        type="button"
        id={`ask-btn-${fieldLabel.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
        onClick={handleAskClick}
        title={
          isAskingPrompt
            ? `App is asking aloud: "${promptSpeechText || promptTextDisplay}". Tap to stop sound.`
            : `Tap sound icon to hear app ask what to enter in ${langConfig.nativeName}: "${promptTextDisplay}"`
        }
        className={`relative group inline-flex items-center gap-1.5 font-semibold rounded-lg transition-all cursor-pointer select-none ${
          buttonSize === 'sm' ? 'px-2 py-1 text-xs' : 'px-2.5 py-1.5 text-xs'
        } ${
          isAskingPrompt
            ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-500/30 animate-pulse ring-2 ring-indigo-300'
            : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 shadow-2xs'
        }`}
      >
        <Volume2
          className={`w-3.5 h-3.5 ${
            isAskingPrompt
              ? 'text-white animate-bounce'
              : 'text-indigo-600 group-hover:scale-110 transition-transform'
          }`}
        />
        <span className="text-[11px] font-bold">
          {isAskingPrompt ? 'Asking...' : askLabelText}
        </span>
      </button>

      {/* 2. MIC ICON BUTTON: STRICTLY FOR ARTISAN SPEAKING THEIR ANSWER */}
      <button
        type="button"
        id={`mic-btn-${fieldLabel.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
        onClick={handleSpeakClick}
        title={
          isListening
            ? `Listening to your voice. Tap to finish speaking ${fieldLabel}`
            : `Tap mic icon to speak your answer in ${langConfig.nativeName} (${actionLabels.speak})`
        }
        className={`relative group inline-flex items-center gap-1.5 font-semibold rounded-lg transition-all cursor-pointer select-none ${
          buttonSize === 'sm' ? 'px-2 py-1 text-xs' : 'px-2.5 py-1.5 text-xs'
        } ${
          isListening
            ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-500/30 animate-pulse ring-2 ring-rose-300'
            : isProcessingAi
            ? 'bg-amber-100 text-amber-900 border border-amber-300'
            : showSuccess
            ? 'bg-emerald-600 text-white shadow-xs'
            : 'bg-[#F4EBE1] hover:bg-[#EADDCF] text-[#C05D4D] border border-[#E3D3C4] shadow-2xs'
        }`}
      >
        {isListening ? (
          <>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
            <Mic className="w-3.5 h-3.5 text-white" />
            <span className="font-bold">Listening... Speak!</span>
          </>
        ) : isProcessingAi ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-700" />
            <span className="text-[11px] font-bold">Transcribing...</span>
          </>
        ) : showSuccess ? (
          <>
            <Check className="w-3.5 h-3.5 text-white" />
            <span className="text-[11px] font-bold text-white">Done!</span>
          </>
        ) : (
          <>
            <Mic className="w-3.5 h-3.5 text-[#C05D4D] group-hover:scale-110 transition-transform" />
            <span className="text-[11px] font-bold">
              {speakLabelText}
            </span>
          </>
        )}
      </button>

      {/* Visual Speech Bubble when sound icon is asking */}
      {isAskingPrompt && (
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-medium shadow-2xs animate-fadeIn">
          <Volume2 className="w-3.5 h-3.5 text-indigo-600 shrink-0 animate-bounce" />
          <span className="font-semibold">"{promptSpeechText || promptTextDisplay}"</span>
        </div>
      )}

      {/* Live speech feedback pill when artisan is speaking into mic */}
      {isListening && (
        <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-medium max-w-[200px] truncate animate-fadeIn">
          <Mic className="w-3 h-3 text-rose-600 shrink-0 animate-pulse" />
          <span>{liveInterim ? `"${liveInterim}"` : 'Speak now...'}</span>
        </div>
      )}

      {/* Success transcript preview */}
      {showSuccess && successValue && (
        <span className="text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-md font-medium max-w-[180px] truncate animate-fadeIn">
          ✓ {successValue}
        </span>
      )}
    </div>
  );
};
