import { db } from './db.js';
import { getGenAI, callWithRetry } from './ai.js';
import {
  ProductDemandItem,
  DemandAIInsight,
  DemandRecommendation,
  HistoricalTrendSummary,
  MarketLinkageInsight,
  DemandInsightsResponse,
  SalesTrendDirection
} from './types.js';
import { generateMarketRecommendations } from './marketEngine.js';

export async function computeArtisanDemandInsights(artisanId: string): Promise<DemandInsightsResponse> {
  const products = db.getProductsByArtisanId(artisanId);
  const orders = db.getOrdersForUser({ userId: artisanId, role: 'artisan' });
  const enquiries = db.getEnquiriesByArtisanId(artisanId);
  const profile = db.getProfileByUserId(artisanId);

  const validOrders = orders.filter(o => o.status !== 'cancelled' && o.status !== 'rejected');

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-indexed

  const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
  const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;

  // 30 days and 60 days thresholds for rolling window fallback
  const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
  const sixtyDaysMs = 60 * 24 * 60 * 60 * 1000;
  const thirtyDaysAgo = new Date(now.getTime() - thirtyDaysMs);
  const sixtyDaysAgo = new Date(now.getTime() - sixtyDaysMs);

  // Helper to determine if order is in calendar current month
  const isCurrentCalendarMonth = (dateStr?: string) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    return d.getFullYear() === currentYear && d.getMonth() === currentMonth;
  };

  // Helper to determine if order is in calendar previous month
  const isPreviousCalendarMonth = (dateStr?: string) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    return d.getFullYear() === prevYear && d.getMonth() === prevMonth;
  };

  // Check if calendar month comparison has data, or fallback to rolling 30-day windows
  const hasCalendarActivity = validOrders.some(
    o => isCurrentCalendarMonth(o.createdAt) || isPreviousCalendarMonth(o.createdAt)
  );

  // Map each product to demand metrics
  const productDemandList: ProductDemandItem[] = products.map(p => {
    const productOrders = validOrders.filter(o => o.productId === p.id);
    const productEnquiries = enquiries.filter(e => e.productId === p.id);

    const totalOrders = productOrders.length;
    const unitsSold = productOrders.reduce((sum, o) => sum + (Number(o.quantity) || 1), 0);
    const revenue = productOrders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
    const buyerInquiries = productEnquiries.length;

    let currentPeriodOrders = 0;
    let previousPeriodOrders = 0;
    let currentPeriodUnits = 0;
    let previousPeriodUnits = 0;
    let currentPeriodRevenue = 0;
    let previousPeriodRevenue = 0;

    if (hasCalendarActivity) {
      // Calendar month comparison
      const curOrders = productOrders.filter(o => isCurrentCalendarMonth(o.createdAt));
      const prevOrders = productOrders.filter(o => isPreviousCalendarMonth(o.createdAt));

      currentPeriodOrders = curOrders.length;
      previousPeriodOrders = prevOrders.length;
      currentPeriodUnits = curOrders.reduce((sum, o) => sum + (Number(o.quantity) || 1), 0);
      previousPeriodUnits = prevOrders.reduce((sum, o) => sum + (Number(o.quantity) || 1), 0);
      currentPeriodRevenue = curOrders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
      previousPeriodRevenue = prevOrders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
    } else {
      // Rolling 30-day window comparison
      const curOrders = productOrders.filter(o => {
        if (!o.createdAt) return false;
        const d = new Date(o.createdAt);
        return d >= thirtyDaysAgo;
      });
      const prevOrders = productOrders.filter(o => {
        if (!o.createdAt) return false;
        const d = new Date(o.createdAt);
        return d >= sixtyDaysAgo && d < thirtyDaysAgo;
      });

      currentPeriodOrders = curOrders.length;
      previousPeriodOrders = prevOrders.length;
      currentPeriodUnits = curOrders.reduce((sum, o) => sum + (Number(o.quantity) || 1), 0);
      previousPeriodUnits = prevOrders.reduce((sum, o) => sum + (Number(o.quantity) || 1), 0);
      currentPeriodRevenue = curOrders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
      previousPeriodRevenue = prevOrders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
    }

    // Determine trend direction
    let trend: SalesTrendDirection = 'insufficient_data';
    let trendLabel = 'Not enough data yet to identify a reliable trend';

    if (totalOrders === 0) {
      trend = 'insufficient_data';
      trendLabel = 'Not enough data yet';
    } else if (currentPeriodOrders === 0 && previousPeriodOrders === 0) {
      // Orders exist in earlier historical periods but no recent comparison window activity
      trend = 'insufficient_data';
      trendLabel = 'Not enough data yet to identify a reliable trend';
    } else if (currentPeriodOrders > previousPeriodOrders) {
      trend = 'increasing';
      const diff = currentPeriodOrders - previousPeriodOrders;
      trendLabel = `Increasing (+${diff} order${diff > 1 ? 's' : ''})`;
    } else if (currentPeriodOrders < previousPeriodOrders) {
      trend = 'decreasing';
      const diff = previousPeriodOrders - currentPeriodOrders;
      trendLabel = `Decreasing (-${diff} order${diff > 1 ? 's' : ''})`;
    } else if (currentPeriodOrders === previousPeriodOrders && currentPeriodOrders > 0) {
      trend = 'stable';
      trendLabel = 'Stable';
    }

    const isLowStock = p.stock <= 3 || p.status === 'low_stock';
    const isLowStockStrongSales = isLowStock && (unitsSold > 0 || totalOrders > 0);
    const isHighInquiry = buyerInquiries > 0;
    const isLowActivity = (currentPeriodOrders === 0 && buyerInquiries === 0) || totalOrders === 0;

    return {
      id: p.id,
      title: p.title,
      craftCategory: p.craftCategory,
      image: p.preferredImage === 'enhanced' && p.enhancedImage ? p.enhancedImage : p.primaryImage,
      price: p.price,
      stock: p.stock,
      status: p.status,
      isLowStock,
      totalOrders,
      unitsSold,
      revenue,
      buyerInquiries,
      trend,
      trendLabel,
      currentPeriodOrders,
      previousPeriodOrders,
      currentPeriodUnits,
      previousPeriodUnits,
      currentPeriodRevenue,
      previousPeriodRevenue,
      isBestPerforming: false, // Calculated after sorting
      isIncreasing: trend === 'increasing',
      isDecreasing: trend === 'decreasing',
      isLowStockStrongSales,
      isHighInquiry,
      isLowActivity
    };
  });

  // Calculate Best Performing products
  const activeSellers = productDemandList.filter(p => p.unitsSold > 0 || p.revenue > 0);
  activeSellers.sort((a, b) => b.unitsSold - a.unitsSold || b.revenue - a.revenue);
  if (activeSellers.length > 0) {
    activeSellers[0].isBestPerforming = true;
  }

  // Populate categories
  const bestPerforming = activeSellers.slice(0, 5);
  const increasingSales = productDemandList.filter(p => p.trend === 'increasing');
  const decreasingSales = productDemandList.filter(p => p.trend === 'decreasing');
  const lowStockStrongSales = productDemandList.filter(p => p.isLowStockStrongSales);
  const highInquiries = [...productDemandList]
    .filter(p => p.buyerInquiries > 0)
    .sort((a, b) => b.buyerInquiries - a.buyerInquiries);
  const lowActivity = productDemandList.filter(p => p.isLowActivity);

  // Overall Historical Trend Summary
  const thisMonthOrders = validOrders.filter(o => isCurrentCalendarMonth(o.createdAt));
  const prevMonthOrders = validOrders.filter(o => isPreviousCalendarMonth(o.createdAt));

  const thisMonthOrdersCount = thisMonthOrders.length;
  const prevMonthOrdersCount = prevMonthOrders.length;
  const thisMonthUnits = thisMonthOrders.reduce((sum, o) => sum + (Number(o.quantity) || 1), 0);
  const prevMonthUnits = prevMonthOrders.reduce((sum, o) => sum + (Number(o.quantity) || 1), 0);
  const thisMonthRevenue = thisMonthOrders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
  const prevMonthRevenue = prevMonthOrders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);

  const hasEnoughData = validOrders.length >= 2 && (thisMonthOrdersCount > 0 || prevMonthOrdersCount > 0);

  let ordersChangePct: number | null = null;
  let unitsChangePct: number | null = null;
  let revenueChangePct: number | null = null;

  if (prevMonthOrdersCount > 0) {
    ordersChangePct = Math.round(((thisMonthOrdersCount - prevMonthOrdersCount) / prevMonthOrdersCount) * 100);
  }
  if (prevMonthUnits > 0) {
    unitsChangePct = Math.round(((thisMonthUnits - prevMonthUnits) / prevMonthUnits) * 100);
  }
  if (prevMonthRevenue > 0) {
    revenueChangePct = Math.round(((thisMonthRevenue - prevMonthRevenue) / prevMonthRevenue) * 100);
  }

  // Monthly timeline for the last 6 months
  const monthlyTimeline: Array<{
    monthKey: string;
    monthLabel: string;
    orders: number;
    units: number;
    revenue: number;
    inquiries: number;
  }> = [];

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const y = d.getFullYear();
    const m = d.getMonth();
    const monthKey = `${y}-${String(m + 1).padStart(2, '0')}`;
    const monthLabel = d.toLocaleString('en-IN', { month: 'short', year: 'numeric' });

    const mOrders = validOrders.filter(o => {
      if (!o.createdAt) return false;
      const od = new Date(o.createdAt);
      return od.getFullYear() === y && od.getMonth() === m;
    });

    const mEnquiries = enquiries.filter(e => {
      if (!e.createdAt) return false;
      const ed = new Date(e.createdAt);
      return ed.getFullYear() === y && ed.getMonth() === m;
    });

    monthlyTimeline.push({
      monthKey,
      monthLabel,
      orders: mOrders.length,
      units: mOrders.reduce((s, o) => s + (Number(o.quantity) || 1), 0),
      revenue: mOrders.reduce((s, o) => s + (Number(o.totalAmount) || 0), 0),
      inquiries: mEnquiries.length
    });
  }

  const trendAnalysis: HistoricalTrendSummary = {
    hasEnoughData,
    message: hasEnoughData
      ? 'Historical sales comparison computed directly from your CraftWise orders.'
      : 'Not enough data yet to identify a reliable trend.',
    thisMonthOrders: thisMonthOrdersCount,
    previousMonthOrders: prevMonthOrdersCount,
    thisMonthUnits,
    previousMonthUnits: prevMonthUnits,
    thisMonthRevenue,
    previousMonthRevenue: prevMonthRevenue,
    ordersChangePct,
    unitsChangePct,
    revenueChangePct,
    recentOrdersVsEarlier: {
      recentPeriodLabel: 'This Month',
      earlierPeriodLabel: 'Previous Month',
      recentUnits: thisMonthUnits,
      earlierUnits: prevMonthUnits
    },
    monthlyTimeline
  };

  // Market Linkage connection
  const hasStrongSales = bestPerforming.length > 0 && bestPerforming[0].unitsSold >= 1;
  const topProd = bestPerforming[0] || null;

  const sampleProd = products[0];
  const marketChannels = generateMarketRecommendations({
    craftType: profile?.craftType || sampleProd?.craftCategory || 'Handicrafts',
    category: sampleProd?.craftCategory || 'Handicrafts',
    state: profile?.state || 'Andhra Pradesh',
    district: profile?.district || 'Visakhapatnam',
    price: sampleProd?.price || 500
  });

  const marketLinkage: MarketLinkageInsight = {
    hasStrongSales,
    message: hasStrongSales
      ? 'Strong sales activity detected. Explore suitable market channels.'
      : 'Explore suitable market channels as your sales activity grows.',
    topPerformingProduct: topProd
      ? {
          id: topProd.id,
          title: topProd.title,
          unitsSold: topProd.unitsSold,
          revenue: topProd.revenue
        }
      : null,
    recommendedChannels: marketChannels.slice(0, 3).map(ch => ({
      name: ch.name,
      tagline: ch.description,
      suitability: ch.matchingCategory || 'Verified Artisan Procurement',
      type: ch.category || 'Government & B2B',
      badge: ch.badge || 'Official Platform',
      officialUrl: ch.officialUrl
    }))
  };

  // Synthesize AI Business Insights & Practical Recommendations
  const { aiInsights, recommendations, isAiGenerated } = await generateAIInsightsAndRecommendations({
    products: productDemandList,
    bestPerforming,
    increasingSales,
    decreasingSales,
    lowStockStrongSales,
    highInquiries,
    lowActivity,
    trendAnalysis,
    hasStrongSales
  });

  return {
    products: productDemandList,
    categories: {
      bestPerforming,
      increasingSales,
      decreasingSales,
      lowStockStrongSales,
      highInquiries,
      lowActivity
    },
    trendAnalysis,
    aiInsights,
    recommendations,
    marketLinkage,
    generatedAt: new Date().toISOString(),
    isAiGenerated
  };
}

