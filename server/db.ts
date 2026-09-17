import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import {
  User,
  ArtisanProfile,
  Product,
  Enquiry,
  Inventory,
  Translations,
  PriceRecommendation,
  MarketingContent,
  AIProcessing,
  ChatMessage,
  ChatConversation,
  Order,
  OrderStatus,
  OrderDeliveryDetails,
  OrderStatusHistoryItem,
  OrderNotification,
  BuyerReport
} from './types.js';

const DATA_FILE = path.join(process.cwd(), 'database', 'craftwise_store.json');
const BACKUP_FILE = path.join(process.cwd(), 'database', 'craftwise_store.backup.json');

interface DatabaseStore {
  users: User[];
  profiles: ArtisanProfile[];
  products: Product[];
  enquiries: Enquiry[];
  inventory: Inventory[];
  conversations: ChatConversation[];
  messages: ChatMessage[];
  orders: Order[];
  orderNotifications: OrderNotification[];
  buyerReports?: BuyerReport[];
}

// Sample High-Quality Base64 SVG / JPEG placeholders for demo products
export const SAMPLE_BAMBOO_BASKET_IMAGE =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800"><defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23faf8f5"/><stop offset="100%" stop-color="%23f0e8dc"/></linearGradient><radialGradient id="spotlight" cx="50%" cy="40%" r="60%"><stop offset="0%" stop-color="%23ffffff" stop-opacity="0.9"/><stop offset="100%" stop-color="%23d8cbb8" stop-opacity="0.3"/></radialGradient><linearGradient id="bamboo" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23c28e46"/><stop offset="50%" stop-color="%239a6627"/><stop offset="100%" stop-color="%236e4414"/></linearGradient><linearGradient id="rim" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="%23dbad67"/><stop offset="100%" stop-color="%2385551c"/></linearGradient></defs><rect width="800" height="800" fill="url(%23bg)"/><circle cx="400" cy="380" r="340" fill="url(%23spotlight)"/><ellipse cx="400" cy="590" rx="260" ry="45" fill="%23c4b5a0" opacity="0.4" filter="blur(8px)"/><path d="M220 360 C 220 540, 310 580, 400 580 C 490 580, 580 540, 580 360 Z" fill="url(%23bamboo)" stroke="%235a340e" stroke-width="4"/><ellipse cx="400" cy="360" rx="180" ry="45" fill="%23532f09" stroke="%23dbad67" stroke-width="8"/><ellipse cx="400" cy="360" rx="160" ry="35" fill="%233a1e04"/><path d="M250 380 Q 400 460 550 380 M270 410 Q 400 490 530 410 M300 440 Q 400 520 500 440 M330 470 Q 400 550 470 470 M360 500 Q 400 570 440 500" fill="none" stroke="%23e8be78" stroke-width="3.5" opacity="0.85"/><path d="M260 370 L380 575 M310 365 L400 580 M370 362 L420 578 M430 362 L380 578 M490 365 L400 580 M540 370 L420 575" stroke="%23a87532" stroke-width="2.5" opacity="0.7"/><ellipse cx="400" cy="355" rx="182" ry="46" fill="none" stroke="url(%23rim)" stroke-width="10"/><path d="M300 360 C 300 200, 500 200, 500 360" fill="none" stroke="%237a4b16" stroke-width="16" stroke-linecap="round"/><path d="M300 360 C 300 200, 500 200, 500 360" fill="none" stroke="%23dfb06a" stroke-width="8" stroke-dasharray="16,8" stroke-linecap="round"/><text x="400" y="720" font-family="system-ui, sans-serif" font-size="22" font-weight="700" fill="%238a5b23" text-anchor="middle" letter-spacing="2">HANDCRAFTED BAMBOO BASKET</text><text x="400" y="750" font-family="system-ui, sans-serif" font-size="15" font-weight="500" fill="%23857564" text-anchor="middle">Crafted by Lakshmi • Visakhapatnam, Andhra Pradesh</text></svg>';

export const SAMPLE_TERRACOTTA_POT_IMAGE =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800"><defs><linearGradient id="tbg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23faf8f5"/><stop offset="100%" stop-color="%23f0e8dc"/></linearGradient><linearGradient id="clay" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="%23d6663f"/><stop offset="35%" stop-color="%23eb7b52"/><stop offset="70%" stop-color="%23c2522c"/><stop offset="100%" stop-color="%238c3517"/></linearGradient></defs><rect width="800" height="800" fill="url(%23tbg)"/><ellipse cx="400" cy="620" rx="240" ry="40" fill="%23c4b5a0" opacity="0.4" filter="blur(6px)"/><path d="M330 260 L470 260 L480 320 Q 580 440 500 580 L300 580 Q 220 440 320 320 Z" fill="url(%23clay)" stroke="%236e260e" stroke-width="4"/><ellipse cx="400" cy="260" rx="70" ry="18" fill="%236e260e"/><ellipse cx="400" cy="256" rx="66" ry="15" fill="%23a84523"/><path d="M300 420 Q 400 460 500 420" stroke="%23ffebdb" stroke-width="5" fill="none" stroke-dasharray="10,6"/><path d="M280 460 Q 400 510 520 460" stroke="%23ffebdb" stroke-width="7" fill="none"/><text x="400" y="720" font-family="system-ui, sans-serif" font-size="22" font-weight="700" fill="%23a84523" text-anchor="middle" letter-spacing="2">TERRACOTTA ARTISAN WATER VESSEL</text><text x="400" y="750" font-family="system-ui, sans-serif" font-size="15" font-weight="500" fill="%23857564" text-anchor="middle">Eco-Friendly Hand-Thrown Clay • Natural Cooling</text></svg>';

export const SAMPLE_POCHAMPALLY_IKAT_IMAGE =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800"><defs><linearGradient id="silkbg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23fcf8f8"/><stop offset="100%" stop-color="%23faecea"/></linearGradient><linearGradient id="silkbody" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%239e1b32"/><stop offset="50%" stop-color="%23c22442"/><stop offset="100%" stop-color="%23781223"/></linearGradient><linearGradient id="gold" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stop-color="%23e8c364"/><stop offset="50%" stop-color="%23ffd97d"/><stop offset="100%" stop-color="%23b88d28"/></linearGradient></defs><rect width="800" height="800" fill="url(%23silkbg)"/><rect x="180" y="160" width="440" height="480" rx="12" fill="url(%23silkbody)" stroke="%23570815" stroke-width="4"/><rect x="180" y="160" width="440" height="50" fill="url(%23gold)"/><rect x="180" y="590" width="440" height="50" fill="url(%23gold)"/><g fill="%23ffffff" opacity="0.9"><polygon points="300,280 340,320 300,360 260,320"/><polygon points="400,280 440,320 400,360 360,320"/><polygon points="500,280 540,320 500,360 460,320"/><polygon points="350,360 390,400 350,440 310,400"/><polygon points="450,360 490,400 450,440 410,400"/><polygon points="300,440 340,480 300,520 260,480"/><polygon points="400,440 440,480 400,520 360,480"/><polygon points="500,440 540,480 500,520 460,480"/></g><g stroke="%23ffdb8b" stroke-width="3" fill="none"><line x1="200" y1="185" x2="600" y2="185"/><line x1="200" y1="615" x2="600" y2="615"/></g><text x="400" y="720" font-family="system-ui, sans-serif" font-size="22" font-weight="700" fill="%238a1a2e" text-anchor="middle" letter-spacing="2">POCHAMPALLY IKAT SILK SCARF</text><text x="400" y="750" font-family="system-ui, sans-serif" font-size="15" font-weight="500" fill="%23736762" text-anchor="middle">GI-Tagged Double-Ikat Weave • Pochampally, Telangana</text></svg>';

