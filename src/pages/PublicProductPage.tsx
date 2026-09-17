import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ShieldCheck,
  Send,
  MessageSquare,
  Share2,
  Phone,
  Copy,
  Check,
  Globe2,
  Package,
  Heart,
  ExternalLink,
  MapPin,
  CheckCircle2,
  ArrowLeft,
  Download,
  Loader2,
  Camera,
  ShoppingBag,
  Truck,
  Calendar,
  Clock
} from 'lucide-react';
import { api, authState } from '../api';
import { Product, ALL_SUPPORTED_LANGUAGES } from '../types';
import { downloadCatalogImage } from '../utils/catalogImageGenerator';
import { ChatModal } from '../components/chat/ChatModal';
import { OrderNowModal } from '../components/orders/OrderNowModal';

interface PublicProductPageProps {
  slug: string;
  onNavigateHome: () => void;
  onNavigate?: (page: string, params?: any) => void;
}

export const PublicProductPage: React.FC<PublicProductPageProps> = ({
  slug,
  onNavigateHome,
  onNavigate
}) => {
  const [product, setProduct] = useState<Product | null>(null);
  const [artisan, setArtisan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeLang, setActiveLang] = useState<string>('te');

  // Buyer enquiry form state
  const [buyerName, setBuyerName] = useState('');
  const [buyerContact, setBuyerContact] = useState('');
  const [message, setMessage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [enquirySending, setEnquirySending] = useState(false);
  const [enquirySent, setEnquirySent] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isDownloadingCatalog, setIsDownloadingCatalog] = useState(false);
  const [catalogDownloaded, setCatalogDownloaded] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const currentUser = authState.getUser();

  useEffect(() => {
    loadPublicProduct();
  }, [slug]);

  const loadPublicProduct = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getPublicProduct(slug);
      setProduct(res.product);
      setArtisan(res.artisan);
    } catch (err: any) {
      setError(err.message || 'Product not found or not currently published.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendEnquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!buyerName || !buyerContact || !message) {
      alert('Please fill out your name, contact information, and message.');
      return;
    }

    setEnquirySending(true);
    try {
      await api.sendPublicEnquiry(slug, {
        buyerName,
        buyerContact,
        message,
        quantity: Number(quantity) || 1
      });
      setEnquirySent(true);
    } catch (err: any) {
      alert(err.message || 'Failed to send enquiry');
    } finally {
      setEnquirySending(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleOpenWhatsApp = () => {
    if (!product || !artisan) return;
    const text = encodeURIComponent(
      `Hello ${artisan.fullName}! I am interested in purchasing your handcrafted product "${product.title}" listed on CraftWise for ₹${product.price}. Could you please share delivery details?`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleDownloadCatalog = async () => {
    if (!product) return;
    try {
      setIsDownloadingCatalog(true);
      await downloadCatalogImage(
        product,
        artisan?.fullName || 'Verified Artisan',
        artisan?.district ? `${artisan.district}, ${artisan.state}` : 'Andhra Pradesh, India',
        {
          language: activeLang,
          publicUrl: window.location.href,
          artisanPhone: artisan?.mobile || '9999900001'
        }
      );
      setCatalogDownloaded(true);
      setTimeout(() => setCatalogDownloaded(false), 3000);
    } catch (err) {
      console.error('Failed to download catalog:', err);
      alert('Could not download catalog image.');
    } finally {
      setIsDownloadingCatalog(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-[#C05D4D] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-semibold text-[#7C6E62]">Loading Artisan Showcase...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center p-6 text-center">
        <div className="max-w-md bg-white p-8 rounded-3xl border border-[#E5E1DA] shadow-xs space-y-4">
          <Package className="w-12 h-12 text-[#C05D4D] mx-auto" />
          <h2 className="text-xl font-bold text-[#4A3728]">Product Not Available</h2>
          <p className="text-xs text-[#7C6E62]">
            {error || 'The requested handcrafted item is either not published or under review.'}
          </p>
          <button
            type="button"
            onClick={onNavigateHome}
            className="px-5 py-2.5 bg-[#4A3728] text-white text-xs font-bold rounded-xl"
          >
            Back to CraftWise Home
          </button>
        </div>
      </div>
    );
  }

  // Get localized content based on selected language
  const translation = product.translations?.[activeLang];
  const displayTitle = translation?.title || product.title;
  const displayShort = translation?.shortDescription || product.shortDescription;
  const displayDetailed = translation?.detailedDescription || product.detailedDescription;

  const [activeImageView, setActiveImageView] = useState<'original' | 'enhanced'>('original');

  const originalPic = product.primaryImage;
  const enhancedPic = product.enhancedImage;
  const hasDistinctEnhanced = Boolean(enhancedPic && enhancedPic !== originalPic);
  const displayImage = activeImageView === 'enhanced' && hasDistinctEnhanced ? enhancedPic : originalPic;

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#4A3728] pb-20">
      {/* Top Navigation Bar for Public Buyers */}
      <nav className="bg-white border-b border-[#E5E1DA] sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <button
            type="button"
            onClick={onNavigateHome}
            className="flex items-center gap-2 text-[#4A3728] hover:text-[#C05D4D] transition-colors font-serif text-lg font-bold"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#C05D4D] to-[#8C3E33] text-white flex items-center justify-center shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <span>CraftWise</span>
            <span className="text-[10px] uppercase font-bold text-[#C05D4D] bg-[#FAF9F6] border border-[#E5E1DA] px-2 py-0.5 rounded ml-1">
              Direct Artisan Link
            </span>
          </button>

          {/* Right Top Actions: Language */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Language Switcher for Buyer */}
            <div className="flex items-center gap-1.5 bg-[#FAF9F6] border border-[#E5E1DA] px-2.5 py-1.5 rounded-xl text-xs font-bold">
              <Globe2 className="w-3.5 h-3.5 text-[#C05D4D]" />
              <select
                id="public-product-lang-select"
                value={activeLang}
                onChange={(e) => setActiveLang(e.target.value)}
                className="bg-transparent border-none text-[#4A3728] focus:outline-none cursor-pointer font-bold pr-1 text-xs"
              >
                {ALL_SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.nativeName} ({lang.label})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Product Imagery */}
          <div className="lg:col-span-6 space-y-4">
            <div className="bg-white rounded-3xl border border-[#E5E1DA] overflow-hidden shadow-xs p-3 relative aspect-square flex items-center justify-center">
              <img
                src={displayImage}
                alt={displayTitle}
                className="w-full h-full object-contain rounded-2xl"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-5 left-5 bg-[#2D241E]/85 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Verified Handmade
              </div>

              {/* View Switcher Pill */}
              {hasDistinctEnhanced && (
                <div className="absolute top-5 right-5 flex bg-[#2D241E]/85 backdrop-blur-md p-1 rounded-xl border border-white/20 shadow-md">
                  <button
                    type="button"
                    onClick={() => setActiveImageView('original')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                      activeImageView === 'original'
                        ? 'bg-[#C05D4D] text-white shadow-xs'
                        : 'text-stone-300 hover:text-white'
                    }`}
                  >
                    <Camera className="w-3.5 h-3.5" />
                    Original Photo
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveImageView('enhanced')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                      activeImageView === 'enhanced'
                        ? 'bg-amber-500 text-stone-900 shadow-xs'
                        : 'text-stone-300 hover:text-white'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Studio View
                  </button>
                </div>
              )}

              {/* Badge indicating original artisan photo */}
              <div className="absolute bottom-5 left-5">
                <span className="px-3 py-1 rounded-full bg-black/65 backdrop-blur-xs text-white text-[11px] font-semibold flex items-center gap-1.5 shadow">
                  <Camera className="w-3 h-3 text-amber-300" />
                  {activeImageView === 'original' ? 'Artisan Original Camera Upload' : 'AI Studio Polish'}
                </span>
              </div>
            </div>

            {/* Sharing Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-white rounded-2xl border border-[#E5E1DA] text-xs gap-3">
              <span className="font-semibold text-[#7C6E62]">Share & Save Catalog:</span>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  id="public-download-catalog-btn"
                  disabled={isDownloadingCatalog}
                  onClick={handleDownloadCatalog}
                  className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#C05D4D] to-[#A34E41] hover:from-[#b04d3e] hover:to-[#923e32] text-white font-bold flex items-center gap-1.5 shadow-xs transition-colors disabled:opacity-75"
                >
                  {isDownloadingCatalog ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : catalogDownloaded ? (
                    <Check className="w-3.5 h-3.5 text-emerald-200" />
                  ) : (
                    <Download className="w-3.5 h-3.5" />
                  )}
                  <span>{catalogDownloaded ? 'Downloaded!' : 'Download Picture'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-3 py-1.5 rounded-lg border border-[#E5E1DA] text-[#4A3728] font-bold flex items-center gap-1 hover:bg-[#FAF9F6] transition-colors"
                >
                  {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedLink ? 'Copied' : 'Copy Link'}
                </button>

                <button
                  type="button"
                  onClick={handleOpenWhatsApp}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white font-bold flex items-center gap-1 hover:bg-emerald-700 shadow-xs transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" /> WhatsApp
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Details & Direct Enquiry */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-2">
              <span className="text-xs uppercase font-bold text-[#C05D4D] tracking-wider">
                {product.craftCategory}
              </span>
              <h1 className="font-serif italic text-3xl sm:text-4xl font-bold text-[#4A3728] leading-tight">
                {displayTitle}
              </h1>

              <div className="flex items-baseline gap-4 pt-2">
                <span className="text-3xl sm:text-4xl font-bold text-[#4A3728]">
                  ₹{product.price}
                </span>
                <span className="text-xs text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                  Direct Artisan Price (0% Commission)
                </span>
              </div>
            </div>

            {/* ORDER NOW HERO ACTION BOX */}
            <div className="bg-[#FAF9F6] border-2 border-[#C05D4D]/25 rounded-3xl p-5 space-y-4 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-1.5 text-xs text-[#7C6E62]">
                    <Clock className="w-3.5 h-3.5 text-[#C05D4D]" />
                    <span>Expected Delivery: <strong>Within 5–7 business days</strong></span>
                  </div>
                  <div className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1 mt-0.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Free Direct Courier & Tracking Support</span>
                  </div>
                </div>

                <button
                  type="button"
                  id="btn-public-product-order-now"
                  onClick={() => setOrderModalOpen(true)}
                  className="px-6 py-3.5 rounded-2xl bg-[#C05D4D] hover:bg-[#A34E41] text-white font-bold text-sm flex items-center justify-center gap-2.5 shadow-md shadow-[#C05D4D28] transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer shrink-0"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Order Now • ₹{product.price}</span>
                </button>
              </div>

              <div className="flex items-center justify-between text-[11px] text-[#7C6E62] pt-2 border-t border-[#E5E1DA]">
                <span>✅ Customization options available on order</span>
                <span>📦 Real-time Courier Tracking Updates</span>
              </div>
            </div>

            <p className="text-sm sm:text-base text-[#7C6E62] leading-relaxed">
              {displayShort}
            </p>

            {/* Artisan Story Card */}
            <div className="bg-[#FAF9F6] rounded-2xl p-4 border border-[#E5E1DA] flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#C05D4D] to-[#8C3E33] text-white font-bold text-lg flex items-center justify-center shrink-0 shadow-inner">
                {artisan?.fullName?.charAt(0) || 'A'}
              </div>
              <div className="space-y-0.5">
                <div className="text-xs font-bold uppercase tracking-wider text-[#7C6E62]">
                  Crafted by Master Artisan
                </div>
                <h4 className="font-bold text-sm text-[#4A3728]">{artisan?.fullName}</h4>
                <div className="text-xs text-[#7C6E62] flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#C05D4D]" />
                  {artisan?.district}, {artisan?.state}
                </div>
                {artisan?.cooperativeName && (
                  <div className="text-[11px] text-[#C05D4D] font-medium">
                    Group: {artisan.cooperativeName}
                  </div>
                )}
              </div>
            </div>

            {/* Materials & Attributes */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#4A3728]">
                Natural Materials & Craft Attributes
              </h4>
              <div className="flex flex-wrap gap-2">
                {(product.materials || ['Natural Raw Materials']).map((mat, i) => (
                  <span
                    key={i}
                    className="text-xs bg-white text-[#4A3728] font-medium px-3 py-1 rounded-lg border border-[#E5E1DA] shadow-2xs"
                  >
                    🌿 {mat}
                  </span>
                ))}
                {(product.handmadeAttributes || []).map((att, i) => (
                  <span
                    key={i}
                    className="text-xs bg-[#FBF6F0] text-[#8C3E33] font-medium px-3 py-1 rounded-lg border border-[#E5E1DA] shadow-2xs"
                  >
                    ✨ {att}
                  </span>
                ))}
              </div>
            </div>

            {/* Detailed Description */}
            <div className="space-y-2 pt-2 border-t border-[#E5E1DA]">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#4A3728]">
                Artisan Story & Technique
              </h4>
              <p className="text-xs sm:text-sm text-[#7C6E62] leading-relaxed">
                {displayDetailed}
              </p>
            </div>

            {/* Multilingual Buyer-Seller Chat & Bargaining CTA - Shown only to logged-in buyers or sellers */}
            {currentUser && (
              <div className="p-4.5 bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/10 border border-amber-300 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 shadow-2xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-950 uppercase tracking-wider">
                    <MessageSquare className="w-4 h-4 text-[#C05D4D]" />
                    <span>Direct Multilingual Chat & Bargaining</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <p className="text-xs text-[#7C6E62]">
                    Negotiate bulk pricing and ask questions directly. Auto-translates between all 9 CraftWise languages with 🎤 Voice speech-to-text.
                  </p>
                </div>

                <button
                  type="button"
                  id="public-product-chat-btn"
                  onClick={() => setChatOpen(true)}
                  className="px-5 py-2.5 bg-[#4A3728] hover:bg-[#382a1e] text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 shrink-0 cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4 text-amber-400" />
                  <span>Chat with Artisan</span>
                </button>
              </div>
            )}

            {/* Direct Enquiry Card */}
            <div className="bg-white rounded-3xl border border-[#C05D4D]/30 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-[#F0EDEA] pb-3">
                <h3 className="font-bold text-[#4A3728] text-base flex items-center gap-2">
                  <Send className="w-4 h-4 text-[#C05D4D]" />
                  Send Direct Enquiry to {artisan?.fullName}
                </h3>
                <span className="text-[11px] font-bold text-[#C05D4D] bg-[#FAF9F6] border border-[#E5E1DA] px-2 py-0.5 rounded">
                  Retail or Bulk
                </span>
              </div>

              {enquirySent ? (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                  <h4 className="font-bold text-sm text-emerald-950">
                    Enquiry Forwarded to Artisan!
                  </h4>
                  <p className="text-xs text-emerald-800">
                    {artisan?.fullName} has received your inquiry and contact details. They will contact you shortly to coordinate direct payment and shipping.
                  </p>
                  <button
                    type="button"
                    onClick={() => setEnquirySent(false)}
                    className="mt-2 text-xs font-bold text-emerald-700 underline"
                  >
                    Send another enquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSendEnquiry} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-[#4A3728] uppercase mb-1">
                        Your Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Ananya Sharma"
                        value={buyerName}
                        onChange={(e) => setBuyerName(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-xl border border-[#E5E1DA] bg-[#FAF9F6] focus:bg-white text-[#4A3728] focus:ring-2 focus:ring-[#C05D4D]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#4A3728] uppercase mb-1">
                        Contact (Phone or Email) *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 9845012345 or email@domain.com"
                        value={buyerContact}
                        onChange={(e) => setBuyerContact(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-xl border border-[#E5E1DA] bg-[#FAF9F6] focus:bg-white text-[#4A3728] focus:ring-2 focus:ring-[#C05D4D]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-1">
                      <label className="block text-[11px] font-bold text-[#4A3728] uppercase mb-1">
                        Quantity
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
                        className="w-full text-xs p-2.5 rounded-xl border border-[#E5E1DA] bg-[#FAF9F6] focus:bg-white text-[#4A3728] focus:ring-2 focus:ring-[#C05D4D]"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-[11px] font-bold text-[#4A3728] uppercase mb-1">
                        Delivery City / Message *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Bangalore. Looking for delivery by next week."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="w-full text-xs p-2.5 rounded-xl border border-[#E5E1DA] bg-[#FAF9F6] focus:bg-white text-[#4A3728] focus:ring-2 focus:ring-[#C05D4D]"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={enquirySending}
                    className="w-full py-3 bg-gradient-to-r from-[#C05D4D] to-[#A34E41] hover:from-[#b04d3e] hover:to-[#923e32] text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-all flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>{enquirySending ? 'Sending to Artisan...' : 'Send Direct Enquiry'}</span>
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Multilingual Buyer-Seller Chat Modal - Only active when logged in */}
      {currentUser && product && (
        <ChatModal
          isOpen={chatOpen}
          onClose={() => setChatOpen(false)}
          productId={product.id}
          currentUser={currentUser}
        />
      )}

      {/* Order Now Checkout Modal */}
      {product && (
        <OrderNowModal
          product={product}
          isOpen={orderModalOpen}
          onClose={() => setOrderModalOpen(false)}
          onNavigateToTracking={(orderId) => {
            if (onNavigate) {
              onNavigate('orders', { orderId });
            }
          }}
        />
      )}
    </div>
  );
};
