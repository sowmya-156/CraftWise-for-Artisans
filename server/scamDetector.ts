import { GoogleGenAI } from '@google/genai';
import { ScamAnalysis, ScamCategory, ScamRiskLevel } from './types.js';

let genAIClient: GoogleGenAI | null = null;

function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || apiKey.trim() === '') {
    return null;
  }
  if (!genAIClient) {
    genAIClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    });
  }
  return genAIClient;
}

/**
 * Redact sensitive credentials before sending text to any external AI analysis
 * to ensure privacy and security.
 */
function sanitizeForPrivacy(text: string): string {
  if (!text) return '';
  return text
    // Redact 16-digit payment card numbers
    .replace(/\b(?:\d[ -]*?){13,16}\b/g, '[CARD_NUMBER_REDACTED]')
    // Redact suspected numeric OTPs (4 to 8 consecutive digits preceded by otp/code keywords)
    .replace(/(?:otp|code|pin|code is|pin is)\s*[:=]?\s*(\b\d{4,8}\b)/gi, 'otp: [REDACTED_CODE]')
    // Redact bank account numbers (9 to 18 consecutive digits)
    .replace(/\b\d{9,18}\b/g, '[ACCOUNT_REDACTED]');
}

// Multilingual translations for Safety Titles, Reasons, and Action Advice
const LOCALIZED_TEMPLATES: Record<
  string,
  {
    titles: Record<ScamRiskLevel, string>;
    otpWarning: { reason: string; advice: string };
    fakeFeeWarning: { reason: string; advice: string };
    suspiciousLinkWarning: { reason: string; advice: string };
    fakeQrWarning: { reason: string; advice: string };
    urgencyWarning: { reason: string; advice: string };
    externalPlatformWarning: { reason: string; advice: string };
    courierWarning: { reason: string; advice: string };
    generalSuspicious: { reason: string; advice: string };
    safeNote: { reason: string; advice: string };
  }
