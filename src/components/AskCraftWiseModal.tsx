import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Mic,
  MicOff,
  Square,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  Send,
  X,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Package,
  Clock,
  ArrowRight,
  ExternalLink,
  MessageCircle,
  HelpCircle,
  Check,
  ChevronDown
} from 'lucide-react';
import { api } from '../api';
import { AssistantResponse, AssistantAction, ALL_SUPPORTED_LANGUAGES } from '../types';
import { useI18n } from '../i18n/I18nContext';

interface AskCraftWiseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (pageOrTab: string, params?: any) => void;
  onProductUpdated?: () => void;
}

const QUICK_QUESTIONS_BY_LANG: Record<string, string[]> = {
  te: [
    'ఏ వస్తువు ఎక్కువ అమ్ముడవుతోంది?',
    'ఈ నెల నా సంపాదన ఎంత?',
    'పెండింగ్ ఆర్డర్లు ఎన్ని ఉన్నాయి?',
    'స్టాక్ తక్కువగా ఉన్న వస్తువులు ఏవి?',
    'నా ఉత్పత్తులకు తగిన మార్కెట్లు ఏవి?',
    'వాట్సాప్ సందేశం తయారు చేయండి'
  ],
  hi: [
    'कौन सा उत्पाद सबसे ज्यादा बिक रहा है?',
    'इस महीने मेरी कितनी कमाई हुई?',
    'कितने ऑर्डर पेंडिंग हैं?',
    'किस उत्पाद का स्टॉक कम है?',
    'मेरे उत्पादों के लिए कौन से बाजार सही हैं?',
    'व्हाट्सएप मैसेज बनाएं'
  ],
  en: [
    'Which product is selling the most?',
    'How much did I earn this month?',
    'How many orders are pending?',
    'Which products are low in stock?',
    'What markets are suitable for my products?',
    'Create a WhatsApp message for my products'
  ],
  ta: [
    'எந்த தயாரிப்பு அதிகம் விற்பனையாகிறது?',
    'இந்த மாதம் எனது வருமானம் எவ்வளவு?',
    'நிலுவையில் உள்ள ஆர்டர்கள் எத்தனை?',
    'குறைந்த இருப்பில் உள்ள பொருட்கள் எவை?',
    'என் தயாரிப்புகளுக்கு பொருத்தமான சந்தைகள் எவை?'
  ],
  kn: [
    'ಯಾವ ಉತ್ಪನ್ನ ಹೆಚ್ಚು ಮಾರಾಟವಾಗುತ್ತಿದೆ?',
    'ಈ ತಿಂಗಳು ನನ್ನ ಗಳಿಕೆ ಎಷ್ಟು?',
    'ಎಷ್ಟು ಆರ್ಡರ್‌ಗಳು ಬಾಕಿ ಇವೆ?',
    'ಕಡಿಮೆ ಸ್ಟಾಕ್ ಇರುವ ಉತ್ಪನ್ನಗಳು ಯಾವುವು?'
  ],
  ml: [
    'ഏത് ഉൽപ്പന്നമാണ് ഏറ്റവും കൂടുതൽ വിറ്റുപോകുന്നത്?',
    'ഈ മാസം എൻ്റെ വരുമാനം എത്രയാണ്?',
    'തീർപ്പാക്കാത്ത ഓർഡറുകൾ എത്രയാണ്?'
  ],
  mr: [
    'कोणते उत्पादन सर्वाधिक विकले जात आहे?',
    'या महिन्यात माझी कमाई किती झाली?',
    'किती ऑर्डर्स प्रलंबित आहेत?',
    'कोणत्या उत्पादनाचा साठा कमी आहे?'
  ],
  bn: [
    'কোন পণ্যটি সবচেয়ে বেশি বিক্রি হচ্ছে?',
    'এই মাসে আমার উপার্জন কত হয়েছে?',
    'কতগুলি অর্ডার পেন্ডিং আছে?'
  ],
  or: [
    'କେଉଁ ସାମଗ୍ରୀ ସବୁଠାରୁ ଅଧିକ ବିକ୍ରି ହେଉଛି?',
    'ଏହି ମାସରେ ମୋର ରୋଜଗାର କେତେ?',
    'କେତେ ଅର୍ଡର ବାକି ଅଛି?'
  ]
};

