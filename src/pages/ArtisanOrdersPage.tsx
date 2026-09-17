import React, { useState, useEffect } from 'react';
import {
  Package,
  CheckCircle2,
  XCircle,
  Truck,
  MapPin,
  Clock,
  Calendar,
  Phone,
  MessageSquare,
  MessageCircle,
  AlertCircle,
  Sparkles,
  Search,
  ArrowLeft,
  RefreshCw,
  Copy,
  Check,
  ShieldCheck,
  Send,
  ExternalLink
} from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { api, authState } from '../api';

export type ArtisanOrderTab = 'new' | 'accepted' | 'preparing' | 'shipped' | 'delivered' | 'cancelled' | 'all';

interface ArtisanOrdersPageProps {
  onNavigate: (page: string, params?: any) => void;
  onOpenChat?: (params?: { productId?: string; conversationId?: string; buyerId?: string; buyerName?: string; buyerMobile?: string }) => void;
  isEmbedded?: boolean;
}

export const ArtisanOrdersPage: React.FC<ArtisanOrdersPageProps> = ({
  onNavigate,
  onOpenChat,
  isEmbedded = false
}) => {
  const currentUser = authState.getUser();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [activeTab, setActiveTab] = useState<ArtisanOrderTab>('new');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal State for Status Actions
  const [activeActionModal, setActiveActionModal] = useState<{
    order: Order;
    action: 'accept' | 'reject' | 'prepare' | 'ship' | 'out_for_delivery' | 'deliver' | 'cancel';
  } | null>(null);

  const [actionNote, setActionNote] = useState<string>('');
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState<string>('');
  const [estimatedTimeOfArrival, setEstimatedTimeOfArrival] = useState<string>('4 - 6 business days');
  const [rejectionReason, setRejectionReason] = useState<string>('Out of raw materials currently');
  const [trackingPartner, setTrackingPartner] = useState<string>('India Post Speed Post');
  const [trackingNumber, setTrackingNumber] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  const fetchArtisanOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getOrders({
        role: 'artisan',
        mobile: currentUser?.mobile
      });
      setOrders(res.orders || []);
    } catch (err: any) {
      console.error('Failed to load artisan orders:', err);
      setError(err.message || 'Failed to retrieve orders.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArtisanOrders();
  }, []);

  const handleOpenAction = (
    order: Order,
    action: 'accept' | 'reject' | 'prepare' | 'ship' | 'out_for_delivery' | 'deliver' | 'cancel'
  ) => {
    setActiveActionModal({ order, action });
    setActionNote('');

    // Default expected delivery date: 5 days from today in readable format
    const defaultDate = new Date(Date.now() + 86400000 * 5).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
    setExpectedDeliveryDate(order.expectedDeliveryDate || defaultDate);
    setEstimatedTimeOfArrival(order.estimatedTimeOfArrival || '4 - 6 business days');

    if (action === 'ship') {
      setTrackingPartner('India Post Speed Post');
      setTrackingNumber(order.trackingNumber || `IP-CW-${Math.floor(100000 + Math.random() * 900000)}`);
    }
  };

  const handleConfirmAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeActionModal) return;

    const { order, action } = activeActionModal;

    let targetStatus: OrderStatus = 'accepted';
    if (action === 'accept') targetStatus = 'accepted';
    if (action === 'reject') targetStatus = 'rejected';
    if (action === 'cancel') targetStatus = 'cancelled';
    if (action === 'prepare') targetStatus = 'preparing';
    if (action === 'ship') targetStatus = 'shipped';
    if (action === 'out_for_delivery') targetStatus = 'out_for_delivery';
    if (action === 'deliver') targetStatus = 'delivered';

    try {
      setIsUpdating(true);
      await api.updateOrderStatus(order.id, {
        status: targetStatus,
        note: actionNote.trim() || undefined,
        rejectionReason: action === 'reject' || action === 'cancel' ? rejectionReason : undefined,
        trackingPartner: action === 'ship' ? trackingPartner : undefined,
        trackingNumber: action === 'ship' ? trackingNumber.trim() : undefined,
        expectedDeliveryDate: action === 'accept' || action === 'prepare' ? expectedDeliveryDate.trim() : undefined,
        estimatedTimeOfArrival: action === 'accept' || action === 'prepare' ? estimatedTimeOfArrival.trim() : undefined
      });

      setActiveActionModal(null);
      await fetchArtisanOrders();
    } catch (err: any) {
      console.error('Failed to update status:', err);
      alert(err.message || 'Error updating order status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleChatWithBuyer = (order: Order) => {
    if (onOpenChat) {
      onOpenChat({
        productId: order.productId,
        buyerId: order.buyerId,
        buyerName: order.buyerName,
        buyerMobile: order.buyerMobile
      });
    } else {
      // Fallback to whatsapp if chat modal handler is unavailable
      const whatsappUrl = `https://wa.me/91${order.buyerMobile.replace(/\D/g, '')}?text=${encodeURIComponent(
        `Namaste ${order.buyerName}, this is artisan ${order.artisanName} regarding CraftWise order ${order.orderNumber}.`
      )}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  // Counts for each tab
  const newCount = orders.filter((o) => o.status === 'placed').length;
  const acceptedCount = orders.filter((o) => o.status === 'accepted').length;
  const preparingCount = orders.filter((o) => o.status === 'preparing').length;
  const shippedCount = orders.filter((o) => o.status === 'shipped' || o.status === 'out_for_delivery').length;
  const deliveredCount = orders.filter((o) => o.status === 'delivered').length;
  const cancelledCount = orders.filter((o) => o.status === 'cancelled' || o.status === 'rejected').length;

  // Filtered list
  const filteredOrders = orders.filter((o) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = (o.productTitle || '').toLowerCase().includes(q);
      const matchNum = (o.orderNumber || '').toLowerCase().includes(q);
      const matchBuyer = (o.buyerName || '').toLowerCase().includes(q);
      if (!matchTitle && !matchNum && !matchBuyer) return false;
    }

    if (activeTab === 'new') return o.status === 'placed';
    if (activeTab === 'accepted') return o.status === 'accepted';
    if (activeTab === 'preparing') return o.status === 'preparing';
    if (activeTab === 'shipped') return o.status === 'shipped' || o.status === 'out_for_delivery';
    if (activeTab === 'delivered') return o.status === 'delivered';
    if (activeTab === 'cancelled') return o.status === 'cancelled' || o.status === 'rejected';
    return true; // 'all'
  });

  return (
    <div className={`text-[#2D241E] ${isEmbedded ? '' : 'min-h-screen bg-[#FAF9F6] pb-16'}`}>
      {/* Top Header if not embedded */}
      {!isEmbedded && (
        <div className="bg-white border-b border-[#E5E1DA] sticky top-0 z-30 shadow-xs">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  id="btn-back-to-dashboard"
                  onClick={() => onNavigate('dashboard')}
                  className="p-2 rounded-xl text-[#7C6E62] hover:text-[#4A3728] hover:bg-[#F4F1ED] transition-colors"
                  title="Back to Dashboard"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl sm:text-2xl font-bold text-[#4A3728]">
                      Orders & Delivery Management
                    </h1>
                    {newCount > 0 && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#C05D4D] text-white animate-pulse">
                        {newCount} New Request{newCount > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#7C6E62]">
                    Review buyer orders, set estimated delivery dates, update craft progress, and chat safely.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  id="btn-refresh-artisan-orders"
                  onClick={fetchArtisanOrders}
                  disabled={loading}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-[#E5E1DA] text-xs font-semibold text-[#4A3728] hover:bg-[#FAF9F6] transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  <span>Refresh Orders</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className={isEmbedded ? 'space-y-6' : 'max-w-6xl mx-auto px-4 sm:px-6 pt-6 space-y-6'}>
        {/* Navigation Tabs - Explicitly shows all 6 requested lifecycle states + All */}
        <div className="bg-white p-2 rounded-2xl border border-[#E5E1DA] shadow-xs">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0">
            {/* 1. New Orders */}
            <button
              id="tab-orders-new"
              type="button"
              onClick={() => setActiveTab('new')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'new'
                  ? 'bg-[#C05D4D] text-white shadow-xs'
                  : 'text-[#7C6E62] hover:bg-[#FAF9F6] hover:text-[#4A3728]'
              }`}
            >
              <span>New Orders</span>
              {newCount > 0 && (
                <span className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center ${
                  activeTab === 'new' ? 'bg-white/25 text-white' : 'bg-[#C05D4D] text-white animate-pulse'
                }`}>
                  {newCount}
                </span>
              )}
            </button>

            {/* 2. Accepted Orders */}
            <button
              id="tab-orders-accepted"
              type="button"
              onClick={() => setActiveTab('accepted')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'accepted'
                  ? 'bg-[#C05D4D] text-white shadow-xs'
                  : 'text-[#7C6E62] hover:bg-[#FAF9F6] hover:text-[#4A3728]'
              }`}
            >
              <span>Accepted Orders</span>
              {acceptedCount > 0 && (
                <span className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center ${
                  activeTab === 'accepted' ? 'bg-white/25 text-white' : 'bg-[#E5E1DA] text-[#4A3728]'
                }`}>
                  {acceptedCount}
                </span>
              )}
            </button>

            {/* 3. Preparing Orders */}
            <button
              id="tab-orders-preparing"
              type="button"
              onClick={() => setActiveTab('preparing')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'preparing'
                  ? 'bg-[#C05D4D] text-white shadow-xs'
                  : 'text-[#7C6E62] hover:bg-[#FAF9F6] hover:text-[#4A3728]'
              }`}
            >
              <span>Preparing Orders</span>
              {preparingCount > 0 && (
                <span className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center ${
                  activeTab === 'preparing' ? 'bg-white/25 text-white' : 'bg-[#E5E1DA] text-[#4A3728]'
                }`}>
                  {preparingCount}
                </span>
              )}
            </button>

            {/* 4. Shipped Orders */}
            <button
              id="tab-orders-shipped"
              type="button"
              onClick={() => setActiveTab('shipped')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'shipped'
                  ? 'bg-[#C05D4D] text-white shadow-xs'
                  : 'text-[#7C6E62] hover:bg-[#FAF9F6] hover:text-[#4A3728]'
              }`}
            >
              <span>Shipped Orders</span>
              {shippedCount > 0 && (
                <span className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center ${
                  activeTab === 'shipped' ? 'bg-white/25 text-white' : 'bg-[#E5E1DA] text-[#4A3728]'
                }`}>
                  {shippedCount}
                </span>
              )}
            </button>

            {/* 5. Delivered Orders */}
            <button
              id="tab-orders-delivered"
              type="button"
              onClick={() => setActiveTab('delivered')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'delivered'
                  ? 'bg-[#C05D4D] text-white shadow-xs'
                  : 'text-[#7C6E62] hover:bg-[#FAF9F6] hover:text-[#4A3728]'
              }`}
            >
              <span>Delivered Orders</span>
              {deliveredCount > 0 && (
                <span className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center ${
                  activeTab === 'delivered' ? 'bg-white/25 text-white' : 'bg-[#E5E1DA] text-[#4A3728]'
                }`}>
                  {deliveredCount}
                </span>
              )}
            </button>

            {/* 6. Cancelled Orders */}
            <button
              id="tab-orders-cancelled"
              type="button"
              onClick={() => setActiveTab('cancelled')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'cancelled'
                  ? 'bg-[#C05D4D] text-white shadow-xs'
                  : 'text-[#7C6E62] hover:bg-[#FAF9F6] hover:text-[#4A3728]'
              }`}
            >
              <span>Cancelled Orders</span>
              {cancelledCount > 0 && (
                <span className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center ${
                  activeTab === 'cancelled' ? 'bg-white/25 text-white' : 'bg-[#E5E1DA] text-[#4A3728]'
                }`}>
                  {cancelledCount}
                </span>
              )}
            </button>

            {/* All Orders */}
            <button
              id="tab-orders-all"
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ml-auto ${
                activeTab === 'all'
                  ? 'bg-[#4A3728] text-white shadow-xs'
                  : 'text-[#7C6E62] hover:bg-[#FAF9F6] hover:text-[#4A3728]'
              }`}
            >
              <span>All Orders ({orders.length})</span>
            </button>
          </div>
        </div>

        {/* Search & Actions Bar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#7C6E62] absolute left-3.5 top-3" />
            <input
              type="text"
              id="input-search-artisan-orders"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by buyer name, order ID, craft title..."
              className="w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl border border-[#E5E1DA] bg-white text-[#4A3728] placeholder-[#A89F91] focus:ring-2 focus:ring-[#C05D4D]/20 focus:border-[#C05D4D]"
            />
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto text-xs text-[#7C6E62]">
            <span className="font-medium">
              Showing <strong>{filteredOrders.length}</strong> of {orders.length} order{orders.length === 1 ? '' : 's'}
            </span>
          </div>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Loading Spinner */}
        {loading && orders.length === 0 && (
          <div className="text-center py-16 space-y-3 bg-white rounded-3xl border border-[#E5E1DA]">
            <div className="w-10 h-10 border-4 border-[#C05D4D] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-semibold text-[#7C6E62]">
              Loading orders...
            </p>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredOrders.length === 0 && (
          <div className="bg-white rounded-3xl border border-[#E5E1DA] p-8 sm:p-12 text-center space-y-3 max-w-md mx-auto">
            <div className="w-14 h-14 rounded-2xl bg-[#FAF9F6] border border-[#E5E1DA] text-[#7C6E62] flex items-center justify-center mx-auto">
              <Package className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-[#4A3728]">No orders found in this section</h3>
            <p className="text-xs text-[#7C6E62]">
              {activeTab === 'new'
                ? 'All incoming buyer requests have been addressed! New orders will appear here automatically.'
                : activeTab === 'accepted'
                ? 'No orders are awaiting craft preparation start.'
                : activeTab === 'preparing'
                ? 'No handcrafted items currently in workshop crafting.'
                : activeTab === 'shipped'
                ? 'No packages currently in transit.'
                : activeTab === 'delivered'
                ? 'Delivered orders will be archived here once confirmed.'
                : 'No orders match the selected filter.'}
            </p>
          </div>
        )}

        {/* Orders List Grid */}
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const isNew = order.status === 'placed';
            const isAccepted = order.status === 'accepted';
            const isPreparing = order.status === 'preparing';
            const isShipped = order.status === 'shipped' || order.status === 'out_for_delivery';
            const isDelivered = order.status === 'delivered';
            const isCancelled = order.status === 'cancelled' || order.status === 'rejected';

            const whatsappUrl = `https://wa.me/91${order.buyerMobile.replace(/\D/g, '')}?text=${encodeURIComponent(
              `Namaste ${order.buyerName}, this is artisan ${order.artisanName} regarding your CraftWise order ${order.orderNumber}.`
            )}`;

            return (
              <div
                key={order.id}
                id={`artisan-order-card-${order.id}`}
                className={`bg-white rounded-3xl border transition-all p-5 sm:p-6 shadow-xs ${
                  isNew
                    ? 'border-[#C05D4D] ring-2 ring-[#C05D4D]/15'
                    : 'border-[#E5E1DA] hover:border-[#C05D4D]/30'
                }`}
              >
                {/* Header Row: Order Number, Date, Status Badge */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E5E1DA]">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-mono text-sm font-bold text-[#4A3728]">
                      {order.orderNumber}
                    </span>
                    <span className="text-xs text-[#7C6E62]">
                      • Order Date:{' '}
                      <strong className="text-[#4A3728]">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </strong>
                    </span>
                    <span className="text-[11px] text-[#A89F91]">
                      ({new Date(order.createdAt).toLocaleTimeString('en-IN', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })})
                    </span>
                  </div>

                  {/* Current Status Badge */}
                  <div className="flex items-center gap-2">
                    {order.status === 'placed' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 animate-pulse">
                        <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                        New Order Request
                      </span>
                    )}
                    {order.status === 'accepted' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                        Accepted
                      </span>
                    )}
                    {order.status === 'preparing' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-800 border border-purple-200">
                        <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                        Preparing & Crafting
                      </span>
                    )}
                    {order.status === 'shipped' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-800 border border-indigo-200">
                        <Truck className="w-3.5 h-3.5 text-indigo-600" />
                        Shipped
                      </span>
                    )}
                    {order.status === 'out_for_delivery' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-50 text-cyan-800 border border-cyan-200">
                        <MapPin className="w-3.5 h-3.5 text-cyan-600" />
                        Out for Delivery
                      </span>
                    )}
                    {order.status === 'delivered' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Delivered
                      </span>
                    )}
                    {order.status === 'rejected' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-800 border border-red-200">
                        <XCircle className="w-3.5 h-3.5 text-red-600" />
                        Declined by Artisan
                      </span>
                    )}
                    {order.status === 'cancelled' && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-300">
                        <XCircle className="w-3.5 h-3.5 text-gray-500" />
                        Cancelled
                      </span>
                    )}
                  </div>
                </div>

                {/* Main Details Grid: Product & Quantity, Buyer Info, Expected Delivery */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 py-4">
                  {/* Column 1: Product & Quantity & Total Amount */}
                  <div className="flex items-start gap-3.5">
                    <img
                      src={order.productImage}
                      alt={order.productTitle}
                      className="w-20 h-20 rounded-2xl object-cover border border-[#E5E1DA] shrink-0"
                    />
                    <div className="space-y-1 min-w-0">
                      <h4 className="font-bold text-sm text-[#4A3728] leading-snug">
                        {order.productTitle}
                      </h4>
                      <div className="text-xs text-[#7C6E62]">
                        Quantity: <strong className="text-[#4A3728]">{order.quantity} units</strong>
                      </div>
                      <div className="text-xs text-[#7C6E62]">
                        Total Amount: <strong className="text-[#C05D4D] text-base">₹{order.totalAmount}</strong>
                        <span className="text-[10px] text-emerald-700 ml-1.5 font-semibold">(Direct to Artisan)</span>
                      </div>
                      <div className="text-[11px] text-[#A89F91]">
                        Unit Price: ₹{order.unitPrice} • Category: {order.craftCategory || 'Handicrafts'}
                      </div>
                    </div>
                  </div>

                  {/* Column 2: Buyer & Delivery Destination */}
                  <div className="bg-[#FAF9F6] p-3.5 rounded-2xl border border-[#E5E1DA] text-xs space-y-1.5">
                    <div className="font-bold text-[#4A3728] flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#C05D4D]" />
                        Buyer & Delivery Address
                      </span>
                    </div>

                    <p className="font-bold text-[#4A3728]">
                      {order.buyerName}{' '}
                      <span className="text-[#7C6E62] font-normal">• +91 {order.buyerMobile}</span>
                    </p>
                    <p className="text-[#7C6E62] leading-relaxed">
                      {order.deliveryDetails?.streetAddress || 'Address on file'},{' '}
                      {order.deliveryDetails?.city || ''}, {order.deliveryDetails?.state || ''} -{' '}
                      {order.deliveryDetails?.pincode || ''}
                    </p>
                    {order.deliveryDetails?.landmark && (
                      <p className="text-[11px] text-[#A89F91]">
                        Landmark: {order.deliveryDetails.landmark}
                      </p>
                    )}
                    <div className="pt-1 text-[11px] text-[#7C6E62]">
                      Payment Arrangement:{' '}
                      <span className="font-semibold capitalize text-[#4A3728]">
                        {(order.deliveryDetails?.paymentMethod || 'cash_on_delivery').replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>

                  {/* Column 3: Expected Delivery Date/Time & Customization Notes */}
                  <div className="space-y-2">
                    {/* Expected Delivery Date / Time Card */}
                    <div className="bg-[#FAF9F6] p-3.5 rounded-2xl border border-[#E5E1DA] text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-[#4A3728] flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-[#C05D4D]" />
                          Expected Delivery Date & Time
                        </span>
                        {isAccepted && (
                          <button
                            type="button"
                            onClick={() => handleOpenAction(order, 'prepare')}
                            className="text-[10px] text-[#C05D4D] hover:underline font-semibold"
                          >
                            Edit
                          </button>
                        )}
                      </div>
                      <p className="text-xs font-bold text-[#C05D4D]">
                        {order.expectedDeliveryDate || '5-7 business days'}
                      </p>
                      {order.estimatedTimeOfArrival && (
                        <p className="text-[11px] text-[#7C6E62]">
                          Window: {order.estimatedTimeOfArrival}
                        </p>
                      )}
                    </div>

                    {/* Customization Note if any */}
                    {order.customizationNotes ? (
                      <div className="bg-amber-50 p-3 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-1">
                        <div className="font-bold flex items-center gap-1 text-amber-800 text-[11px]">
                          <Sparkles className="w-3 h-3 text-amber-600" />
                          Buyer's Special Customization Note:
                        </div>
                        <p className="italic text-[11px]">"{order.customizationNotes}"</p>
                      </div>
                    ) : null}

                    {/* Tracking ID if Shipped */}
                    {order.trackingNumber && (
                      <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-2xl text-xs text-indigo-900 space-y-0.5">
                        <span className="text-[11px] text-indigo-700 block">
                          Carrier: <strong>{order.trackingPartner || 'India Post Speed Post'}</strong>
                        </span>
                        <span className="font-mono font-bold text-xs">
                          Waybill / Tracking: {order.trackingNumber}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer: Chat with Buyer & Lifecycle Action Buttons */}
                <div className="pt-4 border-t border-[#E5E1DA] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  {/* Left: Chat Integration with Buyer (Scam Protected) */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      id={`btn-chat-buyer-${order.id}`}
                      onClick={() => handleChatWithBuyer(order)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#4A3728] hover:bg-[#382a1e] text-white text-xs font-bold transition-all shadow-xs cursor-pointer group"
                      title="Open multilingual chat with buyer (Protected by CraftWise AI Scam Detection)"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
                      <span>Chat with Buyer</span>
                      <ShieldCheck className="w-3 h-3 text-emerald-400 ml-0.5" />
                    </button>

                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-2 rounded-xl border border-emerald-300 text-emerald-700 hover:bg-emerald-50 text-xs font-semibold transition-colors"
                      title="Open WhatsApp chat with buyer"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">WhatsApp</span>
                    </a>
                  </div>

                  {/* Right: Stage-based Action Controls (Placed -> Accepted -> Preparing -> Shipped -> Delivered) */}
                  <div className="flex items-center gap-2 flex-wrap justify-end">
                    {/* Stage 1: Placed -> Can Accept or Reject */}
                    {isNew && (
                      <>
                        <button
                          type="button"
                          id={`btn-reject-order-${order.id}`}
                          onClick={() => handleOpenAction(order, 'reject')}
                          className="px-3.5 py-2 rounded-xl border border-red-200 text-xs font-bold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        >
                          Reject / Decline
                        </button>
                        <button
                          type="button"
                          id={`btn-accept-order-${order.id}`}
                          onClick={() => handleOpenAction(order, 'accept')}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Accept Order</span>
                        </button>
                      </>
                    )}

                    {/* Stage 2: Accepted -> Can Mark Preparing or Cancel */}
                    {isAccepted && (
                      <>
                        <button
                          type="button"
                          id={`btn-cancel-order-${order.id}`}
                          onClick={() => handleOpenAction(order, 'cancel')}
                          className="px-3 py-2 rounded-xl border border-red-200 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
                        >
                          Cancel Order
                        </button>
                        <button
                          type="button"
                          id={`btn-prepare-order-${order.id}`}
                          onClick={() => handleOpenAction(order, 'prepare')}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#C05D4D] hover:bg-[#A34E41] text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Mark as Preparing Craft</span>
                        </button>
                      </>
                    )}

                    {/* Stage 3: Preparing -> Can Mark as Shipped */}
                    {isPreparing && (
                      <>
                        <button
                          type="button"
                          id={`btn-cancel-order-${order.id}`}
                          onClick={() => handleOpenAction(order, 'cancel')}
                          className="px-3 py-2 rounded-xl border border-red-200 text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          id={`btn-ship-order-${order.id}`}
                          onClick={() => handleOpenAction(order, 'ship')}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>Mark as Shipped</span>
                        </button>
                      </>
                    )}

                    {/* Stage 4: Shipped -> Can Mark as Delivered */}
                    {isShipped && (
                      <button
                        type="button"
                        id={`btn-delivered-order-${order.id}`}
                        onClick={() => handleOpenAction(order, 'deliver')}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Mark as Delivered</span>
                      </button>
                    )}

                    {/* Stage 5: Delivered */}
                    {isDelivered && (
                      <span className="text-xs font-bold text-emerald-700 flex items-center gap-1 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Delivered & Complete
                      </span>
                    )}

                    {/* Terminated */}
                    {isCancelled && (
                      <span className="text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1.5 rounded-xl">
                        {order.status === 'rejected' ? 'Declined by Artisan' : 'Cancelled'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Dialog / Modal for Order State Transitions */}
      {activeActionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div
            className="bg-white rounded-3xl border border-[#E5E1DA] max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150"
            role="dialog"
            aria-modal="true"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E1DA]">
              <h3 className="text-base font-bold text-[#4A3728]">
                {activeActionModal.action === 'accept' && 'Accept Order Request'}
                {activeActionModal.action === 'reject' && 'Decline Order Request'}
                {activeActionModal.action === 'cancel' && 'Cancel Order Request'}
                {activeActionModal.action === 'prepare' && 'Start Handcrafting'}
                {activeActionModal.action === 'ship' && 'Dispatch & Add Tracking Info'}
                {activeActionModal.action === 'deliver' && 'Confirm Delivery to Customer'}
              </h3>
              <button
                id="btn-close-action-modal"
                onClick={() => setActiveActionModal(null)}
                className="text-[#7C6E62] hover:text-[#4A3728] p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="bg-[#FAF9F6] p-3 rounded-2xl border border-[#E5E1DA] text-xs">
              <strong>Order {activeActionModal.order.orderNumber}</strong> •{' '}
              {activeActionModal.order.productTitle} ({activeActionModal.order.quantity}x) •{' '}
              <span className="text-[#C05D4D] font-bold">₹{activeActionModal.order.totalAmount}</span>
            </div>

            <form onSubmit={handleConfirmAction} className="space-y-4">
              {/* If Accepting or Preparing: Input Expected Delivery Date and ETA */}
              {(activeActionModal.action === 'accept' || activeActionModal.action === 'prepare') && (
                <div className="space-y-3 bg-[#FAF9F6] p-3.5 rounded-2xl border border-[#E5E1DA]">
                  <label className="block text-xs font-bold text-[#4A3728]">
                    Expected Delivery Date / Time
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-medium text-[#7C6E62] mb-1">
                        Estimated Delivery Date *
                      </label>
                      <input
                        type="text"
                        id="input-expected-delivery-date"
                        required
                        value={expectedDeliveryDate}
                        onChange={(e) => setExpectedDeliveryDate(e.target.value)}
                        placeholder="e.g. 25 Sep 2026 or 5 days"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5E1DA] bg-white text-[#4A3728] focus:ring-2 focus:ring-[#C05D4D]/20 focus:border-[#C05D4D]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-[#7C6E62] mb-1">
                        Transit / Window Time
                      </label>
                      <input
                        type="text"
                        id="input-eta-time"
                        value={estimatedTimeOfArrival}
                        onChange={(e) => setEstimatedTimeOfArrival(e.target.value)}
                        placeholder="e.g. 4 - 6 business days"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5E1DA] bg-white text-[#4A3728] focus:ring-2 focus:ring-[#C05D4D]/20 focus:border-[#C05D4D]"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap pt-1">
                    <span className="text-[10px] text-[#7C6E62]">Quick Presets:</span>
                    {[3, 5, 7, 10].map((days) => {
                      const dStr = new Date(Date.now() + 86400000 * days).toLocaleDateString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      });
                      return (
                        <button
                          key={days}
                          type="button"
                          onClick={() => {
                            setExpectedDeliveryDate(dStr);
                            setEstimatedTimeOfArrival(`${days - 1} - ${days + 1} business days`);
                          }}
                          className="px-2 py-0.5 rounded-lg bg-white border border-[#E5E1DA] text-[10px] text-[#4A3728] hover:border-[#C05D4D]"
                        >
                          +{days} days ({dStr})
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[10px] text-[#A89F91]">
                    This estimated delivery date is immediately displayed to the buyer on their order tracking screen.
                  </p>
                </div>
              )}

              {/* Reject / Cancel Reason dropdown */}
              {(activeActionModal.action === 'reject' || activeActionModal.action === 'cancel') && (
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-[#7C6E62]">
                    Reason for {activeActionModal.action === 'reject' ? 'Declining' : 'Cancelling'}
                  </label>
                  <select
                    id="select-rejection-reason"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5E1DA] bg-white text-[#4A3728] focus:ring-2 focus:ring-[#C05D4D]/20 focus:border-[#C05D4D]"
                  >
                    <option value="Out of raw materials currently">Out of raw materials currently</option>
                    <option value="Artisan workshop is at maximum capacity">
                      Artisan workshop is at maximum capacity
                    </option>
                    <option value="Requested customization cannot be fulfilled">
                      Requested customization cannot be fulfilled
                    </option>
                    <option value="Delivery address not reachable by rural dispatch">
                      Delivery address not reachable by rural dispatch
                    </option>
                    <option value="Product discontinued or under seasonal hiatus">
                      Product discontinued or under seasonal hiatus
                    </option>
                    <option value="Other reason agreed with buyer">Other reason agreed with buyer</option>
                  </select>
                  <p className="text-[10px] text-[#7C6E62]">
                    Cancelling will safely restore reserved stock for this item in your inventory catalog.
                  </p>
                </div>
              )}

              {/* Shipped: Carrier and Tracking Reference */}
              {activeActionModal.action === 'ship' && (
                <div className="space-y-3 bg-[#FAF9F6] p-3.5 rounded-2xl border border-[#E5E1DA]">
                  <div>
                    <label className="block text-xs font-semibold text-[#7C6E62] mb-1">
                      Courier / Delivery Partner
                    </label>
                    <select
                      id="select-courier-partner"
                      value={trackingPartner}
                      onChange={(e) => setTrackingPartner(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5E1DA] bg-white text-[#4A3728] focus:ring-2 focus:ring-[#C05D4D]/20 focus:border-[#C05D4D]"
                    >
                      <option value="India Post Speed Post">India Post Speed Post</option>
                      <option value="Delhivery Surface">Delhivery Surface</option>
                      <option value="Blue Dart Express">Blue Dart Express</option>
                      <option value="DTDC Courier">DTDC Courier</option>
                      <option value="Professional Couriers">Professional Couriers</option>
                      <option value="Direct Artisan Hand-Delivery / Local Transport">
                        Direct Artisan Hand-Delivery / Local Transport
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#7C6E62] mb-1">
                      Consignment / Waybill Tracking Number
                    </label>
                    <input
                      type="text"
                      id="input-tracking-number"
                      required
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      placeholder="e.g. IP-BLR-841920"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5E1DA] bg-white text-[#4A3728] font-mono focus:ring-2 focus:ring-[#C05D4D]/20 focus:border-[#C05D4D]"
                    />
                  </div>
                </div>
              )}

              {/* Optional Custom Note sent to buyer */}
              <div>
                <label className="block text-xs font-semibold text-[#7C6E62] mb-1">
                  Note to Customer (Sent via in-app notifications & order log)
                </label>
                <textarea
                  id="input-action-note"
                  value={actionNote}
                  onChange={(e) => setActionNote(e.target.value)}
                  placeholder="e.g. Authentic raw materials secured, handcrafting begins today / Dispatched with protective packaging"
                  rows={2}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#E5E1DA] bg-white text-[#4A3728] placeholder-[#A89F91] focus:ring-2 focus:ring-[#C05D4D]/20 focus:border-[#C05D4D]"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  id="btn-cancel-action-modal"
                  onClick={() => setActiveActionModal(null)}
                  className="px-4 py-2 rounded-xl border border-[#E5E1DA] text-xs font-semibold text-[#7C6E62] hover:bg-[#FAF9F6]"
                >
                  Close
                </button>
                <button
                  type="submit"
                  id="btn-submit-action-modal"
                  disabled={isUpdating}
                  className={`px-5 py-2 rounded-xl text-white text-xs font-bold transition-all shadow-sm disabled:opacity-50 ${
                    activeActionModal.action === 'reject' || activeActionModal.action === 'cancel'
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-[#C05D4D] hover:bg-[#A34E41]'
                  }`}
                >
                  {isUpdating ? 'Updating...' : 'Confirm & Update Status'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
