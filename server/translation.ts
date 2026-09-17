import { GoogleGenAI } from '@google/genai';

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

export const LANGUAGE_NAMES: Record<string, { english: string; native: string }> = {
  te: { english: 'Telugu', native: 'తెలుగు' },
  hi: { english: 'Hindi', native: 'हिन्दी' },
  en: { english: 'English', native: 'English' },
  ta: { english: 'Tamil', native: 'தமிழ்' },
  kn: { english: 'Kannada', native: 'ಕನ್ನಡ' },
  ml: { english: 'Malayalam', native: 'മലയാളം' },
  mr: { english: 'Marathi', native: 'मराठी' },
  bn: { english: 'Bengali', native: 'বাংলা' },
  or: { english: 'Odia', native: 'ଓଡ଼ିଆ' }
};

// Common handicraft bargaining and bulk enquiry dictionary patterns
const COMMON_PHRASES: Array<{
  en: string;
  te: string;
  hi: string;
  ta: string;
  kn: string;
  ml: string;
  mr: string;
  bn: string;
  or: string;
}> = [
  {
    en: "Namaste! What is your best price for a bulk order?",
    te: "నమస్కారం! బల్క్ ఆర్డర్ కోసం మీ ఉత్తమ ధర ఎంత?",
    hi: "नमस्ते! थोक ऑर्डर के लिए आपकी सबसे अच्छी कीमत क्या है?",
    ta: "வணக்கம்! மொத்த ஆர்டருக்கு உங்களின் சிறந்த விலை என்ன?",
    kn: "ನಮಸ್ಕಾರ! ಬೃಹತ್ ಆರ್ಡರ್‌ಗೆ ನಿಮ್ಮ ಅತ್ಯುತ್ತಮ ಬೆಲೆ ಎಷ್ಟು?",
    ml: "നമസ്കാരം! ബൾക്ക് ഓർഡറിന് നിങ്ങളുടെ ഏറ്റവും നല്ല വില എത്രയാണ്?",
    mr: "नमस्ते! घाऊक ऑर्डरीसाठी तुमची सर्वोत्तम किंमत काय आहे?",
    bn: "নমস্কার! পাইকারি অর্ডারের জন্য আপনার সেরা মূল্য কত?",
    or: "ନମସ୍କାର! ବଲ୍କ ଅର୍ଡର ପାଇଁ ଆପଣଙ୍କର ସର୍ବୋତ୍ତମ ମୂଲ୍ୟ କେତେ?"
  },
  {
    en: "Hello, I want to order 20 units. What is your best price?",
    te: "నమస్కారం, నేను 20 యూనిట్లు ఆర్డర్ చేయాలనుకుంటున్నాను. మీ ఉత్తమ ధర ఎంత?",
    hi: "नमस्ते, मैं 20 यूनिट ऑर्डर करना चाहता हूँ। आपकी सबसे अच्छी कीमत क्या है?",
    ta: "வணக்கம், நான் 20 யூனிட்கள் ஆர்டர் செய்ய விரும்புகிறேன். உங்கள் சிறந்த விலை என்ன?",
    kn: "ನಮಸ್ಕಾರ, ನಾನು 20 ಯೂನಿಟ್‌ಗಳನ್ನು ಆರ್ಡರ್ ಮಾಡಲು ಬಯಸುತ್ತೇನೆ. ನಿಮ್ಮ ಅತ್ಯುತ್ತಮ ಬೆಲೆ ಎಷ್ಟು?",
    ml: "ഹലോ, എനിക്ക് 20 യൂണിറ്റുകൾ ഓർഡർ ചെയ്യണം. നിങ്ങളുടെ ഏറ്റവും നല്ല വില എത്രയാണ്?",
    mr: "नमस्कार, मला 20 नग ऑर्डर करायचे आहेत. तुमची सर्वोत्तम किंमत काय आहे?",
    bn: "হ্যালো, আমি ২০টি ইউনিট অর্ডার করতে চাই। আপনার সেরা মূল্য কত?",
    or: "ନମସ୍କାର, ମୁଁ 20ଟି ୟୁନିଟ୍ ଅର୍ଡର କରିବାକୁ ଚାହୁଁଛି। ଆପଣଙ୍କ ସର୍ବୋତ୍ତମ ମୂଲ୍ୟ କେତେ?"
  },
  {
    en: "i am interested to take 20 pieces so is there any discount for 20 pieces ?",
    te: "నేను 20 ముక్కలు తీసుకోవాలనుకుంటున్నాను, కాబట్టి 20 ముక్కలకు ఏదైనా డిస్కౌంట్ ఉందా?",
    hi: "मैं 20 पीस लेना चाहता हूँ, तो क्या 20 पीस पर कोई डिस्काउंट मिलेगा?",
    ta: "நான் 20 பீஸ்கள் வாங்க விரும்புகிறேன், அதனால் 20 பீஸ்களுக்கு ஏதாவது தள்ளுபடி உண்டா?",
    kn: "ನಾನು 20 ಪೀಸ್ ತೆಗೆದುಕೊಳ್ಳಲು ಆಸಕ್ತಿ ಹೊಂದಿದ್ದೇನೆ, ಹಾಗಾಗಿ 20 ಪೀಸ್‌ಗಳಿಗೆ ಏನಾದರೂ ರಿಯಾಯಿತಿ ಇದೆಯೇ?",
    ml: "എനിക്ക് 20 പീസുകൾ എടുക്കാൻ താല്പര്യമുണ്ട്, അതിനാൽ 20 പീസുകൾക്ക് എന്തെങ്കിലും ഡിസ്കൗണ്ട് ഉണ്ടോ?",
    mr: "मला 20 नग घ्यायचे आहेत, तर 20 नगांवर काही सवलत मिळेल का?",
    bn: "আমি ২০টি পিস নিতে আগ্রহী, তাই ২০টি পিসের জন্য কি কোনো ডিসকাউন্ট আছে?",
    or: "ମୁଁ 20ଟି ପିସ୍ ନେବାକୁ ଚାହୁଁଛି, ତେଣୁ 20ଟି ପିସ୍ ପାଇଁ କିଛି ରିହାତି ମିଳିବ କି?"
  },
  {
    en: "Can you do ₹850 per piece for 20 units?",
    te: "20 యూనిట్లకు ఒక్కొక్కటి ₹850 చొప్పున ఇవ్వగలరా?",
    hi: "क्या आप 20 यूनिट के लिए ₹850 प्रति पीस दे सकते हैं?",
    ta: "20 யூனிட்களுக்கு தலா ₹850 வீதம் தர முடியுமா?",
    kn: "20 ಯೂನಿಟ್‌ಗಳಿಗೆ ತಲಾ ₹850 ರಂತೆ ನೀಡಬಹುದೇ?",
    ml: "20 യൂണിറ്റുകൾക്ക് ഒന്നിന് ₹850 നിരക്കിൽ നൽകാമോ?",
    mr: "20 नगांसाठी प्रति नग ₹850 दराने देऊ शकता का?",
    bn: "২০টি ইউনিটের জন্য প্রতি পিস ₹৮৫০ দিতে পারবেন?",
    or: "20ଟି ୟୁନିଟ୍ ପାଇଁ ପ୍ରତି ପିସ୍ ₹850 ରେ ଦେଇପାରିବେ କି?"
  },
  {
    en: "Can you offer a discount if I buy 20 or more pieces?",
    te: "నేను 20 లేదా అంతకంటే ఎక్కువ వస్తువులు కొంటే ఏదైనా రాయితీ ఇవ్వగలరా?",
    hi: "यदि मैं 20 या अधिक पीस खरीदूं तो क्या आप छूट दे सकते हैं?",
    ta: "நான் 20 அல்லது அதற்கு மேற்பட்ட பொருட்கள் வாங்கினால் தள்ளுபடி தர முடியுமா?",
    kn: "ನಾನು 20 ಅಥವಾ ಹೆಚ್ಚಿನ ವಸ್ತುಗಳನ್ನು ಖರೀದಿಸಿದರೆ ರಿಯಾಯಿತಿ ನೀಡಬಹುದೇ?",
    ml: "ഞാൻ 20 അല്ലെങ്കിൽ അതിൽ കൂടുതൽ വാങ്ങിയാൽ ഇളവ് നൽകാമോ?",
    mr: "मी 20 किंवा त्याहून अधिक वस्तू घेतल्यास सवलत देऊ शकता का?",
    bn: "আমি 20 বা তার বেশি পণ্য কিনলে কিছু ছাড় দিতে পারবেন?",
    or: "ଯଦି ମୁଁ 20 କିମ୍ବା ଅଧିକ ଜିନିଷ କିଣେ ତେବେ ରିହାତି ଦେଇପାରିବେ କି?"
  },
  {
    en: "Yes, I can offer each piece at a discounted price for bulk orders.",
    te: "అవును, బల్క్ ఆర్డర్ల కోసం నేను ఒక్కొక్క వస్తువును రాయితీ ధరకు ఇవ్వగలను.",
    hi: "हाँ, थोक ऑर्डर के लिए मैं प्रत्येक पीस रियायती कीमत पर दे सकता हूँ।",
    ta: "ஆம், மொத்த ஆர்டர்களுக்கு ஒவ்வொரு பொருளையும் தள்ளுபடி விலையில் தர முடியும்.",
    kn: "ಹೌದು, ಬೃಹತ್ ಆರ್ಡರ್‌ಗಳಿಗೆ ಪ್ರತಿ ವಸ್ತುವನ್ನು ರಿಯಾಯಿತಿ ದರದಲ್ಲಿ ನೀಡಬಹುದು.",
    ml: "അതെ, ബൾക്ക് ഓർഡറുകൾക്ക് ഓരോ ഇനത്തിനും കുറഞ്ഞ വില നൽകാം.",
    mr: "होय, मोठ्या ऑर्डरीसाठी मी प्रत्येक वस्तू सवलतीच्या दरात देऊ शकतो.",
    bn: "হ্যাঁ, পাইকারি অর্ডারের জন্য আমি প্রতিটি পণ্য ছাড়যুক্ত মূল্যে দিতে পারি।",
    or: "ହଁ, ବଲ୍କ ଅର୍ଡର ପାଇଁ ମୁଁ ପ୍ରତ୍ୟେକ ଜିନିଷ ରିହାତି ମୂଲ୍ୟରେ ଦେଇପାରିବି।"
  },
  {
    en: "Is this product 100% authentic and handmade?",
    te: "ఈ ఉత్పత్తి 100% అసలైనది మరియు చేతితో తయారు చేసినదేనా?",
    hi: "क्या यह उत्पाद 100% प्रामाणिक और हस्तनिर्मित है?",
    ta: "இந்த தயாரிப்பு 100% உண்மையானதும் கையால் செய்யப்பட்டதும் தானா?",
    kn: "ಈ ಉತ್ಪನ್ನವು 100% ಅಧಿಕೃತ ಮತ್ತು ಕೈಯಿಂದ ತಯಾರಿಸಿದ್ದೇ?",
    ml: "ഈ ഉൽപ്പന്നം 100% ആധികാരികവും കൈകൊണ്ട് നിർമ്മിച്ചതുമാണോ?",
    mr: "हे उत्पादन 100% अस्सल आणि हाताने बनवलेले आहे का?",
    bn: "এই পণ্যটি কি 100% খাঁটি এবং হাতে তৈরি?",
    or: "ଏହି ଉତ୍ପାଦଟି କଣ 100% ପ୍ରାମାଣିକ ଏବଂ ହାତ ତିଆରି?"
  },
  {
    en: "Yes, this is completely handcrafted with traditional natural materials.",
    te: "అవును, ఇది పూర్తిగా సాంప్రదాయ సహజ పదార్థాలతో స్వహస్తాలతో తయారు చేయబడింది.",
    hi: "हाँ, यह पूरी तरह से पारंपरिक प्राकृतिक सामग्रियों से हाथ से बनाया गया है।",
    ta: "ஆம், இது பாரம்பரிய இயற்கை பொருட்களால் முழுமையாக கைவினைக் கலைஞரால் செய்யப்பட்டது.",
    kn: "ಹೌದು, ಇದು ಸಂಪೂರ್ಣವಾಗಿ ಸಾಂಪ್ರದಾಯಿಕ ನೈಸರ್ಗಿಕ ವಸ್ತುಗಳಿಂದ ಕೈಯಿಂದ ಮಾಡಲ್ಪಟ್ಟಿದೆ.",
    ml: "അതെ, പരമ്പരാഗത പ്രകൃതിദത്ത വസ്തുക്കൾ ഉപയോഗിച്ച് പൂർണ്ണമായും കൈകൊണ്ട് നിർമ്മിച്ചതാണ്.",
    mr: "होय, हे संपूर्णपणे पारंपारिक नैसर्गिक साहित्यापासून हाताने बनवले आहे.",
    bn: "হ্যাঁ, এটি সম্পূর্ণ ঐতিহ্যবাহী প্রাকৃতিক উপাদান দিয়ে হাতে তৈরি।",
    or: "ହଁ, ଏହା ସମ୍ପୂର୍ଣ୍ଣ ରୂପେ ପାରମ୍ପରିକ ପ୍ରାକୃତିକ ସାମଗ୍ରୀରେ ହାତରେ ତିଆରି।"
  },
  {
    en: "How many days will it take for delivery?",
    te: "డెలివరీకి ఎన్ని రోజులు సమయం పడుతుంది?",
    hi: "डिलीवरी में कितने दिन लगेंगे?",
    ta: "டெலிவரி செய்ய எத்தனை நாட்கள் ஆகும்?",
    kn: "ವಿತರಣೆಗೆ ಎಷ್ಟು ದಿನಗಳು ಬೇಕಾಗುತ್ತವೆ?",
    ml: "ഡെലിവറിക്ക് എത്ര ദിവസം എടുക്കും?",
    mr: "डिलिव्हरीसाठी किती दिवस लागतील?",
    bn: "ডেলিভারি হতে কত দিন সময় লাগবে?",
    or: "ଡେଲିଭରୀ ପାଇଁ କେତେ ଦିନ ଲାଗିବ?"
  },
  {
    en: "We can pack and dispatch safely within 3 to 5 working days.",
    te: "మేము 3 నుండి 5 పని దినాలలో సురక్షితంగా ప్యాక్ చేసి పంపగలము.",
    hi: "हम 3 से 5 कार्य दिवसों में सुरक्षित रूप से पैक करके भेज सकते हैं।",
    ta: "நாங்கள் 3 முதல் 5 வேலை நாட்களுக்குள் பாதுகாப்பாக பேக் செய்து அனுப்பிவிடுவோம்.",
    kn: "ನಾವು 3 ರಿಂದ 5 ಕೆಲಸದ ದಿನಗಳಲ್ಲಿ ಸುರಕ್ಷಿತವಾಗಿ ಪ್ಯಾಕ್ ಮಾಡಿ ರವಾನಿಸುತ್ತೇವೆ.",
    ml: "3 മുതൽ 5 പ്രവൃത്തി ദിവസങ്ങൾക്കുള്ളിൽ സുരക്ഷിതമായി അയക്കാൻ കഴിയും.",
    mr: "आम्ही 3 ते 5 कामकाजाच्या दिवसांत सुरक्षितपणे पॅक करून पाठवू शकतो.",
    bn: "আমরা ৩ থেকে ৫ কার্যদিবসের মধ্যে নিরাপদে প্যাক করে পাঠিয়ে দিতে পারব।",
    or: "ଆମେ 3 ରୁ 5 କାର୍ଯ୍ୟଦିବସ ମଧ୍ୟରେ ସୁରକ୍ଷିତ ଭାବେ ପ୍ୟାକ୍ କରି ପଠାଇ ପାରିବୁ।"
  },
  {
    en: "I accept your price offer. Let us proceed.",
    te: "నేను మీ ధర ప్రతిపాదనను అంగీకరిస్తున్నాను. ఆర్డర్‌తో ముందుకు వెళ్దాం.",
    hi: "मैं आपके मूल्य प्रस्ताव को स्वीकार करता हूँ। आगे बढ़ते हैं।",
    ta: "உங்கள் விலை சலுகையை நான் ஏற்றுக்கொள்கிறேன். தொடர்ந்து செய்வோம்.",
    kn: "ನಾನು ನಿಮ್ಮ ಬೆಲೆಯ ಪ್ರಸ್ತಾಪವನ್ನು ಒಪ್ಪಿಕೊಳ್ಳುತ್ತೇನೆ. ಮುಂದುವರಿಯೋಣ.",
    ml: "ഞാൻ നിങ്ങളുടെ ഓഫർ സ്വീകരിക്കുന്നു. നമുക്ക് മുന്നോട്ട് പോകാം.",
    mr: "मला तुमची किमतीची ऑफर मान्य आहे. पुढे जाऊया.",
    bn: "আমি আপনার দামের প্রস্তাব গ্রহণ করছি। চলুন এগিয়ে যাই।",
    or: "ମୁଁ ଆପଣଙ୍କ ମୂଲ୍ୟ ପ୍ରସ୍ତାବକୁ ସ୍ୱୀକାର କରୁଛି। ଆଗକୁ ବଢ଼ିବା।"
  }
];

