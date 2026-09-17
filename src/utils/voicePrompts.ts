// 9-Regional Indian Language Spoken Prompts & Audio Assistant for Artisan Registration

export interface VoicePromptConfig {
  promptText: string;
  englishMeaning: string;
}

export const VOICE_PROMPTS_BY_FIELD: Record<string, Record<string, string>> = {
  'full name': {
    te: 'దయచేసి మీ పూర్తి పేరు చెప్పండి',
    hi: 'कृपया अपना पूरा नाम बोलिए',
    ta: 'தயவுசெய்து உங்கள் முழு பெயரை சொல்லுங்கள்',
    kn: 'ದಯವಿಟ್ಟು ನಿಮ್ಮ ಪೂರ್ಣ ಹೆಸರನ್ನು ಹೇಳಿ',
    ml: 'ദയവായി നിങ്ങളുടെ മുഴുവൻ പേര് പറയൂ',
    bn: 'দয়া করে আপনার পুরো নাম বলুন',
    mr: 'कृपया आपले पूर्ण नाव सांगा',
    or: 'ଦୟାକରି ଆପଣଙ୍କ ପୂରା ନାମ କୁହନ୍ତୁ',
    en: 'Please say your full name'
  },
  'mobile number': {
    te: 'దయచేసి మీ పది అంకెల మొబైల్ నంబర్ చెప్పండి',
    hi: 'कृपया अपना 10 अंकों का मोबाइल नंबर बोलिए',
    ta: 'தயவுசெய்து உங்கள் 10 இலக்க மொபைல் எண்ணை சொல்லுங்கள்',
    kn: 'ದಯವಿಟ್ಟು ನಿಮ್ಮ 10 ಅಂಕಿಗಳ ಮೊಬೈಲ್ ಸಂಖ್ಯೆ ಹೇಳಿ',
    ml: 'ദയവായി നിങ്ങളുടെ 10 അക്ക മൊബൈൽ നമ്പർ പറയൂ',
    bn: 'দয়া করে আপনার ১০ সংখ্যার মোবাইল নম্বর বলুন',
    mr: 'कृपया आपला 10 अंकी मोबाईल नंबर सांगा',
    or: 'ଦୟାକରି ଆପଣଙ୍କ ଦଶ ଅଙ୍କର ମୋବାଇଲ୍ ନମ୍ବର କୁହନ୍ତୁ',
    en: 'Please say your 10 digit mobile number'
  },
  'email address': {
    te: 'దయచేసి మీ ఈమెయిల్ అడ్రస్ చెప్పండి',
    hi: 'कृपया अपना ईमेल एड्रेस बोलिए',
    ta: 'தயவுசெய்து உங்கள் மின்னஞ்சல் முகவரியை சொல்லுங்கள்',
    kn: 'ದಯವಿಟ್ಟು ನಿಮ್ಮ ಇಮೇಲ್ ವಿಳಾಸವನ್ನು ಹೇಳಿ',
    ml: 'ദയവായി നിങ്ങളുടെ ഇമെയിൽ വിലാസം പറയൂ',
    bn: 'দয়া করে আপনার ইমেল ঠিকানা বলুন',
    mr: 'कृपया आपला ईमेल पत्ता सांगा',
    or: 'ଦୟାକରି ଆପଣଙ୍କ ଇମେଲ୍ ଠିକଣା କୁହନ୍ତୁ',
    en: 'Please say your email address'
  },
  'password': {
    te: 'దయచేసి మీ కొత్త పాస్‌వర్డ్ చెప్పండి',
    hi: 'कृपया अपना नया पासवर्ड बोलिए',
    ta: 'தயவுசெய்து உங்கள் புதிய கடவுச்சொல்லை சொல்லுங்கள்',
    kn: 'ದಯವಿಟ್ಟು ನಿಮ್ಮ ಹೊಸ ಪಾಸ್‌ವರ್ಡ್ ಹೇಳಿ',
    ml: 'ദയവായി പുതിയ പാസ്‌വേഡ് പറയൂ',
    bn: 'দয়া করে আপনার নতুন পাসওয়ার্ড বলুন',
    mr: 'कृपया आपला नवीन पासवर्ड सांगा',
    or: 'ଦୟାକରି ଆପଣଙ୍କ ନୂଆ ପାସୱାର୍ଡ କୁହନ୍ତୁ',
    en: 'Please say your new password'
  },
  'confirm password': {
    te: 'దయచేసి నిర్ధారణ కోసం పాస్‌వర్డ్ మళ్లీ చెప్పండి',
    hi: 'कृपया पुष्टि के लिए पासवर्ड दोबारा बोलिए',
    ta: 'தயவுசெய்து உறுதிப்படுத்த கடவுச்சொல்லை மீண்டும் சொல்லுங்கள்',
    kn: 'ದಯವಿಟ್ಟು ದೃಢೀಕರಿಸಲು ಪಾಸ್‌ವರ್ಡ್ ಮತ್ತೆ ಹೇಳಿ',
    ml: 'ദയവായി സ്ഥിരീകരിക്കാൻ പാസ്‌വേഡ് വീണ്ടും പറയൂ',
    bn: 'দয়া করে নিশ্চিত করতে পাসওয়ার্ড পুনরায় বলুন',
    mr: 'कृपया खात्री करण्यासाठी पासवर्ड पुन्हा सांगा',
    or: 'ଦୟାକରି ନିଶ୍ଚିତ କରିବାକୁ ପାସୱାର୍ଡ ପୁନର୍ବାର କୁହନ୍ତୁ',
    en: 'Please say your password again to confirm'
  },
  'otp code': {
    te: 'దయచేసి మీకు వచ్చిన ఆరు అంకెల ఓటీపీ కోడ్ చెప్పండి',
    hi: 'कृपया छह अंकों का ओटीपी कोड बोलिए',
    ta: 'தயவுசெய்து ஆறு இலக்க OTP குறியீட்டை சொல்லுங்கள்',
    kn: 'ದಯವಿಟ್ಟು ಆರು ಅಂಕಿಗಳ ಒಟಿಪಿ ಕೋಡ್ ಹೇಳಿ',
    ml: 'ദയവായി ലഭിച്ച ആറക്ക ഒടിപി കോഡ് പറയൂ',
    bn: 'দয়া করে প্রাপ্ত ছয় অঙ্কের ওটিপি কোড বলুন',
    mr: 'कृपया मिळालेला सहा अंकी ओटीपी कोड सांगा',
    or: 'ଦୟାକରି ଛଅ ଅଙ୍କର ଓଟିପି କୋଡ୍ କୁହନ୍ତୁ',
    en: 'Please say the 6 digit OTP code'
  },
  'language': {
    te: 'మీకు నచ్చిన భాష లేదా మాతృభాష చెప్పండి',
    hi: 'कृपया अपनी पसंदीदा भाषा बोलिए',
    ta: 'உங்கள் விருப்ப மொழியை சொல்லுங்கள்',
    kn: 'ನಿಮ್ಮ ಆದ್ಯತೆಯ ಭಾಷೆಯನ್ನು ಹೇಳಿ',
    ml: 'നിങ്ങളുടെ ഇഷ്ട ഭാഷ പറയൂ',
    bn: 'আপনার পছন্দের ভাষা বলুন',
    mr: 'आपली पसंतीची भाषा सांगा',
    or: 'ଆପଣଙ୍କ ପସନ୍ଦର ଭାଷା କୁହନ୍ତୁ',
    en: 'Please say your preferred language'
  },
  'state': {
    te: 'దయచేసి మీ రాష్ట్రం పేరు చెప్పండి',
    hi: 'कृपया अपने राज्य का नाम बोलिए',
    ta: 'தயவுசெய்து உங்கள் மாநிலத்தின் பெயரை சொல்லுங்கள்',
    kn: 'ದಯವಿಟ್ಟು ನಿಮ್ಮ ರಾಜ್ಯದ ಹೆಸರು ಹೇಳಿ',
    ml: 'ദയവായി നിങ്ങളുടെ സംസ്ഥാനത്തിന്റെ പേര് പറയൂ',
    bn: 'দয়া করে আপনার রাজ্যের নাম বলুন',
    mr: 'कृपया आपल्या राज्याचे नाव सांगा',
    or: 'ଦୟାକରି ଆପଣଙ୍କ ରାଜ୍ୟର ନାମ କୁହନ୍ତୁ',
    en: 'Please say your state name'
  },
  'district': {
    te: 'దయచేసి మీ జిల్లా పేరు చెప్పండి',
    hi: 'कृपया अपने जिले का नाम बोलिए',
    ta: 'தயவுசெய்து உங்கள் மாவட்டத்தின் பெயரை சொல்லுங்கள்',
    kn: 'ದಯವಿಟ್ಟು ನಿಮ್ಮ ಜಿಲ್ಲೆಯ ಹೆಸರು ಹೇಳಿ',
    ml: 'ദയവായി നിങ്ങളുടെ ജില്ലയുടെ പേര് പറയൂ',
    bn: 'দয়া করে আপনার জেলার নাম বলুন',
    mr: 'कृपया आपल्या जिल्ह्याचे नाव सांगा',
    or: 'ଦୟାକରି ଆପଣଙ୍କ ଜିଲ୍ଲାର ନାମ କୁହନ୍ତୁ',
    en: 'Please say your district name'
  },
  'craft type': {
    te: 'దయచేసి మీ ప్రధాన చేతివృత్తి లేదా హస్తకళ రకం చెప్పండి',
    hi: 'कृपया अपनी मुख्य हस्तकला या शिल्प का प्रकार बोलिए',
    ta: 'தயவுசெய்து உங்கள் முதன்மை கைவினைப் பொருளின் வகையை சொல்லுங்கள்',
    kn: 'ದಯವಿಟ್ಟು ನಿಮ್ಮ ಮುಖ್ಯ ಕರಕುಶಲ ಕಲೆಯ ಪ್ರಕಾರ ಹೇಳಿ',
    ml: 'ദയവായി നിങ്ങളുടെ പ്രധാന കരകൗശല വിദ്യ ഏതാണെന്ന് പറയൂ',
    bn: 'দয়া করে আপনার প্রধান হস্তশিল্পের ধরন বলুন',
    mr: 'कृपया आपल्या मुख्य हस्तकलेचा प्रकार सांगा',
    or: 'ଦୟାକରି ଆପଣଙ୍କ ମୁଖ୍ୟ ହସ୍ତଶିଳ୍ପର ପ୍ରକାର କୁହନ୍ତୁ',
    en: 'Please say your primary craft type'
  },
  'cooperative name': {
    te: 'దయచేసి మీ సహకార సంఘం లేదా స్వయం సహాయక బృందం పేరు చెప్పండి',
    hi: 'कृपया अपनी समिति या स्वयं सहायता समूह का नाम बोलिए',
    ta: 'தயவுசெய்து உங்கள் கூட்டுறவு சங்கம் அல்லது சுய உதவிக்குழுவின் பெயரை சொல்லுங்கள்',
    kn: 'ದಯವಿಟ್ಟು ನಿಮ್ಮ ಸಹಕಾರ ಸಂಘ ಅಥವಾ ಸ್ವಸಹಾಯ ಸಂಘದ ಹೆಸರು ಹೇಳಿ',
    ml: 'ദയവായി സഹകരണ സംഘം അല്ലെങ്കിൽ സ്വയംസഹായ സംഘത്തിന്റെ പേര് പറയൂ',
    bn: 'দয়া করে আপনার সমবায় বা স্বনির্ভর দলের নাম বলুন',
    mr: 'कृपया आपली सहकारी संस्था किंवा बचत गटाचे नाव सांगा',
    or: 'ଦୟାକରି ଆପଣଙ୍କ ସମବାୟ ସମିତି ବା ସ୍ୱୟଂ ସହାୟକ ଗୋଷ୍ଠୀର ନାମ କୁହନ୍ତୁ',
    en: 'Please say your cooperative or self help group name'
  },
  'city': {
    te: 'దయచేసి మీ నగరం లేదా గ్రామం పేరు చెప్పండి',
    hi: 'कृपया अपने शहर या कस्बे का नाम बोलिए',
    ta: 'தயவுசெய்து உங்கள் நகரம் அல்லது ஊரின் பெயரை சொல்லுங்கள்',
    kn: 'ದಯವಿಟ್ಟು ನಿಮ್ಮ ಊರು ಅಥವಾ ನಗರದ ಹೆಸರು ಹೇಳಿ',
    ml: 'ദയവായി നിങ്ങളുടെ നഗരത്തിന്റെ പേര് പറയൂ',
    bn: 'দয়া করে আপনার শহর বা গ্রামের নাম বলুন',
    mr: 'कृपया आपल्या शहराचे किंवा गावाचे नाव सांगा',
    or: 'ଦୟାକରି ଆପଣଙ୍କ ସହର ବା ଗ୍ରାମର ନାମ କୁହନ୍ତୁ',
    en: 'Please say your city or town name'
  },
  'delivery address': {
    te: 'దయచేసి మీ డెలివరీ చిరునామా చెప్పండి',
    hi: 'कृपया अपना डिलीवरी पता बोलिए',
    ta: 'தயவுசெய்து உங்கள் டெலிவரி முகவரியை சொல்லுங்கள்',
    kn: 'ದಯವಿಟ್ಟು ನಿಮ್ಮ ವಿತರಣಾ ವಿಳಾಸ ಹೇಳಿ',
    ml: 'ദയവായി ഡെലിവറി വിലാസം പറയൂ',
    bn: 'দয়া করে আপনার ডেলিভারি ঠিকানা বলুন',
    mr: 'कृपया आपला पत्ता सांगा',
    or: 'ଦୟାକରି ଆପଣଙ୍କ ଡେଲିଭରୀ ଠିକଣା କୁହନ୍ତୁ',
    en: 'Please say your delivery address'
  }
};

