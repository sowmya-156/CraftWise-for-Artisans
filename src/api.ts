import {
  User,
  ArtisanProfile,
  BuyerProfile,
  Product,
  MarketOpportunity,
  Enquiry,
  InventoryItem,
  MarketplaceProductItem,
  ChatMessage,
  ChatConversation,
  Order,
  OrderStatus,
  OrderDeliveryDetails,
  OrderNotification,
  SalesAnalyticsData,
  ScamAnalysis,
  BuyerReport,
  AssistantResponse,
  DemandInsightsResponse
} from './types';

const TOKEN_KEY = 'craftwise_auth_token';
const USER_KEY = 'craftwise_user_data';

export const authState = {
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },
  setSession(token: string, user: User, profile?: ArtisanProfile | BuyerProfile) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify({ user, profile }));
  },
  getSession(): { user: User; profile?: ArtisanProfile | BuyerProfile } | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },
  getUser(): User | null {
    const session = this.getSession();
    return session ? session.user : null;
  },
  setUser(user: User) {
    const session = this.getSession();
    const token = this.getToken() || 'craftwise_demo_token';
    this.setSession(token, user, session?.profile);
  },
  getProfile(): ArtisanProfile | null {
    const session = this.getSession();
    if (session?.profile && session.user?.role === 'artisan') {
      return session.profile as ArtisanProfile;
    }
    return null;
  },
  getBuyerProfile(): BuyerProfile | null {
    const session = this.getSession();
    if (session?.profile && session.user?.role === 'buyer') {
      return session.profile as BuyerProfile;
    }
    return null;
  },
  isAuthenticated(): boolean {
    return !!this.getToken();
  },
  isBuyer(): boolean {
    return this.getUser()?.role === 'buyer';
  },
  isArtisan(): boolean {
    return this.getUser()?.role === 'artisan';
  },
  clear() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
  clearSession() {
    this.clear();
  }
};

async function request<T>(endpoint: string, options: RequestInit = {}, retries = 3): Promise<T> {
  const token = authState.getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>)
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let lastError: any;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(endpoint, {
        ...options,
        headers
      });

      let data: any;
      const text = await response.text();
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        data = { message: text };
      }

      if (!response.ok) {
        if (response.status === 401) {
          // Stale or expired token; clear local auth cache
          authState.clearSession();
        }
        throw new Error(data.error || data.message || `Request failed with status ${response.status}`);
      }

      return data as T;
    } catch (err: any) {
      lastError = err;
      const errMsg = err?.message || '';
      const isAuthOrClientError =
        errMsg.includes('401') ||
        errMsg.includes('Authentication required') ||
        errMsg.includes('Session expired') ||
        errMsg.includes('403') ||
        errMsg.includes('404');

      if (isAuthOrClientError) {
        // Do not retry authorization or client errors
        break;
      }

      const isNetworkError =
        err?.name === 'TypeError' ||
        errMsg.includes('fetch') ||
        errMsg.includes('network') ||
        errMsg.includes('Failed to fetch');

      // Retry transient network drops up to 'retries' times with exponential backoff
      if (attempt < retries && isNetworkError) {
        await new Promise((res) => setTimeout(res, 500 * (attempt + 1)));
        continue;
      }
      break;
    }
  }

  throw lastError;
}

