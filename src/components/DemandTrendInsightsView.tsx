import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Sparkles,
  RefreshCw,
  AlertTriangle,
  Package,
  ArrowUpRight,
  MessageCircle,
  Share2,
  ExternalLink,
  ChevronRight,
  BarChart3,
  HelpCircle,
  Layers,
  ShoppingBag,
  Clock,
  CheckCircle2,
  Lightbulb
} from 'lucide-react';
import { api } from '../api';
import { DemandInsightsResponse, ProductDemandItem, DemandAIInsight, DemandRecommendation } from '../types';

interface DemandTrendInsightsViewProps {
  artisanId?: string;
  artisanName?: string;
  onNavigate?: (page: string, params?: any) => void;
  onOpenAskCraftWise?: (initialQuery?: string) => void;
}

export const DemandTrendInsightsView: React.FC<DemandTrendInsightsViewProps> = ({
  artisanId,
  artisanName,
  onNavigate,
  onOpenAskCraftWise
}) => {
  const [data, setData] = useState<DemandInsightsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<
    'all' | 'bestPerforming' | 'increasingSales' | 'decreasingSales' | 'lowStockStrongSales' | 'highInquiries'
  >('all');
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  const fetchInsights = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const res = await api.getDemandInsights(artisanId);
      if (res?.insights) {
        setData(res.insights);
      } else {
        setError('No insights returned from server.');
      }
    } catch (err: any) {
      console.error('Failed to load demand insights:', err);
      setError(err?.message || 'Could not fetch demand insights.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, [artisanId]);

  const handleShareWhatsApp = (productTitle: string, price: number) => {
    const text = `Namaste! Explore my authentic handcrafted "${productTitle}" (₹${price.toLocaleString('en-IN')}) on CraftWise: ${window.location.origin}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleRecommendationAction = (rec: DemandRecommendation) => {
    if (rec.actionType === 'promote_whatsapp') {
      const prod = data?.products.find((p) => p.id === rec.productId) || data?.products[0];
      if (prod) handleShareWhatsApp(prod.title, prod.price);
    } else if (rec.actionType === 'increase_production' || rec.actionType === 'restock') {
      if (onNavigate) onNavigate('dashboard');
    } else if (rec.actionType === 'explore_markets') {
      const element = document.getElementById('market-linkage-section');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (onOpenAskCraftWise) {
      onOpenAskCraftWise(`How can I optimize sales for ${rec.productTitle || 'my products'}?`);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-12 border border-[#E5E1DA] flex flex-col items-center justify-center text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-[#C05D4D]/10 flex items-center justify-center text-[#C05D4D] animate-spin">
          <RefreshCw className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-serif font-bold text-lg text-[#4A3728]">Analyzing Sales & Demand Patterns...</h3>
          <p className="text-sm text-[#7C6E62] max-w-md mt-1">
            Computing month-over-month trends, stock levels, and grounded business recommendations from your CraftWise catalog.
          </p>
        </div>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-red-200 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-serif font-bold text-lg text-[#4A3728]">Unable to Load Demand Insights</h3>
          <p className="text-sm text-[#7C6E62] mt-1">{error}</p>
        </div>
        <button
          type="button"
          onClick={() => fetchInsights()}
          className="px-5 py-2.5 bg-[#C05D4D] hover:bg-[#A34E41] text-white text-sm font-bold rounded-xl transition-colors cursor-pointer"
        >
          Try Again
        </button>
      </div>
    );
  }

  const { products = [], categories, trendAnalysis, aiInsights = [], recommendations = [], marketLinkage } = data || {};

  // Filter products
  const displayProducts = () => {
    if (!categories) return products;
    switch (selectedFilter) {
      case 'bestPerforming':
        return categories.bestPerforming;
      case 'increasingSales':
        return categories.increasingSales;
      case 'decreasingSales':
        return categories.decreasingSales;
      case 'lowStockStrongSales':
        return categories.lowStockStrongSales;
      case 'highInquiries':
        return categories.highInquiries;
      default:
        return products;
    }
  };

  const filteredList = displayProducts();

  return (
    <div className="space-y-8" id="demand-trend-insights-root">
      {/* Header Banner */}
      <div className="bg-gradient-to-br from-[#FAF5F0] via-white to-[#FDF8F5] border border-[#E5E1DA] rounded-3xl p-6 sm:p-8 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C05D4D]/10 text-[#C05D4D] text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Demand & Trend Insights</span>
            </div>
            <h2 className="font-serif font-bold text-2xl sm:text-3xl text-[#4A3728]">
              Market Demand & Production Guidance
            </h2>
            <p className="text-sm text-[#7C6E62] max-w-2xl leading-relaxed">
              Real-time trend analysis grounded in your CraftWise order history. Understand what buyers are purchasing, what to produce next, and where new market opportunities exist.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              id="refresh-demand-insights-btn"
              onClick={() => fetchInsights(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-[#E5E1DA] hover:border-[#C05D4D] text-[#4A3728] text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Refreshing...' : 'Refresh Trends'}</span>
            </button>

            {onOpenAskCraftWise && (
              <button
                type="button"
                id="ask-craftwise-voice-btn"
                onClick={() => onOpenAskCraftWise('Which product should I make more?')}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#C05D4D] hover:bg-[#A34E41] text-white text-xs font-bold rounded-xl shadow-sm transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Ask Voice Assistant</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Historical Trend Summary Comparison */}
      {trendAnalysis && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-[#E5E1DA] shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-[#F0EDEA] pb-4">
              <div className="flex items-center gap-2.5">
                <BarChart3 className="w-5 h-5 text-[#C05D4D]" />
                <h3 className="font-serif font-bold text-base sm:text-lg text-[#4A3728]">
                  Historical Sales Comparison
                </h3>
              </div>
              <span className="text-xs text-[#7C6E62] bg-[#F7F5F0] px-3 py-1 rounded-full font-medium">
                {trendAnalysis.recentOrdersVsEarlier.recentPeriodLabel} vs {trendAnalysis.recentOrdersVsEarlier.earlierPeriodLabel}
              </span>
            </div>

            {/* Historical Month-over-Month Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#F0EDEA] space-y-1">
                <span className="text-xs text-[#7C6E62] font-medium">Total Orders</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-serif font-bold text-[#4A3728]">
                    {trendAnalysis.thisMonthOrders}
                  </span>
                  <span className="text-xs text-[#7C6E62]">
                    vs {trendAnalysis.previousMonthOrders} last mo.
                  </span>
                </div>
                {trendAnalysis.ordersChangePct !== null ? (
                  <div className={`text-xs font-bold flex items-center gap-1 ${trendAnalysis.ordersChangePct >= 0 ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {trendAnalysis.ordersChangePct >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                    <span>{trendAnalysis.ordersChangePct > 0 ? `+${trendAnalysis.ordersChangePct}%` : `${trendAnalysis.ordersChangePct}%`}</span>
                  </div>
                ) : (
                  <span className="text-[11px] text-[#A89F91]">Baseline period</span>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#F0EDEA] space-y-1">
                <span className="text-xs text-[#7C6E62] font-medium">Units Sold</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-serif font-bold text-[#4A3728]">
                    {trendAnalysis.thisMonthUnits}
                  </span>
                  <span className="text-xs text-[#7C6E62]">
                    vs {trendAnalysis.previousMonthUnits} last mo.
                  </span>
                </div>
                {trendAnalysis.unitsChangePct !== null ? (
                  <div className={`text-xs font-bold flex items-center gap-1 ${trendAnalysis.unitsChangePct >= 0 ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {trendAnalysis.unitsChangePct >= 0 ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                    <span>{trendAnalysis.unitsChangePct > 0 ? `+${trendAnalysis.unitsChangePct}%` : `${trendAnalysis.unitsChangePct}%`}</span>
                  </div>
                ) : (
                  <span className="text-[11px] text-[#A89F91]">Baseline period</span>
                )}
              </div>

              <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#F0EDEA] space-y-1">
                <span className="text-xs text-[#7C6E62] font-medium">Revenue Earned</span>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-serif font-bold text-[#4A3728]">
                    ₹{trendAnalysis.thisMonthRevenue.toLocaleString('en-IN')}
                  </span>
                </div>
                <span className="text-xs text-[#7C6E62]">
                  vs ₹{trendAnalysis.previousMonthRevenue.toLocaleString('en-IN')} last mo.
                </span>
              </div>
            </div>

            {/* Honest Status Note */}
            <div className="p-3.5 rounded-2xl bg-[#FBF9F6] border border-[#EBE7DF] text-xs text-[#7C6E62] flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#C05D4D]"></span>
              <span>{trendAnalysis.message}</span>
            </div>

            {/* 6-Month Timeline Bars */}
            <div className="pt-2">
              <span className="text-xs font-bold text-[#7C6E62] block mb-3">6-Month Activity Timeline</span>
              <div className="grid grid-cols-6 gap-2">
                {trendAnalysis.monthlyTimeline.map((m) => {
                  const hasAct = m.orders > 0 || m.units > 0;
                  return (
                    <div key={m.monthKey} className="text-center space-y-1.5">
                      <div className="h-20 bg-[#F5F2EC] rounded-xl flex flex-col justify-end p-1.5 relative overflow-hidden">
                        {hasAct && (
                          <div
                            className="bg-[#C05D4D] rounded-lg transition-all w-full"
                            style={{ height: `${Math.min(100, Math.max(25, m.units * 30))}%` }}
                            title={`${m.orders} orders (${m.units} units)`}
                          />
                        )}
                      </div>
                      <span className="text-[11px] font-bold text-[#4A3728] block truncate">{m.monthLabel.split(' ')[0]}</span>
                      <span className="text-[10px] text-[#7C6E62] block font-medium">
                        {m.units} unit{m.units === 1 ? '' : 's'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Quick Production Highlight Card */}
          <div className="bg-gradient-to-br from-[#4A3728] to-[#2E2218] text-white rounded-3xl p-6 shadow-md flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-white text-[11px] font-semibold">
                <Lightbulb className="w-3.5 h-3.5 text-amber-300" />
                <span>Production Guidance</span>
              </div>
              <h3 className="font-serif font-bold text-xl text-white">
                What should you make next?
              </h3>
              <p className="text-xs text-white/80 leading-relaxed">
                {categories?.lowStockStrongSales && categories.lowStockStrongSales.length > 0
                  ? `Based on your recent sales, "${categories.lowStockStrongSales[0].title}" has active sales and only ${categories.lowStockStrongSales[0].stock} units left in stock. Consider producing more.`
                  : categories?.bestPerforming && categories.bestPerforming.length > 0
                  ? `"${categories.bestPerforming[0].title}" has the highest volume of completed orders. You have ${categories.bestPerforming[0].stock} units left.`
                  : 'Start listing crafts with clear photos to begin tracking real customer demand patterns.'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/70">Highest Sales Craft:</span>
                <span className="font-bold text-amber-300">
                  {categories?.bestPerforming[0]?.title || 'Awaiting orders'}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-white/70">Units Completed:</span>
                <span className="font-bold text-white">
                  {categories?.bestPerforming[0]?.unitsSold || 0} units
                </span>
              </div>
            </div>

            {onOpenAskCraftWise && (
              <button
                type="button"
                onClick={() => onOpenAskCraftWise('Which product is selling the most?')}
                className="w-full py-3 px-4 bg-white text-[#4A3728] hover:bg-[#F7F5F0] font-bold text-xs rounded-xl text-center transition-colors cursor-pointer shadow-sm"
              >
                Ask Voice Assistant: "Which product is selling most?"
              </button>
            )}
          </div>
        </div>
      )}

      {/* Grounded AI Business Insights & Practical Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Business Insights */}
        <div className="bg-white rounded-3xl p-6 border border-[#E5E1DA] shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-[#F0EDEA]">
            <Sparkles className="w-5 h-5 text-[#C05D4D]" />
            <h3 className="font-serif font-bold text-lg text-[#4A3728]">
              AI Demand Observations
            </h3>
          </div>

          <div className="space-y-3">
            {aiInsights.length === 0 ? (
              <p className="text-sm text-[#7C6E62] italic">No demand observations recorded yet.</p>
            ) : (
              aiInsights.map((ins) => (
                <div
                  key={ins.id}
                  className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#F0EDEA] space-y-2.5 hover:border-[#C05D4D]/40 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-xs text-[#4A3728]">{ins.title}</span>
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-[#C05D4D]/10 text-[#C05D4D]">
                      {ins.badge}
                    </span>
                  </div>
                  <p className="text-xs text-[#5C4D41] leading-relaxed">{ins.description}</p>
                  {ins.factualDataPoints && ins.factualDataPoints.length > 0 && (
                    <div className="pt-1 flex flex-wrap gap-1.5">
                      {ins.factualDataPoints.map((dp, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] bg-white border border-[#E5E1DA] text-[#7C6E62] px-2 py-0.5 rounded-md font-medium"
                        >
                          ✓ {dp}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Practical Recommendations */}
        <div className="bg-white rounded-3xl p-6 border border-[#E5E1DA] shadow-sm space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-[#F0EDEA]">
            <Lightbulb className="w-5 h-5 text-amber-600" />
            <h3 className="font-serif font-bold text-lg text-[#4A3728]">
              Practical Action Recommendations
            </h3>
          </div>

          <div className="space-y-3">
            {recommendations.length === 0 ? (
              <p className="text-sm text-[#7C6E62] italic">No active recommendations at this time.</p>
            ) : (
              recommendations.map((rec) => (
                <div
                  key={rec.id}
                  className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#F0EDEA] space-y-2 hover:border-amber-400 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-xs text-[#4A3728]">{rec.title}</span>
                  </div>
                  <p className="text-xs text-[#5C4D41] leading-relaxed">{rec.suggestion}</p>
                  <p className="text-[11px] text-[#8C7E72] italic">{rec.rationale}</p>

                  <div className="pt-2 flex items-center justify-end">
                    <button
                      type="button"
                      onClick={() => handleRecommendationAction(rec)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#C05D4D] hover:text-[#A34E41] cursor-pointer"
                    >
                      <span>Take Action</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Product Demand Breakdown & Filter Tabs */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#E5E1DA] shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F0EDEA] pb-5">
          <div>
            <h3 className="font-serif font-bold text-lg sm:text-xl text-[#4A3728]">
              Product Demand & Inventory Status
            </h3>
            <p className="text-xs text-[#7C6E62] mt-0.5">
              Live status across your catalog with individual demand indicators.
            </p>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => setSelectedFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                selectedFilter === 'all'
                  ? 'bg-[#C05D4D] text-white'
                  : 'bg-[#FAF8F5] text-[#7C6E62] hover:bg-[#F0EDEA]'
              }`}
            >
              All Products ({products.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedFilter('bestPerforming')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                selectedFilter === 'bestPerforming'
                  ? 'bg-[#C05D4D] text-white'
                  : 'bg-[#FAF8F5] text-[#7C6E62] hover:bg-[#F0EDEA]'
              }`}
            >
              Best Performing ({categories?.bestPerforming.length || 0})
            </button>
            <button
              type="button"
              onClick={() => setSelectedFilter('increasingSales')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                selectedFilter === 'increasingSales'
                  ? 'bg-[#C05D4D] text-white'
                  : 'bg-[#FAF8F5] text-[#7C6E62] hover:bg-[#F0EDEA]'
              }`}
            >
              Increasing ({categories?.increasingSales.length || 0})
            </button>
            <button
              type="button"
              onClick={() => setSelectedFilter('lowStockStrongSales')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                selectedFilter === 'lowStockStrongSales'
                  ? 'bg-amber-600 text-white'
                  : 'bg-[#FAF8F5] text-[#7C6E62] hover:bg-[#F0EDEA]'
              }`}
            >
              Low Stock & High Sales ({categories?.lowStockStrongSales.length || 0})
            </button>
            <button
              type="button"
              onClick={() => setSelectedFilter('highInquiries')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                selectedFilter === 'highInquiries'
                  ? 'bg-[#C05D4D] text-white'
                  : 'bg-[#FAF8F5] text-[#7C6E62] hover:bg-[#F0EDEA]'
              }`}
            >
              Inquiries ({categories?.highInquiries.length || 0})
            </button>
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredList.length === 0 ? (
            <div className="col-span-full py-12 text-center text-[#7C6E62]">
              <p className="text-sm font-medium">No crafts match this filter criteria.</p>
            </div>
          ) : (
            filteredList.map((item) => (
              <div
                key={item.id}
                className="bg-[#FAF8F5] border border-[#F0EDEA] hover:border-[#C05D4D]/40 rounded-2xl p-4.5 flex flex-col justify-between space-y-4 transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-14 h-14 rounded-xl object-cover shrink-0 border border-[#E5E1DA]"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-[#E5E1DA] flex items-center justify-center text-[#7C6E62] shrink-0">
                        <Package className="w-6 h-6" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        {item.isBestPerforming && (
                          <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                            Best Seller
                          </span>
                        )}
                        {item.trend === 'increasing' && (
                          <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                            Trending Up
                          </span>
                        )}
                        {item.trend === 'decreasing' && (
                          <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                            Softening
                          </span>
                        )}
                      </div>
                      <h4 className="font-serif font-bold text-sm text-[#4A3728] truncate mt-1">
                        {item.title}
                      </h4>
                      <p className="text-xs text-[#7C6E62] font-semibold">
                        ₹{item.price.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>

                  {/* Stock and Sales Pill Bar */}
                  <div className="grid grid-cols-3 gap-2 text-center pt-1">
                    <div className="p-2 bg-white rounded-xl border border-[#EBE7DF]">
                      <span className="text-[10px] text-[#7C6E62] block">Stock</span>
                      <span
                        className={`text-xs font-bold block ${
                          item.stock <= 3 ? 'text-amber-700' : 'text-[#4A3728]'
                        }`}
                      >
                        {item.stock} left
                      </span>
                    </div>
                    <div className="p-2 bg-white rounded-xl border border-[#EBE7DF]">
                      <span className="text-[10px] text-[#7C6E62] block">Sold</span>
                      <span className="text-xs font-bold text-[#4A3728] block">
                        {item.unitsSold} units
                      </span>
                    </div>
                    <div className="p-2 bg-white rounded-xl border border-[#EBE7DF]">
                      <span className="text-[10px] text-[#7C6E62] block">Inquiries</span>
                      <span className="text-xs font-bold text-[#4A3728] block">
                        {item.buyerInquiries}
                      </span>
                    </div>
                  </div>

                  {/* Trend description */}
                  <div className="text-[11px] text-[#7C6E62] bg-white p-2.5 rounded-xl border border-[#EBE7DF]">
                    <span className="font-semibold text-[#4A3728]">Trend: </span>
                    <span>{item.trendLabel}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 border-t border-[#EBE7DF] flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => handleShareWhatsApp(item.title, item.price)}
                    className="inline-flex items-center gap-1.5 text-xs text-emerald-700 hover:text-emerald-800 font-bold cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>

                  {onOpenAskCraftWise && (
                    <button
                      type="button"
                      onClick={() =>
                        onOpenAskCraftWise(`Should I produce more ${item.title}?`)
                      }
                      className="inline-flex items-center gap-1 text-xs text-[#C05D4D] hover:text-[#A34E41] font-bold cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Advice</span>
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Market Linkage Opportunities Section */}
      {marketLinkage && (
        <div id="market-linkage-section" className="bg-[#FAF8F5] rounded-3xl p-6 sm:p-8 border border-[#E5E1DA] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C05D4D]/10 text-[#C05D4D] text-xs font-bold mb-2">
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Verified Procurement & Market Channels</span>
              </div>
              <h3 className="font-serif font-bold text-xl sm:text-2xl text-[#4A3728]">
                Expand Your Buyer Reach
              </h3>
              <p className="text-xs sm:text-sm text-[#7C6E62] max-w-2xl mt-1">
                {marketLinkage.message} Direct linkage to government procurement and official e-commerce platforms.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {marketLinkage.recommendedChannels.map((ch, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-5 border border-[#E5E1DA] shadow-sm flex flex-col justify-between space-y-4 hover:border-[#C05D4D]/50 transition-all"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full bg-[#C05D4D]/10 text-[#C05D4D]">
                      {ch.badge}
                    </span>
                    <span className="text-[10px] text-[#7C6E62] font-semibold">{ch.type}</span>
                  </div>
                  <h4 className="font-serif font-bold text-base text-[#4A3728]">{ch.name}</h4>
                  <p className="text-xs text-[#7C6E62] leading-relaxed">{ch.tagline}</p>
                </div>

                <div className="pt-3 border-t border-[#F0EDEA] flex items-center justify-between">
                  <span className="text-[11px] font-medium text-[#A89F91]">
                    {ch.suitability}
                  </span>
                  {ch.officialUrl && (
                    <a
                      href={ch.officialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-bold text-[#C05D4D] hover:text-[#A34E41]"
                    >
                      <span>Visit</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
