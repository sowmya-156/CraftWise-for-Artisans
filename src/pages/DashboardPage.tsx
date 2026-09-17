import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  PlusCircle,
  Package,
  Boxes,
  Compass,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  MessageSquare,
  CheckCircle2,
  ExternalLink,
  Phone,
  Clock,
  Eye,
  Camera,
  Mic,
  RefreshCw,
  Truck,
  BarChart3,
  LayoutDashboard
} from 'lucide-react';
import { api } from '../api';
import { Product, Enquiry, User, ArtisanProfile, Order } from '../types';
import { useI18n } from '../i18n/I18nContext';
import { SalesEarningsDashboard } from '../components/SalesEarningsDashboard';
import { DemandTrendInsightsView } from '../components/DemandTrendInsightsView';
import { ArtisanOrdersPage } from './ArtisanOrdersPage';
import { AskCraftWiseModal } from '../components/AskCraftWiseModal';

interface DashboardPageProps {
  user: User;
  profile?: ArtisanProfile;
  onNavigate: (page: string, params?: any) => void;
  onOpenChat?: (params?: { productId?: string; conversationId?: string; buyerId?: string; buyerName?: string; buyerMobile?: string }) => void;
  initialTab?: 'overview' | 'orders' | 'sales' | 'trends';
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  user,
  profile,
  onNavigate,
  onOpenChat,
  initialTab = 'overview'
}) => {
  const { t, language } = useI18n();
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'sales' | 'trends'>(initialTab);
  const [products, setProducts] = useState<Product[]>([]);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAskCraftWiseOpen, setIsAskCraftWiseOpen] = useState(false);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  useEffect(() => {
    loadDashboardData();

    // Automatically synchronize catalog when switching between mobile/laptop or browser tabs
    const handleFocus = () => {
      loadDashboardData(true);
    };
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        loadDashboardData(true);
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibility);

    // Continuous polling every 8 seconds when tab is active to keep state synchronized
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') {
        loadDashboardData(true);
      }
    }, 8000);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
      clearInterval(interval);
    };
  }, []);

  const loadDashboardData = async (silent = false) => {
    if (!silent) setIsRefreshing(true);
    try {
      const [prodRes, enqRes, ordersRes] = await Promise.all([
        api.getProducts(),
        api.getEnquiries(),
        api.getOrders()
      ]);
      if (prodRes?.products) {
        setProducts(prodRes.products);
      }
      if (enqRes?.enquiries) {
        setEnquiries(enqRes.enquiries);
      }
      if (ordersRes?.orders) {
        setOrders(ordersRes.orders);
      }
      setLoadError(null);
    } catch (err: any) {
      const msg = err?.message || 'Failed to connect to server';
      if (!silent) {
        setLoadError(msg);
      }
    } finally {
      setLoading(false);
      if (!silent) setIsRefreshing(false);
    }
  };

  const publishedCount = products.filter((p) => p.status === 'published').length;
  const reviewCount = products.filter((p) => p.status === 'ready_for_review').length;
  const lowStockCount = products.filter(
    (p) => p.status === 'low_stock' || p.stock <= 3
  ).length;
  const pendingOrdersCount = orders.filter((o) => o.status === 'placed' || o.status === 'accepted' || o.status === 'preparing').length;

  // Dynamic earnings calculations
  const validOrders = orders.filter((o) => o.status !== 'cancelled' && o.status !== 'rejected');
  const totalEarnings = validOrders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#2D241E] pb-16">
      {/* Top Header */}
      <div className="bg-white border-b border-[#E5E1DA] pt-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs text-[#7C6E62] font-bold uppercase tracking-wider mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              {profile?.craftType || 'Heritage Handicrafts'} • {profile?.district || 'Visakhapatnam'}, {profile?.state || 'Andhra Pradesh'}
            </div>
            <h1 className="text-3xl font-serif italic text-[#4A3728] mb-1">
              {t('dash_welcome')}, {user.fullName}
            </h1>
            <p className="text-[#7C6E62] text-sm">
              {t('dash_sub')}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Prominent "Ask CraftWise" Voice Assistant Button */}
            <button
              type="button"
              id="dashboard-ask-craftwise-btn"
              onClick={() => setIsAskCraftWiseOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#4A3728] via-[#382A1E] to-[#2D241E] hover:from-[#382A1E] hover:to-[#1F1814] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2.5 group whitespace-nowrap border border-amber-900/30"
              title="Open Voice AI Business Assistant"
            >
              <div className="w-7 h-7 rounded-lg bg-[#C05D4D] flex items-center justify-center text-white shadow-xs group-hover:scale-110 transition-transform">
                <Mic className="w-4 h-4 animate-pulse" />
              </div>
              <span className="font-serif tracking-wide">🎤 Ask CraftWise</span>
            </button>

            <button
              type="button"
              id="dashboard-refresh-catalog-btn"
              onClick={loadDashboardData}
              disabled={isRefreshing}
              title="Click to sync catalog between mobile and laptop"
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-[#FDFBF7] text-[#4A3728] border border-[#E5E1DA] font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-all disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#C05D4D] ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? t('common_loading') : 'Sync'}</span>
            </button>

            <div className="bg-white px-3.5 py-2 rounded-full border border-[#E5E1DA] hidden sm:flex items-center gap-2 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span className="text-xs font-bold uppercase text-[#7C6E62]">{t('common_published')}</span>
            </div>
            <button
              type="button"
              id="dashboard-create-product-btn"
              onClick={() => onNavigate('add-product')}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#C05D4D] to-[#A34E41] hover:from-[#b04d3e] hover:to-[#923e32] text-white font-bold text-sm shadow-md shadow-[#C05D4D22] transition-all flex items-center gap-2 group whitespace-nowrap"
            >
              <PlusCircle className="w-4 h-4 group-hover:rotate-90 transition-transform" />
              <span>+ {t('nav_create_catalog')}</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation Switcher */}
        <div className="max-w-7xl mx-auto flex items-center gap-2 border-t border-[#F0EDEA]">
          <button
            type="button"
            id="tab-btn-overview"
            onClick={() => setActiveTab('overview')}
            className={`py-3.5 px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'overview'
                ? 'border-[#C05D4D] text-[#C05D4D]'
                : 'border-transparent text-[#7C6E62] hover:text-[#4A3728]'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span>Overview & Catalog</span>
          </button>

          <button
            type="button"
            id="tab-btn-orders"
            onClick={() => setActiveTab('orders')}
            className={`py-3.5 px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'orders'
                ? 'border-[#C05D4D] text-[#C05D4D]'
                : 'border-transparent text-[#7C6E62] hover:text-[#4A3728]'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Orders & Delivery</span>
            {pendingOrdersCount > 0 ? (
              <span className="bg-[#C05D4D] text-white text-[10px] px-2 py-0.5 rounded-full font-extrabold animate-pulse">
                {pendingOrdersCount} New
              </span>
            ) : orders.length > 0 ? (
              <span className="bg-[#E5E1DA] text-[#4A3728] text-xs px-2 py-0.5 rounded-full font-bold">
                {orders.length}
              </span>
            ) : null}
          </button>

          <button
            type="button"
            id="tab-btn-sales"
            onClick={() => setActiveTab('sales')}
            className={`py-3.5 px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'sales'
                ? 'border-[#C05D4D] text-[#C05D4D]'
                : 'border-transparent text-[#7C6E62] hover:text-[#4A3728]'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Sales & Earnings Dashboard</span>
            <span className="bg-[#C05D4D]/10 text-[#C05D4D] text-xs px-2 py-0.5 rounded-full font-extrabold">
              ₹{totalEarnings.toLocaleString('en-IN')}
            </span>
          </button>

          <button
            type="button"
            id="tab-btn-trends"
            onClick={() => setActiveTab('trends')}
            className={`py-3.5 px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'trends'
                ? 'border-[#C05D4D] text-[#C05D4D]'
                : 'border-transparent text-[#7C6E62] hover:text-[#4A3728]'
            }`}
          >
            <Sparkles className="w-4 h-4 text-[#C05D4D]" />
            <span>AI Demand & Trends</span>
            <span className="bg-[#C05D4D]/10 text-[#C05D4D] text-[10px] px-2 py-0.5 rounded-full font-extrabold uppercase tracking-wide">
              Live
            </span>
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        {/* Connection Notice Banner if initial load encountered an issue */}
        {loadError && (
          <div className="bg-amber-50 border border-amber-200 text-amber-900 px-4 py-3 rounded-2xl flex items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              <span>Connecting to CraftWise catalog server. {products.length > 0 ? 'Showing cached products.' : 'Syncing data...'}</span>
            </div>
            <button
              type="button"
              onClick={() => loadDashboardData(false)}
              className="px-3 py-1 bg-[#C05D4D] hover:bg-[#A34E41] text-white font-bold rounded-lg shrink-0 transition-colors"
            >
              Retry Sync
            </button>
          </div>
        )}

        {/* Conditional View: Sales & Earnings Dashboard, Orders Section, Demand Trends, or General Overview */}
        {activeTab === 'sales' ? (
          <SalesEarningsDashboard
            artisanId={user.id}
            artisanName={user.fullName}
            onNavigate={onNavigate}
            initialProducts={products}
            initialOrders={orders}
            onRefreshParent={loadDashboardData}
          />
        ) : activeTab === 'orders' ? (
          <ArtisanOrdersPage
            onNavigate={onNavigate}
            onOpenChat={onOpenChat}
            isEmbedded={true}
          />
        ) : activeTab === 'trends' ? (
          <DemandTrendInsightsView
            artisanId={user.id}
            artisanName={user.fullName}
            onNavigate={onNavigate}
            onOpenAskCraftWise={(query) => {
              setIsAskCraftWiseOpen(true);
            }}
          />
        ) : (
          <>
            {/* "Ask CraftWise" Voice Assistant Interactive Banner */}
            <div
              id="dashboard-ask-craftwise-hero-card"
              onClick={() => setIsAskCraftWiseOpen(true)}
              className="bg-gradient-to-br from-[#FAF5F0] via-white to-[#FDF8F5] border-2 border-[#C05D4D33] hover:border-[#C05D4D] rounded-3xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 group"
            >
              <div className="flex items-start sm:items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#C05D4D] to-[#A34E41] flex items-center justify-center text-white shadow-md shadow-[#C05D4D33] group-hover:scale-105 transition-transform shrink-0">
                  <Mic className="w-7 h-7 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif font-bold text-lg text-[#4A3728]">
                      🎤 Ask CraftWise AI Voice Assistant
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 text-emerald-800">
                      Voice First
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-[#7C6E62] mt-0.5">
                    Speak naturally in Telugu, Hindi, English, Tamil, Kannada & more. Ask about top selling products, monthly earnings, pending orders, or update prices with voice.
                  </p>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <span className="text-[11px] font-semibold bg-[#F5F2EB] text-[#4A3728] px-2.5 py-0.5 rounded-full border border-[#E5E1DA]">
                      “Which product is selling the most?”
                    </span>
                    <span className="text-[11px] font-semibold bg-[#F5F2EB] text-[#4A3728] px-2.5 py-0.5 rounded-full border border-[#E5E1DA]">
                      “How much did I earn this month?”
                    </span>
                    <span className="text-[11px] font-semibold bg-[#F5F2EB] text-[#4A3728] px-2.5 py-0.5 rounded-full border border-[#E5E1DA]">
                      “Change bamboo basket price to ₹800”
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="px-5 py-2.5 rounded-xl bg-[#C05D4D] group-hover:bg-[#A34E41] text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 shrink-0 self-stretch sm:self-auto justify-center"
              >
                <Mic className="w-4 h-4" />
                <span>Tap to Speak</span>
              </button>
            </div>

            {/* AI Demand & Trends Quick Insight Card */}
            <div
              id="dashboard-demand-trends-preview-banner"
              onClick={() => setActiveTab('trends')}
              className="bg-white border border-[#E5E1DA] hover:border-[#C05D4D] rounded-3xl p-5 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-[#C05D4D]/10 text-[#C05D4D] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-serif font-bold text-base text-[#4A3728]">
                      AI Demand & Trend Insights
                    </span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                      Active
                    </span>
                  </div>
                  <p className="text-xs text-[#7C6E62] mt-0.5">
                    See what buyers are purchasing, production guidance for low-stock crafts, and verified market links.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-[#C05D4D] group-hover:text-[#A34E41] shrink-0 self-end sm:self-auto">
                <span>View Full Demand Trends</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>

            {/* Core USP Hero Banner */}
            <div className="bg-gradient-to-r from-[#C05D4D] to-[#A34E41] rounded-3xl p-6 sm:p-8 text-white flex flex-col lg:flex-row justify-between items-center gap-6 shadow-lg shadow-[#C05D4D22]">
              <div className="max-w-xl">
                <span className="text-xs font-bold uppercase tracking-widest text-white/80 bg-white/10 px-3 py-1 rounded-full border border-white/20">
                  {t('nav_slogan')}
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold mt-3 mb-2 text-white">
                  {t('dash_add_new')}
                </h2>
                <p className="text-white/85 text-base sm:text-lg mb-6 leading-relaxed">
                  {t('rev_subtitle')}
                </p>
                <button
                  type="button"
                  onClick={() => onNavigate('add-product')}
                  className="bg-white text-[#C05D4D] px-8 py-3.5 rounded-2xl font-bold flex items-center gap-3 hover:scale-105 transition-transform active:scale-95 shadow-md text-base sm:text-lg"
                >
                  <Sparkles className="w-5 h-5 text-[#C05D4D]" />
                  <span>{t('wiz_generate_btn')}</span>
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4 shrink-0">
                <div className="w-28 sm:w-32 h-28 sm:h-32 bg-white/10 rounded-2xl flex flex-col items-center justify-center border border-white/20 text-center p-2">
                  <Camera className="w-8 h-8 mb-2 text-white" />
                  <span className="text-xs font-bold uppercase text-white/90">{t('wiz_step1_photo')}</span>
                </div>
                <div className="w-28 sm:w-32 h-28 sm:h-32 bg-white/10 rounded-2xl flex flex-col items-center justify-center border border-white/20 text-center p-2">
                  <Mic className="w-8 h-8 mb-2 text-white" />
                  <span className="text-xs font-bold uppercase text-white/90">{t('wiz_step2_voice')}</span>
                </div>
              </div>
            </div>

            {/* Metric Cards Row */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {/* Total Earnings Card - 1 tap to sales */}
              <div
                onClick={() => setActiveTab('sales')}
                className="bg-white p-5 rounded-2xl border-2 border-[#C05D4D]/30 hover:border-[#C05D4D] shadow-xs cursor-pointer transition-all group"
                title="View detailed Sales & Earnings performance"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[#C05D4D] text-xs font-bold uppercase tracking-widest">Total Sales</p>
                  <TrendingUp className="w-4 h-4 text-[#C05D4D] group-hover:scale-110 transition-transform" />
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-[#C05D4D]">₹{totalEarnings.toLocaleString('en-IN')}</p>
                <p className="text-[10px] text-[#7C6E62] mt-1 flex items-center gap-1 group-hover:text-[#C05D4D]">
                  <span>Analytics →</span>
                </p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#E5E1DA] shadow-xs">
                <p className="text-[#7C6E62] text-xs font-bold uppercase mb-2 tracking-widest">{t('dash_stat_products')}</p>
                <p className="text-2xl sm:text-3xl font-bold text-[#4A3728]">{products.length}</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#E5E1DA] shadow-xs">
                <p className="text-[#7C6E62] text-xs font-bold uppercase mb-2 tracking-widest">{t('dash_stat_active')}</p>
                <p className="text-2xl sm:text-3xl font-bold text-emerald-700">{publishedCount}</p>
              </div>

              <div
                id="dash-stat-orders"
                onClick={() => setActiveTab('orders')}
                className="bg-white p-5 rounded-2xl border-2 border-[#C05D4D]/40 hover:border-[#C05D4D] shadow-xs cursor-pointer transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[#C05D4D] text-xs font-bold uppercase tracking-widest">Customer Orders</p>
                  <Truck className="w-4 h-4 text-[#C05D4D]" />
                </div>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl sm:text-3xl font-bold text-[#C05D4D]">{orders.length}</p>
                  {pendingOrdersCount > 0 && (
                    <span className="text-[10px] bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded-full font-bold">
                      {pendingOrdersCount} to fulfill
                    </span>
                  )}
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#E5E1DA] shadow-xs">
                <p className="text-[#7C6E62] text-xs font-bold uppercase mb-2 tracking-widest">{t('dash_stat_enquiries')}</p>
                <p className="text-2xl sm:text-3xl font-bold text-[#4A3728]">{enquiries.length}</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-[#E5E1DA] shadow-xs">
                <p className="text-[#7C6E62] text-xs font-bold uppercase mb-2 tracking-widest">{t('common_stock')}</p>
                <p className="text-2xl sm:text-3xl font-bold text-red-500">{lowStockCount}</p>
              </div>
            </div>

            {/* Action Shortcuts */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Sales & Earnings Shortcut */}
              <div
                id="dash-card-sales-analytics"
                onClick={() => setActiveTab('sales')}
                className="p-5 rounded-2xl bg-white border-2 border-[#C05D4D]/30 shadow-xs cursor-pointer hover:border-[#C05D4D] transition-all group"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#C05D4D]">
                    Revenue & Trends
                  </span>
                  <BarChart3 className="w-5 h-5 text-[#C05D4D] group-hover:scale-110 transition-transform" />
                </div>
                <h3 className="text-lg font-bold text-[#4A3728]">Sales & Earnings</h3>
                <p className="text-xs text-[#7C6E62] mt-1 leading-relaxed">
                  View monthly revenue chart, order volume, Average Selling Price (ASP), and best sellers.
                </p>
                <div className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-[#C05D4D]">
                  Open Analytics (₹{totalEarnings.toLocaleString('en-IN')}) →
                </div>
              </div>

              <div
                id="dash-card-orders"
                onClick={() => setActiveTab('orders')}
                className="p-5 rounded-2xl bg-white border border-[#E5E1DA] shadow-xs cursor-pointer hover:border-[#C05D4D] transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#C05D4D]">
                    Fulfillment & Tracking
                  </span>
                  <Truck className="w-5 h-5 text-[#C05D4D]" />
                </div>
                <h3 className="text-lg font-bold text-[#4A3728]">Orders & Dispatches</h3>
                <p className="text-xs text-[#7C6E62] mt-1 leading-relaxed">
                  Accept incoming orders, update stages, and enter courier tracking numbers.
                </p>
                <div className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-[#C05D4D]">
                  Manage Orders ({orders.length}) →
                </div>
              </div>

              <div
                onClick={() => onNavigate('add-product')}
                className="p-5 rounded-2xl bg-white border border-[#E5E1DA] shadow-xs cursor-pointer hover:border-[#C05D4D55] transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#C05D4D]">
                    Catalog Generator
                  </span>
                  <Sparkles className="w-5 h-5 text-[#C05D4D]" />
                </div>
                <h3 className="text-lg font-bold text-[#4A3728]">One Photo. One Voice.</h3>
                <p className="text-xs text-[#7C6E62] mt-1 leading-relaxed">
                  Add a new craft item with live camera capture and voice recording in your mother tongue.
                </p>
                <div className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-[#C05D4D]">
                  Start Processing →
                </div>
              </div>

              <div
                onClick={() => onNavigate('market-linkage')}
                className="p-5 rounded-2xl bg-white border border-[#E5E1DA] shadow-xs cursor-pointer hover:border-[#C05D4D55] transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#7C6E62]">
                    Opportunities
                  </span>
                  <Compass className="w-5 h-5 text-[#C05D4D]" />
                </div>
                <h3 className="text-lg font-bold text-[#4A3728]">Market Linkage Engine</h3>
                <p className="text-xs text-[#7C6E62] mt-1 leading-relaxed">
                  Discover official government procurement (GeM), TRIFED, ONDC, and B2B buyers matched to your craft.
                </p>
                <div className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-[#C05D4D]">
                  View Recommendations →
                </div>
              </div>

              <div
                onClick={() => onNavigate('inventory')}
                className="p-5 rounded-2xl bg-white border border-[#E5E1DA] shadow-xs cursor-pointer hover:border-[#C05D4D55] transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#7C6E62]">
                    Stock Control
                  </span>
                  <Boxes className="w-5 h-5 text-[#C05D4D]" />
                </div>
                <h3 className="text-lg font-bold text-[#4A3728]">Inventory & Stock</h3>
                <p className="text-xs text-[#7C6E62] mt-1 leading-relaxed">
                  Simple 1-tap stock counter to prevent overselling and track direct unit costs.
                </p>
                <div className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-[#C05D4D]">
                  Manage Inventory →
                </div>
              </div>
            </div>


        {/* Two-Column Grid: Recent Products & Opportunities/Enquiries */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Recent Products */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-2xl border border-[#E5E1DA] overflow-hidden shadow-xs">
              <div className="px-6 py-4 border-b border-[#E5E1DA] flex justify-between items-center bg-[#FDFBF7]">
                <h3 className="font-bold text-[#4A3728] uppercase text-sm tracking-wider">
                  {t('dash_recent_creations')}
                </h3>
                <span
                  onClick={() => onNavigate('my-products')}
                  className="text-[#C05D4D] text-xs font-bold cursor-pointer hover:underline"
                >
                  {t('dash_view_all').toUpperCase()} ({products.length})
                </span>
              </div>

              {loading ? (
                <div className="p-8 text-center text-[#7C6E62] text-sm">
                  {t('common_loading')}
                </div>
              ) : products.length === 0 ? (
                <div className="p-8 text-center bg-[#FAF9F6]">
                  <Package className="w-12 h-12 text-[#7C6E62] mx-auto mb-2 opacity-50" />
                  <h4 className="font-bold text-[#4A3728]">{t('dash_no_products')}</h4>
                  <p className="text-xs text-[#7C6E62] max-w-sm mx-auto mt-1 mb-4">
                    {t('wiz_voice_instructions')}
                  </p>
                  <button
                    type="button"
                    onClick={() => onNavigate('add-product')}
                    className="px-4 py-2 bg-[#C05D4D] text-white rounded-xl text-xs font-bold shadow-xs"
                  >
                    + {t('nav_create_catalog')}
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-[#F0EDEA]">
                  {products.slice(0, 5).map((p) => {
                    const activeImg =
                      p.preferredImage === 'enhanced'
                        ? p.enhancedImage || p.primaryImage
                        : p.primaryImage;
                    const localizedTitle =
                      (p.translations && (p.translations as any)[language]?.title) || p.title;

                    return (
                      <div
                        key={p.id}
                        className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 sm:px-6 hover:bg-[#FAF9F6] transition-colors gap-4"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 bg-[#E5E1DA] rounded-xl overflow-hidden shrink-0 border border-[#E5E1DA]">
                            <img
                              src={activeImg}
                              alt={localizedTitle}
                              className="w-full h-full object-contain"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] uppercase font-bold text-[#7C6E62]">
                                {p.craftCategory}
                              </span>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                                  p.status === 'published'
                                    ? 'bg-green-100 text-green-700 uppercase'
                                    : p.status === 'ready_for_review'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-[#F4F1ED] text-[#C05D4D]'
                                }`}
                              >
                                {p.status === 'published'
                                  ? t('common_published')
                                  : p.status === 'ready_for_review'
                                  ? t('common_in_review')
                                  : t('common_draft')}
                              </span>
                            </div>
                            <h4 className="font-bold text-sm text-[#4A3728] mt-0.5 line-clamp-1">
                              {localizedTitle}
                            </h4>
                            <div className="text-xs text-[#7C6E62] mt-0.5 flex items-center gap-3">
                              <span className="font-bold text-[#C05D4D]">₹{p.price}</span>
                              <span>• {p.stock} {t('common_stock')}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center">
                          <button
                            type="button"
                            onClick={() => onNavigate('product-detail', { id: p.id })}
                            className="px-3 py-1.5 rounded-lg border border-[#E5E1DA] text-xs font-semibold text-[#4A3728] hover:bg-[#FAF9F6]"
                          >
                            {t('common_view')}
                          </button>
                          {p.status === 'published' && (
                            <button
                              type="button"
                              onClick={() => onNavigate('public-product', { slug: p.slug })}
                              className="px-3 py-1.5 rounded-lg bg-[#FAF9F6] text-[#C05D4D] border border-[#E5E1DA] text-xs font-bold hover:bg-[#FDFBF7] flex items-center gap-1"
                            >
                              <ExternalLink className="w-3 h-3" /> {t('dash_direct_link')}
                            </button>
                          )}
                          {p.status === 'ready_for_review' && (
                            <button
                              type="button"
                              onClick={() => onNavigate('selling-kit', { productId: p.id })}
                              className="px-3 py-1.5 rounded-lg bg-[#C05D4D] text-white text-xs font-bold hover:bg-[#A34E41] shadow-xs"
                            >
                              {t('wiz_step4_review')}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Market Opportunities & Enquiries */}
          <div className="lg:col-span-4 space-y-6">
            {/* Market Opportunities Box */}
            <div className="bg-white rounded-2xl border border-[#E5E1DA] p-6 shadow-sm">
              <h3 className="font-bold text-[#4A3728] uppercase text-sm tracking-wider mb-4 flex items-center gap-2">
                <Compass className="w-4 h-4 text-[#C05D4D]" />
                {t('nav_market_linkage')}
              </h3>
              <div className="space-y-3">
                <div
                  onClick={() => onNavigate('market-linkage')}
                  className="p-4 bg-[#FDFBF7] border border-[#F0EDEA] rounded-xl hover:border-[#C05D4D55] cursor-pointer transition-colors"
                >
                  <p className="font-bold text-sm text-[#4A3728]">Kala Ghoda Art Fair 2026</p>
                  <p className="text-xs text-[#7C6E62] mb-2">Matching your craft category • 96% Match</p>
                  <span className="text-[10px] font-bold uppercase text-[#C05D4D]">{t('common_view')} →</span>
                </div>
                <div
                  onClick={() => onNavigate('market-linkage')}
                  className="p-4 bg-[#FDFBF7] border border-[#F0EDEA] rounded-xl hover:border-[#C05D4D55] cursor-pointer transition-colors"
                >
                  <p className="font-bold text-sm text-[#4A3728]">Tribes India Institutional RFQ</p>
                  <p className="text-xs text-[#7C6E62] mb-2">Bulk procurement • 94% Match</p>
                  <span className="text-[10px] font-bold uppercase text-[#C05D4D]">{t('common_view')} →</span>
                </div>
              </div>

              <div className="mt-5 bg-[#C05D4D0D] p-4 rounded-xl border border-[#C05D4D22]">
                <p className="text-[11px] text-[#C05D4D] font-bold italic leading-tight">
                  “The AI uses your profile data and craft history to find the best buyers for your work.”
                </p>
              </div>
            </div>

            {/* Buyer Enquiries */}
            <div className="bg-white rounded-2xl border border-[#E5E1DA] p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-[#4A3728] uppercase text-sm tracking-wider flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-[#C05D4D]" />
                  {t('dash_stat_enquiries')}
                </h3>
                <span className="text-xs text-[#7C6E62] font-semibold">
                  {enquiries.filter((e) => e.status === 'new').length} New
                </span>
              </div>

              {enquiries.length === 0 ? (
                <div className="p-4 text-center bg-[#FAF9F6] rounded-xl border border-[#E5E1DA] text-[#7C6E62] text-xs">
                  {t('dash_no_products')}
                </div>
              ) : (
                <div className="space-y-3">
                  {enquiries.map((enq) => (
                    <div
                      key={enq.id}
                      className="p-3.5 rounded-xl border border-[#F0EDEA] bg-[#FDFBF7] space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-[#4A3728]">{enq.buyerName}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            enq.status === 'new'
                              ? 'bg-[#C05D4D0D] text-[#C05D4D]'
                              : 'bg-blue-50 text-blue-700'
                          }`}
                        >
                          {enq.status.toUpperCase()}
                        </span>
                      </div>

                      <p className="text-xs text-[#7C6E62] italic line-clamp-2">
                        “{enq.message}”
                      </p>

                      <div className="text-[11px] text-[#7C6E62] flex items-center justify-between pt-1 border-t border-[#F0EDEA]">
                        <span className="flex items-center gap-1 font-medium text-[#4A3728]">
                          <Phone className="w-3 h-3 text-[#7C6E62]" /> {enq.buyerContact}
                        </span>
                        {enq.quantity && <span>Qty: {enq.quantity} units</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
          </>
        )}
      </div>

      {/* Floating Action Button (FAB) for Mobile Artisans */}
      <button
        type="button"
        id="dashboard-ask-craftwise-fab"
        onClick={() => setIsAskCraftWiseOpen(true)}
        className="fixed bottom-6 right-6 z-40 sm:hidden flex items-center gap-2 px-4 py-3 rounded-full bg-gradient-to-r from-[#C05D4D] to-[#A34E41] text-white font-bold text-sm shadow-2xl shadow-[#C05D4D66] border-2 border-white active:scale-95 transition-transform"
        title="Ask CraftWise"
      >
        <Mic className="w-5 h-5 animate-pulse" />
        <span>Ask CraftWise</span>
      </button>

      {/* Ask CraftWise Voice Assistant Modal */}
      {isAskCraftWiseOpen && (
        <AskCraftWiseModal
          isOpen={isAskCraftWiseOpen}
          onClose={() => setIsAskCraftWiseOpen(false)}
          onNavigate={(tab) => {
            if (tab === 'orders') setActiveTab('orders');
            else if (tab === 'sales') setActiveTab('sales');
            else onNavigate(tab);
          }}
          onProductUpdated={loadDashboardData}
        />
      )}
    </div>
  );
};