/**
 * Generate AI Business Insights and Practical Recommendations using Gemini API,
 * with deterministic data-grounded fallback.
 */
async function generateAIInsightsAndRecommendations(params: {
  products: ProductDemandItem[];
  bestPerforming: ProductDemandItem[];
  increasingSales: ProductDemandItem[];
  decreasingSales: ProductDemandItem[];
  lowStockStrongSales: ProductDemandItem[];
  highInquiries: ProductDemandItem[];
  lowActivity: ProductDemandItem[];
  trendAnalysis: HistoricalTrendSummary;
  hasStrongSales: boolean;
}): Promise<{
  aiInsights: DemandAIInsight[];
  recommendations: DemandRecommendation[];
  isAiGenerated: boolean;
}> {
  const {
    products,
    bestPerforming,
    increasingSales,
    decreasingSales,
    lowStockStrongSales,
    highInquiries,
    lowActivity,
    trendAnalysis
  } = params;

  // Prepare deterministic fallback first
  const fallbackInsights: DemandAIInsight[] = [];
  const fallbackRecommendations: DemandRecommendation[] = [];

  // Insight 1: Best performing product or initial demand
  if (bestPerforming.length > 0) {
    const top = bestPerforming[0];
    fallbackInsights.push({
      id: 'ins_best_perf',
      productId: top.id,
      productTitle: top.title,
      type: 'demand_trend',
      title: 'Top Sales Performance',
      description: `Based on your sales records, "${top.title}" has the highest completed volume with ${top.unitsSold} units sold and ₹${top.revenue.toLocaleString('en-IN')} in total revenue.`,
      factualDataPoints: [
        `${top.unitsSold} units sold`,
        `₹${top.revenue.toLocaleString('en-IN')} revenue generated`,
        `${top.stock} units currently in stock`
      ],
      badge: 'Best Seller'
    });
  }

  // Insight 2: Increasing sales
  if (increasingSales.length > 0) {
    const inc = increasingSales[0];
    fallbackInsights.push({
      id: 'ins_increasing',
      productId: inc.id,
      productTitle: inc.title,
      type: 'demand_trend',
      title: 'Increasing Order Activity',
      description: `Your "${inc.title}" received ${inc.currentPeriodOrders} orders this period, compared with ${inc.previousPeriodOrders} in the earlier period. Order volume is increasing.`,
      factualDataPoints: [
        `${inc.currentPeriodOrders} orders in current period`,
        `${inc.previousPeriodOrders} orders in previous period`,
        `+${inc.currentPeriodOrders - inc.previousPeriodOrders} order growth`
      ],
      badge: '📈 Increasing Demand'
    });
  }

  // Insight 3: Decreasing sales
  if (decreasingSales.length > 0) {
    const dec = decreasingSales[0];
    fallbackInsights.push({
      id: 'ins_decreasing',
      productId: dec.id,
      productTitle: dec.title,
      type: 'demand_trend',
      title: 'Softening Sales Trend',
      description: `Your "${dec.title}" received ${dec.currentPeriodOrders} orders recently compared with ${dec.previousPeriodOrders} previously. Consider reviewing its photo or marketing description.`,
      factualDataPoints: [
        `${dec.currentPeriodOrders} orders recently vs ${dec.previousPeriodOrders} previously`,
        `${dec.stock} units currently in stock`
      ],
      badge: '📉 Demand Shift'
    });
  }

  // Insight 4: Low stock with strong sales
  if (lowStockStrongSales.length > 0) {
    const low = lowStockStrongSales[0];
    fallbackInsights.push({
      id: 'ins_low_stock_demand',
      productId: low.id,
      productTitle: low.title,
      type: 'low_stock_high_demand',
      title: 'Low Stock on Active Product',
      description: `Your "${low.title}" has recorded sales and only ${low.stock} units remaining. Consider increasing production to avoid missing buyer orders.`,
      factualDataPoints: [
        `Only ${low.stock} units left in stock`,
        `${low.unitsSold} units previously sold`
      ],
      badge: '⚠️ Low Stock Alert'
    });
  }

  // Insight 5: Inquiries without orders
  if (highInquiries.length > 0) {
    const inq = highInquiries[0];
    fallbackInsights.push({
      id: 'ins_inquiries',
      productId: inq.id,
      productTitle: inq.title,
      type: 'inquiry_pattern',
      title: 'Buyer Inquiries Received',
      description: `Your "${inq.title}" has received ${inq.buyerInquiries} buyer inquiries. Inquiries indicate customer interest.`,
      factualDataPoints: [
        `${inq.buyerInquiries} direct customer inquiries recorded`,
        `${inq.totalOrders} completed orders`
      ],
      badge: '💬 Customer Interest'
    });
  }

  // If no sales or inquiries exist yet
  if (fallbackInsights.length === 0) {
    fallbackInsights.push({
      id: 'ins_insufficient_data',
      type: 'demand_trend',
      title: 'Catalog Initializing',
      description: 'Not enough data yet to identify a reliable trend. As buyers place orders and submit inquiries, demand trends will automatically populate here.',
      factualDataPoints: [
        `${products.length} products listed in your catalog`,
        '0 completed orders recorded so far'
      ],
      badge: 'ℹ️ Initial Stage'
    });
  }

  // Recommendations:
  // 1. Producing more of high-demand/low-stock product
  if (lowStockStrongSales.length > 0) {
    const p = lowStockStrongSales[0];
    fallbackRecommendations.push({
      id: 'rec_restock',
      productId: p.id,
      productTitle: p.title,
      actionType: 'increase_production',
      title: `Consider producing more "${p.title}"`,
      suggestion: `Based on your recent sales of ${p.unitsSold} units, you currently have only ${p.stock} units remaining. Consider scheduling production time to restock.`,
      rationale: `Your data shows active sales history and low inventory (${p.stock} left).`,
      actionPayload: {
        actionName: 'update_stock',
        targetTab: 'overview',
        param: { productId: p.id }
      }
    });
  } else if (bestPerforming.length > 0 && bestPerforming[0].stock <= 5) {
    const p = bestPerforming[0];
    fallbackRecommendations.push({
      id: 'rec_restock_top',
      productId: p.id,
      productTitle: p.title,
      actionType: 'increase_production',
      title: `Consider producing more "${p.title}"`,
      suggestion: `Based on your recent sales, "${p.title}" has your strongest sales activity. You currently have ${p.stock} in stock. Consider producing more.`,
      rationale: `Your data shows it is your highest volume product (${p.unitsSold} sold).`,
      actionPayload: {
        actionName: 'update_stock',
        targetTab: 'overview',
        param: { productId: p.id }
      }
    });
  }

  // 2. Updating product photo or description for low activity / decreasing product
  const needsRefreshProd = decreasingSales[0] || lowActivity[0] || products[0];
  if (needsRefreshProd) {
    fallbackRecommendations.push({
      id: 'rec_photo',
      productId: needsRefreshProd.id,
      productTitle: needsRefreshProd.title,
      actionType: 'update_photo',
      title: `Consider updating photo for "${needsRefreshProd.title}"`,
      suggestion: `Your data shows limited recent buyer inquiries for this item. Consider taking a new photo in natural daylight showing the product being used or held.`,
      rationale: 'Products with high-clarity daylight photos generally help buyers inspect weave and texture better.',
      actionPayload: {
        actionName: 'edit_product',
        targetTab: 'overview',
        param: { productId: needsRefreshProd.id }
      }
    });
  }

  // 3. Reviewing price
  if (highInquiries.length > 0 && highInquiries[0].totalOrders === 0) {
    const p = highInquiries[0];
    fallbackRecommendations.push({
      id: 'rec_price',
      productId: p.id,
      productTitle: p.title,
      actionType: 'review_price',
      title: `Consider reviewing the price for "${p.title}"`,
      suggestion: `Based on your records, buyers have sent ${p.buyerInquiries} inquiries but no orders have finalized. Consider reviewing the price or offering a package discount for 2 or more units.`,
      rationale: `Your data shows strong inquiry interest (${p.buyerInquiries} messages) without order conversions.`
    });
  }

  // 4. WhatsApp promotion
  const promoProduct = bestPerforming[0] || products[0];
  if (promoProduct) {
    fallbackRecommendations.push({
      id: 'rec_whatsapp',
      productId: promoProduct.id,
      productTitle: promoProduct.title,
      actionType: 'promote_whatsapp',
      title: `Consider promoting "${promoProduct.title}" through WhatsApp`,
      suggestion: `Consider sharing your product link with previous customers or community WhatsApp groups. Direct WhatsApp sharing can help generate initial momentum.`,
      rationale: `Your data shows this product is ready with complete photos and specifications (₹${promoProduct.price}).`
    });
  }

  // If Gemini API is not configured or fails, return deterministic fallback
  const ai = getGenAI();
  if (!ai || !process.env.GEMINI_API_KEY) {
    return {
      aiInsights: fallbackInsights,
      recommendations: fallbackRecommendations,
      isAiGenerated: false
    };
  }

  // Build Gemini Prompt with exact CraftWise data
  const dataSummary = {
    totalProductsListed: products.length,
    totalValidOrders: trendAnalysis.thisMonthOrders + trendAnalysis.previousMonthOrders,
    thisMonthOrders: trendAnalysis.thisMonthOrders,
    previousMonthOrders: trendAnalysis.previousMonthOrders,
    productsSummary: products.map(p => ({
      title: p.title,
      stock: p.stock,
      totalOrders: p.totalOrders,
      unitsSold: p.unitsSold,
      revenue: p.revenue,
      inquiries: p.buyerInquiries,
      currentPeriodOrders: p.currentPeriodOrders,
      previousPeriodOrders: p.previousPeriodOrders,
      trend: p.trend,
      trendLabel: p.trendLabel,
      isLowStock: p.isLowStock
    }))
  };

  const systemPrompt = `You are the CraftWise AI Demand & Business Advisor for traditional Indian artisans.
Your role is to analyze the artisan's actual CraftWise sales and inquiry data, and generate simple, practical business insights and recommendations.

STRICT RULES:
1. Grounded Data Only: Use ONLY the exact numbers provided in the data summary. NEVER invent sales numbers, fake market demand, or external statistics.
2. Honest Trend Reporting: If there are 0 orders, or not enough historical data, clearly state: "Not enough data yet to identify a reliable trend."
3. Non-Guaranteed Language: Recommendations MUST use cautious phrasing: "Consider...", "Based on your recent sales...", "Your data shows...". Never promise or guarantee increased sales or profits.
4. Distinguish Data from Advice: Separate factual data points from recommendations.
5. Plain & Respectful Language: Speak simply and clearly for rural artisans.

JSON Response format:
{
  "aiInsights": [
    {
      "id": "ins_1",
      "productTitle": "Product Name",
      "title": "Short title (3-5 words)",
      "description": "Factual insight sentence using 'Your [Product] received X orders this month, compared with Y last month...'",
      "factualDataPoints": ["Specific data point 1", "Specific data point 2"],
      "badge": "Short badge (e.g. 📈 Increasing Demand, ⚠️ Low Stock Alert)"
    }
  ],
  "recommendations": [
    {
      "id": "rec_1",
      "productTitle": "Product Name",
      "actionType": "increase_production" | "update_photo" | "review_price" | "promote_whatsapp" | "restock" | "explore_markets",
      "title": "Short action title using 'Consider...'",
      "suggestion": "Detailed practical suggestion starting with 'Consider...' or 'Based on your recent sales...'",
      "rationale": "Reasoning starting with 'Your data shows...'"
    }
  ]
}`;

  try {
    const candidateModels = ['gemini-3.1-flash-lite', 'gemini-3.8-flash'];
    for (const model of candidateModels) {
      try {
        const response: any = await callWithRetry(
          () =>
            ai.models.generateContent({
              model,
              contents: [
                {
                  parts: [
                    { text: systemPrompt },
                    { text: `Artisan Data:\n${JSON.stringify(dataSummary, null, 2)}` }
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

        const raw = response.text?.trim();
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed.aiInsights) && parsed.aiInsights.length > 0) {
            return {
              aiInsights: parsed.aiInsights.map((ins: any, idx: number) => ({
                id: ins.id || `ai_ins_${idx}`,
                productId: ins.productId,
                productTitle: ins.productTitle,
                type: ins.type || 'demand_trend',
                title: ins.title || 'Demand Insight',
                description: ins.description || '',
                factualDataPoints: Array.isArray(ins.factualDataPoints) ? ins.factualDataPoints : [],
                badge: ins.badge || 'AI Insight'
              })),
              recommendations: Array.isArray(parsed.recommendations) && parsed.recommendations.length > 0
                ? parsed.recommendations.map((rec: any, idx: number) => ({
                    id: rec.id || `ai_rec_${idx}`,
                    productId: rec.productId,
                    productTitle: rec.productTitle,
                    actionType: rec.actionType || 'increase_production',
                    title: rec.title || 'Practical Recommendation',
                    suggestion: rec.suggestion || '',
                    rationale: rec.rationale || ''
                  }))
                : fallbackRecommendations,
              isAiGenerated: true
            };
          }
        }
      } catch {
        // Try next candidate model
      }
    }
  } catch {
    // Graceful fallback to deterministic logic
  }

  return {
    aiInsights: fallbackInsights,
    recommendations: fallbackRecommendations,
    isAiGenerated: false
  };
}
