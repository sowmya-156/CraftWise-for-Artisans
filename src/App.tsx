import React, { useState, useEffect } from 'react';
import { api, authState } from './api';
import { User, ArtisanProfile } from './types';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { AddProductWizard } from './pages/AddProductWizard';
import { SellingKitReview } from './pages/SellingKitReview';
import { PublicProductPage } from './pages/PublicProductPage';
import { MyProductsPage } from './pages/MyProductsPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { InventoryPage } from './pages/InventoryPage';
import { MarketLinkagePage } from './pages/MarketLinkagePage';
import { MarketplacePage } from './pages/MarketplacePage';
import { AboutPage } from './pages/AboutPage';
import { ProfilePage } from './pages/ProfilePage';
import { OrdersPage } from './pages/OrdersPage';
import { ArtisanOrdersPage } from './pages/ArtisanOrdersPage';
import { I18nProvider } from './i18n/I18nContext';
import { ChatModal } from './components/chat/ChatModal';
import { MessageSquare } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(authState.getUser());
  const [currentProfile, setCurrentProfile] = useState<ArtisanProfile | null>(authState.getProfile());
  const [currentPage, setCurrentPage] = useState<string>('landing');
  const [pageParams, setPageParams] = useState<any>({});
  const [loadingInitial, setLoadingInitial] = useState<boolean>(true);
  const [globalChatOpen, setGlobalChatOpen] = useState(false);
  const [chatParams, setChatParams] = useState<{ productId?: string; conversationId?: string; buyerId?: string; buyerName?: string; buyerMobile?: string } | null>(null);
  const [preferredLanguage, setPreferredLanguage] = useState<string>(
    currentProfile?.preferredLanguage || localStorage.getItem('craftwise_lang') || 'te'
  );

  const handleOpenChat = (params?: { productId?: string; conversationId?: string; buyerId?: string; buyerName?: string; buyerMobile?: string }) => {
    setChatParams(params || null);
    setGlobalChatOpen(true);
  };

  useEffect(() => {
    if (currentProfile?.preferredLanguage) {
      setPreferredLanguage(currentProfile.preferredLanguage);
    }
  }, [currentProfile?.preferredLanguage]);

  const handleLanguageChange = (newLang: string) => {
    setPreferredLanguage(newLang);
    localStorage.setItem('craftwise_lang', newLang);
    if (currentProfile) {
      setCurrentProfile((prev) => (prev ? { ...prev, preferredLanguage: newLang } : null));
    }
  };

  // Parse hash route on load and on hashchange
  useEffect(() => {
    const parseHash = () => {
      const hash = window.location.hash.replace(/^#\/?/, '');
      if (!hash) {
        // Default to marketplace if buyer, dashboard if artisan, otherwise landing
        if (authState.isAuthenticated()) {
          const u = authState.getUser();
          if (u?.role === 'buyer') {
            setCurrentPage('marketplace');
          } else {
            setCurrentPage('dashboard');
          }
        } else {
          setCurrentPage('landing');
        }
        return;
      }

      const [route, queryStr] = hash.split('?');
      const params: any = {};
      if (queryStr) {
        const usp = new URLSearchParams(queryStr);
        usp.forEach((val, key) => {
          params[key] = val;
        });
      }

      setCurrentPage(route || 'landing');
      setPageParams(params);
    };

    parseHash();
    window.addEventListener('hashchange', parseHash);
    return () => window.removeEventListener('hashchange', parseHash);
  }, []);

  // Check existing session on boot
  useEffect(() => {
    const checkAuth = async () => {
      if (authState.getToken()) {
        try {
          const res = await api.getMe();
          setCurrentUser(res.user);
          setCurrentProfile(res.profile);
          authState.setSession(authState.getToken()!, res.user, res.profile);
        } catch (err) {
          console.warn('Session expired or invalid:', err);
          authState.clearSession();
          setCurrentUser(null);
          setCurrentProfile(null);
        }
      }
      setLoadingInitial(false);
    };

    checkAuth();
  }, []);

  const navigate = (page: string, params: any = {}) => {
    setCurrentPage(page);
    setPageParams(params);

    // Sync URL hash
    let hashUrl = `#${page}`;
    const keys = Object.keys(params);
    if (keys.length > 0) {
      const qs = keys.map((k) => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`).join('&');
      hashUrl += `?${qs}`;
    }
    window.location.hash = hashUrl;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoginSuccess = (user: User, profile?: ArtisanProfile) => {
    setCurrentUser(user);
    if (profile) setCurrentProfile(profile);
    if (user.role === 'buyer') {
      navigate('marketplace');
    } else {
      navigate('dashboard');
    }
  };

  const handleLaunchLakshmiDemo = async () => {
    try {
      const res = await api.login('9876543210', 'craftwise2026');
      authState.setSession(res.token, res.user, res.profile);
      handleLoginSuccess(res.user, res.profile);
    } catch (err) {
      console.warn('Lakshmi demo login notice:', err);
      handleLaunchCatalogGeneratorDemo();
    }
  };

  const handleLaunchCatalogGeneratorDemo = async () => {
    try {
      const res = await api.demoCatalogLogin();
      authState.setSession(res.token, res.user, res.profile);
      setCurrentUser(res.user);
      if (res.profile) setCurrentProfile(res.profile);
      navigate('add-product');
    } catch (err) {
      console.error('Failed to launch demo catalog generator:', err);
      // Fallback local session if server is unavailable
      const fallbackUser: User = {
        id: 'demo_catalog_generator',
        fullName: 'Catalog Image Generator',
        email: 'catalog.generator@craftwise.in',
        mobile: '9999900001',
        role: 'artisan',
        preferredLanguage: 'en',
        city: 'Visakhapatnam',
        state: 'Andhra Pradesh'
      };
      const fallbackProfile: ArtisanProfile = {
        id: 'prof_catalog_generator',
        userId: 'demo_catalog_generator',
        craftType: 'Traditional Handicrafts & Art',
        state: 'Andhra Pradesh',
        district: 'Visakhapatnam',
        villageOrCity: 'Artisan Studio Cluster',
        cooperativeName: 'CraftWise Instant Studio',
        yearsOfExperience: 10,
        craftDescription: 'Instant Catalog Image Generator Demo Studio for Indian Artisans'
      };
      setCurrentUser(fallbackUser);
      setCurrentProfile(fallbackProfile);
      navigate('add-product');
    }
  };

  const handleLogout = () => {
    authState.clearSession();
    setCurrentUser(null);
    setCurrentProfile(null);
    navigate('landing');
  };

  if (loadingInitial) {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center p-6">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-[#C05D4D] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-sm font-semibold text-[#7C6E62]">Initializing CraftWise...</p>
        </div>
      </div>
    );
  }

  // Render Page
  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'landing':
        return (
          <LandingPage
            onNavigate={(page) => {
              if (page === 'add-product' && !currentUser) {
                handleLaunchCatalogGeneratorDemo();
              } else {
                navigate(page);
              }
            }}
            onQuickDemoLogin={handleLaunchLakshmiDemo}
            onLaunchDemoCatalog={handleLaunchCatalogGeneratorDemo}
          />
        );

      case 'login':
        return (
          <LoginPage
            onLoginSuccess={handleLoginSuccess}
            onNavigate={navigate}
          />
        );

      case 'register':
        return (
          <RegisterPage
            onRegisterSuccess={handleLoginSuccess}
            onNavigate={navigate}
          />
        );

      case 'dashboard':
      case 'sales-earnings':
      case 'sales':
        if (!currentUser) {
          navigate('login');
          return null;
        }
        if (currentUser.id === 'demo_catalog_generator' || currentUser.fullName === 'Catalog Image Generator') {
          navigate('add-product');
          return null;
        }
        if (currentUser.role === 'buyer') {
          navigate('marketplace');
          return null;
        }
        return (
          <DashboardPage
            user={currentUser}
            profile={currentProfile || undefined}
            onNavigate={navigate}
            onOpenChat={handleOpenChat}
            initialTab={
              pageParams?.tab === 'orders'
                ? 'orders'
                : pageParams?.tab === 'sales' || currentPage === 'sales-earnings' || currentPage === 'sales'
                ? 'sales'
                : 'overview'
            }
          />
        );

      case 'marketplace':
      case 'buyer-enquiries':
        if (!currentUser) {
          navigate('login');
          return null;
        }
        return (
          <MarketplacePage
            onNavigate={navigate}
            initialCategory={pageParams.category || 'all'}
          />
        );

      case 'add-product':
        if (!currentUser) {
          handleLaunchCatalogGeneratorDemo();
          return (
            <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center p-6">
              <div className="text-center space-y-3">
                <div className="w-10 h-10 border-4 border-[#C05D4D] border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="text-sm font-semibold text-[#7C6E62]">Launching Catalog Image Generator Demo...</p>
              </div>
            </div>
          );
        }
        return (
          <AddProductWizard
            preferredLanguage={currentProfile?.preferredLanguage || 'te'}
            onFinishWizard={(productId) => {
              navigate('selling-kit', { productId });
            }}
            onCancel={() => {
              const isDemo = currentUser?.id === 'demo_catalog_generator' || currentUser?.fullName === 'Catalog Image Generator';
              navigate(isDemo ? 'landing' : 'dashboard');
            }}
          />
        );

      case 'selling-kit':
        if (!currentUser) {
          navigate('login');
          return null;
        }
        if (currentUser.id === 'demo_catalog_generator' || currentUser.fullName === 'Catalog Image Generator') {
          navigate('add-product');
          return null;
        }
        return (
          <SellingKitReview
            productId={pageParams.productId || ''}
            user={currentUser}
            profile={currentProfile || undefined}
            onNavigate={navigate}
          />
        );

      case 'my-products':
        if (!currentUser) {
          navigate('login');
          return null;
        }
        if (currentUser.id === 'demo_catalog_generator' || currentUser.fullName === 'Catalog Image Generator') {
          navigate('add-product');
          return null;
        }
        return <MyProductsPage onNavigate={navigate} />;

      case 'product-detail':
        if (!currentUser) {
          navigate('login');
          return null;
        }
        if (currentUser.id === 'demo_catalog_generator' || currentUser.fullName === 'Catalog Image Generator') {
          navigate('add-product');
          return null;
        }
        return (
          <ProductDetailPage
            productId={pageParams.id || ''}
            onNavigate={navigate}
          />
        );

      case 'inventory':
        if (!currentUser) {
          navigate('login');
          return null;
        }
        if (currentUser.id === 'demo_catalog_generator' || currentUser.fullName === 'Catalog Image Generator') {
          navigate('add-product');
          return null;
        }
        return <InventoryPage onNavigate={navigate} />;

      case 'market-linkage':
        return <MarketLinkagePage onNavigate={navigate} />;

      case 'about':
        return <AboutPage onNavigate={navigate} />;

      case 'profile':
        if (!currentUser) {
          navigate('login');
          return null;
        }
        if (currentUser.id === 'demo_catalog_generator' || currentUser.fullName === 'Catalog Image Generator') {
          navigate('add-product');
          return null;
        }
        return (
          <ProfilePage
            user={currentUser}
            profile={currentProfile || undefined}
            onUpdateSuccess={(p) => setCurrentProfile(p)}
            onLogout={handleLogout}
            onNavigate={navigate}
          />
        );

      case 'public-product':
        return (
          <PublicProductPage
            slug={pageParams.slug || 'handcrafted-bamboo-basket-visakha1'}
            onNavigateHome={() => navigate('landing')}
            onNavigate={navigate}
          />
        );

      case 'orders':
      case 'order-tracking':
        if (!currentUser) {
          navigate('login');
          return null;
        }
        return (
          <OrdersPage
            onNavigate={navigate}
            initialSelectedOrderId={pageParams.orderId}
            onOpenChat={handleOpenChat}
          />
        );

      case 'artisan-orders':
        if (!currentUser) {
          navigate('login');
          return null;
        }
        return (
          <ArtisanOrdersPage
            onNavigate={navigate}
            onOpenChat={handleOpenChat}
          />
        );

      default:
        return (
          <LandingPage
            onNavigate={(page) => {
              if (page === 'add-product' && !currentUser) {
                handleLaunchCatalogGeneratorDemo();
              } else {
                navigate(page);
              }
            }}
            onQuickDemoLogin={handleLaunchLakshmiDemo}
            onLaunchDemoCatalog={handleLaunchCatalogGeneratorDemo}
          />
        );
    }
  };

  const isPublicProductView = currentPage === 'public-product';
  const isCatalogGeneratorFlow =
    currentPage === 'add-product' ||
    currentPage === 'review-selling-kit' ||
    currentUser?.id === 'demo_catalog_generator' ||
    currentUser?.fullName === 'Catalog Image Generator';

  return (
    <I18nProvider initialLanguage={preferredLanguage} onLanguageChange={handleLanguageChange}>
      <div className="min-h-screen bg-[#FAF9F6] flex flex-col font-sans text-[#4A3728] selection:bg-[#C05D4D] selection:text-white">
        {/* Hide regular navigation in standalone buyer showcase */}
        {!isPublicProductView && (
          <Navbar
            user={currentUser}
            activePage={currentPage}
            onNavigate={navigate}
            onLogout={handleLogout}
            onLaunchDemoCatalog={handleLaunchCatalogGeneratorDemo}
            preferredLanguage={preferredLanguage}
            onLanguageChange={handleLanguageChange}
            onOpenChat={currentUser && !isCatalogGeneratorFlow ? () => setGlobalChatOpen(true) : undefined}
          />
        )}

        <div className="flex-1">{renderCurrentPage()}</div>

        {/* Global Floating Multilingual Chat Action Button - Only shown when user is logged in and not in catalog generator */}
        {currentUser && !isPublicProductView && !isCatalogGeneratorFlow && (
          <button
            type="button"
            id="floating-chat-widget-btn"
            onClick={() => setGlobalChatOpen(true)}
            className="fixed bottom-6 right-6 z-40 px-4 py-3 bg-[#4A3728] hover:bg-[#382a1e] text-white rounded-full shadow-xl flex items-center gap-2.5 transition-all hover:scale-105 border-2 border-white/20 cursor-pointer group"
            title="Multilingual Buyer-Seller Chat & Bargaining"
          >
            <div className="relative">
              <MessageSquare className="w-5 h-5 text-amber-400" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#4A3728]" />
            </div>
            <span className="text-xs font-bold tracking-wide">Live Chat (9 Langs)</span>
          </button>
        )}

        {!isPublicProductView && <Footer onNavigate={navigate} />}

        {/* Global Chat Modal - Only active when logged in */}
        {currentUser && (
          <ChatModal
            isOpen={globalChatOpen}
            onClose={() => {
              setGlobalChatOpen(false);
              setChatParams(null);
            }}
            productId={chatParams?.productId}
            conversationId={chatParams?.conversationId}
            currentUser={currentUser}
            onNavigateToProduct={(slug) => {
              setGlobalChatOpen(false);
              setChatParams(null);
              if (slug) navigate('public-product', { slug });
            }}
          />
        )}
      </div>
    </I18nProvider>
  );
}