export const SAMPLE_DOKRA_BRASS_IMAGE =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800"><defs><linearGradient id="dokrabg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23f9f8f4"/><stop offset="100%" stop-color="%23ece6d8"/></linearGradient><linearGradient id="brass" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23c49a45"/><stop offset="40%" stop-color="%238c6b24"/><stop offset="80%" stop-color="%23543d0d"/><stop offset="100%" stop-color="%23a88235"/></linearGradient></defs><rect width="800" height="800" fill="url(%23dokrabg)"/><ellipse cx="400" cy="620" rx="260" ry="35" fill="%23c4b5a0" opacity="0.4" filter="blur(6px)"/><g fill="url(%23brass)" stroke="%23382705" stroke-width="3"><ellipse cx="400" cy="440" rx="160" ry="110"/><circle cx="280" cy="350" r="70"/><circle cx="270" cy="340" r="8" fill="%23ffd97d"/><path d="M240 370 Q 210 440 230 490 Q 245 495 250 480 Q 235 440 255 380 Z"/><rect x="300" y="520" width="35" height="100" rx="6"/><rect x="350" y="530" width="35" height="90" rx="6"/><rect x="440" y="530" width="35" height="90" rx="6"/><rect x="490" y="520" width="35" height="100" rx="6"/><path d="M530 420 Q 580 440 560 510 Q 550 515 545 500 Q 560 450 520 440 Z"/></g><g stroke="%23ffd269" stroke-width="3" fill="none" opacity="0.85"><path d="M340 400 Q 400 370 460 400 M340 430 Q 400 400 460 430 M340 460 Q 400 430 460 460 M340 490 Q 400 460 460 490"/></g><text x="400" y="720" font-family="system-ui, sans-serif" font-size="22" font-weight="700" fill="%236e5316" text-anchor="middle" letter-spacing="2">BASTAR DOKRA BELL METAL ART</text><text x="400" y="750" font-family="system-ui, sans-serif" font-size="15" font-weight="500" fill="%23736762" text-anchor="middle">Ancient 4,000-Year Lost-Wax Cast • Bastar, Chhattisgarh</text></svg>';

export const SAMPLE_CHANNAPATNA_TOY_IMAGE =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800"><defs><linearGradient id="cbg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23f9fbf7"/><stop offset="100%" stop-color="%23ecf2e7"/></linearGradient></defs><rect width="800" height="800" fill="url(%23cbg)"/><ellipse cx="400" cy="620" rx="250" ry="38" fill="%23b8c2b1" opacity="0.4" filter="blur(6px)"/><circle cx="400" cy="420" r="170" fill="%23d4881e" stroke="%238a4d04" stroke-width="6"/><circle cx="400" cy="420" r="140" fill="%23d62828" stroke="%23851010" stroke-width="5"/><circle cx="400" cy="420" r="105" fill="%23f77f00" stroke="%23a85400" stroke-width="4"/><circle cx="400" cy="420" r="70" fill="%23fcbf49" stroke="%23b8831f" stroke-width="4"/><circle cx="400" cy="420" r="35" fill="%23003049"/><circle cx="400" cy="420" r="12" fill="%23eae2b7"/><ellipse cx="360" cy="380" rx="100" ry="50" fill="%23ffffff" opacity="0.2" transform="rotate(-30 360 380)"/><text x="400" y="720" font-family="system-ui, sans-serif" font-size="22" font-weight="700" fill="%238a4d04" text-anchor="middle" letter-spacing="2">CHANNAPATNA WOODEN CRAFT</text><text x="400" y="750" font-family="system-ui, sans-serif" font-size="15" font-weight="500" fill="%23687363" text-anchor="middle">Eco Ivory-Wood & Vegetable Lacquer Polish • Karnataka</text></svg>';

export const SAMPLE_SABAI_GRASS_BASKET_IMAGE =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800"><defs><linearGradient id="sbg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23fdfcf9"/><stop offset="100%" stop-color="%23f2eee3"/></linearGradient><linearGradient id="grass" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23c7a75b"/><stop offset="50%" stop-color="%23ab8837"/><stop offset="100%" stop-color="%237d5f19"/></linearGradient></defs><rect width="800" height="800" fill="url(%23sbg)"/><ellipse cx="400" cy="610" rx="250" ry="40" fill="%23c7bfae" opacity="0.4" filter="blur(6px)"/><ellipse cx="400" cy="520" rx="210" ry="90" fill="url(%23grass)" stroke="%2357410c" stroke-width="4"/><ellipse cx="400" cy="450" rx="200" ry="85" fill="%23b89542" stroke="%2357410c" stroke-width="4"/><ellipse cx="400" cy="380" rx="190" ry="80" fill="%23c9a651" stroke="%2357410c" stroke-width="4"/><ellipse cx="400" cy="310" rx="180" ry="75" fill="%23dab966" stroke="%2357410c" stroke-width="4"/><ellipse cx="400" cy="305" rx="150" ry="50" fill="%23543d0d"/><path d="M230 330 Q 180 230 250 250 M570 330 Q 620 230 550 250" stroke="%2345330e" stroke-width="12" fill="none" stroke-linecap="round"/><text x="400" y="720" font-family="system-ui, sans-serif" font-size="22" font-weight="700" fill="%23755816" text-anchor="middle" letter-spacing="2">MAYURBHANJ SABAI GRASS BASKET</text><text x="400" y="750" font-family="system-ui, sans-serif" font-size="15" font-weight="500" fill="%23787162" text-anchor="middle">Golden Natural Grass Tribal Handcraft • Mayurbhanj, Odisha</text></svg>';

