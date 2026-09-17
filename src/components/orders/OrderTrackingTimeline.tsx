import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  Package,
  Truck,
  MapPin,
  Calendar,
  AlertCircle,
  Copy,
  Check,
  Phone,
  MessageCircle,
  MessageSquare,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  XCircle,
  User,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { Order, OrderStatus } from '../../types';

interface OrderTrackingTimelineProps {
  order: Order;
  showFullDetails?: boolean;
  onRefreshOrder?: () => void;
  onOpenChat?: (params?: { productId?: string; conversationId?: string }) => void;
}

const STATUS_STEPS: Array<{
  key: OrderStatus;
  label: string;
  sublabel: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  {
    key: 'placed',
    label: 'Order Placed',
    sublabel: 'Awaiting artisan review',
    icon: Package
  },
  {
    key: 'accepted',
    label: 'Accepted by Artisan',
    sublabel: 'Raw materials confirmed',
    icon: CheckCircle2
  },
  {
    key: 'preparing',
    label: 'Preparing & Crafting',
    sublabel: 'Handmade by artisan',
    icon: Sparkles
  },
  {
    key: 'shipped',
    label: 'Shipped',
    sublabel: 'In-transit via courier',
    icon: Truck
  },
  {
    key: 'out_for_delivery',
    label: 'Out for Delivery',
    sublabel: 'Arriving in your area',
    icon: MapPin
  },
  {
    key: 'delivered',
    label: 'Delivered',
    sublabel: 'Safely delivered to customer',
    icon: CheckCircle2
  }
];

