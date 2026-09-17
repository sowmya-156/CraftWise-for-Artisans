export interface TranslationSchema {
  // Navigation & Branding
  nav_brand: string;
  nav_slogan: string;
  nav_home: string;
  nav_dashboard: string;
  nav_create_catalog: string;
  nav_my_products: string;
  nav_inventory: string;
  nav_market_linkage: string;
  nav_about: string;
  nav_profile: string;
  nav_sign_in: string;
  nav_register: string;
  nav_sign_out: string;
  nav_verified_artisan: string;
  nav_choose_language: string;

  // Common UI
  common_save: string;
  common_cancel: string;
  common_back: string;
  common_next: string;
  common_submit: string;
  common_edit: string;
  common_delete: string;
  common_view: string;
  common_share: string;
  common_copy: string;
  common_copied: string;
  common_loading: string;
  common_stock: string;
  common_price: string;
  common_status: string;
  common_published: string;
  common_draft: string;
  common_in_review: string;
  common_actions: string;
  common_filter: string;
  common_search: string;

  // Dashboard Page
  dash_welcome: string;
  dash_sub: string;
  dash_add_new: string;
  dash_stat_products: string;
  dash_stat_active: string;
  dash_stat_enquiries: string;
  dash_stat_sales: string;
  dash_recent_creations: string;
  dash_view_all: string;
  dash_no_products: string;
  dash_direct_link: string;
  dash_whatsapp_share: string;
  dash_pending_review: string;

  // Wizard & Voice
  wiz_step1_photo: string;
  wiz_step2_voice: string;
  wiz_step3_ai: string;
  wiz_step4_review: string;
  wiz_take_photo: string;
  wiz_voice_instructions: string;
  wiz_voice_prompt_hint: string;
  wiz_recording: string;
  wiz_tap_to_speak: string;
  wiz_stop_speak: string;
  wiz_speak_in: string;
  wiz_detected_language: string;
  wiz_generate_btn: string;
  wiz_generating: string;
  wiz_ai_thinking: string;

  // Selling Kit & Review
  rev_title: string;
  rev_subtitle: string;
  rev_image_compare: string;
  rev_pricing_title: string;
  rev_pricing_sub: string;
  rev_multilingual_title: string;
  rev_multilingual_sub: string;
  rev_approve_btn: string;
  rev_save_draft_btn: string;
  rev_card_preview: string;
  rev_fair_pricing_guide: string;

  // Inventory & Products
  inv_title: string;
  inv_sub: string;
  inv_in_stock: string;
  inv_out_of_stock: string;
  inv_update_stock: string;
  prod_my_catalog: string;
  prod_sub: string;

  // Market Linkage
  market_title: string;
  market_sub: string;
  market_ondc: string;
  market_gem: string;
  market_tribes: string;
  market_exhibitions: string;

  // Profile & Settings
  prof_title: string;
  prof_sub: string;
  prof_fullname: string;
  prof_craft: string;
  prof_state: string;
  prof_district: string;
  prof_language: string;
  prof_save_btn: string;

  // Footer
  footer_tagline: string;
  footer_heritage: string;
  footer_rights: string;
}