// Generic fallback phrases for any field
export const GENERIC_PROMPTS_BY_LANG: Record<string, (fieldName: string) => string> = {
  te: (fieldName) => `దయచేసి మీ ${fieldName} చెప్పండి`,
  hi: (fieldName) => `कृपया अपना ${fieldName} बोलिए`,
  ta: (fieldName) => `தயவுசெய்து உங்கள் ${fieldName} சொல்லுங்கள்`,
  kn: (fieldName) => `ದಯವಿಟ್ಟು ನಿಮ್ಮ ${fieldName} ಹೇಳಿ`,
  ml: (fieldName) => `ദയവായി നിങ്ങളുടെ ${fieldName} പറയൂ`,
  bn: (fieldName) => `দয়া করে আপনার ${fieldName} বলুন`,
  mr: (fieldName) => `कृपया आपले ${fieldName} सांगा`,
  or: (fieldName) => `ଦୟାକରି ଆପଣଙ୍କ ${fieldName} କୁହନ୍ତୁ`,
  en: (fieldName) => `Please say your ${fieldName}`
};

// Intro guide speech prompts explaining how to use voice registration in each language
export const GUIDE_INTRO_PROMPTS_BY_LANG: Record<string, string> = {
  te: 'నమస్కారం. క్రాఫ్ట్‌వైస్ రిజిస్ట్రేషన్‌కు స్వాగతం. ఏ బాక్స్ పక్కనైనా ధ్వని లేదా మైక్ గుర్తును తాకి మాట్లాడితే మీ సమాధానం నమోదు అవుతుంది.',
  hi: 'नमस्ते। क्राफ्टवाइज पंजीकरण में आपका स्वागत है। किसी भी बॉक्स के पास ध्वनि या माइक आइकन दबाकर बोलें और आसानी से विवरण भरें।',
  ta: 'வணக்கம். கிராஃப்ட்வைஸ் பதிவுக்கு வரவேற்கிறோம். ஒலி அல்லது மைக் ஐகானைத் தட்டிப் பேசி எளிதாக பதிவு செய்யுங்கள்.',
  kn: 'ನಮಸ್ಕಾರ. ಕ್ರಾಫ್ಟ್‌ವೈಸ್ ನೋಂದಣಿಗೆ ಸ್ವಾಗತ. ಧ್ವನಿ ಅಥವಾ ಮೈಕ್ ಐಕಾನ್ ಒತ್ತಿ ಮಾತನಾಡಿ ಸುಲಭವಾಗಿ ನೋಂದಾಯಿಸಿ.',
  ml: 'നമസ്കാരം. ക്രാഫ്റ്റ്‌വൈസ് രജിസ്ട്രേഷനിലേക്ക് സ്വാഗതം. ശബ്ദ അല്ലെങ്കിൽ മൈക്ക് ഐക്കണിൽ അമർത്തി സംസാരിച്ച് എളുപ്പത്തിൽ വിവരങ്ങൾ നൽകുക.',
  bn: 'নমস্কার। ক্রাফ্টওয়াইজ রেজিস্ট্রেশনে স্বাগতম। সাউন্ড বা মাইক আইকন ট্যাপ করে কথা বলুন এবং সহজে ফর্ম পূরণ করুন।',
  mr: 'नमस्कार। क्राफ्टवाइज नोंदणीमध्ये आपले स्वागत आहे. ध्वनी किंवा माइक चिन्हावर टॅप करून बोलून सहजपणे फॉर्म भरा.',
  or: 'ନମସ୍କାର। କ୍ରାଫ୍ଟୱାଇଜ୍ ପଞ୍ଜୀକରଣକୁ ସ୍ୱାଗତ। ଧ୍ୱନି ବା ମାଇକ୍ ଆଇକନ୍ ଟ୍ୟାପ୍ କରି କୁହନ୍ତୁ ଏବଂ ସହଜରେ ଫର୍ମ ପୂରଣ କରନ୍ତୁ।',
  en: 'Welcome to CraftWise registration. Tap the sound or mic icon beside any box to hear instructions and speak your details.'
};

