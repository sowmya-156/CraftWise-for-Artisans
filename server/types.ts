export interface User {
  id: string;
  fullName: string;
  mobile: string;
  email: string;
  passwordHash: string;
  role: 'artisan' | 'buyer';
  preferredLanguage: string; // 'te' | 'hi' | 'en'
  city?: string;
  state?: string;
  deliveryAddress?: string;
  interestedCategories?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface BuyerProfile {
  id: string;
  userId: string;
  city?: string;
  state?: string;
  deliveryAddress?: string;
  interestedCategories?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ArtisanProfile {
  id: string;
  userId: string;
  craftType: string;
  state: string;
  district: string;
  villageOrCity: string;
  cooperativeName?: string;
  yearsOfExperience?: number;
  craftDescription?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductImage {
  id: string;
  productId: string;
  originalUrl: string;
  enhancedUrl: string;
  activeType: 'original' | 'enhanced';
  width?: number;
  height?: number;
  createdAt: string;
}

export interface VoiceInput {
  id: string;
  productId: string;
  audioUrl?: string;
  detectedLanguage: string;
  transcript: string;
  rawNotes?: string;
  createdAt: string;
}

export interface TranslationItem {
  title: string;
  shortDescription: string;
  detailedDescription: string;
}

export interface Translations {
  en: TranslationItem;
  hi: TranslationItem;
  te: TranslationItem;
  [key: string]: TranslationItem;
}

export interface PriceRecommendation {
  id: string;
  productId: string;
  suggestedMin: number;
  suggestedMax: number;
  artisanCost: number;
  finalPrice: number;
  breakdown: {
    materialCostEstimated: number;
    laborHoursEstimated: number;
    hourlyLaborRateEstimated: number;
    marketDemandFactor: string;
    rationale: string[];
  };
  createdAt: string;
}

export interface MarketingContent {
  whatsAppMessage: string;
  instagramCaption: string;
  shortPromotion: string;
}

export interface AIProcessing {
  id: string;
  productId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  stages: {
    photoReceived: boolean;
    voiceReceived: boolean;
    understandingProduct: boolean;
    enhancingImage: boolean;
    creatingDescription: boolean;
    translatingContent: boolean;
    preparingPriceSuggestion: boolean;
    creatingMarketingContent: boolean;
    preparingCatalogue: boolean;
  };
  isDemoAiMode: boolean;
  modelUsed: string;
  authenticityGuardPassed: boolean;
  generatedAt: string;
  error?: string;
}

export interface Inventory {
  id: string;
  productId: string;
  quantity: number;
  lowStockThreshold: number;
  unitPrice: number;
  updatedAt: string;
}

export interface Product {
  id: string;
  artisanId: string;
  slug: string;
  title: string;
  shortDescription: string;
  detailedDescription: string;
  craftCategory: string;
  materials: string[];
  handmadeAttributes: string[];
  tags: string[];
  status: 'draft' | 'ready_for_review' | 'published' | 'low_stock' | 'out_of_stock';
  isApprovedByArtisan: boolean;
  approvedAt?: string;
  publishedAt?: string;
  price: number;
  stock: number;
  primaryImage: string;
  enhancedImage: string;
  preferredImage: 'original' | 'enhanced';
  voiceNotes?: string;
  voiceTranscript?: string;
  detectedLanguage?: string;
  artisanName?: string;
  artisanMobile?: string;
  translations?: Translations;
  pricingRecommendation?: PriceRecommendation;
  marketingContent?: MarketingContent;
  aiProcessing?: AIProcessing;
  createdAt: string;
  updatedAt: string;
}

export interface MarketOpportunity {
  id: string;
  name: string;
  category: 'government' | 'b2b' | 'ecommerce' | 'cooperative' | 'institutional' | 'export';
  badge: string;
  matchScore: number; // 0 to 100
  whyRecommended: string[];
  matchingCategory: string;
  eligibility: string;
  officialUrl: string;
  actionText: string;
  description: string;
  locationScope: string;
}

export interface Enquiry {
  id: string;
  productId: string;
  productTitle: string;
  buyerName: string;
  buyerContact: string; // phone or email
  message: string;
  quantity?: number;
  status: 'new' | 'contacted' | 'completed';
  createdAt: string;
}

export type ScamRiskLevel = 'safe' | 'suspicious' | 'high_risk';

export type ScamCategory =
  | 'otp_credentials'
  | 'fake_fee'
  | 'suspicious_link'
  | 'fake_payment_qr'
  | 'urgency_coercion'
  | 'external_platform'
  | 'courier_scam'
  | 'other'
  | 'none';

export interface ScamAnalysis {
  riskLevel: ScamRiskLevel;
  category: ScamCategory;
  flaggedPhrases: string[];
  reason: string;
  localizedReasons: Record<string, string>;
  warningTitle?: string;
  localizedTitles?: Record<string, string>;
  actionAdvice: string;
  localizedAdvices?: Record<string, string>;
  isDismissed?: boolean;
  analyzedAt: string;
}

export interface BuyerReport {
  id: string;
  conversationId: string;
  reportedUserId: string;
  reportedByUserId: string;
  messageId?: string;
  reason: string;
  details?: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderRole: 'buyer' | 'artisan';
  originalText: string;
  originalLanguage: string; // e.g. 'en', 'te', 'hi', 'ta', 'kn', 'ml', 'mr', 'bn', 'or'
  translations: Record<string, string>; // cached translation per language code
  isVoiceInput?: boolean;
  proposedPrice?: number;
  proposedQuantity?: number;
  scamAnalysis?: ScamAnalysis;
  createdAt: string;
}

export interface ChatConversation {
  id: string;
  productId: string;
  productTitle: string;
  productImage: string;
  productPrice: number;
  productSlug?: string;
  artisanId: string;
  artisanName: string;
  artisanMobile?: string;
  artisanLanguage: string; // e.g. 'te'
  buyerId: string;
  buyerName: string;
  buyerMobile?: string;
  buyerLanguage: string; // e.g. 'en'
  lastMessage?: string;
  lastMessageAt?: string;
  unreadCountArtisan: number;
  unreadCountBuyer: number;
  isBlocked?: boolean;
  blockedBy?: string;
  blockedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus =
  | 'placed'
  | 'accepted'
  | 'preparing'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'rejected'
  | 'cancelled';

export interface OrderStatusHistoryItem {
  status: OrderStatus;
  timestamp: string;
  note?: string;
  updatedBy?: 'buyer' | 'artisan' | 'system';
}

export interface OrderDeliveryDetails {
  buyerName: string;
  buyerMobile: string;
  buyerEmail?: string;
  streetAddress: string;
  city: string;
  state: string;
  pincode: string;
  landmark?: string;
  paymentMethod: 'cod' | 'upi_on_delivery' | 'artisan_direct_upi';
  deliveryNotes?: string;
}

export interface OrderNotification {
  id: string;
  orderId: string;
  orderNumber: string;
  recipientUserId?: string;
  recipientMobile?: string;
  title: string;
  message: string;
  status: OrderStatus;
  read: boolean;
  createdAt: string;
}

export interface Order {
  id: string;
  orderNumber: string; // e.g. "CW-ORD-92812"
  productId: string;
  productTitle: string;
  productImage: string;
  productPrice: number;
  productSlug?: string;
  craftCategory?: string;
  artisanId: string;
  artisanName: string;
  artisanMobile?: string;
  buyerId?: string;
  buyerName: string;
  buyerMobile: string;
  quantity: number;
  unitPrice: number;
  customizationNotes?: string;
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
  deliveryDetails: OrderDeliveryDetails;
  status: OrderStatus;
  statusHistory: OrderStatusHistoryItem[];
  expectedDeliveryDate: string; // e.g. "2026-09-17" or formatted date
  estimatedTimeOfArrival: string; // e.g. "5 - 7 business days"
  trackingPartner?: string; // e.g. "India Post Speed Post"
  trackingNumber?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MonthlySalesData {
  monthKey: string;
  monthLabel: string;
  shortMonth: string;
  earnings: number;
  orderCount: number;
  unitsSold: number;
}

export interface ProductPerformanceItem {
  id: string;
  title: string;
  craftCategory?: string;
  image: string;
  price: number;
  stock: number;
  status: string;
  isLowStock: boolean;
  unitsSold: number;
  revenue: number;
  isBestSeller: boolean;
}

export interface RecentOrderItem {
  id: string;
  orderNumber: string;
  productId: string;
  productTitle: string;
  productImage: string;
  buyerName: string;
  buyerMobile: string;
  quantity: number;
  totalAmount: number;
  unitPrice: number;
  status: OrderStatus;
  orderDate: string;
  createdAt: string;
}

export interface SalesAnalyticsData {
  overview: {
    totalEarnings: number;
    totalOrders: number;
    pendingOrders: number;
    completedOrders: number;
    productsSold: number;
    averageSellingPrice: number;
  };
  monthlySales: MonthlySalesData[];
  productPerformance: ProductPerformanceItem[];
  recentOrders: RecentOrderItem[];
}

export type SalesTrendDirection = 'increasing' | 'decreasing' | 'stable' | 'insufficient_data';

export interface ProductDemandItem {
  id: string;
  title: string;
  craftCategory?: string;
  image?: string;
  price: number;
  stock: number;
  status: string;
  isLowStock: boolean;
  totalOrders: number;
  unitsSold: number;
  revenue: number;
  buyerInquiries: number;
  trend: SalesTrendDirection;
  trendLabel: string;
  currentPeriodOrders: number;
  previousPeriodOrders: number;
  currentPeriodUnits: number;
  previousPeriodUnits: number;
  currentPeriodRevenue: number;
  previousPeriodRevenue: number;
  isBestPerforming: boolean;
  isIncreasing: boolean;
  isDecreasing: boolean;
  isLowStockStrongSales: boolean;
  isHighInquiry: boolean;
  isLowActivity: boolean;
}

export interface DemandAIInsight {
  id: string;
  productId?: string;
  productTitle?: string;
  type: 'demand_trend' | 'low_stock_high_demand' | 'inquiry_pattern' | 'low_activity' | 'growth_opportunity';
  title: string;
  description: string;
  factualDataPoints: string[];
  badge: string;
}

export interface DemandRecommendation {
  id: string;
  productId?: string;
  productTitle?: string;
  actionType: 'increase_production' | 'update_photo' | 'review_price' | 'promote_whatsapp' | 'restock' | 'explore_markets';
  title: string;
  suggestion: string;
  rationale: string;
  actionPayload?: {
    actionName: string;
    targetTab?: string;
    param?: any;
  };
}

export interface HistoricalTrendSummary {
  hasEnoughData: boolean;
  message: string;
  thisMonthOrders: number;
  previousMonthOrders: number;
  thisMonthUnits: number;
  previousMonthUnits: number;
  thisMonthRevenue: number;
  previousMonthRevenue: number;
  ordersChangePct: number | null;
  unitsChangePct: number | null;
  revenueChangePct: number | null;
  recentOrdersVsEarlier: {
    recentPeriodLabel: string;
    earlierPeriodLabel: string;
    recentUnits: number;
    earlierUnits: number;
  };
  monthlyTimeline: Array<{
    monthKey: string;
    monthLabel: string;
    orders: number;
    units: number;
    revenue: number;
    inquiries: number;
  }>;
}

export interface MarketLinkageInsight {
  hasStrongSales: boolean;
  message: string;
  topPerformingProduct?: {
    id: string;
    title: string;
    unitsSold: number;
    revenue: number;
  } | null;
  recommendedChannels: Array<{
    name: string;
    tagline: string;
    suitability: string;
    type: string;
    badge: string;
    officialUrl?: string;
  }>;
}

export interface DemandInsightsResponse {
  products: ProductDemandItem[];
  categories: {
    bestPerforming: ProductDemandItem[];
    increasingSales: ProductDemandItem[];
    decreasingSales: ProductDemandItem[];
    lowStockStrongSales: ProductDemandItem[];
    highInquiries: ProductDemandItem[];
    lowActivity: ProductDemandItem[];
  };
  trendAnalysis: HistoricalTrendSummary;
  aiInsights: DemandAIInsight[];
  recommendations: DemandRecommendation[];
  marketLinkage: MarketLinkageInsight;
  generatedAt: string;
  isAiGenerated: boolean;
}