> = {
  en: {
    titles: {
      safe: 'Safe Message',
      suspicious: 'Caution: Suspicious Message',
      high_risk: '⚠️ Possible Scam Detected'
    },
    otpWarning: {
      reason: 'This message asks for your OTP, PIN, password, or bank credentials. Genuine buyers NEVER need your PIN or OTP to pay you.',
      advice: 'Never share OTP or enter your UPI PIN. Entering a PIN sends money out of your account, it never receives money.'
    },
    fakeFeeWarning: {
      reason: 'This message asks you to pay a verification, registration, or refund fee before receiving payment.',
      advice: 'Never pay any upfront fee or refund request to receive money. Genuine customers pay directly on CraftWise.'
    },
    suspiciousLinkWarning: {
      reason: 'This message contains an external, unverified link or download file asking you to click or log in.',
      advice: 'Do not click unknown links or download APK files. Keep all communication and transactions inside CraftWise.'
    },
    fakeQrWarning: {
      reason: 'This message asks you to scan a QR code to receive money. Scanning a QR code or entering a PIN only DEBITS your account.',
      advice: 'Never scan a QR code or enter your PIN to receive money. UPI payments are received automatically into your bank.'
    },
    urgencyWarning: {
      reason: 'This buyer is applying extreme pressure or threats (e.g. police complaint, cancel within 5 mins) to force a transfer.',
      advice: 'Stay calm. Scammers use artificial panic to bypass your checks. Genuine buyers give you time to verify.'
    },
    externalPlatformWarning: {
      reason: 'This message asks you to move the transaction outside CraftWise to an unmonitored channel.',
      advice: 'Stay protected: Always keep discussions and orders inside CraftWise for buyer and artisan protection.'
    },
    courierWarning: {
      reason: 'This message makes false courier or customs clearance fee claims.',
      advice: 'Do not pay third-party courier release fees without verifying with official postal/courier authorities.'
    },
    generalSuspicious: {
      reason: 'This message contains unusual payment or transaction patterns that may be unsafe.',
      advice: 'Be cautious. Verify buyer identity and never share private banking details.'
    },
    safeNote: {
      reason: 'CraftWise AI verified: Standard buyer inquiry. No suspicious credentials or malicious links detected.',
      advice: 'Always keep your conversations and order fulfillments inside CraftWise.'
    }
  },
  te: {
    titles: {
      safe: 'సురక్షితమైన సందేశం',
      suspicious: 'హెచ్చరిక: అనుమానాస్పద సందేశం',
      high_risk: '⚠️ మోసం జరిగే అవకాశం ఉంది (హై రిస్క్)'
    },
    otpWarning: {
      reason: 'ఈ సందేశం మీ OTP, UPI PIN, పాస్‌వర్డ్ లేదా బ్యాంక్ వివరాలను అడుగుతోంది. నిజమైన కొనుగోలుదారులు డబ్బులు చెల్లించడానికి మీ PIN లేదా OTP ఎప్పుడూ అడగరు.',
      advice: 'ఎవరితోనూ OTP పంచుకోవద్దు. మీ UPI PIN ఎంటర్ చేస్తే మీ ఖాతా నుండి డబ్బులు కట్ అవుతాయి తప్ప, మీ ఖాతాలోకి డబ్బులు రావు.'
    },
    fakeFeeWarning: {
      reason: 'డబ్బులు పంపే ముందు ధృవీకరణ లేదా రిజిస్ట్రేషన్ లేదా రీఫండ్ రుసుము చెల్లించాలని ఈ సందేశం కోరుతోంది.',
      advice: 'డబ్బులు అందుకోవడానికి మీరు ఎప్పుడూ ఏ ఫీజు చెల్లించవద్దు. క్రాఫ్ట్‌వైజ్ ద్వారా మాత్రమే సురక్షితంగా ఆర్డర్ తీసుకోండి.'
    },
    suspiciousLinkWarning: {
      reason: 'ఈ సందేశంలో గుర్తుతెలియని లేదా అనుమానాస్పద లింక్ ఉంది.',
      advice: 'అనుమానాస్పద లింక్‌లపై క్లిక్ చేయవద్దు లేదా యాప్‌లను డౌన్‌లోడ్ చేయవద్దు.'
    },
    fakeQrWarning: {
      reason: 'డబ్బులు అందుకోవడానికి QR కోడ్ స్కాన్ చేయమని లేదా PIN ఎంటర్ చేయమని అడుగుతున్నారు.',
      advice: 'డబ్బులు రావడానికి QR కోడ్ స్కాన్ చేయనవసరం లేదు. PIN కొడితే మీ ఖాతా నుంచే డబ్బులు పోతాయి!'
    },
    urgencyWarning: {
      reason: 'వెంటనే డబ్బులు బదిలీ చేయాలని లేదా పోలీస్ కంప్లైంట్ ఇస్తామని కొనుగోలుదారు అత్యవసర ఒత్తిడి తెస్తున్నారు.',
      advice: 'ఆందోళన చెందవద్దు. మోసగాళ్లు భయపెట్టి డబ్బులు గుంజడానికి ప్రయత్నిస్తారు.'
    },
    externalPlatformWarning: {
      reason: 'క్రాఫ్ట్‌వైజ్ బయట వేరే ప్లాట్‌ఫామ్‌లో లావాదేవీలు చేయమని అడుగుతున్నారు.',
      advice: 'మీ భద్రత కోసం ఎల్లప్పుడూ క్రాఫ్ట్‌వైజ్ లోనే మాట్లాడి ఆర్డర్లు ఖరారు చేయండి.'
    },
    courierWarning: {
      reason: 'కొరియర్ లేదా డెలివరీ క్లియరెన్స్ కోసం రుసుము చెల్లించాలనే తప్పుడు వాదన చేస్తున్నారు.',
      advice: 'అనవసరమైన కొరియర్ క్లియరెన్స్ రుసుములను ఎవరికీ పంపకండి.'
    },
    generalSuspicious: {
      reason: 'ఈ సందేశంలో అనుమానాస్పద చెల్లింపు పద్ధతులు ఉన్నాయి.',
      advice: 'జాగ్రత్తగా ఉండండి. మీ వ్యక్తిగత బ్యాంక్ వివరాలను ఎవరితోనూ పంచుకోవద్దు.'
    },
    safeNote: {
      reason: 'క్రాఫ్ట్‌వైజ్ AI ధృవీకరణ: సాధారణ కొనుగోలుదారుల సందేశం. ఎలాంటి మోసపూరిత వివరాలు కనిపించలేదు.',
      advice: 'లావాదేవీలను ఎల్లప్పుడూ క్రాఫ్ట్‌వైజ్ లోనే సురక్షితంగా ఉంచండి.'
    }
  },
  hi: {
    titles: {
      safe: 'सुरक्षित संदेश',
      suspicious: 'सावधानी: संदिग्ध संदेश',
      high_risk: '⚠️ संभावित धोखाधड़ी चेतावनी (हाई रिस्क)'
    },
    otpWarning: {
      reason: 'यह संदेश आपका OTP, UPI PIN, पासवर्ड या बैंक विवरण मांग रहा है। असली खरीदार कभी भी पैसे भेजने के लिए आपका PIN या OTP नहीं मांगते।',
      advice: 'कभी भी OTP शेयर न करें। UPI PIN डालने से आपके खाते से पैसे कटते हैं, पैसे कभी आते नहीं हैं।'
    },
    fakeFeeWarning: {
      reason: 'यह संदेश पैसे भेजने से पहले आपसे सत्यापन या पंजीकरण शुल्क जमा करने को कह रहा है।',
      advice: 'पैसे प्राप्त करने के लिए कभी भी कोई एडवांस शुल्क या रिफंड न दें।'
    },
    suspiciousLinkWarning: {
      reason: 'इस संदेश में बाहरी या अज्ञात लिंक है।',
      advice: 'अज्ञात लिंक पर क्लिक न करें और कोई फाइल डाउनलोड न करें।'
    },
    fakeQrWarning: {
      reason: 'पैसे पाने के लिए QR कोड स्कैन करने या PIN दर्ज करने को कहा जा रहा है।',
      advice: 'पैसे प्राप्त करने के लिए कभी QR कोड स्कैन न करें और न ही अपना PIN दर्ज करें।'
    },
    urgencyWarning: {
      reason: 'खरीदार तत्काल पैसे ट्रांसफर करने या पुलिस कार्रवाई की धमकी देकर दबाव बना रहा है।',
      advice: 'शांत रहें। धोखाधड़ी करने वाले हड़बड़ी का फायदा उठाते हैं।'
    },
    externalPlatformWarning: {
      reason: 'लेन-देन को CraftWise से बाहर ले जाने के लिए कहा जा रहा है।',
      advice: 'अपनी सुरक्षा के लिए हमेशा CraftWise के अंदर ही व्यापार करें।'
    },
    courierWarning: {
      reason: 'कूरियर या डिलीवरी शुल्क के नाम पर फर्जी मांग की जा रही है।',
      advice: 'बिना जांचे किसी को कूरियर क्लियरेंस शुल्क न भेजें।'
    },
    generalSuspicious: {
      reason: 'इस संदेश में कुछ संदिग्ध पैटर्न पाए गए हैं।',
      advice: 'सावधानी बरतें और निजी जानकारी साझा न करें।'
    },
    safeNote: {
      reason: 'CraftWise AI सत्यापित: सामान्य खरीदार संदेश। कोई संदिग्ध पैटर्न नहीं मिला।',
      advice: 'हमेशा सुरक्षित रहकर CraftWise पर ही लेन-देन करें।'
    }
  },
  ta: {
    titles: {
      safe: 'பாதுகாப்பான செய்தி',
      suspicious: 'எச்சரிக்கை: சந்தேகத்திற்குரிய செய்தி',
      high_risk: '⚠️ சாத்தியமான மோசடி எச்சரிக்கை'
    },
    otpWarning: {
      reason: 'இந்த செய்தி உங்கள் OTP, PIN அல்லது வங்கி விவரங்களைக் கேட்கிறது. பணம் செலுத்த உண்மையான வாங்குபவர்கள் உங்கள் PIN அல்லது OTP ஐக் கேட்க மாட்டார்கள்.',
      advice: 'ஒருபோதும் OTP அல்லது UPI PIN ஐப் பகிர வேண்டாம். PIN பதிவிடுவது உங்கள் கணக்கிலிருந்து பணத்தை எடுக்கும்.'
    },
    fakeFeeWarning: {
      reason: 'பணம் பெறுவதற்கு முன் சரிபார்ப்புக் கட்டணம் செலுத்தும்படி கேட்கிறது.',
      advice: 'பணம் பெற எந்தவொரு கட்டணத்தையும் செலுத்த வேண்டாம்.'
    },
    suspiciousLinkWarning: {
      reason: 'இந்த செய்தியில் சந்தேகத்திற்குரிய வெளி இணைப்பு உள்ளது.',
      advice: 'அறியப்படாத இணைப்புகளைக் கிளிக் செய்ய வேண்டாம்.'
    },
    fakeQrWarning: {
      reason: 'பணம் பெற QR குறியீட்டை ஸ்கேன் செய்யும்படி கேட்கிறது.',
      advice: 'பணம் பெற QR குறியீட்டை ஒருபோதும் ஸ்கேன் செய்யாதீர்கள்.'
    },
    urgencyWarning: {
      reason: 'உடனடியாக பணம் அனுப்பும்படி கடுமையான அழுத்தம் கொடுக்கப்படுகிறது.',
      advice: 'பயப்பட வேண்டாம். அவசரப் படுத்தும் மோசடி நபர்களிடம் கவனமாக இருங்கள்.'
    },
    externalPlatformWarning: {
      reason: 'CraftWise வெளியே பரிவர்த்தனை செய்யக் கேட்கிறது.',
      advice: 'எப்போதும் CraftWise உள்ளேயே பாதுகாப்பாக பரிவர்த்தனை செய்யுங்கள்.'
    },
    courierWarning: {
      reason: 'கூரியர் கட்டணம் குறித்த போலி தகவல்.',
      advice: 'சரிபார்க்காமல் எந்த கட்டணமும் செலுத்த வேண்டாம்.'
    },
    generalSuspicious: {
      reason: 'இந்த செய்தியில் சந்தேகத்திற்குரிய அம்சங்கள் உள்ளன.',
      advice: 'கவனமாக இருங்கள் மற்றும் வங்கி விவரங்களைப் பகிர வேண்டாம்.'
    },
    safeNote: {
      reason: 'CraftWise AI சரிபார்க்கப்பட்டது: இயல்பான வாடிக்கையாளர் செய்தி.',
      advice: 'எப்போதும் பாதுகாப்பாக CraftWise இல் உரையாடுங்கள்.'
    }
  },
  kn: {
    titles: {
      safe: 'ಸುರಕ್ಷಿತ ಸಂದೇಶ',
      suspicious: 'ಎಚ್ಚರಿಕೆ: ಅನುಮಾನಾಸ್ಪದ ಸಂದೇಶ',
      high_risk: '⚠️ ಸಂಭಾವ್ಯ ವಂಚನೆ ಎಚ್ಚರಿಕೆ'
    },
    otpWarning: {
      reason: 'ಈ ಸಂದೇಶವು ನಿಮ್ಮ OTP, PIN ಅಥವಾ ಬ್ಯಾಂಕ್ ವಿವರಗಳನ್ನು ಕೇಳುತ್ತಿದೆ. ನಿಜವಾದ ಗ್ರಾಹಕರು ಹಣ ಕಳುಹಿಸಲು ನಿಮ್ಮ PIN ಅಥವಾ OTP ಕೇಳುವುದಿಲ್ಲ.',
      advice: 'OTP ಅಥವಾ UPI PIN ಹಂಚಿಕೊಳ್ಳಬೇಡಿ. PIN ನಮೂದಿಸಿದರೆ ನಿಮ್ಮ ಖಾತೆಯಿಂದ ಹಣ ಕಡಿತವಾಗುತ್ತದೆ.'
    },
    fakeFeeWarning: {
      reason: 'ಹಣ ಪಡೆಯುವ ಮೊದಲು ಪರಿಶೀಲನಾ ಶುಲ್ಕ ಪಾವತಿಸಲು ಕೇಳಲಾಗುತ್ತಿದೆ.',
      advice: 'ಹಣ ಪಡೆಯಲು ಯಾವುದೇ ಮುಂಗಡ ಶುಲ್ಕ ಪಾವತಿಸಬೇಡಿ.'
    },
    suspiciousLinkWarning: {
      reason: 'ಈ ಸಂದೇಶದಲ್ಲಿ ಅನುಮಾನಾಸ್ಪದ ಬಾಹ್ಯ ಲಿಂಕ್ ಇದೆ.',
      advice: 'ಅಪರಿಚಿತ ಲಿಂಕ್‌ಗಳನ್ನು ಕ್ಲಿಕ್ ಮಾಡಬೇಡಿ.'
    },
    fakeQrWarning: {
      reason: 'ಹಣ ಸ್ವೀಕರಿಸಲು QR ಕೋಡ್ ಸ್ಕ್ಯಾನ್ ಮಾಡಲು ಕೇಳಲಾಗುತ್ತಿದೆ.',
      advice: 'ಹಣ ಪಡೆಯಲು ಎಂದಿಗೂ QR ಕೋಡ್ ಸ್ಕ್ಯಾನ್ ಮಾಡಬೇಡಿ.'
    },
    urgencyWarning: {
      reason: 'ತಕ್ಷಣ ಹಣ ವರ್ಗಾಯಿಸಲು ಒತ್ತಡ ಹೇರಲಾಗುತ್ತಿದೆ.',
      advice: 'ಆತಂಕಪಡಬೇಡಿ. ವಂಚಕರ ಆತುರದ ಮಾತುಗಳಿಗೆ ಮರುಳಾಗಬೇಡಿ.'
    },
    externalPlatformWarning: {
      reason: 'CraftWise ಹೊರಗೆ ವ್ಯವಹಾರ ನಡೆಸಲು ಕೇಳಲಾಗುತ್ತಿದೆ.',
      advice: 'ನಿಮ್ಮ ಸುರಕ್ಷತೆಗಾಗಿ ಯಾವಾಗಲೂ CraftWise ಒಳಗೆ ಮಾತ್ರ ವ್ಯವಹರಿಸಿ.'
    },
    courierWarning: {
      reason: 'ಕೊರಿಯರ್ ಕ್ಲಿಯರೆನ್ಸ್ ಶುಲ್ಕದ ಸುಳ್ಳು ಮಾಹಿತಿ.',
      advice: 'ಪರಿಶೀಲಿಸದೆ ಯಾವುದೇ ಶುಲ್ಕ ನೀಡಬೇಡಿ.'
    },
    generalSuspicious: {
      reason: 'ಈ ಸಂದೇಶದಲ್ಲಿ ಅನುಮಾನಾಸ್ಪದ ಅಂಶಗಳಿವೆ.',
      advice: 'ಜಾಗರೂಕರಾಗಿರಿ ಮತ್ತು ವೈಯಕ್ತಿಕ ವಿವರ ಹಂಚಿಕೊಳ್ಳಬೇಡಿ.'
    },
    safeNote: {
      reason: 'CraftWise AI ದೃಢೀಕರಿಸಿದೆ: ಸಾಮಾನ್ಯ ವಿಚಾರಣೆಯ ಸಂದೇಶ.',
      advice: 'ಯಾವಾಗಲೂ CraftWise ನಲ್ಲಿ ಸುರಕ್ಷಿತವಾಗಿರಿ.'
    }
  },
  ml: {
    titles: {
      safe: 'സുരക്ഷിതമായ സന്ദേശം',
      suspicious: 'ജാഗ്രത: സംശയാസ്പദമായ സന്ദേശം',
      high_risk: '⚠️ തട്ടിപ്പ് സാധ്യതയുള്ള സന്ദേശം'
    },
    otpWarning: {
      reason: 'ഈ സന്ദേശം നിങ്ങളുടെ OTP അല്ലെങ്കിൽ UPI PIN ചോദിക്കുന്നു. പണം അയക്കാൻ യഥാർത്ഥ വാങ്ങലുകാർക്ക് നിങ്ങളുടെ PIN ആവശ്യമില്ല.',
      advice: 'ഒരിക്കലും OTP അല്ലെങ്കിൽ PIN പങ്കിടരുത്. PIN നൽകിയാൽ നിങ്ങളുടെ അക്കൗണ്ടിൽ നിന്ന് പണം നഷ്ടപ്പെടും.'
    },
    fakeFeeWarning: {
      reason: 'പണം ലഭിക്കുന്നതിന് മുൻപായി ഫീസ് അടയ്ക്കാൻ ആവശ്യപ്പെടുന്നു.',
      advice: 'പണം ലഭിക്കാൻ മുൻകൂറായി ഒരു ഫീസും നൽകരുത്.'
    },
    suspiciousLinkWarning: {
      reason: 'ഈ സന്ദേശത്തിൽ സംശയാസ്പദമായ ബാഹ്യ ലിങ്ക് ഉണ്ട്.',
      advice: 'അപരിചിതമായ ലിങ്കുകളിൽ ക്ലിക്ക് ചെയ്യരുത്.'
    },
    fakeQrWarning: {
      reason: 'പണം ലഭിക്കാൻ QR കോഡ് സ്കാൻ ചെയ്യാൻ ആവശ്യപ്പെടുന്നു.',
      advice: 'പണം ലഭിക്കാൻ ഒരിക്കലും QR കോഡ് സ്കാൻ ചെയ്യരുത്.'
    },
    urgencyWarning: {
      reason: 'ഉടൻ പണം നൽകാൻ ഭീഷണിപ്പെടുത്തുന്നു.',
      advice: 'പരിഭ്രാന്തരാകരുത്. തട്ടിപ്പുകാരുടെ ഭീഷണിക്ക് വഴങ്ങരുത്.'
    },
    externalPlatformWarning: {
      reason: 'CraftWise പുറത്തേക്ക് ഇടപാട് മാറ്റാൻ ആവശ്യപ്പെടുന്നു.',
      advice: 'സുരക്ഷിതത്വത്തിനായി CraftWise-ൽ മാത്രം ഇടപാട് നടത്തുക.'
    },
    courierWarning: {
      reason: 'വ്യാജ കൊറിയർ ചാർജ് ആവശ്യപ്പെടുന്നു.',
      advice: 'സ്ഥിരീകരിക്കാതെ പണം നൽകരുത്.'
    },
    generalSuspicious: {
      reason: 'ഈ സന്ദേശത്തിൽ അസ്വാഭാവികമായ ഇടപാട് രീതികൾ കാണുന്നു.',
      advice: 'ശ്രദ്ധിക്കുക. ബാങ്ക് വിവരങ്ങൾ നൽകരുത്.'
    },
    safeNote: {
      reason: 'CraftWise AI സ്ഥിരീകരിച്ചു: സാധാരണ അന്വേഷണം.',
      advice: 'എപ്പോഴും CraftWise-ൽ സുരക്ഷിതമായി തുടരുക.'
    }
  },
  mr: {
    titles: {
      safe: 'सुरक्षित संदेश',
      suspicious: 'सावधगिरी: संशयास्पद संदेश',
      high_risk: '⚠️ फसवणूक होण्याची शक्यता (हाय रिस्क)'
    },
    otpWarning: {
      reason: 'हा संदेश तुमचा OTP, PIN किंवा बँक तपशील मागत आहे. खरे ग्राहक कधीही पैसे पाठवण्यासाठी तुमचा PIN मागत नाहीत.',
      advice: 'कधीही OTP किंवा UPI PIN शेअर करू नका. PIN टाकल्यास तुमच्या खात्यातून पैसे कापले जातात.'
    },
    fakeFeeWarning: {
      reason: 'पैसे मिळण्यापूर्वी पडताळणी किंवा नोंदणी शुल्क भरण्यास सांगितले जात आहे.',
      advice: 'पैसे मिळवण्यासाठी कधीही आगाऊ शुल्क भरू नका.'
    },
    suspiciousLinkWarning: {
      reason: 'या संदेशात संशयास्पद बाह्य लिंक आहे.',
      advice: 'अनोळखी लिंकवर क्लिक करू नका.'
    },
    fakeQrWarning: {
      reason: 'पैसे स्वीकारण्यासाठी QR कोड स्कॅन करण्यास सांगितले जात आहे.',
      advice: 'पैसे मिळवण्यासाठी कधीही QR कोड स्कॅन करू नका.'
    },
    urgencyWarning: {
      reason: 'त्वरित पैसे पाठवण्यासाठी दबाव टाकला जात आहे.',
      advice: 'शांत राहा. फसवणूक करणारे घाईगडबड करतात.'
    },
    externalPlatformWarning: {
      reason: 'CraftWise च्या बाहेर व्यवहार करण्यास सांगितले जात आहे.',
      advice: 'नेहमी CraftWise वरच सुरक्षितपणे व्यवहार करा.'
    },
    courierWarning: {
      reason: 'बनावट कुरिअर शुल्काची मागणी केली जात आहे.',
      advice: 'खात्री केल्याशिवाय कोणतेही शुल्क देऊ नका.'
    },
    generalSuspicious: {
      reason: 'या संदेशात संशयास्पद माहिती आढळली आहे.',
      advice: 'सावध राहा आणि वैयक्तिक तपशील देऊ नका.'
    },
    safeNote: {
      reason: 'CraftWise AI द्वारे पडताळणी: सामान्य खरेदीदाराचा संदेश.',
      advice: 'नेहमी सुरक्षित राहा.'
    }
  },
  bn: {
    titles: {
      safe: 'নিরাপদ বার্তা',
      suspicious: 'সতর্কতা: সন্দেহজনক বার্তা',
      high_risk: '⚠️ সম্ভাব্য প্রতারণার সতর্কতা'
    },
    otpWarning: {
      reason: 'এই বার্তাটি আপনার OTP, PIN বা ব্যাংক বিবরণ চাইছে। আসল ক্রেতারা টাকা পাঠানোর জন্য কখনো PIN বা OTP চান না।',
      advice: 'কখনোই OTP বা UPI PIN শেয়ার করবেন না। PIN দিলে আপনার অ্যাকাউন্ট থেকে টাকা কেটে নেওয়া হবে।'
    },
    fakeFeeWarning: {
      reason: 'টাকা পাওয়ার আগে রেজিস্ট্রেশন বা ভেরিফিকেশন ফি দিতে বলা হচ্ছে।',
      advice: 'টাকা পাওয়ার জন্য কখনো কোনো ফি প্রদান করবেন না।'
    },
    suspiciousLinkWarning: {
      reason: 'এই বার্তায় সন্দেহজনক বহিরাগত লিংক রয়েছে।',
      advice: 'অজানা লিংকে ক্লিক করবেন না।'
    },
    fakeQrWarning: {
      reason: 'টাকা পাওয়ার জন্য QR কোড স্ক্যান করতে বলা হচ্ছে।',
      advice: 'টাকা পাওয়ার জন্য কখনো QR কোড স্ক্যান করবেন না।'
    },
    urgencyWarning: {
      reason: 'অবিলম্বে টাকা পাঠানোর জন্য চাপ সৃষ্টি করা হচ্ছে।',
      advice: 'শান্ত থাকুন এবং তাড়াহুড়ো করবেন না।'
    },
    externalPlatformWarning: {
      reason: 'CraftWise-এর বাইরে লেনদেন করতে বলা হচ্ছে।',
      advice: 'সবসময় CraftWise-এর ভিতরেই সুরক্ষিতভাবে যোগাযোগ করুন।'
    },
    courierWarning: {
      reason: 'জাল কুরিয়ার চার্জ দাবি করা হচ্ছে।',
      advice: 'যাচাই না করে কোনো ফি দেবেন না।'
    },
    generalSuspicious: {
      reason: 'এই বার্তায় কিছু সন্দেহজনক বিষয় লক্ষ্য করা গেছে।',
      advice: 'সতর্ক থাকুন এবং ব্যাংকিং তথ্য শেয়ার করবেন না।'
    },
    safeNote: {
      reason: 'CraftWise AI যাচাইকৃত: স্বাভাবিক ক্রেতার অনুসন্ধান।',
      advice: 'সবসময় CraftWise-এ সুরক্ষিত থাকুন।'
    }
  },
  or: {
    titles: {
      safe: 'ସୁରକ୍ଷିତ ବାର୍ତ୍ତା',
      suspicious: 'ସତର୍କତା: ସନ୍ଦେହଜନକ ବାର୍ତ୍ତା',
      high_risk: '⚠️ ସମ୍ଭାବ୍ୟ ଠକେଇ ସତର୍କତା'
    },
    otpWarning: {
      reason: 'ଏହି ବାର୍ତ୍ତାଟି ଆପଣଙ୍କର OTP କିମ୍ବା UPI PIN ମାଗୁଛି। ପ୍ରକୃତ କ୍ରେତା କେବେ ମଧ୍ୟ ଟଙ୍କା ପଠାଇବା ପାଇଁ PIN ମାଗନ୍ତି ନାହିଁ।',
      advice: 'କେବେ ମଧ୍ୟ OTP ବା PIN ଦିଅନ୍ତୁ ନାହିଁ। PIN ଦେଲେ ଆପଣଙ୍କ ଖାତାରୁ ଟଙ୍କା କଟିଯିବ।'
    },
    fakeFeeWarning: {
      reason: 'ଟଙ୍କା ପାଇବା ପୂର୍ବରୁ ଫି ଦେବା ପାଇଁ କୁହାଯାଉଛି।',
      advice: 'ଟଙ୍କା ପାଇବା ପାଇଁ କୌଣସି ଅଗ୍ରିମ ଫି ଦିଅନ୍ତୁ ନାହିଁ।'
    },
    suspiciousLinkWarning: {
      reason: 'ଏହି ବାର୍ତ୍ତାରେ ସନ୍ଦେହଜନକ ଲିଙ୍କ୍ ରହିଛି।',
      advice: 'ଅଜଣା ଲିଙ୍କ୍ ଉପରେ କ୍ଲିକ୍ କରନ୍ତୁ ନାହିଁ।'
    },
    fakeQrWarning: {
      reason: 'ଟଙ୍କା ପାଇବା ପାଇଁ QR କୋଡ୍ ସ୍କାନ୍ କରିବାକୁ କୁହାଯାଉଛି।',
      advice: 'ଟଙ୍କା ପାଇବା ପାଇଁ କେବେ QR କୋଡ୍ ସ୍କାନ୍ କରନ୍ତୁ ନାହିଁ।'
    },
    urgencyWarning: {
      reason: 'ତୁରନ୍ତ ଟଙ୍କା ପଠାଇବାକୁ ଚାପ ପ୍ରୟୋଗ କରାଯାଉଛି।',
      advice: 'ଭୟଭୀତ ହୁଅନ୍ତୁ ନାହିଁ।'
    },
    externalPlatformWarning: {
      reason: 'CraftWise ବାହାରେ କାରବାର କରିବାକୁ କୁହାଯାଉଛି।',
      advice: 'ସବୁବେଳେ CraftWise ଭିତରେ ହିଁ କାରବାର କରନ୍ତୁ।'
    },
    courierWarning: {
      reason: 'ଜାଲ୍ କୁରିୟର ଚାର୍ଜ ଦାବି କରାଯାଉଛି।',
      advice: 'ଯାଞ୍ଚ ନକରି କୌଣସି ଶୁଳ୍କ ଦିଅନ୍ତୁ ନାହିଁ।'
    },
    generalSuspicious: {
      reason: 'ଏହି ବାର୍ତ୍ତାରେ କିଛି ସନ୍ଦେହଜନକ ପଦ୍ଧତି ଦେଖାଯାଇଛି।',
      advice: 'ସତର୍କ ରୁହନ୍ତୁ ଏବଂ ବ୍ୟାଙ୍କ ତଥ୍ୟ ଦିଅନ୍ତୁ ନାହିଁ।'
    },
    safeNote: {
      reason: 'CraftWise AI ଯାଞ୍ଚ କରିଛି: ସାଧାରଣ କ୍ରେତା ବାର୍ତ୍ତା।',
      advice: 'ସର୍ବଦା CraftWise ରେ ସୁରକ୍ଷିତ ରୁହନ୍ତୁ।'
    }
  }
};