export const AskCraftWiseModal: React.FC<AskCraftWiseModalProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onProductUpdated
}) => {
  const { language: currentAppLang, setLanguage } = useI18n();
  const [selectedLang, setSelectedLang] = useState<string>(currentAppLang || 'te');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [textInput, setTextInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentResponse, setCurrentResponse] = useState<AssistantResponse | null>(null);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);
  const [isExecutingAction, setIsExecutingAction] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [micPermissionError, setMicPermissionError] = useState(false);

  // Audio Playback State
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // MediaRecorder & Web Speech Recognition references
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<any>(null);
  const recognitionRef = useRef<any>(null);
  const liveInterimRef = useRef<string>('');

  /**
   * Stop Voice Recording (defined first so callbacks and cleanup can reference it safely)
   */
  const stopRecording = useCallback(() => {
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch {}
    }
    setIsRecording(false);
  }, []);

  const handleClose = useCallback(() => {
    stopRecording();
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
    }
    onClose();
  }, [stopRecording, onClose]);

  // Keep modal language synced with app language if changed
  useEffect(() => {
    if (currentAppLang) {
      setSelectedLang(currentAppLang);
    }
  }, [currentAppLang]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose]);

  // Clean up audio & recording when unmounting or closing
  useEffect(() => {
    return () => {
      stopRecording();
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, [stopRecording]);

  const currentLangMeta = ALL_SUPPORTED_LANGUAGES.find((l) => l.code === selectedLang) || {
    code: 'te',
    label: 'Telugu',
    nativeName: 'తెలుగు',
    speechCode: 'te-IN'
  };

  const quickQuestions = QUICK_QUESTIONS_BY_LANG[selectedLang] || QUICK_QUESTIONS_BY_LANG.en;

  const handleLanguageSelect = (langCode: string) => {
    setSelectedLang(langCode);
    setLanguage(langCode);
    if (currentResponse) {
      // Re-query in the newly selected language if user had an active query
      runQuery({ textQuery: currentResponse.query, language: langCode });
    }
  };

  /**
   * Start Voice Recording
   */
  const startRecording = async () => {
    setErrorMessage(null);
    setMicPermissionError(false);
    audioChunksRef.current = [];
    liveInterimRef.current = '';

    // Stop any playing audio
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      setIsPlayingAudio(false);
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      // Browser Web Speech API for parallel realtime local transcription
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        try {
          const recognizer = new SpeechRecognition();
          recognizer.continuous = true;
          recognizer.interimResults = true;
          recognizer.lang = currentLangMeta.speechCode;
          recognizer.onresult = (event: any) => {
            let combined = '';
            for (let i = 0; i < event.results.length; i++) {
              combined += event.results[i][0].transcript + ' ';
            }
            liveInterimRef.current = combined.trim();
          };
          recognizer.onerror = () => {};
          recognizer.start();
          recognitionRef.current = recognizer;
        } catch {
          // Non-blocking if Web Speech isn't supported
        }
      }

      // MediaRecorder for high-fidelity audio stream to Gemini
      let mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : MediaRecorder.isTypeSupported('audio/mp4')
          ? 'audio/mp4'
          : '';
      }

      const mediaRecorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const audioBlob = new Blob(audioChunksRef.current, {
          type: mimeType || 'audio/webm'
        });

        // Convert audio to base64
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Data = reader.result as string;
          const fallbackText = liveInterimRef.current;
          await runQuery({
            audioBase64: base64Data,
            textQuery: fallbackText,
            language: selectedLang
          });
        };
      };

      mediaRecorder.start(250);
      setIsRecording(true);
      setRecordingSeconds(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => {
          // Auto stop after 30 seconds
          if (prev >= 30) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err: any) {
      console.warn('Microphone access denied or error:', err);
      setMicPermissionError(true);
      setErrorMessage(
        'Microphone access was denied or is unavailable. You can easily type your question below.'
      );
      setIsRecording(false);
    }
  };

  /**
   * Run Query (Voice or Text)
   */
  const runQuery = async (params: {
    textQuery?: string;
    audioBase64?: string;
    language?: string;
  }) => {
    setIsProcessing(true);
    setErrorMessage(null);
    setActionSuccessMessage(null);

    try {
      const response = await api.queryArtisanAssistant({
        textQuery: params.textQuery,
        audioBase64: params.audioBase64,
        language: params.language || selectedLang
      });

      setCurrentResponse(response);
      setTextInput('');

      // Auto-play audio voice response
      if (response.audioUrl) {
        playAudio(response.audioUrl);
      }
    } catch (err: any) {
      console.error('Ask CraftWise Query failed:', err);
      setErrorMessage('Could not process request. Please try speaking again or type your question.');
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Play Voice Response via Audio Element
   */
  const playAudio = (url: string) => {
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
    }
    const audio = new Audio(url);
    audioPlayerRef.current = audio;

    audio.onplay = () => setIsPlayingAudio(true);
    audio.onpause = () => setIsPlayingAudio(false);
    audio.onerror = () => {
      setIsPlayingAudio(false);
      setAudioProgress(0);
    };
    audio.onended = () => {
      setIsPlayingAudio(false);
      setAudioProgress(100);
    };
    audio.ontimeupdate = () => {
      if (audio.duration) {
        setAudioProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    audio.play().catch((e) => {
      console.warn('Audio auto-play policy notice (user gesture needed):', e);
      setIsPlayingAudio(false);
    });
  };

  const toggleAudioPlayback = () => {
    if (!audioPlayerRef.current && currentResponse?.audioUrl) {
      playAudio(currentResponse.audioUrl);
      return;
    }
    if (audioPlayerRef.current) {
      if (isPlayingAudio) {
        audioPlayerRef.current.pause();
      } else {
        audioPlayerRef.current.play().catch(() => {});
      }
    }
  };

  /**
   * Execute Action when user confirms (e.g. Price or Stock update)
   */
  const handleConfirmAction = async (action: AssistantAction) => {
    if (!action.productId || !action.type) return;

    setIsExecutingAction(true);
    setErrorMessage(null);

    try {
      const res = await api.executeAssistantAction({
        actionType: action.type,
        productId: action.productId,
        newValue: Number(action.newValue),
        language: selectedLang
      });

      if (res.success) {
        setActionSuccessMessage(res.message);
        if (res.audioUrl) {
          playAudio(res.audioUrl);
        }
        if (onProductUpdated) {
          onProductUpdated();
        }
        // Mark action as executed on the active response
        setCurrentResponse((prev) =>
          prev
            ? {
                ...prev,
                action: {
                  ...action,
                  requiresConfirmation: false
                },
                executed: true
              }
            : null
        );
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to update business data.');
    } finally {
      setIsExecutingAction(false);
    }
  };

  const handleCancelAction = () => {
    setCurrentResponse((prev) =>
      prev
        ? {
            ...prev,
            action: null
          }
        : null
    );
  };

  /**
   * Handle Navigation Trigger
   */
  const handleActionNavigation = (actionType: string) => {
    handleClose();
    if (!onNavigate) return;

    if (actionType === 'view_orders') {
      onNavigate('orders');
    } else if (actionType === 'view_earnings') {
      onNavigate('sales');
    } else if (actionType === 'view_catalog' || actionType === 'view_low_stock') {
      onNavigate('inventory');
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs p-0 sm:p-4 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div
        id="ask-craftwise-modal-container"
        className="w-full max-w-2xl bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-[#E5E1DA] overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[85vh] animate-in fade-in slide-in-from-bottom-6 duration-200"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-[#FAF9F6] via-white to-[#FDFBF7] px-5 py-4 border-b border-[#E5E1DA] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#C05D4D] to-[#A34E41] flex items-center justify-center text-white shadow-md shadow-[#C05D4D22]">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif font-bold text-lg text-[#4A3728]">
                  Ask CraftWise
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800 tracking-wider">
                  Voice AI
                </span>
              </div>
              <p className="text-xs text-[#7C6E62]">
                Your voice business assistant • మీ వ్యాపార సహాయకుడు
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Selector */}
            <div className="relative">
              <select
                id="assistant-language-select"
                value={selectedLang}
                onChange={(e) => handleLanguageSelect(e.target.value)}
                className="text-xs font-bold bg-[#F5F2EB] text-[#4A3728] border border-[#E5E1DA] rounded-xl px-2.5 py-1.5 pr-7 appearance-none cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-[#C05D4D]"
              >
                {ALL_SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.nativeName} ({lang.label})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-[#7C6E62] absolute right-2 top-2.5 pointer-events-none" />
            </div>

            {/* Close Button */}
            <button
              type="button"
              id="ask-craftwise-close-btn"
              onClick={handleClose}
              className="p-2 rounded-xl text-[#7C6E62] hover:text-[#4A3728] hover:bg-[#F5F2EB] transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* Permission Notice if mic denied */}
          {micPermissionError && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-xs text-amber-900">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold mb-1">Microphone access unavailable</p>
                <p>
                  Please allow microphone permissions in your browser bar, or simply type your question below.
                </p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && !micPermissionError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Success Notification after action */}
          {actionSuccessMessage && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs flex items-center gap-2.5 animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span className="font-semibold">{actionSuccessMessage}</span>
            </div>
          )}

          {/* Assistant Response Card if available */}
          {currentResponse && !isProcessing && (
            <div
              id="assistant-response-card"
              className="bg-[#FAF9F6] border border-[#E5E1DA] rounded-3xl p-5 space-y-4 shadow-xs"
            >
              {/* Question Transcript Header */}
              <div className="flex items-center justify-between text-xs text-[#7C6E62] pb-2 border-b border-[#EAE6DE]">
                <div className="flex items-center gap-2">
                  <Mic className="w-3.5 h-3.5 text-[#C05D4D]" />
                  <span>You asked:</span>
                </div>
                <span className="font-medium italic text-[#4A3728] truncate max-w-[280px]">
                  "{currentResponse.query}"
                </span>
              </div>

              {/* Main Response Spoken Text */}
              <div className="space-y-2">
                <p className="text-lg sm:text-xl font-medium text-[#2D241E] leading-relaxed">
                  {currentResponse.responseText}
                </p>
              </div>

              {/* Audio Controls */}
              {currentResponse.audioUrl && (
                <div className="pt-2 flex items-center justify-between gap-3 border-t border-[#EAE6DE]">
                  <button
                    type="button"
                    id="assistant-audio-toggle-btn"
                    onClick={toggleAudioPlayback}
                    className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#4A3728] hover:bg-[#382a1e] text-white text-xs font-bold transition-all shadow-xs"
                  >
                    {isPlayingAudio ? (
                      <>
                        <Pause className="w-3.5 h-3.5" />
                        <span>Pause Voice</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5" />
                        <span>Listen to Answer</span>
                      </>
                    )}
                  </button>

                  {/* Visualizer bars if playing */}
                  {isPlayingAudio && (
                    <div className="flex items-center gap-1">
                      <span className="w-1 h-3 bg-[#C05D4D] rounded-full animate-bounce"></span>
                      <span className="w-1 h-5 bg-[#C05D4D] rounded-full animate-bounce [animation-delay:0.15s]"></span>
                      <span className="w-1 h-2 bg-[#C05D4D] rounded-full animate-bounce [animation-delay:0.3s]"></span>
                      <span className="w-1 h-4 bg-[#C05D4D] rounded-full animate-bounce [animation-delay:0.45s]"></span>
                    </div>
                  )}

                  <button
                    type="button"
                    id="assistant-audio-replay-btn"
                    onClick={() => {
                      if (currentResponse.audioUrl) {
                        playAudio(currentResponse.audioUrl);
                      }
                    }}
                    className="p-1.5 text-[#7C6E62] hover:text-[#4A3728] rounded-lg transition-colors"
                    title="Replay from start"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Highlights Data Badges */}
              {currentResponse.highlights && currentResponse.highlights.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
                  {currentResponse.highlights.map((h, i) => (
                    <div
                      key={i}
                      className="bg-white border border-[#E5E1DA] rounded-2xl p-2.5 shadow-2xs"
                    >
                      <span className="block text-[10px] uppercase font-bold text-[#7C6E62]">
                        {h.label}
                      </span>
                      <span
                        className={`text-sm font-extrabold ${
                          h.type === 'positive'
                            ? 'text-emerald-700'
                            : h.type === 'warning'
                            ? 'text-amber-700'
                            : 'text-[#4A3728]'
                        }`}
                      >
                        {h.value}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Business Action Confirmation Card (e.g. Price or Stock change) */}
              {currentResponse.action?.requiresConfirmation && !currentResponse.executed && (
                <div
                  id="assistant-confirmation-card"
                  className="bg-white border-2 border-[#C05D4D] rounded-2xl p-4 space-y-3 mt-3 shadow-md"
                >
                  <div className="flex items-center gap-2 text-[#C05D4D] font-bold text-xs">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>Confirm Business Change</span>
                  </div>

                  <p className="text-sm font-semibold text-[#2D241E]">
                    {currentResponse.action.confirmationMessage ||
                      `Change ${currentResponse.action.productTitle} from ₹${currentResponse.action.oldValue} to ₹${currentResponse.action.newValue}?`}
                  </p>

                  <div className="flex items-center gap-3 pt-1">
                    <button
                      type="button"
                      id="assistant-confirm-action-btn"
                      onClick={() => handleConfirmAction(currentResponse.action!)}
                      disabled={isExecutingAction}
                      className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-sm transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      <Check className="w-4 h-4" />
                      <span>{isExecutingAction ? 'Updating...' : 'Confirm'}</span>
                    </button>

                    <button
                      type="button"
                      id="assistant-cancel-action-btn"
                      onClick={handleCancelAction}
                      disabled={isExecutingAction}
                      className="py-2.5 px-4 rounded-xl bg-[#F5F2EB] hover:bg-[#EAE6DE] text-[#7C6E62] hover:text-[#4A3728] font-bold text-sm transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* WhatsApp Marketing Preview & Action */}
              {currentResponse.action?.type === 'create_whatsapp' &&
                currentResponse.action.details?.whatsappText && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 space-y-2 mt-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-900 flex items-center gap-1.5">
                        <MessageCircle className="w-4 h-4 text-emerald-700" />
                        WhatsApp Broadcast Message
                      </span>
                    </div>
                    <pre className="text-xs text-[#4A3728] whitespace-pre-wrap font-sans bg-white p-3 rounded-xl border border-emerald-100 max-h-36 overflow-y-auto">
                      {currentResponse.action.details.whatsappText}
                    </pre>
                    <a
                      href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                        currentResponse.action.details.whatsappText
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Open & Share on WhatsApp</span>
                    </a>
                  </div>
                )}

              {/* Navigation Jump Button if requested (e.g. view orders or earnings) */}
              {currentResponse.action?.type &&
                ['view_orders', 'view_earnings', 'view_catalog', 'view_low_stock'].includes(
                  currentResponse.action.type
                ) && (
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => handleActionNavigation(currentResponse.action!.type!)}
                      className="w-full py-2.5 px-4 rounded-xl bg-[#FAF0ED] hover:bg-[#F5E2DD] text-[#C05D4D] font-bold text-xs flex items-center justify-center gap-2 transition-colors border border-[#C05D4D33]"
                    >
                      <span>
                        {currentResponse.action.type === 'view_orders'
                          ? 'Open Orders & Delivery Management'
                          : currentResponse.action.type === 'view_earnings'
                          ? 'Open Sales & Earnings Dashboard'
                          : 'Open Product Catalog'}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
            </div>
          )}

          {/* Central Voice Control Area */}
          <div className="flex flex-col items-center justify-center py-4 space-y-4">
            {/* Pulsing Mic Button */}
            <div className="relative flex items-center justify-center">
              {isRecording && (
                <>
                  <span className="absolute w-28 h-28 rounded-full bg-rose-500/20 animate-ping"></span>
                  <span className="absolute w-24 h-24 rounded-full bg-rose-500/30 animate-pulse"></span>
                </>
              )}
              {isProcessing && (
                <span className="absolute w-24 h-24 rounded-full border-4 border-[#C05D4D] border-t-transparent animate-spin"></span>
              )}

              <button
                type="button"
                id="assistant-mic-record-btn"
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isProcessing}
                className={`w-20 h-20 rounded-full flex flex-col items-center justify-center text-white shadow-xl transition-all transform active:scale-95 z-10 ${
                  isRecording
                    ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/30 ring-4 ring-rose-200'
                    : isProcessing
                    ? 'bg-stone-400 cursor-not-allowed'
                    : 'bg-gradient-to-tr from-[#C05D4D] to-[#E27D60] hover:from-[#b04d3e] hover:to-[#d06d50] shadow-[#C05D4D44] hover:shadow-2xl'
                }`}
                title={isRecording ? 'Tap to Stop' : 'Tap to Speak'}
              >
                {isRecording ? (
                  <Square className="w-8 h-8 fill-current" />
                ) : (
                  <Mic className="w-8 h-8" />
                )}
              </button>
            </div>

            {/* Status Text & Timer */}
            <div className="text-center">
              {isRecording ? (
                <div className="space-y-1">
                  <div className="flex items-center justify-center gap-2 text-rose-600 font-bold text-sm">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping"></span>
                    <span>Listening... {recordingSeconds}s</span>
                  </div>
                  <p className="text-xs text-[#7C6E62]">
                    Tap square button when done speaking
                  </p>
                </div>
              ) : isProcessing ? (
                <div className="space-y-1">
                  <p className="text-sm font-bold text-[#4A3728] animate-pulse">
                    Understanding your question...
                  </p>
                  <p className="text-xs text-[#7C6E62]">
                    Checking your actual CraftWise business data
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  <p className="text-sm font-bold text-[#4A3728]">
                    Tap to speak naturally in {currentLangMeta.nativeName}
                  </p>
                  <p className="text-xs text-[#7C6E62]">
                    Ask about sales, pending orders, stock, or price updates
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Question Suggestion Chips */}
          <div className="space-y-2">
            <span className="block text-xs font-bold text-[#7C6E62] uppercase tracking-wider">
              Sample questions you can ask:
            </span>
            <div className="flex flex-wrap gap-2">
              {quickQuestions.map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  id={`assistant-chip-${idx}`}
                  onClick={() => runQuery({ textQuery: q, language: selectedLang })}
                  disabled={isRecording || isProcessing}
                  className="text-xs font-semibold px-3 py-1.5 rounded-full bg-white hover:bg-[#F5F2EB] text-[#4A3728] border border-[#E5E1DA] hover:border-[#C05D4D] transition-all shadow-2xs text-left"
                >
                  💬 {q}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Optional Text Input Fallback Bar at bottom */}
        <div className="p-4 bg-[#FAF9F6] border-t border-[#E5E1DA]">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (textInput.trim()) {
                runQuery({ textQuery: textInput.trim(), language: selectedLang });
              }
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              id="assistant-text-input"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder={`Or type in ${currentLangMeta.nativeName} / English...`}
              disabled={isRecording || isProcessing}
              className="flex-1 bg-white border border-[#E5E1DA] rounded-2xl px-4 py-2.5 text-sm text-[#2D241E] placeholder:text-[#9C8E82] focus:outline-hidden focus:ring-2 focus:ring-[#C05D4D] focus:border-transparent transition-all"
            />
            <button
              type="submit"
              id="assistant-send-query-btn"
              disabled={!textInput.trim() || isRecording || isProcessing}
              className="p-2.5 rounded-2xl bg-[#C05D4D] hover:bg-[#A34E41] disabled:opacity-40 text-white font-bold transition-all shadow-sm shrink-0"
              title="Send question"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
