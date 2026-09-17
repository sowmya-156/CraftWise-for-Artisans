import React, { useState, useEffect, useMemo } from 'react';
import {
  TrendingUp,
  ShoppingBag,
  Clock,
  CheckCircle2,
  Package,
  Boxes,
  AlertTriangle,
  Trophy,
  ArrowRight,
  RefreshCw,
  Eye,
  IndianRupee,
  Calendar,
  Layers,
  ChevronRight,
  AlertCircle,
  Phone,
  BarChart3,
  Sparkles,
  Info
} from 'lucide-react';
import { api } from '../api';
import {
  Product,
  Order,
  OrderStatus,
  SalesAnalyticsData,
  MonthlySalesData,
  ProductPerformanceItem,
  RecentOrderItem
} from '../types';

interface SalesEarningsDashboardProps {
  artisanId?: string;
  artisanName?: string;
  onNavigate: (page: string, params?: any) => void;
  // Fallback / initial products & orders passed from parent for instant rendering
  initialProducts?: Product[];
  initialOrders?: Order[];
  onRefreshParent?: () => void;
}

export const SalesEarningsDashboard: React.FC<SalesEarningsDashboardProps> = ({
  artisanId,
  artisanName,
  onNavigate,
  initialProducts = [],
  initialOrders = [],
  onRefreshParent
}) => {
  const [analytics, setAnalytics] = useState<SalesAnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeOrderFilter, setActiveOrderFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [hoveredMonth, setHoveredMonth] = useState<MonthlySalesData | null>(null);

  // Compute live values dynamically from props if API response is loading or in offline mode
  const localComputedAnalytics = useMemo<SalesAnalyticsData>(() => {
    const validOrders = initialOrders.filter(
      (o) => o.status !== 'cancelled' && o.status !== 'rejected'
    );
    const pendingOrders = initialOrders.filter((o) =>
      ['placed', 'accepted', 'preparing', 'shipped', 'out_for_delivery'].includes(o.status)
    );
    const completedOrders = initialOrders.filter((o) => o.status === 'delivered');

    const totalEarnings = validOrders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
    const totalOrders = initialOrders.length;
    const pendingOrdersCount = pendingOrders.length;
    const completedOrdersCount = completedOrders.length;
    const productsSold = validOrders.reduce((sum, o) => sum + (Number(o.quantity) || 1), 0);
    const averageSellingPrice =
      productsSold > 0
        ? Math.round(totalEarnings / productsSold)
        : totalOrders > 0
        ? Math.round(totalEarnings / totalOrders)
        : 0;

    // Past 6 calendar months
    const now = new Date();
    const monthlySales: MonthlySalesData[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const y = d.getFullYear();
      const m = d.getMonth();
      const monthKey = `${y}-${String(m + 1).padStart(2, '0')}`;
      const shortMonth = d.toLocaleString('en-IN', { month: 'short' });
      const monthLabel = d.toLocaleString('en-IN', { month: 'short', year: 'numeric' });

      const ordersInMonth = validOrders.filter((o) => {
        if (!o.createdAt) return false;
        const od = new Date(o.createdAt);
        return od.getFullYear() === y && od.getMonth() === m;
      });

      const earnings = ordersInMonth.reduce((s, o) => s + (Number(o.totalAmount) || 0), 0);
      const orderCount = ordersInMonth.length;
      const unitsSold = ordersInMonth.reduce((s, o) => s + (Number(o.quantity) || 1), 0);

      monthlySales.push({
        monthKey,
        monthLabel,
        shortMonth,
        earnings,
        orderCount,
        unitsSold
      });
    }

    // Product performance
    const productPerformance: ProductPerformanceItem[] = initialProducts.map((p) => {
      const productOrders = validOrders.filter((o) => o.productId === p.id);
      const unitsSold = productOrders.reduce((s, o) => s + (Number(o.quantity) || 1), 0);
      const revenue = productOrders.reduce((s, o) => s + (Number(o.totalAmount) || 0), 0);
      const isLowStock = p.stock <= 3 || p.status === 'low_stock';

      return {
        id: p.id,
        title: p.title,
        craftCategory: p.craftCategory,
        image:
          p.preferredImage === 'enhanced' && p.enhancedImage ? p.enhancedImage : p.primaryImage,
        price: p.price,
        stock: p.stock,
        status: p.status,
        isLowStock,
        unitsSold,
        revenue,
        isBestSeller: false
      };
    });

    if (productPerformance.length > 0) {
      let maxP = productPerformance[0];
      for (const prod of productPerformance) {
        if (
          prod.unitsSold > maxP.unitsSold ||
          (prod.unitsSold === maxP.unitsSold && prod.revenue > maxP.revenue)
        ) {
          maxP = prod;
        }
      }
      if (maxP.unitsSold > 0 || maxP.revenue > 0) {
        maxP.isBestSeller = true;
      }
    }

    productPerformance.sort((a, b) => b.unitsSold - a.unitsSold || b.revenue - a.revenue);

    const recentOrders: RecentOrderItem[] = [...initialOrders]
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
      .slice(0, 10)
      .map((o) => ({
        id: o.id,
        orderNumber: o.orderNumber,
        productId: o.productId,
        productTitle: o.productTitle,
        productImage: o.productImage,
        buyerName: o.buyerName,
        buyerMobile: o.buyerMobile,
        quantity: o.quantity || 1,
        totalAmount: o.totalAmount,
        unitPrice: o.unitPrice,
        status: o.status,
        orderDate: o.createdAt
          ? new Date(o.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            })
          : 'Recent',
        createdAt: o.createdAt
      }));

    return {
      overview: {
        totalEarnings,
        totalOrders,
        pendingOrders: pendingOrdersCount,
        completedOrders: completedOrdersCount,
        productsSold,
        averageSellingPrice
      },
      monthlySales,
      productPerformance,
      recentOrders
    };
  }, [initialProducts, initialOrders]);

  const loadAnalytics = async (silent = false) => {
    if (!silent) setRefreshing(true);
    try {
      const res = await api.getSalesAnalytics();
      if (res?.analytics) {
        setAnalytics(res.analytics);
      } else {
        setAnalytics(localComputedAnalytics);
      }
      setError(null);
    } catch (err: any) {
      // Fallback seamlessly to local computation without throwing a blocker
      console.warn('Could not fetch server analytics, using dynamic local data:', err);
      setAnalytics(localComputedAnalytics);
    } finally {
      setLoading(false);
      if (!silent) setRefreshing(false);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, [artisanId]);

  // When props change (e.g. parent refreshed products or orders), refresh analytics
  useEffect(() => {
    if (initialProducts.length > 0 || initialOrders.length > 0) {
      setAnalytics(localComputedAnalytics);
    }
  }, [localComputedAnalytics]);

  const currentData = analytics || localComputedAnalytics;
  const overview = currentData.overview;
  const monthlySales = currentData.monthlySales;
  const productPerformance = currentData.productPerformance;
  const recentOrders = currentData.recentOrders;

  // Actual maximum monthly earnings
  const actualMaxEarnings = useMemo(() => {
    return Math.max(...monthlySales.map((m) => m.earnings), 0);
  }, [monthlySales]);

  // Maximum monthly earnings for chart scaling
  const maxEarnings = useMemo(() => {
    return actualMaxEarnings > 0 ? actualMaxEarnings : 1000;
  }, [actualMaxEarnings]);

  // Filtered recent orders
  const filteredOrders = useMemo(() => {
    if (activeOrderFilter === 'pending') {
      return recentOrders.filter((o) =>
        ['placed', 'accepted', 'preparing', 'shipped', 'out_for_delivery'].includes(o.status)
      );
    }
    if (activeOrderFilter === 'completed') {
      return recentOrders.filter((o) => o.status === 'delivered');
    }
    return recentOrders;
  }, [recentOrders, activeOrderFilter]);

  // Best selling product
  const bestSeller = useMemo(() => {
    return productPerformance.find((p) => p.isBestSeller && (p.unitsSold > 0 || p.revenue > 0));
  }, [productPerformance]);

  // Low stock products count
  const lowStockCount = useMemo(() => {
    return productPerformance.filter((p) => p.isLowStock).length;
  }, [productPerformance]);

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'placed':
        return (
          <span className="bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide">
            Placed
          </span>
        );
      case 'accepted':
        return (
          <span className="bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide">
            Accepted
          </span>
        );
      case 'preparing':
        return (
          <span className="bg-purple-100 text-purple-800 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide">
            Preparing Craft
          </span>
        );
      case 'shipped':
        return (
          <span className="bg-indigo-100 text-indigo-800 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide">
            Dispatched
          </span>
        );
      case 'out_for_delivery':
        return (
          <span className="bg-teal-100 text-teal-800 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide">
            Out for Delivery
          </span>
        );
      case 'delivered':
        return (
          <span className="bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide">
            ✓ Delivered
          </span>
        );
      case 'rejected':
        return (
          <span className="bg-rose-100 text-rose-800 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide">
            Declined
          </span>
        );
      case 'cancelled':
        return (
          <span className="bg-gray-100 text-gray-700 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide">
            Cancelled
          </span>
        );
      default:
        return (
          <span className="bg-gray-100 text-gray-700 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wide">
            {status}
          </span>
        );
    }
  };

  if (loading && !analytics && initialProducts.length === 0 && initialOrders.length === 0) {
    return (
      <div className="bg-white rounded-3xl border border-[#E5E1DA] p-12 text-center shadow-xs">
        <RefreshCw className="w-8 h-8 text-[#C05D4D] animate-spin mx-auto mb-4" />
        <h3 className="text-lg font-bold text-[#4A3728]">Loading Sales & Earnings Data...</h3>
        <p className="text-sm text-[#7C6E62] mt-1">
          Calculating your revenue, orders, and stock analytics dynamically.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8" id="sales-earnings-dashboard-section">
      {/* Dashboard Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E5E1DA]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#C05D4D]"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-[#C05D4D]">
              Direct Artisan Revenue • 0% Platform Commission
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#4A3728] mt-1">
            Sales & Earnings Dashboard
          </h2>
          <p className="text-xs sm:text-sm text-[#7C6E62] mt-0.5">
            Live business performance, dynamic revenue calculations, and stock control.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => {
              loadAnalytics();
              if (onRefreshParent) onRefreshParent();
            }}
            disabled={refreshing}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-[#FDFBF7] text-[#4A3728] border border-[#E5E1DA] text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors disabled:opacity-60"
            title="Refresh sales data"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#C05D4D] ${refreshing ? 'animate-spin' : ''}`} />
            <span>{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('artisan-orders')}
            className="px-4 py-2 rounded-xl bg-[#C05D4D] hover:bg-[#A34E41] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Fulfill Orders ({overview.pendingOrders})</span>
          </button>
        </div>
      </div>

      {/* Error / Notice message if any */}
      {error && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 px-4 py-3 rounded-2xl flex items-center justify-between text-xs">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => loadAnalytics()}
            className="font-bold underline text-amber-900"
          >
            Retry
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 1. OVERVIEW CARDS                                                         */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Total Earnings */}
        <div className="bg-white p-5 rounded-2xl border-2 border-[#C05D4D]/25 hover:border-[#C05D4D] shadow-xs transition-all relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#7C6E62]">
              Total Earnings
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#C05D4D]/10 text-[#C05D4D] flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-[#C05D4D] tracking-tight">
            ₹{overview.totalEarnings.toLocaleString('en-IN')}
          </p>
          <p className="text-[11px] text-[#7C6E62] mt-1.5 flex items-center gap-1">
            <span>Direct to your UPI / Cash</span>
          </p>
          <div className="absolute -bottom-1 -right-1 w-12 h-12 bg-[#C05D4D]/5 rounded-full -mr-2 -mb-2 pointer-events-none group-hover:scale-150 transition-transform"></div>
        </div>

        {/* Card 2: Total Orders */}
        <div className="bg-white p-5 rounded-2xl border border-[#E5E1DA] shadow-xs transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#7C6E62]">
              Total Orders
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-[#4A3728]">
            {overview.totalOrders}
          </p>
          <p className="text-[11px] text-[#7C6E62] mt-1.5">
            Customer inquiries & orders
          </p>
        </div>

        {/* Card 3: Pending Orders */}
        <div
          onClick={() => onNavigate('artisan-orders')}
          className="bg-white p-5 rounded-2xl border border-[#E5E1DA] hover:border-amber-400 shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#7C6E62]">
              Pending Orders
            </span>
            <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <p className="text-2xl sm:text-3xl font-bold text-orange-600">
              {overview.pendingOrders}
            </p>
            {overview.pendingOrders > 0 && (
              <span className="text-[10px] bg-orange-100 text-orange-800 px-2 py-0.5 rounded-full font-bold">
                Action Needed
              </span>
            )}
          </div>
          <p className="text-[11px] text-[#7C6E62] mt-1.5 flex items-center gap-1 group-hover:text-[#C05D4D] transition-colors">
            <span>Requires preparation/shipping</span>
            <ArrowRight className="w-3 h-3" />
          </p>
        </div>

        {/* Card 4: Completed Orders */}
        <div className="bg-white p-5 rounded-2xl border border-[#E5E1DA] shadow-xs transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#7C6E62]">
              Completed Orders
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-emerald-700">
            {overview.completedOrders}
          </p>
          <p className="text-[11px] text-[#7C6E62] mt-1.5">
            Delivered successfully
          </p>
        </div>

        {/* Card 5: Products Sold */}
        <div className="bg-white p-5 rounded-2xl border border-[#E5E1DA] shadow-xs transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#7C6E62]">
              Products Sold
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <p className="text-2xl sm:text-3xl font-bold text-[#4A3728]">
              {overview.productsSold}
            </p>
            <span className="text-xs font-bold text-[#7C6E62]">units</span>
          </div>
          <p className="text-[11px] text-[#7C6E62] mt-1.5">
            Handmade craft units shipped
          </p>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. SALES ANALYTICS (MONTHLY CHART + ASP + METRIC INSIGHTS)                */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 8 Cols: Monthly Earnings & Orders Responsive Chart */}
        <div className="lg:col-span-8 bg-white rounded-3xl border border-[#E5E1DA] p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-[#F0EDEA]">
              <div>
                <h3 className="font-bold text-[#4A3728] text-base sm:text-lg flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-[#C05D4D]" />
                  <span>Monthly Earnings & Orders</span>
                </h3>
                <p className="text-xs text-[#7C6E62] mt-0.5">
                  Visual breakdown of earnings (₹) and completed customer requests over the last 6 months.
                </p>
              </div>

              {/* Peak Month Indicator */}
              <div className="bg-[#FDFBF7] border border-[#E5E1DA] px-3 py-1.5 rounded-xl text-xs flex items-center gap-2 self-start sm:self-auto">
                <span className="w-2 h-2 rounded-full bg-[#C05D4D]"></span>
                <span className="text-[#7C6E62] font-medium">Max Month:</span>
                <span className="font-bold text-[#4A3728]">₹{actualMaxEarnings.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Interactive Tooltip / Detail Banner when bar is hovered or tapped */}
            <div className="h-10 my-3 flex items-center justify-between px-3 bg-[#FAF9F6] rounded-xl border border-[#F0EDEA] text-xs transition-all">
              {hoveredMonth ? (
                <>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-[#4A3728]">{hoveredMonth.monthLabel}:</span>
                    <span className="font-bold text-[#C05D4D]">₹{hoveredMonth.earnings.toLocaleString('en-IN')}</span>
                    <span className="text-[#7C6E62]">• {hoveredMonth.orderCount} orders</span>
                    <span className="text-[#7C6E62]">• {hoveredMonth.unitsSold} units</span>
                  </div>
                  <span className="text-[11px] text-[#7C6E62] italic">
                    {hoveredMonth.orderCount > 0 ? 'Verified orders' : 'No sales in this month'}
                  </span>
                </>
              ) : (
                <div className="text-[#7C6E62] text-[11px] flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-[#C05D4D]" />
                  <span>Hover or tap any month bar below to view details</span>
                </div>
              )}
            </div>

            {/* Responsive Chart Container */}
            <div className="pt-4 pb-2">
              <div className="grid grid-cols-6 gap-2 sm:gap-4 items-end h-56 sm:h-64 px-2">
                {monthlySales.map((month) => {
                  const hasSales = month.earnings > 0;
                  const heightPercent = hasSales
                    ? Math.max(16, Math.round((month.earnings / maxEarnings) * 100))
                    : 8;

                  const isHovered = hoveredMonth?.monthKey === month.monthKey;

                  return (
                    <div
                      key={month.monthKey}
                      onMouseEnter={() => setHoveredMonth(month)}
                      onMouseLeave={() => setHoveredMonth(null)}
                      onClick={() => setHoveredMonth(month)}
                      className="flex flex-col items-center h-full justify-end group cursor-pointer"
                    >
                      {/* Amount Label on top of bar */}
                      <div className="text-[10px] sm:text-xs font-bold text-[#4A3728] mb-1.5 truncate max-w-full text-center">
                        {hasSales ? `₹${month.earnings.toLocaleString('en-IN')}` : '₹0'}
                      </div>

                      {/* Bar Column */}
                      <div className="w-full max-w-[48px] bg-[#F4F1ED] rounded-xl flex items-end overflow-hidden p-1 transition-all h-full">
                        <div
                          style={{ height: `${heightPercent}%` }}
                          className={`w-full rounded-lg transition-all duration-500 ease-out ${
                            hasSales
                              ? isHovered
                                ? 'bg-[#923E32] shadow-md'
                                : 'bg-gradient-to-t from-[#C05D4D] to-[#E07A5F]'
                              : 'bg-[#E5E1DA] border border-dashed border-[#C4BDB5]'
                          }`}
                        ></div>
                      </div>

                      {/* Month Label below */}
                      <div className="mt-2 text-center">
                        <span
                          className={`text-xs font-bold ${
                            isHovered ? 'text-[#C05D4D]' : 'text-[#4A3728]'
                          }`}
                        >
                          {month.shortMonth}
                        </span>
                      </div>

                      {/* Order Count Pill */}
                      <div className="mt-1">
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full transition-colors ${
                            month.orderCount > 0
                              ? 'bg-amber-100 text-amber-900 font-bold'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {month.orderCount} {month.orderCount === 1 ? 'ord' : 'ords'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Chart Footer Note */}
          <div className="pt-4 mt-4 border-t border-[#F0EDEA] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-[#7C6E62]">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>All metrics calculated dynamically from confirmed orders.</span>
            </div>
            <span className="text-[11px] italic">Zero platform commission taken</span>
          </div>
        </div>

        {/* Right 4 Cols: Average Selling Price & Insights */}
        <div className="lg:col-span-4 space-y-4 flex flex-col justify-between">
          {/* Average Selling Price (ASP) Card */}
          <div className="bg-[#FAF9F6] rounded-3xl border-2 border-[#C05D4D]/25 p-6 shadow-xs relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#C05D4D]">
                Key Efficiency Metric
              </span>
              <div className="w-8 h-8 rounded-full bg-[#C05D4D]/10 text-[#C05D4D] flex items-center justify-center font-bold text-sm">
                ₹
              </div>
            </div>

            <h4 className="text-sm font-bold text-[#4A3728]">Average Selling Price (ASP)</h4>
            <div className="flex items-baseline gap-1.5 my-2">
              <p className="text-3xl sm:text-4xl font-serif font-bold text-[#4A3728]">
                ₹{overview.averageSellingPrice.toLocaleString('en-IN')}
              </p>
              <span className="text-xs font-bold text-[#7C6E62]">/ unit</span>
            </div>

            <p className="text-xs text-[#7C6E62] leading-relaxed">
              Dynamically computed as{' '}
              <span className="font-semibold text-[#4A3728]">Total Earnings (₹{overview.totalEarnings})</span> divided
              by{' '}
              <span className="font-semibold text-[#4A3728]">Units Sold ({overview.productsSold || 1})</span>. Reflects
              the average price buyers pay per craft.
            </p>

            <div className="mt-4 pt-3 border-t border-[#E5E1DA] text-[11px] text-[#7C6E62] flex items-center justify-between">
              <span>Fair Wage Benchmark:</span>
              <span className="font-bold text-emerald-700">✓ Healthy Return</span>
            </div>
          </div>

          {/* Low Stock Alert Quick Card */}
          <div className="bg-white rounded-3xl border border-[#E5E1DA] p-6 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-sm text-[#4A3728] flex items-center gap-1.5">
                <Boxes className="w-4 h-4 text-[#C05D4D]" />
                <span>Inventory & Stock Health</span>
              </h4>
              {lowStockCount > 0 ? (
                <span className="text-xs font-bold bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full">
                  {lowStockCount} Low
                </span>
              ) : (
                <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                  Healthy
                </span>
              )}
            </div>

            <p className="text-xs text-[#7C6E62] leading-relaxed">
              {lowStockCount > 0
                ? `You have ${lowStockCount} item(s) running low on stock (≤ 3 pieces). Restock soon to avoid missing incoming orders.`
                : 'All listed items have sufficient stock. You are ready to fulfill incoming orders smoothly.'}
            </p>

            <button
              type="button"
              onClick={() => onNavigate('inventory')}
              className="w-full py-2 bg-[#FDFBF7] hover:bg-[#F4F1ED] border border-[#E5E1DA] rounded-xl text-xs font-bold text-[#4A3728] flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>Manage Stock & Quantity</span>
              <ArrowRight className="w-3.5 h-3.5 text-[#C05D4D]" />
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. PRODUCT PERFORMANCE (BEST SELLER + UNITS SOLD + REVENUE + LOW STOCK)   */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-lg font-bold text-[#4A3728] flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              <span>Product Performance & Stock Analysis</span>
            </h3>
            <p className="text-xs text-[#7C6E62]">
              Track which handcrafted pieces drive your sales and monitor live stock quantities.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('add-product')}
            className="px-3.5 py-1.5 rounded-xl bg-[#FDFBF7] hover:bg-[#F4F1ED] border border-[#E5E1DA] text-xs font-bold text-[#C05D4D] flex items-center gap-1.5 self-start sm:self-auto transition-colors"
          >
            <span>+ Add New Creation</span>
          </button>
        </div>

        {/* Highlight Banner for Best-Selling Product (if exists) */}
        {bestSeller && (
          <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-[#FAF9F6] border-2 border-amber-300/80 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-2xl overflow-hidden border-2 border-amber-300 shrink-0 shadow-xs">
                <img
                  src={bestSeller.image}
                  alt={bestSeller.title}
                  className="w-full h-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-amber-400 text-amber-950 text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                    <Trophy className="w-3 h-3" /> #1 Best-Selling Craft
                  </span>
                  <span className="text-[10px] uppercase font-bold text-[#7C6E62]">
                    {bestSeller.craftCategory || 'Heritage Craft'}
                  </span>
                </div>
                <h4 className="text-base sm:text-lg font-bold text-[#4A3728] line-clamp-1">
                  {bestSeller.title}
                </h4>
                <div className="flex flex-wrap items-center gap-3 text-xs text-[#7C6E62] mt-1">
                  <span className="font-bold text-[#C05D4D] text-sm">₹{bestSeller.price}</span>
                  <span>• <strong>{bestSeller.unitsSold}</strong> units sold</span>
                  <span>• <strong>₹{bestSeller.revenue.toLocaleString('en-IN')}</strong> total revenue</span>
                  <span>• <strong>{bestSeller.stock}</strong> in stock</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onNavigate('product-detail', { id: bestSeller.id })}
              className="px-4 py-2 bg-white hover:bg-amber-100 text-[#4A3728] border border-amber-300 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors shrink-0 self-end sm:self-auto"
            >
              <Eye className="w-3.5 h-3.5 text-[#C05D4D]" />
              <span>View Product Details</span>
            </button>
          </div>
        )}

        {/* Product Performance Table / Cards */}
        {productPerformance.length === 0 ? (
          <div className="bg-white rounded-3xl border border-[#E5E1DA] p-10 text-center shadow-xs">
            <Package className="w-12 h-12 text-[#7C6E62] mx-auto mb-2 opacity-50" />
            <h4 className="font-bold text-[#4A3728]">No Products Created Yet</h4>
            <p className="text-xs text-[#7C6E62] max-w-sm mx-auto mt-1 mb-4">
              Use the "One Photo. One Voice" catalog generator to upload your craft photo and generate your first selling kit.
            </p>
            <button
              type="button"
              onClick={() => onNavigate('add-product')}
              className="px-5 py-2.5 bg-[#C05D4D] text-white rounded-xl text-xs font-bold shadow-xs hover:bg-[#A34E41]"
            >
              + Create First Product
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-[#E5E1DA] overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E5E1DA] bg-[#FDFBF7] text-[11px] uppercase tracking-wider text-[#7C6E62] font-bold">
                    <th className="py-3.5 px-4 sm:px-6">Product & Craft</th>
                    <th className="py-3.5 px-4">Price</th>
                    <th className="py-3.5 px-4">Units Sold</th>
                    <th className="py-3.5 px-4">Revenue</th>
                    <th className="py-3.5 px-4">Stock Status</th>
                    <th className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F0EDEA] text-sm">
                  {productPerformance.map((p) => (
                    <tr key={p.id} className="hover:bg-[#FAF9F6] transition-colors">
                      {/* Product details */}
                      <td className="py-3.5 px-4 sm:px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-[#E5E1DA] overflow-hidden shrink-0 border border-[#E5E1DA]">
                            <img
                              src={p.image}
                              alt={p.title}
                              className="w-full h-full object-contain"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              {p.isBestSeller && (
                                <span className="bg-amber-100 text-amber-900 text-[10px] font-bold px-1.5 py-0.2 rounded">
                                  ★ Best Seller
                                </span>
                              )}
                              <span className="text-[10px] uppercase font-bold text-[#7C6E62]">
                                {p.craftCategory || 'Craft'}
                              </span>
                            </div>
                            <h4 className="font-bold text-[#4A3728] text-xs sm:text-sm line-clamp-1">
                              {p.title}
                            </h4>
                          </div>
                        </div>
                      </td>

                      {/* Price */}
                      <td className="py-3.5 px-4 font-bold text-[#C05D4D] whitespace-nowrap">
                        ₹{p.price}
                      </td>

                      {/* Units Sold */}
                      <td className="py-3.5 px-4 font-semibold text-[#4A3728] whitespace-nowrap">
                        {p.unitsSold} units
                      </td>

                      {/* Revenue */}
                      <td className="py-3.5 px-4 font-bold text-[#4A3728] whitespace-nowrap">
                        ₹{p.revenue.toLocaleString('en-IN')}
                      </td>

                      {/* Stock with LOW STOCK HIGHLIGHT */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {p.stock === 0 ? (
                          <span className="inline-flex items-center gap-1 bg-rose-100 text-rose-800 text-xs font-bold px-2.5 py-1 rounded-full">
                            <AlertTriangle className="w-3 h-3 text-rose-600" />
                            Out of Stock (0)
                          </span>
                        ) : p.isLowStock ? (
                          <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 text-xs font-bold px-2.5 py-1 rounded-full border border-amber-300">
                            <AlertTriangle className="w-3 h-3 text-amber-700 animate-pulse" />
                            Low Stock: {p.stock} left
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 text-xs font-medium px-2.5 py-1 rounded-full">
                            ✓ {p.stock} in stock
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => onNavigate('product-detail', { id: p.id })}
                          className="px-3 py-1.5 rounded-lg border border-[#E5E1DA] text-xs font-bold text-[#4A3728] hover:bg-white hover:border-[#C05D4D55] transition-colors"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 4. RECENT ORDERS (NAME, BUYER, AMOUNT, ORDER DATE, STATUS)                */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl border border-[#E5E1DA] p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F0EDEA]">
          <div>
            <h3 className="font-bold text-[#4A3728] text-base sm:text-lg flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#C05D4D]" />
              <span>Recent Customer Orders</span>
            </h3>
            <p className="text-xs text-[#7C6E62]">
              Real customer orders for your crafts, including direct phone contact and delivery status.
            </p>
          </div>

          {/* Order Status Filters */}
          <div className="flex items-center gap-1.5 bg-[#FAF9F6] p-1 rounded-xl border border-[#E5E1DA] self-start sm:self-auto text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveOrderFilter('all')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                activeOrderFilter === 'all'
                  ? 'bg-white text-[#C05D4D] font-bold shadow-xs'
                  : 'text-[#7C6E62] hover:text-[#4A3728]'
              }`}
            >
              All ({recentOrders.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveOrderFilter('pending')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                activeOrderFilter === 'pending'
                  ? 'bg-white text-orange-600 font-bold shadow-xs'
                  : 'text-[#7C6E62] hover:text-[#4A3728]'
              }`}
            >
              Pending ({overview.pendingOrders})
            </button>
            <button
              type="button"
              onClick={() => setActiveOrderFilter('completed')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                activeOrderFilter === 'completed'
                  ? 'bg-white text-emerald-700 font-bold shadow-xs'
                  : 'text-[#7C6E62] hover:text-[#4A3728]'
              }`}
            >
              Delivered ({overview.completedOrders})
            </button>
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="p-8 text-center bg-[#FAF9F6] rounded-2xl border border-dashed border-[#E5E1DA]">
            <ShoppingBag className="w-10 h-10 text-[#7C6E62] mx-auto mb-2 opacity-50" />
            <h4 className="font-bold text-sm text-[#4A3728]">No Orders in This View</h4>
            <p className="text-xs text-[#7C6E62] mt-0.5">
              {activeOrderFilter === 'pending'
                ? 'Great job! You have fulfilled all current pending orders.'
                : 'Share your product links or QR flyer on WhatsApp to receive direct customer orders.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#F0EDEA]">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#FAF9F6] -mx-2 px-3 rounded-2xl transition-colors"
              >
                {/* Left: Product & Order Number */}
                <div className="flex items-center gap-3.5">
                  <div className="w-14 h-14 rounded-xl bg-[#E5E1DA] overflow-hidden shrink-0 border border-[#E5E1DA]">
                    {order.productImage ? (
                      <img
                        src={order.productImage}
                        alt={order.productTitle}
                        className="w-full h-full object-contain"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#7C6E62]">
                        <Package className="w-6 h-6 opacity-40" />
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#C05D4D]">
                        {order.orderNumber}
                      </span>
                      <span className="text-[11px] text-[#7C6E62]">
                        • {order.orderDate}
                      </span>
                    </div>
                    <h4 className="font-bold text-[#4A3728] text-sm mt-0.5 line-clamp-1">
                      {order.productTitle}
                    </h4>
                    <div className="text-xs text-[#7C6E62] mt-0.5 flex items-center gap-2">
                      <span>Buyer: <strong className="text-[#4A3728]">{order.buyerName}</strong></span>
                      {order.buyerMobile && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-[#7C6E62]" />
                          {order.buyerMobile}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Amount, Status & Actions */}
                <div className="flex items-center justify-between md:justify-end gap-4 shrink-0">
                  <div className="text-left md:text-right">
                    <div className="text-base font-bold text-[#C05D4D]">
                      ₹{order.totalAmount.toLocaleString('en-IN')}
                    </div>
                    <div className="text-[11px] text-[#7C6E62]">
                      {order.quantity} {order.quantity === 1 ? 'unit' : 'units'} @ ₹{order.unitPrice}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {getStatusBadge(order.status)}

                    <button
                      type="button"
                      onClick={() => onNavigate('artisan-orders')}
                      className="px-3 py-1.5 rounded-lg bg-[#FAF9F6] hover:bg-[#FDFBF7] text-[#4A3728] border border-[#E5E1DA] text-xs font-bold flex items-center gap-1 transition-colors"
                      title="Update fulfillment stage and tracking"
                    >
                      <span>Manage</span>
                      <ArrowRight className="w-3 h-3 text-[#C05D4D]" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* View All Orders Button */}
        {recentOrders.length > 0 && (
          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={() => onNavigate('artisan-orders')}
              className="text-xs font-bold text-[#C05D4D] hover:underline inline-flex items-center gap-1"
            >
              <span>Go to Full Order Fulfillment & Courier Tracking ({overview.totalOrders} total)</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
export default SalesEarningsDashboard;