/**
 * Fast, offline-capable rule-based heuristics to identify known scam patterns
 * even when the AI model is offline or unconfigured.
 */
function analyzeWithHeuristics(cleanText: string): {
  riskLevel: ScamRiskLevel;
  category: ScamCategory;
  flaggedPhrases: string[];
} {
  const lower = cleanText.toLowerCase();
  const flaggedPhrases: string[] = [];

  // 1. High Risk: OTP, PIN, MPIN, CVV, Password, Banking credentials
  const otpPatterns = [
    { pattern: /\b(share|send|give|tell|enter|verify|forward|provide|need|ask)\b.{0,50}\b(otp|one\s*time\s*password|mpin|upi\s*pin|atm\s*pin|cvv|net\s*banking\s*password|bank\s*password)\b/i, label: 'Request for OTP/PIN/Password' },
    { pattern: /\b(otp|one\s*time\s*password|mpin|upi\s*pin|security\s*code|verification\s*code)\b.{0,50}\b(share|send|give|tell|forward|verify|need|enter)\b/i, label: 'Request for OTP/PIN/Password' },
    { pattern: /\b(what\s+is\s+(the|your)\s+otp|what\'?s\s+(the|your)\s+otp|6\s*digit\s*otp)\b/i, label: 'Asking for OTP' },
    { pattern: /\b(enter|put|type)\s+(your\s+)?(upi\s+)?pin\s+to\s+(receive|get|credit|accept)\b/i, label: 'Enter PIN to receive money' },
    { pattern: /\b(enter\s+pin\s+and\s+money\s+will\s+be\s+credited)\b/i, label: 'Claim that entering PIN credits money' },
    { pattern: /\b(net\s*banking\s+password|login\s+credentials|debit\s+card\s+pin)\b/i, label: 'Banking credentials request' },
    { pattern: /(ఓటీపీ|పిన్|పాస్‌వర్డ్|యూపీఐ పిన్|డబ్బులు రావాలంటే పిన్ కొట్టండి)/i, label: 'Telugu PIN/OTP prompt' },
    { pattern: /(ओटीपी|पिन|पासवर्ड|पैसे पाने के लिए पिन दर्ज करें)/i, label: 'Hindi PIN/OTP prompt' },
    { pattern: /(ஓடிபி|பின்|கடவுச்சொல்)/i, label: 'Tamil PIN/OTP prompt' },
    { pattern: /(ಒಟಿಪಿ|ಪಿನ್|ಪಾಸ್‌ವರ್ಡ್)/i, label: 'Kannada PIN/OTP prompt' }
  ];

  for (const { pattern, label } of otpPatterns) {
    if (pattern.test(lower)) {
      flaggedPhrases.push(label);
    }
  }
  if (flaggedPhrases.length > 0) {
    return { riskLevel: 'high_risk', category: 'otp_credentials', flaggedPhrases };
  }

  // 2. High Risk: Fake QR Code to receive payment
  const qrPatterns = [
    { pattern: /\b(scan)\b.{0,35}\b(qr|qr\s*code)\b.{0,35}\b(receive|get|claim|credit|accept|payment|money|amount|cash)\b/i, label: 'Scan QR code to receive money' },
    { pattern: /\b(qr\s*code\s*scan\s*karo\s*paise\s*milenge)\b/i, label: 'Hindi fake QR code claim' },
    { pattern: /(క్యూఆర్ కోడ్ స్కాన్ చేసి డబ్బులు తీసుకోండి)/i, label: 'Telugu fake QR code claim' }
  ];
  for (const { pattern, label } of qrPatterns) {
    if (pattern.test(lower)) {
      flaggedPhrases.push(label);
    }
  }
  if (flaggedPhrases.length > 0) {
    return { riskLevel: 'high_risk', category: 'fake_payment_qr', flaggedPhrases };
  }

  // 3. High Risk: Fake fee, verification charge, refundable deposit before paying
  const feePatterns = [
    { pattern: /\b(pay|transfer|deposit|send)\b.{0,40}\b(verification|registration|activation|clearance|refundable|security|processing|release)\b.{0,30}\b(fee|charge|deposit|amount|rs|₹)\b/i, label: 'Verification / Registration fee request' },
    { pattern: /\b(pay\s+₹?\d+\s+to\s+(release|activate|unfreeze|receive)\s+(your\s+)?(payment|money|funds))\b/i, label: 'Pay fee to release payment' },
    { pattern: /\b(refundable\s+(courier|verification|registration)\s+fee)\b/i, label: 'Refundable fee demand' },
    { pattern: /\b(refund\s+the\s+(extra|excess|balance)\s+(amount|money)\s+immediately)\b/i, label: 'Overpayment refund demand' }
  ];
  for (const { pattern, label } of feePatterns) {
    if (pattern.test(lower)) {
      flaggedPhrases.push(label);
    }
  }
  if (flaggedPhrases.length > 0) {
    return { riskLevel: 'high_risk', category: 'fake_fee', flaggedPhrases };
  }

  // 4. Suspicious / High Risk: Malicious or shortened payment links
  const urlMatches = lower.match(/(https?:\/\/[^\s]+)/g);
  if (urlMatches && urlMatches.length > 0) {
    const isSuspiciousUrl = urlMatches.some(url =>
      !url.includes('craftwise.app') &&
      (!url.includes('craftwise') ||
      url.includes('bit.ly') ||
      url.includes('tinyurl.com') ||
      url.includes('cutt.ly') ||
      url.includes('is.gd') ||
      url.includes('.apk') ||
      url.includes('.xyz') ||
      url.includes('.top') ||
      url.includes('paytm-verify') ||
      url.includes('phonepe-claim') ||
      url.includes('gpay-rewards') ||
      url.includes('razorpay-claim') ||
      url.includes('verify') ||
      url.includes('claim') ||
      url.includes('refund'))
    );
    if (isSuspiciousUrl) {
      flaggedPhrases.push('Shortened or suspicious external link');
      return { riskLevel: 'high_risk', category: 'suspicious_link', flaggedPhrases };
    } else {
      flaggedPhrases.push('External link found in message');
      return { riskLevel: 'suspicious', category: 'suspicious_link', flaggedPhrases };
    }
  }

  // 5. Suspicious: Courier / customs clearance claim
  const courierPatterns = [
    { pattern: /\b(courier|customs|fedex|dhl|india\s*post)\s*(is\s+)?(stuck|held|blocked|clearing\s+charges)\b/i, label: 'Courier held up / Customs charge claim' }
  ];
  for (const { pattern, label } of courierPatterns) {
    if (pattern.test(lower)) {
      flaggedPhrases.push(label);
    }
  }
  if (flaggedPhrases.length > 0) {
    return { riskLevel: 'suspicious', category: 'courier_scam', flaggedPhrases };
  }

  // 6. Suspicious: Moving conversation / transaction outside CraftWise
  const platformPatterns = [
    { pattern: /\b(don\'?t\s+use\s+craftwise|leave\s+craftwise|chat\s+on\s+telegram|message\s+on\s+telegram\s+only)\b/i, label: 'Attempt to bypass CraftWise protection' }
  ];
  for (const { pattern, label } of platformPatterns) {
    if (pattern.test(lower)) {
      flaggedPhrases.push(label);
    }
  }
  if (flaggedPhrases.length > 0) {
    return { riskLevel: 'suspicious', category: 'external_platform', flaggedPhrases };
  }

  // 7. Suspicious: Urgent pressure and coercion
  const urgencyPatterns = [
    { pattern: /\b(immediately\s+or\s+(police|court|legal|fir)|within\s+\d+\s+minutes\s+or\s+(cancel|block|arrest))\b/i, label: 'Extreme urgency / Legal threat coercion' }
  ];
  for (const { pattern, label } of urgencyPatterns) {
    if (pattern.test(lower)) {
      flaggedPhrases.push(label);
    }
  }
  if (flaggedPhrases.length > 0) {
    return { riskLevel: 'suspicious', category: 'urgency_coercion', flaggedPhrases };
  }

  // Otherwise Safe
  return { riskLevel: 'safe', category: 'none', flaggedPhrases: [] };
}

/**
 * Builds localized text bundles across all 9 CraftWise languages
 * based on the determined category and risk level.
 */
function buildLocalizedBundles(
  category: ScamCategory,
  riskLevel: ScamRiskLevel
): {
  localizedReasons: Record<string, string>;
  localizedTitles: Record<string, string>;
  localizedAdvices: Record<string, string>;
  defaultReason: string;
  defaultTitle: string;
  defaultAdvice: string;
} {
  const supportedLangs = ['en', 'te', 'hi', 'ta', 'kn', 'ml', 'mr', 'bn', 'or'];
  const localizedReasons: Record<string, string> = {};
  const localizedTitles: Record<string, string> = {};
  const localizedAdvices: Record<string, string> = {};

  for (const lang of supportedLangs) {
    const bundle = LOCALIZED_TEMPLATES[lang] || LOCALIZED_TEMPLATES.en;
    localizedTitles[lang] = bundle.titles[riskLevel] || bundle.titles.safe;

    let warningObj;
    switch (category) {
      case 'otp_credentials':
        warningObj = bundle.otpWarning;
        break;
      case 'fake_fee':
        warningObj = bundle.fakeFeeWarning;
        break;
      case 'suspicious_link':
        warningObj = bundle.suspiciousLinkWarning;
        break;
      case 'fake_payment_qr':
        warningObj = bundle.fakeQrWarning;
        break;
      case 'urgency_coercion':
        warningObj = bundle.urgencyWarning;
        break;
      case 'external_platform':
        warningObj = bundle.externalPlatformWarning;
        break;
      case 'courier_scam':
        warningObj = bundle.courierWarning;
        break;
      default:
        warningObj = riskLevel === 'safe' ? bundle.safeNote : bundle.generalSuspicious;
        break;
    }

    localizedReasons[lang] = warningObj.reason;
    localizedAdvices[lang] = warningObj.advice;
  }

  const enBundle = LOCALIZED_TEMPLATES.en;
  let enWarning;
  switch (category) {
    case 'otp_credentials':
      enWarning = enBundle.otpWarning;
      break;
    case 'fake_fee':
      enWarning = enBundle.fakeFeeWarning;
      break;
    case 'suspicious_link':
      enWarning = enBundle.suspiciousLinkWarning;
      break;
    case 'fake_payment_qr':
      enWarning = enBundle.fakeQrWarning;
      break;
    case 'urgency_coercion':
      enWarning = enBundle.urgencyWarning;
      break;
    case 'external_platform':
      enWarning = enBundle.externalPlatformWarning;
      break;
    case 'courier_scam':
      enWarning = enBundle.courierWarning;
      break;
    default:
      enWarning = riskLevel === 'safe' ? enBundle.safeNote : enBundle.generalSuspicious;
      break;
  }

  return {
    localizedReasons,
    localizedTitles,
    localizedAdvices,
    defaultReason: enWarning.reason,
    defaultTitle: enBundle.titles[riskLevel],
    defaultAdvice: enWarning.advice
  };
}

/**
 * Main detection function: combines privacy sanitization, fast heuristic evaluation,
 * and context-aware Gemini model classification with guaranteed fallback.
 */
export async function detectScam(
  rawText: string,
  _sourceLang = 'en',
  _recipientLang = 'te'
): Promise<ScamAnalysis> {
  const sanitizedText = sanitizeForPrivacy(rawText);

  // Run fast heuristic scan first
  const heuristic = analyzeWithHeuristics(sanitizedText);

  // If high risk is detected by strict patterns (e.g. OTP/PIN requests, fake QR claims),
  // we instantly return the verified high-risk warning without waiting for an external network round-trip.
  if (heuristic.riskLevel === 'high_risk') {
    const bundle = buildLocalizedBundles(heuristic.category, heuristic.riskLevel);
    return {
      riskLevel: 'high_risk',
      category: heuristic.category,
      flaggedPhrases: heuristic.flaggedPhrases,
      reason: bundle.defaultReason,
      localizedReasons: bundle.localizedReasons,
      warningTitle: bundle.defaultTitle,
      localizedTitles: bundle.localizedTitles,
      actionAdvice: bundle.defaultAdvice,
      localizedAdvices: bundle.localizedAdvices,
      isDismissed: false,
      analyzedAt: new Date().toISOString()
    };
  }

  // If Gemini client is available, leverage gemini-3.8-flash for contextual nuance
  const ai = getGenAI();
  if (ai) {
    try {
      // 3.5-second timeout safeguard so message sending is never blocked
      const aiPromise = (async () => {
        const prompt = `You are the CraftWise AI Scam & Fraud Shield protecting traditional Indian handicraft artisans from digital buyer scams.
Analyze this buyer message sent to an artisan.
Message text: "${sanitizedText.replace(/"/g, '\\"')}"

Scam patterns to detect:
1. Requests for OTP, PIN, UPI PIN, passwords, or bank details.
2. Demands to pay a "verification/refund/release/courier clearance" fee.
3. Fake claims asking the artisan to scan a QR code or enter a PIN to receive money.
4. Shortened/phishing links (bit.ly, tinyurl, apk downloads).
5. Coercive extreme urgency (threats of police or immediate cancellation unless money is sent).
6. Moving transaction outside CraftWise to unmonitored channels.

Respond with strict JSON ONLY, no markdown backticks, conforming to:
{
  "riskLevel": "safe" | "suspicious" | "high_risk",
  "category": "otp_credentials" | "fake_fee" | "suspicious_link" | "fake_payment_qr" | "urgency_coercion" | "external_platform" | "courier_scam" | "none",
  "flaggedPhrases": string[],
  "simpleReasonEn": string,
  "actionAdviceEn": string
}`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt
        });

        const rawJson = response.text?.trim() || '';
        const cleanedJson = rawJson.replace(/```(?:json)?/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanedJson);
      })();

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('AI classification timeout')), 3500)
      );

      const aiResult: any = await Promise.race([aiPromise, timeoutPromise]);

      if (aiResult && (aiResult.riskLevel === 'safe' || aiResult.riskLevel === 'suspicious' || aiResult.riskLevel === 'high_risk')) {
        const finalCategory = aiResult.category || heuristic.category || 'none';
        const finalRisk = (aiResult.riskLevel as ScamRiskLevel);
        const bundle = buildLocalizedBundles(finalCategory, finalRisk);

        return {
          riskLevel: finalRisk,
          category: finalCategory,
          flaggedPhrases: Array.isArray(aiResult.flaggedPhrases) && aiResult.flaggedPhrases.length > 0
            ? aiResult.flaggedPhrases
            : heuristic.flaggedPhrases,
          reason: aiResult.simpleReasonEn || bundle.defaultReason,
          localizedReasons: bundle.localizedReasons,
          warningTitle: bundle.defaultTitle,
          localizedTitles: bundle.localizedTitles,
          actionAdvice: aiResult.actionAdviceEn || bundle.defaultAdvice,
          localizedAdvices: bundle.localizedAdvices,
          isDismissed: false,
          analyzedAt: new Date().toISOString()
        };
      }
    } catch (err) {
      // Fall through smoothly to heuristic result if AI times out or errors
      console.warn('Gemini scam analysis notice (using heuristic fallback):', (err as any)?.message || err);
    }
  }

  // Fallback to heuristic classification
  const bundle = buildLocalizedBundles(heuristic.category, heuristic.riskLevel);
  return {
    riskLevel: heuristic.riskLevel,
    category: heuristic.category,
    flaggedPhrases: heuristic.flaggedPhrases,
    reason: bundle.defaultReason,
    localizedReasons: bundle.localizedReasons,
    warningTitle: bundle.defaultTitle,
    localizedTitles: bundle.localizedTitles,
    actionAdvice: bundle.defaultAdvice,
    localizedAdvices: bundle.localizedAdvices,
    isDismissed: false,
    analyzedAt: new Date().toISOString()
  };
}