export const api = {
  // Health
  getHealth: () => request<{ status: string; geminiConfigured: boolean }>('/api/health'),
  getDemoSamples: () => request<{ samples: Array<{ name: string; craft: string; image: string; sampleVoice: string }> }>('/api/demo-samples'),

  // Auth
  checkMobile: (mobile: string, role: string) =>
    request<{ checked: boolean; exists?: boolean; registeredRole?: string; allowed?: boolean; message?: string }>(
      `/api/auth/check-mobile?mobile=${encodeURIComponent(mobile)}&role=${encodeURIComponent(role)}`
    ),
  checkEmail: (email: string, role: string) =>
    request<{ checked: boolean; exists?: boolean; registeredRole?: string; allowed?: boolean; message?: string }>(
      `/api/auth/check-email?email=${encodeURIComponent(email)}&role=${encodeURIComponent(role)}`
    ),
  sendRegistrationOtp: (
    params: { type?: 'mobile' | 'email'; mobile?: string; email?: string; role?: string } | string,
    role: string = 'artisan'
  ) => {
    const body = typeof params === 'string'
      ? { mobile: params, role, type: 'mobile' }
      : { type: 'mobile', ...params };
    return request<{ message: string; otp: string; mobile?: string; email?: string; target?: string; type?: string; expiresAt: number }>(
      '/api/auth/send-registration-otp',
      {
        method: 'POST',
        body: JSON.stringify(body)
      }
    );
  },
  verifyRegistrationOtp: (
    params: { type?: 'mobile' | 'email'; mobile?: string; email?: string; otp: string } | string,
    otp?: string
  ) => {
    const body = typeof params === 'string'
      ? { mobile: params, otp: otp!, type: 'mobile' }
      : { type: 'mobile', ...params };
    return request<{ message: string; verified: boolean; mobile?: string; email?: string; target?: string; type?: string }>(
      '/api/auth/verify-registration-otp',
      {
        method: 'POST',
        body: JSON.stringify(body)
      }
    );
  },
  register: (payload: any) => request<{ message: string; token: string; user: User; profile: ArtisanProfile }>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  login: (identifier: string, password: string) => request<{ message: string; token: string; user: User; profile: ArtisanProfile }>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ identifier, password })
  }),
  demoCatalogLogin: () => request<{ message: string; token: string; user: User; profile: ArtisanProfile }>('/api/auth/demo-catalog-login', {
    method: 'POST'
  }),
  sendOtp: (identifier: string) => request<{ message: string; otp: string; artisanName?: string; mobileMasked?: string; emailMasked?: string }>('/api/auth/send-otp', {
    method: 'POST',
    body: JSON.stringify({ identifier })
  }),
  verifyOtpLogin: (identifier: string, otp: string) => request<{ message: string; token: string; user: User; profile: ArtisanProfile }>('/api/auth/verify-otp-login', {
    method: 'POST',
    body: JSON.stringify({ identifier, otp })
  }),
  resetPassword: (identifier: string, otp: string, newPassword: string) => request<{ message: string; token: string; user: User; profile: ArtisanProfile }>('/api/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ identifier, otp, newPassword })
  }),
  getMe: () => request<{ user: User; profile: ArtisanProfile }>('/api/auth/me'),

  // Profile
  getProfile: () => request<{ profile: ArtisanProfile }>('/api/profile'),
  updateProfile: (profile: Partial<ArtisanProfile> & { preferredLanguage?: string }) => request<{ message: string; profile: ArtisanProfile }>('/api/profile', {
    method: 'PUT',
    body: JSON.stringify(profile)
  }),

  // Products
  getProducts: () => request<{ products: Product[] }>('/api/products'),
  getProduct: (id: string) => request<{ product: Product }>(`/api/products/${id}`),
  createProduct: (payload: Partial<Product>) => request<{ message: string; product: Product }>('/api/products', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  updateProduct: (id: string, payload: Partial<Product>) => request<{ message: string; product: Product }>(`/api/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  }),
  updateProductStock: async (id: string, stock: number) => {
    const res = await request<{ message: string; product: Product }>(`/api/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ stock })
    });
    return { stock: res.product.stock, status: res.product.status };
  },
  deleteProduct: (id: string) => request<{ message: string }>(`/api/products/${id}`, {
    method: 'DELETE'
  }),

  // AI & Media
  enhanceImage: (imageBase64: string) => request<{ originalImage: string; enhancedImage: string; appliedEnhancements: string[] }>('/api/enhance-image', {
    method: 'POST',
    body: JSON.stringify({ imageBase64 })
  }),
  transcribeAudio: (payload: {
    audioBase64: string;
    spokenLanguage?: string;
    language?: string;
    textFallback?: string;
  }) => request<{
    transcript: string;
    detectedLanguage: string;
    englishTranslation?: string;
  }>('/api/transcribe-audio', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),
  processProductAI: (productId: string, payload: {
    imageBase64: string;
    voiceTranscript?: string;
    voiceNotes?: string;
    audioBase64?: string;
    costOfMaterials?: number;
  }) => request<{
    message: string;
    product: Product;
    appliedEnhancements: string[];
    isDemoAiMode: boolean;
  }>(`/api/products/${productId}/process`, {
    method: 'POST',
    body: JSON.stringify(payload)
  }),

  // Publishing
  approveProduct: (id: string) => request<{ message: string; product: Product }>(`/api/products/${id}/approve`, {
    method: 'POST'
  }),
  publishProduct: (id: string) => request<{ message: string; product: Product; publicUrl: string }>(`/api/products/${id}/publish`, {
    method: 'POST'
  }),
  unpublishProduct: (id: string) => request<{ message: string; product: Product }>(`/api/products/${id}/unpublish`, {
    method: 'POST'
  }),

  // Inventory
  getInventory: () => request<{ inventory: Array<{ product: Product; inventory: InventoryItem }> }>('/api/inventory'),
  updateInventory: (productId: string, quantity: number, threshold?: number, unitPrice?: number) =>
    request<{ message: string; inventory: InventoryItem }>(`/api/inventory/${productId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity, lowStockThreshold: threshold, unitPrice })
    }),

  // Market Linkage
  getMarketRecommendations: (params: { craftType?: string; category?: string; state?: string; district?: string; productId?: string }) => {
    const query = new URLSearchParams();
    if (params.craftType) query.append('craftType', params.craftType);
    if (params.category) query.append('category', params.category);
    if (params.state) query.append('state', params.state);
    if (params.district) query.append('district', params.district);
    if (params.productId) query.append('productId', params.productId);
    return request<{ recommendations: MarketOpportunity[] }>(`/api/market-linkage/recommendations?${query.toString()}`);
  },
  getMarketOpportunities: async (category?: string) => {
    const query = new URLSearchParams();
    if (category) query.append('category', category);
    const res = await request<{ recommendations: MarketOpportunity[] }>(`/api/market-linkage/recommendations?${query.toString()}`);
    return { opportunities: res.recommendations };
  },

  // Public
  getPublicProduct: (slug: string) => request<{ product: Product; artisan: any }>(`/api/public/products/${slug}`),
  sendPublicEnquiry: (slug: string, payload: { buyerName: string; buyerContact: string; message: string; quantity?: number }) =>
    request<{ message: string; enquiryId: string }>(`/api/public/products/${slug}/enquiry`, {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  // Enquiries (Artisan view)
  getEnquiries: (productId?: string) => {
    const q = productId ? `?productId=${encodeURIComponent(productId)}` : '';
    return request<{ enquiries: Enquiry[] }>(`/api/enquiries${q}`);
  },
  updateEnquiryStatus: (id: string, status: 'new' | 'contacted' | 'completed') => request<{ message: string; enquiry: Enquiry }>(`/api/enquiries/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ status })
  }),

  // Marketplace (Buyer & All Users Browsing)
  getMarketplaceProducts: (params?: {
    category?: string;
    search?: string;
    state?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
  }) => {
    const query = new URLSearchParams();
    if (params?.category && params.category !== 'all') query.append('category', params.category);
    if (params?.search) query.append('search', params.search);
    if (params?.state && params.state !== 'all') query.append('state', params.state);
    if (params?.minPrice !== undefined) query.append('minPrice', String(params.minPrice));
    if (params?.maxPrice !== undefined) query.append('maxPrice', String(params.maxPrice));
    if (params?.sortBy) query.append('sortBy', params.sortBy);
    const qs = query.toString();
    return request<{ products: MarketplaceProductItem[]; total: number }>(`/api/marketplace/products${qs ? `?${qs}` : ''}`);
  },

  getMarketplaceCategories: () => request<{ categories: Array<{ name: string; count: number; description?: string }> }>('/api/marketplace/categories'),

  getBuyerEnquiries: (contact?: string) => {
    const q = contact ? `?contact=${encodeURIComponent(contact)}` : '';
    return request<{ enquiries: Enquiry[] }>(`/api/buyer/my-enquiries${q}`);
  },

  // Multilingual Chat & Bargaining
  getChatConversations: (params?: { userId?: string; role?: string; contact?: string }) => {
    const query = new URLSearchParams();
    if (params?.userId) query.append('userId', params.userId);
    if (params?.role) query.append('role', params.role);
    if (params?.contact) query.append('contact', params.contact);
    const qs = query.toString();
    return request<{ conversations: ChatConversation[] }>(`/api/chat/conversations${qs ? `?${qs}` : ''}`);
  },

  startChatConversation: (payload: {
    productId: string;
    buyerName?: string;
    buyerMobile?: string;
    buyerLanguage?: string;
    initialMessage?: string;
    initialPriceOffer?: number;
    initialQuantity?: number;
  }) => request<{ conversation: ChatConversation; messages: ChatMessage[] }>('/api/chat/conversations', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),

  getChatConversation: (id: string) => request<{ conversation: ChatConversation; messages: ChatMessage[] }>(`/api/chat/conversations/${id}`),

  sendChatMessage: (conversationId: string, payload: {
    text: string;
    language?: string;
    senderId?: string;
    senderName?: string;
    senderRole?: 'buyer' | 'artisan';
    isVoiceInput?: boolean;
    proposedPrice?: number;
    proposedQuantity?: number;
  }) => request<{ message: ChatMessage; conversation: ChatConversation }>(`/api/chat/conversations/${conversationId}/messages`, {
    method: 'POST',
    body: JSON.stringify(payload)
  }),

  translateText: (text: string, fromLang: string, toLang: string) => request<{ translatedText: string }>('/api/chat/translate', {
    method: 'POST',
    body: JSON.stringify({ text, fromLang, toLang })
  }),

  saveMessageTranslations: (messageId: string, translations: Record<string, string>) =>
    request<{ success: boolean; message: ChatMessage }>(`/api/chat/messages/${messageId}/translations`, {
      method: 'PUT',
      body: JSON.stringify({ translations })
    }),

  updateChatLanguage: (conversationId: string, role: 'buyer' | 'artisan', language: string) =>
    request<{ conversation: ChatConversation }>(`/api/chat/conversations/${conversationId}/language`, {
      method: 'PATCH',
      body: JSON.stringify({ role, language })
    }),

  markChatRead: (conversationId: string, role: 'buyer' | 'artisan') =>
    request<{ success: boolean }>(`/api/chat/conversations/${conversationId}/read`, {
      method: 'PATCH',
      body: JSON.stringify({ role })
    }),

  // AI Scam & Fraud Protection
  analyzeMessageForScam: (text: string, sourceLanguage?: string, targetLanguage?: string) =>
    request<{ scamAnalysis: ScamAnalysis }>('/api/chat/analyze-message', {
      method: 'POST',
      body: JSON.stringify({ text, sourceLanguage, targetLanguage })
    }),

  dismissScamWarning: (messageId: string) =>
    request<{ success: boolean; message: ChatMessage }>(`/api/chat/messages/${messageId}/dismiss-scam-warning`, {
      method: 'POST'
    }),

  blockBuyerInConversation: (conversationId: string) =>
    request<{ success: boolean; conversation: ChatConversation; message: string }>(`/api/chat/conversations/${conversationId}/block-buyer`, {
      method: 'POST'
    }),

  unblockBuyerInConversation: (conversationId: string) =>
    request<{ success: boolean; conversation: ChatConversation; message: string }>(`/api/chat/conversations/${conversationId}/unblock-buyer`, {
      method: 'POST'
    }),

  reportBuyer: (conversationId: string, data: { messageId?: string; reason: string; details?: string }) =>
    request<{ success: boolean; report: BuyerReport; message: string }>(`/api/chat/conversations/${conversationId}/report-buyer`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  // Orders & Shipment Tracking
  createOrder: (payload: {
    productId: string;
    quantity: number;
    customizationNotes?: string;
    deliveryDetails: OrderDeliveryDetails;
    buyerName?: string;
    buyerMobile?: string;
  }) => request<{ message: string; order: Order }>('/api/orders', {
    method: 'POST',
    body: JSON.stringify(payload)
  }),

  getOrders: (params?: { role?: 'buyer' | 'artisan'; mobile?: string }) => {
    const query = new URLSearchParams();
    if (params?.role) query.append('role', params.role);
    if (params?.mobile) query.append('mobile', params.mobile);
    const queryString = query.toString();
    return request<{ orders: Order[] }>(`/api/orders${queryString ? `?${queryString}` : ''}`);
  },

  getOrder: (idOrNumber: string) =>
    request<{ order: Order }>(`/api/orders/${encodeURIComponent(idOrNumber)}`),

  updateOrderStatus: (orderId: string, payload: {
    status: OrderStatus;
    note?: string;
    rejectionReason?: string;
    trackingPartner?: string;
    trackingNumber?: string;
    expectedDeliveryDate?: string;
    estimatedTimeOfArrival?: string;
  }) => request<{ message: string; order: Order }>(`/api/orders/${encodeURIComponent(orderId)}/status`, {
    method: 'PATCH',
    body: JSON.stringify(payload)
  }),

  getOrderNotifications: (mobile?: string) => {
    const query = mobile ? `?mobile=${encodeURIComponent(mobile)}` : '';
    return request<{ notifications: OrderNotification[] }>(`/api/orders-notifications${query}`);
  },

  markOrderNotificationRead: (id: string) =>
    request<{ success: boolean }>(`/api/orders-notifications/${encodeURIComponent(id)}/read`, {
      method: 'PATCH'
    }),

  // Artisan Sales & Earnings Analytics
  getSalesAnalytics: () =>
    request<{ analytics: SalesAnalyticsData }>('/api/artisan/sales-analytics'),

  // AI Demand & Trend Insights
  getDemandInsights: (artisanId?: string) => {
    const q = artisanId ? `?artisanId=${encodeURIComponent(artisanId)}` : '';
    return request<{ insights: DemandInsightsResponse }>(`/api/artisan/demand-insights${q}`);
  },

  // "Ask CraftWise" Voice-First AI Assistant
  queryArtisanAssistant: (payload: { textQuery?: string; audioBase64?: string; language?: string }) =>
    request<AssistantResponse>('/api/artisan/assistant/query', {
      method: 'POST',
      body: JSON.stringify(payload)
    }),

  executeAssistantAction: (payload: {
    actionType: string;
    productId: string;
    newValue: number;
    language?: string;
  }) =>
    request<{ success: boolean; message: string; updatedProduct?: Product; audioUrl?: string }>(
      '/api/artisan/assistant/execute-action',
      {
        method: 'POST',
        body: JSON.stringify(payload)
      }
    )
};


