import React, { useState } from 'react';
import {
  X,
  ShoppingBag,
  Package,
  Calendar,
  Clock,
  MapPin,
  Phone,
  User as UserIcon,
  CheckCircle2,
  ShieldCheck,
  Truck,
  Sparkles,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { Product, Order, OrderDeliveryDetails } from '../../types';
import { api, authState } from '../../api';

interface OrderNowModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onOrderPlaced?: (order: Order) => void;
  onNavigateToTracking?: (orderId: string) => void;
}

export const OrderNowModal: React.FC<OrderNowModalProps> = ({
  product,
  isOpen,
  onClose,
  onOrderPlaced,
  onNavigateToTracking
}) => {
  const currentUser = authState.getUser();

  // Wizard steps: 'details' | 'confirmation' | 'success'
  const [step, setStep] = useState<'details' | 'confirmation' | 'success'>('details');

  const isOutOfStock = product.stock !== undefined && product.stock <= 0;
  const availableStock = product.stock !== undefined ? product.stock : 20;

  const [quantity, setQuantity] = useState<number>(1);
  const [customizationNotes, setCustomizationNotes] = useState<string>('');

  // Delivery details form state
  const [fullName, setFullName] = useState<string>(currentUser?.fullName || '');
  const [mobile, setMobile] = useState<string>(currentUser?.mobile || '');
  const [email, setEmail] = useState<string>(currentUser?.email && !currentUser?.email.includes('@artisan.craftwise') ? currentUser.email : '');
  const [streetAddress, setStreetAddress] = useState<string>(currentUser?.deliveryAddress || '');
  const [city, setCity] = useState<string>(currentUser?.city || '');
  const [state, setState] = useState<string>(currentUser?.state || 'Andhra Pradesh');
  const [pincode, setPincode] = useState<string>('');
  const [landmark, setLandmark] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'upi_on_delivery' | 'artisan_direct_upi'>('upi_on_delivery');
  const [deliveryNotes, setDeliveryNotes] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);

  if (!isOpen) return null;

  const unitPrice = product.price || 0;
  const subtotal = unitPrice * quantity;
  const deliveryFee = 0; // Free direct artisan shipping promotion
  const totalAmount = subtotal + deliveryFee;

  // Expected Delivery calculation (6 calendar days)
  const deliveryDateObj = new Date(Date.now() + 86400000 * 6);
  const expectedDeliveryString = deliveryDateObj.toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const validateDetailsForm = (): boolean => {
    setErrorMessage(null);

    if (isOutOfStock) {
      setErrorMessage('This craft item is currently out of stock.');
      return false;
    }

    if (quantity > availableStock) {
      setErrorMessage(`Only ${availableStock} items are available in stock.`);
      return false;
    }

    const cleanMobile = mobile.replace(/\D/g, '');
    if (cleanMobile.length < 10) {
      setErrorMessage('Please provide a valid 10-digit mobile number for dispatch updates.');
      return false;
    }

    if (!fullName.trim()) {
      setErrorMessage('Please enter your full recipient name.');
      return false;
    }

    if (!streetAddress.trim()) {
      setErrorMessage('Please enter your complete street address or house number.');
      return false;
    }

    if (!city.trim()) {
      setErrorMessage('Please specify your delivery city or district.');
      return false;
    }

    if (!pincode.trim() || pincode.trim().length < 6) {
      setErrorMessage('Please provide a valid 6-digit postal PIN code.');
      return false;
    }

    return true;
  };

  const handleProceedToConfirmation = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateDetailsForm()) {
      setStep('confirmation');
    }
  };

  const handleConfirmAndPlaceOrder = async () => {
    if (!validateDetailsForm()) {
      setStep('details');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMessage(null);

      const cleanMobile = mobile.replace(/\D/g, '');
      const deliveryDetails: OrderDeliveryDetails = {
        buyerName: fullName.trim(),
        buyerMobile: cleanMobile,
        buyerEmail: email.trim() || undefined,
        streetAddress: streetAddress.trim(),
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
        landmark: landmark.trim() || undefined,
        paymentMethod,
        deliveryNotes: deliveryNotes.trim() || undefined
      };

      const res = await api.createOrder({
        productId: product.id,
        quantity,
        customizationNotes: customizationNotes.trim() || undefined,
        deliveryDetails,
        buyerName: fullName.trim(),
        buyerMobile: cleanMobile
      });

      setPlacedOrder(res.order);
      setStep('success');
      if (onOrderPlaced) {
        onOrderPlaced(res.order);
      }
    } catch (err: any) {
      console.error('Order placement failed:', err);
      setErrorMessage(err.message || 'Failed to place order. Please check connection and try again.');
      setStep('details');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setStep('details');
    setPlacedOrder(null);
    setErrorMessage(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#E5E1DA] overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E1DA] bg-[#FAF9F6]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-[#C05D4D]/10 flex items-center justify-center text-[#C05D4D]">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#4A3728]">
                {step === 'success'
                  ? 'Order Confirmed!'
                  : step === 'confirmation'
                  ? 'Confirm Your Order'
                  : 'Place Artisan Order'}
              </h2>
              <p className="text-xs text-[#7C6E62]">
                {step === 'success'
                  ? 'Your handmade craft order is confirmed'
                  : step === 'confirmation'
                  ? 'Please review product, artisan, and delivery details before placing'
                  : 'Direct craft purchase • 100% of proceeds support the creator'}
              </p>
            </div>
          </div>
          <button
            id="btn-close-order-modal"
            onClick={handleResetAndClose}
            className="p-2 rounded-xl text-[#7C6E62] hover:text-[#4A3728] hover:bg-[#F4F1ED] transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STEP 3: SUCCESS STATE */}
        {step === 'success' && placedOrder && (
          <div className="p-6 sm:p-8 space-y-6 text-center">
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                Order Placed Successfully
              </div>
              <h3 className="text-2xl font-bold text-[#4A3728]">
                Order {placedOrder.orderNumber}
              </h3>
              <p className="text-sm text-[#7C6E62] max-w-md mx-auto">
                Thank you, <strong className="text-[#4A3728]">{placedOrder.buyerName}</strong>! We have notified artisan{' '}
                <strong className="text-[#4A3728]">{placedOrder.artisanName}</strong> to review and begin handcrafting your order.
              </p>
            </div>

            {/* Order Card Preview */}
            <div className="bg-[#FAF9F6] p-4 rounded-2xl border border-[#E5E1DA] text-left flex flex-col sm:flex-row items-center gap-4">
              <img
                src={placedOrder.productImage || product.primaryImage}
                alt={placedOrder.productTitle}
                className="w-20 h-20 rounded-xl object-cover border border-[#E5E1DA] shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm text-[#4A3728] truncate">
                  {placedOrder.productTitle}
                </h4>
                <div className="text-xs text-[#7C6E62] mt-0.5">
                  Quantity: {placedOrder.quantity} • Total: <strong className="text-[#C05D4D]">₹{placedOrder.totalAmount}</strong>
                </div>
                <div className="flex items-center gap-3 text-xs text-[#7C6E62] mt-2">
                  <span className="flex items-center gap-1 text-[#C05D4D] font-medium">
                    <Calendar className="w-3.5 h-3.5" />
                    Expected Delivery: {placedOrder.expectedDeliveryDate}
                  </span>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 text-left space-y-1.5">
              <div className="font-bold flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-amber-700" />
                Live Status & Updates
              </div>
              <p>
                You will receive status notifications for mobile <strong>+91 {placedOrder.buyerMobile}</strong> as the artisan accepts, crafts, and dispatches your order.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                id="btn-track-new-order"
                onClick={() => {
                  if (onNavigateToTracking) {
                    onNavigateToTracking(placedOrder.id);
                  }
                  handleResetAndClose();
                }}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-5 rounded-2xl bg-[#C05D4D] hover:bg-[#A34E41] text-white font-semibold text-sm transition-all shadow-md shadow-[#C05D4D22]"
              >
                Track My Order Now
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                id="btn-continue-shopping"
                onClick={handleResetAndClose}
                className="py-3 px-5 rounded-2xl border border-[#E5E1DA] hover:bg-[#FAF9F6] text-[#7C6E62] font-semibold text-sm transition-all"
              >
                Continue Browsing
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: ORDER CONFIRMATION SCREEN */}
        {step === 'confirmation' && (
          <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
            {errorMessage && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Order Request & Payment Arrangement:</span>{' '}
                This order will be sent directly to the artisan. Payment of <strong className="text-[#C05D4D]">₹{totalAmount}</strong> is arranged upon delivery or via direct UPI — no advance card deduction.
              </div>
            </div>

            {/* Product & Artisan Summary Card */}
            <div className="bg-[#FAF9F6] p-4 rounded-2xl border border-[#E5E1DA] space-y-4">
              <div className="flex items-start gap-4">
                <img
                  src={product.primaryImage || product.enhancedImage}
                  alt={product.title}
                  className="w-20 h-20 rounded-xl object-cover border border-[#E5E1DA] shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold tracking-wider uppercase text-[#C05D4D] bg-[#C05D4D]/10 px-2 py-0.5 rounded-md">
                    {product.craftCategory || 'Authentic Craft'}
                  </span>
                  <h3 className="text-base font-bold text-[#4A3728] mt-1">
                    {product.title}
                  </h3>
                  <div className="text-xs text-[#7C6E62] mt-1 space-y-0.5">
                    <div>Price per unit: <strong className="text-[#4A3728]">₹{unitPrice}</strong></div>
                    <div>Quantity selected: <strong className="text-[#4A3728]">{quantity} unit{quantity > 1 ? 's' : ''}</strong></div>
                  </div>
                </div>
              </div>

              {/* Artisan Details */}
              <div className="pt-3 border-t border-[#E5E1DA] flex items-center justify-between text-xs">
                <div>
                  <span className="text-[#7C6E62] block text-[11px]">Handcrafted by Artisan:</span>
                  <span className="font-bold text-[#4A3728] flex items-center gap-1.5 mt-0.5">
                    <UserIcon className="w-3.5 h-3.5 text-[#C05D4D]" />
                    {product.artisanName || 'Master Indian Artisan'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[#7C6E62] block text-[11px]">Delivery Estimate:</span>
                  <span className="font-bold text-emerald-700 flex items-center gap-1 justify-end mt-0.5">
                    <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                    {expectedDeliveryString}
                  </span>
                </div>
              </div>
            </div>

            {/* Delivery Details Summary */}
            <div className="bg-white p-4 rounded-2xl border border-[#E5E1DA] space-y-2 text-xs">
              <h4 className="font-bold text-[#4A3728] flex items-center gap-1.5 text-xs uppercase tracking-wider">
                <MapPin className="w-3.5 h-3.5 text-[#C05D4D]" />
                Delivery Details
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[#7C6E62] pt-1">
                <div>
                  <span className="text-[11px] block text-[#A89F91]">Recipient:</span>
                  <span className="font-semibold text-[#4A3728]">{fullName}</span>
                </div>
                <div>
                  <span className="text-[11px] block text-[#A89F91]">Phone:</span>
                  <span className="font-semibold text-[#4A3728]">+91 {mobile.replace(/\D/g, '')}</span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-[11px] block text-[#A89F91]">Delivery Address:</span>
                  <span className="font-medium text-[#4A3728]">
                    {streetAddress}, {city}, {state} - {pincode}
                    {landmark ? ` (Landmark: ${landmark})` : ''}
                  </span>
                </div>
                <div>
                  <span className="text-[11px] block text-[#A89F91]">Payment Method:</span>
                  <span className="font-semibold text-[#4A3728]">
                    {paymentMethod === 'upi_on_delivery'
                      ? 'UPI on Delivery (Scan QR)'
                      : paymentMethod === 'cod'
                      ? 'Cash on Delivery (COD)'
                      : 'Direct Artisan UPI Transfer'}
                  </span>
                </div>
                {customizationNotes && (
                  <div>
                    <span className="text-[11px] block text-[#A89F91]">Customization:</span>
                    <span className="font-medium text-[#4A3728]">{customizationNotes}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Price Calculation */}
            <div className="bg-[#FAF9F6] p-4 rounded-2xl border border-[#E5E1DA] space-y-2 text-xs">
              <div className="flex justify-between text-[#7C6E62]">
                <span>Product Subtotal ({quantity} x ₹{unitPrice}):</span>
                <span className="font-semibold text-[#4A3728]">₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-[#7C6E62]">
                <span>Artisan Packaging & Shipping:</span>
                <span className="text-emerald-700 font-bold">FREE (Direct Promotion)</span>
              </div>
              <div className="flex justify-between text-base font-bold text-[#4A3728] pt-2 border-t border-[#E5E1DA]">
                <span>Total Amount Due:</span>
                <span className="text-[#C05D4D] text-lg">₹{totalAmount}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                id="btn-back-to-edit"
                onClick={() => setStep('details')}
                disabled={isSubmitting}
                className="py-3 px-5 rounded-2xl border border-[#E5E1DA] text-xs font-semibold text-[#7C6E62] hover:bg-[#FAF9F6] transition-colors"
              >
                ← Back to Edit Details
              </button>
              <button
                type="button"
                id="btn-final-confirm-order"
                onClick={handleConfirmAndPlaceOrder}
                disabled={isSubmitting}
                className="flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-2xl bg-[#C05D4D] hover:bg-[#A34E41] text-white text-sm font-bold transition-all shadow-md shadow-[#C05D4D22] disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Confirming Order...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    Confirm & Place Order (₹{totalAmount})
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 1: QUANTITY & DELIVERY FORM */}
        {step === 'details' && (
          <form onSubmit={handleProceedToConfirmation} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
            {/* Product Summary Banner */}
            <div className="flex items-start gap-4 p-3.5 bg-[#FAF9F6] rounded-2xl border border-[#E5E1DA]">
              <img
                src={product.primaryImage || product.enhancedImage}
                alt={product.title}
                className="w-16 h-16 rounded-xl object-cover border border-[#E5E1DA] shrink-0"
              />
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-bold tracking-wider uppercase text-[#C05D4D] bg-[#C05D4D]/10 px-2 py-0.5 rounded-md">
                  {product.craftCategory || 'Authentic Craft'}
                </span>
                <h3 className="text-sm font-bold text-[#4A3728] truncate mt-1">
                  {product.title}
                </h3>
                <div className="flex items-center gap-3 text-xs text-[#7C6E62] mt-0.5">
                  <span className="font-bold text-[#C05D4D] text-sm">₹{unitPrice}</span>
                  <span>•</span>
                  {isOutOfStock ? (
                    <span className="font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-md border border-red-200">
                      Out of Stock
                    </span>
                  ) : (
                    <span className="text-emerald-700 font-medium">
                      In Stock ({availableStock} available)
                    </span>
                  )}
                </div>
              </div>
            </div>

            {errorMessage && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Step 1: Quantity & Customization */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-xs font-bold text-[#4A3728] uppercase tracking-wider block">
                    1. Order Quantity
                  </label>
                  <span className="text-[11px] text-[#7C6E62]">Select number of handcrafted pieces</span>
                </div>
                <div className="flex items-center gap-2 bg-[#F4F1ED] p-1 rounded-xl border border-[#E5E1DA]">
                  <button
                    type="button"
                    id="btn-qty-minus"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1 || isOutOfStock}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-white text-[#4A3728] font-bold disabled:opacity-40 hover:bg-[#E5E1DA] transition-colors"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-sm font-bold text-[#4A3728]">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    id="btn-qty-plus"
                    onClick={() => {
                      setQuantity(Math.min(availableStock, quantity + 1));
                    }}
                    disabled={quantity >= availableStock || isOutOfStock}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-white text-[#4A3728] font-bold disabled:opacity-40 hover:bg-[#E5E1DA] transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#7C6E62] mb-1">
                  Artisan Customization / Special Requests (Optional)
                </label>
                <textarea
                  id="input-order-customization"
                  value={customizationNotes}
                  onChange={(e) => setCustomizationNotes(e.target.value)}
                  placeholder="e.g. Please add initials, specify dimensions, or request eco-friendly gift wrap"
                  rows={2}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-[#E5E1DA] bg-white text-[#4A3728] placeholder-[#A89F91] focus:outline-none focus:ring-2 focus:ring-[#C05D4D]/20 focus:border-[#C05D4D]"
                />
              </div>
            </div>

            {/* Step 2: Delivery Details */}
            <div className="space-y-3 pt-2 border-t border-[#E5E1DA]">
              <label className="block text-xs font-bold text-[#4A3728] uppercase tracking-wider">
                2. Shipping & Contact Details
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-[#7C6E62] mb-1">
                    Full Name *
                  </label>
                  <div className="relative">
                    <UserIcon className="w-3.5 h-3.5 text-[#7C6E62] absolute left-3 top-2.5" />
                    <input
                      type="text"
                      id="input-buyer-fullname"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Ananya Sharma"
                      className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-[#E5E1DA] bg-white text-[#4A3728] focus:outline-none focus:ring-2 focus:ring-[#C05D4D]/20 focus:border-[#C05D4D]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#7C6E62] mb-1">
                    Mobile Phone (For Dispatch Updates) *
                  </label>
                  <div className="relative">
                    <Phone className="w-3.5 h-3.5 text-[#7C6E62] absolute left-3 top-2.5" />
                    <input
                      type="tel"
                      id="input-buyer-mobile"
                      required
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      placeholder="9845012345"
                      maxLength={12}
                      className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-[#E5E1DA] bg-white text-[#4A3728] focus:outline-none focus:ring-2 focus:ring-[#C05D4D]/20 focus:border-[#C05D4D]"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#7C6E62] mb-1">
                  Street Address / House No / Colony *
                </label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 text-[#7C6E62] absolute left-3 top-2.5" />
                  <input
                    type="text"
                    id="input-buyer-street"
                    required
                    value={streetAddress}
                    onChange={(e) => setStreetAddress(e.target.value)}
                    placeholder="House #42, 4th Cross, Indiranagar"
                    className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-[#E5E1DA] bg-white text-[#4A3728] focus:outline-none focus:ring-2 focus:ring-[#C05D4D]/20 focus:border-[#C05D4D]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-[#7C6E62] mb-1">
                    City / Town *
                  </label>
                  <input
                    type="text"
                    id="input-buyer-city"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Bangalore"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5E1DA] bg-white text-[#4A3728] focus:outline-none focus:ring-2 focus:ring-[#C05D4D]/20 focus:border-[#C05D4D]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-[#7C6E62] mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    id="input-buyer-state"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="Karnataka"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5E1DA] bg-white text-[#4A3728] focus:outline-none focus:ring-2 focus:ring-[#C05D4D]/20 focus:border-[#C05D4D]"
                  />
                </div>

                <div className="col-span-2 sm:col-span-1">
                  <label className="block text-[11px] font-medium text-[#7C6E62] mb-1">
                    PIN Code *
                  </label>
                  <input
                    type="text"
                    id="input-buyer-pincode"
                    required
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="560038"
                    maxLength={6}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5E1DA] bg-white text-[#4A3728] focus:outline-none focus:ring-2 focus:ring-[#C05D4D]/20 focus:border-[#C05D4D]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-[#7C6E62] mb-1">
                  Nearby Landmark / Delivery Notes (Optional)
                </label>
                <input
                  type="text"
                  id="input-buyer-landmark"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="Near Post Office / Call on arrival"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#E5E1DA] bg-white text-[#4A3728] focus:outline-none focus:ring-2 focus:ring-[#C05D4D]/20 focus:border-[#C05D4D]"
                />
              </div>
            </div>

            {/* Step 3: Payment Method */}
            <div className="space-y-2 pt-2 border-t border-[#E5E1DA]">
              <label className="block text-xs font-bold text-[#4A3728] uppercase tracking-wider">
                3. Payment Option (Arranged upon delivery)
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <label
                  className={`flex items-center gap-2 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                    paymentMethod === 'upi_on_delivery'
                      ? 'border-[#C05D4D] bg-[#C05D4D]/5 text-[#4A3728] font-bold'
                      : 'border-[#E5E1DA] text-[#7C6E62] hover:bg-[#FAF9F6]'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="upi_on_delivery"
                    checked={paymentMethod === 'upi_on_delivery'}
                    onChange={() => setPaymentMethod('upi_on_delivery')}
                    className="text-[#C05D4D] focus:ring-[#C05D4D]"
                  />
                  <span>UPI on Delivery (Scan QR)</span>
                </label>

                <label
                  className={`flex items-center gap-2 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                    paymentMethod === 'cod'
                      ? 'border-[#C05D4D] bg-[#C05D4D]/5 text-[#4A3728] font-bold'
                      : 'border-[#E5E1DA] text-[#7C6E62] hover:bg-[#FAF9F6]'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="text-[#C05D4D] focus:ring-[#C05D4D]"
                  />
                  <span>Cash on Delivery (COD)</span>
                </label>

                <label
                  className={`flex items-center gap-2 p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                    paymentMethod === 'artisan_direct_upi'
                      ? 'border-[#C05D4D] bg-[#C05D4D]/5 text-[#4A3728] font-bold'
                      : 'border-[#E5E1DA] text-[#7C6E62] hover:bg-[#FAF9F6]'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="artisan_direct_upi"
                    checked={paymentMethod === 'artisan_direct_upi'}
                    onChange={() => setPaymentMethod('artisan_direct_upi')}
                    className="text-[#C05D4D] focus:ring-[#C05D4D]"
                  />
                  <span>Direct Artisan UPI</span>
                </label>
              </div>
            </div>

            {/* Price & ETA Breakdown */}
            <div className="bg-[#FAF9F6] p-4 rounded-2xl border border-[#E5E1DA] space-y-2 text-xs">
              <div className="flex justify-between text-[#7C6E62]">
                <span>Items ({quantity}x):</span>
                <span className="font-semibold text-[#4A3728]">₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-[#7C6E62]">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Artisan Shipping Support:
                </span>
                <span className="text-emerald-700 font-bold">FREE</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-[#4A3728] pt-2 border-t border-[#E5E1DA]">
                <span>Total Amount:</span>
                <span className="text-[#C05D4D] text-base">₹{totalAmount}</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-[#7C6E62] pt-1">
                <Clock className="w-3.5 h-3.5 text-[#C05D4D]" />
                <span>
                  Expected Delivery: <strong>{expectedDeliveryString}</strong> (5-7 business days)
                </span>
              </div>
            </div>

            {/* Review and Proceed Action */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                id="btn-cancel-order"
                onClick={handleResetAndClose}
                className="py-2.5 px-4 rounded-xl border border-[#E5E1DA] text-xs font-semibold text-[#7C6E62] hover:bg-[#FAF9F6] transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                id="btn-review-order"
                disabled={isOutOfStock}
                className="flex items-center gap-2 py-3 px-6 rounded-xl bg-[#C05D4D] hover:bg-[#A34E41] text-white text-xs font-bold transition-all shadow-md shadow-[#C05D4D22] disabled:opacity-50"
              >
                {isOutOfStock ? (
                  'Item Out of Stock'
                ) : (
                  <>
                    Review Order Details
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