export function getGuideIntroPrompt(langCode: string): string {
  const clean = (langCode || 'te').split('-')[0].split('_')[0].toLowerCase();
  return GUIDE_INTRO_PROMPTS_BY_LANG[clean] || GUIDE_INTRO_PROMPTS_BY_LANG['en'];
}

export function getVoicePromptForField(fieldLabel: string, langCode: string): string {
  const normKey = fieldLabel.toLowerCase().trim();
  const prompts = VOICE_PROMPTS_BY_FIELD[normKey];
  if (prompts && prompts[langCode]) {
    return prompts[langCode];
  }
  if (prompts && prompts['en']) {
    return prompts['en'];
  }
  const genericBuilder = GENERIC_PROMPTS_BY_LANG[langCode] || GENERIC_PROMPTS_BY_LANG['en'];
  return genericBuilder(fieldLabel);
}

// Play pleasant web audio chimes for multimodal feedback
export function playChimeTone(type: 'prompt' | 'success' | 'listening') {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    if (type === 'listening') {
      // Gentle two-tone ping to indicate mic is open
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12); // A5
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.22);
    } else if (type === 'success') {
      // Upbeat 3-note celebration chime (C5 -> E5 -> G5)
      const now = ctx.currentTime;
      [523.25, 659.25, 783.99].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        gain.gain.setValueAtTime(0.12, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.18);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.2);
      });
    }
  } catch {
    // AudioContext blocked or not allowed, ignore silently
  }
}