export const OrderTrackingTimeline: React.FC<OrderTrackingTimelineProps> = ({
  order,
  showFullDetails = true,
  onRefreshOrder,
  onOpenChat
}) => {
  const [copiedTracking, setCopiedTracking] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const getStepIndex = (status: OrderStatus): number => {
    switch (status) {
      case 'placed':
        return 0;
      case 'accepted':
        return 1;
      case 'preparing':
        return 2;
      case 'shipped':
        return 3;
      case 'out_for_delivery':
        return 4;
      case 'delivered':
        return 5;
      case 'rejected':
      case 'cancelled':
        return -1;
      default:
        return 0;
    }
  };

  const currentStepIndex = getStepIndex(order.status);
  const isTerminated = order.status === 'rejected' || order.status === 'cancelled';

  const handleCopyTracking = () => {
    if (order.trackingNumber) {
      navigator.clipboard.writeText(order.trackingNumber);
      setCopiedTracking(true);
      setTimeout(() => setCopiedTracking(false), 2000);
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'placed':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            Order Placed
          </span>
        );
      case 'accepted':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
            Accepted by Artisan
          </span>
        );
      case 'preparing':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-800 border border-purple-200">
            <span className="w-2 h-2 rounded-full bg-purple-500 animate-ping" />
            Preparing / Crafting
          </span>
        );
      case 'shipped':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-800 border border-indigo-200">
            <Truck className="w-3.5 h-3.5 text-indigo-600" />
            Shipped & In Transit
          </span>
        );
      case 'out_for_delivery':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-50 text-cyan-800 border border-cyan-200">
            <MapPin className="w-3.5 h-3.5 text-cyan-600 animate-bounce" />
            Out for Delivery
          </span>
        );
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Delivered
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-800 border border-red-200">
            <XCircle className="w-3.5 h-3.5 text-red-600" />
            Declined by Artisan
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-300">
            <XCircle className="w-3.5 h-3.5 text-gray-500" />
            Cancelled
          </span>
        );
      default:
        return null;
    }
  };

  const whatsappMessage = encodeURIComponent(
    `Namaste ${order.artisanName}, regarding my CraftWise Order ${order.orderNumber} (${order.productTitle}): Could you please provide an update?`
  );
  const whatsappUrl = `https://wa.me/91${(order.artisanMobile || '9876543210').replace(/\D/g, '')}?text=${whatsappMessage}`;

  return (
    <div className="bg-white rounded-3xl border border-[#E5E1DA] p-5 sm:p-6 shadow-xs space-y-6">
      {/* Header with Order Number & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E5E1DA]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#7C6E62]">
              Order ID
            </span>
            <span className="font-mono text-base font-bold text-[#4A3728]">
              {order.orderNumber}
            </span>
          </div>
          <p className="text-xs text-[#7C6E62] mt-0.5">
            Placed on{' '}
            {new Date(order.createdAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {getStatusBadge(order.status)}
        </div>
      </div>

      {/* Prominent ETA Banner */}
      {!isTerminated && (
        <div className="bg-[#FAF9F6] border border-[#E5E1DA] rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C05D4D]/10 text-[#C05D4D] flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-[#7C6E62] font-medium">Expected Delivery Date</div>
              <div className="text-sm sm:text-base font-bold text-[#4A3728]">
                {order.expectedDeliveryDate || 'Within 5–7 business days'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-[#7C6E62] bg-white px-3 py-1.5 rounded-xl border border-[#E5E1DA]">
            <Clock className="w-3.5 h-3.5 text-[#C05D4D]" />
            <span>ETA: <strong className="text-[#4A3728]">{order.estimatedTimeOfArrival}</strong></span>
          </div>
        </div>
      )}

      {/* If Rejected or Cancelled */}
      {isTerminated && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-xs text-red-900 space-y-1">
          <div className="font-bold flex items-center gap-1.5 text-sm text-red-800">
            <AlertCircle className="w-4 h-4 text-red-600" />
            {order.status === 'rejected' ? 'Order Declined by Artisan' : 'Order Cancelled'}
          </div>
          <p>
            {order.rejectionReason || 'The artisan was unable to accept this order at this time. If payment was made, it will be automatically refunded.'}
          </p>
        </div>
      )}

      {/* Visual Tracking Stepper */}
      {!isTerminated && (
        <div className="py-2">
          <h4 className="text-xs font-bold text-[#4A3728] uppercase tracking-wider mb-4">
            Live Order Progress
          </h4>

          {/* Stepper for Mobile & Desktop */}
          <div className="relative">
            {/* Progress line background */}
            <div className="hidden sm:block absolute top-5 left-6 right-6 h-1 bg-[#E5E1DA] -z-0" />
            {/* Active progress fill */}
            <div
              className="hidden sm:block absolute top-5 left-6 h-1 bg-[#C05D4D] -z-0 transition-all duration-500"
              style={{
                width: `${Math.min(100, Math.max(0, (currentStepIndex / (STATUS_STEPS.length - 1)) * 100))}%`
              }}
            />

            {/* Steps Container */}
            <div className="grid grid-cols-1 sm:grid-cols-6 gap-4 sm:gap-2">
              {STATUS_STEPS.map((step, idx) => {
                const Icon = step.icon;
                const isCompleted = currentStepIndex > idx;
                const isCurrent = currentStepIndex === idx;
                const isUpcoming = currentStepIndex < idx;

                return (
                  <div
                    key={step.key}
                    className="flex sm:flex-col items-center sm:text-center gap-3 sm:gap-2 relative z-10"
                  >
                    {/* Circle Node */}
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-xs shrink-0 transition-all shadow-xs ${
                        isCompleted
                          ? 'bg-emerald-600 text-white shadow-emerald-200'
                          : isCurrent
                          ? 'bg-[#C05D4D] text-white ring-4 ring-[#C05D4D]/20 shadow-md scale-105'
                          : 'bg-[#F4F1ED] text-[#A89F91] border border-[#E5E1DA]'
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="w-5 h-5 stroke-[2.5]" />
                      ) : (
                        <Icon className="w-5 h-5" />
                      )}
                    </div>

                    {/* Step Info */}
                    <div className="min-w-0 flex-1 sm:flex-initial">
                      <p
                        className={`text-xs font-bold leading-tight ${
                          isCurrent
                            ? 'text-[#C05D4D]'
                            : isCompleted
                            ? 'text-[#4A3728]'
                            : 'text-[#A89F91]'
                        }`}
                      >
                        {step.label}
                      </p>
                      <p className="text-[10px] text-[#7C6E62] leading-tight mt-0.5 sm:hidden">
                        {step.sublabel}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Courier & Tracking Number Card if Shipped */}
      {order.trackingNumber && (
        <div className="bg-[#FAF9F6] border border-[#E5E1DA] rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-medium text-[#7C6E62]">
                Carrier: <strong className="text-[#4A3728]">{order.trackingPartner || 'India Post Speed Post'}</strong>
              </span>
              <div className="font-mono text-xs sm:text-sm font-bold text-[#4A3728]">
                {order.trackingNumber}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-copy-tracking"
              type="button"
              onClick={handleCopyTracking}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E5E1DA] bg-white hover:bg-[#F4F1ED] text-xs font-semibold text-[#4A3728] transition-colors"
            >
              {copiedTracking ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-[#7C6E62]" />
                  <span>Copy ID</span>
                </>
              )}
            </button>
            <a
              href={`https://www.indiapost.gov.in/_layouts/15/dpt.cpt.tracking/trackconsignment.aspx`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors"
            >
              Track on Courier <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      )}

      {/* Full Details Collapsible: History & Shipping Details */}
      {showFullDetails && (
        <div className="space-y-4 pt-2 border-t border-[#E5E1DA]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Delivery Address */}
            <div className="bg-[#FAF9F6] p-4 rounded-2xl border border-[#E5E1DA] space-y-2 text-xs">
              <div className="font-bold text-[#4A3728] flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-[#C05D4D]" />
                Delivery Address
              </div>
              <p className="font-semibold text-[#4A3728]">
                {order.deliveryDetails?.buyerName || order.buyerName}
              </p>
              <p className="text-[#7C6E62] leading-relaxed">
                {order.deliveryDetails?.streetAddress}
                <br />
                {order.deliveryDetails?.city}, {order.deliveryDetails?.state} - {order.deliveryDetails?.pincode}
                {order.deliveryDetails?.landmark && (
                  <span className="block text-[11px] text-[#A89F91] mt-0.5">
                    Landmark: {order.deliveryDetails.landmark}
                  </span>
                )}
              </p>
              <div className="flex items-center gap-2 pt-1 text-[#7C6E62]">
                <Phone className="w-3 h-3 text-[#7C6E62]" />
                <span>+91 {order.deliveryDetails?.buyerMobile || order.buyerMobile}</span>
              </div>
            </div>

            {/* Artisan & Support Contact */}
            <div className="bg-[#FAF9F6] p-4 rounded-2xl border border-[#E5E1DA] space-y-2 text-xs">
              <div className="font-bold text-[#4A3728] flex items-center gap-1.5">
                <User className="w-4 h-4 text-[#C05D4D]" />
                Artisan / Creator
              </div>
              <p className="font-semibold text-[#4A3728]">{order.artisanName}</p>
              <p className="text-[#7C6E62]">
                Craft Category: {order.craftCategory || 'Authentic Handicraft'}
              </p>
              {order.customizationNotes && (
                <div className="bg-amber-50/70 p-2.5 rounded-xl border border-amber-200/60 text-[11px] text-amber-900 mt-1">
                  <strong>Custom Request:</strong> {order.customizationNotes}
                </div>
              )}
              <div className="pt-2 flex items-center gap-2 flex-wrap">
                {onOpenChat && (
                  <button
                    type="button"
                    onClick={() => onOpenChat({ productId: order.productId })}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#4A3728] hover:bg-[#382a1e] text-white font-semibold text-xs transition-colors shadow-xs cursor-pointer"
                    title="Chat with artisan safely with Scam Protection"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                    <span>In-App Chat</span>
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  </button>
                )}
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shadow-xs"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  WhatsApp
                </a>
              </div>
            </div>
          </div>

          {/* Status Timeline History Expander */}
          {order.statusHistory && order.statusHistory.length > 0 && (
            <div className="border border-[#E5E1DA] rounded-2xl overflow-hidden">
              <button
                type="button"
                id="btn-toggle-status-history"
                onClick={() => setShowHistory(!showHistory)}
                className="w-full flex items-center justify-between p-3.5 bg-[#FAF9F6] hover:bg-[#F4F1ED] text-xs font-bold text-[#4A3728] transition-colors"
              >
                <span>Complete Status Activity Log ({order.statusHistory.length} events)</span>
                {showHistory ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showHistory && (
                <div className="p-4 space-y-3 bg-white">
                  {order.statusHistory.map((item, i) => (
                    <div key={i} className="flex items-start gap-3 text-xs">
                      <div className="w-2 h-2 rounded-full bg-[#C05D4D] mt-1.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-[#4A3728] capitalize">
                            {item.status.replace(/_/g, ' ')}
                          </span>
                          <span className="text-[10px] text-[#7C6E62]">
                            {new Date(item.timestamp).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        {item.note && (
                          <p className="text-[#7C6E62] text-[11px] mt-0.5">
                            {item.note}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
