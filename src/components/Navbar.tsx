import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Menu,
  X,
  Package,
  Boxes,
  Compass,
  User,
  LogOut,
  Globe,
  PlusCircle,
  Home,
  CheckCircle2,
  Info,
  ChevronDown,
  Check,
  ShoppingBag,
  MessageSquare,
  Truck,
  Bell,
  Clock,
  TrendingUp
} from 'lucide-react';
import { User as UserType, ALL_SUPPORTED_LANGUAGES, OrderNotification } from '../types';
import { useI18n } from '../i18n/I18nContext';
import { api } from '../api';

interface NavbarProps {
  user: UserType | null;
  activePage: string;
  onNavigate: (page: string, params?: any) => void;
  onLogout: () => void;
  onLaunchDemoCatalog?: () => void;
  preferredLanguage?: string;
  onLanguageChange?: (lang: string) => void;
  onOpenChat?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  activePage,
  onNavigate,
  onLogout,
  onLaunchDemoCatalog,
  preferredLanguage = 'te',
  onLanguageChange = (_lang: string) => {},
  onOpenChat
}) => {
  const { t, language, setLanguage } = useI18n();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState<OrderNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = async () => {
    try {
      const res = await api.getOrderNotifications(user?.mobile);
      if (res.notifications) {
        setNotifications(res.notifications);
        setUnreadCount(res.notifications.filter((n) => !n.read).length);
      }
    } catch {
      // Non-blocking notification fetch
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 25000);
    return () => clearInterval(interval);
  }, [user?.mobile]);

  const handleNotificationClick = async (notif: OrderNotification) => {
    try {
      await api.markOrderNotificationRead(notif.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {}

    setNotifDropdownOpen(false);
    if (user?.role === 'artisan') {
      onNavigate('artisan-orders');
    } else {
      onNavigate('orders', { orderId: notif.orderId });
    }
  };

  const currentLang = language || preferredLanguage;
  const currentLangObj =
    ALL_SUPPORTED_LANGUAGES.find((l) => l.code === currentLang) ||
    ALL_SUPPORTED_LANGUAGES[0];

  const handleLanguageSelect = (code: string) => {
    setLanguage(code);
    onLanguageChange(code);
    setLangDropdownOpen(false);
  };

  const isBuyer = user?.role === 'buyer';
  const isDemoUser = user?.id === 'demo_catalog_generator' || user?.fullName === 'Catalog Image Generator';

  const navLinks = user
    ? isDemoUser
      ? [
          { id: 'add-product', label: 'Catalog Image Generator', icon: Sparkles },
          { id: 'market-linkage', label: t('nav_market_linkage'), icon: Compass }
        ]
      : isBuyer
        ? [
            { id: 'marketplace', label: 'Explore Crafts', icon: ShoppingBag },
            { id: 'orders', label: 'My Orders', icon: Truck },
            { id: 'buyer-enquiries', label: 'My Enquiries', icon: MessageSquare },
            { id: 'profile', label: 'Buyer Profile', icon: User }
          ]
        : [
            { id: 'dashboard', label: t('nav_dashboard'), icon: Home },
            { id: 'sales-earnings', label: 'Sales & Earnings', icon: TrendingUp },
            { id: 'my-products', label: t('nav_my_products'), icon: Package },
            { id: 'market-linkage', label: t('nav_market_linkage'), icon: Compass },
            { id: 'profile', label: t('nav_profile'), icon: User }
          ]
    : [
        { id: 'landing', label: t('nav_home'), icon: Home },
        { id: 'instant-catalog', label: 'Instant Catalog Image Generator', icon: Sparkles },
        { id: 'about', label: t('nav_about'), icon: Info },
        { id: 'login', label: t('nav_sign_in'), icon: User },
        { id: 'register', label: t('nav_register'), icon: PlusCircle }
      ];

  const handleLinkClick = (id: string) => {
    if (id === 'instant-catalog') {
      if (onLaunchDemoCatalog) {
        onLaunchDemoCatalog();
      } else {
        onNavigate('add-product');
      }
      setMobileMenuOpen(false);
      return;
    }
    onNavigate(id);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md text-[#2D241E] border-b border-[#E5E1DA] shadow-xs">
      {/* Demo Account Indicator Banner */}
      {isDemoUser && (
        <div className="bg-[#FFF8F0] border-b border-[#F0D5B8] py-1.5 px-4 text-xs text-[#7A4B16]">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#C05D4D] shrink-0" />
              <span>
                <strong>Instant Demo Active:</strong> You are using the <strong>Catalog Image Generator</strong> demo account. Generate and download digital product catalog flyers with zero login or registration.
              </span>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => onNavigate('add-product')}
                className="font-bold text-[#C05D4D] hover:underline"
              >
                + New Catalog Flyer
              </button>
              <button
                type="button"
                onClick={onLogout}
                className="text-[11px] bg-white border border-[#E5E1DA] px-2.5 py-0.5 rounded text-[#7C6E62] hover:text-red-700 font-semibold"
              >
                Exit Demo
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & USP Brand */}
          <div
            id="craftwise-logo-btn"
            onClick={() => handleLinkClick(user ? (isBuyer ? 'marketplace' : 'dashboard') : 'landing')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-[#C05D4D] flex items-center justify-center shadow-md shadow-[#C05D4D22] text-white font-bold text-xl group-hover:scale-105 transition-transform">
              CW
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#4A3728] uppercase">
                  CraftWise
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-[#C05D4D0D] text-[#C05D4D] border border-[#C05D4D22]">
                  HERITAGE
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-[#7C6E62] font-medium tracking-wide">
                {t('nav_slogan')}
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1.5">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = activePage === link.id || (link.id === 'instant-catalog' && activePage === 'add-product' && isDemoUser);

              return (
                <button
                  key={link.id}
                  id={`nav-${link.id}`}
                  onClick={() => handleLinkClick(link.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm transition-all cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-[#C05D4D] to-[#A34E41] text-white shadow-md shadow-[#C05D4D22] font-semibold'
                      : 'text-[#7C6E62] hover:text-[#4A3728] hover:bg-[#FDFBF7] font-medium'
                  }`}
                >
                  <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-white' : 'text-[#7C6E62]'}`} />
                  <span>{link.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Controls: Language & Session */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Order Notifications Popover - Only shown when real user is logged in */}
            {user && !isDemoUser && (
              <div className="relative">
                <button
                  type="button"
                  id="navbar-notif-btn"
                  onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
                  className="relative flex items-center justify-center w-9 h-9 bg-white border border-[#E5E1DA] hover:border-[#C05D4D] rounded-xl text-[#4A3728] hover:text-[#C05D4D] transition-colors shadow-2xs"
                  title="Order & Tracking Updates"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#C05D4D] text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {notifDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-80 bg-white border border-[#E5E1DA] rounded-2xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-4 py-2 text-xs font-bold text-[#4A3728] border-b border-[#F0EDEA] flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Truck className="w-3.5 h-3.5 text-[#C05D4D]" />
                        Order Updates
                      </span>
                      <span className="text-[10px] font-semibold text-[#7C6E62]">
                        {notifications.length} updates
                      </span>
                    </div>

                    <div className="max-h-72 overflow-y-auto divide-y divide-[#F0EDEA]">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-xs text-[#7C6E62]">
                          No order status notifications yet.
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            onClick={() => handleNotificationClick(n)}
                            className={`p-3 text-xs cursor-pointer hover:bg-[#FAF9F6] transition-colors ${
                              !n.read ? 'bg-amber-50/50' : ''
                            }`}
                          >
                            <div className="flex items-start justify-between gap-1">
                              <span className="font-bold text-[#4A3728] leading-tight">
                                {n.title}
                              </span>
                              {!n.read && (
                                <span className="w-2 h-2 rounded-full bg-[#C05D4D] shrink-0 mt-1" />
                              )}
                            </div>
                            <p className="text-[11px] text-[#7C6E62] mt-0.5 line-clamp-2">
                              {n.message}
                            </p>
                            <span className="text-[9px] text-[#A89F91] mt-1 block">
                              {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="p-2 border-t border-[#F0EDEA] text-center">
                      <button
                        type="button"
                        onClick={() => {
                          setNotifDropdownOpen(false);
                          onNavigate(user?.role === 'artisan' ? 'artisan-orders' : 'orders');
                        }}
                        className="text-xs font-bold text-[#C05D4D] hover:underline"
                      >
                        View All Orders & Tracking →
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Multilingual Chat Button - Only shown when real user is logged in */}
            {user && !isDemoUser && onOpenChat && (
              <button
                type="button"
                id="navbar-chat-btn"
                onClick={onOpenChat}
                className="flex items-center gap-1.5 text-xs bg-white border border-[#E5E1DA] hover:border-[#C05D4D] rounded-xl px-3 py-1.5 text-[#4A3728] font-bold transition-all shadow-2xs hover:text-[#C05D4D] cursor-pointer"
                title="Multilingual Buyer-Seller Chat & Price Bargaining (9 Languages)"
              >
                <MessageSquare className="w-3.5 h-3.5 text-[#C05D4D]" />
                <span className="hidden md:inline">Chat</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              </button>
            )}

            {/* Indian 9-Language Dropdown Selector */}
            <div className="relative">
              <button
                type="button"
                id="navbar-language-dropdown-btn"
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-2 text-xs bg-[#FAF9F6] border border-[#E5E1DA] hover:border-[#C05D4D] rounded-xl px-3 py-1.5 text-[#4A3728] font-medium transition-colors shadow-2xs"
                title={t('nav_choose_language')}
              >
                <Globe className="w-3.5 h-3.5 text-[#C05D4D]" />
                <span className="font-bold text-[#C05D4D]">{currentLangObj.nativeName}</span>
                <span className="text-[#7C6E62]">({currentLangObj.label})</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-[#7C6E62] transition-transform duration-150 ${
                    langDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white border border-[#E5E1DA] rounded-2xl shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-3.5 py-2 text-[11px] font-bold text-[#7C6E62] uppercase tracking-wider border-b border-[#F0EDEA] flex items-center justify-between">
                    <span>{t('nav_choose_language')}</span>
                    <span className="text-[10px] text-[#C05D4D] font-semibold">9 Regional</span>
                  </div>
                  <div className="max-h-80 overflow-y-auto py-1">
                    {ALL_SUPPORTED_LANGUAGES.map((lang) => {
                      const isSelected = currentLang === lang.code;
                      return (
                        <button
                          key={lang.code}
                          type="button"
                          id={`lang-select-${lang.code}`}
                          onClick={() => handleLanguageSelect(lang.code)}
                          className={`w-full px-3.5 py-2 text-left flex items-center justify-between text-xs transition-colors ${
                            isSelected
                              ? 'bg-[#C05D4D0D] text-[#C05D4D] font-bold'
                              : 'text-[#4A3728] hover:bg-[#FAF9F6]'
                          }`}
                        >
                          <div className="flex flex-col">
                            <span className="font-semibold text-[13px]">{lang.nativeName}</span>
                            <span className="text-[11px] text-[#7C6E62]">{lang.label}</span>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-[#C05D4D] shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {user ? (
              <div className="flex items-center gap-3 pl-3 border-l border-[#E5E1DA]">
                <div className="w-8 h-8 rounded-full bg-[#E5E1DA] flex items-center justify-center font-bold text-[#4A3728] text-xs">
                  {user.fullName.charAt(0)}
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-[#4A3728]">{user.fullName}</div>
                  <div className={`text-[10px] uppercase tracking-wider font-bold ${isDemoUser ? 'text-amber-700 font-extrabold' : isBuyer ? 'text-[#C05D4D]' : 'text-[#7C6E62]'}`}>
                    {isDemoUser ? '⚡ Demo Account (No Login)' : isBuyer ? 'Craft Buyer' : 'Artisan Seller'}
                  </div>
                </div>
                <button
                  id="logout-btn"
                  onClick={onLogout}
                  className="p-2 rounded-xl text-[#7C6E62] hover:text-red-600 hover:bg-[#FDFBF7] transition-colors"
                  title={t('nav_sign_out')}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : null}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center gap-2 lg:hidden">
            {/* Quick Chat button on mobile - Only shown when real user is logged in */}
            {user && !isDemoUser && onOpenChat && (
              <button
                type="button"
                id="mobile-nav-chat-btn-top"
                onClick={onOpenChat}
                className="p-2 rounded-xl text-[#C05D4D] bg-[#C05D4D15] border border-[#C05D4D33]"
                title="Open Multilingual Chat"
              >
                <MessageSquare className="w-4 h-4" />
              </button>
            )}

            {/* Quick language toggle on mobile (cycles through all 9 Indian languages) */}
            <button
              id="mobile-lang-cycle-btn"
              onClick={() => {
                const curIdx = ALL_SUPPORTED_LANGUAGES.findIndex((l) => l.code === currentLang);
                const nextIdx = (curIdx + 1) % ALL_SUPPORTED_LANGUAGES.length;
                handleLanguageSelect(ALL_SUPPORTED_LANGUAGES[nextIdx].code);
              }}
              className="text-xs font-bold px-2.5 py-1.5 bg-[#FAF9F6] border border-[#E5E1DA] rounded-lg text-[#C05D4D] flex items-center gap-1 shadow-2xs"
              title={t('nav_choose_language')}
            >
              <Globe className="w-3 h-3" />
              <span>{currentLangObj.nativeName}</span>
            </button>
            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-lg text-[#7C6E62] hover:text-[#4A3728] hover:bg-[#FAF9F6] focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-[#E5E1DA] px-4 pt-2 pb-6 space-y-2 animate-in slide-in-from-top duration-200">
          {user && (
            <div className="p-3 mb-3 rounded-2xl bg-[#FDFBF7] border border-[#E5E1DA] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#E5E1DA] flex items-center justify-center font-bold text-[#4A3728]">
                  {user.fullName.charAt(0)}
                </div>
                <div>
                  <div className="font-bold text-sm text-[#4A3728]">{user.fullName}</div>
                  <div className="text-xs text-[#7C6E62]">
                    <span className="font-bold text-[#C05D4D]">
                      {isDemoUser ? '⚡ Instant Tool (No Login)' : isBuyer ? 'Craft Buyer' : 'Artisan Seller'}
                    </span>{' '}
                    {!isDemoUser && `• ${user.city || user.district || user.state || 'India'}`}
                  </div>
                </div>
              </div>
              <button
                id="mobile-logout-btn"
                onClick={() => {
                  onLogout();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-1.5 text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-1.5 rounded-xl font-semibold"
              >
                <LogOut className="w-3.5 h-3.5" /> {t('nav_sign_out')}
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 gap-1.5">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = activePage === link.id || (link.id === 'instant-catalog' && activePage === 'add-product' && isDemoUser);

              return (
                <button
                  key={link.id}
                  id={`mobile-nav-${link.id}`}
                  onClick={() => handleLinkClick(link.id)}
                  className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-base text-left transition-all cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-[#C05D4D] to-[#A34E41] text-white font-bold shadow-md shadow-[#C05D4D22]'
                      : 'text-[#7C6E62] hover:bg-[#FAF9F6] font-medium'
                  }`}
                >
                  <Icon className={`w-5 h-5 shrink-0 transition-colors ${isActive ? 'text-white' : 'text-[#7C6E62]'}`} />
                  <span>{link.label}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-4 border-t border-[#E5E1DA]">
            <div className="flex items-center justify-between text-xs text-[#7C6E62] mb-2.5">
              <span className="font-semibold flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-[#C05D4D]" />
                Preferred Language (ప్రాంతీయ భాష)
              </span>
              <span className="text-[11px] text-[#C05D4D] font-bold">
                {currentLangObj.nativeName}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {ALL_SUPPORTED_LANGUAGES.map((lang) => {
                const isSelected = currentLang === lang.code;
                return (
                  <button
                    key={lang.code}
                    id={`mobile-drawer-lang-${lang.code}`}
                    onClick={() => {
                      handleLanguageSelect(lang.code);
                      setMobileMenuOpen(false);
                    }}
                    className={`px-2 py-2 rounded-xl text-center border transition-all ${
                      isSelected
                        ? 'bg-[#C05D4D] text-white border-[#C05D4D] font-bold shadow-xs'
                        : 'border-[#E5E1DA] bg-[#FAF9F6] text-[#4A3728] hover:bg-[#F0EDEA]'
                    }`}
                  >
                    <div className="text-xs font-semibold leading-tight">{lang.nativeName}</div>
                    <div className={`text-[10px] ${isSelected ? 'text-white/80' : 'text-[#7C6E62]'}`}>
                      {lang.label}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