function findPhraseMatch(text: string, fromLang: string, toLang: string): string | null {
  const cleanInput = text.trim().toLowerCase();
  for (const item of COMMON_PHRASES) {
    const fromText = (item as any)[fromLang];
    if (fromText && fromText.toLowerCase() === cleanInput) {
      return (item as any)[toLang] || null;
    }
    // Partial substring match for common questions
    if (fromText && (cleanInput.includes(fromText.toLowerCase()) || fromText.toLowerCase().includes(cleanInput))) {
      return (item as any)[toLang] || null;
    }
  }
  return null;
}

/**
 * Translates a single chat message from source language to target language.
 */
export async function translateChatMessage(
  text: string,
  fromLang: string,
  toLang: string
): Promise<string> {
  const trimmed = text.trim();
  if (!trimmed) return '';
  if (fromLang === toLang) return trimmed;

  const fromInfo = LANGUAGE_NAMES[fromLang] || { english: fromLang, native: fromLang };
  const toInfo = LANGUAGE_NAMES[toLang] || { english: toLang, native: toLang };

  // Fast phrase match check
  const phraseMatch = findPhraseMatch(trimmed, fromLang, toLang);
  if (phraseMatch) {
    return phraseMatch;
  }

  // Try Gemini API with supported models
  const ai = getGenAI();
  if (ai) {
    const prompt = `You are a real-time translator for CraftWise, an Indian handicrafts marketplace app.
Translate the following chat message from ${fromInfo.english} (${fromInfo.native}) into ${toInfo.english} (${toInfo.native}).
Context: Direct buyer-seller conversation for bulk order enquiries, price bargaining, shipping, and handicraft questions.
Important rules:
1. Translate faithfully, naturally, and politely in everyday spoken Indian style.
2. Keep numbers, quantities, prices (e.g. ₹380), currency symbols, phone numbers, and place names unchanged.
3. Return ONLY the translated sentence. Do NOT include quotes, notes, greetings, or conversational filler.

Message to translate:
${trimmed}`;

    const modelsToTry = ['gemini-3.1-flash-lite', 'gemini-3.8-flash'];
    for (const model of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt
        });

        const translated = response.text ? response.text.trim().replace(/^["']|["']$/g, '') : '';
        // Make sure it did not return an error or placeholder
        if (translated && !translated.startsWith('{') && !translated.includes('Translate the following')) {
          return translated;
        }
      } catch (err: any) {
        console.warn(`Gemini translation error with ${model} (${fromLang} -> ${toLang}):`, err?.message || err);
      }
    }
  }

  // Fallback heuristic translation when API is unavailable
  return generateFallbackTranslation(trimmed, fromLang, toLang);
}