// Initial Demo Seed Data
function getInitialSeedData(): DatabaseStore {
  const passwordHash = bcrypt.hashSync('craftwise2026', 10);
  const lakshmiId = 'artisan_lakshmi_sih2026';

  const demoUser: User = {
    id: lakshmiId,
    fullName: 'Lakshmi Devi',
    mobile: '9876543210',
    email: 'lakshmi@craftwise.in',
    passwordHash,
    role: 'artisan',
    preferredLanguage: 'te',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const demoProfile: ArtisanProfile = {
    id: 'prof_lakshmi_1',
    userId: lakshmiId,
    craftType: 'Bamboo Handicrafts',
    state: 'Andhra Pradesh',
    district: 'Visakhapatnam',
    villageOrCity: 'Anandapuram, Visakhapatnam',
    cooperativeName: 'Giri Jan Kalyan Bamboo Producers Group',
    yearsOfExperience: 14,
    craftDescription: 'Third-generation artisan specializing in handwoven sustainable bamboo storage baskets, lampshades, and fruit trays using native hill bamboo.',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const demoProduct1Translations: Translations = {
    te: {
      title: 'చేతితో నేసిన సాంప్రదాయ వెదురు బుట్ట (Handcrafted Bamboo Basket)',
      shortDescription: 'స్థానిక కొండ వెదురుతో చేతితో నేసిన పర్యావరణ అనుకూలమైన నిల్వ బుట్ట.',
      detailedDescription: 'విశాఖపట్నం జిల్లాలోని సాంప్రదాయ కళాకారులచే 100% సహజమైన వెదురుతో 3 గంటల శ్రమతో తయారుచేయబడిన పటిష్టమైన చేతి బుట్ట. కూరగాయలు, పండ్లు, బట్టలు భద్రపరచడానికి లేదా గృహాలంకరణకు అత్యంత అనువైనది.'
    },
    hi: {
      title: 'हस्तनिर्मित पारंपरिक बांस की टोकरी',
      shortDescription: 'पर्यावरण-अनुकूल और टिकाऊ बांस की टोकरी, घर की सजावट और भंडारण के लिए उपयुक्त।',
      detailedDescription: 'आंध्र प्रदेश के विशाखापट्टनम की पारंपरिक कारीगर लक्ष्मी द्वारा शुद्ध प्राकृतिक पहाड़ी बांस से लगभग तीन घंटे में हाथ से बुनी गई टोकरी। इसमें कोई हानिकारक केमिकल नहीं है।'
    },
    en: {
      title: 'Handcrafted Traditional Bamboo Storage Basket',
      shortDescription: 'Eco-friendly and durable artisan bamboo basket suitable for home storage and decor.',
      detailedDescription: 'Handwoven from 100% natural, sustainably sourced hill bamboo by artisan Lakshmi in Visakhapatnam, Andhra Pradesh. Requires over 3 hours of meticulous hand-splitting and weaving. Lightweight, biodegradable, and built to last.'
    },
    ta: {
      title: 'கைவினை பாரம்பரிய மூங்கில் கூடை (Handcrafted Bamboo Basket)',
      shortDescription: 'வீட்டுப் பயன்பாட்டிற்கும் அலங்காரத்திற்கும் ஏற்ற சுற்றுச்சூழல் பாதுகாப்பு கொண்ட கைவினை மூங்கில் கூடை.',
      detailedDescription: 'விசாகப்பட்டினத்தின் பாரம்பரிய கைவினைஞர் லக்ஷ்மியால் 100% இயற்கை மூங்கிலைக் கொண்டு நேர்த்தியாக பின்னப்பட்ட உறுதியான கூடை.'
    },
    kn: {
      title: 'ಸಾಂಪ್ರದಾಯಿಕ ಕೈಯಿಂದ ನೇಯ್ದ ಬಿದಿರಿನ ಬುಟ್ಟಿ (Bamboo Basket)',
      shortDescription: 'ಪರಿಸರ ಸ್ನೇಹಿ ಮತ್ತು ಬಾಳಿಕೆ ಬರುವ ಕೈಯಿಂದ ತಯಾರಿಸಿದ ನೈಸರ್ಗಿಕ ಬಿದಿರಿನ ಬುಟ್ಟಿ.',
      detailedDescription: 'ವಿಶಾಖಪಟ್ಟಣಂನ ಸಾಂಪ್ರದಾಯಿಕ ಕುಶಲಕರ್ಮಿ ಲಕ್ಷ್ಮಿ ಅವರಿಂದ 100% ನೈಸರ್ಗಿಕ ಬೆಟ್ಟದ ಬಿದಿರಿನಿಂದ 3 ಗಂಟೆಗಳ ಶ್ರಮದಲ್ಲಿ ಸಿದ್ಧಪಡಿಸಲಾದ ಬುಟ್ಟಿ.'
    },
    ml: {
      title: 'പരമ്പരാഗത കൈകൊണ്ട് നെയ്ത മുള കൊട്ട (Handcrafted Bamboo Basket)',
      shortDescription: 'വീട്ടുപകരണങ്ങൾ സൂക്ഷിക്കുന്നതിനും അലങ്കാരത്തിനും അനുയോജ്യമായ പ്രകൃതിദത്ത മുള കൊട്ട.',
      detailedDescription: 'വിശാഖപട്ടണത്തെ പരമ്പരാഗത കരകൗശല വിദഗ്ധ ലക്ഷ്മി സ്വാഭാവിക മലയോര മുള ഉപയോഗിച്ച് മൂന്ന് മണിക്കൂർ സൂക്ഷ്മമായി നെയ്തെടുത്തത്.'
    },
    mr: {
      title: 'हस्तनिर्मित पारंपारिक बांबूची टोपली (Handmade Bamboo Basket)',
      shortDescription: 'पर्यावरणपूरक आणि टिकाऊ बांबूची टोपली, घरगुती साठवणूक आणि सजावटीसाठी उपयुक्त.',
      detailedDescription: 'आंध्र प्रदेशातील विशाखापट्टणम येथील कारागीर लक्ष्मी यांनी 100% नैसर्गिक बांबूपासून 3 तास परिश्रमपूर्वक हाताने विणलेली टोपली.'
    },
    bn: {
      title: 'হাতে বোনা ঐতিহ্যবাহী বাঁশের ঝুড়ি (Handcrafted Bamboo Basket)',
      shortDescription: 'পরিবেশবান্ধব ও টেকসই বাঁশের ঝুড়ি, বাড়ির সাজসজ্জা এবং জিনিসপত্র রাখার জন্য আদর্শ।',
      detailedDescription: 'বিশাখাপত্তনমের ঐতিহ্যবাহী কারিগর লক্ষ্মী কর্তৃক ১০০% প্রাকৃতিক পাহাড়ী বাঁশ দিয়ে প্রায় ৩ ঘণ্টা যত্নসহকারে বোনা হয়েছে।'
    },
    or: {
      title: 'ହସ୍ତତନ୍ତ ପାରମ୍ପରିକ ବାଉଁଶ ଟୋକେଇ (Handcrafted Bamboo Basket)',
      shortDescription: 'ପରିବେଶ ଅନୁକୂଳ ଏବଂ ସ୍ଥାୟୀ ବାଉଁଶ ଟୋକେଇ, ଘରୋଇ ବ୍ୟବହାର ଓ ସାଜସଜ୍ଜା ପାଇଁ ଉପଯୁକ୍ତ।',
      detailedDescription: 'ବିଶାଖାପାଟଣାର ପାରମ୍ପରିକ କାରିଗର ଲକ୍ଷ୍ମୀଙ୍କ ଦ୍ୱାରା ୧୦୦% ପ୍ରାକୃତିକ ବାଉଁଶରେ ୩ ଘଣ୍ଟାର ପରିଶ୍ରମ ସହିତ ହାତରେ ବୁଣାଯାଇଥିବା ଟୋକେଇ।'
    }
  };

  const demoProduct1Price: PriceRecommendation = {
    id: 'price_rec_1',
    productId: 'prod_bamboo_basket_1',
    suggestedMin: 350,
    suggestedMax: 500,
    artisanCost: 180,
    finalPrice: 420,
    breakdown: {
      materialCostEstimated: 110,
      laborHoursEstimated: 3,
      hourlyLaborRateEstimated: 80,
      marketDemandFactor: 'High festive & eco-living retail demand',
      rationale: [
        'Natural raw bamboo splitting and seasoning: ~₹110',
        '3 hours of skilled artisan weaving labor: ~₹240',
        'Comparable handcrafted retail baskets sell between ₹450 and ₹650 in urban craft exhibitions.'
      ]
    },
    createdAt: new Date().toISOString()
  };

  const demoProduct1Marketing: MarketingContent = {
    whatsAppMessage: `🌿 *చేతితో నేసిన సహజ వెదురు బుట్ట (Handcrafted Bamboo Basket)*\n\nనమస్కారం! మా స్వహస్తాలతో తయారుచేసిన 100% సహజ వెదురు బుట్ట ఇప్పుడు అందుబాటులో ఉంది.\n\n✨ *ధర*: ₹420/- మాత్రమే\n🎋 *మెటీరియల్*: విశాఖపట్నం సహజ వెదురు\n⏱️ *తయారీ సమయం*: 3 గంటల శ్రమతో కూడిన పనితనం\n📦 *ఉపయోగం*: పండ్లు, కూరగాయల నిల్వ మరియు ఇంటి అలంకరణ\n\nడైరెక్ట్ ఆర్డర్ లేదా వివరాల కోసం సంప్రదించండి: https://craftwise.in/product/handcrafted-bamboo-basket-visakha1`,
    instagramCaption: `From our hands to your home. 🌿 Crafted with patience, heritage, and pure native bamboo by artisan Lakshmi from Visakhapatnam. Every weave carries decades of sustainable tribal tradition.\n\nPrice: ₹420 | 100% Biodegradable & Handmade\nDirect artisan link in bio.\n\n#CraftWise #IndianArtisans #BambooCraft #VocalForLocal #HandmadeInIndia #SustainableLiving #HeritageCrafts`,
    shortPromotion: `Authentic handwoven bamboo basket by artisan Lakshmi Devi (Visakhapatnam). Sustainable, sturdy, and directly empowering traditional artisans for ₹420.`
  };

  const demoProduct1AIProcessing: AIProcessing = {
    id: 'ai_proc_1',
    productId: 'prod_bamboo_basket_1',
    status: 'completed',
    stages: {
      photoReceived: true,
      voiceReceived: true,
      understandingProduct: true,
      enhancingImage: true,
      creatingDescription: true,
      translatingContent: true,
      preparingPriceSuggestion: true,
      creatingMarketingContent: true,
      preparingCatalogue: true
    },
    isDemoAiMode: false,
    modelUsed: 'gemini-3.8-flash',
    authenticityGuardPassed: true,
    generatedAt: new Date().toISOString()
  };

  const demoProduct1: Product = {
    id: 'prod_bamboo_basket_1',
    artisanId: lakshmiId,
    slug: 'handcrafted-bamboo-basket-visakha1',
    title: 'Handcrafted Traditional Bamboo Storage Basket',
    shortDescription: 'Eco-friendly and durable artisan bamboo basket suitable for home storage and decor.',
    detailedDescription: 'Handwoven from 100% natural, sustainably sourced hill bamboo by artisan Lakshmi in Visakhapatnam, Andhra Pradesh. Requires over 3 hours of meticulous hand-splitting and weaving.',
    craftCategory: 'Bamboo & Cane Handicrafts',
    materials: ['Natural Hill Bamboo', 'Cane Strips', 'Organic Polish'],
    handmadeAttributes: ['Hand-split bamboo fibers', 'Zero synthetic plastics', 'Bio-degradable', 'Ergonomic woven handle'],
    tags: ['bamboo', 'handicraft', 'storage basket', 'eco-friendly', 'visakhapatnam', 'home decor', 'handmade'],
    status: 'published',
    isApprovedByArtisan: true,
    approvedAt: new Date().toISOString(),
    publishedAt: new Date().toISOString(),
    price: 420,
    stock: 15,
    primaryImage: SAMPLE_BAMBOO_BASKET_IMAGE,
    enhancedImage: SAMPLE_BAMBOO_BASKET_IMAGE,
    preferredImage: 'enhanced',
    voiceNotes: 'ఇది చేతితో చేసిన వెదురు బుట్ట. దీనిని తయారు చేయడానికి సుమారు మూడు గంటల సమయం పడుతుంది. స్వచ్ఛమైన వెదురుతో చేశాను.',
    voiceTranscript: 'This is a handmade bamboo basket. It takes around three hours to make and is made using bamboo.',
    detectedLanguage: 'Telugu (తెలుగు)',
    translations: demoProduct1Translations,
    pricingRecommendation: demoProduct1Price,
    marketingContent: demoProduct1Marketing,
    aiProcessing: demoProduct1AIProcessing,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const demoProduct2: Product = {
    id: 'prod_terracotta_pot_2',
    artisanId: lakshmiId,
    slug: 'terracotta-artisan-water-vessel-visakha2',
    title: 'Traditional Terracotta Hand-Thrown Water Vessel',
    shortDescription: 'Natural clay water cooler vessel crafted on traditional potter wheel.',
    detailedDescription: 'Crafted using fine alluvial riverbed clay from the Godavari basin. Naturally cools drinking water without electricity while adding alkaline mineral freshness.',
    craftCategory: 'Clay & Terracotta Pottery',
    materials: ['Natural Riverbed Clay', 'Terracotta slip'],
    handmadeAttributes: ['Wheel-thrown', 'Fire-kiln baked', 'Natural cooling properties'],
    tags: ['terracotta', 'pottery', 'clay pot', 'natural cooler', 'sustainable'],
    status: 'published',
    isApprovedByArtisan: true,
    publishedAt: new Date().toISOString(),
    price: 320,
    stock: 8,
    primaryImage: SAMPLE_TERRACOTTA_POT_IMAGE,
    enhancedImage: SAMPLE_TERRACOTTA_POT_IMAGE,
    preferredImage: 'enhanced',
    voiceNotes: 'Terracotta drinking water pot made from natural alluvial clay.',
    voiceTranscript: 'Handmade terracotta pot for clean cold drinking water.',
    detectedLanguage: 'English',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const demoInventory: Inventory[] = [
    {
      id: 'inv_1',
      productId: 'prod_bamboo_basket_1',
      quantity: 15,
      lowStockThreshold: 4,
      unitPrice: 420,
      updatedAt: new Date().toISOString()
    },
    {
      id: 'inv_2',
      productId: 'prod_terracotta_pot_2',
      quantity: 8,
      lowStockThreshold: 3,
      unitPrice: 320,
      updatedAt: new Date().toISOString()
    }
  ];

  const demoEnquiries: Enquiry[] = [
    {
      id: 'enq_1',
      productId: 'prod_bamboo_basket_1',
      productTitle: 'Handcrafted Traditional Bamboo Storage Basket',
      buyerName: 'Ananya Sharma (Organic Living Store)',
      buyerContact: '+91 98450 12345 / ananya@organicliving.co',
      message: 'Namaste Lakshmi ji, we are looking to purchase 50 units of your bamboo baskets for our organic lifestyle boutique in Bangalore. Please let us know delivery timeline.',
      quantity: 50,
      status: 'new',
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString()
    },
    {
      id: 'enq_2',
      productId: 'prod_bamboo_basket_1',
      productTitle: 'Handcrafted Traditional Bamboo Storage Basket',
      buyerName: 'Rajesh Varma',
      buyerContact: '98200 99881',
      message: 'Hi, I saw this link on WhatsApp. Can you ship 4 baskets to Hyderabad? How can I pay directly to your UPI?',
      quantity: 4,
      status: 'contacted',
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
    }
  ];

  return {
    users: [],
    profiles: [],
    products: [],
    enquiries: [],
    inventory: [],
    conversations: [],
    messages: [],
    orders: [],
    orderNotifications: []
  };
}

function ensureRichMarketplaceSeed(store: DatabaseStore): boolean {
  let changed = false;
  const passwordHash = bcrypt.hashSync("craftwise2026", 10);

  // Initialize collections if missing
  if (!store.conversations) {
    store.conversations = [];
    changed = true;
  }
  if (!store.messages) {
    store.messages = [];
    changed = true;
  }
  if (!store.orders) {
    store.orders = [];
    changed = true;
  }
  if (!store.orderNotifications) {
    store.orderNotifications = [];
    changed = true;
  }

  // Ensure Buyer Account exists so marketplace test buyers can log in if needed
  const buyerId = "buyer_demo_bangalore";
  if (!store.users.some(u => u.role === "buyer" || u.id === buyerId)) {
    store.users.push({
      id: buyerId,
      fullName: "Ananya Sharma",
      mobile: "9845012345",
      email: "buyer.demo@craftwise.in",
      passwordHash,
      role: "buyer",
      preferredLanguage: "en",
      city: "Bangalore",
      state: "Karnataka",
      deliveryAddress: "#42, 4th Cross, Indiranagar, Bangalore, Karnataka - 560038",
      interestedCategories: [
        "Bamboo & Cane Handicrafts",
        "Handloom & Traditional Weaving",
        "Clay & Terracotta Pottery"
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    changed = true;
  }

  return changed;
}

class Database {
  private store: DatabaseStore;

  constructor() {
    this.store = this.load();
    this.ensureCatalogGeneratorDemoUser();
  }

  private load(): DatabaseStore {
    // 1. Try loading from main database file
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed.users && parsed.products) {
          const changed = ensureRichMarketplaceSeed(parsed);
          if (changed) {
            this.save(parsed);
          }
          // Keep a fresh backup
          try {
            fs.writeFileSync(BACKUP_FILE, JSON.stringify(parsed, null, 2), 'utf-8');
          } catch (_) {}
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Could not read existing database file, trying backup:', e);
    }

    // 2. Try loading from backup file before resetting
    try {
      if (fs.existsSync(BACKUP_FILE)) {
        const rawBackup = fs.readFileSync(BACKUP_FILE, 'utf-8');
        const parsedBackup = JSON.parse(rawBackup);
        if (parsedBackup.users && parsedBackup.products) {
          console.log('Successfully recovered database from backup!');
          ensureRichMarketplaceSeed(parsedBackup);
          this.save(parsedBackup);
          return parsedBackup;
        }
      }
    } catch (e) {
      console.warn('Backup file also invalid or missing:', e);
    }

    // 3. Fallback to initial seed data only if neither exists
    const initial = getInitialSeedData();
    ensureRichMarketplaceSeed(initial);
    this.save(initial);
    return initial;
  }

  private save(storeToSave?: DatabaseStore) {
    try {
      const dir = path.dirname(DATA_FILE);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const data = JSON.stringify(storeToSave || this.store, null, 2);
      const tmpFile = `${DATA_FILE}.tmp.${Date.now()}`;
      
      // Atomic write using temp file + rename
      fs.writeFileSync(tmpFile, data, 'utf-8');
      fs.renameSync(tmpFile, DATA_FILE);

      // Also maintain backup file
      try {
        fs.writeFileSync(BACKUP_FILE, data, 'utf-8');
      } catch (errBackup) {
        console.warn('Could not write backup file:', errBackup);
      }
    } catch (e) {
      console.error('Error persisting database:', e);
    }
  }

  // User Operations
  getUserById(id: string): User | undefined {
    return this.store.users.find(u => u.id === id);
  }

  getUserByEmailOrMobile(identifier: string): User | undefined {
    if (!identifier) return undefined;
    const clean = identifier.trim().toLowerCase();
    const digitsOnly = clean.replace(/\D/g, '');
    const last10Digits = digitsOnly.length >= 10 ? digitsOnly.slice(-10) : digitsOnly;

    return this.store.users.find(u => {
      const emailMatch = u.email.toLowerCase() === clean;
      const userDigits = u.mobile.replace(/\D/g, '');
      const userLast10 = userDigits.length >= 10 ? userDigits.slice(-10) : userDigits;
      const mobileMatch = (last10Digits.length === 10 && userLast10 === last10Digits) || u.mobile === clean;
      return emailMatch || mobileMatch;
    });
  }

  getUserByMobile(mobile: string): User | undefined {
    if (!mobile) return undefined;
    const clean = mobile.trim();
    const digitsOnly = clean.replace(/\D/g, '');
    const last10Digits = digitsOnly.length >= 10 ? digitsOnly.slice(-10) : digitsOnly;

    return this.store.users.find(u => {
      const userDigits = (u.mobile || '').replace(/\D/g, '');
      const userLast10 = userDigits.length >= 10 ? userDigits.slice(-10) : userDigits;
      return (last10Digits.length === 10 && userLast10 === last10Digits) || u.mobile === clean;
    });
  }

  getUserByEmail(email: string): User | undefined {
    if (!email) return undefined;
    const clean = email.trim().toLowerCase();
    return this.store.users.find(u => (u.email || '').trim().toLowerCase() === clean);
  }

  createUser(user: User): User {
    this.store.users.push(user);
    this.save();
    return user;
  }

  getArtisans(): User[] {
    return this.store.users.filter(u => u.role === 'artisan');
  }

  updateUser(id: string, updates: Partial<User>): User | undefined {
    const idx = this.store.users.findIndex(u => u.id === id);
    if (idx === -1) return undefined;
    this.store.users[idx] = {
      ...this.store.users[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.save();
    return this.store.users[idx];
  }

  deleteAllUsersAndProfiles(): void {
    this.store.users = [];
    this.store.profiles = [];
    this.store.enquiries = [];
    this.save();
  }

  // Profile Operations
  getProfileByUserId(userId: string): ArtisanProfile | undefined {
    return this.store.profiles.find(p => p.userId === userId);
  }

  createProfile(profile: ArtisanProfile): ArtisanProfile {
    this.store.profiles.push(profile);
    this.save();
    return profile;
  }

  updateProfile(userId: string, updates: Partial<ArtisanProfile>): ArtisanProfile {
    const idx = this.store.profiles.findIndex(p => p.userId === userId);
    if (idx === -1) {
      const newProfile: ArtisanProfile = {
        id: `prof_${Date.now()}`,
        userId,
        craftType: updates.craftType || 'Handicrafts',
        state: updates.state || 'Andhra Pradesh',
        district: updates.district || 'Visakhapatnam',
        villageOrCity: updates.villageOrCity || 'Visakhapatnam',
        ...updates,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      this.store.profiles.push(newProfile);
      this.save();
      return newProfile;
    }
    this.store.profiles[idx] = {
      ...this.store.profiles[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.save();
    return this.store.profiles[idx];
  }

  // Product Operations
  getProductsByArtisanId(artisanId: string): Product[] {
    return this.store.products.filter(p => p.artisanId === artisanId);
  }

  getProductById(id: string): Product | undefined {
    return this.store.products.find(p => p.id === id);
  }

  getProductBySlug(slug: string): Product | undefined {
    return this.store.products.find(p => p.slug === slug);
  }

  createProduct(product: Product): Product {
    this.store.products.unshift(product);
    // Also create matching inventory record
    this.store.inventory.push({
      id: `inv_${Date.now()}`,
      productId: product.id,
      quantity: product.stock || 1,
      lowStockThreshold: 3,
      unitPrice: product.price || 0,
      updatedAt: new Date().toISOString()
    });
    this.save();
    return product;
  }

  updateProduct(id: string, updates: Partial<Product>): Product | undefined {
    const idx = this.store.products.findIndex(p => p.id === id);
    if (idx === -1) return undefined;
    this.store.products[idx] = {
      ...this.store.products[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    // Keep inventory in sync if stock or price updated
    if (updates.stock !== undefined || updates.price !== undefined) {
      const invIdx = this.store.inventory.findIndex(inv => inv.productId === id);
      if (invIdx !== -1) {
        if (updates.stock !== undefined) this.store.inventory[invIdx].quantity = updates.stock;
        if (updates.price !== undefined) this.store.inventory[invIdx].unitPrice = updates.price;
        this.store.inventory[invIdx].updatedAt = new Date().toISOString();
      }
    }

    this.save();
    return this.store.products[idx];
  }

  deleteProduct(id: string): boolean {
    const initialLen = this.store.products.length;
    this.store.products = this.store.products.filter(p => p.id !== id);
    this.store.inventory = this.store.inventory.filter(i => i.productId !== id);
    this.store.enquiries = this.store.enquiries.filter(e => e.productId !== id);
    this.save();
    return this.store.products.length < initialLen;
  }

  // Inventory Operations
  getInventoryByArtisanId(artisanId: string): Array<{ product: Product; inventory: Inventory }> {
    const products = this.getProductsByArtisanId(artisanId);
    return products.map(p => {
      let inv = this.store.inventory.find(i => i.productId === p.id);
      if (!inv) {
        inv = {
          id: `inv_${p.id}`,
          productId: p.id,
          quantity: p.stock || 0,
          lowStockThreshold: 3,
          unitPrice: p.price || 0,
          updatedAt: new Date().toISOString()
        };
        this.store.inventory.push(inv);
      }
      return { product: p, inventory: inv };
    });
  }

  updateInventory(productId: string, quantity: number, threshold?: number, unitPrice?: number): Inventory | undefined {
    let inv = this.store.inventory.find(i => i.productId === productId);
    if (!inv) {
      inv = {
        id: `inv_${productId}`,
        productId,
        quantity,
        lowStockThreshold: threshold || 3,
        unitPrice: unitPrice || 0,
        updatedAt: new Date().toISOString()
      };
      this.store.inventory.push(inv);
    } else {
      inv.quantity = Math.max(0, quantity);
      if (threshold !== undefined) inv.lowStockThreshold = threshold;
      if (unitPrice !== undefined) inv.unitPrice = unitPrice;
      inv.updatedAt = new Date().toISOString();
    }

    // Also update product status & stock
    const prod = this.store.products.find(p => p.id === productId);
    if (prod) {
      prod.stock = inv.quantity;
      if (inv.quantity === 0 && prod.status === 'published') {
        prod.status = 'out_of_stock';
      } else if (inv.quantity <= inv.lowStockThreshold && prod.status === 'published') {
        prod.status = 'low_stock';
      } else if (inv.quantity > inv.lowStockThreshold && (prod.status === 'low_stock' || prod.status === 'out_of_stock')) {
        prod.status = 'published';
      }
      if (unitPrice !== undefined) prod.price = unitPrice;
      prod.updatedAt = new Date().toISOString();
    }

    this.save();
    return inv;
  }

  // Enquiries Operations
  createEnquiry(enquiry: Enquiry): Enquiry {
    this.store.enquiries.unshift(enquiry);
    this.save();
    return enquiry;
  }

  getEnquiriesByArtisanId(artisanId: string): Enquiry[] {
    const products = this.getProductsByArtisanId(artisanId);
    const productIds = new Set(products.map(p => p.id));
    return this.store.enquiries.filter(e => productIds.has(e.productId));
  }

  updateEnquiryStatus(enquiryId: string, status: 'new' | 'contacted' | 'completed'): Enquiry | undefined {
    const enq = this.store.enquiries.find(e => e.id === enquiryId);
    if (enq) {
      enq.status = status;
      this.save();
    }
    return enq;
  }

  // Marketplace & Buyer Browsing Operations
  getAllPublishedProducts(filter?: {
    category?: string;
    search?: string;
    state?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
  }): Array<{ product: Product; artisan: any }> {
    // Only return products genuinely published and approved by a registered artisan
    let prods = this.store.products.filter(p => {
      const isPublished = (p.status === 'published' || p.status === 'low_stock') && p.isApprovedByArtisan;
      if (!isPublished) return false;
      const artisanUser = this.getUserById(p.artisanId);
      return artisanUser && artisanUser.role === 'artisan';
    });

    if (filter?.category && filter.category !== 'all') {
      const catLower = filter.category.trim().toLowerCase();
      prods = prods.filter(p =>
        (p.craftCategory || '').toLowerCase().includes(catLower)
      );
    }

    if (filter?.search) {
      const q = filter.search.trim().toLowerCase();
      prods = prods.filter(p => {
        const artisanUser = this.getUserById(p.artisanId);
        const artisanProfile = this.getProfileByUserId(p.artisanId);
        return (
          (p.title || '').toLowerCase().includes(q) ||
          (p.shortDescription || '').toLowerCase().includes(q) ||
          (p.craftCategory || '').toLowerCase().includes(q) ||
          (p.tags || []).some(t => t.toLowerCase().includes(q)) ||
          (p.materials || []).some(m => m.toLowerCase().includes(q)) ||
          (artisanUser?.fullName || '').toLowerCase().includes(q) ||
          (artisanProfile?.state || '').toLowerCase().includes(q) ||
          (artisanProfile?.district || '').toLowerCase().includes(q) ||
          (artisanProfile?.craftType || '').toLowerCase().includes(q)
        );
      });
    }

    if (filter?.state && filter.state !== 'all') {
      const stLower = filter.state.trim().toLowerCase();
      prods = prods.filter(p => {
        const profile = this.getProfileByUserId(p.artisanId);
        return (profile?.state || '').toLowerCase().includes(stLower);
      });
    }

    if (filter?.minPrice !== undefined && !isNaN(filter.minPrice)) {
      prods = prods.filter(p => (p.price || 0) >= filter.minPrice!);
    }

    if (filter?.maxPrice !== undefined && !isNaN(filter.maxPrice)) {
      prods = prods.filter(p => (p.price || 0) <= filter.maxPrice!);
    }

    // Sorting
    if (filter?.sortBy === 'price_low') {
      prods.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (filter?.sortBy === 'price_high') {
      prods.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (filter?.sortBy === 'name') {
      prods.sort((a, b) => a.title.localeCompare(b.title));
    } else {
      // Default: newest first
      prods.sort((a, b) => new Date(b.publishedAt || b.createdAt).getTime() - new Date(a.publishedAt || a.createdAt).getTime());
    }

    return prods.map(p => {
      const user = this.getUserById(p.artisanId);
      const profile = this.getProfileByUserId(p.artisanId);
      return {
        product: {
          ...p,
          // CRITICAL: Always preserve the original authentic picture posted by the artisan!
          primaryImage: p.primaryImage,
          originalImage: p.primaryImage,
          enhancedImage: p.enhancedImage || p.primaryImage,
          preferredImage: p.preferredImage || 'original'
        },
        artisan: {
          fullName: user?.fullName || 'Certified Artisan',
          email: user?.email || '',
          mobile: user?.mobile || '',
          craftType: profile?.craftType || p.craftCategory || 'Handicrafts',
          state: profile?.state || 'Andhra Pradesh',
          district: profile?.district || 'Visakhapatnam',
          villageOrCity: profile?.villageOrCity || '',
          cooperativeName: profile?.cooperativeName || '',
          yearsOfExperience: profile?.yearsOfExperience || 10,
          craftDescription: profile?.craftDescription || '',
          avatarUrl: profile?.avatarUrl || ''
        }
      };
    });
  }

  getCategoriesSummary(): Array<{ name: string; count: number; description?: string }> {
    const publishedProds = this.store.products.filter(p => {
      const isPublished = (p.status === 'published' || p.status === 'low_stock') && p.isApprovedByArtisan;
      if (!isPublished) return false;
      const artisanUser = this.getUserById(p.artisanId);
      return artisanUser && artisanUser.role === 'artisan';
    });

    const countsMap = new Map<string, number>();
    for (const p of publishedProds) {
      const cat = p.craftCategory || 'Other Handicrafts';
      countsMap.set(cat, (countsMap.get(cat) || 0) + 1);
    }

    const standardCategories = [
      { name: 'Bamboo & Cane Handicrafts', description: 'Sustainable handwoven storage baskets, lighting & decor' },
      { name: 'Clay & Terracotta Pottery', description: 'Natural unglazed water coolers, cookware & terracotta art' },
      { name: 'Handloom & Traditional Weaving', description: 'GI-tagged pure silks, cotton stoles & heritage weaves' },
      { name: 'Brass & Bell Metal Crafts', description: 'Lost-wax Dokra tribal castings & bell-metal artifacts' },
      { name: 'Wood Carving & Inlay', description: 'Channapatna lacquerware, carving & wooden collectibles' },
      { name: 'Natural Fiber & Jute Crafts', description: 'Eco-friendly Sabai grass, jute & river-grass baskets' }
    ];

    const result = standardCategories.map(c => ({
      name: c.name,
      count: countsMap.get(c.name) || 0,
      description: c.description
    }));

    for (const [catName, count] of countsMap.entries()) {
      if (!standardCategories.some(sc => sc.name === catName)) {
        result.push({ name: catName, count, description: 'Handcrafted traditional artisan creations' });
      }
    }

    return result;
  }

  ensureCatalogGeneratorDemoUser(): { user: User; profile: ArtisanProfile } {
    const demoId = 'demo_catalog_generator';
    let user = this.store.users.find(u => u.id === demoId || u.email === 'catalog.generator@craftwise.in');
    
    if (!user) {
      user = {
        id: demoId,
        fullName: 'Catalog Image Generator',
        mobile: '9999900001',
        email: 'catalog.generator@craftwise.in',
        passwordHash: bcrypt.hashSync('craftwise2026', 10),
        role: 'artisan',
        preferredLanguage: 'en',
        city: 'Visakhapatnam',
        state: 'Andhra Pradesh',
        deliveryAddress: 'CraftWise Instant Studio, Visakhapatnam',
        interestedCategories: ['Bamboo & Cane Handicrafts', 'Handloom Textiles & Sarees', 'Clay Pottery & Terracotta'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      this.store.users.push(user);
    } else {
      user.fullName = 'Catalog Image Generator';
      user.role = 'artisan';
      user.email = 'catalog.generator@craftwise.in';
    }

    let profile = this.store.profiles.find(p => p.userId === user!.id);
    if (!profile) {
      profile = {
        id: 'prof_catalog_generator',
        userId: user.id,
        craftType: 'Traditional Handicrafts & Art',
        state: 'Andhra Pradesh',
        district: 'Visakhapatnam',
        villageOrCity: 'Artisan Studio Cluster',
        cooperativeName: 'CraftWise Instant Catalog Studio',
        yearsOfExperience: 10,
        craftDescription: 'Instant Catalog Image Generator Demo Studio for Indian Artisans',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      this.store.profiles.push(profile);
    }

    this.save();
    return { user, profile };
  }

  getEnquiriesByBuyerContact(contact: string): Enquiry[] {
    if (!contact) return [];
    const clean = contact.trim().toLowerCase();
    const digits = clean.replace(/\D/g, '');
    const last10 = digits.length >= 10 ? digits.slice(-10) : digits;

    return this.store.enquiries.filter(e => {
      const ec = (e.buyerContact || '').toLowerCase();
      const edigits = ec.replace(/\D/g, '');
      const elast10 = edigits.length >= 10 ? edigits.slice(-10) : edigits;
      return (
        ec.includes(clean) ||
        (last10.length === 10 && elast10 === last10) ||
        (e.buyerName || '').toLowerCase().includes(clean)
      );
    });
  }

  // ============================================================
  // MULTILINGUAL CHAT & PRICE BARGAINING METHODS
  // ============================================================
  getConversationsForUser(userId?: string, role?: string, contact?: string): ChatConversation[] {
    const list = this.store.conversations || [];
    if (!userId && !contact) return list;

    const cleanContact = (contact || '').trim().replace(/\D/g, '');
    const last10 = cleanContact.length >= 10 ? cleanContact.slice(-10) : cleanContact;

    return list.filter(c => {
      if (role === 'artisan' && userId) {
        return c.artisanId === userId;
      }
      if (role === 'buyer' && userId) {
        return c.buyerId === userId;
      }
      if (userId && (c.artisanId === userId || c.buyerId === userId)) {
        return true;
      }
      if (last10 && c.buyerMobile) {
        const bmDigits = c.buyerMobile.replace(/\D/g, '');
        if (bmDigits.slice(-10) === last10) return true;
      }
      return false;
    }).sort((a, b) => new Date(b.lastMessageAt || b.updatedAt).getTime() - new Date(a.lastMessageAt || a.updatedAt).getTime());
  }

  getConversationById(id: string): ChatConversation | null {
    return (this.store.conversations || []).find(c => c.id === id) || null;
  }

  getOrCreateConversation(params: {
    productId: string;
    buyerId?: string;
    buyerName?: string;
    buyerMobile?: string;
    buyerLanguage?: string;
  }): ChatConversation {
    const product = this.getProductById(params.productId);
    if (!product) {
      throw new Error(`Product ${params.productId} not found`);
    }

    const artisan = this.getUserById(product.artisanId);
    const artisanProfile = this.getProfileByUserId(product.artisanId);

    const buyerId = params.buyerId || `buyer_${Date.now()}`;
    const buyerName = params.buyerName || 'Interested Buyer';
    const buyerLanguage = params.buyerLanguage || 'en';
    const artisanLanguage = artisan?.preferredLanguage || 'te';

    // Look for existing conversation between this buyer and product
    const existing = (this.store.conversations || []).find(
      c => c.productId === params.productId && (c.buyerId === buyerId || (params.buyerMobile && c.buyerMobile === params.buyerMobile))
    );

    if (existing) {
      if (params.buyerLanguage && existing.buyerLanguage !== params.buyerLanguage) {
        existing.buyerLanguage = params.buyerLanguage;
      }
      return existing;
    }

    const newConv: ChatConversation = {
      id: `conv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      productId: product.id,
      productTitle: product.title,
      productImage: product.primaryImage || product.enhancedImage || '',
      productPrice: product.price || 0,
      productSlug: product.slug,
      artisanId: product.artisanId,
      artisanName: artisan?.fullName || artisanProfile?.cooperativeName || 'Handicraft Artisan',
      artisanMobile: artisan?.mobile || '',
      artisanLanguage,
      buyerId,
      buyerName,
      buyerMobile: params.buyerMobile || '',
      buyerLanguage,
      lastMessage: undefined,
      lastMessageAt: new Date().toISOString(),
      unreadCountArtisan: 0,
      unreadCountBuyer: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (!this.store.conversations) this.store.conversations = [];
    this.store.conversations.push(newConv);
    this.save();
    return newConv;
  }

  addChatMessage(msg: ChatMessage): ChatMessage {
    if (!this.store.messages) this.store.messages = [];
    this.store.messages.push(msg);

    const conv = this.getConversationById(msg.conversationId);
    if (conv) {
      conv.lastMessage = msg.originalText;
      conv.lastMessageAt = msg.createdAt;
      conv.updatedAt = msg.createdAt;
      if (msg.senderRole === 'buyer') {
        conv.unreadCountArtisan = (conv.unreadCountArtisan || 0) + 1;
      } else {
        conv.unreadCountBuyer = (conv.unreadCountBuyer || 0) + 1;
      }
    }

    this.save();
    return msg;
  }

  getMessagesForConversation(conversationId: string): ChatMessage[] {
    const msgs = (this.store.messages || [])
      .filter(m => m.conversationId === conversationId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    // Clean up any old bracketed fallbacks if encountered
    for (const m of msgs) {
      if (m.translations) {
        for (const [lang, val] of Object.entries(m.translations)) {
          if (typeof val === 'string' && /\[.*\]/.test(val)) {
            // Remove corrupted bracketed placeholder so frontend requests clean translation
            delete m.translations[lang];
          }
        }
      }
    }

    return msgs;
  }

  updateChatMessageTranslations(messageId: string, translations: Record<string, string>): ChatMessage | null {
    if (!this.store.messages) return null;
    const msg = this.store.messages.find(m => m.id === messageId);
    if (!msg) return null;
    msg.translations = {
      ...(msg.translations || {}),
      ...translations
    };
    this.save();
    return msg;
  }

  updateConversationLanguage(conversationId: string, role: 'buyer' | 'artisan', language: string): ChatConversation | null {
    const conv = this.getConversationById(conversationId);
    if (!conv) return null;
    if (role === 'buyer') {
      conv.buyerLanguage = language;
    } else {
      conv.artisanLanguage = language;
    }
    conv.updatedAt = new Date().toISOString();
    this.save();
    return conv;
  }

  markConversationAsRead(conversationId: string, role: 'buyer' | 'artisan'): void {
    const conv = this.getConversationById(conversationId);
    if (!conv) return;
    if (role === 'buyer') {
      conv.unreadCountBuyer = 0;
    } else {
      conv.unreadCountArtisan = 0;
    }
    this.save();
  }

  dismissScamWarning(messageId: string): ChatMessage | null {
    if (!this.store.messages) return null;
    const msg = this.store.messages.find(m => m.id === messageId);
    if (!msg || !msg.scamAnalysis) return null;
    msg.scamAnalysis.isDismissed = true;
    this.save();
    return msg;
  }

  blockBuyerInConversation(conversationId: string, blockedByUserId: string): ChatConversation | null {
    const conv = this.getConversationById(conversationId);
    if (!conv) return null;
    conv.isBlocked = true;
    conv.blockedBy = blockedByUserId;
    conv.blockedAt = new Date().toISOString();
    conv.updatedAt = new Date().toISOString();
    this.save();
    return conv;
  }

  unblockBuyerInConversation(conversationId: string): ChatConversation | null {
    const conv = this.getConversationById(conversationId);
    if (!conv) return null;
    conv.isBlocked = false;
    conv.blockedBy = undefined;
    conv.blockedAt = undefined;
    conv.updatedAt = new Date().toISOString();
    this.save();
    return conv;
  }

  createBuyerReport(report: BuyerReport): BuyerReport {
    if (!this.store.buyerReports) this.store.buyerReports = [];
    this.store.buyerReports.push(report);
    this.save();
    return report;
  }

  getBuyerReports(): BuyerReport[] {
    return this.store.buyerReports || [];
  }

  // ============================================================
  // ORDERS & SHIPMENT TRACKING METHODS
  // ============================================================
  getOrdersForUser(params: { userId?: string; role?: string; mobile?: string }): Order[] {
    const list = this.store.orders || [];
    const { userId, role, mobile } = params;

    const cleanMobile = (mobile || '').trim().replace(/\D/g, '');
    const last10 = cleanMobile.length >= 10 ? cleanMobile.slice(-10) : cleanMobile;

    return list.filter(order => {
      if (role === 'artisan' && userId) {
        return order.artisanId === userId;
      }
      if (role === 'buyer' && userId) {
        if (order.buyerId === userId) return true;
      }
      if (last10 && order.buyerMobile) {
        const omDigits = order.buyerMobile.replace(/\D/g, '');
        if (omDigits.slice(-10) === last10) return true;
      }
      if (userId && (order.buyerId === userId || order.artisanId === userId)) {
        return true;
      }
      return false;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getOrderById(idOrNumber: string): Order | null {
    if (!idOrNumber) return null;
    const clean = idOrNumber.trim().toLowerCase();
    return (this.store.orders || []).find(o =>
      o.id.toLowerCase() === clean || o.orderNumber.toLowerCase() === clean
    ) || null;
  }

  createOrder(data: {
    productId: string;
    quantity: number;
    customizationNotes?: string;
    deliveryDetails: OrderDeliveryDetails;
    buyerId?: string;
    buyerName?: string;
    buyerMobile?: string;
  }): Order {
    const product = this.getProductById(data.productId);
    if (!product) {
      throw new Error(`Product ${data.productId} not found`);
    }

    const artisan = this.getUserById(product.artisanId);
    const artisanProfile = this.getProfileByUserId(product.artisanId);

    const quantity = Math.max(1, data.quantity || 1);
    // Check inventory stock if tracked
    if (product.stock !== undefined && product.stock !== null) {
      if (product.stock <= 0 || product.status === 'out_of_stock') {
        throw new Error(`This authentic craft item is currently out of stock.`);
      }
      if (product.stock < quantity) {
        throw new Error(`Only ${product.stock} units available in stock. Cannot place order for ${quantity}.`);
      }
    }

    const unitPrice = product.price || 0;
    const subtotal = unitPrice * quantity;
    const deliveryFee = 0;
    const totalAmount = subtotal + deliveryFee;

    const orderNumber = `CW-ORD-${Math.floor(10000 + Math.random() * 90000)}`;
    const orderId = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const nowIso = new Date().toISOString();

    const expectedDelivery = new Date(Date.now() + 86400000 * 6).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });

    const newOrder: Order = {
      id: orderId,
      orderNumber,
      productId: product.id,
      productTitle: product.title,
      productImage: product.primaryImage || product.enhancedImage || '',
      productPrice: product.price || 0,
      productSlug: product.slug,
      craftCategory: product.craftCategory || 'Handicrafts',
      artisanId: product.artisanId,
      artisanName: artisan?.fullName || artisanProfile?.cooperativeName || 'Master Artisan',
      artisanMobile: artisan?.mobile || '',
      buyerId: data.buyerId,
      buyerName: data.buyerName || data.deliveryDetails.buyerName,
      buyerMobile: data.buyerMobile || data.deliveryDetails.buyerMobile,
      quantity,
      unitPrice,
      customizationNotes: data.customizationNotes,
      subtotal,
      deliveryFee,
      totalAmount,
      deliveryDetails: data.deliveryDetails,
      status: 'placed',
      statusHistory: [
        {
          status: 'placed',
          timestamp: nowIso,
          note: 'Order successfully placed. Awaiting artisan confirmation.',
          updatedBy: 'buyer'
        }
      ],
      expectedDeliveryDate: expectedDelivery,
      estimatedTimeOfArrival: '5 - 7 business days',
      createdAt: nowIso,
      updatedAt: nowIso
    };

    if (!this.store.orders) this.store.orders = [];
    this.store.orders.unshift(newOrder);

    // Reserve stock immediately upon order placement
    if (product.stock !== undefined && product.stock !== null) {
      const remainingStock = Math.max(0, product.stock - quantity);
      const newStatus = remainingStock === 0 ? 'out_of_stock' : (remainingStock <= 3 ? 'low_stock' : product.status);
      this.updateProduct(product.id, { stock: remainingStock, status: newStatus });
    }

    // Create Notification for Buyer
    if (!this.store.orderNotifications) this.store.orderNotifications = [];
    this.store.orderNotifications.unshift({
      id: `notif_${Date.now()}_b`,
      orderId: newOrder.id,
      orderNumber: newOrder.orderNumber,
      recipientUserId: newOrder.buyerId,
      recipientMobile: newOrder.buyerMobile,
      title: 'Order Placed Successfully',
      message: `Your order for "${newOrder.productTitle}" (${orderNumber}) was placed with artisan ${newOrder.artisanName}.`,
      status: 'placed',
      read: false,
      createdAt: nowIso
    });

    // Create Notification for Artisan
    if (artisan?.id) {
      this.store.orderNotifications.unshift({
        id: `notif_${Date.now()}_a`,
        orderId: newOrder.id,
        orderNumber: newOrder.orderNumber,
        recipientUserId: artisan.id,
        recipientMobile: artisan.mobile,
        title: 'New Order Received',
        message: `${newOrder.buyerName} placed order ${orderNumber} for "${newOrder.productTitle}" (₹${newOrder.totalAmount}). Please Accept or Reject.`,
        status: 'placed',
        read: false,
        createdAt: nowIso
      });
    }

    this.save();
    return newOrder;
  }

  updateOrderStatus(
    orderId: string,
    newStatus: OrderStatus,
    details?: {
      note?: string;
      rejectionReason?: string;
      trackingPartner?: string;
      trackingNumber?: string;
      expectedDeliveryDate?: string;
      estimatedTimeOfArrival?: string;
    },
    updatedBy: 'buyer' | 'artisan' | 'system' = 'artisan'
  ): Order {
    const order = (this.store.orders || []).find(o => o.id === orderId);
    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }

    const previousStatus = order.status;
    const nowIso = new Date().toISOString();
    order.status = newStatus;
    order.updatedAt = nowIso;

    // Update expected delivery info if provided by artisan
    if (details?.expectedDeliveryDate) {
      order.expectedDeliveryDate = details.expectedDeliveryDate;
    }
    if (details?.estimatedTimeOfArrival) {
      order.estimatedTimeOfArrival = details.estimatedTimeOfArrival;
    }

    // Restore stock if order was cancelled or rejected and was previously active
    if ((newStatus === 'cancelled' || newStatus === 'rejected') && previousStatus !== 'cancelled' && previousStatus !== 'rejected') {
      const product = this.getProductById(order.productId);
      if (product && product.stock !== undefined && product.stock !== null) {
        const restoredStock = product.stock + (order.quantity || 1);
        const restoredStatus = restoredStock > 3 ? 'published' : (restoredStock > 0 ? 'low_stock' : product.status);
        this.updateProduct(product.id, { stock: restoredStock, status: restoredStatus });
      }
    }

    let defaultNote = `Order status updated to ${newStatus}`;
    let notificationTitle = 'Order Update';
    let notificationMsg = `Your order ${order.orderNumber} status is now ${newStatus}.`;

    if (newStatus === 'accepted') {
      const etaMsg = order.expectedDeliveryDate ? ` Expected delivery: ${order.expectedDeliveryDate}.` : '';
      defaultNote = `Order accepted by artisan ${order.artisanName}.${etaMsg} Preparing raw craft materials.`;
      notificationTitle = 'Order Accepted by Artisan';
      notificationMsg = `Artisan ${order.artisanName} accepted your order ${order.orderNumber}!${etaMsg} Crafting will begin soon.`;
    } else if (newStatus === 'rejected') {
      order.rejectionReason = details?.rejectionReason || 'Artisan is currently at full capacity or out of raw materials.';
      defaultNote = `Order declined by artisan. Reason: ${order.rejectionReason}`;
      notificationTitle = 'Order Declined by Artisan';
      notificationMsg = `Order ${order.orderNumber} could not be fulfilled: ${order.rejectionReason}.`;
    } else if (newStatus === 'preparing') {
      defaultNote = details?.note || `Artisan ${order.artisanName} has started crafting your item.`;
      notificationTitle = 'Artisan is Handcrafting Your Order';
      notificationMsg = `Your craft is being handmade with authentic techniques by artisan ${order.artisanName}.`;
    } else if (newStatus === 'shipped') {
      if (details?.trackingPartner) order.trackingPartner = details.trackingPartner;
      if (details?.trackingNumber) order.trackingNumber = details.trackingNumber;
      if (!details?.estimatedTimeOfArrival) order.estimatedTimeOfArrival = '2 - 4 business days';
      defaultNote = details?.note || `Package dispatched via ${order.trackingPartner || 'courier'}. Tracking: ${order.trackingNumber || 'Available shortly'}`;
      notificationTitle = 'Order Shipped!';
      notificationMsg = `Order ${order.orderNumber} has been handed over to ${order.trackingPartner || 'courier'}. Tracking ID: ${order.trackingNumber || 'Pending'}.`;
    } else if (newStatus === 'out_for_delivery') {
      order.estimatedTimeOfArrival = 'Today by 7:00 PM';
      defaultNote = details?.note || 'Courier executive is out for delivery in your neighborhood.';
      notificationTitle = 'Out for Delivery';
      notificationMsg = `Order ${order.orderNumber} is out for delivery! Please keep someone available at your address.`;
    } else if (newStatus === 'delivered') {
      order.estimatedTimeOfArrival = 'Delivered';
      defaultNote = details?.note || 'Order successfully delivered to customer.';
      notificationTitle = 'Order Delivered!';
      notificationMsg = `Order ${order.orderNumber} has been delivered! Thank you for supporting authentic Indian rural artisans.`;
    } else if (newStatus === 'cancelled') {
      defaultNote = details?.note || 'Order cancelled by buyer.';
      notificationTitle = 'Order Cancelled';
      notificationMsg = `Order ${order.orderNumber} was cancelled.`;
    }

    order.statusHistory.push({
      status: newStatus,
      timestamp: nowIso,
      note: details?.note || defaultNote,
      updatedBy
    });

    // Notify Buyer
    if (!this.store.orderNotifications) this.store.orderNotifications = [];
    this.store.orderNotifications.unshift({
      id: `notif_${Date.now()}`,
      orderId: order.id,
      orderNumber: order.orderNumber,
      recipientUserId: order.buyerId,
      recipientMobile: order.buyerMobile,
      title: notificationTitle,
      message: notificationMsg,
      status: newStatus,
      read: false,
      createdAt: nowIso
    });

    this.save();
    return order;
  }

  getOrderNotifications(params: { userId?: string; mobile?: string }): OrderNotification[] {
    const list = this.store.orderNotifications || [];
    const { userId, mobile } = params;

    const cleanMobile = (mobile || '').trim().replace(/\D/g, '');
    const last10 = cleanMobile.length >= 10 ? cleanMobile.slice(-10) : cleanMobile;

    return list.filter(n => {
      if (userId && n.recipientUserId === userId) return true;
      if (last10 && n.recipientMobile) {
        const nmDigits = n.recipientMobile.replace(/\D/g, '');
        if (nmDigits.slice(-10) === last10) return true;
      }
      if (!userId && !mobile) return true;
      return false;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  markOrderNotificationAsRead(id: string): boolean {
    const notif = (this.store.orderNotifications || []).find(n => n.id === id);
    if (notif) {
      notif.read = true;
      this.save();
      return true;
    }
    return false;
  }
}

export const db = new Database();
