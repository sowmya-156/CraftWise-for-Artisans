export interface ChatLanguageInfo {
  code: string;
  name: string;
  native: string;
  speechLang: string;
  region: string;
}

export const CHAT_LANGUAGES: Record<string, ChatLanguageInfo> = {
  te: {
    code: 'te',
    name: 'Telugu',
    native: 'తెలుగు',
    speechLang: 'te-IN',
    region: 'Andhra Pradesh & Telangana'
  },
  hi: {
    code: 'hi',
    name: 'Hindi',
    native: 'हिन्दी',
    speechLang: 'hi-IN',
    region: 'North & Central India'
  },
  en: {
    code: 'en',
    name: 'English',
    native: 'English',
    speechLang: 'en-IN',
    region: 'India / Global'
  },
  ta: {
    code: 'ta',
    name: 'Tamil',
    native: 'தமிழ்',
    speechLang: 'ta-IN',
    region: 'Tamil Nadu'
  },
  kn: {
    code: 'kn',
    name: 'Kannada',
    native: 'ಕನ್ನಡ',
    speechLang: 'kn-IN',
    region: 'Karnataka'
  },
  ml: {
    code: 'ml',
    name: 'Malayalam',
    native: 'മലയാളം',
    speechLang: 'ml-IN',
    region: 'Kerala'
  },
  mr: {
    code: 'mr',
    name: 'Marathi',
    native: 'मराठी',
    speechLang: 'mr-IN',
    region: 'Maharashtra'
  },
  bn: {
    code: 'bn',
    name: 'Bengali',
    native: 'বাংলা',
    speechLang: 'bn-IN',
    region: 'West Bengal'
  },
  or: {
    code: 'or',
    name: 'Odia',
    native: 'ଓଡ଼ିଆ',
    speechLang: 'or-IN',
    region: 'Odisha'
  }
};

export const CHAT_LANGUAGE_LIST: ChatLanguageInfo[] = Object.values(CHAT_LANGUAGES);

export const QUICK_BARGAIN_TEMPLATES: Record<string, string[]> = {
  en: [
    'Namaste! What is your best bulk order price?',
    'Can you offer ₹... per unit for 20+ pieces?',
    'Is this 100% authentic handmade?',
    'How many days will it take for delivery to my address?',
    'Can I customize the color and dimensions?'
  ],
  te: [
    'నమస్కారం! బల్క్ ఆర్డర్ కోసం మీ ఉత్తమ ధర ఎంత?',
    '20 కంటే ఎక్కువ వస్తువులకు ధర తగ్గించగలరా?',
    'ఇది 100% అసలైన చేతితో చేసిన పనేనా?',
    'డెలివరీకి ఎన్ని రోజులు పడుతుంది?',
    'రంగులు మరియు కొలతలను మార్చగలరా?'
  ],
  hi: [
    'नमस्ते! थोक ऑर्डर के लिए सबसे अच्छी कीमत क्या है?',
    '20 या अधिक पीस पर क्या छूट मिल सकती है?',
    'क्या यह 100% प्रामाणिक हस्तनिर्मित है?',
    'डिलीवरी में कितने दिन लगेंगे?',
    'क्या रंग और आकार कस्टमाइज़ हो सकते हैं?'
  ],
  ta: [
    'வணக்கம்! மொத்த ஆர்டருக்கு உங்களின் சிறந்த விலை என்ன?',
    '20 க்கும் மேற்பட்ட பொருட்களுக்கு தள்ளுபடி கிடைக்குமா?',
    'இது 100% கைவினைப் பொருளா?',
    'டெலிவரிக்கு எத்தனை நாட்கள் ஆகும்?'
  ],
  kn: [
    'ನಮಸ್ಕಾರ! ಬೃಹತ್ ಆರ್ಡರ್‌ಗೆ ನಿಮ್ಮ ಅತ್ಯುತ್ತಮ ಬೆಲೆ ಎಷ್ಟು?',
    '20 ಕ್ಕಿಂತ ಹೆಚ್ಚು ತುಣುಕುಗಳಿಗೆ ರಿಯಾಯಿತಿ ನೀಡಬಹುದೇ?',
    'ಇದು 100% ಅಧಿಕೃತ ಕೈಯಿಂದ ಮಾಡಲ್ಪಟ್ಟಿದೆಯೇ?',
    'ವಿತರಣೆಗೆ ಎಷ್ಟು ದಿನಗಳು ಬೇಕಾಗುತ್ತವೆ?'
  ],
  ml: [
    'നമസ്കാരം! ബൾക്ക് ഓർഡറിന് നിങ്ങളുടെ ഏറ്റവും നല്ല വില എത്രയാണ്?',
    '20 ൽ കൂടുതൽ വാങ്ങിയാൽ ഇളവ് നൽകുമോ?',
    'ഇത് 100% യഥാർത്ഥ കൈകൊണ്ട് നിർമ്മിച്ചതാണോ?'
  ],
  mr: [
    'नमस्ते! घाऊक ऑर्डरीसाठी तुमची सर्वोत्तम किंमत काय आहे?',
    '२० पेक्षा जास्त वस्तूंवर सवलत मिळेल का?',
    'हे उत्पादन १००% अस्सल हस्तनिर्मित आहे का?'
  ],
  bn: [
    'নমস্কার! পাইকারি অর্ডারের জন্য আপনার সেরা মূল্য কত?',
    '২০ টির বেশি পণ্যে কি কোনো ছাড় পাওয়া যাবে?',
    'এটি কি ১০০% খাঁটি হাতে তৈরি?'
  ],
  or: [
    'ନମସ୍କାର! ବଲ୍କ ଅର୍ଡର ପାଇଁ ଆପଣଙ୍କର ସର୍ବୋତ୍ତମ ମୂଲ୍ୟ କେତେ?',
    '20ରୁ ଅଧିକ ଜିନିଷରେ କିଛି ରିହାତି ମିଳିପାରିବ କି?',
    'ଏହା କଣ 100% ପ୍ରାମାଣିକ ହାତ ତିଆରି?'
  ]
};
