import { GoogleGenAI, Type } from '@google/genai';
import { db } from './db.js';
import { aiService, getGenAI, callWithRetry } from './ai.js';
import { generateMarketRecommendations } from './marketEngine.js';
import { Product, Order, ArtisanProfile } from './types.js';

export interface AssistantAction {
  type:
    | 'update_price'
    | 'update_stock'
    | 'mark_sold'
    | 'view_orders'
    | 'view_earnings'
    | 'view_catalog'
    | 'view_low_stock'
    | 'create_whatsapp'
    | null;
  requiresConfirmation: boolean;
  productId?: string | null;
  productTitle?: string | null;
  field?: 'price' | 'stock' | null;
  oldValue?: number | string | null;
  newValue?: number | string | null;
  confirmationMessage?: string | null;
  details?: Record<string, any>;
}

export interface AssistantHighlight {
  label: string;
  value: string;
  type?: 'positive' | 'warning' | 'neutral';
}

export interface AssistantResponse {
  query: string;
  responseText: string;
  language: string;
  action?: AssistantAction | null;
  highlights?: AssistantHighlight[];
  quickSuggestions?: string[];
  audioUrl?: string;
  executed?: boolean;
}

const LANGUAGE_NAMES: Record<string, string> = {
  te: 'Telugu (తెలుగు)',
  hi: 'Hindi (हिन्दी)',
  en: 'English',
  ta: 'Tamil (தமிழ்)',
  kn: 'Kannada (ಕನ್ನಡ)',
  ml: 'Malayalam (മലയാളം)',
  mr: 'Marathi (मराठी)',
  bn: 'Bengali (বাংলা)',
  or: 'Odia (ଓଡ଼ିଆ)'
};

/**
 * Gather rich ground-truth artisan business context
 */
function gatherArtisanContext(artisanId: string) {
  const products = db.getProductsByArtisanId(artisanId);
  const profile = db.getProfileByUserId(artisanId);
  const orders = db.getOrdersForUser({ userId: artisanId, role: 'artisan' });

  const validOrders = orders.filter(o => o.status !== 'cancelled' && o.status !== 'rejected');
  const pendingOrders = orders.filter(o =>
    ['placed', 'accepted', 'preparing', 'shipped', 'out_for_delivery'].includes(o.status)
  );
  const deliveredOrders = orders.filter(o => o.status === 'delivered');

  const totalEarnings = validOrders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);

  // Calculate current month's sales
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const currentMonthOrders = validOrders.filter(o => {
    if (!o.createdAt) return false;
    const od = new Date(o.createdAt);
    return od.getFullYear() === currentYear && od.getMonth() === currentMonth;
  });
  const currentMonthEarnings = currentMonthOrders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
  const currentMonthUnitsSold = currentMonthOrders.reduce((sum, o) => sum + (Number(o.quantity) || 1), 0);

  // Product performance & demand calculation
  const enquiries = db.getEnquiriesByArtisanId(artisanId);

  const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;

  const productStats = products.map(p => {
    const pOrders = validOrders.filter(o => o.productId === p.id);
    const pEnquiries = enquiries.filter(e => e.productId === p.id);
    const unitsSold = pOrders.reduce((sum, o) => sum + (Number(o.quantity) || 1), 0);
    const revenue = pOrders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);

    const thisMonthPOrders = pOrders.filter(o => {
      if (!o.createdAt) return false;
      const d = new Date(o.createdAt);
      return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
    });
    const prevMonthPOrders = pOrders.filter(o => {
      if (!o.createdAt) return false;
      const d = new Date(o.createdAt);
      return d.getFullYear() === prevYear && d.getMonth() === prevMonth;
    });

    const currentPeriodOrders = thisMonthPOrders.length;
    const previousPeriodOrders = prevMonthPOrders.length;

    let trend: 'increasing' | 'decreasing' | 'stable' | 'insufficient_data' = 'insufficient_data';
    let trendLabel = 'Not enough data yet to identify a reliable trend';

    if (pOrders.length === 0 || (currentPeriodOrders === 0 && previousPeriodOrders === 0)) {
      trend = 'insufficient_data';
      trendLabel = 'Not enough data yet to identify a reliable trend';
    } else if (currentPeriodOrders > previousPeriodOrders) {
      trend = 'increasing';
      trendLabel = `Increasing (+${currentPeriodOrders - previousPeriodOrders} orders)`;
    } else if (currentPeriodOrders < previousPeriodOrders) {
      trend = 'decreasing';
      trendLabel = `Decreasing (-${previousPeriodOrders - currentPeriodOrders} orders)`;
    } else if (currentPeriodOrders === previousPeriodOrders && currentPeriodOrders > 0) {
      trend = 'stable';
      trendLabel = 'Stable';
    }

    const isLowStock = p.stock <= 3 || p.status === 'low_stock';
    const isLowStockStrongSales = isLowStock && (unitsSold > 0 || pOrders.length > 0);

    return {
      id: p.id,
      title: p.title,
      price: p.price,
      stock: p.stock,
      category: p.craftCategory,
      status: p.status,
      unitsSold,
      revenue,
      totalOrders: pOrders.length,
      buyerInquiries: pEnquiries.length,
      currentPeriodOrders,
      previousPeriodOrders,
      trend,
      trendLabel,
      isLowStock,
      isLowStockStrongSales
    };
  });

  // Identify top seller (highest units sold, or highest revenue)
  let topSeller = productStats.length > 0 ? productStats[0] : null;
  for (const p of productStats) {
    if (topSeller && (p.unitsSold > topSeller.unitsSold || (p.unitsSold === topSeller.unitsSold && p.revenue > topSeller.revenue))) {
      topSeller = p;
    }
  }

  // Low stock products
  const lowStockProducts = productStats.filter(p => p.isLowStock);
  const lowStockStrongSales = productStats.filter(p => p.isLowStockStrongSales);
  const increasingProducts = productStats.filter(p => p.trend === 'increasing');
  const decreasingProducts = productStats.filter(p => p.trend === 'decreasing');
  const highInquiryProducts = [...productStats].filter(p => p.buyerInquiries > 0).sort((a, b) => b.buyerInquiries - a.buyerInquiries);

  // Market Linkage opportunities
  const marketMatches = generateMarketRecommendations({
    craftType: profile?.craftType || products[0]?.craftCategory || 'Handicrafts',
    category: products[0]?.craftCategory || 'Handicrafts',
    state: profile?.state || 'Andhra Pradesh',
    district: profile?.district || 'Visakhapatnam',
    price: products[0]?.price || 500
  });

  return {
    profile,
    products: productStats,
    allProductDetails: products,
    ordersCount: orders.length,
    pendingOrdersCount: pendingOrders.length,
    pendingOrders: pendingOrders.slice(0, 5).map(o => ({
      orderNumber: o.orderNumber,
      productTitle: o.productTitle,
      buyerName: o.buyerName,
      quantity: o.quantity,
      totalAmount: o.totalAmount,
      status: o.status,
      date: o.createdAt
    })),
    deliveredOrdersCount: deliveredOrders.length,
    totalEarnings,
    currentMonthEarnings,
    currentMonthUnitsSold,
    topSeller: (topSeller && (topSeller.unitsSold > 0 || topSeller.revenue > 0)) ? topSeller : productStats[0] || null,
    lowStockProducts,
    lowStockStrongSales,
    increasingProducts,
    decreasingProducts,
    highInquiryProducts,
    marketMatches: marketMatches.slice(0, 3)
  };
}