/**
 * Intelligent heuristic fallback translation preserving amounts and key vocabulary
 */
function generateFallbackTranslation(text: string, fromLang: string, toLang: string): string {
  // Extract numbers, quantities, and price if present
  const priceMatch = text.match(/₹\s*(\d+)/i) || text.match(/rs\.?\s*(\d+)/i);
  const qtyMatch = text.match(/(\d+)\s*(pieces|units|items|బుట్టలు|పీసులు|नग|पीस)/i);

  const priceVal = priceMatch ? priceMatch[1] : null;
  const qtyVal = qtyMatch ? qtyMatch[1] : null;
  const lower = text.toLowerCase();

  // Discount, bulk purchase, and bargaining enquiries
  if (lower.includes('discount') || lower.includes('offer') || lower.includes('price') || lower.includes('best price') ||
      lower.includes('rate') || text.includes('రాయితీ') || text.includes('డిస్కౌంట్') || text.includes('ధర') ||
      text.includes('छूट') || text.includes('कीमत') || text.includes('भाव')) {
    const qStr = qtyVal ? `${qtyVal} ` : '';
    switch (toLang) {
      case 'te':
        return priceVal 
          ? `${qStr}యూనిట్లకు ఒక్కొక్కటి ₹${priceVal} ధరకు ఇవ్వగలరా?`
          : `నేను ${qStr}వస్తువులు కొనడానికి ఆసక్తిగా ఉన్నాను, ఏమైనా రాయితీ లేదా ఉత్తమ ధర ఉందా?`;
      case 'hi':
        return priceVal 
          ? `क्या आप ${qStr}यूनिट के लिए ₹${priceVal} प्रति पीस दे सकते हैं?`
          : `मैं ${qStr}पीस लेने में रुचि रखता हूँ, क्या कोई छूट या विशेष कीमत मिलेगी?`;
      case 'en':
        return priceVal 
          ? `Can you do ₹${priceVal} per piece for ${qStr}units?`
          : `I am interested in taking ${qStr}pieces, is there any discount or best price available?`;
      case 'ta':
        return priceVal 
          ? `${qStr}யூனிட்களுக்கு தலா ₹${priceVal} விலையில் தர முடியுமா?`
          : `நான் ${qStr}பொருட்கள் வாங்க விரும்புகிறேன், ஏதாவது தள்ளுபடி உண்டா?`;
      case 'kn':
        return priceVal 
          ? `${qStr}ಯೂನಿಟ್‌ಗಳಿಗೆ ತಲಾ ₹${priceVal} ರಂತೆ ನೀಡಬಹುದೇ?`
          : `ನಾನು ${qStr}ವಸ್ತುಗಳನ್ನು ತೆಗೆದುಕೊಳ್ಳಲು ಆಸಕ್ತಿ ಹೊಂದಿದ್ದೇನೆ, ಏನಾದರೂ ರಿಯಾಯಿತಿ ಸಿಗುತ್ತದೆಯೇ?`;
      case 'ml':
        return priceVal 
          ? `${qStr}യൂണിറ്റുകൾക്ക് ഒന്നിന് ₹${priceVal} നിരക്കിൽ നൽകാമോ?`
          : `എനിക്ക് ${qStr}ഇനങ്ങൾ വാങ്ങാൻ താല്പര്യമുണ്ട്, എന്തെങ്കിലും ഇളവ് ലഭിക്കുമോ?`;
      case 'mr':
        return priceVal 
          ? `${qStr}नगांसाठी प्रति नग ₹${priceVal} दराने देऊ शकता का?`
          : `मला ${qStr}नग घ्यायचे आहेत, तर काही सवलत मिळेल का?`;
      case 'bn':
        return priceVal 
          ? `${qStr}ইউনিটের জন্য প্রতি পিস ₹${priceVal} দিতে পারবেন?`
          : `আমি ${qStr}পিস নিতে আগ্রহী, কোনো ছাড় বা সেরা দাম পাওয়া যাবে কি?`;
      case 'or':
        return priceVal 
          ? `${qStr}ୟୁନିଟ୍ ପାଇଁ ପ୍ରତି ପିସ୍ ₹${priceVal} ରେ ଦେଇପାରିବେ କି?`
          : `ମୁଁ ${qStr}ଜିନିଷ କିଣିବାକୁ ଚାହୁଁଛି, କିଛି ରିହାତି ମିଳିବ କି?`;
    }
  }

  // If no heuristic applies, return clean original text (never corrupt with bracketed language codes)
  return text;
}

