import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  Square,
  Play,
  RotateCcw,
  Volume2,
  FileText,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Loader2,
  Globe2,
  Languages
} from 'lucide-react';
import { api } from '../api';

interface VoiceRecorderProps {
  onTranscriptReady: (transcript: string, audioBase64?: string, language?: string) => void;
  initialTranscript?: string;
  preferredLanguage?: string;
}

const SUPPORTED_LANGUAGES = [
  { code: 'te', label: 'Telugu (తెలుగు)', speechCode: 'te-IN' },
  { code: 'hi', label: 'Hindi (हिन्दी)', speechCode: 'hi-IN' },
  { code: 'en', label: 'English (Indian)', speechCode: 'en-IN' },
  { code: 'ta', label: 'Tamil (தமிழ்)', speechCode: 'ta-IN' },
  { code: 'kn', label: 'Kannada (ಕನ್ನಡ)', speechCode: 'kn-IN' },
  { code: 'ml', label: 'Malayalam (മലയാളം)', speechCode: 'ml-IN' },
  { code: 'mr', label: 'Marathi (मराठी)', speechCode: 'mr-IN' },
  { code: 'bn', label: 'Bengali (বাংলা)', speechCode: 'bn-IN' },
  { code: 'or', label: 'Odia (ଓଡ଼ିଆ)', speechCode: 'or-IN' },
  { code: 'auto', label: 'Auto Detect', speechCode: 'en-IN' }
];

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onTranscriptReady,
  initialTranscript = '',
  preferredLanguage = 'te'
}) => {
  // Find initial language code
  const initialLang = SUPPORTED_LANGUAGES.some((l) => l.code === preferredLanguage)
    ? preferredLanguage
    : 'te';

  const [selectedLang, setSelectedLang] = useState<string>(initialLang);
  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBase64, setAudioBase64] = useState<string | undefined>(undefined);
  const [isPlaying, setIsPlaying] = useState(false);
  const [transcript, setTranscript] = useState(initialTranscript);
  const [interimSpeech, setInterimSpeech] = useState<string>('');
  const [englishTranslation, setEnglishTranslation] = useState<string>('');
  const [detectedLanguage, setDetectedLanguage] = useState<string>(() => {
    const found = SUPPORTED_LANGUAGES.find((l) => l.code === preferredLanguage);
    return found ? found.label : 'Telugu (తెలుగు)';
  });
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
  const [transcribeNotice, setTranscribeNotice] = useState<string | null>(null);
  const [inputMode, setInputMode] = useState<'voice' | 'text'>('voice');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<any>(null);
  const liveSpeechTextRef = useRef<string>('');

  // Keep transcript in sync if initialTranscript changes externally (e.g. user clicked a sample card)
  useEffect(() => {
    if (initialTranscript !== undefined && initialTranscript !== transcript && !isRecording && !isTranscribing) {
      setTranscript(initialTranscript);
    }
  }, [initialTranscript]);

  // Set up Speech Recognition whenever selected language changes
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const recognizer = new SpeechRecognition();
        recognizer.continuous = true;
        recognizer.interimResults = true;

        const langConfig = SUPPORTED_LANGUAGES.find((l) => l.code === selectedLang);
        recognizer.lang = langConfig?.speechCode || 'en-IN';

        recognizer.onresult = (event: any) => {
          let finalAccumulated = '';
          let interimAccumulated = '';

          for (let i = 0; i < event.results.length; i++) {
            const res = event.results[i];
            if (res.isFinal) {
              finalAccumulated += res[0].transcript + ' ';
            } else {
              interimAccumulated += res[0].transcript + ' ';
            }
          }

          const combined = (finalAccumulated + interimAccumulated).trim();
          if (combined) {
            liveSpeechTextRef.current = combined;
            setInterimSpeech(combined);
            setTranscript(combined);
          }
        };

        recognizer.onerror = (err: any) => {
          console.warn('Browser speech recognition status:', err?.error || err);
        };

        recognitionRef.current = recognizer;
      } catch (e) {
        console.warn('Could not initialize SpeechRecognition:', e);
      }
    }
  }, [selectedLang]);

  // Clean up audio URL and recognition on unmount
  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      if (timerRef.current) clearInterval(timerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
    };
  }, [audioUrl]);

  // Execute AI speech transcription on recorded audio
  const runAiTranscription = async (base64: string, fallbackText: string) => {
    setIsTranscribing(true);
    setTranscribeNotice(null);

    const langName =
      SUPPORTED_LANGUAGES.find((l) => l.code === selectedLang)?.label || 'Auto-detect';

    try {
      const result = await api.transcribeAudio({
        audioBase64: base64,
        spokenLanguage: langName,
        language: selectedLang,
        textFallback: fallbackText
      });

      if (result && result.transcript && result.transcript.trim()) {
        const cleanedText = result.transcript.trim();
        setTranscript(cleanedText);
        setDetectedLanguage(result.detectedLanguage || langName);
        if (result.englishTranslation && result.englishTranslation !== cleanedText) {
          setEnglishTranslation(result.englishTranslation);
        } else {
          setEnglishTranslation('');
        }
        onTranscriptReady(cleanedText, base64, result.detectedLanguage || langName);
      } else if (fallbackText && fallbackText.trim()) {
        // Fall back to live speech recognition text
        setTranscript(fallbackText.trim());
        onTranscriptReady(fallbackText.trim(), base64, langName);
      } else {
        setTranscribeNotice(
          'No clear speech was detected in this recording. Please speak clearly into your microphone, or edit the text box directly.'
        );
        onTranscriptReady(transcript, base64, langName);
      }
    } catch (err) {
      console.warn('AI transcription error, falling back to speech recognition text:', err);
      if (fallbackText && fallbackText.trim()) {
        setTranscript(fallbackText.trim());
        onTranscriptReady(fallbackText.trim(), base64, langName);
      } else {
        setTranscribeNotice('Audio recorded. You can review and refine your craft description below.');
        onTranscriptReady(transcript, base64, langName);
      }
    } finally {
      setIsTranscribing(false);
    }
  };

  // Start Voice Recording
  const startRecording = async () => {
    try {
      setTranscribeNotice(null);
      // Clear previous transcript and reset interim so user gets a fresh recording
      setTranscript('');
      setInterimSpeech('');
      setEnglishTranslation('');
      liveSpeechTextRef.current = '';
      onTranscriptReady('', undefined, detectedLanguage);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];

      // Select mime type supported by browser
      let mimeType = 'audio/webm';
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        mimeType = 'audio/webm;codecs=opus';
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        mimeType = 'audio/mp4';
      } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
        mimeType = 'audio/ogg';
      }

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);

        // Convert blob to base64
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64 = reader.result as string;
          setAudioBase64(base64);

          // Only send to AI if audio contains sufficient data (> 2.5KB)
          if (blob.size >= 2500) {
            await runAiTranscription(base64, liveSpeechTextRef.current);
          } else if (liveSpeechTextRef.current && liveSpeechTextRef.current.trim()) {
            setTranscript(liveSpeechTextRef.current.trim());
            onTranscriptReady(liveSpeechTextRef.current.trim(), base64, detectedLanguage);
          } else {
            setTranscribeNotice('Recording was too short. Please speak clearly into the microphone or enter text directly.');
          }
        };
        reader.readAsDataURL(blob);

        // Stop all audio tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start(250);
      setIsRecording(true);
      setRecordDuration(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordDuration((prev) => prev + 1);
      }, 1000);

      // Start speech recognition if available
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          console.warn('Speech recognition start error:', e);
        }
      }
    } catch (err) {
      console.warn('Microphone permission or hardware issue:', err);
      setInputMode('text');
      setTranscribeNotice(
        'Could not access your microphone directly. Please allow microphone permissions in your browser, or type your craft description below.'
      );
    }
  };

  // Stop Recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
  };

  // Reset Voice
  const handleReset = () => {
    if (isRecording) stopRecording();
    setAudioBlob(null);
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setAudioBase64(undefined);
    setRecordDuration(0);
    setTranscript('');
    setInterimSpeech('');
    setEnglishTranslation('');
    setTranscribeNotice(null);
    liveSpeechTextRef.current = '';
    onTranscriptReady('', undefined, detectedLanguage);
  };

  // Audio Playback
  const togglePlayAudio = () => {
    if (!audioPlayerRef.current || !audioUrl) return;
    if (isPlaying) {
      audioPlayerRef.current.pause();
      setIsPlaying(false);
    } else {
      audioPlayerRef.current.play();
      setIsPlaying(true);
    }
  };

  // Sample Audio/Voice Prompts for Instant Testing
  const handleSelectSamplePrompt = (sampleText: string, langName: string) => {
    setTranscript(sampleText);
    setDetectedLanguage(langName);
    setTranscribeNotice(null);
    setEnglishTranslation('');
    onTranscriptReady(sampleText, undefined, langName);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E5E1DA] shadow-xs p-4 sm:p-6 space-y-4">
      {/* Header & Mode Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#F0EDEA] pb-3">
        <div>
          <h3 className="font-bold text-[#4A3728] text-base sm:text-lg flex items-center gap-2">
            <Mic className="w-5 h-5 text-[#C05D4D]" />
            Artisan Voice Description
          </h3>
          <p className="text-xs text-[#7C6E62]">
            Speak naturally in your mother tongue. AI will convert your voice into an authentic product description.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex bg-[#FAF9F6] border border-[#E5E1DA] p-1 rounded-xl text-xs font-semibold">
            <button
              type="button"
              id="voice-mode-mic-btn"
              onClick={() => setInputMode('voice')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                inputMode === 'voice' ? 'bg-white text-[#4A3728] shadow-xs font-bold' : 'text-[#7C6E62] hover:text-[#4A3728]'
              }`}
            >
              <Mic className="w-3.5 h-3.5" /> Mic
            </button>
            <button
              type="button"
              id="voice-mode-text-btn"
              onClick={() => setInputMode('text')}
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                inputMode === 'text' ? 'bg-white text-[#4A3728] shadow-xs font-bold' : 'text-[#7C6E62] hover:text-[#4A3728]'
              }`}
            >
              <FileText className="w-3.5 h-3.5" /> Text / Samples
            </button>
          </div>
        </div>
      </div>

      {/* Language Selection Row */}
      <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-[#FAF9F6] rounded-xl border border-[#E5E1DA]">
        <div className="flex items-center gap-1.5 text-xs font-bold text-[#4A3728]">
          <Languages className="w-4 h-4 text-[#C05D4D]" />
          <span>I will speak in:</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {SUPPORTED_LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              type="button"
              id={`lang-pill-${lang.code}`}
              disabled={isRecording || isTranscribing}
              onClick={() => {
                setSelectedLang(lang.code);
                setDetectedLanguage(lang.label);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                selectedLang === lang.code
                  ? 'bg-[#C05D4D] text-white shadow-xs'
                  : 'bg-white text-[#7C6E62] border border-[#E5E1DA] hover:text-[#4A3728]'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </div>

      {/* Mode 1: Voice Recording Screen */}
      {inputMode === 'voice' && (
        <div className="text-center py-4">
          {!audioUrl && !isRecording && !isTranscribing ? (
            <div>
              {/* Large Microphone Button for Artisans */}
              <button
                type="button"
                id="start-voice-recording-btn"
                onClick={startRecording}
                className="w-24 h-24 sm:w-28 sm:h-28 mx-auto rounded-full bg-gradient-to-br from-[#C05D4D] to-[#8C3E33] text-white flex flex-col items-center justify-center shadow-lg shadow-[#C05D4D33] hover:shadow-xl hover:scale-105 active:scale-95 transition-all group cursor-pointer"
              >
                <Mic className="w-10 h-10 sm:w-12 sm:h-12 group-hover:scale-110 transition-transform" />
                <span className="text-[11px] font-bold mt-1 uppercase tracking-wider">Tap & Speak</span>
              </button>
              <p className="text-sm font-semibold text-[#4A3728] mt-4">
                Tap the microphone and describe your craft!
              </p>
              <p className="text-xs text-[#7C6E62] max-w-sm mx-auto mt-1">
                Tell us what you made, materials used, time taken, or village tradition.
              </p>
            </div>
          ) : isRecording ? (
            <div className="space-y-4">
              {/* Pulsing Recording Indicator */}
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 mx-auto flex items-center justify-center">
                <span className="absolute inset-0 rounded-full bg-red-400 opacity-30 animate-ping"></span>
                <span className="absolute inset-2 rounded-full bg-red-500 opacity-20 animate-pulse"></span>
                <button
                  type="button"
                  id="stop-voice-recording-btn"
                  onClick={stopRecording}
                  className="relative z-10 w-20 h-20 rounded-full bg-red-600 text-white flex flex-col items-center justify-center shadow-lg hover:bg-red-700 active:scale-95 transition-all cursor-pointer"
                >
                  <Square className="w-7 h-7 fill-white" />
                  <span className="text-[10px] font-bold mt-1 uppercase">Done</span>
                </button>
              </div>

              <div className="flex items-center justify-center gap-2 text-red-600 font-bold text-lg">
                <span className="w-3 h-3 rounded-full bg-red-600 animate-pulse"></span>
                <span>Recording ({formatTime(recordDuration)})</span>
              </div>

              {/* Waveform Animation */}
              <div className="flex items-center justify-center gap-1.5 h-7">
                {[40, 75, 95, 60, 30, 85, 100, 70, 45, 90, 65, 40].map((h, idx) => (
                  <span
                    key={idx}
                    className="w-1 bg-[#C05D4D] rounded-full animate-pulse"
                    style={{
                      height: `${h}%`,
                      animationDelay: `${idx * 80}ms`
                    }}
                  />
                ))}
              </div>

              {/* Live interim speech box */}
              {interimSpeech && (
                <div className="max-w-md mx-auto p-2.5 bg-[#FAF9F6] border border-[#E5E1DA] rounded-xl text-left">
                  <span className="text-[10px] font-bold text-[#7C6E62] uppercase tracking-wider block mb-0.5">
                    Live speech heard:
                  </span>
                  <p className="text-xs text-[#4A3728] italic font-medium">"{interimSpeech}"</p>
                </div>
              )}

              <p className="text-xs text-[#7C6E62]">Tap "Done" when you finish speaking.</p>
            </div>
          ) : isTranscribing ? (
            /* AI Transcription Loading State */
            <div className="py-6 flex flex-col items-center justify-center space-y-3">
              <div className="w-16 h-16 rounded-full bg-[#C05D4D15] text-[#C05D4D] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
              <h4 className="text-sm font-bold text-[#4A3728]">
                Transcribing your voice with AI...
              </h4>
              <p className="text-xs text-[#7C6E62] max-w-xs">
                Listening to the audio recording in {SUPPORTED_LANGUAGES.find((l) => l.code === selectedLang)?.label || 'your language'} and converting to text.
              </p>
            </div>
          ) : (
            /* Recorded Audio Player Card */
            <div className="bg-[#FAF9F6] rounded-xl p-4 max-w-md mx-auto border border-[#E5E1DA] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span className="text-sm font-bold text-[#4A3728]">
                    Voice Note Recorded ({formatTime(recordDuration || 4)})
                  </span>
                </div>
                <button
                  type="button"
                  id="rerecord-voice-btn"
                  onClick={handleReset}
                  className="text-xs text-[#7C6E62] hover:text-[#C05D4D] flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Re-record
                </button>
              </div>

              {audioUrl && (
                <div className="flex items-center justify-center gap-3 pt-2">
                  <audio
                    ref={audioPlayerRef}
                    src={audioUrl}
                    onEnded={() => setIsPlaying(false)}
                    className="hidden"
                  />
                  <button
                    type="button"
                    id="play-voice-btn"
                    onClick={togglePlayAudio}
                    className="px-4 py-2 bg-[#4A3728] text-white rounded-lg text-xs font-semibold flex items-center gap-2 hover:bg-[#2D241E] cursor-pointer"
                  >
                    {isPlaying ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-white" />}
                    {isPlaying ? 'Pause' : 'Play My Voice'}
                  </button>

                  {audioBase64 && (
                    <button
                      type="button"
                      id="retranscribe-voice-btn"
                      disabled={isTranscribing}
                      onClick={() => runAiTranscription(audioBase64, transcript)}
                      className="px-3 py-2 bg-white text-[#C05D4D] border border-[#C05D4D33] rounded-lg text-xs font-semibold flex items-center gap-1.5 hover:bg-[#C05D4D0D] cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5" /> Re-transcribe with AI
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Notice Message if any */}
      {transcribeNotice && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2 text-xs text-amber-900">
          <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <p>{transcribeNotice}</p>
        </div>
      )}

      {/* Transcript & Editable Text Area */}
      <div className="pt-3 border-t border-[#F0EDEA] space-y-2">
        <div className="flex items-center justify-between">
          <label
            htmlFor="voice-transcript-input"
            className="text-xs font-bold text-[#4A3728] uppercase tracking-wider flex items-center gap-1.5"
          >
            <Volume2 className="w-3.5 h-3.5 text-[#C05D4D]" />
            Generated Transcript (What was spoken):
          </label>
          <span className="text-[11px] font-semibold text-[#8C3E33] bg-[#C05D4D15] px-2.5 py-0.5 rounded-full border border-[#C05D4D33] flex items-center gap-1">
            <Globe2 className="w-3 h-3" />
            {detectedLanguage}
          </span>
        </div>

        <textarea
          id="voice-transcript-input"
          value={transcript}
          onChange={(e) => {
            const val = e.target.value;
            setTranscript(val);
            onTranscriptReady(val, audioBase64, detectedLanguage);
          }}
          placeholder="What you spoke will appear here automatically. You can also edit or type your craft description freely..."
          rows={3}
          className="w-full text-sm p-3.5 rounded-xl border border-[#E5E1DA] focus:outline-none focus:ring-2 focus:ring-[#C05D4D] focus:border-[#C05D4D] bg-[#FAF9F6] text-[#4A3728] leading-relaxed font-normal"
        />

        {/* English Translation Preview (if spoken in regional language) */}
        {englishTranslation && (
          <div className="p-3 rounded-xl bg-stone-50 border border-[#E5E1DA] text-xs space-y-1">
            <span className="font-bold text-[#7C6E62] flex items-center gap-1 uppercase tracking-wider text-[10px]">
              <Sparkles className="w-3 h-3 text-[#C05D4D]" />
              English Translation (Ready for E-Commerce Buyers):
            </span>
            <p className="text-[#4A3728] italic">"{englishTranslation}"</p>
          </div>
        )}

        {/* Quick Sample Prompts (For Demo & Testing) */}
        <div className="pt-2">
          <span className="text-[11px] font-semibold text-[#7C6E62] block mb-1.5">
            Quick One-Click Artisan Prompts (For Demo / Testing without Mic):
          </span>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              id="sample-telugu-voice-btn"
              onClick={() =>
                handleSelectSamplePrompt(
                  'ఇది చేతితో చేసిన వెదురు బుట్ట. దీనిని తయారు చేయడానికి సుమారు మూడు గంటల సమయం పడుతుంది. విశాఖపట్నం సహజ వెదురుతో చేశాను.',
                  'Telugu (తెలుగు)'
                )
              }
              className="text-xs bg-[#C05D4D0D] hover:bg-[#C05D4D1A] text-[#8C3E33] border border-[#C05D4D33] rounded-lg px-2.5 py-1.5 text-left font-medium transition-colors cursor-pointer"
            >
              🎋 తెలుగు: వెదురు బుట్ట (Bamboo Basket)
            </button>
            <button
              type="button"
              id="sample-hindi-voice-btn"
              onClick={() =>
                handleSelectSamplePrompt(
                  'यह प्राकृतिक मिट्टी से बना पारंपरिक पानी का मटका है। इसमें पानी प्राकृतिक रूप से ठंडा रहता है और इसे बनाने में दो घंटे का समय लगा।',
                  'Hindi (हिन्दी)'
                )
              }
              className="text-xs bg-[#FAF9F6] hover:bg-[#F0EDEA] text-[#4A3728] border border-[#E5E1DA] rounded-lg px-2.5 py-1.5 text-left font-medium transition-colors cursor-pointer"
            >
              🏺 हिन्दी: मिट्टी का घड़ा (Clay Pot)
            </button>
            <button
              type="button"
              id="sample-english-voice-btn"
              onClick={() =>
                handleSelectSamplePrompt(
                  'This is a handwoven storage basket made using seasoned hill bamboo. Durable, eco-friendly, and takes 3 hours of artisan weaving.',
                  'English'
                )
              }
              className="text-xs bg-[#FAF9F6] hover:bg-[#F0EDEA] text-[#4A3728] border border-[#E5E1DA] rounded-lg px-2.5 py-1.5 text-left font-medium transition-colors cursor-pointer"
            >
              🌿 English: Bamboo Basket
            </button>
            <button
              type="button"
              id="sample-tamil-voice-btn"
              onClick={() =>
                handleSelectSamplePrompt(
                  'இது இயற்கையான மூங்கில் கொண்டு கைவினையாக செய்யப்பட்ட கூடை. இதை நெய்ய சுமார் 3 மணிநேரம் ஆனது. வீட்டு சேமிப்பிற்கும் அலங்காரத்திற்கும் மிகவும் உறுதியானது.',
                  'Tamil (தமிழ்)'
                )
              }
              className="text-xs bg-[#FAF9F6] hover:bg-[#F0EDEA] text-[#4A3728] border border-[#E5E1DA] rounded-lg px-2.5 py-1.5 text-left font-medium transition-colors cursor-pointer"
            >
              🎋 தமிழ்: மூங்கில் கூடை (Bamboo Basket)
            </button>
            <button
              type="button"
              id="sample-kannada-voice-btn"
              onClick={() =>
                handleSelectSamplePrompt(
                  'ಇದು ನೈಸರ್ಗಿಕ ಬೆಟ್ಟದ ಬಿದಿರಿನಿಂದ ಕೈಯಿಂದ ನೇಯ್ದ ಬುಟ್ಟಿ. ತಯಾರಿಸಲು ಸುಮಾರು 3 ಗಂಟೆ ಬೇಕಾಯಿತು. ದೀರ್ಘಕಾಲ ಬಾಳಿಕೆ ಬರುವ ನೈಸರ್ಗಿಕ ಕರಕುಶಲ ವಸ್ತು.',
                  'Kannada (ಕನ್ನಡ)'
                )
              }
              className="text-xs bg-[#FAF9F6] hover:bg-[#F0EDEA] text-[#4A3728] border border-[#E5E1DA] rounded-lg px-2.5 py-1.5 text-left font-medium transition-colors cursor-pointer"
            >
              🎋 ಕನ್ನಡ: ಬಿದಿರಿನ ಬುಟ್ಟಿ (Bamboo Basket)
            </button>
            <button
              type="button"
              id="sample-marathi-voice-btn"
              onClick={() =>
                handleSelectSamplePrompt(
                  'ही शुद्ध मातीपासून हाताने बनवलेली पारंपरिक पाण्याची सुरई आहे. पाणी नैसर्गिकरित्या थंड ठेवते आणि बनवण्यासाठी २ तास लागले.',
                  'Marathi (मराठी)'
                )
              }
              className="text-xs bg-[#FAF9F6] hover:bg-[#F0EDEA] text-[#4A3728] border border-[#E5E1DA] rounded-lg px-2.5 py-1.5 text-left font-medium transition-colors cursor-pointer"
            >
              🏺 मराठी: मातीची सुरई (Earthen Surai)
            </button>
            <button
              type="button"
              id="sample-bengali-voice-btn"
              onClick={() =>
                handleSelectSamplePrompt(
                  'এটি প্রাকৃতিক বাঁশ ও বেতের তৈরি ঐতিহ্যবাহী হস্তশিল্প ঝুড়ি। এটি সম্পূর্ণ হাতে তৈরি করতে প্রায় ৩ ঘণ্টা সময় লেগেছে।',
                  'Bengali (বাংলা)'
                )
              }
              className="text-xs bg-[#FAF9F6] hover:bg-[#F0EDEA] text-[#4A3728] border border-[#E5E1DA] rounded-lg px-2.5 py-1.5 text-left font-medium transition-colors cursor-pointer"
            >
              🎋 বাংলা: বাঁশের ঝুড়ি (Bamboo Basket)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
