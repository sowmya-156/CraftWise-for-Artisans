// Universal High-Fidelity Text-to-Speech Engine
// Seamlessly plays native regional Indian language speech (Telugu, Hindi, Tamil, etc.)
// Uses high-speed backend audio proxy with automated fallback to Web Speech API.

let currentAudio: HTMLAudioElement | null = null;
let currentAbortController: AbortController | null = null;
let isCurrentlySpeaking = false;

export interface TTSCallbacks {
  onStart?: () => void;
  onEnd?: () => void;
  onError?: (error: any) => void;
}

/**
 * Stop any ongoing TTS audio playback or browser speech synthesis
 */
export function stopTextToSpeech() {
  if (currentAbortController) {
    currentAbortController.abort();
    currentAbortController = null;
  }

  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      currentAudio.src = '';
    } catch {
      // Ignore cleanup error
    }
    currentAudio = null;
  }

  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {
      // Ignore cleanup error
    }
  }

  isCurrentlySpeaking = false;
}

/**
 * Check if TTS is currently active
 */
export function isSpeakingTTS(): boolean {
  return isCurrentlySpeaking;
}

/**
 * Play text aloud in the specified language (Telugu, Hindi, Tamil, Bengali, etc.)
 */
export function playTextToSpeech(
  text: string,
  langCode: string,
  callbacks?: TTSCallbacks
): () => void {
  // Always stop previous playback before starting new one
  stopTextToSpeech();

  if (!text || !text.trim()) {
    callbacks?.onEnd?.();
    return () => {};
  }

  const cleanText = text.trim();
  const cleanLang = (langCode || 'te').split('-')[0].split('_')[0].toLowerCase();
  isCurrentlySpeaking = true;

  const controller = new AbortController();
  currentAbortController = controller;

  const handleEnd = () => {
    isCurrentlySpeaking = false;
    currentAudio = null;
    currentAbortController = null;
    callbacks?.onEnd?.();
  };

  const handleFallback = () => {
    if (controller.signal.aborted) return;

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(cleanText);
        utterance.lang = `${cleanLang}-IN`;
        utterance.rate = 0.92;

        // Try to locate a matching voice if available
        const voices = window.speechSynthesis.getVoices();
        const matchedVoice = voices.find(
          (v) =>
            v.lang.toLowerCase().startsWith(cleanLang) ||
            v.lang.toLowerCase().replace('_', '-').startsWith(cleanLang)
        );
        if (matchedVoice) utterance.voice = matchedVoice;

        utterance.onstart = () => {
          if (!controller.signal.aborted) {
            callbacks?.onStart?.();
          }
        };
        utterance.onend = () => handleEnd();
        utterance.onerror = (err) => {
          console.warn('SpeechSynthesis fallback error:', err);
          handleEnd();
        };

        window.speechSynthesis.speak(utterance);
        return;
      } catch (synthErr) {
        console.warn('SpeechSynthesis exception:', synthErr);
      }
    }

    handleEnd();
  };

  try {
    const ttsUrl = `/api/tts?lang=${encodeURIComponent(cleanLang)}&text=${encodeURIComponent(cleanText)}`;
    const audio = new Audio(ttsUrl);
    currentAudio = audio;

    let hasStarted = false;

    audio.onplay = () => {
      if (controller.signal.aborted) {
        audio.pause();
        return;
      }
      if (!hasStarted) {
        hasStarted = true;
        callbacks?.onStart?.();
      }
    };

    audio.onended = () => {
      handleEnd();
    };

    audio.onerror = () => {
      console.warn('Primary audio stream error, falling back to Web Speech API');
      handleFallback();
    };

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          if (!hasStarted && !controller.signal.aborted) {
            hasStarted = true;
            callbacks?.onStart?.();
          }
        })
        .catch((playErr) => {
          if (controller.signal.aborted) return;
          console.warn('Audio play() rejected, falling back:', playErr);
          handleFallback();
        });
    }
  } catch (err) {
    console.warn('Audio initialization exception:', err);
    handleFallback();
  }

  return () => {
    stopTextToSpeech();
  };
}
