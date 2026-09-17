import React, { useState, useEffect } from 'react';
import {
  Package,
  Clock,
  CheckCircle2,
  Truck,
  MapPin,
  Calendar,
  Search,
  ArrowLeft,
  ChevronRight,
  RefreshCw,
  ShoppingBag,
  ExternalLink,
  MessageCircle,
  AlertCircle,
  Sparkles,
  Phone,
  Filter
} from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { api, authState } from '../api';
import { OrderTrackingTimeline } from '../components/orders/OrderTrackingTimeline';

interface OrdersPageProps {
  onNavigate: (page: string, params?: any) => void;
  initialSelectedOrderId?: string;
  onOpenChat?: (params?: { productId?: string; conversationId?: string }) => void;
}

export const OrdersPage: React.FC<OrdersPageProps> = ({
  onNavigate,
  initialSelectedOrderId,
  onOpenChat
}) => {
  const currentUser = authState.getUser();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Tabs
  const [activeTab, setActiveTab] = useState<'active' | 'completed' | 'all' | 'guest'>('active');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [guestMobile, setGuestMobile] = useState<string>(currentUser?.mobile || '');
  const [guestOrderNumber, setGuestOrderNumber] = useState<string>('');

  // Selected order for detailed modal or drawer view
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(initialSelectedOrderId || null);
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getOrders({
        role: 'buyer',
        mobile: guestMobile || currentUser?.mobile
      });
      setOrders(res.orders || []);
      if (initialSelectedOrderId && !selectedOrderId) {
        setSelectedOrderId(initialSelectedOrderId);
      }
    } catch (err: any) {
      console.error('Failed to load orders:', err);
      setError(err.message || 'Could not load orders. Please retry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [guestMobile]);

  const handleGuestLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestMobile.trim() && !guestOrderNumber.trim()) return;

    try {
      setLoading(true);
      setError(null);
      if (guestOrderNumber.trim()) {
        try {
          const res = await api.getOrder(guestOrderNumber.trim());
          if (res.order) {
            setOrders([res.order]);
            setSelectedOrderId(res.order.id);
            setActiveTab('all');
            return;
          }
        } catch {
          // If not found by single ID, fall through to mobile query
        }
      }

      const res = await api.getOrders({
        role: 'buyer',
        mobile: guestMobile.trim()
      });
      setOrders(res.orders || []);
      if (res.orders.length === 0) {
        setError('No orders found matching the provided mobile number or Order ID.');
      } else {
        setActiveTab('all');
      }
    } catch (err: any) {
      setError(err.message || 'Lookup failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      setCancellingOrderId(orderId);
      await api.updateOrderStatus(orderId, {
        status: 'cancelled',
        note: 'Cancelled by customer'
      });
      await fetchOrders();
    } catch (err: any) {
      alert(err.message || 'Failed to cancel order.');
    } finally {
      setCancellingOrderId(null);
    }
  };

  const selectedOrder = orders.find((o) => o.id === selectedOrderId || o.orderNumber === selectedOrderId);

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesTitle = o.productTitle.toLowerCase().includes(q);
      const matchesNumber = o.orderNumber.toLowerCase().includes(q);
      const matchesArtisan = o.artisanName.toLowerCase().includes(q);
      if (!matchesTitle && !matchesNumber && !matchesArtisan) return false;
    }

    if (activeTab === 'active') {
      return ['placed', 'accepted', 'preparing', 'shipped', 'out_for_delivery'].includes(o.status);
    }
    if (activeTab === 'completed') {
      return ['delivered', 'rejected', 'cancelled'].includes(o.status);
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#FAF9F6] pb-16">
      {/* Top Header */}
      <div className="bg-white border-b border-[#E5E1DA] sticky top-0 z-30 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                id="btn-back-to-marketplace"
                onClick={() => onNavigate('marketplace')}
                className="p-2 rounded-xl text-[#7C6E62] hover:text-[#4A3728] hover:bg-[#F4F1ED] transition-colors"
                title="Back to Marketplace"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-[#4A3728]">
                  My Orders & Live Tracking
                </h1>
                <p className="text-xs text-[#7C6E62]">
                  Track handcraft status, estimated arrival, and courier dispatch in real time
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                id="btn-refresh-orders"
                onClick={fetchOrders}
                disabled={loading}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#E5E1DA] text-xs font-semibold text-[#4A3728] hover:bg-[#FAF9F6] transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
              <button
                id="btn-explore-more-crafts"
                onClick={() => onNavigate('marketplace')}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#C05D4D] hover:bg-[#A34E41] text-white text-xs font-bold transition-all shadow-sm"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Shop Crafts</span>
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-[#E5E1DA] overflow-x-auto no-scrollbar">
            <button
              id="tab-active-orders"
              onClick={() => {
                setActiveTab('active');
                setSelectedOrderId(null);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap ${
                activeTab === 'active'
                  ? 'bg-[#C05D4D] text-white shadow-xs'
                  : 'text-[#7C6E62] hover:bg-[#FAF9F6]'
              }`}
            >
              Active Orders (
              {orders.filter((o) =>
                ['placed', 'accepted', 'preparing', 'shipped', 'out_for_delivery'].includes(o.status)
              ).length}
              )
            </button>

            <button
              id="tab-completed-orders"
              onClick={() => {
                setActiveTab('completed');
                setSelectedOrderId(null);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap ${
                activeTab === 'completed'
                  ? 'bg-[#C05D4D] text-white shadow-xs'
                  : 'text-[#7C6E62] hover:bg-[#FAF9F6]'
              }`}
            >
              Past & Delivered (
              {orders.filter((o) => ['delivered', 'rejected', 'cancelled'].includes(o.status)).length}
              )
            </button>

            <button
              id="tab-all-orders"
              onClick={() => {
                setActiveTab('all');
                setSelectedOrderId(null);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap ${
                activeTab === 'all'
                  ? 'bg-[#C05D4D] text-white shadow-xs'
                  : 'text-[#7C6E62] hover:bg-[#FAF9F6]'
              }`}
            >
              All Orders ({orders.length})
            </button>

            <button
              id="tab-guest-lookup"
              onClick={() => {
                setActiveTab('guest');
                setSelectedOrderId(null);
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap ${
                activeTab === 'guest'
                  ? 'bg-[#C05D4D] text-white shadow-xs'
                  : 'text-[#7C6E62] hover:bg-[#FAF9F6]'
              }`}
            >
              Track by Phone / Order #
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6">
        {/* Guest Lookup View */}
        {activeTab === 'guest' && (
          <div className="bg-white rounded-3xl border border-[#E5E1DA] p-6 sm:p-8 max-w-xl mx-auto shadow-xs space-y-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#C05D4D]/10 text-[#C05D4D] flex items-center justify-center">
                <Search className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#4A3728]">
                  Track Any CraftWise Order
                </h3>
                <p className="text-xs text-[#7C6E62]">
                  Enter your mobile number or 10-digit Order ID (e.g. CW-ORD-84192)
                </p>
              </div>
            </div>

            <form onSubmit={handleGuestLookup} className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-medium text-[#7C6E62] mb-1">
                  Mobile Number
                </label>
                <input
                  type="tel"
                  id="input-guest-lookup-mobile"
                  value={guestMobile}
                  onChange={(e) => setGuestMobile(e.target.value)}
                  placeholder="e.g. 9845012345"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#E5E1DA] bg-white text-[#4A3728] focus:ring-2 focus:ring-[#C05D4D]/20 focus:border-[#C05D4D]"
                />
              </div>

              <div className="text-center text-xs font-semibold text-[#A89F91]">OR</div>

              <div>
                <label className="block text-xs font-medium text-[#7C6E62] mb-1">
                  Order Number
                </label>
                <input
                  type="text"
                  id="input-guest-lookup-ordernumber"
                  value={guestOrderNumber}
                  onChange={(e) => setGuestOrderNumber(e.target.value)}
                  placeholder="e.g. CW-ORD-84192"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#E5E1DA] bg-white text-[#4A3728] focus:ring-2 focus:ring-[#C05D4D]/20 focus:border-[#C05D4D]"
                />
              </div>

              <button
                type="submit"
                id="btn-guest-track-submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-[#C05D4D] hover:bg-[#A34E41] text-white text-xs font-bold transition-all shadow-md shadow-[#C05D4D22]"
              >
                {loading ? 'Searching...' : 'Find & Track Order'}
              </button>
            </form>
          </div>
        )}

        {/* Search Bar */}
        {activeTab !== 'guest' && (
          <div className="mb-6 flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#7C6E62] absolute left-3.5 top-3" />
              <input
                type="text"
                id="input-search-orders"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by order ID, artisan name, or craft product title..."
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl border border-[#E5E1DA] bg-white text-[#4A3728] focus:outline-none focus:ring-2 focus:ring-[#C05D4D]/20 focus:border-[#C05D4D]"
              />
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={fetchOrders}
              className="text-xs font-bold underline hover:no-underline"
            >
              Try again
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && orders.length === 0 && (
          <div className="text-center py-16 space-y-3">
            <div className="w-10 h-10 border-4 border-[#C05D4D] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-semibold text-[#7C6E62]">
              Loading your orders and tracking records...
            </p>
          </div>
        )}

        {/* Selected Order Full Tracking View (if clicked) */}
        {selectedOrder && (
          <div className="mb-8 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#C05D4D]">
                  Tracking Order Details
                </span>
              </div>
              <button
                id="btn-close-tracking-view"
                onClick={() => setSelectedOrderId(null)}
                className="text-xs font-semibold text-[#7C6E62] hover:text-[#4A3728] underline"
              >
                Close Tracking Detail
              </button>
            </div>
            <OrderTrackingTimeline
              order={selectedOrder}
              showFullDetails={true}
              onRefreshOrder={fetchOrders}
              onOpenChat={onOpenChat}
            />
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredOrders.length === 0 && (
          <div className="bg-white rounded-3xl border border-[#E5E1DA] p-8 sm:p-12 text-center space-y-4 max-w-md mx-auto">
            <div className="w-16 h-16 rounded-3xl bg-[#FAF9F6] border border-[#E5E1DA] text-[#7C6E62] flex items-center justify-center mx-auto">
              <Package className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-[#4A3728]">No orders found</h3>
              <p className="text-xs text-[#7C6E62]">
                {activeTab === 'active'
                  ? 'You do not have any orders in progress right now.'
                  : activeTab === 'completed'
                  ? 'You have not completed any past orders yet.'
                  : 'Start exploring authentic Indian handicrafts directly made by master artisans.'}
              </p>
            </div>
            <button
              id="btn-empty-start-shopping"
              onClick={() => onNavigate('marketplace')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#C05D4D] hover:bg-[#A34E41] text-white text-xs font-bold transition-all shadow-sm"
            >
              <ShoppingBag className="w-4 h-4" />
              Explore Marketplace
            </button>
          </div>
        )}

        {/* Orders List Grid */}
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const isExpanded = selectedOrderId === order.id;

            return (
              <div
                key={order.id}
                id={`order-card-${order.id}`}
                className={`bg-white rounded-3xl border transition-all duration-200 overflow-hidden ${
                  isExpanded
                    ? 'border-[#C05D4D] ring-2 ring-[#C05D4D]/15 shadow-md'
                    : 'border-[#E5E1DA] hover:border-[#C05D4D]/40 shadow-xs'
                }`}
              >
                <div className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  {/* Product Info */}
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    <img
                      src={order.productImage}
                      alt={order.productTitle}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border border-[#E5E1DA] shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-[#4A3728]">
                          {order.orderNumber}
                        </span>
                        <span className="text-[10px] text-[#7C6E62]">
                          • {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>

                      <h4 className="font-bold text-sm text-[#4A3728] truncate mt-0.5">
                        {order.productTitle}
                      </h4>

                      <div className="text-xs text-[#7C6E62] mt-0.5 flex items-center gap-2">
                        <span>Qty: {order.quantity}</span>
                        <span>•</span>
                        <span>
                          Total: <strong className="text-[#C05D4D]">₹{order.totalAmount}</strong>
                        </span>
                        <span>•</span>
                        <span>By {order.artisanName}</span>
                      </div>

                      {/* Expected Delivery Date Highlight */}
                      {order.status !== 'cancelled' && order.status !== 'rejected' && (
                        <div className="flex items-center gap-1.5 text-xs text-[#7C6E62] mt-1.5">
                          <Calendar className="w-3.5 h-3.5 text-[#C05D4D]" />
                          <span>
                            Expected Delivery: <strong>{order.expectedDeliveryDate}</strong>
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions & Status */}
                  <div className="flex sm:flex-col items-end sm:items-end justify-between w-full sm:w-auto gap-2 sm:gap-2.5 pt-3 sm:pt-0 border-t sm:border-t-0 border-[#E5E1DA]">
                    {/* Status Pill */}
                    <div>
                      {order.status === 'placed' && (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                          Order Placed
                        </span>
                      )}
                      {order.status === 'accepted' && (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">
                          Accepted by Artisan
                        </span>
                      )}
                      {order.status === 'preparing' && (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-800 border border-purple-200">
                          Preparing Craft
                        </span>
                      )}
                      {order.status === 'shipped' && (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-800 border border-indigo-200">
                          Shipped
                        </span>
                      )}
                      {order.status === 'out_for_delivery' && (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-cyan-50 text-cyan-800 border border-cyan-200">
                          Out for Delivery
                        </span>
                      )}
                      {order.status === 'delivered' && (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          Delivered
                        </span>
                      )}
                      {order.status === 'rejected' && (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-800 border border-red-200">
                          Declined
                        </span>
                      )}
                      {order.status === 'cancelled' && (
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-300">
                          Cancelled
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-wrap justify-end">
                      {onOpenChat && (
                        <button
                          id={`btn-card-chat-${order.id}`}
                          type="button"
                          onClick={() => onOpenChat({ productId: order.productId })}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-[#E5E1DA] text-xs font-semibold text-[#4A3728] hover:bg-[#FAF9F6] transition-colors cursor-pointer"
                          title="Chat with artisan"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-[#C05D4D]" />
                          <span className="hidden sm:inline">Chat</span>
                        </button>
                      )}

                      {order.status === 'placed' && (
                        <button
                          id={`btn-cancel-${order.id}`}
                          onClick={() => handleCancelOrder(order.id)}
                          disabled={cancellingOrderId === order.id}
                          className="px-2.5 py-1.5 rounded-xl border border-red-200 text-[11px] font-semibold text-red-600 hover:bg-red-50 transition-colors"
                        >
                          Cancel
                        </button>
                      )}

                      <button
                        id={`btn-track-${order.id}`}
                        onClick={() => setSelectedOrderId(isExpanded ? null : order.id)}
                        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                          isExpanded
                            ? 'bg-[#4A3728] text-white'
                            : 'bg-[#C05D4D] text-white hover:bg-[#A34E41] shadow-xs'
                        }`}
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>{isExpanded ? 'Hide Tracking' : 'Track Order'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Inline Tracking timeline if this card is currently selected */}
                {isExpanded && (
                  <div className="p-4 sm:p-6 bg-[#FAF9F6] border-t border-[#E5E1DA]">
                    <OrderTrackingTimeline
                      order={order}
                      showFullDetails={true}
                      onRefreshOrder={fetchOrders}
                      onOpenChat={onOpenChat}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