/**
 * Heuristic fallback interpreter for cases when Gemini is offline or fails
 */
function heuristicProcess(
  query: string,
  context: ReturnType<typeof gatherArtisanContext>,
  lang: string
): AssistantResponse {
  const q = query.toLowerCase();
  const isTelugu = lang === 'te';
  const isHindi = lang === 'hi';

  // 1. Price change intent
  const priceMatch = q.match(/(?:ధర|rate|price|కిమ్మత్|₹|rs\.?|రూ\.?)\s*(?:ను|to|కో)?\s*([0-9]+)/i) ||
                     q.match(/([0-9]+)\s*(?:రూపాయలు|రూ|₹|rupees|rs)/i) ||
                     q.match(/(?:change|update|పెంచు|తగ్గించు|మార్చు|బదలో).*?([0-9]+)/i);

  if (priceMatch && (q.includes('price') || q.includes('ధర') || q.includes('రేట్') || q.includes('rate') || q.includes('కీమత్') || q.includes('change') || q.includes('మార్చు') || q.includes('बदलो'))) {
    const targetPrice = parseInt(priceMatch[1], 10);
    // Find matching product or default to first
    let matchedProd = context.products[0];
    for (const p of context.products) {
      const words = p.title.toLowerCase().split(/\s+/);
      if (words.some(w => w.length > 3 && q.includes(w))) {
        matchedProd = p;
        break;
      }
    }

    if (matchedProd) {
      let confirmMsg = `Do you want to change the price of "${matchedProd.title}" from ₹${matchedProd.price} to ₹${targetPrice}?`;
      if (isTelugu) {
        confirmMsg = `మీరు "${matchedProd.title}" ధరను ₹${matchedProd.price} నుండి ₹${targetPrice} కు మార్చాలనుకుంటున్నారా?`;
      } else if (isHindi) {
        confirmMsg = `क्या आप "${matchedProd.title}" की कीमत ₹${matchedProd.price} से बदलकर ₹${targetPrice} करना चाहते हैं?`;
      }

      return {
        query,
        responseText: confirmMsg,
        language: lang,
        action: {
          type: 'update_price',
          requiresConfirmation: true,
          productId: matchedProd.id,
          productTitle: matchedProd.title,
          field: 'price',
          oldValue: matchedProd.price,
          newValue: targetPrice,
          confirmationMessage: confirmMsg
        },
        highlights: [
          { label: 'Product', value: matchedProd.title },
          { label: 'Current Price', value: `₹${matchedProd.price}` },
          { label: 'New Price', value: `₹${targetPrice}`, type: 'positive' }
        ]
      };
    }
  }

  // 2. Stock change intent
  const stockMatch = q.match(/(?:stock|స్టాక్|స్టాకు|సరుకు|స్టాక్‌ను|स्टॉक)\s*(?:ను|to|కో)?\s*([0-9]+)/i) ||
                     q.match(/(?:change|update|చేయి|బదలో|సెట్).*?(?:stock|స్టాక్).*?([0-9]+)/i);

  if (stockMatch) {
    const newStock = parseInt(stockMatch[1], 10);
    let matchedProd = context.products[0];
    for (const p of context.products) {
      const words = p.title.toLowerCase().split(/\s+/);
      if (words.some(w => w.length > 3 && q.includes(w))) {
        matchedProd = p;
        break;
      }
    }

    if (matchedProd) {
      let confirmMsg = `Do you want to update stock for "${matchedProd.title}" from ${matchedProd.stock} to ${newStock} units?`;
      if (isTelugu) {
        confirmMsg = `మీరు "${matchedProd.title}" స్టాక్‌ను ${matchedProd.stock} నుండి ${newStock} యూనిట్లకు నవీకరించాలనుకుంటున్నారా?`;
      } else if (isHindi) {
        confirmMsg = `क्या आप "${matchedProd.title}" का स्टॉक ${matchedProd.stock} से बदलकर ${newStock} करना चाहते हैं?`;
      }

      return {
        query,
        responseText: confirmMsg,
        language: lang,
        action: {
          type: 'update_stock',
          requiresConfirmation: true,
          productId: matchedProd.id,
          productTitle: matchedProd.title,
          field: 'stock',
          oldValue: matchedProd.stock,
          newValue: newStock,
          confirmationMessage: confirmMsg
        },
        highlights: [
          { label: 'Product', value: matchedProd.title },
          { label: 'Current Stock', value: `${matchedProd.stock} units` },
          { label: 'New Stock', value: `${newStock} units`, type: 'positive' }
        ]
      };
    }
  }

  // 3. Demand & Production Recommendations ("Which product should I make more?", "What to produce?")
  if (
    q.includes('make more') ||
    q.includes('produce more') ||
    q.includes('should i make') ||
    q.includes('what to make') ||
    q.includes('what should i produce') ||
    q.includes('ఏది ఎక్కువ తయారు') ||
    q.includes('ఏమి తయారు') ||
    q.includes('తయారు చేయాలి') ||
    q.includes('చేయాలి') && q.includes('తయారు') ||
    q.includes('ज्यादा बनाऊं') ||
    q.includes('क्या बनाऊं') ||
    q.includes('उत्पादन')
  ) {
    const targetProd = context.lowStockStrongSales[0] || context.topSeller || context.products[0];
    if (targetProd) {
      let text = `Based on your recent sales, "${targetProd.title}" has your strongest sales activity. You currently have ${targetProd.stock} in stock. Consider producing more.`;
      if (isTelugu) {
        text = `మీ ఇటీవలి అమ్మకాల ఆధారంగా, "${targetProd.title}" ఉత్పత్తికి మంచి అమ్మకాల ఆదరణ ఉంది. ప్రస్తుతం మీ వద్ద ${targetProd.stock} యూనిట్ల స్టాక్ మాత్రమే ఉంది. మరిన్ని తయారు చేసుకోవడం మంచిది.`;
      } else if (isHindi) {
        text = `आपकी हाल की बिक्री के आधार पर, "${targetProd.title}" में सबसे अच्छी बिक्री गतिविधि है। वर्तमान में आपके पास स्टॉक में केवल ${targetProd.stock} यूनिट हैं। अधिक उत्पादन करने पर विचार करें।`;
      }

      return {
        query,
        responseText: text,
        language: lang,
        action: {
          type: 'view_low_stock',
          requiresConfirmation: false
        },
        highlights: [
          { label: 'Recommended Craft', value: targetProd.title },
          { label: 'Current Stock', value: `${targetProd.stock} left`, type: targetProd.stock <= 3 ? 'warning' : 'neutral' },
          { label: 'Sales Activity', value: `${targetProd.unitsSold} sold`, type: 'positive' }
        ],
        quickSuggestions: [
          isTelugu ? 'నా ఉత్పత్తుల డిమాండ్ ట్రెండ్స్ ఏమిటి?' : 'What are my demand trends?',
          isTelugu ? 'ఏ వస్తువు అత్యధికంగా అమ్ముడవుతోంది?' : 'Which product is selling the most?'
        ]
      };
    }
  }

  // 4. Top selling product ("Which product is selling the most?")
  if (
    q.includes('selling the most') ||
    q.includes('selling most') ||
    q.includes('highest sales') ||
    q.includes('top selling') ||
    q.includes('selling') ||
    q.includes('most') ||
    q.includes('ఎక్కువ') ||
    q.includes('అమ్ముడు') ||
    q.includes('సేల్') ||
    q.includes('బాగా అమ్ముడవుతున్నది') ||
    q.includes('బిక్') ||
    q.includes('top product')
  ) {
    const top = context.topSeller;
    if (top && (top.unitsSold > 0 || top.revenue > 0)) {
      let text = `Your "${top.title}" has the highest number of completed sales (${top.unitsSold} units sold, generating ₹${top.revenue.toLocaleString('en-IN')}). You currently have ${top.stock} in stock.`;
      if (isTelugu) {
        text = `మీ "${top.title}" అత్యధికంగా పూర్తయిన అమ్మకాలను నమోదు చేసింది (${top.unitsSold} యూనిట్లు అమ్ముడై, ₹${top.revenue.toLocaleString('en-IN')} ఆదాయం). ప్రస్తుతం మీ వద్ద ${top.stock} యూనిట్ల స్టాక్ ఉంది.`;
      } else if (isHindi) {
        text = `आपके "${top.title}" की सबसे अधिक बिक्री पूरी हुई है (${top.unitsSold} यूनिट बिके, ₹${top.revenue.toLocaleString('en-IN')} आय)। वर्तमान में आपके पास ${top.stock} स्टॉक में हैं।`;
      }

      return {
        query,
        responseText: text,
        language: lang,
        highlights: [
          { label: 'Top Product', value: top.title },
          { label: 'Completed Sales', value: `${top.unitsSold} units`, type: 'positive' },
          { label: 'Stock Left', value: `${top.stock} units` }
        ],
        quickSuggestions: [
          isTelugu ? 'నేను ఏ వస్తువును ఎక్కువ తయారు చేయాలి?' : 'Which product should I make more?',
          isTelugu ? 'నా ఈ నెల సంపాదన ఎంత?' : 'How much did I earn this month?'
        ]
      };
    } else {
      const p = context.products[0];
      let text = `You have ${context.products.length} products listed. Not enough completed sales data yet to identify a top seller.`;
      if (isTelugu) text = `మీ వద్ద ${context.products.length} ఉత్పత్తులు ఉన్నాయి. అత్యధిక అమ్మకాల ఉత్పత్తిని గుర్తించడానికి ఇంకా తగినంత అమ్మకాల సమాచారం లేదు.`;
      else if (isHindi) text = `आपके ${context.products.length} उत्पाद लिस्टेड हैं। शीर्ष विक्रेता की पहचान करने के लिए अभी पर्याप्त बिक्री डेटा नहीं है।`;

      return {
        query,
        responseText: text,
        language: lang,
        highlights: [
          { label: 'Catalog Status', value: `${context.products.length} listed` }
        ]
      };
    }
  }

  // 5. Demand & Trend inquiries ("What are my demand trends?", "How are my sales trending?")
  if (
    q.includes('demand') ||
    q.includes('trend') ||
    q.includes('trending') ||
    q.includes('డిమాండ్') ||
    q.includes('ట్రెండ్') ||
    q.includes('రుఝాన్') ||
    q.includes('रुझान') ||
    q.includes('मांग')
  ) {
    if (context.increasingProducts.length > 0) {
      const inc = context.increasingProducts[0];
      let text = `Your "${inc.title}" is showing increasing sales demand (+${inc.currentPeriodOrders - inc.previousPeriodOrders} orders this period). You currently have ${inc.stock} in stock. Consider restocking if stock is low.`;
      if (isTelugu) {
        text = `మీ "${inc.title}" ఉత్పత్తికి అమ్మకాల డిమాండ్ పెరుగుతోంది (ఈ వ్యవధిలో +${inc.currentPeriodOrders - inc.previousPeriodOrders} ఆర్డర్లు). ప్రస్తుతం మీ వద్ద ${inc.stock} యూనిట్లు ఉన్నాయి.`;
      } else if (isHindi) {
        text = `आपके "${inc.title}" की मांग बढ़ रही है (इस अवधि में +${inc.currentPeriodOrders - inc.previousPeriodOrders} ऑर्डर)। अभी आपके पास ${inc.stock} स्टॉक है।`;
      }

      return {
        query,
        responseText: text,
        language: lang,
        highlights: [
          { label: 'Trending Up', value: inc.title, type: 'positive' },
          { label: 'Order Growth', value: `+${inc.currentPeriodOrders - inc.previousPeriodOrders} orders` },
          { label: 'Stock', value: `${inc.stock} left` }
        ]
      };
    } else if (context.decreasingProducts.length > 0) {
      const dec = context.decreasingProducts[0];
      let text = `Your "${dec.title}" received fewer orders recently compared with previous periods. Consider updating its photo or promoting via WhatsApp.`;
      if (isTelugu) {
        text = `మీ "${dec.title}" కు ఇటీవల తక్కువ ఆర్డర్లు వచ్చాయి. ఫోటో అప్‌డేట్ చేయడం లేదా వాట్సాప్‌లో షేర్ చేయడం పరిశీలించండి.`;
      } else if (isHindi) {
        text = `आपके "${dec.title}" को हाल ही में कम ऑर्डर मिले हैं। फोटो अपडेट करने या व्हाट्सएप पर साझा करने पर विचार करें।`;
      }

      return {
        query,
        responseText: text,
        language: lang,
        highlights: [
          { label: 'Demand Shift', value: dec.title, type: 'warning' },
          { label: 'Trend', value: 'Decreasing' }
        ]
      };
    } else {
      let text = `Not enough data yet to identify a reliable trend. As more orders and buyer inquiries are recorded, demand patterns will automatically be identified.`;
      if (isTelugu) text = `విశ్వసనీయమైన ట్రెండ్‌ను గుర్తించడానికి ఇంకా తగినంత సమాచారం లేదు. మరిన్ని ఆర్డర్లు మరియు ఎంక్వైరీలు వచ్చినప్పుడు డిమాండ్ ప్యాటర్న్లు కనిపిస్తాయి.`;
      else if (isHindi) text = `विश्वसनीय रुझान की पहचान करने के लिए अभी पर्याप्त डेटा नहीं है। जैसे-जैसे नए ऑर्डर आएंगे, रुझान स्पष्ट होंगे।`;

      return {
        query,
        responseText: text,
        language: lang,
        highlights: [
          { label: 'Trend Status', value: 'Not enough data yet', type: 'neutral' }
        ]
      };
    }
  }

  // 4. Earnings / Revenue
  if (q.includes('earn') || q.includes('income') || q.includes('revenue') || q.includes('సంపాదన') || q.includes('ఆదాయం') || q.includes('డబ్బులు') || q.includes('कमाई') || q.includes('आमदनी')) {
    let text = `This month you have earned ₹${context.currentMonthEarnings.toLocaleString('en-IN')} across ${context.currentMonthUnitsSold} items sold. Your all-time total earnings on CraftWise are ₹${context.totalEarnings.toLocaleString('en-IN')}.`;
    if (isTelugu) {
      text = `ఈ నెలలో మీరు అమ్మిన ${context.currentMonthUnitsSold} వస్తువుల ద్వారా మొత్తం ₹${context.currentMonthEarnings.toLocaleString('en-IN')} సంపాదించారు. క్రాఫ్ట్‌వైజ్ లో మీ మొత్తం ఆల్-టైమ్ సంపాదన ₹${context.totalEarnings.toLocaleString('en-IN')}.`;
    } else if (isHindi) {
      text = `इस महीने आपने कुल ${context.currentMonthUnitsSold} उत्पाद बेचकर ₹${context.currentMonthEarnings.toLocaleString('en-IN')} कमाए हैं। CraftWise पर आपकी कुल आजीवन कमाई ₹${context.totalEarnings.toLocaleString('en-IN')} है।`;
    }

    return {
      query,
      responseText: text,
      language: lang,
      action: {
        type: 'view_earnings',
        requiresConfirmation: false
      },
      highlights: [
        { label: 'This Month', value: `₹${context.currentMonthEarnings.toLocaleString('en-IN')}`, type: 'positive' },
        { label: 'Items Sold', value: `${context.currentMonthUnitsSold} items` },
        { label: 'Total Earnings', value: `₹${context.totalEarnings.toLocaleString('en-IN')}` }
      ]
    };
  }

  // 5. Orders pending
  if (q.includes('order') || q.includes('pending') || q.includes('ఆర్డర్') || q.includes('పెండింగ్') || q.includes('ऑर्डर') || q.includes('पेंडिंग')) {
    const pending = context.pendingOrdersCount;
    let text = `You currently have ${pending} pending orders awaiting action.`;
    if (context.pendingOrders.length > 0) {
      const first = context.pendingOrders[0];
      text += ` Recent order is for ${first.productTitle} by ${first.buyerName} (₹${first.totalAmount}).`;
    }
    if (isTelugu) {
      text = `ప్రస్తుతం మీ వద్ద ${pending} పెండింగ్ ఆర్డర్లు ఉన్నాయి.`;
      if (context.pendingOrders.length > 0) {
        const first = context.pendingOrders[0];
        text += ` తాజా ఆర్డర్: ${first.buyerName} నుండి ${first.productTitle} (₹${first.totalAmount}).`;
      }
    } else if (isHindi) {
      text = `वर्तमान में आपके पास ${pending} पेंडिंग ऑर्डर हैं।`;
      if (context.pendingOrders.length > 0) {
        const first = context.pendingOrders[0];
        text += ` नवीनतम ऑर्डर: ${first.buyerName} द्वारा ${first.productTitle} (₹${first.totalAmount})।`;
      }
    }

    return {
      query,
      responseText: text,
      language: lang,
      action: {
        type: 'view_orders',
        requiresConfirmation: false
      },
      highlights: [
        { label: 'Pending Orders', value: `${pending} orders`, type: pending > 0 ? 'warning' : 'neutral' },
        { label: 'Total Orders', value: `${context.ordersCount} all-time` }
      ]
    };
  }

  // 6. Low stock / stock inquiry
  if (q.includes('low') || q.includes('తక్కువ') || q.includes('స్టాక్') || q.includes('stock') || q.includes('कम स्टॉक')) {
    const low = context.lowStockProducts;
    if (low.length > 0) {
      const titles = low.map(p => `${p.title} (${p.stock} left)`).join(', ');
      let text = `You have ${low.length} product(s) low in stock: ${titles}. Consider making more to meet buyer orders.`;
      if (isTelugu) {
        text = `మీ వద్ద ${low.length} ఉత్పత్తుల స్టాక్ తక్కువగా ఉంది: ${titles}. ఆర్డర్ల కోసం మరిన్ని తయారు చేసుకోవడం మంచిది.`;
      } else if (isHindi) {
        text = `आपके पास ${low.length} उत्पादों का स्टॉक कम है: ${titles}। मांग पूरी करने के लिए और उत्पाद तैयार करें।`;
      }

      return {
        query,
        responseText: text,
        language: lang,
        action: {
          type: 'view_low_stock',
          requiresConfirmation: false
        },
        highlights: [
          { label: 'Low Stock Count', value: `${low.length} products`, type: 'warning' },
          { label: 'Attention Needed', value: low[0]?.title || 'Stock low' }
        ]
      };
    } else {
      let text = `All your products have sufficient inventory in stock. No low stock warnings right now.`;
      if (isTelugu) text = `మీ ఉత్పత్తులన్నింటికీ తగినంత స్టాక్ ఉంది. ప్రస్తుతం స్టాక్ కొరత లేదు.`;
      else if (isHindi) text = `आपके सभी उत्पादों का स्टॉक पर्याप्त है। कोई कमी नहीं है।`;

      return {
        query,
        responseText: text,
        language: lang,
        highlights: [
          { label: 'Inventory Status', value: 'Healthy & In-Stock', type: 'positive' }
        ]
      };
    }
  }

  // 7. WhatsApp message generator
  if (q.includes('whatsapp') || q.includes('వాట్సాప్') || q.includes('మెసేజ్') || q.includes('message') || q.includes('व्हाट्सएप') || q.includes('शेयर')) {
    const prod = context.products[0];
    const artisanName = context.profile?.userId ? 'Artisan' : 'Artisan';
    const msg = `🌿 *${prod?.title || 'Handmade Heritage Craft'}*\n\nనమస్కారం! మా స్వహస్తాలతో తయారుచేసిన అందమైన హస్తకళా వస్తువు.\n\n✨ *ధర*: ₹${prod?.price || 500}/-\n📦 *స్టాక్*: అందుబాటులో ఉంది\n📍 *ప్రాంతం*: ${context.profile?.district || 'Andhra Pradesh'}\n\nడైరెక్ట్ ఆర్డర్ కోసం సంప్రదించండి: https://craftwise.in/p/${prod?.id || ''}`;

    let text = `I have drafted a ready-to-send WhatsApp message for your "${prod?.title || 'craft product'}". You can copy and share it directly with your buyers.`;
    if (isTelugu) text = `మీ "${prod?.title || 'హస్తకళా వస్తువు'}" కోసం సులభంగా పంపుకోగల వాట్సాప్ సందేశాన్ని సిద్ధం చేశాను. మీరు దీన్ని కాపీ చేసి నేరుగా షేర్ చేయవచ్చు.`;
    else if (isHindi) text = `मैंने आपके "${prod?.title || 'उत्पाद'}" के लिए एक व्हाट्सएप संदेश तैयार किया है जिसे आप सीधे खरीदारों को भेज सकते हैं।`;

    return {
      query,
      responseText: text,
      language: lang,
      action: {
        type: 'create_whatsapp',
        requiresConfirmation: false,
        details: { whatsappText: msg }
      },
      highlights: [
        { label: 'Marketing', value: 'WhatsApp Ready', type: 'positive' },
        { label: 'Product', value: prod?.title || 'Catalog' }
      ]
    };
  }

  // 8. Markets / Market linkage
  if (q.includes('market') || q.includes('మార్కెట్') || q.includes('ఎక్కడ') || q.includes('అమ్మ') || q.includes('बाजार') || q.includes('मार्केट')) {
    const matches = context.marketMatches;
    const names = matches.map(m => m.name).join(' and ');
    let text = `Based on your ${context.profile?.craftType || 'heritage crafts'}, top government & B2B platforms suited for your products are ${names}. They offer 0% listing fee and institutional purchase support.`;
    if (isTelugu) {
      text = `మీ ${context.profile?.craftType || 'హస్తకళల'} కోసం అనువైన మార్కెట్ వేదికలు: ${names}. ఇవి ప్రభుత్వ కొనుగోళ్లు మరియు ప్రత్యక్ష బ్యాంకు చెల్లింపుల సదుపాయం కల్పిస్తాయి.`;
    } else if (isHindi) {
      text = `आपके ${context.profile?.craftType || 'हस्तशिल्प'} के लिए सबसे उपयुक्त बाजार पोर्टल हैं: ${names}। इनमें शून्य प्रतिशत लिस्टिंग शुल्क और सरकारी खरीद की सुविधा है।`;
    }

    return {
      query,
      responseText: text,
      language: lang,
      highlights: [
        { label: 'Recommended Portals', value: matches[0]?.name || 'GeM & TRIFED', type: 'positive' },
        { label: 'Category', value: context.profile?.craftType || 'Handicrafts' }
      ]
    };
  }

  // Default friendly overview
  let defaultText = `Hello! You currently have ${context.products.length} products listed on CraftWise with ₹${context.currentMonthEarnings.toLocaleString('en-IN')} earned this month and ${context.pendingOrdersCount} pending orders. How can I help your business today?`;
  if (isTelugu) {
    defaultText = `నమస్కారం! క్రాఫ్ట్‌వైజ్ లో ప్రస్తుతం మీ వద్ద ${context.products.length} ఉత్పత్తులు ఉన్నాయి. ఈ నెలలో ₹${context.currentMonthEarnings.toLocaleString('en-IN')} సంపాదన మరియు ${context.pendingOrdersCount} పెండింగ్ ఆర్డర్లు ఉన్నాయి. మీ వ్యాపారం కోసం నేను మీకు ఎలా సహాయపడగలను?`;
  } else if (isHindi) {
    defaultText = `नमस्ते! CraftWise पर आपके ${context.products.length} उत्पाद लिस्टेड हैं। इस महीने आपकी कमाई ₹${context.currentMonthEarnings.toLocaleString('en-IN')} और ${context.pendingOrdersCount} पेंडिंग ऑर्डर हैं। आज मैं आपकी क्या मदद कर सकता हूँ?`;
  }

  return {
    query,
    responseText: defaultText,
    language: lang,
    highlights: [
      { label: 'Products', value: `${context.products.length} items` },
      { label: 'This Month', value: `₹${context.currentMonthEarnings.toLocaleString('en-IN')}`, type: 'positive' },
      { label: 'Pending Orders', value: `${context.pendingOrdersCount}` }
    ],
    quickSuggestions: [
      isTelugu ? 'ఏ వస్తువు ఎక్కువ అమ్ముడవుతోంది?' : 'Which product is selling the most?',
      isTelugu ? 'ఈ నెల నా సంపాదన ఎంత?' : 'How much did I earn this month?',
      isTelugu ? 'పెండింగ్ ఆర్డర్లు ఎన్ని?' : 'How many orders are pending?',
      isTelugu ? 'స్టాక్ తక్కువగా ఉన్న వస్తువులు ఏవి?' : 'Which products are low in stock?'
    ]
  };
}