/**
 * Pre-computes translations for all supported languages in a single fast batch call.
 */
export async function translateMessageToAll(
  text: string,
  fromLang: string,
  targetLangs: string[] = ['en', 'te', 'hi', 'ta', 'kn', 'ml', 'mr', 'bn', 'or']
): Promise<Record<string, string>> {
  const result: Record<string, string> = {};
  result[fromLang] = text;

  const otherLangs = targetLangs.filter(l => l !== fromLang);
  if (otherLangs.length === 0) return result;

  const ai = getGenAI();
  if (ai) {
    const fromInfo = LANGUAGE_NAMES[fromLang] || { english: fromLang, native: fromLang };
    const targetsDescription = otherLangs.map(l => {
      const info = LANGUAGE_NAMES[l] || { english: l, native: l };
      return `"${l}": ${info.english} (${info.native})`;
    }).join(', ');

    const prompt = `You are a real-time translator for CraftWise, an Indian handicrafts marketplace.
Translate this chat message from ${fromInfo.english} into these languages:
${targetsDescription}

Message to translate:
"${text}"

Rules:
1. Translate naturally and faithfully in everyday spoken Indian style.
2. Keep numbers, quantities, prices (e.g. ₹380), currency symbols, and place names unchanged.
3. Return ONLY a valid JSON object where keys are the language codes (${otherLangs.map(l => `"${l}"`).join(', ')}) and values are the translated strings.`;

    const modelsToTry = ['gemini-3.1-flash-lite', 'gemini-3.8-flash'];
    for (const model of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            responseMimeType: 'application/json'
          }
        });

        const raw = response.text?.trim();
        if (raw) {
          let cleanJson = raw.trim();
          if (cleanJson.includes('```')) {
            cleanJson = cleanJson.replace(/```(?:json)?/gi, '').replace(/```/g, '').trim();
          }
          const firstBrace = cleanJson.indexOf('{');
          const lastBrace = cleanJson.lastIndexOf('}');
          if (firstBrace !== -1 && lastBrace !== -1) {
            cleanJson = cleanJson.substring(firstBrace, lastBrace + 1);
          }

          const parsed = JSON.parse(cleanJson);
          let successCount = 0;
          for (const lang of otherLangs) {
            if (parsed[lang] && typeof parsed[lang] === 'string' && parsed[lang].trim()) {
              result[lang] = parsed[lang].trim();
              successCount++;
            }
          }
          if (successCount > 0) {
            // Fill any missing with individual translation
            for (const lang of otherLangs) {
              if (!result[lang]) {
                result[lang] = await translateChatMessage(text, fromLang, lang);
              }
            }
            return result;
          }
        }
      } catch (err: any) {
        console.warn(`Batch translation error with ${model}:`, err?.message || err);
      }
    }
  }

  // Fallback: translate each language
  for (const lang of otherLangs) {
    if (!result[lang]) {
      result[lang] = await translateChatMessage(text, fromLang, lang);
    }
  }

  return result;
}
