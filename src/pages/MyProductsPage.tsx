import React, { useState, useEffect } from 'react';
import {
  Package,
  PlusCircle,
  Search,
  ExternalLink,
  Trash2,
  Edit,
  Sparkles,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  X
} from 'lucide-react';
import { api } from '../api';
import { Product } from '../types';
import { useI18n } from '../i18n/I18nContext';

interface MyProductsPageProps {
  onNavigate: (page: string, params?: any) => void;
}

export const MyProductsPage: React.FC<MyProductsPageProps> = ({ onNavigate }) => {
  const { t, language } = useI18n();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'ready_for_review' | 'draft' | 'low_stock'>('all');

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [productToDelete, setProductToDelete] = useState<{ id: string; title: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    loadProducts();

    // Re-sync on tab switch or window focus
    const handleFocus = () => loadProducts(true);
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        loadProducts(true);
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibility);

    // Continuous polling every 4 seconds to sync mobile and laptop changes in real-time
    const interval = setInterval(() => {
      loadProducts(true);
    }, 4000);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
      clearInterval(interval);
    };
  }, []);

  const loadProducts = async (silent = false) => {
    if (!silent) setIsRefreshing(true);
    try {
      const res = await api.getProducts();
      setProducts(res.products || []);
    } catch (err: any) {
      if (!silent) {
        console.warn('Products loading notice:', err?.message || err);
      }
    } finally {
      setLoading(false);
      if (!silent) setIsRefreshing(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    setIsDeleting(true);
    try {
      await api.deleteProduct(productToDelete.id);
      setProducts((prev) => prev.filter((p) => p.id !== productToDelete.id));
      setToastMessage(`"${productToDelete.title}" has been deleted.`);
      setTimeout(() => setToastMessage(null), 4000);
      setProductToDelete(null);
    } catch (err: any) {
      setToastMessage(`Error: ${err.message || 'Failed to delete product'}`);
      setTimeout(() => setToastMessage(null), 4000);
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtering
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.craftCategory.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.materials || []).some((m) => m.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (statusFilter === 'all') return true;
    if (statusFilter === 'published') return p.status === 'published';
    if (statusFilter === 'ready_for_review') return p.status === 'ready_for_review';
    if (statusFilter === 'draft') return p.status === 'draft';
    if (statusFilter === 'low_stock') return p.status === 'low_stock' || p.stock <= 3;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#4A3728] pb-20">
      {/* Header */}
      <div className="bg-white border-b border-[#E5E1DA] py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-serif italic text-2xl sm:text-3xl font-bold text-[#4A3728]">
              {t('nav_my_products')}
            </h1>
            <p className="text-xs sm:text-sm text-[#7C6E62] mt-0.5">
              {t('rev_subtitle')}
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            <button
              type="button"
              id="my-products-refresh-btn"
              onClick={loadProducts}
              disabled={isRefreshing}
              title="Click to sync products between devices"
              className="px-4 py-3 rounded-xl bg-white hover:bg-[#FDFBF7] text-[#4A3728] border border-[#E5E1DA] font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-all disabled:opacity-60"
            >
              <RefreshCw className={`w-4 h-4 text-[#C05D4D] ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>{isRefreshing ? t('common_loading') : 'Sync'}</span>
            </button>

            <button
              type="button"
              id="my-products-create-btn"
              onClick={() => onNavigate('add-product')}
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-[#C05D4D] to-[#A34E41] hover:from-[#b04d3e] hover:to-[#923e32] text-white text-xs sm:text-sm font-bold shadow-xs transition-all flex items-center justify-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ {t('nav_create_catalog')}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-6">
        {/* Filter and Search Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#7C6E62] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder={`${t('common_search')}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs sm:text-sm pl-10 pr-4 py-2.5 rounded-xl border border-[#E5E1DA] bg-white text-[#4A3728] focus:outline-none focus:ring-2 focus:ring-[#C05D4D] shadow-2xs"
            />
          </div>

          {/* Status Filters */}
          <div className="flex flex-wrap items-center gap-1.5 bg-[#FAF9F6] border border-[#E5E1DA] p-1 rounded-xl text-xs font-semibold self-start md:self-auto">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                statusFilter === 'all' ? 'bg-white text-[#4A3728] shadow-xs' : 'text-[#7C6E62]'
              }`}
            >
              {t('dash_view_all')} ({products.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('published')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                statusFilter === 'published' ? 'bg-emerald-600 text-white shadow-xs' : 'text-[#7C6E62]'
              }`}
            >
              {t('common_published')} ({products.filter((p) => p.status === 'published').length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('ready_for_review')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                statusFilter === 'ready_for_review' ? 'bg-[#C05D4D] text-white shadow-xs' : 'text-[#7C6E62]'
              }`}
            >
              {t('common_in_review')} ({products.filter((p) => p.status === 'ready_for_review').length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('draft')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                statusFilter === 'draft' ? 'bg-[#4A3728] text-white shadow-xs' : 'text-[#7C6E62]'
              }`}
            >
              {t('common_draft')} ({products.filter((p) => p.status === 'draft').length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('low_stock')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                statusFilter === 'low_stock' ? 'bg-amber-600 text-white shadow-xs' : 'text-[#7C6E62]'
              }`}
            >
              {t('common_stock')} ({products.filter((p) => p.status === 'low_stock' || p.stock <= 3).length})
            </button>
          </div>
        </div>

        {/* Product Cards Grid */}
        {loading ? (
          <div className="p-12 text-center text-[#7C6E62] text-sm">
            Loading your craft catalog...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-[#E5E1DA] space-y-3">
            <Package className="w-12 h-12 text-[#7C6E62] mx-auto" />
            <h3 className="font-bold text-[#4A3728] text-base">No products match your filter</h3>
            <p className="text-xs text-[#7C6E62] max-w-sm mx-auto">
              Create a new handcrafted product using the AI selling assistant.
            </p>
            <button
              type="button"
              onClick={() => onNavigate('add-product')}
              className="px-4 py-2 bg-gradient-to-r from-[#C05D4D] to-[#A34E41] hover:from-[#b04d3e] hover:to-[#923e32] text-white rounded-xl text-xs font-bold transition-colors"
            >
              + Create Product with AI
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((prod) => {
              const activeImg =
                prod.preferredImage === 'enhanced'
                  ? prod.enhancedImage || prod.primaryImage
                  : prod.primaryImage;

              const localizedTitle =
                (prod.translations && (prod.translations as any)[language]?.title) || prod.title;
              const localizedDesc =
                (prod.translations && (prod.translations as any)[language]?.shortDescription) ||
                prod.shortDescription ||
                prod.detailedDescription;

              return (
                <div
                  key={prod.id}
                  className="bg-white rounded-3xl border border-[#E5E1DA] overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Image Box */}
                    <div className="relative aspect-square bg-[#FAF9F6] overflow-hidden p-3 flex items-center justify-center">
                      <img
                        src={activeImg}
                        alt={localizedTitle}
                        className="w-full h-full object-contain rounded-2xl"
                        referrerPolicy="no-referrer"
                      />

                      {/* Status Badge */}
                      <div className="absolute top-4 left-4">
                        <span
                          className={`text-[11px] font-bold px-3 py-1 rounded-full shadow-xs ${
                            prod.status === 'published'
                              ? 'bg-emerald-600 text-white'
                              : prod.status === 'ready_for_review'
                              ? 'bg-[#C05D4D] text-white'
                              : 'bg-[#4A3728] text-stone-100'
                          }`}
                        >
                          {prod.status === 'published'
                            ? t('common_published')
                            : prod.status === 'ready_for_review'
                            ? t('common_in_review')
                            : t('common_draft')}
                        </span>
                      </div>

                      {/* Price Pill */}
                      <div className="absolute bottom-4 right-4 bg-[#2D241E]/95 text-amber-300 px-3 py-1 rounded-xl text-sm font-bold shadow">
                        ₹{prod.price}
                      </div>
                    </div>

                    {/* Content Details */}
                    <div className="p-5 space-y-2">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-[#7C6E62]">
                        {prod.craftCategory}
                      </span>
                      <h3 className="font-bold text-base text-[#4A3728] line-clamp-1">
                        {localizedTitle}
                      </h3>
                      <p className="text-xs text-[#7C6E62] line-clamp-2 leading-relaxed">
                        {localizedDesc}
                      </p>

                      <div className="pt-2 flex items-center justify-between text-xs text-[#7C6E62]">
                        <span>{t('common_stock')}: <strong className="text-[#4A3728]">{prod.stock} units</strong></span>
                        {prod.materials && prod.materials.length > 0 && (
                          <span className="truncate max-w-[150px] text-[11px]">
                            🌿 {prod.materials[0]}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="p-4 bg-[#FAF9F6] border-t border-[#F0EDEA] flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onNavigate('product-detail', { id: prod.id })}
                        className="px-3 py-1.5 bg-white border border-[#E5E1DA] text-[#4A3728] rounded-lg text-xs font-bold hover:bg-[#FAF9F6] transition-colors"
                      >
                        {t('common_view')}
                      </button>

                      {prod.status === 'ready_for_review' && (
                        <button
                          type="button"
                          onClick={() => onNavigate('selling-kit', { productId: prod.id })}
                          className="px-3 py-1.5 bg-[#C05D4D] hover:bg-[#A34E41] text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
                        >
                          {t('wiz_step4_review')}
                        </button>
                      )}

                      {prod.status === 'published' && (
                        <button
                          type="button"
                          onClick={() => onNavigate('public-product', { slug: prod.slug })}
                          className="px-3 py-1.5 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-lg text-xs font-bold hover:bg-emerald-100 flex items-center gap-1 transition-colors"
                        >
                          <ExternalLink className="w-3 h-3" /> {t('dash_direct_link')}
                        </button>
                      )}
                    </div>

                    <button
                      type="button"
                      id={`delete-prod-btn-${prod.id}`}
                      onClick={() => setProductToDelete({ id: prod.id, title: localizedTitle })}
                      className="p-1.5 text-[#7C6E62] hover:text-red-600 rounded-lg hover:bg-white transition-colors"
                      title={t('common_delete')}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal (safe for mobile iframe without browser alert blocking) */}
      {productToDelete && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-[#E5E1DA] animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center text-red-600 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                className="text-[#7C6E62] hover:text-[#4A3728] p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <h3 className="text-lg font-bold text-[#4A3728] mb-2">
              {t('common_delete')}?
            </h3>
            <p className="text-sm text-[#7C6E62] leading-relaxed mb-6">
              <strong className="text-[#4A3728]">"{productToDelete.title}"</strong>
            </p>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2.5 rounded-xl border border-[#E5E1DA] text-[#4A3728] font-semibold text-xs hover:bg-[#FAF9F6] transition-colors"
              >
                {t('common_cancel')}
              </button>
              <button
                type="button"
                id="confirm-modal-delete-btn"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-2 disabled:opacity-60"
              >
                {isDeleting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                <span>{isDeleting ? t('common_loading') : t('common_delete')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Status Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#2D241E] text-white px-4 py-3 rounded-xl shadow-lg border border-[#4A3728] text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