/**
 * Main Assistant Query Processor
 */
export async function processArtisanQuery(params: {
  artisanId: string;
  queryText?: string;
  audioBase64?: string;
  language?: string;
}): Promise<AssistantResponse> {
  const { artisanId, audioBase64, language = 'te' } = params;
  let queryText = (params.queryText || '').trim();

  // 1. Transcribe audio if provided
  if (audioBase64 && audioBase64.length > 50) {
    try {
      const transResult = await aiService.transcribeAudio(
        audioBase64,
        queryText,
        LANGUAGE_NAMES[language] || 'Telugu'
      );
      if (transResult.transcript && transResult.transcript.trim()) {
        queryText = transResult.transcript.trim();
      }
    } catch (tErr) {
      console.warn('Voice transcription warning in Ask CraftWise:', tErr);
    }
  }

  if (!queryText) {
    queryText = language === 'te' ? 'నా వ్యాపార వివరాలు చెప్పండి' : 'Show my business summary';
  }

  // 2. Fetch ground-truth business context
  const context = gatherArtisanContext(artisanId);
  const targetLanguageName = LANGUAGE_NAMES[language] || 'Telugu (తెలుగు)';

  // 3. Call Gemini Model for deep understanding & response generation
  const ai = getGenAI();
  if (ai) {
    try {
      const systemPrompt = `You are "Ask CraftWise", a patient, voice-first AI business assistant for Indian artisans (weavers, potters, bamboo weavers, painters).
The artisan is interacting with you via voice or simple text in ${targetLanguageName}.

CRITICAL MANDATES & SAFETY RULES:
1. GROUND TRUTH ONLY: Every sales figure, stock quantity, order count, and price MUST be taken verbatim from the provided data below. NEVER hallucinate or invent numbers. If data is 0 or not found, answer truthfully.
2. NO SENSITIVE REQUESTS: NEVER ask the artisan for OTPs, PINs, passwords, or bank credentials.
3. BUSINESS MODIFICATIONS REQUIRE CONFIRMATION:
   - If the artisan expresses intent to change product price or stock, or mark as sold:
     * Identify the target product from their catalog.
     * Set action.requiresConfirmation = true.
     * In action.confirmationMessage, phrase a crystal-clear confirmation question in ${targetLanguageName}.
     * Example (English): "Do you want to change Bamboo Basket from ₹750 to ₹800?"
     * Example (Telugu): "మీరు 'వెదురు బుట్ట' ధరను ₹750 నుండి ₹800 కు మార్చాలనుకుంటున్నారా?"
4. NATURAL SPOKEN VOICE: The response will be read aloud via Text-To-Speech. Write concise, warm, oral-friendly conversational sentences in ${targetLanguageName}. Avoid markdown headers, asterisks, bullet asterisks, or dense tables.
5. NO GUARANTEED SALES CLAIMS: Do not claim that AI recommendations are guaranteed to increase sales.

ARTISAN ACTUAL BUSINESS DATA:
- Craft: ${context.profile?.craftType || 'Handicrafts'} (${context.profile?.district || 'Visakhapatnam'}, ${context.profile?.state || 'Andhra Pradesh'})
- Products in Catalog:
${JSON.stringify(context.products, null, 2)}
- Orders Summary:
  * Total orders: ${context.ordersCount}
  * Pending orders count: ${context.pendingOrdersCount}
  * Pending orders details: ${JSON.stringify(context.pendingOrders, null, 2)}
- Sales & Earnings:
  * Current Month Earnings: ₹${context.currentMonthEarnings} (${context.currentMonthUnitsSold} units sold)
  * All-Time Earnings: ₹${context.totalEarnings}
  * Top Selling Product: ${context.topSeller ? `${context.topSeller.title} (Sold: ${context.topSeller.unitsSold} units, Revenue: ₹${context.topSeller.revenue}, Stock: ${context.topSeller.stock})` : 'None yet'}
  * Low Stock Products: ${context.lowStockProducts.map(p => `${p.title} (${p.stock} units)`).join(', ') || 'None'}
- Demand & Trend Insights (Grounded in CraftWise Data):
  * Low Stock with Strong Sales: ${context.lowStockStrongSales.map(p => `${p.title} (${p.stock} in stock, ${p.unitsSold} sold)`).join(', ') || 'None'}
  * Products with Increasing Sales: ${context.increasingProducts.map(p => `${p.title} (+${p.currentPeriodOrders - p.previousPeriodOrders} orders)`).join(', ') || 'None'}
  * Products with Decreasing Sales: ${context.decreasingProducts.map(p => `${p.title} (-${p.previousPeriodOrders - p.currentPeriodOrders} orders)`).join(', ') || 'None'}
  * Products with Buyer Inquiries: ${context.highInquiryProducts.map(p => `${p.title} (${p.buyerInquiries} inquiries)`).join(', ') || 'None'}
  * Demand Question Guidance:
    - If asked "Which product is selling the most?", state: "Your [Product Name] has the highest number of completed sales."
    - If asked "Which product should I make more?" or "What to produce?", answer using: "Based on your recent sales, [Product Name] has the strongest sales activity. You currently have [Stock] in stock. Consider producing more."
    - Always use non-guarantee phrasing like "Consider...", "Based on your recent sales...", "Your data shows...".
- Verified Market Opportunities:
${JSON.stringify(context.marketMatches.map(m => ({ name: m.name, match: m.matchingCategory })), null, 2)}

OUTPUT FORMAT:
Respond with a single raw JSON object strictly adhering to this schema:
{
  "responseText": "Direct, spoken-friendly answer in ${targetLanguageName} without asterisks or markdown formatting",
  "action": {
    "type": "update_price" | "update_stock" | "mark_sold" | "view_orders" | "view_earnings" | "view_catalog" | "view_low_stock" | "create_whatsapp" | null,
    "requiresConfirmation": boolean,
    "productId": "id string if updating specific product",
    "productTitle": "title of product",
    "field": "price" | "stock" | null,
    "oldValue": number | string | null,
    "newValue": number | string | null,
    "confirmationMessage": "Confirmation question in ${targetLanguageName} if requiresConfirmation is true, else null",
    "details": { ...any additional useful fields like whatsappText if creating marketing message }
  },
  "highlights": [
    { "label": "Short label", "value": "Value", "type": "positive" | "warning" | "neutral" }
  ],
  "quickSuggestions": ["2 short relevant follow-up questions in ${targetLanguageName}"]
}`;

      // Candidate models: try gemini-3.1-flash-lite first for rapid response, fallback to gemini-3.8-flash
      const candidateModels = ['gemini-3.1-flash-lite', 'gemini-3.8-flash'];
      for (const model of candidateModels) {
        try {
          const response = await callWithRetry(
            () =>
              ai.models.generateContent({
                model,
                contents: [
                  {
                    parts: [
                      { text: systemPrompt },
                      { text: `Artisan Query: "${queryText}"` }
                    ]
                  }
                ],
                config: {
                  responseMimeType: 'application/json'
                }
              }),
            2,
            600
          );

          const rawJson = response.text?.trim();
          if (rawJson) {
            const parsed = JSON.parse(rawJson);
            const cleanResponseText = (parsed.responseText || '')
              .replace(/[*_#`]/g, '')
              .trim();

            return {
              query: queryText,
              responseText: cleanResponseText,
              language,
              action: parsed.action || null,
              highlights: Array.isArray(parsed.highlights) ? parsed.highlights : [],
              quickSuggestions: Array.isArray(parsed.quickSuggestions) ? parsed.quickSuggestions : []
            };
          }
        } catch {
          // Attempt next candidate model
        }
      }
    } catch {
      // Gracefully fall through to deterministic heuristic engine
    }
  }

  // 4. Heuristic engine fallback if Gemini call failed or key is absent
  return heuristicProcess(queryText, context, language);
}

/**
 * Execute verified business action after artisan confirms
 */
export function executeAssistantAction(params: {
  artisanId: string;
  actionType: 'update_price' | 'update_stock' | 'mark_sold';
  productId: string;
  newValue: number;
  language?: string;
}): { success: boolean; message: string; updatedProduct?: Product } {
  const { artisanId, actionType, productId, newValue, language = 'te' } = params;
  const isTelugu = language === 'te';
  const isHindi = language === 'hi';

  const product = db.getProductById(productId);
  if (!product || product.artisanId !== artisanId) {
    const notFoundMsg = isTelugu
      ? 'ఉత్పత్తి కనుగొనబడలేదు లేదా మార్చే అధికారం లేదు.'
      : 'Product not found or unauthorized.';
    return { success: false, message: notFoundMsg };
  }

  if (actionType === 'update_price') {
    const oldPrice = product.price;
    const updated = db.updateProduct(productId, { price: newValue });
    let msg = `Successfully updated price for "${product.title}" from ₹${oldPrice} to ₹${newValue}.`;
    if (isTelugu) {
      msg = `"${product.title}" ధరను విజయవంతంగా ₹${oldPrice} నుండి ₹${newValue} కు మార్చాము.`;
    } else if (isHindi) {
      msg = `"${product.title}" की कीमत सफलतापूर्वक ₹${oldPrice} से ₹${newValue} कर दी गई है।`;
    }
    return { success: true, message: msg, updatedProduct: updated };
  }

  if (actionType === 'update_stock') {
    const oldStock = product.stock;
    const newStatus = newValue <= 0 ? 'out_of_stock' : newValue <= 3 ? 'low_stock' : 'published';
    const updated = db.updateProduct(productId, {
      stock: newValue,
      status: newStatus
    });
    let msg = `Stock for "${product.title}" updated to ${newValue} units.`;
    if (isTelugu) {
      msg = `"${product.title}" స్టాక్ విజయవంతంగా ${newValue} యూనిట్లకు నవీకరించబడింది.`;
    } else if (isHindi) {
      msg = `"${product.title}" का स्टॉक सफलतापूर्वक ${newValue} पीस कर दिया गया है।`;
    }
    return { success: true, message: msg, updatedProduct: updated };
  }

  if (actionType === 'mark_sold') {
    const currentStock = product.stock || 0;
    const remaining = Math.max(0, currentStock - (newValue || 1));
    const newStatus = remaining === 0 ? 'out_of_stock' : remaining <= 3 ? 'low_stock' : product.status;
    const updated = db.updateProduct(productId, {
      stock: remaining,
      status: newStatus
    });
    let msg = `Marked item as sold. ${remaining} units remaining in stock.`;
    if (isTelugu) {
      msg = `అమ్మకం నమోదైంది. ఇంకా ${remaining} యూనిట్ల స్టాక్ అందుబాటులో ఉంది.`;
    } else if (isHindi) {
      msg = `बिक्री दर्ज की गई। स्टॉक में अब ${remaining} पीस बचे हैं।`;
    }
    return { success: true, message: msg, updatedProduct: updated };
  }

  return { success: false, message: 'Unsupported action' };
}