export const translations: Record<string, TranslationSchema> = {
  // 1. TELUGU (తెలుగు)
  te: {
    nav_brand: "క్రాఫ్ట్‌వైజ్ (CraftWise)",
    nav_slogan: "ఒక ఫోటో. ఒక స్వరం. మార్కెట్ రెడీ.",
    nav_home: "హోమ్",
    nav_dashboard: "డ్యాష్‌బోర్డ్",
    nav_create_catalog: "కేటలాగ్ సృష్టించండి",
    nav_my_products: "నా ఉత్పత్తులు",
    nav_inventory: "స్టాక్ & నిల్వ",
    nav_market_linkage: "మార్కెట్ లింకేజీలు",
    nav_about: "ఈ కార్యక్రమం గురించి",
    nav_profile: "కళాకారుడి ప్రొఫైల్",
    nav_sign_in: "లాగిన్",
    nav_register: "రిజిస్ట్రేషన్",
    nav_sign_out: "లాగౌట్",
    nav_verified_artisan: "ధృవీకరించబడిన కళాకారుడు",
    nav_choose_language: "భాషను ఎంచుకోండి",

    common_save: "సేవ్ చేయండి",
    common_cancel: "రద్దు చేయండి",
    common_back: "వెనుకకు",
    common_next: "తదుపరి",
    common_submit: "సమర్పించండి",
    common_edit: "సవరించండి",
    common_delete: "తొలగించండి",
    common_view: "చూడండి",
    common_share: "భాగస్వామ్యం చేయండి",
    common_copy: "లింక్ కాపీ చేయండి",
    common_copied: "కాపీ చేయబడింది!",
    common_loading: "లోడ్ అవుతోంది...",
    common_stock: "స్టాక్ నిల్వ",
    common_price: "ధర",
    common_status: "స్థితి",
    common_published: "ప్రచురించబడింది",
    common_draft: "డ్రాఫ్ట్",
    common_in_review: "సమీక్షలో ఉంది",
    common_actions: "చర్యలు",
    common_filter: "ఫిల్టర్",
    common_search: "వెతకండి",

    dash_welcome: "స్వాగతం",
    dash_sub: "భారతీయ కళాకారుల డిజిటల్ అమ్మకాల వేదిక",
    dash_add_new: "కొత్త కేటలాగ్ జోడించండి (స్వరం / ఫోటో)",
    dash_stat_products: "మొత్తం ఉత్పత్తులు",
    dash_stat_active: "ప్రచురించినవి",
    dash_stat_enquiries: "కొనుగోలుదారుల విచారణలు",
    dash_stat_sales: "అంచనా విక్రయాలు",
    dash_recent_creations: "ఇటీవలి చేతివృత్తుల సృష్టి",
    dash_view_all: "అన్నీ చూడండి",
    dash_no_products: "ఇంకా ఉత్పత్తులు జోడించబడలేదు. 'కేటలాగ్ సృష్టించండి' నొక్కండి!",
    dash_direct_link: "ప్రత్యక్ష విక్రయ లింక్",
    dash_whatsapp_share: "వాట్సాప్‌లో పంపండి",
    dash_pending_review: "సమీక్ష కోసం వేచి ఉంది",

    wiz_step1_photo: "1. చేతిపని ఫోటో",
    wiz_step2_voice: "2. మీ గొంతుతో కథ",
    wiz_step3_ai: "3. AI ప్రాసెసింగ్",
    wiz_step4_review: "4. సమీక్ష & ప్రచురణ",
    wiz_take_photo: "వస్తువు ఫోటో అప్‌లోడ్ చేయండి",
    wiz_voice_instructions: "మీ మాతృభాషలో చేతిపని విధానం మరియు పదార్థాల గురించి మాట్లాడండి.",
    wiz_voice_prompt_hint: "ఉదాహరణ: 'ఇది కొండ వెదురుతో చేసిన చేతి బుట్ట. 3 గంటలు పట్టింది.'",
    wiz_recording: "వింటోంది... మాట్లాడండి",
    wiz_tap_to_speak: "మాట్లాడటానికి నొక్కండి",
    wiz_stop_speak: "రికార్డింగ్ ఆపండి",
    wiz_speak_in: "మాట్లాడే భాష",
    wiz_detected_language: "గుర్తించిన భాష",
    wiz_generate_btn: "డిజిటల్ కేటలాగ్ సిద్ధం చేయండి",
    wiz_generating: "AI విశ్లేషిస్తోంది...",
    wiz_ai_thinking: "స్టూడియో లైటింగ్ మెరుగుపరచడం & బహుభాషా వివరణ తయారవుతోంది...",

    rev_title: "డిజిటల్ సెల్లింగ్ కిట్ సమీక్ష",
    rev_subtitle: "మీరు ఆమోదించే వరకు ఏ వివరాలు కూడా ప్రత్యక్షంగా ప్రచురించబడవు.",
    rev_image_compare: "ఫోటో మెరుగుదల (అసలు vs స్టూడియో నాణ్యత)",
    rev_pricing_title: "AI న్యాయమైన ధర సిఫార్సు",
    rev_pricing_sub: "కష్టపడిన శ్రమకు తగిన న్యాయమైన ప్రతిఫలం లభించేలా రూపొందించబడింది.",
    rev_multilingual_title: "9 భారతీయ భాషలలో వివరణలు",
    rev_multilingual_sub: "తెలుగు, హిందీ, ఇంగ్లీష్, తమిళం, కన్నడ, మలయాళం, మరాఠీ, బెంగాలీ, ఒడియా.",
    rev_approve_btn: "ఆమోదించి ప్రచురించండి",
    rev_save_draft_btn: "డ్రాఫ్ట్‌గా భద్రపరచండి",
    rev_card_preview: "డిజిటల్ ప్రొడక్ట్ కార్డ్",
    rev_fair_pricing_guide: "పారదర్శక ధర విశ్లేషణ",

    inv_title: "స్టాక్ & ఇన్వెంటరీ నిర్వహణ",
    inv_sub: "మీ వద్ద మిగిలివున్న చేతివృత్తుల సంఖ్యను వెంటనే నవీకరించండి.",
    inv_in_stock: "స్టాక్ అందుబాటులో ఉంది",
    inv_out_of_stock: "స్టాక్ ముగిసింది",
    inv_update_stock: "స్టాక్ మార్చండి",
    prod_my_catalog: "నా చేతివృత్తుల కేటలాగ్",
    prod_sub: "మీ స్వహస్తాలతో తయారుచేసిన కళాఖండాల వివరాలు.",

    market_title: "మార్కెట్ లింకేజీలు & సంస్థాగత విక్రయాలు",
    market_sub: "GeM, ONDC, ట్రైబ్స్ ఇండియా మరియు అంతర్జాతీయ ప్రదర్శనలతో ప్రత్యక్ష సంబంధాలు.",
    market_ondc: "ONDC నెట్‌వర్క్",
    market_gem: "ప్రభుత్వ e-మార్కెట్‌ప్లేస్ (GeM)",
    market_tribes: "ట్రైబ్స్ ఇండియా (TRIFED)",
    market_exhibitions: "హస్తకళల ఎగ్జిబిషన్లు & కొనుగోలుదారులు",

    prof_title: "కళాకారుడి ప్రొఫైల్ & వారసత్వం",
    prof_sub: "ప్రామాణిక గుర్తింపు మరియు బ్యాంక్ సమాచారం.",
    prof_fullname: "పూర్తి పేరు",
    prof_craft: "ప్రధాన చేతివృత్తి",
    prof_state: "రాష్ట్రం",
    prof_district: "జిల్లా",
    prof_language: "ఇష్టపడే భాష",
    prof_save_btn: "ప్రొఫైల్ సేవ్ చేయండి",

    footer_tagline: "ఒక ఫోటో. ఒక స్వరం. మార్కెట్ రెడీ.",
    footer_heritage: "సాంస్కృతిక వారసత్వ డిజిటలైజేషన్ చొరవ",
    footer_rights: "సర్వహక్కులు ప్రత్యేకించబడ్డాయి. భారతీయ కళాకారుల ఆర్థిక స్వావలంబన కోసం."
  },

  // 2. HINDI (हिन्दी)
  hi: {
    nav_brand: "क्राफ्टवाइज (CraftWise)",
    nav_slogan: "एक फोटो। एक आवाज़। बाज़ार तैयार।",
    nav_home: "होम",
    nav_dashboard: "डैशबोर्ड",
    nav_create_catalog: "कैटलॉग बनाएं",
    nav_my_products: "मेरे उत्पाद",
    nav_inventory: "स्टॉक और इन्वेंटरी",
    nav_market_linkage: "बाज़ार संपर्क",
    nav_about: "पहल के बारे में",
    nav_profile: "कारीगर प्रोफ़ाइल",
    nav_sign_in: "साइन इन",
    nav_register: "पंजीकरण करें",
    nav_sign_out: "लॉग आउट",
    nav_verified_artisan: "सत्यापित कारीगर",
    nav_choose_language: "भाषा चुनें",

    common_save: "सुरक्षित करें",
    common_cancel: "रद्द करें",
    common_back: "वापस",
    common_next: "आगे बढ़ें",
    common_submit: "जमा करें",
    common_edit: "संपादित करें",
    common_delete: "हटाएं",
    common_view: "देखें",
    common_share: "साझा करें",
    common_copy: "लिंक कॉपी करें",
    common_copied: "कॉपी हो गया!",
    common_loading: "लोड हो रहा है...",
    common_stock: "स्टॉक",
    common_price: "मूल्य",
    common_status: "स्थिति",
    common_published: "प्रकाशित",
    common_draft: "ड्राफ्ट",
    common_in_review: "समीक्षाधीन",
    common_actions: "कार्रवाई",
    common_filter: "फ़िल्टर",
    common_search: "खोजें",

    dash_welcome: "स्वागत है",
    dash_sub: "भारतीय कारीगर सशक्तिकरण और सीधा डिजिटल बाज़ार",
    dash_add_new: "नया उत्पाद जोड़ें (ध्वनि / फोटो)",
    dash_stat_products: "कुल उत्पाद",
    dash_stat_active: "सक्रिय उत्पाद",
    dash_stat_enquiries: "खरीदारों की पूछताछ",
    dash_stat_sales: "अनुमानित बिक्री",
    dash_recent_creations: "हाल ही में हस्तनिर्मित कृतियाँ",
    dash_view_all: "सभी देखें",
    dash_no_products: "अभी तक कोई उत्पाद नहीं जोड़ा गया है। शुरू करने के लिए 'कैटलॉग बनाएं' पर टैप करें!",
    dash_direct_link: "सीधा खरीदार लिंक",
    dash_whatsapp_share: "व्हाट्सएप पर साझा करें",
    dash_pending_review: "समीक्षा के लिए प्रतीक्षारत",

    wiz_step1_photo: "1. शिल्प का फोटो",
    wiz_step2_voice: "2. अपनी आवाज़ में कहानी",
    wiz_step3_ai: "3. एआई विश्लेषण",
    wiz_step4_review: "4. समीक्षा व प्रकाशन",
    wiz_take_photo: "हस्तशिल्प की तस्वीर अपलोड करें",
    wiz_voice_instructions: "अपनी मातृभाषा में शिल्प बनाने की तकनीक और सामग्री के बारे में बताएं।",
    wiz_voice_prompt_hint: "उदाहरण: 'यह पहाड़ी बांस से बनी टोकरी है। इसे बुनने में 3 घंटे लगे हैं।'",
    wiz_recording: "सुन रहा है... बोलिए",
    wiz_tap_to_speak: "बोलने के लिए टैप करें",
    wiz_stop_speak: "रिकॉर्डिंग रोकें",
    wiz_speak_in: "बोलने की भाषा",
    wiz_detected_language: "पहचानी गई भाषा",
    wiz_generate_btn: "डिजिटल कैटलॉग तैयार करें",
    wiz_generating: "एआई विश्लेषण कर रहा है...",
    wiz_ai_thinking: "स्टूडियो लाइटिंग संवर्धन और बहुभाषी अनुवाद तैयार हो रहे हैं...",

    rev_title: "डिजिटल सेलिंग किट समीक्षा",
    rev_subtitle: "आपके अनुमोदन के बिना कोई भी विवरण सार्वजनिक नहीं किया जाएगा।",
    rev_image_compare: "फोटो सुधार (मूल बनाम स्टूडियो गुणवत्ता)",
    rev_pricing_title: "एआई उचित मूल्य अनुशंसा",
    rev_pricing_sub: "श्रम और सामग्री की लागत का पारदर्शी विश्लेषण।",
    rev_multilingual_title: "9 भारतीय भाषाओं में अनुवाद",
    rev_multilingual_sub: "तेलुगु, हिन्दी, अंग्रेजी, तमिल, कन्नड़, मलयालम, मराठी, बंगाली और ओडिया।",
    rev_approve_btn: "स्वीकृत करें और प्रकाशित करें",
    rev_save_draft_btn: "ड्राफ्ट सहेजें",
    rev_card_preview: "डिजिटल उत्पाद कार्ड",
    rev_fair_pricing_guide: "पारदर्शी मूल्य निर्धारण",

    inv_title: "स्टॉक एवं इन्वेंटरी प्रबंधन",
    inv_sub: "अपने उपलब्ध उत्पादों की संख्या तुरंत अपडेट करें।",
    inv_in_stock: "स्टॉक में उपलब्ध",
    inv_out_of_stock: "स्टॉक समाप्त",
    inv_update_stock: "स्टॉक बदलें",
    prod_my_catalog: "मेरी हस्तकला सूची",
    prod_sub: "आपके द्वारा तैयार किए गए प्रामाणिक हस्तशिल्प उत्पाद।",

    market_title: "बाज़ार संपर्क एवं संस्थागत बिक्री",
    market_sub: "GeM, ONDC, ट्राइब्स इंडिया और राष्ट्रीय प्रदर्शनियों से सीधा जुड़ाव।",
    market_ondc: "ONDC नेटवर्क",
    market_gem: "गवर्नमेंट ई-मार्केटप्लेस (GeM)",
    market_tribes: "ट्राइब्स इंडिया (TRIFED)",
    market_exhibitions: "हस्तशिल्प मेले और खरीदार",

    prof_title: "कारीगर प्रोफ़ाइल एवं विरासत",
    prof_sub: "सत्यापित पहचान और क्लस्टर जानकारी।",
    prof_fullname: "पूरा नाम",
    prof_craft: "मुख्य शिल्प श्रेणी",
    prof_state: "राज्य",
    prof_district: "ज़िला",
    prof_language: "पसंदीदा भाषा",
    prof_save_btn: "प्रोफ़ाइल सुरक्षित करें",

    footer_tagline: "एक फोटो। एक आवाज़। बाज़ार तैयार।",
    footer_heritage: "सांस्कृतिक विरासत डिजिटलीकरण पहल",
    footer_rights: "सर्वाधिकार सुरक्षित। भारतीय कारीगरों के आत्मनिर्भर भविष्य के लिए।"
  },

  // 3. ENGLISH
  en: {
    nav_brand: "CraftWise",
    nav_slogan: "One Photo. One Voice. Market Ready.",
    nav_home: "Home",
    nav_dashboard: "Dashboard",
    nav_create_catalog: "Create Catalog",
    nav_my_products: "My Products",
    nav_inventory: "Stock & Inventory",
    nav_market_linkage: "Market Linkage",
    nav_about: "About Initiative",
    nav_profile: "Artisan Profile",
    nav_sign_in: "Sign In",
    nav_register: "Register",
    nav_sign_out: "Sign Out",
    nav_verified_artisan: "Verified Artisan",
    nav_choose_language: "Choose Language",

    common_save: "Save",
    common_cancel: "Cancel",
    common_back: "Back",
    common_next: "Next",
    common_submit: "Submit",
    common_edit: "Edit",
    common_delete: "Delete",
    common_view: "View",
    common_share: "Share",
    common_copy: "Copy Link",
    common_copied: "Copied!",
    common_loading: "Loading...",
    common_stock: "Stock",
    common_price: "Price",
    common_status: "Status",
    common_published: "Published",
    common_draft: "Draft",
    common_in_review: "In Review",
    common_actions: "Actions",
    common_filter: "Filter",
    common_search: "Search",

    dash_welcome: "Welcome back",
    dash_sub: "Indian Artisan Empowerment & Direct Digital Commerce Dashboard",
    dash_add_new: "Add New Product (Voice/Photo)",
    dash_stat_products: "Total Products",
    dash_stat_active: "Active Online",
    dash_stat_enquiries: "Buyer Enquiries",
    dash_stat_sales: "Estimated Sales",
    dash_recent_creations: "Recent Handcrafted Creations",
    dash_view_all: "View All",
    dash_no_products: "No products added yet. Tap 'Create Catalog' to start!",
    dash_direct_link: "Direct Buyer Link",
    dash_whatsapp_share: "Share on WhatsApp",
    dash_pending_review: "Awaiting Review",

    wiz_step1_photo: "1. Craft Photo",
    wiz_step2_voice: "2. Voice Story",
    wiz_step3_ai: "3. AI Processing",
    wiz_step4_review: "4. Review & Publish",
    wiz_take_photo: "Upload Craft Photograph",
    wiz_voice_instructions: "Speak about your crafting technique, materials, and time spent in your mother tongue.",
    wiz_voice_prompt_hint: "Example: 'This is a handwoven hill bamboo basket. It took 3 hours to weave.'",
    wiz_recording: "Listening... Speak naturally",
    wiz_tap_to_speak: "Tap to Speak",
    wiz_stop_speak: "Stop Recording",
    wiz_speak_in: "Speaking in",
    wiz_detected_language: "Detected Language",
    wiz_generate_btn: "Generate Smart Digital Catalog",
    wiz_generating: "AI Processing...",
    wiz_ai_thinking: "Studio lighting enhancement & 9-language translation in progress...",

    rev_title: "Digital Selling Kit Review",
    rev_subtitle: "Artisan control first: Nothing is published without your explicit approval.",
    rev_image_compare: "Photo Enhancement (Original vs Studio Quality)",
    rev_pricing_title: "AI Fair Price Recommendation",
    rev_pricing_sub: "Transparent calculation protecting artisans against distress sales.",
    rev_multilingual_title: "Multilingual Content (9 Regional Languages)",
    rev_multilingual_sub: "Automatic translation in Telugu, Hindi, English, Tamil, Kannada, Malayalam, Marathi, Bengali, Odia.",
    rev_approve_btn: "Approve & Publish to Direct Web",
    rev_save_draft_btn: "Save as Draft",
    rev_card_preview: "Digital Product Card",
    rev_fair_pricing_guide: "Transparent Cost Breakdown",

    inv_title: "Stock & Inventory Management",
    inv_sub: "Quickly update available quantities of your handcrafted items.",
    inv_in_stock: "In Stock",
    inv_out_of_stock: "Out of Stock",
    inv_update_stock: "Adjust Stock",
    prod_my_catalog: "My Handcrafted Catalog",
    prod_sub: "Authentic handmade products crafted by your hands.",

    market_title: "Market Linkages & Institutional Buyers",
    market_sub: "Direct access to GeM, ONDC, Tribes India, and international craft exhibitions.",
    market_ondc: "ONDC Open Commerce",
    market_gem: "Government e-Marketplace (GeM)",
    market_tribes: "Tribes India (TRIFED)",
    market_exhibitions: "Craft Fairs & Institutional Buyers",

    prof_title: "Artisan Profile & Heritage",
    prof_sub: "Verified artisan credentials and craft cluster details.",
    prof_fullname: "Full Name",
    prof_craft: "Primary Craft Category",
    prof_state: "State",
    prof_district: "District",
    prof_language: "Preferred Language",
    prof_save_btn: "Save Profile",

    footer_tagline: "One Photo. One Voice. Market Ready.",
    footer_heritage: "Cultural Heritage Digitization Initiative",
    footer_rights: "All rights reserved. Dedicated to empowering Indian artisans."
  },

  // 4. TAMIL (தமிழ்)
  ta: {
    nav_brand: "கிராஃப்ட்வைஸ் (CraftWise)",
    nav_slogan: "ஒரு படம். ஒரு குரல். சந்தை தயார்.",
    nav_home: "முகப்பு",
    nav_dashboard: "டாஷ்போர்டு",
    nav_create_catalog: "பட்டியலை உருவாக்கு",
    nav_my_products: "எனது தயாரிப்புகள்",
    nav_inventory: "இருப்பு விவரம்",
    nav_market_linkage: "சந்தை தொடர்புகள்",
    nav_about: "திட்டம் பற்றி",
    nav_profile: "கைவினைஞர் விவரம்",
    nav_sign_in: "உள்நுழை",
    nav_register: "பதிவு செய்க",
    nav_sign_out: "வெளியேறு",
    nav_verified_artisan: "சரிபார்க்கப்பட்ட கைவினைஞர்",
    nav_choose_language: "மொழியைத் தேர்ந்தெடுக்கவும்",

    common_save: "சேமிக்கவும்",
    common_cancel: "ரத்து செய்",
    common_back: "பின்னால்",
    common_next: "அடுத்து",
    common_submit: "சமர்ப்பிக்கவும்",
    common_edit: "திருத்தவும்",
    common_delete: "நீக்கவும்",
    common_view: "பார்க்கவும்",
    common_share: "பகிரவும்",
    common_copy: "இணைப்பை நகலெடு",
    common_copied: "நகலெடுக்கப்பட்டது!",
    common_loading: "ஏற்றுகிறது...",
    common_stock: "இருப்பு",
    common_price: "விலை",
    common_status: "நிலை",
    common_published: "வெளியிடப்பட்டது",
    common_draft: "வரைவு",
    common_in_review: "மதிப்பாய்வில்",
    common_actions: "செயல்கள்",
    common_filter: "வடிகட்டி",
    common_search: "தேடவும்",

    dash_welcome: "நல்வரவு",
    dash_sub: "இந்திய கைவினைஞர்கள் டிஜிட்டல் விற்பனை தளம்",
    dash_add_new: "புதிய தயாரிப்பு சேர்க்கவும் (குரல் / புகைப்படம்)",
    dash_stat_products: "மொத்த தயாரிப்புகள்",
    dash_stat_active: "செயலில் உள்ளவை",
    dash_stat_enquiries: "வாங்குவோர் விசாரணைகள்",
    dash_stat_sales: "மதிப்பிடப்பட்ட விற்பனை",
    dash_recent_creations: "சமீபத்திய கைவினைப் பொருட்கள்",
    dash_view_all: "அனைத்தையும் காண்க",
    dash_no_products: "இன்னும் தயாரிப்புகள் சேர்க்கப்படவில்லை. தொடங்க 'பட்டியலை உருவாக்கு' என்பதைத் தட்டவும்!",
    dash_direct_link: "நேரடி வாங்குவோர் இணைப்பு",
    dash_whatsapp_share: "வாட்ஸ்அப்பில் பகிரவும்",
    dash_pending_review: "மதிப்பாய்வுக்கு காத்திருக்கிறது",

    wiz_step1_photo: "1. கைவினைப் படம்",
    wiz_step2_voice: "2. குரல் கதை",
    wiz_step3_ai: "3. AI பகுப்பாய்வு",
    wiz_step4_review: "4. மதிப்பாய்வு மற்றும் வெளியீடு",
    wiz_take_photo: "தயாரிப்பு புகைப்படத்தைப் பதிவேற்றவும்",
    wiz_voice_instructions: "உங்கள் கைவினை நுட்பம் மற்றும் பொருட்களைப் பற்றி உங்கள் தாய்மொழியில் பேசவும்.",
    wiz_voice_prompt_hint: "உதாரணம்: 'இது மூங்கில் கொண்டு செய்யப்பட்ட கூடை. நெசவு செய்ய 3 மணி நேரம் ஆனது.'",
    wiz_recording: "கேட்கிறது... பேசவும்",
    wiz_tap_to_speak: "பேச தட்டவும்",
    wiz_stop_speak: "பதிவை நிறுத்தவும்",
    wiz_speak_in: "பேசும் மொழி",
    wiz_detected_language: "கண்டறியப்பட்ட மொழி",
    wiz_generate_btn: "டிஜிட்டல் பட்டியலை உருவாக்கவும்",
    wiz_generating: "AI உருவாக்குகிறது...",
    wiz_ai_thinking: "ஸ்டுடியோ விளக்குகள் மேம்படுத்தல் மற்றும் 9 மொழிகளில் மொழிபெயர்ப்பு தயாராகிறது...",

    rev_title: "டிஜிட்டல் விற்பனைக் கிட் மதிப்பாய்வு",
    rev_subtitle: "உங்கள் ஒப்புதல் இல்லாமல் எதுவும் வெளியிடப்படாது.",
    rev_image_compare: "புகைப்பட மேம்பாடு (அசல் vs ஸ்டுடியோ தரம்)",
    rev_pricing_title: "AI நியாயமான விலை பரிந்துரை",
    rev_pricing_sub: "கைவினைஞர்களின் உழைப்பிற்கான வெளிப்படையான கணக்கீடு.",
    rev_multilingual_title: "9 இந்திய மொழிகளில் உள்ளடக்கம்",
    rev_multilingual_sub: "தமிழ், தெலுங்கு, இந்தி, ஆங்கிலம், கன்னடம், மலையாளம், மராத்தி, பெங்காலி, ஒடியா.",
    rev_approve_btn: "ஒப்புதல் அளித்து வெளியிடவும்",
    rev_save_draft_btn: "வரைவாக சேமிக்கவும்",
    rev_card_preview: "டிஜிட்டல் தயாரிப்பு அட்டை",
    rev_fair_pricing_guide: "வெளிப்படையான செலவு விவரம்",

    inv_title: "இருப்பு & சரக்கு மேலாண்மை",
    inv_sub: "உங்களிடம் உள்ள தயாரிப்புகளின் எண்ணிக்கையை உடனடியாக புதுப்பிக்கவும்.",
    inv_in_stock: "இருப்பில் உள்ளது",
    inv_out_of_stock: "இருப்பு இல்லை",
    inv_update_stock: "இருப்பை மாற்றவும்",
    prod_my_catalog: "எனது கைவினைப் பட்டியல்",
    prod_sub: "உங்கள் கைகளால் உருவாக்கப்பட்ட உண்மையான தயாரிப்புகள்.",

    market_title: "சந்தை தொடர்புகள் & நிறுவன விற்பனை",
    market_sub: "GeM, ONDC, டிரைப்ஸ் இந்தியா மற்றும் கண்காட்சிகளுடன் நேரடி தொடர்பு.",
    market_ondc: "ONDC வர்த்தகம்",
    market_gem: "அரசு மின்-சந்தை (GeM)",
    market_tribes: "டிரைப்ஸ் இந்தியா (TRIFED)",
    market_exhibitions: "கைவினைப் பொருட்கள் கண்காட்சி",

    prof_title: "கைவினைஞர் சுயவிவரம்",
    prof_sub: "சரிபார்க்கப்பட்ட சான்றுகள் மற்றும் கைவினைத் தகவல்.",
    prof_fullname: "முழுப் பெயர்",
    prof_craft: "முதன்மை கைவினைப் பிரிவு",
    prof_state: "மாநிலம்",
    prof_district: "மாவட்டம்",
    prof_language: "விருப்பமான மொழி",
    prof_save_btn: "சுயவிவரத்தை சேமிக்கவும்",

    footer_tagline: "ஒரு படம். ஒரு குரல். சந்தை தயார்.",
    footer_heritage: "பாரம்பரிய டிஜிட்டல்மயமாக்கல் திட்டம்",
    footer_rights: "அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை."
  },

  // 5. KANNADA (ಕನ್ನಡ)
  kn: {
    nav_brand: "ಕ್ರಾಫ್ಟ್‌ವೈಸ್ (CraftWise)",
    nav_slogan: "ಒಂದು ಫೋಟೋ. ಒಂದು ಧ್ವನಿ. ಮಾರುಕಟ್ಟೆ ಸಿದ್ಧ.",
    nav_home: "ಮುಖಪುಟ",
    nav_dashboard: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
    nav_create_catalog: "ಕ್ಯಾಟಲಾಗ್ ರಚಿಸಿ",
    nav_my_products: "ನನ್ನ ಉತ್ಪನ್ನಗಳು",
    nav_inventory: "ದಾಸ್ತಾನು ವಿವರ",
    nav_market_linkage: "ಮಾರುಕಟ್ಟೆ ಸಂಪರ್ಕ",
    nav_about: "ಉಪಕ್ರಮದ ಬಗ್ಗೆ",
    nav_profile: "ಕುಶಲಕರ್ಮಿ ಪ್ರೊಫೈಲ್",
    nav_sign_in: "ಸೈನ್ ಇನ್",
    nav_register: "ನೋಂದಣಿ ಮಾಡಿ",
    nav_sign_out: "ಸೈನ್ ಔಟ್",
    nav_verified_artisan: "ಪರಿಶೀಲಿಸಿದ ಕುಶಲಕರ್ಮಿ",
    nav_choose_language: "ಭಾಷೆಯನ್ನು ಆರಿಸಿ",

    common_save: "ಉಳಿಸಿ",
    common_cancel: "ರದ್ದುಮಾಡಿ",
    common_back: "ಹಿಂದೆ",
    common_next: "ಮುಂದೆ",
    common_submit: "ಸಲ್ಲಿಸಿ",
    common_edit: "ತಿದ್ದುಪಡಿ",
    common_delete: "ಅಳಿಸಿ",
    common_view: "ವೀಕ್ಷಿಸಿ",
    common_share: "ಹಂಚಿಕೊಳ್ಳಿ",
    common_copy: "ಲಿಂಕ್ ನಕಲಿಸಿ",
    common_copied: "ನಕಲಿಸಲಾಗಿದೆ!",
    common_loading: "ಲೋಡ್ ಆಗುತ್ತಿದೆ...",
    common_stock: "ದಾಸ್ತಾನು",
    common_price: "ಬೆಲೆ",
    common_status: "ಸ್ಥಿತಿ",
    common_published: "ಪ್ರಕಟಿಸಲಾಗಿದೆ",
    common_draft: "ಕರಡು",
    common_in_review: "ಪರಿಶೀಲನೆಯಲ್ಲಿದೆ",
    common_actions: "ಕ್ರಮಗಳು",
    common_filter: "ಫಿಲ್ಟರ್",
    common_search: "ಹುಡುಕಿ",

    dash_welcome: "ಮರಳಿ ಸ್ವಾಗತ",
    dash_sub: "ಭಾರತೀಯ ಕುಶಲಕರ್ಮಿಗಳ ಡಿಜಿಟಲ್ ವ್ಯಾಪಾರ ವೇದಿಕೆ",
    dash_add_new: "ಹೊಸ ಉತ್ಪನ್ನ ಸೇರಿಸಿ (ಧ್ವನಿ / ಫೋಟೋ)",
    dash_stat_products: "ಒಟ್ಟು ಉತ್ಪನ್ನಗಳು",
    dash_stat_active: "ಸಕ್ರಿಯವಾಗಿವೆ",
    dash_stat_enquiries: "ಖರೀದಿದಾರರ ವಿಚಾರಣೆಗಳು",
    dash_stat_sales: "ಅಂದಾಜು ಮಾರಾಟ",
    dash_recent_creations: "ಇತ್ತೀಚಿನ ಕರಕುಶಲ ಕೃತಿಗಳು",
    dash_view_all: "ಎಲ್ಲವನ್ನೂ ವೀಕ್ಷಿಸಿ",
    dash_no_products: "ಇನ್ನೂ ಯಾವುದೇ ಉತ್ಪನ್ನ ಸೇರಿಸಲಾಗಿಲ್ಲ. ಪ್ರಾರಂಭಿಸಲು 'ಕ್ಯಾಟಲಾಗ್ ರಚಿಸಿ' ಒತ್ತಿರಿ!",
    dash_direct_link: "ನೇರ ಖರೀದಿದಾರ ಲಿಂಕ್",
    dash_whatsapp_share: "ವಾಟ್ಸಾಪ್‌ನಲ್ಲಿ ಹಂಚಿಕೊಳ್ಳಿ",
    dash_pending_review: "ಪರಿಶೀಲನೆಗಾಗಿ ಬಾಕಿ ಇದೆ",

    wiz_step1_photo: "1. ಕಲೆಯ ಫೋಟೋ",
    wiz_step2_voice: "2. ಧ್ವನಿಯ ಕಥೆ",
    wiz_step3_ai: "3. AI ವಿಶ್ಲೇಷಣೆ",
    wiz_step4_review: "4. ಪರಿಶೀಲನೆ ಮತ್ತು ಪ್ರಕಟಣೆ",
    wiz_take_photo: "ಉತ್ಪನ್ನದ ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ",
    wiz_voice_instructions: "ನಿಮ್ಮ ಕಲೆಯ ತಯಾರಿಕೆಯ ತಂತ್ರಜ್ಞಾನ ಮತ್ತು ಸಾಮಗ್ರಿಗಳ ಬಗ್ಗೆ ನಿಮ್ಮ ಮಾತೃಭಾಷೆಯಲ್ಲಿ ಮಾತನಾಡಿ.",
    wiz_voice_prompt_hint: "ಉದಾಹರಣೆ: 'ಇದು ನೈಸರ್ಗಿಕ ಬಿದಿರಿನಿಂದ ಮಾಡಿದ ಬುಟ್ಟಿ. ನೇಯಲು 3 ಗಂಟೆ ಬೇಕಾಯಿತು.'",
    wiz_recording: "ಕೇಳಿಸಿಕೊಳ್ಳುತ್ತಿದೆ... ಮಾತನಾಡಿ",
    wiz_tap_to_speak: "ಮಾತನಾಡಲು ಒತ್ತಿ",
    wiz_stop_speak: "ರೆಕಾರ್ಡಿಂಗ್ ನಿಲ್ಲಿಸಿ",
    wiz_speak_in: "ಮಾತನಾಡುವ ಭಾಷೆ",
    wiz_detected_language: "ಗುರುತಿಸಲಾದ ಭಾಷೆ",
    wiz_generate_btn: "ಡಿಜಿಟಲ್ ಕ್ಯಾಟಲಾಗ್ ತಯಾರಿಸಿ",
    wiz_generating: "AI ಪ್ರಕ್ರಿಯೆಗೊಳಿಸುತ್ತಿದೆ...",
    wiz_ai_thinking: "ಸ್ಟುಡಿಯೋ ಬೆಳಕಿನ ಸುಧಾರಣೆ ಮತ್ತು 9 ಭಾಷೆಗಳ ಅನುವಾದ ಸಿದ್ಧವಾಗುತ್ತಿದೆ...",

    rev_title: "ಡಿಜಿಟಲ್ ಮಾರಾಟ ಕಿಟ್ ಪರಿಶೀಲನೆ",
    rev_subtitle: "ನಿಮ್ಮ ಒಪ್ಪಿಗೆಯಿಲ್ಲದೆ ಯಾವುದೇ ವಿವರ ಪ್ರಕಟವಾಗುವುದಿಲ್ಲ.",
    rev_image_compare: "ಫೋಟೋ ಸುಧಾರಣೆ (ಮೂಲ vs ಸ್ಟುಡಿಯೋ ಗುಣಮಟ್ಟ)",
    rev_pricing_title: "AI ನ್ಯಾಯಯುತ ಬೆಲೆ ಶಿಫಾರಸು",
    rev_pricing_sub: "ಕುಶಲಕರ್ಮಿಗಳ ಶ್ರಮಕ್ಕೆ ತಕ್ಕಂತೆ ಪಾರದರ್ಶಕ ಲೆಕ್ಕಾಚಾರ.",
    rev_multilingual_title: "9 ಭಾರತೀಯ ಭಾಷೆಗಳಲ್ಲಿ ವಿವರಣೆ",
    rev_multilingual_sub: "ಕನ್ನಡ, ತೆಲುಗು, ಹಿಂದಿ, ಇಂಗ್ಲಿಷ್, ತಮಿಳು, ಮಲಯಾಳಂ, ಮರಾಠಿ, ಬೆಂಗಾಲಿ, ಒಡಿಯಾ.",
    rev_approve_btn: "ಅನುಮೋದಿಸಿ ಪ್ರಕಟಿಸಿ",
    rev_save_draft_btn: "ಕರಡಾಗಿ ಉಳಿಸಿ",
    rev_card_preview: "ಡಿಜಿಟಲ್ ಉತ್ಪನ್ನ ಕಾರ್ಡ್",
    rev_fair_pricing_guide: "ಪಾರದರ್ಶಕ ವೆಚ್ಚದ ವಿವರ",

    inv_title: "ದಾಸ್ತಾನು ಮತ್ತು ಸರಕು ನಿರ್ವಹಣೆ",
    inv_sub: "ಲಭ್ಯವಿರುವ ಉತ್ಪನ್ನಗಳ ಸಂಖ್ಯೆಯನ್ನು ತಕ್ಷಣವೇ ನವೀಕರಿಸಿ.",
    inv_in_stock: "ದಾಸ್ತಾನು ಲಭ್ಯವಿದೆ",
    inv_out_of_stock: "ದಾಸ್ತಾನು ಮುಗಿದಿದೆ",
    inv_update_stock: "ದಾಸ್ತಾನು ಬದಲಾಯಿಸಿ",
    prod_my_catalog: "ನನ್ನ ಕರಕುಶಲ ಕ್ಯಾಟಲಾಗ್",
    prod_sub: "ನಿಮ್ಮ ಕೈಗಳಿಂದ ತಯಾರಿಸಲಾದ ಅಧಿಕೃತ ಕರಕುಶಲ ವಸ್ತುಗಳು.",

    market_title: "ಮಾರುಕಟ್ಟೆ ಸಂಪರ್ಕಗಳು & ಸಾಂಸ್ಥಿಕ ಮಾರಾಟ",
    market_sub: "GeM, ONDC, ಟ್ರೈಬ್ಸ್ ಇಂಡಿಯಾ ಮತ್ತು ಪ್ರದರ್ಶನಗಳೊಂದಿಗೆ ನೇರ ಸಂಪರ್ಕ.",
    market_ondc: "ONDC ನೆಟ್‌ವರ್ಕ್",
    market_gem: "ಸರ್ಕಾರಿ ಇ-ಮಾರುಕಟ್ಟೆ (GeM)",
    market_tribes: "ಟ್ರೈಬ್ಸ್ ಇಂಡಿಯಾ (TRIFED)",
    market_exhibitions: "ಕರಕುಶಲ ಮೇಳಗಳು & ಖರೀದಿದಾರರು",

    prof_title: "ಕುಶಲಕರ್ಮಿ ಪ್ರೊಫೈಲ್",
    prof_sub: "ದೃಢೀಕರಿಸಿದ ವಿವರಗಳು ಮತ್ತು ಕ್ಲಸ್ಟರ್ ಮಾಹಿತಿ.",
    prof_fullname: "ಪೂರ್ಣ ಹೆಸರು",
    prof_craft: "ಮುಖ್ಯ ಕರಕುಶಲ ವರ್ಗ",
    prof_state: "ರಾಜ್ಯ",
    prof_district: "ಜಿಲ್ಲೆ",
    prof_language: "ಆದ್ಯತೆಯ ಭಾಷೆ",
    prof_save_btn: "ಪ್ರೊಫೈಲ್ ಉಳಿಸಿ",

    footer_tagline: "ಒಂದು ಫೋಟೋ. ಒಂದು ಧ್ವನಿ. ಮಾರುಕಟ್ಟೆ ಸಿದ್ಧ.",
    footer_heritage: "ಸಾಂಸ್ಕೃತಿಕ ಪರಂಪರೆ ಡಿಜಿಟಲೀಕರಣ ಉಪಕ್ರಮ",
    footer_rights: "ಎಲ್ಲಾ ಹಕ್ಕುಗಳನ್ನು ಕಾಯ್ದಿರಿಸಲಾಗಿದೆ."
  },

  // 6. MALAYALAM (മലയാളം)
  ml: {
    nav_brand: "ക്രാഫ്റ്റ്‌വൈസ് (CraftWise)",
    nav_slogan: "ഒരു ഫോട്ടോ. ഒരു ശബ്ദം. വിപണി സജ്ജം.",
    nav_home: "ഹോം",
    nav_dashboard: "ഡാഷ്‌ബോർഡ്",
    nav_create_catalog: "കാറ്റലോഗ് ഉണ്ടാക്കുക",
    nav_my_products: "എന്റെ ഉൽപ്പന്നങ്ങൾ",
    nav_inventory: "സ്റ്റോക്ക് & ഇൻവെന്ററി",
    nav_market_linkage: "വിപണി ബന്ധങ്ങൾ",
    nav_about: "പദ്ധതിയെക്കുറിച്ച്",
    nav_profile: "കരകൗശല വിദഗ്ധൻ",
    nav_sign_in: "സൈൻ ഇൻ",
    nav_register: "രജിസ്റ്റർ ചെയ്യുക",
    nav_sign_out: "ലോഗ് ഔട്ട്",
    nav_verified_artisan: "സ്ഥിരീകരിച്ച കരകൗശല വിദഗ്ധൻ",
    nav_choose_language: "ഭാഷ തിരഞ്ഞെടുക്കുക",

    common_save: "സൂക്ഷിക്കുക",
    common_cancel: "റദ്ദാക്കുക",
    common_back: "തിരികെ",
    common_next: "അടുത്തത്",
    common_submit: "സമർപ്പിക്കുക",
    common_edit: "തിരുത്തുക",
    common_delete: "ഇല്ലാതാക്കുക",
    common_view: "കാണുക",
    common_share: "പങ്കിടുക",
    common_copy: "ലിങ്ക് പകർത്തുക",
    common_copied: "പകർത്തി!",
    common_loading: "ലോഡുചെയ്യുന്നു...",
    common_stock: "സ്റ്റോക്ക്",
    common_price: "വില",
    common_status: "നില",
    common_published: "പ്രസിദ്ധീകരിച്ചു",
    common_draft: "ഡ്രാഫ്റ്റ്",
    common_in_review: "പരിശോധനയിൽ",
    common_actions: "നടപടികൾ",
    common_filter: "ഫിൽട്ടർ",
    common_search: "തിരയുക",

    dash_welcome: "സ്വാഗതം",
    dash_sub: "കരകൗശല വിദഗ്ദ്ധർക്കുള്ള ഡിജിറ്റൽ വിപണി പ്ലാറ്റ്‌ഫോം",
    dash_add_new: "പുതിയ ഉൽപ്പന്നം ചേർക്കുക (ശബ്ദം / ഫോട്ടോ)",
    dash_stat_products: "ആകെ ഉൽപ്പന്നങ്ങൾ",
    dash_stat_active: "സജീവമായവ",
    dash_stat_enquiries: "വാങ്ങുന്നവരുടെ അന്വേഷണങ്ങൾ",
    dash_stat_sales: "കണക്കാക്കിയ വിൽപ്പന",
    dash_recent_creations: "അടുത്തിടെ നിർമ്മിച്ച കരകൗശല വസ്തുക്കൾ",
    dash_view_all: "എല്ലാം കാണുക",
    dash_no_products: "ഉൽപ്പന്നങ്ങളൊന്നും ചേർത്തിട്ടില്ല. ആരംഭിക്കാൻ 'കാറ്റലോഗ് ഉണ്ടാക്കുക' അമർത്തുക!",
    dash_direct_link: "നേരിട്ടുള്ള ലിങ്ക്",
    dash_whatsapp_share: "വാട്ട്‌സ്ആപ്പിൽ പങ്കിടുക",
    dash_pending_review: "പരിശോധനയ്ക്കായി കാത്തിരിക്കുന്നു",

    wiz_step1_photo: "1. കരകൗശല ഫോട്ടോ",
    wiz_step2_voice: "2. ശബ്ദത്തിലൂടെയുള്ള കഥ",
    wiz_step3_ai: "3. AI വിശകലനം",
    wiz_step4_review: "4. പരിശോധനയും പ്രസിദ്ധീകരണവും",
    wiz_take_photo: "ഉൽപ്പന്ന ഫോട്ടോ അപ്‌ലോഡ് ചെയ്യുക",
    wiz_voice_instructions: "നിങ്ങളുടെ നിർമ്മാണ രീതിയെയും സാമഗ്രികളെയും കുറിച്ച് മാതൃഭാഷയിൽ സംസാരിക്കുക.",
    wiz_voice_prompt_hint: "ഉദാഹരണം: 'ഇത് മുളകൊണ്ടുണ്ടാക്കിയ കൊട്ടയാണ്. നെയ്യാൻ 3 മണിക്കൂർ എടുത്തു.'",
    wiz_recording: "ശ്രദ്ധിക്കുന്നു... സംസാരിക്കൂ",
    wiz_tap_to_speak: "സംസാരിക്കാൻ ടാപ്പ് ചെയ്യുക",
    wiz_stop_speak: "റെക്കോർഡിംഗ് നിർത്തുക",
    wiz_speak_in: "സംസാരിക്കുന്ന ഭാഷ",
    wiz_detected_language: "കണ്ടെത്തിയ ഭാഷ",
    wiz_generate_btn: "ഡിജിറ്റൽ കാറ്റലോഗ് തയ്യാറാക്കുക",
    wiz_generating: "AI പ്രോസസ്സ് ചെയ്യുന്നു...",
    wiz_ai_thinking: "സ്റ്റുഡിയോ ലൈറ്റിംഗും 9 ഭാഷകളിലേക്കുള്ള വിവർത്തനവും തയ്യാറാകുന്നു...",

    rev_title: "ഡിജിറ്റൽ സെല്ലിംഗ് കിറ്റ് അവലോകനം",
    rev_subtitle: "നിങ്ങളുടെ അനുമതിയില്ലാതെ വിവരങ്ങൾ പരസ്യപ്പെടുത്തുകയില്ല.",
    rev_image_compare: "ഫോട്ടോ മെച്ചപ്പെടുത്തൽ (ഒറിജിനൽ vs സ്റ്റുഡിയോ നിലവാരം)",
    rev_pricing_title: "AI ന്യായവില ശുപാർശ",
    rev_pricing_sub: "തൊഴിലാളികളുടെ അധ്വാനത്തിനുള്ള സുതാര്യമായ കണക്കുകൂട്ടൽ.",
    rev_multilingual_title: "9 പ്രാദേശിക ഭാഷകളിലെ വിവരണം",
    rev_multilingual_sub: "മലയാളം, തെലുങ്ക്, ഹിന്ദി, ഇംഗ്ലീഷ്, തമിഴ്, കന്നഡ, മറാഠി, ബംഗാളി, ഒഡിയ.",
    rev_approve_btn: "അംഗീകരിച്ച് പ്രസിദ്ധീകരിക്കുക",
    rev_save_draft_btn: "ഡ്രാഫ്റ്റായി സംരക്ഷിക്കുക",
    rev_card_preview: "ഡിജിറ്റൽ പ്രൊഡക്റ്റ് കാർഡ്",
    rev_fair_pricing_guide: "സുതാര്യമായ ചെലവ് വിവരങ്ങൾ",

    inv_title: "സ്റ്റോക്ക് മാനേജ്മെന്റ്",
    inv_sub: "ലഭ്യമായ ഉൽപ്പന്നങ്ങളുടെ എണ്ണം വേഗത്തിൽ അപ്ഡേറ്റ് ചെയ്യുക.",
    inv_in_stock: "സ്റ്റോക്കുണ്ട്",
    inv_out_of_stock: "സ്റ്റോക്ക് തീർന്നു",
    inv_update_stock: "സ്റ്റോക്ക് മാറ്റുക",
    prod_my_catalog: "എന്റെ കരകൗശല കാറ്റലോഗ്",
    prod_sub: "നിങ്ങൾ സ്വന്തം കൈകളാൽ നിർമ്മിച്ച ഉൽപ്പന്നങ്ങൾ.",

    market_title: "വിപണി ബന്ധങ്ങളും വിൽപ്പനയും",
    market_sub: "GeM, ONDC, ട്രൈബ്സ് ഇന്ത്യ എന്നിവയുമായുള്ള നേരിട്ടുള്ള ബന്ധം.",
    market_ondc: "ONDC നെറ്റ്‌വർക്ക്",
    market_gem: "ഗവൺമെന്റ് ഇ-മാർക്കറ്റ്പ്ലേസ് (GeM)",
    market_tribes: "ട്രൈബ്സ് ഇന്ത്യ (TRIFED)",
    market_exhibitions: "കരകൗശല മേളകൾ",

    prof_title: "കരകൗശല വിദഗ്ദ്ധന്റെ വിവരങ്ങൾ",
    prof_sub: "സ്ഥിരീകരിച്ച വിവരങ്ങളും ക്ലസ്റ്റർ വിശദാംശങ്ങളും.",
    prof_fullname: "പൂർണ്ണമായ പേര്",
    prof_craft: "പ്രധാന കരകൗശല വിഭാഗം",
    prof_state: "സംസ്ഥാനം",
    prof_district: "ജില്ല",
    prof_language: "തിരഞ്ഞെടുത്ത ഭാഷ",
    prof_save_btn: "പ്രൊഫൈൽ സംരക്ഷിക്കുക",

    footer_tagline: "ഒരു ഫോട്ടോ. ഒരു ശബ്ദം. വിപണി സജ്ജം.",
    footer_heritage: "പൈതൃക ഡിജിറ്റലൈസേഷൻ പദ്ധതി",
    footer_rights: "എല്ലാ അവകാശങ്ങളും നിക്ഷിപ്തം."
  },

  // 7. MARATHI (मराठी)
  mr: {
    nav_brand: "क्राफ्टवाइज (CraftWise)",
    nav_slogan: "एक फोटो. एक आवाज. बाजार सज्ज.",
    nav_home: "मुख्यपृष्ठ",
    nav_dashboard: "डॅशबोर्ड",
    nav_create_catalog: "कॅटलॉग तयार करा",
    nav_my_products: "माझी उत्पादने",
    nav_inventory: "साठा आणि व्यवस्थापन",
    nav_market_linkage: "बाजार जोडण्या",
    nav_about: "उपक्रमाबद्दल",
    nav_profile: "कारागीर प्रोफाइल",
    nav_sign_in: "साइन इन",
    nav_register: "नोंदणी करा",
    nav_sign_out: "लॉग आउट",
    nav_verified_artisan: "सत्यापित कारागीर",
    nav_choose_language: "भाषा निवडा",

    common_save: "जतन करा",
    common_cancel: "रद्द करा",
    common_back: "मागे",
    common_next: "पुढे",
    common_submit: "सादर करा",
    common_edit: "संपादित करा",
    common_delete: "हटवा",
    common_view: "पहा",
    common_share: "शेअर करा",
    common_copy: "लिंक कॉपी करा",
    common_copied: "कॉपी केले!",
    common_loading: "लोड होत आहे...",
    common_stock: "साठा",
    common_price: "किंमत",
    common_status: "स्थिती",
    common_published: "प्रकाशित",
    common_draft: "मसुदा",
    common_in_review: "पुनरावलोकनात",
    common_actions: "कृती",
    common_filter: "फिल्टर",
    common_search: "शोधा",

    dash_welcome: "पुन्हा स्वागत आहे",
    dash_sub: "भारतीय कारागीर सक्षमीकरण आणि थेट डिजिटल बाजारपेठ",
    dash_add_new: "नवीन उत्पादन जोडा (आवाज / फोटो)",
    dash_stat_products: "एकूण उत्पादने",
    dash_stat_active: "सक्रिय उत्पादने",
    dash_stat_enquiries: "ग्राहकांच्या चौकशी",
    dash_stat_sales: "अंदाजे विक्री",
    dash_recent_creations: "नुकत्याच बनवलेल्या हस्तकला",
    dash_view_all: "सर्व पहा",
    dash_no_products: "अद्याप कोणतीही उत्पादने जोडलेली नाहीत. सुरू करण्यासाठी 'कॅटलॉग तयार करा' वर टॅप करा!",
    dash_direct_link: "थेट ग्राहक लिंक",
    dash_whatsapp_share: "व्हॉट्सॲपवर शेअर करा",
    dash_pending_review: "पुनरावलोकनाची प्रतीक्षा",

    wiz_step1_photo: "१. हस्तकलेचा फोटो",
    wiz_step2_voice: "२. आवाजातील गोष्ट",
    wiz_step3_ai: "३. एआय विश्लेषण",
    wiz_step4_review: "४. पुनरावलोकन व प्रकाशन",
    wiz_take_photo: "वस्तूचा फोटो अपलोड करा",
    wiz_voice_instructions: "आपल्या मातृभाषेत हस्तकलेचे तंत्र आणि साहित्याबद्दल बोला.",
    wiz_voice_prompt_hint: "उदाहरण: 'ही बांबूपासून बनवलेली टोपली आहे. विणण्यासाठी ३ तास लागले.'",
    wiz_recording: "ऐकत आहे... बोला",
    wiz_tap_to_speak: "बोलण्यासाठी टॅप करा",
    wiz_stop_speak: "रेकॉर्डिंग थांबवा",
    wiz_speak_in: "बोलण्याची भाषा",
    wiz_detected_language: "ओळखलेली भाषा",
    wiz_generate_btn: "डिजिटल कॅटलॉग तयार करा",
    wiz_generating: "एआय प्रक्रिया सुरू आहे...",
    wiz_ai_thinking: "फोटो संवर्धन आणि ९ भाषांमध्ये अनुवाद तयार होत आहे...",

    rev_title: "डिजिटल विक्री किट पुनरावलोकन",
    rev_subtitle: "आपल्या संमतीशिवाय कोणतीही माहिती सार्वजनिक केली जाणार नाही.",
    rev_image_compare: "फोटो सुधारणा (मूळ vs स्टुडिओ गुणवत्ता)",
    rev_pricing_title: "एआय योग्य किंमत शिफारस",
    rev_pricing_sub: "कारागिरांच्या कष्टाला योग्य मोबदला मिळवून देणारे पारदर्शक विश्लेषण.",
    rev_multilingual_title: "९ भारतीय भाषांमध्ये माहिती",
    rev_multilingual_sub: "मराठी, तेलगू, हिंदी, इंग्रजी, तमिळ, कन्नड, मल्याळम, बंगाली, ओडिया.",
    rev_approve_btn: "मंजूर करा आणि प्रकाशित करा",
    rev_save_draft_btn: "मसुदा म्हणून जतन करा",
    rev_card_preview: "डिजिटल उत्पादन कार्ड",
    rev_fair_pricing_guide: "पारदर्शक खर्चाचा तपशील",

    inv_title: "साठा व्यवस्थापन",
    inv_sub: "उपलब्ध वस्तूंची संख्या त्वरित अद्ययावत करा.",
    inv_in_stock: "साठ्यात उपलब्ध",
    inv_out_of_stock: "साठा संपला",
    inv_update_stock: "साठा बदला",
    prod_my_catalog: "माझा हस्तकला कॅटलॉग",
    prod_sub: "आपल्या हातांनी तयार केलेल्या अस्सल वस्तू.",

    market_title: "बाजार जोडण्या आणि संस्थात्मक विक्री",
    market_sub: "GeM, ONDC, ट्रायब्स इंडिया आणि हस्तकला प्रदर्शनांशी थेट संपर्क.",
    market_ondc: "ONDC नेटवर्क",
    market_gem: "शासकीय ई-मार्केटप्लेस (GeM)",
    market_tribes: "ट्रायब्स इंडिया (TRIFED)",
    market_exhibitions: "हस्तकला मेळावे",

    prof_title: "कारागीर प्रोफाइल आणि वारसा",
    prof_sub: "सत्यापित माहिती आणि क्लस्टर तपशील.",
    prof_fullname: "पूर्ण नाव",
    prof_craft: "मुख्य हस्तकला प्रकार",
    prof_state: "राज्य",
    prof_district: "जिल्हा",
    prof_language: "पसंतीची भाषा",
    prof_save_btn: "प्रोफाइल जतन करा",

    footer_tagline: "एक फोटो. एक आवाज. बाजार सज्ज.",
    footer_heritage: "सांस्कृतिक वारसा डिजिटलायझेशन उपक्रम",
    footer_rights: "सर्व हक्क राखीव."
  },

  // 8. BENGALI (বাংলা)
  bn: {
    nav_brand: "ক্রাফ্টওয়াইজ (CraftWise)",
    nav_slogan: "একটি ছবি। একটি কণ্ঠ। বাজার প্রস্তুত।",
    nav_home: "হোম",
    nav_dashboard: "ড্যাশবোর্ড",
    nav_create_catalog: "ক্যাটালগ তৈরি করুন",
    nav_my_products: "আমার পণ্যসমূহ",
    nav_inventory: "মজুত ও ইনভেন্টরি",
    nav_market_linkage: "বাজার সংযোগ",
    nav_about: "উদ্যোগ সম্পর্কে",
    nav_profile: "কারিগর প্রোফাইল",
    nav_sign_in: "লগ ইন",
    nav_register: "নিবন্ধন করুন",
    nav_sign_out: "লগ আউট",
    nav_verified_artisan: "যাচাইকৃত কারিগর",
    nav_choose_language: "ভাষা নির্বাচন করুন",

    common_save: "সংরক্ষণ করুন",
    common_cancel: "বাতিল করুন",
    common_back: "পেছনে",
    common_next: "পরবর্তী",
    common_submit: "জমা দিন",
    common_edit: "সম্পাদনা করুন",
    common_delete: "মুছুন",
    common_view: "দেখুন",
    common_share: "শেয়ার করুন",
    common_copy: "লিংক কপি করুন",
    common_copied: "কপি হয়েছে!",
    common_loading: "লোড হচ্ছে...",
    common_stock: "মজুত",
    common_price: "মূল্য",
    common_status: "অবস্থা",
    common_published: "প্রকাশিত",
    common_draft: "খসড়া",
    common_in_review: "পর্যালোচনাধীন",
    common_actions: "পদক্ষেপ",
    common_filter: "ফিল্টার",
    common_search: "অনুসন্ধান",

    dash_welcome: "স্বাগতম",
    dash_sub: "ভারতীয় কারিগর ক্ষমতায়ন এবং সরাসরি ডিজিটাল মার্কেটপ্লেস",
    dash_add_new: "নতুন পণ্য যোগ করুন (কণ্ঠ / ছবি)",
    dash_stat_products: "মোট পণ্য",
    dash_stat_active: "সক্রিয় অনলাইন",
    dash_stat_enquiries: "ক্রেতাদের অনুসন্ধান",
    dash_stat_sales: "আনুমানিক বিক্রয়",
    dash_recent_creations: "সাম্প্রতিক হস্তনির্মিত কাজ",
    dash_view_all: "সব দেখুন",
    dash_no_products: "এখনও কোনও পণ্য যোগ করা হয়নি। শুরু করতে 'ক্যাটালগ তৈরি করুন' এ চাপুন!",
    dash_direct_link: "সরাসরি ক্রেতা লিংক",
    dash_whatsapp_share: "হোয়াটসঅ্যাপে শেয়ার করুন",
    dash_pending_review: "পর্যালোচনার অপেক্ষায়",

    wiz_step1_photo: "১. হস্তশিল্পের ছবি",
    wiz_step2_voice: "২. কণ্ঠের গল্প",
    wiz_step3_ai: "৩. এআই বিশ্লেষণ",
    wiz_step4_review: "৪. পর্যালোচনা ও প্রকাশ",
    wiz_take_photo: "পণ্যর ছবি আপলোড করুন",
    wiz_voice_instructions: "আপনার হস্তশিল্প তৈরির পদ্ধতি এবং উপকরণ সম্পর্কে নিজের মাতৃভাষায় বলুন।",
    wiz_voice_prompt_hint: "উদাহরণ: 'এটি বাঁশ দিয়ে তৈরি ঝুড়ি। বুনতে ৩ ঘণ্টা সময় লেগেছে।'",
    wiz_recording: "শুনছে... কথা বলুন",
    wiz_tap_to_speak: "কথা বলতে চাপ দিন",
    wiz_stop_speak: "রেকর্ডিং বন্ধ করুন",
    wiz_speak_in: "বলার ভাষা",
    wiz_detected_language: "চিহ্নিত ভাষা",
    wiz_generate_btn: "ডিজিটাল ক্যাটালগ প্রস্তুত করুন",
    wiz_generating: "এআই প্রসেস করছে...",
    wiz_ai_thinking: "ছবি সুন্দর করা এবং ৯টি ভাষায় অনুবাদ তৈরির কাজ চলছে...",

    rev_title: "ডিজিটাল সেলিং কিট পর্যালোচনা",
    rev_subtitle: "আপনার সম্মতি ছাড়া কিছুই প্রকাশিত হবে না।",
    rev_image_compare: "ছবি পরিমার্জন (মূল বনাম স্টুডিও মান)",
    rev_pricing_title: "এআই ন্যায্য মূল্য সুপারিশ",
    rev_pricing_sub: "শ্রম এবং উপাদানের ব্যয়ের স্বচ্ছ হিসাব।",
    rev_multilingual_title: "৯টি ভারতীয় ভাষায় বিবরণ",
    rev_multilingual_sub: "বাংলা, তেলুগু, হিন্দি, ইংরেজি, তামিল, কন্নড়, মালায়ালম, মারাঠি, ওড়িয়া।",
    rev_approve_btn: "অনুমোদন করুন এবং প্রকাশ করুন",
    rev_save_draft_btn: "খসড়া হিসেবে রাখুন",
    rev_card_preview: "ডিজিটাল পণ্য কার্ড",
    rev_fair_pricing_guide: "স্বচ্ছ মূল্যের হিসাব",

    inv_title: "মজুত ও ইনভেন্টরি পরিচালনা",
    inv_sub: "আপনার কাছে মজুত হস্তশিল্পের সংখ্যা অবিলম্বে আপডেট করুন।",
    inv_in_stock: "মজুত আছে",
    inv_out_of_stock: "মজুত শেষ",
    inv_update_stock: "মজুত পরিবর্তন করুন",
    prod_my_catalog: "আমার হস্তশিল্প ক্যাটালগ",
    prod_sub: "আপনার নিজের হাতে তৈরি খাঁটি শিল্পকর্ম।",

    market_title: "বাজার সংযোগ ও প্রাতিষ্ঠানিক বিক্রয়",
    market_sub: "GeM, ONDC, ট্রাইবস ইন্ডিয়া এবং প্রদর্শনীর সাথে সরাসরি যোগাযোগ।",
    market_ondc: "ONDC নেটওয়ার্ক",
    market_gem: "সরকারি ই-মার্কেটপ্লেস (GeM)",
    market_tribes: "ট্রাইবস ইন্ডিয়া (TRIFED)",
    market_exhibitions: "হস্তশিল্প মেলা ও ক্রেতা",

    prof_title: "কারিগর প্রোফাইল ও ঐতিহ্য",
    prof_sub: "যাচাইকৃত তথ্য ও কারুশিল্প সংক্রান্ত বিবরণ।",
    prof_fullname: "পূর্ণ নাম",
    prof_craft: "প্রধান কারুশিল্প বিভাগ",
    prof_state: "রাজ্য",
    prof_district: "জেলা",
    prof_language: "পছন্দের ভাষা",
    prof_save_btn: "প্রোফাইল সংরক্ষণ করুন",

    footer_tagline: "একটি ছবি। একটি কণ্ঠ। বাজার প্রস্তুত।",
    footer_heritage: "সাংস্কৃতিক ঐতিহ্য ডিজিটাইজেশন উদ্যোগ",
    footer_rights: "সর্বস্বত্ব সংরক্ষিত।"
  },

  // 9. ODIA (ଓଡ଼ିଆ)
  or: {
    nav_brand: "କ୍ରାଫ୍ଟୱାଇଜ୍ (CraftWise)",
    nav_slogan: "ଗୋଟିଏ ଫଟୋ। ଗୋଟିଏ ସ୍ୱର। ବଜାର ପ୍ରସ୍ତୁତ।",
    nav_home: "ମୂଳପୃଷ୍ଠା",
    nav_dashboard: "ଡ୍ୟାସବୋର୍ଡ",
    nav_create_catalog: "କାଟାଲଗ୍ ତିଆରି କରନ୍ତୁ",
    nav_my_products: "ମୋର ଉତ୍ପାଦ",
    nav_inventory: "ଷ୍ଟକ୍ ଓ ଇନଭେଣ୍ଟୋରୀ",
    nav_market_linkage: "ବଜାର ସଂଯୋଗ",
    nav_about: "ଏହି କାର୍ଯ୍ୟକ୍ରମ ବିଷୟରେ",
    nav_profile: "କାରିଗର ପ୍ରୋଫାଇଲ୍",
    nav_sign_in: "ଲଗ୍ ଇନ୍",
    nav_register: "ପଞ୍ଜୀକରଣ କରନ୍ତୁ",
    nav_sign_out: "ଲଗ୍ ଆଉଟ୍",
    nav_verified_artisan: "ପ୍ରମାଣିତ କାରିଗର",
    nav_choose_language: "ଭାଷା ବାଛନ୍ତୁ",

    common_save: "ସାଇତନ୍ତୁ",
    common_cancel: "ବାତିଲ୍ କରନ୍ତୁ",
    common_back: "ପଛକୁ",
    common_next: "ପରବର୍ତ୍ତୀ",
    common_submit: "ଦାଖଲ କରନ୍ତୁ",
    common_edit: "ସମ୍ପାଦନ",
    common_delete: "କାଢ଼ିଦିଅନ୍ତୁ",
    common_view: "ଦେଖନ୍ତୁ",
    common_share: "ସେୟାର୍ କରନ୍ତୁ",
    common_copy: "ଲିଙ୍କ୍ କପି କରନ୍ତୁ",
    common_copied: "କପି ହୋଇଗଲା!",
    common_loading: "ଲୋଡ୍ ହେଉଛି...",
    common_stock: "ଷ୍ଟକ୍",
    common_price: "ମୂଲ୍ୟ",
    common_status: "ସ୍ଥିତି",
    common_published: "ପ୍ରକାଶିତ",
    common_draft: "ଚିଠା",
    common_in_review: "ସମୀକ୍ଷାଧୀନ",
    common_actions: "କାର୍ଯ୍ୟ",
    common_filter: "ଫିଲ୍ଟର୍",
    common_search: "ଖୋଜନ୍ତୁ",

    dash_welcome: "ସ୍ୱାଗତ",
    dash_sub: "ଭାରତୀୟ କାରିଗର ସଶକ୍ତିକରଣ ଏବଂ ପ୍ରତ୍ୟକ୍ଷ ଡିଜିଟାଲ୍ ବଜାର",
    dash_add_new: "ନୂତନ ଉତ୍ପାଦ ଯୋଡ଼ନ୍ତୁ (ସ୍ୱର / ଫଟୋ)",
    dash_stat_products: "ମୋଟ ଉତ୍ପାଦ",
    dash_stat_active: "ସକ୍ରିୟ ଅନଲାଇନ୍",
    dash_stat_enquiries: "ଗ୍ରାହକ ଅନୁସନ୍ଧାନ",
    dash_stat_sales: "ଆନୁମାନିକ ବିକ୍ରୟ",
    dash_recent_creations: "ନିକଟରେ ତିଆରି ହୋଇଥିବା ହସ୍ତତନ୍ତ",
    dash_view_all: "ସବୁ ଦେଖନ୍ତୁ",
    dash_no_products: "ଏପର୍ଯ୍ୟନ୍ତ କୌଣସି ଉତ୍ପାଦ ଯୋଡ଼ାଯାଇ ନାହିଁ। ଆରମ୍ଭ କରିବାକୁ 'କାଟାଲଗ୍ ତିଆରି କରନ୍ତୁ' ଦବାନ୍ତୁ!",
    dash_direct_link: "ସିଧାସଳଖ ଗ୍ରାହକ ଲିଙ୍କ୍",
    dash_whatsapp_share: "ହ୍ୱାଟ୍ସଆପ୍‌ରେ ସେୟାର୍ କରନ୍ତୁ",
    dash_pending_review: "ସମୀକ୍ଷା ପାଇଁ ଅପେକ୍ଷା",

    wiz_step1_photo: "୧. ହସ୍ତଶିଳ୍ପ ଫଟୋ",
    wiz_step2_voice: "୨. ସ୍ୱରରେ କାହାଣୀ",
    wiz_step3_ai: "୩. ଏଆଇ ବିଶ୍ଳେଷଣ",
    wiz_step4_review: "୪. ସମୀକ୍ଷା ଓ ପ୍ରକାଶନ",
    wiz_take_photo: "ଉତ୍ପାଦର ଫଟୋ ଅପଲୋଡ୍ କରନ୍ତୁ",
    wiz_voice_instructions: "ଆପଣଙ୍କ ମାତୃଭାଷାରେ ହସ୍ତଶିଳ୍ପର ତିଆରି କୌଶଳ ଏବଂ ସାମଗ୍ରୀ ବିଷୟରେ କୁହନ୍ତୁ।",
    wiz_voice_prompt_hint: "ଉଦାହରଣ: 'ଏହା ବାଉଁଶରେ ତିଆରି ଟୋକେଇ। ବୁଣିବା ପାଇଁ ୩ ଘଣ୍ଟା ସମୟ ଲାଗିଥିଲା।'",
    wiz_recording: "ଶୁଣୁଛି... କୁହନ୍ତୁ",
    wiz_tap_to_speak: "କହିବାକୁ ଟ୍ୟାପ୍ କରନ୍ତୁ",
    wiz_stop_speak: "ରେକର୍ଡିଂ ବନ୍ଦ କରନ୍ତୁ",
    wiz_speak_in: "କହିବା ଭାଷା",
    wiz_detected_language: "ଚିହ୍ନଟ ଭାଷା",
    wiz_generate_btn: "ଡିଜିଟାଲ୍ କାଟାଲଗ୍ ପ୍ରସ୍ତୁତ କରନ୍ତୁ",
    wiz_generating: "ଏଆଇ ପ୍ରୋସେସ୍ କରୁଛି...",
    wiz_ai_thinking: "ଫଟୋ ସୁନ୍ଦର କରିବା ଏବଂ ୯ଟି ଭାଷାରେ ଅନୁବାଦ ପ୍ରସ୍ତୁତ ଚାଲିଛି...",

    rev_title: "ଡିଜିଟାଲ୍ ସେଲିଂ କିଟ୍ ସମୀକ୍ଷା",
    rev_subtitle: "ଆପଣଙ୍କ ଅନୁମୋଦନ ବିନା କିଛି ପ୍ରକାଶିତ ହେବ ନାହିଁ।",
    rev_image_compare: "ଫଟୋ ଉନ୍ନତିକରଣ (ମୂଳ vs ଷ୍ଟୁଡିଓ ମାନ)",
    rev_pricing_title: "ଏଆଇ ନ୍ୟାୟଯୁକ୍ତ ମୂଲ୍ୟ ପରାମର୍ଶ",
    rev_pricing_sub: "କାରିଗରଙ୍କ ପରିଶ୍ରମର ସ୍ୱଚ୍ଛ ମୂଲ୍ୟାଙ୍କନ।",
    rev_multilingual_title: "୯ଟି ଭାରତୀୟ ଭାଷାରେ ବିବରଣୀ",
    rev_multilingual_sub: "ଓଡ଼ିଆ, ତେଲୁଗୁ, ହିନ୍ଦୀ, ଇଂରାଜୀ, ତାମିଲ, କନ୍ନଡ଼, ମାଲାୟାଲମ୍, ମରାଠୀ, ବଙ୍ଗାଳୀ।",
    rev_approve_btn: "ଅନୁମୋଦନ କରନ୍ତୁ ଏବଂ ପ୍ରକାଶ କରନ୍ତୁ",
    rev_save_draft_btn: "ଚିଠା ଭାବେ ରଖନ୍ତୁ",
    rev_card_preview: "ଡିଜିଟାଲ୍ ଉତ୍ପାଦ କାର୍ଡ",
    rev_fair_pricing_guide: "ସ୍ୱଚ୍ଛ ଖର୍ଚ୍ଚ ବିବରଣୀ",

    inv_title: "ଷ୍ଟକ୍ ଓ ଇନଭେଣ୍ଟୋରୀ ପରିଚାଳନା",
    inv_sub: "ଆପଣଙ୍କ ପାଖରେ ଥିବା ଉତ୍ପାଦ ସଂଖ୍ୟା ତୁରନ୍ତ ଅପଡେଟ୍ କରନ୍ତୁ।",
    inv_in_stock: "ଷ୍ଟକ୍ ଅଛି",
    inv_out_of_stock: "ଷ୍ଟକ୍ ଶେଷ",
    inv_update_stock: "ଷ୍ଟକ୍ ବଦଳାନ୍ତୁ",
    prod_my_catalog: "ମୋର ହସ୍ତତନ୍ତ କାଟାଲଗ୍",
    prod_sub: "ଆପଣଙ୍କ ହାତରେ ତିଆରି ହୋଇଥିବା ପ୍ରାମାଣିକ ହସ୍ତଶିଳ୍ପ।",

    market_title: "ବଜାର ସଂଯୋଗ ଏବଂ ବିକ୍ରୟ",
    market_sub: "GeM, ONDC, ଟ୍ରାଇବ୍ସ ଇଣ୍ଡିଆ ସହିତ ସିଧାସଳଖ ସମ୍ପର୍କ।",
    market_ondc: "ONDC ନେଟୱାର୍କ",
    market_gem: "ସରକାରୀ ଇ-ମାର୍କେଟପ୍ଲେସ୍ (GeM)",
    market_tribes: "ଟ୍ରାଇବ୍ସ ଇଣ୍ଡିଆ (TRIFED)",
    market_exhibitions: "ହସ୍ତଶିଳ୍ପ ମେଳା ଓ ଗ୍ରାହକ",

    prof_title: "କାରିଗର ପ୍ରୋଫାଇଲ୍ ଏବଂ ଐତିହ୍ୟ",
    prof_sub: "ପ୍ରମାଣିତ ତଥ୍ୟ ଏବଂ କାରୁଶିଳ୍ପ ବିବରଣୀ।",
    prof_fullname: "ପୂରା ନାମ",
    prof_craft: "ମୁଖ୍ୟ ଶିଳ୍ପ ବର୍ଗ",
    prof_state: "ରାଜ୍ୟ",
    prof_district: "ଜିଲ୍ଲା",
    prof_language: "ପସନ୍ଦ ଭାଷା",
    prof_save_btn: "ପ୍ରୋଫାଇଲ୍ ସାଇତନ୍ତୁ",

    footer_tagline: "ଗୋଟିଏ ଫଟୋ। ଗୋଟିଏ ସ୍ୱର। ବଜାର ପ୍ରସ୍ତୁତ।",
    footer_heritage: "ସାଂସ୍କୃତିକ ଐତିହ୍ୟ ଡିଜିଟାଇଜେସନ୍ ପଦକ୍ଷେପ",
    footer_rights: "ସର୍ବସ୍ୱତ୍ୱ ସଂରକ୍ଷିତ।"
  }
};
