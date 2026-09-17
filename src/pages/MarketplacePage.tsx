import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  SlidersHorizontal,
  Tag,
  MapPin,
  Store,
  MessageSquare,
  ShoppingBag,
  Eye,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  ArrowUpDown,
  ShieldCheck,
  UserCheck,
  Phone,
  RefreshCw,
  Send,
  X,
  PackageCheck,
  Camera,
  Truck
} from 'lucide-react';
import { api, authState } from '../api';
import { MarketplaceProductItem, Product, User } from '../types';
import { ChatModal } from '../components/chat/ChatModal';
import { OrderNowModal } from '../components/orders/OrderNowModal';

interface MarketplacePageProps {
  onNavigate: (page: string, params?: any) => void;
  initialCategory?: string;
}

const MarketplaceProductCard: React.FC<{
  item: MarketplaceProductItem;
  onNavigate: (page: string, params?: any) => void;
  onOpenEnquiry: (item: MarketplaceProductItem) => void;
  onOpenChat: (item: MarketplaceProductItem) => void;
  onOpenOrder: (item: MarketplaceProductItem) => void;
  isLoggedIn?: boolean;
}> = ({ item, onNavigate, onOpenEnquiry, onOpenChat, onOpenOrder, isLoggedIn }) => {
  const { product, artisan } = item;
  // By default, display the authentic original picture posted by the artisan!
  const [viewMode, setViewMode] = useState<'original' | 'enhanced'>('original');
  const originalPic = product.primaryImage;
  const enhancedPic = product.enhancedImage;
  const hasDistinctEnhanced = Boolean(enhancedPic && enhancedPic !== originalPic);
  const activeImage = viewMode === 'enhanced' && hasDistinctEnhanced ? enhancedPic : originalPic;

  return (
    <div className="bg-white rounded-2xl border border-[#E5E1DA] overflow-hidden flex flex-col hover:border-[#C05D4D] hover:shadow-md transition-all duration-200 group">
      {/* Craft Image with Artisan Photo Tag */}
      <div className="relative aspect-4/3 bg-[#F4F1ED] overflow-hidden">
        <img
          src={activeImage}
          alt={product.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Category Tag */}
        <div className="absolute top-2.5 left-2.5">
          <span className="px-2.5 py-1 rounded-md bg-[#2D241E]/80 backdrop-blur-xs text-white text-[10px] font-bold uppercase tracking-wider">
            {product.craftCategory || 'Handicraft'}
          </span>
        </div>

        {/* View Mode Toggle / Original Photo Badge */}
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1">
          {hasDistinctEnhanced ? (
            <div className="flex bg-[#2D241E]/85 backdrop-blur-xs p-0.5 rounded-lg border border-white/20">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setViewMode('original');
                }}
                className={`px-2 py-0.5 rounded text-[9px] font-bold transition-all flex items-center gap-1 ${
                  viewMode === 'original'
                    ? 'bg-[#C05D4D] text-white shadow-xs'
                    : 'text-stone-300 hover:text-white'
                }`}
                title="View authentic original picture posted by artisan"
              >
                <Camera className="w-2.5 h-2.5" />
                Original
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setViewMode('enhanced');
                }}
                className={`px-2 py-0.5 rounded text-[9px] font-bold transition-all flex items-center gap-1 ${
                  viewMode === 'enhanced'
                    ? 'bg-amber-500 text-stone-900 shadow-xs'
                    : 'text-stone-300 hover:text-white'
                }`}
                title="View studio-enhanced lighting & clarity"
              >
                <Sparkles className="w-2.5 h-2.5" />
                Enhanced
              </button>
            </div>
          ) : (
            <span className="px-2 py-0.5 rounded-md bg-emerald-700/90 text-white text-[10px] font-bold flex items-center gap-1 shadow-xs">
              <Camera className="w-3 h-3 text-amber-300" />
              Artisan Original
            </span>
          )}
        </div>

        {/* Bottom Banner on Image indicating authenticity */}
        <div className="absolute bottom-2 left-2.5">
          <span className="px-2 py-0.5 rounded bg-black/60 backdrop-blur-xs text-white text-[9px] font-medium flex items-center gap-1">
            {viewMode === 'original' ? '📷 Artisan Original Photo' : '✨ Studio View'}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Title */}
          <h4
            onClick={() => onNavigate('public-product', { slug: product.slug })}
            className="font-serif font-bold text-base text-[#4A3728] line-clamp-1 cursor-pointer group-hover:text-[#C05D4D] transition-colors"
          >
            {product.title}
          </h4>

          {/* Description excerpt */}
          <p className="text-xs text-[#7C6E62] line-clamp-2 mt-1">
            {product.shortDescription ||
              product.detailedDescription ||
              'Authentic handmade creation crafted using traditional methods.'}
          </p>

          {/* Artisan / Seller Badge */}
          <div className="mt-3 pt-3 border-t border-[#F0EDEA] flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#E5E1DA] text-[#4A3728] flex items-center justify-center font-bold text-xs shrink-0">
                {artisan.fullName?.charAt(0) || 'A'}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-[#4A3728] truncate">{artisan.fullName}</p>
                <p className="text-[10px] text-[#7C6E62] flex items-center gap-1 truncate">
                  <MapPin className="w-2.5 h-2.5 shrink-0 text-[#C05D4D]" />
                  {artisan.district || artisan.state}, {artisan.state}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing and Action Buttons */}
        <div className="mt-4 pt-3 border-t border-[#F0EDEA] flex items-center justify-between gap-2">
          <div>
            <span className="text-[10px] text-[#7C6E62] uppercase font-bold tracking-wider block">
              Direct Fair Price
            </span>
            <span className="text-lg font-bold text-[#C05D4D]">
              ₹{(product.price || 0).toLocaleString('en-IN')}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Order Now Button */}
            <button
              id={`order-now-btn-${product.id}`}
              type="button"
              onClick={() => onOpenOrder(item)}
              className="px-3 py-2 rounded-xl bg-[#C05D4D] hover:bg-[#A34E41] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer shrink-0"
              title="Order Product with Live Courier Tracking"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Order Now</span>
            </button>

            {/* Multilingual Buyer-Seller Chat Button - Shown only to logged-in users */}
            {isLoggedIn && (
              <button
                id={`chat-btn-${product.id}`}
                type="button"
                onClick={() => onOpenChat(item)}
                className="px-2.5 py-2 rounded-xl bg-[#4A3728] hover:bg-[#382a1e] text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                title="Chat in 9 Indian Languages with Voice & Price Bargaining"
              >
                <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Chat</span>
              </button>
            )}

            {/* Direct Enquiry Button */}
            <button
              id={`enquire-btn-${product.id}`}
              onClick={() => onOpenEnquiry(item)}
              className="px-2.5 py-2 rounded-xl border border-[#E5E1DA] hover:border-[#C05D4D] text-[#4A3728] text-xs font-bold transition-all hover:bg-[#FAF9F6] flex items-center gap-1"
              title="Send Bulk or Retail Enquiry"
            >
              <span>Enquire</span>
            </button>

            {/* Public View link */}
            <button
              onClick={() => onNavigate('public-product', { slug: product.slug })}
              className="p-2 rounded-xl border border-[#E5E1DA] hover:border-[#C05D4D] text-[#7C6E62] hover:text-[#C05D4D] transition-colors flex items-center"
              title="View Full Story & Details"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export const MarketplacePage: React.FC<MarketplacePageProps> = ({
  onNavigate,
  initialCategory = 'all'
}) => {
  const [products, setProducts] = useState<MarketplaceProductItem[]>([]);
  const [categories, setCategories] = useState<Array<{ name: string; count: number; description?: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedState, setSelectedState] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('featured');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');

  // Enquiry Modal state
  const [selectedItemForEnquiry, setSelectedItemForEnquiry] = useState<MarketplaceProductItem | null>(null);
  const [enquiryBuyerName, setEnquiryBuyerName] = useState<string>('');
  const [enquiryBuyerContact, setEnquiryBuyerContact] = useState<string>('');
  const [enquiryQuantity, setEnquiryQuantity] = useState<number>(1);
  const [enquiryMessage, setEnquiryMessage] = useState<string>('');
  const [enquirySubmitting, setEnquirySubmitting] = useState(false);
  const [enquirySuccess, setEnquirySuccess] = useState<string | null>(null);
  const [enquiryError, setEnquiryError] = useState<string | null>(null);

  // My Enquiries drawer / view (for logged-in buyers)
  const [showMyEnquiries, setShowMyEnquiries] = useState(false);
  const [myEnquiries, setMyEnquiries] = useState<any[]>([]);
  const [loadingEnquiries, setLoadingEnquiries] = useState(false);

  // Multilingual Chat Modal state
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [activeChatProductId, setActiveChatProductId] = useState<string | undefined>(undefined);
  const [activeChatConversationId, setActiveChatConversationId] = useState<string | undefined>(undefined);

  // Order Placement Modal state
  const [orderModalProduct, setOrderModalProduct] = useState<Product | null>(null);

  const currentUser = authState.getUser();
  const isBuyer = currentUser?.role === 'buyer';

  // Pre-fill enquiry fields if user is logged in
  useEffect(() => {
    if (currentUser) {
      setEnquiryBuyerName(currentUser.fullName);
      setEnquiryBuyerContact(currentUser.mobile || currentUser.email);
    }
  }, [currentUser]);

  // Fetch Categories
  const fetchCategories = async () => {
    try {
      const res = await api.getMarketplaceCategories();
      setCategories(res.categories);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  // Fetch Marketplace Products
  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getMarketplaceProducts({
        category: selectedCategory,
        search: searchQuery.trim() || undefined,
        state: selectedState !== 'all' ? selectedState : undefined,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        sortBy
      });
      setProducts(res.products);
    } catch (err: any) {
      setError(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, selectedState, sortBy]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts();
  };

  const handleClearFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    setSelectedState('all');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('featured');
  };

  // Open Enquiry Modal
  const handleOpenEnquiry = (item: MarketplaceProductItem) => {
    setSelectedItemForEnquiry(item);
    setEnquirySuccess(null);
    setEnquiryError(null);
    setEnquiryQuantity(1);
    setEnquiryMessage(
      `Hello ${item.artisan.fullName}, I am interested in purchasing your "${item.product.title}". Could you share details regarding shipping and bulk customization?`
    );
  };

  const handleOpenChat = (item?: MarketplaceProductItem) => {
    setActiveChatProductId(item?.product.id);
    setActiveChatConversationId(undefined);
    setChatModalOpen(true);
  };

  const handleSubmitEnquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemForEnquiry) return;
    if (!enquiryBuyerName.trim() || !enquiryBuyerContact.trim()) {
      setEnquiryError('Please provide your name and contact details.');
      return;
    }

    setEnquirySubmitting(true);
    setEnquiryError(null);

    try {
      await api.sendPublicEnquiry(selectedItemForEnquiry.product.slug, {
        buyerName: enquiryBuyerName,
        buyerContact: enquiryBuyerContact,
        message: enquiryMessage,
        quantity: enquiryQuantity
      });
      setEnquirySuccess(`Your enquiry was sent directly to ${selectedItemForEnquiry.artisan.fullName}!`);
      setTimeout(() => {
        setSelectedItemForEnquiry(null);
        setEnquirySuccess(null);
      }, 2500);
    } catch (err: any) {
      setEnquiryError(err.message || 'Could not send enquiry. Please try again.');
    } finally {
      setEnquirySubmitting(false);
    }
  };

  // Fetch Buyer's own enquiries
  const loadMyEnquiries = async () => {
    setLoadingEnquiries(true);
    try {
      const contact = currentUser?.mobile || currentUser?.email || '';
      const res = await api.getBuyerEnquiries(contact);
      setMyEnquiries(res.enquiries);
    } catch (err) {
      console.error('Failed to load buyer enquiries:', err);
    } finally {
      setLoadingEnquiries(false);
    }
  };

  const handleToggleMyEnquiries = () => {
    setShowMyEnquiries(!showMyEnquiries);
    if (!showMyEnquiries) {
      loadMyEnquiries();
    }
  };

  // Unique states from current products or standard Indian craft hubs
  const craftStates = [
    'All States',
    'Andhra Pradesh',
    'West Bengal',
    'Karnataka',
    'Odisha',
    'Rajasthan',
    'Uttar Pradesh',
    'Assam'
  ];

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      {/* Top Banner Header */}
      <div className="bg-[#2D241E] text-white py-12 px-4 sm:px-6 lg:px-8 border-b border-[#3D322A]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C05D4D22] border border-[#C05D4D55] text-orange-200 text-xs font-semibold mb-3">
                <Sparkles className="w-3.5 h-3.5 text-[#C05D4D]" />
                Direct Artisan-to-Buyer Marketplace
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-white">
                Discover Authentic Indian Crafts
              </h1>
              <p className="mt-2 text-sm sm:text-base text-[#D4CDC5] max-w-2xl">
                Browse GI-tagged handmade creations directly from verified master artisans across India.
                Zero middleman commissions, 100% fair artisan compensation.
              </p>
            </div>

            {/* Buyer Action Cards */}
            <div className="flex flex-wrap items-center gap-3">
              {currentUser && (
                <button
                  id="marketplace-open-chat-btn"
                  onClick={() => {
                    setActiveChatProductId(undefined);
                    setChatModalOpen(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-xs font-bold border border-amber-400/40 transition-all shadow-xs cursor-pointer"
                  title="Multilingual Chat & Price Bargaining"
                >
                  <MessageSquare className="w-4 h-4 text-amber-300" />
                  <span>Buyer-Seller Chat (9 Languages)</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </button>
              )}

              {currentUser ? (
                <div className="flex items-center gap-2">
                  <button
                    id="btn-marketplace-track-orders"
                    type="button"
                    onClick={() => onNavigate('orders')}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-xs font-bold border border-amber-400/40 transition-all shadow-xs cursor-pointer"
                  >
                    <Truck className="w-4 h-4 text-amber-300" />
                    <span>Track Orders</span>
                  </button>

                  <button
                    id="buyer-my-enquiries-btn"
                    onClick={handleToggleMyEnquiries}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition-all shadow-xs"
                  >
                    <MessageSquare className="w-4 h-4 text-orange-300" />
                    <span>My Enquiries</span>
                    {myEnquiries.length > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full bg-[#C05D4D] text-white text-[10px] font-bold">
                        {myEnquiries.length}
                      </span>
                    )}
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    id="btn-marketplace-track-orders-guest"
                    type="button"
                    onClick={() => onNavigate('orders')}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition-all shadow-xs cursor-pointer"
                  >
                    <Truck className="w-4 h-4 text-amber-300" />
                    <span>Track Order</span>
                  </button>

                  <button
                    onClick={() => onNavigate('register')}
                    className="px-4 py-2.5 rounded-xl bg-[#C05D4D] hover:bg-[#A34E41] text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Join as Buyer or Artisan</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Search & Filter Bar */}
          <form onSubmit={handleSearchSubmit} className="mt-8 grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-6 relative">
              <input
                type="text"
                id="marketplace-search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by craft, product name, technique (e.g. Ikat, Terracotta, Dokra)..."
                className="w-full pl-10 pr-4 py-3 bg-white text-[#4A3728] placeholder-[#9C8E82] text-sm rounded-xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-[#C05D4D]"
              />
              <Search className="w-4 h-4 text-[#7C6E62] absolute left-3.5 top-1/2 -translate-y-1/2" />
            </div>

            <div className="sm:col-span-3">
              <select
                id="marketplace-state-filter"
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="w-full py-3 px-3.5 bg-white text-[#4A3728] text-sm rounded-xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-[#C05D4D]"
              >
                <option value="all">All States & Regions</option>
                {craftStates.filter((s) => s !== 'All States').map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-3 flex gap-2">
              <select
                id="marketplace-sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="flex-1 py-3 px-3.5 bg-white text-[#4A3728] text-sm rounded-xl border border-white/20 focus:outline-none focus:ring-2 focus:ring-[#C05D4D]"
              >
                <option value="featured">Sort: Featured</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="newest">Newest First</option>
              </select>

              <button
                type="submit"
                id="marketplace-search-btn"
                className="px-5 py-3 bg-[#C05D4D] hover:bg-[#A34E41] text-white text-sm font-bold rounded-xl transition-all shadow-xs flex items-center justify-center shrink-0"
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Category Pills Navigation */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-[#7C6E62] uppercase tracking-wider flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-[#C05D4D]" />
              Craft Heritage Categories
            </h3>
            {selectedCategory !== 'all' && (
              <button
                onClick={() => setSelectedCategory('all')}
                className="text-xs text-[#C05D4D] font-bold hover:underline"
              >
                Clear Category Filter
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all ${
                selectedCategory === 'all'
                  ? 'bg-[#C05D4D] text-white shadow-xs'
                  : 'bg-white text-[#4A3728] border border-[#E5E1DA] hover:bg-[#F4F1ED]'
              }`}
            >
              All Crafts ({products.length})
            </button>

            {categories.map((cat) => {
              const isSelected =
                selectedCategory.toLowerCase() === cat.name.toLowerCase() ||
                (selectedCategory !== 'all' && cat.name.toLowerCase().includes(selectedCategory.toLowerCase()));
              return (
                <button
                  key={cat.name}
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-medium shrink-0 transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-[#C05D4D] text-white font-bold shadow-xs'
                      : 'bg-white text-[#4A3728] border border-[#E5E1DA] hover:bg-[#F4F1ED]'
                  }`}
                >
                  <span>{cat.name}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-[#F0EDEA] text-[#7C6E62]'
                    }`}
                  >
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Filters Summary */}
        {(selectedCategory !== 'all' || selectedState !== 'all' || searchQuery) && (
          <div className="flex items-center gap-2 mb-6 p-3 bg-white rounded-2xl border border-[#E5E1DA] text-xs">
            <span className="font-bold text-[#7C6E62]">Active Filters:</span>
            {selectedCategory !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#C05D4D15] text-[#C05D4D] font-medium">
                Category: {selectedCategory}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedCategory('all')} />
              </span>
            )}
            {selectedState !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#C05D4D15] text-[#C05D4D] font-medium">
                State: {selectedState}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedState('all')} />
              </span>
            )}
            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#C05D4D15] text-[#C05D4D] font-medium">
                Query: "{searchQuery}"
                <X className="w-3 h-3 cursor-pointer" onClick={() => { setSearchQuery(''); fetchProducts(); }} />
              </span>
            )}
            <button
              onClick={handleClearFilters}
              className="ml-auto text-[#C05D4D] font-bold hover:underline"
            >
              Reset All
            </button>
          </div>
        )}

        {/* Loading / Error / Products Grid */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-10 h-10 border-4 border-[#C05D4D] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm font-semibold text-[#7C6E62]">Gathering handcrafted treasures from verified artisans...</p>
          </div>
        ) : error ? (
          <div className="p-8 bg-red-50 border border-red-200 rounded-3xl text-center">
            <p className="text-sm text-red-700 font-semibold mb-3">{error}</p>
            <button
              onClick={fetchProducts}
              className="px-4 py-2 bg-[#C05D4D] text-white text-xs font-bold rounded-xl"
            >
              Retry Loading
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="py-16 bg-white rounded-3xl border border-[#E5E1DA] text-center p-8">
            <ShoppingBag className="w-12 h-12 text-[#9C8E82] mx-auto mb-3" />
            <h3 className="font-serif text-xl font-bold text-[#4A3728]">No crafts found matching your filters</h3>
            <p className="text-xs text-[#7C6E62] mt-1 max-w-md mx-auto">
              Try selecting a different category or clearing your search keywords to view products from all artisan sellers.
            </p>
            <button
              onClick={handleClearFilters}
              className="mt-4 px-5 py-2.5 rounded-xl bg-[#C05D4D] text-white text-xs font-bold shadow-xs hover:bg-[#A34E41]"
            >
              View All Crafts
            </button>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs text-[#7C6E62]">
                Showing <span className="font-bold text-[#4A3728]">{products.length}</span> published products from verified Indian artisans
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((item) => (
                <MarketplaceProductCard
                  key={item.product.id}
                  item={item}
                  onNavigate={onNavigate}
                  onOpenEnquiry={handleOpenEnquiry}
                  onOpenChat={handleOpenChat}
                  onOpenOrder={(it) => setOrderModalProduct(it.product)}
                  isLoggedIn={Boolean(currentUser)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Enquiry Modal */}
      {selectedItemForEnquiry && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-xl border border-[#E5E1DA] animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-[#F0EDEA]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#C05D4D15] text-[#C05D4D] flex items-center justify-center">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-[#4A3728]">
                    Enquire Directly with Artisan
                  </h3>
                  <p className="text-xs text-[#7C6E62]">
                    Seller: <span className="font-bold text-[#4A3728]">{selectedItemForEnquiry.artisan.fullName}</span> ({selectedItemForEnquiry.artisan.state})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedItemForEnquiry(null)}
                className="p-1.5 rounded-lg text-[#7C6E62] hover:bg-[#FAF9F6]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Product Summary Pill */}
            <div className="my-4 p-3 bg-[#FAF9F6] rounded-2xl border border-[#E5E1DA] flex items-center gap-3">
              <img
                src={selectedItemForEnquiry.product.primaryImage}
                alt={selectedItemForEnquiry.product.title}
                className="w-12 h-12 rounded-xl object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-[#4A3728] truncate">
                  {selectedItemForEnquiry.product.title}
                </p>
                <p className="text-[11px] text-[#C05D4D] font-bold">
                  ₹{selectedItemForEnquiry.product.price.toLocaleString('en-IN')} / unit
                </p>
              </div>
            </div>

            {enquirySuccess ? (
              <div className="p-6 text-center bg-emerald-50 rounded-2xl border border-emerald-200">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
                <h4 className="font-bold text-sm text-emerald-900">Enquiry Dispatched!</h4>
                <p className="text-xs text-emerald-700 mt-1">{enquirySuccess}</p>
                <p className="text-[11px] text-emerald-600 mt-2">
                  The artisan will contact you shortly over phone or WhatsApp.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitEnquiry} className="space-y-4">
                {enquiryError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
                    {enquiryError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#7C6E62] uppercase mb-1">
                      Your Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={enquiryBuyerName}
                      onChange={(e) => setEnquiryBuyerName(e.target.value)}
                      placeholder="e.g. Priya Sharma"
                      className="w-full text-xs p-3 rounded-xl border border-[#E5E1DA] bg-[#FAF9F6] text-[#4A3728] focus:ring-2 focus:ring-[#C05D4D] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#7C6E62] uppercase mb-1">
                      Mobile / WhatsApp *
                    </label>
                    <input
                      type="tel"
                      required
                      value={enquiryBuyerContact}
                      onChange={(e) => setEnquiryBuyerContact(e.target.value)}
                      placeholder="e.g. 9811223344"
                      className="w-full text-xs p-3 rounded-xl border border-[#E5E1DA] bg-[#FAF9F6] text-[#4A3728] focus:ring-2 focus:ring-[#C05D4D] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#7C6E62] uppercase mb-1">
                    Quantity Needed
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={enquiryQuantity}
                    onChange={(e) => setEnquiryQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full text-xs p-3 rounded-xl border border-[#E5E1DA] bg-[#FAF9F6] text-[#4A3728] focus:ring-2 focus:ring-[#C05D4D] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#7C6E62] uppercase mb-1">
                    Message / Customization Request
                  </label>
                  <textarea
                    rows={3}
                    value={enquiryMessage}
                    onChange={(e) => setEnquiryMessage(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-[#E5E1DA] bg-[#FAF9F6] text-[#4A3728] focus:ring-2 focus:ring-[#C05D4D] focus:outline-none"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedItemForEnquiry(null)}
                    className="px-4 py-2.5 rounded-xl border border-[#E5E1DA] text-xs font-bold text-[#7C6E62] hover:bg-[#FAF9F6]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    id="submit-enquiry-btn"
                    disabled={enquirySubmitting}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#C05D4D] to-[#A34E41] text-white text-xs font-bold shadow-xs hover:opacity-95 flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{enquirySubmitting ? 'Sending...' : 'Send Direct Enquiry'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Buyer's Enquiries Drawer / Modal */}
      {showMyEnquiries && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-end">
          <div className="bg-white w-full max-w-md h-full shadow-2xl p-6 flex flex-col animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-[#F0EDEA]">
              <div className="flex items-center gap-2">
                <PackageCheck className="w-5 h-5 text-[#C05D4D]" />
                <h3 className="font-serif font-bold text-lg text-[#4A3728]">
                  My Buyer Enquiries
                </h3>
              </div>
              <button
                onClick={() => setShowMyEnquiries(false)}
                className="p-1 rounded-lg hover:bg-[#FAF9F6] text-[#7C6E62]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-4 space-y-3">
              {loadingEnquiries ? (
                <div className="py-12 text-center">
                  <div className="w-8 h-8 border-3 border-[#C05D4D] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-xs text-[#7C6E62]">Fetching your enquiries...</p>
                </div>
              ) : myEnquiries.length === 0 ? (
                <div className="py-12 text-center text-[#7C6E62]">
                  <MessageSquare className="w-10 h-10 mx-auto text-[#D4CDC5] mb-2" />
                  <p className="text-xs font-bold text-[#4A3728]">No enquiries yet</p>
                  <p className="text-[11px] mt-1">
                    Click "Enquire" on any handmade craft to connect with the artisan maker directly.
                  </p>
                </div>
              ) : (
                myEnquiries.map((enq) => (
                  <div key={enq.id} className="p-3.5 bg-[#FAF9F6] rounded-2xl border border-[#E5E1DA]">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] text-[#7C6E62] block">
                          {new Date(enq.createdAt).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                        <p className="text-xs font-bold text-[#4A3728] mt-0.5">
                          Qty: {enq.quantity || 1} units
                        </p>
                      </div>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                          enq.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : enq.status === 'contacted'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {enq.status}
                      </span>
                    </div>

                    <p className="text-xs text-[#5C4D42] mt-2 italic bg-white p-2.5 rounded-xl border border-[#EFECE8]">
                      "{enq.message}"
                    </p>

                    <div className="mt-2 text-[11px] text-[#7C6E62] flex items-center justify-between">
                      <span>Artisan Contact:</span>
                      <span className="font-bold text-[#C05D4D]">{enq.buyerContact}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-4 border-t border-[#F0EDEA]">
              <button
                onClick={() => setShowMyEnquiries(false)}
                className="w-full py-2.5 bg-[#4A3728] text-white text-xs font-bold rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Multilingual Buyer-Seller Chat & Bargaining Modal - Shown only when logged in */}
      {currentUser && (
        <ChatModal
          isOpen={chatModalOpen}
          onClose={() => {
            setChatModalOpen(false);
            setActiveChatProductId(undefined);
          }}
          productId={activeChatProductId}
          conversationId={activeChatConversationId}
          currentUser={currentUser}
          onNavigateToProduct={(slug) => {
            setChatModalOpen(false);
            if (slug) onNavigate('public-product', { slug });
          }}
        />
      )}

      {/* Order Now Checkout Modal */}
      {orderModalProduct && (
        <OrderNowModal
          product={orderModalProduct}
          isOpen={Boolean(orderModalProduct)}
          onClose={() => setOrderModalProduct(null)}
          onNavigateToTracking={(orderId) => {
            setOrderModalProduct(null);
            onNavigate('orders', { orderId });
          }}
        />
      )}
    </div>
  );
};
